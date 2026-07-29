import {
    Color,
    HorizontalTextAlignment,
    Label,
    Node,
    Overflow,
    Sprite,
    ScrollView,
    RichText,
    UITransform,
    Vec3,
    VerticalTextAlignment,
    sp,
} from 'cc';
import { applySimKaiFont } from '../Common/UIFont';
import { type BagIllustrationCatalogItem } from './BagIllustrationCatalog.generated';
import {
    type BeastStrengthenAction,
    type BeastStrengthenEquipPart,
    type BeastStrengthenState,
} from './HomeBeastStrengthenConfig';

import { SharedPopupContent } from './HomeTypes';
import * as HomeConfig from './HomeConfig';
import { HomeViewRoleBag } from './HomeViewRoleBag';

type MagicBattleParticipantId = 'player' | 'npc-half' | 'npc-double';

interface MagicBattleDamageParticipant {
    id: MagicBattleParticipantId;
    name: string;
    isPlayer: boolean;
    skelPath?: string;
    duelScale?: number;
    damageMultiplier: number;
    damage: number;
    hp: number;
    maxHp: number;
    active: boolean;
    duelOutcome: 'win' | 'lose' | null;
}

export abstract class HomeViewAdventure extends HomeViewRoleBag {
    protected battleRewardItemsOverride: Array<{ item: BagIllustrationCatalogItem; amount: string }> | null = null;
    protected battleRewardCloseMode: 'battle' | 'popupOnly' | 'magic' = 'battle';
    protected battleTargetChallengePopup: Node | null = null;
    protected battleTargetChallengeBoard: Node | null = null;
    protected battleTargetChallengeTitleLabel: Label | null = null;
    protected battleTargetChallengeContentRoot: Node | null = null;
    protected battleTargetChallengeConfirmLabel: Label | null = null;
    protected battleTargetChallengeSelected = '';
    protected battleTargetChallengeMode: 'select' | 'confirm' = 'select';
    protected battleChallengeConfirmType: 'normal' | 'target' | 'host' = 'target';
    protected magicSceneNameFrameOffsetX = HomeConfig.MAGIC_SCENE_NAME_FRAME_OFFSET_X;
    protected magicSceneNameFrameOffsetY = HomeConfig.MAGIC_SCENE_NAME_FRAME_OFFSET_Y;
    protected readonly magicSceneEntryBaseScales: Vec3[] = [];
    protected magicBattleDamageHudRoot: Node | null = null;
    protected magicBattleDamageListRoot: Node | null = null;
    protected magicBattleDamageExpandedPosition: Vec3 | null = null;
    protected magicBattleDamageCollapsed = false;
    protected magicBattlePlayerDamage = 0;
    protected readonly magicBattleParticipants: MagicBattleDamageParticipant[] = [];
    protected magicBattleDuelPopup: Node | null = null;
    protected magicBattleDuelPlayerSkeleton: sp.Skeleton | null = null;
    protected magicBattleDuelTargetSkeleton: sp.Skeleton | null = null;
    protected magicBattleDuelPlayerHp = 0;
    protected magicBattleDuelTargetHp = 0;
    protected magicBattleDuelVersion = 0;
    protected magicBattleDuelTargetId: MagicBattleParticipantId | '' = '';
    protected beastStrengthenTitleLabel: Label | null = null;
    protected beastStrengthenYuanbaoLabel: Label | null = null;
    protected beastCardYuanbaoRateValueLabel: Label | null = null;
    protected beastCardRecordPopup: Node | null = null;
    protected beastCardRecordScrollView: ScrollView | null = null;
    protected beastCardRecordContent: Node | null = null;
    protected beastStrengthenBonusLabel: Label | null = null;
    protected beastStrengthenActionButton: Node | null = null;
    protected beastStrengthenActionLabel: Label | null = null;
    protected beastStrengthenRemoveGemButton: Node | null = null;
    protected beastStrengthenRemoveGemLabel: Label | null = null;
    protected beastStrengthenGemSelectPopup: Node | null = null;
    protected beastStrengthenState: BeastStrengthenState | null = null;
    protected beastStrengthenSelectedPart: BeastStrengthenEquipPart = 'chest';
    protected beastStrengthenSelectedGemSlotIndex = -1;
    protected beastStrengthenEquipmentSelectionVisible = false;
    protected beastStrengthenAction: BeastStrengthenAction = '';

