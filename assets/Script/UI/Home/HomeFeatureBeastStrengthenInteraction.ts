import {
    Color,
    HorizontalTextAlignment,
    Label,
    Node,
    Overflow,
    UITransform,
} from 'cc';
import {
    BAG_ILLUSTRATION_CATALOG,
    type BagIllustrationCatalogItem,
} from './BagIllustrationCatalog.generated';
import {
    type BeastStrengthenAction,
    type BeastStrengthenBeastKey,
    type BeastStrengthenEquipmentConfig,
    type BeastStrengthenEquipPart,
} from './HomeBeastStrengthenConfig';
import * as HomeConfig from './HomeConfig';
import { HomeViewBase } from './HomeViewBase';

abstract class HomeFeatureBeastStrengthenInteractionHost extends HomeViewBase {
    protected abstract beastStrengthenTitleLabel: Label | null;
    protected abstract beastStrengthenYuanbaoLabel: Label | null;
    protected abstract beastStrengthenBonusLabel: Label | null;
    protected abstract beastStrengthenActionButton: Node | null;
    protected abstract beastStrengthenActionLabel: Label | null;
    protected abstract beastStrengthenRemoveGemButton: Node | null;
    protected abstract beastStrengthenRemoveGemLabel: Label | null;
    protected abstract beastStrengthenSelectedPart: BeastStrengthenEquipPart;
    protected abstract beastStrengthenSelectedGemSlotIndex: number;
    protected abstract beastStrengthenEquipmentSelectionVisible: boolean;
    protected abstract beastStrengthenAction: BeastStrengthenAction;
    protected abstract setLabelOutline(label: Label, color: Color, width: number): void;
    protected abstract showBeastStrengthenGemSelectDrawer(popup: Node, board: Node): void;
}

/**
 * Owns Beast Strengthen refresh, selection, unlock and gem-placement interactions.
 */
export abstract class HomeFeatureBeastStrengthenInteraction extends HomeFeatureBeastStrengthenInteractionHost {
    protected beastStrengthenActionButtonEditorPosition: { x: number; y: number } | null = null;
    protected beastStrengthenRemoveGemButtonEditorPosition: { x: number; y: number } | null = null;

    protected refreshBeastStrengthenPage(): void {
        if (!this.beastStrengthenPage?.isValid) return;
        const state = this.ensureBeastStrengthenState();
        const beast = this.getCurrentBeastStrengthenBeast();
        const configs = this.getBeastStrengthenEquipmentConfigs(beast);
        const selected = configs.find((config) => config.part === this.beastStrengthenSelectedPart) || configs[0];
        this.beastStrengthenSelectedPart = selected?.part || 'chest';

        if (this.beastStrengthenTitleLabel?.isValid) {
            this.beastStrengthenTitleLabel.string = `${beast.name}\u517d\u8109\u5f3a\u5316`;
        }
        if (this.beastStrengthenYuanbaoLabel?.isValid) {
            this.beastStrengthenYuanbaoLabel.string = `${state.yuanbao}`;
        }
        configs.forEach((config) => this.refreshBeastStrengthenEquipmentSlot(config));
        if (selected) {
            this.refreshBeastStrengthenCenterEquipment(selected);
            this.refreshBeastStrengthenGemSlots(selected);
        }
        this.refreshBeastStrengthenBonus(beast.key);
        this.refreshBeastStrengthenActionButton();
    }

