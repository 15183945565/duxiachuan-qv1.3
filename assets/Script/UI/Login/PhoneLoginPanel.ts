import {
    _decorator,
    Color,
    Component,
    EditBox,
    EventTouch,
    HorizontalTextAlignment,
    Label,
    Node,
    Overflow,
    Sprite,
    SpriteFrame,
    Tween,
    UITransform,
    Vec3,
    VerticalTextAlignment,
    tween,
} from 'cc';
import { ResourceManager, ResourceScope } from '../../Managers/ResourceManager';
import { AuthService, PhoneLoginResult } from '../../Services/AuthService';
import { applySimKaiFont } from '../Common/UIFont';

const { ccclass } = _decorator;

interface PhoneLoginPanelOptions {
    onLoginSuccess?: (result: PhoneLoginResult) => void;
}

interface FieldBinding {
    editBox: EditBox;
}

const INPUT_TEXT_COLOR = new Color(78, 51, 36, 255);
const PLACEHOLDER_TEXT_COLOR = new Color(146, 118, 94, 255);
const FALLBACK_INPUT_HORIZONTAL_PADDING = 32;
const FALLBACK_INPUT_TOUCH_HEIGHT = 56;
const FALLBACK_CODE_BUTTON_TEXT_GAP = 20;
const FALLBACK_NATIVE_TEXT_INSET = 2;
const BUTTON_PRESS_SCALE = 0.94;
const BUTTON_PRESS_DURATION = 0.07;
const BUTTON_RELEASE_DURATION = 0.12;
const CODE_BUTTON_BG_PATH = 'Texture/Login/login_code_button_bg';
const CODE_BUTTON_WIDTH = 178;
const CODE_BUTTON_HEIGHT = 92;
const CODE_BUTTON_X = 165;
const CODE_BUTTON_LABEL = '\u83b7\u53d6\u9a8c\u8bc1\u7801';

@ccclass('PhoneLoginPanel')
export class PhoneLoginPanel extends Component {
    private readonly resourceScope: ResourceScope = ResourceManager.instance.createScope('PhoneLoginPanel');
    private inputNode: Node | null = null;
    private codeNode: Node | null = null;
    private loginButtonNode: Node | null = null;
    private codeButtonNode: Node | null = null;
    private codeButtonLabel: Label | null = null;
    private statusLabel: Label | null = null;
    private phoneEditBox: EditBox | null = null;
    private codeEditBox: EditBox | null = null;
    private options: PhoneLoginPanelOptions = {};
    private isLoggingIn = false;
    private loginButtonBaseScale = new Vec3(1, 1, 1);
    private codeButtonBaseScale = new Vec3(1, 1, 1);
    private phonePlaceholder = '\u8bf7\u8f93\u5165\u624b\u673a\u53f7';
    private codePlaceholder = '\u8bf7\u8f93\u5165\u9a8c\u8bc1\u7801';

    public setup(options: PhoneLoginPanelOptions): void {
        this.options = options;
        this.resolveNodes();
        this.restoreNativeCaret();
        this.createEditBox();
        this.bindEvents();
        this.setStatus('');
    }

    public show(): void {
        this.node.active = true;
        this.setStatus('');
    }

    public hide(): void {
        this.phoneEditBox?.blur();
        this.codeEditBox?.blur();
        this.node.active = false;
        this.setInputCursor(false);
    }

