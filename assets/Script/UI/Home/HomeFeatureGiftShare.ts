import {
    Color,
    EditBox,
    HorizontalTextAlignment,
    Label,
    Node,
    Overflow,
    Sprite,
    SpriteFrame,
    Tween,
    UIOpacity,
    sp,
    tween,
    UITransform,
    Vec3,
    VerticalTextAlignment,
} from 'cc';
import { applySimKaiFont } from '../Common/UIFont';
import { bindShareTaskPanel, claimShareTaskReward, handleShareTaskAction, refreshShareTaskPanel } from './HomeShareTaskPanel';
import * as HomeConfig from './HomeConfig';
import { openGiftBillPanel } from './HomeProfileBillPanel';
import { HomeViewBase } from './HomeViewBase';

/**
 * 礼包与分享入口。
 *
 * 该功能不持有独立状态：领取记录与分享进度由 HomeViewBase 统一拥有，
 * 因此只通过原型组合安装行为，不增加 Cocos 组件或运行时继承层。
 */
export abstract class HomeFeatureGiftShare extends HomeViewBase {
    protected bindValueGiftPage(panel: Node): void {
        this.ensureInputBlocker(panel);
        this.buildValueGiftMaterialPack(panel);
        this.playValueGiftMaterialEffects(panel);
    }

    protected bindGiftPage(panel: Node): void {
        this.resetGiftTransferState();
        const editorRoot = panel.getChildByName('GiftTransferRoot');
        if (editorRoot?.isValid && this.findNode('GiftUidInput', editorRoot)) {
            this.bindGiftTransferEditorPanel(panel, editorRoot);
            return;
        }
        this.buildGiftTransferPanel(panel);
    }

    protected claimGift(panel: Node, index: number): void {
        if (this.claimedGiftIndexes.has(index)) {
            this.showToast('\u8be5\u793c\u5305\u5df2\u9886\u53d6');
            return;
        }
        this.claimedGiftIndexes.add(index);
        this.refreshGiftPage(panel);
        this.openSharedFlowPopup('RewardPopup', {
            title: '\u83b7\u5f97\u793c\u5305',
            message: `\u7b2c ${index} \u4efd\u793c\u5305\u5df2\u9886\u53d6\uff0c\u5956\u52b1\u5185\u5bb9\u7b49\u5f85\u540e\u7aef\u8fd4\u56de\u3002`,
        });
    }

    protected claimAllGifts(panel: Node): void {
        if (this.claimedGiftIndexes.size >= 4) {
            this.showToast('\u6240\u6709\u793c\u5305\u5df2\u9886\u53d6');
            return;
        }
        for (let index = 1; index <= 4; index += 1) this.claimedGiftIndexes.add(index);
        this.refreshGiftPage(panel);
        this.openSharedFlowPopup('RewardPopup', {
            title: '\u4e00\u952e\u9886\u53d6',
            message: '\u6240\u6709\u53ef\u9886\u53d6\u793c\u5305\u5df2\u9886\u53d6\uff0c\u5956\u52b1\u5185\u5bb9\u7b49\u5f85\u540e\u7aef\u8fd4\u56de\u3002',
        });
    }

    protected refreshGiftPage(panel: Node): void {
        const claimedCount = this.claimedGiftIndexes.size;
        this.setFeatureLabel(panel, 'GiftSummary', `\u53ef\u9886\u53d6\u793c\u5305 ${4 - claimedCount}    \u5df2\u9886\u53d6 ${claimedCount}`);
        for (let index = 1; index <= 4; index += 1) {
            const button = this.findNode(`GiftClaim_${index}`, panel);
            if (!button) continue;
            const claimed = this.claimedGiftIndexes.has(index);
            this.setFeatureLabel(button, `GiftClaim_${index}Label`, claimed ? '\u5df2\u9886\u53d6' : '\u9886\u53d6');
            const sprite = button.getComponent(Sprite);
            if (sprite) sprite.color = claimed ? new Color(155, 155, 155, 255) : Color.WHITE;
        }
        const claimAll = this.findNode('GiftClaimAll', panel);
        if (claimAll) {
            const allClaimed = claimedCount >= 4;
            this.setFeatureLabel(claimAll, 'GiftClaimAllLabel', allClaimed ? '\u5df2\u5168\u90e8\u9886\u53d6' : '\u4e00\u952e\u9886\u53d6');
            const sprite = claimAll.getComponent(Sprite);
            if (sprite) sprite.color = allClaimed ? new Color(155, 155, 155, 255) : Color.WHITE;
        }
    }

    protected resetGiftTransferState(): void {
        this.giftSelectedPlayer = null;
        this.giftAmount = HomeConfig.GIFT_DEFAULT_AMOUNT;
        this.giftUidEditBox = null;
        this.giftAmountEditBox = null;
    }

