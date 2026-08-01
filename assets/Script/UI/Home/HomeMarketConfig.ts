import { BAG_ILLUSTRATION_CATALOG } from './BagIllustrationCatalog.generated';
import { MARKET_UI_ROOT } from './HomeBaseConfig';
import type { MarketCategory, MarketFilterOption, MarketListingData, MarketMode, MarketTab } from './HomeTypes';

export const UI_MARKET_BG = `${MARKET_UI_ROOT}/market_bg`;
export const UI_MARKET_BOARD = `${MARKET_UI_ROOT}/market_board`;
export const UI_MARKET_ITEM_ROW = `${MARKET_UI_ROOT}/market_item_row`;
export const UI_MARKET_TAB_ACTIVE = `${MARKET_UI_ROOT}/market_tab_active`;
export const UI_MARKET_TAB_NORMAL = `${MARKET_UI_ROOT}/market_tab_normal`;
export const UI_MARKET_BUTTON = `${MARKET_UI_ROOT}/market_button`;
export const UI_MARKET_DROPDOWN = `${MARKET_UI_ROOT}/market_dropdown`;
export const UI_MARKET_DROPDOWN_UP = `${MARKET_UI_ROOT}/market_dropdown_up`;
export const UI_MARKET_FILTER_BG = `${MARKET_UI_ROOT}/market_filter_bg`;
export const UI_MARKET_DROPDOWN_ITEM_NORMAL = `${MARKET_UI_ROOT}/market_dropdown_item_normal`;
export const UI_MARKET_DROPDOWN_ITEM_ACTIVE = `${MARKET_UI_ROOT}/market_dropdown_item_active`;
export const UI_MARKET_SORT_LOW_ARROW = `${MARKET_UI_ROOT}/market_sort_low_arrow`;
export const UI_MARKET_SORT_HIGH_ARROW = `${MARKET_UI_ROOT}/market_sort_high_arrow`;
export const UI_MARKET_REFRESH = `${MARKET_UI_ROOT}/market_refresh`;
export const UI_MARKET_BACK = `${MARKET_UI_ROOT}/market_back`;
export const UI_MARKET_MODE_TRADE = `${MARKET_UI_ROOT}/market_mode_trade`;
export const UI_MARKET_MODE_TRADE_ACTIVE = `${MARKET_UI_ROOT}/market_mode_trade_active`;
export const UI_MARKET_MODE_REQUEST = `${MARKET_UI_ROOT}/market_mode_request`;
export const UI_MARKET_MODE_REQUEST_ACTIVE = `${MARKET_UI_ROOT}/market_mode_request_active`;
export const UI_MARKET_DETAIL_POPUP_BG = `${MARKET_UI_ROOT}/market_detail_popup_bg`;
export const UI_MARKET_DETAIL_TITLE_BG = `${MARKET_UI_ROOT}/market_detail_title_bg`;
export const UI_MARKET_DETAIL_BUTTON_BG = `${MARKET_UI_ROOT}/market_detail_button_bg`;
export const UI_MARKET_SELL_ADD = `${MARKET_UI_ROOT}/market_sell_add`;
export const UI_MARKET_SELL_SELECT_POPUP_BG = `${MARKET_UI_ROOT}/market_sell_select_popup_bg`;
export const UI_MARKET_SELL_PRICE_PLUS = `${MARKET_UI_ROOT}/market_sell_price_plus`;
export const UI_MARKET_SELL_PRICE_MINUS = `${MARKET_UI_ROOT}/market_sell_price_minus`;
export const UI_MARKET_SELL_QUANTITY_BG = `${MARKET_UI_ROOT}/market_sell_quantity_bg`;

export const MARKET_TABS: Array<{ tab: MarketTab; title: string }> = [
    { tab: 'buy', title: '\u6211\u8981\u8d2d\u4e70' },
    { tab: 'sell', title: '\u6211\u8981\u51fa\u552e' },
    { tab: 'history', title: '\u4ea4\u6613\u8bb0\u5f55' },
];
export const MARKET_TABS_BY_MODE: Record<MarketMode, Array<{ tab: MarketTab; title: string }>> = {
    trade: MARKET_TABS,
    request: [
        { tab: 'buy', title: '\u6c42\u8d2d\u8ba2\u5355' },
        { tab: 'sell', title: '\u6211\u8981\u6c42\u8d2d' },
        { tab: 'history', title: '\u6c42\u8d2d\u8bb0\u5f55' },
    ],
};
export const MARKET_CATEGORY_ORDER: MarketCategory[] = ['all', 'material', 'equipment', 'item', 'gem'];
export const MARKET_CATEGORY_TITLES: Record<MarketCategory, string> = {
    all: '\u5168\u90e8\u7269\u54c1',
    material: '\u6750\u6599',
    equipment: '\u88c5\u5907',
    item: '\u9053\u5177',
    gem: '\u5b9d\u77f3',
};
const MARKET_CATALOG_LEVEL_ORDER = ['\u4e00\u7ea7', '\u4e8c\u7ea7', '\u4e09\u7ea7', '\u56db\u7ea7', '\u4e94\u7ea7', '\u516d\u7ea7', '\u4e03\u7ea7', '\u516b\u7ea7', '\u4e5d\u7ea7', '\u5341\u7ea7'] as const;