    protected onDestroy(): void {
        this.safeOff(this.loginButtonNode, Node.EventType.TOUCH_START, this.onLoginTouchStart);
        this.safeOff(this.loginButtonNode, Node.EventType.TOUCH_CANCEL, this.onLoginTouchCancel);
        this.safeOff(this.loginButtonNode, Node.EventType.TOUCH_END, this.onLoginClicked);
        this.safeOff(this.codeButtonNode, Node.EventType.TOUCH_START, this.onCodeButtonTouchStart);
        this.safeOff(this.codeButtonNode, Node.EventType.TOUCH_CANCEL, this.onCodeButtonTouchCancel);
        this.safeOff(this.codeButtonNode, Node.EventType.TOUCH_END, this.onCodeButtonClicked);
        this.safeOff(this.codeButtonNode, Node.EventType.MOUSE_ENTER, this.onButtonMouseEnter);
        this.safeOff(this.codeButtonNode, Node.EventType.MOUSE_LEAVE, this.onButtonMouseLeave);
        this.safeOff(this.inputNode, Node.EventType.MOUSE_ENTER, this.onInputMouseEnter);
        this.safeOff(this.inputNode, Node.EventType.MOUSE_LEAVE, this.onInputMouseLeave);
        this.safeOff(this.codeNode, Node.EventType.MOUSE_ENTER, this.onInputMouseEnter);
        this.safeOff(this.codeNode, Node.EventType.MOUSE_LEAVE, this.onInputMouseLeave);
        this.setInputCursor(false);
        this.resourceScope.dispose();
    }

    private resolveNodes(): void {
        this.inputNode = this.node.getChildByName('InputPhone');
        this.codeNode = this.node.getChildByName('InputCode');
        this.loginButtonNode = this.node.getChildByName('BtnPhoneLogin');
        this.codeButtonNode = this.node.getChildByName('BtnGetCode');
        this.codeButtonLabel = this.codeButtonNode?.getChildByName('LabelGetCode')?.getComponent(Label) || null;
        this.statusLabel = this.node.getChildByName('LabelLoginStatus')?.getComponent(Label) || null;
    }

    private createEditBox(): void {
        if (this.inputNode) {
            this.phonePlaceholder = this.resolvePlaceholder(this.inputNode, this.phonePlaceholder);
            const phoneField = this.setupOneEditBox(this.inputNode, this.phonePlaceholder, 11, this.readEditBoxValue(this.inputNode));
            this.phoneEditBox = phoneField.editBox;
        }

        if (this.codeNode) {
            this.codePlaceholder = this.resolvePlaceholder(this.codeNode, this.codePlaceholder);
            const codeField = this.setupOneEditBox(this.codeNode, this.codePlaceholder, 6, this.readEditBoxValue(this.codeNode));
            this.codeEditBox = codeField.editBox;
            this.setupCodeButton();
        }
    }

