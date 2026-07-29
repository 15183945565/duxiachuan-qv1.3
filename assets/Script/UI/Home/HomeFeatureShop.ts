import {
    Color,
    EventTouch,
    HorizontalTextAlignment,
    Label,
    Mask,
    Node,
    Sprite,
    UITransform,
    VerticalTextAlignment,
    sp,
    sys,
} from 'cc';
import { applySimKaiFont } from '../Common/UIFont';
import type {
    ShopItemData,
    ShopStoreState,
} from './HomeTypes';
import * as HomeConfig from './HomeConfig';
import { HomeViewBase } from './HomeViewBase';

/**
 * Owns the shop page, product cells, purchase flow, and local store state.
 */
export abstract class HomeFeatureShop extends HomeViewBase {
    protected createSlicedSkinnedNode(name: string, parent: Node, width: number, height: number, x: number, y: number, skinPath: string): Node {
        const node = this.createSkinnedNode(name, parent, width, height, x, y, skinPath);
        const sprite = node.getComponent(Sprite) || node.addComponent(Sprite);
        if (!sprite.spriteFrame) sprite.enabled = false;
        sprite.type = Sprite.Type.SLICED;
        return node;
    }
    protected applySlicedUiSkin(node: Node, skinPath: string, width: number, height: number): void {
        this.applyUiSkin(node, skinPath, width, height);
        const sprite = node.getComponent(Sprite) || node.addComponent(Sprite);
        if (!sprite.spriteFrame) sprite.enabled = false;
        sprite.type = Sprite.Type.SLICED;
    }
    protected openShopPanel(): void {
        this.ensureShopStore();
        this.buildShopPanel();
        if (!this.shopPanel) return;

        this.closeOtherBottomEntryPages(this.shopPanel);
        this.shopPanel.active = true;
        this.ensureInputBlocker(this.shopPanel);
        this.shopPanel.setSiblingIndex((this.shopPanel.parent?.children.length || 1) - 1);
        this.refreshShopPanel();
        this.playShopCharacterAnimation();
        this.refreshBottomEntryChrome();
    }
    protected buildShopPanel(): void {
        if (this.shopPanel) return;

        const shopPageParent = this.pageRoot || this.popupRoot || this.node;
        const existingShopPanel = shopPageParent.getChildByName('ShopPanel')
            || this.popupRoot?.getChildByName('ShopPanel')
            || this.findNode('ShopPanel');
        this.shopPanel = existingShopPanel || this.createNode('ShopPanel', shopPageParent, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT, 0, 0);
        if (this.shopPanel.parent !== shopPageParent) {
            this.shopPanel.setParent(shopPageParent);
        }
        this.shopPanel.active = false;
        this.shopPanel.setPosition(0, 0, 0);
        (this.shopPanel.getComponent(UITransform) || this.shopPanel.addComponent(UITransform)).setContentSize(HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT);
        this.shopPanel.off(Node.EventType.TOUCH_END);
        this.shopPanel.on(Node.EventType.TOUCH_END, (event: EventTouch) => {
            event.propagationStopped = true;
        }, this);
        this.createShopPageLayout();
    }
    protected prepareEditorShopPanel(): void {
        if (!this.shopPanel) return;

        this.shopPanel.active = false;
        this.shopPanel.setPosition(0, 0, 0);
        (this.shopPanel.getComponent(UITransform) || this.shopPanel.addComponent(UITransform)).setContentSize(HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT);
        this.shopPanel.off(Node.EventType.TOUCH_END);
        this.shopPanel.on(Node.EventType.TOUCH_END, (event: EventTouch) => {
            event.propagationStopped = true;
        }, this);
        this.createShopPageLayout();
    }
    protected createShopPageLayout(): void {
        if (!this.shopPanel) return;

        this.shopGridRoot = null;
        this.shopCurrencyLabel = null;
        this.shopCharacterSkeleton = null;

        const getOrCreateNode = (name: string, parent: Node, width: number, height: number, x: number, y: number): Node => {
            const existing = parent.getChildByName(name);
            if (existing) return existing;
            return this.createNode(name, parent, width, height, x, y);
        };
        const getOrCreateSkinnedNode = (name: string, parent: Node, width: number, height: number, x: number, y: number, skinPath: string, sliced = false): Node => {
            const existing = parent.getChildByName(name);
            if (existing) {
                const transform = existing.getComponent(UITransform);
                const applyWidth = transform?.contentSize.width || width;
                const applyHeight = transform?.contentSize.height || height;
                if (sliced) {
                    this.applySlicedUiSkin(existing, skinPath, applyWidth, applyHeight);
                } else {
                    this.applyUiSkin(existing, skinPath, applyWidth, applyHeight);
                }
                return existing;
            }
            return sliced
                ? this.createSlicedSkinnedNode(name, parent, width, height, x, y, skinPath)
                : this.createSkinnedNode(name, parent, width, height, x, y, skinPath);
        };

        getOrCreateSkinnedNode('ShopPageBackground', this.shopPanel, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT, 0, 0, HomeConfig.UI_SHOP_PAGE_BG).setSiblingIndex(0);

        const characterLayer = getOrCreateNode('ShopCharacterLayer', this.shopPanel, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT, 0, 0);
        const characterLayerTransform = characterLayer.getComponent(UITransform) || characterLayer.addComponent(UITransform);
        characterLayerTransform.setContentSize(HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT);
        const characterLayerMask = characterLayer.getComponent(Mask) || characterLayer.addComponent(Mask);
        characterLayerMask.type = Mask.Type.GRAPHICS_RECT;
        characterLayer.setSiblingIndex(1);
        let characterNode = characterLayer.getChildByName('ShopCharacterSpine');
        if (!characterNode) {
            characterNode = this.createNode('ShopCharacterSpine', characterLayer, 520, 620, -180, 120);
            characterNode.setScale(0.42, 0.42, 1);
        }
        this.shopCharacterSkeleton = characterNode.getComponent(sp.Skeleton) || characterNode.addComponent(sp.Skeleton);
        this.prepareSkeletonRenderer(this.shopCharacterSkeleton);

        const boardHeight = 1072;
        const boardY = -HomeConfig.VIEW_HEIGHT / 2 + boardHeight / 2;
        const board = getOrCreateNode('ShopBoard', this.shopPanel, HomeConfig.VIEW_WIDTH, boardHeight, 0, boardY);
        board.setSiblingIndex(2);
        getOrCreateSkinnedNode('ShopBoardSkin', board, HomeConfig.VIEW_WIDTH, boardHeight, 0, 0, HomeConfig.UI_FRAME_SHOP, true).setSiblingIndex(0);

        const shelfRoot = getOrCreateNode('ShopShelfRoot', this.shopPanel, HomeConfig.VIEW_WIDTH, 980, 0, -206);
        shelfRoot.setSiblingIndex(3);
        [330, 10, -310].forEach((cardY, row) => {
            getOrCreateSkinnedNode(`ShopShelf_${row + 1}`, shelfRoot, 739, 49, 0, cardY - 126, HomeConfig.UI_SHOP_SHELF_BG).setSiblingIndex(row);
        });

        this.shopGridRoot = getOrCreateNode('ShopGridRoot', this.shopPanel, HomeConfig.VIEW_WIDTH, 980, 0, -206);
        this.shopGridRoot.setSiblingIndex(4);

        const titleSign = getOrCreateSkinnedNode('ShopTitleSign', this.shopPanel, 250, 99, 242, 540, HomeConfig.UI_SHOP_TITLE_SIGN);
        titleSign.setSiblingIndex(10);

        const back = this.shopPanel.getChildByName('ShopPageBack') || this.createMailButton(
            this.shopPanel,
            'ShopPageBack',
            '',
            HomeConfig.BOTTOM_ENTRY_BACK_BUTTON_X,
            HomeConfig.BOTTOM_ENTRY_BACK_BUTTON_Y,
            HomeConfig.BOTTOM_ENTRY_BACK_BUTTON_WIDTH,
            HomeConfig.BOTTOM_ENTRY_BACK_BUTTON_HEIGHT,
            new Color(110, 72, 52, 0),
            () => this.closeShopPanel(),
            HomeConfig.UI_RANK_BACK,
        );
        const backTransform = back.getComponent(UITransform);
        this.applyUiSkin(back, HomeConfig.UI_RANK_BACK, backTransform?.contentSize.width || HomeConfig.BOTTOM_ENTRY_BACK_BUTTON_WIDTH, backTransform?.contentSize.height || HomeConfig.BOTTOM_ENTRY_BACK_BUTTON_HEIGHT);
        this.bindScaledClick(back, () => this.closeShopPanel());
        back.setSiblingIndex(30);
    }
    protected playShopCharacterAnimation(): void {
        const skeleton = this.shopCharacterSkeleton;
        if (!skeleton?.isValid) return;

        skeleton.node.active = true;
        void this.loadSkeletonAsset(HomeConfig.SHOP_CHARACTER_SKEL_PATH)
            .then((data) => {
                if (!skeleton.isValid || !this.shopPanel?.active) return;
                this.prepareSkeletonRenderer(skeleton);
                skeleton.skeletonData = data;
                try {
                    skeleton.setSkin('default');
                } catch {
                    // Some Spine exports only contain the implicit default skin.
                }
                try {
                    skeleton.clearTracks();
                    skeleton.setToSetupPose();
                    const listenerTarget = skeleton as unknown as {
                        setCompleteListener?: (listener: ((entry: unknown) => void) | null) => void;
                    };
                    listenerTarget.setCompleteListener?.(null);
                    let nextAnimation = 'stand2';
                    const playNextStand = (): void => {
                        if (!skeleton.isValid || !this.shopPanel?.active || this.shopCharacterSkeleton !== skeleton) {
                            listenerTarget.setCompleteListener?.(null);
                            return;
                        }
                        try {
                            skeleton.setAnimation(0, nextAnimation, false);
                            nextAnimation = nextAnimation === 'stand1' ? 'stand2' : 'stand1';
                        } catch (err) {
                            listenerTarget.setCompleteListener?.(null);
                            console.warn('[MainHomeView] shop character alternating animation failed', err);
                            this.playSkeletonAnimation(skeleton, ['stand2', 'stand1', 'idle'], true);
                        }
                    };
                    listenerTarget.setCompleteListener?.(() => playNextStand());
                    skeleton.setAnimation(0, 'stand1', false);
                } catch {
                    this.playSkeletonAnimation(skeleton, ['stand2', 'stand1', 'idle'], true);
                }
                skeleton.updateAnimation(0);
                skeleton.markForUpdateRenderData(true);
            })
            .catch((err) => console.warn('[MainHomeView] shop character spine load failed', err));
    }
    protected closeShopPanel(): void {
        if (!this.shopPanel) return;
    
        const listenerTarget = this.shopCharacterSkeleton as unknown as {
            setCompleteListener?: (listener: ((entry: unknown) => void) | null) => void;
        } | null;
        listenerTarget?.setCompleteListener?.(null);
        this.shopPanel.active = false;
        this.setSkeletonVisible(this.shopCharacterSkeleton, false);
        this.refreshBottomEntryChrome();
    }
    protected refreshShopPanel(): void {
        this.ensureShopStore();
        if (!this.shopGridRoot || !this.shopStore) return;
    
        this.updateShopCurrencyLabels();
        const activeItemIds = new Set(HomeConfig.SHOP_ITEMS.map((item) => `ShopItem_${item.id}`));
        this.shopGridRoot.children.forEach((child) => {
            if (child.name.startsWith('ShopItem_') && !activeItemIds.has(child.name)) {
                child.active = false;
            }
        });
    
        HomeConfig.SHOP_ITEMS.forEach((item, index) => this.createShopItemCell(item, index));
    }
    protected refreshEditorShopItems(): boolean {
        if (!this.shopGridRoot) return false;
    
        const hasEditorCells = HomeConfig.SHOP_ITEMS.some((item) => !!this.shopGridRoot?.getChildByName(`ShopItem_${item.id}`));
        if (!hasEditorCells) return false;
    
        HomeConfig.SHOP_ITEMS.forEach((item, index) => this.updateEditorShopItemCell(item, index));
        return true;
    }
    protected updateEditorShopItemCell(item: ShopItemData, index: number): void {
        if (!this.shopGridRoot) return;
    
        const cell = this.shopGridRoot.getChildByName(`ShopItem_${item.id}`);
        if (!cell) {
            this.createShopItemCell(item, index);
            return;
        }
    
        const iconFrame = cell.getChildByName('ShopItemIconFrame');
        const buyButton = cell.getChildByName('ShopBuyButton');
        const iconNode = iconFrame?.getChildByName('ShopItemIcon') || cell.getChildByName('ShopItemIcon');
        const priceNode = buyButton?.getChildByName('ShopPrice') || cell.getChildByName('ShopPrice');
    
        cell.active = true;
        this.applyEditorShopSkin(cell.getChildByName('ShopItemSkin'), HomeConfig.UI_SHOP_ITEM_BG, 132, 196);
        this.applyEditorShopSkin(iconNode, item.iconPath, 82, 82);
        this.updateEditorShopLabel(cell.getChildByName('ShopItemBadge'), '招福\n热卖', 17, 2);
        this.updateEditorShopLabel(cell.getChildByName('ShopItemName'), item.name, 24, 2);
        this.updateEditorShopLabel(priceNode, `${item.price}`, 30, 3);
    }
    protected applyEditorShopSkin(node: Node | null, skinPath: string, fallbackWidth: number, fallbackHeight: number): void {
        if (!node) return;
    
        const transform = node.getComponent(UITransform);
        this.applyUiSkin(node, skinPath, transform?.contentSize.width || fallbackWidth, transform?.contentSize.height || fallbackHeight);
    }
    protected updateEditorShopLabel(node: Node | null, text: string, lineHeight: number, outlineWidth: number): void {
        if (!node) return;
    
        const label = node.getComponent(Label);
        if (!label) return;
    
        label.string = text;
        this.applyShopLabelStyle(label, lineHeight, outlineWidth);
    }
    protected createShopItemCell(item: ShopItemData, index: number): void {
        if (!this.shopGridRoot || !this.shopStore) return;
    
        const cardWidth = 207;
        const cardHeight = 278;
        const col = index % 3;
        const row = Math.floor(index / 3);
        const x = (col - 1) * 224;
        const y = 330 - row * 320;
        let cell = this.shopGridRoot.getChildByName(`ShopItem_${item.id}`);
        const createdCell = !cell;
        if (!cell) {
            cell = this.createNode(`ShopItem_${item.id}`, this.shopGridRoot, cardWidth, cardHeight, x, y);
        }
        cell.active = true;
        const cellTransform = cell.getComponent(UITransform) || cell.addComponent(UITransform);
        if (createdCell) {
            cellTransform.setContentSize(cardWidth, cardHeight);
        }
        const skin = cell.getChildByName('ShopItemSkin')
            || this.createSlicedSkinnedNode('ShopItemSkin', cell, cardWidth, cardHeight, 0, 0, HomeConfig.UI_SHOP_ITEM_BG);
        this.applySlicedUiSkin(skin, HomeConfig.UI_SHOP_ITEM_BG, skin.getComponent(UITransform)?.contentSize.width || cardWidth, skin.getComponent(UITransform)?.contentSize.height || cardHeight);
        skin.setSiblingIndex(0);
    
        const nameNode = cell.getChildByName('ShopItemName');
        const name = nameNode?.getComponent(Label) || this.createLabel(cell, 'ShopItemName', item.name, 22, 0, 104, 176, 34, new Color(92, 55, 28, 255));
        name.string = item.name;
        name.enableOutline = true;
        name.outlineColor = new Color(255, 244, 202, 255);
        name.outlineWidth = 2;
        applySimKaiFont(name);
    
        const iconFrame = cell.getChildByName('ShopItemIconFrame')
            || this.createSkinnedNode('ShopItemIconFrame', cell, 96, 96, 0, 34, HomeConfig.UI_SHOP_ITEM_FRAME_LV7);
        this.applyUiSkin(iconFrame, HomeConfig.UI_SHOP_ITEM_FRAME_LV7, iconFrame.getComponent(UITransform)?.contentSize.width || 96, iconFrame.getComponent(UITransform)?.contentSize.height || 96);
        iconFrame.setSiblingIndex(2);
        const icon = iconFrame.getChildByName('ShopItemIcon')
            || this.createSkinnedNode('ShopItemIcon', iconFrame, 72, 72, 0, 4, item.iconPath);
        this.applyUiSkin(icon, item.iconPath, icon.getComponent(UITransform)?.contentSize.width || 72, icon.getComponent(UITransform)?.contentSize.height || 72);
        icon.setSiblingIndex(1);
        const amountNode = iconFrame.getChildByName('ShopItemAmount');
        const amount = amountNode?.getComponent(Label) || this.createLabel(iconFrame, 'ShopItemAmount', `x${item.amount}`, 18, 24, -31, 54, 24, Color.WHITE);
        amount.string = `x${item.amount}`;
        this.applyShopLabelStyle(amount, 22, 2);
    
        const buyButton = cell.getChildByName('ShopBuyButton')
            || this.createMailButton(cell, 'ShopBuyButton', '', 0, -98, 132, 44, new Color(255, 255, 255, 0), () => this.openShopBuyConfirm(item), HomeConfig.UI_SHOP_BUY_BUTTON);
        this.applyUiSkin(buyButton, HomeConfig.UI_SHOP_BUY_BUTTON, buyButton.getComponent(UITransform)?.contentSize.width || 132, buyButton.getComponent(UITransform)?.contentSize.height || 44);
        this.bindScaledClick(buyButton, () => this.openShopBuyConfirm(item));
        buyButton.setSiblingIndex(5);
        const currencyIcon = buyButton.getChildByName('ShopCurrencyIcon') || this.createShopCurrencyIcon(buyButton, -32, 1, 24);
        this.applyUiSkin(currencyIcon, HomeConfig.UI_HOME_JIFEN_ICON, currencyIcon.getComponent(UITransform)?.contentSize.width || 24, currencyIcon.getComponent(UITransform)?.contentSize.height || 24);
        currencyIcon.setSiblingIndex(2);
        const priceNode = buyButton.getChildByName('ShopPrice');
        const price = priceNode?.getComponent(Label) || this.createLabel(buyButton, 'ShopPrice', `${item.price}`, 22, 16, 1, 66, 30, Color.WHITE);
        price.string = `${item.price}`;
        this.applyShopLabelStyle(price, 28, 2);
    }
    protected getSoulCurrencyText(): string {
        return this.formatCurrency(0);
    }
    protected getPointCurrencyText(): string {
        return this.formatCurrency(0);
    }
    protected applyShopLabelStyle(label: Label, lineHeight: number, outlineWidth: number): void {
        label.color = Color.WHITE;
        label.lineHeight = lineHeight;
        label.horizontalAlign = HorizontalTextAlignment.CENTER;
        label.verticalAlign = VerticalTextAlignment.CENTER;
    
        label.enableOutline = outlineWidth > 0;
        label.outlineColor = Color.BLACK;
        label.outlineWidth = outlineWidth;
    }
    protected openShopBuyConfirm(item: ShopItemData): void {
        this.ensureShopStore();
        if (!this.shopStore) return;
    
        this.openCommerceQuantityConfirm(
            '\u63d0\u793a\u8bf4\u660e',
            item.name,
            item.price,
            99,
            '\u8d2d\u4e70',
            (quantity) => this.completeShopPurchase(item, quantity),
        );
    }
    protected openShopItemDetail(item: ShopItemData): void {
        this.ensureShopStore();
        if (!this.shopStore) return;
    
        this.openCommerceItemDetail(
            item.name,
            '\u5546\u57ce\u9053\u5177',
            `${item.desc}\n\u6bcf\u4efd\u83b7\u5f97 ${item.name} x${item.amount}\u3002`,
            `${this.shopStore.inventory[item.id] || 0}`,
            item.iconPath,
            '\u8d2d\u4e70',
            () => this.openShopBuyConfirm(item),
            HomeConfig.UI_SHOP_ITEM_FRAME_LV7,
        );
    }
    protected completeShopPurchase(item: ShopItemData, quantity: number): void {
        this.ensureShopStore();
        if (!this.shopStore) return;
    
        this.shopStore.inventory[item.id] = (this.shopStore.inventory[item.id] || 0) + item.amount * quantity;
        this.saveShopStore();
        this.refreshShopPanel();
        this.openBattleRewardPopup([
            {
                item: {
                    id: item.id,
                    category: 'item',
                    name: item.name,
                    iconPath: item.iconPath,
                    framePath: HomeConfig.UI_SHOP_ITEM_FRAME_LV7,
                },
                amount: `${item.amount * quantity}`,
            },
        ], 'popupOnly');
    }
    protected createShopCurrencyIcon(parent: Node, x: number, y: number, size: number): Node {
        const icon = this.createNode('ShopCurrencyIcon', parent, size, size, x, y);
        this.applyUiSkin(icon, HomeConfig.UI_HOME_JIFEN_ICON, size, size);
        return icon;
    }
    protected ensureShopStore(): void {
        if (this.shopStore) return;
    
        const fallbackInventory: Record<string, number> = {};
        HomeConfig.SHOP_ITEMS.forEach((item) => {
            fallbackInventory[item.id] = 0;
        });
    
        const raw = sys.localStorage.getItem(HomeConfig.SHOP_STORE_KEY);
        if (!raw) {
            this.shopStore = { currency: HomeConfig.DEFAULT_SHOP_CURRENCY, inventory: fallbackInventory };
            return;
        }
    
        try {
            const parsed = JSON.parse(raw) as Partial<ShopStoreState>;
            const inventory: Record<string, number> = { ...fallbackInventory };
            HomeConfig.SHOP_ITEMS.forEach((item) => {
                const count = parsed.inventory?.[item.id];
                inventory[item.id] = typeof count === 'number' && Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 0;
            });
            const currency = typeof parsed.currency === 'number' && Number.isFinite(parsed.currency)
                ? Math.max(0, Math.floor(parsed.currency))
                : HomeConfig.DEFAULT_SHOP_CURRENCY;
            this.shopStore = { currency, inventory };
        } catch (err) {
            console.warn('[MainHomeView] invalid shop store', err);
            this.shopStore = { currency: HomeConfig.DEFAULT_SHOP_CURRENCY, inventory: fallbackInventory };
        }
    }
    protected saveShopStore(): void {
        if (!this.shopStore) return;
    
        sys.localStorage.setItem(HomeConfig.SHOP_STORE_KEY, JSON.stringify(this.shopStore));
    }
    protected updateShopCurrencyLabels(): void {
        if (!this.shopStore) return;
    
        this.shopStore.currency = 0;
        const text = this.formatCurrency(0);
        if (this.topSoulLabel) {
            this.topSoulLabel.string = text;
        }
        if (this.shopCurrencyLabel) {
            this.shopCurrencyLabel.string = `灵石 ${text}`;
        }
        this.refreshPersistentCurrencyHud();
    }
    protected formatCurrency(value: number): string {
        if (value >= 100000000) {
            return `${Math.floor(value / 100000000)}亿`;
        }
        if (value >= 10000) {
            return `${Math.floor(value / 10000)}万`;
        }
        return `${value}`;
    }
}