    protected buildGiftTransferPanel(panel: Node): void {
        this.resetGiftTransferState();
        this.ensureInputBlocker(panel);

        let root = panel.getChildByName('GiftTransferRoot');
        if (!root?.isValid) {
            root = this.createNode('GiftTransferRoot', panel, 701, 835, 0, 0);
        }
        if (!root) return;
        panel.children.forEach((child) => {
            child.active = child === root;
        });

        root.active = true;
        root.setPosition(0, 0, 0);
        root.setSiblingIndex((panel.children.length || 1) - 1);
        (root.getComponent(UITransform) || root.addComponent(UITransform)).setContentSize(701, 835);
        this.clearChildren(root);
        this.applyUiSkin(root, HomeConfig.UI_GIFT_TRANSFER_PANEL_BG, 701, 835);

        this.createSkinnedNode('GiftTransferTitleBg', root, 486, 84, 0, 330, HomeConfig.UI_CONFIRM_TITLE_BG).setSiblingIndex(1);
        const title = this.createGiftLabel(root, 'GiftTransferTitle', '\u5143\u5b9d\u8d60\u9001', 31, 0, 344, 220, 50, new Color(57, 37, 21, 255));
        title.enableOutline = false;

        const close = this.createSkinnedNode('GiftTransferClose', root, 77, 71, 292, 348, HomeConfig.UI_BTN_CLOSE);
        close.setSiblingIndex(20);
        this.bindScaledClick(close, () => this.closeEditorFeaturePage(panel));

        const slot = this.createSkinnedNode('GiftOwnedYuanbaoSlot', root, 154, 128, 0, 202, HomeConfig.UI_GIFT_YUANBAO_SLOT_BG);
        slot.setSiblingIndex(2);
        this.createSkinnedNode('GiftOwnedYuanbaoIcon', slot, 72, 67, 0, 20, HomeConfig.UI_HOME_JIFEN_ICON).setSiblingIndex(1);
        this.createGiftLabel(slot, 'GiftOwnedYuanbaoAmount', this.getGiftOwnedYuanbaoText(), 22, 0, -43, 70, 28, Color.WHITE, 2).node.setSiblingIndex(2);
        this.ensureGiftBillButton(root);

        const uidRow = this.createNode('GiftUidSearchRow', root, 600, 62, 0, 18);
        uidRow.setSiblingIndex(3);
        const uidInput = this.createSkinnedNode('GiftUidInput', uidRow, 390, 60, -76, 0, HomeConfig.UI_GIFT_TRANSLUCENT_BAR);
        this.setGiftTranslucentBarOpacity(uidInput);
        this.giftUidEditBox = this.setupGiftEditBox(uidInput, '\u70b9\u51fb\u8f93\u5165\u73a9\u5bb6\u7684UID', 12, '', true);
        const searchButton = this.createSkinnedNode('GiftUidSearchButton', uidRow, 162, 62, 200, 0, HomeConfig.UI_CONFIRM_BUTTON_BG);
        this.createGiftLabel(searchButton, 'GiftUidSearchButtonLabel', '\u641c\u7d22', 32, 0, 2, 130, 42, Color.WHITE, 3);
        this.bindScaledClick(searchButton, () => this.searchGiftTargetPlayer());

        const playerRoot = this.createNode('GiftTargetPlayerRoot', root, 360, 86, 0, -70);
        playerRoot.setSiblingIndex(4);
        this.createSkinnedNode('GiftTargetAvatarFrame', playerRoot, 78, 78, -128, 0, HomeConfig.UI_HOME_PROFILE_FRAME).setSiblingIndex(1);
        this.createSkinnedNode('GiftTargetAvatarIcon', playerRoot, 66, 66, -128, 0, HomeConfig.UI_HOME_AVATAR_MALE).setSiblingIndex(2);
        this.createGiftLabel(playerRoot, 'GiftTargetNickname', '', 24, 26, 16, 220, 34, Color.WHITE, 2, HorizontalTextAlignment.LEFT);
        this.createGiftLabel(playerRoot, 'GiftTargetUid', '', 24, 26, -16, 260, 34, Color.WHITE, 2, HorizontalTextAlignment.LEFT);

        const amountRoot = this.createNode('GiftAmountRoot', root, 440, 62, 0, -165);
        amountRoot.setSiblingIndex(5);
        const amountInput = this.createSkinnedNode('GiftAmountInput', amountRoot, 170, 45, 0, 0, HomeConfig.UI_GIFT_TRANSLUCENT_BAR);
        this.setGiftTranslucentBarOpacity(amountInput);
        const minus = this.createSkinnedNode('GiftAmountMinusButton', amountRoot, 41, 41, -118, 0, HomeConfig.UI_GIFT_MINUS_BUTTON);
        const plus = this.createSkinnedNode('GiftAmountPlusButton', amountRoot, 41, 41, 118, 0, HomeConfig.UI_GIFT_PLUS_BUTTON);
        this.giftAmountEditBox = this.setupGiftEditBox(amountInput, '', 8, `${HomeConfig.GIFT_DEFAULT_AMOUNT}`, true);
        this.bindScaledClick(minus, () => this.adjustGiftAmount(-1));
        this.bindScaledClick(plus, () => this.adjustGiftAmount(1));

        const summaryRoot = this.createNode('GiftTransferSummaryRoot', root, 310, 90, 0, -255);
        summaryRoot.setSiblingIndex(6);
        this.createGiftLabel(summaryRoot, 'GiftFinalPrefixLabel', '\u6700\u7ec8\u6d88\u8d39\uff1a', 22, -42, 20, 128, 32, new Color(122, 84, 51, 255));
        this.createGiftLabel(summaryRoot, 'GiftFinalAmountLabel', '', 22, 86, 20, 150, 32, new Color(33, 176, 76, 255));
        const feeText = `\u6bcf\u7b14\u8d60\u9001\u6536\u53d6${Math.round(HomeConfig.GIFT_FEE_RATE * 100)}%\u624b\u7eed\u8d39`;
        this.createGiftLabel(summaryRoot, 'GiftFeeHintLabel', feeText, 18, 0, -16, 300, 28, new Color(122, 84, 51, 255));

        const giftButton = this.createSkinnedNode('GiftTransferSubmitButton', root, 162, 62, 0, -342, HomeConfig.UI_CONFIRM_BUTTON_BG);
        giftButton.setSiblingIndex(7);
        this.createGiftLabel(giftButton, 'GiftTransferSubmitLabel', '\u8d60\u9001', 32, 0, 2, 132, 42, Color.WHITE, 3);
        this.bindScaledClick(giftButton, () => this.handleGiftSubmit());

        this.bindGiftEditBoxEvents();
        this.refreshGiftTargetPlayer();
        this.refreshGiftAmountSummary();
    }

