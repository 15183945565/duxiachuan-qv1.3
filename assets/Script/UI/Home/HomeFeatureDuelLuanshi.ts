import { EventTouch, Node, Tween, UITransform, Vec3, tween } from 'cc';
import * as HomeConfig from './HomeConfig';
import { HomeViewBase } from './HomeViewBase';

abstract class HomeFeatureDuelLuanshiHost extends HomeViewBase {
    protected abstract closeDuelJianghuReservedPages(page: Node): void;
    protected abstract stopDuelJianghuGameplay(page?: Node | null): void;
    protected abstract resetDuelGameplayTagScales(tagsRoot: Node): void;
    protected abstract setupDuelLuanshiPreJoinState(panel: Node, page: Node): void;
    protected abstract stopDuelLuanshiBattleState(page: Node): void;
    protected abstract openDuelLuanshiRecordPage(page: Node): void;
    protected abstract closeDuelLuanshiRecordPage(recordPage: Node): void;
    protected abstract openDuelLuanshiRankPage(page: Node): void;
    protected abstract closeDuelLuanshiRankPage(rankPage: Node): void;
    protected abstract playDuelLuanshiBackgroundMusic(): void;
    protected abstract stopDuelLuanshiBackgroundMusic(): void;
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
        this.playDuelLuanshiBackgroundMusic();
        const jianghuPage = this.findNode('DuelJianghuTaoshaPage', panel);
        if (jianghuPage) {
            this.closeDuelJianghuReservedPages(jianghuPage);
            this.stopDuelJianghuGameplay(jianghuPage);
            jianghuPage.active = false;
        }

        const page = this.getOrCreateDuelLuanshiNode('DuelLuanshiZhengxiongPage', panel, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT, 0, 0);
        this.ensureInputBlocker(page);
        const mainPage = this.ensureDuelLuanshiMainPageRoot(page);
        this.ensureInputBlocker(mainPage);
        mainPage.setSiblingIndex(0);
        const background = this.getOrCreateDuelLuanshiSkin(
            'LuanshiZhengxiongBackground',
            mainPage,
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
        this.stopDuelLuanshiBackgroundMusic();
        this.stopDuelLuanshiZhengxiongBackgroundPan(this.findDuelLuanshiMainNode(page, 'LuanshiZhengxiongBackground'));
        this.stopDuelLuanshiBattleState(page);
        const recordPage = page.getChildByName('LuanshiRecordPage');
        if (recordPage) this.closeDuelLuanshiRecordPage(recordPage);
        const rankPage = page.getChildByName('LuanshiRankPage');
        if (rankPage) this.closeDuelLuanshiRankPage(rankPage);
        const dock = this.findDuelLuanshiMainNode(page, 'LuanshiZhengxiongBottomDock');
        if (dock) Tween.stopAllByTarget(dock);
        this.restoreDuelBackForLanding(panel);
        page.active = false;
    }

    protected ensureDuelLuanshiTopHud(page: Node): void {
        const mainPage = this.ensureDuelLuanshiMainPageRoot(page);
        const hud = this.getOrCreateDuelLuanshiTopHudEditableNode('LuanshiZhengxiongTopHud', mainPage, HomeConfig.VIEW_WIDTH, 120, 0, HomeConfig.DUEL_LUANSHI_PK_FRAME_Y);
        this.getOrCreateDuelLuanshiTopHudEditableSkin('LuanshiZhengxiongPkFrame', hud, HomeConfig.DUEL_LUANSHI_PK_FRAME_WIDTH, HomeConfig.DUEL_LUANSHI_PK_FRAME_HEIGHT, 0, 0, HomeConfig.UI_DUEL_LUANSHI_PK_HP_FRAME).setSiblingIndex(0);
        this.getOrCreateDuelLuanshiTopHudEditableSkin('LuanshiZhengxiongWudangHpBar', hud, HomeConfig.DUEL_LUANSHI_HP_WIDTH, HomeConfig.DUEL_LUANSHI_HP_HEIGHT, HomeConfig.DUEL_LUANSHI_HP_LEFT_X, 0, HomeConfig.UI_DUEL_LUANSHI_HP_WUDANG).setSiblingIndex(1);
        this.getOrCreateDuelLuanshiTopHudEditableSkin('LuanshiZhengxiongGaibangHpBar', hud, HomeConfig.DUEL_LUANSHI_HP_WIDTH, HomeConfig.DUEL_LUANSHI_HP_HEIGHT, HomeConfig.DUEL_LUANSHI_HP_RIGHT_X, 0, HomeConfig.UI_DUEL_LUANSHI_HP_GAIBANG).setSiblingIndex(2);
        this.getOrCreateDuelLuanshiTopHudEditableSkin('LuanshiZhengxiongWudangIcon', hud, HomeConfig.DUEL_LUANSHI_CAMP_ICON_WIDTH, HomeConfig.DUEL_LUANSHI_CAMP_ICON_HEIGHT, HomeConfig.DUEL_LUANSHI_WUDANG_ICON_X, HomeConfig.DUEL_LUANSHI_CAMP_ICON_Y, HomeConfig.UI_DUEL_LUANSHI_ICON_WUDANG).setSiblingIndex(3);
        this.getOrCreateDuelLuanshiTopHudEditableSkin('LuanshiZhengxiongGaibangIcon', hud, HomeConfig.DUEL_LUANSHI_CAMP_ICON_WIDTH, HomeConfig.DUEL_LUANSHI_CAMP_ICON_HEIGHT, HomeConfig.DUEL_LUANSHI_GAIBANG_ICON_X, HomeConfig.DUEL_LUANSHI_CAMP_ICON_Y, HomeConfig.UI_DUEL_LUANSHI_ICON_GAIBANG).setSiblingIndex(4);
        hud.setSiblingIndex(1);
    }

