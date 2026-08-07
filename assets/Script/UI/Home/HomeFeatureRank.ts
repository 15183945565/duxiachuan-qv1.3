import {
    Color,
    EventTouch,
    Graphics,
    HorizontalTextAlignment,
    Label,
    Mask,
    Node,
    Overflow,
    ScrollView,
    Sprite,
    UITransform,
    VerticalTextAlignment,
} from 'cc';
import { applySimKaiFont } from '../Common/UIFont';
import * as HomeConfig from './HomeConfig';
import { HomeViewBase } from './HomeViewBase';
import type {
    RankPlayerData,
    RankTab,
    RoleGender,
} from './HomeTypes';

type MainRankEntry = {
    name: string;
    score: number;
    display: string;
    gender: RoleGender;
};

const MAIN_RANK_ROW_WIDTH = 740.946;
const MAIN_RANK_ROW_HEIGHT = 116.995;
const MAIN_RANK_ROW_GAP = 12;
const MAIN_RANK_ROW_TOP_PADDING = 12;
const MAIN_RANK_ROW_BOTTOM_PADDING = 96;
const MAIN_RANK_VIEW_WIDTH = 750;
const MAIN_RANK_VIEW_HEIGHT = 666.009;

const MAIN_RANK_HEADER_COLUMNS = [
    { name: 'Rank', text: '\u540d\u6b21', x: -280, width: 70 },
    { name: 'Avatar', text: '\u5934\u50cf', x: -220, width: 70 },
    { name: 'Player', text: '\u73a9\u5bb6\u540d', x: -96, width: 178 },
    { name: 'Metric', text: '', x: 178, width: 180 },
] as const;

