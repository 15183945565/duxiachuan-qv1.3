import { Color, Label, Node, Sprite, Tween, UITransform } from 'cc';
import { applySimKaiFont } from '../Common/UIFont';
import * as HomeConfig from './HomeConfig';
import { HomeViewBase } from './HomeViewBase';
import { DuelTab } from './HomeTypes';

abstract class HomeFeatureDuelLobbyHost extends HomeViewBase {
    protected abstract closeDuelJianghuReservedPages(page: Node): void;
    protected abstract stopDuelJianghuGameplay(page?: Node | null): void;
    protected abstract closeActiveDuelJianghuReservedPage(page: Node): boolean;
    protected abstract resetDuelGameplayTagScales(tagsRoot: Node): void;
    protected abstract startDuelLandingBackgroundPan(background: Node): void;
    protected abstract stopDuelLandingBackgroundPan(background?: Node | null): void;
    protected abstract openDuelLuanshiZhengxiongPage(panel: Node): void;
    protected abstract closeDuelLuanshiZhengxiongPage(panel: Node): void;
    protected abstract buildDuelJianghuTopInfo(page: Node): void;
    protected abstract buildDuelJianghuRuntimeLayers(page: Node): void;
    protected abstract buildDuelJianghuRoomLabels(page: Node): void;
    protected abstract buildDuelJianghuInvestControls(page: Node): void;
    protected abstract buildDuelJianghuSideButtons(page: Node): void;
    protected abstract ensureDuelJianghuReservedPage(page: Node, pageName: string, title: string): Node;
    protected abstract closeDuelLuanshiRecordPage(recordPage: Node): void;
    protected abstract closeDuelLuanshiRankPage(rankPage: Node): void;
    protected abstract playDuelJianghuBackgroundMusic(): void;
    protected abstract startDuelJianghuCountdown(page: Node, reset: boolean): void;
    protected abstract ensureDuelJianghuNpcCrowd(page: Node, force?: boolean): Promise<void>;
}

/**
 * 论剑大厅与江湖逃杀入口导航。
 *
 * 本 Feature 只负责大厅展示、入口分发和页面切换；下注、战绩、排行及
 * 战斗运行时通过显式宿主契约调用，后续可继续独立拆分。
 */
export abstract class HomeFeatureDuelLobby extends HomeFeatureDuelLobbyHost {
    protected bindDuelPage(panel: Node): void {
        this.refreshDuelLandingPage(panel);
        const back = this.findNode('DuelBack', panel);
        if (back) this.bindScaledClick(back, () => this.handleDuelBack(panel));
    }

    protected switchDuelTab(panel: Node, tab: DuelTab): void {
        this.duelActiveTab = tab; this.refreshDuelLandingPage(panel);
    }