function getMarketCatalogLevelOrder(name: string): number {
    const index = MARKET_CATALOG_LEVEL_ORDER.findIndex((levelName) => name.includes(levelName));
    return index >= 0 ? index : MARKET_CATALOG_LEVEL_ORDER.length;
}

function getMarketCatalogIdsByName(prefix: string, keyword: string): string[] {
    return BAG_ILLUSTRATION_CATALOG
        .filter((item) => item.name.startsWith(prefix) && item.name.includes(keyword))
        .sort((a, b) => getMarketCatalogLevelOrder(a.name) - getMarketCatalogLevelOrder(b.name))
        .map((item) => item.id);
}

function createMarketCatalogFilterOptions(itemIds: readonly string[]): MarketFilterOption[] {
    return [
        MARKET_FILTER_ALL_OPTION,
        ...itemIds
            .map<MarketFilterOption | null>((itemId) => {
                const catalogItem = BAG_ILLUSTRATION_CATALOG.find((item) => item.id === itemId);
                return catalogItem ? { key: itemId, title: catalogItem.name, itemIds: [itemId] } : null;
            })
            .filter((option): option is MarketFilterOption => option !== null),
    ];
}

function createMarketTertiaryFilterOptions(): Record<string, MarketFilterOption[]> {
    const options: Record<string, MarketFilterOption[]> = {
        all: [MARKET_FILTER_ALL_OPTION],
        beast_fragment: createMarketCatalogFilterOptions(MARKET_BEAST_FRAGMENT_IDS),
        role_exp: createMarketCatalogFilterOptions(MARKET_ROLE_EXP_MATERIAL_IDS),
        battle_upgrade: createMarketCatalogFilterOptions(MARKET_BATTLE_UPGRADE_MATERIAL_IDS),
        role_breakthrough: createMarketCatalogFilterOptions(MARKET_ROLE_BREAKTHROUGH_MATERIAL_IDS),
        equip_strengthen: createMarketCatalogFilterOptions(MARKET_EQUIP_STRENGTHEN_MATERIAL_IDS),
    };
    MARKET_GEM_FILTER_GROUPS.forEach((group) => {
        options[group.key] = createMarketCatalogFilterOptions(group.itemIds || []);
    });
    return options;
}
export const MARKET_FILTER_ALL_OPTION: MarketFilterOption = { key: 'all', title: '\u65e0\u9650\u5236' };
export const MARKET_PRIMARY_FILTER_OPTIONS: MarketFilterOption[] = [
    MARKET_FILTER_ALL_OPTION,
    { key: 'item', title: '\u9053\u5177' },
    { key: 'material', title: '\u6750\u6599' },
    { key: 'gem', title: '\u5b9d\u77f3' },
];
export const MARKET_BEAST_FRAGMENT_IDS = ['item_108', 'item_104', 'item_102', 'item_106'] as const;
export const MARKET_ROLE_EXP_MATERIAL_IDS = ['material_081', 'material_082', 'material_169', 'material_170', 'material_171'] as const;
export const MARKET_BATTLE_UPGRADE_MATERIAL_IDS = ['material_097', 'material_093', 'material_094', 'material_095', 'material_096'] as const;
export const MARKET_ROLE_BREAKTHROUGH_MATERIAL_IDS = ['material_086', 'material_083', 'material_084', 'material_085'] as const;
export const MARKET_EQUIP_STRENGTHEN_MATERIAL_IDS = ['material_098', 'material_099', 'material_100'] as const;
export const MARKET_GEM_FILTER_GROUPS: MarketFilterOption[] = [
    { key: 'gem_qingshi_sub', title: '\u9752\u72ee\u5b9d\u77f3\uff08\u526f\uff09', itemIds: getMarketCatalogIdsByName('\u9752\u72ee', '\u5b9d\u77f3\uff08\u526f\uff09') },
    { key: 'gem_qingshi_main', title: '\u9752\u72ee\u5b9d\u77f3\uff08\u4e3b\uff09', itemIds: getMarketCatalogIdsByName('\u9752\u72ee', '\u5b9d\u77f3\uff08\u4e3b\uff09') },
    { key: 'gem_bailu_sub', title: '\u767d\u9e7f\u5b9d\u77f3\uff08\u526f\uff09', itemIds: getMarketCatalogIdsByName('\u767d\u9e7f', '\u5b9d\u77f3\uff08\u526f\uff09') },
    { key: 'gem_bailu_main', title: '\u767d\u9e7f\u5b9d\u77f3\uff08\u4e3b\uff09', itemIds: getMarketCatalogIdsByName('\u767d\u9e7f', '\u5b9d\u77f3\uff08\u4e3b\uff09') },
    { key: 'gem_jinhe_sub', title: '\u91d1\u9e64\u5b9d\u77f3\uff08\u526f\uff09', itemIds: getMarketCatalogIdsByName('\u91d1\u9e64', '\u5b9d\u77f3\uff08\u526f\uff09') },
    { key: 'gem_jinhe_main', title: '\u91d1\u9e64\u5b9d\u77f3\uff08\u4e3b\uff09', itemIds: getMarketCatalogIdsByName('\u91d1\u9e64', '\u5b9d\u77f3\uff08\u4e3b\uff09') },
    { key: 'gem_chihu_sub', title: '\u8d64\u72d0\u5b9d\u77f3\uff08\u526f\uff09', itemIds: getMarketCatalogIdsByName('\u8d64\u72d0', '\u5b9d\u77f3\uff08\u526f\uff09') },
    { key: 'gem_chihu_main', title: '\u8d64\u72d0\u5b9d\u77f3\uff08\u4e3b\uff09', itemIds: getMarketCatalogIdsByName('\u8d64\u72d0', '\u5b9d\u77f3\uff08\u4e3b\uff09') },
];
export const MARKET_SECONDARY_FILTER_OPTIONS: Record<string, MarketFilterOption[]> = {
    all: [MARKET_FILTER_ALL_OPTION],
    item: [
        MARKET_FILTER_ALL_OPTION,
        { key: 'beast_fragment', title: '\u517d\u5361\u788e\u7247', itemIds: MARKET_BEAST_FRAGMENT_IDS },
    ],
    material: [
        MARKET_FILTER_ALL_OPTION,
        { key: 'role_exp', title: '\u4eba\u7269\u5347\u7ea7\u6750\u6599', itemIds: MARKET_ROLE_EXP_MATERIAL_IDS },
        { key: 'battle_upgrade', title: '\u6218\u573a\u5347\u7ea7\u6750\u6599', itemIds: MARKET_BATTLE_UPGRADE_MATERIAL_IDS },
        { key: 'role_breakthrough', title: '\u4eba\u7269\u7a81\u7834\u6750\u6599', itemIds: MARKET_ROLE_BREAKTHROUGH_MATERIAL_IDS },
        { key: 'equip_strengthen', title: '\u88c5\u5907\u5f3a\u5316\u6750\u6599', itemIds: MARKET_EQUIP_STRENGTHEN_MATERIAL_IDS },
    ],
    gem: [
        MARKET_FILTER_ALL_OPTION,
        ...MARKET_GEM_FILTER_GROUPS,
    ],
};
export const MARKET_TERTIARY_FILTER_OPTIONS: Record<string, MarketFilterOption[]> = createMarketTertiaryFilterOptions();
export const MARKET_CATALOG_ITEM_IDS = [
    ...MARKET_BEAST_FRAGMENT_IDS,
    ...MARKET_ROLE_EXP_MATERIAL_IDS,
    ...MARKET_BATTLE_UPGRADE_MATERIAL_IDS,
    ...MARKET_ROLE_BREAKTHROUGH_MATERIAL_IDS,
    ...MARKET_EQUIP_STRENGTHEN_MATERIAL_IDS,
    ...MARKET_GEM_FILTER_GROUPS.reduce<string[]>((result, group) => {
        result.push(...(group.itemIds || []));
        return result;
    }, []),
] as const;
export const MARKET_ITEM_PRICES = [0.27, 0.274, 0.275, 0.279, 0.32, 0.36, 0.42, 0.48] as const;
export const MARKET_ITEMS = MARKET_CATALOG_ITEM_IDS.reduce<MarketListingData[]>((result, id, index) => {
    const catalogItem = BAG_ILLUSTRATION_CATALOG.find((item) => item.id === id);
    if (!catalogItem) return result;

    result.push({
        id: `market_${catalogItem.id}`,
        itemId: catalogItem.id,
        name: catalogItem.name,
        category: catalogItem.category,
        amount: index % 3 + 1,
        unitPrice: MARKET_ITEM_PRICES[index % MARKET_ITEM_PRICES.length],
        iconPath: catalogItem.iconPath,
        framePath: catalogItem.framePath,
    });
    return result;
}, []);