    protected refreshBeastStrengthenEquipmentSlot(config: BeastStrengthenEquipmentConfig): void {
        if (!this.beastStrengthenPage?.isValid) return;
        const slot = this.findNode(`BeastEquipSlot_${config.part}`, this.beastStrengthenPage);
        if (!slot?.isValid) return;

        const unlocked = this.isBeastStrengthenEquipmentUnlocked(config);
        this.applyUiSkinKeepingEditorSize(
            slot,
            unlocked ? HomeConfig.UI_BEAST_STRENGTHEN_EQUIP_UNLOCKED_FRAME : HomeConfig.UI_BEAST_STRENGTHEN_EQUIP_LOCKED_FRAME,
            HomeConfig.BEAST_STRENGTHEN_EQUIP_SLOT_SIZE,
            HomeConfig.BEAST_STRENGTHEN_EQUIP_SLOT_SIZE,
        );
        const icon = slot.getChildByName('BeastEquipIcon') || this.getOrCreateBottomFeatureNode(slot, 'BeastEquipIcon', HomeConfig.BEAST_STRENGTHEN_EQUIP_ICON_SIZE, HomeConfig.BEAST_STRENGTHEN_EQUIP_ICON_SIZE, 0, 0).node;
        if (config.iconPath) {
            icon.active = true;
            this.applyUiSkinKeepingEditorSize(icon, config.iconPath, HomeConfig.BEAST_STRENGTHEN_EQUIP_ICON_SIZE, HomeConfig.BEAST_STRENGTHEN_EQUIP_ICON_SIZE);
            this.alignBeastStrengthenEquipmentIcon(
                icon,
                config.itemId,
                HomeConfig.BEAST_STRENGTHEN_EQUIP_ICON_SIZE,
                HomeConfig.BEAST_STRENGTHEN_EQUIP_ICON_SIZE,
            );
            this.setNodeOpacity(icon, unlocked ? 255 : 145);
        } else {
            icon.active = false;
        }
        const lock = slot.getChildByName('BeastEquipLock');
        if (lock?.isValid) lock.active = !unlocked;
        const selectedFrame = slot.getChildByName('BeastEquipSelectedFrame');
        if (selectedFrame?.isValid) {
            const selected = this.beastStrengthenEquipmentSelectionVisible && this.beastStrengthenSelectedPart === config.part;
            selectedFrame.active = selected;
            if (selected) {
                this.applyBeastStrengthenEquipSelectedFrameSkin(selectedFrame);
            }
        }
        this.bindScaledClick(slot, () => this.handleBeastStrengthenEquipmentClick(config));
    }

    protected applyBeastStrengthenEquipSelectedFrameSkin(node: Node): void {
        const transform = node.getComponent(UITransform) || node.addComponent(UITransform);
        transform.setContentSize(
            HomeConfig.BEAST_STRENGTHEN_EQUIP_SELECTED_FRAME_SIZE,
            HomeConfig.BEAST_STRENGTHEN_EQUIP_SELECTED_FRAME_SIZE,
        );
        this.applyUiSkinKeepingEditorSize(
            node,
            HomeConfig.UI_BEAST_STRENGTHEN_SELECTED_FRAME,
            HomeConfig.BEAST_STRENGTHEN_EQUIP_SELECTED_FRAME_SIZE,
            HomeConfig.BEAST_STRENGTHEN_EQUIP_SELECTED_FRAME_SIZE,
        );
    }

    protected refreshBeastStrengthenCenterEquipment(config: BeastStrengthenEquipmentConfig): void {
        if (!this.beastStrengthenPage?.isValid) return;
        const centerFrame = this.findNode('BeastStrengthenCenterEquipFrame', this.beastStrengthenPage);
        if (!centerFrame?.isValid) return;

        const unlocked = this.isBeastStrengthenEquipmentUnlocked(config);
        const icon = centerFrame.getChildByName('BeastStrengthenCenterEquipIcon');
        if (icon?.isValid && config.iconPath) {
            icon.active = true;
            this.applyUiSkinKeepingEditorSize(icon, config.iconPath, 82, 82);
            this.alignBeastStrengthenEquipmentIcon(icon, config.itemId, 82, 82);
            this.setNodeOpacity(icon, unlocked ? 255 : 150);
        }
        const lock = centerFrame.getChildByName('BeastStrengthenCenterEquipLock');
        if (lock?.isValid) lock.active = !unlocked;
        const nameLabel = this.findNode('BeastStrengthenSelectedEquipName', this.beastStrengthenPage)?.getComponent(Label);
        if (nameLabel) nameLabel.string = config.displayName;
    }

    protected alignBeastStrengthenEquipmentIcon(icon: Node, itemId: string, targetWidth: number, targetHeight: number): void {
        const offset = HomeConfig.BEAST_STRENGTHEN_EQUIP_ICON_SOURCE_OFFSETS[itemId];
        if (!offset) {
            icon.setPosition(0, 0, 0);
            return;
        }

        icon.setPosition(
            offset.x * targetWidth / HomeConfig.BEAST_STRENGTHEN_EQUIP_ICON_SOURCE_WIDTH,
            offset.y * targetHeight / HomeConfig.BEAST_STRENGTHEN_EQUIP_ICON_SOURCE_HEIGHT,
            0,
        );
    }