    public static initializeFeatureState(target: HomeViewAdventure): void {
        Object.assign(target, {
            battleRewardItemsOverride: null,
            battleRewardCloseMode: 'battle',
            battleTargetChallengePopup: null,
            battleTargetChallengeBoard: null,
            battleTargetChallengeTitleLabel: null,
            battleTargetChallengeContentRoot: null,
            battleTargetChallengeConfirmLabel: null,
            battleTargetChallengeSelected: '',
            battleTargetChallengeMode: 'select',
            battleChallengeConfirmType: 'target',
            magicSceneNameFrameOffsetX: HomeConfig.MAGIC_SCENE_NAME_FRAME_OFFSET_X,
            magicSceneNameFrameOffsetY: HomeConfig.MAGIC_SCENE_NAME_FRAME_OFFSET_Y,
            magicSceneEntryBaseScales: [],
            magicBattleDamageHudRoot: null,
            magicBattleDamageListRoot: null,
            magicBattleDamageExpandedPosition: null,
            magicBattleDamageCollapsed: false,
            magicBattlePlayerDamage: 0,
            magicBattleParticipants: [],
            magicBattleDuelPopup: null,
            magicBattleDuelPlayerSkeleton: null,
            magicBattleDuelTargetSkeleton: null,
            magicBattleDuelPlayerHp: 0,
            magicBattleDuelTargetHp: 0,
            magicBattleDuelVersion: 0,
            magicBattleDuelTargetId: '',
            beastStrengthenTitleLabel: null,
            beastStrengthenYuanbaoLabel: null,
            beastCardYuanbaoRateValueLabel: null,
            beastCardRecordPopup: null,
            beastCardRecordScrollView: null,
            beastCardRecordContent: null,
            beastStrengthenBonusLabel: null,
            beastStrengthenActionButton: null,
            beastStrengthenActionLabel: null,
            beastStrengthenRemoveGemButton: null,
            beastStrengthenRemoveGemLabel: null,
            beastStrengthenGemSelectPopup: null,
            beastStrengthenState: null,
            beastStrengthenSelectedPart: 'chest',
            beastStrengthenSelectedGemSlotIndex: -1,
            beastStrengthenEquipmentSelectionVisible: false,
            beastStrengthenAction: '',
        });
    }

