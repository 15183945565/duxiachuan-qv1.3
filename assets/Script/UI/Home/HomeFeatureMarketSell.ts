import {
    Color,
    EventTouch,
    Graphics,
    HorizontalTextAlignment,
    Label,
    Mask,
    Node,
    Overflow,
    Tween,
    UIOpacity,
    UITransform,
    Vec3,
    VerticalTextAlignment,
    tween,
} from 'cc';
import {
    BAG_ILLUSTRATION_CATALOG,
    type BagIllustrationCatalogItem,
} from './BagIllustrationCatalog.generated';
import * as HomeConfig from './HomeConfig';
import type {
    MarketFilterOption,
    MarketMode,
    MarketSellListingData,
} from './HomeTypes';
import { HomeViewBase } from './HomeViewBase';

abstract class HomeFeatureMarketSellHost extends HomeViewBase {
    protected abstract setLabelOutline(label: Label, color: Color, width: number): void;
}

/**
 * Owns market sale selection, draft pricing, validation, and listing publication.
 */
export abstract class HomeFeatureMarketSell extends HomeFeatureMarketSellHost {
    protected buildMarketSellListingPage(): void {
        if (!this.marketViewport?.isValid) return;

        const postedListings = this.getCurrentMarketPostedListings();
        const listingCount = postedListings.length;
        const hasAddSlot = listingCount < HomeConfig.MARKET_SELL_MAX_LISTINGS;
        const rowCount = listingCount + (hasAddSlot ? 1 : 0);
        const extraTopGap = hasAddSlot && listingCount > 0 ? HomeConfig.MARKET_SELL_ADD_TO_LISTING_EXTRA_GAP : 0;
        const viewportHeight = this.marketViewport.getComponent(UITransform)?.contentSize.height || HomeConfig.MARKET_SELL_VIEWPORT_HEIGHT;
        const contentHeight = Math.max(viewportHeight, Math.max(rowCount, 1) * HomeConfig.MARKET_ROW_GAP + extraTopGap + 16);
        const historyContent = this.marketViewport.getChildByName('MarketHistoryContent');
        if (historyContent?.isValid) historyContent.active = false;
        this.marketContent = this.getOrCreateEditorNode('MarketListContent', this.marketViewport, HomeConfig.MARKET_VIEWPORT_WIDTH, contentHeight, 0, 0);
        this.marketContent.active = true;
        (this.marketContent.getComponent(UITransform) || this.marketContent.addComponent(UITransform)).setContentSize(HomeConfig.MARKET_VIEWPORT_WIDTH, contentHeight);
        this.marketContent.children
            .filter((child) => /^MarketListing_\d+$/.test(child.name)
                || /^MarketSellListing_\d+$/.test(child.name)
                || child.name === 'MarketSellAddSlot'
                || child.name === 'MarketListEmpty')
            .forEach((child) => {
                child.active = false;
            });

        const addSlotTemplate = this.marketContent.getChildByName('MarketSellAddSlot');
        const defaultStartY = viewportHeight / 2 - HomeConfig.MARKET_ROW_HEIGHT / 2 - 10;
        const startY = hasAddSlot && addSlotTemplate?.isValid ? addSlotTemplate.position.y : defaultStartY;
        const listingStartIndex = hasAddSlot ? 1 : 0;
        if (hasAddSlot) {
            this.createMarketSellAddRow(this.marketContent, startY);
        }
        postedListings.forEach((item, index) => {
            this.createMarketSellPostedRow(this.marketContent!, item, index, startY - (index + listingStartIndex) * HomeConfig.MARKET_ROW_GAP - extraTopGap);
        });

        const maxScrollY = Math.max(0, contentHeight - viewportHeight);
        this.clampMarketListScroll(this.marketContent, maxScrollY);
        this.bindBagGridScroll(this.marketViewport, this.marketContent, maxScrollY);
        this.bindBagGridScroll(this.marketContent, this.marketContent, maxScrollY);
    }
    protected createMarketSellAddRow(parent: Node, y: number): void {
        const existingRow = parent.getChildByName('MarketSellAddSlot');
        const row = this.getOrCreateEditorSkinnedNode('MarketSellAddSlot', parent, HomeConfig.MARKET_ROW_WIDTH, HomeConfig.MARKET_ROW_HEIGHT, 0, y, HomeConfig.UI_MARKET_ITEM_ROW);
        row.active = true;
        if (!existingRow?.isValid) {
            row.setPosition(0, y, 0);
            (row.getComponent(UITransform) || row.addComponent(UITransform)).setContentSize(HomeConfig.MARKET_ROW_WIDTH, HomeConfig.MARKET_ROW_HEIGHT);
        }
        row.children
            .filter((child) => child.name !== 'MarketSellAddButton')
            .forEach((child) => {
                child.active = false;
            });

        const existingAdd = row.getChildByName('MarketSellAddButton');
        const add = this.getOrCreateEditorSkinnedNode('MarketSellAddButton', row, HomeConfig.MARKET_SELL_ADD_BUTTON_SIZE, HomeConfig.MARKET_SELL_ADD_BUTTON_SIZE, 0, -12, HomeConfig.UI_MARKET_SELL_ADD);
        add.active = true;
        if (!existingAdd?.isValid) {
            add.setPosition(0, -12, 0);
            (add.getComponent(UITransform) || add.addComponent(UITransform)).setContentSize(HomeConfig.MARKET_SELL_ADD_BUTTON_SIZE, HomeConfig.MARKET_SELL_ADD_BUTTON_SIZE);
        }
        add.setSiblingIndex(20);
        this.bindScaledClick(add, () => this.openMarketSellItemSelectPopup());
        this.bindScaledClick(row, () => this.openMarketSellItemSelectPopup());
    }
    protected createMarketSellPostedRow(parent: Node, item: MarketSellListingData, index: number, y: number): void {
        const row = this.getOrCreateEditorSkinnedNode(`MarketSellListing_${index + 1}`, parent, HomeConfig.MARKET_ROW_WIDTH, HomeConfig.MARKET_ROW_HEIGHT, 0, y, HomeConfig.UI_MARKET_ITEM_ROW);
        row.active = true;
        row.setPosition(0, y, 0);
        (row.getComponent(UITransform) || row.addComponent(UITransform)).setContentSize(HomeConfig.MARKET_ROW_WIDTH, HomeConfig.MARKET_ROW_HEIGHT);
        const layoutTemplate = this.getMarketListingLayoutTemplate(parent, row);

        const itemFrame = this.getOrCreateEditorSkinnedNode('MarketItemFrame', row, 102, 102, -252, -21, item.framePath);
        itemFrame.active = true;
        this.applyMarketListingChildLayout(row, layoutTemplate, 'MarketItemFrame', -252, -21, 102, 102);
        itemFrame.setSiblingIndex(1);
        const itemIcon = this.getOrCreateEditorSkinnedNode('MarketItemIcon', row, 76, 76, -252, -21, item.iconPath);
        itemIcon.active = true;
        this.applyMarketListingChildLayout(row, layoutTemplate, 'MarketItemIcon', -252, -21, 76, 76);
        itemIcon.setSiblingIndex(2);
        const amount = this.getOrCreateEditorLabel(row, 'MarketItemAmount', `${item.amount}`, 18, -228, -55, 36, 24, new Color(68, 48, 34, 255));
        amount.node.active = true;
        this.applyMarketListingChildLayout(row, layoutTemplate, 'MarketItemAmount', -228, -55, 36, 24);
        amount.horizontalAlign = HorizontalTextAlignment.RIGHT;
        this.applyMarketTextStyle(amount, 1);
        amount.node.setSiblingIndex(3);

        const name = this.getOrCreateEditorLabel(row, 'MarketItemName', item.name, 25, 0, 54, 360, 36, new Color(68, 48, 34, 255));
        name.node.active = true;
        this.applyMarketListingChildLayout(row, layoutTemplate, 'MarketItemName', 0, 54, 360, 36);
        name.horizontalAlign = HorizontalTextAlignment.CENTER;
        this.applyMarketTextStyle(name, 1);
        const totalPrice = this.getMarketTotalPrice(item.unitPrice, item.amount);
        const unit = this.getOrCreateEditorLabel(row, 'MarketUnitPrice', `\u5355\u4ef7\uff1a${this.formatMarketPrice(item.unitPrice)} \u5143\u5b9d`, 20, -58.902, 7, 260, 32, new Color(92, 65, 43, 255));
        unit.node.active = true;
        this.applyMarketListingChildLayout(row, layoutTemplate, 'MarketUnitPrice', -58.902, 7, 260, 32);
        unit.horizontalAlign = HorizontalTextAlignment.LEFT;
        this.applyMarketTextStyle(unit, 1);
        const total = this.getOrCreateEditorLabel(row, 'MarketTotalPrice', `\u603b\u4ef7\uff1a${this.formatMarketPrice(totalPrice)} \u5143\u5b9d`, 20, -58.902, -31, 260, 32, new Color(92, 65, 43, 255));
        total.node.active = true;
        this.applyMarketListingChildLayout(row, layoutTemplate, 'MarketTotalPrice', -58.902, -31, 260, 32);
        total.horizontalAlign = HorizontalTextAlignment.LEFT;
        this.applyMarketTextStyle(total, 1);

        const action = this.getOrCreateEditorSkinnedNode('MarketActionButton', row, 136, 54, 226.714, -21, HomeConfig.UI_MARKET_BUTTON);
        action.active = true;
        this.applyMarketListingChildLayout(row, layoutTemplate, 'MarketActionButton', 226.714, -21, 136, 54);
        action.setSiblingIndex(6);
        const doneLabel = this.getMarketListingMode(item) === 'request' ? '\u5df2\u53d1\u5e03' : '\u5df2\u4e0a\u67b6';
        const actionLabel = this.getOrCreateEditorLabel(action, 'MarketActionLabel', doneLabel, 24, 0, 1, 118, 42, new Color(91, 53, 25, 255));
        actionLabel.node.active = true;
        this.applyMarketTextStyle(actionLabel, 1);
        this.bindScaledClick(action, () => this.showToast(this.getMarketListingMode(item) === 'request' ? '\u8be5\u6c42\u8d2d\u5355\u5df2\u53d1\u5e03' : '\u8be5\u7269\u54c1\u5df2\u4e0a\u67b6'));
        this.bindScaledClick(row, () => this.openMarketSellListingDetail(item));
    }
    protected getMarketSellPostedItemCount(itemId: string, mode: MarketMode = 'trade'): number {
        return this.marketSellListings
            .filter((item) => item.itemId === itemId && this.getMarketListingMode(item) === mode)
            .reduce((sum, item) => sum + item.amount, 0);
    }
    protected getAvailableMarketSellItemCount(item: BagIllustrationCatalogItem): number {
        return Math.max(0, this.getBagItemCount(item) - this.getMarketSellPostedItemCount(item.id));
    }
    protected getMarketSellCandidateItems(): BagIllustrationCatalogItem[] {
        const marketItemIds = new Set<string>(HomeConfig.MARKET_CATALOG_ITEM_IDS);
        if (this.isMarketRequestPostPage()) {
            return this.sortBagCatalogItems(BAG_ILLUSTRATION_CATALOG.filter((item) => marketItemIds.has(item.id)));
        }
        return this.sortBagCatalogItems(BAG_ILLUSTRATION_CATALOG.filter((item) => {
            if (!marketItemIds.has(item.id)) return false;
            return this.getAvailableMarketSellItemCount(item) > 0;
        }));
    }
    protected openMarketSellItemSelectPopup(): void {
        if (!this.marketPanel?.isValid) return;
        if (this.getCurrentMarketPostedListings().length >= HomeConfig.MARKET_SELL_MAX_LISTINGS) {
            this.showToast(this.getMarketPostLimitText());
            return;
        }
        this.closeMarketFilterDropdown();
        this.closeMarketSellConfirmPopup();

        const items = this.getMarketSellCandidateItems();
        const popup = this.getOrCreateEditorNode('MarketSellSelectPopup', this.marketPanel, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT, 0, 0);
        popup.active = true;
        popup.setSiblingIndex(44);
        this.ensureInputBlocker(popup);

        const dim = this.getOrCreateEditorNode('MarketSellSelectDim', popup, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT, 0, 0);
        dim.active = true;
        dim.getComponent(Graphics)?.clear();
        dim.setSiblingIndex(0);
        dim.off(Node.EventType.TOUCH_END);
        dim.on(Node.EventType.TOUCH_END, (event: EventTouch) => {
            event.propagationStopped = true;
            this.closeMarketSellItemSelectPopup();
        }, this);

        const board = this.getOrCreateEditorSkinnedNode(
            'MarketSellSelectBoard',
            popup,
            HomeConfig.ROLE_EQUIP_REPLACE_DRAWER_WIDTH,
            HomeConfig.ROLE_EQUIP_REPLACE_DRAWER_HEIGHT,
            0,
            HomeConfig.ROLE_EQUIP_REPLACE_DRAWER_Y,
            HomeConfig.UI_MARKET_SELL_SELECT_DRAWER_BG,
        );
        board.active = true;
        board.setSiblingIndex(1);
        board.off(Node.EventType.TOUCH_START);
        board.off(Node.EventType.TOUCH_END);
        board.on(Node.EventType.TOUCH_START, (event: EventTouch) => {
            event.propagationStopped = true;
        }, this);
        board.on(Node.EventType.TOUCH_END, (event: EventTouch) => {
            event.propagationStopped = true;
        }, this);

        const title = this.getOrCreateEditorLabel(
            board,
            'MarketSellSelectTitle',
            this.isMarketRequestPostPage() ? '\u9009\u62e9\u6c42\u8d2d\u7269\u54c1' : '\u9009\u62e9\u4e0a\u67b6\u7269\u54c1',
            32,
            0,
            HomeConfig.ROLE_EQUIP_REPLACE_DRAWER_TITLE_Y,
            300,
            54,
            new Color(126, 74, 36, 255),
        );
        title.node.active = true;
        this.setLabelOutline(title, new Color(255, 245, 215, 255), 2);

        const close = board.getChildByName('MarketSellSelectClose');
        if (close) {
            close.active = false;
            close.off(Node.EventType.TOUCH_END);
            close.removeFromParent();
        }

        const viewport = this.getOrCreateEditorNode(
            'MarketSellSelectViewport',
            board,
            HomeConfig.ROLE_EQUIP_REPLACE_DRAWER_VIEWPORT_WIDTH,
            HomeConfig.ROLE_EQUIP_REPLACE_DRAWER_VIEWPORT_HEIGHT,
            0,
            HomeConfig.ROLE_EQUIP_REPLACE_DRAWER_VIEWPORT_Y,
        );
        viewport.active = true;
        viewport.setPosition(0, HomeConfig.ROLE_EQUIP_REPLACE_DRAWER_VIEWPORT_Y, 0);
        viewport.setSiblingIndex(5);
        const mask = viewport.getComponent(Mask) || viewport.addComponent(Mask);
        mask.type = Mask.Type.GRAPHICS_RECT;
        const cols = HomeConfig.ROLE_EQUIP_REPLACE_DRAWER_GRID_COLS;
        const rowCount = Math.max(1, Math.ceil(items.length / cols));
        const rowStep = HomeConfig.ROLE_EQUIP_REPLACE_DRAWER_GRID_GAP_Y;
        const contentHeight = Math.max(HomeConfig.ROLE_EQUIP_REPLACE_DRAWER_VIEWPORT_HEIGHT, rowCount * rowStep + 110);
        const content = this.getOrCreateEditorNode('MarketSellSelectContent', viewport, HomeConfig.ROLE_EQUIP_REPLACE_DRAWER_VIEWPORT_WIDTH, contentHeight, 0, 0);
        content.active = true;
        content.setPosition(0, 0, 0);
        (content.getComponent(UITransform) || content.addComponent(UITransform)).setContentSize(HomeConfig.ROLE_EQUIP_REPLACE_DRAWER_VIEWPORT_WIDTH, contentHeight);
        content.children
            .filter((child) => /^MarketSellSelectItem_\d+$/.test(child.name) || child.name === 'MarketSellSelectEmpty')
            .forEach((child) => {
                child.active = false;
            });
        const startX = HomeConfig.ROLE_EQUIP_REPLACE_DRAWER_GRID_START_X;
        const startY = HomeConfig.ROLE_EQUIP_REPLACE_DRAWER_VIEWPORT_HEIGHT / 2 - 78;

        if (items.length === 0) {
            const empty = this.getOrCreateEditorLabel(content, 'MarketSellSelectEmpty', this.isMarketRequestPostPage() ? '\u6682\u65e0\u53ef\u6c42\u8d2d\u7269\u54c1' : '\u6682\u65e0\u53ef\u4e0a\u67b6\u7269\u54c1', 26, 0, 120, 360, 58, new Color(92, 65, 43, 255));
            empty.node.active = true;
            empty.node.setPosition(0, 120, 0);
            this.setLabelOutline(empty, new Color(255, 247, 224, 255), 1);
        } else {
            items.forEach((item, index) => {
                const col = index % cols;
                const row = Math.floor(index / cols);
                this.createMarketSellSelectItem(
                    content,
                    item,
                    index,
                    startX + col * HomeConfig.ROLE_EQUIP_REPLACE_DRAWER_GRID_GAP_X,
                    startY - row * rowStep,
                );
            });
        }

        const maxScrollY = Math.max(0, contentHeight - HomeConfig.ROLE_EQUIP_REPLACE_DRAWER_VIEWPORT_HEIGHT);
        this.bindBagGridScroll(viewport, content, maxScrollY);
        this.bindBagGridScroll(content, content, maxScrollY);
        const popupOpacity = popup.getComponent(UIOpacity) || popup.addComponent(UIOpacity);
        popupOpacity.opacity = 255;
        void this.slideMarketSellSelectDrawer(
            board,
            HomeConfig.ROLE_EQUIP_REPLACE_DRAWER_HIDDEN_Y,
            HomeConfig.ROLE_EQUIP_REPLACE_DRAWER_Y,
            0.22,
            'sineOut',
        );
    }
    protected createMarketSellSelectItem(parent: Node, item: BagIllustrationCatalogItem, index: number, x: number, y: number): void {
        const slot = this.getOrCreateEditorNode(`MarketSellSelectItem_${index + 1}`, parent, 128, 138, x, y);
        slot.active = true;
        slot.setPosition(x, y, 0);
        (slot.getComponent(UITransform) || slot.addComponent(UITransform)).setContentSize(128, 138);
        slot.setSiblingIndex(index + 1);
        const frame = this.getOrCreateEditorSkinnedNode('MarketSellSelectFrame', slot, 112, 112, 0, 12, item.framePath);
        frame.active = true;
        frame.setPosition(0, 12, 0);
        (frame.getComponent(UITransform) || frame.addComponent(UITransform)).setContentSize(112, 112);
        frame.setSiblingIndex(0);
        const icon = this.getOrCreateEditorSkinnedNode('MarketSellSelectIcon', slot, 88, 88, 0, 14, item.iconPath);
        icon.active = true;
        icon.setPosition(0, 14, 0);
        (icon.getComponent(UITransform) || icon.addComponent(UITransform)).setContentSize(88, 88);
        icon.setSiblingIndex(1);
        const count = this.getAvailableMarketSellItemCount(item);
        const countLabel = this.getOrCreateEditorLabel(slot, 'MarketSellSelectCount', `${count}`, 20, 34, -42, 48, 26, Color.WHITE);
        countLabel.node.active = !this.isMarketRequestPostPage();
        countLabel.node.setPosition(34, -42, 0);
        (countLabel.node.getComponent(UITransform) || countLabel.node.addComponent(UITransform)).setContentSize(48, 26);
        countLabel.horizontalAlign = HorizontalTextAlignment.RIGHT;
        this.setLabelOutline(countLabel, Color.BLACK, 2);
        countLabel.node.setSiblingIndex(2);
        const name = this.getOrCreateEditorLabel(slot, 'MarketSellSelectName', this.getCatalogDisplayName(item), 18, 0, -60, 126, 30, new Color(92, 65, 43, 255));
        name.node.active = true;
        name.node.setPosition(0, -60, 0);
        (name.node.getComponent(UITransform) || name.node.addComponent(UITransform)).setContentSize(126, 30);
        name.overflow = Overflow.SHRINK;
        this.setLabelOutline(name, new Color(255, 247, 224, 255), 1);
        name.node.setSiblingIndex(3);
        this.bindGridItemTap(slot, () => this.handleMarketSellItemSelected(item));
    }
    protected handleMarketSellItemSelected(item: BagIllustrationCatalogItem): void {
        this.closeMarketSellItemSelectPopup(false);
        this.marketSellSelectedItem = item;
        this.openMarketSellConfirmPopup(item);
    }
    protected async slideMarketSellSelectDrawer(board: Node, fromY: number, toY: number, duration = 0.18, easing: 'sineOut' | 'sineIn' = 'sineOut'): Promise<void> {
        board.active = true;
        board.setPosition(0, fromY, 0);
        Tween.stopAllByTarget(board);
        await new Promise<void>((resolve) => {
            tween(board)
                .to(duration, { position: new Vec3(0, toY, 0) }, { easing })
                .call(() => resolve())
                .start();
        });
    }
    protected closeMarketSellItemSelectPopup(fade = true): void {
        const popup = this.marketPanel?.getChildByName('MarketSellSelectPopup');
        if (!popup?.isValid || !popup.active) return;
        const board = popup.getChildByName('MarketSellSelectBoard');
        if (!fade) {
            if (board?.isValid) Tween.stopAllByTarget(board);
            popup.active = false;
            return;
        }
        if (!board?.isValid) {
            popup.active = false;
            return;
        }
        void this.slideMarketSellSelectDrawer(
            board,
            board.position.y,
            HomeConfig.ROLE_EQUIP_REPLACE_DRAWER_HIDDEN_Y,
            0.16,
            'sineIn',
        )
            .then(() => {
                popup.active = false;
            });
    }
    protected getMarketSellPriceRange(item: BagIllustrationCatalogItem): { basePrice: number; minPrice: number; maxPrice: number } {
        const marketItem = HomeConfig.MARKET_ITEMS.find((listing) => listing.itemId === item.id);
        const basePrice = marketItem?.unitPrice || HomeConfig.MARKET_ITEM_PRICES[0];
        const minPrice = Math.max(0.01, Math.round(basePrice * 0.8 * 100) / 100);
        const maxPrice = Math.max(minPrice, Math.round(basePrice * 1.2 * 100) / 100);
        return { basePrice, minPrice, maxPrice };
    }
    protected findMarketFilterGroupTitle(itemId: string): { primaryTitle: string; secondaryTitle: string; tertiaryTitle: string } {
        const catalogItem = BAG_ILLUSTRATION_CATALOG.find((item) => item.id === itemId);
        const primaryTitle = catalogItem ? HomeConfig.MARKET_CATEGORY_TITLES[catalogItem.category] : '\u7269\u54c1';
        const secondaryOptions: MarketFilterOption[] = [];
        Object.keys(HomeConfig.MARKET_SECONDARY_FILTER_OPTIONS).forEach((key) => {
            secondaryOptions.push(...HomeConfig.MARKET_SECONDARY_FILTER_OPTIONS[key]);
        });
        const secondaryOption = secondaryOptions.find((option) => option.key !== 'all' && !!option.itemIds && option.itemIds.indexOf(itemId) >= 0);
        const tertiaryOption = secondaryOption
            ? (HomeConfig.MARKET_TERTIARY_FILTER_OPTIONS[secondaryOption.key] || []).find(
                (option) => option.key === itemId || (!!option.itemIds && option.itemIds.indexOf(itemId) >= 0),
            )
            : null;
        return {
            primaryTitle,
            secondaryTitle: secondaryOption?.title || primaryTitle,
            tertiaryTitle: tertiaryOption?.title || catalogItem?.name || '\u672a\u77e5\u7269\u54c1',
        };
    }
    protected getMarketSellCategoryPath(item: BagIllustrationCatalogItem): string {
        const titles = this.findMarketFilterGroupTitle(item.id);
        return `${titles.primaryTitle}-${titles.secondaryTitle}-${titles.tertiaryTitle}`;
    }
    protected roundMarketSellPrice(value: number): number {
        return Math.round(value * 100) / 100;
    }
    protected getMarketSellFinalIncome(quantity = this.marketSellDraftQuantity, unitPrice = this.marketSellDraftUnitPrice): number {
        return this.roundMarketSellPrice(quantity * unitPrice * (1 - HomeConfig.MARKET_SELL_FEE_RATE));
    }
    protected getMarketPostTotalCost(quantity = this.marketSellDraftQuantity, unitPrice = this.marketSellDraftUnitPrice): number {
        return this.roundMarketSellPrice(quantity * unitPrice);
    }
    protected getMarketPostMaxQuantity(item: BagIllustrationCatalogItem): number {
        return this.isMarketRequestPostPage() ? HomeConfig.MARKET_REQUEST_MAX_QUANTITY : Math.max(1, this.getAvailableMarketSellItemCount(item));
    }
    protected setMarketSellDraftQuantity(quantity: number, item: BagIllustrationCatalogItem): boolean {
        const maxQuantity = this.getMarketPostMaxQuantity(item);
        const nextQuantity = this.clamp(Math.floor(quantity), 1, maxQuantity);
        const changed = nextQuantity !== this.marketSellDraftQuantity;
        this.marketSellDraftQuantity = nextQuantity;
        this.refreshMarketSellConfirmDraftLabels();
        return changed;
    }
    protected setMarketSellDraftUnitPrice(unitPrice: number): boolean {
        const nextUnitPrice = this.roundMarketSellPrice(this.clamp(
            unitPrice,
            this.marketSellDraftMinPrice,
            this.marketSellDraftMaxPrice,
        ));
        const changed = nextUnitPrice !== this.marketSellDraftUnitPrice;
        this.marketSellDraftUnitPrice = nextUnitPrice;
        this.refreshMarketSellConfirmDraftLabels();
        return changed;
    }
    protected adjustMarketSellDraftQuantity(delta: number, item: BagIllustrationCatalogItem): void {
        const maxQuantity = this.getMarketPostMaxQuantity(item);
        if (delta > 0 && this.marketSellDraftQuantity >= maxQuantity) {
            this.showToast(this.isMarketRequestPostPage() ? `\u6c42\u8d2d\u6570\u91cf\u6700\u591a${maxQuantity}\u4e2a` : `\u8be5\u7269\u54c1\u6700\u591a\u53ef\u4e0a\u67b6${maxQuantity}\u4e2a`);
            this.refreshMarketSellConfirmDraftLabels();
            return;
        }
        if (delta < 0 && this.marketSellDraftQuantity <= 1) {
            this.showToast('\u6570\u91cf\u4e0d\u80fd\u4f4e\u4e8e1');
            this.refreshMarketSellConfirmDraftLabels();
            return;
        }
        this.setMarketSellDraftQuantity(this.marketSellDraftQuantity + delta, item);
    }
    protected adjustMarketSellDraftUnitPrice(delta: number): void {
        const before = this.marketSellDraftUnitPrice;
        const changed = this.setMarketSellDraftUnitPrice(before + delta);
        if (!changed) {
            const priceType = this.isMarketRequestPostPage() ? '\u6c42\u8d2d\u4ef7\u683c' : '\u51fa\u552e\u4ef7\u683c';
            this.showToast(delta > 0 ? `\u5df2\u8fbe\u5230\u6700\u9ad8${priceType}` : `\u5df2\u8fbe\u5230\u6700\u4f4e${priceType}`);
        }
    }
    protected createMarketSellSettingRow(board: Node, key: string, title: string, y: number, onMinus: () => void, onPlus: () => void): void {
        const titleLabel = this.getOrCreateEditorLabel(board, `MarketSellConfirm${key}Title`, title, 21, -190, y, 82, 32, new Color(92, 65, 43, 255));
        titleLabel.node.active = true;
        titleLabel.horizontalAlign = HorizontalTextAlignment.RIGHT;
        this.setLabelOutline(titleLabel, new Color(255, 247, 224, 255), 1);

        const minus = this.getOrCreateEditorSkinnedNode(`MarketSellConfirm${key}Minus`, board, HomeConfig.MARKET_SELL_STEPPER_BUTTON_SIZE, HomeConfig.MARKET_SELL_STEPPER_BUTTON_SIZE, -112, y, HomeConfig.UI_MARKET_SELL_PRICE_MINUS);
        minus.active = true;
        minus.setSiblingIndex(6);
        this.bindScaledClick(minus, onMinus);

        const valueBg = this.getOrCreateEditorSkinnedNode(`MarketSellConfirm${key}Bg`, board, HomeConfig.MARKET_SELL_SETTING_BG_WIDTH, HomeConfig.MARKET_SELL_SETTING_BG_HEIGHT, 0, y, HomeConfig.UI_MARKET_SELL_QUANTITY_BG);
        valueBg.active = true;
        valueBg.setSiblingIndex(5);

        const value = this.getOrCreateEditorLabel(board, `MarketSellConfirm${key}Value`, '', 20, 0, y, 150, 28, new Color(255, 247, 224, 255));
        value.node.active = true;
        value.horizontalAlign = HorizontalTextAlignment.CENTER;
        this.setLabelOutline(value, new Color(50, 42, 36, 255), 2);
        value.node.setSiblingIndex(7);

        const plus = this.getOrCreateEditorSkinnedNode(`MarketSellConfirm${key}Plus`, board, HomeConfig.MARKET_SELL_STEPPER_BUTTON_SIZE, HomeConfig.MARKET_SELL_STEPPER_BUTTON_SIZE, 112, y, HomeConfig.UI_MARKET_SELL_PRICE_PLUS);
        plus.active = true;
        plus.setSiblingIndex(8);
        this.bindScaledClick(plus, onPlus);
    }
    protected refreshMarketSellConfirmDraftLabels(): void {
        const popup = this.marketPanel?.getChildByName('MarketSellConfirmPopup');
        const board = popup?.getChildByName('MarketSellConfirmBoard');
        if (!board?.isValid) return;

        const quantity = board.getChildByName('MarketSellConfirmQuantityValue')?.getComponent(Label);
        if (quantity) {
            quantity.string = `${this.marketSellDraftQuantity}`;
        }
        const unitPrice = board.getChildByName('MarketSellConfirmUnitPriceValue')?.getComponent(Label);
        if (unitPrice) {
            unitPrice.string = `${this.formatMarketPrice(this.marketSellDraftUnitPrice)} \u5143\u5b9d`;
        }
        const income = board.getChildByName('MarketSellConfirmIncomeValue')?.getComponent(Label);
        if (income) {
            const value = this.isMarketRequestPostPage() ? this.getMarketPostTotalCost() : this.getMarketSellFinalIncome();
            income.string = `${this.formatMarketPrice(value)} \u5143\u5b9d`;
        }
    }
    protected openMarketSellConfirmPopup(item: BagIllustrationCatalogItem): void {
        if (!this.marketPanel?.isValid) return;
        if (this.getCurrentMarketPostedListings().length >= HomeConfig.MARKET_SELL_MAX_LISTINGS) {
            this.showToast(this.getMarketPostLimitText());
            return;
        }
        if (!this.isMarketRequestPostPage() && this.getAvailableMarketSellItemCount(item) <= 0) {
            this.showToast('\u8be5\u7269\u54c1\u6570\u91cf\u4e0d\u8db3');
            return;
        }
        const priceRange = this.getMarketSellPriceRange(item);
        const categoryPath = this.getMarketSellCategoryPath(item);
        this.marketSellDraftMinPrice = priceRange.minPrice;
        this.marketSellDraftMaxPrice = priceRange.maxPrice;
        this.marketSellDraftUnitPrice = priceRange.minPrice;
        this.marketSellDraftQuantity = 1;
        const popup = this.getOrCreateEditorNode('MarketSellConfirmPopup', this.marketPanel, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT, 0, 0);
        popup.active = true;
        popup.setSiblingIndex(45);
        this.ensureInputBlocker(popup);

        const dim = this.getOrCreateEditorNode('MarketSellConfirmDim', popup, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT, 0, 0);
        dim.active = true;
        if (!dim.getComponent(Graphics)) {
            this.drawRect(dim, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT, new Color(0, 0, 0, 120));
        }
        dim.setSiblingIndex(0);

        const board = this.getOrCreateEditorSkinnedNode('MarketSellConfirmBoard', popup, 725, 505, 0, 0, HomeConfig.UI_MARKET_DETAIL_POPUP_BG);
        board.active = true;
        board.setSiblingIndex(1);
        const titleSkin = this.getOrCreateEditorSkinnedNode('MarketSellConfirmTitleSkin', board, 486, 84, 0, 182, HomeConfig.UI_MARKET_DETAIL_TITLE_BG);
        titleSkin.active = true;
        titleSkin.setSiblingIndex(1);
        const title = this.getOrCreateEditorLabel(board, 'MarketSellConfirmTitle', this.getCatalogDisplayName(item), 30, 0, 185, 300, 52, new Color(126, 74, 36, 255));
        title.node.active = true;
        title.overflow = Overflow.SHRINK;
        this.setLabelOutline(title, new Color(255, 245, 215, 255), 2);
        title.node.setSiblingIndex(2);

        const frame = this.getOrCreateEditorSkinnedNode('MarketSellConfirmFrame', board, 90, 90, 0, 106, item.framePath);
        frame.active = true;
        frame.setSiblingIndex(3);
        const icon = this.getOrCreateEditorSkinnedNode('MarketSellConfirmIcon', board, 68, 68, 0, 108, item.iconPath);
        icon.active = true;
        icon.setSiblingIndex(4);

        const oldMinLabel = board.getChildByName('MarketSellConfirmMinPrice');
        if (oldMinLabel?.isValid) oldMinLabel.active = false;
        const oldMaxLabel = board.getChildByName('MarketSellConfirmMaxPrice');
        if (oldMaxLabel?.isValid) oldMaxLabel.active = false;

        const typeLabel = this.getOrCreateEditorLabel(board, 'MarketSellConfirmType', `\u7c7b\u578b\uff1a${categoryPath}`, 21, 0, 50, 600, 30, new Color(92, 65, 43, 255));
        const rangeLabel = this.getOrCreateEditorLabel(board, 'MarketSellConfirmPriceRange', `${this.getMarketPostPriceRangePrefix()}\uff1a${this.formatMarketPrice(priceRange.minPrice)}-${this.formatMarketPrice(priceRange.maxPrice)} \u5143\u5b9d`, 20, 0, 18, 520, 30, new Color(92, 65, 43, 255));
        [typeLabel, rangeLabel].forEach((label) => {
            label.node.active = true;
            label.horizontalAlign = HorizontalTextAlignment.CENTER;
            label.verticalAlign = VerticalTextAlignment.CENTER;
            label.overflow = Overflow.SHRINK;
            this.setLabelOutline(label, new Color(255, 247, 224, 255), 1);
        });

        this.createMarketSellSettingRow(
            board,
            'Quantity',
            '\u6570\u91cf\uff1a',
            -28,
            () => this.adjustMarketSellDraftQuantity(-1, item),
            () => this.adjustMarketSellDraftQuantity(1, item),
        );
        this.createMarketSellSettingRow(
            board,
            'UnitPrice',
            '\u5355\u4ef7\uff1a',
            -68,
            () => this.adjustMarketSellDraftUnitPrice(-HomeConfig.MARKET_SELL_PRICE_STEP),
            () => this.adjustMarketSellDraftUnitPrice(HomeConfig.MARKET_SELL_PRICE_STEP),
        );

        const incomeCaption = this.getOrCreateEditorLabel(board, 'MarketSellConfirmIncomeCaption', this.isMarketRequestPostPage() ? '\u9884\u8ba1\u82b1\u8d39\uff1a' : '\u6700\u7ec8\u6536\u76ca\uff1a', 21, -54, -108, 170, 30, new Color(92, 65, 43, 255));
        incomeCaption.node.active = true;
        incomeCaption.horizontalAlign = HorizontalTextAlignment.RIGHT;
        this.setLabelOutline(incomeCaption, new Color(255, 247, 224, 255), 1);
        const incomeValue = this.getOrCreateEditorLabel(board, 'MarketSellConfirmIncomeValue', '', 22, 76, -108, 180, 30, new Color(46, 152, 61, 255));
        incomeValue.node.active = true;
        incomeValue.horizontalAlign = HorizontalTextAlignment.LEFT;
        this.setLabelOutline(incomeValue, new Color(255, 247, 224, 255), 1);

        const feePrefix = this.getOrCreateEditorLabel(board, 'MarketSellConfirmFeePrefix', '\u6bcf\u4e2a\u5546\u54c1\u6536\u53d6', 19, -52, -138, 168, 28, new Color(92, 65, 43, 255));
        feePrefix.node.active = !this.isMarketRequestPostPage();
        feePrefix.horizontalAlign = HorizontalTextAlignment.RIGHT;
        this.setLabelOutline(feePrefix, new Color(255, 247, 224, 255), 1);
        const feeRate = this.getOrCreateEditorLabel(board, 'MarketSellConfirmFeeRate', '10%', 19, 46, -138, 52, 28, new Color(184, 72, 56, 255));
        feeRate.node.active = !this.isMarketRequestPostPage();
        feeRate.horizontalAlign = HorizontalTextAlignment.CENTER;
        this.setLabelOutline(feeRate, new Color(255, 247, 224, 255), 1);
        const feeSuffix = this.getOrCreateEditorLabel(board, 'MarketSellConfirmFeeSuffix', '\u624b\u7eed\u8d39', 19, 106, -138, 92, 28, new Color(92, 65, 43, 255));
        feeSuffix.node.active = !this.isMarketRequestPostPage();
        feeSuffix.horizontalAlign = HorizontalTextAlignment.LEFT;
        this.setLabelOutline(feeSuffix, new Color(255, 247, 224, 255), 1);

        const cancel = this.getOrCreateEditorSkinnedNode('MarketSellConfirmCancel', board, 162, 62, -120, -178, HomeConfig.UI_MARKET_DETAIL_BUTTON_BG);
        cancel.active = true;
        cancel.setSiblingIndex(8);
        const cancelLabel = this.getOrCreateEditorLabel(cancel, 'MarketSellConfirmCancelLabel', '\u53d6\u6d88', 29, 0, 1, 132, 42, new Color(255, 238, 218, 255));
        cancelLabel.node.active = true;
        this.setLabelOutline(cancelLabel, new Color(85, 48, 30, 255), 2);
        this.bindScaledClick(cancel, () => this.closeMarketSellConfirmPopup());

        const confirm = this.getOrCreateEditorSkinnedNode('MarketSellConfirmSubmit', board, 162, 62, 120, -178, HomeConfig.UI_MARKET_DETAIL_BUTTON_BG);
        confirm.active = true;
        confirm.setSiblingIndex(9);
        const confirmLabel = this.getOrCreateEditorLabel(confirm, 'MarketSellConfirmSubmitLabel', '\u786e\u5b9a', 29, 0, 1, 132, 42, new Color(255, 238, 218, 255));
        confirmLabel.node.active = true;
        this.setLabelOutline(confirmLabel, new Color(85, 48, 30, 255), 2);
        this.bindScaledClick(confirm, () => this.confirmMarketSellListing(item, categoryPath, priceRange));
        this.refreshMarketSellConfirmDraftLabels();
    }
    protected closeMarketSellConfirmPopup(): void {
        const popup = this.marketPanel?.getChildByName('MarketSellConfirmPopup');
        if (popup?.isValid) popup.active = false;
        this.marketSellSelectedItem = null;
    }
    protected confirmMarketSellListing(item: BagIllustrationCatalogItem, categoryPath: string, priceRange: { basePrice: number; minPrice: number; maxPrice: number }): void {
        const postedListings = this.getCurrentMarketPostedListings();
        if (postedListings.length >= HomeConfig.MARKET_SELL_MAX_LISTINGS) {
            this.showToast(this.getMarketPostLimitText());
            this.closeMarketSellConfirmPopup();
            return;
        }
        const availableCount = this.getAvailableMarketSellItemCount(item);
        if (!this.isMarketRequestPostPage() && availableCount <= 0) {
            this.showToast('\u8be5\u7269\u54c1\u6570\u91cf\u4e0d\u8db3');
            this.closeMarketSellConfirmPopup();
            return;
        }
        const maxQuantity = this.isMarketRequestPostPage() ? HomeConfig.MARKET_REQUEST_MAX_QUANTITY : availableCount;
        const quantity = this.clamp(Math.floor(this.marketSellDraftQuantity), 1, maxQuantity);
        const unitPrice = this.roundMarketSellPrice(this.clamp(
            this.marketSellDraftUnitPrice,
            priceRange.minPrice,
            priceRange.maxPrice,
        ));
        const listingMode = this.marketMode;
        this.marketSellListings.push({
            id: `market_${listingMode}_post_${Date.now()}_${item.id}_${postedListings.length + 1}`,
            mode: listingMode,
            itemId: item.id,
            name: this.getCatalogDisplayName(item),
            category: item.category,
            amount: quantity,
            unitPrice,
            minPrice: priceRange.minPrice,
            maxPrice: priceRange.maxPrice,
            categoryPath,
            iconPath: item.iconPath,
            framePath: item.framePath,
        });
        if (listingMode === 'request') {
            this.marketTransactions.unshift({
                id: `${Date.now()}_${item.id}`,
                itemId: item.id,
                action: 'buy',
                mode: 'request',
                itemName: this.getCatalogDisplayName(item),
                amount: quantity,
                totalPrice: this.getMarketTotalPrice(unitPrice, quantity),
            });
        }
        this.closeMarketSellConfirmPopup();
        this.refreshMarketTabLabels();
        this.refreshMarketList();
        this.showToast(this.getCurrentMarketPostedListings().length >= HomeConfig.MARKET_SELL_MAX_LISTINGS ? this.getMarketPostFullSuccessText() : this.getMarketPostSuccessText());
    }
}