    protected ensureDuelLuanshiBottomDock(panel: Node, page: Node): Node {
        const mainPage = this.ensureDuelLuanshiMainPageRoot(page);
        const dock = this.getOrCreateDuelLuanshiEditableNode('LuanshiZhengxiongBottomDock', mainPage, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT, 0, 0);
        this.getOrCreateDuelLuanshiEditableSkin('LuanshiZhengxiongSkillPanel', dock, HomeConfig.DUEL_LUANSHI_SKILL_PANEL_WIDTH, HomeConfig.DUEL_LUANSHI_SKILL_PANEL_HEIGHT, 0, HomeConfig.DUEL_LUANSHI_SKILL_PANEL_Y, HomeConfig.UI_DUEL_LUANSHI_SKILL_PANEL).setSiblingIndex(0);
        const toggle = this.getOrCreateDuelLuanshiEditableSkin('LuanshiZhengxiongToggleButton', dock, HomeConfig.DUEL_LUANSHI_TOGGLE_WIDTH, HomeConfig.DUEL_LUANSHI_TOGGLE_HEIGHT, 0, HomeConfig.DUEL_LUANSHI_TOGGLE_Y, HomeConfig.UI_DUEL_LUANSHI_TOGGLE_BUTTON);
        toggle.setSiblingIndex(1);
        this.bindScaledClick(toggle, () => this.toggleDuelLuanshiBottomDock(panel, page));
        const rank = this.getOrCreateDuelLuanshiEditableSkin('LuanshiZhengxiongRankButton', dock, HomeConfig.DUEL_LUANSHI_SIDE_BUTTON_SIZE, HomeConfig.DUEL_LUANSHI_SIDE_BUTTON_SIZE, HomeConfig.DUEL_LUANSHI_RANK_X, HomeConfig.DUEL_LUANSHI_RANK_Y, HomeConfig.UI_DUEL_LUANSHI_RANK_BUTTON);
        this.bindScaledClick(rank, () => this.openDuelLuanshiRankPage(page));
        const record = this.getOrCreateDuelLuanshiEditableSkin('LuanshiZhengxiongRecordButton', dock, HomeConfig.DUEL_LUANSHI_SIDE_BUTTON_SIZE, HomeConfig.DUEL_LUANSHI_SIDE_BUTTON_SIZE, HomeConfig.DUEL_LUANSHI_RECORD_X, HomeConfig.DUEL_LUANSHI_RECORD_Y, HomeConfig.UI_DUEL_LUANSHI_RECORD_BUTTON);
        this.bindScaledClick(record, () => this.openDuelLuanshiRecordPage(page));
        dock.setSiblingIndex((mainPage.children.length || 1) - 1);
        this.raiseDuelLuanshiDockButtons(dock);
        this.ensureDuelLuanshiRankHitArea(page, rank);
        this.ensureDuelLuanshiRecordHitArea(page, record);
        return dock;
    }