    protected buildValueGiftMaterialPack(panel: Node): void {
        let root = panel.getChildByName('ValueGiftMaterialPackRoot');
        if (!root?.isValid) {
            root = this.createNode('ValueGiftMaterialPackRoot', panel, 520, 360, 0, -145);
        }
        if (!root) return;

        root.active = true;
        root.setSiblingIndex((panel.children.length || 1) - 1);

        HomeConfig.VALUE_GIFT_MATERIALS.forEach((material, index) => {
            const x = index === 0 ? -130 : 130;
            this.createValueGiftMaterialSlot(root, material, index + 1, x);
        });

        const buyButton = this.getOrCreateValueGiftSkinnedNode(
            root,
            'ValueGiftMaterialBuyButton',
            162,
            62,
            0,
            -120,
            HomeConfig.UI_VALUE_GIFT_BUY_BUTTON_BG,
        );
        buyButton.setSiblingIndex(20);
        this.getOrCreateValueGiftSkinnedNode(buyButton, 'ValueGiftMaterialBuyYuanbaoIcon', 34, 34, -34, 2, HomeConfig.UI_HOME_JIFEN_ICON).setSiblingIndex(1);
        this.getOrCreateValueGiftLabel(
            buyButton,
            'ValueGiftMaterialBuyPrice',
            `${HomeConfig.VALUE_GIFT_BUY_BUTTON_PRICE}`,
            26,
            22,
            2,
            80,
            40,
            Color.WHITE,
            2,
        ).node.setSiblingIndex(2);
        this.bindScaledClick(buyButton, () => this.openValueGiftMaterialBuyConfirm());
    }

    protected createValueGiftMaterialSlot(
        parent: Node,
        material: typeof HomeConfig.VALUE_GIFT_MATERIALS[number],
        index: number,
        x: number,
    ): void {
        const slotName = `ValueGiftMaterialSlot_${index}`;
        let slot = parent.getChildByName(slotName);
        if (!slot?.isValid) {
            slot = this.createNode(slotName, parent, 190, 220, x, 40);
        }
        slot.active = true;
        slot.setSiblingIndex(index);

        const effectName = `ValueGiftMaterialEffect_${index}`;
        let effectNode = slot.getChildByName(effectName);
        if (!effectNode?.isValid) {
            effectNode = this.createNode(effectName, slot, 230, 230, 0, 44);
            effectNode.setScale(1.28, 1.28, 1);
        }
        effectNode.active = true;
        effectNode.setSiblingIndex(0);
        effectNode.addComponent(sp.Skeleton);

        this.getOrCreateValueGiftSkinnedNode(slot, `ValueGiftMaterialIcon_${index}`, 78, 78, 0, 50, material.iconPath).setSiblingIndex(2);
        this.getOrCreateValueGiftLabel(
            slot,
            `ValueGiftMaterialAmount_${index}`,
            `x${material.amount}`,
            28,
            0,
            -46,
            160,
            44,
            Color.WHITE,
            3,
        ).node.setSiblingIndex(3);
    }

    protected getOrCreateValueGiftSkinnedNode(
        parent: Node,
        name: string,
        fallbackWidth: number,
        fallbackHeight: number,
        fallbackX: number,
        fallbackY: number,
        skinPath: string,
    ): Node {
        let node = parent.getChildByName(name);
        if (!node?.isValid) {
            node = this.createSkinnedNode(name, parent, fallbackWidth, fallbackHeight, fallbackX, fallbackY, skinPath);
        } else {
            node.active = true;
            this.applyUiSkinKeepingEditorSize(node, skinPath, fallbackWidth, fallbackHeight);
        }
        return node;
    }

    protected setGiftTranslucentBarOpacity(node: Node): void {
        const sprite = node.getComponent(Sprite) || node.addComponent(Sprite);
        const color = sprite.color;
        sprite.color = new Color(color.r, color.g, color.b, HomeConfig.GIFT_TRANSLUCENT_BAR_ALPHA);
    }

