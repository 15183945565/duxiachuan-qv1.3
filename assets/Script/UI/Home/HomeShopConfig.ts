import { BAG_UI_ROOT, COMMERCE_UI_ROOT, SHOP_UI_ROOT, UI_HOME_JIFEN_ICON, UI_HOME_XIANSHI_ICON } from './HomeBaseConfig';
import type { ShopItemData } from './HomeTypes';

export const UI_FRAME_SHOP = `${SHOP_UI_ROOT}/shop_board_bg`;
export const UI_SHOP_PAGE_BG = `${SHOP_UI_ROOT}/shop_page_bg`;
export const UI_SHOP_TITLE_SIGN = `${SHOP_UI_ROOT}/shop_title_sign`;
export const UI_SHOP_ITEM_BG = `${SHOP_UI_ROOT}/shop_item_bg`;
export const UI_SHOP_BUY_BUTTON = `${SHOP_UI_ROOT}/shop_buy_btn`;
export const UI_SHOP_SHELF_BG = `${SHOP_UI_ROOT}/shop_shelf_bg`;
export const UI_SHOP_TAB_ACTIVE_BG = `${SHOP_UI_ROOT}/shop_tab_active_bg`;
export const UI_SHOP_TAB_NORMAL_BG = `${SHOP_UI_ROOT}/shop_tab_normal_bg`;
export const UI_SHOP_JADE_PACK_1 = `${COMMERCE_UI_ROOT}/shop_jade_pack_1`;
export const UI_SHOP_QUANTITY_BG = `${COMMERCE_UI_ROOT}/shop_quantity_bg`;
export const UI_SHOP_QUANTITY_MINUS_BUTTON = `${COMMERCE_UI_ROOT}/shop_quantity_minus_btn`;
export const UI_SHOP_QUANTITY_PLUS_BUTTON = `${COMMERCE_UI_ROOT}/shop_quantity_plus_btn`;
export const UI_SHOP_ITEM_FRAME_LV7 = `${BAG_UI_ROOT}/ItemFrames/item_frame_lv7`;
export const UI_SHOP_CHALLENGE_CARD = `${BAG_UI_ROOT}/IllustrationItems/bag_item_112`;
export const UI_SHOP_MAGIC_TICKET = `${BAG_UI_ROOT}/IllustrationItems/bag_item_111`;
export const UI_SHOP_RENAME_CARD = `${BAG_UI_ROOT}/IllustrationItems/bag_item_109`;
export const UI_SHOP_PROTECT_CARD = `${SHOP_UI_ROOT}/shop_protect_card`;
export const UI_SHOP_TREASURE_TICKET = `${SHOP_UI_ROOT}/shop_treasure_ticket`;
export const UI_SHOP_POWER_CARD = `${SHOP_UI_ROOT}/shop_power_card`;
export const SHOP_CHARACTER_SKEL_PATH = 'Spine/Shop/Character/S20506';

export const SHOP_ITEMS: ShopItemData[] = [
    { id: 'challenge_card', name: '挑战卡', desc: '征战挑战所需道具。', amount: 1, price: 80, iconPath: UI_SHOP_CHALLENGE_CARD },
    { id: 'magic_ticket', name: '魔界门票', desc: '进入魔界玩法所需门票。', amount: 1, price: 100, iconPath: UI_SHOP_MAGIC_TICKET },
    { id: 'rename_card', name: '改名卡', desc: '用于修改角色名称。', amount: 1, price: 300, iconPath: UI_SHOP_RENAME_CARD },
    { id: 'protect_card', name: '保护卡', desc: '用于关键玩法保护消耗。', amount: 1, price: 80, iconPath: UI_SHOP_PROTECT_CARD },
    { id: 'treasure_ticket', name: '挖宝券', desc: '用于参与挖宝玩法的消耗券。', amount: 1, price: 100, iconPath: UI_SHOP_TREASURE_TICKET },
    { id: 'power_card', name: '战力卡', desc: '用于提升战力相关玩法的消耗道具。', amount: 1, price: 80, iconPath: UI_SHOP_POWER_CARD },
];

export const SHOP_POINT_ITEMS: ShopItemData[] = [
    {
        id: 'yuanbao_pack_1',
        name: '\u5143\u5b9d',
        desc: '\u6d88\u8017\u79ef\u5206\u8d2d\u4e70\u5143\u5b9d\u3002',
        amount: 1,
        price: 100,
        iconPath: UI_HOME_JIFEN_ICON,
        currencyIconPath: UI_HOME_XIANSHI_ICON,
        currencyName: '\u79ef\u5206',
    },
];