    protected toggleDuelLuanshiBottomDock(panel: Node, page: Node): void {
        const dock = this.findDuelLuanshiMainNode(page, 'LuanshiZhengxiongBottomDock');
        const shouldCollapse = !dock || dock.position.y > HomeConfig.DUEL_LUANSHI_BOTTOM_DOCK_COLLAPSED_Y / 2;
        this.setDuelLuanshiBottomDockCollapsed(panel, page, shouldCollapse, true);
    }

    protected setDuelLuanshiBottomDockCollapsed(panel: Node, page: Node, collapsed: boolean, animated: boolean): void {
        const dock = this.findDuelLuanshiMainNode(page, 'LuanshiZhengxiongBottomDock');
        if (!dock) return;
        const dockY = collapsed ? HomeConfig.DUEL_LUANSHI_BOTTOM_DOCK_COLLAPSED_Y : HomeConfig.DUEL_LUANSHI_BOTTOM_DOCK_EXPANDED_Y;
        this.moveDuelLuanshiNode(dock, 0, dockY, animated);
        this.setDuelLuanshiToggleCollapsed(dock, collapsed);
        const joinLayer = this.findDuelLuanshiMainNode(page, 'LuanshiZhengxiongJoinLayer');
        if (joinLayer?.active) this.moveDuelLuanshiNode(joinLayer, 0, 0, animated);
        const rankHitArea = this.ensureDuelLuanshiRankHitArea(page, dock.getChildByName('LuanshiZhengxiongRankButton'));
        this.moveDuelLuanshiNode(rankHitArea, HomeConfig.DUEL_LUANSHI_RANK_X, HomeConfig.DUEL_LUANSHI_RANK_Y + dockY, animated);
        const recordHitArea = this.ensureDuelLuanshiRecordHitArea(page, dock.getChildByName('LuanshiZhengxiongRecordButton'));
        this.moveDuelLuanshiNode(recordHitArea, HomeConfig.DUEL_LUANSHI_RECORD_X, HomeConfig.DUEL_LUANSHI_RECORD_Y + dockY, animated);
        const back = this.findNode('DuelBack', panel);
        if (!back) return;
        back.active = true;
        back.setSiblingIndex((panel.children.length || 1) - 1);
        this.moveDuelLuanshiNode(back, HomeConfig.DUEL_LUANSHI_BACK_X, HomeConfig.DUEL_LUANSHI_SIDE_BUTTON_Y + dockY, animated);
    }

    protected ensureDuelLuanshiRecordHitArea(page: Node, visualButton?: Node | null): Node {
        const mainPage = this.ensureDuelLuanshiMainPageRoot(page);
        const dock = this.findDuelLuanshiMainNode(page, 'LuanshiZhengxiongBottomDock');
        const node = this.getOrCreateDuelLuanshiNode(
            'LuanshiZhengxiongRecordHitArea',
            mainPage,
            HomeConfig.DUEL_LUANSHI_SIDE_BUTTON_SIZE,
            HomeConfig.DUEL_LUANSHI_SIDE_BUTTON_SIZE,
            HomeConfig.DUEL_LUANSHI_RECORD_X,
            HomeConfig.DUEL_LUANSHI_RECORD_Y + (dock?.position.y || 0),
        );
        node.off(Node.EventType.TOUCH_START);
        node.off(Node.EventType.TOUCH_END);
        node.off(Node.EventType.TOUCH_CANCEL);
        node.on(Node.EventType.TOUCH_START, (event: EventTouch) => {
            event.propagationStopped = true;
            this.playButtonScale(visualButton?.isValid ? visualButton : node, true);
        }, this);
        node.on(Node.EventType.TOUCH_CANCEL, (event: EventTouch) => {
            event.propagationStopped = true;
            this.playButtonScale(visualButton?.isValid ? visualButton : node, false);
        }, this);
        node.on(Node.EventType.TOUCH_END, (event: EventTouch) => {
            event.propagationStopped = true;
            this.playButtonScale(visualButton?.isValid ? visualButton : node, false);
            if (!page.getChildByName('LuanshiRecordPage')?.active) {
                this.openDuelLuanshiRecordPage(page);
            }
        }, this);
        node.setSiblingIndex((mainPage.children.length || 1) - 1);
        return node;
    }

