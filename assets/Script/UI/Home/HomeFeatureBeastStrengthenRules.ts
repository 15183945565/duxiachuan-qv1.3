import {
    Node,
    UIOpacity,
    sys,
} from 'cc';
import {
    BAG_ILLUSTRATION_CATALOG,
    type BagIllustrationCatalogItem,
} from './BagIllustrationCatalog.generated';
import {
    BEAST_STRENGTHEN_BEASTS,
    BEAST_STRENGTHEN_DEFAULT_GEM_SLOT_UNLOCKED,
    BEAST_STRENGTHEN_EQUIPMENT_IDS,
    BEAST_STRENGTHEN_PARTS,
    type BeastStrengthenAction,
    type BeastStrengthenBeastConfig,
    type BeastStrengthenBeastKey,
    type BeastStrengthenEquipmentConfig,
    type BeastStrengthenEquipPart,
    type BeastStrengthenState,
} from './HomeBeastStrengthenConfig';
import * as HomeConfig from './HomeConfig';
import { HomeViewBase } from './HomeViewBase';

abstract class HomeFeatureBeastStrengthenRulesHost extends HomeViewBase {
    protected abstract beastStrengthenState: BeastStrengthenState | null;
    protected abstract beastStrengthenSelectedPart: BeastStrengthenEquipPart;
}

/**
 * 兽卡强化持久化状态、装备/宝石解锁、库存筛选、加成与键生成规则。
 */
