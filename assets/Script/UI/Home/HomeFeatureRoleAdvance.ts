import {
    Color,
    Graphics,
    HorizontalTextAlignment,
    Label,
    Node,
    Sprite,
    SpriteFrame,
    Tween,
    UITransform,
    tween,
} from 'cc';
import { BAG_ILLUSTRATION_CATALOG } from './BagIllustrationCatalog.generated';
import * as HomeConfig from './HomeConfig';
import { HomeViewBase } from './HomeViewBase';

type RoleProgressSuccessKind = 'upgrade' | 'breakthrough' | 'strengthen';
type RoleAttributeSet = { attack: number; life: number; defense: number };
type RoleProgressSnapshot = { level: number; attrs: RoleAttributeSet; power: number };

abstract class HomeFeatureRoleAdvanceHost extends HomeViewBase {
    protected abstract roleRuntimeLevel: number;
    protected abstract roleRuntimeExp: number;
    protected abstract roleAdvanceExpTweenState: { ratio: number } | null;

    protected abstract openRoleProgressSuccessPopup(
        kind: RoleProgressSuccessKind,
        before: RoleProgressSnapshot,
        after: RoleProgressSnapshot,
        equipName?: string,
    ): void;
}

/**
 * 角色进阶页、经验球、突破材料、经验条动画与实时属性刷新。
 *
 * 等级和库存规则由 RoleProgression 提供，成功反馈由独立强化反馈模块提供。
 */
