import {
    Color,
    EditBox,
    EventTouch,
    HorizontalTextAlignment,
    Label,
    Mask,
    Node,
    Overflow,
    SpriteFrame,
    Tween,
    UIOpacity,
    UITransform,
    Vec3,
    VerticalTextAlignment,
    sp,
    tween,
} from 'cc';
import { applySimKaiFont } from '../Common/UIFont';
import * as HomeConfig from './HomeConfig';
import { HomeViewBase } from './HomeViewBase';
import { RoleGender } from './HomeTypes';

type CharacterSelectCardLayout = {
    x: number;
    y: number;
    width: number;
    height: number;
    highlightWidth: number;
    highlightHeight: number;
    siblingIndex: number;
};

abstract class HomeFeatureCharacterCreationUIHost extends HomeViewBase {
    protected abstract readonly characterSelectRoleSkeletons: Map<RoleGender, sp.Skeleton>;
    protected abstract readonly characterSelectCardRoots: Map<RoleGender, Node>;

    protected abstract setLabelOutline(label: Label, color: Color, width: number): void;
}

/**
 * 角色创建页的编辑器节点复用、性别卡片、Spine 预览和姓名输入表现。
 *
 * 运行时状态仍由 Base/RoleBag 初始化器持有；本模块只负责创建页结构与交互表现。
 */