/**
 * Main-screen leaderboard. It reuses the Duel/Luanshi weekly-rank skin, but the
 * columns are simplified for main-home ranking: no reward column, just player
 * identity plus the selected rank metric.
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
        if (this.rankPanel) {
            this.ensureMainRankLayout(this.rankPanel);
            return;
        }

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
        this.ensureMainRankLayout(this.rankPanel);
    }

    protected bindEditorRankPanel(panel: Node): void {
        this.rankPanel = panel;
        if (this.popupRoot && panel.parent !== this.popupRoot) {
            panel.setParent(this.popupRoot);
        }
        (panel.getComponent(UITransform) || panel.addComponent(UITransform)).setContentSize(HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT);
        panel.active = false;
        panel.off(Node.EventType.TOUCH_END);
        panel.on(Node.EventType.TOUCH_END, (event: EventTouch) => {
            event.propagationStopped = true;
        }, this);

        this.ensureMainRankLayout(panel);
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

        this.ensureMainRankLayout(this.rankPanel);
        this.refreshRankTabs();
        this.refreshMainRankHeader();
        const data = this.getRankPlayers();
        this.updateRankTopCard(1, data[0]);
        this.updateRankTopCard(2, data[1]);
        this.updateRankTopCard(3, data[2]);
        this.refreshRankRows(data);
    }

    protected refreshRankTabs(): void {
        const tabs: Array<[RankTab, string]> = [
            ['power', '\u6218\u529b\u699c'],
            ['battleLevel', '\u6218\u573a\u699c'],
        ];
        tabs.forEach(([tab, text]) => {
            const node = this.rankTabNodes[tab];
            if (!node?.isValid) return;

            const selected = this.rankActiveTab === tab;
            const size = node.getComponent(UITransform)?.contentSize;
            this.applySlicedUiSkin(
                node,
                selected ? HomeConfig.UI_DUEL_JIANGHU_RANK_TAB_ACTIVE : HomeConfig.UI_DUEL_JIANGHU_RANK_TAB_INACTIVE,
                size?.width || 158,
                size?.height || 52,
            );
            const label = node.getChildByName(`${node.name}Label`)?.getComponent(Label);
            if (label) {
                label.string = text;
                this.applyMainRankText(
                    label,
                    24,
                    selected ? new Color(255, 246, 214, 255) : new Color(112, 77, 48, 255),
                    HorizontalTextAlignment.CENTER,
                    selected ? 2 : 1,
                    selected ? new Color(94, 46, 20, 255) : new Color(255, 246, 214, 255),
                );
            }
        });
    }

    protected createRankTab(parent: Node, name: string, text: string, x: number, tab: RankTab): Node {
        const selected = this.rankActiveTab === tab;
        const node = this.getOrCreateEditorSkinnedNode(
            name,
            parent,
            158,
            52,
            x,
            0,
            selected ? HomeConfig.UI_DUEL_JIANGHU_RANK_TAB_ACTIVE : HomeConfig.UI_DUEL_JIANGHU_RANK_TAB_INACTIVE,
        );
        node.active = true;
        const label = this.getOrCreateEditorLabel(node, `${name}Label`, text, 24, 0, 0, 138, 42, Color.WHITE);
        this.applyMainRankText(label, 24, Color.WHITE, HorizontalTextAlignment.CENTER, 2, new Color(94, 46, 20, 255));
        this.bindScaledClick(node, () => this.switchRankTab(tab));
        return node;
    }

    protected createRankTopCard(parent: Node, name: string, rank: 1 | 2 | 3, x: number, y: number, width: number, height: number): Node {
        const skinPath = rank === 1
            ? HomeConfig.UI_DUEL_JIANGHU_RANK_TOP1_BG
            : rank === 2
                ? HomeConfig.UI_DUEL_JIANGHU_RANK_TOP2_BG
                : HomeConfig.UI_DUEL_JIANGHU_RANK_TOP3_BG;
        return this.ensureMainRankTopCard(parent, name, skinPath, x, y, width, height, rank === 1 ? 1.3 : 1.1);
    }

    protected updateRankTopCard(rank: 1 | 2 | 3, data: RankPlayerData): void {
        const card = this.rankPanel ? this.findNode(`MainRankTop${rank}`, this.rankPanel) : null;
        if (!card || !data) return;

        const name = card.getChildByName(`${card.name}NameLabel`)?.getComponent(Label);
        if (name) name.string = data.name;
        const metric = card.getChildByName(`${card.name}MetricLabel`)?.getComponent(Label);
        if (metric) {
            metric.string = '';
            metric.node.active = false;
        }
        this.applyMainRankAvatarSkin(card, `${card.name}Avatar`, data.gender);
    }

    protected createRankRowTemplate(parent: Node): Node {
        const template = this.getOrCreateEditorNode('MainRankRowTemplate', parent, MAIN_RANK_ROW_WIDTH, MAIN_RANK_ROW_HEIGHT, 0, 0);
        template.active = false;
        return template;
    }

    protected refreshRankRows(rows: RankPlayerData[]): void {
        const content = this.rankScrollContent;
        if (!content) return;

        const rowLayout = this.getMainRankRowLayout(content);
        (content.getComponent(UITransform) || content.addComponent(UITransform)).setContentSize(MAIN_RANK_VIEW_WIDTH, rowLayout.contentHeight);
        const list = this.rankScrollNode;
        if (list) content.setPosition(0, this.getMainRankContentTopY(list, rowLayout.contentHeight), 0);

        rows.slice(0, 10).forEach((rowData, index) => {
            const row = this.createRankRowFromTemplate(rowData, index);
            row.setPosition(0, rowLayout.firstRowY - index * rowLayout.rowStep, 0);
            row.setSiblingIndex(index);
            row.active = true;
        });
        for (let rank = rows.length + 1; rank <= 10; rank += 1) {
            const row = content.getChildByName(`MainRankRow_${rank}`);
            if (row) row.active = false;
        }

        this.rankScrollView?.scrollToTop(0.01);
    }

    protected createRankRowFromTemplate(data: RankPlayerData, index: number): Node {
        const content = this.rankScrollContent;
        if (!content) {
            throw new Error('Rank scroll content is not ready.');
        }
        const rank = index + 1;
        const row = this.ensureMainRankRow(content, `MainRankRow_${rank}`, 0, 0);
        this.refreshMainRankRow(row, data);
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

        for (let rank = 1; rank <= 10; rank += 1) {
            const row = this.rankScrollContent.getChildByName(`MainRankRow_${rank}`);
            if (row) row.active = false;
        }
    }

    protected setupRankScrollView(scrollNode: Node, content: Node): void {
        const mask = scrollNode.getComponent(Mask) || scrollNode.addComponent(Mask);
        mask.type = Mask.Type.GRAPHICS_RECT;
        mask.enabled = true;

        const scroll = scrollNode.getComponent(ScrollView) || scrollNode.addComponent(ScrollView);
        scroll.content = content;
        scroll.horizontal = false;
        scroll.vertical = true;
        scroll.inertia = true;
        scroll.brake = 0.75;
        scroll.elastic = false;
        scroll.bounceDuration = 0;
        scroll.enabled = true;
        this.rankScrollView = scroll;
    }

    protected getRankPlayers(): RankPlayerData[] {
        const entries = this.rankActiveTab === 'battleLevel'
            ? this.getMainRankBattleLevelEntries()
            : this.getMainRankPowerEntries();

        return entries
            .sort((left, right) => right.score - left.score)
            .slice(0, 10)
            .map((entry, index) => ({
                rank: index + 1,
                name: entry.name,
                power: entry.display,
                gender: entry.gender,
            }));
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

    private ensureMainRankLayout(panel: Node): void {
        const root = this.getOrCreateEditorNode('MainRankRoot', panel, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT, 0, 0);
        root.active = true;
        root.setSiblingIndex((panel.children.length || 1) - 1);

        this.hideLegacyRankPanelNodes(panel, root);
        this.ensureMainRankBackground(root);
        this.ensureMainRankTitle(root);
        this.ensureMainRankTabs(root);
        this.ensureMainRankTopRoot(root);
        this.ensureMainRankHeader(root);
        this.ensureMainRankList(root);
        this.ensureMainRankBack(root);
    }

    private hideLegacyRankPanelNodes(panel: Node, root: Node): void {
        panel.children.forEach((child) => {
            if (child !== root) child.active = false;
        });
    }

    private ensureMainRankBackground(root: Node): void {
        const bg = this.getOrCreateEditorSkinnedNode(
            'MainRankBackground',
            root,
            HomeConfig.VIEW_WIDTH,
            HomeConfig.VIEW_HEIGHT,
            0,
            0,
            HomeConfig.UI_DUEL_JIANGHU_RANK_BG,
        );
        const legacyGraphics = bg.getComponent(Graphics);
        if (legacyGraphics) {
            legacyGraphics.clear();
            legacyGraphics.enabled = false;
        }
        bg.active = true;
        bg.setSiblingIndex(0);
    }

    private ensureMainRankTitle(root: Node): void {
        const titleBarExisted = !!root.getChildByName('MainRankTitleBar');
        const titleBar = this.getOrCreateEditorSkinnedNode(
            'MainRankTitleBar',
            root,
            182,
            36,
            0,
            680,
            HomeConfig.UI_DUEL_JIANGHU_RANK_INVEST_TITLE_BAR,
        );
        titleBar.active = true;
        if (!titleBarExisted) titleBar.setScale(1.5, 1.5, 1);
        titleBar.setSiblingIndex(2);

        const title = this.getOrCreateEditorLabel(titleBar, 'MainRankTitleLabel', '\u6392\u884c\u699c', 27, 0, 1.363, 130, 32, new Color(60, 44, 30, 255));
        title.string = '\u6392\u884c\u699c';
        this.applyMainRankText(title, 27, new Color(60, 44, 30, 255), HorizontalTextAlignment.CENTER, 2);
        title.node.setSiblingIndex(0);
    }

    private ensureMainRankTabs(root: Node): void {
        const tabsRootExisted = !!root.getChildByName('MainRankTabs');
        const tabsRoot = this.getOrCreateEditorNode('MainRankTabs', root, 360, 58, 0, 620);
        tabsRoot.active = true;
        if (!tabsRootExisted) tabsRoot.setScale(1.1, 1.1, 1);
        tabsRoot.setSiblingIndex(3);
        this.rankTabNodes.power = this.createRankTab(tabsRoot, 'MainRankTabPower', '\u6218\u529b\u699c', -92, 'power');
        this.rankTabNodes.battleLevel = this.createRankTab(tabsRoot, 'MainRankTabBattleLevel', '\u6218\u573a\u699c', 92, 'battleLevel');
    }

    private ensureMainRankTopRoot(root: Node): Node {
        const topRootExisted = !!root.getChildByName('MainRankTopRoot');
        const topRoot = this.getOrCreateEditorNode('MainRankTopRoot', root, 700, 320, 0, 405);
        topRoot.active = true;
        if (!topRootExisted) topRoot.setScale(1.1, 1.1, 1);
        topRoot.setSiblingIndex(4);
        this.createRankTopCard(topRoot, 'MainRankTop2', 2, -233.675, -8, 198, 232);
        this.createRankTopCard(topRoot, 'MainRankTop1', 1, 0, 24, 216, 252);
        this.createRankTopCard(topRoot, 'MainRankTop3', 3, 234.131, -8, 198, 230);
        return topRoot;
    }

    private ensureMainRankTopCard(parent: Node, name: string, skinPath: string, x: number, y: number, width: number, height: number, scale = 1): Node {
        const cardExisted = !!parent.getChildByName(name);
        const card = this.getOrCreateEditorSkinnedNode(name, parent, width, height, x, y, skinPath);
        card.active = true;
        if (!cardExisted) {
            card.setScale(scale, scale, 1);
            (card.getComponent(UITransform) || card.addComponent(UITransform)).setContentSize(width, height);
        }
        card.setSiblingIndex(name.endsWith('1') ? 1 : name.endsWith('2') ? 0 : 2);
        this.ensureMainRankAvatar(card, `${name}Avatar`, 0, 26, 74, 58);

        const nameLabel = this.getOrCreateEditorLabel(card, `${name}NameLabel`, '\u5c11\u4fa0', 23, 0, -50, width - 28, 38, new Color(255, 246, 210, 255));
        this.applyMainRankText(nameLabel, 23, new Color(255, 246, 210, 255), HorizontalTextAlignment.CENTER, 2, new Color(94, 46, 20, 255));
        nameLabel.node.setSiblingIndex(2);

        const metricLabel = this.getOrCreateEditorLabel(card, `${name}MetricLabel`, '', 19, 0, -86, width - 28, 34, new Color(139, 54, 20, 255));
        metricLabel.node.active = false;
        metricLabel.node.setSiblingIndex(3);
        return card;
    }

    private ensureMainRankHeader(root: Node): void {
        const headerExisted = !!root.getChildByName('MainRankHeader');
        const header = this.getOrCreateEditorNode('MainRankHeader', root, 640, 42, 0, 210);
        header.active = true;
        if (!headerExisted) header.setScale(1.1, 1.1, 1);
        header.setSiblingIndex(5);
        this.refreshMainRankHeader();
    }

    private refreshMainRankHeader(): void {
        if (!this.rankPanel) return;
        const header = this.findNode('MainRankHeader', this.rankPanel);
        if (!header) return;

        const metricTitle = this.rankActiveTab === 'battleLevel' ? '\u6218\u573a\u7b49\u7ea7' : '\u6218\u529b';
        MAIN_RANK_HEADER_COLUMNS.forEach((column) => {
            const text = column.name === 'Metric' ? metricTitle : column.text;
            const label = this.getOrCreateEditorLabel(
                header,
                `MainRankHeader${column.name}Label`,
                text,
                20,
                column.x,
                0,
                column.width,
                36,
                new Color(103, 64, 35, 255),
            );
            label.string = text;
            this.applyMainRankText(label, 20, new Color(103, 64, 35, 255), HorizontalTextAlignment.CENTER, 1);
        });
    }

    private ensureMainRankList(root: Node): Node {
        const listExisted = !!root.getChildByName('MainRankList');
        const list = this.getOrCreateEditorNode('MainRankList', root, MAIN_RANK_VIEW_WIDTH, MAIN_RANK_VIEW_HEIGHT, 0, -142);
        list.active = true;
        const listTransform = list.getComponent(UITransform) || list.addComponent(UITransform);
        if (!listExisted) listTransform.setContentSize(MAIN_RANK_VIEW_WIDTH, MAIN_RANK_VIEW_HEIGHT);
        list.setSiblingIndex(6);

        const contentHeight = this.getMainRankContentHeight();
        const content = this.getOrCreateEditorNode('MainRankContent', list, MAIN_RANK_VIEW_WIDTH, contentHeight, 0, 0);
        content.active = true;
        const rowLayout = this.getMainRankRowLayout(content);
        (content.getComponent(UITransform) || content.addComponent(UITransform)).setContentSize(MAIN_RANK_VIEW_WIDTH, rowLayout.contentHeight);
        content.setPosition(0, this.getMainRankContentTopY(list, rowLayout.contentHeight), 0);
        this.rankScrollNode = list;
        this.rankScrollContent = content;
        this.rankRowTemplate = this.createRankRowTemplate(content);
        this.setupRankScrollView(list, content);

        for (let index = 0; index < 10; index += 1) {
            const rank = index + 1;
            const row = this.ensureMainRankRow(content, `MainRankRow_${rank}`, 0, rowLayout.firstRowY - index * rowLayout.rowStep);
            row.setSiblingIndex(index);
        }
        this.rankRowTemplate.setSiblingIndex(10);
        return list;
    }

    private ensureMainRankRow(parent: Node, name: string, x: number, y: number): Node {
        const rowExisted = !!parent.getChildByName(name);
        const row = this.getOrCreateEditorSkinnedNode(name, parent, MAIN_RANK_ROW_WIDTH, MAIN_RANK_ROW_HEIGHT, x, y, this.getMainRankRowBg(name));
        row.active = true;
        if (!rowExisted) {
            (row.getComponent(UITransform) || row.addComponent(UITransform)).setContentSize(MAIN_RANK_ROW_WIDTH, MAIN_RANK_ROW_HEIGHT);
        }

        const rankLabel = this.getOrCreateEditorLabel(row, `${name}RankLabel`, '1', 24, -307.828, 0, 60, 42, new Color(210, 102, 46, 255));
        this.applyMainRankText(rankLabel, 24, new Color(210, 102, 46, 255), HorizontalTextAlignment.CENTER, 0);
        rankLabel.node.setSiblingIndex(0);

        this.ensureMainRankAvatar(row, `${name}Avatar`, -242.03, 0, 54, 44);

        const nameLabel = this.getOrCreateEditorLabel(row, `${name}NameLabel`, '\u5c11\u4fa0', 22, -79.535, 0, 190, 42, new Color(73, 43, 24, 255));
        this.applyMainRankText(nameLabel, 22, new Color(73, 43, 24, 255), HorizontalTextAlignment.LEFT, 0);
        nameLabel.node.setSiblingIndex(3);

        const metricLabel = this.getOrCreateEditorLabel(row, `${name}MetricLabel`, '0', 22, 190, 0, 178, 42, new Color(115, 68, 29, 255));
        this.applyMainRankText(metricLabel, 22, new Color(115, 68, 29, 255), HorizontalTextAlignment.CENTER, 0);
        metricLabel.node.setSiblingIndex(4);
        return row;
    }

    private refreshMainRankRow(row: Node, data: RankPlayerData): void {
        row.active = true;
        const rankLabel = row.getChildByName(`${row.name}RankLabel`)?.getComponent(Label);
        if (rankLabel) rankLabel.string = `${data.rank}`;
        const name = row.getChildByName(`${row.name}NameLabel`)?.getComponent(Label);
        if (name) name.string = data.name;
        const metric = row.getChildByName(`${row.name}MetricLabel`)?.getComponent(Label);
        if (metric) metric.string = data.power;
        this.applyMainRankAvatarSkin(row, `${row.name}Avatar`, data.gender);
    }

    private ensureMainRankBack(root: Node): void {
        const back = this.getOrCreateEditorSkinnedNode(
            'MainRankBack',
            root,
            HomeConfig.BOTTOM_ENTRY_BACK_BUTTON_WIDTH,
            HomeConfig.BOTTOM_ENTRY_BACK_BUTTON_HEIGHT,
            HomeConfig.BOTTOM_ENTRY_BACK_BUTTON_X,
            HomeConfig.BOTTOM_ENTRY_BACK_BUTTON_Y,
            HomeConfig.UI_RANK_BACK,
        );
        back.active = true;
        back.setSiblingIndex(20);
        this.bindScaledClick(back, () => this.closeRankPanel());
    }

    private ensureMainRankAvatar(parent: Node, name: string, x: number, y: number, frameSize: number, iconSize: number): Node {
        const frame = this.getOrCreateEditorSkinnedNode(
            `${name}Frame`,
            parent,
            frameSize,
            frameSize,
            x,
            y,
            HomeConfig.UI_HOME_PROFILE_FRAME,
        );
        frame.active = true;
        (frame.getComponent(UITransform) || frame.addComponent(UITransform)).setContentSize(frameSize, frameSize);
        frame.setSiblingIndex(1);

        const icon = this.getOrCreateEditorSkinnedNode(
            `${name}Icon`,
            frame,
            iconSize,
            iconSize,
            0,
            0,
            this.getHomeAvatarSkin('female'),
        );
        icon.active = true;
        (icon.getComponent(UITransform) || icon.addComponent(UITransform)).setContentSize(iconSize, iconSize);
        icon.setSiblingIndex(0);
        return frame;
    }

    private applyMainRankAvatarSkin(parent: Node, avatarBaseName: string, gender: RoleGender): void {
        const frame = parent.getChildByName(`${avatarBaseName}Frame`);
        const icon = frame?.getChildByName(`${avatarBaseName}Icon`);
        const iconSize = icon?.getComponent(UITransform)?.contentSize;
        this.applyHomeAvatarSkin(icon, iconSize?.width || 58, iconSize?.height || 58, gender);
    }

    private getMainRankContentHeight(): number {
        return MAIN_RANK_ROW_TOP_PADDING
            + MAIN_RANK_ROW_BOTTOM_PADDING
            + MAIN_RANK_ROW_HEIGHT * 10
            + MAIN_RANK_ROW_GAP * 9;
    }

    private getMainRankRowLayout(content: Node): { contentHeight: number; firstRowY: number; rowStep: number; rowHeight: number } {
        const firstRow = content.getChildByName('MainRankRow_1');
        const secondRow = content.getChildByName('MainRankRow_2');
        const firstTransform = firstRow?.getComponent(UITransform);
        const rowHeight = firstTransform?.contentSize.height || MAIN_RANK_ROW_HEIGHT;
        const rowStep = firstRow && secondRow
            ? Math.abs(firstRow.position.y - secondRow.position.y) || rowHeight + MAIN_RANK_ROW_GAP
            : rowHeight + MAIN_RANK_ROW_GAP;
        const contentHeight = rowHeight
            + rowStep * 9
            + MAIN_RANK_ROW_TOP_PADDING
            + MAIN_RANK_ROW_BOTTOM_PADDING;
        const firstRowY = contentHeight / 2 - MAIN_RANK_ROW_TOP_PADDING - rowHeight / 2;
        return { contentHeight, firstRowY, rowStep, rowHeight };
    }

    private getMainRankContentTopY(list: Node, contentHeight: number): number {
        const listHeight = list.getComponent(UITransform)?.contentSize.height || MAIN_RANK_VIEW_HEIGHT;
        return listHeight / 2 - contentHeight / 2;
    }

    private getMainRankRowBg(rowName: string): string {
        const rank = Number(rowName.replace('MainRankRow_', ''));
        if (rank === 1) return HomeConfig.UI_DUEL_JIANGHU_RANK_ROW_TOP1_BG;
        if (rank === 2) return HomeConfig.UI_DUEL_JIANGHU_RANK_ROW_TOP2_BG;
        if (rank === 3) return HomeConfig.UI_DUEL_JIANGHU_RANK_ROW_TOP3_BG;
        return HomeConfig.UI_DUEL_JIANGHU_RANK_ROW_BG;
    }

    private applyMainRankText(
        label: Label,
        fontSize: number,
        color: Color,
        align: HorizontalTextAlignment,
        outlineWidth: number,
        outlineColor = new Color(255, 246, 214, 255),
    ): void {
        applySimKaiFont(label);
        label.fontSize = fontSize;
        label.lineHeight = fontSize + 6;
        label.color = color;
        label.horizontalAlign = align;
        label.verticalAlign = VerticalTextAlignment.CENTER;
        label.overflow = Overflow.SHRINK;
        label.enableOutline = outlineWidth > 0;
        label.outlineColor = outlineColor;
        label.outlineWidth = outlineWidth;
    }

    private getMainRankPowerEntries(): MainRankEntry[] {
        const currentPower = Math.max(0, Math.floor(this.getRoleTotalPower()));
        return [
            { name: '\u7279\u6743\u8fbe\u4eba', score: 106600, display: this.formatMainRankPower(106600), gender: 'female' },
            { name: '\u5f00\u5411\u5feb\u9e70\u5929\u4e0b\u65e0\u654c', score: 106600, display: this.formatMainRankPower(106600), gender: 'male' },
            { name: '\u5929\u5251', score: 102800, display: this.formatMainRankPower(102800), gender: 'male' },
            { name: '\u6536\u8d27thz18168', score: 97600, display: this.formatMainRankPower(97600), gender: 'female' },
            { name: '\u592a\u963324\u5c0f\u65f6\u6536\u51fa', score: 96500, display: this.formatMainRankPower(96500), gender: 'female' },
            { name: '\u6668xy1005918', score: 95500, display: this.formatMainRankPower(95500), gender: 'male' },
            { name: '\u6668MR', score: 75500, display: this.formatMainRankPower(75500), gender: 'male' },
            { name: '\u592a\u9633AS6888S', score: 71600, display: this.formatMainRankPower(71600), gender: 'female' },
            { name: '\u53f6\u843d\u77e5\u79cb', score: 64300, display: this.formatMainRankPower(64300), gender: 'male' },
            { name: '\u9752\u886b\u5ba2', score: 51200, display: this.formatMainRankPower(51200), gender: 'male' },
            {
                name: this.profile.name || HomeConfig.DEFAULT_NAME,
                score: currentPower,
                display: this.formatMainRankPower(currentPower),
                gender: this.profile.gender,
            },
        ];
    }

    private getMainRankBattleLevelEntries(): MainRankEntry[] {
        const currentLevel = Math.max(1, Math.floor(this.getRoleCurrentLevel()));
        return [
            { name: '\u79d8\u5883\u7ea2\u5c18', score: 99, display: 'Lv.99', gender: 'female' },
            { name: '\u95ee\u9053\u9752\u4e91', score: 96, display: 'Lv.96', gender: 'male' },
            { name: '\u5929\u5251\u5b64\u9e3f', score: 94, display: 'Lv.94', gender: 'male' },
            { name: '\u6536\u8d27thz18168', score: 91, display: 'Lv.91', gender: 'female' },
            { name: '\u592a\u963324\u5c0f\u65f6\u6536\u51fa', score: 88, display: 'Lv.88', gender: 'female' },
            { name: '\u6668xy1005918', score: 86, display: 'Lv.86', gender: 'male' },
            { name: '\u6668MR', score: 82, display: 'Lv.82', gender: 'male' },
            { name: '\u592a\u9633AS6888S', score: 80, display: 'Lv.80', gender: 'female' },
            { name: '\u53f6\u843d\u77e5\u79cb', score: 76, display: 'Lv.76', gender: 'male' },
            { name: '\u9752\u886b\u5ba2', score: 72, display: 'Lv.72', gender: 'male' },
            {
                name: this.profile.name || HomeConfig.DEFAULT_NAME,
                score: currentLevel,
                display: `Lv.${currentLevel}`,
                gender: this.profile.gender,
            },
        ];
    }

    private formatMainRankPower(value: number): string {
        if (value >= 10000) {
            return `${(value / 10000).toFixed(2).replace(/\.?0+$/, '')}\u4e07`;
        }
        return `${Math.floor(value)}`;
    }
}
