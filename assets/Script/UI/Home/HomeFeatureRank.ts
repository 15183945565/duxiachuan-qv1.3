import {
    Color,
    EventTouch,
    HorizontalTextAlignment,
    instantiate,
    Label,
    Mask,
    Node,
    ScrollView,
    Sprite,
    UITransform,
} from 'cc';
import { applySimKaiFont } from '../Common/UIFont';
import * as HomeConfig from './HomeConfig';
import { HomeViewBase } from './HomeViewBase';
import {
    RankPlayerData,
    RankTab,
} from './HomeTypes';

/**
 * 排行榜页面、榜单行渲染与榜单共用文字样式。
 *
 * 数据和节点引用由 HomeViewBase 持有；九宫格皮肤方法通过 Base 抽象契约
 * 由 Community 共享实现提供。
 */
export abstract class HomeFeatureRank extends HomeViewBase {
    protected openRankPanel(): void {
        this.buildRankPanel();
        if (!this.rankPanel) return;

        this.rankPanel.active = true;
        this.ensureInputBlocker(this.rankPanel);
        this.rankPanel.setSiblingIndex((this.rankPanel.parent?.children.length || 1) - 1);
        this.refreshRankPanel();
    }

    protected buildRankPanel(): void {
        if (this.rankPanel) return;

        const editorRankPanel = this.findNode('RankPanel');
        if (editorRankPanel) {
            this.bindEditorRankPanel(editorRankPanel);
            return;
        }

        const popupParent = this.popupRoot || this.node;
        this.rankPanel = this.createNode('RankPanel', popupParent, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT, 0, 0);
        this.rankPanel.active = false;
        this.rankPanel.on(Node.EventType.TOUCH_END, (event: EventTouch) => {
            event.propagationStopped = true;
        }, this);

        this.createSkinnedNode('RankBg', this.rankPanel, HomeConfig.VIEW_WIDTH, 1700, 0, 0, HomeConfig.UI_RANK_BG).setSiblingIndex(0);
        const back = this.createSkinnedNode('RankBack', this.rankPanel, HomeConfig.BOTTOM_ENTRY_BACK_BUTTON_WIDTH, HomeConfig.BOTTOM_ENTRY_BACK_BUTTON_HEIGHT, -310, 714, HomeConfig.UI_RANK_BACK);
        this.bindScaledClick(back, () => this.closeRankPanel());
        const title = this.createLabel(this.rankPanel, 'RankTitle', '\u6392\u884c\u699c', 48, -210, 714, 210, 66, new Color(255, 238, 183, 255));
        this.applyStrongTextStyle(title);

        const tabs = this.createNode('RankTabs', this.rankPanel, 330, 72, 164, 712);
        this.rankTabNodes.power = this.createRankTab(tabs, 'RankTabPower', '\u6218\u529b', -88, 'power');
        this.rankTabNodes.battleLevel = this.createRankTab(tabs, 'RankTabBattleLevel', '\u6218\u573a\u7b49\u7ea7', 88, 'battleLevel');

        const topRoot = this.createNode('RankTopRoot', this.rankPanel, 720, 500, 0, 330);
        this.createRankTopCard(topRoot, 'RankTopCard_2', 2, -236, -18, 210, 282);
        this.createRankTopCard(topRoot, 'RankTopCard_1', 1, 0, -50, 232, 318);
        this.createRankTopCard(topRoot, 'RankTopCard_3', 3, 236, -18, 210, 282);

        this.rankScrollNode = this.createNode('RankScrollView', this.rankPanel, 684, 700, 0, -390);
        this.rankScrollContent = this.createNode('RankScrollContent', this.rankScrollNode, 684, 700, 0, 0);
        this.rankRowTemplate = this.createRankRowTemplate(this.rankScrollContent);
        this.setupRankScrollView(this.rankScrollNode, this.rankScrollContent);
    }

