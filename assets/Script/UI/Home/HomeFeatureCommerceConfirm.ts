import {
    Color,
    Graphics,
    HorizontalTextAlignment,
    Label,
    Node,
    Overflow,
    RichText,
    Sprite,
    UITransform,
    VerticalTextAlignment,
} from 'cc';
import { applySimKaiFont } from '../Common/UIFont';
import * as HomeConfig from './HomeConfig';
import { HomeViewBase } from './HomeViewBase';

abstract class HomeFeatureCommerceConfirmHost extends HomeViewBase {
    protected abstract setLabelOutline(label: Label, color: Color, width: number): void;
}

/**
 * 交易数量确认弹窗的节点构造、富文本、数量步进和确认回调。
 *
 * 数量状态由 Home 基础状态持有；模块只负责弹窗展示和交互编排。
 */
export abstract class HomeFeatureCommerceConfirm extends HomeFeatureCommerceConfirmHost {
    protected getOrCreateConfirmChild(parent: Node, popup: Node, name: string, width: number, height: number, x: number, y: number): Node {
        let node = this.findNode(name, popup);
        if (!node?.isValid) {
            node = this.createNode(name, parent, width, height, x, y);
        }
        if (node.parent !== parent) {
            node.setParent(parent);
        }
        node.active = true;
        node.setPosition(x, y, 0);
        (node.getComponent(UITransform) || node.addComponent(UITransform)).setContentSize(width, height);
        return node;
    }
    protected getOrCreateConfirmSkin(parent: Node, popup: Node, name: string, width: number, height: number, x: number, y: number, skinPath: string): Node {
        const node = this.getOrCreateConfirmChild(parent, popup, name, width, height, x, y);
        this.applyUiSkin(node, skinPath, width, height);
        return node;
    }
    protected getOrCreateConfirmSkinKeepingEditorLayout(parent: Node, popup: Node, name: string, fallbackWidth: number, fallbackHeight: number, fallbackX: number, fallbackY: number, skinPath: string): Node {
        const existingNode = this.findNode(name, popup);
        const node = existingNode?.isValid
            ? existingNode
            : this.createNode(name, parent, fallbackWidth, fallbackHeight, fallbackX, fallbackY);
        if (node.parent !== parent) {
            node.setParent(parent);
        }
        node.active = true;
        const transform = node.getComponent(UITransform) || node.addComponent(UITransform);
        const currentSize = transform.contentSize;
        const width = currentSize.width > 0 ? currentSize.width : fallbackWidth;
        const height = currentSize.height > 0 ? currentSize.height : fallbackHeight;
        transform.setContentSize(width, height);
        this.applyUiSkin(node, skinPath, width, height);
        return node;
    }
    protected getOrCreateConfirmLabel(parent: Node, popup: Node, name: string, text: string, fontSize: number, x: number, y: number, width: number, height: number, color: Color): Label {
        const node = this.getOrCreateConfirmChild(parent, popup, name, width, height, x, y);
        const label = node.getComponent(Label) || node.addComponent(Label);
        applySimKaiFont(label);
        label.enabled = true;
        label.string = text;
        label.fontSize = fontSize;
        label.lineHeight = fontSize + 8;
        label.color = color;
        label.horizontalAlign = HorizontalTextAlignment.CENTER;
        label.verticalAlign = VerticalTextAlignment.CENTER;
        return label;
    }
    protected getOrCreateConfirmRichText(parent: Node, popup: Node, name: string, text: string, fontSize: number, x: number, y: number, width: number, height: number): RichText {
        const node = this.getOrCreateConfirmChild(parent, popup, name, width, height, x, y);
        const label = node.getComponent(Label);
        if (label) label.enabled = false;
        const richText = node.getComponent(RichText) || node.addComponent(RichText);
        richText.string = text;
        richText.fontSize = fontSize;
        richText.lineHeight = fontSize + 10;
        richText.maxWidth = width;
        richText.horizontalAlign = HorizontalTextAlignment.CENTER;
        return richText;
    }
    protected escapeRichText(value: string): string {
        return value
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }
    protected formatPlainConfirmRichText(message: string): string {
        return `<outline color=#fff7dc width=1><color=#6f462a>${this.escapeRichText(message)}</color></outline>`;
    }
    protected formatCommercePrice(value: number): string {
        return value.toFixed(2).replace(/\.?0+$/, '');
    }
    protected formatCommerceQuantityConfirmMessage(actionText: string, itemName: string, unitPrice: number, currencyName = '\u5143\u5b9d'): string {
        const quantity = this.commerceQuantity;
        const totalPrice = this.formatCommercePrice(unitPrice * quantity);
        if (actionText === '\u8d2d\u4e70') {
            return `\u662f\u5426\u786e\u5b9a\u6d88\u8017${totalPrice}${currencyName}${actionText}${itemName} x${quantity}\uff1f`;
        }
        return `\u662f\u5426\u786e\u5b9a${actionText}${itemName} x${quantity}\uff1f\n\u603b\u4ef7\uff1a${totalPrice}`;
    }
    protected formatCommerceQuantityConfirmRichMessage(actionText: string, itemName: string, unitPrice: number, currencyName = '\u5143\u5b9d'): string {
        const quantity = this.commerceQuantity;
        const totalPrice = this.formatCommercePrice(unitPrice * quantity);
        const red = '#d83a2e';
        const normal = '#6f462a';
        const itemNameText = this.escapeRichText(itemName);
        const actionTextSafe = this.escapeRichText(actionText);
        const currencyNameText = this.escapeRichText(currencyName);
        if (actionText === '\u8d2d\u4e70') {
            return `<outline color=#fff7dc width=1><color=${normal}>\u662f\u5426\u786e\u5b9a\u6d88\u8017</color><color=${red}>${totalPrice}</color><color=${normal}>${currencyNameText}${actionTextSafe}${itemNameText} x</color><color=${red}>${quantity}</color><color=${normal}>\uff1f</color></outline>`;
        }
        return `<outline color=#fff7dc width=1><color=${normal}>\u662f\u5426\u786e\u5b9a${actionTextSafe}${itemNameText} x</color><color=${red}>${quantity}</color><color=${normal}>\uff1f\n\u603b\u4ef7\uff1a</color><color=${red}>${totalPrice}</color></outline>`;
    }
    protected hideCommerceConfirmForeignNodes(popup: Node): void {
        [
            'MagicMonsterRoomQuestion',
            'MagicMonsterRoomHpCaption',
            'MagicMonsterRoomHpFrame',
            'MagicMonsterRoomHpBar',
            'MagicMonsterRoomCount',
        ].forEach((nodeName) => {
            const node = this.findNode(nodeName, popup);
            if (!node?.isValid) return;
            node.active = false;
            node.setPosition(0, -2000, 0);
        });
    }
    protected hideCommerceConfirmCloseButton(popup: Node): void {
        const close = this.findNode('ConfirmPopupClose', popup);
        if (!close?.isValid) return;
        close.active = false;
        close.setScale(0, 0, 1);
    }
    protected layoutCommerceQuantityConfirmPopup(
        popup: Node,
        titleText: string,
        actionText: string,
        itemName: string,
        unitPrice: number,
        currencyName = '\u5143\u5b9d',
    ): { quantityValue: Label | null; message: RichText | null } {
        this.hideCommerceConfirmForeignNodes(popup);
        this.hideCommerceConfirmCloseButton(popup);

        const popupTransform = popup.getComponent(UITransform) || popup.addComponent(UITransform);
        popupTransform.setContentSize(HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT);

        const board = this.getOrCreateConfirmSkin(
            popup,
            popup,
            'ConfirmPopupBoard',
            725,
            505,
            0,
            0,
            HomeConfig.UI_CONFIRM_POPUP_BG,
        );
        board.setSiblingIndex(1);

        const titleSkin = this.getOrCreateConfirmSkin(
            board,
            popup,
            'ConfirmPopupTitleSkin',
            486,
            84,
            0,
            169,
            HomeConfig.UI_CONFIRM_TITLE_BG,
        );
        titleSkin.setSiblingIndex(1);

        const title = this.getOrCreateConfirmLabel(
            board,
            popup,
            'ConfirmPopupTitle',
            titleText || '\u63d0\u793a\u8bf4\u660e',
            30,
            0,
            169,
            280,
            52,
            new Color(126, 74, 36, 255),
        );
        title.lineHeight = 38;
        title.overflow = Overflow.SHRINK;
        this.setLabelOutline(title, new Color(255, 245, 215, 255), 2);
        title.node.setSiblingIndex(2);

        const messageBg = this.getOrCreateConfirmChild(board, popup, 'ConfirmMessageBg', 620, 116, 0, 66);
        this.hideCommerceConfirmMessageBg(messageBg);
        messageBg.setSiblingIndex(3);

        const message = this.getOrCreateConfirmRichText(
            board,
            popup,
            'ConfirmMessage',
            '',
            24,
            0,
            66,
            560,
            42.84,
        );
        message.lineHeight = 34;
        message.node.setSiblingIndex(4);

        const quantityRoot = this.getOrCreateConfirmChild(board, popup, 'ConfirmQuantityRoot', 300, 46, 0, -58);
        quantityRoot.setSiblingIndex(5);

        const quantityBg = this.getOrCreateConfirmSkin(
            quantityRoot,
            popup,
            'ConfirmQuantityBg',
            171,
            23,
            0,
            0,
            HomeConfig.UI_GIFT_TRANSLUCENT_BAR,
        );
        quantityBg.setSiblingIndex(0);

        const minus = this.getOrCreateConfirmSkin(
            quantityRoot,
            popup,
            'ConfirmQuantityMinus',
            41,
            41,
            -106,
            0,
            HomeConfig.UI_SHOP_QUANTITY_MINUS_BUTTON,
        );
        minus.setSiblingIndex(1);

        const quantityValue = this.getOrCreateConfirmLabel(
            quantityRoot,
            popup,
            'ConfirmQuantityValue',
            '1',
            25,
            0,
            0,
            118,
            28,
            Color.WHITE,
        );
        quantityValue.lineHeight = 28;
        this.setLabelOutline(quantityValue, new Color(46, 38, 34, 255), 2);
        quantityValue.node.setSiblingIndex(2);

        const plus = this.getOrCreateConfirmSkin(
            quantityRoot,
            popup,
            'ConfirmQuantityPlus',
            41,
            41,
            106,
            0,
            HomeConfig.UI_SHOP_QUANTITY_PLUS_BUTTON,
        );
        plus.setSiblingIndex(3);

        const cancel = this.getOrCreateConfirmSkinKeepingEditorLayout(
            board,
            popup,
            'ConfirmCancelButton',
            162,
            62,
            -113.38800000000003,
            -155,
            HomeConfig.UI_CONFIRM_BUTTON_BG,
        );
        cancel.setPosition(-113.38800000000003, -155, 0);
        cancel.setSiblingIndex(6);

        const cancelLabel = this.getOrCreateConfirmLabel(
            cancel,
            popup,
            'ConfirmCancelButtonLabel',
            '\u53d6\u6d88',
            31,
            0,
            1,
            132,
            42,
            new Color(255, 238, 218, 255),
        );
        cancelLabel.lineHeight = 38;
        this.setLabelOutline(cancelLabel, new Color(94, 36, 35, 255), 2);
        cancelLabel.node.setSiblingIndex(1);

        const accept = this.getOrCreateConfirmSkinKeepingEditorLayout(
            board,
            popup,
            'ConfirmAcceptButton',
            162,
            62,
            121.71900000000005,
            -155,
            HomeConfig.UI_CONFIRM_BUTTON_BG,
        );
        accept.setPosition(121.71900000000005, -155, 0);
        accept.setSiblingIndex(7);

        const acceptLabel = this.getOrCreateConfirmLabel(
            accept,
            popup,
            'ConfirmAcceptButtonLabel',
            '\u786e\u5b9a',
            31,
            0,
            1,
            132,
            42,
            new Color(255, 238, 218, 255),
        );
        acceptLabel.lineHeight = 38;
        this.setLabelOutline(acceptLabel, new Color(28, 85, 82, 255), 2);
        acceptLabel.node.setSiblingIndex(1);

        [
            'ConfirmQuantityCaption',
            'ConfirmQuantityMinusLabel',
            'ConfirmQuantityPlusLabel',
        ].forEach((nodeName) => {
            const node = this.findNode(nodeName, popup);
            if (node?.isValid) node.active = false;
        });
        this.hideCommerceConfirmCloseButton(popup);

        const refreshMessage = (): void => {
            message.string = this.formatCommerceQuantityConfirmRichMessage(actionText, itemName, unitPrice, currencyName);
        };
        refreshMessage();

        return { quantityValue, message };
    }
    protected hideCommerceConfirmMessageBg(messageBg: Node | null): void {
        if (!messageBg?.isValid) return;

        this.skinApplyVersions.set(messageBg, ++this.skinApplyVersion);
        messageBg.active = false;
        const sprite = messageBg.getComponent(Sprite);
        if (sprite) sprite.enabled = false;
        const graphics = messageBg.getComponent(Graphics);
        if (graphics) graphics.enabled = false;
    }
    protected openCommerceQuantityConfirm(
        title: string,
        itemName: string,
        unitPrice: number,
        maxQuantity: number,
        actionText: string,
        onConfirm: (quantity: number) => void,
        currencyName = '\u5143\u5b9d',
    ): void {
        this.commerceQuantity = 1;
        this.commerceQuantityMax = Math.max(1, Math.floor(maxQuantity));
        this.openSharedFlowPopup('ConfirmPopup', {
            title,
            variant: 'commerceQuantityConfirm',
            onConfirm: () => onConfirm(this.commerceQuantity),
        });
        const popup = this.popupRoot?.getChildByName('ConfirmPopup') || this.findNode('ConfirmPopup');
        if (!popup?.isValid) return;
        const { quantityValue, message } = this.layoutCommerceQuantityConfirmPopup(popup, title, actionText, itemName, unitPrice, currencyName);
        const refresh = () => {
            if (quantityValue) quantityValue.string = `${this.commerceQuantity}`;
            if (message) message.string = this.formatCommerceQuantityConfirmRichMessage(actionText, itemName, unitPrice, currencyName);
        };
        const minus = this.findNode('ConfirmQuantityMinus', popup);
        const plus = this.findNode('ConfirmQuantityPlus', popup);
        if (minus) this.bindScaledClick(minus, () => {
            if (this.commerceQuantity <= 1) {
                this.showToast('\u6570\u91cf\u4e0d\u80fd\u4f4e\u4e8e1');
                refresh();
                return;
            }
            this.commerceQuantity = Math.max(1, this.commerceQuantity - 1);
            refresh();
        });
        if (plus) this.bindScaledClick(plus, () => {
            if (this.commerceQuantity >= this.commerceQuantityMax) {
                this.showToast(`\u6570\u91cf\u5df2\u8fbe\u5230\u4e0a\u9650\uff1a${this.commerceQuantityMax}`);
                refresh();
                return;
            }
            this.commerceQuantity = Math.min(this.commerceQuantityMax, this.commerceQuantity + 1);
            refresh();
        });
        refresh();
    }
}
