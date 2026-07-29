import {
    Color,
    EventTouch,
    HorizontalTextAlignment,
    Label,
    Node,
    UIOpacity,
    UITransform,
    sp,
} from 'cc';
import * as HomeConfig from './HomeConfig';
import { HomeViewBase } from './HomeViewBase';

type RoleEquipmentSlotId = 'weapon' | 'helmet' | 'armor' | 'wrist' | 'leg' | 'shoes' | 'necklace' | 'ring';
type RoleEquipmentStatType = 'attack' | 'life' | 'defense';
type RoleProgressSuccessKind = 'upgrade' | 'breakthrough' | 'strengthen';
type RoleAttributeSet = { attack: number; life: number; defense: number };
type RoleProgressSnapshot = { level: number; attrs: RoleAttributeSet; power: number };

interface RoleEquipmentSlotConfig {
    id: RoleEquipmentSlotId;
    displayName: string;
    iconPath: string;
    keywords: string[];
    frameName: string;
    slotIndex: number;
}

abstract class HomeFeatureRoleStrengthenHost extends HomeViewBase {
    protected abstract roleStrengthenSelectedSlot: RoleEquipmentSlotConfig | null;
    protected abstract readonly roleEquipmentLevels: Map<RoleEquipmentSlotId, number>;
    protected abstract roleProgressSuccessPopup: Node | null;
    protected abstract roleProgressSuccessSkeleton: sp.Skeleton | null;
    protected abstract roleProgressSuccessLoadVersion: number;

    protected abstract setLabelOutline(label: Label, color: Color, width: number): void;
}

/**
 * 装备强化页、强化材料、选择高亮以及升级/突破/强化成功反馈。
 *
 * 装备和库存状态由 RoleBag 初始化器持有，规则由 RoleEquipment/RoleProgression 提供。
 */
