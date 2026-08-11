import {
    Color,
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
import { applySimKaiFont } from '../Common/UIFont';
import {
    BEAST_STRENGTHEN_GEM_SLOT_POSITIONS,
    BEAST_STRENGTHEN_PARTS,
    type BeastStrengthenAction,
} from './HomeBeastStrengthenConfig';
import * as HomeConfig from './HomeConfig';
import { HomeViewBase } from './HomeViewBase';

abstract class HomeFeatureBeastStrengthenPageHost extends HomeViewBase {
    protected abstract beastStrengthenTitleLabel: Label | null;
    protected abstract beastStrengthenYuanbaoLabel: Label | null;
    protected abstract beastStrengthenBonusLabel: Label | null;
    protected abstract beastStrengthenActionButton: Node | null;
    protected abstract beastStrengthenActionLabel: Label | null;
    protected abstract beastStrengthenRemoveGemButton: Node | null;
    protected abstract beastStrengthenRemoveGemLabel: Label | null;
    protected abstract beastStrengthenGemSelectPopup: Node | null;
    protected abstract beastStrengthenSelectedGemSlotIndex: number;
    protected abstract beastStrengthenEquipmentSelectionVisible: boolean;
    protected abstract beastStrengthenAction: BeastStrengthenAction;
    protected abstract refreshBeastStrengthenPage(): void;
    protected abstract handleBeastStrengthenGemSlotClick(index: number): void;
    protected abstract handleBeastStrengthenActionButtonClick(): void;
    protected abstract handleBeastStrengthenRemoveGemButtonClick(): void;
    protected abstract setLabelOutline(label: Label, color: Color, width: number): void;
    protected abstract isCurrentBeastCardActivated(): boolean;
    protected abstract showCurrentBeastCardActivationRequiredToast(): void;
    protected abstract raiseBottomFeatureBackButton(): void;
}

/**
 * Builds and opens the Beast Strengthen page and its gem-selection overlay.
 * Business rules and mutable state are provided by the neighboring feature layers.
 */
export abstract class HomeFeatureBeastStrengthenPage extends HomeFeatureBeastStrengthenPageHost {
    protected ensureBeastStrengthenPage(): void {
        if (!this.bottomFeaturePanel?.isValid) return;
        if (!this.beastStrengthenPage?.isValid) {
            const editorPage = this.bottomFeaturePanel.getChildByName('BeastStrengthenPage') || this.findNode('BeastStrengthenPage');
            this.beastStrengthenPage = editorPage?.isValid
                ? editorPage
                : this.createNode('BeastStrengthenPage', this.bottomFeaturePanel, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT, 0, 0);
            if (this.beastStrengthenPage.parent !== this.bottomFeaturePanel) {
                this.beastStrengthenPage.setParent(this.bottomFeaturePanel);
            }
        }

        this.ensureInputBlocker(this.beastStrengthenPage);
        this.beastStrengthenPage.active = false;

        const backgroundResult = this.getOrCreateBottomFeatureSkinnedNode(
            this.beastStrengthenPage,
            'BeastStrengthenBackground',
            HomeConfig.VIEW_WIDTH,
            HomeConfig.VIEW_HEIGHT,
            0,
            0,
            HomeConfig.UI_BEAST_STRENGTHEN_BG,
        );
        this.beastStrengthenBackground = backgroundResult.node;
        this.beastStrengthenBackground.setSiblingIndex(0);

        const titleFrame = this.getOrCreateBottomFeatureSkinnedNode(
            this.beastStrengthenPage,
            'BeastStrengthenTitleFrame',
            486,
            84,
            0,
            675,
            HomeConfig.UI_BEAST_STRENGTHEN_TITLE_FRAME,
        ).node;
        titleFrame.setSiblingIndex(2);
        this.beastStrengthenTitleLabel = this.getOrCreateBeastStrengthenLabel(
            titleFrame,
            'BeastStrengthenTitleLabel',
            '\u517d\u8109\u5f3a\u5316',
            32,
            0,
            2,
            260,
            54,
            new Color(255, 232, 170, 255),
        );
        this.applyBeastStrengthenTextOutline(this.beastStrengthenTitleLabel, 2);

        const currencyRoot = this.getOrCreateBottomFeatureNode(this.beastStrengthenPage, 'BeastStrengthenCurrencyRoot', 230, 72, 238, 612).node;
        currencyRoot.setSiblingIndex(3);
        const yuanbaoIcon = this.getOrCreateBottomFeatureNode(currencyRoot, 'BeastStrengthenYuanbaoIcon', 42, 44, -72, 0).node;
        yuanbaoIcon.setSiblingIndex(0);
        (yuanbaoIcon.getComponent(UITransform) || yuanbaoIcon.addComponent(UITransform)).setContentSize(42, 44);
        this.applyUiSkin(yuanbaoIcon, HomeConfig.UI_HOME_JIFEN_ICON, 42, 44);
        this.beastStrengthenYuanbaoLabel = this.getOrCreateBeastStrengthenLabel(
            currencyRoot,
            'BeastStrengthenYuanbaoLabel',
            `${HomeConfig.BEAST_STRENGTHEN_DEFAULT_YUANBAO}`,
            28,
            30,
            0,
            150,
            48,
            new Color(255, 246, 210, 255),
        );
        this.applyBeastStrengthenTextOutline(this.beastStrengthenYuanbaoLabel, 2);

        const gemPanel = this.getOrCreateBottomFeatureSkinnedNode(
            this.beastStrengthenPage,
            'BeastStrengthenGemPanel',
            HomeConfig.BEAST_STRENGTHEN_GEM_PANEL_WIDTH,
            HomeConfig.BEAST_STRENGTHEN_GEM_PANEL_HEIGHT,
            0,
            HomeConfig.BEAST_STRENGTHEN_GEM_PANEL_Y,
            HomeConfig.UI_BEAST_STRENGTHEN_GEM_PANEL,
        ).node;
        gemPanel.setSiblingIndex(5);

        const centerFrame = this.getOrCreateBottomFeatureSkinnedNode(
            gemPanel,
            'BeastStrengthenCenterEquipFrame',
            HomeConfig.BEAST_STRENGTHEN_CENTER_EQUIP_SIZE,
            HomeConfig.BEAST_STRENGTHEN_CENTER_EQUIP_SIZE,
            0,
            16,
            HomeConfig.UI_BEAST_STRENGTHEN_CENTER_EQUIP_FRAME,
        ).node;
        centerFrame.setSiblingIndex(8);
        this.getOrCreateBottomFeatureNode(centerFrame, 'BeastStrengthenCenterEquipIcon', 82, 82, 0, 0).node.setSiblingIndex(1);
        this.getOrCreateBottomFeatureSkinnedNode(centerFrame, 'BeastStrengthenCenterEquipLock', 48, 58, 0, 0, HomeConfig.UI_BEAST_STRENGTHEN_LOCK_ICON).node.setSiblingIndex(2);
        const selectedNameLabel = this.getOrCreateBeastStrengthenLabel(
            gemPanel,
            'BeastStrengthenSelectedEquipName',
            '',
            24,
            0,
            -104,
            240,
            42,
            new Color(255, 232, 170, 255),
        );
        (selectedNameLabel.node.getComponent(UITransform) || selectedNameLabel.node.addComponent(UITransform)).setContentSize(260, 42);
        selectedNameLabel.enableWrapText = false;
        this.applyBeastStrengthenTextOutline(selectedNameLabel, 2);

        BEAST_STRENGTHEN_GEM_SLOT_POSITIONS.forEach((position, index) => {
            const slot = this.getOrCreateBottomFeatureNode(
                gemPanel,
                `BeastGemSlot_${index + 1}`,
                HomeConfig.BEAST_STRENGTHEN_GEM_SLOT_SIZE,
                HomeConfig.BEAST_STRENGTHEN_GEM_SLOT_SIZE,
                position.x,
                position.y,
            ).node;
            slot.setSiblingIndex(9 + index);
            this.getOrCreateBottomFeatureSkinnedNode(slot, 'BeastGemSlotPlus', 58, 58, 0, 0, HomeConfig.UI_BEAST_STRENGTHEN_PLUS_ICON).node.setSiblingIndex(1);
            this.getOrCreateBottomFeatureSkinnedNode(slot, 'BeastGemSlotLock', 42, 52, 0, 0, HomeConfig.UI_BEAST_STRENGTHEN_LOCK_ICON).node.setSiblingIndex(2);
            this.getOrCreateBottomFeatureNode(slot, 'BeastGemSlotIcon', HomeConfig.BEAST_STRENGTHEN_GEM_ICON_SIZE, HomeConfig.BEAST_STRENGTHEN_GEM_ICON_SIZE, 0, 0).node.setSiblingIndex(3);
            const selectedFrame = this.getOrCreateBottomFeatureSkinnedNode(
                slot,
                'BeastGemSlotSelectedFrame',
                HomeConfig.BEAST_STRENGTHEN_EQUIP_SELECTED_FRAME_SIZE,
                HomeConfig.BEAST_STRENGTHEN_EQUIP_SELECTED_FRAME_SIZE,
                0,
                0,
                HomeConfig.UI_BEAST_STRENGTHEN_SELECTED_FRAME,
            ).node;
            selectedFrame.active = false;
            selectedFrame.setSiblingIndex(4);
            this.bindScaledClick(slot, () => this.handleBeastStrengthenGemSlotClick(index));
        });

        this.getOrCreateBottomFeatureSkinnedNode(
            this.beastStrengthenPage,
            'BeastStrengthenEquipStrip',
            620,
            92,
            0,
            HomeConfig.BEAST_STRENGTHEN_EQUIP_ROW_Y,
            HomeConfig.UI_BEAST_STRENGTHEN_EQUIP_STRIP,
        ).node.setSiblingIndex(6);

        const equipSlotsRoot = this.getOrCreateBottomFeatureNode(this.beastStrengthenPage, 'BeastStrengthenEquipmentSlots', 620, 116, 0, HomeConfig.BEAST_STRENGTHEN_EQUIP_ROW_Y).node;
        equipSlotsRoot.setSiblingIndex(7);
        const equipSlotXs = [-222, -74, 74, 222];
        BEAST_STRENGTHEN_PARTS.forEach((part, index) => {
            const slot = this.getOrCreateBottomFeatureSkinnedNode(
                equipSlotsRoot,
                `BeastEquipSlot_${part.part}`,
                HomeConfig.BEAST_STRENGTHEN_EQUIP_SLOT_SIZE,
                HomeConfig.BEAST_STRENGTHEN_EQUIP_SLOT_SIZE,
                equipSlotXs[index],
                0,
                HomeConfig.UI_BEAST_STRENGTHEN_EQUIP_LOCKED_FRAME,
            ).node;
            slot.setSiblingIndex(index);
            this.getOrCreateBottomFeatureNode(slot, 'BeastEquipIcon', HomeConfig.BEAST_STRENGTHEN_EQUIP_ICON_SIZE, HomeConfig.BEAST_STRENGTHEN_EQUIP_ICON_SIZE, 0, 0).node.setSiblingIndex(1);
            this.getOrCreateBottomFeatureSkinnedNode(slot, 'BeastEquipLock', 42, 52, 0, 0, HomeConfig.UI_BEAST_STRENGTHEN_LOCK_ICON).node.setSiblingIndex(2);
            const selectedFrame = this.getOrCreateBottomFeatureSkinnedNode(
                slot,
                'BeastEquipSelectedFrame',
                HomeConfig.BEAST_STRENGTHEN_EQUIP_SELECTED_FRAME_SIZE,
                HomeConfig.BEAST_STRENGTHEN_EQUIP_SELECTED_FRAME_SIZE,
                0,
                0,
                HomeConfig.UI_BEAST_STRENGTHEN_SELECTED_FRAME,
            ).node;
            selectedFrame.active = false;
            (selectedFrame.getComponent(UITransform) || selectedFrame.addComponent(UITransform)).setContentSize(
                HomeConfig.BEAST_STRENGTHEN_EQUIP_SELECTED_FRAME_SIZE,
                HomeConfig.BEAST_STRENGTHEN_EQUIP_SELECTED_FRAME_SIZE,
            );
            selectedFrame.setSiblingIndex(3);
        });

        const bonusRoot = this.getOrCreateBottomFeatureNode(this.beastStrengthenPage, 'BeastStrengthenBonusRoot', 560, 120, 0, HomeConfig.BEAST_STRENGTHEN_BONUS_Y).node;
        bonusRoot.setSiblingIndex(8);
        const oldBonusTitleFrame = bonusRoot.getChildByName('BeastStrengthenBonusTitleFrame');
        if (oldBonusTitleFrame?.isValid) oldBonusTitleFrame.active = false;
        const bonusTitle = this.getOrCreateBeastStrengthenLabel(bonusRoot, 'BeastStrengthenBonusTitle', '\u5f53\u524d\u603b\u52a0\u6210', 28, 0, 24, 260, 48, new Color(255, 232, 170, 255));
        this.applyBeastStrengthenTextOutline(bonusTitle, 2);
        this.beastStrengthenBonusLabel = this.getOrCreateBeastStrengthenLabel(bonusRoot, 'BeastStrengthenBonusLabel', '\u517d\u8109\u5361\u4ea7\u51fa:+0', 24, 0, -28, 420, 44, new Color(174, 255, 122, 255));
        this.applyBeastStrengthenTextOutline(this.beastStrengthenBonusLabel, 2);

        this.beastStrengthenActionButton = this.getOrCreateBottomFeatureSkinnedNode(
            this.beastStrengthenPage,
            'BeastStrengthenActionButton',
            162,
            62,
            0,
            HomeConfig.BEAST_STRENGTHEN_ACTION_Y,
            HomeConfig.UI_BEAST_STRENGTHEN_BUTTON_BG,
        ).node;
        this.beastStrengthenActionButton.setSiblingIndex(9);
        this.beastStrengthenActionLabel = this.getOrCreateBeastStrengthenLabel(
            this.beastStrengthenActionButton,
            'BeastStrengthenActionLabel',
            '',
            25,
            0,
            0,
            142,
            44,
            new Color(255, 246, 218, 255),
        );
        this.layoutBeastStrengthenActionLabel();
        this.bindScaledClick(this.beastStrengthenActionButton, () => this.handleBeastStrengthenActionButtonClick());

        this.beastStrengthenRemoveGemButton = this.getOrCreateBottomFeatureSkinnedNode(
            this.beastStrengthenPage,
            'BeastStrengthenRemoveGemButton',
            162,
            62,
            108,
            HomeConfig.BEAST_STRENGTHEN_ACTION_Y,
            HomeConfig.UI_BEAST_STRENGTHEN_BUTTON_BG,
        ).node;
        this.beastStrengthenRemoveGemButton.active = false;
        this.beastStrengthenRemoveGemButton.setSiblingIndex(10);
        this.beastStrengthenRemoveGemLabel = this.getOrCreateBeastStrengthenLabel(
            this.beastStrengthenRemoveGemButton,
            'BeastStrengthenRemoveGemLabel',
            '\u5378\u4e0b\u5b9d\u77f3',
            25,
            0,
            0,
            142,
            44,
            new Color(42, 22, 8, 255),
        );
        this.layoutBeastStrengthenButtonLabel(this.beastStrengthenRemoveGemLabel, '\u5378\u4e0b\u5b9d\u77f3');
        this.bindScaledClick(this.beastStrengthenRemoveGemButton, () => this.handleBeastStrengthenRemoveGemButtonClick());

        this.ensureBeastStrengthenGemSelectPopup();
        this.refreshBeastStrengthenPage();
        this.scheduleOnce(() => this.refreshBeastStrengthenPage(), 0);
    }

    protected openBeastStrengthenPage(): void {
        if (!this.isCurrentBeastCardActivated()) {
            this.showCurrentBeastCardActivationRequiredToast();
            return;
        }
        this.ensureBeastStrengthenPage();
        if (!this.beastStrengthenPage?.isValid) return;

        this.beastStrengthenAction = '';
        this.beastStrengthenSelectedGemSlotIndex = -1;
        this.beastStrengthenEquipmentSelectionVisible = false;
        this.hideBottomFeatureContentRoots(this.beastStrengthenPage);
        this.beastStrengthenPage.active = true;
        this.beastStrengthenPage.setSiblingIndex(20);
        if (this.bottomFeatureBackground?.isValid) {
            this.bottomFeatureBackground.active = false;
        }
        if (this.bottomFeatureTitleLabel) {
            this.bottomFeatureTitleLabel.node.active = false;
        }
        if (this.bottomFeatureHintLabel) {
            this.bottomFeatureHintLabel.node.active = false;
        }
        this.refreshBeastStrengthenPage();
        this.scheduleOnce(() => this.refreshBeastStrengthenPage(), 0);
        this.raiseBottomFeatureBackButton();
    }

    protected closeBeastStrengthenPage(restoreBeastCard: boolean): void {
        this.closeBeastStrengthenGemSelectPopup();
        if (this.beastStrengthenPage?.isValid) {
            this.beastStrengthenPage.active = false;
        }
        if (!restoreBeastCard) return;

        if (this.bottomFeatureBackground?.isValid) {
            this.bottomFeatureBackground.active = true;
        }
        if (this.bottomFeatureTitleLabel) {
            this.bottomFeatureTitleLabel.node.active = true;
            this.bottomFeatureTitleLabel.string = '\u517d\u5361';
        }
        if (this.bottomFeatureHintLabel) {
            this.bottomFeatureHintLabel.node.active = false;
        }
        if (this.beastCardRoot?.isValid) {
            this.beastCardRoot.active = true;
            this.beastCardRoot.setSiblingIndex(7);
        }
        this.refreshBeastCard();
        this.raiseBottomFeatureBackButton();
    }

    protected getOrCreateBeastStrengthenLabel(
        parent: Node,
        name: string,
        text: string,
        fontSize: number,
        x: number,
        y: number,
        width: number,
        height: number,
        color: Color,
    ): Label {
        const result = this.getOrCreateBottomFeatureNode(parent, name, width, height, x, y);
        const label = result.node.getComponent(Label) || result.node.addComponent(Label);
        applySimKaiFont(label);
        label.enabled = true;
        label.string = text;
        label.fontSize = fontSize;
        label.lineHeight = fontSize + 8;
        label.color = color;
        label.horizontalAlign = HorizontalTextAlignment.CENTER;
        label.verticalAlign = VerticalTextAlignment.CENTER;
        label.overflow = Overflow.SHRINK;
        return label;
    }

    protected applyBeastStrengthenTextOutline(label: Label | null, width: number): void {
        if (!label?.node?.isValid) return;
        label.enableOutline = width > 0;
        label.outlineColor = new Color(34, 24, 17, 255);
        label.outlineWidth = width;
    }

    protected layoutBeastStrengthenActionLabel(): void {
        this.layoutBeastStrengthenButtonLabel(this.beastStrengthenActionLabel, this.beastStrengthenActionLabel?.string || '');
    }

    protected layoutBeastStrengthenButtonLabel(label: Label | null, text: string): void {
        if (!label?.node?.isValid) return;

        const labelNode = label.node;
        labelNode.active = true;
        labelNode.setPosition(0, 1, 0);
        (labelNode.getComponent(UITransform) || labelNode.addComponent(UITransform)).setContentSize(142, 44);
        applySimKaiFont(label);
        label.enabled = true;
        label.fontSize = 25;
        label.lineHeight = 33;
        label.color = new Color(42, 22, 8, 255);
        label.string = text;
        label.horizontalAlign = HorizontalTextAlignment.CENTER;
        label.verticalAlign = VerticalTextAlignment.CENTER;
        label.overflow = Overflow.SHRINK;
        label.enableWrapText = false;
        this.setMagicFloorTextEdge(label, false);
    }

    protected ensureBeastStrengthenGemSelectPopup(): Node | null {
        if (!this.beastStrengthenPage?.isValid || !this.bottomFeaturePanel?.isValid) return null;

        let popup = this.bottomFeaturePanel.getChildByName('BeastGemSelectPopup')
            || this.beastStrengthenPage.getChildByName('BeastGemSelectPopup');
        if (!popup?.isValid) {
            popup = this.createNode('BeastGemSelectPopup', this.bottomFeaturePanel, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT, 0, 0);
        } else if (popup.parent !== this.bottomFeaturePanel) {
            popup.setParent(this.bottomFeaturePanel);
        }
        popup.active = false;
        popup.setPosition(0, 0, 0);
        (popup.getComponent(UITransform) || popup.addComponent(UITransform)).setContentSize(HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT);
        popup.setSiblingIndex((this.bottomFeaturePanel.children.length || 1) - 1);
        this.ensureInputBlocker(popup);
        popup.off(Node.EventType.TOUCH_END);
        popup.on(Node.EventType.TOUCH_END, (event: EventTouch) => {
            event.propagationStopped = true;
            this.closeBeastStrengthenGemSelectPopup();
        }, this);
        this.beastStrengthenGemSelectPopup = popup;

        const mask = this.getOrCreateBottomFeatureNode(popup, 'BeastGemSelectMask', HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT, 0, 0).node;
        mask.setPosition(0, 0, 0);
        (mask.getComponent(UITransform) || mask.addComponent(UITransform)).setContentSize(HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT);
        const graphics = mask.getComponent(Graphics) || mask.addComponent(Graphics);
        graphics.clear();
        this.ensureInputBlocker(mask);
        mask.setSiblingIndex(0);
        mask.off(Node.EventType.TOUCH_END);
        mask.on(Node.EventType.TOUCH_END, (event: EventTouch) => {
            event.propagationStopped = true;
            this.closeBeastStrengthenGemSelectPopup();
        }, this);

        const board = this.getOrCreateBottomFeatureNode(
            popup,
            'BeastGemSelectBoard',
            HomeConfig.ROLE_EQUIP_REPLACE_DRAWER_WIDTH,
            HomeConfig.ROLE_EQUIP_REPLACE_DRAWER_HEIGHT,
            0,
            HomeConfig.ROLE_EQUIP_REPLACE_DRAWER_Y,
        ).node;
        board.active = true;
        board.setPosition(0, HomeConfig.ROLE_EQUIP_REPLACE_DRAWER_Y, 0);
        (board.getComponent(UITransform) || board.addComponent(UITransform)).setContentSize(HomeConfig.ROLE_EQUIP_REPLACE_DRAWER_WIDTH, HomeConfig.ROLE_EQUIP_REPLACE_DRAWER_HEIGHT);
        this.applyUiSkin(
            board,
            HomeConfig.UI_BEAST_STRENGTHEN_GEM_SELECT_BG,
            HomeConfig.ROLE_EQUIP_REPLACE_DRAWER_WIDTH,
            HomeConfig.ROLE_EQUIP_REPLACE_DRAWER_HEIGHT,
        );
        board.setSiblingIndex(2);
        board.off(Node.EventType.TOUCH_START);
        board.off(Node.EventType.TOUCH_END);
        board.on(Node.EventType.TOUCH_START, (event: EventTouch) => {
            event.propagationStopped = true;
        }, this);
        board.on(Node.EventType.TOUCH_END, (event: EventTouch) => {
            event.propagationStopped = true;
        }, this);

        const title = this.getOrCreateBeastStrengthenLabel(board, 'BeastGemSelectTitle', '\u653e\u7f6e\u5b9d\u77f3', 32, 0, HomeConfig.ROLE_EQUIP_REPLACE_DRAWER_TITLE_Y, 280, 48, new Color(255, 236, 188, 255));
        title.node.setPosition(0, HomeConfig.ROLE_EQUIP_REPLACE_DRAWER_TITLE_Y, 0);
        (title.node.getComponent(UITransform) || title.node.addComponent(UITransform)).setContentSize(280, 48);
        title.fontSize = 32;
        title.lineHeight = 40;
        title.color = new Color(255, 236, 188, 255);
        this.setLabelOutline(title, new Color(61, 31, 16, 255), 3);
        title.node.setSiblingIndex(2);

        const legacyList = board.getChildByName('BeastGemSelectList');
        if (legacyList?.isValid) legacyList.active = false;
        const closeButton = board.getChildByName('BeastGemSelectCloseButton');
        if (closeButton?.isValid) closeButton.active = false;

        const viewportHeight = HomeConfig.ROLE_EQUIP_REPLACE_DRAWER_VIEWPORT_HEIGHT;
        const viewport = this.getOrCreateBottomFeatureNode(
            board,
            'BeastGemSelectViewport',
            HomeConfig.ROLE_EQUIP_REPLACE_DRAWER_VIEWPORT_WIDTH,
            viewportHeight,
            0,
            HomeConfig.ROLE_EQUIP_REPLACE_DRAWER_VIEWPORT_Y,
        ).node;
        viewport.active = true;
        viewport.setPosition(0, HomeConfig.ROLE_EQUIP_REPLACE_DRAWER_VIEWPORT_Y, 0);
        (viewport.getComponent(UITransform) || viewport.addComponent(UITransform)).setContentSize(HomeConfig.ROLE_EQUIP_REPLACE_DRAWER_VIEWPORT_WIDTH, viewportHeight);
        const viewportMask = viewport.getComponent(Mask) || viewport.addComponent(Mask);
        viewportMask.type = Mask.Type.GRAPHICS_RECT;
        viewport.setSiblingIndex(3);

        const grid = this.getOrCreateBottomFeatureNode(viewport, 'BeastGemSelectGrid', HomeConfig.ROLE_EQUIP_REPLACE_DRAWER_VIEWPORT_WIDTH, viewportHeight, 0, 0).node;
        grid.active = true;
        grid.setPosition(0, 0, 0);
        (grid.getComponent(UITransform) || grid.addComponent(UITransform)).setContentSize(HomeConfig.ROLE_EQUIP_REPLACE_DRAWER_VIEWPORT_WIDTH, viewportHeight);
        grid.setSiblingIndex(0);
        return popup;
    }

    protected async slideBeastStrengthenGemSelectDrawer(
        board: Node,
        fromY: number,
        toY: number,
        duration = 0.18,
        easing: 'sineOut' | 'sineIn' = 'sineOut',
    ): Promise<void> {
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

    protected showBeastStrengthenGemSelectDrawer(popup: Node, board: Node): void {
        const parent = popup.parent;
        popup.active = true;
        popup.setPosition(0, 0, 0);
        (popup.getComponent(UITransform) || popup.addComponent(UITransform)).setContentSize(HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT);
        if (parent?.isValid) {
            popup.setSiblingIndex((parent.children.length || 1) - 1);
        }
        const opacity = popup.getComponent(UIOpacity) || popup.addComponent(UIOpacity);
        opacity.opacity = 255;
        void this.slideBeastStrengthenGemSelectDrawer(
            board,
            HomeConfig.ROLE_EQUIP_REPLACE_DRAWER_HIDDEN_Y,
            HomeConfig.ROLE_EQUIP_REPLACE_DRAWER_Y,
            0.22,
            'sineOut',
        );
    }

    protected closeBeastStrengthenGemSelectPopup(): void {
        const popup = this.beastStrengthenGemSelectPopup;
        if (!popup?.isValid || !popup.active) return;
        const board = popup.getChildByName('BeastGemSelectBoard');
        if (!board?.isValid) {
            popup.active = false;
            this.raiseBottomFeatureBackButton();
            return;
        }

        void this.slideBeastStrengthenGemSelectDrawer(
            board,
            board.position.y,
            HomeConfig.ROLE_EQUIP_REPLACE_DRAWER_HIDDEN_Y,
            0.16,
            'sineIn',
        ).then(() => {
            popup.active = false;
            this.raiseBottomFeatureBackButton();
        });
    }
}