    private setupCodeButton(): void {
        if (!this.codeNode) return;

        let createdButton = false;
        if (!this.codeButtonNode || !this.codeButtonNode.isValid) {
            this.codeButtonNode = new Node('BtnGetCode');
            this.codeButtonNode.setParent(this.node);
            createdButton = true;
        }

        let transform = this.codeButtonNode.getComponent(UITransform);
        if (createdButton) {
            this.codeButtonNode.layer = this.node.layer;
            this.codeButtonNode.active = true;
            transform = this.codeButtonNode.addComponent(UITransform);
            this.codeButtonNode.setPosition(new Vec3(CODE_BUTTON_X, this.codeNode.position.y, 0));
            transform.setAnchorPoint(0.5, 0.5);
            transform.setContentSize(CODE_BUTTON_WIDTH, CODE_BUTTON_HEIGHT);
            const sprite = this.codeButtonNode.addComponent(Sprite);
            const fallbackFrame = this.codeNode.getComponent(Sprite)?.spriteFrame || null;
            sprite.enabled = !!fallbackFrame;
            sprite.type = Sprite.Type.SIMPLE;
            sprite.sizeMode = Sprite.SizeMode.CUSTOM;
            if (fallbackFrame) {
                sprite.spriteFrame = fallbackFrame;
            }
            void this.loadCodeButtonSpriteFrame()
                .then((spriteFrame) => {
                    if (sprite.isValid) {
                        sprite.spriteFrame = spriteFrame;
                        sprite.enabled = true;
                    }
                })
                .catch((err) => {
                    console.warn('[PhoneLoginPanel] get code button texture missing', err);
                });
        }

        let createdLabel = false;
        if (!this.codeButtonLabel || !this.codeButtonLabel.isValid) {
            const labelNode = this.codeButtonNode.getChildByName('LabelGetCode') || new Node('LabelGetCode');
            labelNode.setParent(this.codeButtonNode);
            this.codeButtonLabel = labelNode.getComponent(Label) || labelNode.addComponent(Label);
            applySimKaiFont(this.codeButtonLabel);
            createdLabel = true;
        }

        if (createdLabel) {
            const labelNode = this.codeButtonLabel.node;
            const labelTransform = labelNode.getComponent(UITransform) || labelNode.addComponent(UITransform);
            const buttonSize = transform?.contentSize;
            labelNode.layer = this.codeButtonNode.layer;
            labelNode.setPosition(new Vec3(0, 0, 0));
            labelTransform.setAnchorPoint(0.5, 0.5);
            labelTransform.setContentSize(
                buttonSize?.width || CODE_BUTTON_WIDTH,
                Math.max(44, buttonSize?.height || CODE_BUTTON_HEIGHT),
            );
            applySimKaiFont(this.codeButtonLabel);
            this.codeButtonLabel.string = CODE_BUTTON_LABEL;
            this.codeButtonLabel.color = new Color(255, 255, 255, 255);
            this.codeButtonLabel.enableOutline = true;
            this.codeButtonLabel.outlineColor = new Color(0, 0, 0, 255);
            this.codeButtonLabel.outlineWidth = 2;
            this.codeButtonLabel.fontSize = 22;
            this.codeButtonLabel.lineHeight = 30;
            this.codeButtonLabel.horizontalAlign = HorizontalTextAlignment.CENTER;
            this.codeButtonLabel.verticalAlign = VerticalTextAlignment.CENTER;
            this.codeButtonLabel.overflow = Overflow.CLAMP;
            this.codeButtonLabel.enableWrapText = false;
        }

        this.codeButtonBaseScale = this.codeButtonNode.scale.clone();
        this.codeButtonNode.off(Node.EventType.TOUCH_START, this.onCodeButtonTouchStart, this);
        this.codeButtonNode.off(Node.EventType.TOUCH_CANCEL, this.onCodeButtonTouchCancel, this);
        this.codeButtonNode.off(Node.EventType.TOUCH_END, this.onCodeButtonClicked, this);
        this.codeButtonNode.off(Node.EventType.MOUSE_ENTER, this.onButtonMouseEnter, this);
        this.codeButtonNode.off(Node.EventType.MOUSE_LEAVE, this.onButtonMouseLeave, this);
        this.codeButtonNode.on(Node.EventType.TOUCH_START, this.onCodeButtonTouchStart, this);
        this.codeButtonNode.on(Node.EventType.TOUCH_CANCEL, this.onCodeButtonTouchCancel, this);
        this.codeButtonNode.on(Node.EventType.TOUCH_END, this.onCodeButtonClicked, this);
        this.codeButtonNode.on(Node.EventType.MOUSE_ENTER, this.onButtonMouseEnter, this);
        this.codeButtonNode.on(Node.EventType.MOUSE_LEAVE, this.onButtonMouseLeave, this);
    }

    private async loadCodeButtonSpriteFrame(): Promise<SpriteFrame> {
        const bundle = await this.resourceScope.acquireBundle('res');
        return new Promise((resolve, reject) => {
            bundle.load(`${CODE_BUTTON_BG_PATH}/spriteFrame`, SpriteFrame, (err, spriteFrame) => {
                if (err || !spriteFrame) {
                    reject(err || new Error(`SpriteFrame not found: ${CODE_BUTTON_BG_PATH}`));
                    return;
                }
                resolve(spriteFrame);
            });
        });
    }