export abstract class HomeFeatureRoleStrengthen extends HomeFeatureRoleStrengthenHost {
    protected buildRoleStrengthenPage(): void {
        if (!this.rolePagePanel || this.rolePageStrengthenRoot) return;
    
        this.rolePageStrengthenRoot = this.getOrCreateRolePageNode(this.rolePagePanel, 'RolePageStrengthenPage', HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT, 0, 0).node;
        this.rolePageStrengthenRoot.active = false;
        this.rolePageStrengthenRoot.setSiblingIndex(6);
    
        const firstX = -HomeConfig.ROLE_STRENGTHEN_MATERIAL_SPACING;
        HomeConfig.ROLE_STRENGTHEN_MATERIALS.forEach((material, index) => {
            this.createRoleStrengthenMaterial(firstX + index * HomeConfig.ROLE_STRENGTHEN_MATERIAL_SPACING, material.type, material.icon, this.getRoleInventoryCount(material.itemId));
        });
    
        this.roleStrengthenHintLabel = this.getOrCreateRolePageLabel(this.rolePageStrengthenRoot, 'RoleStrengthenHint', '\u8bf7\u9009\u62e9\u9700\u8981\u5f3a\u5316\u7684\u88c5\u5907', 24, 0, HomeConfig.ROLE_STRENGTHEN_STATUS_Y, 520, 42, Color.BLACK).label;
        this.applyRoleAttrLabelStyle(this.roleStrengthenHintLabel, 2);
    
        this.roleStrengthenStatusRoot = this.getOrCreateRolePageNode(this.rolePageStrengthenRoot, 'RoleStrengthenStatusRoot', 620, 110, 0, HomeConfig.ROLE_STRENGTHEN_STATUS_Y).node;
        this.roleStrengthenStatusRoot.active = false;
        const statLine = this.getOrCreateRolePageLabel(this.roleStrengthenStatusRoot, 'RoleStrengthenStatLine', '\u751f\u547d\u503c 0 -> \u751f\u547d\u503c 0', 24, 0, 28, 560, 36, Color.BLACK).label;
        this.applyRoleAttrLabelStyle(statLine, 2);
        const costLine = this.getOrCreateRolePageLabel(this.roleStrengthenStatusRoot, 'RoleStrengthenCostLine', '\u5f3a\u5316\u9700\u8981\u6750\u6599 0', 24, 0, -24, 560, 36, Color.BLACK).label;
        this.applyRoleAttrLabelStyle(costLine, 2);
    
        this.roleStrengthenButton = this.getOrCreateRolePageSkinnedNode(
            this.rolePageStrengthenRoot,
            'RoleStrengthenButton',
            HomeConfig.ROLE_STRENGTHEN_BUTTON_WIDTH,
            HomeConfig.ROLE_STRENGTHEN_BUTTON_HEIGHT,
            0,
            HomeConfig.ROLE_STRENGTHEN_BUTTON_Y,
            HomeConfig.UI_ROLE_STRENGTHEN_BUTTON,
        ).node;
        this.roleStrengthenButton.active = false;
        this.bindScaledClick(this.roleStrengthenButton, () => {
            this.handleRoleStrengthenClick();
        });
    }
    protected createRoleStrengthenMaterial(x: number, nodeId: RoleEquipmentStatType, iconPath: string, count: number): void {
        if (!this.rolePageStrengthenRoot) return;
    
        const item = this.getOrCreateRolePageNode(this.rolePageStrengthenRoot, `RoleStrengthenMaterial_${nodeId}`, 150, 72, x, HomeConfig.ROLE_STRENGTHEN_MATERIAL_Y).node;
        this.getOrCreateRolePageSkinnedNode(
            item,
            'RoleStrengthenMaterialCountBg',
            HomeConfig.ROLE_STRENGTHEN_MATERIAL_BG_WIDTH,
            HomeConfig.ROLE_STRENGTHEN_MATERIAL_BG_HEIGHT,
            0,
            HomeConfig.ROLE_STRENGTHEN_MATERIAL_BG_Y,
            HomeConfig.UI_ROLE_STRENGTHEN_MATERIAL_BG,
        ).node.setSiblingIndex(0);
        this.getOrCreateRolePageSkinnedNode(
            item,
            'RoleStrengthenMaterialIcon',
            HomeConfig.ROLE_STRENGTHEN_MATERIAL_ICON_SIZE,
            HomeConfig.ROLE_STRENGTHEN_MATERIAL_ICON_SIZE,
            HomeConfig.ROLE_STRENGTHEN_MATERIAL_ICON_X,
            HomeConfig.ROLE_STRENGTHEN_MATERIAL_ICON_Y,
            iconPath,
        ).node.setSiblingIndex(1);
        const countLabel = this.getOrCreateRolePageLabel(
            item,
            'RoleStrengthenMaterialCount',
            `${count}`,
            22,
            HomeConfig.ROLE_STRENGTHEN_MATERIAL_COUNT_X,
            HomeConfig.ROLE_STRENGTHEN_MATERIAL_BG_Y,
            HomeConfig.ROLE_STRENGTHEN_MATERIAL_COUNT_WIDTH,
            HomeConfig.ROLE_STRENGTHEN_MATERIAL_BG_HEIGHT,
            Color.WHITE,
        ).label;
        this.setLabelOutline(countLabel, Color.BLACK, 2);
    }
    protected updateRoleStrengthenStatus(config: RoleEquipmentSlotConfig): void {
        if (!this.roleStrengthenStatusRoot?.isValid) return;
        const level = this.getEquipmentLevelBySlot(config);
        const rule = this.getRoleEquipmentStatRule(config);
        const currentValue = this.getEquipmentStatValueForLevel(config, level);
        const nextValue = this.getEquipmentStatValueForLevel(config, Math.min(50, level + 1));
        const statLine = this.roleStrengthenStatusRoot.getChildByName('RoleStrengthenStatLine')?.getComponent(Label);
        if (statLine) {
            statLine.string = `lv.${level} ${rule.statusLabel} ${currentValue} -> lv.${Math.min(50, level + 1)} ${rule.statusLabel} ${nextValue}`;
        }
        const costLine = this.roleStrengthenStatusRoot.getChildByName('RoleStrengthenCostLine')?.getComponent(Label);
        if (costLine) {
            const material = this.getRoleStrengthenMaterialConfig(rule.materialType);
            const cost = this.getRoleStrengthenCost(level);
            costLine.string = `\u5f3a\u5316\u9700\u8981${rule.materialLabel} ${this.getRoleInventoryCount(material?.itemId || '')}/${cost}`;
        }
    }
    protected getRoleStrengthenMaterialConfig(type: RoleEquipmentStatType): typeof HomeConfig.ROLE_STRENGTHEN_MATERIALS[number] | null {
        return HomeConfig.ROLE_STRENGTHEN_MATERIALS.find((item) => item.type === type) || null;
    }
    protected refreshRoleStrengthenMaterials(): void {
        if (!this.rolePageStrengthenRoot?.isValid) return;
        HomeConfig.ROLE_STRENGTHEN_MATERIALS.forEach((material) => {
            const label = this.rolePageStrengthenRoot
                ?.getChildByName(`RoleStrengthenMaterial_${material.type}`)
                ?.getChildByName('RoleStrengthenMaterialCount')
                ?.getComponent(Label);
            if (label) label.string = `${this.getRoleInventoryCount(material.itemId)}`;
        });
        if (this.roleStrengthenSelectedSlot) {
            this.updateRoleStrengthenStatus(this.roleStrengthenSelectedSlot);
        }
    }
    protected handleRoleStrengthenClick(): void {
        const config = this.roleStrengthenSelectedSlot;
        if (!config) {
            this.showToast('\u8bf7\u5148\u9009\u62e9\u9700\u8981\u5f3a\u5316\u7684\u88c5\u5907');
            return;
        }
        const level = this.getEquipmentLevelBySlot(config);
        if (level >= 50) {
            this.showToast('\u88c5\u5907\u5df2\u6ee1\u7ea7');
            return;
        }
        const rule = this.getRoleEquipmentStatRule(config);
        const material = this.getRoleStrengthenMaterialConfig(rule.materialType);
        const cost = this.getRoleStrengthenCost(level);
        if (!material || this.getRoleInventoryCount(material.itemId) < cost) {
            this.showToast(`${rule.materialLabel}\u4e0d\u8db3`);
            return;
        }

        const before = this.getRoleSnapshot();
        this.consumeRoleInventory(material.itemId, cost);
        this.roleEquipmentLevels.set(config.id, level + 1);
        this.syncRoleEquipmentSlot(config);
        this.updateRoleStrengthenStatus(config);
        this.refreshRoleStrengthenMaterials();
        this.refreshRolePagePower(HomeConfig.ROLE_ASSETS[this.profile.gender]);
        this.openRoleProgressSuccessPopup('strengthen', before, this.getRoleSnapshot(), config.displayName);
    }
    protected ensureRoleProgressSuccessPopup(): Node {
        const parent = this.popupRoot || this.rolePagePanel || this.node;
        let popup = parent.getChildByName('RoleProgressSuccessPopup');
        if (!popup?.isValid) {
            popup = this.createNode('RoleProgressSuccessPopup', parent, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT, 0, 0);
            popup.active = false;
        } else if (popup.parent !== parent) {
            popup.setParent(parent);
        }
        this.roleProgressSuccessPopup = popup;
        popup.setPosition(0, 0, 0);
        (popup.getComponent(UITransform) || popup.addComponent(UITransform)).setContentSize(HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT);
        popup.off(Node.EventType.TOUCH_END);
        popup.on(Node.EventType.TOUCH_END, (event: EventTouch) => {
            event.propagationStopped = true;
            this.closeRoleProgressSuccessPopup();
        }, this);
        const opacity = popup.getComponent(UIOpacity) || popup.addComponent(UIOpacity);
        opacity.opacity = 255;

        const dim = popup.getChildByName('RoleProgressSuccessDim') || this.createNode('RoleProgressSuccessDim', popup, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT, 0, 0);
        dim.setPosition(0, 0, 0);
        (dim.getComponent(UITransform) || dim.addComponent(UITransform)).setContentSize(HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT);
        this.drawRoleEquipDim(dim);
        dim.setSiblingIndex(0);
        dim.off(Node.EventType.TOUCH_END);
        dim.on(Node.EventType.TOUCH_END, (event: EventTouch) => {
            event.propagationStopped = true;
            this.closeRoleProgressSuccessPopup();
        }, this);

        const board = this.getOrCreateRoleEquipSkin(
            popup,
            'RoleProgressSuccessBoard',
            HomeConfig.ROLE_SUCCESS_POPUP_WIDTH,
            HomeConfig.ROLE_SUCCESS_POPUP_HEIGHT,
            0,
            HomeConfig.ROLE_SUCCESS_POPUP_Y,
            HomeConfig.UI_ROLE_SUCCESS_POPUP_BG,
        );
        board.setSiblingIndex(1);
        board.off(Node.EventType.TOUCH_START);
        board.off(Node.EventType.TOUCH_END);
        board.on(Node.EventType.TOUCH_START, (event: EventTouch) => {
            event.propagationStopped = true;
        }, this);
        board.on(Node.EventType.TOUCH_END, (event: EventTouch) => {
            event.propagationStopped = true;
            this.closeRoleProgressSuccessPopup();
        }, this);

        let spineNode = board.getChildByName('RoleProgressSuccessSpine');
        if (!spineNode?.isValid) {
            spineNode = this.createNode(
                'RoleProgressSuccessSpine',
                board,
                HomeConfig.ROLE_SUCCESS_SPINE_WIDTH,
                HomeConfig.ROLE_SUCCESS_SPINE_HEIGHT,
                0,
                HomeConfig.ROLE_SUCCESS_SPINE_Y,
            );
        }
        spineNode.setPosition(0, HomeConfig.ROLE_SUCCESS_SPINE_Y, 0);
        (spineNode.getComponent(UITransform) || spineNode.addComponent(UITransform)).setContentSize(HomeConfig.ROLE_SUCCESS_SPINE_WIDTH, HomeConfig.ROLE_SUCCESS_SPINE_HEIGHT);
        this.roleProgressSuccessSkeleton = spineNode.getComponent(sp.Skeleton) || spineNode.addComponent(sp.Skeleton);
        this.prepareSkeletonRenderer(this.roleProgressSuccessSkeleton);
        spineNode.setScale(HomeConfig.ROLE_SUCCESS_SPINE_SCALE, HomeConfig.ROLE_SUCCESS_SPINE_SCALE, 1);
        spineNode.setSiblingIndex(6);
        return popup;
    }
    protected openRoleProgressSuccessPopup(
        kind: RoleProgressSuccessKind,
        before: RoleProgressSnapshot,
        after: RoleProgressSnapshot,
        equipName = '',
    ): void {
        const popup = this.ensureRoleProgressSuccessPopup();
        const board = popup.getChildByName('RoleProgressSuccessBoard');
        if (!board?.isValid) return;

        this.layoutRoleProgressSuccessPopup(board, kind, before, after, equipName);
        popup.active = true;
        popup.setSiblingIndex((popup.parent?.children.length || 1) - 1);
        this.playRoleProgressSuccessAnimation(kind);
        this.refreshRootLayerOrder();
    }
    protected layoutRoleProgressSuccessPopup(
        board: Node,
        kind: RoleProgressSuccessKind,
        before: RoleProgressSnapshot,
        after: RoleProgressSnapshot,
        equipName: string,
    ): void {
        const levelText = kind === 'strengthen'
            ? `\u5f3a\u5316\u88c5\u5907\uff1a${equipName || '\u88c5\u5907'}`
            : `\u89d2\u8272\u7b49\u7ea7\uff1a${before.level}  \u2192  ${after.level}`;
        const levelLabel = this.getOrCreateRoleEquipLabel(board, 'RoleSuccessLevelLine', levelText, 24, 0, HomeConfig.ROLE_SUCCESS_LEVEL_Y, 420, 34, new Color(255, 241, 205, 255));
        this.setLabelOutline(levelLabel, new Color(79, 42, 20, 255), 2);
        levelLabel.node.setSiblingIndex(3);

        const rows: Array<[string, number, number]> = [
            ['\u751f\u547d', before.attrs.life, after.attrs.life],
            ['\u9632\u5fa1', before.attrs.defense, after.attrs.defense],
            ['\u653b\u51fb', before.attrs.attack, after.attrs.attack],
        ];
        rows.forEach(([name, oldValue, newValue], index) => {
            this.createRoleSuccessStatRow(board, index, name, oldValue, newValue, HomeConfig.ROLE_SUCCESS_STAT_START_Y - index * HomeConfig.ROLE_SUCCESS_STAT_GAP);
        });

        const powerDelta = Math.max(0, after.power - before.power);
        this.layoutRoleSuccessPowerDelta(board, powerDelta);

        const hint = this.getOrCreateRoleEquipLabel(board, 'RoleSuccessCloseHint', '\u70b9\u51fb\u7a7a\u767d\u533a\u57df\u5173\u95ed\u7a97\u53e3', 20, 0, HomeConfig.ROLE_SUCCESS_HINT_Y, 420, 30, new Color(255, 245, 220, 255));
        this.setLabelOutline(hint, new Color(66, 36, 18, 255), 2);
        hint.node.setSiblingIndex(4);
    }
    protected layoutRoleSuccessPowerDelta(board: Node, powerDelta: number): void {
        const legacyLabel = board.getChildByName('RoleSuccessPowerDelta');
        if (legacyLabel?.isValid) legacyLabel.active = false;

        const frame = this.getOrCreateRoleEquipSkin(
            board,
            'RoleSuccessPowerFrame',
            HomeConfig.ROLE_SUCCESS_POWER_FRAME_WIDTH,
            HomeConfig.ROLE_SUCCESS_POWER_FRAME_HEIGHT,
            0,
            HomeConfig.ROLE_SUCCESS_POWER_FRAME_Y,
            HomeConfig.UI_ROLE_POWER_FRAME,
        );
        frame.setSiblingIndex(4);

        const valueRoot = this.getOrCreateRoleEquipChild(
            frame,
            'RoleSuccessPowerValueRoot',
            190,
            HomeConfig.ROLE_SUCCESS_POWER_DIGIT_HEIGHT,
            HomeConfig.ROLE_SUCCESS_POWER_VALUE_OFFSET_X,
            HomeConfig.ROLE_SUCCESS_POWER_VALUE_OFFSET_Y,
        );
        valueRoot.children.slice().forEach((child) => child.destroy());
        valueRoot.setSiblingIndex(2);

        const digits = Math.max(0, Math.floor(powerDelta)).toString().split('');
        const digitWidths = digits.map((digit) => this.getRoleSuccessPowerDigitWidth(digit));
        const digitTotalWidth = digitWidths.reduce((sum, width) => sum + width, 0)
            + Math.max(0, digits.length - 1) * HomeConfig.ROLE_SUCCESS_POWER_DIGIT_SPACING;
        const totalWidth = HomeConfig.ROLE_SUCCESS_POWER_PLUS_WIDTH + 4 + digitTotalWidth;
        let cursorX = -totalWidth / 2;

        this.createSkinnedNode(
            'RoleSuccessPowerPlus',
            valueRoot,
            HomeConfig.ROLE_SUCCESS_POWER_PLUS_WIDTH,
            HomeConfig.ROLE_SUCCESS_POWER_PLUS_HEIGHT,
            cursorX + HomeConfig.ROLE_SUCCESS_POWER_PLUS_WIDTH / 2,
            0,
            HomeConfig.UI_ROLE_SUCCESS_POWER_PLUS,
        ).setSiblingIndex(0);
        cursorX += HomeConfig.ROLE_SUCCESS_POWER_PLUS_WIDTH + 4;

        digits.forEach((digit, index) => {
            const width = digitWidths[index];
            this.createSkinnedNode(
                `RoleSuccessPowerDigit_${index}_${digit}`,
                valueRoot,
                width,
                HomeConfig.ROLE_SUCCESS_POWER_DIGIT_HEIGHT,
                cursorX + width / 2,
                0,
                `${HomeConfig.UI_ROLE_POWER_DIGIT_ROOT}_${digit}`,
            ).setSiblingIndex(index + 1);
            cursorX += width + HomeConfig.ROLE_SUCCESS_POWER_DIGIT_SPACING;
        });
    }
    protected getRoleSuccessPowerDigitWidth(digit: string): number {
        return digit === '1' ? 14 : digit === '2' || digit === '4' ? 21 : digit === '3' || digit === '6' || digit === '7' ? 19 : 20;
    }
    protected createRoleSuccessStatRow(board: Node, index: number, name: string, oldValue: number, newValue: number, y: number): void {
        const nameLabel = this.getOrCreateRoleEquipLabel(board, `RoleSuccessStatName_${index}`, `${name}`, 23, -214, y, 86, 30, new Color(255, 238, 198, 255));
        nameLabel.horizontalAlign = HorizontalTextAlignment.RIGHT;
        this.setLabelOutline(nameLabel, new Color(72, 38, 18, 255), 2);
        nameLabel.node.setSiblingIndex(4);

        const oldLabel = this.getOrCreateRoleEquipLabel(board, `RoleSuccessStatOld_${index}`, `${oldValue}`, 23, -106, y, 108, 30, Color.WHITE);
        oldLabel.horizontalAlign = HorizontalTextAlignment.RIGHT;
        this.setLabelOutline(oldLabel, new Color(40, 28, 18, 255), 2);
        oldLabel.node.setSiblingIndex(4);

        const arrow = this.getOrCreateRoleEquipSkin(board, `RoleSuccessArrow_${index}`, 42, 34, 0, y, HomeConfig.UI_ROLE_SUCCESS_ARROW);
        arrow.setSiblingIndex(4);

        const newLabel = this.getOrCreateRoleEquipLabel(board, `RoleSuccessStatNew_${index}`, `${newValue}`, 23, 104, y, 108, 30, new Color(80, 225, 107, 255));
        newLabel.horizontalAlign = HorizontalTextAlignment.LEFT;
        this.setLabelOutline(newLabel, new Color(20, 56, 24, 255), 2);
        newLabel.node.setSiblingIndex(4);
    }
    protected playRoleProgressSuccessAnimation(kind: RoleProgressSuccessKind): void {
        const skeleton = this.roleProgressSuccessSkeleton;
        if (!skeleton?.isValid) return;

        const loadVersion = ++this.roleProgressSuccessLoadVersion;
        const animation = HomeConfig.ROLE_SUCCESS_ANIMATIONS[kind];
        this.setSkeletonVisible(skeleton, false);
        void this.loadSkeletonAsset(HomeConfig.ROLE_SUCCESS_SKEL_PATH)
            .then((skeletonData) => {
                if (loadVersion !== this.roleProgressSuccessLoadVersion || !this.roleProgressSuccessPopup?.active || !skeleton.isValid) return;
                this.prepareSkeletonRenderer(skeleton);
                skeleton.skeletonData = skeletonData;
                skeleton.node.setScale(HomeConfig.ROLE_SUCCESS_SPINE_SCALE, HomeConfig.ROLE_SUCCESS_SPINE_SCALE, 1);
                skeleton.clearTracks();
                skeleton.setToSetupPose();
                this.setSkeletonVisible(skeleton, true);

                let introDuration = 0.8;
                try {
                    const track = skeleton.setAnimation(0, animation.intro, false);
                    introDuration = this.getTrackAnimationDuration(track) || introDuration;
                    skeleton.updateAnimation(0);
                    skeleton.markForUpdateRenderData(true);
                } catch (err) {
                    console.warn('[MainHomeView] role success intro animation missing', err);
                    this.startRoleProgressSuccessLoop(loadVersion, animation.loop);
                    return;
                }

                const listenerTarget = skeleton as unknown as {
                    setCompleteListener?: (listener: ((entry: unknown) => void) | null) => void;
                };
                let loopStarted = false;
                const startLoop = (): void => {
                    if (loopStarted) return;
                    loopStarted = true;
                    listenerTarget.setCompleteListener?.(null);
                    this.startRoleProgressSuccessLoop(loadVersion, animation.loop);
                };
                listenerTarget.setCompleteListener?.(() => startLoop());
                this.scheduleOnce(startLoop, introDuration + 0.02);
            })
            .catch((err) => {
                console.warn('[MainHomeView] role success spine load failed', err);
            });
    }
    protected startRoleProgressSuccessLoop(loadVersion: number, loopAnimation: string): void {
        const skeleton = this.roleProgressSuccessSkeleton;
        if (loadVersion !== this.roleProgressSuccessLoadVersion || !this.roleProgressSuccessPopup?.active || !skeleton?.isValid || !skeleton.skeletonData) return;
        try {
            skeleton.clearTracks();
            skeleton.setToSetupPose();
            skeleton.setAnimation(0, loopAnimation, true);
            skeleton.updateAnimation(0);
            skeleton.markForUpdateRenderData(true);
        } catch (err) {
            console.warn('[MainHomeView] role success loop animation missing', err);
        }
    }
    protected closeRoleProgressSuccessPopup(fade = true): void {
        const popup = this.roleProgressSuccessPopup;
        if (!popup?.isValid || !popup.active) return;
        this.roleProgressSuccessLoadVersion += 1;
        const listenerTarget = this.roleProgressSuccessSkeleton as unknown as {
            setCompleteListener?: (listener: ((entry: unknown) => void) | null) => void;
        } | null;
        listenerTarget?.setCompleteListener?.(null);
        if (this.roleProgressSuccessSkeleton?.isValid) {
            this.setSkeletonVisible(this.roleProgressSuccessSkeleton, false);
        }
        if (!fade) {
            popup.active = false;
            return;
        }
        void this.fadeRoleEquipPopup(popup, popup.getComponent(UIOpacity)?.opacity ?? 255, 0, 0.12)
            .then(() => {
                popup.active = false;
            });
    }
    protected resetRoleStrengthenSelection(): void {
        this.roleStrengthenSelectedSlot = null;
        this.updateRoleStrengthenSelectionHighlight();
        if (this.roleStrengthenHintLabel?.node?.isValid) {
            this.roleStrengthenHintLabel.node.active = true;
        }
        if (this.roleStrengthenStatusRoot?.isValid) {
            this.roleStrengthenStatusRoot.active = false;
        }
        if (this.roleStrengthenButton?.isValid) {
            this.roleStrengthenButton.active = false;
        }
    }
    protected selectRoleStrengthenEquipment(config: RoleEquipmentSlotConfig): void {
        this.roleStrengthenSelectedSlot = config;
        this.updateRoleStrengthenSelectionHighlight();
        this.updateRoleStrengthenStatus(config);
        if (this.roleStrengthenHintLabel?.node?.isValid) {
            this.roleStrengthenHintLabel.node.active = false;
        }
        if (this.roleStrengthenStatusRoot?.isValid) {
            this.roleStrengthenStatusRoot.active = true;
        }
        if (this.roleStrengthenButton?.isValid) {
            this.roleStrengthenButton.active = true;
        }
        this.showToast('\u5df2\u9009\u62e9\u5f3a\u5316\u88c5\u5907');
    }
    protected updateRoleStrengthenSelectionHighlight(): void {
        this.getRoleEquipmentSlotConfigs().forEach((config) => {
            const frame = this.rolePageEquipmentRoot?.getChildByName(config.frameName);
            const slot = frame?.getChildByName(`${config.frameName}_Slot_${config.slotIndex}`);
            const selectedFrame = slot?.getChildByName('RoleEquipSelectedFrame');
            if (!selectedFrame?.isValid) return;
    
            selectedFrame.active = this.rolePageActiveTab === 'forge' && this.roleStrengthenSelectedSlot?.id === config.id;
            if (selectedFrame.active) {
                this.applyRoleEquipSelectedFrameSkin(selectedFrame);
                selectedFrame.setSiblingIndex((slot?.children.length || 1) - 1);
            }
        });
    }
}