    protected refreshDuelLandingPage(panel: Node): void {
        const background = this.findNode('DuelPanelBackground', panel);
        if (background) {
            background.active = true;
            this.applyUiSkin(background, HomeConfig.UI_DUEL_PAGE_BG, HomeConfig.DUEL_PAGE_BG_WIDTH, HomeConfig.DUEL_PAGE_BG_HEIGHT);
            this.startDuelLandingBackgroundPan(background);
        }
        const title = this.findNode('DuelPanelTitle', panel);
        if (title) title.active = true;
        const jianghuPage = this.findNode('DuelJianghuTaoshaPage', panel);
        if (jianghuPage) {
            this.closeDuelJianghuReservedPages(jianghuPage);
            this.stopDuelJianghuGameplay(jianghuPage);
            jianghuPage.active = false;
        }
        this.closeDuelLuanshiZhengxiongPage(panel);

        [
            'DuelTabMatch',
            'DuelTabRecord',
            'DuelSeasonLabel',
            'DuelOpponent_1',
            'DuelOpponent_2',
            'DuelOpponent_3',
            'DuelRefreshButton',
            'DuelContentHint',
        ].forEach((nodeName) => {
            const obsolete = this.findNode(nodeName, panel);
            if (obsolete) obsolete.active = false;
        });

        let tagsRoot = this.findNode('DuelGameplayTags', panel);
        if (!tagsRoot) {
            tagsRoot = this.createNode('DuelGameplayTags', panel, HomeConfig.VIEW_WIDTH, 1120, 0, 0);
        }
        tagsRoot.active = true;
        tagsRoot.setPosition(0, 0, 0);
        (tagsRoot.getComponent(UITransform) || tagsRoot.addComponent(UITransform)).setContentSize(HomeConfig.VIEW_WIDTH, 1120);

        HomeConfig.DUEL_GAMEPLAY_TAGS.forEach((config) => {
            let tag = tagsRoot!.getChildByName(config.nodeName);
            if (!tag) {
                tag = this.createSkinnedNode(
                    config.nodeName,
                    tagsRoot!,
                    HomeConfig.DUEL_GAMEPLAY_TAG_WIDTH,
                    HomeConfig.DUEL_GAMEPLAY_TAG_HEIGHT,
                    0,
                    config.y,
                    config.skinPath,
                );
            } else {
                tag.active = true;
                tag.setPosition(0, config.y, 0);
                this.applyUiSkinKeepingEditorSize(tag, config.skinPath, HomeConfig.DUEL_GAMEPLAY_TAG_WIDTH, HomeConfig.DUEL_GAMEPLAY_TAG_HEIGHT);
            }
            Tween.stopAllByTarget(tag);
            tag.setScale(1, 1, 1);
            this.buttonBaseScales.set(tag, tag.scale.clone());
            this.applyDuelGameplayTagState(tag, config.disabled);

            let nameNode = tag.getChildByName(config.labelNodeName);
            let nameLabel = nameNode?.getComponent(Label) || null;
            if (!nameNode || !nameLabel) {
                nameLabel = this.createLabel(
                    tag,
                    config.labelNodeName,
                    config.label,
                    38,
                    HomeConfig.DUEL_GAMEPLAY_NAME_X,
                    HomeConfig.DUEL_GAMEPLAY_NAME_Y,
                    HomeConfig.DUEL_GAMEPLAY_NAME_WIDTH,
                    HomeConfig.DUEL_GAMEPLAY_NAME_HEIGHT,
                    new Color(255, 238, 196, 255),
                );
                nameNode = nameLabel.node;
            }
            nameNode.active = true;
            nameNode.setPosition(HomeConfig.DUEL_GAMEPLAY_NAME_X, HomeConfig.DUEL_GAMEPLAY_NAME_Y, 0);
            (nameNode.getComponent(UITransform) || nameNode.addComponent(UITransform)).setContentSize(HomeConfig.DUEL_GAMEPLAY_NAME_WIDTH, HomeConfig.DUEL_GAMEPLAY_NAME_HEIGHT);
            const nameColor = config.disabled ? HomeConfig.DUEL_GAMEPLAY_NAME_DISABLED_COLOR : HomeConfig.DUEL_GAMEPLAY_NAME_NORMAL_COLOR;
            const outlineColor = config.disabled ? HomeConfig.DUEL_GAMEPLAY_NAME_DISABLED_OUTLINE_COLOR : HomeConfig.DUEL_GAMEPLAY_NAME_NORMAL_OUTLINE_COLOR;
            nameLabel.string = config.label;
            nameLabel.fontSize = 38;
            nameLabel.lineHeight = 44;
            nameLabel.color = new Color(nameColor.r, nameColor.g, nameColor.b, nameColor.a);
            nameLabel.enableOutline = true;
            nameLabel.outlineColor = new Color(outlineColor.r, outlineColor.g, outlineColor.b, outlineColor.a);
            nameLabel.outlineWidth = 3;
            applySimKaiFont(nameLabel);

            this.bindScaledClick(tag, () => this.handleDuelGameplayClicked(config.id));
        });
    }

    protected handleDuelBack(panel: Node): void {
        const luanshiPage = this.findNode('DuelLuanshiZhengxiongPage', panel);
        if (luanshiPage?.active) {
            const recordPage = luanshiPage.getChildByName('LuanshiRecordPage');
            if (recordPage?.active) {
                this.closeDuelLuanshiRecordPage(recordPage);
                return;
            }
            const rankPage = luanshiPage.getChildByName('LuanshiRankPage');
            if (rankPage?.active) {
                this.closeDuelLuanshiRankPage(rankPage);
                return;
            }
            this.refreshDuelLandingPage(panel);
            return;
        }

        const jianghuPage = this.findNode('DuelJianghuTaoshaPage', panel);
        if (jianghuPage?.active) {
            if (this.closeActiveDuelJianghuReservedPage(jianghuPage)) return;
            this.refreshDuelLandingPage(panel);
            return;
        }

        this.stopDuelLandingBackgroundPan(this.findNode('DuelPanelBackground', panel));
        this.closeEditorFeaturePage(panel);
    }