    protected getOrCreateValueGiftLabel(
        parent: Node,
        name: string,
        text: string,
        fontSize: number,
        fallbackX: number,
        fallbackY: number,
        fallbackWidth: number,
        fallbackHeight: number,
        color: Color,
        outlineWidth = 0,
        align: HorizontalTextAlignment = HorizontalTextAlignment.CENTER,
    ): Label {
        let labelNode = parent.getChildByName(name);
        if (!labelNode?.isValid) {
            return this.createGiftLabel(parent, name, text, fontSize, fallbackX, fallbackY, fallbackWidth, fallbackHeight, color, outlineWidth, align);
        }

        labelNode.active = true;
        const transform = labelNode.getComponent(UITransform) || labelNode.addComponent(UITransform);
        const label = labelNode.getComponent(Label) || labelNode.addComponent(Label);
        applySimKaiFont(label);
        label.string = text;
        label.fontSize = fontSize;
        label.lineHeight = Math.max(transform.contentSize.height || fallbackHeight, fontSize + 8);
        label.horizontalAlign = align;
        label.verticalAlign = VerticalTextAlignment.CENTER;
        label.overflow = Overflow.CLAMP;
        label.enableWrapText = false;
        label.color = color;
        label.enableOutline = outlineWidth > 0;
        label.outlineColor = new Color(62, 37, 22, 255);
        label.outlineWidth = outlineWidth;
        return label;
    }

    protected playValueGiftMaterialEffects(panel: Node): void {
        const effectNodes = HomeConfig.VALUE_GIFT_MATERIALS
            .map((_material, index) => this.findNode(`ValueGiftMaterialEffect_${index + 1}`, panel))
            .filter((node): node is Node => !!node?.isValid);
        if (effectNodes.length === 0) return;

        void this.loadSkeletonAsset(HomeConfig.VALUE_GIFT_MATERIAL_EFFECT_SKEL_PATH)
            .then((skeletonData) => {
                effectNodes.forEach((node) => this.playValueGiftMaterialEffect(node, skeletonData));
            })
            .catch((err) => {
                console.warn('[MainHomeView] value gift material effect load failed', err);
            });
    }

    protected playValueGiftMaterialEffect(node: Node, skeletonData: sp.SkeletonData): void {
        const skeleton = node.getComponent(sp.Skeleton) || node.addComponent(sp.Skeleton);
        skeleton.skeletonData = skeletonData;
        skeleton.node.active = true;
        skeleton.timeScale = 1;
        this.prepareSkeletonRenderer(skeleton);
        try {
            skeleton.clearTracks();
            skeleton.setToSetupPose();
            if (skeleton.findAnimation('idle')) {
                skeleton.setAnimation(0, 'idle', true);
            }
            skeleton.updateAnimation(0);
            skeleton.markForUpdateRenderData(true);
        } catch (err) {
            console.warn('[MainHomeView] value gift material effect play failed', err);
        }
    }

    protected openValueGiftMaterialBuyConfirm(): void {
        this.openSharedFlowPopup('ConfirmPopup', {
            title: '\u7cfb\u7edf\u63d0\u793a',
            message: `\u662f\u5426\u6d88\u8017${HomeConfig.VALUE_GIFT_CONFIRM_COST}\u5143\u5b9d\u8d2d\u4e70\u6b64\u793c\u5305`,
            onConfirm: () => this.completeValueGiftMaterialBuy(),
        });
    }

    protected completeValueGiftMaterialBuy(): void {
        HomeConfig.VALUE_GIFT_MATERIALS.forEach((material) => {
            this.addRoleInventory(material.itemId, material.amount);
        });
        this.refreshRoleInventoryViews(false);
        const panel = this.pageRoot?.getChildByName('ValueGiftPanel') || this.findNode('ValueGiftPanel');
        if (panel?.isValid) {
            this.closeEditorFeaturePage(panel);
        }
        this.refreshBottomEntryChrome();
        this.playValueGiftMaterialCollectFly();
        this.showToast('\u793c\u5305\u8d2d\u4e70\u6210\u529f');
    }

    protected playValueGiftMaterialCollectFly(): void {
        const flyLayer = this.guideRoot || this.uiHudLayer || this.uiMainLayer || this.node;
        if (!flyLayer?.isValid) return;
        const target = this.getValueGiftCollectTargetPosition(flyLayer);

        HomeConfig.VALUE_GIFT_MATERIALS.forEach((material, materialIndex) => {
            void this.loadSpriteFrameAsset(material.iconPath)
                .then((spriteFrame) => {
                    const origin = this.getValueGiftCollectCenterOrigin(materialIndex);
                    this.spawnValueGiftCollectIcons(flyLayer, origin, target, spriteFrame, materialIndex);
                })
                .catch((err) => {
                    console.warn('[MainHomeView] value gift collect icon load failed', err);
                });
        });
    }

    protected getValueGiftCollectTargetPosition(flyLayer: Node): Vec3 {
        const layerTransform = flyLayer.getComponent(UITransform) || flyLayer.addComponent(UITransform);
        const targetNode = this.findNode('TabBag', this.uiMainLayer || this.node)
            || this.findNode('BagTabBag', this.pageRoot || this.node);
        if (targetNode?.isValid) {
            return layerTransform.convertToNodeSpaceAR(targetNode.getWorldPosition(new Vec3()));
        }
        return new Vec3(
            HomeConfig.VALUE_GIFT_COLLECT_TARGET_FALLBACK_X,
            HomeConfig.VALUE_GIFT_COLLECT_TARGET_FALLBACK_Y,
            0,
        );
    }

    protected getValueGiftCollectCenterOrigin(materialIndex: number): Vec3 {
        const materialCount = Math.max(1, HomeConfig.VALUE_GIFT_MATERIALS.length);
        const offsetIndex = materialIndex - (materialCount - 1) / 2;
        return new Vec3(
            HomeConfig.VALUE_GIFT_COLLECT_CENTER_X + offsetIndex * HomeConfig.VALUE_GIFT_COLLECT_CENTER_MATERIAL_OFFSET_X,
            HomeConfig.VALUE_GIFT_COLLECT_CENTER_Y,
            0,
        );
    }