export abstract class HomeFeatureBeastStrengthenRules extends HomeFeatureBeastStrengthenRulesHost {
    protected ensureBeastStrengthenState(): BeastStrengthenState {
        if (this.beastStrengthenState) {
            this.seedBeastStrengthenDefaultGemSlots(this.beastStrengthenState);
            return this.beastStrengthenState;
        }

        let parsed: Partial<BeastStrengthenState> | null = null;
        const raw = sys.localStorage.getItem(HomeConfig.BEAST_STRENGTHEN_STORAGE_KEY);
        if (raw) {
            try {
                parsed = JSON.parse(raw) as Partial<BeastStrengthenState>;
            } catch (err) {
                console.warn('[MainHomeView] beast strengthen state parse failed', err);
            }
        }
        const state: BeastStrengthenState = {
            yuanbao: typeof parsed?.yuanbao === 'number' ? parsed.yuanbao : HomeConfig.BEAST_STRENGTHEN_DEFAULT_YUANBAO,
            unlockedEquipments: { ...(parsed?.unlockedEquipments || {}) },
            unlockedGemSlots: { ...(parsed?.unlockedGemSlots || {}) },
            equippedGems: { ...(parsed?.equippedGems || {}) },
        };
        this.seedBeastStrengthenDefaultGemSlots(state);
        this.beastStrengthenState = state;
        return state;
    }
    protected seedBeastStrengthenDefaultGemSlots(state: BeastStrengthenState): void {
        BEAST_STRENGTHEN_BEASTS.forEach((beast) => {
            BEAST_STRENGTHEN_PARTS.forEach((part) => {
                for (let index = 0; index < HomeConfig.BEAST_STRENGTHEN_GEM_SLOT_COUNT; index += 1) {
                    if (!BEAST_STRENGTHEN_DEFAULT_GEM_SLOT_UNLOCKED[index]) continue;
                    const key = this.getBeastStrengthenGemSlotKey(beast.key, part.part, index);
                    if (typeof state.unlockedGemSlots[key] !== 'boolean') {
                        state.unlockedGemSlots[key] = true;
                    }
                }
            });
        });
    }
    protected saveBeastStrengthenState(): void {
        if (!this.beastStrengthenState) return;
        sys.localStorage.setItem(HomeConfig.BEAST_STRENGTHEN_STORAGE_KEY, JSON.stringify(this.beastStrengthenState));
    }
    protected spendBeastStrengthenYuanbao(cost: number): boolean {
        const state = this.ensureBeastStrengthenState();
        if (state.yuanbao < cost) {
            this.showToast('\u5143\u5b9d\u4e0d\u8db3');
            return false;
        }
        state.yuanbao -= cost;
        this.saveBeastStrengthenState();
        return true;
    }
    protected getCurrentBeastStrengthenBeast(): BeastStrengthenBeastConfig {
        return BEAST_STRENGTHEN_BEASTS[this.beastCardIndex] || BEAST_STRENGTHEN_BEASTS[0];
    }
    protected getBeastStrengthenEquipmentConfigs(beast: BeastStrengthenBeastConfig): BeastStrengthenEquipmentConfig[] {
        return BEAST_STRENGTHEN_PARTS.map((part) => {
            const itemId = BEAST_STRENGTHEN_EQUIPMENT_IDS[beast.key][part.part];
            const item = BAG_ILLUSTRATION_CATALOG.find((catalogItem) => catalogItem.id === itemId);
            return {
                beastKey: beast.key,
                beastName: beast.name,
                part: part.part,
                partLabel: part.label,
                itemId,
                displayName: item?.name || `${beast.name}${part.label}`,
                iconPath: item?.iconPath || '',
            };
        });
    }
    protected getSelectedBeastStrengthenEquipmentConfig(): BeastStrengthenEquipmentConfig | null {
        const beast = this.getCurrentBeastStrengthenBeast();
        return this.getBeastStrengthenEquipmentConfigs(beast).find((config) => config.part === this.beastStrengthenSelectedPart) || null;
    }
    protected getBeastStrengthenGemItems(beastKey: BeastStrengthenBeastKey): BagIllustrationCatalogItem[] {
        const beast = BEAST_STRENGTHEN_BEASTS.find((item) => item.key === beastKey) || BEAST_STRENGTHEN_BEASTS[0];
        return BAG_ILLUSTRATION_CATALOG
            .filter((item) => item.category === 'gem' && item.name.includes(beast.name) && this.getRoleInventoryCount(item.id) > 0)
            .sort((a, b) => {
                const mainA = a.name.includes('\u4e3b') ? 0 : 1;
                const mainB = b.name.includes('\u4e3b') ? 0 : 1;
                return this.getBeastStrengthenGemLevel(a) - this.getBeastStrengthenGemLevel(b) || mainA - mainB || a.id.localeCompare(b.id);
            });
    }
    protected getBeastStrengthenGemLevel(item: BagIllustrationCatalogItem | null | undefined): number {
        if (!item) return 0;
        const labels = ['\u4e00', '\u4e8c', '\u4e09', '\u56db', '\u4e94', '\u516d', '\u4e03', '\u516b', '\u4e5d', '\u5341'];
        const index = labels.findIndex((label) => item.name.includes(`${label}\u7ea7`));
        return index >= 0 ? index + 1 : 0;
    }
    protected getBeastStrengthenTotalBonus(beastKey: BeastStrengthenBeastKey): number {
        const state = this.ensureBeastStrengthenState();
        const parts = BEAST_STRENGTHEN_PARTS.map((part) => part.part);
        const equipmentBonus = parts.reduce((total, part) => (
            total + (state.unlockedEquipments[this.getBeastStrengthenEquipmentKey(beastKey, part)] ? HomeConfig.BEAST_STRENGTHEN_EQUIPMENT_BONUS : 0)
        ), 0);
        const gemBonus = parts.reduce((partTotal, part) => {
            let total = partTotal;
            for (let index = 0; index < HomeConfig.BEAST_STRENGTHEN_GEM_SLOT_COUNT; index += 1) {
                const gemId = state.equippedGems[this.getBeastStrengthenGemSlotKey(beastKey, part, index)];
                const gemItem = gemId ? BAG_ILLUSTRATION_CATALOG.find((item) => item.id === gemId) : null;
                total += this.getBeastStrengthenGemLevel(gemItem);
            }
            return total;
        }, 0);
        return equipmentBonus + gemBonus;
    }
    protected isBeastStrengthenEquipmentUnlocked(config: BeastStrengthenEquipmentConfig): boolean {
        return !!this.ensureBeastStrengthenState().unlockedEquipments[this.getBeastStrengthenEquipmentKey(config.beastKey, config.part)];
    }
    protected isBeastStrengthenGemSlotUnlocked(config: BeastStrengthenEquipmentConfig, index: number): boolean {
        return !!this.ensureBeastStrengthenState().unlockedGemSlots[this.getBeastStrengthenGemSlotKey(config.beastKey, config.part, index)];
    }
    protected getBeastStrengthenEquipmentKey(beastKey: BeastStrengthenBeastKey, part: BeastStrengthenEquipPart): string {
        return `${beastKey}:${part}`;
    }
    protected getBeastStrengthenGemSlotKey(beastKey: BeastStrengthenBeastKey, part: BeastStrengthenEquipPart, index: number): string {
        return `${beastKey}:${part}:gem:${index}`;
    }
    protected getBeastStrengthenActionText(action: BeastStrengthenAction): string {
        if (action === 'unlock-equipment') return '\u89e3\u9501\u88c5\u5907';
        if (action === 'unlock-gem') return '\u89e3\u9501\u5b9d\u77f3';
        if (action === 'place-gem') return '\u653e\u7f6e\u5b9d\u77f3';
        if (action === 'replace-gem') return '\u66ff\u6362\u5b9d\u77f3';
        return '';
    }
    protected setNodeOpacity(node: Node, opacity: number): void {
        const uiOpacity = node.getComponent(UIOpacity) || node.addComponent(UIOpacity);
        uiOpacity.opacity = opacity;
    }
}