    protected refreshBeastStrengthenGemSlots(config: BeastStrengthenEquipmentConfig): void {
        if (!this.beastStrengthenPage?.isValid) return;
        const equipmentUnlocked = this.isBeastStrengthenEquipmentUnlocked(config);
        for (let index = 0; index < HomeConfig.BEAST_STRENGTHEN_GEM_SLOT_COUNT; index += 1) {
            const slot = this.findNode(`BeastGemSlot_${index + 1}`, this.beastStrengthenPage);
            if (!slot?.isValid) continue;

            const slotUnlocked = this.isBeastStrengthenGemSlotUnlocked(config, index);
            const slotKey = this.getBeastStrengthenGemSlotKey(config.beastKey, config.part, index);
            const gemId = this.ensureBeastStrengthenState().equippedGems[slotKey] || '';
            const plus = slot.getChildByName('BeastGemSlotPlus');
            const lock = slot.getChildByName('BeastGemSlotLock');
            const gemIcon = slot.getChildByName('BeastGemSlotIcon');
            const selectedFrame = slot.getChildByName('BeastGemSlotSelectedFrame')
                || this.getOrCreateBottomFeatureSkinnedNode(
                    slot,
                    'BeastGemSlotSelectedFrame',
                    HomeConfig.BEAST_STRENGTHEN_EQUIP_SELECTED_FRAME_SIZE,
                    HomeConfig.BEAST_STRENGTHEN_EQUIP_SELECTED_FRAME_SIZE,
                    0,
                    0,
                    HomeConfig.UI_BEAST_STRENGTHEN_SELECTED_FRAME,
                ).node;
            if (plus?.isValid) plus.active = slotUnlocked && !gemId;
            if (lock?.isValid) lock.active = !slotUnlocked;
            if (gemIcon?.isValid) {
                const gemItem = gemId ? BAG_ILLUSTRATION_CATALOG.find((item) => item.id === gemId) : null;
                gemIcon.active = !!gemItem;
                if (gemItem) {
                    this.applyUiSkinKeepingEditorSize(gemIcon, gemItem.iconPath, HomeConfig.BEAST_STRENGTHEN_GEM_ICON_SIZE, HomeConfig.BEAST_STRENGTHEN_GEM_ICON_SIZE);
                    this.setNodeOpacity(gemIcon, equipmentUnlocked ? 255 : 150);
                }
            }
            if (selectedFrame?.isValid) {
                selectedFrame.active = this.beastStrengthenSelectedGemSlotIndex === index;
                if (selectedFrame.active) {
                    this.applyBeastStrengthenEquipSelectedFrameSkin(selectedFrame);
                    selectedFrame.setSiblingIndex((slot.children.length || 1) - 1);
                }
            }
            this.bindScaledClick(slot, () => this.handleBeastStrengthenGemSlotClick(index));
        }
    }

    protected refreshBeastStrengthenBonus(beastKey: BeastStrengthenBeastKey): void {
        if (!this.beastStrengthenBonusLabel?.isValid) return;
        this.beastStrengthenBonusLabel.string = `\u517d\u8109\u5361\u4ea7\u51fa:+${this.getBeastStrengthenTotalBonus(beastKey)}`;
    }

    protected refreshBeastStrengthenActionButton(): void {
        if (!this.beastStrengthenActionButton?.isValid) return;
        this.captureBeastStrengthenActionButtonEditorLayout();
        const text = this.getBeastStrengthenActionText(this.beastStrengthenAction);
        const showRemoveGem = this.shouldShowBeastStrengthenRemoveGemButton();
        this.beastStrengthenActionButton.active = !!text;
        if (text) {
            const actionPosition = this.beastStrengthenActionButtonEditorPosition || { x: 0, y: HomeConfig.BEAST_STRENGTHEN_ACTION_Y };
            const removePosition = this.beastStrengthenRemoveGemButtonEditorPosition || { x: 108, y: actionPosition.y };
            const pairedOffsetX = Math.abs(removePosition.x || 108);
            this.beastStrengthenActionButton.setPosition(
                showRemoveGem ? (actionPosition.x || -pairedOffsetX) : actionPosition.x,
                actionPosition.y,
                0,
            );
        }
        if (this.beastStrengthenActionLabel?.isValid) {
            this.layoutBeastStrengthenButtonLabel(this.beastStrengthenActionLabel, text);
        }

        if (this.beastStrengthenRemoveGemButton?.isValid) {
            this.beastStrengthenRemoveGemButton.active = showRemoveGem;
            const actionPosition = this.beastStrengthenActionButtonEditorPosition || { x: 0, y: HomeConfig.BEAST_STRENGTHEN_ACTION_Y };
            const removePosition = this.beastStrengthenRemoveGemButtonEditorPosition || { x: 108, y: actionPosition.y };
            this.beastStrengthenRemoveGemButton.setPosition(
                Math.abs(removePosition.x || 108),
                actionPosition.y,
                0,
            );
        }
        if (this.beastStrengthenRemoveGemLabel?.isValid) {
            this.layoutBeastStrengthenButtonLabel(this.beastStrengthenRemoveGemLabel, '\u5378\u4e0b\u5b9d\u77f3');
        }
    }