    protected spawnValueGiftCollectIcons(
        flyLayer: Node,
        origin: Vec3,
        target: Vec3,
        spriteFrame: SpriteFrame,
        materialIndex: number,
    ): void {
        for (let index = 0; index < HomeConfig.VALUE_GIFT_COLLECT_ICON_COUNT_PER_MATERIAL; index += 1) {
            const spreadX = (Math.random() * 2 - 1) * HomeConfig.VALUE_GIFT_COLLECT_START_SPREAD_X;
            const spreadY = (Math.random() * 2 - 1) * HomeConfig.VALUE_GIFT_COLLECT_START_SPREAD_Y;
            const start = new Vec3(origin.x + spreadX, origin.y + spreadY, 0);
            const control = new Vec3(
                (start.x + target.x) / 2 + (Math.random() * 2 - 1) * 90,
                Math.max(start.y, target.y) + HomeConfig.VALUE_GIFT_COLLECT_ARC_HEIGHT + Math.random() * 80,
                0,
            );
            const duration = HomeConfig.VALUE_GIFT_COLLECT_DURATION_MIN
                + Math.random() * (HomeConfig.VALUE_GIFT_COLLECT_DURATION_MAX - HomeConfig.VALUE_GIFT_COLLECT_DURATION_MIN);
            const appearDelay = (index + materialIndex * 3) * HomeConfig.VALUE_GIFT_COLLECT_APPEAR_DELAY_STEP;
            const flyDelay = appearDelay
                + HomeConfig.VALUE_GIFT_COLLECT_HOLD_DURATION
                + index * HomeConfig.VALUE_GIFT_COLLECT_DELAY_STEP;
            const icon = this.createValueGiftCollectIcon(flyLayer, spriteFrame, materialIndex, index, start);
            const opacity = icon.getComponent(UIOpacity) || icon.addComponent(UIOpacity);
            const state = { t: 0 };
            const initialScale = 0.92 + Math.random() * 0.18;
            icon.setScale(initialScale, initialScale, 1);
            opacity.opacity = 0;
            Tween.stopAllByTarget(icon);
            Tween.stopAllByTarget(opacity);
            Tween.stopAllByTarget(state);

            tween(opacity)
                .delay(appearDelay)
                .to(0.1, { opacity: 255 })
                .delay(Math.max(0.05, flyDelay - appearDelay + duration - 0.2))
                .to(0.14, { opacity: 0 })
                .start();
            tween(icon)
                .delay(flyDelay + duration)
                .call(() => {
                    if (icon.isValid) icon.destroy();
                })
                .start();
            tween(state)
                .delay(flyDelay)
                .to(duration, { t: 1 }, {
                    easing: 'quadIn',
                    onUpdate: () => {
                        if (!icon.isValid) return;
                        const oneMinus = 1 - state.t;
                        icon.setPosition(
                            oneMinus * oneMinus * start.x + 2 * oneMinus * state.t * control.x + state.t * state.t * target.x,
                            oneMinus * oneMinus * start.y + 2 * oneMinus * state.t * control.y + state.t * state.t * target.y,
                            0,
                        );
                    },
                })
                .start();
        }
    }

    protected createValueGiftCollectIcon(
        parent: Node,
        spriteFrame: SpriteFrame,
        materialIndex: number,
        index: number,
        position: Vec3,
    ): Node {
        const icon = this.createNode(
            `ValueGiftCollectFlyIcon_${materialIndex + 1}_${index + 1}`,
            parent,
            HomeConfig.VALUE_GIFT_COLLECT_ICON_SIZE,
            HomeConfig.VALUE_GIFT_COLLECT_ICON_SIZE,
            position.x,
            position.y,
        );
        const sprite = icon.addComponent(Sprite);
        sprite.type = Sprite.Type.SIMPLE;
        sprite.sizeMode = Sprite.SizeMode.CUSTOM;
        sprite.spriteFrame = spriteFrame;
        icon.setSiblingIndex((parent.children.length || 1) - 1);
        return icon;
    }

    protected createGiftLabel(
        parent: Node,
        name: string,
        text: string,
        fontSize: number,
        x: number,
        y: number,
        width: number,
        height: number,
        color: Color,
        outlineWidth = 0,
        align: HorizontalTextAlignment = HorizontalTextAlignment.CENTER,
    ): Label {
        const label = this.createLabel(parent, name, text, fontSize, x, y, width, height, color);
        label.lineHeight = Math.max(height, fontSize + 8);
        label.horizontalAlign = align;
        label.verticalAlign = VerticalTextAlignment.CENTER;
        label.overflow = Overflow.CLAMP;
        label.enableWrapText = false;
        label.enableOutline = outlineWidth > 0;
        label.outlineColor = new Color(62, 37, 22, 255);
        label.outlineWidth = outlineWidth;
        return label;
    }