    private setupOneEditBox(inputNode: Node, placeholder: string, maxLength: number, defaultValue: string): FieldBinding {
        const editNode = this.ensureEditBoxNode(inputNode);
        const emptyTouchSprite = editNode.getComponent(Sprite);
        if (emptyTouchSprite && !emptyTouchSprite.spriteFrame) {
            emptyTouchSprite.enabled = false;
        }
        let editBox = editNode.getComponent(EditBox);
        const createdEditBox = !editBox;
        editBox ||= editNode.addComponent(EditBox);
        const editBoxCompat = editBox as any;
        const textLabel = editBoxCompat.textLabel
            || this.ensureEditBoxLabel(editNode, 'TEXT_LABEL', INPUT_TEXT_COLOR);
        const placeholderLabel = editBoxCompat.placeholderLabel
            || this.ensureEditBoxLabel(editNode, 'PLACEHOLDER_LABEL', PLACEHOLDER_TEXT_COLOR);

        if (!editBoxCompat.textLabel) editBoxCompat.textLabel = textLabel;
        if (!editBoxCompat.placeholderLabel) editBoxCompat.placeholderLabel = placeholderLabel;

        if (createdEditBox) {
            editBoxCompat.placeholder = placeholder;
            editBoxCompat.maxLength = maxLength;
            editBoxCompat.inputMode = maxLength === 11
                ? ((EditBox as any).InputMode?.PHONE_NUMBER ?? 3)
                : ((EditBox as any).InputMode?.NUMERIC ?? 2);
            editBoxCompat.inputFlag = (EditBox as any).InputFlag?.SENSITIVE ?? 1;
            editBoxCompat.returnType = (EditBox as any).KeyboardReturnType?.DONE ?? 0;
            editBoxCompat.string = defaultValue;
            editBoxCompat.backgroundImage = null;
        }

        inputNode.off(Node.EventType.MOUSE_ENTER, this.onInputMouseEnter, this);
        inputNode.off(Node.EventType.MOUSE_LEAVE, this.onInputMouseLeave, this);
        inputNode.on(Node.EventType.MOUSE_ENTER, this.onInputMouseEnter, this);
        inputNode.on(Node.EventType.MOUSE_LEAVE, this.onInputMouseLeave, this);
        editNode.off(Node.EventType.MOUSE_ENTER, this.onInputMouseEnter, this);
        editNode.off(Node.EventType.MOUSE_LEAVE, this.onInputMouseLeave, this);
        editNode.on(Node.EventType.MOUSE_ENTER, this.onInputMouseEnter, this);
        editNode.on(Node.EventType.MOUSE_LEAVE, this.onInputMouseLeave, this);

        return {
            editBox,
        };
    }

    private ensureEditBoxNode(inputNode: Node): Node {
        const existingNode = inputNode.getChildByName('EditBoxTouch');
        if (existingNode) return existingNode;

        const editNode = new Node('EditBoxTouch');
        editNode.setParent(inputNode);
        editNode.layer = inputNode.layer;
        const inputSize = inputNode.getComponent(UITransform)?.contentSize;
        const inputWidth = inputSize?.width || 500;
        const inputHeight = inputSize?.height || 92;
        const left = -inputWidth * 0.5 + FALLBACK_INPUT_HORIZONTAL_PADDING;
        let right = inputWidth * 0.5 - FALLBACK_INPUT_HORIZONTAL_PADDING;

        if (inputNode === this.codeNode && this.codeButtonNode) {
            const buttonWidth = this.codeButtonNode.getComponent(UITransform)?.contentSize.width || CODE_BUTTON_WIDTH;
            const buttonLeft = this.codeButtonNode.position.x - inputNode.position.x - buttonWidth * 0.5;
            right = Math.min(right, buttonLeft - FALLBACK_CODE_BUTTON_TEXT_GAP);
        }

        const transform = editNode.addComponent(UITransform);
        editNode.setPosition(new Vec3(left, 0, 0));
        transform.setAnchorPoint(0, 0.5);
        transform.setContentSize(Math.max(80, right - left), Math.min(FALLBACK_INPUT_TOUCH_HEIGHT, inputHeight));
        return editNode;
    }

