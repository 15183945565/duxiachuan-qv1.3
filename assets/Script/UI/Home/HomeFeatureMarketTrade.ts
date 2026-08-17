import {
    Color,
    HorizontalTextAlignment,
    Label,
    Node,
    Overflow,
    RichText,
    Sprite,
    UITransform,
    Vec3,
} from 'cc';
import { applySimKaiFont, applySimKaiFontToRichText } from '../Common/UIFont';
import * as HomeConfig from './HomeConfig';
import type {
    MarketListingData,
    MarketSellListingData,
    MarketTransactionData,
} from './HomeTypes';
import { HomeViewBase } from './HomeViewBase';

/**
 * Owns market listing/detail actions, transaction history, and market text styling.
 */
export abstract class HomeFeatureMarketTrade extends HomeViewBase {
    protected openMarketSellListingDetail(item: MarketSellListingData): void {
        const mode = this.getMarketListingMode(item);
        this.openCommerceItemDetail(
            item.name,
            mode === 'request' ? '\u6c42\u8d2d\u5355\u8be6\u60c5' : item.categoryPath,
            mode === 'request'
                ? `\u7c7b\u578b\uff1a${item.categoryPath}\n\u6700\u4f4e\u6c42\u8d2d\u4ef7\u683c\uff1a${this.formatMarketPrice(item.minPrice)} \u5143\u5b9d\n\u6700\u9ad8\u6c42\u8d2d\u4ef7\u683c\uff1a${this.formatMarketPrice(item.maxPrice)} \u5143\u5b9d`
                : `\u6700\u4f4e\u51fa\u552e\u4ef7\u683c\uff1a${this.formatMarketPrice(item.minPrice)} \u5143\u5b9d\n\u6700\u9ad8\u51fa\u552e\u4ef7\u683c\uff1a${this.formatMarketPrice(item.maxPrice)} \u5143\u5b9d`,
            `${item.amount}`,
            item.iconPath,
            '\u5173\u95ed',
            () => undefined,
            item.framePath,
            'market',
        );
    }
    protected clampMarketListScroll(content: Node, maxScrollY: number, minScrollY = 0): void {
        const currentY = content.position.y || 0;
        content.setPosition(0, this.clamp(currentY, minScrollY, minScrollY + maxScrollY), 0);
    }
    protected marketListingRowHasLayout(row: Node | null | undefined): boolean {
        if (!row?.isValid) return false;
        return [
            'MarketItemFrame',
            'MarketItemIcon',
            'MarketItemAmount',
            'MarketItemName',
            'MarketUnitPrice',
            'MarketTotalPrice',
            'MarketActionButton',
        ].some((childName) => row.getChildByName(childName)?.isValid);
    }
    protected getMarketListingLayoutTemplate(parent: Node, row: Node): Node | null {
        const templates = parent.children
            .filter((child) => child !== row && /^MarketListing_\d+$/.test(child.name) && this.marketListingRowHasLayout(child))
            .sort((a, b) => {
                const left = Number(a.name.match(/\d+$/)?.[0] || 0);
                const right = Number(b.name.match(/\d+$/)?.[0] || 0);
                return left - right;
            });
        const firstTemplate = row.name === 'MarketListing_1' && this.marketListingRowHasLayout(row)
            ? row
            : templates[0];
        return firstTemplate || (this.marketListingRowHasLayout(row) ? row : null);
    }
    protected applyMarketListingChildLayout(row: Node, template: Node | null, childName: string, fallbackX: number, fallbackY: number, fallbackWidth: number, fallbackHeight: number): void {
        const child = row.getChildByName(childName);
        if (!child?.isValid) return;

        const templateChild = template?.getChildByName(childName);
        const templateTransform = templateChild?.getComponent(UITransform);
        const position = templateChild?.position || new Vec3(fallbackX, fallbackY, 0);
        child.setPosition(position.x, position.y, 0);
        (child.getComponent(UITransform) || child.addComponent(UITransform)).setContentSize(
            templateTransform?.contentSize.width || fallbackWidth,
            templateTransform?.contentSize.height || fallbackHeight,
        );
    }
    protected syncMarketListingPriceLayout(parent: Node): void {
        const rows = parent.children
            .filter((child) => /^Market(?:Sell)?Listing_\d+$/.test(child.name) && child.active)
            .sort((a, b) => b.position.y - a.position.y);
        const template = rows.find((row) => row.getChildByName('MarketUnitPrice')?.isValid && row.getChildByName('MarketTotalPrice')?.isValid)
            || parent.getChildByName('MarketListing_1');
        if (!template?.isValid) return;

        ['MarketUnitPrice', 'MarketTotalPrice'].forEach((childName) => {
            const templateChild = template.getChildByName(childName);
            if (!templateChild?.isValid) return;
            const templateTransform = templateChild.getComponent(UITransform);
            rows.forEach((row) => {
                const child = row.getChildByName(childName);
                if (!child?.isValid || child === templateChild) return;
                child.setPosition(templateChild.position.x, templateChild.position.y, 0);
                if (templateTransform) {
                    (child.getComponent(UITransform) || child.addComponent(UITransform)).setContentSize(
                        templateTransform.contentSize.width,
                        templateTransform.contentSize.height,
                    );
                }
            });
        });
    }
    protected getMarketListingRemainingText(item: MarketListingData): string {
        const now = Date.now();
        const createdAt = Number.isFinite(item.createdAt) && (item.createdAt || 0) > 0
            ? item.createdAt as number
            : now;
        const expiresAt = Number.isFinite(item.expiresAt) && (item.expiresAt || 0) > 0
            ? item.expiresAt as number
            : createdAt + HomeConfig.MARKET_POST_EXPIRE_DURATION_MS;
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
    protected createMarketListingRow(parent: Node, item: MarketListingData, index: number, y: number): void {
        const row = this.getOrCreateEditorSkinnedNode(`MarketListing_${index + 1}`, parent, HomeConfig.MARKET_ROW_WIDTH, HomeConfig.MARKET_ROW_HEIGHT, 0, y, HomeConfig.UI_MARKET_ITEM_ROW);
        row.active = true;
        const layoutTemplate = this.getMarketListingLayoutTemplate(parent, row);
        const templateTransform = layoutTemplate?.getComponent(UITransform);
        const hasOwnLayout = layoutTemplate === row && this.marketListingRowHasLayout(row);
        row.setPosition(layoutTemplate?.position.x ?? 0, hasOwnLayout ? row.position.y : y, 0);
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
        const remain = this.getOrCreateEditorLabel(row, 'MarketRemainTime', this.getMarketListingRemainingText(item), 17, 210, 54, 170, 28, new Color(92, 65, 43, 255));
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
    
        const actionText = this.getMarketActionButtonText();
        const action = this.getOrCreateEditorSkinnedNode('MarketActionButton', row, 136, 54, 226.714, -21, HomeConfig.UI_MARKET_BUTTON);
        action.active = true;
        this.applyMarketListingChildLayout(row, layoutTemplate, 'MarketActionButton', 226.714, -21, 136, 54);
        action.setSiblingIndex(6);
        const actionLabel = this.getOrCreateEditorLabel(action, 'MarketActionLabel', actionText, 24, 0, 1, 118, 42, new Color(91, 53, 25, 255));
        actionLabel.node.active = true;
        this.applyMarketTextStyle(actionLabel, 1);
        this.bindScaledClick(action, () => this.handleMarketAction(item));
    }
    protected handleMarketAction(item: MarketListingData): void {
        const action = this.getMarketCurrentAction();
        const actionText = this.getMarketDetailActionText();
        this.openCommerceQuantityConfirm(
            this.getMarketConfirmTitle(),
            item.name,
            item.unitPrice,
            item.amount,
            actionText,
            (quantity) => this.completeMarketAction(item, action, quantity),
        );
    }
    protected applyMarketPostedListingFill(item: MarketListingData, quantity: number): void {
        const index = this.marketSellListings.findIndex((listing) => listing.id === item.id);
        if (index < 0) return;
        const listing = this.marketSellListings[index];
        const remain = Math.max(0, listing.amount - quantity);
        if (remain <= 0) {
            this.marketSellListings.splice(index, 1);
            return;
        }
        listing.amount = remain;
    }
    protected completeMarketAction(item: MarketListingData, action: 'buy' | 'sell', quantity: number): void {
        const totalPrice = this.getMarketTotalPrice(item.unitPrice, quantity);
        this.marketTransactions.unshift({
            id: `${Date.now()}_${item.id}`,
            itemId: item.itemId,
            action,
            mode: this.marketMode,
            itemName: item.name,
            amount: quantity,
            totalPrice,
            iconPath: item.iconPath,
            framePath: item.framePath,
        });
        this.applyMarketPostedListingFill(item, quantity);
        this.showToast(this.getMarketSuccessTitle(action));
        this.refreshMarketTabLabels();
        this.refreshMarketList();
    }
    protected buildMarketHistoryList(): void {
        if (!this.marketViewport?.isValid) return;
    
        const transactions = this.marketTransactions.filter((transaction) => (transaction.mode || 'trade') === this.marketMode);
        const transactionCount = Math.max(transactions.length, 1);
        const viewportTransform = this.marketViewport.getComponent(UITransform) || this.marketViewport.addComponent(UITransform);
        const viewportWidth = viewportTransform.contentSize.width || HomeConfig.MARKET_VIEWPORT_WIDTH;
        const viewportHeight = viewportTransform.contentSize.height || HomeConfig.MARKET_VIEWPORT_HEIGHT;
        const startY = viewportHeight / 2
            - HomeConfig.MARKET_HISTORY_CONTENT_Y
            - HomeConfig.MARKET_HISTORY_ROW_TOP_PADDING
            - HomeConfig.MARKET_HISTORY_ROW_HEIGHT / 2;
        const lastRowY = startY - (transactionCount - 1) * HomeConfig.MARKET_HISTORY_ROW_STEP;
        const contentBottomY = lastRowY - HomeConfig.MARKET_HISTORY_ROW_HEIGHT / 2;
        const visibleBottomAtRest = -viewportHeight / 2 - HomeConfig.MARKET_HISTORY_CONTENT_Y;
        const maxScrollY = Math.max(0, visibleBottomAtRest - contentBottomY + 24);
        const contentHeight = viewportHeight + maxScrollY;
        const listContent = this.marketViewport.getChildByName('MarketListContent');
        if (listContent?.isValid) listContent.active = false;
        this.marketContent = this.getOrCreateEditorNode('MarketHistoryContent', this.marketViewport, viewportWidth, contentHeight, 0, 0);
        this.marketContent.active = true;
        this.marketContent.setPosition(0, HomeConfig.MARKET_HISTORY_CONTENT_Y, 0);
        (this.marketContent.getComponent(UITransform) || this.marketContent.addComponent(UITransform)).setContentSize(viewportWidth, contentHeight);
        this.marketContent.children
            .filter((child) => /^MarketHistory_\d+$/.test(child.name) || child.name === 'MarketHistoryEmpty')
            .forEach((child) => {
                child.active = false;
            });
        if (transactions.length === 0) {
            const empty = this.getOrCreateEditorLabel(this.marketContent, 'MarketHistoryEmpty', this.getMarketHistoryEmptyText(), 30, 0, 260, 420, 64, new Color(92, 70, 50, 255));
            empty.node.active = true;
            this.applyMarketTextStyle(empty, 1);
            this.clampMarketListScroll(this.marketContent, 0, HomeConfig.MARKET_HISTORY_CONTENT_Y);
            return;
        }
    
        transactions.forEach((transaction, index) => {
            const row = this.getOrCreateEditorNode(`MarketHistory_${index + 1}`, this.marketContent!, viewportWidth, HomeConfig.MARKET_HISTORY_ROW_HEIGHT, 0, startY - index * HomeConfig.MARKET_HISTORY_ROW_STEP);
            row.active = true;
            row.setPosition(0, startY - index * HomeConfig.MARKET_HISTORY_ROW_STEP, 0);
            (row.getComponent(UITransform) || row.addComponent(UITransform)).setContentSize(viewportWidth, HomeConfig.MARKET_HISTORY_ROW_HEIGHT);
            const rowSkin = row.getComponent(Sprite);
            if (rowSkin) rowSkin.enabled = false;
            this.applyMarketHistoryLogRow(row, transaction);
            row.setSiblingIndex(index);
        });
    
        this.clampMarketListScroll(this.marketContent, maxScrollY, HomeConfig.MARKET_HISTORY_CONTENT_Y);
        this.bindBagGridScroll(this.marketViewport, this.marketContent, maxScrollY, HomeConfig.MARKET_HISTORY_CONTENT_Y);
        this.bindBagGridScroll(this.marketContent, this.marketContent, maxScrollY, HomeConfig.MARKET_HISTORY_CONTENT_Y);
    }
    protected applyMarketHistoryLogRow(row: Node, transaction: MarketTransactionData): void {
        ['MarketHistoryItemName', 'MarketHistoryPrice', 'MarketHistoryStatus'].forEach((nodeName) => {
            const legacyNode = row.getChildByName(nodeName);
            if (legacyNode?.isValid) legacyNode.active = false;
        });

        const richNode = this.getOrCreateEditorNode('MarketHistoryRichText', row, HomeConfig.MARKET_HISTORY_RICH_TEXT_WIDTH, HomeConfig.MARKET_HISTORY_RICH_TEXT_HEIGHT, 0, HomeConfig.MARKET_HISTORY_RICH_TEXT_Y);
        richNode.active = true;
        richNode.setPosition(0, HomeConfig.MARKET_HISTORY_RICH_TEXT_Y, 0);
        (richNode.getComponent(UITransform) || richNode.addComponent(UITransform)).setContentSize(HomeConfig.MARKET_HISTORY_RICH_TEXT_WIDTH, HomeConfig.MARKET_HISTORY_RICH_TEXT_HEIGHT);
        const label = richNode.getComponent(Label);
        if (label) label.enabled = false;
        const richText = richNode.getComponent(RichText) || richNode.addComponent(RichText);
        richText.enabled = true;
        richText.string = this.formatMarketHistoryRichText(transaction);
        richText.fontSize = HomeConfig.MARKET_HISTORY_RICH_TEXT_FONT_SIZE;
        richText.lineHeight = HomeConfig.MARKET_HISTORY_RICH_TEXT_LINE_HEIGHT;
        richText.maxWidth = HomeConfig.MARKET_HISTORY_RICH_TEXT_WIDTH;
        richText.horizontalAlign = HorizontalTextAlignment.LEFT;
        applySimKaiFontToRichText(richText);

        const divider = this.getOrCreateEditorSkinnedNode('MarketHistoryDivider', row, HomeConfig.MARKET_HISTORY_DIVIDER_WIDTH, HomeConfig.MARKET_HISTORY_DIVIDER_HEIGHT, 0, HomeConfig.MARKET_HISTORY_DIVIDER_Y, HomeConfig.UI_BEAST_RECORD_DIVIDER);
        divider.active = true;
        divider.setPosition(0, HomeConfig.MARKET_HISTORY_DIVIDER_Y, 0);
        (divider.getComponent(UITransform) || divider.addComponent(UITransform)).setContentSize(HomeConfig.MARKET_HISTORY_DIVIDER_WIDTH, HomeConfig.MARKET_HISTORY_DIVIDER_HEIGHT);
        divider.setSiblingIndex(0);
        richNode.setSiblingIndex(1);
    }
    protected formatMarketHistoryRichText(transaction: MarketTransactionData): string {
        const timeColor = '#8f7b58';
        const valueGreen = '#19b82d';
        const amountColor = '#d63030';
        const outlineColor = '#f5efe4';
        const time = this.formatMarketTransactionTime(transaction).replace(/[\uff0c,]\s*$/, '');
        const actionText = this.getMarketTransactionStatus(transaction);
        const amountText = `${this.formatMarketPrice(transaction.totalPrice)}\u5143\u5b9d`;
        const itemText = `${transaction.itemName} x${transaction.amount}`;
        return [
            `<outline color=${outlineColor} width=1>`,
            `<color=${timeColor}>${this.escapeRichText(time)}\uff0c</color>`,
            `<color=${valueGreen}>${this.escapeRichText(itemText)}</color>`,
            `<color=${timeColor}> </color>`,
            `<color=${valueGreen}>${this.escapeRichText(actionText)}</color>`,
            `<color=${amountColor}>${this.escapeRichText(amountText)}</color>`,
            '</outline>',
        ].join('');
    }
    protected formatMarketTransactionTime(transaction: MarketTransactionData): string {
        const idPrefix = `${transaction.id || ''}`.split('_')[0];
        const timestamp = Number(idPrefix);
        const date = Number.isFinite(timestamp) && timestamp > 0 ? new Date(timestamp) : new Date();
        const pad = (value: number) => {
            const text = value.toString();
            return text.length >= 2 ? text : `0${text}`;
        };
        return `${date.getFullYear()}\u5e74${pad(date.getMonth() + 1)}\u6708${pad(date.getDate())}\u65e5${pad(date.getHours())}\u65f6${pad(date.getMinutes())}\u5206\uff0c`;
    }
    protected openMarketTransactionDetail(transaction: MarketTransactionData): void {
        const listing = HomeConfig.MARKET_ITEMS.find((item) => item.itemId === transaction.itemId || item.id === transaction.itemId);
        const actionText = this.getMarketTransactionStatus(transaction);
        const totalTitle = (transaction.mode || 'trade') === 'request' ? '\u6c42\u8d2d\u603b\u4ef7' : '\u4ea4\u6613\u603b\u4ef7';
        const iconPath = transaction.iconPath || listing?.iconPath || '';
        const framePath = transaction.framePath || listing?.framePath;
        this.openCommerceItemDetail(
            transaction.itemName,
            this.getMarketRecordTitle(transaction.mode || 'trade'),
            `${actionText}\n\u6570\u91cf\uff1a${transaction.amount}\n${totalTitle}\uff1a${this.formatMarketPrice(transaction.totalPrice)} \u5143\u5b9d`,
            `${transaction.amount}`,
            iconPath,
            '\u5173\u95ed',
            () => undefined,
            framePath,
            'market',
        );
    }
    protected applyMarketTextStyle(label: Label, outlineWidth: number): void {
        applySimKaiFont(label);
        label.enableOutline = outlineWidth > 0;
        label.outlineColor = new Color(255, 249, 230, 255);
        label.outlineWidth = Math.max(0, outlineWidth);
    }
    protected getMarketTotalPrice(unitPrice: number, amount: number): number {
        return Math.round(unitPrice * amount * 100) / 100;
    }
    protected formatMarketPrice(value: number): string {
        return value.toFixed(2).replace(/\.?0+$/, '');
    }
    protected applyMarketFilterTextStyle(label: Label): void {
        applySimKaiFont(label);
        label.color = new Color(81, 59, 41, 255);
        label.enableOutline = false;
        label.outlineWidth = 0;
    }
    protected applyMarketDropdownTextStyle(label: Label, selected: boolean): void {
        applySimKaiFont(label);
        label.fontSize = HomeConfig.MARKET_DROPDOWN_LABEL_FONT_SIZE;
        label.lineHeight = HomeConfig.MARKET_DROPDOWN_LABEL_FONT_SIZE + 8;
        label.color = selected ? new Color(255, 240, 192, 255) : new Color(184, 157, 118, 255);
        label.enableOutline = selected;
        label.outlineColor = new Color(66, 34, 14, 255);
        label.outlineWidth = selected ? 2 : 0;
    }
}