    protected bindEditorRankPanel(panel: Node): void {
        this.rankPanel = panel;
        if (this.popupRoot && panel.parent !== this.popupRoot) {
            panel.setParent(this.popupRoot);
        }
        panel.active = false;
        panel.off(Node.EventType.TOUCH_END);
        panel.on(Node.EventType.TOUCH_END, (event: EventTouch) => {
            event.propagationStopped = true;
        }, this);

        const bg = this.findNode('RankBg', panel);
        if (bg) {
            const size = bg.getComponent(UITransform)?.contentSize;
            this.applyUiSkin(bg, HomeConfig.UI_RANK_BG, size?.width || HomeConfig.VIEW_WIDTH, size?.height || 1700);
        }

        const back = this.findNode('RankBack', panel);
        if (back) {
            const size = back.getComponent(UITransform)?.contentSize;
            this.applyUiSkin(back, HomeConfig.UI_RANK_BACK, size?.width || HomeConfig.BOTTOM_ENTRY_BACK_BUTTON_WIDTH, size?.height || HomeConfig.BOTTOM_ENTRY_BACK_BUTTON_HEIGHT);
            this.bindScaledClick(back, () => this.closeRankPanel());
        }

        const title = this.findNode('RankTitle', panel)?.getComponent(Label);
        if (title) {
            title.string = '\u6392\u884c\u699c';
            this.applyStrongTextStyle(title);
        }

        const tabs = this.findNode('RankTabs', panel);
        this.rankTabNodes.power = tabs ? this.findNode('RankTabPower', tabs) || undefined : undefined;
        this.rankTabNodes.battleLevel = tabs ? this.findNode('RankTabBattleLevel', tabs) || undefined : undefined;
        if (this.rankTabNodes.power) this.bindScaledClick(this.rankTabNodes.power, () => this.switchRankTab('power'));
        if (this.rankTabNodes.battleLevel) this.bindScaledClick(this.rankTabNodes.battleLevel, () => this.switchRankTab('battleLevel'));

        this.rankScrollNode = this.findNode('RankScrollView', panel);
        this.rankScrollContent = this.rankScrollNode ? this.findNode('RankScrollContent', this.rankScrollNode) : null;
        if (!this.rankScrollNode || !this.rankScrollContent) {
            console.warn('[MainHomeView] RankPanel missing RankScrollView/RankScrollContent');
            return;
        }

        this.rankRowTemplate = this.findNode('RankRowTemplate', this.rankScrollContent);
        if (!this.rankRowTemplate) {
            this.rankRowTemplate = this.createRankRowTemplate(this.rankScrollContent);
        }
        this.rankRowTemplate.active = false;
        this.clearSpriteFrame(this.rankRowTemplate.getChildByName('RankRowSkin'));
        const bottomBg = this.findNode('RankBottomBg', panel);
        if (bottomBg) {
            bottomBg.active = false;
            this.clearSpriteFrame(bottomBg);
        }
        this.setupRankScrollView(this.rankScrollNode, this.rankScrollContent);
    }

    protected closeRankPanel(): void {
        if (!this.rankPanel) return;

        this.rankPanel.active = false;
    }

    protected switchRankTab(tab: RankTab): void {
        if (this.rankActiveTab === tab) return;

        this.rankActiveTab = tab;
        this.refreshRankPanel();
    }

    protected refreshRankPanel(): void {
        if (!this.rankPanel) return;

        this.refreshRankTabs();
        const data = this.getRankPlayers();
        this.updateRankTopCard(1, data[0]);
        this.updateRankTopCard(2, data[1]);
        this.updateRankTopCard(3, data[2]);
        this.refreshRankRows(data.slice(3));
    }

    protected refreshRankTabs(): void {
        const tabs: Array<[RankTab, string]> = [
            ['power', '\u6218\u529b'],
            ['battleLevel', '\u6218\u573a\u7b49\u7ea7'],
        ];
        tabs.forEach(([tab, text]) => {
            const node = this.rankTabNodes[tab];
            if (!node?.isValid) return;

            const selected = this.rankActiveTab === tab;
            const size = node.getComponent(UITransform)?.contentSize;
            this.applySlicedUiSkin(node, selected ? HomeConfig.UI_RANK_TAB_ACTIVE : HomeConfig.UI_RANK_TAB_NORMAL, size?.width || 138, size?.height || 57);
            const label = node.children.find((child) => child.name.endsWith('Label'))?.getComponent(Label);
            if (label) {
                label.string = text;
                label.color = selected ? new Color(255, 246, 214, 255) : new Color(244, 237, 224, 255);
                this.applyStrongTextStyle(label);
            }
        });
    }