    protected handleDuelGameplayClicked(gameplayId: string): void {
        if (this.isDuelGameplayDisabled(gameplayId)) {
            this.showToast('\u6682\u672a\u5f00\u653e');
            return;
        }

        if (gameplayId === 'luanshi_zhengxiong') {
            this.onDuelLuanshiZhengxiongClicked();
        } else if (gameplayId === 'guxu_tanbao') {
            this.onDuelGuxuTanbaoClicked();
        } else if (gameplayId === 'jianghu_taosha') {
            this.onDuelJianghuTaoshaClicked();
        } else if (gameplayId === 'taxian_chumo') {
            this.onDuelTaxianChumoClicked();
        }
    }

    protected onDuelLuanshiZhengxiongClicked(): void {
        const panel = this.findNode('DuelPanel');
        if (!panel) {
            this.showToast('\u4e71\u4e16\u4e89\u96c4\u9875\u9762\u672a\u5c31\u7eea');
            return;
        }

        this.openDuelLuanshiZhengxiongPage(panel);
    }

    protected onDuelGuxuTanbaoClicked(): void {
        this.showToast('\u6682\u672a\u5f00\u653e');
    }

    protected onDuelJianghuTaoshaClicked(): void {
        const panel = this.findNode('DuelPanel');
        if (!panel) {
            this.showToast('\u6c5f\u6e56\u9003\u6740\u9875\u9762\u672a\u5c31\u7eea');
            return;
        }

        this.openDuelJianghuTaoshaPage(panel);
    }

    protected onDuelTaxianChumoClicked(): void {
        this.showToast('\u6682\u672a\u5f00\u653e');
    }

    private applyDuelGameplayTagState(tag: Node, disabled: boolean): void {
        const tint = disabled ? HomeConfig.DUEL_GAMEPLAY_DISABLED_TINT : HomeConfig.DUEL_GAMEPLAY_NORMAL_TINT;
        const sprite = tag.getComponent(Sprite);
        if (sprite) sprite.color = new Color(tint.r, tint.g, tint.b, tint.a);
    }

    private isDuelGameplayDisabled(gameplayId: string): boolean {
        return HomeConfig.DUEL_GAMEPLAY_TAGS.some((config) => config.id === gameplayId && config.disabled);
    }

    protected openDuelJianghuTaoshaPage(panel: Node): void {
        this.ensureInputBlocker(panel);
        this.closeDuelLuanshiZhengxiongPage(panel);
        const landingBackground = this.findNode('DuelPanelBackground', panel);
        if (landingBackground) {
            this.stopDuelLandingBackgroundPan(landingBackground);
            landingBackground.active = false;
        }

        const title = this.findNode('DuelPanelTitle', panel);
        if (title) title.active = false;

        const tagsRoot = this.findNode('DuelGameplayTags', panel);
        if (tagsRoot) {
            this.resetDuelGameplayTagScales(tagsRoot);
            tagsRoot.active = false;
        }

        let page = this.findNode('DuelJianghuTaoshaPage', panel);
        if (!page) {
            page = this.createNode('DuelJianghuTaoshaPage', panel, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT, 0, 0);
        }
        page.active = true;
        this.ensureInputBlocker(page);
        page.setPosition(0, 0, 0);
        (page.getComponent(UITransform) || page.addComponent(UITransform)).setContentSize(HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT);

        let background = page.getChildByName('JianghuTaoshaBackground');
        if (!background) {
            background = this.createSkinnedNode('JianghuTaoshaBackground', page, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT, 0, 0, HomeConfig.UI_DUEL_JIANGHU_TAOSHA_BG);
        } else {
            background.active = true;
            background.setPosition(0, 0, 0);
            this.applyUiSkinKeepingEditorSize(background, HomeConfig.UI_DUEL_JIANGHU_TAOSHA_BG, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT);
        }
        background.setSiblingIndex(0);
        this.buildDuelJianghuTopInfo(page);
        this.buildDuelJianghuRuntimeLayers(page);
        this.buildDuelJianghuRoomLabels(page);
        this.buildDuelJianghuInvestControls(page);
        this.buildDuelJianghuSideButtons(page);
        this.ensureDuelJianghuReservedPage(page, 'JianghuRecordPage', '\u6c5f\u6e56\u9003\u6740\u8bb0\u5f55');
        this.ensureDuelJianghuReservedPage(page, 'JianghuRankPage', '\u6c5f\u6e56\u9003\u6740\u6392\u884c');
        this.closeDuelJianghuReservedPages(page);
        this.playDuelJianghuBackgroundMusic();
        this.startDuelJianghuCountdown(page, true);
        void this.ensureDuelJianghuNpcCrowd(page);
        page.setSiblingIndex((panel.children.length || 1) - 1);

        const back = this.findNode('DuelBack', panel);
        if (back) {
            back.active = true;
            back.setSiblingIndex((panel.children.length || 1) - 1);
        }
    }

}
