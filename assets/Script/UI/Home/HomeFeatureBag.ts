import {
    Color,
    EventTouch,
    HorizontalTextAlignment,
    Label,
    Mask,
    Node,
    ScrollView,
    Sprite,
    UIOpacity,
    UITransform,
} from 'cc';
import {
    BAG_ILLUSTRATION_CATALOG,
    type BagIllustrationCatalogItem,
    type BagIllustrationCategory,
} from './BagIllustrationCatalog.generated';
import * as HomeConfig from './HomeConfig';
import { HomeViewBase } from './HomeViewBase';
import { BagCatalogView, BagPageTab } from './HomeTypes';

type RoleEquipmentSlotId = 'weapon' | 'helmet' | 'armor' | 'wrist' | 'leg' | 'shoes' | 'necklace' | 'ring';
type RoleEquipmentStatType = 'attack' | 'life' | 'defense';

interface RoleEquipmentSlotConfig {
    id: RoleEquipmentSlotId;
    displayName: string;
    iconPath: string;
    keywords: string[];
    frameName: string;
    slotIndex: number;
}

type BagDecomposeResult = {
    material: BagIllustrationCatalogItem;
    count: number;
    statType: RoleEquipmentStatType;
};

type RoleEquipmentRuntimeItem = BagIllustrationCatalogItem & {
    displayLevel?: number;
    baseTier?: number;
};

abstract class HomeFeatureBagHost extends HomeViewBase {
    protected abstract readonly roleEquippedItems: Map<RoleEquipmentSlotId, RoleEquipmentRuntimeItem>;
    protected abstract bagDecomposeSelectedItem: BagIllustrationCatalogItem | null;
    protected abstract bagSynthSelectedFragment: BagIllustrationCatalogItem | null;

    protected abstract addRoleInventory(itemId: string, amount: number): void;
    protected abstract consumeRoleInventory(itemId: string, amount: number): boolean;
    protected abstract getBagItemCount(item: BagIllustrationCatalogItem): number;
    protected abstract getCatalogDisplayName(item: BagIllustrationCatalogItem | null | undefined): string;
    protected abstract getEquipmentLevel(item?: BagIllustrationCatalogItem | null): number;
    protected abstract getRoleEquipmentCatalogIndexByTier(slotId: RoleEquipmentSlotId, tier: number): number;
    protected abstract getRoleEquipmentSlotConfigs(): RoleEquipmentSlotConfig[];
    protected abstract getRoleEquipmentStatRule(config: RoleEquipmentSlotConfig): { type: RoleEquipmentStatType };
    protected abstract getRoleInventoryCount(itemId: string): number;
    protected abstract getRoleSeededBagItems(): BagIllustrationCatalogItem[];
    protected abstract refreshRoleInventoryViews(syncAdvanceFill?: boolean): void;
    protected abstract setLabelOutline(label: Label, color: Color, width: number): void;
}

/**
 * 背包页面壳层、分解/合成、图鉴目录、网格滚动和底部标签。
 *
 * 背包运行时状态仍由 Base 与 RoleBag 初始化器持有；本模块只负责页面行为和渲染。
 */
export abstract class HomeFeatureBag extends HomeFeatureBagHost {
    protected getBagGridScrollInertiaCallbacks(): WeakMap<Node, (dt: number) => void> {
        const host = this as HomeFeatureBag & {
            __bagGridScrollInertiaCallbacks?: WeakMap<Node, (dt: number) => void>;
        };
        if (!host.__bagGridScrollInertiaCallbacks) {
            host.__bagGridScrollInertiaCallbacks = new WeakMap<Node, (dt: number) => void>();
        }
        return host.__bagGridScrollInertiaCallbacks;
    }