    protected bindGiftTransferEditorPanel(panel: Node, root: Node): void {
        this.ensureInputBlocker(panel);
        panel.children.forEach((child) => {
            child.active = child === root;
        });
        root.active = true;

        const close = this.findNode('GiftTransferClose', root);
        if (close) this.bindScaledClick(close, () => this.closeEditorFeaturePage(panel));
        this.ensureGiftBillButton(root);

        const uidInput = this.findNode('GiftUidInput', root);
        if (uidInput) {
            this.setGiftTranslucentBarOpacity(uidInput);
            this.giftUidEditBox = this.setupGiftEditBox(uidInput, '\u70b9\u51fb\u8f93\u5165\u73a9\u5bb6\u7684UID', 12, '', true);
        }

        const searchButton = this.findNode('GiftUidSearchButton', root);
        if (searchButton) this.bindScaledClick(searchButton, () => this.searchGiftTargetPlayer());

        const amountInput = this.findNode('GiftAmountInput', root);
        if (amountInput) {
            this.setGiftTranslucentBarOpacity(amountInput);
            this.giftAmountEditBox = this.setupGiftEditBox(amountInput, '', 8, `${HomeConfig.GIFT_DEFAULT_AMOUNT}`, true);
        }

        const minus = this.findNode('GiftAmountMinusButton', root);
        if (minus) this.bindScaledClick(minus, () => this.adjustGiftAmount(-1));

        const plus = this.findNode('GiftAmountPlusButton', root);
        if (plus) this.bindScaledClick(plus, () => this.adjustGiftAmount(1));

        const giftButton = this.findNode('GiftTransferSubmitButton', root);
        if (giftButton) this.bindScaledClick(giftButton, () => this.handleGiftSubmit());

        this.setGiftTransferLabelText(root, 'GiftTransferTitle', '\u5143\u5b9d\u8d60\u9001');
        this.setGiftTransferLabelText(root, 'GiftOwnedYuanbaoAmount', this.getGiftOwnedYuanbaoText());
        this.setGiftTransferLabelText(root, 'GiftFinalPrefixLabel', '\u6700\u7ec8\u6d88\u8d39\uff1a');
        this.setGiftTransferLabelText(root, 'GiftFeeHintLabel', `\u6bcf\u7b14\u8d60\u9001\u6536\u53d6${Math.round(HomeConfig.GIFT_FEE_RATE * 100)}%\u624b\u7eed\u8d39`);

        this.bindGiftEditBoxEvents();
        this.refreshGiftTargetPlayer();
        this.refreshGiftAmountSummary();
    }

    protected setGiftTransferLabelText(root: Node, name: string, text: string): void {
        const label = this.findNode(name, root)?.getComponent(Label);
        if (label) label.string = text;
    }

    protected ensureGiftBillButton(root: Node): void {
        let button = this.findNode('GiftBillButton', root);
        if (!button?.isValid) {
            button = this.createSkinnedNode('GiftBillButton', root, 92, 93, 205, 132, HomeConfig.UI_PROFILE_BTN_BILL);
        } else {
            button.active = true;
            this.applyUiSkinKeepingEditorSize(button, HomeConfig.UI_PROFILE_BTN_BILL, 92, 93);
        }
        button.setSiblingIndex(4);
        this.bindScaledClick(button, () => openGiftBillPanel(this));
    }

    protected setupGiftEditBox(inputNode: Node, placeholder: string, maxLength: number, value: string, numeric: boolean): EditBox {
        const editNode = this.ensureGiftEditBoxTouchNode(inputNode);
        const transform = editNode.getComponent(UITransform) || editNode.addComponent(UITransform);
        const size = transform.contentSize;
        let editBox = editNode.getComponent(EditBox);
        editBox ||= editNode.addComponent(EditBox);

        const textLabel = this.getOrCreateGiftEditBoxLabel(editNode, 'TEXT_LABEL', new Color(55, 44, 34, 255), size.width, size.height);
        const placeholderLabel = this.getOrCreateGiftEditBoxLabel(editNode, 'PLACEHOLDER_LABEL', new Color(55, 44, 34, 255), size.width, size.height);
        const editBoxCompat = editBox as unknown as {
            textLabel?: Label;
            placeholderLabel?: Label;
            inputMode?: number;
            inputFlag?: number;
            returnType?: number;
            fontSize?: number;
            placeholderFontSize?: number;
            fontColor?: Color;
            placeholderFontColor?: Color;
            cursorColor?: Color;
            backgroundImage?: SpriteFrame | null;
            placeholder?: string;
            maxLength?: number;
            string?: string;
        };

        const inputMode = (EditBox as unknown as { InputMode?: { SINGLE_LINE?: number } }).InputMode?.SINGLE_LINE ?? 6;
        const inputFlag = (EditBox as unknown as { InputFlag?: { SENSITIVE?: number } }).InputFlag?.SENSITIVE ?? 1;
        const returnType = (EditBox as unknown as { KeyboardReturnType?: { DONE?: number } }).KeyboardReturnType?.DONE ?? 0;
        editBoxCompat.textLabel = textLabel;
        editBoxCompat.placeholderLabel = placeholderLabel;
        editBoxCompat.inputMode = inputMode;
        editBoxCompat.inputFlag = inputFlag;
        editBoxCompat.returnType = returnType;
        editBoxCompat.fontSize = textLabel.fontSize;
        editBoxCompat.placeholderFontSize = placeholderLabel.fontSize;
        editBoxCompat.fontColor = textLabel.color.clone();
        editBoxCompat.placeholderFontColor = placeholderLabel.color.clone();
        editBoxCompat.cursorColor = textLabel.color.clone();
        editBoxCompat.backgroundImage = null;
        editBoxCompat.placeholder = placeholder;
        editBoxCompat.maxLength = maxLength;
        editBoxCompat.string = value;
        const editBoxInternal = editBox as unknown as {
            _inputMode?: number;
            _inputFlag?: number;
            _returnType?: number;
            _fontSize?: number;
            _placeholderFontSize?: number;
            _fontColor?: Color;
            _placeholderFontColor?: Color;
            _cursorColor?: Color;
            _backgroundImage?: SpriteFrame | null;
            _placeholder?: string;
            _maxLength?: number;
            _string?: string;
        };
        editBoxInternal._inputMode = inputMode;
        editBoxInternal._inputFlag = inputFlag;
        editBoxInternal._returnType = returnType;
        editBoxInternal._fontSize = textLabel.fontSize;
        editBoxInternal._placeholderFontSize = placeholderLabel.fontSize;
        editBoxInternal._fontColor = textLabel.color.clone();
        editBoxInternal._placeholderFontColor = placeholderLabel.color.clone();
        editBoxInternal._cursorColor = textLabel.color.clone();
        editBoxInternal._backgroundImage = null;
        editBoxInternal._placeholder = placeholder;
        editBoxInternal._maxLength = maxLength;
        editBoxInternal._string = value;
        placeholderLabel.string = placeholder;
        textLabel.string = value;
        return editBox;
    }