    protected captureBeastStrengthenActionButtonEditorLayout(): void {
        if (!this.beastStrengthenActionButtonEditorPosition && this.beastStrengthenActionButton?.isValid) {
            const position = this.beastStrengthenActionButton.position;
            this.beastStrengthenActionButtonEditorPosition = { x: position.x, y: position.y };
        }
        if (!this.beastStrengthenRemoveGemButtonEditorPosition && this.beastStrengthenRemoveGemButton?.isValid) {
            const position = this.beastStrengthenRemoveGemButton.position;
            this.beastStrengthenRemoveGemButtonEditorPosition = { x: position.x, y: position.y };
        }
    }

    protected shouldShowBeastStrengthenRemoveGemButton(): boolean {
        if (this.beastStrengthenAction !== 'replace-gem' || this.beastStrengthenSelectedGemSlotIndex < 0) return false;
        const config = this.getSelectedBeastStrengthenEquipmentConfig();
        if (!config) return false;
        const slotKey = this.getBeastStrengthenGemSlotKey(config.beastKey, config.part, this.beastStrengthenSelectedGemSlotIndex);
        return !!this.ensureBeastStrengthenState().equippedGems[slotKey];
    }

    protected handleBeastStrengthenEquipmentClick(config: BeastStrengthenEquipmentConfig): void {
        this.beastStrengthenEquipmentSelectionVisible = true;
        this.beastStrengthenSelectedPart = config.part;
        this.beastStrengthenSelectedGemSlotIndex = -1;
        if (!this.isBeastStrengthenEquipmentUnlocked(config)) {
            this.beastStrengthenAction = 'unlock-equipment';
            this.refreshBeastStrengthenPage();
            return;
        }
        this.beastStrengthenAction = '';
        this.refreshBeastStrengthenPage();
    }

    protected handleBeastStrengthenGemSlotClick(index: number): void {
        const config = this.getSelectedBeastStrengthenEquipmentConfig();
        if (!config) return;
        this.beastStrengthenSelectedGemSlotIndex = index;

        if (!this.isBeastStrengthenGemSlotUnlocked(config, index)) {
            this.beastStrengthenAction = 'unlock-gem';
            this.refreshBeastStrengthenPage();
            return;
        }

        if (!this.isBeastStrengthenEquipmentUnlocked(config)) {
            this.beastStrengthenAction = '';
            this.refreshBeastStrengthenPage();
            this.showToast('\u8bf7\u5148\u89e3\u9501\u76f8\u5e94\u7684\u88c5\u5907');
            return;
        }

        const slotKey = this.getBeastStrengthenGemSlotKey(config.beastKey, config.part, index);
        const hasGem = !!this.ensureBeastStrengthenState().equippedGems[slotKey];
        this.beastStrengthenAction = hasGem ? 'replace-gem' : 'place-gem';
        this.refreshBeastStrengthenPage();
    }

    protected handleBeastStrengthenActionButtonClick(): void {
        const config = this.getSelectedBeastStrengthenEquipmentConfig();
        if (!config) return;
        if (this.beastStrengthenAction === 'unlock-equipment') {
            this.openBeastStrengthenEquipmentConfirm(config);
            return;
        }
        if (this.beastStrengthenAction === 'unlock-gem') {
            if (this.beastStrengthenSelectedGemSlotIndex < 0) return;
            this.openBeastStrengthenGemSlotConfirm(config, this.beastStrengthenSelectedGemSlotIndex);
            return;
        }
        if (this.beastStrengthenAction === 'place-gem' || this.beastStrengthenAction === 'replace-gem') {
            this.openBeastStrengthenGemSelectPopup();
        }
    }