    protected ensureDuelLuanshiRankHitArea(page: Node, visualButton?: Node | null): Node {
        const mainPage = this.ensureDuelLuanshiMainPageRoot(page);
        const dock = this.findDuelLuanshiMainNode(page, 'LuanshiZhengxiongBottomDock');
        const node = this.getOrCreateDuelLuanshiNode(
            'LuanshiZhengxiongRankHitArea',
            mainPage,
            HomeConfig.DUEL_LUANSHI_SIDE_BUTTON_SIZE,
            HomeConfig.DUEL_LUANSHI_SIDE_BUTTON_SIZE,
            HomeConfig.DUEL_LUANSHI_RANK_X,
            HomeConfig.DUEL_LUANSHI_RANK_Y + (dock?.position.y || 0),
        );
        node.off(Node.EventType.TOUCH_START);
        node.off(Node.EventType.TOUCH_END);
        node.off(Node.EventType.TOUCH_CANCEL);
        node.on(Node.EventType.TOUCH_START, (event: EventTouch) => {
            event.propagationStopped = true;
            this.playButtonScale(visualButton?.isValid ? visualButton : node, true);
        }, this);
        node.on(Node.EventType.TOUCH_CANCEL, (event: EventTouch) => {
            event.propagationStopped = true;
            this.playButtonScale(visualButton?.isValid ? visualButton : node, false);
        }, this);
        node.on(Node.EventType.TOUCH_END, (event: EventTouch) => {
            event.propagationStopped = true;
            this.playButtonScale(visualButton?.isValid ? visualButton : node, false);
            if (!page.getChildByName('LuanshiRankPage')?.active) {
                this.openDuelLuanshiRankPage(page);
            }
        }, this);
        node.setSiblingIndex((mainPage.children.length || 1) - 1);
        return node;
    }

    protected raiseDuelLuanshiDockButtons(dock: Node): void {
        dock.getChildByName('LuanshiZhengxiongRankButton')?.setSiblingIndex((dock.children.length || 1) - 1);
        dock.getChildByName('LuanshiZhengxiongRecordButton')?.setSiblingIndex((dock.children.length || 1) - 1);
        dock.getChildByName('LuanshiZhengxiongToggleButton')?.setSiblingIndex((dock.children.length || 1) - 1);
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
        node.active = !this.shouldSuppressDuelLuanshiMainNodeForRecord(parent, name);
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

    protected getOrCreateDuelLuanshiEditableNode(name: string, parent: Node, width: number, height: number, x: number, y: number): Node {
        const node = parent.getChildByName(name);
        if (node) {
            node.active = true;
            const transform = node.getComponent(UITransform) || node.addComponent(UITransform);
            if (transform.contentSize.width <= 0 || transform.contentSize.height <= 0) {
                transform.setContentSize(width, height);
            }
            return node;
        }
        return this.getOrCreateDuelLuanshiNode(name, parent, width, height, x, y);
    }

    protected getOrCreateDuelLuanshiSkin(name: string, parent: Node, width: number, height: number, x: number, y: number, skinPath: string): Node {
        const node = parent.getChildByName(name) || this.createSkinnedNode(name, parent, width, height, x, y, skinPath);
        node.active = !this.shouldSuppressDuelLuanshiMainNodeForRecord(parent, name);
        node.setPosition(x, y, 0);
        this.applyUiSkin(node, skinPath, width, height);
        return node;
    }

    protected shouldSuppressDuelLuanshiMainNodeForRecord(parent: Node, name: string): boolean {
        if (parent.name !== 'DuelLuanshiZhengxiongPage' && parent.name !== 'LuanshiZhengxiongMainPage') return false;
        if (name === 'LuanshiRecordPage') return false;
        if (name === 'LuanshiRankPage') return false;
        const page = parent.name === 'LuanshiZhengxiongMainPage' ? parent.parent : parent;
        return !!page?.getChildByName('LuanshiRecordPage')?.active
            || !!page?.getChildByName('LuanshiRankPage')?.active;
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

    protected getOrCreateDuelLuanshiEditableSkin(name: string, parent: Node, width: number, height: number, x: number, y: number, skinPath: string): Node {
        const node = parent.getChildByName(name);
        if (node) {
            node.active = true;
            this.applyUiSkinKeepingEditorSize(node, skinPath, width, height);
            return node;
        }
        return this.getOrCreateDuelLuanshiSkin(name, parent, width, height, x, y, skinPath);
    }
}
