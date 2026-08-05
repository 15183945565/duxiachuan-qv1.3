import {
    BlockInputEvents,
    EventTouch,
    Label,
    Node,
    UITransform,
} from 'cc';
import { UI_LAYER_NAMES, UI_ROOT_LAYER_ORDER } from '../Common/UIConvention';
import * as HomeConfig from './HomeConfig';
import { HomeViewBase } from './HomeViewBase';

/**
 * Owns editor-authored root layers, page mutual exclusion, input blocking, and the persistent currency HUD.
 */
export abstract class HomeFeatureHomeUIRoot extends HomeViewBase {
    protected setupUILayers(): void {
        this.gameSceneLayer = this.requireRootLayer(UI_LAYER_NAMES.gameScene);
        this.uiMainLayer = this.requireRootLayer(UI_LAYER_NAMES.hud);
        this.pageRoot = this.requireRootLayer(UI_LAYER_NAMES.page);
        this.popupRoot = this.requireRootLayer(UI_LAYER_NAMES.popup);
        this.guideRoot = this.requireRootLayer(UI_LAYER_NAMES.guide);
        this.uiHudLayer = this.requireRootLayer(UI_LAYER_NAMES.toast);
        this.refreshRootLayerOrder();
        this.setupGameSceneClip();
        this.assertDirectChildOrder(this.uiMainLayer, ['TopHud', 'LeftDock', 'RightDock', 'BottomNav']);
        this.assertDirectChildOrder(this.uiHudLayer, ['ToastBg', 'ToastLabel']);
        if (this.toastLabel?.node.parent !== this.uiHudLayer) {
            throw new Error('[MainHomeView] ToastLabel must be authored under ToastLayer');
        }
        this.setupToastBackground();
        this.setupPersistentCurrencyHud();
        this.refreshRootLayerOrder();
    }
    protected refreshRootLayerOrder(): void {
        const gameLayer = this.gameSceneLayer?.isValid
            ? this.gameSceneLayer
            : this.node.getChildByName(UI_LAYER_NAMES.gameScene);
        if (gameLayer?.isValid) {
            ['DuelJianghuMusicAudio', 'DuelJianghuEffectAudio', 'GlobalButtonClickAudio'].forEach((name) => {
                const audioNode = this.node.getChildByName(name);
                if (audioNode?.isValid) audioNode.setParent(gameLayer);
            });
        }
        this.assertDirectChildOrder(this.node, [...UI_ROOT_LAYER_ORDER]);
    }
    protected refreshBottomEntryChrome(): void {
        const topHud = this.findNode('TopHud', this.uiMainLayer || this.node);
        const bottomNav = this.findNode('BottomNav', this.uiMainLayer || this.node);
        const leftDock = this.findNode('LeftDock', this.uiMainLayer || this.node);
        const rightDock = this.findNode('RightDock', this.uiMainLayer || this.node);
    
        if (topHud) topHud.active = true;
        if (bottomNav) bottomNav.active = true;
        if (leftDock) leftDock.active = true;
        if (rightDock) rightDock.active = true;
    
        this.refreshRootLayerOrder();
        if (this.uiMainLayer) {
            this.assertDirectChildOrder(this.uiMainLayer, ['TopHud', 'LeftDock', 'RightDock', 'BottomNav']);
        }
    }
    protected closeBaseBottomEntryPages(activePanel: Node | null): void {
        if (this.rolePagePanel && this.rolePagePanel !== activePanel) {
            this.closeRoleAttrDetailPanel();
            this.rolePagePanel.active = false;
            this.setSkeletonVisible(this.rolePageSkeleton, false);
        }
        if (this.bagPanel && this.bagPanel !== activePanel) {
            this.bagPanel.active = false;
        }
        if (this.shopPanel && this.shopPanel !== activePanel) {
            this.shopPanel.active = false;
            this.setSkeletonVisible(this.shopCharacterSkeleton, false);
        }
        if (this.bottomFeaturePanel && this.bottomFeaturePanel !== activePanel) {
            this.bottomFeaturePanel.active = false;
            this.closeMagicFloorPanel();
            this.stopMagicScene();
            this.stopBeastCard();
        }
        if (this.battlePanel && this.battlePanel !== activePanel) {
            this.battlePanel.active = false;
            this.stopBattleChallengeSequence();
            this.stopBattleBackgroundAnimation();
        }
        this.hideOtherEditorFeaturePages(activePanel);
    }
    protected hideOtherEditorFeaturePages(activePanel: Node | null): void {
        this.editorFeaturePageNames.forEach((pageName) => {
            const panel = this.pageRoot?.getChildByName(pageName)
                || this.popupRoot?.getChildByName(pageName)
                || this.findNode(pageName);
            if (panel?.isValid && panel !== activePanel) {
                panel.active = false;
            }
        });
    }
    protected ensureInputBlocker(node: Node, width = HomeConfig.VIEW_WIDTH, height = HomeConfig.VIEW_HEIGHT): void {
        const transform = node.getComponent(UITransform) || node.addComponent(UITransform);
        const currentSize = transform.contentSize;
        if (currentSize.width <= 0 || currentSize.height <= 0) {
            transform.setContentSize(width, height);
        }

        const blocker = node.getComponent(BlockInputEvents) || node.addComponent(BlockInputEvents);
        blocker.enabled = true;

        [
            Node.EventType.TOUCH_START,
            Node.EventType.TOUCH_MOVE,
            Node.EventType.TOUCH_END,
            Node.EventType.TOUCH_CANCEL,
        ].forEach((eventName) => {
            node.off(eventName, this.stopTouchThrough, this);
            node.on(eventName, this.stopTouchThrough, this);
        });
    }
    protected shouldAutoBlockInput(name: string, width: number, height: number): boolean {
        if (width < HomeConfig.VIEW_WIDTH || height < HomeConfig.VIEW_HEIGHT) return false;
        if (!/(Panel|Popup|Layer|Page)$/.test(name)) return false;
        return [
            'GameSceneLayer',
            'MapLayer',
            'PageLayer',
            'PopupLayer',
            'MainRoot',
            'RolePageStrengthenPage',
        ].indexOf(name) < 0;
    }
    protected stopTouchThrough(event: EventTouch): void {
        event.propagationStopped = true;
    }
    protected hideHomeButtonTextLabels(): void {
        this.entries.forEach((entry) => {
            const button = this.findNode(entry.nodeName);
            button?.children.forEach((child) => {
                if (child.name.endsWith('Label')) {
                    child.active = false;
                }
            });
        });
    }
    protected setupPersistentCurrencyHud(): void {
        if (!this.uiMainLayer) throw new Error('[MainHomeView] HudLayer is not initialized');

        const sceneHud = this.uiMainLayer.getChildByName('TopHud');
        if (!sceneHud?.isValid) throw new Error('[MainHomeView] editor-authored HudLayer/TopHud is missing');

        sceneHud.active = true;
        this.persistentCurrencyHud = sceneHud;
        this.setupSceneCurrencyHud(sceneHud);
        this.persistentSoulLabel = sceneHud.getChildByName('LabelSoul')?.getComponent(Label) || this.persistentSoulLabel;
        this.persistentPointLabel = sceneHud.getChildByName('LabelGold')?.getComponent(Label) || this.persistentPointLabel;
        this.refreshPersistentCurrencyHud();
    }
    protected setupSceneCurrencyHud(hud: Node): void {
        const ensureSkin = (name: string, width: number, height: number, x: number, y: number, skinPath: string, siblingIndex: number): Node => {
            let child = hud.getChildByName(name);
            if (!child) {
                child = this.createSkinnedNode(name, hud, width, height, x, y, skinPath);
            } else {
                child.active = true;
                const transform = child.getComponent(UITransform) || child.addComponent(UITransform);
                const currentSize = transform.contentSize;
                const editorWidth = currentSize.width > 0 ? currentSize.width : width;
                const editorHeight = currentSize.height > 0 ? currentSize.height : height;
                this.applyUiSkin(child, skinPath, editorWidth, editorHeight);
            }
            child.setSiblingIndex(siblingIndex);
            return child;
        };
    
        const legacyTopHudBg = hud.getChildByName('MainTopHudBg');
        if (legacyTopHudBg) {
            legacyTopHudBg.active = false;
        }
        ensureSkin('SoulBar', 194, 44, -122, 595, HomeConfig.UI_HOME_RESOURCE_BAR, 1);
        ensureSkin('GoldBar', 194, 44, 178, 595, HomeConfig.UI_HOME_RESOURCE_BAR, 1);
        ensureSkin('SoulIcon', 44, 47, -214, 595, HomeConfig.UI_HOME_XIANSHI_ICON, 2);
        ensureSkin('GoldIcon', 42, 44, 96, 595, HomeConfig.UI_HOME_JIFEN_ICON, 2);
        const exchangeButton = ensureSkin('BtnCurrencyExchange', 44, 44, 151, 595, HomeConfig.UI_HOME_EXCHANGE_BUTTON, 4);
        this.bindScaledClick(exchangeButton, () => {
            void this.openPointShopFromCurrencyExchange();
        });
        const giftButton = ensureSkin('BtnCurrencyGift', 44, 44, 352, 595, HomeConfig.UI_HOME_GIFT_SEND_BUTTON, 4);
        this.bindScaledClick(giftButton, () => {
            void this.openGiftPanelFromCurrencyGift();
        });
    
        const soulLabel = hud.getChildByName('LabelSoul');
        if (soulLabel) {
            soulLabel.active = true;
            soulLabel.setSiblingIndex(3);
        }
        const goldLabel = hud.getChildByName('LabelGold');
        if (goldLabel) {
            goldLabel.active = true;
            goldLabel.setSiblingIndex(3);
        }
        const giftLabel = hud.getChildByName('LabelGift');
        if (giftLabel) {
            giftLabel.active = false;
        }
    
        [
            'MainTopHudBg',
            'AvatarIcon',
            'AvatarFrame',
            'LabelLevel',
            'NameBar',
            'LabelPlayerName',
            'SoulBar',
            'GoldBar',
            'SoulIcon',
            'GoldIcon',
            'LabelSoul',
            'LabelGold',
            'BtnCurrencyExchange',
            'BtnCurrencyGift',
            'LabelGift',
        ].forEach((name, index) => {
            hud.getChildByName(name)?.setSiblingIndex(index);
        });
    }
    protected hideOriginalTopCurrencyHud(): void {
        ['AvatarFrame', 'SoulBar', 'SoulIcon', 'LabelSoul', 'GoldBar', 'GoldIcon', 'LabelGold', 'BtnCurrencyExchange', 'BtnCurrencyGift', 'LabelGift', 'NameBar', 'LabelPlayerName'].forEach((name) => {
            const node = this.findNode(name);
            if (node) {
                node.active = false;
            }
        });
    }
    protected refreshPersistentCurrencyHud(): void {
        if (this.persistentSoulLabel?.isValid) {
            this.persistentSoulLabel.string = this.getSoulCurrencyText();
        }
        if (this.persistentPointLabel?.isValid) {
            this.persistentPointLabel.string = this.getPointCurrencyText();
        }
    }
    protected async openPointShopFromCurrencyExchange(): Promise<void> {
        try {
            await this.withTransitionLoading(async () => {
                await this.prepareHomeEntry('BtnShop');
                this.openShopPanel('points');
            });
        } catch (error) {
            console.error('[MainHomeView] open point shop failed', error);
            this.showToast('\u79ef\u5206\u5546\u57ce\u6253\u5f00\u5931\u8d25');
        }
    }
    protected async openGiftPanelFromCurrencyGift(): Promise<void> {
        try {
            await this.withTransitionLoading(async () => {
                await this.prepareHomeEntry('BtnAdGift');
                this.openEditorFeaturePage('GiftPanel');
            });
        } catch (error) {
            console.error('[MainHomeView] open gift transfer failed', error);
            this.showToast('\u8d60\u9001\u5f39\u7a97\u6253\u5f00\u5931\u8d25');
        }
    }
    protected closeOtherBottomEntryPages(activePanel: Node | null): void {
        this.closeBaseBottomEntryPages(activePanel);
    }
    protected requireRootLayer(name: string): Node {
        const layer = this.node.getChildByName(name);
        if (!layer) throw new Error(`[MainHomeView] required editor layer missing: ${name}`);
        if (!layer.getComponent(UITransform)) {
            throw new Error(`[MainHomeView] required editor layer has no UITransform: ${name}`);
        }
        return layer;
    }
    protected assertDirectChildOrder(parent: Node, expectedNames: readonly string[]): void {
        const actualNames = parent.children.map((child) => child.name);
        const matches = actualNames.length === expectedNames.length
            && expectedNames.every((name, index) => actualNames[index] === name);
        if (!matches) {
            throw new Error(
                `[MainHomeView] editor hierarchy mismatch under ${parent.name}; expected `
                + `${expectedNames.join(' > ')}, got ${actualNames.join(' > ')}`,
            );
        }
    }
}