    protected openSharedFlowPopup(popupName: string, content: SharedPopupContent = {}): void {
        if (
            popupName === 'ConfirmPopup'
            && content.variant !== 'magicFloorConfirm'
            && content.variant !== 'beastStrengthenConfirm'
            && content.variant !== 'commerceQuantityConfirm'
        ) {
            const popup = this.popupRoot?.getChildByName('ConfirmPopup') || this.findNode('ConfirmPopup');
            if (popup?.isValid) this.resetSharedConfirmPopupStyle(popup);
        }

        super.openSharedFlowPopup(popupName, content);
        if (popupName !== 'ConfirmPopup') return;

        const popup = this.popupRoot?.getChildByName('ConfirmPopup') || this.findNode('ConfirmPopup');
        if (!popup?.isValid) return;
        if (content.variant === 'magicFloorConfirm') {
            this.layoutMagicFloorConfirmPopup(popup, content.message || '');
            return;
        }
        if (content.variant === 'beastStrengthenConfirm') {
            this.layoutBeastStrengthenConfirmPopup(popup, content.message || '');
        }
    }
    protected resetSharedConfirmPopupStyle(popup: Node): void {
        this.hideMagicMonsterRoomPromptNodes(popup);

        const board = this.findNode('ConfirmPopupBoard', popup);
        if (board?.isValid) {
            if (board.parent !== popup) board.setParent(popup);
            board.active = true;
            board.setPosition(0, 0, 0);
            (board.getComponent(UITransform) || board.addComponent(UITransform)).setContentSize(725, 505);
            this.applyUiSkinKeepingEditorSize(board, HomeConfig.UI_CONFIRM_POPUP_BG, 725, 505);
            board.setSiblingIndex(1);
        }

        const titleSkin = this.findNode('ConfirmPopupTitleSkin', popup);
        if (titleSkin?.isValid) {
            if (board?.isValid && titleSkin.parent !== board) titleSkin.setParent(board);
            titleSkin.active = true;
            titleSkin.setPosition(0, 182, 0);
            (titleSkin.getComponent(UITransform) || titleSkin.addComponent(UITransform)).setContentSize(486, 84);
            this.applyUiSkinKeepingEditorSize(titleSkin, HomeConfig.UI_CONFIRM_TITLE_BG, 486, 84);
            titleSkin.setSiblingIndex(1);
        }

        const titleNode = this.findNode('ConfirmPopupTitle', popup);
        const titleLabel = titleNode?.getComponent(Label);
        if (titleNode?.isValid && titleLabel) {
            if (board?.isValid && titleNode.parent !== board) titleNode.setParent(board);
            titleNode.active = true;
            titleNode.setPosition(0, 185, 0);
            (titleNode.getComponent(UITransform) || titleNode.addComponent(UITransform)).setContentSize(280, 52);
            titleLabel.fontSize = 30;
            titleLabel.lineHeight = 38;
            titleLabel.color = new Color(126, 74, 36, 255);
            titleLabel.horizontalAlign = HorizontalTextAlignment.CENTER;
            titleLabel.verticalAlign = VerticalTextAlignment.CENTER;
            titleLabel.overflow = Overflow.SHRINK;
            this.setLabelOutline(titleLabel, new Color(255, 245, 215, 255), 2);
            titleNode.setSiblingIndex(2);
        }

        const messageBg = this.findNode('ConfirmMessageBg', popup);
        if (messageBg?.isValid) {
            if (board?.isValid && messageBg.parent !== board) messageBg.setParent(board);
            messageBg.setPosition(0, 66, 0);
            (messageBg.getComponent(UITransform) || messageBg.addComponent(UITransform)).setContentSize(620, 116);
            this.hideCommerceConfirmMessageBg(messageBg);
            messageBg.setSiblingIndex(3);
        }

        const messageNode = this.findNode('ConfirmMessage', popup);
        if (messageNode?.isValid) {
            if (board?.isValid && messageNode.parent !== board) messageNode.setParent(board);
            messageNode.active = true;
            messageNode.setPosition(0, 48, 0);
            (messageNode.getComponent(UITransform) || messageNode.addComponent(UITransform)).setContentSize(560, 88);
            const richText = messageNode.getComponent(RichText);
            if (richText) {
                richText.enabled = true;
                richText.maxWidth = 560;
                richText.fontSize = 24;
                richText.lineHeight = 34;
                richText.horizontalAlign = HorizontalTextAlignment.CENTER;
            }
            const label = messageNode.getComponent(Label);
            if (label) {
                label.enabled = false;
                this.setMagicFloorTextEdge(label, false);
            }
            messageNode.setSiblingIndex(4);
        }

        this.resetSharedConfirmButtonStyle(
            popup,
            'ConfirmCancelButton',
            'ConfirmCancelButtonLabel',
            HomeConfig.UI_CONFIRM_BUTTON_BG,
            '\u53d6\u6d88',
            -112,
            new Color(94, 36, 35, 255),
            6,
        );
        this.resetSharedConfirmButtonStyle(
            popup,
            'ConfirmAcceptButton',
            'ConfirmAcceptButtonLabel',
            HomeConfig.UI_CONFIRM_BUTTON_BG,
            '\u786e\u5b9a',
            112,
            new Color(28, 85, 82, 255),
            7,
        );

        const close = this.findNode('ConfirmPopupClose', popup);
        if (close?.isValid) {
            if (board?.isValid && close.parent !== board) close.setParent(board);
            close.active = false;
            close.setPosition(251, 226, 0);
            (close.getComponent(UITransform) || close.addComponent(UITransform)).setContentSize(70, 70);
            this.applyUiSkinKeepingEditorSize(close, HomeConfig.UI_BTN_CLOSE, 70, 70);
            this.bindScaledClick(close, () => this.closeSharedFlowPopup(popup));
        }
    }
    protected hideMagicMonsterRoomPromptNodes(popup: Node): void {
        [
            'MagicMonsterRoomQuestion',
            'MagicMonsterRoomHpCaption',
            'MagicMonsterRoomHpFrame',
            'MagicMonsterRoomHpBar',
            'MagicMonsterRoomCount',
        ].forEach((nodeName) => {
            const node = this.findNode(nodeName, popup);
            this.hideConfirmNodeForMagicMonsterPrompt(node);
        });
    }
    protected resetSharedConfirmButtonStyle(
        popup: Node,
        buttonName: string,
        labelName: string,
        skinPath: string,
        text: string,
        x: number,
        outlineColor: Color,
        siblingIndex: number,
    ): void {
        const button = this.findNode(buttonName, popup);
        if (!button?.isValid) return;

        button.active = true;
        button.setPosition(x, -188, 0);
        (button.getComponent(UITransform) || button.addComponent(UITransform)).setContentSize(162, 62);
        this.applyUiSkinKeepingEditorSize(button, skinPath, 162, 62);
        button.setSiblingIndex(siblingIndex);

        const labelNode = this.findNode(labelName, button) || this.findNode(labelName, popup);
        const label = labelNode?.getComponent(Label);
        if (!labelNode?.isValid || !label) return;

        labelNode.active = true;
        labelNode.setPosition(0, 1, 0);
        (labelNode.getComponent(UITransform) || labelNode.addComponent(UITransform)).setContentSize(132, 42);
        label.string = text;
        label.fontSize = 31;
        label.lineHeight = 38;
        label.color = new Color(255, 238, 218, 255);
        label.horizontalAlign = HorizontalTextAlignment.CENTER;
        label.verticalAlign = VerticalTextAlignment.CENTER;
        this.setLabelOutline(label, outlineColor, 2);
        label.node.setSiblingIndex(1);
    }
    protected layoutMagicFloorConfirmPopup(popup: Node, messageText: string): void {
        this.hideMagicMonsterRoomPromptNodes(popup);

        const board = this.findNode('ConfirmPopupBoard', popup);
        if (!board?.isValid) return;

        const messageBg = this.findNode('ConfirmMessageBg', popup);
        if (messageBg?.isValid) messageBg.active = false;

        const messageNode = this.findNode('ConfirmMessage', popup);
        if (messageNode?.isValid) {
            messageNode.active = true;
            messageNode.setPosition(0, 36, 0);
            (messageNode.getComponent(UITransform) || messageNode.addComponent(UITransform)).setContentSize(520, 72);
            const richText = messageNode.getComponent(RichText);
            if (richText) richText.enabled = false;
            const messageLabel = messageNode.getComponent(Label) || messageNode.addComponent(Label);
            applySimKaiFont(messageLabel);
            messageLabel.enabled = true;
            messageLabel.string = messageText;
            messageLabel.fontSize = 25;
            messageLabel.lineHeight = 34;
            messageLabel.color = new Color(104, 70, 43, 255);
            messageLabel.horizontalAlign = HorizontalTextAlignment.CENTER;
            messageLabel.verticalAlign = VerticalTextAlignment.CENTER;
            messageLabel.overflow = Overflow.SHRINK;
            this.setMagicFloorTextEdge(messageLabel, false);
        }

        const quantityRoot = this.findNode('ConfirmQuantityRoot', popup);
        if (quantityRoot?.isValid) quantityRoot.active = false;

        const close = this.findNode('ConfirmPopupClose', popup);
        if (close?.isValid) close.active = false;

        this.layoutMagicFloorConfirmButton(popup, 'ConfirmCancelButton', 'ConfirmCancelButtonLabel', '\u53d6\u6d88', -108);
        this.layoutMagicFloorConfirmButton(popup, 'ConfirmAcceptButton', 'ConfirmAcceptButtonLabel', '\u786e\u5b9a', 108);
    }
    protected layoutMagicFloorConfirmButton(popup: Node, buttonName: string, labelName: string, text: string, x: number): void {
        const button = this.findNode(buttonName, popup);
        if (!button?.isValid) return;

        button.active = true;
        button.setPosition(x, -188, 0);
        (button.getComponent(UITransform) || button.addComponent(UITransform)).setContentSize(162, 62);
        this.applyUiSkinKeepingEditorSize(button, HomeConfig.UI_CONFIRM_MAGIC_BUTTON, 162, 62);

        const labelNode = this.findNode(labelName, button) || this.findNode(labelName, popup);
        const label = labelNode?.getComponent(Label);
        if (!labelNode?.isValid || !label) return;

        labelNode.active = true;
        labelNode.setPosition(0, 1, 0);
        (labelNode.getComponent(UITransform) || labelNode.addComponent(UITransform)).setContentSize(128, 44);
        label.string = text;
        label.fontSize = 27;
        label.lineHeight = 35;
        label.color = new Color(42, 22, 8, 255);
        label.horizontalAlign = HorizontalTextAlignment.CENTER;
        label.verticalAlign = VerticalTextAlignment.CENTER;
        this.setMagicFloorTextEdge(label, false);
    }
    protected layoutBeastStrengthenConfirmPopup(popup: Node, messageText: string): void {
        this.hideMagicMonsterRoomPromptNodes(popup);

        const board = this.findNode('ConfirmPopupBoard', popup);
        if (!board?.isValid) return;

        board.setPosition(0, 0, 0);
        (board.getComponent(UITransform) || board.addComponent(UITransform)).setContentSize(650, 360);
        this.applyUiSkinKeepingEditorSize(board, HomeConfig.UI_BEAST_STRENGTHEN_POPUP_BG, 650, 360);

        const titleSkin = this.findNode('ConfirmPopupTitleSkin', popup);
        if (titleSkin?.isValid) {
            titleSkin.active = true;
            titleSkin.setPosition(0, 134, 0);
            (titleSkin.getComponent(UITransform) || titleSkin.addComponent(UITransform)).setContentSize(486, 84);
            this.applyUiSkinKeepingEditorSize(titleSkin, HomeConfig.UI_CONFIRM_TITLE_BG, 486, 84);
            titleSkin.setSiblingIndex(1);
        }

        const titleNode = this.findNode('ConfirmPopupTitle', popup);
        const titleLabel = titleNode?.getComponent(Label);
        if (titleNode?.isValid && titleLabel) {
            titleNode.active = true;
            titleNode.setPosition(0, 137, 0);
            (titleNode.getComponent(UITransform) || titleNode.addComponent(UITransform)).setContentSize(280, 52);
            titleLabel.fontSize = 30;
            titleLabel.lineHeight = 38;
            titleLabel.color = new Color(126, 74, 36, 255);
            titleLabel.horizontalAlign = HorizontalTextAlignment.CENTER;
            titleLabel.verticalAlign = VerticalTextAlignment.CENTER;
            titleLabel.overflow = Overflow.SHRINK;
            this.setLabelOutline(titleLabel, new Color(255, 245, 215, 255), 2);
            titleNode.setSiblingIndex(2);
        }

        this.hideBeastStrengthenConfirmMessageBg(popup);

        const messageNode = this.findNode('ConfirmMessage', popup);
        if (messageNode?.isValid) {
            messageNode.active = true;
            messageNode.setPosition(0, 36, 0);
            (messageNode.getComponent(UITransform) || messageNode.addComponent(UITransform)).setContentSize(540, 86);
            const richText = messageNode.getComponent(RichText);
            if (richText) richText.enabled = false;
            const messageLabel = messageNode.getComponent(Label) || messageNode.addComponent(Label);
            applySimKaiFont(messageLabel);
            messageLabel.enabled = true;
            messageLabel.string = messageText;
            messageLabel.fontSize = 24;
            messageLabel.lineHeight = 34;
            messageLabel.color = new Color(126, 80, 45, 255);
            messageLabel.horizontalAlign = HorizontalTextAlignment.CENTER;
            messageLabel.verticalAlign = VerticalTextAlignment.CENTER;
            messageLabel.overflow = Overflow.SHRINK;
            this.setMagicFloorTextEdge(messageLabel, false);
            messageNode.setSiblingIndex(4);
        }

        const quantityRoot = this.findNode('ConfirmQuantityRoot', popup);
        if (quantityRoot?.isValid) quantityRoot.active = false;

        const close = this.findNode('ConfirmPopupClose', popup);
        if (close?.isValid) close.active = false;

        this.layoutBeastStrengthenConfirmButton(popup, 'ConfirmCancelButton', 'ConfirmCancelButtonLabel', '\u53d6\u6d88', -108);
        this.layoutBeastStrengthenConfirmButton(popup, 'ConfirmAcceptButton', 'ConfirmAcceptButtonLabel', '\u786e\u5b9a', 108);
        this.scheduleOnce(() => {
            if (popup?.isValid && popup.active) {
                this.hideBeastStrengthenConfirmMessageBg(popup);
            }
        }, 0);
    }
    protected hideBeastStrengthenConfirmMessageBg(popup: Node): void {
        const messageBg = this.findNode('ConfirmMessageBg', popup);
        if (!messageBg?.isValid) return;

        messageBg.active = false;
        messageBg.setPosition(0, -2000, 0);
        (messageBg.getComponent(UITransform) || messageBg.addComponent(UITransform)).setContentSize(1, 1);
        const sprite = messageBg.getComponent(Sprite);
        if (sprite) {
            sprite.spriteFrame = null;
            sprite.enabled = false;
        }
    }
    protected layoutBeastStrengthenConfirmButton(popup: Node, buttonName: string, labelName: string, text: string, x: number): void {
        const button = this.findNode(buttonName, popup);
        if (!button?.isValid) return;

        button.active = true;
        button.setPosition(x, -126, 0);
        (button.getComponent(UITransform) || button.addComponent(UITransform)).setContentSize(162, 62);
        this.applyUiSkinKeepingEditorSize(button, HomeConfig.UI_BEAST_STRENGTHEN_BUTTON_BG, 162, 62);

        const labelNode = this.findNode(labelName, button) || this.findNode(labelName, popup);
        const label = labelNode?.getComponent(Label);
        if (!labelNode?.isValid || !label) return;

        labelNode.active = true;
        labelNode.setPosition(0, 1, 0);
        (labelNode.getComponent(UITransform) || labelNode.addComponent(UITransform)).setContentSize(128, 44);
        label.string = text;
        label.fontSize = 27;
        label.lineHeight = 35;
        label.color = new Color(42, 22, 8, 255);
        label.horizontalAlign = HorizontalTextAlignment.CENTER;
        label.verticalAlign = VerticalTextAlignment.CENTER;
        this.setMagicFloorTextEdge(label, false);
    }
}