export const MARKET_BOARD_WIDTH = 700;
export const MARKET_BOARD_HEIGHT = 1250;
export const MARKET_BOARD_Y = -56;
export const MARKET_TAB_WIDTH = 190;
export const MARKET_TAB_HEIGHT = 78;
export const MARKET_TAB_Y = 622;
export const MARKET_TAB_SPACING = 204;
export const MARKET_FILTER_Y = 500;
export const MARKET_FILTER_ROOT_WIDTH = 650;
export const MARKET_FILTER_ROOT_HEIGHT = 104;
export const MARKET_FILTER_CONTROL_WIDTH = 186;
export const MARKET_FILTER_CONTROL_HEIGHT = 38;
export const MARKET_FILTER_DROPDOWN_SIZE = 38;
export const MARKET_FILTER_TOP_ROW_Y = 24;
export const MARKET_FILTER_BOTTOM_ROW_Y = -28;
export const MARKET_FILTER_PRIMARY_X = -200;
export const MARKET_FILTER_SECONDARY_X = 0;
export const MARKET_FILTER_TERTIARY_X = -200;
export const MARKET_FILTER_SORT_X = 80;
export const MARKET_FILTER_SORT_WIDTH = 300;
export const MARKET_FILTER_REFRESH_X = 135;
export const MARKET_FILTER_REFRESH_SIZE = 70;
export const MARKET_FILTER_REFRESH_ICON_SIZE = 22;
export const MARKET_DROPDOWN_ROW_HEIGHT = 42;
export const MARKET_DROPDOWN_LABEL_FONT_SIZE = 22;
export const MARKET_VIEWPORT_WIDTH = 650;
export const MARKET_VIEWPORT_HEIGHT = 930;
export const MARKET_VIEWPORT_Y = -74;
export const MARKET_SELL_VIEWPORT_HEIGHT = 1084;
export const MARKET_SELL_VIEWPORT_Y = 3;
export const MARKET_ROW_WIDTH = 626;
export const MARKET_ROW_HEIGHT = 150;
export const MARKET_ROW_GAP = 160;
export const MARKET_SELL_MAX_LISTINGS = 8;
export const MARKET_SELL_ADD_TO_LISTING_EXTRA_GAP = 28;
export const MARKET_SELL_ADD_BUTTON_SIZE = 58;
export const MARKET_SELL_SELECT_POPUP_WIDTH = 530;
export const MARKET_SELL_SELECT_POPUP_HEIGHT = 768;
export const MARKET_SELL_SELECT_VIEWPORT_WIDTH = 430;
export const MARKET_SELL_SELECT_VIEWPORT_HEIGHT = 565;
export const MARKET_SELL_SELECT_CELL_SIZE = 92;
export const MARKET_SELL_SELECT_CELL_GAP_X = 18;
export const MARKET_SELL_SELECT_CELL_GAP_Y = 30;
export const MARKET_SELL_STEPPER_BUTTON_SIZE = 41;
export const MARKET_SELL_SETTING_BG_WIDTH = 171;
export const MARKET_SELL_SETTING_BG_HEIGHT = 23;
export const MARKET_SELL_PRICE_STEP = 0.01;
export const MARKET_SELL_FEE_RATE = 0.1;
export const MARKET_REQUEST_MAX_QUANTITY = 99;
export const MARKET_MODE_BUTTON_ROOT_Y = -708;
export const MARKET_MODE_BUTTON_WIDTH = 108;
export const MARKET_MODE_BUTTON_HEIGHT = 108;
export const MARKET_MODE_BUTTON_Y = 0;
export const MARKET_MODE_BUTTONS: Array<{ mode: MarketMode; nodeName: string; x: number; normalPath: string; activePath: string }> = [
    { mode: 'trade', nodeName: 'MarketModeTradeButton', x: 202, normalPath: UI_MARKET_MODE_TRADE, activePath: UI_MARKET_MODE_TRADE_ACTIVE },
    { mode: 'request', nodeName: 'MarketModeRequestButton', x: 320, normalPath: UI_MARKET_MODE_REQUEST, activePath: UI_MARKET_MODE_REQUEST_ACTIVE },
];
