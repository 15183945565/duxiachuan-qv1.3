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
    protected beastCardActivationButton: Node | null = null;
    protected beastCardActivationStatusRoot: Node | null = null;
    protected beastCardActivationStatusTitleLabel: Label | null = null;
    protected beastCardActivationStatusTimeLabel: Label | null = null;
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
    protected beastCardActivationStateLoaded = false;
    protected readonly beastCardActiveUntilByKey = new Map<string, number>();

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
            beastCardActivationButton: null,
            beastCardActivationStatusRoot: null,
            beastCardActivationStatusTitleLabel: null,
            beastCardActivationStatusTimeLabel: null,
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
            beastCardActivationStateLoaded: false,
            beastCardActiveUntilByKey: new Map<string, number>(),
        });
    }

    protected openSharedFlowPopup(popupName: string, content: SharedPopupContent = {}): void {
        if (
            popupName === 'ConfirmPopup'
            && content.variant !== 'magicFloorConfirm'
            && content.variant !== 'beastStrengthenConfirm'
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
            (board.getComponent(UITransform) || board.addComponent(UITransform)).setContentSize(HomeConfig.SHARED_CONFIRM_BOARD_WIDTH, HomeConfig.SHARED_CONFIRM_BOARD_HEIGHT);
            this.applyUiSkinKeepingEditorSize(board, HomeConfig.UI_CONFIRM_POPUP_BG, HomeConfig.SHARED_CONFIRM_BOARD_WIDTH, HomeConfig.SHARED_CONFIRM_BOARD_HEIGHT);
            board.setSiblingIndex(1);
        }

        const titleSkin = this.findNode('ConfirmPopupTitleSkin', popup);
        if (titleSkin?.isValid) {
            if (board?.isValid && titleSkin.parent !== board) titleSkin.setParent(board);
            titleSkin.active = true;
            titleSkin.setPosition(0, HomeConfig.SHARED_CONFIRM_TITLE_Y, 0);
            (titleSkin.getComponent(UITransform) || titleSkin.addComponent(UITransform)).setContentSize(HomeConfig.SHARED_CONFIRM_TITLE_WIDTH, HomeConfig.SHARED_CONFIRM_TITLE_HEIGHT);
            this.applyUiSkinKeepingEditorSize(titleSkin, HomeConfig.UI_CONFIRM_TITLE_BG, HomeConfig.SHARED_CONFIRM_TITLE_WIDTH, HomeConfig.SHARED_CONFIRM_TITLE_HEIGHT);
            titleSkin.setSiblingIndex(1);
        }

        const titleNode = this.findNode('ConfirmPopupTitle', popup);
        const titleLabel = titleNode?.getComponent(Label);
        if (titleNode?.isValid && titleLabel) {
            if (board?.isValid && titleNode.parent !== board) titleNode.setParent(board);
            titleNode.active = true;
            titleNode.setPosition(0, HomeConfig.SHARED_CONFIRM_TITLE_Y, 0);
            (titleNode.getComponent(UITransform) || titleNode.addComponent(UITransform)).setContentSize(HomeConfig.SHARED_CONFIRM_TITLE_LABEL_WIDTH, HomeConfig.SHARED_CONFIRM_TITLE_LABEL_HEIGHT);
            titleLabel.fontSize = HomeConfig.SHARED_CONFIRM_TITLE_FONT_SIZE;
            titleLabel.lineHeight = HomeConfig.SHARED_CONFIRM_TITLE_LINE_HEIGHT;
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
            messageBg.setPosition(0, HomeConfig.SHARED_CONFIRM_MESSAGE_Y, 0);
            (messageBg.getComponent(UITransform) || messageBg.addComponent(UITransform)).setContentSize(HomeConfig.SHARED_CONFIRM_MESSAGE_WIDTH, HomeConfig.SHARED_CONFIRM_MESSAGE_HEIGHT);
            this.hideCommerceConfirmMessageBg(messageBg);
            messageBg.setSiblingIndex(3);
        }

        const messageNode = this.findNode('ConfirmMessage', popup);
        if (messageNode?.isValid) {
            if (board?.isValid && messageNode.parent !== board) messageNode.setParent(board);
            messageNode.active = true;
            messageNode.setPosition(0, HomeConfig.SHARED_CONFIRM_MESSAGE_Y, 0);
            (messageNode.getComponent(UITransform) || messageNode.addComponent(UITransform)).setContentSize(HomeConfig.SHARED_CONFIRM_MESSAGE_WIDTH, HomeConfig.SHARED_CONFIRM_MESSAGE_HEIGHT);
            const richText = messageNode.getComponent(RichText);
            if (richText) {
                richText.enabled = true;
                richText.maxWidth = HomeConfig.SHARED_CONFIRM_MESSAGE_WIDTH;
                richText.fontSize = 28;
                richText.lineHeight = 40;
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
            HomeConfig.SHARED_CONFIRM_CANCEL_BUTTON_X,
            new Color(94, 36, 35, 255),
            6,
        );
        this.resetSharedConfirmButtonStyle(
            popup,
            'ConfirmAcceptButton',
            'ConfirmAcceptButtonLabel',
            HomeConfig.UI_CONFIRM_BUTTON_BG,
            '\u786e\u5b9a',
            HomeConfig.SHARED_CONFIRM_ACCEPT_BUTTON_X,
            new Color(28, 85, 82, 255),
            7,
        );

        const close = this.findNode('ConfirmPopupClose', popup);
        if (close?.isValid) {
            if (board?.isValid && close.parent !== board) close.setParent(board);
            close.active = false;
            close.setScale(0, 0, 1);
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
            'MagicFloorTicketRoot',
            'MagicFloorTicketCaption',
            'MagicFloorTicketIcon',
            'MagicFloorTicketCount',
            'MagicFloorDailyRoot',
            'MagicFloorDailyPrefix',
            'MagicFloorDailyValue',
        ].forEach((nodeName) => {
            const node = this.findNode(nodeName, popup);
            this.hideConfirmNodeForMagicMonsterPrompt(node);
        });
    }
    protected getMagicFloorTicketCount(): number {
        this.ensureShopStore();
        const count = this.shopStore?.inventory[HomeConfig.MAGIC_FLOOR_TICKET_SHOP_ITEM_ID] || 0;
        this.setRoleInventoryCount(HomeConfig.MAGIC_FLOOR_TICKET_BAG_ITEM_ID, count);
        return count;
    }
    protected consumeMagicFloorTicket(): boolean {
        this.ensureShopStore();
        if (!this.shopStore) return false;

        const itemId = HomeConfig.MAGIC_FLOOR_TICKET_SHOP_ITEM_ID;
        const currentCount = this.shopStore.inventory[itemId] || 0;
        if (currentCount < HomeConfig.MAGIC_FLOOR_TICKET_COST) return false;

        const nextCount = currentCount - HomeConfig.MAGIC_FLOOR_TICKET_COST;
        this.shopStore.inventory[itemId] = nextCount;
        this.saveShopStore();
        this.setRoleInventoryCount(HomeConfig.MAGIC_FLOOR_TICKET_BAG_ITEM_ID, nextCount);
        this.refreshRoleInventoryViews(false);
        this.refreshShopPanel();
        return true;
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
        button.setPosition(x, HomeConfig.SHARED_CONFIRM_BUTTON_Y, 0);
        (button.getComponent(UITransform) || button.addComponent(UITransform)).setContentSize(HomeConfig.SHARED_CONFIRM_BUTTON_WIDTH, HomeConfig.SHARED_CONFIRM_BUTTON_HEIGHT);
        this.applyUiSkinKeepingEditorSize(button, skinPath, HomeConfig.SHARED_CONFIRM_BUTTON_WIDTH, HomeConfig.SHARED_CONFIRM_BUTTON_HEIGHT);
        button.setSiblingIndex(siblingIndex);

        const labelNode = this.findNode(labelName, button) || this.findNode(labelName, popup);
        const label = labelNode?.getComponent(Label);
        if (!labelNode?.isValid || !label) return;

        labelNode.active = true;
        labelNode.setPosition(0, HomeConfig.SHARED_CONFIRM_BUTTON_LABEL_Y, 0);
        (labelNode.getComponent(UITransform) || labelNode.addComponent(UITransform)).setContentSize(HomeConfig.SHARED_CONFIRM_BUTTON_LABEL_WIDTH, HomeConfig.SHARED_CONFIRM_BUTTON_LABEL_HEIGHT);
        label.string = text;
        label.fontSize = HomeConfig.SHARED_CONFIRM_BUTTON_FONT_SIZE;
        label.lineHeight = HomeConfig.SHARED_CONFIRM_BUTTON_LINE_HEIGHT;
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

        board.setPosition(0, 0, 0);
        (board.getComponent(UITransform) || board.addComponent(UITransform)).setContentSize(HomeConfig.SHARED_CONFIRM_BOARD_WIDTH, HomeConfig.SHARED_CONFIRM_BOARD_HEIGHT);
        this.applyUiSkinKeepingEditorSize(board, HomeConfig.UI_CONFIRM_POPUP_BG, HomeConfig.SHARED_CONFIRM_BOARD_WIDTH, HomeConfig.SHARED_CONFIRM_BOARD_HEIGHT);

        const titleSkin = this.findNode('ConfirmPopupTitleSkin', popup);
        if (titleSkin?.isValid) {
            if (titleSkin.parent !== board) titleSkin.setParent(board);
            titleSkin.active = true;
            titleSkin.setPosition(0, HomeConfig.SHARED_CONFIRM_TITLE_Y, 0);
            (titleSkin.getComponent(UITransform) || titleSkin.addComponent(UITransform)).setContentSize(HomeConfig.SHARED_CONFIRM_TITLE_WIDTH, HomeConfig.SHARED_CONFIRM_TITLE_HEIGHT);
            this.applyUiSkinKeepingEditorSize(titleSkin, HomeConfig.UI_CONFIRM_TITLE_BG, HomeConfig.SHARED_CONFIRM_TITLE_WIDTH, HomeConfig.SHARED_CONFIRM_TITLE_HEIGHT);
            titleSkin.setSiblingIndex(1);
        }

        const titleNode = this.findNode('ConfirmPopupTitle', popup);
        const titleLabel = titleNode?.getComponent(Label);
        if (titleNode?.isValid && titleLabel) {
            if (titleNode.parent !== board) titleNode.setParent(board);
            titleNode.active = true;
            titleNode.setPosition(0, HomeConfig.SHARED_CONFIRM_TITLE_Y, 0);
            (titleNode.getComponent(UITransform) || titleNode.addComponent(UITransform)).setContentSize(HomeConfig.SHARED_CONFIRM_TITLE_LABEL_WIDTH, HomeConfig.SHARED_CONFIRM_TITLE_LABEL_HEIGHT);
            titleLabel.fontSize = HomeConfig.SHARED_CONFIRM_TITLE_FONT_SIZE;
            titleLabel.lineHeight = HomeConfig.SHARED_CONFIRM_TITLE_LINE_HEIGHT;
            titleLabel.color = new Color(126, 74, 36, 255);
            titleLabel.horizontalAlign = HorizontalTextAlignment.CENTER;
            titleLabel.verticalAlign = VerticalTextAlignment.CENTER;
            titleLabel.overflow = Overflow.SHRINK;
            this.setLabelOutline(titleLabel, new Color(255, 245, 215, 255), 2);
            titleNode.setSiblingIndex(2);
        }

        const messageBg = this.findNode('ConfirmMessageBg', popup);
        if (messageBg?.isValid) messageBg.active = false;

        const ticketCount = this.getMagicFloorTicketCount();
        const ticketEnough = ticketCount >= HomeConfig.MAGIC_FLOOR_TICKET_COST;

        const messageNode = this.findNode('ConfirmMessage', popup);
        if (messageNode?.isValid) {
            messageNode.active = true;
            messageNode.setPosition(0, HomeConfig.MAGIC_FLOOR_CONFIRM_MESSAGE_Y, 0);
            (messageNode.getComponent(UITransform) || messageNode.addComponent(UITransform)).setContentSize(
                HomeConfig.MAGIC_FLOOR_CONFIRM_MESSAGE_WIDTH,
                HomeConfig.MAGIC_FLOOR_CONFIRM_MESSAGE_HEIGHT,
            );
            const richText = messageNode.getComponent(RichText);
            if (richText) richText.enabled = false;
            const messageLabel = messageNode.getComponent(Label) || messageNode.addComponent(Label);
            applySimKaiFont(messageLabel);
            messageLabel.enabled = true;
            messageLabel.string = messageText;
            messageLabel.fontSize = 27;
            messageLabel.lineHeight = 36;
            messageLabel.color = new Color(104, 70, 43, 255);
            messageLabel.horizontalAlign = HorizontalTextAlignment.CENTER;
            messageLabel.verticalAlign = VerticalTextAlignment.CENTER;
            messageLabel.overflow = Overflow.SHRINK;
            this.setMagicFloorTextEdge(messageLabel, false);
        }

        const quantityRoot = this.findNode('ConfirmQuantityRoot', popup);
        if (quantityRoot?.isValid) quantityRoot.active = false;

        this.layoutMagicFloorTicketCostRow(popup, board, ticketCount, ticketEnough);
        this.layoutMagicFloorDailyCountRow(popup, board);

        const close = this.findNode('ConfirmPopupClose', popup);
        if (close?.isValid) close.active = false;

        this.layoutMagicFloorConfirmButton(popup, 'ConfirmCancelButton', 'ConfirmCancelButtonLabel', '\u53d6\u6d88', HomeConfig.SHARED_CONFIRM_CANCEL_BUTTON_X);
        this.layoutMagicFloorConfirmButton(popup, 'ConfirmAcceptButton', 'ConfirmAcceptButtonLabel', '\u786e\u5b9a', HomeConfig.SHARED_CONFIRM_ACCEPT_BUTTON_X);
    }
    protected layoutMagicFloorTicketCostRow(popup: Node, board: Node, ticketCount: number, ticketEnough: boolean): void {
        let root = this.findNode('MagicFloorTicketRoot', popup);
        if (!root?.isValid) {
            root = this.createNode(
                'MagicFloorTicketRoot',
                board,
                HomeConfig.MAGIC_FLOOR_CONFIRM_TICKET_ROOT_WIDTH,
                HomeConfig.MAGIC_FLOOR_CONFIRM_TICKET_ROOT_HEIGHT,
                0,
                HomeConfig.MAGIC_FLOOR_CONFIRM_TICKET_ROOT_Y,
            );
        }
        if (root.parent !== board) root.setParent(board);
        root.active = true;
        root.setPosition(0, HomeConfig.MAGIC_FLOOR_CONFIRM_TICKET_ROOT_Y, 0);
        (root.getComponent(UITransform) || root.addComponent(UITransform)).setContentSize(
            HomeConfig.MAGIC_FLOOR_CONFIRM_TICKET_ROOT_WIDTH,
            HomeConfig.MAGIC_FLOOR_CONFIRM_TICKET_ROOT_HEIGHT,
        );
        root.setSiblingIndex(5);

        const caption = this.getOrCreateConfirmLabel(
            root,
            popup,
            'MagicFloorTicketCaption',
            '\u662f\u5426\u6d88\u8017',
            HomeConfig.MAGIC_FLOOR_CONFIRM_TICKET_FONT_SIZE,
            HomeConfig.MAGIC_FLOOR_CONFIRM_TICKET_CAPTION_X,
            0,
            HomeConfig.MAGIC_FLOOR_CONFIRM_TICKET_CAPTION_WIDTH,
            HomeConfig.MAGIC_FLOOR_CONFIRM_TICKET_ROOT_HEIGHT,
            new Color(104, 70, 43, 255),
        );
        caption.horizontalAlign = HorizontalTextAlignment.RIGHT;
        caption.verticalAlign = VerticalTextAlignment.CENTER;
        caption.overflow = Overflow.SHRINK;
        this.setMagicFloorTextEdge(caption, false);

        const icon = this.getOrCreateConfirmSkin(
            root,
            popup,
            'MagicFloorTicketIcon',
            HomeConfig.MAGIC_FLOOR_CONFIRM_TICKET_ICON_SIZE,
            HomeConfig.MAGIC_FLOOR_CONFIRM_TICKET_ICON_SIZE,
            HomeConfig.MAGIC_FLOOR_CONFIRM_TICKET_ICON_X,
            0,
            HomeConfig.UI_SHOP_MAGIC_TICKET,
        );
        icon.setSiblingIndex(2);

        const count = this.getOrCreateConfirmLabel(
            root,
            popup,
            'MagicFloorTicketCount',
            `${ticketCount}/${HomeConfig.MAGIC_FLOOR_TICKET_COST}`,
            HomeConfig.MAGIC_FLOOR_CONFIRM_TICKET_FONT_SIZE,
            HomeConfig.MAGIC_FLOOR_CONFIRM_TICKET_COUNT_X,
            0,
            HomeConfig.MAGIC_FLOOR_CONFIRM_TICKET_COUNT_WIDTH,
            HomeConfig.MAGIC_FLOOR_CONFIRM_TICKET_ROOT_HEIGHT,
            ticketEnough ? new Color(40, 196, 58, 255) : new Color(214, 41, 32, 255),
        );
        count.horizontalAlign = HorizontalTextAlignment.LEFT;
        count.verticalAlign = VerticalTextAlignment.CENTER;
        count.overflow = Overflow.SHRINK;
        count.lineHeight = HomeConfig.MAGIC_FLOOR_CONFIRM_TICKET_FONT_SIZE + 8;
        this.setMagicFloorTextEdge(count, false);
        count.node.setSiblingIndex(3);
    }
    protected layoutMagicFloorDailyCountRow(popup: Node, board: Node): void {
        let root = this.findNode('MagicFloorDailyRoot', popup);
        if (!root?.isValid) {
            root = this.createNode(
                'MagicFloorDailyRoot',
                board,
                HomeConfig.MAGIC_FLOOR_CONFIRM_DAILY_ROOT_WIDTH,
                HomeConfig.MAGIC_FLOOR_CONFIRM_DAILY_ROOT_HEIGHT,
                0,
                HomeConfig.MAGIC_FLOOR_CONFIRM_DAILY_ROOT_Y,
            );
        }
        if (root.parent !== board) root.setParent(board);
        root.active = true;
        root.setPosition(0, HomeConfig.MAGIC_FLOOR_CONFIRM_DAILY_ROOT_Y, 0);
        (root.getComponent(UITransform) || root.addComponent(UITransform)).setContentSize(
            HomeConfig.MAGIC_FLOOR_CONFIRM_DAILY_ROOT_WIDTH,
            HomeConfig.MAGIC_FLOOR_CONFIRM_DAILY_ROOT_HEIGHT,
        );
        root.setSiblingIndex(6);

        const prefix = this.getOrCreateConfirmLabel(
            root,
            popup,
            'MagicFloorDailyPrefix',
            '\u4eca\u65e5\u5269\u4f59\u6b21\u6570\uff1a',
            HomeConfig.MAGIC_FLOOR_CONFIRM_DAILY_FONT_SIZE,
            HomeConfig.MAGIC_FLOOR_CONFIRM_DAILY_PREFIX_X,
            0,
            HomeConfig.MAGIC_FLOOR_CONFIRM_DAILY_PREFIX_WIDTH,
            HomeConfig.MAGIC_FLOOR_CONFIRM_DAILY_ROOT_HEIGHT,
            new Color(104, 70, 43, 255),
        );
        prefix.horizontalAlign = HorizontalTextAlignment.RIGHT;
        prefix.verticalAlign = VerticalTextAlignment.CENTER;
        prefix.overflow = Overflow.SHRINK;
        this.setMagicFloorTextEdge(prefix, false);

        const value = this.getOrCreateConfirmLabel(
            root,
            popup,
            'MagicFloorDailyValue',
            HomeConfig.MAGIC_CHALLENGE_COUNT_VALUE_TEXT,
            HomeConfig.MAGIC_FLOOR_CONFIRM_DAILY_FONT_SIZE,
            HomeConfig.MAGIC_FLOOR_CONFIRM_DAILY_VALUE_X,
            0,
            HomeConfig.MAGIC_FLOOR_CONFIRM_DAILY_VALUE_WIDTH,
            HomeConfig.MAGIC_FLOOR_CONFIRM_DAILY_ROOT_HEIGHT,
            new Color(40, 196, 58, 255),
        );
        value.horizontalAlign = HorizontalTextAlignment.LEFT;
        value.verticalAlign = VerticalTextAlignment.CENTER;
        value.overflow = Overflow.SHRINK;
        this.setMagicFloorTextEdge(value, false);
        value.node.setSiblingIndex(2);
    }
    protected layoutMagicFloorConfirmButton(popup: Node, buttonName: string, labelName: string, text: string, x: number): void {
        const button = this.findNode(buttonName, popup);
        if (!button?.isValid) return;

        button.active = true;
        button.setPosition(x, HomeConfig.SHARED_CONFIRM_BUTTON_Y, 0);
        (button.getComponent(UITransform) || button.addComponent(UITransform)).setContentSize(HomeConfig.SHARED_CONFIRM_BUTTON_WIDTH, HomeConfig.SHARED_CONFIRM_BUTTON_HEIGHT);
        this.applyUiSkinKeepingEditorSize(button, HomeConfig.UI_CONFIRM_MAGIC_BUTTON, HomeConfig.SHARED_CONFIRM_BUTTON_WIDTH, HomeConfig.SHARED_CONFIRM_BUTTON_HEIGHT);

        const labelNode = this.findNode(labelName, button) || this.findNode(labelName, popup);
        const label = labelNode?.getComponent(Label);
        if (!labelNode?.isValid || !label) return;

        labelNode.active = true;
        labelNode.setPosition(0, HomeConfig.SHARED_CONFIRM_BUTTON_LABEL_Y, 0);
        (labelNode.getComponent(UITransform) || labelNode.addComponent(UITransform)).setContentSize(HomeConfig.SHARED_CONFIRM_BUTTON_LABEL_WIDTH, HomeConfig.SHARED_CONFIRM_BUTTON_LABEL_HEIGHT);
        label.string = text;
        label.fontSize = HomeConfig.SHARED_CONFIRM_BUTTON_FONT_SIZE;
        label.lineHeight = HomeConfig.SHARED_CONFIRM_BUTTON_LINE_HEIGHT;
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
        (board.getComponent(UITransform) || board.addComponent(UITransform)).setContentSize(HomeConfig.SHARED_CONFIRM_BOARD_WIDTH, HomeConfig.SHARED_CONFIRM_BOARD_HEIGHT);
        this.applyUiSkinKeepingEditorSize(board, HomeConfig.UI_BEAST_STRENGTHEN_POPUP_BG, HomeConfig.SHARED_CONFIRM_BOARD_WIDTH, HomeConfig.SHARED_CONFIRM_BOARD_HEIGHT);

        const titleSkin = this.findNode('ConfirmPopupTitleSkin', popup);
        if (titleSkin?.isValid) {
            titleSkin.active = true;
            titleSkin.setPosition(0, HomeConfig.SHARED_CONFIRM_TITLE_Y, 0);
            (titleSkin.getComponent(UITransform) || titleSkin.addComponent(UITransform)).setContentSize(HomeConfig.SHARED_CONFIRM_TITLE_WIDTH, HomeConfig.SHARED_CONFIRM_TITLE_HEIGHT);
            this.applyUiSkinKeepingEditorSize(titleSkin, HomeConfig.UI_CONFIRM_TITLE_BG, HomeConfig.SHARED_CONFIRM_TITLE_WIDTH, HomeConfig.SHARED_CONFIRM_TITLE_HEIGHT);
            titleSkin.setSiblingIndex(1);
        }

        const titleNode = this.findNode('ConfirmPopupTitle', popup);
        const titleLabel = titleNode?.getComponent(Label);
        if (titleNode?.isValid && titleLabel) {
            titleNode.active = true;
            titleNode.setPosition(0, HomeConfig.SHARED_CONFIRM_TITLE_Y, 0);
            (titleNode.getComponent(UITransform) || titleNode.addComponent(UITransform)).setContentSize(HomeConfig.SHARED_CONFIRM_TITLE_LABEL_WIDTH, HomeConfig.SHARED_CONFIRM_TITLE_LABEL_HEIGHT);
            titleLabel.fontSize = HomeConfig.SHARED_CONFIRM_TITLE_FONT_SIZE;
            titleLabel.lineHeight = HomeConfig.SHARED_CONFIRM_TITLE_LINE_HEIGHT;
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
            messageNode.setPosition(0, HomeConfig.SHARED_CONFIRM_MESSAGE_Y, 0);
            (messageNode.getComponent(UITransform) || messageNode.addComponent(UITransform)).setContentSize(HomeConfig.SHARED_CONFIRM_MESSAGE_WIDTH, HomeConfig.SHARED_CONFIRM_MESSAGE_HEIGHT);
            const richText = messageNode.getComponent(RichText);
            if (richText) richText.enabled = false;
            const messageLabel = messageNode.getComponent(Label) || messageNode.addComponent(Label);
            applySimKaiFont(messageLabel);
            messageLabel.enabled = true;
            messageLabel.string = messageText;
            messageLabel.fontSize = 28;
            messageLabel.lineHeight = 40;
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

        this.layoutBeastStrengthenConfirmButton(popup, 'ConfirmCancelButton', 'ConfirmCancelButtonLabel', '\u53d6\u6d88', HomeConfig.SHARED_CONFIRM_CANCEL_BUTTON_X);
        this.layoutBeastStrengthenConfirmButton(popup, 'ConfirmAcceptButton', 'ConfirmAcceptButtonLabel', '\u786e\u5b9a', HomeConfig.SHARED_CONFIRM_ACCEPT_BUTTON_X);
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
        button.setPosition(x, HomeConfig.SHARED_CONFIRM_BUTTON_Y, 0);
        (button.getComponent(UITransform) || button.addComponent(UITransform)).setContentSize(HomeConfig.SHARED_CONFIRM_BUTTON_WIDTH, HomeConfig.SHARED_CONFIRM_BUTTON_HEIGHT);
        this.applyUiSkinKeepingEditorSize(button, HomeConfig.UI_BEAST_STRENGTHEN_BUTTON_BG, HomeConfig.SHARED_CONFIRM_BUTTON_WIDTH, HomeConfig.SHARED_CONFIRM_BUTTON_HEIGHT);

        const labelNode = this.findNode(labelName, button) || this.findNode(labelName, popup);
        const label = labelNode?.getComponent(Label);
        if (!labelNode?.isValid || !label) return;

        labelNode.active = true;
        labelNode.setPosition(0, HomeConfig.SHARED_CONFIRM_BUTTON_LABEL_Y, 0);
        (labelNode.getComponent(UITransform) || labelNode.addComponent(UITransform)).setContentSize(HomeConfig.SHARED_CONFIRM_BUTTON_LABEL_WIDTH, HomeConfig.SHARED_CONFIRM_BUTTON_LABEL_HEIGHT);
        label.string = text;
        label.fontSize = HomeConfig.SHARED_CONFIRM_BUTTON_FONT_SIZE;
        label.lineHeight = HomeConfig.SHARED_CONFIRM_BUTTON_LINE_HEIGHT;
        label.color = new Color(42, 22, 8, 255);
        label.horizontalAlign = HorizontalTextAlignment.CENTER;
        label.verticalAlign = VerticalTextAlignment.CENTER;
        this.setMagicFloorTextEdge(label, false);
    }
}
