import {
    Color,
    EventTouch,
    Graphics,
    HorizontalTextAlignment,
    Label,
    Mask,
    Node,
    Overflow,
    Rect,
    ScrollView,
    Sprite,
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
import {
    BAG_ILLUSTRATION_CATALOG,
    type BagIllustrationCatalogItem,
} from './BagIllustrationCatalog.generated';
import * as HomeConfig from './HomeConfig';
import { HomeViewBase } from './HomeViewBase';
import { RolePageTab } from './HomeTypes';

type RoleEquipmentSlotId = 'weapon' | 'helmet' | 'armor' | 'wrist' | 'leg' | 'shoes' | 'necklace' | 'ring';
type RoleEquipmentStatType = 'attack' | 'life' | 'defense';
type RoleEquipmentTableKey =
    | 'armorDefense'
    | 'wristLife'
    | 'ringDefense'
    | 'helmetDefense'
    | 'legDefense'
    | 'weaponAttack'
    | 'necklaceLife'
    | 'shoesAttack';

interface RoleEquipmentSlotConfig {
    id: RoleEquipmentSlotId;
    displayName: string;
    iconPath: string;
    keywords: string[];
    frameName: string;
    slotIndex: number;
}

interface RoleEquipmentStatRule {
    type: RoleEquipmentStatType;
    detailLabel: string;
    statusLabel: string;
    materialLabel: string;
    materialType: RoleEquipmentStatType;
    tableKey: RoleEquipmentTableKey;
    growth: number;
}

type RoleEquipmentRuntimeItem = BagIllustrationCatalogItem & {
    displayLevel?: number;
    baseTier?: number;
};

abstract class HomeFeatureRoleEquipmentHost extends HomeViewBase {
    protected abstract readonly roleEquippedItems: Map<RoleEquipmentSlotId, RoleEquipmentRuntimeItem>;
    protected abstract roleEquipDetailPopup: Node | null;
    protected abstract roleEquipReplacePopup: Node | null;
    protected abstract activeRoleEquipSlot: RoleEquipmentSlotConfig | null;
    protected abstract pendingRoleEquipItem: RoleEquipmentRuntimeItem | null;
    protected abstract roleStrengthenSelectedSlot: RoleEquipmentSlotConfig | null;
    protected abstract readonly roleEquipmentLevels: Map<RoleEquipmentSlotId, number>;

    protected abstract getBagItemIdIndex(item: BagIllustrationCatalogItem): number;
    protected abstract setLabelOutline(label: Label, color: Color, width: number): void;
}

/**
 * 角色页壳层、装备槽、装备详情/替换、角色展示与底部页签。
 *
 * 装备与强化状态仍由 RoleBag 初始化器持有；本模块只负责装备流程和对应 UI。
 */
export abstract class HomeFeatureRoleEquipment extends HomeFeatureRoleEquipmentHost {
    protected buildRolePagePanel(): void {
        if (this.rolePagePanel) return;
    
        const popupParent = this.pageRoot || this.popupRoot || this.node;
        const editorPanel = popupParent.getChildByName('RolePagePanel') || this.findNode('RolePagePanel');
        this.rolePagePanel = editorPanel || this.createNode('RolePagePanel', popupParent, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT, 0, 0);
        if (this.rolePagePanel.parent !== popupParent) {
            this.rolePagePanel.setParent(popupParent);
        }
        this.rolePagePanel.setPosition(0, 0, 0);
        (this.rolePagePanel.getComponent(UITransform) || this.rolePagePanel.addComponent(UITransform)).setContentSize(HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT);
        this.rolePagePanel.active = false;
        this.rolePagePanel.on(Node.EventType.TOUCH_END, (event: EventTouch) => {
            event.propagationStopped = true;
        }, this);
    
        this.drawRect(this.rolePagePanel, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT, new Color(6, 15, 18, 255));
        this.getOrCreateRolePageSkinnedNode(this.rolePagePanel, 'RolePageBackground', 920, HomeConfig.VIEW_HEIGHT, 0, 0, HomeConfig.UI_ROLE_PAGE_BG).node.setSiblingIndex(0);
        this.rolePageTitleLabel = this.getOrCreateRolePageLabel(this.rolePagePanel, 'RolePageTitle', '\u89d2\u8272', 42, 0, 720, 240, 64, new Color(255, 238, 196, 255)).label;

        const backButton = this.getOrCreateRolePageSkinnedNode(
            this.rolePagePanel,
            'RolePageBack',
            HomeConfig.BOTTOM_ENTRY_BACK_BUTTON_WIDTH,
            HomeConfig.BOTTOM_ENTRY_BACK_BUTTON_HEIGHT,
            HomeConfig.BOTTOM_ENTRY_BACK_BUTTON_X,
            HomeConfig.BOTTOM_ENTRY_BACK_BUTTON_Y,
            HomeConfig.UI_RANK_BACK,
        ).node;
        this.bindScaledClick(backButton, () => this.closeRolePagePanel());
        backButton.setSiblingIndex(30);
    
        this.rolePageEquipmentRoot = this.getOrCreateRolePageNode(this.rolePagePanel, 'RolePageEquipmentPage', HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT, 0, 0).node;
        this.rolePageEquipmentRoot.setSiblingIndex(1);
        const leftEquipFrame = this.createRolePageSideFrame(this.rolePageEquipmentRoot, 'RolePageLeftFrame', -270, 140 + HomeConfig.ROLE_PAGE_CONTENT_OFFSET_Y + HomeConfig.ROLE_PAGE_EQUIP_OFFSET_Y, HomeConfig.ROLE_PAGE_LEFT_EQUIPS);
        const rightEquipFrame = this.createRolePageSideFrame(this.rolePageEquipmentRoot, 'RolePageRightFrame', 270, 140 + HomeConfig.ROLE_PAGE_CONTENT_OFFSET_Y + HomeConfig.ROLE_PAGE_EQUIP_OFFSET_Y, HomeConfig.ROLE_PAGE_RIGHT_EQUIPS);
    
        const oldShowStage = this.rolePageEquipmentRoot.getChildByName('RoleShowStage');
        if (oldShowStage?.isValid) oldShowStage.active = false;
        const roleNodeInfo = this.getOrCreateRolePageNode(this.rolePageEquipmentRoot, 'RolePageRole', HomeConfig.ROLE_PAGE_ROLE_NODE_WIDTH, HomeConfig.ROLE_PAGE_ROLE_NODE_HEIGHT, 0, 0);
        const roleNode = roleNodeInfo.node;
        this.rolePageRoleUsesEditorTransform = roleNodeInfo.existed;
        roleNode.setSiblingIndex(3);
        leftEquipFrame.setSiblingIndex(4);
        rightEquipFrame.setSiblingIndex(5);
        this.rolePageSkeleton = roleNode.getComponent(sp.Skeleton) || roleNode.addComponent(sp.Skeleton);
        this.prepareSkeletonRenderer(this.rolePageSkeleton);
        this.setSkeletonVisible(this.rolePageSkeleton, false);
        const powerFrameInfo = this.getOrCreateRolePageSkinnedNode(this.rolePagePanel, 'RolePagePowerFrame', HomeConfig.ROLE_PAGE_POWER_FRAME_WIDTH, HomeConfig.ROLE_PAGE_POWER_FRAME_HEIGHT, 0, HomeConfig.ROLE_PAGE_POWER_FRAME_OFFSET_Y, HomeConfig.UI_ROLE_POWER_FRAME);
        this.rolePagePowerFrame = powerFrameInfo.node;
        this.rolePagePowerUsesEditorTransform = powerFrameInfo.existed;
        this.rolePagePowerFrame.setSiblingIndex(8);
        this.rolePagePowerDigitRoot = this.getOrCreateRolePageNode(this.rolePagePowerFrame, 'RolePagePowerDigitRoot', 180, HomeConfig.ROLE_PAGE_POWER_DIGIT_HEIGHT, HomeConfig.ROLE_PAGE_POWER_DIGIT_OFFSET_X, HomeConfig.ROLE_PAGE_POWER_DIGIT_OFFSET_Y).node;
        const powerDetailButton = this.getOrCreateRolePageSkinnedNode(this.rolePagePowerFrame, 'RolePagePowerDetailButton', HomeConfig.ROLE_PAGE_POWER_DETAIL_BUTTON_SIZE, HomeConfig.ROLE_PAGE_POWER_DETAIL_BUTTON_SIZE, HomeConfig.ROLE_PAGE_POWER_DETAIL_BUTTON_X, HomeConfig.ROLE_PAGE_POWER_DETAIL_BUTTON_Y, HomeConfig.UI_ROLE_POWER_DETAIL_BTN).node;
        this.rolePagePowerDetailButton = powerDetailButton;
        powerDetailButton.setSiblingIndex(3);
        this.bindScaledClick(powerDetailButton, () => this.openRoleAttrDetailPanel());
        this.buildRolePageEquipmentInlineAttrs();
        const nameLabelInfo = this.getOrCreateRolePageLabel(this.rolePagePanel, 'RolePageNameLabel', '', HomeConfig.ROLE_PAGE_NAME_LABEL_FONT_SIZE, 0, HomeConfig.ROLE_PAGE_NAME_LABEL_OFFSET_Y, HomeConfig.ROLE_PAGE_NAME_LABEL_WIDTH, HomeConfig.ROLE_PAGE_NAME_LABEL_HEIGHT, new Color(255, 246, 219, 255));
        this.rolePageNameLabel = nameLabelInfo.label;
        this.rolePageNameUsesEditorTransform = nameLabelInfo.existed;
        this.applyRolePageNameLabelStyle(this.rolePageNameLabel);
        this.rolePageNameLabel.node.setSiblingIndex(7);
    
        this.buildRoleAdvancePage();
        this.buildRoleStrengthenPage();
        this.createRolePageBottomTabs();
    }
    protected buildRolePageEquipmentInlineAttrs(): void {
        if (!this.rolePagePanel?.isValid) return;

        const rootInfo = this.getOrCreateRolePageNode(
            this.rolePagePanel,
            'RolePageEquipmentInlineAttrRoot',
            HomeConfig.ROLE_PAGE_EQUIPMENT_INLINE_ATTR_WIDTH,
            HomeConfig.ROLE_PAGE_EQUIPMENT_INLINE_ATTR_HEIGHT,
            HomeConfig.ROLE_PAGE_EQUIPMENT_INLINE_ATTR_X,
            HomeConfig.ROLE_PAGE_EQUIPMENT_INLINE_ATTR_Y,
        );
        const root = rootInfo.node;
        this.rolePageEquipmentInlineAttrRoot = root;
        root.active = this.rolePageActiveTab === 'equipment';
        if (!rootInfo.existed) {
            root.setPosition(HomeConfig.ROLE_PAGE_EQUIPMENT_INLINE_ATTR_X, HomeConfig.ROLE_PAGE_EQUIPMENT_INLINE_ATTR_Y, 0);
        }
        root.setSiblingIndex(9);

        const names = ['\u7b49\u7ea7', '\u8840\u91cf', '\u653b\u51fb', '\u9632\u5fa1'];
        names.forEach((name, index) => {
            const y = -index * HomeConfig.ROLE_PAGE_EQUIPMENT_INLINE_ATTR_ROW_GAP;
            const nameLabel = this.getOrCreateRolePageLabel(
                root,
                `RolePageEquipmentInlineAttrName_${index}`,
                name,
                HomeConfig.ROLE_PAGE_EQUIPMENT_INLINE_ATTR_FONT_SIZE,
                HomeConfig.ROLE_PAGE_EQUIPMENT_INLINE_ATTR_LABEL_X,
                y,
                HomeConfig.ROLE_PAGE_EQUIPMENT_INLINE_ATTR_LABEL_WIDTH,
                HomeConfig.ROLE_PAGE_EQUIPMENT_INLINE_ATTR_TEXT_HEIGHT,
                Color.BLACK,
            ).label;
            nameLabel.horizontalAlign = HorizontalTextAlignment.CENTER;
            this.applyRoleAttrLabelStyle(nameLabel, 1);
            nameLabel.node.setSiblingIndex(index * 2);

            const valueLabel = this.getOrCreateRolePageLabel(
                root,
                `RolePageEquipmentInlineAttrValue_${index}`,
                '',
                HomeConfig.ROLE_PAGE_EQUIPMENT_INLINE_ATTR_FONT_SIZE,
                HomeConfig.ROLE_PAGE_EQUIPMENT_INLINE_ATTR_VALUE_X,
                y,
                HomeConfig.ROLE_PAGE_EQUIPMENT_INLINE_ATTR_VALUE_WIDTH,
                HomeConfig.ROLE_PAGE_EQUIPMENT_INLINE_ATTR_TEXT_HEIGHT,
                Color.BLACK,
            ).label;
            valueLabel.horizontalAlign = HorizontalTextAlignment.CENTER;
            this.applyRoleAttrLabelStyle(valueLabel, 1);
            valueLabel.node.setSiblingIndex(index * 2 + 1);
        });
        this.refreshRolePageEquipmentInlineAttrs();
    }
    protected getOrCreateRolePageNode(parent: Node, name: string, width: number, height: number, x: number, y: number): { node: Node; existed: boolean } {
        const existing = parent.getChildByName(name);
        if (existing) {
            const transform = existing.getComponent(UITransform) || existing.addComponent(UITransform);
            if (transform.contentSize.width <= 0 || transform.contentSize.height <= 0) {
                transform.setContentSize(width, height);
            }
            return { node: existing, existed: true };
        }

        return { node: this.createNode(name, parent, width, height, x, y), existed: false };
    }
    protected getOrCreateRolePageSkinnedNode(parent: Node, name: string, width: number, height: number, x: number, y: number, skinPath: string): { node: Node; existed: boolean } {
        const result = this.getOrCreateRolePageNode(parent, name, width, height, x, y);
        this.applyUiSkinKeepingEditorSize(result.node, skinPath, width, height);
        return result;
    }
    protected getOrCreateRolePageLabel(parent: Node, name: string, text: string, fontSize: number, x: number, y: number, width: number, height: number, color: Color): { label: Label; existed: boolean } {
        const result = this.getOrCreateRolePageNode(parent, name, width, height, x, y);
        const label = result.node.getComponent(Label) || result.node.addComponent(Label);
        applySimKaiFont(label);
        label.string = text;
        label.fontSize = fontSize;
        label.lineHeight = fontSize + 8;
        label.color = color;
        label.horizontalAlign = HorizontalTextAlignment.CENTER;
        label.verticalAlign = VerticalTextAlignment.CENTER;
        return { label, existed: result.existed };
    }
    protected getRoleEquipmentSlotConfigs(): RoleEquipmentSlotConfig[] {
        return [
            { id: 'weapon', displayName: '\u6b66\u5668', iconPath: HomeConfig.UI_ROLE_EQUIP_WEAPON, keywords: ['\u6b66\u5668'], frameName: 'RolePageLeftFrame', slotIndex: 1 },
            { id: 'necklace', displayName: '\u9879\u94fe', iconPath: HomeConfig.UI_ROLE_EQUIP_NECKLACE, keywords: ['\u9879\u94fe'], frameName: 'RolePageLeftFrame', slotIndex: 2 },
            { id: 'wrist', displayName: '\u62a4\u8155', iconPath: HomeConfig.UI_ROLE_EQUIP_WRIST, keywords: ['\u62a4\u8155'], frameName: 'RolePageLeftFrame', slotIndex: 3 },
            { id: 'leg', displayName: '\u817f\u7532', iconPath: HomeConfig.UI_ROLE_EQUIP_LEG, keywords: ['\u817f\u7532'], frameName: 'RolePageLeftFrame', slotIndex: 4 },
            { id: 'helmet', displayName: '\u5934\u76d4', iconPath: HomeConfig.UI_ROLE_EQUIP_HELMET, keywords: ['\u5934\u76d4'], frameName: 'RolePageRightFrame', slotIndex: 1 },
            { id: 'armor', displayName: '\u5e03\u7532', iconPath: HomeConfig.UI_ROLE_EQUIP_ARMOR, keywords: ['\u5e03\u7532'], frameName: 'RolePageRightFrame', slotIndex: 2 },
            { id: 'ring', displayName: '\u6212\u6307', iconPath: HomeConfig.UI_ROLE_EQUIP_RING, keywords: ['\u6212\u6307'], frameName: 'RolePageRightFrame', slotIndex: 3 },
            { id: 'shoes', displayName: '\u6218\u9774', iconPath: HomeConfig.UI_ROLE_EQUIP_SHOES, keywords: ['\u978b\u5b50'], frameName: 'RolePageRightFrame', slotIndex: 4 },
        ];
    }
    protected getRoleEquipmentCatalogIndexByTier(slotId: RoleEquipmentSlotId, tier: number): number {
        const catalogMap: Record<RoleEquipmentSlotId, number[]> = {
            weapon: [142, 138, 139, 140, 141],
            necklace: [147, 143, 144, 145, 146],
            wrist: [122, 118, 119, 120, 121],
            leg: [137, 133, 134, 135, 136],
            helmet: [132, 128, 129, 130, 131],
            armor: [117, 113, 114, 115, 116],
            ring: [127, 123, 124, 125, 126],
            shoes: [152, 148, 149, 150, 151],
        };
        return catalogMap[slotId][Math.max(1, Math.min(5, tier)) - 1];
    }
    protected getRoleEquipmentTierByCatalogIndex(catalogIndex: number): number {
        for (const config of this.getRoleEquipmentSlotConfigs()) {
            for (let tier = 1; tier <= 5; tier += 1) {
                if (this.getRoleEquipmentCatalogIndexByTier(config.id, tier) === catalogIndex) return tier;
            }
        }
        return 0;
    }
    protected getCatalogDisplayName(item: BagIllustrationCatalogItem | RoleEquipmentRuntimeItem | null | undefined): string {
        if (!item) return '';
        const equipmentIndex = item.category === 'equipment' ? this.getBagItemIdIndex(item) : this.getBagItemIconIndex(item);
        const equipmentNameMap: Record<number, string> = {
            113: '\u4e8c\u7ea7\u5e03\u7532',
            114: '\u4e09\u7ea7\u5e03\u7532',
            115: '\u56db\u7ea7\u5e03\u7532',
            116: '\u4e94\u7ea7\u5e03\u7532',
            117: '\u4e00\u7ea7\u5e03\u7532',
            118: '\u4e8c\u7ea7\u62a4\u8155',
            119: '\u4e09\u7ea7\u62a4\u8155',
            120: '\u56db\u7ea7\u62a4\u8155',
            121: '\u4e94\u7ea7\u62a4\u8155',
            122: '\u4e00\u7ea7\u62a4\u8155',
            123: '\u4e8c\u7ea7\u6212\u6307',
            124: '\u4e09\u7ea7\u6212\u6307',
            125: '\u56db\u7ea7\u6212\u6307',
            126: '\u4e94\u7ea7\u6212\u6307',
            127: '\u4e00\u7ea7\u6212\u6307',
            128: '\u4e8c\u7ea7\u5934\u76d4',
            129: '\u4e09\u7ea7\u5934\u76d4',
            130: '\u56db\u7ea7\u5934\u76d4',
            131: '\u4e94\u7ea7\u5934\u76d4',
            132: '\u4e00\u7ea7\u5934\u76d4',
            133: '\u4e8c\u7ea7\u817f\u7532',
            134: '\u4e09\u7ea7\u817f\u7532',
            135: '\u56db\u7ea7\u817f\u7532',
            136: '\u4e94\u7ea7\u817f\u7532',
            137: '\u4e00\u7ea7\u817f\u7532',
            138: '\u4e8c\u7ea7\u6b66\u5668',
            139: '\u4e09\u7ea7\u6b66\u5668',
            140: '\u56db\u7ea7\u6b66\u5668',
            141: '\u4e94\u7ea7\u6b66\u5668',
            142: '\u4e00\u7ea7\u6b66\u5668',
            143: '\u4e8c\u7ea7\u9879\u94fe',
            144: '\u4e09\u7ea7\u9879\u94fe',
            145: '\u56db\u7ea7\u9879\u94fe',
            146: '\u4e94\u7ea7\u9879\u94fe',
            147: '\u4e00\u7ea7\u9879\u94fe',
            148: '\u4e8c\u7ea7\u978b\u5b50',
            149: '\u4e09\u7ea7\u978b\u5b50',
            150: '\u56db\u7ea7\u978b\u5b50',
            151: '\u4e94\u7ea7\u978b\u5b50',
            152: '\u4e00\u7ea7\u978b\u5b50',
            153: '\u767d\u9e7f\u62a4\u7532',
            154: '\u767d\u9e7f\u5934\u76d4',
            155: '\u767d\u9e7f\u817f\u7532',
            156: '\u767d\u9e7f\u80f8\u6302',
            157: '\u8d64\u72d0\u62a4\u7532',
            158: '\u8d64\u72d0\u5934\u76d4',
            159: '\u8d64\u72d0\u817f\u7532',
            160: '\u8d64\u72d0\u80f8\u6302',
            161: '\u91d1\u9e64\u62a4\u7532',
            162: '\u91d1\u9e64\u5934\u76d4',
            163: '\u91d1\u9e64\u817f\u7532',
            164: '\u91d1\u9e64\u80f8\u6302',
            165: '\u9752\u72ee\u62a4\u7532',
            166: '\u9752\u72ee\u5934\u76d4',
            167: '\u9752\u72ee\u817f\u7532',
            168: '\u9752\u72ee\u80f8\u6302',
        };
        const baseName = equipmentNameMap[equipmentIndex] || item.name;
        const runtimeLevel = (item as RoleEquipmentRuntimeItem).displayLevel;
        if (item.category === 'equipment' && runtimeLevel) {
            const suffix = baseName.replace(/^(?:\d+|[\u4e00\u4e8c\u4e09\u56db\u4e94\u516d\u4e03\u516b\u4e5d\u5341]+)\u7ea7/, '');
            return `${runtimeLevel}\u7ea7${suffix || baseName}`;
        }
        return baseName;
    }
    protected createRolePageSideFrame(parent: Node, name: string, x: number, y: number, equipIconPaths: string[]): Node {
        const frame = this.getOrCreateRolePageNode(parent, name, 124, 650, x, y).node;
        const equipmentConfigs = this.getRoleEquipmentSlotConfigs()
            .filter((config) => config.frameName === name);
    
        [240, 80, -80, -240].forEach((slotY, index) => {
            const config = equipmentConfigs[index];
            if (!config) return;
            const display = this.getRoleEquipmentSlotDisplay(config);
            const iconPath = display.item?.iconPath || equipIconPaths[index];
            const framePath = display.item?.framePath || HomeConfig.UI_ROLE_EQUIP_FRAME_LV1;
            const slot = this.getOrCreateRolePageSkinnedNode(frame, `${name}_Slot_${index + 1}`, 110, 110, 0, slotY, HomeConfig.UI_ROLE_EQUIP_FRAME_LV1).node;
            this.applyUiSkin(slot, framePath, 110, 110);
            this.syncEquipmentFrameEffectForItem(
                slot,
                `${name}_FrameEffect_${index + 1}`,
                display.item,
                110,
                110,
            )?.setSiblingIndex(3);
            const selectedFrame = this.getOrCreateRolePageNode(
                slot,
                'RoleEquipSelectedFrame',
                HomeConfig.ROLE_EQUIP_SELECTED_FRAME_SIZE,
                HomeConfig.ROLE_EQUIP_SELECTED_FRAME_SIZE,
                0,
                0,
            ).node;
            selectedFrame.active = this.rolePageActiveTab === 'forge' && this.roleStrengthenSelectedSlot?.id === config.id;
            selectedFrame.setSiblingIndex(5);
            const icon = this.getOrCreateRolePageSkinnedNode(slot, `${name}_Icon_${index + 1}`, 82, 82, 0, 0, iconPath).node;
            icon.setSiblingIndex(2);
            this.applyUiSkin(icon, iconPath, 82, 82);
            const displayLevel = display.equipped ? this.getEquipmentLevelBySlot(config) : 1;
            const level = this.getOrCreateRolePageLabel(slot, `${name}_Level_${index + 1}`, `lv.${displayLevel}`, 18, 26, -34, 54, 24, Color.WHITE).label;
            level.horizontalAlign = HorizontalTextAlignment.RIGHT;
            level.verticalAlign = VerticalTextAlignment.CENTER;
            this.setLabelOutline(level, Color.BLACK, 2);
            level.node.active = display.equipped;
            level.node.setSiblingIndex(4);
            this.applyRoleEquipmentSlotVisualState(slot, icon, level.node, !display.equipped);
            this.bindScaledClick(slot, () => {
                if (this.rolePageActiveTab === 'forge') {
                    if (!this.getCurrentRoleEquipment(config)) {
                        this.resetRoleStrengthenSelection();
                        this.showToast('\u8bf7\u4f69\u6234\u88c5\u5907');
                        return;
                    }
                    this.selectRoleStrengthenEquipment(config);
                    return;
                }
                if (!this.getCurrentRoleEquipment(config)) {
                    this.openRoleEquipmentReplacePopup(config);
                    return;
                }
                this.openRoleEquipmentDetail(config);
            });
        });
        return frame;
    }
    protected applyRoleEquipSelectedFrameSkin(node: Node): void {
        const transform = node.getComponent(UITransform) || node.addComponent(UITransform);
        if (transform.contentSize.width <= 0 || transform.contentSize.height <= 0) {
            transform.setContentSize(HomeConfig.ROLE_EQUIP_SELECTED_FRAME_SIZE, HomeConfig.ROLE_EQUIP_SELECTED_FRAME_SIZE);
        }
        const existingSprite = node.getComponent(Sprite);
        if (existingSprite?.spriteFrame) return;
        if (existingSprite) existingSprite.enabled = false;

        const { width, height } = transform.contentSize;
        this.loadSpriteFrameAsset(HomeConfig.UI_ROLE_EQUIP_SELECTED_FRAME)
            .then((spriteFrame) => {
                if (!node.isValid) return;
                const currentTransform = node.getComponent(UITransform) || node.addComponent(UITransform);
                currentTransform.setContentSize(width, height);
                const sprite = node.getComponent(Sprite) || node.addComponent(Sprite);
                sprite.type = Sprite.Type.SIMPLE;
                sprite.sizeMode = Sprite.SizeMode.CUSTOM;
                sprite.spriteFrame = spriteFrame;
                sprite.enabled = true;
            })
            .catch((err) => {
                console.warn('[MainHomeView] role equip selected frame load failed', err);
            });
    }
    protected getRoleEquipmentBaseItems(config: RoleEquipmentSlotConfig): BagIllustrationCatalogItem[] {
        return [1, 2, 3, 4, 5]
            .map((tier) => {
                const catalogIndex = this.getRoleEquipmentCatalogIndexByTier(config.id, tier);
                return BAG_ILLUSTRATION_CATALOG.find((item) => item.category === 'equipment' && item.id === `equipment_${catalogIndex}`) || null;
            })
            .filter((item): item is BagIllustrationCatalogItem => !!item);
    }
    protected getRoleEquipmentCandidates(config: RoleEquipmentSlotConfig): RoleEquipmentRuntimeItem[] {
        const baseItems = this.getRoleEquipmentBaseItems(config);
        if (baseItems.length === 0) return [];
        return Array.from({ length: 50 }, (_, index) => {
            const displayLevel = index + 1;
            const baseTier = HomeConfig.getEquipmentStageTierByLevel(displayLevel);
            const baseItem = baseItems.find((item) => this.getEquipmentBaseTier(item) === baseTier)
                || baseItems[baseTier - 1]
                || baseItems[0];
            return {
                ...baseItem,
                id: `${baseItem.id}_lv${displayLevel}`,
                displayLevel,
                baseTier,
            };
        });
    }
    protected getRoleEquipmentPlaceholder(config: RoleEquipmentSlotConfig): RoleEquipmentRuntimeItem | null {
        return this.getRoleEquipmentCandidates(config)[0] || null;
    }
    protected getRoleEquipmentSlotDisplay(config: RoleEquipmentSlotConfig): { item: RoleEquipmentRuntimeItem | null; equipped: boolean } {
        const equipped = this.getCurrentRoleEquipment(config);
        return {
            item: equipped || this.getRoleEquipmentPlaceholder(config),
            equipped: !!equipped,
        };
    }
    protected getCurrentRoleEquipment(config: RoleEquipmentSlotConfig): RoleEquipmentRuntimeItem | null {
        return this.roleEquippedItems.get(config.id) || null;
    }
    protected isRoleEquipmentItemCurrentlyEquipped(config: RoleEquipmentSlotConfig, item: RoleEquipmentRuntimeItem): boolean {
        return this.roleEquippedItems.get(config.id)?.id === item.id;
    }
    protected applyRoleEquipmentSlotVisualState(slot: Node, icon: Node | null | undefined, levelNode: Node | null | undefined, empty: boolean): void {
        const slotSprite = slot.getComponent(Sprite) || slot.addComponent(Sprite);
        slotSprite.color = empty ? new Color(150, 150, 150, 255) : Color.WHITE;
        if (icon?.isValid) {
            const iconSprite = icon.getComponent(Sprite) || icon.addComponent(Sprite);
            iconSprite.color = empty ? new Color(78, 78, 78, 255) : Color.WHITE;
            const opacity = icon.getComponent(UIOpacity) || icon.addComponent(UIOpacity);
            opacity.opacity = empty ? 165 : 255;
        }
        const levelLabel = levelNode?.getComponent(Label);
        if (levelLabel) {
            levelLabel.color = empty ? new Color(176, 176, 176, 255) : Color.WHITE;
        }
    }
    protected getEquipmentBaseTier(item?: BagIllustrationCatalogItem | null): number {
        const catalogTier = item?.category === 'equipment'
            ? this.getRoleEquipmentTierByCatalogIndex(this.getBagItemIdIndex(item))
            : 0;
        if (catalogTier > 0) return catalogTier;

        const frameMatch = item?.framePath ? /item_frame_lv(\d+)/.exec(item.framePath) : null;
        if (frameMatch) return Math.max(1, Math.min(5, Number(frameMatch[1])));
        const name = this.getCatalogDisplayName(item);
        const tierTextMap: Array<[string, number]> = [
            ['\u4e94\u7ea7', 5],
            ['\u56db\u7ea7', 4],
            ['\u4e09\u7ea7', 3],
            ['\u4e8c\u7ea7', 2],
            ['\u4e00\u7ea7', 1],
        ];
        return tierTextMap.find(([text]) => name.includes(text))?.[1] || 1;
    }
    protected getEquipmentLevel(item?: RoleEquipmentRuntimeItem | BagIllustrationCatalogItem | null): number {
        const displayLevel = (item as RoleEquipmentRuntimeItem | null)?.displayLevel;
        if (displayLevel) return displayLevel;

        const idLevelMatch = item?.category === 'equipment' ? /^equipment_[a-z]+_lv(\d{3})$/.exec(item.id) : null;
        if (idLevelMatch) return Number(idLevelMatch[1]);

        const nameLevelMatch = item?.category === 'equipment' ? /^(\d+)\u7ea7/.exec(this.getCatalogDisplayName(item)) : null;
        if (nameLevelMatch) return Number(nameLevelMatch[1]);

        return this.getEquipmentBaseTier(item);
    }
    protected getEquipmentLevelBySlot(config: RoleEquipmentSlotConfig): number {
        const runtimeLevel = this.roleEquipmentLevels.get(config.id);
        if (runtimeLevel) return runtimeLevel;
        return this.getEquipmentLevel(this.getCurrentRoleEquipment(config));
    }
    protected getRoleEquipmentStatRule(config: RoleEquipmentSlotConfig): RoleEquipmentStatRule {
        const rules: Record<RoleEquipmentSlotId, RoleEquipmentStatRule> = {
            weapon: { type: 'attack', detailLabel: '\u653b\u51fb', statusLabel: '\u653b\u51fb\u503c', materialLabel: '\u91d1\u83b2\u73e0', materialType: 'attack', tableKey: 'weaponAttack', growth: 40 },
            shoes: { type: 'attack', detailLabel: '\u653b\u51fb', statusLabel: '\u653b\u51fb\u503c', materialLabel: '\u91d1\u83b2\u73e0', materialType: 'attack', tableKey: 'shoesAttack', growth: 5 },
            armor: { type: 'defense', detailLabel: '\u9632\u5fa1', statusLabel: '\u9632\u5fa1\u503c', materialLabel: '\u4e39\u51e4\u73e0', materialType: 'defense', tableKey: 'armorDefense', growth: 20 },
            helmet: { type: 'defense', detailLabel: '\u9632\u5fa1', statusLabel: '\u9632\u5fa1\u503c', materialLabel: '\u4e39\u51e4\u73e0', materialType: 'defense', tableKey: 'helmetDefense', growth: 3 },
            leg: { type: 'defense', detailLabel: '\u9632\u5fa1', statusLabel: '\u9632\u5fa1\u503c', materialLabel: '\u4e39\u51e4\u73e0', materialType: 'defense', tableKey: 'legDefense', growth: 2 },
            ring: { type: 'defense', detailLabel: '\u9632\u5fa1', statusLabel: '\u9632\u5fa1\u503c', materialLabel: '\u4e39\u51e4\u73e0', materialType: 'defense', tableKey: 'ringDefense', growth: 5 },
            wrist: { type: 'life', detailLabel: '\u751f\u547d', statusLabel: '\u751f\u547d\u503c', materialLabel: '\u6e05\u98ce\u73e0', materialType: 'life', tableKey: 'wristLife', growth: 400 },
            necklace: { type: 'life', detailLabel: '\u751f\u547d', statusLabel: '\u751f\u547d\u503c', materialLabel: '\u6e05\u98ce\u73e0', materialType: 'life', tableKey: 'necklaceLife', growth: 100 },
        };
        return rules[config.id];
    }
    protected getEquipmentLevelRow(level: number): typeof HomeConfig.ROLE_EQUIPMENT_LEVEL_TABLE[number] {
        const safeLevel = Math.max(1, Math.min(50, Math.floor(level)));
        return HomeConfig.ROLE_EQUIPMENT_LEVEL_TABLE.find((row) => row.level === safeLevel)
            || HomeConfig.ROLE_EQUIPMENT_LEVEL_TABLE[0];
    }
    protected getEquipmentStatValueForLevel(config: RoleEquipmentSlotConfig, level: number): number {
        const rule = this.getRoleEquipmentStatRule(config);
        const row = this.getEquipmentLevelRow(level) as Record<RoleEquipmentTableKey, number>;
        return row[rule.tableKey] ?? Math.max(1, level) * rule.growth;
    }
    protected getEquipmentStatValue(item: RoleEquipmentRuntimeItem | BagIllustrationCatalogItem | null, config: RoleEquipmentSlotConfig): number {
        return this.getEquipmentStatValueForLevel(config, this.getEquipmentLevel(item));
    }
    protected getCurrentEquipmentStatValue(config: RoleEquipmentSlotConfig): number {
        return this.getEquipmentStatValueForLevel(config, this.getEquipmentLevelBySlot(config));
    }
    protected getEquipmentAttrLines(item: RoleEquipmentRuntimeItem | BagIllustrationCatalogItem | null, config: RoleEquipmentSlotConfig): string[] {
        const currentItem = this.getCurrentRoleEquipment(config);
        const level = item && currentItem && item.id === currentItem.id
            ? this.getEquipmentLevelBySlot(config)
            : this.getEquipmentLevel(item);
        const rule = this.getRoleEquipmentStatRule(config);
        return [
            `\u7b49\u7ea7\uff1alv.${level}`,
            `${rule.detailLabel}\uff1a+${this.getEquipmentStatValueForLevel(config, level)}`,
        ];
    }
    protected getRoleStrengthenCost(level: number): number {
        return HomeConfig.ROLE_STRENGTHEN_COST_BASE + Math.max(1, Math.floor(level)) * HomeConfig.ROLE_STRENGTHEN_COST_PER_LEVEL;
    }
    protected getOrCreateRoleEquipChild(parent: Node, name: string, width: number, height: number, x: number, y: number, preserveExistingTransform = false): Node {
        let node = parent.getChildByName(name);
        const created = !node?.isValid;
        if (!node?.isValid) {
            node = this.createNode(name, parent, width, height, x, y);
        }
        node.active = true;
        const transform = node.getComponent(UITransform) || node.addComponent(UITransform);
        if (created || !preserveExistingTransform) {
            node.setPosition(x, y, 0);
            transform.setContentSize(width, height);
        }
        return node;
    }
    protected getOrCreateRoleEquipSkin(parent: Node, name: string, width: number, height: number, x: number, y: number, skinPath: string, preserveExistingTransform = false): Node {
        const node = this.getOrCreateRoleEquipChild(parent, name, width, height, x, y, preserveExistingTransform);
        if (preserveExistingTransform) {
            this.applyUiSkinKeepingEditorSize(node, skinPath, width, height);
        } else {
            this.applyUiSkin(node, skinPath, width, height);
        }
        return node;
    }
    protected getOrCreateRoleEquipLabel(parent: Node, name: string, text: string, fontSize: number, x: number, y: number, width: number, height: number, color: Color, preserveExistingTransform = false): Label {
        const node = this.getOrCreateRoleEquipChild(parent, name, width, height, x, y, preserveExistingTransform);
        const label = node.getComponent(Label) || node.addComponent(Label);
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
    protected drawRoleEquipDim(node: Node): void {
        const graphics = node.getComponent(Graphics) || node.addComponent(Graphics);
        graphics.clear();
        graphics.fillColor = new Color(0, 0, 0, 130);
        graphics.rect(-HomeConfig.VIEW_WIDTH / 2, -HomeConfig.VIEW_HEIGHT / 2, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT);
        graphics.fill();
    }
    protected clearRoleEquipDim(node: Node): void {
        const graphics = node.getComponent(Graphics);
        if (graphics) graphics.clear();
    }
    protected setRoleEquipDetailIconVisible(iconFrame: Node, visible: boolean): void {
        const opacity = iconFrame.getComponent(UIOpacity) || iconFrame.addComponent(UIOpacity);
        iconFrame.active = visible;
        opacity.opacity = visible ? 255 : 0;
        const applyVisible = (node: Node): void => {
            const sprite = node.getComponent(Sprite);
            if (sprite) sprite.enabled = visible;
            const label = node.getComponent(Label);
            if (label) label.enabled = visible;
            node.children.forEach((child) => applyVisible(child));
        };
        applyVisible(iconFrame);
    }
    protected ensureRoleEquipDetailPopup(): Node {
        const parent = this.popupRoot || this.rolePagePanel || this.node;
        let popup = parent.getChildByName('RoleEquipDetailPopup');
        if (!popup?.isValid) {
            popup = this.createNode('RoleEquipDetailPopup', parent, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT, 0, 0);
            popup.active = false;
        } else if (popup.parent !== parent) {
            popup.setParent(parent);
        }
        this.roleEquipDetailPopup = popup;
        (popup.getComponent(UITransform) || popup.addComponent(UITransform)).setContentSize(HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT);
        popup.setPosition(0, 0, 0);
        popup.off(Node.EventType.TOUCH_END);
        popup.on(Node.EventType.TOUCH_END, (event: EventTouch) => {
            event.propagationStopped = true;
            this.closeRoleEquipDetailPopup();
        }, this);
        const opacity = popup.getComponent(UIOpacity) || popup.addComponent(UIOpacity);
        opacity.opacity = 255;

        const dim = popup.getChildByName('RoleEquipDetailDim') || this.createNode('RoleEquipDetailDim', popup, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT, 0, 0);
        dim.setPosition(0, 0, 0);
        (dim.getComponent(UITransform) || dim.addComponent(UITransform)).setContentSize(HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT);
        this.drawRoleEquipDim(dim);
        dim.setSiblingIndex(0);
        dim.off(Node.EventType.TOUCH_END);
        dim.on(Node.EventType.TOUCH_END, (event: EventTouch) => {
            event.propagationStopped = true;
            this.closeRoleEquipDetailPopup();
        }, this);

        const board = this.getOrCreateRoleEquipSkin(popup, 'RoleEquipDetailBoard', HomeConfig.ROLE_EQUIP_DETAIL_WIDTH, HomeConfig.ROLE_EQUIP_DETAIL_HEIGHT, 0, 0, HomeConfig.UI_BAG_ITEM_DETAIL_ATTR_BG, true);
        board.setSiblingIndex(1);
        board.off(Node.EventType.TOUCH_START);
        board.off(Node.EventType.TOUCH_END);
        board.on(Node.EventType.TOUCH_START, (event: EventTouch) => {
            event.propagationStopped = true;
        }, this);
        board.on(Node.EventType.TOUCH_END, (event: EventTouch) => {
            event.propagationStopped = true;
        }, this);

        const titleSkin = this.getOrCreateRoleEquipChild(board, 'RoleEquipDetailTitleSkin', HomeConfig.BAG_ITEM_DETAIL_TITLE_WIDTH, HomeConfig.BAG_ITEM_DETAIL_TITLE_HEIGHT, 0, 182, true);
        titleSkin.active = false;
        titleSkin.setSiblingIndex(1);
        this.getOrCreateRoleEquipLabel(board, 'RoleEquipDetailTitle', '\u88c5\u5907\u8be6\u60c5', 30, 0, 186, 260, 42, new Color(126, 74, 36, 255), true).node.setSiblingIndex(2);
        return popup;
    }
    protected ensureRoleEquipReplacePopup(): Node {
        const parent = this.popupRoot || this.rolePagePanel || this.node;
        let popup = parent.getChildByName('RoleEquipReplacePopup');
        if (!popup?.isValid) {
            popup = this.createNode('RoleEquipReplacePopup', parent, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT, 0, 0);
            popup.active = false;
        } else if (popup.parent !== parent) {
            popup.setParent(parent);
        }
        this.roleEquipReplacePopup = popup;
        popup.setPosition(0, 0, 0);
        (popup.getComponent(UITransform) || popup.addComponent(UITransform)).setContentSize(HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT);
        popup.off(Node.EventType.TOUCH_END);
        popup.on(Node.EventType.TOUCH_END, (event: EventTouch) => {
            event.propagationStopped = true;
            this.closeRoleEquipReplacePopup();
        }, this);
        const opacity = popup.getComponent(UIOpacity) || popup.addComponent(UIOpacity);
        opacity.opacity = 255;

        const dim = popup.getChildByName('RoleEquipReplaceDim') || this.createNode('RoleEquipReplaceDim', popup, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT, 0, 0);
        dim.setPosition(0, 0, 0);
        (dim.getComponent(UITransform) || dim.addComponent(UITransform)).setContentSize(HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT);
        this.clearRoleEquipDim(dim);
        dim.setSiblingIndex(0);
        dim.off(Node.EventType.TOUCH_END);
        dim.on(Node.EventType.TOUCH_END, (event: EventTouch) => {
            event.propagationStopped = true;
            this.closeRoleEquipReplacePopup();
        }, this);

        const board = this.getOrCreateRoleEquipSkin(
            popup,
            'RoleEquipReplaceBoard',
            HomeConfig.ROLE_EQUIP_REPLACE_DRAWER_WIDTH,
            HomeConfig.ROLE_EQUIP_REPLACE_DRAWER_HEIGHT,
            0,
            HomeConfig.ROLE_EQUIP_REPLACE_DRAWER_Y,
            HomeConfig.UI_ROLE_EQUIP_REPLACE_DRAWER_BG,
        );
        board.setSiblingIndex(1);
        board.off(Node.EventType.TOUCH_START);
        board.off(Node.EventType.TOUCH_END);
        board.on(Node.EventType.TOUCH_START, (event: EventTouch) => {
            event.propagationStopped = true;
        }, this);
        board.on(Node.EventType.TOUCH_END, (event: EventTouch) => {
            event.propagationStopped = true;
        }, this);
        return popup;
    }
    protected async slideRoleEquipReplaceDrawer(board: Node, fromY: number, toY: number, duration = 0.18, easing: 'sineOut' | 'sineIn' = 'sineOut'): Promise<void> {
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
    protected async fadeRoleEquipPopup(node: Node, from: number, to: number, duration = 0.18): Promise<void> {
        const opacity = node.getComponent(UIOpacity) || node.addComponent(UIOpacity);
        node.active = true;
        opacity.opacity = from;
        Tween.stopAllByTarget(opacity);
        await new Promise<void>((resolve) => {
            tween(opacity)
                .to(duration, { opacity: to }, { easing: 'sineOut' })
                .call(() => resolve())
                .start();
        });
    }
    protected openRoleEquipmentDetail(config: RoleEquipmentSlotConfig): void {
        this.activeRoleEquipSlot = config;
        this.pendingRoleEquipItem = null;
        const item = this.getCurrentRoleEquipment(config);
        if (!item) {
            this.openRoleEquipmentReplacePopup(config);
            return;
        }
        const popup = this.ensureRoleEquipDetailPopup();
        this.layoutRoleEquipDetailPopup(config, item, 'detail');
        popup.active = true;
        popup.setSiblingIndex((popup.parent?.children.length || 1) - 1);
        void this.fadeRoleEquipPopup(popup, 0, 255, 0.16);
        this.refreshRootLayerOrder();
    }
    protected openRoleEquipmentConfirm(config: RoleEquipmentSlotConfig, item: RoleEquipmentRuntimeItem): void {
        this.activeRoleEquipSlot = config;
        this.pendingRoleEquipItem = item;
        const popup = this.ensureRoleEquipDetailPopup();
        this.layoutRoleEquipDetailPopup(config, item, 'confirm');
        popup.active = true;
        popup.setSiblingIndex((popup.parent?.children.length || 1) - 1);
        void this.fadeRoleEquipPopup(popup, 0, 255, 0.14);
        this.refreshRootLayerOrder();
    }
    protected layoutRoleEquipDetailPopup(config: RoleEquipmentSlotConfig, item: RoleEquipmentRuntimeItem | null, mode: 'detail' | 'confirm'): void {
        const popup = this.roleEquipDetailPopup || this.ensureRoleEquipDetailPopup();
        const board = popup.getChildByName('RoleEquipDetailBoard');
        if (!board?.isValid) return;
        const currentItem = this.getCurrentRoleEquipment(config);
        const displayItem = item || currentItem || this.getRoleEquipmentPlaceholder(config);
        const titleText = mode === 'confirm' ? '\u63d0\u793a\u8bf4\u660e' : '\u88c5\u5907\u8be6\u60c5';
        const title = board.getChildByName('RoleEquipDetailTitle')?.getComponent(Label);
        if (title) {
            title.string = titleText;
            title.color = new Color(126, 74, 36, 255);
            this.setLabelOutline(title, new Color(255, 245, 215, 255), 2);
        }

        const iconFrame = this.getOrCreateRoleEquipSkin(board, 'RoleEquipDetailIconFrame', 116, 116, -210, 56, displayItem?.framePath || HomeConfig.UI_ROLE_EQUIP_FRAME_LV1, true);
        iconFrame.setSiblingIndex(3);
        this.syncEquipmentFrameEffectForItem(iconFrame, 'RoleEquipDetailFrameEffect', displayItem, 116, 116)?.setSiblingIndex(3);
        const icon = this.getOrCreateRoleEquipSkin(iconFrame, 'RoleEquipDetailIcon', 84, 84, 0, 3, displayItem?.iconPath || config.iconPath, true);
        icon.setSiblingIndex(2);
        const displayLevel = mode === 'detail'
            ? (currentItem ? this.getEquipmentLevelBySlot(config) : 1)
            : this.getEquipmentLevel(item);
        const levelLabel = this.getOrCreateRoleEquipLabel(iconFrame, 'RoleEquipDetailLevel', `lv.${displayLevel}`, 18, 28, -38, 58, 24, Color.WHITE, true);
        levelLabel.horizontalAlign = HorizontalTextAlignment.RIGHT;
        this.setLabelOutline(levelLabel, Color.BLACK, 2);
        levelLabel.node.setSiblingIndex(4);
        this.setRoleEquipDetailIconVisible(iconFrame, mode === 'detail');

        const nameLabel = this.getOrCreateRoleEquipLabel(board, 'RoleEquipDetailName', this.getCatalogDisplayName(displayItem) || config.displayName, 28, 86, 104, 360, 42, new Color(92, 55, 28, 255), true);
        nameLabel.horizontalAlign = HorizontalTextAlignment.LEFT;
        this.setLabelOutline(nameLabel, new Color(255, 245, 222, 255), 2);
        nameLabel.node.active = mode === 'detail';
        nameLabel.node.setSiblingIndex(4);

        const messageBg = board.getChildByName('RoleEquipDetailMessageBg');
        if (messageBg?.isValid) {
            messageBg.removeFromParent();
            messageBg.destroy();
        }

        const confirmMessage = this.getOrCreateRoleEquipLabel(
            board,
            'RoleEquipDetailConfirmMessage',
            '',
            24,
            0,
            8,
            500,
            92,
            new Color(111, 70, 42, 255),
            true,
        );
        confirmMessage.horizontalAlign = HorizontalTextAlignment.CENTER;
        confirmMessage.verticalAlign = VerticalTextAlignment.CENTER;
        confirmMessage.enableWrapText = true;
        confirmMessage.node.setSiblingIndex(5);

        const attrLines = this.getEquipmentAttrLines(mode === 'detail' ? displayItem : item, config);
        for (let index = 0; index < 4; index++) {
            const line = attrLines[index] || '';
            const attr = this.getOrCreateRoleEquipLabel(board, `RoleEquipDetailAttr_${index + 1}`, line, 23, 70, 56 - index * 30, 360, 32, new Color(79, 50, 29, 255), true);
            attr.horizontalAlign = HorizontalTextAlignment.LEFT;
            this.setLabelOutline(attr, new Color(255, 245, 222, 255), 1);
            attr.node.active = mode === 'detail' && index < attrLines.length;
            attr.node.setSiblingIndex(5);
        }

        if (mode === 'confirm') {
            const targetName = this.getCatalogDisplayName(item) || config.displayName;
            const currentName = this.getCatalogDisplayName(currentItem) || config.displayName;
            confirmMessage.string = currentItem
                ? `\u662f\u5426\u786e\u5b9a\u5c06\u6b64${targetName}\u88c5\u5907\u66ff\u6362\u5230\u5f53\u524d${currentName}\u88c5\u5907\uff1f`
                : `\u662f\u5426\u786e\u5b9a\u7a7f\u6234\u6b64${targetName}\u88c5\u5907\uff1f`;
            confirmMessage.node.active = true;
        } else {
            confirmMessage.node.active = false;
        }

        const leftButton = this.getOrCreateRoleEquipSkin(board, 'RoleEquipDetailLeftButton', 154, 55, -115, -184, HomeConfig.UI_ROLE_EQUIP_DETAIL_BUTTON_BG, true);
        const rightButton = this.getOrCreateRoleEquipSkin(board, 'RoleEquipDetailRightButton', 154, 55, 115, -184, HomeConfig.UI_ROLE_EQUIP_DETAIL_BUTTON_BG, true);
        leftButton.setSiblingIndex(8);
        rightButton.setSiblingIndex(8);
        const leftLabel = this.getOrCreateRoleEquipLabel(leftButton, 'RoleEquipDetailLeftButtonLabel', mode === 'confirm' ? '\u53d6\u6d88' : '\u66ff\u6362', 27, 0, 2, 130, 40, Color.WHITE, true);
        const rightLabel = this.getOrCreateRoleEquipLabel(rightButton, 'RoleEquipDetailRightButtonLabel', mode === 'confirm' ? '\u786e\u8ba4' : '\u953b\u9020', 27, 0, 2, 130, 40, Color.WHITE, true);
        [leftLabel, rightLabel].forEach((label) => this.setLabelOutline(label, new Color(67, 36, 18, 255), 2));

        if (mode === 'confirm') {
            this.bindScaledClick(leftButton, () => this.closeRoleEquipDetailPopup());
            this.bindScaledClick(rightButton, () => this.confirmRoleEquipmentReplacement());
        } else {
            this.bindScaledClick(leftButton, () => this.transitionRoleEquipDetailToReplace(config));
            this.bindScaledClick(rightButton, () => {
                this.closeRoleEquipDetailPopup();
                this.switchRolePageTab('forge');
            });
        }
    }
    protected transitionRoleEquipDetailToReplace(config: RoleEquipmentSlotConfig): void {
        const detail = this.roleEquipDetailPopup;
        if (!detail?.isValid) {
            this.openRoleEquipmentReplacePopup(config);
            return;
        }
        void this.fadeRoleEquipPopup(detail, 255, 0, 0.16)
            .then(() => {
                detail.active = false;
                this.openRoleEquipmentReplacePopup(config);
            });
    }
    protected openRoleEquipmentReplacePopup(config: RoleEquipmentSlotConfig): void {
        this.activeRoleEquipSlot = config;
        const popup = this.ensureRoleEquipReplacePopup();
        const board = popup.getChildByName('RoleEquipReplaceBoard');
        if (!board?.isValid) return;
        this.layoutRoleEquipReplacePopup(board, config);
        popup.active = true;
        popup.setSiblingIndex((popup.parent?.children.length || 1) - 1);
        const popupOpacity = popup.getComponent(UIOpacity) || popup.addComponent(UIOpacity);
        popupOpacity.opacity = 255;
        void this.slideRoleEquipReplaceDrawer(
            board,
            HomeConfig.ROLE_EQUIP_REPLACE_DRAWER_HIDDEN_Y,
            HomeConfig.ROLE_EQUIP_REPLACE_DRAWER_Y,
            0.22,
            'sineOut',
        );
        this.refreshRootLayerOrder();
    }
    protected layoutRoleEquipReplacePopup(board: Node, config: RoleEquipmentSlotConfig): void {
        const titleText = this.getCurrentRoleEquipment(config)
            ? `\u66ff\u6362${config.displayName}`
            : '\u7a7f\u6234\u88c5\u5907';
        const title = this.getOrCreateRoleEquipLabel(board, 'RoleEquipReplaceTitle', titleText, 32, 0, HomeConfig.ROLE_EQUIP_REPLACE_DRAWER_TITLE_Y, 280, 48, new Color(255, 236, 188, 255));
        this.setLabelOutline(title, new Color(61, 31, 16, 255), 3);
        title.node.setSiblingIndex(2);

        const legacyGrid = board.getChildByName('RoleEquipReplaceGrid');
        if (legacyGrid?.isValid) {
            legacyGrid.active = false;
            legacyGrid.removeFromParent();
            legacyGrid.destroy();
        }

        const viewportHeight = HomeConfig.ROLE_EQUIP_REPLACE_DRAWER_VIEWPORT_HEIGHT;
        let viewport = board.getChildByName('RoleEquipReplaceViewport');
        if (!viewport?.isValid) {
            viewport = this.createNode('RoleEquipReplaceViewport', board, HomeConfig.ROLE_EQUIP_REPLACE_DRAWER_VIEWPORT_WIDTH, viewportHeight, 0, HomeConfig.ROLE_EQUIP_REPLACE_DRAWER_VIEWPORT_Y);
        }
        viewport.active = true;
        viewport.setPosition(0, HomeConfig.ROLE_EQUIP_REPLACE_DRAWER_VIEWPORT_Y, 0);
        (viewport.getComponent(UITransform) || viewport.addComponent(UITransform)).setContentSize(HomeConfig.ROLE_EQUIP_REPLACE_DRAWER_VIEWPORT_WIDTH, viewportHeight);
        const viewportMask = viewport.getComponent(Mask) || viewport.addComponent(Mask);
        viewportMask.type = Mask.Type.GRAPHICS_RECT;
        viewport.setSiblingIndex(3);

        let grid = viewport.getChildByName('RoleEquipReplaceGrid');
        if (!grid?.isValid) {
            grid = this.createNode('RoleEquipReplaceGrid', viewport, HomeConfig.ROLE_EQUIP_REPLACE_DRAWER_VIEWPORT_WIDTH, viewportHeight, 0, 0);
        }
        grid.active = true;
        grid.removeAllChildren();
        grid.setSiblingIndex(0);

        const candidates = this.getRoleEquipmentCandidates(config);
        if (candidates.length === 0) {
            const empty = this.getOrCreateRoleEquipLabel(grid, 'RoleEquipReplaceEmpty', '\u6682\u65e0\u53ef\u66ff\u6362\u88c5\u5907', 28, 0, 80, 420, 60, new Color(255, 236, 188, 255));
            this.setLabelOutline(empty, new Color(61, 31, 16, 255), 2);
            return;
        }
        const rowCount = Math.ceil(candidates.length / HomeConfig.ROLE_EQUIP_REPLACE_DRAWER_GRID_COLS);
        const contentHeight = Math.max(viewportHeight, rowCount * HomeConfig.ROLE_EQUIP_REPLACE_DRAWER_GRID_GAP_Y + 110);
        (grid.getComponent(UITransform) || grid.addComponent(UITransform)).setContentSize(HomeConfig.ROLE_EQUIP_REPLACE_DRAWER_VIEWPORT_WIDTH, contentHeight);
        grid.setPosition(0, 0, 0);

        const startY = viewportHeight / 2 - 78;
        candidates.forEach((item, index) => {
            const col = index % HomeConfig.ROLE_EQUIP_REPLACE_DRAWER_GRID_COLS;
            const row = Math.floor(index / HomeConfig.ROLE_EQUIP_REPLACE_DRAWER_GRID_COLS);
            const x = HomeConfig.ROLE_EQUIP_REPLACE_DRAWER_GRID_START_X + col * HomeConfig.ROLE_EQUIP_REPLACE_DRAWER_GRID_GAP_X;
            const y = startY - row * HomeConfig.ROLE_EQUIP_REPLACE_DRAWER_GRID_GAP_Y;
            this.createRoleEquipReplaceCell(grid, item, config, index, x, y);
        });
        const maxScrollY = Math.max(0, contentHeight - viewportHeight);
        this.bindBagGridScroll(viewport, grid, maxScrollY);
        this.bindBagGridScroll(grid, grid, maxScrollY);
    }
    protected createRoleEquipReplaceCell(parent: Node, item: RoleEquipmentRuntimeItem, config: RoleEquipmentSlotConfig, index: number, x: number, y: number): void {
        const cell = this.createNode(`RoleEquipReplaceItem_${index + 1}`, parent, 128, 138, x, y);
        const frame = this.createSkinnedNode('RoleEquipReplaceItemFrame', cell, 112, 112, 0, 12, item.framePath);
        frame.setSiblingIndex(0);
        this.syncEquipmentFrameEffectForItem(frame, 'RoleEquipReplaceItemFrameEffect', item, 112, 112)?.setSiblingIndex(3);
        this.createSkinnedNode('RoleEquipReplaceItemIcon', frame, 88, 88, 0, 2, item.iconPath).setSiblingIndex(2);
        const level = this.createLabel(frame, 'RoleEquipReplaceItemLevel', `lv.${this.getEquipmentLevel(item)}`, 20, 26, -42, 62, 26, Color.WHITE);
        level.horizontalAlign = HorizontalTextAlignment.RIGHT;
        this.setLabelOutline(level, Color.BLACK, 2);
        level.node.setSiblingIndex(4);
        if (this.isRoleEquipmentItemCurrentlyEquipped(config, item)) {
            this.createSkinnedNode('RoleEquipReplaceItemEquippedBadge', frame, 60, 60, -26, 26, HomeConfig.UI_ROLE_EQUIPPED_BADGE).setSiblingIndex(6);
        }
        const name = this.createLabel(cell, 'RoleEquipReplaceItemName', this.getCatalogDisplayName(item), 18, 0, -60, 126, 30, new Color(255, 238, 198, 255));
        name.overflow = Overflow.SHRINK;
        this.setLabelOutline(name, new Color(43, 25, 15, 255), 2);
        name.node.setSiblingIndex(2);
        this.bindGridItemTap(cell, () => this.openRoleEquipmentConfirm(config, item));
    }
    protected confirmRoleEquipmentReplacement(): void {
        const config = this.activeRoleEquipSlot;
        const item = this.pendingRoleEquipItem;
        if (!config || !item) return;
        const wasEquipped = !!this.getCurrentRoleEquipment(config);
        this.roleEquippedItems.set(config.id, item);
        this.roleEquipmentLevels.set(config.id, this.getEquipmentLevel(item));
        this.syncRoleEquipmentSlot(config);
        if (this.bagCatalogView?.board?.isValid) {
            this.refreshBagCatalogGrid(this.bagCatalogView);
        }
        if (config.id === 'weapon') {
            void this.refreshCurrentRoleSkeletonFromEquipment()
                .catch((err) => console.warn('[MainHomeView] role weapon skel refresh failed', err));
        }
        this.closeRoleEquipDetailPopup(false);
        this.closeRoleEquipReplacePopup(false);
        this.refreshRolePagePower(this.getCurrentRoleAssetConfig(this.profile.gender));
        this.showToast(`${wasEquipped ? '\u5df2\u66ff\u6362' : '\u5df2\u7a7f\u6234'}\uff1a${this.getCatalogDisplayName(item)}`);
    }
    protected syncRoleEquipmentSlot(config: RoleEquipmentSlotConfig): void {
        const display = this.getRoleEquipmentSlotDisplay(config);
        const item = display.item;
        const frame = this.rolePagePanel?.getChildByName('RolePageEquipmentPage')?.getChildByName(config.frameName);
        const slot = frame?.getChildByName(`${config.frameName}_Slot_${config.slotIndex}`);
        if (!slot?.isValid || !item) return;
        this.applyUiSkin(slot, item.framePath, 110, 110);
        this.syncEquipmentFrameEffectForItem(
            slot,
            `${config.frameName}_FrameEffect_${config.slotIndex}`,
            item,
            110,
            110,
        )?.setSiblingIndex(3);
        const icon = slot.getChildByName(`${config.frameName}_Icon_${config.slotIndex}`);
        if (icon?.isValid) {
            this.applyUiSkin(icon, item.iconPath, 82, 82);
            icon.setSiblingIndex(2);
        }
        const levelLabel = slot.getChildByName(`${config.frameName}_Level_${config.slotIndex}`)?.getComponent(Label);
        if (levelLabel) {
            levelLabel.string = `lv.${display.equipped ? this.getEquipmentLevelBySlot(config) : 1}`;
            levelLabel.node.active = display.equipped;
            levelLabel.node.setSiblingIndex(4);
        }
        this.applyRoleEquipmentSlotVisualState(slot, icon, levelLabel?.node, !display.equipped);
    }
    protected closeRoleEquipDetailPopup(fade = true): void {
        const popup = this.roleEquipDetailPopup;
        if (!popup?.isValid || !popup.active) return;
        if (!fade) {
            popup.active = false;
            return;
        }
        void this.fadeRoleEquipPopup(popup, popup.getComponent(UIOpacity)?.opacity ?? 255, 0, 0.12)
            .then(() => {
                popup.active = false;
            });
    }
    protected closeRoleEquipReplacePopup(fade = true): void {
        const popup = this.roleEquipReplacePopup;
        if (!popup?.isValid || !popup.active) return;
        const board = popup.getChildByName('RoleEquipReplaceBoard');
        if (!fade) {
            if (board?.isValid) Tween.stopAllByTarget(board);
            popup.active = false;
            return;
        }
        if (!board?.isValid) {
            popup.active = false;
            return;
        }
        void this.slideRoleEquipReplaceDrawer(
            board,
            board.position.y,
            HomeConfig.ROLE_EQUIP_REPLACE_DRAWER_HIDDEN_Y,
            0.16,
            'sineIn',
        )
            .then(() => {
                popup.active = false;
            });
    }
    protected createRolePageBottomTabs(): void {
        if (!this.rolePagePanel) return;
    
        const editorRoot = this.rolePagePanel.getChildByName('RolePageBottomTabs');
        const root = editorRoot || this.createNode('RolePageBottomTabs', this.rolePagePanel, HomeConfig.VIEW_WIDTH, 110, 0, HomeConfig.ROLE_PAGE_BOTTOM_Y);
        root.active = true;
        if (!editorRoot) {
            root.setPosition(0, HomeConfig.ROLE_PAGE_BOTTOM_Y, 0);
        }
        (root.getComponent(UITransform) || root.addComponent(UITransform)).setContentSize(HomeConfig.VIEW_WIDTH, 110);
    
        this.roleBottomTabButtons.clear();
        this.createRolePageBottomButton(root, 'RoleTabEquipment', 'equipment', HomeConfig.UI_ROLE_TAB_EQUIPMENT, HomeConfig.UI_ROLE_TAB_EQUIPMENT_ACTIVE, -HomeConfig.ROLE_PAGE_BOTTOM_BUTTON_SPACING, () => {
            this.switchRolePageTab('equipment');
        });
        this.createRolePageBottomButton(root, 'RoleTabAdvance', 'advance', HomeConfig.UI_ROLE_TAB_ADVANCE, HomeConfig.UI_ROLE_TAB_ADVANCE_ACTIVE, 0, () => {
            this.switchRolePageTab('advance');
        });
        this.createRolePageBottomButton(root, 'RoleTabForge', 'forge', HomeConfig.UI_ROLE_TAB_FORGE, HomeConfig.UI_ROLE_TAB_FORGE_ACTIVE, HomeConfig.ROLE_PAGE_BOTTOM_BUTTON_SPACING, () => {
            this.switchRolePageTab('forge');
        });
        root.setSiblingIndex(25);
    }
    protected createRolePageBottomButton(parent: Node, name: string, tab: RolePageTab, normalPath: string, activePath: string, x: number, onClick: () => void): Node {
        const editorButton = parent.getChildByName(name);
        const button = editorButton || this.createSkinnedNode(name, parent, HomeConfig.ROLE_PAGE_BOTTOM_BUTTON_WIDTH, HomeConfig.ROLE_PAGE_BOTTOM_BUTTON_HEIGHT, x, HomeConfig.ROLE_PAGE_BOTTOM_BUTTON_Y, normalPath);
        button.active = true;
        if (!editorButton) {
            button.setPosition(x, HomeConfig.ROLE_PAGE_BOTTOM_BUTTON_Y, 0);
        } else {
            this.applyUiSkinKeepingEditorSize(button, normalPath, HomeConfig.ROLE_PAGE_BOTTOM_BUTTON_WIDTH, HomeConfig.ROLE_PAGE_BOTTOM_BUTTON_HEIGHT);
        }
        button.setSiblingIndex((button.parent?.children.length || 1) - 1);
        this.roleBottomTabButtons.set(tab, {
            node: button,
            tab,
            normalPath,
            activePath,
        });
        this.bindScaledClick(button, onClick);
        return button;
    }
}