    protected createRankTab(parent: Node, name: string, text: string, x: number, tab: RankTab): Node {
        const selected = this.rankActiveTab === tab;
        const node = this.createSlicedSkinnedNode(name, parent, 138, 57, x, 0, selected ? HomeConfig.UI_RANK_TAB_ACTIVE : HomeConfig.UI_RANK_TAB_NORMAL);
        const label = this.createLabel(node, `${name}Label`, text, 26, 0, 1, 126, 48, Color.WHITE);
        this.applyStrongTextStyle(label);
        this.bindScaledClick(node, () => this.switchRankTab(tab));
        return node;
    }

    protected createRankTopCard(parent: Node, name: string, rank: 1 | 2 | 3, x: number, y: number, width: number, height: number): Node {
        const card = this.createNode(name, parent, width, height, x, y);
        const frame = rank === 1 ? HomeConfig.UI_RANK_CARD_1 : rank === 2 ? HomeConfig.UI_RANK_CARD_2 : HomeConfig.UI_RANK_CARD_3;
        const badgeFrame = rank === 1 ? HomeConfig.UI_RANK_BADGE_1 : rank === 2 ? HomeConfig.UI_RANK_BADGE_2 : HomeConfig.UI_RANK_BADGE_3;
        this.createSlicedSkinnedNode('RankTopCardSkin', card, width, height, 0, 0, frame).setSiblingIndex(0);
        this.createSkinnedNode('RankTopBadge', card, rank === 1 ? 72 : 64, 64, 0, height / 2 + 26, badgeFrame).setSiblingIndex(1);
        this.createSkinnedNode('RankTopAvatarIcon', card, 92, 92, 0, -12, HomeConfig.UI_HOME_AVATAR).setSiblingIndex(2);
        const role = this.createLabel(card, 'RankTopRoleLabel', '', 24, 0, -82, width - 40, 36, new Color(255, 245, 215, 255));
        this.applyStrongTextStyle(role);
        const power = this.createLabel(card, 'RankTopPower', '\u6218\u529b 0', 25, 0, height / 2 - 88, width - 36, 42, new Color(255, 226, 142, 255));
        this.applyStrongTextStyle(power);
        const playerName = this.createLabel(card, 'RankTopName', '\u5c11\u4fa0', 25, 0, -height / 2 - 34, width + 40, 44, Color.WHITE);
        this.applyStrongTextStyle(playerName);
        return card;
    }

    protected updateRankTopCard(rank: 1 | 2 | 3, data: RankPlayerData): void {
        const card = this.rankPanel ? this.findNode(`RankTopCard_${rank}`, this.rankPanel) : null;
        if (!card) return;

        const size = card.getComponent(UITransform)?.contentSize;
        const skin = card.getChildByName('RankTopCardSkin');
        if (skin) {
            this.applySlicedUiSkin(skin, rank === 1 ? HomeConfig.UI_RANK_CARD_1 : rank === 2 ? HomeConfig.UI_RANK_CARD_2 : HomeConfig.UI_RANK_CARD_3, size?.width || 220, size?.height || 300);
        }
        const badge = card.getChildByName('RankTopBadge');
        if (badge) {
            const badgeSize = badge.getComponent(UITransform)?.contentSize;
            this.applyUiSkin(badge, rank === 1 ? HomeConfig.UI_RANK_BADGE_1 : rank === 2 ? HomeConfig.UI_RANK_BADGE_2 : HomeConfig.UI_RANK_BADGE_3, badgeSize?.width || 70, badgeSize?.height || 70);
        }
        const avatar = card.getChildByName('RankTopAvatarIcon');
        if (avatar) {
            const avatarSize = avatar.getComponent(UITransform)?.contentSize;
            this.applyUiSkin(avatar, HomeConfig.UI_HOME_AVATAR, avatarSize?.width || 92, avatarSize?.height || 92);
        }
        this.setRankLabel(card, 'RankTopRoleLabel', data.gender === 'female' ? '\u5973\u89d2\u8272' : '\u7537\u89d2\u8272');
        this.setRankLabel(card, 'RankTopPower', `\u6218\u529b ${data.power}`);
        this.setRankLabel(card, 'RankTopName', data.name);
    }

