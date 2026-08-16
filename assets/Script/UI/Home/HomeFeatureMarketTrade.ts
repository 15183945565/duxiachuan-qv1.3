import {
    Color,
    HorizontalTextAlignment,
    Label,
    Node,
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
    protected clampMarketListScroll(content: Node, maxScrollY: number): void {
        const currentY = content.position.y || 0;
        content.setPosition(0, this.clamp(currentY, 0, maxScrollY), 0);
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
    protected completeMarketAction(item: MarketListingData, action: 'buy' | 'sell', quantity: number): void {
        const totalPrice = this.getMarketTotalPrice(item.unitPrice, quantity);
        this.marketTransactions.unshift({
            id: `${Date.now()}_${item.id}`,
            itemId: item.id,
            action,
            mode: this.marketMode,
            itemName: item.name,
            amount: quantity,
            totalPrice,
        });
        this.showToast(this.getMarketSuccessTitle(action));
        if (this.marketActiveTab === 'history') this.refreshMarketList();
    }
    protected buildMarketHistoryList(): void {
        if (!this.marketViewport?.isValid) return;
    
        const transactions = this.marketTransactions.filter((transaction) => (transaction.mode || 'trade') === this.marketMode);
        const transactionCount = Math.max(transactions.length, 1);
        const viewportTransform = this.marketViewport.getComponent(UITransform) || this.marketViewport.addComponent(UITransform);
        const viewportWidth = viewportTransform.contentSize.width || HomeConfig.MARKET_VIEWPORT_WIDTH;
        const viewportHeight = viewportTransform.contentSize.height || HomeConfig.MARKET_VIEWPORT_HEIGHT;
        const historyRowHeight = 80;
        const historyRowGap = 80;
        const historyTopPadding = 18;
        const contentHeight = Math.max(viewportHeight, transactionCount * historyRowGap + historyTopPadding + 24);
        const listContent = this.marketViewport.getChildByName('MarketListContent');
        if (listContent?.isValid) listContent.active = false;
        this.marketContent = this.getOrCreateEditorNode('MarketHistoryContent', this.marketViewport, viewportWidth, contentHeight, 0, 0);
        this.marketContent.active = true;
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
            this.clampMarketListScroll(this.marketContent, 0);
            return;
        }
    
        const startY = contentHeight / 2 - historyTopPadding - historyRowHeight / 2;
        transactions.forEach((transaction, index) => {
            const row = this.getOrCreateEditorNode(`MarketHistory_${index + 1}`, this.marketContent!, viewportWidth, historyRowHeight, 0, startY - index * historyRowGap);
            row.active = true;
            row.setPosition(0, startY - index * historyRowGap, 0);
            (row.getComponent(UITransform) || row.addComponent(UITransform)).setContentSize(viewportWidth, historyRowHeight);
            const rowSkin = row.getComponent(Sprite);
            if (rowSkin) rowSkin.enabled = false;
            this.applyMarketHistoryLogRow(row, transaction);
            row.setSiblingIndex(index);
            this.bindScaledClick(row, () => this.openMarketTransactionDetail(transaction));
        });
    
        const maxScrollY = Math.max(0, contentHeight - viewportHeight);
        this.clampMarketListScroll(this.marketContent, maxScrollY);
        this.bindBagGridScroll(this.marketViewport, this.marketContent, maxScrollY);
        this.bindBagGridScroll(this.marketContent, this.marketContent, maxScrollY);
    }
    protected applyMarketHistoryLogRow(row: Node, transaction: MarketTransactionData): void {
        ['MarketHistoryItemName', 'MarketHistoryPrice', 'MarketHistoryStatus'].forEach((nodeName) => {
            const legacyNode = row.getChildByName(nodeName);
            if (legacyNode?.isValid) legacyNode.active = false;
        });

        const richNode = this.getOrCreateEditorNode('MarketHistoryRichText', row, 592, 64, 0, 4);
        richNode.active = true;
        richNode.setPosition(0, 4, 0);
        (richNode.getComponent(UITransform) || richNode.addComponent(UITransform)).setContentSize(592, 64);
        const label = richNode.getComponent(Label);
        if (label) label.enabled = false;
        const richText = richNode.getComponent(RichText) || richNode.addComponent(RichText);
        richText.enabled = true;
        richText.string = this.formatMarketHistoryRichText(transaction);
        richText.fontSize = 21;
        richText.lineHeight = 28;
        richText.maxWidth = 592;
        richText.horizontalAlign = HorizontalTextAlignment.LEFT;
        applySimKaiFontToRichText(richText);

        const divider = this.getOrCreateEditorSkinnedNode('MarketHistoryDivider', row, 610, 4, 0, -36, HomeConfig.UI_BEAST_RECORD_DIVIDER);
        divider.active = true;
        divider.setPosition(0, -36, 0);
        (divider.getComponent(UITransform) || divider.addComponent(UITransform)).setContentSize(610, 4);
        divider.setSiblingIndex(0);
        richNode.setSiblingIndex(1);
    }
    protected formatMarketHistoryRichText(transaction: MarketTransactionData): string {
        const baseColor = '#ead9bd';
        const valueGreen = '#3dee30';
        const amountColor = '#ff3434';
        const outlineColor = '#1a0e08';
        const time = this.formatMarketTransactionTime(transaction);
        const actionText = this.getMarketTransactionStatus(transaction);
        const amountText = `${this.formatMarketPrice(transaction.totalPrice)}\u5143\u5b9d`;
        return [
            `<outline color=${outlineColor} width=2>`,
            `<color=${baseColor}>${this.escapeRichText(time)}</color><br/>`,
            `<color=${valueGreen}>${this.escapeRichText(transaction.itemName)}  x${transaction.amount}</color>`,
            `<color=${baseColor}>  </color>`,
            `<color=${valueGreen}>${this.escapeRichText(actionText)}</color>`,
            `<color=${baseColor}>  </color>`,
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
        const listing = HomeConfig.MARKET_ITEMS.find((item) => item.id === transaction.itemId);
        const actionText = this.getMarketTransactionStatus(transaction);
        const totalTitle = (transaction.mode || 'trade') === 'request' ? '\u6c42\u8d2d\u603b\u4ef7' : '\u4ea4\u6613\u603b\u4ef7';
        this.openCommerceItemDetail(
            transaction.itemName,
            this.getMarketRecordTitle(transaction.mode || 'trade'),
            `${actionText}\n\u6570\u91cf\uff1a${transaction.amount}\n${totalTitle}\uff1a${this.formatMarketPrice(transaction.totalPrice)} \u5143\u5b9d`,
            `${transaction.amount}`,
            listing?.iconPath || HomeConfig.UI_SHOP_JADE_PACK_1,
            '\u5173\u95ed',
            () => undefined,
            listing?.framePath || HomeConfig.UI_SHOP_ITEM_FRAME_LV7,
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