    private ensureEditBoxLabel(inputNode: Node, name: string, color: Color): Label {
        let labelNode = inputNode.getChildByName(name);
        const existingLabel = labelNode?.getComponent(Label);
        if (existingLabel) return existingLabel;

        const createdNode = !labelNode;
        if (!labelNode) {
            labelNode = new Node(name);
            labelNode.setParent(inputNode);
        }

        labelNode.active = true;
        labelNode.layer = inputNode.layer;
        const transform = labelNode.getComponent(UITransform) || labelNode.addComponent(UITransform);
        if (createdNode) {
            const inputSize = inputNode.getComponent(UITransform)?.contentSize;
            labelNode.setPosition(new Vec3(FALLBACK_NATIVE_TEXT_INSET, 0, 0));
            transform.setAnchorPoint(0, 0.5);
            transform.setContentSize(
                Math.max(1, (inputSize?.width || 380) - FALLBACK_NATIVE_TEXT_INSET),
                inputSize?.height || FALLBACK_INPUT_TOUCH_HEIGHT,
            );
        }

        const label = labelNode.addComponent(Label);
        applySimKaiFont(label);
        label.color = color;
        label.fontSize = 24;
        label.lineHeight = transform.contentSize.height || FALLBACK_INPUT_TOUCH_HEIGHT;
        label.horizontalAlign = HorizontalTextAlignment.LEFT;
        label.verticalAlign = VerticalTextAlignment.CENTER;
        label.overflow = Overflow.CLAMP;
        label.enableWrapText = false;
        return label;
    }

    private readDisplayText(inputNode: Node): string {
        return inputNode.getChildByName('DisplayText')?.getComponent(Label)?.string?.trim() || '';
    }

    private resolvePlaceholder(inputNode: Node, fallback: string): string {
        const editNode = inputNode.getChildByName('EditBoxTouch');
        const editBoxPlaceholder = editNode?.getComponent(EditBox)?.placeholder?.trim();
        const editorPlaceholder = editNode
            ?.getChildByName('PLACEHOLDER_LABEL')
            ?.getComponent(Label)
            ?.string
            ?.trim();
        const text = editBoxPlaceholder || editorPlaceholder || this.readDisplayText(inputNode);
        if (!text || /^\?+$/.test(text)) {
            return fallback;
        }
        return text;
    }

    private readEditBoxValue(inputNode: Node): string {
        return inputNode.getChildByName('EditBoxTouch')?.getComponent(EditBox)?.string?.trim() || '';
    }

    private onInputMouseEnter(): void {
        this.setInputCursor(true);
    }

    private onInputMouseLeave(): void {
        this.setInputCursor(false);
    }

    private onButtonMouseEnter(): void {
        this.setPointerCursor(true);
    }

    private onButtonMouseLeave(): void {
        this.setPointerCursor(false);
    }

    private setInputCursor(isInput: boolean): void {
        const doc = (globalThis as any).document;
        if (doc?.body?.style) {
            doc.body.style.cursor = isInput ? 'text' : '';
        }
    }

    private setPointerCursor(isPointer: boolean): void {
        const doc = (globalThis as any).document;
        if (doc?.body?.style) {
            doc.body.style.cursor = isPointer ? 'pointer' : '';
        }
    }

    private restoreNativeCaret(): void {
        const doc = (globalThis as any).document;
        if (!doc?.getElementById) return;

        [
            'duxiachuan-hide-editbox-caret',
            'duxiachuan-character-name-hide-caret',
        ].forEach((styleId) => {
            const hiddenCaretStyle = doc.getElementById(styleId);
            hiddenCaretStyle?.parentNode?.removeChild(hiddenCaretStyle);
        });
    }

    private bindEvents(): void {
        if (!this.loginButtonNode) return;

        this.loginButtonBaseScale = this.loginButtonNode.scale.clone();
        this.loginButtonNode.off(Node.EventType.TOUCH_START, this.onLoginTouchStart, this);
        this.loginButtonNode.off(Node.EventType.TOUCH_CANCEL, this.onLoginTouchCancel, this);
        this.loginButtonNode?.off(Node.EventType.TOUCH_END, this.onLoginClicked, this);
        this.loginButtonNode.on(Node.EventType.TOUCH_START, this.onLoginTouchStart, this);
        this.loginButtonNode.on(Node.EventType.TOUCH_CANCEL, this.onLoginTouchCancel, this);
        this.loginButtonNode.on(Node.EventType.TOUCH_END, this.onLoginClicked, this);
    }