    protected createRankRowTemplate(parent: Node): Node {
        const row = this.createNode('RankRowTemplate', parent, 660, 104, 0, 0);
        row.active = false;
        const skin = this.createSlicedSkinnedNode('RankRowSkin', row, 660, 104, 0, 0, HomeConfig.UI_RANK_ROW_BG);
        this.clearSpriteFrame(skin);
        skin.setSiblingIndex(0);
        const rankLabel = this.createLabel(row, 'RankRowNo', '4', 30, -278, 0, 76, 70, new Color(42, 43, 43, 255));
        this.applyRankListTextStyle(rankLabel);
        this.createSkinnedNode('RankRowAvatarIcon', row, 70, 70, -196, 0, HomeConfig.UI_HOME_AVATAR).setSiblingIndex(1);
        const name = this.createLabel(row, 'RankRowName', '\u5c11\u4fa0', 28, -32, 0, 260, 62, new Color(30, 34, 35, 255));
        name.horizontalAlign = HorizontalTextAlignment.LEFT;
        this.applyRankListTextStyle(name);
        const power = this.createLabel(row, 'RankRowPower', '\u6218\u529b 0', 29, 226, 0, 180, 62, new Color(255, 224, 120, 255));
        this.applyStrongTextStyle(power);
        this.rankRowTemplate = row;
        return row;
    }

    protected refreshRankRows(rows: RankPlayerData[]): void {
        if (!this.rankScrollContent) return;

        this.clearRankRows();
        const viewHeight = this.rankScrollNode?.getComponent(UITransform)?.contentSize.height || 612;
        const rowHeight = this.rankRowTemplate?.getComponent(UITransform)?.contentSize.height || 104;
        const gap = 18;
        const topPadding = 12;
        const bottomPadding = 18;
        const contentHeight = Math.max(viewHeight, topPadding + bottomPadding + rows.length * rowHeight + Math.max(0, rows.length - 1) * gap);
        const contentTransform = this.rankScrollContent.getComponent(UITransform) || this.rankScrollContent.addComponent(UITransform);
        contentTransform.setContentSize(contentTransform.contentSize.width || 684, contentHeight);

        let cursorY = contentHeight / 2 - topPadding - rowHeight / 2;
        rows.forEach((rowData, index) => {
            const row = this.createRankRowFromTemplate(rowData, index);
            row.setPosition(0, cursorY, 0);
            cursorY -= rowHeight + gap;
        });

        this.rankScrollView?.scrollToTop(0.01);
    }

    protected createRankRowFromTemplate(data: RankPlayerData, index: number): Node {
        let row: Node;
        if (this.rankRowTemplate) {
            row = instantiate(this.rankRowTemplate);
            row.name = `RankRow_${index + 1}`;
            row.active = false;
            this.rankScrollContent?.addChild(row);
        } else {
            row = this.createRankRowTemplate(this.rankScrollContent!);
            row.name = `RankRow_${index + 1}`;
            row.active = false;
        }

        const rowSize = row.getComponent(UITransform)?.contentSize;
        const skin = row.getChildByName('RankRowSkin');
        if (skin) {
            this.clearSpriteFrame(skin);
            this.applySlicedUiSkin(skin, HomeConfig.UI_RANK_ROW_BG, rowSize?.width || 660, rowSize?.height || 104);
        }
        this.setRankLabel(row, 'RankRowNo', `${data.rank}`);
        const avatar = row.getChildByName('RankRowAvatarIcon');
        if (avatar) {
            const avatarSize = avatar.getComponent(UITransform)?.contentSize;
            this.applyUiSkin(avatar, HomeConfig.UI_HOME_AVATAR, avatarSize?.width || 70, avatarSize?.height || 70);
        }
        this.setRankLabel(row, 'RankRowName', data.name);
        this.setRankLabel(row, 'RankRowPower', `\u6218\u529b ${data.power}`);
        row.setSiblingIndex(index + 1);
        row.active = true;
        return row;
    }

