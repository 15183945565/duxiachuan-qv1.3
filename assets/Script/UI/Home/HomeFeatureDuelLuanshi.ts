import { Node, Tween, UITransform, Vec3, tween } from 'cc';
import * as HomeConfig from './HomeConfig';
import { HomeViewBase } from './HomeViewBase';

abstract class HomeFeatureDuelLuanshiHost extends HomeViewBase {
    protected abstract closeDuelJianghuReservedPages(page: Node): void;
    protected abstract stopDuelJianghuGameplay(page?: Node | null): void;
    protected abstract resetDuelGameplayTagScales(tagsRoot: Node): void;
    protected abstract setupDuelLuanshiPreJoinState(panel: Node, page: Node): void;
    protected abstract stopDuelLuanshiBattleState(page: Node): void;
}

export abstract class HomeFeatureDuelLuanshi extends HomeFeatureDuelLuanshiHost {
    protected startDuelLandingBackgroundPan(background: Node): void {
        Tween.stopAllByTarget(background);
        if (HomeConfig.DUEL_PAGE_BG_PAN_X <= 0) {
            background.setPosition(0, 0, 0);
            return;
        }
        background.setPosition(-HomeConfig.DUEL_PAGE_BG_PAN_X, 0, 0);
        tween(background)
            .repeatForever(
                tween<Node>()
                    .to(HomeConfig.DUEL_PAGE_BG_PAN_DURATION, { position: new Vec3(HomeConfig.DUEL_PAGE_BG_PAN_X, 0, 0) }, { easing: 'sineInOut' })
                    .to(HomeConfig.DUEL_PAGE_BG_PAN_DURATION, { position: new Vec3(-HomeConfig.DUEL_PAGE_BG_PAN_X, 0, 0) }, { easing: 'sineInOut' }),
            )
            .start();
    }

    protected stopDuelLandingBackgroundPan(background?: Node | null): void {
        if (!background?.isValid) return;
        Tween.stopAllByTarget(background);
        background.setPosition(0, 0, 0);
    }

    protected openDuelLuanshiZhengxiongPage(panel: Node): void {
        this.ensureInputBlocker(panel);
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
        const jianghuPage = this.findNode('DuelJianghuTaoshaPage', panel);
        if (jianghuPage) {
            this.closeDuelJianghuReservedPages(jianghuPage);
            this.stopDuelJianghuGameplay(jianghuPage);
            jianghuPage.active = false;
        }

        const page = this.getOrCreateDuelLuanshiNode('DuelLuanshiZhengxiongPage', panel, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT, 0, 0);
        this.ensureInputBlocker(page);
        const background = this.getOrCreateDuelLuanshiSkin(
            'LuanshiZhengxiongBackground',
            page,
            HomeConfig.DUEL_LUANSHI_ZHENGXIONG_BG_WIDTH,
            HomeConfig.DUEL_LUANSHI_ZHENGXIONG_BG_HEIGHT,
            0,
            0,
            HomeConfig.UI_DUEL_LUANSHI_ZHENGXIONG_BG,
        );
        background.setSiblingIndex(0);
        this.startDuelLuanshiZhengxiongBackgroundPan(background);
        this.ensureDuelLuanshiTopHud(page);
        this.ensureDuelLuanshiBottomDock(panel, page);
        this.setupDuelLuanshiPreJoinState(panel, page);
        page.setSiblingIndex((panel.children.length || 1) - 1);
        this.findNode('DuelBack', panel)?.setSiblingIndex((panel.children.length || 1) - 1);
    }

    protected closeDuelLuanshiZhengxiongPage(panel: Node): void {
        const page = this.findNode('DuelLuanshiZhengxiongPage', panel);
        if (!page) return;
        this.stopDuelLuanshiZhengxiongBackgroundPan(page.getChildByName('LuanshiZhengxiongBackground'));
        this.stopDuelLuanshiBattleState(page);
        const dock = page.getChildByName('LuanshiZhengxiongBottomDock');
        if (dock) Tween.stopAllByTarget(dock);
        this.restoreDuelBackForLanding(panel);
        page.active = false;
    }