    private safeOff(node: Node | null, eventType: string, callback: (...args: any[]) => void): void {
        if (!node || !node.isValid) return;

        try {
            node.off(eventType, callback, this);
        } catch (err) {
            console.warn('[PhoneLoginPanel] skip event cleanup on destroyed node', err);
        }
    }

    private onLoginTouchStart(event: EventTouch): void {
        event.propagationStopped = true;
        this.playLoginButtonScale(true);
    }

    private onLoginTouchCancel(event: EventTouch): void {
        event.propagationStopped = true;
        this.playLoginButtonScale(false);
    }

    private playLoginButtonScale(pressed: boolean): void {
        if (!this.loginButtonNode) return;

        const targetScale = pressed
            ? new Vec3(
                this.loginButtonBaseScale.x * BUTTON_PRESS_SCALE,
                this.loginButtonBaseScale.y * BUTTON_PRESS_SCALE,
                this.loginButtonBaseScale.z,
            )
            : this.loginButtonBaseScale.clone();

        Tween.stopAllByTarget(this.loginButtonNode);
        tween(this.loginButtonNode)
            .to(pressed ? BUTTON_PRESS_DURATION : BUTTON_RELEASE_DURATION, { scale: targetScale }, { easing: 'sineOut' })
            .start();
    }

    private onCodeButtonTouchStart(event: EventTouch): void {
        event.propagationStopped = true;
        this.playCodeButtonScale(true);
    }

    private onCodeButtonTouchCancel(event: EventTouch): void {
        event.propagationStopped = true;
        this.playCodeButtonScale(false);
    }

    private onCodeButtonClicked(event?: EventTouch): void {
        if (event) {
            event.propagationStopped = true;
        }
        this.playCodeButtonScale(false);
    }

    private playCodeButtonScale(pressed: boolean): void {
        if (!this.codeButtonNode) return;

        const targetScale = pressed
            ? new Vec3(
                this.codeButtonBaseScale.x * BUTTON_PRESS_SCALE,
                this.codeButtonBaseScale.y * BUTTON_PRESS_SCALE,
                this.codeButtonBaseScale.z,
            )
            : this.codeButtonBaseScale.clone();

        Tween.stopAllByTarget(this.codeButtonNode);
        tween(this.codeButtonNode)
            .to(pressed ? BUTTON_PRESS_DURATION : BUTTON_RELEASE_DURATION, { scale: targetScale }, { easing: 'sineOut' })
            .start();
    }

    private async onLoginClicked(event?: EventTouch): Promise<void> {
        if (event) {
            event.propagationStopped = true;
        }
        this.playLoginButtonScale(false);
        if (this.isLoggingIn) return;

        const phone = this.phoneEditBox?.string.trim() || '';
        const code = this.codeEditBox?.string.trim() || '';
        this.isLoggingIn = true;
        this.setStatus('\u767b\u5f55\u4e2d...');

        try {
            const result = await AuthService.loginOrRegisterByPhone(phone, code);
            this.setStatus(result.isNewUser ? '\u6ce8\u518c\u6210\u529f\uff0c\u6b63\u5728\u8fdb\u5165\u6e38\u620f' : '\u767b\u5f55\u6210\u529f\uff0c\u6b63\u5728\u8fdb\u5165\u6e38\u620f');
            this.options.onLoginSuccess?.(result);
        } catch (err) {
            const message = err instanceof Error ? err.message : '\u767b\u5f55\u5931\u8d25\uff0c\u8bf7\u7a0d\u540e\u91cd\u8bd5';
            this.setStatus(message);
        } finally {
            this.isLoggingIn = false;
        }
    }

    private setStatus(message: string): void {
        if (this.statusLabel) {
            this.statusLabel.string = message;
        }
    }
}
