import {
    Color,
    EditBox,
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
    protected marketSellQuantityInputSyncing = false;

    protected buildMarketSellListingPage(): void {
        if (!this.marketViewport?.isValid) return;

        const postedListings = this.getCurrentMarketPostedListings();
        const listingCount = postedListings.length;
        const hasAddSlot = listingCount < HomeConfig.MARKET_SELL_MAX_LISTINGS;
        const viewportHeight = this.marketViewport.getComponent(UITransform)?.contentSize.height || HomeConfig.MARKET_SELL_VIEWPORT_HEIGHT;
        const existingContent = this.marketViewport.getChildByName('MarketListContent');
        const templateRow1 = existingContent?.getChildByName('MarketListing_1');
        const templateRow2 = existingContent?.getChildByName('MarketListing_2');
        const templateGap = templateRow1?.isValid && templateRow2?.isValid
            ? Math.abs(templateRow1.position.y - templateRow2.position.y)
            : 0;
        const rowGap = templateGap >= HomeConfig.MARKET_ROW_HEIGHT ? templateGap : HomeConfig.MARKET_ROW_GAP;
        const viewportWidth = this.marketViewport.getComponent(UITransform)?.contentSize.width || HomeConfig.MARKET_VIEWPORT_WIDTH;
        const defaultStartY = viewportHeight / 2 - HomeConfig.MARKET_ROW_HEIGHT / 2 - 10;
        const templateStartY = templateRow1?.isValid && templateGap >= HomeConfig.MARKET_ROW_HEIGHT
            ? templateRow1.position.y
            : templateRow2?.isValid
                ? templateRow2.position.y + rowGap
                : templateRow1?.isValid
                    ? templateRow1.position.y
                    : defaultStartY;
        const startY = hasAddSlot
            ? HomeConfig.MARKET_SELL_ADD_SLOT_Y
            : templateStartY;
        const listingStartY = hasAddSlot
            ? startY - rowGap - HomeConfig.MARKET_SELL_ADD_TO_LISTING_EXTRA_GAP
            : templateStartY;
        const lastListingY = listingCount > 0
            ? listingStartY - (listingCount - 1) * rowGap
            : startY;
        const contentBottomY = listingCount > 0
            ? lastListingY - HomeConfig.MARKET_ROW_HEIGHT / 2
            : hasAddSlot
                ? startY - HomeConfig.MARKET_SELL_ADD_SLOT_HEIGHT / 2
                : -viewportHeight / 2;
        const visibleBottomAtRest = -viewportHeight / 2 - HomeConfig.MARKET_SELL_CONTENT_Y;
        const maxScrollY = Math.max(0, visibleBottomAtRest - contentBottomY);
        const contentHeight = viewportHeight + maxScrollY;
        const historyContent = this.marketViewport.getChildByName('MarketHistoryContent');
        if (historyContent?.isValid) historyContent.active = false;
        this.marketContent = this.getOrCreateEditorNode('MarketListContent', this.marketViewport, viewportWidth, contentHeight, 0, 0);
        this.marketContent.active = true;
        this.marketContent.setPosition(0, HomeConfig.MARKET_SELL_CONTENT_Y, 0);
        (this.marketContent.getComponent(UITransform) || this.marketContent.addComponent(UITransform)).setContentSize(viewportWidth, contentHeight);
        this.marketContent.children
            .filter((child) => /^MarketListing_\d+$/.test(child.name)
                || /^MarketSellListing_\d+$/.test(child.name)
                || child.name === 'MarketSellAddSlot'
                || child.name === 'MarketListEmpty')
            .forEach((child) => {
                child.active = false;
            });

        if (hasAddSlot) {
            this.createMarketSellAddRow(this.marketContent, startY);
        }
        postedListings.forEach((item, index) => {
            this.createMarketSellPostedRow(this.marketContent!, item, index, listingStartY - index * rowGap);
        });
        this.syncMarketListingPriceLayout(this.marketContent);

        this.clampMarketListScroll(this.marketContent, maxScrollY, HomeConfig.MARKET_SELL_CONTENT_Y);
        this.bindBagGridScroll(this.marketViewport, this.marketContent, maxScrollY, HomeConfig.MARKET_SELL_CONTENT_Y);
        this.bindBagGridScroll(this.marketContent, this.marketContent, maxScrollY, HomeConfig.MARKET_SELL_CONTENT_Y);
    }
    protected createMarketSellAddRow(parent: Node, y: number): void {
        const row = this.getOrCreateEditorSkinnedNode(
            'MarketSellAddSlot',
            parent,
            HomeConfig.MARKET_SELL_ADD_SLOT_WIDTH,
            HomeConfig.MARKET_SELL_ADD_SLOT_HEIGHT,
            0,
            y,
            HomeConfig.UI_MARKET_ITEM_ROW,
        );
        row.active = true;
        row.setPosition(0, y, 0);
        (row.getComponent(UITransform) || row.addComponent(UITransform)).setContentSize(HomeConfig.MARKET_SELL_ADD_SLOT_WIDTH, HomeConfig.MARKET_SELL_ADD_SLOT_HEIGHT);
        row.children
            .filter((child) => child.name !== 'MarketSellAddButton')
            .forEach((child) => {
                child.active = false;
            });

        const add = this.getOrCreateEditorSkinnedNode(
            'MarketSellAddButton',
            row,
            HomeConfig.MARKET_SELL_ADD_BUTTON_SIZE,
            HomeConfig.MARKET_SELL_ADD_BUTTON_SIZE,
            0,
            HomeConfig.MARKET_SELL_ADD_BUTTON_Y,
            HomeConfig.UI_MARKET_SELL_ADD,
        );
        add.active = true;
        add.setPosition(0, HomeConfig.MARKET_SELL_ADD_BUTTON_Y, 0);
        (add.getComponent(UITransform) || add.addComponent(UITransform)).setContentSize(HomeConfig.MARKET_SELL_ADD_BUTTON_SIZE, HomeConfig.MARKET_SELL_ADD_BUTTON_SIZE);
        add.setSiblingIndex(20);
        this.bindScaledClick(add, () => this.openMarketSellItemSelectPopup());
        this.bindScaledClick(row, () => this.openMarketSellItemSelectPopup());
    }
    protected getMarketSellListingCreatedAt(item: MarketSellListingData, now = Date.now()): number {
        if (Number.isFinite(item.createdAt) && (item.createdAt || 0) > 0) return item.createdAt as number;
        const match = `${item.id || ''}`.match(/_post_(\d{10,})_/);
        const parsed = match ? Number(match[1]) : NaN;
        return Number.isFinite(parsed) && parsed > 0 ? parsed : now;
    }
    protected getMarketSellListingRemainingText(item: MarketSellListingData): string {
        const now = Date.now();
        const expiresAt = Number.isFinite(item.expiresAt) && (item.expiresAt || 0) > 0
            ? item.expiresAt as number
            : this.getMarketSellListingCreatedAt(item, now) + HomeConfig.MARKET_POST_EXPIRE_DURATION_MS;
        const remain = Math.max(0, expiresAt - now);
        if (remain <= 0) return '\u5269\u4f59\uff1a\u5373\u5c06\u4e0b\u67b6';

        const minuteMs = 60 * 1000;
        const hourMs = 60 * minuteMs;
        const dayMs = 24 * hourMs;
        const days = Math.floor(remain / dayMs);
        const hours = Math.floor((remain % dayMs) / hourMs);
        const minutes = Math.max(1, Math.ceil((remain % hourMs) / minuteMs));
        if (days > 0) return `\u5269\u4f59\uff1a${days}\u5929${hours}\u65f6`;
        if (hours > 0) return `\u5269\u4f59\uff1a${hours}\u65f6${minutes}\u5206`;
        return `\u5269\u4f59\uff1a${minutes}\u5206`;
    }
    protected createMarketSellPostedRow(parent: Node, item: MarketSellListingData, index: number, y: number): void {
        const row = this.getOrCreateEditorSkinnedNode(`MarketSellListing_${index + 1}`, parent, HomeConfig.MARKET_ROW_WIDTH, HomeConfig.MARKET_ROW_HEIGHT, 0, y, HomeConfig.UI_MARKET_ITEM_ROW);
        row.active = true;
        const layoutTemplate = this.getMarketListingLayoutTemplate(parent, row);
        const templateTransform = layoutTemplate?.getComponent(UITransform);
        row.setPosition(layoutTemplate?.position.x ?? 0, y, 0);
        (row.getComponent(UITransform) || row.addComponent(UITransform)).setContentSize(
            templateTransform?.contentSize.width || HomeConfig.MARKET_ROW_WIDTH,
            templateTransform?.contentSize.height || HomeConfig.MARKET_ROW_HEIGHT,
        );

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
        const remain = this.getOrCreateEditorLabel(row, 'MarketRemainTime', this.getMarketSellListingRemainingText(item), 17, 210, 54, 170, 28, new Color(92, 65, 43, 255));
        remain.node.active = true;
        remain.node.setPosition(210, 54, 0);
        (remain.node.getComponent(UITransform) || remain.node.addComponent(UITransform)).setContentSize(170, 28);
        remain.horizontalAlign = HorizontalTextAlignment.RIGHT;
        remain.overflow = Overflow.SHRINK;
        this.applyMarketTextStyle(remain, 0);
        remain.node.setSiblingIndex(4);
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
        const actionLabel = this.getOrCreateEditorLabel(action, 'MarketActionLabel', this.getMarketPostedActionText(item), 24, 0, 1, 118, 42, new Color(91, 53, 25, 255));
        actionLabel.node.active = true;
        this.applyMarketTextStyle(actionLabel, 1);
        this.bindScaledClick(action, () => this.openMarketPostedListingCancelConfirm(item));
        this.bindScaledClick(row, () => this.openMarketSellListingDetail(item));
    }
    protected getMarketPostedActionText(item: MarketSellListingData): string {
        return this.getMarketListingMode(item) === 'request' ? '\u64a4\u9500' : '\u4e0b\u67b6';
    }
    protected openMarketPostedListingCancelConfirm(item: MarketSellListingData): void {
        const isRequest = this.getMarketListingMode(item) === 'request';
        const actionText = isRequest ? '\u64a4\u9500\u6c42\u8d2d' : '\u4e0b\u67b6';
        this.openSharedFlowPopup('ConfirmPopup', {
            title: '\u63d0\u793a\u8bf4\u660e',
            message: `\u662f\u5426\u786e\u5b9a${actionText}${item.name} x${item.amount}\uff1f`,
            onConfirm: () => this.confirmMarketPostedListingCancel(item.id),
        });
    }
    protected confirmMarketPostedListingCancel(listingId: string): void {
        const index = this.marketSellListings.findIndex((item) => item.id === listingId);
        if (index < 0) {
            this.showToast('\u8be5\u8bb0\u5f55\u5df2\u4e0d\u5b58\u5728');
            this.refreshMarketTabLabels();
            this.refreshMarketList();
            return;
        }

        const [removed] = this.marketSellListings.splice(index, 1);
        const isRequest = removed ? this.getMarketListingMode(removed) === 'request' : false;
        if (removed) {
            this.marketTransactions.unshift({
                id: `${Date.now()}_${removed.id}_cancel`,
                itemId: removed.itemId,
                action: 'cancel',
                mode: this.getMarketListingMode(removed),
                itemName: removed.name,
                amount: removed.amount,
                totalPrice: this.getMarketTotalPrice(removed.unitPrice, removed.amount),
                iconPath: removed.iconPath,
                framePath: removed.framePath,
            });
        }
        this.refreshMarketTabLabels();
        this.refreshMarketList();
        this.showToast(isRequest ? '\u6c42\u8d2d\u5df2\u64a4\u9500' : '\u7269\u54c1\u5df2\u4e0b\u67b6');
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
    protected createMarketSellSettingRow(
        board: Node,
        key: string,
        title: string,
        layout: { titleX: number; y: number; minusX: number; bgX: number; valueX: number; plusX: number },
        onMinus: () => void,
        onPlus: () => void,
    ): void {
        const titleLabel = this.getOrCreateEditorLabel(board, `MarketSellConfirm${key}Title`, title, 21, layout.titleX, layout.y, 82, 32, new Color(92, 65, 43, 255));
        titleLabel.node.active = true;
        titleLabel.node.setPosition(layout.titleX, layout.y, 0);
        (titleLabel.node.getComponent(UITransform) || titleLabel.node.addComponent(UITransform)).setContentSize(82, 32);
        titleLabel.horizontalAlign = HorizontalTextAlignment.RIGHT;
        this.setLabelOutline(titleLabel, new Color(255, 247, 224, 255), 1);

        const minus = this.getOrCreateEditorSkinnedNode(`MarketSellConfirm${key}Minus`, board, HomeConfig.MARKET_SELL_STEPPER_BUTTON_SIZE, HomeConfig.MARKET_SELL_STEPPER_BUTTON_SIZE, layout.minusX, layout.y, HomeConfig.UI_MARKET_SELL_PRICE_MINUS);
        minus.active = true;
        minus.setPosition(layout.minusX, layout.y, 0);
        (minus.getComponent(UITransform) || minus.addComponent(UITransform)).setContentSize(HomeConfig.MARKET_SELL_STEPPER_BUTTON_SIZE, HomeConfig.MARKET_SELL_STEPPER_BUTTON_SIZE);
        minus.setSiblingIndex(6);
        this.bindScaledClick(minus, onMinus);

        const valueBg = this.getOrCreateEditorSkinnedNode(`MarketSellConfirm${key}Bg`, board, HomeConfig.MARKET_SELL_SETTING_BG_WIDTH, HomeConfig.MARKET_SELL_SETTING_BG_HEIGHT, layout.bgX, layout.y, HomeConfig.UI_MARKET_SELL_QUANTITY_BG);
        valueBg.active = true;
        valueBg.setPosition(layout.bgX, layout.y, 0);
        (valueBg.getComponent(UITransform) || valueBg.addComponent(UITransform)).setContentSize(HomeConfig.MARKET_SELL_SETTING_BG_WIDTH, HomeConfig.MARKET_SELL_SETTING_BG_HEIGHT);
        valueBg.setSiblingIndex(5);

        const value = this.getOrCreateEditorLabel(board, `MarketSellConfirm${key}Value`, '', 20, layout.valueX, layout.y, 150, 28, new Color(255, 247, 224, 255));
        value.node.active = true;
        value.node.setPosition(layout.valueX, layout.y, 0);
        (value.node.getComponent(UITransform) || value.node.addComponent(UITransform)).setContentSize(150, 28);
        value.horizontalAlign = HorizontalTextAlignment.CENTER;
        this.setLabelOutline(value, new Color(50, 42, 36, 255), 2);
        value.node.setSiblingIndex(7);

        const plus = this.getOrCreateEditorSkinnedNode(`MarketSellConfirm${key}Plus`, board, HomeConfig.MARKET_SELL_STEPPER_BUTTON_SIZE, HomeConfig.MARKET_SELL_STEPPER_BUTTON_SIZE, layout.plusX, layout.y, HomeConfig.UI_MARKET_SELL_PRICE_PLUS);
        plus.active = true;
        plus.setPosition(layout.plusX, layout.y, 0);
        (plus.getComponent(UITransform) || plus.addComponent(UITransform)).setContentSize(HomeConfig.MARKET_SELL_STEPPER_BUTTON_SIZE, HomeConfig.MARKET_SELL_STEPPER_BUTTON_SIZE);
        plus.setSiblingIndex(8);
        this.bindScaledClick(plus, onPlus);
    }
    protected refreshMarketSellConfirmDraftLabels(): void {
        const popup = this.marketPanel?.getChildByName('MarketSellConfirmPopup');
        const board = popup?.getChildByName('MarketSellConfirmBoard');
        if (!board?.isValid) return;

        const quantityNode = board.getChildByName('MarketSellConfirmQuantityValue');
        const quantityEditBox = quantityNode?.getChildByName('MarketSellConfirmQuantityInputTouch')?.getComponent(EditBox);
        if (quantityEditBox) {
            this.syncMarketSellQuantityEditBox(quantityEditBox, `${this.marketSellDraftQuantity}`);
        } else {
            const quantity = quantityNode?.getComponent(Label);
            if (quantity) quantity.string = `${this.marketSellDraftQuantity}`;
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
    protected setupMarketSellQuantityEditBox(valueLabel: Label, item: BagIllustrationCatalogItem): void {
        const valueNode = valueLabel.node;
        const staleEditBox = valueNode.getComponent(EditBox);
        if (staleEditBox) staleEditBox.destroy();
        const inputNode = this.getOrCreateEditorNode('MarketSellConfirmQuantityInputTouch', valueNode, 150, 28, 0, 0);
        inputNode.active = true;
        inputNode.setPosition(0, 0, 0);
        inputNode.setSiblingIndex(10);
        (inputNode.getComponent(UITransform) || inputNode.addComponent(UITransform)).setContentSize(150, 28);
        const hiddenColor = new Color(255, 247, 224, 0);
        const textLabel = this.getOrCreateEditorLabel(inputNode, 'TEXT_LABEL', '', 20, 0, 0, 150, 28, hiddenColor);
        textLabel.node.active = true;
        textLabel.color = hiddenColor;
        textLabel.horizontalAlign = HorizontalTextAlignment.CENTER;
        const placeholderLabel = this.getOrCreateEditorLabel(inputNode, 'PLACEHOLDER_LABEL', '', 20, 0, 0, 150, 28, hiddenColor);
        placeholderLabel.node.active = true;
        placeholderLabel.color = hiddenColor;
        placeholderLabel.horizontalAlign = HorizontalTextAlignment.CENTER;
        let editBox = inputNode.getComponent(EditBox);
        editBox ||= inputNode.addComponent(EditBox);
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
            backgroundImage?: null;
            placeholder?: string;
            maxLength?: number;
            lineHeight?: number;
            string?: string;
            _textLabel?: Label;
            _placeholderLabel?: Label;
            _inputMode?: number;
            _inputFlag?: number;
            _returnType?: number;
            _fontSize?: number;
            _placeholderFontSize?: number;
            _fontColor?: Color;
            _placeholderFontColor?: Color;
            _cursorColor?: Color;
            _backgroundImage?: null;
            _placeholder?: string;
            _maxLength?: number;
            _lineHeight?: number;
            _string?: string;
        };
        const inputMode = (EditBox as unknown as { InputMode?: { NUMERIC?: number; PHONE_NUMBER?: number; SINGLE_LINE?: number } }).InputMode;
        const inputFlag = (EditBox as unknown as { InputFlag?: { SENSITIVE?: number } }).InputFlag;
        const returnType = (EditBox as unknown as { KeyboardReturnType?: { DONE?: number } }).KeyboardReturnType;
        const textColor = new Color(255, 247, 224, 255);
        editBoxCompat.textLabel = textLabel;
        editBoxCompat.placeholderLabel = placeholderLabel;
        editBoxCompat.inputMode = inputMode?.NUMERIC ?? inputMode?.PHONE_NUMBER ?? inputMode?.SINGLE_LINE ?? 2;
        editBoxCompat.inputFlag = inputFlag?.SENSITIVE ?? 1;
        editBoxCompat.returnType = returnType?.DONE ?? 0;
        editBoxCompat.fontSize = 20;
        editBoxCompat.placeholderFontSize = 20;
        editBoxCompat.fontColor = textColor;
        editBoxCompat.placeholderFontColor = textColor;
        editBoxCompat.cursorColor = textColor;
        editBoxCompat.backgroundImage = null;
        editBoxCompat.placeholder = '';
        editBoxCompat.maxLength = Math.max(1, `${this.getMarketPostMaxQuantity(item)}`.length);
        editBoxCompat.lineHeight = 28;
        editBoxCompat._textLabel = textLabel;
        editBoxCompat._placeholderLabel = placeholderLabel;
        editBoxCompat._inputMode = editBoxCompat.inputMode;
        editBoxCompat._inputFlag = editBoxCompat.inputFlag;
        editBoxCompat._returnType = editBoxCompat.returnType;
        editBoxCompat._fontSize = 20;
        editBoxCompat._placeholderFontSize = 20;
        editBoxCompat._fontColor = textColor;
        editBoxCompat._placeholderFontColor = textColor;
        editBoxCompat._cursorColor = textColor;
        editBoxCompat._backgroundImage = null;
        editBoxCompat._placeholder = '';
        editBoxCompat._maxLength = editBoxCompat.maxLength;
        editBoxCompat._lineHeight = 28;

        const changed = this.getMarketSellEditBoxEventType('TEXT_CHANGED');
        const ended = this.getMarketSellEditBoxEventType('EDITING_DID_ENDED');
        const returned = this.getMarketSellEditBoxEventType('EDITING_RETURN');
        valueNode.targetOff(this);
        inputNode.targetOff(this);
        inputNode.on(changed, () => this.applyMarketSellQuantityInput(editBox!, item, false), this);
        inputNode.on(ended, () => this.applyMarketSellQuantityInput(editBox!, item, true), this);
        inputNode.on(returned, () => this.applyMarketSellQuantityInput(editBox!, item, true), this);
        this.syncMarketSellQuantityEditBox(editBox, `${this.marketSellDraftQuantity}`);
    }
    protected applyMarketSellQuantityInput(editBox: EditBox, item: BagIllustrationCatalogItem, commit: boolean): void {
        if (this.marketSellQuantityInputSyncing) return;
        const maxQuantity = this.getMarketPostMaxQuantity(item);
        const maxDigits = Math.max(1, `${maxQuantity}`.length);
        const raw = editBox.string || '';
        let clean = raw.replace(/\D/g, '').slice(0, maxDigits);
        if (!clean) {
            if (!commit) {
                this.syncMarketSellQuantityEditBox(editBox, '');
                return;
            }
            clean = '1';
        }
        const parsed = Number.parseInt(clean, 10);
        const nextQuantity = this.clamp(Number.isFinite(parsed) ? parsed : 1, 1, maxQuantity);
        const nextText = `${nextQuantity}`;
        this.syncMarketSellQuantityEditBox(editBox, nextText);
        if (this.marketSellDraftQuantity !== nextQuantity) {
            this.marketSellDraftQuantity = nextQuantity;
            this.refreshMarketSellConfirmDraftLabels();
        }
    }
    protected syncMarketSellQuantityEditBox(editBox: EditBox, text: string): void {
        this.marketSellQuantityInputSyncing = true;
        const editBoxCompat = editBox as unknown as {
            string?: string;
            _string?: string;
            textLabel?: Label;
            _textLabel?: Label;
            placeholderLabel?: Label;
            _placeholderLabel?: Label;
        };
        editBoxCompat.string = text;
        editBoxCompat._string = text;
        const visibleLabel = editBox.node.parent?.getComponent(Label);
        if (visibleLabel) {
            visibleLabel.string = text;
            visibleLabel.node.active = true;
        }
        const textLabel = editBoxCompat.textLabel || editBoxCompat._textLabel || editBox.node.getComponent(Label);
        if (textLabel) {
            textLabel.string = text;
            textLabel.node.active = true;
        }
        const placeholderLabel = editBoxCompat.placeholderLabel || editBoxCompat._placeholderLabel;
        if (placeholderLabel) {
            placeholderLabel.string = '';
            placeholderLabel.node.active = true;
        }
        this.marketSellQuantityInputSyncing = false;
    }
    protected getMarketSellEditBoxEventType(name: 'TEXT_CHANGED' | 'EDITING_DID_ENDED' | 'EDITING_RETURN'): string {
        const eventType = EditBox as unknown as { EventType?: Record<string, string> };
        return eventType.EventType?.[name] || {
            TEXT_CHANGED: 'text-changed',
            EDITING_DID_ENDED: 'editing-did-ended',
            EDITING_RETURN: 'editing-return',
        }[name];
    }
    protected commitMarketSellQuantityInput(item: BagIllustrationCatalogItem): void {
        const popup = this.marketPanel?.getChildByName('MarketSellConfirmPopup');
        const board = popup?.getChildByName('MarketSellConfirmBoard');
        const editBox = board
            ?.getChildByName('MarketSellConfirmQuantityValue')
            ?.getChildByName('MarketSellConfirmQuantityInputTouch')
            ?.getComponent(EditBox);
        if (editBox) this.applyMarketSellQuantityInput(editBox, item, true);
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

        const board = this.getOrCreateEditorSkinnedNode('MarketSellConfirmBoard', popup, HomeConfig.MARKET_SELL_CONFIRM_BOARD_WIDTH, HomeConfig.MARKET_SELL_CONFIRM_BOARD_HEIGHT, 0, 0, HomeConfig.UI_MARKET_DETAIL_POPUP_BG);
        board.active = true;
        board.setScale(HomeConfig.MARKET_SELL_CONFIRM_BOARD_SCALE, HomeConfig.MARKET_SELL_CONFIRM_BOARD_SCALE, 1);
        board.setSiblingIndex(1);
        (board.getComponent(UITransform) || board.addComponent(UITransform)).setContentSize(HomeConfig.MARKET_SELL_CONFIRM_BOARD_WIDTH, HomeConfig.MARKET_SELL_CONFIRM_BOARD_HEIGHT);
        const titleSkin = this.getOrCreateEditorNode('MarketSellConfirmTitleSkin', board, HomeConfig.MARKET_SELL_CONFIRM_TITLE_SKIN_WIDTH, HomeConfig.MARKET_SELL_CONFIRM_TITLE_SKIN_HEIGHT, 0, HomeConfig.MARKET_SELL_CONFIRM_TITLE_SKIN_Y);
        titleSkin.active = HomeConfig.MARKET_SELL_CONFIRM_TITLE_SKIN_ACTIVE;
        titleSkin.setPosition(0, HomeConfig.MARKET_SELL_CONFIRM_TITLE_SKIN_Y, 0);
        (titleSkin.getComponent(UITransform) || titleSkin.addComponent(UITransform)).setContentSize(HomeConfig.MARKET_SELL_CONFIRM_TITLE_SKIN_WIDTH, HomeConfig.MARKET_SELL_CONFIRM_TITLE_SKIN_HEIGHT);
        this.applyUiSkinKeepingEditorSize(titleSkin, HomeConfig.UI_CONFIRM_TITLE_BG, HomeConfig.MARKET_SELL_CONFIRM_TITLE_SKIN_WIDTH, HomeConfig.MARKET_SELL_CONFIRM_TITLE_SKIN_HEIGHT);
        titleSkin.setSiblingIndex(1);
        const title = this.getOrCreateEditorLabel(board, 'MarketSellConfirmTitle', this.getCatalogDisplayName(item), HomeConfig.SHARED_CONFIRM_TITLE_FONT_SIZE, 0, HomeConfig.MARKET_SELL_CONFIRM_TITLE_Y, HomeConfig.MARKET_SELL_CONFIRM_TITLE_WIDTH, HomeConfig.MARKET_SELL_CONFIRM_TITLE_HEIGHT, new Color(126, 74, 36, 255));
        title.node.active = true;
        title.node.setPosition(0, HomeConfig.MARKET_SELL_CONFIRM_TITLE_Y, 0);
        (title.node.getComponent(UITransform) || title.node.addComponent(UITransform)).setContentSize(HomeConfig.MARKET_SELL_CONFIRM_TITLE_WIDTH, HomeConfig.MARKET_SELL_CONFIRM_TITLE_HEIGHT);
        title.fontSize = HomeConfig.SHARED_CONFIRM_TITLE_FONT_SIZE;
        title.lineHeight = HomeConfig.SHARED_CONFIRM_TITLE_LINE_HEIGHT;
        title.overflow = Overflow.SHRINK;
        this.setLabelOutline(title, new Color(255, 245, 215, 255), 2);
        title.node.setSiblingIndex(2);

        const frame = this.getOrCreateEditorSkinnedNode('MarketSellConfirmFrame', board, 90, 90, 0, HomeConfig.MARKET_SELL_CONFIRM_FRAME_Y, item.framePath);
        frame.active = true;
        frame.setPosition(0, HomeConfig.MARKET_SELL_CONFIRM_FRAME_Y, 0);
        (frame.getComponent(UITransform) || frame.addComponent(UITransform)).setContentSize(90, 90);
        frame.setSiblingIndex(3);
        const icon = this.getOrCreateEditorSkinnedNode('MarketSellConfirmIcon', board, 68, 68, 0, HomeConfig.MARKET_SELL_CONFIRM_ICON_Y, item.iconPath);
        icon.active = true;
        icon.setPosition(0, HomeConfig.MARKET_SELL_CONFIRM_ICON_Y, 0);
        (icon.getComponent(UITransform) || icon.addComponent(UITransform)).setContentSize(68, 68);
        icon.setSiblingIndex(4);

        const oldMinLabel = board.getChildByName('MarketSellConfirmMinPrice');
        if (oldMinLabel?.isValid) oldMinLabel.active = false;
        const oldMaxLabel = board.getChildByName('MarketSellConfirmMaxPrice');
        if (oldMaxLabel?.isValid) oldMaxLabel.active = false;

        const typeLabel = this.getOrCreateEditorLabel(board, 'MarketSellConfirmType', `\u7c7b\u578b\uff1a${categoryPath}`, 21, HomeConfig.MARKET_SELL_CONFIRM_TYPE_X, HomeConfig.MARKET_SELL_CONFIRM_TYPE_Y, HomeConfig.MARKET_SELL_CONFIRM_TYPE_WIDTH, HomeConfig.MARKET_SELL_CONFIRM_TYPE_HEIGHT, new Color(92, 65, 43, 255));
        const rangeLabel = this.getOrCreateEditorLabel(board, 'MarketSellConfirmPriceRange', `${this.getMarketPostPriceRangePrefix()}\uff1a${this.formatMarketPrice(priceRange.minPrice)}-${this.formatMarketPrice(priceRange.maxPrice)} \u5143\u5b9d`, 20, HomeConfig.MARKET_SELL_CONFIRM_PRICE_RANGE_X, HomeConfig.MARKET_SELL_CONFIRM_PRICE_RANGE_Y, HomeConfig.MARKET_SELL_CONFIRM_PRICE_RANGE_WIDTH, HomeConfig.MARKET_SELL_CONFIRM_PRICE_RANGE_HEIGHT, new Color(92, 65, 43, 255));
        typeLabel.node.setPosition(HomeConfig.MARKET_SELL_CONFIRM_TYPE_X, HomeConfig.MARKET_SELL_CONFIRM_TYPE_Y, 0);
        (typeLabel.node.getComponent(UITransform) || typeLabel.node.addComponent(UITransform)).setContentSize(HomeConfig.MARKET_SELL_CONFIRM_TYPE_WIDTH, HomeConfig.MARKET_SELL_CONFIRM_TYPE_HEIGHT);
        rangeLabel.node.setPosition(HomeConfig.MARKET_SELL_CONFIRM_PRICE_RANGE_X, HomeConfig.MARKET_SELL_CONFIRM_PRICE_RANGE_Y, 0);
        (rangeLabel.node.getComponent(UITransform) || rangeLabel.node.addComponent(UITransform)).setContentSize(HomeConfig.MARKET_SELL_CONFIRM_PRICE_RANGE_WIDTH, HomeConfig.MARKET_SELL_CONFIRM_PRICE_RANGE_HEIGHT);
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
            HomeConfig.MARKET_SELL_CONFIRM_QUANTITY_ROW,
            () => this.adjustMarketSellDraftQuantity(-1, item),
            () => this.adjustMarketSellDraftQuantity(1, item),
        );
        const quantityValue = board.getChildByName('MarketSellConfirmQuantityValue')?.getComponent(Label);
        if (quantityValue) this.setupMarketSellQuantityEditBox(quantityValue, item);
        this.createMarketSellSettingRow(
            board,
            'UnitPrice',
            '\u5355\u4ef7\uff1a',
            HomeConfig.MARKET_SELL_CONFIRM_UNIT_PRICE_ROW,
            () => this.adjustMarketSellDraftUnitPrice(-HomeConfig.MARKET_SELL_PRICE_STEP),
            () => this.adjustMarketSellDraftUnitPrice(HomeConfig.MARKET_SELL_PRICE_STEP),
        );

        const incomeCaption = this.getOrCreateEditorLabel(board, 'MarketSellConfirmIncomeCaption', this.isMarketRequestPostPage() ? '\u9884\u8ba1\u82b1\u8d39\uff1a' : '\u6700\u7ec8\u6536\u76ca\uff1a', 21, HomeConfig.MARKET_SELL_CONFIRM_INCOME_CAPTION_X, HomeConfig.MARKET_SELL_CONFIRM_INCOME_CAPTION_Y, 170, 30, new Color(92, 65, 43, 255));
        incomeCaption.node.active = true;
        incomeCaption.node.setPosition(HomeConfig.MARKET_SELL_CONFIRM_INCOME_CAPTION_X, HomeConfig.MARKET_SELL_CONFIRM_INCOME_CAPTION_Y, 0);
        (incomeCaption.node.getComponent(UITransform) || incomeCaption.node.addComponent(UITransform)).setContentSize(170, 30);
        incomeCaption.horizontalAlign = HorizontalTextAlignment.RIGHT;
        this.setLabelOutline(incomeCaption, new Color(255, 247, 224, 255), 1);
        const incomeValue = this.getOrCreateEditorLabel(board, 'MarketSellConfirmIncomeValue', '', 22, HomeConfig.MARKET_SELL_CONFIRM_INCOME_VALUE_X, HomeConfig.MARKET_SELL_CONFIRM_INCOME_VALUE_Y, 180, 30, new Color(46, 152, 61, 255));
        incomeValue.node.active = true;
        incomeValue.node.setPosition(HomeConfig.MARKET_SELL_CONFIRM_INCOME_VALUE_X, HomeConfig.MARKET_SELL_CONFIRM_INCOME_VALUE_Y, 0);
        (incomeValue.node.getComponent(UITransform) || incomeValue.node.addComponent(UITransform)).setContentSize(180, 30);
        incomeValue.horizontalAlign = HorizontalTextAlignment.LEFT;
        this.setLabelOutline(incomeValue, new Color(255, 247, 224, 255), 1);

        const feePrefix = this.getOrCreateEditorLabel(board, 'MarketSellConfirmFeePrefix', '\u6bcf\u4e2a\u5546\u54c1\u6536\u53d6', 19, HomeConfig.MARKET_SELL_CONFIRM_FEE_PREFIX_X, HomeConfig.MARKET_SELL_CONFIRM_FEE_PREFIX_Y, 168, 28, new Color(92, 65, 43, 255));
        feePrefix.node.active = !this.isMarketRequestPostPage();
        feePrefix.node.setPosition(HomeConfig.MARKET_SELL_CONFIRM_FEE_PREFIX_X, HomeConfig.MARKET_SELL_CONFIRM_FEE_PREFIX_Y, 0);
        (feePrefix.node.getComponent(UITransform) || feePrefix.node.addComponent(UITransform)).setContentSize(168, 28);
        feePrefix.horizontalAlign = HorizontalTextAlignment.RIGHT;
        this.setLabelOutline(feePrefix, new Color(255, 247, 224, 255), 1);
        const feeRate = this.getOrCreateEditorLabel(board, 'MarketSellConfirmFeeRate', '10%', 19, HomeConfig.MARKET_SELL_CONFIRM_FEE_RATE_X, HomeConfig.MARKET_SELL_CONFIRM_FEE_RATE_Y, 52, 28, new Color(184, 72, 56, 255));
        feeRate.node.active = !this.isMarketRequestPostPage();
        feeRate.node.setPosition(HomeConfig.MARKET_SELL_CONFIRM_FEE_RATE_X, HomeConfig.MARKET_SELL_CONFIRM_FEE_RATE_Y, 0);
        (feeRate.node.getComponent(UITransform) || feeRate.node.addComponent(UITransform)).setContentSize(52, 28);
        feeRate.horizontalAlign = HorizontalTextAlignment.CENTER;
        this.setLabelOutline(feeRate, new Color(255, 247, 224, 255), 1);
        const feeSuffix = this.getOrCreateEditorLabel(board, 'MarketSellConfirmFeeSuffix', '\u624b\u7eed\u8d39', 19, HomeConfig.MARKET_SELL_CONFIRM_FEE_SUFFIX_X, HomeConfig.MARKET_SELL_CONFIRM_FEE_SUFFIX_Y, 92, 28, new Color(92, 65, 43, 255));
        feeSuffix.node.active = !this.isMarketRequestPostPage();
        feeSuffix.node.setPosition(HomeConfig.MARKET_SELL_CONFIRM_FEE_SUFFIX_X, HomeConfig.MARKET_SELL_CONFIRM_FEE_SUFFIX_Y, 0);
        (feeSuffix.node.getComponent(UITransform) || feeSuffix.node.addComponent(UITransform)).setContentSize(92, 28);
        feeSuffix.horizontalAlign = HorizontalTextAlignment.LEFT;
        this.setLabelOutline(feeSuffix, new Color(255, 247, 224, 255), 1);

        const cancel = this.getOrCreateEditorSkinnedNode('MarketSellConfirmCancel', board, HomeConfig.SHARED_CONFIRM_BUTTON_WIDTH, HomeConfig.SHARED_CONFIRM_BUTTON_HEIGHT, HomeConfig.MARKET_SELL_CONFIRM_CANCEL_X, HomeConfig.MARKET_SELL_CONFIRM_CANCEL_Y, HomeConfig.UI_MARKET_DETAIL_BUTTON_BG);
        cancel.active = true;
        cancel.setPosition(HomeConfig.MARKET_SELL_CONFIRM_CANCEL_X, HomeConfig.MARKET_SELL_CONFIRM_CANCEL_Y, 0);
        (cancel.getComponent(UITransform) || cancel.addComponent(UITransform)).setContentSize(HomeConfig.SHARED_CONFIRM_BUTTON_WIDTH, HomeConfig.SHARED_CONFIRM_BUTTON_HEIGHT);
        cancel.setSiblingIndex(8);
        const cancelLabel = this.getOrCreateEditorLabel(cancel, 'MarketSellConfirmCancelLabel', '\u53d6\u6d88', HomeConfig.SHARED_CONFIRM_BUTTON_FONT_SIZE, 0, HomeConfig.SHARED_CONFIRM_BUTTON_LABEL_Y, HomeConfig.SHARED_CONFIRM_BUTTON_LABEL_WIDTH, HomeConfig.SHARED_CONFIRM_BUTTON_LABEL_HEIGHT, new Color(255, 238, 218, 255));
        cancelLabel.node.active = true;
        cancelLabel.node.setPosition(0, HomeConfig.SHARED_CONFIRM_BUTTON_LABEL_Y, 0);
        (cancelLabel.node.getComponent(UITransform) || cancelLabel.node.addComponent(UITransform)).setContentSize(HomeConfig.SHARED_CONFIRM_BUTTON_LABEL_WIDTH, HomeConfig.SHARED_CONFIRM_BUTTON_LABEL_HEIGHT);
        cancelLabel.fontSize = HomeConfig.SHARED_CONFIRM_BUTTON_FONT_SIZE;
        cancelLabel.lineHeight = HomeConfig.SHARED_CONFIRM_BUTTON_LINE_HEIGHT;
        this.setLabelOutline(cancelLabel, new Color(85, 48, 30, 255), 2);
        this.bindScaledClick(cancel, () => this.closeMarketSellConfirmPopup());

        const confirm = this.getOrCreateEditorSkinnedNode('MarketSellConfirmSubmit', board, HomeConfig.SHARED_CONFIRM_BUTTON_WIDTH, HomeConfig.SHARED_CONFIRM_BUTTON_HEIGHT, HomeConfig.MARKET_SELL_CONFIRM_SUBMIT_X, HomeConfig.MARKET_SELL_CONFIRM_SUBMIT_Y, HomeConfig.UI_MARKET_DETAIL_BUTTON_BG);
        confirm.active = true;
        confirm.setPosition(HomeConfig.MARKET_SELL_CONFIRM_SUBMIT_X, HomeConfig.MARKET_SELL_CONFIRM_SUBMIT_Y, 0);
        (confirm.getComponent(UITransform) || confirm.addComponent(UITransform)).setContentSize(HomeConfig.SHARED_CONFIRM_BUTTON_WIDTH, HomeConfig.SHARED_CONFIRM_BUTTON_HEIGHT);
        confirm.setSiblingIndex(9);
        const confirmLabel = this.getOrCreateEditorLabel(confirm, 'MarketSellConfirmSubmitLabel', '\u786e\u5b9a', HomeConfig.SHARED_CONFIRM_BUTTON_FONT_SIZE, 0, HomeConfig.SHARED_CONFIRM_BUTTON_LABEL_Y, HomeConfig.SHARED_CONFIRM_BUTTON_LABEL_WIDTH, HomeConfig.SHARED_CONFIRM_BUTTON_LABEL_HEIGHT, new Color(255, 238, 218, 255));
        confirmLabel.node.active = true;
        confirmLabel.node.setPosition(0, HomeConfig.SHARED_CONFIRM_BUTTON_LABEL_Y, 0);
        (confirmLabel.node.getComponent(UITransform) || confirmLabel.node.addComponent(UITransform)).setContentSize(HomeConfig.SHARED_CONFIRM_BUTTON_LABEL_WIDTH, HomeConfig.SHARED_CONFIRM_BUTTON_LABEL_HEIGHT);
        confirmLabel.fontSize = HomeConfig.SHARED_CONFIRM_BUTTON_FONT_SIZE;
        confirmLabel.lineHeight = HomeConfig.SHARED_CONFIRM_BUTTON_LINE_HEIGHT;
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
        this.commitMarketSellQuantityInput(item);
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
        const now = Date.now();
        const listing: MarketSellListingData = {
            id: `market_${listingMode}_post_${now}_${item.id}_${postedListings.length + 1}`,
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
            createdAt: now,
            expiresAt: now + HomeConfig.MARKET_POST_EXPIRE_DURATION_MS,
        };
        this.marketSellListings.push(listing);
        this.marketTransactions.unshift({
            id: `${now}_${listing.id}_post`,
            itemId: listing.itemId,
            action: 'post',
            mode: listingMode,
            itemName: listing.name,
            amount: listing.amount,
            totalPrice: this.getMarketTotalPrice(listing.unitPrice, listing.amount),
            iconPath: listing.iconPath,
            framePath: listing.framePath,
        });
        this.closeMarketSellConfirmPopup();
        this.refreshMarketTabLabels();
        this.refreshMarketList();
        this.showToast(this.getCurrentMarketPostedListings().length >= HomeConfig.MARKET_SELL_MAX_LISTINGS ? this.getMarketPostFullSuccessText() : this.getMarketPostSuccessText());
    }
}