    protected ensureDuelLuanshiTopHud(page: Node): void {
        const hud = this.getOrCreateDuelLuanshiTopHudEditableNode('LuanshiZhengxiongTopHud', page, HomeConfig.VIEW_WIDTH, 120, 0, HomeConfig.DUEL_LUANSHI_PK_FRAME_Y);
        this.getOrCreateDuelLuanshiTopHudEditableSkin('LuanshiZhengxiongPkFrame', hud, HomeConfig.DUEL_LUANSHI_PK_FRAME_WIDTH, HomeConfig.DUEL_LUANSHI_PK_FRAME_HEIGHT, 0, 0, HomeConfig.UI_DUEL_LUANSHI_PK_HP_FRAME).setSiblingIndex(0);
        this.getOrCreateDuelLuanshiTopHudEditableSkin('LuanshiZhengxiongWudangHpBar', hud, HomeConfig.DUEL_LUANSHI_HP_WIDTH, HomeConfig.DUEL_LUANSHI_HP_HEIGHT, HomeConfig.DUEL_LUANSHI_HP_LEFT_X, 0, HomeConfig.UI_DUEL_LUANSHI_HP_WUDANG).setSiblingIndex(1);
        this.getOrCreateDuelLuanshiTopHudEditableSkin('LuanshiZhengxiongGaibangHpBar', hud, HomeConfig.DUEL_LUANSHI_HP_WIDTH, HomeConfig.DUEL_LUANSHI_HP_HEIGHT, HomeConfig.DUEL_LUANSHI_HP_RIGHT_X, 0, HomeConfig.UI_DUEL_LUANSHI_HP_GAIBANG).setSiblingIndex(2);
        hud.setSiblingIndex(1);
    }

    protected ensureDuelLuanshiBottomDock(panel: Node, page: Node): Node {
        const dock = this.getOrCreateDuelLuanshiNode('LuanshiZhengxiongBottomDock', page, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT, 0, 0);
        this.getOrCreateDuelLuanshiSkin('LuanshiZhengxiongSkillPanel', dock, HomeConfig.DUEL_LUANSHI_SKILL_PANEL_WIDTH, HomeConfig.DUEL_LUANSHI_SKILL_PANEL_HEIGHT, 0, HomeConfig.DUEL_LUANSHI_SKILL_PANEL_Y, HomeConfig.UI_DUEL_LUANSHI_SKILL_PANEL).setSiblingIndex(0);
        const toggle = this.getOrCreateDuelLuanshiSkin('LuanshiZhengxiongToggleButton', dock, HomeConfig.DUEL_LUANSHI_TOGGLE_WIDTH, HomeConfig.DUEL_LUANSHI_TOGGLE_HEIGHT, 0, HomeConfig.DUEL_LUANSHI_TOGGLE_Y, HomeConfig.UI_DUEL_LUANSHI_TOGGLE_BUTTON);
        toggle.setSiblingIndex(1);
        this.bindScaledClick(toggle, () => this.toggleDuelLuanshiBottomDock(panel, page));
        const record = this.getOrCreateDuelLuanshiSkin('LuanshiZhengxiongRecordButton', dock, HomeConfig.DUEL_LUANSHI_SIDE_BUTTON_SIZE, HomeConfig.DUEL_LUANSHI_SIDE_BUTTON_SIZE, HomeConfig.DUEL_LUANSHI_RECORD_X, HomeConfig.DUEL_LUANSHI_SIDE_BUTTON_Y, HomeConfig.UI_DUEL_LUANSHI_RECORD_BUTTON);
        record.setSiblingIndex(2);
        this.bindScaledClick(record, () => this.showToast('\u4e71\u4e16\u4e89\u96c4\u8bb0\u5f55\u5df2\u9884\u7559'));
        dock.setSiblingIndex((page.children.length || 1) - 1);
        return dock;
    }

    protected toggleDuelLuanshiBottomDock(panel: Node, page: Node): void {
        const dock = page.getChildByName('LuanshiZhengxiongBottomDock');
        const shouldCollapse = !dock || dock.position.y > HomeConfig.DUEL_LUANSHI_BOTTOM_DOCK_COLLAPSED_Y / 2;
        this.setDuelLuanshiBottomDockCollapsed(panel, page, shouldCollapse, true);
    }

