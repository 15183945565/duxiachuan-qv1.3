import {
    Color,
    EditBox,
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
    protected commerceQuantityInputSyncing = false;

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
        close.off(Node.EventType.TOUCH_END);
        close.active = false;
        close.setScale(0, 0, 1);
        close.setPosition(0, -2000, 0);
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
            HomeConfig.SHARED_CONFIRM_BOARD_WIDTH,
            HomeConfig.SHARED_CONFIRM_BOARD_HEIGHT,
            0,
            0,
            HomeConfig.UI_CONFIRM_POPUP_BG,
        );
        board.setSiblingIndex(1);

        const titleSkin = this.getOrCreateConfirmSkin(
            board,
            popup,
            'ConfirmPopupTitleSkin',
            HomeConfig.SHARED_CONFIRM_TITLE_WIDTH,
            HomeConfig.SHARED_CONFIRM_TITLE_HEIGHT,
            0,
            HomeConfig.SHARED_CONFIRM_TITLE_Y,
            HomeConfig.UI_CONFIRM_TITLE_BG,
        );
        titleSkin.active = true;
        titleSkin.setSiblingIndex(1);

        const title = this.getOrCreateConfirmLabel(
            board,
            popup,
            'ConfirmPopupTitle',
            titleText || '\u63d0\u793a\u8bf4\u660e',
            HomeConfig.SHARED_CONFIRM_TITLE_FONT_SIZE,
            0,
            HomeConfig.SHARED_CONFIRM_TITLE_Y,
            HomeConfig.SHARED_CONFIRM_TITLE_LABEL_WIDTH,
            HomeConfig.SHARED_CONFIRM_TITLE_LABEL_HEIGHT,
            new Color(126, 74, 36, 255),
        );
        title.lineHeight = HomeConfig.SHARED_CONFIRM_TITLE_LINE_HEIGHT;
        title.overflow = Overflow.SHRINK;
        this.setLabelOutline(title, new Color(255, 245, 215, 255), 2);
        title.node.setSiblingIndex(2);

        const messageBg = this.getOrCreateConfirmChild(board, popup, 'ConfirmMessageBg', HomeConfig.SHARED_CONFIRM_MESSAGE_WIDTH, HomeConfig.SHARED_CONFIRM_MESSAGE_HEIGHT, 0, HomeConfig.SHARED_CONFIRM_MESSAGE_Y);
        this.hideCommerceConfirmMessageBg(messageBg);
        messageBg.setSiblingIndex(3);

        const message = this.getOrCreateConfirmRichText(
            board,
            popup,
            'ConfirmMessage',
            '',
            28,
            0,
            HomeConfig.SHARED_CONFIRM_MESSAGE_Y,
            HomeConfig.SHARED_CONFIRM_MESSAGE_WIDTH,
            HomeConfig.SHARED_CONFIRM_MESSAGE_HEIGHT,
        );
        message.lineHeight = 40;
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
            HomeConfig.SHARED_CONFIRM_BUTTON_WIDTH,
            HomeConfig.SHARED_CONFIRM_BUTTON_HEIGHT,
            HomeConfig.SHARED_CONFIRM_CANCEL_BUTTON_X,
            HomeConfig.SHARED_CONFIRM_BUTTON_Y,
            HomeConfig.UI_CONFIRM_BUTTON_BG,
        );
        cancel.setPosition(HomeConfig.SHARED_CONFIRM_CANCEL_BUTTON_X, HomeConfig.SHARED_CONFIRM_BUTTON_Y, 0);
        cancel.setSiblingIndex(6);

        const cancelLabel = this.getOrCreateConfirmLabel(
            cancel,
            popup,
            'ConfirmCancelButtonLabel',
            '\u53d6\u6d88',
            HomeConfig.SHARED_CONFIRM_BUTTON_FONT_SIZE,
            0,
            HomeConfig.SHARED_CONFIRM_BUTTON_LABEL_Y,
            HomeConfig.SHARED_CONFIRM_BUTTON_LABEL_WIDTH,
            HomeConfig.SHARED_CONFIRM_BUTTON_LABEL_HEIGHT,
            new Color(255, 238, 218, 255),
        );
        cancelLabel.lineHeight = HomeConfig.SHARED_CONFIRM_BUTTON_LINE_HEIGHT;
        this.setLabelOutline(cancelLabel, new Color(94, 36, 35, 255), 2);
        cancelLabel.node.setSiblingIndex(1);

        const accept = this.getOrCreateConfirmSkinKeepingEditorLayout(
            board,
            popup,
            'ConfirmAcceptButton',
            HomeConfig.SHARED_CONFIRM_BUTTON_WIDTH,
            HomeConfig.SHARED_CONFIRM_BUTTON_HEIGHT,
            HomeConfig.SHARED_CONFIRM_ACCEPT_BUTTON_X,
            HomeConfig.SHARED_CONFIRM_BUTTON_Y,
            HomeConfig.UI_CONFIRM_BUTTON_BG,
        );
        accept.setPosition(HomeConfig.SHARED_CONFIRM_ACCEPT_BUTTON_X, HomeConfig.SHARED_CONFIRM_BUTTON_Y, 0);
        accept.setSiblingIndex(7);

        const acceptLabel = this.getOrCreateConfirmLabel(
            accept,
            popup,
            'ConfirmAcceptButtonLabel',
            '\u786e\u5b9a',
            HomeConfig.SHARED_CONFIRM_BUTTON_FONT_SIZE,
            0,
            HomeConfig.SHARED_CONFIRM_BUTTON_LABEL_Y,
            HomeConfig.SHARED_CONFIRM_BUTTON_LABEL_WIDTH,
            HomeConfig.SHARED_CONFIRM_BUTTON_LABEL_HEIGHT,
            new Color(255, 238, 218, 255),
        );
        acceptLabel.lineHeight = HomeConfig.SHARED_CONFIRM_BUTTON_LINE_HEIGHT;
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
    protected setupCommerceQuantityEditBox(valueLabel: Label): EditBox | null {
        const valueNode = valueLabel.node;
        const staleEditBox = valueNode.getComponent(EditBox);
        if (staleEditBox) staleEditBox.destroy();

        let inputNode = valueNode.getChildByName('ConfirmQuantityInputTouch');
        if (!inputNode?.isValid) {
            inputNode = this.createNode('ConfirmQuantityInputTouch', valueNode, 118, 28, 0, 0);
        }
        inputNode.active = true;
        inputNode.setPosition(0, 0, 0);
        inputNode.setSiblingIndex(10);
        (inputNode.getComponent(UITransform) || inputNode.addComponent(UITransform)).setContentSize(118, 28);

        const hiddenColor = new Color(255, 255, 255, 0);
        const textLabel = this.getOrCreateConfirmLabel(inputNode, inputNode, 'TEXT_LABEL', '', 25, 0, 0, 118, 28, hiddenColor);
        textLabel.node.active = true;
        textLabel.color = hiddenColor;
        textLabel.horizontalAlign = HorizontalTextAlignment.CENTER;
        const placeholderLabel = this.getOrCreateConfirmLabel(inputNode, inputNode, 'PLACEHOLDER_LABEL', '', 25, 0, 0, 118, 28, hiddenColor);
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
        const textColor = new Color(255, 255, 255, 0);
        editBoxCompat.textLabel = textLabel;
        editBoxCompat.placeholderLabel = placeholderLabel;
        editBoxCompat.inputMode = inputMode?.NUMERIC ?? inputMode?.PHONE_NUMBER ?? inputMode?.SINGLE_LINE ?? 2;
        editBoxCompat.inputFlag = inputFlag?.SENSITIVE ?? 1;
        editBoxCompat.returnType = returnType?.DONE ?? 0;
        editBoxCompat.fontSize = 25;
        editBoxCompat.placeholderFontSize = 25;
        editBoxCompat.fontColor = textColor;
        editBoxCompat.placeholderFontColor = textColor;
        editBoxCompat.cursorColor = textColor;
        editBoxCompat.backgroundImage = null;
        editBoxCompat.placeholder = '';
        editBoxCompat.maxLength = Math.max(1, `${this.commerceQuantityMax}`.length);
        editBoxCompat.lineHeight = 28;
        editBoxCompat._textLabel = textLabel;
        editBoxCompat._placeholderLabel = placeholderLabel;
        editBoxCompat._inputMode = editBoxCompat.inputMode;
        editBoxCompat._inputFlag = editBoxCompat.inputFlag;
        editBoxCompat._returnType = editBoxCompat.returnType;
        editBoxCompat._fontSize = 25;
        editBoxCompat._placeholderFontSize = 25;
        editBoxCompat._fontColor = textColor;
        editBoxCompat._placeholderFontColor = textColor;
        editBoxCompat._cursorColor = textColor;
        editBoxCompat._backgroundImage = null;
        editBoxCompat._placeholder = '';
        editBoxCompat._maxLength = editBoxCompat.maxLength;
        editBoxCompat._lineHeight = 28;
        return editBox;
    }
    protected syncCommerceQuantityEditBox(editBox: EditBox, text: string): void {
        this.commerceQuantityInputSyncing = true;
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
        this.commerceQuantityInputSyncing = false;
    }
    protected getCommerceQuantityEditBoxEventType(name: 'TEXT_CHANGED' | 'EDITING_DID_ENDED' | 'EDITING_RETURN'): string {
        const eventType = EditBox as unknown as { EventType?: Record<string, string> };
        return eventType.EventType?.[name] || {
            TEXT_CHANGED: 'text-changed',
            EDITING_DID_ENDED: 'editing-did-ended',
            EDITING_RETURN: 'editing-return',
        }[name];
    }
    protected applyCommerceQuantityInput(editBox: EditBox, commit: boolean, refresh: () => void): void {
        if (this.commerceQuantityInputSyncing) return;
        const maxQuantity = Math.max(1, Math.floor(this.commerceQuantityMax));
        const maxDigits = Math.max(1, `${maxQuantity}`.length);
        const raw = editBox.string || '';
        let clean = raw.replace(/\D/g, '').slice(0, maxDigits);
        if (!clean) {
            if (!commit) {
                this.syncCommerceQuantityEditBox(editBox, '');
                return;
            }
            clean = '1';
        }
        const parsed = Number.parseInt(clean, 10);
        const nextQuantity = this.clamp(Number.isFinite(parsed) ? parsed : 1, 1, maxQuantity);
        this.commerceQuantity = nextQuantity;
        this.syncCommerceQuantityEditBox(editBox, `${nextQuantity}`);
        refresh();
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
        let quantityEditBox: EditBox | null = null;
        let refresh = (): void => undefined;
        this.openSharedFlowPopup('ConfirmPopup', {
            title,
            variant: 'commerceQuantityConfirm',
            onConfirm: () => {
                if (quantityEditBox?.isValid) {
                    this.applyCommerceQuantityInput(quantityEditBox, true, refresh);
                }
                onConfirm(this.commerceQuantity);
            },
        });
        const popup = this.popupRoot?.getChildByName('ConfirmPopup') || this.findNode('ConfirmPopup');
        if (!popup?.isValid) return;
        const { quantityValue, message } = this.layoutCommerceQuantityConfirmPopup(popup, title, actionText, itemName, unitPrice, currencyName);
        if (quantityValue) {
            quantityEditBox = this.setupCommerceQuantityEditBox(quantityValue);
        }
        refresh = () => {
            if (quantityValue) quantityValue.string = `${this.commerceQuantity}`;
            if (quantityEditBox?.isValid) this.syncCommerceQuantityEditBox(quantityEditBox, `${this.commerceQuantity}`);
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
        if (quantityEditBox?.isValid) {
            const inputNode = quantityEditBox.node;
            inputNode.targetOff(this);
            inputNode.on(this.getCommerceQuantityEditBoxEventType('TEXT_CHANGED'), () => this.applyCommerceQuantityInput(quantityEditBox!, false, refresh), this);
            inputNode.on(this.getCommerceQuantityEditBoxEventType('EDITING_DID_ENDED'), () => this.applyCommerceQuantityInput(quantityEditBox!, true, refresh), this);
            inputNode.on(this.getCommerceQuantityEditBoxEventType('EDITING_RETURN'), () => this.applyCommerceQuantityInput(quantityEditBox!, true, refresh), this);
        }
        refresh();
    }
}
