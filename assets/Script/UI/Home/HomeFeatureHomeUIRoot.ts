import {
    BlockInputEvents,
    Color,
    EventTouch,
    HorizontalTextAlignment,
    Label,
    Node,
    Overflow,
    UITransform,
    VerticalTextAlignment,
} from 'cc';
import { UI_LAYER_NAMES, UI_ROOT_LAYER_ORDER } from '../Common/UIConvention';
import { applySimKaiFont } from '../Common/UIFont';
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
            ['DuelJianghuMusicAudio', 'DuelJianghuEffectAudio', 'DuelLuanshiMusicAudio', 'BattleEffectAudio', 'GlobalButtonClickAudio'].forEach((name) => {
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
                if (panel.name === 'DuelPanel') {
                    this.stopDuelJianghuGameplay(this.findNode('DuelJianghuTaoshaPage', panel));
                    this.closeDuelLuanshiZhengxiongPage(panel);
                }
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
                if (entry.nodeName === 'BtnAdGift' && child.name === 'BtnAdGiftLabel') return;
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
    
        const topHudBgY = HomeConfig.VIEW_HEIGHT / 2 - hud.position.y - HomeConfig.HOME_TOP_HUD_BG_HEIGHT / 2;
        ensureSkin('MainTopHudBg', HomeConfig.HOME_TOP_HUD_BG_WIDTH, HomeConfig.HOME_TOP_HUD_BG_HEIGHT, 0, topHudBgY, HomeConfig.UI_HOME_TOP_HUD_BG, 0);
        ensureSkin(
            'ProfileInfoFrame',
            HomeConfig.HOME_PROFILE_INFO_FRAME_WIDTH,
            HomeConfig.HOME_PROFILE_INFO_FRAME_HEIGHT,
            HomeConfig.HOME_PROFILE_INFO_FRAME_X,
            HomeConfig.HOME_PROFILE_INFO_FRAME_Y,
            HomeConfig.UI_HOME_PROFILE_INFO_FRAME,
            1,
        );
        this.setupProfileInfoHud(hud);
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
            'ProfileInfoFrame',
            'AvatarIcon',
            'AvatarFrame',
            'LabelLevel',
            'LabelPlayerName',
            'LabelUid',
            'LabelCombatPower',
            'NameBar',
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
    protected setupProfileInfoHud(hud: Node): void {
        const nameBar = hud.getChildByName('NameBar');
        if (nameBar) {
            nameBar.active = false;
        }

        const avatarIcon = hud.getChildByName('AvatarIcon');
        if (avatarIcon) {
            avatarIcon.active = true;
            this.applyHomeAvatarSkin(avatarIcon, HomeConfig.HOME_PROFILE_AVATAR_SIZE, HomeConfig.HOME_PROFILE_AVATAR_SIZE);
        }

        this.ensureHomeProfileLabel(
            hud,
            'LabelLevel',
            this.getHomeProfileLevelText(),
            HomeConfig.HOME_PROFILE_LEVEL_FONT_SIZE,
            HomeConfig.HOME_PROFILE_LEVEL_LABEL_X,
            HomeConfig.HOME_PROFILE_LEVEL_LABEL_Y,
            HomeConfig.HOME_PROFILE_LEVEL_LABEL_WIDTH,
            HomeConfig.HOME_PROFILE_LEVEL_LABEL_HEIGHT,
            new Color(255, 238, 183, 255),
            2,
            HomeConfig.HOME_PROFILE_LEVEL_LINE_HEIGHT,
        );
        this.ensureHomeProfileLabel(
            hud,
            'LabelPlayerName',
            this.getHomeProfileNameText(),
            HomeConfig.HOME_PROFILE_NAME_FONT_SIZE,
            HomeConfig.HOME_PROFILE_NAME_LABEL_X,
            HomeConfig.HOME_PROFILE_NAME_LABEL_Y,
            HomeConfig.HOME_PROFILE_NAME_LABEL_WIDTH,
            HomeConfig.HOME_PROFILE_NAME_LABEL_HEIGHT,
            new Color(255, 238, 186, 255),
            2,
            HomeConfig.HOME_PROFILE_NAME_LINE_HEIGHT,
            HorizontalTextAlignment.LEFT,
        );
        this.ensureHomeProfileLabel(
            hud,
            'LabelUid',
            this.getHomeProfileUidText(),
            HomeConfig.HOME_PROFILE_UID_FONT_SIZE,
            HomeConfig.HOME_PROFILE_UID_LABEL_X,
            HomeConfig.HOME_PROFILE_UID_LABEL_Y,
            HomeConfig.HOME_PROFILE_UID_LABEL_WIDTH,
            HomeConfig.HOME_PROFILE_UID_LABEL_HEIGHT,
            new Color(232, 220, 190, 255),
            2,
            HomeConfig.HOME_PROFILE_UID_LINE_HEIGHT,
        );
        this.ensureHomeProfileLabel(
            hud,
            'LabelCombatPower',
            this.getHomeProfileCombatPowerText(),
            HomeConfig.HOME_PROFILE_POWER_FONT_SIZE,
            HomeConfig.HOME_PROFILE_POWER_LABEL_X,
            HomeConfig.HOME_PROFILE_POWER_LABEL_Y,
            HomeConfig.HOME_PROFILE_POWER_LABEL_WIDTH,
            HomeConfig.HOME_PROFILE_POWER_LABEL_HEIGHT,
            new Color(255, 238, 92, 255),
            2,
            HomeConfig.HOME_PROFILE_POWER_LINE_HEIGHT,
        );
        this.refreshHomeProfileCombatPowerDigits(hud);
    }
    protected ensureHomeProfileLabel(
        hud: Node,
        name: string,
        text: string,
        fontSize: number,
        x: number,
        y: number,
        width: number,
        height: number,
        color: Color,
        outlineWidth: number,
        lineHeight = fontSize + 6,
        horizontalAlign = HorizontalTextAlignment.CENTER,
    ): Label {
        let node = hud.getChildByName(name);
        let label: Label;
        let useEditorAuthoredStyle = false;
        if (!node) {
            label = this.createLabel(hud, name, text, fontSize, x, y, width, height, color);
            node = label.node;
        } else {
            node.active = true;
            const existingLabel = node.getComponent(Label);
            useEditorAuthoredStyle = !!existingLabel;
            label = existingLabel || node.addComponent(Label);
            if (!existingLabel) {
                node.setPosition(x, y, 0);
                (node.getComponent(UITransform) || node.addComponent(UITransform)).setContentSize(width, height);
            }
        }

        applySimKaiFont(label);
        label.string = text;
        if (useEditorAuthoredStyle) {
            return label;
        }
        label.fontSize = fontSize;
        label.lineHeight = lineHeight;
        label.color = color;
        label.horizontalAlign = horizontalAlign;
        label.verticalAlign = VerticalTextAlignment.CENTER;
        label.overflow = Overflow.SHRINK;
        label.enableWrapText = false;
        label.enableOutline = outlineWidth > 0;
        label.outlineColor = new Color(42, 25, 12, 255);
        label.outlineWidth = outlineWidth;
        return label;
    }
    protected refreshProfileInfoHud(): void {
        const hud = this.persistentCurrencyHud;
        if (!hud?.isValid) return;

        [
            ['LabelLevel', this.getHomeProfileLevelText()],
            ['LabelPlayerName', this.getHomeProfileNameText()],
            ['LabelUid', this.getHomeProfileUidText()],
        ].forEach(([name, text]) => {
            const label = hud.getChildByName(name)?.getComponent(Label);
            if (label?.isValid) {
                label.string = text;
            }
        });
        this.refreshHomeProfileCombatPowerDigits(hud);
    }
    protected getHomeProfileNameText(): string {
        return this.profile.name || HomeConfig.DEFAULT_NAME;
    }
    protected getHomeProfileUidText(): string {
        return `UID:${HomeConfig.DEFAULT_UID}`;
    }
    protected getHomeProfileLevelText(): string {
        return `Lv.${this.getRoleCurrentLevel()}`;
    }
    protected getHomeProfileCombatPowerText(): string {
        return `${Math.max(0, Math.floor(this.getRoleTotalPower()))}`;
    }
    protected refreshHomeProfileCombatPowerDigits(hud: Node): void {
        const root = hud.getChildByName('LabelCombatPower');
        if (!root?.isValid) return;

        const label = root.getComponent(Label);
        if (label?.isValid) {
            label.string = this.getHomeProfileCombatPowerText();
            label.enabled = false;
        }

        root.children.slice().forEach((child) => {
            if (child.name.startsWith('HomeCombatPowerDigit_')) {
                child.destroy();
            }
        });

        const digits = this.getHomeProfileCombatPowerText().split('');
        const widths = digits.map((digit) => this.getRolePowerDigitWidth(digit));
        const spacing = HomeConfig.ROLE_PAGE_POWER_DIGIT_SPACING;
        const totalWidth = widths.reduce((sum, width) => sum + width, 0) + Math.max(0, digits.length - 1) * spacing;
        let cursorX = -totalWidth / 2;

        digits.forEach((digit, index) => {
            const width = widths[index];
            const digitNode = this.createSkinnedNode(
                `HomeCombatPowerDigit_${index}_${digit}`,
                root,
                width,
                HomeConfig.ROLE_PAGE_POWER_DIGIT_HEIGHT,
                cursorX + width / 2,
                0,
                `${HomeConfig.UI_ROLE_POWER_DIGIT_ROOT}_${digit}`,
            );
            digitNode.setSiblingIndex(index);
            cursorX += width + spacing;
        });
    }
    protected hideOriginalTopCurrencyHud(): void {
        ['AvatarFrame', 'ProfileInfoFrame', 'SoulBar', 'SoulIcon', 'LabelSoul', 'GoldBar', 'GoldIcon', 'LabelGold', 'BtnCurrencyExchange', 'BtnCurrencyGift', 'LabelGift', 'NameBar', 'LabelPlayerName', 'LabelUid', 'LabelCombatPower'].forEach((name) => {
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
        this.refreshProfileInfoHud();
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
                await this.prepareHomeEntry('BtnCurrencyGift');
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