    protected ensureGiftEditBoxTouchNode(inputNode: Node): Node {
        let editNode = inputNode.getChildByName('EditBoxTouch');
        if (!editNode?.isValid) {
            editNode = new Node('EditBoxTouch');
            inputNode.addChild(editNode);
        }

        const transform = editNode.getComponent(UITransform) || editNode.addComponent(UITransform);
        const editorSize = transform.contentSize;
        const hasEditorSize = editorSize.width > 0 && editorSize.height > 0;
        const inputSize = inputNode.getComponent(UITransform)?.contentSize;
        const width = hasEditorSize ? editorSize.width : Math.max(80, (inputSize?.width || 300) - 18);
        const height = hasEditorSize ? editorSize.height : Math.max(24, (inputSize?.height || 50) - 8);
        editNode.active = true;
        editNode.layer = inputNode.layer;
        editNode.setPosition(0, 0, 0);
        transform.setAnchorPoint(0.5, 0.5);
        transform.setContentSize(width, height);
        const emptyTouchSprite = editNode.getComponent(Sprite);
        if (emptyTouchSprite && !emptyTouchSprite.spriteFrame) {
            emptyTouchSprite.enabled = false;
        }
        return editNode;
    }

    protected getOrCreateGiftEditBoxLabel(parent: Node, name: string, color: Color, width: number, height: number): Label {
        let node = parent.getChildByName(name);
        if (!node?.isValid) {
            node = this.createNode(name, parent, width, height, 0, 0);
        }
        node.active = true;
        node.layer = parent.layer;
        node.setPosition(0, 0, 0);
        (node.getComponent(UITransform) || node.addComponent(UITransform)).setContentSize(width, height);
        const label = node.getComponent(Label) || node.addComponent(Label);
        applySimKaiFont(label);
        label.color = color;
        label.fontSize = 22;
        label.lineHeight = height;
        label.horizontalAlign = HorizontalTextAlignment.CENTER;
        label.verticalAlign = VerticalTextAlignment.CENTER;
        label.overflow = Overflow.CLAMP;
        label.enableWrapText = false;
        label.enableOutline = true;
        label.outlineColor = new Color(78, 61, 45, 210);
        label.outlineWidth = 1;
        return label;
    }

    protected bindGiftEditBoxEvents(): void {
        const changed = this.getGiftEditBoxEventType('TEXT_CHANGED');
        const uidInput = this.giftUidEditBox?.node;
        if (uidInput?.isValid) {
            uidInput.off(changed, this.onGiftUidTextChanged, this);
            uidInput.on(changed, this.onGiftUidTextChanged, this);
        }
        const amountInput = this.giftAmountEditBox?.node;
        if (amountInput?.isValid) {
            amountInput.off(changed, this.onGiftAmountTextChanged, this);
            amountInput.on(changed, this.onGiftAmountTextChanged, this);
        }
    }

    protected getGiftEditBoxEventType(name: 'TEXT_CHANGED'): string {
        const eventType = EditBox as unknown as { EventType?: Record<string, string> };
        return eventType.EventType?.[name] || 'text-changed';
    }

    protected onGiftUidTextChanged(): void {
        if (this.giftUidEditBox) {
            const raw = this.giftUidEditBox.string || '';
            const digits = raw.replace(/[^\d]/g, '');
            if (raw !== digits) {
                this.giftUidEditBox.string = digits;
            }
            this.syncGiftEditBoxVisibleText(this.giftUidEditBox);
        }
        const uid = this.getGiftUidInputValue();
        if (this.giftSelectedPlayer && this.giftSelectedPlayer.uid !== uid) {
            this.giftSelectedPlayer = null;
            this.refreshGiftTargetPlayer();
        }
    }

    protected onGiftAmountTextChanged(): void {
        if (!this.giftAmountEditBox) return;
        const raw = this.giftAmountEditBox.string || '';
        const digits = raw.replace(/[^\d]/g, '');
        if (raw !== digits) {
            this.giftAmountEditBox.string = digits;
        }
        this.syncGiftEditBoxVisibleText(this.giftAmountEditBox);
        this.giftAmount = digits.length > 0 ? Math.max(0, Math.floor(Number(digits))) : 0;
        this.refreshGiftAmountSummary();
    }

