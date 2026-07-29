import {
    BAG_ILLUSTRATION_CATALOG,
    type BagIllustrationCatalogItem,
} from './BagIllustrationCatalog.generated';
import * as HomeConfig from './HomeConfig';
import { HomeViewBase } from './HomeViewBase';

interface RoleAttributeSet {
    attack: number;
    life: number;
    defense: number;
}

interface RoleProgressSnapshot {
    level: number;
    attrs: RoleAttributeSet;
    power: number;
}

type RoleBreakthroughMaterialId = typeof HomeConfig.ROLE_BREAKTHROUGH_MATERIALS[number]['id'];

abstract class HomeFeatureRoleProgressionHost extends HomeViewBase {
    protected abstract roleRuntimeLevel: number;
    protected abstract roleRuntimeExp: number;
    protected abstract readonly roleInventoryCounts: Map<string, number>;
}

/**
 * 角色等级、属性、战力、背包计数与突破消耗规则。
 *
 * 本模块集中纯规则和轻量状态读写，页面构建与动画由独立 UI Feature 负责。
 */
export abstract class HomeFeatureRoleProgression extends HomeFeatureRoleProgressionHost {
    protected getRoleCurrentLevel(): number {
        return this.roleRuntimeLevel;
    }
    protected getRoleLevelExpConfig(targetLevel: number): typeof HomeConfig.ROLE_LEVEL_EXP_TABLE[number] | null {
        return HomeConfig.ROLE_LEVEL_EXP_TABLE.find((row) => row.level === targetLevel) || null;
    }
    protected getRoleNextLevel(): number {
        return Math.min(50, this.roleRuntimeLevel + 1);
    }
    protected getRoleNextLevelNeedExp(): number {
        return this.getRoleLevelExpConfig(this.getRoleNextLevel())?.needExp || 0;
    }
    protected getRoleExpProgressRatio(): number {
        const needExp = this.getRoleNextLevelNeedExp();
        return needExp > 0 ? this.clamp(this.roleRuntimeExp / needExp, 0, 1) : 1;
    }
    protected getRoleLevelAttrs(level: number): RoleAttributeSet {
        const safeLevel = Math.max(1, Math.min(50, Math.floor(level)));
        return {
            attack: safeLevel * HomeConfig.ROLE_BASE_ATTACK_PER_LEVEL,
            life: safeLevel * HomeConfig.ROLE_BASE_LIFE_PER_LEVEL,
            defense: safeLevel * HomeConfig.ROLE_BASE_DEFENSE_PER_LEVEL,
        };
    }
    protected addRoleAttrs(base: RoleAttributeSet, add: RoleAttributeSet): RoleAttributeSet {
        return {
            attack: base.attack + add.attack,
            life: base.life + add.life,
            defense: base.defense + add.defense,
        };
    }
    protected getRoleEquipmentAttrs(): RoleAttributeSet {
        return this.getRoleEquipmentSlotConfigs().reduce<RoleAttributeSet>((attrs, config) => {
            const rule = this.getRoleEquipmentStatRule(config);
            const value = this.getCurrentEquipmentStatValue(config);
            attrs[rule.type] += value;
            return attrs;
        }, { attack: 0, life: 0, defense: 0 });
    }
    protected getRoleTotalAttrs(level = this.roleRuntimeLevel): RoleAttributeSet {
        return this.addRoleAttrs(this.getRoleLevelAttrs(level), this.getRoleEquipmentAttrs());
    }
    protected getRolePowerFromAttrs(attrs: RoleAttributeSet): number {
        return Math.floor(
            attrs.attack * HomeConfig.ROLE_POWER_ATTACK_RATE
            + attrs.life * HomeConfig.ROLE_POWER_LIFE_RATE
            + attrs.defense * HomeConfig.ROLE_POWER_DEFENSE_RATE,
        );
    }
    protected getRoleTotalPower(level = this.roleRuntimeLevel): number {
        return this.getRolePowerFromAttrs(this.getRoleTotalAttrs(level));
    }
    protected getRoleSnapshot(level = this.roleRuntimeLevel): RoleProgressSnapshot {
        const attrs = this.getRoleTotalAttrs(level);
        return {
            level,
            attrs,
            power: this.getRolePowerFromAttrs(attrs),
        };
    }
    protected getRoleInventoryCount(itemId: string): number {
        return this.roleInventoryCounts.get(itemId) || 0;
    }
    protected setRoleInventoryCount(itemId: string, count: number): void {
        this.roleInventoryCounts.set(itemId, Math.max(0, Math.floor(count)));
    }
    protected addRoleInventory(itemId: string, amount: number): void {
        if (!itemId || amount <= 0) return;
        this.setRoleInventoryCount(itemId, this.getRoleInventoryCount(itemId) + amount);
    }
    protected consumeRoleInventory(itemId: string, amount: number): boolean {
        const count = this.getRoleInventoryCount(itemId);
        if (count < amount) return false;
        this.setRoleInventoryCount(itemId, count - amount);
        return true;
    }
    protected getRoleSeededBagItems(): BagIllustrationCatalogItem[] {
        const ids = new Set(HomeConfig.ROLE_INITIAL_BAG_ITEMS.map((item) => item.itemId));
        this.roleInventoryCounts.forEach((_count, itemId) => ids.add(itemId));
        return BAG_ILLUSTRATION_CATALOG.filter((item) => ids.has(item.id));
    }
    protected getBagItemCount(item: BagIllustrationCatalogItem): number {
        return this.getRoleInventoryCount(item.id);
    }
    protected refreshRoleInventoryViews(syncAdvanceFill = true): void {
        this.refreshRoleAdvancePage(syncAdvanceFill);
        this.refreshRoleStrengthenMaterials();
        if (this.bagCatalogView?.board?.isValid && this.bagPanel?.active && !this.bagIllustrationMode) {
            this.refreshBagCatalogGrid(this.bagCatalogView);
        }
    }
    protected getRoleBreakthroughConfig(level: number): typeof HomeConfig.ROLE_BREAKTHROUGH_TABLE[number] | null {
        return HomeConfig.ROLE_BREAKTHROUGH_TABLE.find((row) => row.level === level) || null;
    }
    protected getRoleUpcomingBreakthroughLevel(): number {
        return HomeConfig.ROLE_BREAKTHROUGH_TABLE.find((row) => row.level > this.roleRuntimeLevel)?.level || 0;
    }
    protected getRolePendingBreakthroughLevel(): number {
        const targetLevel = this.roleRuntimeLevel + 1;
        const needExp = this.getRoleLevelExpConfig(targetLevel)?.needExp || 0;
        return this.getRoleBreakthroughConfig(targetLevel) && needExp > 0 && this.roleRuntimeExp >= needExp ? targetLevel : 0;
    }
    protected isRoleBreakthroughPending(): boolean {
        return this.getRolePendingBreakthroughLevel() > 0;
    }
    protected getRoleBreakthroughMaterialConfig(id: RoleBreakthroughMaterialId): typeof HomeConfig.ROLE_BREAKTHROUGH_MATERIALS[number] | null {
        return HomeConfig.ROLE_BREAKTHROUGH_MATERIALS.find((item) => item.id === id) || null;
    }
    protected getRoleBreakthroughDisplayCosts(level: number): Array<{ id: RoleBreakthroughMaterialId; amount: number; itemId: string; name: string; iconPath: string; framePath: string }> {
        const config = this.getRoleBreakthroughConfig(level);
        return HomeConfig.ROLE_BREAKTHROUGH_MATERIALS.map((material) => {
            const catalogItem = BAG_ILLUSTRATION_CATALOG.find((item) => item.id === material.itemId);
            return {
                id: material.id,
                amount: Number(config?.[material.id] || 0),
                itemId: material.itemId,
                name: material.name,
                iconPath: catalogItem?.iconPath || '',
                framePath: catalogItem?.framePath || `${HomeConfig.UI_ROLE_ADVANCE_EXP_ORB_FRAME_ROOT}1`,
            };
        });
    }
    protected getRoleBreakthroughCosts(level: number): Array<{ id: RoleBreakthroughMaterialId; amount: number; itemId: string; name: string }> {
        const config = this.getRoleBreakthroughConfig(level);
        if (!config) return [];
        return (['white', 'green', 'blue', 'purple'] as RoleBreakthroughMaterialId[])
            .map((id) => {
                const material = this.getRoleBreakthroughMaterialConfig(id);
                return {
                    id,
                    amount: Number(config[id] || 0),
                    itemId: material?.itemId || '',
                    name: material?.name || '',
                };
            })
            .filter((item) => item.amount > 0 && item.itemId.length > 0);
    }
    protected getRoleBreakthroughMissingText(costs: Array<{ amount: number; itemId: string; name: string }>): string {
        return costs
            .filter((item) => this.getRoleInventoryCount(item.itemId) < item.amount)
            .map((item) => `${item.name}${this.getRoleInventoryCount(item.itemId)}/${item.amount}`)
            .join(' ');
    }
    protected findRoleBreakthroughBlockWithExp(addExp: number): { level: number; missing: string } | null {
        let level = this.roleRuntimeLevel;
        let exp = this.roleRuntimeExp + Math.max(0, Math.floor(addExp));
        const inventory = new Map<string, number>(this.roleInventoryCounts);

        while (level < 50) {
            const targetLevel = level + 1;
            const needExp = this.getRoleLevelExpConfig(targetLevel)?.needExp || 0;
            if (needExp <= 0 || exp < needExp) break;

            const costs = this.getRoleBreakthroughCosts(targetLevel);
            const missing = costs
                .filter((item) => (inventory.get(item.itemId) || 0) < item.amount)
                .map((item) => `${item.name}${inventory.get(item.itemId) || 0}/${item.amount}`)
                .join(' ');
            if (missing.length > 0) {
                return { level: targetLevel, missing };
            }

            costs.forEach((item) => {
                inventory.set(item.itemId, (inventory.get(item.itemId) || 0) - item.amount);
            });
            exp -= needExp;
            level = targetLevel;
        }

        return null;
    }
    protected canConsumeRoleBreakthrough(level: number): boolean {
        return this.getRoleBreakthroughCosts(level)
            .every((item) => this.getRoleInventoryCount(item.itemId) >= item.amount);
    }
    protected consumeRoleBreakthrough(level: number): void {
        this.getRoleBreakthroughCosts(level).forEach((item) => {
            this.consumeRoleInventory(item.itemId, item.amount);
        });
    }
}