    protected handleBeastStrengthenRemoveGemButtonClick(): void {
        const config = this.getSelectedBeastStrengthenEquipmentConfig();
        if (!config || this.beastStrengthenSelectedGemSlotIndex < 0) return;

        const state = this.ensureBeastStrengthenState();
        const slotKey = this.getBeastStrengthenGemSlotKey(config.beastKey, config.part, this.beastStrengthenSelectedGemSlotIndex);
        if (!state.equippedGems[slotKey]) {
            this.showToast('\u5f53\u524d\u6ca1\u6709\u5b9d\u77f3');
            return;
        }

        delete state.equippedGems[slotKey];
        this.beastStrengthenAction = '';
        this.saveBeastStrengthenState();
        this.showToast('\u5df2\u5378\u4e0b\u5b9d\u77f3');
        this.refreshBeastStrengthenPage();
    }

    protected openBeastStrengthenEquipmentConfirm(config: BeastStrengthenEquipmentConfig): void {
        this.openSharedFlowPopup('ConfirmPopup', {
            title: '\u7cfb\u7edf\u63d0\u793a',
            message: `\u662f\u5426\u82b1\u8d39${HomeConfig.BEAST_STRENGTHEN_UNLOCK_COST}\u5143\u5b9d\u6fc0\u6d3b${config.displayName}`,
            variant: 'beastStrengthenConfirm',
            onConfirm: () => {
                if (!this.spendBeastStrengthenYuanbao(HomeConfig.BEAST_STRENGTHEN_UNLOCK_COST)) return;
                const state = this.ensureBeastStrengthenState();
                state.unlockedEquipments[this.getBeastStrengthenEquipmentKey(config.beastKey, config.part)] = true;
                this.beastStrengthenAction = '';
                this.saveBeastStrengthenState();
                this.showToast(`\u5df2\u6fc0\u6d3b${config.displayName}`);
                this.refreshBeastStrengthenPage();
            },
        });
    }

    protected openBeastStrengthenGemSlotConfirm(config: BeastStrengthenEquipmentConfig, index: number): void {
        this.openSharedFlowPopup('ConfirmPopup', {
            title: '\u7cfb\u7edf\u63d0\u793a',
            message: `\u662f\u5426\u82b1\u8d39${HomeConfig.BEAST_STRENGTHEN_UNLOCK_COST}\u5143\u5b9d\u89e3\u9501\u4e00\u4e2a\u5b9d\u77f3\u6846`,
            variant: 'beastStrengthenConfirm',
            onConfirm: () => {
                if (!this.spendBeastStrengthenYuanbao(HomeConfig.BEAST_STRENGTHEN_UNLOCK_COST)) return;
                const state = this.ensureBeastStrengthenState();
                state.unlockedGemSlots[this.getBeastStrengthenGemSlotKey(config.beastKey, config.part, index)] = true;
                this.beastStrengthenAction = '';
                this.saveBeastStrengthenState();
                this.showToast('\u5df2\u89e3\u9501\u5b9d\u77f3\u6846');
                this.refreshBeastStrengthenPage();
            },
        });
    }