    protected openBagPanel(): void {
        this.buildBagPanel();
        if (!this.bagPanel) return;
    
        this.closeOtherBottomEntryPages(this.bagPanel);
        this.bagPanel.active = true;
        this.ensureInputBlocker(this.bagPanel);
        this.bagPanel.setSiblingIndex((this.bagPanel.parent?.children.length || 1) - 1);
        this.switchBagPage('bag');
        this.refreshBottomEntryChrome();
    }
    protected closeBagPanel(): void {
        if (!this.bagPanel) return;
    
        this.closeBagIllustrationPanel();
        this.bagPanel.active = false;
        this.refreshBottomEntryChrome();
    }
    protected buildBagPanel(): void {
        if (this.bagPanel) return;
    
        const popupParent = this.pageRoot || this.popupRoot || this.node;
        const editorPanel = popupParent.getChildByName('BagPanel') || this.findNode('BagPanel');
        this.bagPanel = editorPanel || this.createNode('BagPanel', popupParent, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT, 0, 0);
        if (this.bagPanel.parent !== popupParent) {
            this.bagPanel.setParent(popupParent);
        }
        this.bagPanel.setPosition(0, 0, 0);
        (this.bagPanel.getComponent(UITransform) || this.bagPanel.addComponent(UITransform)).setContentSize(HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT);
        this.bagPanel.active = false;
        this.bagPanel.on(Node.EventType.TOUCH_END, (event: EventTouch) => {
            event.propagationStopped = true;
        }, this);
    
        const editorBackground = this.bagPanel.getChildByName('BagPageBackground');
        const bagBackground = editorBackground || this.createSkinnedNode('BagPageBackground', this.bagPanel, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT, 0, 0, HomeConfig.UI_BAG_PAGE_BG);
        bagBackground.setPosition(0, 0, 0);
        (bagBackground.getComponent(UITransform) || bagBackground.addComponent(UITransform)).setContentSize(HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT);
        this.applyUiSkinKeepingEditorSize(bagBackground, HomeConfig.UI_BAG_PAGE_BG, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT);
        bagBackground.setSiblingIndex(0);
        this.bagPageTitleLabel = this.createLabel(this.bagPanel, 'BagPageTitle', '\u80cc\u5305', 42, 0, 720, 240, 64, new Color(255, 238, 196, 255));
        this.createMailButton(this.bagPanel, 'BagPageBack', '', HomeConfig.BOTTOM_ENTRY_BACK_BUTTON_X, HomeConfig.BOTTOM_ENTRY_BACK_BUTTON_Y, HomeConfig.BOTTOM_ENTRY_BACK_BUTTON_WIDTH, HomeConfig.BOTTOM_ENTRY_BACK_BUTTON_HEIGHT, new Color(110, 72, 52, 0), () => {
            if (this.bagIllustrationMode) {
                this.closeBagIllustrationPanel();
                return;
            }
            this.closeBagPanel();
        }, HomeConfig.UI_RANK_BACK).setSiblingIndex(30);
        this.bagIllustrationButton = this.createMailButton(this.bagPanel, 'BagIllustrationButton', '', HomeConfig.BAG_ILLUSTRATION_BUTTON_X, HomeConfig.BAG_ILLUSTRATION_BUTTON_Y, HomeConfig.BAG_ILLUSTRATION_BUTTON_WIDTH, HomeConfig.BAG_ILLUSTRATION_BUTTON_HEIGHT, new Color(255, 255, 255, 0), () => this.openBagIllustrationPanel(), HomeConfig.UI_BAG_ILLUSTRATION_BTN);
        this.bagIllustrationButton.setSiblingIndex(31);
        this.createBagMaterialBoard();
        this.createBagBottomTabs();
    }
    protected createBagMaterialBoard(): void {
        if (!this.bagPanel) return;
    
        this.bagCatalogView = this.createBagCatalogView(this.bagPanel, 'BagMaterialBoard', HomeConfig.BAG_MATERIAL_BOARD_Y, 'equipment', this.getRoleSeededBagItems(), 'BagGridViewport');
        this.bagCatalogView.board.setSiblingIndex(2);
        this.ensureBagModeFrames();
    }
    protected ensureBagModeFrames(): void {
        if (!this.bagCatalogView) return;
        const board = this.bagCatalogView.board;
        this.removeBagModeFrame('BagDecomposeModeFrame');
        this.removeBagModeFrame('BagSynthModeFrame');
        this.bagDecomposeModeFrame = this.getOrCreateBagModeRoot(
            board,
            'BagDecomposeModeRoot',
            HomeConfig.BAG_DECOMPOSE_MODE_ROOT_HEIGHT,
            HomeConfig.BAG_DECOMPOSE_MODE_ROOT_Y,
        );
        this.layoutBagDecomposeMode(this.bagDecomposeModeFrame);
        this.bagSynthModeFrame = this.getOrCreateBagModeRoot(
            board,
            'BagSynthModeRoot',
            HomeConfig.BAG_SYNTH_MODE_ROOT_HEIGHT,
            HomeConfig.BAG_SYNTH_MODE_ROOT_Y,
        );
        this.layoutBagSynthMode(this.bagSynthModeFrame);
        this.bagDecomposeModeFrame.active = false;
        this.bagSynthModeFrame.active = false;
    }
    protected removeBagModeFrame(name: string): void {
        const frame = this.bagCatalogView?.board.getChildByName(name);
        if (!frame?.isValid) return;
        frame.active = false;
        frame.removeFromParent();
        frame.destroy();
    }
    protected getOrCreateBagModeRoot(parent: Node, name: string, height: number, y: number): Node {
        let root = parent.getChildByName(name);
        if (!root?.isValid) {
            root = this.createNode(name, parent, HomeConfig.BAG_MODE_ROOT_WIDTH, height, 0, y);
        }
        root.setPosition(0, y, 0);
        (root.getComponent(UITransform) || root.addComponent(UITransform)).setContentSize(HomeConfig.BAG_MODE_ROOT_WIDTH, height);
        root.setSiblingIndex(18);
        return root;
    }
    protected getOrCreateBagModeSkin(parent: Node, name: string, width: number, height: number, x: number, y: number, skinPath: string): Node {
        let node = parent.getChildByName(name);
        if (!node?.isValid) {
            node = this.createSkinnedNode(name, parent, width, height, x, y, skinPath);
        } else {
            node.setPosition(x, y, 0);
            (node.getComponent(UITransform) || node.addComponent(UITransform)).setContentSize(width, height);
            this.applyUiSkinKeepingEditorSize(node, skinPath, width, height);
        }
        node.active = true;
        return node;
    }
    protected layoutBagDecomposeMode(root: Node): void {
        this.getOrCreateBagModeSkin(
            root,
            'BagDecomposeInputSlot',
            HomeConfig.BAG_DECOMPOSE_MODE_SLOT_SIZE,
            HomeConfig.BAG_DECOMPOSE_MODE_SLOT_SIZE,
            HomeConfig.BAG_DECOMPOSE_MODE_INPUT_X,
            0,
            HomeConfig.UI_BAG_ITEM_FRAME_LV1,
        ).setSiblingIndex(1);
        this.getOrCreateBagModeSkin(
            root,
            'BagDecomposeArrow',
            HomeConfig.BAG_DECOMPOSE_MODE_ARROW_WIDTH,
            HomeConfig.BAG_DECOMPOSE_MODE_ARROW_HEIGHT,
            0,
            0,
            HomeConfig.UI_BAG_DECOMPOSE_ARROW,
        ).setSiblingIndex(2);
        this.getOrCreateBagModeSkin(
            root,
            'BagDecomposeOutputSlot',
            HomeConfig.BAG_DECOMPOSE_MODE_SLOT_SIZE,
            HomeConfig.BAG_DECOMPOSE_MODE_SLOT_SIZE,
            HomeConfig.BAG_DECOMPOSE_MODE_OUTPUT_X,
            0,
            HomeConfig.UI_BAG_ITEM_FRAME_LV1,
        ).setSiblingIndex(3);
        this.createBagDecomposeActionButtons(root);
        this.refreshBagDecomposeSlots();
    }
    protected createBagDecomposeActionButtons(root: Node): void {
        const decompose = this.getOrCreateBagModeSkin(
            root,
            'BagDecomposeButton',
            HomeConfig.BAG_DECOMPOSE_ACTION_BUTTON_WIDTH,
            HomeConfig.BAG_DECOMPOSE_ACTION_BUTTON_HEIGHT,
            -HomeConfig.BAG_DECOMPOSE_ACTION_BUTTON_X,
            HomeConfig.BAG_DECOMPOSE_ACTION_BUTTON_Y,
            HomeConfig.UI_BATTLE_ACTION_BUTTON_BG,
        );
        decompose.setSiblingIndex(4);
        this.ensureButtonText(decompose, 'BagDecomposeButtonLabel', '\u5206\u89e3');
        this.bindScaledClick(decompose, () => this.openBagDecomposeConfirm());
    
        const oneKey = this.getOrCreateBagModeSkin(
            root,
            'BagOneKeyDecomposeButton',
            HomeConfig.BAG_DECOMPOSE_ACTION_BUTTON_WIDTH,
            HomeConfig.BAG_DECOMPOSE_ACTION_BUTTON_HEIGHT,
            HomeConfig.BAG_DECOMPOSE_ACTION_BUTTON_X,
            HomeConfig.BAG_DECOMPOSE_ACTION_BUTTON_Y,
            HomeConfig.UI_BATTLE_ACTION_BUTTON_BG,
        );
        oneKey.setSiblingIndex(5);
        this.ensureButtonText(oneKey, 'BagOneKeyDecomposeButtonLabel', '\u4e00\u952e\u5206\u89e3');
        const oneKeySprite = oneKey.getComponent(Sprite);
        if (oneKeySprite) oneKeySprite.color = new Color(120, 120, 120, 255);
        const opacity = oneKey.getComponent(UIOpacity) || oneKey.addComponent(UIOpacity);
        opacity.opacity = 165;
        this.getOrCreateBagModeSkin(
            oneKey,
            'BagOneKeyDecomposeLock',
            HomeConfig.BAG_DECOMPOSE_LOCK_WIDTH,
            HomeConfig.BAG_DECOMPOSE_LOCK_HEIGHT,
            0,
            HomeConfig.BAG_DECOMPOSE_LOCK_Y,
            HomeConfig.UI_BAG_ONE_KEY_LOCK,
        ).setSiblingIndex(3);
        this.bindScaledClick(oneKey, () => this.showToast('\u4e00\u952e\u5206\u89e3\u5c1a\u672a\u89e3\u9501'));
    }
    protected refreshBagDecomposeSlots(): void {
        if (!this.bagDecomposeModeFrame?.isValid) return;
    
        this.renderBagDecomposeSlot('BagDecomposeInputSlot', this.bagDecomposeSelectedItem, this.bagDecomposeSelectedItem ? this.getRoleInventoryCount(this.bagDecomposeSelectedItem.id) : 0);
        const result = this.bagDecomposeSelectedItem ? this.getBagDecomposeResult(this.bagDecomposeSelectedItem) : null;
        this.renderBagDecomposeSlot('BagDecomposeOutputSlot', result?.material || null, result?.count || 0);
    }
    protected renderBagDecomposeSlot(slotName: string, item: BagIllustrationCatalogItem | null, count: number): void {
        const slot = this.bagDecomposeModeFrame?.getChildByName(slotName);
        if (!slot?.isValid) return;
    
        [...slot.children].forEach((child) => child.destroy());
        const framePath = item?.framePath || HomeConfig.UI_BAG_ITEM_FRAME_LV1;
        this.applyUiSkinKeepingEditorSize(slot, framePath, HomeConfig.BAG_DECOMPOSE_MODE_SLOT_SIZE, HomeConfig.BAG_DECOMPOSE_MODE_SLOT_SIZE);
        if (!item) return;
    
        this.createSkinnedNode(
            `${slotName}Icon`,
            slot,
            HomeConfig.BAG_GRID_ICON_SIZE,
            HomeConfig.BAG_GRID_ICON_SIZE,
            0,
            3,
            item.iconPath,
        ).setSiblingIndex(1);
        const countLabel = this.createLabel(slot, `${slotName}Count`, `\u00d7${count}`, 19, 22, -34, 70, 26, Color.WHITE);
        countLabel.horizontalAlign = HorizontalTextAlignment.RIGHT;
        this.setLabelOutline(countLabel, Color.BLACK, 2);
        countLabel.node.setSiblingIndex(2);
    }
    protected getBagDecomposeItems(): BagIllustrationCatalogItem[] {
        return BAG_ILLUSTRATION_CATALOG.filter((item) => (
            this.isBagDecomposeEligibleItem(item)
            && this.getRoleInventoryCount(item.id) > 0
        ));
    }
    protected selectBagDecomposeItem(item: BagIllustrationCatalogItem): void {
        if (item.category !== 'equipment') return;
        if (this.isBeastVeinEquipment(item)) {
            this.showToast('\u517d\u8109\u88c5\u5907\u4e0d\u53ef\u5206\u89e3');
            return;
        }
        if (!this.isBagDecomposeEligibleItem(item)) {
            this.showToast('\u53ea\u80fd\u5206\u89e3\u4e00\u7ea7\u88c5\u5907');
            return;
        }
        if (this.getRoleInventoryCount(item.id) <= 0) {
            this.showToast('\u88c5\u5907\u6570\u91cf\u4e0d\u8db3');
            return;
        }
        this.bagDecomposeSelectedItem = item;
        this.refreshBagDecomposeSlots();
    }
    protected getBagDecomposeResult(item: BagIllustrationCatalogItem): BagDecomposeResult | null {
        if (!this.isBagDecomposeEligibleItem(item)) return null;
        const statType = this.getBagEquipmentStatType(item);
        const materialIdByStat: Record<RoleEquipmentStatType, string> = {
            attack: 'material_099',
            defense: 'material_098',
            life: 'material_100',
        };
        const material = BAG_ILLUSTRATION_CATALOG.find((catalogItem) => catalogItem.id === materialIdByStat[statType]);
        if (!material) return null;
    
        return {
            material,
            count: this.getEquipmentLevel(item),
            statType,
        };
    }
    protected isBagDecomposeEligibleItem(item: BagIllustrationCatalogItem): boolean {
        return item.category === 'equipment'
            && !this.isBeastVeinEquipment(item)
            && this.getBagEquipmentCatalogLevel(item) === 1;
    }
    protected getBagEquipmentStatType(item: BagIllustrationCatalogItem): RoleEquipmentStatType {
        const slotId = this.getBagEquipmentSlotId(item);
        if (slotId) {
            return this.getRoleEquipmentStatRule({ id: slotId } as RoleEquipmentSlotConfig).type;
        }
        return 'defense';
    }
    protected isBeastVeinEquipment(item: BagIllustrationCatalogItem): boolean {
        if (item.category !== 'equipment') return false;
        const iconIndex = this.getBagItemIconIndex(item);
        return iconIndex >= 153 && iconIndex <= 168;
    }
    protected getBagEquipmentSlotId(item: BagIllustrationCatalogItem): RoleEquipmentSlotId | null {
        const generatedSlotMatch = /^equipment_(weapon|helmet|armor|wrist|leg|shoes|necklace|ring)_lv\d{3}$/.exec(item.id);
        if (generatedSlotMatch) return generatedSlotMatch[1] as RoleEquipmentSlotId;

        const catalogIndex = this.getBagItemIdIndex(item);
        for (const config of this.getRoleEquipmentSlotConfigs()) {
            for (let tier = 1; tier <= 5; tier++) {
                if (this.getRoleEquipmentCatalogIndexByTier(config.id, tier) === catalogIndex) {
                    return config.id;
                }
            }
        }
        return null;
    }
    protected openBagDecomposeConfirm(): void {
        const item = this.bagDecomposeSelectedItem;
        if (!item) {
            this.showToast('\u8bf7\u5148\u9009\u62e9\u9700\u8981\u5206\u89e3\u7684\u88c5\u5907');
            return;
        }
        const result = this.getBagDecomposeResult(item);
        if (!result) {
            this.showToast('\u6682\u65e0\u53ef\u5206\u89e3\u4ea7\u7269');
            return;
        }
    
        this.openSharedFlowPopup('ConfirmPopup', {
            title: '\u7cfb\u7edf\u63d0\u793a',
            message: `\u662f\u5426\u5206\u89e3${this.getCatalogDisplayName(item)}\u6210${result.count}\u4e2a${this.getCatalogDisplayName(result.material)}`,
            onConfirm: () => this.confirmBagDecompose(),
        });
    }
    protected confirmBagDecompose(): void {
        const item = this.bagDecomposeSelectedItem;
        if (!item) return;
        const result = this.getBagDecomposeResult(item);
        if (!result) return;
    
        if (!this.consumeRoleInventory(item.id, 1)) {
            this.showToast('\u88c5\u5907\u6570\u91cf\u4e0d\u8db3');
            return;
        }
        this.addRoleInventory(result.material.id, result.count);
        if (this.getRoleInventoryCount(item.id) <= 0) {
            this.bagDecomposeSelectedItem = null;
        }
        this.refreshRoleInventoryViews(false);
        this.refreshBagDecomposeSlots();
        if (this.bagCatalogView?.board?.isValid) {
            this.bagCatalogView.itemSource = this.getBagDecomposeItems();
            this.refreshBagCatalogGrid(this.bagCatalogView);
            this.raiseActiveBagModeFrame();
        }
        this.showToast('\u5206\u89e3\u6210\u529f');
    }
    protected layoutBagSynthMode(root: Node): void {
        this.getOrCreateBagModeSkin(
            root,
            'BagSynthInputSlotTop',
            HomeConfig.BAG_SYNTH_MODE_SLOT_SIZE,
            HomeConfig.BAG_SYNTH_MODE_SLOT_SIZE,
            HomeConfig.BAG_SYNTH_MODE_LEFT_X,
            HomeConfig.BAG_SYNTH_MODE_TOP_Y,
            HomeConfig.UI_BAG_ITEM_FRAME_LV1,
        ).setSiblingIndex(1);
        this.getOrCreateBagModeSkin(
            root,
            'BagSynthPlus',
            HomeConfig.BAG_SYNTH_MODE_PLUS_SIZE,
            HomeConfig.BAG_SYNTH_MODE_PLUS_SIZE,
            HomeConfig.BAG_SYNTH_MODE_LEFT_X,
            0,
            HomeConfig.UI_BAG_SYNTH_PLUS,
        ).setSiblingIndex(2);
        this.getOrCreateBagModeSkin(
            root,
            'BagSynthInputSlotBottom',
            HomeConfig.BAG_SYNTH_MODE_SLOT_SIZE,
            HomeConfig.BAG_SYNTH_MODE_SLOT_SIZE,
            HomeConfig.BAG_SYNTH_MODE_LEFT_X,
            HomeConfig.BAG_SYNTH_MODE_BOTTOM_Y,
            HomeConfig.UI_BAG_ITEM_FRAME_LV1,
        ).setSiblingIndex(3);
        this.getOrCreateBagModeSkin(
            root,
            'BagSynthArrow',
            HomeConfig.BAG_SYNTH_MODE_ARROW_WIDTH,
            HomeConfig.BAG_SYNTH_MODE_ARROW_HEIGHT,
            0,
            0,
            HomeConfig.UI_BAG_SYNTH_ARROW,
        ).setSiblingIndex(4);
        this.getOrCreateBagModeSkin(
            root,
            'BagSynthOutputSlot',
            HomeConfig.BAG_SYNTH_MODE_SLOT_SIZE,
            HomeConfig.BAG_SYNTH_MODE_SLOT_SIZE,
            HomeConfig.BAG_SYNTH_MODE_OUTPUT_X,
            0,
            HomeConfig.UI_BAG_ITEM_FRAME_LV1,
        ).setSiblingIndex(5);
        const synthButton = this.getOrCreateBagModeSkin(
            root,
            'BagSynthButton',
            HomeConfig.BAG_SYNTH_ACTION_BUTTON_WIDTH,
            HomeConfig.BAG_SYNTH_ACTION_BUTTON_HEIGHT,
            0,
            HomeConfig.BAG_SYNTH_ACTION_BUTTON_Y,
            HomeConfig.UI_BAG_ACTION_BUTTON_BG,
        );
        synthButton.setSiblingIndex(6);
        this.ensureButtonText(synthButton, 'BagSynthButtonLabel', '\u5408\u6210');
        this.bindScaledClick(synthButton, () => this.openBagSynthConfirm());
        this.refreshBagSynthSlots();
    }
    protected refreshBagSynthSlots(): void {
        if (!this.bagSynthModeFrame?.isValid) return;
        if (this.bagSynthSelectedFragment && this.getRoleInventoryCount(this.bagSynthSelectedFragment.id) <= 0) {
            this.bagSynthSelectedFragment = null;
        }

        const synthCard = this.getBagSynthCardItem();
        const synthCardCount = synthCard ? this.getRoleInventoryCount(synthCard.id) : 0;
        const output = this.bagSynthSelectedFragment ? this.getBagSynthOutputItem(this.bagSynthSelectedFragment) : null;

        this.renderBagSynthSlot(
            'BagSynthInputSlotTop',
            this.bagSynthSelectedFragment,
            this.bagSynthSelectedFragment ? this.getRoleInventoryCount(this.bagSynthSelectedFragment.id) : 0,
            false,
            true,
        );
        this.renderBagSynthSlot('BagSynthInputSlotBottom', synthCard, synthCardCount, synthCardCount <= 0, true);
        this.renderBagSynthSlot('BagSynthOutputSlot', output, 1, false, false);
    }
    protected renderBagSynthSlot(slotName: string, item: BagIllustrationCatalogItem | null, count: number, dimmed: boolean, showCount: boolean): void {
        const slot = this.bagSynthModeFrame?.getChildByName(slotName);
        if (!slot?.isValid) return;

        [...slot.children].forEach((child) => child.destroy());
        const framePath = item?.framePath || HomeConfig.UI_BAG_ITEM_FRAME_LV1;
        this.applyUiSkinKeepingEditorSize(slot, framePath, HomeConfig.BAG_SYNTH_MODE_SLOT_SIZE, HomeConfig.BAG_SYNTH_MODE_SLOT_SIZE);
        if (!item) return;

        const icon = this.createSkinnedNode(
            `${slotName}Icon`,
            slot,
            HomeConfig.BAG_GRID_ICON_SIZE,
            HomeConfig.BAG_GRID_ICON_SIZE,
            0,
            HomeConfig.BAG_GRID_ICON_OFFSET_Y,
            item.iconPath,
        );
        icon.setSiblingIndex(1);
        if (dimmed) {
            (icon.getComponent(UIOpacity) || icon.addComponent(UIOpacity)).opacity = HomeConfig.BAG_SYNTH_DISABLED_CARD_OPACITY;
        }

        if (!showCount) return;
        const countLabel = this.createLabel(slot, `${slotName}Count`, `\u00d7${Math.max(0, count)}`, 19, 22, -34, 70, 26, Color.WHITE);
        countLabel.horizontalAlign = HorizontalTextAlignment.RIGHT;
        this.setLabelOutline(countLabel, Color.BLACK, 2);
        countLabel.node.setSiblingIndex(2);
    }
    protected getBagSynthCardItem(): BagIllustrationCatalogItem | null {
        return BAG_ILLUSTRATION_CATALOG.find((item) => item.id === HomeConfig.BAG_SYNTH_CARD_ITEM_ID) || null;
    }
    protected getBagSynthFragmentItems(): BagIllustrationCatalogItem[] {
        return BAG_ILLUSTRATION_CATALOG.filter((item) => (
            this.isBagSynthFragmentItem(item)
            && this.getRoleInventoryCount(item.id) > 0
        ));
    }
    protected isBagSynthFragmentItem(item: BagIllustrationCatalogItem): boolean {
        return item.category === 'item' && this.getCatalogDisplayName(item).includes('\u517d\u5361\u788e\u7247');
    }
    protected getBagSynthOutputItem(fragment: BagIllustrationCatalogItem): BagIllustrationCatalogItem | null {
        const targetName = this.getCatalogDisplayName(fragment).replace('\u788e\u7247', '');
        return BAG_ILLUSTRATION_CATALOG.find((item) => (
            item.category === 'item'
            && this.getCatalogDisplayName(item) === targetName
        )) || null;
    }
    protected selectBagSynthFragmentItem(item: BagIllustrationCatalogItem): void {
        if (!this.isBagSynthFragmentItem(item)) return;
        const synthCard = this.getBagSynthCardItem();
        if (!synthCard || this.getRoleInventoryCount(synthCard.id) <= 0) {
            this.showToast('\u5408\u6210\u5361\u4e0d\u8db3');
            return;
        }
        if (this.getRoleInventoryCount(item.id) <= 0) {
            this.showToast('\u517d\u5361\u788e\u7247\u4e0d\u8db3');
            return;
        }
        this.bagSynthSelectedFragment = item;
        this.refreshBagSynthSlots();
    }
    protected openBagSynthConfirm(): void {
        const fragment = this.bagSynthSelectedFragment;
        if (!fragment) {
            this.showToast('\u8bf7\u5148\u9009\u62e9\u517d\u5361\u788e\u7247');
            return;
        }
        const synthCard = this.getBagSynthCardItem();
        const output = this.getBagSynthOutputItem(fragment);
        if (!synthCard || this.getRoleInventoryCount(synthCard.id) < HomeConfig.BAG_SYNTH_CARD_COST) {
            this.showToast('\u5408\u6210\u5361\u4e0d\u8db3');
            return;
        }
        if (this.getRoleInventoryCount(fragment.id) < HomeConfig.BAG_SYNTH_FRAGMENT_COST) {
            this.showToast(`${this.getCatalogDisplayName(fragment)}\u4e0d\u8db3`);
            return;
        }
        if (!output) {
            this.showToast('\u6682\u65e0\u53ef\u5408\u6210\u7684\u517d\u5361');
            return;
        }

        this.openSharedFlowPopup('ConfirmPopup', {
            title: '\u7cfb\u7edf\u63d0\u793a',
            message: `\u662f\u5426\u6d88\u8017${HomeConfig.BAG_SYNTH_FRAGMENT_COST}\u4e2a${this.getCatalogDisplayName(fragment)}\u4ee5\u53ca${HomeConfig.BAG_SYNTH_CARD_COST}\u5f20\u5408\u6210\u5361\u5408\u6210${HomeConfig.BAG_SYNTH_CARD_COST}\u5f20${this.getCatalogDisplayName(output)}`,
            onConfirm: () => this.confirmBagSynth(),
        });
    }
    protected confirmBagSynth(): void {
        const fragment = this.bagSynthSelectedFragment;
        const synthCard = this.getBagSynthCardItem();
        if (!fragment || !synthCard) return;
        const output = this.getBagSynthOutputItem(fragment);
        if (!output) return;
        if (this.getRoleInventoryCount(fragment.id) < HomeConfig.BAG_SYNTH_FRAGMENT_COST) {
            this.showToast(`${this.getCatalogDisplayName(fragment)}\u4e0d\u8db3`);
            return;
        }
        if (this.getRoleInventoryCount(synthCard.id) < HomeConfig.BAG_SYNTH_CARD_COST) {
            this.showToast('\u5408\u6210\u5361\u4e0d\u8db3');
            return;
        }

        if (!this.consumeRoleInventory(fragment.id, HomeConfig.BAG_SYNTH_FRAGMENT_COST)) return;
        if (!this.consumeRoleInventory(synthCard.id, HomeConfig.BAG_SYNTH_CARD_COST)) {
            this.addRoleInventory(fragment.id, HomeConfig.BAG_SYNTH_FRAGMENT_COST);
            this.showToast('\u5408\u6210\u5361\u4e0d\u8db3');
            return;
        }
        this.addRoleInventory(output.id, 1);
        if (this.getRoleInventoryCount(fragment.id) <= 0) {
            this.bagSynthSelectedFragment = null;
        }
        this.refreshRoleInventoryViews(false);
        this.refreshBagSynthSlots();
        if (this.bagCatalogView?.board?.isValid && this.bagPageActiveTab === 'synth') {
            this.bagCatalogView.itemSource = this.getBagSynthFragmentItems();
            this.refreshBagCatalogGrid(this.bagCatalogView);
            this.raiseActiveBagModeFrame();
        }
        this.showToast('\u5408\u6210\u6210\u529f');
    }
    protected raiseActiveBagModeFrame(): void {
        const activeFrame = this.bagPageActiveTab === 'decompose'
            ? this.bagDecomposeModeFrame
            : this.bagPageActiveTab === 'synth'
                ? this.bagSynthModeFrame
                : null;
        if (!activeFrame?.isValid || !activeFrame.active) return;
        activeFrame.setSiblingIndex((activeFrame.parent?.children.length || 1) - 1);
    }
    protected openBagIllustrationPanel(): void {
        if (this.bagPageActiveTab !== 'bag' || !this.bagCatalogView) return;

        this.bagIllustrationMode = true;
        if (this.bagIllustrationPanel) this.bagIllustrationPanel.active = false;
        if (this.bagBottomTabsRoot) this.bagBottomTabsRoot.active = false;
        if (this.bagIllustrationButton) this.bagIllustrationButton.active = false;

        if (this.bagPageTitleLabel?.node?.isValid) {
            this.bagPageTitleLabel.node.active = true;
            this.bagPageTitleLabel.string = '\u56fe\u9274';
            this.bagPageTitleLabel.node.setSiblingIndex(29);
        }
        if (this.bagDecomposeModeFrame) this.bagDecomposeModeFrame.active = false;
        if (this.bagSynthModeFrame) this.bagSynthModeFrame.active = false;

        this.bagCatalogView.itemSource = this.getBagIllustrationCatalogItems();
        this.bagCatalogView.activeCategory = 'equipment';
        const categoryRoot = this.bagCatalogView.board.getChildByName(`${this.bagCatalogView.board.name}CategoryTabs`);
        if (categoryRoot) categoryRoot.active = true;
        this.refreshBagCategoryTabs(this.bagCatalogView);
        this.refreshBagCatalogGrid(this.bagCatalogView);
    }
    protected closeBagIllustrationPanel(): void {
        if (!this.bagIllustrationMode) {
            if (this.bagIllustrationPanel) this.bagIllustrationPanel.active = false;
            return;
        }

        this.bagIllustrationMode = false;
        if (this.bagIllustrationPanel) this.bagIllustrationPanel.active = false;
        if (this.bagPageTitleLabel?.node?.isValid) {
            const config = this.bagBottomTabButtons.get(this.bagPageActiveTab);
            this.bagPageTitleLabel.node.active = true;
            this.bagPageTitleLabel.string = config?.title || '\u80cc\u5305';
            this.bagPageTitleLabel.node.setSiblingIndex(29);
        }
        if (this.bagBottomTabsRoot) this.bagBottomTabsRoot.active = true;
        if (this.bagIllustrationButton) this.bagIllustrationButton.active = this.bagPageActiveTab === 'bag';
        if (this.bagCatalogView) {
            this.bagCatalogView.itemSource = this.getRoleSeededBagItems();
            this.bagCatalogView.activeCategory = 'equipment';
            this.resetBagGridScrollPosition(this.bagCatalogView);
            const categoryRoot = this.bagCatalogView.board.getChildByName(`${this.bagCatalogView.board.name}CategoryTabs`);
            if (categoryRoot) categoryRoot.active = this.bagPageActiveTab === 'bag';
            this.refreshBagCategoryTabs(this.bagCatalogView);
            this.refreshBagCatalogGrid(this.bagCatalogView);
        }
    }
    protected buildBagIllustrationPanel(): void {
        if (!this.bagPanel || this.bagIllustrationPanel) return;
    
        const editorPanel = this.bagPanel.getChildByName('BagIllustrationPanel');
        this.bagIllustrationPanel = editorPanel || this.createNode('BagIllustrationPanel', this.bagPanel, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT, 0, 0);
        this.bagIllustrationPanel.active = false;
        if (!editorPanel) {
            this.bagIllustrationPanel.setPosition(0, 0, 0);
        }
        (this.bagIllustrationPanel.getComponent(UITransform) || this.bagIllustrationPanel.addComponent(UITransform)).setContentSize(HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT);
        this.bagIllustrationPanel.on(Node.EventType.TOUCH_END, (event: EventTouch) => {
            event.propagationStopped = true;
        }, this);
    
        this.bagIllustrationTitleLabel = this.createLabel(this.bagIllustrationPanel, 'BagIllustrationTitle', '\u56fe\u9274', 42, 0, 720, 240, 64, new Color(255, 238, 196, 255));
        this.createMailButton(this.bagIllustrationPanel, 'BagIllustrationBack', '', HomeConfig.BOTTOM_ENTRY_BACK_BUTTON_X, HomeConfig.BOTTOM_ENTRY_BACK_BUTTON_Y, HomeConfig.BOTTOM_ENTRY_BACK_BUTTON_WIDTH, HomeConfig.BOTTOM_ENTRY_BACK_BUTTON_HEIGHT, new Color(110, 72, 52, 0), () => this.closeBagIllustrationPanel(), HomeConfig.UI_RANK_BACK).setSiblingIndex(30);
        this.bagIllustrationView = this.createBagCatalogView(this.bagIllustrationPanel, 'BagIllustrationBoard', HomeConfig.BAG_MATERIAL_BOARD_Y, 'equipment', this.getBagIllustrationCatalogItems(), 'BagIllustrationGridViewport');
        this.bagIllustrationView.board.setSiblingIndex(2);
    }
    protected getBagIllustrationCatalogItems(): readonly BagIllustrationCatalogItem[] {
        return BAG_ILLUSTRATION_CATALOG.filter((item) => !this.isLegacyHumanEquipmentCatalogItem(item));
    }
    protected isLegacyHumanEquipmentCatalogItem(item: BagIllustrationCatalogItem): boolean {
        if (item.category !== 'equipment') return false;
        const index = this.getBagItemIdIndex(item);
        return index >= 113 && index <= 152;
    }
    protected createBagCatalogView(parent: Node, boardName: string, y: number, initialCategory: BagIllustrationCategory, itemSource: readonly BagIllustrationCatalogItem[], viewportName: string): BagCatalogView {
        const editorBoard = parent.getChildByName(boardName);
        const board = editorBoard || this.createNode(boardName, parent, HomeConfig.BAG_MATERIAL_BOARD_WIDTH, HomeConfig.BAG_MATERIAL_BOARD_HEIGHT, 0, y);
        board.active = true;
        if (!editorBoard) {
            board.setPosition(0, y, 0);
        }
        const transform = board.getComponent(UITransform) || board.addComponent(UITransform);
        if (transform.contentSize.width <= 0 || transform.contentSize.height <= 0) {
            transform.setContentSize(HomeConfig.BAG_MATERIAL_BOARD_WIDTH, HomeConfig.BAG_MATERIAL_BOARD_HEIGHT);
        }
    
        const skinName = `${boardName}Skin`;
        const skin = board.getChildByName(skinName);
        if (skin) {
            this.applyUiSkinKeepingEditorSize(skin, HomeConfig.UI_BAG_FRAME, HomeConfig.BAG_MATERIAL_BOARD_WIDTH, HomeConfig.BAG_MATERIAL_BOARD_HEIGHT);
            skin.setSiblingIndex(0);
        } else {
            this.createSkinnedNode(skinName, board, transform.contentSize.width, transform.contentSize.height, 0, 0, HomeConfig.UI_BAG_FRAME).setSiblingIndex(0);
        }
    
        const view: BagCatalogView = {
            board,
            tabs: new Map<BagIllustrationCategory, Node>(),
            activeCategory: initialCategory,
            itemSource,
            viewportName,
        };
        this.createBagCategoryTabs(view);
        this.refreshBagCategoryTabs(view);
        this.refreshBagCatalogGrid(view);
        return view;
    }
    protected createBagCategoryTabs(view: BagCatalogView): void {
        const rootName = `${view.board.name}CategoryTabs`;
        const editorRoot = view.board.getChildByName(rootName);
        const root = editorRoot || this.createNode(rootName, view.board, HomeConfig.BAG_MATERIAL_BOARD_WIDTH, HomeConfig.BAG_CATEGORY_TAB_HEIGHT, 0, HomeConfig.BAG_CATEGORY_TAB_Y);
        root.active = true;
        if (!editorRoot) {
            root.setPosition(0, HomeConfig.BAG_CATEGORY_TAB_Y, 0);
        }
        (root.getComponent(UITransform) || root.addComponent(UITransform)).setContentSize(HomeConfig.BAG_MATERIAL_BOARD_WIDTH, HomeConfig.BAG_CATEGORY_TAB_HEIGHT);
        root.setSiblingIndex(8);
    
        view.tabs.clear();
        HomeConfig.BAG_CATEGORY_TABS.forEach((config, index) => {
            const nodeName = `BagCategoryTab_${config.category}`;
            const editorTab = root.getChildByName(nodeName);
            const x = HomeConfig.BAG_CATEGORY_TAB_START_X + index * HomeConfig.BAG_CATEGORY_TAB_SPACING_X;
            const tab = editorTab || this.createSkinnedNode(nodeName, root, HomeConfig.BAG_CATEGORY_TAB_WIDTH, HomeConfig.BAG_CATEGORY_TAB_HEIGHT, x, 0, HomeConfig.UI_BAG_CATEGORY_TAB_NORMAL);
            tab.active = true;
            if (!editorTab) {
                tab.setPosition(x, 0, 0);
            } else {
                this.applyUiSkinKeepingEditorSize(tab, HomeConfig.UI_BAG_CATEGORY_TAB_NORMAL, HomeConfig.BAG_CATEGORY_TAB_WIDTH, HomeConfig.BAG_CATEGORY_TAB_HEIGHT);
            }
    
            let label = tab.getChildByName('BagCategoryTabLabel')?.getComponent(Label) || null;
            if (!label) {
                label = this.createLabel(tab, 'BagCategoryTabLabel', config.title, 25, 0, 0, HomeConfig.BAG_CATEGORY_TAB_WIDTH, HomeConfig.BAG_CATEGORY_TAB_HEIGHT, new Color(38, 24, 12, 255));
            }
            label.string = config.title;
            label.node.setSiblingIndex(2);
            this.applyBagLabelStyle(label, 0);
    
            view.tabs.set(config.category, tab);
            this.bindScaledClick(tab, () => this.switchBagCatalogCategory(view, config.category));
        });
    }
    protected switchBagCatalogCategory(view: BagCatalogView, category: BagIllustrationCategory): void {
        view.activeCategory = category;
        this.resetBagGridScrollPosition(view);
        this.refreshBagCategoryTabs(view);
        this.refreshBagCatalogGrid(view);
    }
    protected refreshBagCategoryTabs(view: BagCatalogView): void {
        HomeConfig.BAG_CATEGORY_TABS.forEach((config) => {
            const tab = view.tabs.get(config.category);
            if (!tab?.isValid) return;
    
            const selected = view.activeCategory === config.category;
            this.applyUiSkinKeepingEditorSize(tab, selected ? HomeConfig.UI_BAG_CATEGORY_TAB_ACTIVE : HomeConfig.UI_BAG_CATEGORY_TAB_NORMAL, HomeConfig.BAG_CATEGORY_TAB_WIDTH, HomeConfig.BAG_CATEGORY_TAB_HEIGHT);
            const label = tab.getChildByName('BagCategoryTabLabel')?.getComponent(Label);
            if (label) {
                label.color = selected ? new Color(48, 26, 10, 255) : new Color(38, 24, 12, 255);
            }
        });
    }
    protected refreshBagCatalogGrid(view: BagCatalogView): void {
        const layout = this.getBagGridLayout(view);
        const editorViewport = view.board.getChildByName(view.viewportName);
        const viewport = editorViewport || this.createNode(view.viewportName, view.board, HomeConfig.BAG_GRID_VIEWPORT_WIDTH, layout.height, HomeConfig.BAG_GRID_VIEWPORT_X, layout.y);
        viewport.active = true;
        if (!editorViewport) {
            viewport.setPosition(HomeConfig.BAG_GRID_VIEWPORT_X, layout.y, 0);
            (viewport.getComponent(UITransform) || viewport.addComponent(UITransform)).setContentSize(HomeConfig.BAG_GRID_VIEWPORT_WIDTH, layout.height);
        }
        viewport.setSiblingIndex(20);
        const mask = viewport.getComponent(Mask) || viewport.addComponent(Mask);
        mask.type = Mask.Type.GRAPHICS_RECT;
        const viewportTransform = viewport.getComponent(UITransform) || viewport.addComponent(UITransform);
        const viewportSize = viewportTransform.contentSize;
        const viewportWidth = viewportSize.width || HomeConfig.BAG_GRID_VIEWPORT_WIDTH;
        const viewportHeight = viewportSize.height || layout.height;
    
        const items = this.getBagGridDisplayItems(view);
        const minimumSlotRows = view.itemSource.length > 0 ? 6 : 7;
        const itemCount = Math.max(items.length, HomeConfig.BAG_GRID_COLS * minimumSlotRows);
        const rowCount = Math.ceil(itemCount / HomeConfig.BAG_GRID_COLS);
        const contentHeight = rowCount * HomeConfig.BAG_GRID_CELL_SIZE + Math.max(0, rowCount - 1) * HomeConfig.BAG_GRID_CELL_GAP_Y;
        const edgeInsetY = 18;
        const maxScrollY = Math.max(0, contentHeight + edgeInsetY * 2 - viewportHeight);
        const contentName = `${view.viewportName}Content`;
        const editorContent = viewport.getChildByName(contentName);
        const content = editorContent || this.createNode(contentName, viewport, viewportWidth, contentHeight, 0, 0);
        content.active = true;
        (content.getComponent(UITransform) || content.addComponent(UITransform)).setContentSize(viewportWidth, contentHeight);
        if (!editorContent) {
            content.setPosition(0, 0, 0);
        } else {
            const safeY = this.clamp(content.position.y || 0, 0, maxScrollY);
            content.setPosition(0, safeY, 0);
        }
        content.children.forEach((child) => {
            if (/^BagGridSlot_\d+$/.test(child.name)) child.active = false;
        });
    
        const startX = -((HomeConfig.BAG_GRID_COLS - 1) * (HomeConfig.BAG_GRID_CELL_SIZE + HomeConfig.BAG_GRID_CELL_GAP_X)) / 2;
        const startY = viewportHeight / 2 - HomeConfig.BAG_GRID_CELL_SIZE / 2 - 18;
        for (let index = 0; index < itemCount; index++) {
            const col = index % HomeConfig.BAG_GRID_COLS;
            const row = Math.floor(index / HomeConfig.BAG_GRID_COLS);
            this.createBagGridItem(
                content,
                index,
                items[index],
                startX + col * (HomeConfig.BAG_GRID_CELL_SIZE + HomeConfig.BAG_GRID_CELL_GAP_X),
                startY - row * (HomeConfig.BAG_GRID_CELL_SIZE + HomeConfig.BAG_GRID_CELL_GAP_Y),
                !this.bagIllustrationMode && view.viewportName !== 'BagIllustrationGridViewport',
            );
        }

        this.bindBagGridScroll(viewport, content, maxScrollY);
    }
    protected sortBagCatalogItems(items: BagIllustrationCatalogItem[]): BagIllustrationCatalogItem[] {
        return [...items].sort((a, b) => {
            if (a.category === 'gem' || b.category === 'gem') {
                const gemDiff = this.getBagGemSortOrder(a) - this.getBagGemSortOrder(b);
                if (gemDiff !== 0) return gemDiff;
            }

            if (a.category === 'equipment' || b.category === 'equipment') {
                const equipmentDiff = this.getBagEquipmentSortOrder(a) - this.getBagEquipmentSortOrder(b);
                if (equipmentDiff !== 0) return equipmentDiff;
            }

            const frameLevelDiff = this.getBagItemFrameLevel(a) - this.getBagItemFrameLevel(b);
            if (frameLevelDiff !== 0) return frameLevelDiff;
    
            const idIndexDiff = this.getBagItemIdIndex(a) - this.getBagItemIdIndex(b);
            if (idIndexDiff !== 0) return idIndexDiff;
    
            return a.id.localeCompare(b.id);
        });
    }
    protected getBagGridDisplayItems(view: BagCatalogView): BagIllustrationCatalogItem[] {
        const sorted = this.sortBagCatalogItems(view.itemSource.filter((item) => item.category === view.activeCategory));
        if (view !== this.bagCatalogView || view.activeCategory !== 'equipment') return sorted;

        const expanded: BagIllustrationCatalogItem[] = [];
        sorted.forEach((item) => {
            const count = Math.max(0, this.getBagItemCount(item));
            for (let index = 0; index < count; index++) {
                expanded.push(item);
            }
        });
        return expanded;
    }
    protected getBagGemSortOrder(item: BagIllustrationCatalogItem): number {
        if (item.category !== 'gem') return Number.MAX_SAFE_INTEGER;
        const name = this.getCatalogDisplayName(item);
        const beastOrder = ['\u767d\u9e7f', '\u9752\u72ee', '\u91d1\u9e64', '\u8d64\u72d0'];
        const levelOrder = ['\u4e00\u7ea7', '\u4e8c\u7ea7', '\u4e09\u7ea7', '\u56db\u7ea7', '\u4e94\u7ea7', '\u516d\u7ea7', '\u4e03\u7ea7', '\u516b\u7ea7', '\u4e5d\u7ea7', '\u5341\u7ea7'];
        const beastIndex = beastOrder.findIndex((keyword) => name.includes(keyword));
        const kindIndex = name.includes('\uff08\u4e3b\uff09') ? 1 : 0;
        const levelIndex = levelOrder.findIndex((keyword) => name.includes(keyword));

        if (beastIndex >= 0 && levelIndex >= 0) {
            return beastIndex * 20 + kindIndex * 10 + levelIndex;
        }

        return 1000 + this.getBagItemIdIndex(item);
    }
    protected getBagEquipmentSortOrder(item: BagIllustrationCatalogItem): number {
        if (item.category !== 'equipment') return Number.MAX_SAFE_INTEGER;
        const name = this.getCatalogDisplayName(item);
        const beastOrder = ['\u767d\u9e7f', '\u8d64\u72d0', '\u91d1\u9e64', '\u9752\u72ee'];
        const beastPartOrder = ['\u5934\u76d4', '\u62a4\u7532', '\u817f\u7532', '\u80f8\u6302'];
        const beastIndex = beastOrder.findIndex((keyword) => name.includes(keyword));
        const partIndex = beastPartOrder.findIndex((keyword) => name.includes(keyword));
        if (beastIndex >= 0 && partIndex >= 0) {
            return 10000 + beastIndex * 10 + partIndex;
        }

        const humanKindOrder = ['\u6b66\u5668', '\u9879\u94fe', '\u62a4\u8155', '\u817f\u7532', '\u5934\u76d4', '\u5e03\u7532', '\u6212\u6307', '\u978b\u5b50'];
        const kindIndex = humanKindOrder.findIndex((keyword) => name.includes(keyword));
        if (kindIndex >= 0) {
            const equipmentLevel = this.getBagEquipmentCatalogLevel(item) || this.getBagItemFrameLevel(item);
            return kindIndex * 1000 + equipmentLevel;
        }

        return 20000 + this.getBagItemIdIndex(item);
    }
    protected getBagItemFrameLevel(item: BagIllustrationCatalogItem): number {
        const equipmentLevel = this.getBagEquipmentCatalogLevel(item);
        if (equipmentLevel > 0) return equipmentLevel;

        const match = /item_frame_lv(\d+)/.exec(item.framePath);
        return match ? Number(match[1]) : 1;
    }
    protected getBagEquipmentCatalogLevel(item: BagIllustrationCatalogItem): number {
        if (item.category !== 'equipment') return 0;
        const levelIdMatch = /^equipment_[a-z]+_lv(\d{3})$/.exec(item.id);
        if (levelIdMatch) return Number(levelIdMatch[1]);

        const levelNameMatch = /^(\d+)\u7ea7/.exec(this.getCatalogDisplayName(item));
        if (levelNameMatch) return Number(levelNameMatch[1]);

        const index = this.getBagItemIdIndex(item);
        if (index < 113 || index > 152) return 0;

        const levelByGroupOffset = [2, 3, 4, 5, 1];
        return levelByGroupOffset[(index - 113) % 5] || 0;
    }
    protected getBagItemIconIndex(item: BagIllustrationCatalogItem): number {
        const match = /bag_item_(\d+)/.exec(item.iconPath);
        return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER;
    }
    protected getBagItemIdIndex(item: BagIllustrationCatalogItem): number {
        const match = /_(\d+)$/.exec(item.id);
        return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER;
    }
    protected getBagGridLayout(view: BagCatalogView): { height: number; y: number } {
        if (view !== this.bagCatalogView) {
            return { height: HomeConfig.BAG_GRID_VIEWPORT_HEIGHT, y: HomeConfig.BAG_GRID_VIEWPORT_Y };
        }
        if (this.bagPageActiveTab === 'decompose') {
            return { height: HomeConfig.BAG_DECOMPOSE_VIEWPORT_HEIGHT, y: HomeConfig.BAG_DECOMPOSE_VIEWPORT_Y };
        }
        if (this.bagPageActiveTab === 'synth') {
            return { height: HomeConfig.BAG_SYNTH_VIEWPORT_HEIGHT, y: HomeConfig.BAG_SYNTH_VIEWPORT_Y };
        }
        return { height: HomeConfig.BAG_GRID_VIEWPORT_HEIGHT, y: HomeConfig.BAG_GRID_VIEWPORT_Y };
    }
    protected createBagGridItem(parent: Node, index: number, item: BagIllustrationCatalogItem | undefined, x: number, y: number, showInventoryCount = true): void {
        const slotName = `BagGridSlot_${index + 1}`;
        const editorSlot = parent.getChildByName(slotName);
        const slot = editorSlot || this.createNode(slotName, parent, HomeConfig.BAG_GRID_CELL_SIZE, HomeConfig.BAG_GRID_CELL_SIZE, x, y);
        slot.active = true;
        (slot.getComponent(UITransform) || slot.addComponent(UITransform)).setContentSize(HomeConfig.BAG_GRID_CELL_SIZE, HomeConfig.BAG_GRID_CELL_SIZE);
        if (!editorSlot) {
            slot.setPosition(x, y, 0);
        }
        [...slot.children].forEach((child) => {
            child.removeFromParent();
            child.destroy();
        });
        slot.off(Node.EventType.TOUCH_START);
        slot.off(Node.EventType.TOUCH_MOVE);
        slot.off(Node.EventType.TOUCH_END);
        slot.off(Node.EventType.TOUCH_CANCEL);
        slot.setSiblingIndex(index + 1);
        const framePath = item?.framePath || `${HomeConfig.BAG_UI_ROOT}/ItemFrames/item_frame_lv1`;
        this.createSkinnedNode('BagGridFrame', slot, HomeConfig.BAG_GRID_FRAME_SIZE, HomeConfig.BAG_GRID_FRAME_SIZE, 0, 0, framePath).setSiblingIndex(0);
    
        if (item) {
            const effect = this.syncEquipmentFrameEffectForItem(
                slot,
                'BagGridEquipmentFrameEffect',
                item,
                HomeConfig.BAG_GRID_FRAME_SIZE,
                HomeConfig.BAG_GRID_FRAME_SIZE,
            );
            const iconLayout = this.getBagGridIconLayout(item);
            this.createSkinnedNode('BagGridIcon', slot, iconLayout.size, iconLayout.size, iconLayout.x, iconLayout.y, item.iconPath).setSiblingIndex(2);
            effect?.setSiblingIndex(3);
            const equipmentLevel = this.getBagEquipmentCatalogLevel(item);
            if (equipmentLevel > 0) {
                this.createBagGridEquipmentLevelLabel(slot, equipmentLevel);
            }
            const itemCount = this.getBagItemCount(item);
            if (showInventoryCount && itemCount > 0 && item.category !== 'equipment' && !this.isBeastEquipmentCatalogItem(item)) {
                const countLabel = this.createLabel(
                    slot,
                    'BagGridItemCount',
                    `\u00d7${itemCount}`,
                    HomeConfig.BAG_GRID_COUNT_FONT_SIZE,
                    HomeConfig.BAG_GRID_COUNT_X,
                    equipmentLevel > 0 ? 34 : HomeConfig.BAG_GRID_COUNT_Y,
                    HomeConfig.BAG_GRID_COUNT_WIDTH,
                    HomeConfig.BAG_GRID_COUNT_HEIGHT,
                    Color.WHITE,
                );
                countLabel.horizontalAlign = HorizontalTextAlignment.RIGHT;
                this.setLabelOutline(countLabel, Color.BLACK, 2);
                countLabel.node.setSiblingIndex(4);
            }
            if (this.isBagItemEquipped(item)) {
                this.createBagGridEquippedBadge(slot).setSiblingIndex(6);
            }
            this.bindGridItemTap(slot, () => {
                if (this.bagPageActiveTab === 'decompose' && item.category === 'equipment') {
                    this.selectBagDecomposeItem(item);
                    return;
                }
                if (this.bagPageActiveTab === 'synth' && this.isBagSynthFragmentItem(item)) {
                    this.selectBagSynthFragmentItem(item);
                    return;
                }
                const typeNames: Record<BagIllustrationCategory, string> = {
                    equipment: '\u88c5\u5907',
                    item: '\u9053\u5177',
                    material: '\u6750\u6599',
                    gem: '\u5b9d\u77f3',
                };
                this.openBagIllustrationItemDetailPopup(item, typeNames[item.category]);
            });
        }
    }
    protected createBagGridEquippedBadge(parent: Node): Node {
        return this.createSkinnedNode('BagGridEquippedBadge', parent, 60, 60, -24, 24, HomeConfig.UI_ROLE_EQUIPPED_BADGE);
    }
    protected isBagItemEquipped(item: BagIllustrationCatalogItem): boolean {
        if (item.category !== 'equipment') return false;
        const slotId = this.getBagEquipmentSlotId(item);
        if (!slotId) return false;

        const equipped = this.roleEquippedItems.get(slotId);
        if (!equipped) return false;
        if (equipped.id === item.id) return true;
        if (equipped.id.startsWith(`${item.id}_lv`)) return true;

        const itemLevel = this.getBagEquipmentCatalogLevel(item);
        const equippedLevel = this.getEquipmentLevel(equipped);
        return itemLevel > 0 && equippedLevel > 0 && itemLevel === equippedLevel;
    }
    protected getBagGridIconLayout(item: BagIllustrationCatalogItem): { size: number; x: number; y: number } {
        if (!this.isBeastEquipmentCatalogItem(item)) {
            return { size: HomeConfig.BAG_GRID_ICON_SIZE, x: 0, y: HomeConfig.BAG_GRID_ICON_OFFSET_Y };
        }

        const offset = HomeConfig.BEAST_STRENGTHEN_EQUIP_ICON_SOURCE_OFFSETS[item.id];
        return {
            size: HomeConfig.BAG_GRID_ICON_SIZE,
            x: offset ? offset.x * HomeConfig.BAG_GRID_ICON_SIZE / HomeConfig.BEAST_STRENGTHEN_EQUIP_ICON_SOURCE_WIDTH : 0,
            y: offset ? offset.y * HomeConfig.BAG_GRID_ICON_SIZE / HomeConfig.BEAST_STRENGTHEN_EQUIP_ICON_SOURCE_HEIGHT : 0,
        };
    }
    protected isBeastEquipmentCatalogItem(item: BagIllustrationCatalogItem): boolean {
        if (item.category !== 'equipment') return false;
        const name = this.getCatalogDisplayName(item);
        const beastOrder = ['\u767d\u9e7f', '\u8d64\u72d0', '\u91d1\u9e64', '\u9752\u72ee'];
        const beastPartOrder = ['\u5934\u76d4', '\u62a4\u7532', '\u817f\u7532', '\u80f8\u6302'];
        return beastOrder.some((keyword) => name.includes(keyword))
            && beastPartOrder.some((keyword) => name.includes(keyword));
    }
    protected createBagGridEquipmentLevelLabel(slot: Node, level: number): void {
        const levelLabel = this.createLabel(
            slot,
            'BagGridEquipmentLevel',
            `lv.${level}`,
            HomeConfig.BAG_GRID_COUNT_FONT_SIZE,
            HomeConfig.BAG_GRID_COUNT_X,
            HomeConfig.BAG_GRID_COUNT_Y,
            HomeConfig.BAG_GRID_COUNT_WIDTH,
            HomeConfig.BAG_GRID_COUNT_HEIGHT,
            new Color(255, 238, 190, 255),
        );
        levelLabel.horizontalAlign = HorizontalTextAlignment.RIGHT;
        this.setLabelOutline(levelLabel, Color.BLACK, 2);
        levelLabel.node.setSiblingIndex(4);
    }
    protected bindGridItemTap(node: Node, onTap: () => void): void {
        let startX = 0;
        let startY = 0;
        let moved = false;
        const baseScale = node.scale.clone();
        this.buttonBaseScales.set(node, baseScale);
        node.on(Node.EventType.TOUCH_START, (event: EventTouch) => {
            const location = event.getUILocation();
            startX = location.x;
            startY = location.y;
            moved = false;
            this.playButtonScale(node, true);
        }, this);
        node.on(Node.EventType.TOUCH_MOVE, (event: EventTouch) => {
            const location = event.getUILocation();
            if (Math.abs(location.x - startX) > 14 || Math.abs(location.y - startY) > 14) {
                moved = true;
                this.playButtonScale(node, false);
            }
        }, this);
        node.on(Node.EventType.TOUCH_CANCEL, () => this.playButtonScale(node, false), this);
        node.on(Node.EventType.TOUCH_END, () => {
            this.playButtonScale(node, false);
            if (!moved) onTap();
        }, this);
    }
    protected bindBagGridScroll(node: Node, content: Node, maxScrollY: number, minScrollY = 0): void {
        node.off(Node.EventType.TOUCH_START);
        node.off(Node.EventType.TOUCH_MOVE);
        node.off(Node.EventType.TOUCH_END);
        node.off(Node.EventType.TOUCH_CANCEL);
        const previousScroll = node.getComponent(ScrollView);
        if (previousScroll) previousScroll.enabled = false;
        const inertiaCallbacks = this.getBagGridScrollInertiaCallbacks();

        let dragStartY = 0;
        let contentStartY = 0;
        let lastTouchY = 0;
        let lastTouchTime = 0;
        let velocityY = 0;

        const stopInertia = () => {
            const callback = inertiaCallbacks.get(node);
            if (callback) {
                this.unschedule(callback);
                inertiaCallbacks.delete(node);
            }
        };
        const clampContentY = (value: number): number => {
            const clampedY = this.clamp(value, minScrollY, minScrollY + maxScrollY);
            content.setPosition(0, clampedY, 0);
            return clampedY;
        };
        const startInertia = () => {
            stopInertia();
            if (maxScrollY <= 0 || Math.abs(velocityY) < 40) return;

            const inertiaCallback = (dt: number) => {
                velocityY *= Math.pow(0.08, dt);
                const currentY = content.position.y || 0;
                const nextY = currentY + velocityY * dt;
                const clampedY = clampContentY(nextY);
                if (clampedY !== nextY || Math.abs(velocityY) < 12) {
                    stopInertia();
                }
            };
            inertiaCallbacks.set(node, inertiaCallback);
            this.schedule(inertiaCallback, 0);
        };

        clampContentY(content.position.y || 0);
        node.on(Node.EventType.TOUCH_START, (event: EventTouch) => {
            event.propagationStopped = true;
            stopInertia();
            dragStartY = event.getUILocation().y;
            contentStartY = content.position.y || 0;
            lastTouchY = dragStartY;
            lastTouchTime = Date.now();
            velocityY = 0;
        }, this);
        node.on(Node.EventType.TOUCH_MOVE, (event: EventTouch) => {
            event.propagationStopped = true;
            if (maxScrollY <= 0) {
                clampContentY(minScrollY);
                return;
            }

            const touchY = event.getUILocation().y;
            const now = Date.now();
            const dt = Math.max(0.016, (now - lastTouchTime) / 1000);
            velocityY = (touchY - lastTouchY) / dt;
            lastTouchY = touchY;
            lastTouchTime = now;
            clampContentY(contentStartY + touchY - dragStartY);
        }, this);
        node.on(Node.EventType.TOUCH_END, (event: EventTouch) => {
            event.propagationStopped = true;
            startInertia();
        }, this);
        node.on(Node.EventType.TOUCH_CANCEL, (event: EventTouch) => {
            event.propagationStopped = true;
            startInertia();
        }, this);
    }
    protected resetBagGridScrollPosition(view: BagCatalogView): void {
        const viewport = view.board.getChildByName(view.viewportName);
        const content = viewport?.getChildByName(`${view.viewportName}Content`);
        if (content?.isValid) content.setPosition(0, 0, 0);
        const inertiaCallbacks = this.getBagGridScrollInertiaCallbacks();
        const callback = viewport ? inertiaCallbacks.get(viewport) : null;
        if (callback) {
            this.unschedule(callback);
            inertiaCallbacks.delete(viewport as Node);
        }
    }
    protected createBagBottomTabs(): void {
        if (!this.bagPanel) return;
    
        const editorRoot = this.bagPanel.getChildByName('BagPageBottomTabs');
        const root = editorRoot || this.createNode('BagPageBottomTabs', this.bagPanel, HomeConfig.VIEW_WIDTH, 110, 0, HomeConfig.BAG_PAGE_BOTTOM_Y);
        this.bagBottomTabsRoot = root;
        root.active = true;
        if (!editorRoot) {
            root.setPosition(0, HomeConfig.BAG_PAGE_BOTTOM_Y, 0);
        }
        (root.getComponent(UITransform) || root.addComponent(UITransform)).setContentSize(HomeConfig.VIEW_WIDTH, 110);
    
        this.bagBottomTabButtons.clear();
        const startX = -HomeConfig.BAG_PAGE_BOTTOM_BUTTON_SPACING * 1.5 + HomeConfig.BAG_PAGE_BOTTOM_GROUP_OFFSET_X;
        this.createBagBottomButton(root, 'BagTabBag', startX, 'bag', '\u80cc\u5305', HomeConfig.UI_BAG_TAB_BAG, HomeConfig.UI_BAG_TAB_BAG_ACTIVE);
        this.createBagBottomButton(root, 'BagTabDecompose', startX + HomeConfig.BAG_PAGE_BOTTOM_BUTTON_SPACING, 'decompose', '\u5206\u89e3', HomeConfig.UI_BAG_TAB_DECOMPOSE, HomeConfig.UI_BAG_TAB_DECOMPOSE_ACTIVE);
        this.createBagBottomButton(root, 'BagTabSynth', startX + HomeConfig.BAG_PAGE_BOTTOM_BUTTON_SPACING * 2, 'synth', '\u5408\u6210', HomeConfig.UI_BAG_TAB_BEAST_SYNTH, HomeConfig.UI_BAG_TAB_SYNTH_ACTIVE);
        root.setSiblingIndex(25);
    }
    protected createBagBottomButton(parent: Node, name: string, x: number, tab: BagPageTab, title: string, normalPath: string, activePath: string): Node {
        const editorButton = parent.getChildByName(name);
        const button = editorButton || this.createSkinnedNode(name, parent, HomeConfig.BAG_PAGE_BOTTOM_BUTTON_WIDTH, HomeConfig.BAG_PAGE_BOTTOM_BUTTON_HEIGHT, x, HomeConfig.BAG_PAGE_BOTTOM_BUTTON_Y, normalPath);
        button.active = true;
        if (!editorButton) {
            button.setPosition(x, HomeConfig.BAG_PAGE_BOTTOM_BUTTON_Y, 0);
        } else {
            this.applyUiSkinKeepingEditorSize(button, normalPath, HomeConfig.BAG_PAGE_BOTTOM_BUTTON_WIDTH, HomeConfig.BAG_PAGE_BOTTOM_BUTTON_HEIGHT);
        }
        button.setSiblingIndex((button.parent?.children.length || 1) - 1);
        this.bagBottomTabButtons.set(tab, {
            node: button,
            tab,
            title,
            normalPath,
            activePath,
        });
        this.bindScaledClick(button, () => {
            this.switchBagPage(tab);
            this.showToast(`${title}\u9875\u9762\u5df2\u6253\u5f00`);
        });
        return button;
    }
    protected switchBagPage(tab: BagPageTab): void {
        if (this.bagIllustrationMode) {
            this.closeBagIllustrationPanel();
        }
        this.bagPageActiveTab = tab;
        const config = this.bagBottomTabButtons.get(tab);
        const title = config?.title || '\u80cc\u5305';
        if (this.bagPageTitleLabel?.node?.isValid) {
            this.bagPageTitleLabel.string = title;
            this.bagPageTitleLabel.node.setSiblingIndex(29);
        }
        if (this.bagCatalogView) {
            this.bagCatalogView.itemSource = tab === 'bag'
                ? this.getRoleSeededBagItems()
                : tab === 'decompose'
                    ? this.getBagDecomposeItems()
                    : this.getBagSynthFragmentItems();
            const lockedCategory: BagIllustrationCategory | null = tab === 'decompose'
                ? 'equipment'
                : tab === 'synth'
                    ? 'item'
                    : null;
            if (lockedCategory) {
                this.bagCatalogView.activeCategory = lockedCategory;
            } else {
                this.bagCatalogView.activeCategory = 'equipment';
            }
            this.resetBagGridScrollPosition(this.bagCatalogView);
            const categoryRoot = this.bagCatalogView.board.getChildByName(`${this.bagCatalogView.board.name}CategoryTabs`);
            if (categoryRoot) categoryRoot.active = tab === 'bag';
            if (this.bagDecomposeModeFrame?.isValid) this.bagDecomposeModeFrame.active = tab === 'decompose';
            if (this.bagSynthModeFrame?.isValid) this.bagSynthModeFrame.active = tab === 'synth';
            if (tab === 'decompose') {
                if (
                    this.bagDecomposeSelectedItem
                    && (
                        !this.isBagDecomposeEligibleItem(this.bagDecomposeSelectedItem)
                        || this.getRoleInventoryCount(this.bagDecomposeSelectedItem.id) <= 0
                    )
                ) {
                    this.bagDecomposeSelectedItem = null;
                }
                this.refreshBagDecomposeSlots();
            }
            if (tab === 'synth') {
                if (this.bagSynthSelectedFragment && this.getRoleInventoryCount(this.bagSynthSelectedFragment.id) <= 0) {
                    this.bagSynthSelectedFragment = null;
                }
                this.refreshBagSynthSlots();
            }
            this.refreshBagCategoryTabs(this.bagCatalogView);
            this.refreshBagCatalogGrid(this.bagCatalogView);
            this.raiseActiveBagModeFrame();
        }
        if (this.bagIllustrationButton) {
            this.bagIllustrationButton.active = tab === 'bag';
        }
        this.refreshBagBottomTabState(tab);
    }
    protected refreshBagBottomTabState(activeTab: BagPageTab): void {
        this.bagBottomTabButtons.forEach((buttonConfig) => {
            if (!buttonConfig.node.isValid) return;
    
            const skinPath = buttonConfig.tab === activeTab ? buttonConfig.activePath : buttonConfig.normalPath;
            this.applyUiSkinKeepingEditorSize(buttonConfig.node, skinPath, HomeConfig.BAG_PAGE_BOTTOM_BUTTON_WIDTH, HomeConfig.BAG_PAGE_BOTTOM_BUTTON_HEIGHT);
        });
    }
}