    protected clearSpriteFrame(node: Node | null | undefined): void {
        if (!node?.isValid) return;

        const sprite = node.getComponent(Sprite);
        if (sprite) {
            sprite.spriteFrame = null;
            sprite.enabled = false;
        }
    }

    protected clearRankRows(): void {
        if (!this.rankScrollContent) return;

        [...this.rankScrollContent.children].forEach((child) => {
            if (child === this.rankRowTemplate || child.name === 'RankRowTemplate') {
                child.active = false;
                return;
            }
            child.active = false;
            child.destroy();
        });
    }

    protected setupRankScrollView(scrollNode: Node, content: Node): void {
        const mask = scrollNode.getComponent(Mask) || scrollNode.addComponent(Mask);
        mask.type = 0;
        const scroll = scrollNode.getComponent(ScrollView) || scrollNode.addComponent(ScrollView);
        scroll.content = content;
        scroll.horizontal = false;
        scroll.vertical = true;
        scroll.inertia = true;
        scroll.brake = 0.75;
        scroll.elastic = true;
        scroll.bounceDuration = 0.2;
        this.rankScrollView = scroll;
    }

    protected getRankPlayers(): RankPlayerData[] {
        if (this.rankActiveTab === 'battleLevel') {
            return [
                { rank: 1, name: '\u79d8\u5883\u7ea2\u5c18', power: 'Lv.99', gender: 'female' },
                { rank: 2, name: '\u95ee\u9053\u9752\u4e91', power: 'Lv.96', gender: 'male' },
                { rank: 3, name: '\u5929\u5251\u5b64\u9e3f', power: 'Lv.94', gender: 'male' },
                { rank: 4, name: '\u6536\u8d27thz18168', power: 'Lv.91', gender: 'female' },
                { rank: 5, name: '\u592a\u963324\u5c0f\u65f6\u6536\u51fa', power: 'Lv.88', gender: 'female' },
                { rank: 6, name: '\u6668xy1005918', power: 'Lv.86', gender: 'male' },
                { rank: 7, name: '\u6668MR', power: 'Lv.82', gender: 'male' },
                { rank: 8, name: '\u592a\u9633AS6888S', power: 'Lv.80', gender: 'female' },
                { rank: '\u672a\u4e0a\u699c', name: this.profile.name || HomeConfig.DEFAULT_NAME, power: 'Lv.0', gender: this.profile.gender },
            ];
        }

        return [
            { rank: 1, name: '\u7279\u6743\u8fbe\u4eba', power: '10.66\u4e07', gender: 'female' },
            { rank: 2, name: '\u5f00\u5411\u5feb\u9e70\u5929\u4e0b\u65e0\u654c', power: '10.66\u4e07', gender: 'male' },
            { rank: 3, name: '\u5929\u5251', power: '10.28\u4e07', gender: 'male' },
            { rank: 4, name: '\u6536\u8d27thz18168', power: '9.76\u4e07', gender: 'female' },
            { rank: 5, name: '\u592a\u963324\u5c0f\u65f6\u6536\u51fa', power: '9.65\u4e07', gender: 'female' },
            { rank: 6, name: '\u6668xy1005918', power: '9.55\u4e07', gender: 'male' },
            { rank: 7, name: '\u6668MR', power: '7.55\u4e07', gender: 'male' },
            { rank: 8, name: '\u592a\u9633AS6888S', power: '7.16\u4e07', gender: 'female' },
            { rank: '\u672a\u4e0a\u699c', name: this.profile.name || HomeConfig.DEFAULT_NAME, power: '125', gender: this.profile.gender },
        ];
    }

    protected setRankLabel(root: Node, labelName: string, value: string): void {
        const label = this.findNode(labelName, root)?.getComponent(Label);
        if (!label) return;

        label.string = value;
        applySimKaiFont(label);
    }

    protected applyStrongTextStyle(label: Label): void {
        applySimKaiFont(label);
        label.enableOutline = true;
        label.outlineColor = new Color(42, 32, 26, 255);
        label.outlineWidth = 3;
    }

    protected applyRankListTextStyle(label: Label): void {
        applySimKaiFont(label);
        label.enableOutline = true;
        label.outlineColor = new Color(255, 255, 255, 255);
        label.outlineWidth = 2;
    }
}