    protected setDuelLuanshiBottomDockCollapsed(panel: Node, page: Node, collapsed: boolean, animated: boolean): void {
        const dock = page.getChildByName('LuanshiZhengxiongBottomDock');
        if (!dock) return;
        const dockY = collapsed ? HomeConfig.DUEL_LUANSHI_BOTTOM_DOCK_COLLAPSED_Y : HomeConfig.DUEL_LUANSHI_BOTTOM_DOCK_EXPANDED_Y;
        this.moveDuelLuanshiNode(dock, 0, dockY, animated);
        this.setDuelLuanshiToggleCollapsed(dock, collapsed);
        const back = this.findNode('DuelBack', panel);
        if (!back) return;
        back.active = true;
        back.setSiblingIndex((panel.children.length || 1) - 1);
        this.moveDuelLuanshiNode(back, HomeConfig.DUEL_LUANSHI_BACK_X, HomeConfig.DUEL_LUANSHI_SIDE_BUTTON_Y + dockY, animated);
    }

    protected setDuelLuanshiToggleCollapsed(dock: Node, collapsed: boolean): void {
        const toggle = dock.getChildByName('LuanshiZhengxiongToggleButton');
        if (toggle) toggle.setRotationFromEuler(0, 0, collapsed ? 180 : 0);
    }

    protected moveDuelLuanshiNode(node: Node, x: number, y: number, animated: boolean): void {
        Tween.stopAllByTarget(node);
        if (!animated) {
            node.setPosition(x, y, 0);
            return;
        }
        tween(node)
            .to(HomeConfig.DUEL_LUANSHI_BOTTOM_DOCK_TWEEN_SECONDS, { position: new Vec3(x, y, 0) }, { easing: 'sineInOut' })
            .start();
    }

    protected restoreDuelBackForLanding(panel: Node): void {
        const back = this.findNode('DuelBack', panel);
        if (!back) return;
        Tween.stopAllByTarget(back);
        back.active = true;
        back.setPosition(HomeConfig.DUEL_BACK_X, HomeConfig.DUEL_BACK_Y, 0);
        back.setSiblingIndex((panel.children.length || 1) - 1);
    }

    protected startDuelLuanshiZhengxiongBackgroundPan(background: Node): void {
        Tween.stopAllByTarget(background);
        const panX = HomeConfig.DUEL_LUANSHI_ZHENGXIONG_BG_PAN_X;
        if (panX <= 0) {
            background.setPosition(0, 0, 0);
            return;
        }
        background.setPosition(-panX, 0, 0);
        tween(background)
            .repeatForever(
                tween<Node>()
                    .to(HomeConfig.DUEL_LUANSHI_ZHENGXIONG_BG_PAN_DURATION, { position: new Vec3(panX, 0, 0) }, { easing: 'sineInOut' })
                    .to(HomeConfig.DUEL_LUANSHI_ZHENGXIONG_BG_PAN_DURATION, { position: new Vec3(-panX, 0, 0) }, { easing: 'sineInOut' }),
            )
            .start();
    }

    protected stopDuelLuanshiZhengxiongBackgroundPan(background?: Node | null): void {
        if (!background?.isValid) return;
        Tween.stopAllByTarget(background);
        background.setPosition(0, 0, 0);
    }

    protected getOrCreateDuelLuanshiNode(name: string, parent: Node, width: number, height: number, x: number, y: number): Node {
        const node = parent.getChildByName(name) || this.createNode(name, parent, width, height, x, y);
        node.active = true;
        node.setPosition(x, y, 0);
        (node.getComponent(UITransform) || node.addComponent(UITransform)).setContentSize(width, height);
        return node;
    }

    protected getOrCreateDuelLuanshiTopHudEditableNode(name: string, parent: Node, width: number, height: number, x: number, y: number): Node {
        const node = parent.getChildByName(name);
        if (node) {
            node.active = true;
            return node;
        }
        return this.getOrCreateDuelLuanshiNode(name, parent, width, height, x, y);
    }

    protected getOrCreateDuelLuanshiSkin(name: string, parent: Node, width: number, height: number, x: number, y: number, skinPath: string): Node {
        const node = parent.getChildByName(name) || this.createSkinnedNode(name, parent, width, height, x, y, skinPath);
        node.active = true;
        node.setPosition(x, y, 0);
        this.applyUiSkin(node, skinPath, width, height);
        return node;
    }

    protected getOrCreateDuelLuanshiTopHudEditableSkin(name: string, parent: Node, width: number, height: number, x: number, y: number, skinPath: string): Node {
        const node = parent.getChildByName(name);
        if (node) {
            node.active = true;
            this.applyUiSkinKeepingEditorSize(node, skinPath, width, height);
            return node;
        }
        return this.getOrCreateDuelLuanshiSkin(name, parent, width, height, x, y, skinPath);
    }
}