    protected syncGiftEditBoxVisibleText(editBox: EditBox): void {
        const textLabel = editBox.node.getChildByName('TEXT_LABEL')?.getComponent(Label);
        if (textLabel) {
            textLabel.string = editBox.string || '';
        }
    }

    protected searchGiftTargetPlayer(): void {
        const uid = this.getGiftUidInputValue();
        const player = HomeConfig.GIFT_PREVIEW_PLAYERS.find((item) => item.uid === uid) || null;
        this.giftSelectedPlayer = player;
        this.refreshGiftTargetPlayer();
        if (!player) {
            this.showToast('\u8bf7\u8f93\u5165\u6b63\u786e\u73a9\u5bb6UID');
        }
    }

    protected getGiftUidInputValue(): string {
        return (this.giftUidEditBox?.string || '').trim();
    }

    protected refreshGiftTargetPlayer(): void {
        const root = this.findNode('GiftTargetPlayerRoot', this.popupRoot?.getChildByName('GiftPanel') || this.node);
        if (!root?.isValid) return;

        const player = this.giftSelectedPlayer;
        root.active = !!player;
        if (!player) return;

        const avatar = root.getChildByName('GiftTargetAvatarIcon');
        if (avatar) {
            this.applyUiSkinKeepingEditorSize(avatar, player.avatarPath, 66, 66);
        }
        const nickname = root.getChildByName('GiftTargetNickname')?.getComponent(Label);
        if (nickname) nickname.string = player.nickname;
        const uid = root.getChildByName('GiftTargetUid')?.getComponent(Label);
        if (uid) uid.string = `UID: ${player.uid}`;
    }

    protected adjustGiftAmount(delta: number): void {
        const current = this.getGiftAmountValue();
        this.setGiftAmount(Math.max(1, current + delta));
    }

    protected setGiftAmount(value: number): void {
        const amount = Math.max(1, Math.floor(value));
        this.giftAmount = amount;
        if (this.giftAmountEditBox?.isValid) {
            this.giftAmountEditBox.string = `${amount}`;
            this.syncGiftEditBoxVisibleText(this.giftAmountEditBox);
        }
        this.refreshGiftAmountSummary();
    }

    protected getGiftAmountValue(): number {
        const raw = this.giftAmountEditBox?.string?.trim() || '';
        const value = Number.parseInt(raw, 10);
        return Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
    }

    protected getGiftFinalCost(amount: number): number {
        return Math.round(amount * (1 + HomeConfig.GIFT_FEE_RATE) * 100) / 100;
    }

    protected formatGiftYuanbaoAmount(amount: number): string {
        return amount.toFixed(2).replace(/\.?0+$/, '');
    }

    protected refreshGiftAmountSummary(): void {
        const panel = this.popupRoot?.getChildByName('GiftPanel') || this.findNode('GiftPanel');
        const amountLabel = panel ? this.findNode('GiftFinalAmountLabel', panel)?.getComponent(Label) : null;
        const amount = this.getGiftAmountValue();
        this.giftAmount = amount;
        if (amountLabel) {
            amountLabel.string = `${this.formatGiftYuanbaoAmount(this.getGiftFinalCost(amount))} \u5143\u5b9d`;
        }
    }

    protected handleGiftSubmit(): void {
        if (!this.giftSelectedPlayer) {
            this.showToast('\u8bf7\u8f93\u5165\u6b63\u786e\u73a9\u5bb6UID');
            return;
        }

        const amount = this.getGiftAmountValue();
        if (amount < HomeConfig.GIFT_MIN_AMOUNT) {
            this.showToast('\u8f6c\u589e\u5143\u5b9d\u6570\u4e0d\u5f97\u5c0f\u4e8e20');
            return;
        }

        const finalCost = this.formatGiftYuanbaoAmount(this.getGiftFinalCost(amount));
        this.openSharedFlowPopup('GiftTransferConfirmPopup', {
            title: '\u63d0\u793a\u4fe1\u606f',
            message: `\u662f\u5426\u786e\u8ba4\u6d88\u8d39${finalCost}\u5143\u5b9d\uff0c\u8f6c\u589e${amount}\u5143\u5b9d\u7ed9\u73a9\u5bb6${this.giftSelectedPlayer.nickname}\uff1f`,
            onConfirm: () => this.completeGiftTransfer(amount, finalCost, this.giftSelectedPlayer?.nickname || ''),
        });
    }

    protected completeGiftTransfer(amount: number, finalCost: string, nickname: string): void {
        this.showToast(`\u6d88\u8d39${finalCost}\u5143\u5b9d\uff0c\u8f6c\u589e${amount}\u5143\u5b9d\u7ed9${nickname}\u7684\u8bf7\u6c42\u5df2\u63d0\u4ea4`);
    }

    protected getGiftOwnedYuanbaoText(): string {
        const text = this.persistentSoulLabel?.string?.trim()
            || this.topSoulLabel?.string?.trim()
            || this.getSoulCurrencyText();
        return text || '0';
    }

    protected bindSharePage(panel: Node): void {
        bindShareTaskPanel(this, panel);
    }

    protected handleShareAction(panel: Node, taskId?: string): void {
        handleShareTaskAction(this, panel, taskId);
    }

    protected claimShareReward(panel: Node, taskId?: string): void {
        claimShareTaskReward(this, panel, taskId);
    }

    protected refreshSharePage(panel: Node): void {
        refreshShareTaskPanel(this, panel);
    }
}
