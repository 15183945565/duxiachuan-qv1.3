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
import { BAG_ILLUSTRATION_CATALOG, type BagIllustrationCatalogItem } from './BagIllustrationCatalog.generated';
import {
    type BeastStrengthenAction,
    type BeastStrengthenEquipPart,
    type BeastStrengthenState,
} from './HomeBeastStrengthenConfig';

import { SharedPopupContent, type RoleGender } from './HomeTypes';
import * as HomeConfig from './HomeConfig';
import { HomeViewRoleBag } from './HomeViewRoleBag';

type MagicBattleParticipantId = 'player' | 'npc-half' | 'npc-double';

interface MagicBattleDamageParticipant {
    id: MagicBattleParticipantId;
    name: string;
    isPlayer: boolean;
    skelPath?: string;
    duelScale?: number;
    duelGender?: RoleGender;
    damageMultiplier: number;
    damage: number;
    hp: number;
    maxHp: number;
    active: boolean;
    duelOutcome: 'win' | 'lose' | null;
}

interface MagicFloorConfirmEditorLayout {
    x: number;
    y: number;
    z: number;
    scaleX: number;
    scaleY: number;
    scaleZ: number;
    width: number;
    height: number;
}

const magicFloorConfirmEditorLayouts = new WeakMap<Node, MagicFloorConfirmEditorLayout>();
const MAGIC_FLOOR_CONFIRM_TEXT_COLOR = new Color(104, 70, 43, 255);
const MAGIC_FLOOR_CONFIRM_NUMBER_COLOR = new Color(42, 183, 52, 255);
const MAGIC_FLOOR_INFO_NUMBER_HIGHLIGHT_MAX = 6;

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
            magicBattleRoomPreviewActors: [],
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
        if (popupName === 'ConfirmPopup') {
            const popup = this.popupRoot?.getChildByName('ConfirmPopup') || this.findNode('ConfirmPopup');
            if (popup?.isValid) this.rememberMagicFloorConfirmEditorLayouts(popup);
        }

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
            this.layoutMagicFloorConfirmPopup(popup, content.message || '', content.magicRealmIndex || 0, content.magicFloorIndex || 0);
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
            close.setPosition(HomeConfig.SHARED_CONFIRM_CLOSE_X, HomeConfig.SHARED_CONFIRM_CLOSE_Y, 0);
            (close.getComponent(UITransform) || close.addComponent(UITransform)).setContentSize(HomeConfig.SHARED_CONFIRM_CLOSE_SIZE, HomeConfig.SHARED_CONFIRM_CLOSE_SIZE);
            this.applyUiSkinKeepingEditorSize(close, HomeConfig.UI_BTN_CLOSE, HomeConfig.SHARED_CONFIRM_CLOSE_SIZE, HomeConfig.SHARED_CONFIRM_CLOSE_SIZE);
            this.bindScaledClick(close, () => this.closeSharedFlowPopup(popup));
        }
    }
    protected hideMagicMonsterRoomPromptNodes(popup: Node, includeMagicFloorEnterNodes = true): void {
        const nodeNames = [
            'MagicMonsterRoomQuestion',
            'MagicMonsterRoomHpCaption',
            'MagicMonsterRoomHpFrame',
            'MagicMonsterRoomHpBar',
            'MagicMonsterRoomCount',
            'MagicFloorTicketRoot',
            'MagicFloorTicketCaption',
            'MagicFloorTicketIcon',
            'MagicFloorTicketCount',
        ];
        if (includeMagicFloorEnterNodes) {
            nodeNames.push(
                'MagicFloorDailyRoot',
                'MagicFloorDailyPrefix',
                'MagicFloorDailyValue',
                'MagicFloorInfoRoot',
                'MagicFloorMaterialRoot',
            );
        }
        nodeNames.forEach((nodeName) => {
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
    protected layoutMagicFloorConfirmPopup(popup: Node, messageText: string, realmIndex: number, floorIndex: number): void {
        void messageText;
        this.rememberMagicFloorConfirmEditorLayouts(popup);
        this.hideMagicMonsterRoomPromptNodes(popup, false);

        const board = this.getOrCreateMagicFloorConfirmSkin(
            popup,
            popup,
            'ConfirmPopupBoard',
            HomeConfig.MAGIC_FLOOR_ENTER_POPUP_WIDTH,
            HomeConfig.MAGIC_FLOOR_ENTER_POPUP_HEIGHT,
            0,
            0,
            HomeConfig.UI_MAGIC_FLOOR_ENTER_POPUP_BG,
        );
        if (!board?.isValid) return;
        board.setSiblingIndex(1);

        const titleSkin = this.getOrCreateMagicFloorConfirmSkin(
            board,
            popup,
            'ConfirmPopupTitleSkin',
            HomeConfig.MAGIC_FLOOR_ENTER_TITLE_WIDTH,
            HomeConfig.MAGIC_FLOOR_ENTER_TITLE_HEIGHT,
            0,
            HomeConfig.MAGIC_FLOOR_ENTER_TITLE_Y,
            HomeConfig.UI_CONFIRM_TITLE_BG,
        );
        titleSkin.setSiblingIndex(1);

        const titleLabel = this.getOrCreateMagicFloorConfirmLabel(
            board,
            popup,
            'ConfirmPopupTitle',
            '\u7cfb\u7edf\u63d0\u793a',
            HomeConfig.MAGIC_FLOOR_ENTER_TITLE_FONT_SIZE,
            0,
            HomeConfig.MAGIC_FLOOR_ENTER_TITLE_Y,
            HomeConfig.MAGIC_FLOOR_ENTER_TITLE_LABEL_WIDTH,
            HomeConfig.MAGIC_FLOOR_ENTER_TITLE_LABEL_HEIGHT,
            new Color(126, 74, 36, 255),
        );
        titleLabel.lineHeight = HomeConfig.MAGIC_FLOOR_ENTER_TITLE_FONT_SIZE + 8;
        titleLabel.horizontalAlign = HorizontalTextAlignment.CENTER;
        titleLabel.verticalAlign = VerticalTextAlignment.CENTER;
        titleLabel.overflow = Overflow.SHRINK;
        if (!this.hasMagicFloorConfirmEditorLayout(titleLabel.node)) {
            this.setLabelOutline(titleLabel, new Color(255, 245, 215, 255), 2);
        }
        titleLabel.node.setSiblingIndex(2);

        const messageBg = this.findNode('ConfirmMessageBg', popup);
        if (messageBg?.isValid) messageBg.active = false;

        const ticketCount = this.getMagicFloorTicketCount();

        const messageNode = this.findNode('ConfirmMessage', popup);
        if (messageNode?.isValid) {
            this.hideConfirmNodeForMagicMonsterPrompt(messageNode);
        }

        const quantityRoot = this.findNode('ConfirmQuantityRoot', popup);
        if (quantityRoot?.isValid) quantityRoot.active = false;

        this.layoutMagicFloorRoomInfo(popup, board, realmIndex, floorIndex);
        this.layoutMagicFloorRequirementMaterials(popup, board, ticketCount);
        this.layoutMagicFloorDailyCountRow(popup, board);

        const close = this.findNode('ConfirmPopupClose', popup);
        if (close?.isValid) close.active = false;

        this.layoutMagicFloorConfirmButton(popup, 'ConfirmCancelButton', 'ConfirmCancelButtonLabel', '\u53d6\u6d88', HomeConfig.MAGIC_FLOOR_ENTER_CANCEL_BUTTON_X);
        this.layoutMagicFloorConfirmButton(popup, 'ConfirmAcceptButton', 'ConfirmAcceptButtonLabel', '\u786e\u5b9a', HomeConfig.MAGIC_FLOOR_ENTER_ACCEPT_BUTTON_X);
    }
    protected getMagicFloorConfirmLayoutNodeNames(): string[] {
        const names = [
            'ConfirmPopupBoard',
            'ConfirmPopupTitleSkin',
            'ConfirmPopupTitle',
            'ConfirmCancelButton',
            'ConfirmCancelButtonLabel',
            'ConfirmAcceptButton',
            'ConfirmAcceptButtonLabel',
            'MagicFloorInfoRoot',
            'MagicFloorInfoTitle',
            'MagicFloorMaterialRoot',
            'MagicFloorMaterialTitle',
            'MagicFloorDailyRoot',
            'MagicFloorDailyPrefix',
            'MagicFloorDailyValue',
        ];

        HomeConfig.MAGIC_FLOOR_NAMES.forEach((_, index) => {
            names.push(`MagicFloorInfoRow_${index + 1}`);
            for (let numberIndex = 0; numberIndex < MAGIC_FLOOR_INFO_NUMBER_HIGHLIGHT_MAX; numberIndex++) {
                names.push(`MagicFloorInfoRow_${index + 1}_Number_${numberIndex + 1}`);
                names.push(`MagicFloorInfoRow_${index + 1}_Suffix_${numberIndex + 1}`);
            }
        });

        [
            'MagicFloorRequirementTicket',
            ...HomeConfig.MAGIC_FLOOR_REQUIREMENT_MATERIAL_IDS.map((_, index) => `MagicFloorRequirementMaterial_${index + 1}`),
        ].forEach((name) => {
            names.push(name, `${name}Frame`, `${name}Icon`, `${name}Count`);
        });

        return names;
    }
    protected rememberMagicFloorConfirmEditorLayouts(popup: Node): void {
        this.getMagicFloorConfirmLayoutNodeNames().forEach((nodeName) => {
            const node = this.findNode(nodeName, popup);
            if (!node?.isValid || magicFloorConfirmEditorLayouts.has(node)) return;
            if (node.position.x <= -9000 || node.position.y <= -9000) return;

            const transform = node.getComponent(UITransform);
            magicFloorConfirmEditorLayouts.set(node, {
                x: node.position.x,
                y: node.position.y,
                z: node.position.z,
                scaleX: node.scale.x,
                scaleY: node.scale.y,
                scaleZ: node.scale.z,
                width: transform?.contentSize.width || 0,
                height: transform?.contentSize.height || 0,
            });
        });
    }
    protected hasMagicFloorConfirmEditorLayout(node: Node): boolean {
        return magicFloorConfirmEditorLayouts.has(node);
    }
    protected getOrCreateMagicFloorConfirmChild(parent: Node, popup: Node, name: string, width: number, height: number, x: number, y: number): Node {
        const existingNode = this.findNode(name, popup);
        const existedInPrefab = !!existingNode?.isValid;
        let node = existingNode;
        if (!node?.isValid) {
            node = this.createNode(name, parent, width, height, x, y);
        }
        if (node.parent !== parent) node.setParent(parent);
        node.active = true;
        node.layer = parent.layer;
        const transform = node.getComponent(UITransform) || node.addComponent(UITransform);
        const hiddenOffscreen = node.position.x <= -9000 || node.position.y <= -9000;
        const hiddenLayout = hiddenOffscreen ? this.hiddenConfirmNodeLayouts.get(node) : undefined;
        const editorLayout = existedInPrefab ? magicFloorConfirmEditorLayouts.get(node) : undefined;
        if (editorLayout) {
            node.setPosition(editorLayout.x, editorLayout.y, editorLayout.z);
            node.setScale(editorLayout.scaleX, editorLayout.scaleY, editorLayout.scaleZ);
            if (editorLayout.width > 0 && editorLayout.height > 0) {
                transform.setContentSize(editorLayout.width, editorLayout.height);
            } else {
                transform.setContentSize(width, height);
            }
        } else if (hiddenLayout) {
            node.setPosition(hiddenLayout.x, hiddenLayout.y, hiddenLayout.z);
            if (hiddenLayout.width > 0 && hiddenLayout.height > 0) {
                transform.setContentSize(hiddenLayout.width, hiddenLayout.height);
            } else {
                transform.setContentSize(width, height);
            }
        } else if (!existedInPrefab || hiddenOffscreen) {
            node.setPosition(x, y, 0);
            transform.setContentSize(width, height);
        } else {
            const currentSize = transform.contentSize;
            if (currentSize.width <= 0 || currentSize.height <= 0) {
                transform.setContentSize(width, height);
            }
        }
        return node;
    }
    protected getOrCreateMagicFloorConfirmSkin(parent: Node, popup: Node, name: string, width: number, height: number, x: number, y: number, skinPath: string): Node {
        const node = this.getOrCreateMagicFloorConfirmChild(parent, popup, name, width, height, x, y);
        this.applyUiSkinKeepingEditorSize(node, skinPath, width, height);
        return node;
    }
    protected getOrCreateMagicFloorConfirmLabel(parent: Node, popup: Node, name: string, text: string, fontSize: number, x: number, y: number, width: number, height: number, color: Color): Label {
        const node = this.getOrCreateMagicFloorConfirmChild(parent, popup, name, width, height, x, y);
        const richText = node.getComponent(RichText);
        if (richText) richText.enabled = false;
        const existingLabel = node.getComponent(Label);
        const label = existingLabel || node.addComponent(Label);
        applySimKaiFont(label);
        label.enabled = true;
        label.string = text;
        if (!existingLabel) {
            label.fontSize = fontSize;
            label.lineHeight = fontSize + 8;
            label.color = color;
            label.horizontalAlign = HorizontalTextAlignment.CENTER;
            label.verticalAlign = VerticalTextAlignment.CENTER;
        }
        return label;
    }
    protected estimateMagicFloorInlineTextWidth(text: string, fontSize: number): number {
        return Array.from(text).reduce((width, char) => {
            return width + (/[\x00-\x7F]/.test(char) ? fontSize * 0.55 : fontSize * 0.92);
        }, 0);
    }
    protected refreshMagicFloorInfoRowSegments(
        popup: Node,
        rowLabel: Label,
        rowIndex: number,
        segments: Array<{ text: string; numeric: boolean }>,
    ): void {
        const rowNode = rowLabel.node;
        const transform = rowNode.getComponent(UITransform) || rowNode.addComponent(UITransform);
        const rowWidth = transform.contentSize.width || HomeConfig.MAGIC_FLOOR_ENTER_INFO_ROW_WIDTH;
        const fontSize = rowLabel.fontSize || HomeConfig.MAGIC_FLOOR_ENTER_INFO_ROW_FONT_SIZE;
        const lineHeight = rowLabel.lineHeight || fontSize + 8;
        const [prefix, ...extraSegments] = segments;
        rowLabel.string = prefix?.text || '';

        let cursorWidth = this.estimateMagicFloorInlineTextWidth(rowLabel.string, fontSize);
        let numberCount = 0;
        let suffixCount = 0;
        extraSegments.slice(0, MAGIC_FLOOR_INFO_NUMBER_HIGHLIGHT_MAX).forEach((segment, index) => {
            const segmentWidth = Math.max(fontSize, this.estimateMagicFloorInlineTextWidth(segment.text, fontSize));
            const segmentX = -rowWidth * 0.5 + cursorWidth + segmentWidth * 0.5;
            const segmentIndex = segment.numeric ? ++numberCount : ++suffixCount;
            const nodeName = segment.numeric
                ? `MagicFloorInfoRow_${rowIndex + 1}_Number_${segmentIndex}`
                : `MagicFloorInfoRow_${rowIndex + 1}_Suffix_${segmentIndex}`;
            const label = this.getOrCreateMagicFloorConfirmLabel(
                rowNode,
                popup,
                nodeName,
                segment.text,
                fontSize,
                segmentX,
                0,
                segmentWidth + 8,
                lineHeight,
                segment.numeric ? MAGIC_FLOOR_CONFIRM_NUMBER_COLOR : MAGIC_FLOOR_CONFIRM_TEXT_COLOR,
            );
            label.node.active = true;
            if (!this.hasMagicFloorConfirmEditorLayout(label.node)) {
                label.node.setPosition(segmentX, 0, 0);
                (label.node.getComponent(UITransform) || label.node.addComponent(UITransform)).setContentSize(segmentWidth + 8, lineHeight);
            }
            label.string = segment.text;
            label.fontSize = fontSize;
            label.lineHeight = lineHeight;
            label.color = segment.numeric ? MAGIC_FLOOR_CONFIRM_NUMBER_COLOR : MAGIC_FLOOR_CONFIRM_TEXT_COLOR;
            label.horizontalAlign = HorizontalTextAlignment.CENTER;
            label.verticalAlign = VerticalTextAlignment.CENTER;
            label.overflow = Overflow.SHRINK;
            this.setMagicFloorTextEdge(label, false);
            label.node.setSiblingIndex(index + 1);
            cursorWidth += segmentWidth;
        });

        for (let index = numberCount; index < MAGIC_FLOOR_INFO_NUMBER_HIGHLIGHT_MAX; index++) {
            const staleNumber = this.findNode(`MagicFloorInfoRow_${rowIndex + 1}_Number_${index + 1}`, rowNode);
            if (staleNumber?.isValid) staleNumber.active = false;
        }
        for (let index = suffixCount; index < MAGIC_FLOOR_INFO_NUMBER_HIGHLIGHT_MAX; index++) {
            const staleSuffix = this.findNode(`MagicFloorInfoRow_${rowIndex + 1}_Suffix_${index + 1}`, rowNode);
            if (staleSuffix?.isValid) staleSuffix.active = false;
        }
    }
    protected layoutMagicFloorRoomInfo(popup: Node, board: Node, realmIndex: number, floorIndex: number): void {
        void floorIndex;
        const root = this.getOrCreateMagicFloorConfirmChild(
            board,
            popup,
            'MagicFloorInfoRoot',
            HomeConfig.MAGIC_FLOOR_ENTER_INFO_ROOT_WIDTH,
            HomeConfig.MAGIC_FLOOR_ENTER_INFO_ROOT_HEIGHT,
            0,
            HomeConfig.MAGIC_FLOOR_ENTER_INFO_ROOT_Y,
        );
        root.setSiblingIndex(4);

        const section = this.getOrCreateMagicFloorConfirmLabel(
            root,
            popup,
            'MagicFloorInfoTitle',
            '\u25c6 \u623f\u95f4\u4fe1\u606f',
            HomeConfig.MAGIC_FLOOR_ENTER_SECTION_FONT_SIZE,
            HomeConfig.MAGIC_FLOOR_ENTER_SECTION_LABEL_X,
            74,
            HomeConfig.MAGIC_FLOOR_ENTER_SECTION_LABEL_WIDTH,
            HomeConfig.MAGIC_FLOOR_ENTER_SECTION_LABEL_HEIGHT,
            new Color(104, 70, 43, 255),
        );
        section.color = MAGIC_FLOOR_CONFIRM_TEXT_COLOR;
        section.horizontalAlign = HorizontalTextAlignment.LEFT;
        section.verticalAlign = VerticalTextAlignment.CENTER;
        this.setMagicFloorTextEdge(section, false);

        const safeRealmIndex = this.clamp(Math.floor(realmIndex), 0, HomeConfig.MAGIC_LEVEL_REQUIREMENTS.length - 1);
        const levelRequirement = HomeConfig.MAGIC_LEVEL_REQUIREMENTS[safeRealmIndex] || HomeConfig.MAGIC_LEVEL_REQUIREMENTS[0];
        const attackLimit = HomeConfig.MAGIC_FLOOR_ATTACK_LIMITS[safeRealmIndex] || HomeConfig.MAGIC_FLOOR_ATTACK_LIMITS[0];
        const roomCountText = HomeConfig.MAGIC_FLOOR_STATUS_TEXT.replace(/^\u9650\u5236\u4eba\u6570\(/, '').replace(/\)$/, '');
        const attackParts = attackLimit.split('-');
        const rows: Array<Array<{ text: string; numeric: boolean }>> = [
            [
                { text: '\u9700\u8981\u7b49\u7ea7\uff1a\u4eba\u7269', numeric: false },
                { text: `${levelRequirement}`, numeric: true },
                { text: '\u7ea7', numeric: false },
            ],
            [
                { text: '\u4eba\u6570\u9650\u5b9a\uff1a\u9650\u5236\u4eba\u6570(', numeric: false },
                { text: roomCountText, numeric: true },
                { text: ')', numeric: false },
            ],
            [
                { text: '\u5996\u602a\u6570\u91cf\uff1a', numeric: false },
                { text: HomeConfig.MAGIC_FLOOR_MONSTER_REMAIN_TEXT, numeric: true },
            ],
            [
                { text: '\u653b\u51fb\u529b\u8981\u6c42\uff1a', numeric: false },
                { text: attackParts[0] || attackLimit, numeric: true },
                ...(attackParts.length > 1
                    ? [
                        { text: '-', numeric: false },
                        { text: attackParts.slice(1).join('-'), numeric: true },
                    ]
                    : []),
            ],
        ];
        rows.forEach((segments, index) => {
            const rowLabel = this.getOrCreateMagicFloorConfirmLabel(
                root!,
                popup,
                `MagicFloorInfoRow_${index + 1}`,
                segments[0]?.text || '',
                HomeConfig.MAGIC_FLOOR_ENTER_INFO_ROW_FONT_SIZE,
                HomeConfig.MAGIC_FLOOR_ENTER_INFO_ROW_X,
                HomeConfig.MAGIC_FLOOR_ENTER_INFO_ROW_START_Y - index * HomeConfig.MAGIC_FLOOR_ENTER_INFO_ROW_GAP,
                HomeConfig.MAGIC_FLOOR_ENTER_INFO_ROW_WIDTH,
                HomeConfig.MAGIC_FLOOR_ENTER_INFO_ROW_HEIGHT,
                MAGIC_FLOOR_CONFIRM_TEXT_COLOR,
            );
            rowLabel.color = MAGIC_FLOOR_CONFIRM_TEXT_COLOR;
            rowLabel.horizontalAlign = HorizontalTextAlignment.LEFT;
            rowLabel.verticalAlign = VerticalTextAlignment.CENTER;
            rowLabel.overflow = Overflow.SHRINK;
            this.setMagicFloorTextEdge(rowLabel, false);
            this.refreshMagicFloorInfoRowSegments(popup, rowLabel, index, segments);
            rowLabel.node.setSiblingIndex(index + 2);
        });
    }
    protected layoutMagicFloorRequirementMaterials(popup: Node, board: Node, ticketCount: number): void {
        const root = this.getOrCreateMagicFloorConfirmChild(
            board,
            popup,
            'MagicFloorMaterialRoot',
            HomeConfig.MAGIC_FLOOR_ENTER_MATERIAL_ROOT_WIDTH,
            HomeConfig.MAGIC_FLOOR_ENTER_MATERIAL_ROOT_HEIGHT,
            0,
            HomeConfig.MAGIC_FLOOR_ENTER_MATERIAL_ROOT_Y,
        );
        root.setSiblingIndex(5);

        const section = this.getOrCreateMagicFloorConfirmLabel(
            root,
            popup,
            'MagicFloorMaterialTitle',
            '\u25c6 \u9700\u6c42\u6750\u6599',
            HomeConfig.MAGIC_FLOOR_ENTER_SECTION_FONT_SIZE,
            HomeConfig.MAGIC_FLOOR_ENTER_SECTION_LABEL_X,
            HomeConfig.MAGIC_FLOOR_ENTER_MATERIAL_TITLE_Y,
            HomeConfig.MAGIC_FLOOR_ENTER_SECTION_LABEL_WIDTH,
            HomeConfig.MAGIC_FLOOR_ENTER_SECTION_LABEL_HEIGHT,
            new Color(104, 70, 43, 255),
        );
        section.color = MAGIC_FLOOR_CONFIRM_TEXT_COLOR;
        section.horizontalAlign = HorizontalTextAlignment.LEFT;
        section.verticalAlign = VerticalTextAlignment.CENTER;
        this.setMagicFloorTextEdge(section, false);

        const requirements = [
            {
                name: 'MagicFloorRequirementTicket',
                icon: HomeConfig.UI_SHOP_MAGIC_TICKET,
                frame: BAG_ILLUSTRATION_CATALOG.find((item) => item.id === HomeConfig.MAGIC_FLOOR_TICKET_BAG_ITEM_ID)?.framePath || HomeConfig.UI_BAG_ITEM_FRAME_LV1,
                owned: ticketCount,
                need: HomeConfig.MAGIC_FLOOR_TICKET_COST,
            },
            ...HomeConfig.MAGIC_FLOOR_REQUIREMENT_MATERIAL_IDS.map((itemId, index) => ({
                name: `MagicFloorRequirementMaterial_${index + 1}`,
                icon: HomeConfig.BATTLE_UPGRADE_MATERIALS[index]?.icon || HomeConfig.BATTLE_UPGRADE_MATERIALS[0].icon,
                frame: BAG_ILLUSTRATION_CATALOG.find((item) => item.id === itemId)?.framePath || HomeConfig.UI_BAG_ITEM_FRAME_LV1,
                owned: this.getRoleInventoryCount(itemId),
                need: HomeConfig.MAGIC_FLOOR_REQUIREMENT_MATERIAL_COSTS[index] || HomeConfig.MAGIC_FLOOR_REQUIREMENT_MATERIAL_COSTS[0],
            })),
        ];

        requirements.forEach((requirement, index) => {
            const centerOffset = index - (requirements.length - 1) / 2;
            const x = centerOffset * HomeConfig.MAGIC_FLOOR_ENTER_MATERIAL_SINGLE_ROW_GAP;
            const y = HomeConfig.MAGIC_FLOOR_ENTER_MATERIAL_SINGLE_ROW_Y;
            const item = this.getOrCreateMagicFloorConfirmChild(
                root!,
                popup,
                requirement.name,
                HomeConfig.MAGIC_FLOOR_ENTER_MATERIAL_ITEM_WIDTH,
                HomeConfig.MAGIC_FLOOR_ENTER_MATERIAL_ITEM_HEIGHT,
                x,
                y,
            );
            item.setSiblingIndex(index + 2);
            const frame = this.getOrCreateMagicFloorConfirmSkin(
                item,
                popup,
                `${requirement.name}Frame`,
                HomeConfig.MAGIC_FLOOR_ENTER_MATERIAL_FRAME_SIZE,
                HomeConfig.MAGIC_FLOOR_ENTER_MATERIAL_FRAME_SIZE,
                0,
                HomeConfig.MAGIC_FLOOR_ENTER_MATERIAL_ICON_Y,
                requirement.frame,
            );
            frame.setSiblingIndex(0);

            const icon = this.getOrCreateMagicFloorConfirmSkin(
                item,
                popup,
                `${requirement.name}Icon`,
                HomeConfig.MAGIC_FLOOR_ENTER_MATERIAL_ICON_SIZE,
                HomeConfig.MAGIC_FLOOR_ENTER_MATERIAL_ICON_SIZE,
                0,
                HomeConfig.MAGIC_FLOOR_ENTER_MATERIAL_ICON_Y,
                requirement.icon,
            );
            icon.setSiblingIndex(1);

            const enough = requirement.owned >= requirement.need;
            const countColor = enough ? new Color(42, 183, 52, 255) : new Color(214, 41, 32, 255);
            const count = this.getOrCreateMagicFloorConfirmLabel(
                item,
                popup,
                `${requirement.name}Count`,
                `${requirement.owned}/${requirement.need}`,
                HomeConfig.MAGIC_FLOOR_ENTER_MATERIAL_COUNT_FONT_SIZE,
                0,
                HomeConfig.MAGIC_FLOOR_ENTER_MATERIAL_COUNT_Y,
                HomeConfig.MAGIC_FLOOR_ENTER_MATERIAL_COUNT_WIDTH,
                HomeConfig.MAGIC_FLOOR_ENTER_MATERIAL_COUNT_HEIGHT,
                countColor,
            );
            count.color = countColor;
            count.horizontalAlign = HorizontalTextAlignment.CENTER;
            count.verticalAlign = VerticalTextAlignment.CENTER;
            count.overflow = Overflow.SHRINK;
            this.setMagicFloorTextEdge(count, false);
            count.node.setSiblingIndex(2);
        });
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
        const root = this.getOrCreateMagicFloorConfirmChild(
            board,
            popup,
            'MagicFloorDailyRoot',
            HomeConfig.MAGIC_FLOOR_CONFIRM_DAILY_ROOT_WIDTH,
            HomeConfig.MAGIC_FLOOR_CONFIRM_DAILY_ROOT_HEIGHT,
            0,
            HomeConfig.MAGIC_FLOOR_ENTER_DAILY_ROOT_Y,
        );
        root.setSiblingIndex(6);

        const prefix = this.getOrCreateMagicFloorConfirmLabel(
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

        const value = this.getOrCreateMagicFloorConfirmLabel(
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
        const board = this.findNode('ConfirmPopupBoard', popup);
        if (!board?.isValid) return;

        const button = this.getOrCreateMagicFloorConfirmSkin(
            board,
            popup,
            buttonName,
            HomeConfig.SHARED_CONFIRM_BUTTON_WIDTH,
            HomeConfig.SHARED_CONFIRM_BUTTON_HEIGHT,
            x,
            HomeConfig.MAGIC_FLOOR_ENTER_BUTTON_Y,
            HomeConfig.UI_CONFIRM_MAGIC_BUTTON,
        );

        const label = this.getOrCreateMagicFloorConfirmLabel(
            button,
            popup,
            labelName,
            text,
            HomeConfig.SHARED_CONFIRM_BUTTON_FONT_SIZE,
            0,
            HomeConfig.SHARED_CONFIRM_BUTTON_LABEL_Y,
            HomeConfig.SHARED_CONFIRM_BUTTON_LABEL_WIDTH,
            HomeConfig.SHARED_CONFIRM_BUTTON_LABEL_HEIGHT,
            new Color(42, 22, 8, 255),
        );
        if (!this.hasMagicFloorConfirmEditorLayout(label.node)) {
            label.fontSize = HomeConfig.SHARED_CONFIRM_BUTTON_FONT_SIZE;
            label.lineHeight = HomeConfig.SHARED_CONFIRM_BUTTON_LINE_HEIGHT;
            label.color = new Color(42, 22, 8, 255);
            label.horizontalAlign = HorizontalTextAlignment.CENTER;
            label.verticalAlign = VerticalTextAlignment.CENTER;
            this.setMagicFloorTextEdge(label, false);
        }
        label.node.setSiblingIndex(1);
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