    protected openBeastStrengthenGemSelectPopup(): void {
        const config = this.getSelectedBeastStrengthenEquipmentConfig();
        if (!config || this.beastStrengthenSelectedGemSlotIndex < 0) return;
        if (!this.isBeastStrengthenEquipmentUnlocked(config)) {
            this.showToast('\u8bf7\u5148\u89e3\u9501\u76f8\u5e94\u7684\u88c5\u5907');
            return;
        }

        const popup = this.ensureBeastStrengthenGemSelectPopup();
        if (!popup?.isValid) return;
        const board = this.findNode('BeastGemSelectBoard', popup);
        const title = this.findNode('BeastGemSelectTitle', popup)?.getComponent(Label);
        if (title) title.string = this.beastStrengthenAction === 'replace-gem' ? '\u66ff\u6362\u5b9d\u77f3' : '\u653e\u7f6e\u5b9d\u77f3';
        const viewport = this.findNode('BeastGemSelectViewport', board || popup);
        const grid = this.findNode('BeastGemSelectGrid', viewport || board || popup);
        if (!viewport?.isValid || !grid?.isValid) return;
        grid.removeAllChildren();

        const gems = this.getBeastStrengthenGemItems(config.beastKey);
        const viewportHeight = HomeConfig.ROLE_EQUIP_REPLACE_DRAWER_VIEWPORT_HEIGHT;
        if (gems.length === 0) {
            const empty = this.getOrCreateBeastStrengthenLabel(grid, 'BeastGemSelectEmpty', '\u6682\u65e0\u53ef\u7528\u5b9d\u77f3', 28, 0, 80, 420, 60, new Color(255, 236, 188, 255));
            this.setLabelOutline(empty, new Color(61, 31, 16, 255), 2);
            this.showBeastStrengthenGemSelectDrawer(popup, board);
            return;
        }

        const rowCount = Math.ceil(gems.length / HomeConfig.ROLE_EQUIP_REPLACE_DRAWER_GRID_COLS);
        const contentHeight = Math.max(viewportHeight, rowCount * HomeConfig.ROLE_EQUIP_REPLACE_DRAWER_GRID_GAP_Y + 110);
        (grid.getComponent(UITransform) || grid.addComponent(UITransform)).setContentSize(HomeConfig.ROLE_EQUIP_REPLACE_DRAWER_VIEWPORT_WIDTH, contentHeight);
        grid.setPosition(0, 0, 0);
        const startY = viewportHeight / 2 - 78;
        gems.forEach((item, index) => {
            const col = index % HomeConfig.ROLE_EQUIP_REPLACE_DRAWER_GRID_COLS;
            const row = Math.floor(index / HomeConfig.ROLE_EQUIP_REPLACE_DRAWER_GRID_COLS);
            const x = HomeConfig.ROLE_EQUIP_REPLACE_DRAWER_GRID_START_X + col * HomeConfig.ROLE_EQUIP_REPLACE_DRAWER_GRID_GAP_X;
            const y = startY - row * HomeConfig.ROLE_EQUIP_REPLACE_DRAWER_GRID_GAP_Y;
            this.createBeastGemSelectCell(grid, item, config, index, x, y);
        });
        const maxScrollY = Math.max(0, contentHeight - viewportHeight);
        this.bindBagGridScroll(viewport, grid, maxScrollY);
        this.bindBagGridScroll(grid, grid, maxScrollY);

        this.showBeastStrengthenGemSelectDrawer(popup, board);
    }

    protected createBeastGemSelectCell(parent: Node, item: BagIllustrationCatalogItem, config: BeastStrengthenEquipmentConfig, index: number, x: number, y: number): void {
        const cell = this.createNode(`BeastGemSelectItem_${index + 1}`, parent, 128, 138, x, y);
        const frame = this.createSkinnedNode('BeastGemSelectItemFrame', cell, 112, 112, 0, 12, item.framePath);
        frame.setSiblingIndex(0);
        this.createSkinnedNode('BeastGemSelectItemIcon', frame, 88, 88, 0, 2, item.iconPath).setSiblingIndex(1);

        const countLabel = this.createLabel(frame, 'BeastGemSelectItemCount', `x${this.getRoleInventoryCount(item.id)}`, 20, 26, -42, 62, 26, Color.WHITE);
        countLabel.horizontalAlign = HorizontalTextAlignment.RIGHT;
        this.setLabelOutline(countLabel, Color.BLACK, 2);
        countLabel.node.setSiblingIndex(2);

        const nameLabel = this.createLabel(cell, 'BeastGemSelectItemName', item.name.replace(config.beastName, ''), 18, 0, -60, 126, 30, new Color(255, 238, 198, 255));
        nameLabel.overflow = Overflow.SHRINK;
        this.setLabelOutline(nameLabel, new Color(43, 25, 15, 255), 2);
        nameLabel.node.setSiblingIndex(2);
        this.bindGridItemTap(cell, () => this.placeBeastStrengthenGem(item));
    }

    protected placeBeastStrengthenGem(item: BagIllustrationCatalogItem): void {
        const config = this.getSelectedBeastStrengthenEquipmentConfig();
        if (!config || this.beastStrengthenSelectedGemSlotIndex < 0) return;
        if (!item.name.includes(config.beastName)) {
            this.showToast('\u8bf7\u653e\u5165\u5bf9\u5e94\u517d\u7684\u5b9d\u77f3');
            return;
        }

        const state = this.ensureBeastStrengthenState();
        const slotKey = this.getBeastStrengthenGemSlotKey(config.beastKey, config.part, this.beastStrengthenSelectedGemSlotIndex);
        const replaced = !!state.equippedGems[slotKey];
        state.equippedGems[slotKey] = item.id;
        this.beastStrengthenAction = '';
        this.saveBeastStrengthenState();
        this.closeBeastStrengthenGemSelectPopup();
        this.showToast(`${replaced ? '\u5df2\u66ff\u6362' : '\u5df2\u9576\u5d4c'}${item.name}`);
        this.refreshBeastStrengthenPage();
    }
}