export abstract class HomeFeatureCharacterCreationUI extends HomeFeatureCharacterCreationUIHost {
    protected buildCharacterPanel(): void {
        const popupParent = this.pageRoot || this.popupRoot || this.node;
        const editorPanel = popupParent.getChildByName('CharacterCreatePanel') || this.findNode('CharacterCreatePanel');
        this.characterPanel = editorPanel || this.createNode('CharacterCreatePanel', popupParent, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT, 0, 0);
        if (this.characterPanel.parent !== popupParent) {
            this.characterPanel.setParent(popupParent);
        }
        this.characterPanel.active = false;
        this.characterPanel.off(Node.EventType.TOUCH_END);
        this.characterPanel.on(Node.EventType.TOUCH_END, (event: EventTouch) => {
            event.propagationStopped = true;
        }, this);
        (this.characterPanel.getComponent(UITransform) || this.characterPanel.addComponent(UITransform)).setContentSize(HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT);
        const panelMask = this.characterPanel.getComponent(Mask) || this.characterPanel.addComponent(Mask);
        panelMask.type = Mask.Type.GRAPHICS_RECT;

        this.characterSelectRoleSkeletons.clear();
        this.characterSelectCardRoots.clear();
        this.characterSelectBgSkeleton = null;
        this.previewSkeleton = null;
        this.characterGenderLabel = null;

        this.getOrCreateEditorSkinnedNode('CharacterSelectBg', this.characterPanel, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT, 0, 0, HomeConfig.UI_CHARACTER_SELECT_BG).setSiblingIndex(0);

        this.characterPreviewRoot = this.getOrCreateEditorNode('CharacterPreviewRoot', this.characterPanel, HomeConfig.VIEW_WIDTH, 1280, 0, 72);
        (this.characterPreviewRoot.getComponent(UIOpacity) || this.characterPreviewRoot.addComponent(UIOpacity)).opacity = 255;
        this.characterPreviewRoot.setSiblingIndex(2);
        (['female', 'male'] as RoleGender[]).forEach((gender) => {
            const offset = HomeConfig.CHARACTER_SELECT_ROLE_OFFSET[gender];
            const roleNodeName = `CharacterSelectRole_${gender}`;
            const roleNodeExisted = !!this.characterPreviewRoot?.getChildByName(roleNodeName);
            const roleNode = this.getOrCreateEditorNode(roleNodeName, this.characterPreviewRoot!, 760, 1280, offset.x, offset.y);
            if (!roleNodeExisted) {
                roleNode.setScale(HomeConfig.CHARACTER_SELECT_ROLE_SCALE[gender], HomeConfig.CHARACTER_SELECT_ROLE_SCALE[gender], 1);
            }
            roleNode.setSiblingIndex(gender === this.profile.gender ? 2 : 1);
            const skeleton = roleNode.getComponent(sp.Skeleton) || roleNode.addComponent(sp.Skeleton);
            this.prepareSkeletonRenderer(skeleton);
            this.characterSelectRoleSkeletons.set(gender, skeleton);
            this.loadCharacterSelectRoleSkeleton(gender, skeleton);
        });

        const speechBubble = this.getOrCreateEditorSkinnedNode('CharacterSelectSpeechBubble', this.characterPanel, 424, 214, -206, -90, HomeConfig.UI_CHARACTER_SELECT_SPEECH_BUBBLE);
        speechBubble.setSiblingIndex(5);
        const speechLabel = this.getOrCreateEditorLabel(speechBubble, 'CharacterSelectSpeechText', '\u5230\u6b64\u4e3a\u6b62\u5427\uff01', 29, -18, -8, 260, 56, new Color(61, 52, 46, 255));
        speechLabel.horizontalAlign = HorizontalTextAlignment.CENTER;
        this.setLabelOutline(speechLabel, new Color(255, 255, 255, 210), 1);
        speechLabel.node.setSiblingIndex(2);

        const cardRoot = this.getOrCreateEditorNode('CharacterSelectCardRoot', this.characterPanel, HomeConfig.VIEW_WIDTH, 280, 0, 0);
        cardRoot.setSiblingIndex(8);
        this.ensureCharacterSelectCardLayoutNodes(cardRoot);
        this.createCharacterSelectCard(cardRoot, 'female');
        this.createCharacterSelectCard(cardRoot, 'male');

        const nameRoot = this.getOrCreateEditorNode('CharacterNameRoot', this.characterPanel, 620, 90, 0, -616);
        nameRoot.setSiblingIndex(20);

        const inputBg = this.getOrCreateEditorSkinnedNode('InputNameBg', nameRoot, 462, 86, 0, 52.206, HomeConfig.UI_CHARACTER_SELECT_NAME_BG);
        inputBg.setSiblingIndex(0);

        this.nameDisplayLabel = this.getOrCreateEditorLabel(nameRoot, 'NameDisplayText', this.profile.name || HomeConfig.DEFAULT_NAME, 30, 0, 59.206, 320, 56, new Color(245, 226, 178, 255));
        this.nameDisplayLabel.horizontalAlign = HorizontalTextAlignment.LEFT;
        this.nameDisplayLabel.overflow = Overflow.CLAMP;
        this.setLabelOutline(this.nameDisplayLabel, new Color(60, 45, 28, 255), 2);
        this.nameDisplayLabel.node.setSiblingIndex(1);

        this.nameCursorNode = this.getOrCreateEditorNode('NameInputCursor', nameRoot, 20, 56, -250, 0);
        const cursorLabel = this.nameCursorNode.getComponent(Label) || this.nameCursorNode.addComponent(Label);
        applySimKaiFont(cursorLabel);
        cursorLabel.string = '|';
        cursorLabel.fontSize = 30;
        cursorLabel.lineHeight = 56;
        cursorLabel.horizontalAlign = HorizontalTextAlignment.CENTER;
        cursorLabel.verticalAlign = VerticalTextAlignment.CENTER;
        cursorLabel.color = Color.WHITE;
        this.nameCursorNode.active = false;
        this.nameCursorNode.setSiblingIndex(2);

        const inputNode = this.getOrCreateEditorNode('InputName', nameRoot, 220.479, 56, 33.6, 59.206);
        inputNode.setSiblingIndex(3);
        this.nameEditBox = inputNode.getComponent(EditBox) || inputNode.addComponent(EditBox);
        this.nameEditBox.placeholder = '\u8bf7\u8f93\u5165\u89d2\u8272\u540d';
        this.nameEditBox.string = this.profile.name;
        this.nameEditBox.maxLength = 8;
        this.setupHiddenNameEditBox(inputNode);

        const random = this.getOrCreateEditorSkinnedNode('BtnRandomName', nameRoot, 70, 70, 196, 52.206, HomeConfig.UI_CHARACTER_SELECT_RANDOM_BTN);
        random.setSiblingIndex(4);
        this.bindScaledClick(random, () => {
            this.randomizeCharacterName();
        });

        const confirm = this.getOrCreateEditorSkinnedNode('BtnConfirmCreate', this.characterPanel, 344, 98, 0, -685.501, HomeConfig.UI_CHARACTER_SELECT_CONFIRM_BTN);
        confirm.setSiblingIndex(10);
        this.bindScaledClick(confirm, () => {
            this.confirmCharacter();
        });

        this.refreshCharacterSelectCards(false);
    }
    protected getOrCreateEditorNode(name: string, parent: Node, width: number, height: number, x: number, y: number): Node {
        const existing = parent.getChildByName(name);
        const node = existing || this.createNode(name, parent, width, height, x, y);
        if (!existing) {
            node.setPosition(x, y, 0);
        }
        const transform = node.getComponent(UITransform) || node.addComponent(UITransform);
        if (!existing || transform.contentSize.width <= 0 || transform.contentSize.height <= 0) {
            transform.setContentSize(width, height);
        }
        return node;
    }
    protected getOrCreateEditorSkinnedNode(name: string, parent: Node, width: number, height: number, x: number, y: number, skinPath: string): Node {
        const node = this.getOrCreateEditorNode(name, parent, width, height, x, y);
        this.applyUiSkinKeepingEditorSize(node, skinPath, width, height);
        return node;
    }
    protected getOrCreateEditorLabel(parent: Node, name: string, text: string, fontSize: number, x: number, y: number, width: number, height: number, color: Color): Label {
        const node = this.getOrCreateEditorNode(name, parent, width, height, x, y);
        const label = node.getComponent(Label) || node.addComponent(Label);
        applySimKaiFont(label);
        label.string = text;
        label.fontSize = fontSize;
        label.lineHeight = fontSize + 8;
        label.color = color;
        label.verticalAlign = VerticalTextAlignment.CENTER;
        return label;
    }
    protected ensureCharacterSelectCardLayoutNodes(cardRoot: Node): void {
        const layoutRoot = this.getOrCreateEditorNode('CharacterSelectCardLayouts', cardRoot, HomeConfig.VIEW_WIDTH, 280, 0, 0);
        layoutRoot.active = false;
        layoutRoot.setSiblingIndex(0);

        (['female', 'male'] as RoleGender[]).forEach((gender) => {
            (['Selected', 'Normal'] as const).forEach((state) => {
                const selected = state === 'Selected';
                const layout = this.getDefaultCharacterSelectCardLayout(gender, selected);
                this.getOrCreateEditorNode(`CharacterSelectCard_${gender}_${state}Layout`, layoutRoot, layout.width, layout.height, layout.x, layout.y);
            });
        });
    }
    protected createCharacterSelectCard(parent: Node, gender: RoleGender): void {
        const layout = this.getCharacterSelectCardLayout(gender, this.profile.gender);
        const card = this.getOrCreateEditorSkinnedNode(
            `CharacterSelectCard_${gender}`,
            parent,
            layout.width,
            layout.height,
            layout.x,
            layout.y,
            this.getCharacterSelectCardSkin(gender, gender === this.profile.gender),
        );
        card.setSiblingIndex(layout.siblingIndex);
        this.characterSelectCardRoots.set(gender, card);

        const highlight = this.getOrCreateEditorSkinnedNode('CharacterSelectCardHighlight', card, layout.highlightWidth, layout.highlightHeight, 0, 0, HomeConfig.UI_CHARACTER_SELECT_FRAME_HIGHLIGHT);
        highlight.active = gender === this.profile.gender;
        highlight.setSiblingIndex(3);

        this.bindScaledClick(card, () => this.selectGender(gender));
    }
    protected getCharacterSelectCardSkin(gender: RoleGender, selected: boolean): string {
        if (gender === 'female') {
            return selected ? HomeConfig.UI_CHARACTER_SELECT_FEMALE_ACTIVE : HomeConfig.UI_CHARACTER_SELECT_FEMALE_NORMAL;
        }
        return selected ? HomeConfig.UI_CHARACTER_SELECT_MALE_ACTIVE : HomeConfig.UI_CHARACTER_SELECT_MALE_NORMAL;
    }
    protected getCharacterSelectCardLayout(
        gender: RoleGender,
        selectedGender: RoleGender,
    ): CharacterSelectCardLayout {
        const selected = gender === selectedGender;
        const editorLayout = this.getEditorCharacterSelectCardLayout(gender, selected);
        if (editorLayout) {
            return editorLayout;
        }
        return this.getDefaultCharacterSelectCardLayout(gender, selected);
    }
    protected getEditorCharacterSelectCardLayout(gender: RoleGender, selected: boolean): CharacterSelectCardLayout | null {
        const stateName = selected ? 'Selected' : 'Normal';
        const layoutNode = this.characterPanel
            ?.getChildByName('CharacterSelectCardRoot')
            ?.getChildByName('CharacterSelectCardLayouts')
            ?.getChildByName(`CharacterSelectCard_${gender}_${stateName}Layout`);
        const transform = layoutNode?.getComponent(UITransform);
        if (!layoutNode?.isValid || !transform) return null;

        const highlightNode = this.characterPanel
            ?.getChildByName('CharacterSelectCardRoot')
            ?.getChildByName(`CharacterSelectCard_${gender}`)
            ?.getChildByName('CharacterSelectCardHighlight');
        const highlightTransform = highlightNode?.getComponent(UITransform);
        const defaultLayout = this.getDefaultCharacterSelectCardLayout(gender, selected);

        return {
            x: layoutNode.position.x,
            y: layoutNode.position.y,
            width: transform.contentSize.width > 0 ? transform.contentSize.width : defaultLayout.width,
            height: transform.contentSize.height > 0 ? transform.contentSize.height : defaultLayout.height,
            highlightWidth: highlightTransform && highlightTransform.contentSize.width > 0 ? highlightTransform.contentSize.width : defaultLayout.highlightWidth,
            highlightHeight: highlightTransform && highlightTransform.contentSize.height > 0 ? highlightTransform.contentSize.height : defaultLayout.highlightHeight,
            siblingIndex: selected ? 10 : 1,
        };
    }
    protected getDefaultCharacterSelectCardLayout(gender: RoleGender, selected: boolean): CharacterSelectCardLayout {
        if (selected) {
            return gender === 'female'
                ? { x: -162, y: -315.127, width: 426, height: 214, highlightWidth: 492, highlightHeight: 264, siblingIndex: 10 }
                : { x: 162, y: -315.127, width: 416, height: 214, highlightWidth: 492, highlightHeight: 264, siblingIndex: 10 };
        }

        return gender === 'female'
            ? { x: -162, y: -399.127, width: 322, height: 152, highlightWidth: 0, highlightHeight: 0, siblingIndex: 1 }
            : { x: 162, y: -399.127, width: 324, height: 168, highlightWidth: 0, highlightHeight: 0, siblingIndex: 1 };
    }
    protected refreshCharacterSelectCards(animated = true): void {
        const selectedGender = this.profile.gender;
        (['female', 'male'] as RoleGender[]).forEach((gender) => {
            const card = this.characterSelectCardRoots.get(gender);
            if (!card?.isValid) return;

            const selected = gender === selectedGender;
            const layout = this.getCharacterSelectCardLayout(gender, selectedGender);
            (card.getComponent(UITransform) || card.addComponent(UITransform)).setContentSize(layout.width, layout.height);
            this.applyUiSkin(card, this.getCharacterSelectCardSkin(gender, selected), layout.width, layout.height);
            card.setSiblingIndex(layout.siblingIndex);

            const opacity = card.getComponent(UIOpacity) || card.addComponent(UIOpacity);
            opacity.opacity = selected ? 255 : 220;

            const highlight = card.getChildByName('CharacterSelectCardHighlight');
            if (highlight?.isValid) {
                highlight.active = selected;
                if (selected) {
                    this.applyUiSkin(highlight, HomeConfig.UI_CHARACTER_SELECT_FRAME_HIGHLIGHT, layout.highlightWidth, layout.highlightHeight);
                    highlight.setPosition(0, 0, 0);
                    highlight.setSiblingIndex((card.children.length || 1) - 1);
                }
            }

            Tween.stopAllByTarget(card);
            if (animated) {
                tween(card)
                    .to(0.16, { position: new Vec3(layout.x, layout.y, 0), scale: new Vec3(1, 1, 1) }, { easing: 'sineOut' })
                    .start();
            } else {
                card.setPosition(layout.x, layout.y, 0);
                card.setScale(1, 1, 1);
            }
        });

        this.refreshCharacterSelectRoleVisibility();
    }
    protected loadCharacterSelectRoleSkeleton(gender: RoleGender, skeleton: sp.Skeleton): void {
        this.setSkeletonVisible(skeleton, false);
        // Prefabs may still carry an editor-preview SkeletonData reference.
        // Clear it before the async gender asset arrives so refresh cannot try
        // the character-select animations against the main-role skeleton.
        skeleton.skeletonData = null;
        void this.loadSkeletonAsset(HomeConfig.CHARACTER_SELECT_ROLE_SKEL_PATHS[gender])
            .then((asset) => {
                if (!skeleton.isValid || this.characterSelectRoleSkeletons.get(gender) !== skeleton) return;

                this.prepareSkeletonRenderer(skeleton);
                skeleton.skeletonData = asset;
                this.refreshCharacterSelectRoleVisibility();
            })
            .catch((err) => {
                console.warn('[MainHomeView] character select role skel load failed', gender, err);
            });
    }
    protected refreshCharacterSelectRoleVisibility(): void {
        (['female', 'male'] as RoleGender[]).forEach((gender) => {
            const skeleton = this.characterSelectRoleSkeletons.get(gender);
            if (!skeleton?.isValid) return;

            const active = gender === this.profile.gender;
            skeleton.node.setSiblingIndex(active ? 2 : 1);
            skeleton.node.active = active;

            if (!active || !skeleton.skeletonData) {
                this.setSkeletonVisible(skeleton, false);
                return;
            }

            this.setSkeletonVisible(skeleton, true);
            this.playSkeletonAnimation(skeleton, HomeConfig.CHARACTER_SELECT_ROLE_ANIMATIONS, true);
        });
    }
    protected setupHiddenNameEditBox(inputNode: Node): void {
        if (!this.nameEditBox) return;
    
        this.hideNativeNameCaret();
        const textLabel = this.createHiddenEditBoxLabel(inputNode, 'TEXT_LABEL');
        const placeholderLabel = this.createHiddenEditBoxLabel(inputNode, 'PLACEHOLDER_LABEL');
        const editBoxCompat = this.nameEditBox as unknown as {
            textLabel?: Label;
            placeholderLabel?: Label;
            inputMode?: number;
            returnType?: number;
            fontSize?: number;
            placeholderFontSize?: number;
            fontColor?: Color;
            placeholderFontColor?: Color;
            cursorColor?: Color;
            backgroundImage?: SpriteFrame | null;
        };
    
        editBoxCompat.textLabel = textLabel;
        editBoxCompat.placeholderLabel = placeholderLabel;
        editBoxCompat.inputMode = (EditBox as unknown as { InputMode?: { SINGLE_LINE?: number } }).InputMode?.SINGLE_LINE ?? 6;
        editBoxCompat.returnType = (EditBox as unknown as { KeyboardReturnType?: { DONE?: number } }).KeyboardReturnType?.DONE ?? 0;
        editBoxCompat.fontSize = 1;
        editBoxCompat.placeholderFontSize = 1;
        editBoxCompat.fontColor = new Color(0, 0, 0, 0);
        editBoxCompat.placeholderFontColor = new Color(0, 0, 0, 0);
        editBoxCompat.cursorColor = new Color(0, 0, 0, 0);
        editBoxCompat.backgroundImage = null;
    
        const eventType = EditBox as unknown as {
            EventType?: {
                TEXT_CHANGED?: string;
                EDITING_DID_BEGAN?: string;
                EDITING_DID_ENDED?: string;
            };
        };
        inputNode.on(eventType.EventType?.TEXT_CHANGED || 'text-changed', () => {
            this.refreshCharacterNameDisplay();
            this.updateCharacterNameCursorPosition();
        }, this);
        inputNode.on(eventType.EventType?.EDITING_DID_BEGAN || 'editing-did-began', () => {
            this.hideNativeNameCaret();
            this.nameEditing = true;
            this.refreshCharacterNameDisplay();
            this.showCharacterNameCursor();
        }, this);
        inputNode.on(eventType.EventType?.EDITING_DID_ENDED || 'editing-did-ended', () => {
            this.nameEditing = false;
            this.refreshCharacterNameDisplay();
            this.hideCharacterNameCursor();
        }, this);
        this.refreshCharacterNameDisplay();
    }
    protected createHiddenEditBoxLabel(parent: Node, name: string): Label {
        const node = parent.getChildByName(name) || this.createNode(name, parent, 1, 1, 0, 0);
        node.active = true;
        node.setPosition(0, 0, 0);
        (node.getComponent(UITransform) || node.addComponent(UITransform)).setContentSize(1, 1);
        const label = node.getComponent(Label) || node.addComponent(Label);
        applySimKaiFont(label);
        label.string = '';
        label.fontSize = 1;
        label.lineHeight = 1;
        label.color = new Color(0, 0, 0, 0);
        return label;
    }
    protected refreshCharacterNameDisplay(): void {
        if (!this.nameDisplayLabel) return;
    
        const value = this.nameEditBox?.string.trim() || '';
        if (value.length > 0) {
            this.nameDisplayLabel.string = value;
            this.nameDisplayLabel.color = Color.WHITE;
        } else if (this.nameEditing) {
            this.nameDisplayLabel.string = '';
            this.nameDisplayLabel.color = Color.WHITE;
        } else {
            this.nameDisplayLabel.string = '\u8bf7\u8f93\u5165\u89d2\u8272\u540d';
            this.nameDisplayLabel.color = new Color(255, 255, 255, 170);
        }
        this.updateCharacterNameCursorPosition();
    }
    protected showCharacterNameCursor(): void {
        if (!this.nameCursorNode) return;
    
        this.nameCursorVisible = true;
        this.updateCharacterNameCursorPosition();
        this.nameCursorNode.active = true;
        this.unschedule(this.blinkCharacterNameCursor);
        this.schedule(this.blinkCharacterNameCursor, 0.45);
    }
    protected hideCharacterNameCursor(): void {
        if (this.nameCursorNode) {
            this.nameCursorNode.active = false;
        }
        this.nameCursorVisible = false;
        this.unschedule(this.blinkCharacterNameCursor);
    }
    protected updateCharacterNameCursorPosition(): void {
        if (!this.nameCursorNode || !this.nameDisplayLabel) return;
    
        const labelTransform = this.nameDisplayLabel.node.getComponent(UITransform);
        const labelWidth = labelTransform?.contentSize.width || 360;
        const leftX = this.nameDisplayLabel.node.position.x - labelWidth / 2 + 4;
        const maxX = leftX + labelWidth - 8;
        const visibleLength = this.nameEditBox?.string.length || 0;
        this.nameCursorNode.setPosition(Math.min(leftX + visibleLength * HomeConfig.CHARACTER_NAME_CURSOR_CHAR_WIDTH, maxX), 0, 0);
    }
    protected blinkCharacterNameCursor(): void {
        if (!this.nameCursorNode) return;
    
        this.nameCursorVisible = !this.nameCursorVisible;
        this.nameCursorNode.active = this.nameCursorVisible;
    }
    protected hideNativeNameCaret(): void {
        const doc = (globalThis as any).document;
        if (!doc || doc.getElementById('duxiachuan-character-name-hide-caret')) return;
    
        const style = doc.createElement('style');
        style.id = 'duxiachuan-character-name-hide-caret';
        style.textContent = 'input, textarea { caret-color: transparent !important; }';
        doc.head?.appendChild(style);
    }
    protected loadCharacterSelectBackground(): void {
        if (!this.characterSelectBgSkeleton) return;
    
        void this.loadSkeletonAsset(HomeConfig.CHARACTER_SELECT_BG_SKEL_PATH)
            .then((asset) => {
                if (!this.characterSelectBgSkeleton?.isValid) return;
    
                this.prepareSkeletonRenderer(this.characterSelectBgSkeleton);
                this.characterSelectBgSkeleton.skeletonData = asset;
                this.characterSelectBgSkeleton.node.setPosition(HomeConfig.CHARACTER_SELECT_BG_OFFSET_X, HomeConfig.CHARACTER_SELECT_BG_OFFSET_Y, 0);
                this.characterSelectBgSkeleton.node.setScale(HomeConfig.CHARACTER_SELECT_BG_SCALE, HomeConfig.CHARACTER_SELECT_BG_SCALE, 1);
                this.playSkeletonAnimation(this.characterSelectBgSkeleton, HomeConfig.CHARACTER_SELECT_BG_ANIMATIONS, true);
            })
            .catch((err) => {
                console.warn('[MainHomeView] character select bg skel load failed', err);
            });
    }
}