export abstract class HomeFeatureRoleAdvance extends HomeFeatureRoleAdvanceHost {
    protected buildRoleAdvancePage(): void {
        if (!this.rolePagePanel || this.rolePageAdvanceRoot) return;
    
        this.rolePageAdvanceRoot = this.getOrCreateRolePageNode(this.rolePagePanel, 'RolePageAdvancePage', HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT, 0, 0).node;
        this.rolePageAdvanceRoot.active = false;
        this.rolePageAdvanceRoot.setSiblingIndex(2);
    
        this.getOrCreateRolePageSkinnedNode(
            this.rolePageAdvanceRoot,
            'RoleAdvancePanelBg',
            HomeConfig.ROLE_ADVANCE_PANEL_WIDTH,
            HomeConfig.ROLE_ADVANCE_PANEL_HEIGHT,
            0,
            HomeConfig.ROLE_ADVANCE_PANEL_Y,
            HomeConfig.UI_ROLE_ADVANCE_DETAIL_BG,
        ).node.setSiblingIndex(0);
    
        const powerTip = this.getOrCreateRolePageLabel(this.rolePageAdvanceRoot, 'RoleAdvancePowerTip', '\u5347\u7ea7\u540e\u83b7\u5f97\u6218\u529b\u5c5e\u6027\u63d0\u5347', 24, 0, 386, 520, 42, Color.BLACK).label;
        this.applyRoleAttrLabelStyle(powerTip, 2);
    
        const levelLabel = this.getOrCreateRolePageLabel(this.rolePageAdvanceRoot, 'RoleAdvanceCurrentLevel', `\u5f53\u524d\u7b49\u7ea7: ${HomeConfig.ROLE_PAGE_PLAYER_LEVEL}`, 28, 0, 324, 360, 46, Color.BLACK).label;
        this.applyRoleAttrLabelStyle(levelLabel, 2);
    
        const attrBoard = this.getOrCreateRolePageNode(
            this.rolePageAdvanceRoot,
            'RoleAdvanceAttrBg',
            HomeConfig.ROLE_ADVANCE_ATTR_WIDTH,
            HomeConfig.ROLE_ADVANCE_ATTR_HEIGHT,
            0,
            HomeConfig.ROLE_ADVANCE_ATTR_Y,
        ).node;
        const oldAttrSprite = attrBoard.getComponent(Sprite);
        if (oldAttrSprite) {
            oldAttrSprite.enabled = false;
        }
        attrBoard.setSiblingIndex(1);

        this.getOrCreateRolePageSkinnedNode(
            attrBoard,
            'RoleAdvanceCurrentAttrBg',
            HomeConfig.ROLE_ADVANCE_ATTR_SIDE_WIDTH,
            HomeConfig.ROLE_ADVANCE_ATTR_SIDE_HEIGHT,
            HomeConfig.ROLE_ADVANCE_CURRENT_ATTR_X,
            0,
            HomeConfig.UI_ROLE_ADVANCE_CURRENT_ATTR_BG,
        ).node.setSiblingIndex(0);
        this.getOrCreateRolePageSkinnedNode(
            attrBoard,
            'RoleAdvanceNextAttrBg',
            HomeConfig.ROLE_ADVANCE_ATTR_SIDE_WIDTH,
            HomeConfig.ROLE_ADVANCE_ATTR_SIDE_HEIGHT,
            HomeConfig.ROLE_ADVANCE_NEXT_ATTR_X,
            0,
            HomeConfig.UI_ROLE_ADVANCE_NEXT_ATTR_BG,
        ).node.setSiblingIndex(1);
    
        const currentTitle = this.getOrCreateRolePageLabel(attrBoard, 'RoleAdvanceCurrentAttrTitle', '\u5f53\u524d\u5c5e\u6027', 26, HomeConfig.ROLE_ADVANCE_CURRENT_ATTR_X, 132, 220, 42, Color.BLACK).label;
        this.applyRoleAttrLabelStyle(currentTitle, 2);
        const nextTitle = this.getOrCreateRolePageLabel(attrBoard, 'RoleAdvanceNextAttrTitle', '\u4e0b\u9636\u5c5e\u6027', 26, HomeConfig.ROLE_ADVANCE_NEXT_ATTR_X, 132, 220, 42, Color.BLACK).label;
        this.applyRoleAttrLabelStyle(nextTitle, 2);
    
        this.createRoleAdvanceAttrLine(attrBoard, '\u751f\u547d', '0', HomeConfig.ROLE_ADVANCE_CURRENT_ATTR_X, 60);
        this.createRoleAdvanceAttrLine(attrBoard, '\u9632\u5fa1', '0', HomeConfig.ROLE_ADVANCE_CURRENT_ATTR_X, 10);
        this.createRoleAdvanceAttrLine(attrBoard, '\u653b\u51fb', '0', HomeConfig.ROLE_ADVANCE_CURRENT_ATTR_X, -40);
        this.createRoleAdvanceAttrLine(attrBoard, '\u751f\u547d', '0', HomeConfig.ROLE_ADVANCE_NEXT_ATTR_X, 60);
        this.createRoleAdvanceAttrLine(attrBoard, '\u9632\u5fa1', '0', HomeConfig.ROLE_ADVANCE_NEXT_ATTR_X, 10);
        this.createRoleAdvanceAttrLine(attrBoard, '\u653b\u51fb', '0', HomeConfig.ROLE_ADVANCE_NEXT_ATTR_X, -40);
    
        this.createRoleAdvanceExpBar();
    
        const tip = this.getOrCreateRolePageLabel(this.rolePageAdvanceRoot, 'RoleAdvanceUseTip', '\u70b9\u51fb\u7ecf\u9a8c\u73e0\u4f7f\u7528\u7ecf\u9a8c\u4e39', 23, 0, -314, 520, 40, Color.BLACK).label;
        this.applyRoleAttrLabelStyle(tip, 2);
        this.getOrCreateRolePageNode(
            this.rolePageAdvanceRoot,
            'RoleAdvanceBreakthroughCostRoot',
            560,
            64,
            0,
            HomeConfig.ROLE_ADVANCE_BREAKTHROUGH_COST_Y,
        ).node.active = false;
    
        const firstX = -HomeConfig.ROLE_ADVANCE_ORB_SPACING * 2;
        HomeConfig.ROLE_ADVANCE_EXP_ORBS.forEach((orb, index) => {
            this.createRoleAdvanceExpOrb(index + 1, firstX + index * HomeConfig.ROLE_ADVANCE_ORB_SPACING, orb.icon, orb.frame, orb.count, orb.exp);
        });
        this.createRoleAdvanceBreakthroughOrbs();
        this.refreshRoleAdvancePage();
    }
    protected createRoleAdvanceAttrLine(parent: Node, name: string, value: string, centerX: number, y: number): void {
        const nameLabel = this.getOrCreateRolePageLabel(parent, `${name}_${centerX}_${y}_Name`, `${name}:`, 24, centerX - 52, y, 82, 36, Color.BLACK).label;
        nameLabel.horizontalAlign = HorizontalTextAlignment.RIGHT;
        this.applyRoleAttrLabelStyle(nameLabel, 2);
    
        const valueLabel = this.getOrCreateRolePageLabel(parent, `${name}_${centerX}_${y}_Value`, value, 24, centerX + 50, y, 86, 36, Color.BLACK).label;
        valueLabel.horizontalAlign = HorizontalTextAlignment.LEFT;
        this.applyRoleAttrLabelStyle(valueLabel, 2);
    }
    protected createRoleAdvanceExpBar(): void {
        if (!this.rolePageAdvanceRoot) return;
    
        const barBg = this.getOrCreateRolePageSkinnedNode(
            this.rolePageAdvanceRoot,
            'RoleAdvanceExpBarBg',
            HomeConfig.ROLE_ADVANCE_EXP_BAR_WIDTH,
            HomeConfig.ROLE_ADVANCE_EXP_BAR_HEIGHT,
            0,
            HomeConfig.ROLE_ADVANCE_EXP_Y,
            HomeConfig.UI_ROLE_ADVANCE_EXP_BAR_BG,
        ).node;
        barBg.setPosition(0, HomeConfig.ROLE_ADVANCE_EXP_Y, 0);
        (barBg.getComponent(UITransform) || barBg.addComponent(UITransform)).setContentSize(HomeConfig.ROLE_ADVANCE_EXP_BAR_WIDTH, HomeConfig.ROLE_ADVANCE_EXP_BAR_HEIGHT);
        this.applyUiSkin(barBg, HomeConfig.UI_ROLE_ADVANCE_EXP_BAR_BG, HomeConfig.ROLE_ADVANCE_EXP_BAR_WIDTH, HomeConfig.ROLE_ADVANCE_EXP_BAR_HEIGHT);
        barBg.setSiblingIndex(12);

        const fillInfo = this.getOrCreateRolePageNode(
            this.rolePageAdvanceRoot,
            'RoleAdvanceExpBarFill',
            HomeConfig.ROLE_ADVANCE_EXP_FILL_WIDTH,
            HomeConfig.ROLE_ADVANCE_EXP_BAR_HEIGHT,
            0,
            HomeConfig.ROLE_ADVANCE_EXP_Y,
        );
        this.roleAdvanceExpFill = fillInfo.node;
        this.roleAdvanceExpFill.setPosition(0, HomeConfig.ROLE_ADVANCE_EXP_Y, 0);
        (this.roleAdvanceExpFill.getComponent(UITransform) || this.roleAdvanceExpFill.addComponent(UITransform)).setContentSize(HomeConfig.ROLE_ADVANCE_EXP_FILL_WIDTH, HomeConfig.ROLE_ADVANCE_EXP_BAR_HEIGHT);
        this.roleAdvanceExpFill.getComponent(UITransform)?.setAnchorPoint(0.5, 0.5);
        this.roleAdvanceExpFill.setScale(1, 1, 1);
        this.roleAdvanceExpFill.setSiblingIndex(13);
        this.applyRoleAdvanceExpFillSkin(this.roleAdvanceExpFill);
        this.setRoleAdvanceExpFillRatio(0);
    
        const expLabel = this.getOrCreateRolePageLabel(this.rolePageAdvanceRoot, 'RoleAdvanceExpLabel', 'LV0(0/0)', 22, 0, HomeConfig.ROLE_ADVANCE_EXP_Y, 300, 30, Color.BLACK).label;
        this.applyRoleAttrLabelStyle(expLabel, 2);
        const expTitle = this.getOrCreateRolePageLabel(this.rolePageAdvanceRoot, 'RoleAdvanceExpTitle', '\u7ecf\u9a8c', 20, -342, HomeConfig.ROLE_ADVANCE_EXP_Y, 58, 30, Color.BLACK).label;
        this.applyRoleAttrLabelStyle(expTitle, 2);
        this.syncRoleAdvanceExpBarLayerOrder();
    }
    protected refreshRoleAdvanceBreakthroughCosts(): void {
        if (!this.rolePageAdvanceRoot?.isValid) return;

        const breakthroughLevel = this.getRoleUpcomingBreakthroughLevel();
        const costs = breakthroughLevel > 0 ? this.getRoleBreakthroughCosts(breakthroughLevel) : [];
        const rootInfo = this.getOrCreateRolePageNode(
            this.rolePageAdvanceRoot,
            'RoleAdvanceBreakthroughCostRoot',
            560,
            64,
            0,
            HomeConfig.ROLE_ADVANCE_BREAKTHROUGH_COST_Y,
        );
        const root = rootInfo.node;
        root.setPosition(0, HomeConfig.ROLE_ADVANCE_BREAKTHROUGH_COST_Y, 0);
        (root.getComponent(UITransform) || root.addComponent(UITransform)).setContentSize(560, 64);
        root.children.slice().forEach((child) => child.destroy());
        root.active = costs.length > 0;

        const tip = this.rolePageAdvanceRoot.getChildByName('RoleAdvanceUseTip');
        if (tip?.isValid) {
            tip.setPosition(0, costs.length > 0 ? -342 : -314, 0);
        }
        this.setRolePageLabelText(
            this.rolePageAdvanceRoot,
            'RoleAdvanceUseTip',
            costs.length > 0 ? `\u7a81\u7834\u5230${breakthroughLevel}\u7ea7\u9700\u8981\u4ee5\u4e0b\u7a81\u7834\u73e0` : '\u70b9\u51fb\u7ecf\u9a8c\u73e0\u4f7f\u7528\u7ecf\u9a8c\u4e39',
        );
        if (costs.length <= 0) return;

        root.setSiblingIndex(15);
        const title = this.createLabel(
            root,
            'RoleAdvanceBreakthroughCostTitle',
            '\u7a81\u7834\u9700\u6c42',
            20,
            HomeConfig.ROLE_ADVANCE_BREAKTHROUGH_COST_TITLE_X,
            5,
            96,
            30,
            Color.BLACK,
        );
        this.applyRoleAttrLabelStyle(title, 2);

        const firstX = -((costs.length - 1) * HomeConfig.ROLE_ADVANCE_BREAKTHROUGH_COST_SPACING) / 2 - 20;
        costs.forEach((cost, index) => {
            const catalogItem = BAG_ILLUSTRATION_CATALOG.find((item) => item.id === cost.itemId);
            const x = firstX + index * HomeConfig.ROLE_ADVANCE_BREAKTHROUGH_COST_SPACING;
            const frame = this.createSkinnedNode(
                `RoleAdvanceBreakthroughFrame_${cost.id}`,
                root,
                HomeConfig.ROLE_ADVANCE_BREAKTHROUGH_COST_ITEM_SIZE,
                HomeConfig.ROLE_ADVANCE_BREAKTHROUGH_COST_ITEM_SIZE,
                x,
                10,
                catalogItem?.framePath || HomeConfig.UI_ROLE_ADVANCE_EXP_ORB_FRAME_ROOT + '1',
            );
            frame.setSiblingIndex(1);
            if (catalogItem) {
                this.createSkinnedNode(
                    `RoleAdvanceBreakthroughIcon_${cost.id}`,
                    frame,
                    HomeConfig.ROLE_ADVANCE_BREAKTHROUGH_COST_ICON_SIZE,
                    HomeConfig.ROLE_ADVANCE_BREAKTHROUGH_COST_ICON_SIZE,
                    0,
                    1,
                    catalogItem.iconPath,
                ).setSiblingIndex(1);
            }

            const enough = this.getRoleInventoryCount(cost.itemId) >= cost.amount;
            const countLabel = this.createLabel(
                root,
                `RoleAdvanceBreakthroughCount_${cost.id}`,
                `${this.getRoleInventoryCount(cost.itemId)}/${cost.amount}`,
                18,
                x + 42,
                10,
                88,
                28,
                enough ? new Color(42, 120, 42, 255) : new Color(180, 45, 38, 255),
            );
            countLabel.horizontalAlign = HorizontalTextAlignment.LEFT;
            this.applyRoleAttrLabelStyle(countLabel, 2);
            countLabel.node.setSiblingIndex(2);
        });
    }
    protected createRoleAdvanceExpOrb(index: number, x: number, iconPath: string, framePath: string, count: number, exp: number): void {
        if (!this.rolePageAdvanceRoot) return;
    
        const slot = this.getOrCreateRolePageSkinnedNode(this.rolePageAdvanceRoot, `RoleAdvanceExpOrbSlot_${index}`, HomeConfig.ROLE_ADVANCE_ORB_SLOT_SIZE, HomeConfig.ROLE_ADVANCE_ORB_SLOT_SIZE, x, HomeConfig.ROLE_ADVANCE_ORB_Y, framePath).node;
        const icon = this.getOrCreateRolePageSkinnedNode(slot, `RoleAdvanceExpOrbIcon_${index}`, HomeConfig.ROLE_ADVANCE_ORB_SIZE, HomeConfig.ROLE_ADVANCE_ORB_SIZE, 0, 8, iconPath).node;
        icon.setSiblingIndex(1);
    
        const countLabel = this.getOrCreateRolePageLabel(slot, `RoleAdvanceExpOrbCount_${index}`, `\u00d7${count}`, 20, 28, -30, 64, 28, Color.BLACK).label;
        countLabel.horizontalAlign = HorizontalTextAlignment.RIGHT;
        this.applyRoleAttrLabelStyle(countLabel, 2);
    
        const expLabel = this.getOrCreateRolePageLabel(this.rolePageAdvanceRoot, `RoleAdvanceExpOrbValue_${index}`, `${exp}\u7ecf\u9a8c\u503c`, 20, x, HomeConfig.ROLE_ADVANCE_ORB_Y - 68, 120, 30, Color.BLACK).label;
        this.applyRoleAttrLabelStyle(expLabel, 2);
    
        this.bindScaledClick(slot, () => {
            this.handleRoleAdvanceExpOrbClick(index);
        });
    }
    protected createRoleAdvanceBreakthroughOrbs(): void {
        if (!this.rolePageAdvanceRoot) return;

        const firstX = -HomeConfig.ROLE_ADVANCE_ORB_SPACING * 1.5;
        HomeConfig.ROLE_BREAKTHROUGH_MATERIALS.forEach((material, index) => {
            const catalogItem = BAG_ILLUSTRATION_CATALOG.find((item) => item.id === material.itemId);
            const x = firstX + index * HomeConfig.ROLE_ADVANCE_ORB_SPACING;
            const slot = this.getOrCreateRolePageSkinnedNode(
                this.rolePageAdvanceRoot!,
                `RoleAdvanceBreakthroughOrbSlot_${material.id}`,
                HomeConfig.ROLE_ADVANCE_ORB_SLOT_SIZE,
                HomeConfig.ROLE_ADVANCE_ORB_SLOT_SIZE,
                x,
                HomeConfig.ROLE_ADVANCE_ORB_Y,
                catalogItem?.framePath || `${HomeConfig.UI_ROLE_ADVANCE_EXP_ORB_FRAME_ROOT}1`,
            ).node;
            slot.setPosition(x, HomeConfig.ROLE_ADVANCE_ORB_Y, 0);
            slot.active = false;

            const icon = this.getOrCreateRolePageSkinnedNode(
                slot,
                `RoleAdvanceBreakthroughOrbIcon_${material.id}`,
                HomeConfig.ROLE_ADVANCE_ORB_SIZE,
                HomeConfig.ROLE_ADVANCE_ORB_SIZE,
                0,
                8,
                catalogItem?.iconPath || '',
            ).node;
            icon.setSiblingIndex(1);

            const countLabel = this.getOrCreateRolePageLabel(slot, `RoleAdvanceBreakthroughOrbCount_${material.id}`, '0/0', 20, 20, -30, 86, 28, Color.BLACK).label;
            countLabel.horizontalAlign = HorizontalTextAlignment.RIGHT;
            this.applyRoleAttrLabelStyle(countLabel, 2);

            const nameLabel = this.getOrCreateRolePageLabel(
                this.rolePageAdvanceRoot!,
                `RoleAdvanceBreakthroughOrbName_${material.id}`,
                material.name,
                20,
                x,
                HomeConfig.ROLE_ADVANCE_ORB_Y - 68,
                120,
                30,
                Color.BLACK,
            ).label;
            this.applyRoleAttrLabelStyle(nameLabel, 2);

            this.bindScaledClick(slot, () => this.handleRoleBreakthroughClick());
        });
    }
    protected refreshRoleAdvanceMaterialSlots(): void {
        if (!this.rolePageAdvanceRoot?.isValid) return;

        const pendingLevel = this.getRolePendingBreakthroughLevel();
        const pending = pendingLevel > 0;
        const costMap = new Map(this.getRoleBreakthroughDisplayCosts(pendingLevel).map((item) => [item.id, item]));

        const oldCostRoot = this.rolePageAdvanceRoot.getChildByName('RoleAdvanceBreakthroughCostRoot');
        if (oldCostRoot?.isValid) oldCostRoot.active = false;

        HomeConfig.ROLE_ADVANCE_EXP_ORBS.forEach((orb, index) => {
            const slot = this.rolePageAdvanceRoot!.getChildByName(`RoleAdvanceExpOrbSlot_${index + 1}`);
            if (slot?.isValid) slot.active = !pending;

            const nameLabel = this.rolePageAdvanceRoot!.getChildByName(`RoleAdvanceExpOrbValue_${index + 1}`);
            if (nameLabel?.isValid) nameLabel.active = !pending;

            const countLabel = this.findNode(`RoleAdvanceExpOrbCount_${index + 1}`, this.rolePageAdvanceRoot!)?.getComponent(Label);
            if (countLabel) countLabel.string = `\u00d7${this.getRoleInventoryCount(orb.itemId)}`;
        });

        HomeConfig.ROLE_BREAKTHROUGH_MATERIALS.forEach((material) => {
            const slot = this.rolePageAdvanceRoot!.getChildByName(`RoleAdvanceBreakthroughOrbSlot_${material.id}`);
            const nameLabel = this.rolePageAdvanceRoot!.getChildByName(`RoleAdvanceBreakthroughOrbName_${material.id}`);
            const cost = costMap.get(material.id);
            const amount = cost?.amount || 0;
            const have = this.getRoleInventoryCount(material.itemId);
            const enough = have >= amount;

            if (slot?.isValid) {
                slot.active = pending;
                slot.setSiblingIndex(16);
            }
            if (nameLabel?.isValid) {
                nameLabel.active = pending;
                nameLabel.setSiblingIndex(16);
            }
            const countLabel = slot?.getChildByName(`RoleAdvanceBreakthroughOrbCount_${material.id}`)?.getComponent(Label);
            if (countLabel) {
                countLabel.string = amount > 0 ? `${have}/${amount}` : '0';
                countLabel.color = enough ? Color.BLACK : new Color(180, 45, 38, 255);
            }
        });

        const tipText = pending
            ? `\u7ecf\u9a8c\u5df2\u6ee1\uff0c\u70b9\u51fb\u7a81\u7834\u73e0\u7a81\u7834\u5230${pendingLevel}\u7ea7`
            : '\u70b9\u51fb\u7ecf\u9a8c\u73e0\u4f7f\u7528\u7ecf\u9a8c\u4e39';
        this.setRolePageLabelText(this.rolePageAdvanceRoot, 'RoleAdvanceUseTip', tipText);
        const tip = this.rolePageAdvanceRoot.getChildByName('RoleAdvanceUseTip');
        if (tip?.isValid) tip.setPosition(0, -314, 0);
    }
    protected applyRoleAdvanceExpFillSkin(node: Node): void {
        const applyVersion = ++this.skinApplyVersion;
        this.skinApplyVersions.set(node, applyVersion);
        const pendingSprite = node.getComponent(Sprite);
        if (pendingSprite && !pendingSprite.spriteFrame) {
            pendingSprite.enabled = false;
        }

        const apply = (): Promise<void> => this.loadSpriteFrameAsset(HomeConfig.UI_ROLE_ADVANCE_EXP_BAR_FILL)
            .then((spriteFrame) => {
                if (!node.isValid) return;
                if (this.skinApplyVersions.get(node) !== applyVersion) return;

                const graphics = node.getComponent(Graphics);
                if (graphics) {
                    graphics.destroy();
                }

                const transform = node.getComponent(UITransform) || node.addComponent(UITransform);
                transform.setContentSize(HomeConfig.ROLE_ADVANCE_EXP_FILL_WIDTH, HomeConfig.ROLE_ADVANCE_EXP_BAR_HEIGHT);
                transform.setAnchorPoint(0.5, 0.5);

                const sprite = node.getComponent(Sprite) || node.addComponent(Sprite);
                sprite.spriteFrame = spriteFrame;
                sprite.sizeMode = Sprite.SizeMode.CUSTOM;
                sprite.type = Sprite.Type.FILLED;
                sprite.fillType = Sprite.FillType.HORIZONTAL;
                sprite.fillStart = 0;
                sprite.fillRange = this.getRoleExpProgressRatio();
                sprite.enabled = true;
                this.syncRoleAdvanceExpBarLayerOrder();
            });

        if (this.resBundle) {
            void apply().catch((err) => {
                console.warn('[MainHomeView] role advance exp fill load failed', err);
            });
            return;
        }

        void this.acquireHomeSharedBundle()
            .then((bundle) => {
                return apply();
            })
            .catch((err) => {
                console.warn('[MainHomeView] role advance exp fill load failed', err);
            });
    }
    protected handleRoleBreakthroughClick(): void {
        const targetLevel = this.getRolePendingBreakthroughLevel();
        if (targetLevel <= 0) {
            this.showToast('\u7ecf\u9a8c\u672a\u6ee1\uff0c\u8bf7\u5148\u4f7f\u7528\u7ecf\u9a8c\u73e0');
            return;
        }

        const costs = this.getRoleBreakthroughCosts(targetLevel);
        const missing = this.getRoleBreakthroughMissingText(costs);
        if (missing.length > 0) {
            this.showToast(`\u7a81\u7834\u5230${targetLevel}\u7ea7\u6750\u6599\u4e0d\u8db3 ${missing}`);
            return;
        }

        const before = this.getRoleSnapshot();
        this.consumeRoleBreakthrough(targetLevel);
        this.roleRuntimeLevel = targetLevel;
        this.roleRuntimeExp = 0;

        this.refreshRoleInventoryViews(false);
        this.playRoleAdvanceExpEffect(1, true);
        this.refreshRolePagePower(this.getCurrentRoleAssetConfig(this.profile.gender));
        this.openRoleProgressSuccessPopup('breakthrough', before, this.getRoleSnapshot());
    }
    protected handleRoleAdvanceExpOrbClick(index: number): void {
        const orb = HomeConfig.ROLE_ADVANCE_EXP_ORBS[index - 1];
        if (!orb) return;
        if (this.roleRuntimeLevel >= 50) {
            this.showToast('\u89d2\u8272\u5df2\u6ee1\u7ea7');
            return;
        }
        if (this.isRoleBreakthroughPending()) {
            this.showToast('\u7ecf\u9a8c\u5df2\u6ee1\uff0c\u8bf7\u5148\u4f7f\u7528\u7a81\u7834\u73e0\u7a81\u7834');
            return;
        }
        if (!this.consumeRoleInventory(orb.itemId, 1)) {
            this.showToast(`${orb.exp}\u7ecf\u9a8c\u73e0\u6570\u91cf\u4e0d\u8db3`);
            return;
        }

        const beforeExpRatio = this.getRoleExpProgressRatio();
        const before = this.getRoleSnapshot();
        this.roleRuntimeExp += orb.exp;
        let successKind: RoleProgressSuccessKind | null = null;
        let leveled = false;

        while (this.roleRuntimeLevel < 50) {
            const targetLevel = this.roleRuntimeLevel + 1;
            const needExp = this.getRoleLevelExpConfig(targetLevel)?.needExp || 0;
            if (needExp <= 0 || this.roleRuntimeExp < needExp) break;

            const breakthrough = this.getRoleBreakthroughConfig(targetLevel);
            if (breakthrough) {
                this.roleRuntimeExp = needExp;
                break;
            }

            this.roleRuntimeExp -= needExp;
            this.roleRuntimeLevel = targetLevel;
            leveled = true;
            successKind = 'upgrade';
        }

        this.refreshRoleInventoryViews(false);
        this.playRoleAdvanceExpEffect(beforeExpRatio, leveled);
        this.refreshRolePagePower(this.getCurrentRoleAssetConfig(this.profile.gender));
        if (leveled && successKind) {
            this.openRoleProgressSuccessPopup(successKind, before, this.getRoleSnapshot());
        } else if (this.isRoleBreakthroughPending()) {
            this.showToast('\u7ecf\u9a8c\u5df2\u6ee1\uff0c\u8bf7\u4f7f\u7528\u7a81\u7834\u73e0\u7a81\u7834');
        } else {
            this.showToast(`\u4f7f\u7528\u7ecf\u9a8c\u73e0 +${orb.exp}`);
        }
    }
    protected playRoleAdvanceExpEffect(fromRatio = this.getRoleExpProgressRatio(), passedLevel = false): void {
        if (!this.roleAdvanceExpFill?.isValid) return;

        if (this.roleAdvanceExpTweenState) {
            Tween.stopAllByTarget(this.roleAdvanceExpTweenState);
        }

        const targetRatio = this.getRoleExpProgressRatio();
        const state = { ratio: this.clampRoleAdvanceExpRatio(fromRatio) };
        this.roleAdvanceExpTweenState = state;
        this.setRoleAdvanceExpFillRatio(state.ratio);

        const updateFill = (): void => this.setRoleAdvanceExpFillRatio(state.ratio);
        const animation = tween(state);
        if (passedLevel) {
            animation
                .to(HomeConfig.ROLE_ADVANCE_EXP_EFFECT_DURATION, { ratio: 1 }, { easing: 'sineOut', onUpdate: updateFill })
                .call(() => {
                    state.ratio = 0;
                    this.setRoleAdvanceExpFillRatio(0);
                })
                .to(HomeConfig.ROLE_ADVANCE_EXP_EFFECT_DURATION * 0.7, { ratio: targetRatio }, { easing: 'sineOut', onUpdate: updateFill })
                .call(() => {
                    this.setRoleAdvanceExpFillRatio(targetRatio);
                    if (this.roleAdvanceExpTweenState === state) this.roleAdvanceExpTweenState = null;
                })
                .start();
            return;
        }

        animation
            .to(HomeConfig.ROLE_ADVANCE_EXP_EFFECT_DURATION, { ratio: targetRatio }, { easing: 'sineOut', onUpdate: updateFill })
            .call(() => {
                this.setRoleAdvanceExpFillRatio(targetRatio);
                if (this.roleAdvanceExpTweenState === state) this.roleAdvanceExpTweenState = null;
            })
            .start();
    }
    protected setRoleAdvanceExpFillRatio(ratio: number): void {
        if (!this.roleAdvanceExpFill?.isValid) return;

        const normalized = this.clampRoleAdvanceExpRatio(ratio);
        const transform = this.roleAdvanceExpFill.getComponent(UITransform) || this.roleAdvanceExpFill.addComponent(UITransform);
        transform.setContentSize(HomeConfig.ROLE_ADVANCE_EXP_FILL_WIDTH, HomeConfig.ROLE_ADVANCE_EXP_BAR_HEIGHT);
        transform.setAnchorPoint(0.5, 0.5);
        this.roleAdvanceExpFill.setPosition(0, HomeConfig.ROLE_ADVANCE_EXP_Y, 0);
        this.roleAdvanceExpFill.setScale(1, 1, 1);
        this.roleAdvanceExpFill.setSiblingIndex(13);
        this.roleAdvanceExpFill.active = true;

        const sprite = this.roleAdvanceExpFill.getComponent(Sprite) || this.roleAdvanceExpFill.addComponent(Sprite);
        sprite.sizeMode = Sprite.SizeMode.CUSTOM;
        sprite.type = Sprite.Type.FILLED;
        sprite.fillType = Sprite.FillType.HORIZONTAL;
        sprite.fillStart = 0;
        sprite.fillRange = normalized;
        this.syncRoleAdvanceExpBarLayerOrder();
    }
    protected syncRoleAdvanceExpBarLayerOrder(): void {
        const root = this.rolePageAdvanceRoot;
        if (!root?.isValid) return;

        const bg = root.getChildByName('RoleAdvanceExpBarBg');
        const fill = root.getChildByName('RoleAdvanceExpBarFill');
        const label = root.getChildByName('RoleAdvanceExpLabel');
        const title = root.getChildByName('RoleAdvanceExpTitle');
        if (bg?.isValid) bg.setSiblingIndex(Math.max(0, (root.children.length || 1) - 4));
        if (fill?.isValid) fill.setSiblingIndex(Math.max(0, (root.children.length || 1) - 3));
        if (title?.isValid) title.setSiblingIndex(Math.max(0, (root.children.length || 1) - 2));
        if (label?.isValid) label.setSiblingIndex(Math.max(0, (root.children.length || 1) - 1));
    }
    protected clampRoleAdvanceExpRatio(ratio: number): number {
        return Math.max(0, Math.min(1, Number.isFinite(ratio) ? ratio : 0));
    }
    protected refreshRoleAdvancePage(syncFill = true): void {
        if (!this.rolePageAdvanceRoot?.isValid) return;

        this.setRolePageLabelText(this.rolePageAdvanceRoot, 'RoleAdvanceCurrentLevel', `\u5f53\u524d\u7b49\u7ea7: ${this.roleRuntimeLevel}`);
        const currentAttrs = this.getRoleLevelAttrs(this.roleRuntimeLevel);
        const nextAttrs = this.getRoleLevelAttrs(this.getRoleNextLevel());
        this.setRoleAdvanceAttrValue('\u751f\u547d', HomeConfig.ROLE_ADVANCE_CURRENT_ATTR_X, 60, currentAttrs.life);
        this.setRoleAdvanceAttrValue('\u9632\u5fa1', HomeConfig.ROLE_ADVANCE_CURRENT_ATTR_X, 10, currentAttrs.defense);
        this.setRoleAdvanceAttrValue('\u653b\u51fb', HomeConfig.ROLE_ADVANCE_CURRENT_ATTR_X, -40, currentAttrs.attack);
        this.setRoleAdvanceAttrValue('\u751f\u547d', HomeConfig.ROLE_ADVANCE_NEXT_ATTR_X, 60, nextAttrs.life);
        this.setRoleAdvanceAttrValue('\u9632\u5fa1', HomeConfig.ROLE_ADVANCE_NEXT_ATTR_X, 10, nextAttrs.defense);
        this.setRoleAdvanceAttrValue('\u653b\u51fb', HomeConfig.ROLE_ADVANCE_NEXT_ATTR_X, -40, nextAttrs.attack);

        const needExp = this.getRoleNextLevelNeedExp();
        this.setRolePageLabelText(
            this.rolePageAdvanceRoot,
            'RoleAdvanceExpLabel',
            needExp > 0 ? `LV${this.roleRuntimeLevel}(${this.roleRuntimeExp}/${needExp})` : `LV${this.roleRuntimeLevel}(\u6ee1\u7ea7)`,
        );
        if (syncFill && this.roleAdvanceExpFill?.isValid) {
            this.setRoleAdvanceExpFillRatio(this.getRoleExpProgressRatio());
        }
        this.refreshRoleAdvanceMaterialSlots();
    }
    protected setRoleAdvanceAttrValue(name: string, centerX: number, y: number, value: number): void {
        const label = this.rolePageAdvanceRoot
            ?.getChildByName('RoleAdvanceAttrBg')
            ?.getChildByName(`${name}_${centerX}_${y}_Value`)
            ?.getComponent(Label);
        if (label) label.string = `${value}`;
    }
    protected setRolePageLabelText(root: Node, nodeName: string, text: string): void {
        const label = root.getChildByName(nodeName)?.getComponent(Label);
        if (label) label.string = text;
    }
}
