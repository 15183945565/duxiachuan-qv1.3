import { Vec3 } from 'cc';
import { BAG_ILLUSTRATION_CATALOG, type BagIllustrationCategory } from './BagIllustrationCatalog.generated';
import type { RoleGender, RolePageTab, BagPageTab, MailTab, RankTab, MarketTab, MarketMode, AllianceTab, DuelTab, ShowcaseTab, MarketCategory, MarketFilterOption, EntryButton, SharedPopupContent, MagicMapMonsterRuntime, RoleProfile, RoleAssetConfig, MailReward, MailData, NoticeType, NoticeData, RankPlayerData, ShopItemData, ShopStoreState, MarketListingData, MarketTransactionData, BagBottomTabButton, BagCatalogView, RoleBottomTabButton } from './HomeTypes';

export const PROFILE_VERSION = 5;
export const PROFILE_KEY = 'duxiachuan_profile_v5';
export const MAIL_STORE_KEY = 'duxiachuan_mail_v2';
export const NOTICE_LAST_OPEN_KEY = 'duxiachuan_notice_last_open_v1';
export const SHOP_STORE_KEY = 'duxiachuan_shop_v1';
export const DEFAULT_SHOP_CURRENCY = 0;
export const DEFAULT_NAME = '\u79d8\u5883\u5c11\u4fa0';
export const DEFAULT_UID = '9740495290';
export const CUSTOMER_SERVICE_URL = 'https://qun.qq.com/universal-share/share?ac=1&authKey=UEoQ7KN8I89XDKKQdudup2fXCbWPouFrsaYSP9adVkaOTGn6v8CzWiJtpM%2Bupw3j&busi_data=eyJncm91cENvZGUiOiIxMDg0MTcwMDkiLCJ0b2tlbiI6InVpc3hDd2lRSFk3dUpXM1Zsd1U2V3Z0ZENiRkNmQVBnM0N3THdWbjN1T0hZWXAvcXZCcVhhb2hrMVlScy82d1oiLCJ1aW4iOiIzNDE1ODU3OTc5In0=&data=Oe3B65KbsqtjSJDSR3x9SOeSeTizKFvykyHfmXqNwWByw7LDI5FI7MZXu3QED4XL1yiSavyeq6E2e8xvYjQPswAFVVFPMqgrHtvbebpOohU&svctype=5&tempid=h5_group_info';
export const MAIN_HOME_MUSIC_PATH = 'Audio/Home/main_home_music';
export const VIEW_WIDTH = 750;
export const VIEW_HEIGHT = 1624;
export const MAP_WIDTH = 2807;
export const MAP_HEIGHT = 2100;
export const MAP_VIEW_SCALE = 1;
export const MAP_FOLLOW_OFFSET_Y = -120;
export const ROLE_STAGE_SCALE = 1 / MAP_VIEW_SCALE;
export const ROLE_STAGE_INITIAL_Y = -180;
export const WANDERING_MERCHANT_MAP_X = -150;
export const WANDERING_MERCHANT_MAP_Y = 440;
export const ROLE_RENDER_SIZE = 600;
export const ROLE_MOVE_SPEED = 420;
export const MAP_WALKABLE_MIN_Y = -300;
export const MAP_WALKABLE_MAX_Y = 180;
export const MAP_BACKGROUND_PATH = 'Texture/Home/home_main_bg';
export const MAP_BACKGROUND_UUID = 'e7725203-6d7f-4220-8c52-9b61aa194d68@f9941';
export const HOME_UI_ROOT = 'Texture/Home';
export const UI_HOME_RESOURCE_BAR = `${HOME_UI_ROOT}/home_resource_bar`;
export const UI_HOME_XIANSHI_ICON = `${HOME_UI_ROOT}/home_xianshi`;
export const UI_HOME_JIFEN_ICON = `${HOME_UI_ROOT}/home_jifen`;
export const UI_HOME_EXCHANGE_BUTTON = `${HOME_UI_ROOT}/home_exchange_btn`;
export const UI_HOME_GIFT_SEND_BUTTON = `${HOME_UI_ROOT}/home_gift_send_btn`;
export const UI_HOME_AVATAR = `${HOME_UI_ROOT}/home_avatar`;
export const UI_HOME_PROFILE_FRAME = `${HOME_UI_ROOT}/home_profile_frame`;
export const TRANSITION_LOADING_SKEL_PATH = 'Spine/Loading/\u52a0\u8f7d\u52a8\u753b/H30126';
export const TRANSITION_LOADING_SCALE = 0.1;
export const TRANSITION_LOADING_MASK_ALPHA = 200;
export const TRANSITION_LOADING_SPINE_Y = 50;
export const TRANSITION_LOADING_DOTS_Y = 0;
export const TRANSITION_DOT_CYCLE_TIME = 0.4;
export const TRANSITION_DOT_DELAY = 0.2;
export const TRANSITION_DOT_MIN_SCALE = 0.8;
export const TRANSITION_DOT_MAX_SCALE = 1.2;
export const TRANSITION_DOT_MIN_OPACITY = 100;
export const TRANSITION_DOT_MAX_OPACITY = 255;
export const BUTTON_PRESS_SCALE = 0.94;
export const BUTTON_PRESS_DURATION = 0.07;
export const BUTTON_RELEASE_DURATION = 0.12;
export const MAIL_UI_ROOT = 'Texture/UI/Mail';
export const NOTICE_UI_ROOT = 'Texture/UI/Notice';
export const SHOP_UI_ROOT = 'Texture/UI/Shop';
export const ROLE_UI_ROOT = 'Texture/UI/Role';
export const BAG_UI_ROOT = 'Texture/UI/Bag';
export const BATTLE_UI_ROOT = 'Texture/UI/Battle';
export const BOTTOM_FEATURE_UI_ROOT = 'Texture/UI/BottomFeature';
export const MAGIC_UI_ROOT = 'Texture/UI/Magic';
export const BEAST_UI_ROOT = 'Texture/UI/Beast';
export const MARKET_UI_ROOT = 'Texture/UI/Market';
export const DUEL_UI_ROOT = 'Texture/UI/Duel';
export const SHOWCASE_UI_ROOT = 'Texture/UI/Showcase';
export const CONFIRM_UI_ROOT = 'Texture/UI/Confirm';
export const CHARACTER_SELECT_UI_ROOT = 'Texture/UI/CharacterSelect';
export const RANK_UI_ROOT = 'Texture/UI/Rank';
export const PROFILE_UI_ROOT = 'Texture/UI/Profile';
export const COMMON_UI_ROOT = 'Texture/UI/Common';
export const SHARE_UI_ROOT = 'Texture/UI/Share';
export const COMMERCE_UI_ROOT = `${COMMON_UI_ROOT}/Commerce`;
export const UI_TOAST_BG = `${COMMON_UI_ROOT}/ui_toast_bg`;
export const TOAST_BG_MIN_WIDTH = 310;
export const TOAST_BG_MAX_WIDTH = 660;
export const TOAST_BG_HEIGHT = 58;
export const TOAST_TEXT_HEIGHT = 52;
export const TOAST_TEXT_HORIZONTAL_PADDING = 84;
export const UI_PROFILE_POPUP_BG = `${PROFILE_UI_ROOT}/profile_popup_bg`;
export const UI_PROFILE_BTN_CUSTOMER = `${PROFILE_UI_ROOT}/profile_btn_customer`;
export const UI_PROFILE_BTN_FRIEND = `${PROFILE_UI_ROOT}/profile_btn_friend`;
export const UI_PROFILE_BTN_SETTINGS = `${PROFILE_UI_ROOT}/profile_btn_settings`;
export const UI_PROFILE_BTN_REALNAME = `${PROFILE_UI_ROOT}/profile_btn_realname`;
export const UI_PROFILE_BTN_BILL = `${PROFILE_UI_ROOT}/profile_btn_bill`;
export const UI_PROFILE_BTN_STREAMER = `${PROFILE_UI_ROOT}/profile_btn_streamer`;
export const UI_PROFILE_BTN_EDIT = `${PROFILE_UI_ROOT}/profile_btn_edit`;
export const UI_PROFILE_BTN_COPY = `${PROFILE_UI_ROOT}/profile_btn_copy`;
export const UI_PROFILE_AVATAR_FRAME_BUTTON_BG = `${PROFILE_UI_ROOT}/profile_avatar_frame_button_bg`;
export const UI_SHARE_PAGE_BG = `${SHARE_UI_ROOT}/share_page_bg`;
export const UI_SHARE_BOARD = `${SHARE_UI_ROOT}/share_board`;
export const UI_SHARE_TASK_ROW_BG = `${SHARE_UI_ROOT}/share_task_row_bg`;
export const UI_SHARE_YUANBAO = `${SHARE_UI_ROOT}/share_yuanbao`;
export const UI_SHARE_TITLE_BG = `${SHARE_UI_ROOT}/share_title_bg`;
export const UI_SHARE_BUTTON_BG = `${SHARE_UI_ROOT}/share_button_bg`;
export const UI_SHARE_PROGRESS_BG = `${SHARE_UI_ROOT}/share_progress_bg`;
export const UI_SHARE_PROGRESS_FILL = `${SHARE_UI_ROOT}/share_progress_fill`;
export const SHARE_TASKS = [
    { id: 'generation_lv15_1', tab: 'generation', label: '\u4e00\u4ee3\u9053\u53cb', requiredCount: 1, requiredLevel: 15, reward: 1 },
    { id: 'chief_lv15_2', tab: 'chief', label: '\u9996\u5e2d\u9053\u53cb', requiredCount: 2, requiredLevel: 15, reward: 2 },
    { id: 'generation_lv10_69', tab: 'generation', label: '\u4e00\u4ee3\u9053\u53cb', requiredCount: 69, requiredLevel: 10, reward: 0.5 },
    { id: 'chief_lv10_31', tab: 'chief', label: '\u9996\u5e2d\u9053\u53cb', requiredCount: 31, requiredLevel: 10, reward: 1 },
    { id: 'generation_lv20_1', tab: 'generation', label: '\u4e00\u4ee3\u9053\u53cb', requiredCount: 1, requiredLevel: 20, reward: 5 },
    { id: 'chief_lv20_1', tab: 'chief', label: '\u9996\u5e2d\u9053\u53cb', requiredCount: 1, requiredLevel: 20, reward: 10 },
] as const;
export const PROFILE_DAOYOU_UI_ROOT = `${PROFILE_UI_ROOT}/DaoYou`;
export const UI_PROFILE_DAOYOU_BG = `${PROFILE_DAOYOU_UI_ROOT}/profile_daoyou_bg`;
export const UI_PROFILE_DAOYOU_BOARD = `${PROFILE_DAOYOU_UI_ROOT}/profile_daoyou_board`;
export const UI_PROFILE_DAOYOU_TITLE_BG = `${PROFILE_DAOYOU_UI_ROOT}/profile_daoyou_title_bg`;
export const UI_PROFILE_DAOYOU_TAB_ACTIVE = `${PROFILE_DAOYOU_UI_ROOT}/profile_daoyou_tab_active`;
export const UI_PROFILE_DAOYOU_TAB_INACTIVE = `${PROFILE_DAOYOU_UI_ROOT}/profile_daoyou_tab_inactive`;
export const UI_PROFILE_DAOYOU_ROW_BG = `${PROFILE_DAOYOU_UI_ROOT}/profile_daoyou_row_bg`;
export const PROFILE_DAOYOU_BOARD_WIDTH = 701;
export const PROFILE_DAOYOU_BOARD_HEIGHT = 835;
export const PROFILE_DAOYOU_SCROLL_WIDTH = VIEW_WIDTH;
export const PROFILE_DAOYOU_SCROLL_HEIGHT = PROFILE_DAOYOU_BOARD_HEIGHT;
export const PROFILE_DAOYOU_ROW_WIDTH = 609;
export const PROFILE_DAOYOU_ROW_HEIGHT = 113;
export const PROFILE_DAOYOU_ROW_GAP = 16;
export const PROFILE_DAOYOU_TABS = [
    { id: 'chief', label: '\u9996\u5e2d\u9053\u53cb', countPrefix: '\u9996\u5e2d\u9053\u53cb\u5171' },
    { id: 'generation', label: '\u4e00\u4ee3\u9053\u53cb', countPrefix: '\u4e00\u4ee3\u9053\u53cb\u5171' },
] as const;
export const PROFILE_DAOYOU_MEMBERS_BY_TAB = {
    chief: [
        { id: 'chief_01', name: '\u4e0e\u79cb\u65f6', battleLevel: 20, yuanbao: 0 },
        { id: 'chief_02', name: '177****7413', battleLevel: 16, yuanbao: 0 },
        { id: 'chief_03', name: '\u771f\u90fd\u5047\u54ea', battleLevel: 20, yuanbao: 0 },
        { id: 'chief_04', name: '132****8701', battleLevel: 15, yuanbao: 0 },
        { id: 'chief_05', name: '\u987e\u610f21\u53f7', battleLevel: 20, yuanbao: 0 },
        { id: 'chief_06', name: '\u6e05\u98ce\u5f52\u5251', battleLevel: 18, yuanbao: 120 },
        { id: 'chief_07', name: '\u9752\u5c71\u5ba2', battleLevel: 17, yuanbao: 80 },
    ],
    generation: [
        { id: 'generation_01', name: '\u4e91\u821f\u8fdc\u5ba2', battleLevel: 12, yuanbao: 0 },
        { id: 'generation_02', name: '\u534a\u5c71\u542c\u96e8', battleLevel: 11, yuanbao: 0 },
        { id: 'generation_03', name: '\u4e00\u5251\u5f00\u5c18', battleLevel: 10, yuanbao: 60 },
        { id: 'generation_04', name: '\u660e\u6708\u5f52\u4eba', battleLevel: 9, yuanbao: 0 },
        { id: 'generation_05', name: '\u6c5f\u6e56\u5c0f\u53cb', battleLevel: 8, yuanbao: 20 },
        { id: 'generation_06', name: '\u7af9\u5f71\u5c11\u4fa0', battleLevel: 7, yuanbao: 0 },
        { id: 'generation_07', name: '\u6e38\u4fa0\u5c0f\u4e03', battleLevel: 6, yuanbao: 0 },
        { id: 'generation_08', name: '\u7075\u6cc9\u6563\u4eba', battleLevel: 6, yuanbao: 10 },
        { id: 'generation_09', name: '\u6d6e\u751f\u5251\u5ba2', battleLevel: 5, yuanbao: 0 },
    ],
} as const;
export const PROFILE_AVATAR_FRAME_UI_ROOT = `${PROFILE_UI_ROOT}/AvatarFrame`;
export const PROFILE_AVATAR_FRAME_SPINE_ROOT = 'Spine/Profile/AvatarFrame';
export const UI_PROFILE_AVATAR_FRAME_POPUP_BG = `${PROFILE_AVATAR_FRAME_UI_ROOT}/avatar_frame_popup_bg`;
export const UI_PROFILE_AVATAR_FRAME_SLOT_BG = `${PROFILE_AVATAR_FRAME_UI_ROOT}/avatar_frame_slot_bg`;
export const UI_PROFILE_AVATAR_FRAME_SHOP_BUTTON_BG = `${PROFILE_AVATAR_FRAME_UI_ROOT}/avatar_frame_button_bg`;
export const PROFILE_AVATAR_FRAME_STORAGE_KEY = 'duxiachuan.profile.avatarFrame.v1';
export const PROFILE_AVATAR_FRAME_PRICE = 100;
export const PROFILE_AVATAR_FRAME_ANIMATIONS = ['animation', 'idle', 'stand', 'stand1'];
export const PROFILE_AVATAR_FRAME_PREVIEW_NODE_SCALE = 0.6;
export const PROFILE_AVATAR_FRAME_PREVIEW_SPINE_SCALE = 1;
export const PROFILE_AVATAR_FRAME_HUD_SPINE_SCALE = 0.62;
export const PROFILE_AVATAR_FRAME_POPUP_SPINE_SCALE = 0.72;
export const PROFILE_AVATAR_FRAME_POPUP_WIDTH = 670;
export const PROFILE_AVATAR_FRAME_POPUP_HEIGHT = 466;
export const PROFILE_AVATAR_FRAME_POPUP_Y = 20;
export const PROFILE_AVATAR_FRAME_VIEW_WIDTH = 610;
export const PROFILE_AVATAR_FRAME_VIEW_HEIGHT = 374;
export const PROFILE_AVATAR_FRAME_CONTENT_HEIGHT = 684;
export const PROFILE_AVATAR_FRAME_CONTENT_TOP_Y = -(PROFILE_AVATAR_FRAME_CONTENT_HEIGHT - PROFILE_AVATAR_FRAME_VIEW_HEIGHT) / 2;
export const PROFILE_AVATAR_FRAME_CELL_PREVIEW_SIZE = 184;
export const PROFILE_AVATAR_FRAME_CELL_PREVIEW_X = -5.629;
export const PROFILE_AVATAR_FRAME_CELL_PREVIEW_Y = 10.043;
export const PROFILE_AVATAR_FRAME_CELL_BUTTON_X = 3.571;
export const PROFILE_AVATAR_FRAME_CELL_BUTTON_Y = -54.094;
export const PROFILE_AVATAR_FRAME_ITEMS = [
    { id: 'frame_0354', preview: `${PROFILE_AVATAR_FRAME_UI_ROOT}/frame_0354_preview`, spine: `${PROFILE_AVATAR_FRAME_SPINE_ROOT}/frame_0354/frame_0354`, name: '\u5934\u50cf\u68461' },
    { id: 'frame_0355', preview: `${PROFILE_AVATAR_FRAME_UI_ROOT}/frame_0355_preview`, spine: `${PROFILE_AVATAR_FRAME_SPINE_ROOT}/frame_0355/frame_0355`, name: '\u5934\u50cf\u68462' },
    { id: 'frame_0358', preview: `${PROFILE_AVATAR_FRAME_UI_ROOT}/frame_0358_preview`, spine: `${PROFILE_AVATAR_FRAME_SPINE_ROOT}/frame_0358/frame_0358`, name: '\u5934\u50cf\u68463' },
    { id: 'frame_0363', preview: `${PROFILE_AVATAR_FRAME_UI_ROOT}/frame_0363_preview`, spine: `${PROFILE_AVATAR_FRAME_SPINE_ROOT}/frame_0363/frame_0363`, name: '\u5934\u50cf\u68464' },
    { id: 'frame_0375', preview: `${PROFILE_AVATAR_FRAME_UI_ROOT}/frame_0375_preview`, spine: `${PROFILE_AVATAR_FRAME_SPINE_ROOT}/frame_0375/frame_0375`, name: '\u5934\u50cf\u68465' },
    { id: 'frame_0378', preview: `${PROFILE_AVATAR_FRAME_UI_ROOT}/frame_0378_preview`, spine: `${PROFILE_AVATAR_FRAME_SPINE_ROOT}/frame_0378/frame_0378`, name: '\u5934\u50cf\u68466' },
    { id: 'frame_0387', preview: `${PROFILE_AVATAR_FRAME_UI_ROOT}/frame_0387_preview`, spine: `${PROFILE_AVATAR_FRAME_SPINE_ROOT}/frame_0387/frame_0387`, name: '\u5934\u50cf\u68467' },
    { id: 'frame_0393', preview: `${PROFILE_AVATAR_FRAME_UI_ROOT}/frame_0393_preview`, spine: `${PROFILE_AVATAR_FRAME_SPINE_ROOT}/frame_0393/frame_0393`, name: '\u5934\u50cf\u68468' },
    { id: 'frame_0414', preview: `${PROFILE_AVATAR_FRAME_UI_ROOT}/frame_0414_preview`, spine: `${PROFILE_AVATAR_FRAME_SPINE_ROOT}/frame_0414/frame_0414`, name: '\u5934\u50cf\u68469' },
    { id: 'frame_0415', preview: `${PROFILE_AVATAR_FRAME_UI_ROOT}/frame_0415_preview`, spine: `${PROFILE_AVATAR_FRAME_SPINE_ROOT}/frame_0415/frame_0415`, name: '\u5934\u50cf\u684610' },
] as const;
export const PROFILE_SETTINGS_UI_ROOT = `${PROFILE_UI_ROOT}/Settings`;
export const UI_PROFILE_SETTINGS_POPUP_BG = `${PROFILE_SETTINGS_UI_ROOT}/profile_settings_popup_bg`;
export const UI_PROFILE_SETTINGS_TITLE_BG = `${PROFILE_SETTINGS_UI_ROOT}/profile_settings_title_bg`;
export const UI_PROFILE_SETTINGS_SLIDER_BG = `${PROFILE_SETTINGS_UI_ROOT}/profile_settings_slider_bg`;
export const UI_PROFILE_SETTINGS_SLIDER_FILL = `${PROFILE_SETTINGS_UI_ROOT}/profile_settings_slider_fill`;
export const UI_PROFILE_SETTINGS_SLIDER_THUMB = `${PROFILE_SETTINGS_UI_ROOT}/profile_settings_slider_thumb`;
export const UI_PROFILE_SETTINGS_TOGGLE_OFF = `${PROFILE_SETTINGS_UI_ROOT}/profile_settings_toggle_off`;
export const UI_PROFILE_SETTINGS_TOGGLE_ON = `${PROFILE_SETTINGS_UI_ROOT}/profile_settings_toggle_on`;
export const PROFILE_SETTINGS_STORAGE_KEY = 'duxiachuan.profile.settings.v3';
export const PROFILE_SETTINGS_POPUP_WIDTH = 650;
export const PROFILE_SETTINGS_POPUP_HEIGHT = 330;
export const PROFILE_SETTINGS_POPUP_Y = 36;
export const PROFILE_SETTINGS_MUTE_OFF_LABEL_X = 16;
export const PROFILE_SETTINGS_MUTE_ON_LABEL_X = -16;
export const PROFILE_POPUP_WIDTH = 700;
export const PROFILE_POPUP_HEIGHT = 430;
export const PROFILE_POPUP_Y = 30;
export const UI_FRAME_NOTICE = `${NOTICE_UI_ROOT}/notice_board_bg`;
export const UI_FRAME_NOTICE_CONTENT = `${NOTICE_UI_ROOT}/notice_content_bg`;
export const UI_NOTICE_BTN_CLOSE = `${NOTICE_UI_ROOT}/notice_btn_close`;
export const UI_FRAME_MAIL = `${MAIL_UI_ROOT}/mail_board_bg`;
export const UI_FRAME_MAIL_DETAIL = `${MAIL_UI_ROOT}/mail_detail_bg`;
export const UI_FRAME_MAIL_ROW = `${MAIL_UI_ROOT}/mail_row_bg`;
export const UI_FRAME_MAIL_TAB_ACTIVE = `${MAIL_UI_ROOT}/mail_tab_active`;
export const UI_FRAME_MAIL_TAB_NORMAL = `${MAIL_UI_ROOT}/mail_tab_normal`;
export const UI_MAIL_ATTACH_ICON = `${MAIL_UI_ROOT}/mail_attach_icon`;
export const UI_MAIL_ATTACH_SLOT = `${MAIL_UI_ROOT}/mail_attach_slot`;
export const UI_MAIL_UNREAD_DOT = `${MAIL_UI_ROOT}/mail_unread_dot`;
export const UI_FRAME_SHOP = `${SHOP_UI_ROOT}/shop_board_bg`;
export const UI_SHOP_PAGE_BG = `${SHOP_UI_ROOT}/shop_page_bg`;
export const UI_SHOP_TITLE_SIGN = `${SHOP_UI_ROOT}/shop_title_sign`;
export const UI_SHOP_ITEM_BG = `${SHOP_UI_ROOT}/shop_item_bg`;
export const UI_SHOP_BUY_BUTTON = `${SHOP_UI_ROOT}/shop_buy_btn`;
export const UI_SHOP_SHELF_BG = `${SHOP_UI_ROOT}/shop_shelf_bg`;
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
export const UI_CONFIRM_POPUP_BG = `${CONFIRM_UI_ROOT}/confirm_popup_bg`;
export const UI_CONFIRM_TITLE_BG = `${CONFIRM_UI_ROOT}/confirm_title_bg`;
export const UI_CONFIRM_MESSAGE_BG = `${CONFIRM_UI_ROOT}/confirm_message_bg`;
export const UI_CONFIRM_QUANTITY_BG = `${CONFIRM_UI_ROOT}/confirm_quantity_bg`;
export const UI_CONFIRM_MINUS_BUTTON = `${CONFIRM_UI_ROOT}/confirm_minus_btn`;
export const UI_CONFIRM_PLUS_BUTTON = `${CONFIRM_UI_ROOT}/confirm_plus_btn`;
export const UI_CONFIRM_CANCEL_BUTTON = `${CONFIRM_UI_ROOT}/confirm_cancel_btn`;
export const UI_CONFIRM_OK_BUTTON = `${CONFIRM_UI_ROOT}/confirm_ok_btn`;
export const UI_CONFIRM_BUTTON_BG = `${CONFIRM_UI_ROOT}/confirm_button_bg`;
export const UI_CONFIRM_MAGIC_BUTTON = `${CONFIRM_UI_ROOT}/confirm_magic_button`;
export const UI_ROLE_PAGE_BG = `${COMMON_UI_ROOT}/common_feature_page_bg`;
export const UI_ROLE_SHOW_STAGE = `${ROLE_UI_ROOT}/role_show_stage`;
export const UI_ROLE_EQUIP_FRAME_LV1 = `${BAG_UI_ROOT}/ItemFrames/item_frame_lv1`;
export const UI_ROLE_EQUIP_SELECTED_FRAME = `${COMMON_UI_ROOT}/common_equip_selected_frame`;
export const UI_ROLE_TAB_EQUIPMENT = `${ROLE_UI_ROOT}/role_tab_equipment`;
export const UI_ROLE_TAB_EQUIPMENT_ACTIVE = `${ROLE_UI_ROOT}/role_tab_equipment_active`;
export const UI_ROLE_TAB_ADVANCE = `${ROLE_UI_ROOT}/role_tab_advance`;
export const UI_ROLE_TAB_ADVANCE_ACTIVE = `${ROLE_UI_ROOT}/role_tab_advance_active`;
export const UI_ROLE_TAB_FORGE = `${ROLE_UI_ROOT}/role_tab_forge`;
export const UI_ROLE_TAB_FORGE_ACTIVE = `${ROLE_UI_ROOT}/role_tab_forge_active`;
export const UI_ROLE_POWER_FRAME = `${ROLE_UI_ROOT}/role_power_frame`;
export const UI_ROLE_POWER_DIGIT_ROOT = `${ROLE_UI_ROOT}/PowerDigits/role_power_digit`;
export const UI_ROLE_POWER_DETAIL_BTN = `${ROLE_UI_ROOT}/role_power_detail_btn`;
export const UI_ROLE_ADVANCE_DETAIL_BG = `${ROLE_UI_ROOT}/role_advance_detail_bg`;
export const UI_ROLE_ADVANCE_CURRENT_ATTR_BG = `${ROLE_UI_ROOT}/role_advance_current_attr_bg`;
export const UI_ROLE_ADVANCE_NEXT_ATTR_BG = `${ROLE_UI_ROOT}/role_advance_next_attr_bg`;
export const UI_ROLE_ADVANCE_EXP_BAR_BG = `${ROLE_UI_ROOT}/role_advance_exp_bar_bg`;
export const UI_ROLE_ADVANCE_EXP_BAR_FILL = `${ROLE_UI_ROOT}/role_advance_exp_bar_fill`;
export const UI_ROLE_ADVANCE_EXP_ORB_ROOT = `${ROLE_UI_ROOT}/AdvanceExpOrbs/advance_exp_orb`;
export const UI_ROLE_ADVANCE_EXP_ORB_FRAME_ROOT = `${BAG_UI_ROOT}/ItemFrames/item_frame_lv`;
export const UI_ROLE_STRENGTHEN_BUTTON = `${ROLE_UI_ROOT}/role_strengthen_button`;
export const UI_ROLE_STRENGTHEN_MATERIAL_BG = `${COMMON_UI_ROOT}/common_upgrade_material_bg`;
export const UI_ROLE_STRENGTHEN_MATERIAL_ROOT = `${ROLE_UI_ROOT}/StrengthenMaterials`;
export const UI_ROLE_SUCCESS_POPUP_BG = `${ROLE_UI_ROOT}/role_success_popup_bg`;
export const UI_ROLE_SUCCESS_ARROW = `${ROLE_UI_ROOT}/role_success_arrow`;
export const UI_ROLE_SUCCESS_POWER_PLUS = `${ROLE_UI_ROOT}/role_success_power_plus`;
export const UI_ROLE_EQUIP_REPLACE_BG = `${COMMON_UI_ROOT}/common_equip_replace_bg`;
export const UI_BAG_PAGE_BG = `${BAG_UI_ROOT}/bag_page_bg`;
export const UI_BAG_FRAME = `${BAG_UI_ROOT}/bag_frame`;
export const UI_BAG_CATEGORY_TAB_ACTIVE = `${BAG_UI_ROOT}/bag_category_tab_active`;
export const UI_BAG_CATEGORY_TAB_NORMAL = `${BAG_UI_ROOT}/bag_category_tab_normal`;
export const UI_BAG_ILLUSTRATION_BTN = `${BAG_UI_ROOT}/bag_illustration_btn`;
export const UI_BAG_ITEM_DETAIL_OBTAIN_BG = `${BAG_UI_ROOT}/bag_item_detail_obtain_bg`;
export const UI_BAG_ITEM_DETAIL_ATTR_FRAME_ROOT = `${BAG_UI_ROOT}/DetailFrames`;
export const UI_BAG_ITEM_DETAIL_ATTR_FRAME_LV1 = `${UI_BAG_ITEM_DETAIL_ATTR_FRAME_ROOT}/item_detail_attr_frame_lv1`;
export const UI_BAG_ITEM_DETAIL_ATTR_FRAME_LV2 = `${UI_BAG_ITEM_DETAIL_ATTR_FRAME_ROOT}/item_detail_attr_frame_lv2`;
export const UI_BAG_ITEM_DETAIL_ATTR_FRAME_LV3 = `${UI_BAG_ITEM_DETAIL_ATTR_FRAME_ROOT}/item_detail_attr_frame_lv3`;
export const UI_BAG_ITEM_DETAIL_ATTR_FRAME_LV4 = `${UI_BAG_ITEM_DETAIL_ATTR_FRAME_ROOT}/item_detail_attr_frame_lv4`;
export const UI_BAG_ITEM_DETAIL_ATTR_FRAME_LV5 = `${UI_BAG_ITEM_DETAIL_ATTR_FRAME_ROOT}/item_detail_attr_frame_lv5`;
export const UI_BAG_ITEM_DETAIL_ATTR_FRAME_LV6 = `${UI_BAG_ITEM_DETAIL_ATTR_FRAME_ROOT}/item_detail_attr_frame_lv6`;
export const UI_BAG_TAB_BAG = `${BAG_UI_ROOT}/bag_tab_bag`;
export const UI_BAG_TAB_BAG_ACTIVE = `${BAG_UI_ROOT}/bag_tab_bag_active`;
export const UI_BAG_TAB_DECOMPOSE = `${BAG_UI_ROOT}/bag_tab_decompose`;
export const UI_BAG_TAB_DECOMPOSE_ACTIVE = `${BAG_UI_ROOT}/bag_tab_decompose_active`;
export const UI_BAG_TAB_BEAST_SYNTH = `${BAG_UI_ROOT}/bag_tab_beast_synth`;
export const UI_BAG_TAB_SYNTH_ACTIVE = `${BAG_UI_ROOT}/bag_tab_synth_active`;
export const UI_BAG_ITEM_FRAME_LV1 = `${BAG_UI_ROOT}/ItemFrames/item_frame_lv1`;
export const UI_BAG_ONE_KEY_LOCK = `${BAG_UI_ROOT}/bag_one_key_lock`;
export const UI_BAG_MODE_ROOT = `${BAG_UI_ROOT}/Mode`;
export const UI_BAG_DECOMPOSE_ARROW = `${UI_BAG_MODE_ROOT}/bag_decompose_arrow`;
export const UI_BAG_SYNTH_PLUS = `${UI_BAG_MODE_ROOT}/bag_synth_plus`;
export const UI_BAG_SYNTH_ARROW = `${UI_BAG_MODE_ROOT}/bag_synth_arrow`;
export const UI_ROLE_EQUIP_ROOT = `${ROLE_UI_ROOT}/Equip`;
export const UI_ROLE_EQUIP_WEAPON = `${UI_ROLE_EQUIP_ROOT}/role_equip_weapon`;
export const UI_ROLE_EQUIP_HELMET = `${UI_ROLE_EQUIP_ROOT}/role_equip_helmet`;
export const UI_ROLE_EQUIP_ARMOR = `${UI_ROLE_EQUIP_ROOT}/role_equip_armor`;
export const UI_ROLE_EQUIP_WRIST = `${UI_ROLE_EQUIP_ROOT}/role_equip_wrist`;
export const UI_ROLE_EQUIP_LEG = `${UI_ROLE_EQUIP_ROOT}/role_equip_leg`;
export const UI_ROLE_EQUIP_SHOES = `${UI_ROLE_EQUIP_ROOT}/role_equip_shoes`;
export const UI_ROLE_EQUIP_NECKLACE = `${UI_ROLE_EQUIP_ROOT}/role_equip_necklace`;
export const UI_ROLE_EQUIP_RING = `${UI_ROLE_EQUIP_ROOT}/role_equip_ring`;
export const BAG_ITEM_DETAIL_ATTR_FRAME_WIDTH = 472;
export const BAG_ITEM_DETAIL_ATTR_FRAME_HEIGHT = 248;
export const BAG_ITEM_DETAIL_TITLE_WIDTH = 486;
export const BAG_ITEM_DETAIL_TITLE_HEIGHT = 84;
export const UI_BOTTOM_FEATURE_MAGIC_BG = `${BOTTOM_FEATURE_UI_ROOT}/magic_page_bg`;
export const UI_MAGIC_SWITCH_LEFT = `${MAGIC_UI_ROOT}/magic_switch_left`;
export const UI_MAGIC_SWITCH_RIGHT = `${MAGIC_UI_ROOT}/magic_switch_right`;
export const UI_MAGIC_ENTER_BUTTON = `${MAGIC_UI_ROOT}/magic_enter_button`;
export const UI_MAGIC_LEVEL_FRAME = `${MAGIC_UI_ROOT}/magic_level_frame`;
export const UI_MAGIC_SCENE_SCROLL_BG = `${MAGIC_UI_ROOT}/magic_scene_scroll_bg`;
export const UI_MAGIC_SCENE_NAME_FRAME = `${MAGIC_UI_ROOT}/magic_scene_name_frame`;
export const UI_MAGIC_CLOUD = `${MAGIC_UI_ROOT}/magic_cloud`;
export const UI_MAGIC_FLOOR_BOARD = `${MAGIC_UI_ROOT}/magic_floor_board`;
export const UI_MAGIC_FLOOR_ROLL = `${MAGIC_UI_ROOT}/magic_floor_roll`;
export const UI_MAGIC_FLOOR_SCROLL_BG = `${MAGIC_UI_ROOT}/magic_floor_scroll_bg`;
export const UI_MAGIC_FLOOR_ROW = `${MAGIC_UI_ROOT}/magic_floor_row`;
export const UI_MAGIC_FLOOR_ENTER_BUTTON = `${MAGIC_UI_ROOT}/magic_floor_enter_button`;
export const UI_MAGIC_FLOOR_MAP = `${MAGIC_UI_ROOT}/magic_floor_map`;
export const UI_MAGIC_BATTLE_BG = `${MAGIC_UI_ROOT}/magic_battle_bg`;
export const UI_MAGIC_HP_FRAME = `${MAGIC_UI_ROOT}/magic_hp_frame`;
export const UI_MAGIC_HP_BAR = `${MAGIC_UI_ROOT}/magic_hp_bar`;
export const UI_MAGIC_DAMAGE_TOGGLE = `${MAGIC_UI_ROOT}/magic_damage_toggle`;
export const UI_MAGIC_DAMAGE_TITLE_FRAME = `${MAGIC_UI_ROOT}/magic_damage_title_frame`;
export const UI_MAGIC_DAMAGE_BAR_FRAME = `${MAGIC_UI_ROOT}/magic_damage_bar_frame`;
export const UI_MAGIC_DAMAGE_HP_BAR = `${MAGIC_UI_ROOT}/magic_damage_hp_bar`;
export const UI_MAGIC_DAMAGE_OUTPUT_BAR = `${MAGIC_UI_ROOT}/magic_damage_output_bar`;
export const UI_MAGIC_DAMAGE_RANK_FRAME = `${MAGIC_UI_ROOT}/magic_damage_rank_frame`;
export const UI_MAGIC_DAMAGE_TRANSLUCENT_FRAME = `${MAGIC_UI_ROOT}/magic_damage_translucent_frame`;
export const UI_MAGIC_DUEL_BUTTON = `${MAGIC_UI_ROOT}/magic_duel_button`;
export const UI_MAGIC_DUEL_POPUP_BG = `${MAGIC_UI_ROOT}/magic_duel_popup_bg`;
export const UI_MAGIC_DUEL_CARD_BG = `${MAGIC_UI_ROOT}/magic_duel_card_bg`;
export const UI_MAGIC_BATTLE_ASSIST_CARD_SLOT_BG = `${MAGIC_UI_ROOT}/magic_battle_assist_card_slot_bg`;
export const UI_MAGIC_BATTLE_ASSIST_CONFIRM_BG = `${MAGIC_UI_ROOT}/magic_battle_assist_confirm_bg`;
export const UI_MAGIC_BATTLE_ASSIST_CONFIRM_TITLE_BG = `${MAGIC_UI_ROOT}/magic_battle_assist_confirm_title_bg`;
export const UI_MAGIC_BATTLE_ASSIST_CONFIRM_BUTTON_BG = `${MAGIC_UI_ROOT}/magic_battle_assist_confirm_button_bg`;
export const UI_MAGIC_FLOOR_ICONS = [
    `${MAGIC_UI_ROOT}/magic_floor_icon_1`,
    `${MAGIC_UI_ROOT}/magic_floor_icon_2`,
    `${MAGIC_UI_ROOT}/magic_floor_icon_3`,
    `${MAGIC_UI_ROOT}/magic_floor_icon_4`,
    `${MAGIC_UI_ROOT}/magic_floor_icon_5`,
    `${MAGIC_UI_ROOT}/magic_floor_icon_6`,
    `${MAGIC_UI_ROOT}/magic_floor_icon_7`,
    `${MAGIC_UI_ROOT}/magic_floor_icon_8`,
    `${MAGIC_UI_ROOT}/magic_floor_icon_9`,
] as const;
export const UI_BEAST_BOTTOM_FRAME = `${BEAST_UI_ROOT}/beast_page_bottom_frame`;
export const UI_BEAST_SWITCH_LEFT = `${BEAST_UI_ROOT}/beast_switch_left`;
export const UI_BEAST_SWITCH_RIGHT = `${BEAST_UI_ROOT}/beast_switch_right`;
export const UI_BEAST_YUANBAO_LARGE = `${BEAST_UI_ROOT}/beast_yuanbao_large`;
export const UI_BEAST_YUANBAO_FRAME = `${BEAST_UI_ROOT}/beast_yuanbao_frame`;
export const UI_BEAST_RECORD_ICON = `${BEAST_UI_ROOT}/beast_record_icon`;
export const UI_BEAST_STRENGTHEN_ICON = `${BEAST_UI_ROOT}/beast_strengthen_icon`;
export const UI_BEAST_STRENGTHEN_BG = `${BEAST_UI_ROOT}/beast_strengthen_bg`;
export const BEAST_STRENGTHEN_UI_ROOT = `${BEAST_UI_ROOT}/Strengthen`;
export const UI_BEAST_STRENGTHEN_EQUIP_STRIP = `${BEAST_STRENGTHEN_UI_ROOT}/beast_strengthen_equip_strip`;
export const UI_BEAST_STRENGTHEN_EQUIP_LOCKED_FRAME = `${BEAST_STRENGTHEN_UI_ROOT}/beast_strengthen_equip_locked_frame`;
export const UI_BEAST_STRENGTHEN_EQUIP_UNLOCKED_FRAME = `${BEAST_STRENGTHEN_UI_ROOT}/beast_strengthen_equip_unlocked_frame`;
export const UI_BEAST_STRENGTHEN_PLUS_ICON = `${BEAST_STRENGTHEN_UI_ROOT}/beast_strengthen_plus_icon`;
export const UI_BEAST_STRENGTHEN_GEM_PANEL = `${BEAST_STRENGTHEN_UI_ROOT}/beast_strengthen_gem_panel`;
export const UI_BEAST_STRENGTHEN_CENTER_EQUIP_FRAME = `${BEAST_STRENGTHEN_UI_ROOT}/beast_strengthen_center_equip_frame`;
export const UI_BEAST_STRENGTHEN_TITLE_FRAME = `${BEAST_STRENGTHEN_UI_ROOT}/beast_strengthen_title_frame`;
export const UI_BEAST_STRENGTHEN_BUTTON_BG = `${BEAST_STRENGTHEN_UI_ROOT}/beast_strengthen_button_bg`;
export const UI_BEAST_STRENGTHEN_LOCK_ICON = `${BEAST_STRENGTHEN_UI_ROOT}/beast_strengthen_lock_icon`;
export const UI_BEAST_STRENGTHEN_POPUP_BG = `${BEAST_STRENGTHEN_UI_ROOT}/beast_strengthen_popup_bg`;
export const UI_BEAST_STRENGTHEN_YUANBAO_RATE_FRAME = `${BEAST_STRENGTHEN_UI_ROOT}/beast_strengthen_yuanbao_rate_frame`;
export const BEAST_RECORD_UI_ROOT = `${BEAST_UI_ROOT}/Record`;
export const UI_BEAST_RECORD_POPUP_BG = `${BEAST_RECORD_UI_ROOT}/beast_record_popup_bg`;
export const UI_BEAST_RECORD_TITLE_FRAME = `${BEAST_RECORD_UI_ROOT}/beast_record_title_frame`;
export const UI_BEAST_RECORD_DIVIDER = `${COMMERCE_UI_ROOT}/beast_record_divider`;
export const UI_SHOWCASE_PAGE_BG = `${SHOWCASE_UI_ROOT}/showcase_page_bg`;
export const UI_SHOWCASE_TITLE_FRAME = `${SHOWCASE_UI_ROOT}/showcase_title_frame`;
export const UI_SHOWCASE_PANEL_BG = `${SHOWCASE_UI_ROOT}/showcase_panel_bg`;
export const UI_SHOWCASE_CHART_PIXEL = `${SHOWCASE_UI_ROOT}/showcase_chart_pixel`;
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
export const UI_DUEL_PAGE_BG = `${DUEL_UI_ROOT}/duel_page_bg`;
export const UI_DUEL_JIANGHU_TAOSHA_BG = `${DUEL_UI_ROOT}/duel_jianghu_taosha_bg`;
export const UI_DUEL_LUANSHI_ZHENGXIONG_BG = `${DUEL_UI_ROOT}/duel_luanshi_zhengxiong_bg`;
export const UI_DUEL_LUANSHI_PK_HP_FRAME = `${DUEL_UI_ROOT}/duel_luanshi_pk_hp_frame`;
export const UI_DUEL_LUANSHI_HP_WUDANG = `${DUEL_UI_ROOT}/duel_luanshi_hp_wudang`;
export const UI_DUEL_LUANSHI_HP_GAIBANG = `${DUEL_UI_ROOT}/duel_luanshi_hp_gaibang`;
export const UI_DUEL_LUANSHI_SKILL_PANEL = `${DUEL_UI_ROOT}/duel_luanshi_skill_panel`;
export const UI_DUEL_LUANSHI_TOGGLE_BUTTON = `${DUEL_UI_ROOT}/duel_luanshi_toggle_button`;
export const UI_DUEL_LUANSHI_RECORD_BUTTON = `${DUEL_UI_ROOT}/duel_luanshi_record_button`;
export const DUEL_LUANSHI_UI_ROOT = `${DUEL_UI_ROOT}/Luanshi`;
export const UI_DUEL_LUANSHI_TIMER_BG = `${DUEL_LUANSHI_UI_ROOT}/luanshi_timer_bg`;
export const UI_DUEL_LUANSHI_DUEL_ICON = `${DUEL_LUANSHI_UI_ROOT}/luanshi_duel_icon`;
export const UI_DUEL_LUANSHI_RESULT_VICTORY_BG = `${DUEL_LUANSHI_UI_ROOT}/luanshi_result_victory_bg`;
export const UI_DUEL_LUANSHI_RESULT_DEFEAT_BG = `${DUEL_LUANSHI_UI_ROOT}/luanshi_result_defeat_bg`;
export const DUEL_LUANSHI_AVATAR_UI_ROOT = `${DUEL_LUANSHI_UI_ROOT}/Avatars`;
export const DUEL_LUANSHI_SKILL_ICON_UI_ROOT = `${DUEL_LUANSHI_UI_ROOT}/SkillIcons`;
export const DUEL_LUANSHI_AVATAR_FRAME_EFFECT_UI_ROOT = `${DUEL_LUANSHI_UI_ROOT}/AvatarFrameEffect`;
export const DUEL_LUANSHI_NUMBER_UI_ROOT = `${DUEL_LUANSHI_UI_ROOT}/Numbers`;
export const DUEL_LUANSHI_DAMAGE_NUMBER_UI_ROOT = `${DUEL_LUANSHI_NUMBER_UI_ROOT}/Damage`;
export const DUEL_LUANSHI_RECEIVED_DAMAGE_NUMBER_UI_ROOT = `${DUEL_LUANSHI_NUMBER_UI_ROOT}/ReceivedDamage`;
export const DUEL_LUANSHI_DEFENSE_NUMBER_UI_ROOT = `${DUEL_LUANSHI_NUMBER_UI_ROOT}/Defense`;
export const DUEL_LUANSHI_CRITICAL_NUMBER_UI_ROOT = `${DUEL_LUANSHI_NUMBER_UI_ROOT}/Critical`;
export const DUEL_LUANSHI_SPINE_ROOT = 'Spine/Duel/Luanshi';
export const UI_DUEL_LUANSHI_JOIN_WUDANG = `${DUEL_LUANSHI_UI_ROOT}/join_wudang`;
export const UI_DUEL_LUANSHI_JOIN_GAIBANG = `${DUEL_LUANSHI_UI_ROOT}/join_gaibang`;
export const UI_DUEL_LUANSHI_SKILL_SLOT = `${DUEL_LUANSHI_SKILL_ICON_UI_ROOT}/skill_slot`;
export const DUEL_LUANSHI_SKILL_ICON_EFFECT_UI_ROOT = `${DUEL_LUANSHI_UI_ROOT}/SkillIconEffects`;
export const DUEL_LUANSHI_AVATAR_ICON_PATHS = [
    `${DUEL_LUANSHI_AVATAR_UI_ROOT}/avatar_01`,
    `${DUEL_LUANSHI_AVATAR_UI_ROOT}/avatar_02`,
    `${DUEL_LUANSHI_AVATAR_UI_ROOT}/avatar_03`,
    `${DUEL_LUANSHI_AVATAR_UI_ROOT}/avatar_04`,
    `${DUEL_LUANSHI_AVATAR_UI_ROOT}/avatar_06`,
    `${DUEL_LUANSHI_AVATAR_UI_ROOT}/avatar_07`,
    `${DUEL_LUANSHI_AVATAR_UI_ROOT}/avatar_08`,
    `${DUEL_LUANSHI_AVATAR_UI_ROOT}/avatar_09`,
    `${DUEL_LUANSHI_AVATAR_UI_ROOT}/avatar_10`,
    `${DUEL_LUANSHI_AVATAR_UI_ROOT}/avatar_11`,
] as const;
export const DUEL_LUANSHI_AVATAR_FRAME_EFFECT_PATHS = [
    `${DUEL_LUANSHI_AVATAR_FRAME_EFFECT_UI_ROOT}/frame_00`,
    `${DUEL_LUANSHI_AVATAR_FRAME_EFFECT_UI_ROOT}/frame_01`,
    `${DUEL_LUANSHI_AVATAR_FRAME_EFFECT_UI_ROOT}/frame_02`,
    `${DUEL_LUANSHI_AVATAR_FRAME_EFFECT_UI_ROOT}/frame_03`,
    `${DUEL_LUANSHI_AVATAR_FRAME_EFFECT_UI_ROOT}/frame_04`,
    `${DUEL_LUANSHI_AVATAR_FRAME_EFFECT_UI_ROOT}/frame_05`,
    `${DUEL_LUANSHI_AVATAR_FRAME_EFFECT_UI_ROOT}/frame_06`,
    `${DUEL_LUANSHI_AVATAR_FRAME_EFFECT_UI_ROOT}/frame_07`,
    `${DUEL_LUANSHI_AVATAR_FRAME_EFFECT_UI_ROOT}/frame_08`,
    `${DUEL_LUANSHI_AVATAR_FRAME_EFFECT_UI_ROOT}/frame_09`,
    `${DUEL_LUANSHI_AVATAR_FRAME_EFFECT_UI_ROOT}/frame_10`,
    `${DUEL_LUANSHI_AVATAR_FRAME_EFFECT_UI_ROOT}/frame_11`,
    `${DUEL_LUANSHI_AVATAR_FRAME_EFFECT_UI_ROOT}/frame_12`,
    `${DUEL_LUANSHI_AVATAR_FRAME_EFFECT_UI_ROOT}/frame_13`,
    `${DUEL_LUANSHI_AVATAR_FRAME_EFFECT_UI_ROOT}/frame_14`,
] as const;
export const DUEL_LUANSHI_SKILL_ICON_EFFECT_FRAME_PATHS = {
    wanjian_jidi: [
        `${DUEL_LUANSHI_SKILL_ICON_EFFECT_UI_ROOT}/wanjian_jidi/frame_00`,
        `${DUEL_LUANSHI_SKILL_ICON_EFFECT_UI_ROOT}/wanjian_jidi/frame_01`,
        `${DUEL_LUANSHI_SKILL_ICON_EFFECT_UI_ROOT}/wanjian_jidi/frame_02`,
        `${DUEL_LUANSHI_SKILL_ICON_EFFECT_UI_ROOT}/wanjian_jidi/frame_03`,
        `${DUEL_LUANSHI_SKILL_ICON_EFFECT_UI_ROOT}/wanjian_jidi/frame_04`,
        `${DUEL_LUANSHI_SKILL_ICON_EFFECT_UI_ROOT}/wanjian_jidi/frame_05`,
        `${DUEL_LUANSHI_SKILL_ICON_EFFECT_UI_ROOT}/wanjian_jidi/frame_06`,
        `${DUEL_LUANSHI_SKILL_ICON_EFFECT_UI_ROOT}/wanjian_jidi/frame_07`,
    ],
    bingjian: [
        `${DUEL_LUANSHI_SKILL_ICON_EFFECT_UI_ROOT}/bingjian/frame_00`,
        `${DUEL_LUANSHI_SKILL_ICON_EFFECT_UI_ROOT}/bingjian/frame_01`,
        `${DUEL_LUANSHI_SKILL_ICON_EFFECT_UI_ROOT}/bingjian/frame_02`,
        `${DUEL_LUANSHI_SKILL_ICON_EFFECT_UI_ROOT}/bingjian/frame_03`,
        `${DUEL_LUANSHI_SKILL_ICON_EFFECT_UI_ROOT}/bingjian/frame_04`,
        `${DUEL_LUANSHI_SKILL_ICON_EFFECT_UI_ROOT}/bingjian/frame_05`,
        `${DUEL_LUANSHI_SKILL_ICON_EFFECT_UI_ROOT}/bingjian/frame_06`,
        `${DUEL_LUANSHI_SKILL_ICON_EFFECT_UI_ROOT}/bingjian/frame_07`,
    ],
    diaozhong: [
        `${DUEL_LUANSHI_SKILL_ICON_EFFECT_UI_ROOT}/diaozhong/frame_00`,
        `${DUEL_LUANSHI_SKILL_ICON_EFFECT_UI_ROOT}/diaozhong/frame_01`,
        `${DUEL_LUANSHI_SKILL_ICON_EFFECT_UI_ROOT}/diaozhong/frame_02`,
        `${DUEL_LUANSHI_SKILL_ICON_EFFECT_UI_ROOT}/diaozhong/frame_03`,
        `${DUEL_LUANSHI_SKILL_ICON_EFFECT_UI_ROOT}/diaozhong/frame_04`,
        `${DUEL_LUANSHI_SKILL_ICON_EFFECT_UI_ROOT}/diaozhong/frame_05`,
        `${DUEL_LUANSHI_SKILL_ICON_EFFECT_UI_ROOT}/diaozhong/frame_06`,
        `${DUEL_LUANSHI_SKILL_ICON_EFFECT_UI_ROOT}/diaozhong/frame_07`,
    ],
    taiji: [
        `${DUEL_LUANSHI_SKILL_ICON_EFFECT_UI_ROOT}/taiji/frame_00`,
        `${DUEL_LUANSHI_SKILL_ICON_EFFECT_UI_ROOT}/taiji/frame_01`,
        `${DUEL_LUANSHI_SKILL_ICON_EFFECT_UI_ROOT}/taiji/frame_02`,
        `${DUEL_LUANSHI_SKILL_ICON_EFFECT_UI_ROOT}/taiji/frame_03`,
        `${DUEL_LUANSHI_SKILL_ICON_EFFECT_UI_ROOT}/taiji/frame_04`,
        `${DUEL_LUANSHI_SKILL_ICON_EFFECT_UI_ROOT}/taiji/frame_05`,
        `${DUEL_LUANSHI_SKILL_ICON_EFFECT_UI_ROOT}/taiji/frame_06`,
        `${DUEL_LUANSHI_SKILL_ICON_EFFECT_UI_ROOT}/taiji/frame_07`,
        `${DUEL_LUANSHI_SKILL_ICON_EFFECT_UI_ROOT}/taiji/frame_08`,
        `${DUEL_LUANSHI_SKILL_ICON_EFFECT_UI_ROOT}/taiji/frame_09`,
        `${DUEL_LUANSHI_SKILL_ICON_EFFECT_UI_ROOT}/taiji/frame_10`,
        `${DUEL_LUANSHI_SKILL_ICON_EFFECT_UI_ROOT}/taiji/frame_11`,
    ],
    guaishou_mengchong: [
        `${DUEL_LUANSHI_SKILL_ICON_EFFECT_UI_ROOT}/guaishou_mengchong/frame_00`,
        `${DUEL_LUANSHI_SKILL_ICON_EFFECT_UI_ROOT}/guaishou_mengchong/frame_01`,
        `${DUEL_LUANSHI_SKILL_ICON_EFFECT_UI_ROOT}/guaishou_mengchong/frame_02`,
        `${DUEL_LUANSHI_SKILL_ICON_EFFECT_UI_ROOT}/guaishou_mengchong/frame_03`,
        `${DUEL_LUANSHI_SKILL_ICON_EFFECT_UI_ROOT}/guaishou_mengchong/frame_04`,
        `${DUEL_LUANSHI_SKILL_ICON_EFFECT_UI_ROOT}/guaishou_mengchong/frame_05`,
        `${DUEL_LUANSHI_SKILL_ICON_EFFECT_UI_ROOT}/guaishou_mengchong/frame_06`,
        `${DUEL_LUANSHI_SKILL_ICON_EFFECT_UI_ROOT}/guaishou_mengchong/frame_07`,
    ],
    huoyan_down: [
        `${DUEL_LUANSHI_SKILL_ICON_EFFECT_UI_ROOT}/huoyan_down/frame_00`,
        `${DUEL_LUANSHI_SKILL_ICON_EFFECT_UI_ROOT}/huoyan_down/frame_01`,
        `${DUEL_LUANSHI_SKILL_ICON_EFFECT_UI_ROOT}/huoyan_down/frame_02`,
        `${DUEL_LUANSHI_SKILL_ICON_EFFECT_UI_ROOT}/huoyan_down/frame_03`,
        `${DUEL_LUANSHI_SKILL_ICON_EFFECT_UI_ROOT}/huoyan_down/frame_04`,
        `${DUEL_LUANSHI_SKILL_ICON_EFFECT_UI_ROOT}/huoyan_down/frame_05`,
        `${DUEL_LUANSHI_SKILL_ICON_EFFECT_UI_ROOT}/huoyan_down/frame_06`,
        `${DUEL_LUANSHI_SKILL_ICON_EFFECT_UI_ROOT}/huoyan_down/frame_07`,
        `${DUEL_LUANSHI_SKILL_ICON_EFFECT_UI_ROOT}/huoyan_down/frame_08`,
        `${DUEL_LUANSHI_SKILL_ICON_EFFECT_UI_ROOT}/huoyan_down/frame_09`,
    ],
    hongjian: [
        `${DUEL_LUANSHI_SKILL_ICON_EFFECT_UI_ROOT}/hongjian/frame_00`,
        `${DUEL_LUANSHI_SKILL_ICON_EFFECT_UI_ROOT}/hongjian/frame_01`,
        `${DUEL_LUANSHI_SKILL_ICON_EFFECT_UI_ROOT}/hongjian/frame_02`,
        `${DUEL_LUANSHI_SKILL_ICON_EFFECT_UI_ROOT}/hongjian/frame_03`,
        `${DUEL_LUANSHI_SKILL_ICON_EFFECT_UI_ROOT}/hongjian/frame_04`,
        `${DUEL_LUANSHI_SKILL_ICON_EFFECT_UI_ROOT}/hongjian/frame_05`,
        `${DUEL_LUANSHI_SKILL_ICON_EFFECT_UI_ROOT}/hongjian/frame_06`,
        `${DUEL_LUANSHI_SKILL_ICON_EFFECT_UI_ROOT}/hongjian/frame_07`,
    ],
    lanse_mofa: [
        `${DUEL_LUANSHI_SKILL_ICON_EFFECT_UI_ROOT}/lanse_mofa/frame_00`,
        `${DUEL_LUANSHI_SKILL_ICON_EFFECT_UI_ROOT}/lanse_mofa/frame_01`,
        `${DUEL_LUANSHI_SKILL_ICON_EFFECT_UI_ROOT}/lanse_mofa/frame_02`,
        `${DUEL_LUANSHI_SKILL_ICON_EFFECT_UI_ROOT}/lanse_mofa/frame_03`,
        `${DUEL_LUANSHI_SKILL_ICON_EFFECT_UI_ROOT}/lanse_mofa/frame_04`,
        `${DUEL_LUANSHI_SKILL_ICON_EFFECT_UI_ROOT}/lanse_mofa/frame_05`,
        `${DUEL_LUANSHI_SKILL_ICON_EFFECT_UI_ROOT}/lanse_mofa/frame_06`,
        `${DUEL_LUANSHI_SKILL_ICON_EFFECT_UI_ROOT}/lanse_mofa/frame_07`,
        `${DUEL_LUANSHI_SKILL_ICON_EFFECT_UI_ROOT}/lanse_mofa/frame_08`,
        `${DUEL_LUANSHI_SKILL_ICON_EFFECT_UI_ROOT}/lanse_mofa/frame_09`,
        `${DUEL_LUANSHI_SKILL_ICON_EFFECT_UI_ROOT}/lanse_mofa/frame_10`,
        `${DUEL_LUANSHI_SKILL_ICON_EFFECT_UI_ROOT}/lanse_mofa/frame_11`,
    ],
} as const;
export const DUEL_LUANSHI_SKILL_COST_YUANBAO = 80;
export const DUEL_LUANSHI_SKILL_CONFIGS = [
    { id: 'wanjian_jidi', label: '\u4e07\u5251\u51fb\u5730', yuanbaoCost: DUEL_LUANSHI_SKILL_COST_YUANBAO, iconPath: `${DUEL_LUANSHI_SKILL_ICON_UI_ROOT}/skill_wanjian_jidi`, frameEffectPaths: DUEL_LUANSHI_SKILL_ICON_EFFECT_FRAME_PATHS.wanjian_jidi, spinePath: `${DUEL_LUANSHI_SPINE_ROOT}/wanjian_jidi/specialAtk147003-1` },
    { id: 'bingjian', label: '\u51b0\u5251', yuanbaoCost: DUEL_LUANSHI_SKILL_COST_YUANBAO, iconPath: `${DUEL_LUANSHI_SKILL_ICON_UI_ROOT}/skill_bingjian`, frameEffectPaths: DUEL_LUANSHI_SKILL_ICON_EFFECT_FRAME_PATHS.bingjian, spinePath: `${DUEL_LUANSHI_SPINE_ROOT}/bingjian/magicSkill1403` },
    { id: 'diaozhong', label: '\u540a\u949f', yuanbaoCost: DUEL_LUANSHI_SKILL_COST_YUANBAO, iconPath: `${DUEL_LUANSHI_SKILL_ICON_UI_ROOT}/skill_diaozhong`, frameEffectPaths: DUEL_LUANSHI_SKILL_ICON_EFFECT_FRAME_PATHS.diaozhong, spinePath: `${DUEL_LUANSHI_SPINE_ROOT}/diaozhong/magicSkill1301` },
    { id: 'taiji', label: '\u592a\u6781', yuanbaoCost: DUEL_LUANSHI_SKILL_COST_YUANBAO, frameEffectSize: 150, iconPath: `${DUEL_LUANSHI_SKILL_ICON_UI_ROOT}/skill_taiji`, frameEffectPaths: DUEL_LUANSHI_SKILL_ICON_EFFECT_FRAME_PATHS.taiji, spinePath: `${DUEL_LUANSHI_SPINE_ROOT}/taiji/magicSkill1406` },
    { id: 'guaishou_mengchong', label: '\u602a\u517d\u731b\u51b2', yuanbaoCost: DUEL_LUANSHI_SKILL_COST_YUANBAO, frameEffectSize: 170, iconPath: `${DUEL_LUANSHI_SKILL_ICON_UI_ROOT}/skill_guaishou_mengchong`, frameEffectPaths: DUEL_LUANSHI_SKILL_ICON_EFFECT_FRAME_PATHS.guaishou_mengchong, spinePath: `${DUEL_LUANSHI_SPINE_ROOT}/guaishou_mengchong/magicSkill1404` },
    { id: 'huoyan_down', label: '\u706b\u7130\u4e0b\u5288', yuanbaoCost: DUEL_LUANSHI_SKILL_COST_YUANBAO, iconPath: `${DUEL_LUANSHI_SKILL_ICON_UI_ROOT}/skill_huoyan_down`, frameEffectPaths: DUEL_LUANSHI_SKILL_ICON_EFFECT_FRAME_PATHS.huoyan_down, spinePath: `${DUEL_LUANSHI_SPINE_ROOT}/huoyan_down/H043_Special` },
    { id: 'hongjian', label: '\u7ea2\u5251', yuanbaoCost: DUEL_LUANSHI_SKILL_COST_YUANBAO, iconPath: `${DUEL_LUANSHI_SKILL_ICON_UI_ROOT}/skill_hongjian`, frameEffectPaths: DUEL_LUANSHI_SKILL_ICON_EFFECT_FRAME_PATHS.hongjian, spinePath: `${DUEL_LUANSHI_SPINE_ROOT}/hongjian/magicSkill1201` },
    { id: 'lanse_mofa', label: '\u84dd\u8272\u9b54\u6cd5', yuanbaoCost: DUEL_LUANSHI_SKILL_COST_YUANBAO, frameEffectSize: 160, iconPath: `${DUEL_LUANSHI_SKILL_ICON_UI_ROOT}/skill_lanse_mofa`, frameEffectPaths: DUEL_LUANSHI_SKILL_ICON_EFFECT_FRAME_PATHS.lanse_mofa, spinePath: `${DUEL_LUANSHI_SPINE_ROOT}/lanse_mofa/H041_Special` },
] as const;
export const DUEL_LUANSHI_DAMAGE_DIGIT_PATHS = [
    `${DUEL_LUANSHI_RECEIVED_DAMAGE_NUMBER_UI_ROOT}/jy_0`,
    `${DUEL_LUANSHI_RECEIVED_DAMAGE_NUMBER_UI_ROOT}/jy_1`,
    `${DUEL_LUANSHI_RECEIVED_DAMAGE_NUMBER_UI_ROOT}/jy_2`,
    `${DUEL_LUANSHI_RECEIVED_DAMAGE_NUMBER_UI_ROOT}/jy_3`,
    `${DUEL_LUANSHI_RECEIVED_DAMAGE_NUMBER_UI_ROOT}/jy_4`,
    `${DUEL_LUANSHI_RECEIVED_DAMAGE_NUMBER_UI_ROOT}/jy_5`,
    `${DUEL_LUANSHI_RECEIVED_DAMAGE_NUMBER_UI_ROOT}/jy_6`,
    `${DUEL_LUANSHI_RECEIVED_DAMAGE_NUMBER_UI_ROOT}/jy_7`,
    `${DUEL_LUANSHI_RECEIVED_DAMAGE_NUMBER_UI_ROOT}/jy_8`,
    `${DUEL_LUANSHI_RECEIVED_DAMAGE_NUMBER_UI_ROOT}/jy_9`,
] as const;
export const UI_DUEL_LUANSHI_RECEIVED_DAMAGE_MINUS = `${DUEL_LUANSHI_RECEIVED_DAMAGE_NUMBER_UI_ROOT}/jy_minus`;
export const DUEL_LUANSHI_DEFENSE_DIGIT_PATHS = [
    `${DUEL_LUANSHI_DEFENSE_NUMBER_UI_ROOT}/6_0`,
    `${DUEL_LUANSHI_DEFENSE_NUMBER_UI_ROOT}/6_1`,
    `${DUEL_LUANSHI_DEFENSE_NUMBER_UI_ROOT}/6_2`,
    `${DUEL_LUANSHI_DEFENSE_NUMBER_UI_ROOT}/6_3`,
    `${DUEL_LUANSHI_DEFENSE_NUMBER_UI_ROOT}/6_4`,
    `${DUEL_LUANSHI_DEFENSE_NUMBER_UI_ROOT}/6_5`,
    `${DUEL_LUANSHI_DEFENSE_NUMBER_UI_ROOT}/6_6`,
    `${DUEL_LUANSHI_DEFENSE_NUMBER_UI_ROOT}/6_7`,
    `${DUEL_LUANSHI_DEFENSE_NUMBER_UI_ROOT}/6_8`,
    `${DUEL_LUANSHI_DEFENSE_NUMBER_UI_ROOT}/6_9`,
] as const;
export const UI_DUEL_LUANSHI_DEFENSE_PLUS = `${DUEL_LUANSHI_DEFENSE_NUMBER_UI_ROOT}/6_+`;
export const UI_DUEL_LUANSHI_CRITICAL_BAO = `${DUEL_LUANSHI_CRITICAL_NUMBER_UI_ROOT}/1`;
export const UI_DUEL_LUANSHI_CRITICAL_JI = `${DUEL_LUANSHI_CRITICAL_NUMBER_UI_ROOT}/6`;
export const UI_DUEL_LUANSHI_CRITICAL_DOT = `${DUEL_LUANSHI_CRITICAL_NUMBER_UI_ROOT}/2`;
export const UI_DUEL_LUANSHI_CRITICAL_WAN = `${DUEL_LUANSHI_CRITICAL_NUMBER_UI_ROOT}/4`;
export const UI_DUEL_LUANSHI_CRITICAL_MINUS = `${DUEL_LUANSHI_CRITICAL_NUMBER_UI_ROOT}/18`;
export const DUEL_LUANSHI_CRITICAL_DIGIT_PATHS = [
    `${DUEL_LUANSHI_CRITICAL_NUMBER_UI_ROOT}/15`,
    `${DUEL_LUANSHI_CRITICAL_NUMBER_UI_ROOT}/5`,
    `${DUEL_LUANSHI_CRITICAL_NUMBER_UI_ROOT}/11`,
    `${DUEL_LUANSHI_CRITICAL_NUMBER_UI_ROOT}/9`,
    `${DUEL_LUANSHI_CRITICAL_NUMBER_UI_ROOT}/7`,
    `${DUEL_LUANSHI_CRITICAL_NUMBER_UI_ROOT}/8`,
    `${DUEL_LUANSHI_CRITICAL_NUMBER_UI_ROOT}/13`,
    `${DUEL_LUANSHI_CRITICAL_NUMBER_UI_ROOT}/10`,
    `${DUEL_LUANSHI_CRITICAL_NUMBER_UI_ROOT}/17`,
    `${DUEL_LUANSHI_CRITICAL_NUMBER_UI_ROOT}/14`,
] as const;
export type DuelLuanshiFaction = 'wudang' | 'gaibang';
export type DuelLuanshiSkillConfig = typeof DUEL_LUANSHI_SKILL_CONFIGS[number];
export const DUEL_PAGE_BG_WIDTH = VIEW_WIDTH;
export const DUEL_PAGE_BG_HEIGHT = VIEW_HEIGHT;
export const DUEL_PAGE_BG_PAN_X = (DUEL_PAGE_BG_WIDTH - VIEW_WIDTH) / 2;
export const DUEL_PAGE_BG_PAN_DURATION = 28;
export const DUEL_LUANSHI_ZHENGXIONG_BG_WIDTH = 2888;
export const DUEL_LUANSHI_ZHENGXIONG_BG_HEIGHT = VIEW_HEIGHT;
export const DUEL_LUANSHI_ZHENGXIONG_BG_PAN_X = (DUEL_LUANSHI_ZHENGXIONG_BG_WIDTH - VIEW_WIDTH) / 2;
export const DUEL_LUANSHI_ZHENGXIONG_BG_PAN_DURATION = 28;
export const DUEL_BACK_X = -300;
export const DUEL_BACK_Y = -720;
export const DUEL_LUANSHI_PK_FRAME_WIDTH = VIEW_WIDTH;
export const DUEL_LUANSHI_PK_FRAME_HEIGHT = 73;
export const DUEL_LUANSHI_PK_FRAME_Y = 650;
export const DUEL_LUANSHI_HP_WIDTH = 304;
export const DUEL_LUANSHI_HP_HEIGHT = 16;
export const DUEL_LUANSHI_HP_Y = 650;
export const DUEL_LUANSHI_HP_LEFT_X = -164;
export const DUEL_LUANSHI_HP_RIGHT_X = 164;
export const DUEL_LUANSHI_TIMER_BG_WIDTH = 360;
export const DUEL_LUANSHI_TIMER_BG_HEIGHT = 58;
export const DUEL_LUANSHI_PERIOD_TAG_WIDTH = 136;
export const DUEL_LUANSHI_PERIOD_TAG_HEIGHT = 34;
export const DUEL_LUANSHI_PERIOD_TAG_Y = -47;
export const DUEL_LUANSHI_PERIOD_LABEL_FONT_SIZE = 20;
export const DUEL_LUANSHI_HP_PERCENT_LABEL_Y = 0;
export const DUEL_LUANSHI_HP_PERCENT_LABEL_WIDTH = 126;
export const DUEL_LUANSHI_HP_PERCENT_LABEL_HEIGHT = 30;
export const DUEL_LUANSHI_ROUND_SECONDS = 20;
export const DUEL_LUANSHI_SKILL_PHASE_SECONDS = 10;
export const DUEL_LUANSHI_SETTLE_PHASE_SECONDS = DUEL_LUANSHI_ROUND_SECONDS - DUEL_LUANSHI_SKILL_PHASE_SECONDS;
export const DUEL_LUANSHI_ROUND_START_ICON_WIDTH = 280;
export const DUEL_LUANSHI_ROUND_START_ICON_HEIGHT = 266;
export const DUEL_LUANSHI_ROUND_START_ICON_Y = 130;
export const DUEL_LUANSHI_RESULT_POPUP_WIDTH = 620;
export const DUEL_LUANSHI_RESULT_VICTORY_POPUP_HEIGHT = 460;
export const DUEL_LUANSHI_RESULT_DEFEAT_POPUP_HEIGHT = 442;
export const DUEL_LUANSHI_RESULT_REWARD_YUANBAO = 100;
export const DUEL_LUANSHI_RESULT_POPUP_SECONDS = 3.2;
export const DUEL_LUANSHI_CAMP_POWER_START = 100;
export const DUEL_LUANSHI_CAMP_POWER_MIN = 28;
export const DUEL_LUANSHI_CAMP_POWER_MAX = 126;
export const DUEL_LUANSHI_BOTTOM_DOCK_EXPANDED_Y = 0;
export const DUEL_LUANSHI_BOTTOM_DOCK_COLLAPSED_Y = -408;
export const DUEL_LUANSHI_BOTTOM_DOCK_TWEEN_SECONDS = 0.24;
export const DUEL_LUANSHI_SKILL_PANEL_WIDTH = VIEW_WIDTH;
export const DUEL_LUANSHI_SKILL_PANEL_HEIGHT = 411;
export const DUEL_LUANSHI_SKILL_PANEL_Y = -607;
export const DUEL_LUANSHI_TOGGLE_WIDTH = 82;
export const DUEL_LUANSHI_TOGGLE_HEIGHT = 51;
export const DUEL_LUANSHI_TOGGLE_Y = -377;
export const DUEL_LUANSHI_SIDE_BUTTON_SIZE = 95;
export const DUEL_LUANSHI_SIDE_BUTTON_Y = -344;
export const DUEL_LUANSHI_BACK_X = -305;
export const DUEL_LUANSHI_RECORD_X = 322;
export const DUEL_LUANSHI_TIMER_Y = 724;
export const DUEL_LUANSHI_AVATAR_SIZE = 78;
export const DUEL_LUANSHI_AVATAR_EFFECT_SIZE = 116;
export const DUEL_LUANSHI_AVATAR_ROAM_RADIUS_X = 34;
export const DUEL_LUANSHI_AVATAR_ROAM_RADIUS_Y = 24;
export const DUEL_LUANSHI_AVATAR_ROAM_SECONDS_MIN = 2.8;
export const DUEL_LUANSHI_AVATAR_ROAM_SECONDS_MAX = 5.8;
export const DUEL_LUANSHI_SKILL_SLOT_WIDTH = 112;
export const DUEL_LUANSHI_SKILL_SLOT_HEIGHT = 128;
export const DUEL_LUANSHI_SKILL_ICON_SIZE = 92;
export const DUEL_LUANSHI_SKILL_ICON_EFFECT_SIZE = 118;
export const DUEL_LUANSHI_SKILL_ICON_EFFECT_FPS = 12;
export const DUEL_LUANSHI_SKILL_COST_ICON_SIZE = 22;
export const DUEL_LUANSHI_SKILL_COST_FONT_SIZE = 18;
export const DUEL_LUANSHI_SKILL_COST_Y = -46;
export const DUEL_LUANSHI_NORMAL_ATTACK_LEFT_SPINE = `${DUEL_LUANSHI_SPINE_ROOT}/normal_left_attack/simayi_phyattack_1`;
export const DUEL_LUANSHI_NORMAL_ATTACK_RIGHT_SPINE = `${DUEL_LUANSHI_SPINE_ROOT}/normal_right_attack/sunjian_phyattack`;
export const DUEL_LUANSHI_NORMAL_ATTACK_EFFECT_WIDTH = 520;
export const DUEL_LUANSHI_NORMAL_ATTACK_EFFECT_HEIGHT = 320;
export const DUEL_LUANSHI_NORMAL_ATTACK_LEFT_SCALE = 0.42;
export const DUEL_LUANSHI_NORMAL_ATTACK_RIGHT_SCALE = 0.46;
export const DUEL_LUANSHI_NORMAL_ATTACK_DELAY_MIN = 0.44;
export const DUEL_LUANSHI_NORMAL_ATTACK_DELAY_MAX = 1.04;
export const DUEL_LUANSHI_NORMAL_ATTACK_TRAVEL_SECONDS_MIN = 0.24;
export const DUEL_LUANSHI_NORMAL_ATTACK_TRAVEL_SECONDS_MAX = 0.42;
export const DUEL_LUANSHI_NORMAL_ATTACK_EFFECT_POOL_SIZE = 10;
export const DUEL_LUANSHI_NORMAL_ATTACK_CRITICAL_RATE = 0.18;
export const DUEL_LUANSHI_AVATAR_HIT_SHAKE_X = 10;
export const DUEL_LUANSHI_AVATAR_HIT_SHAKE_Y = 5;
export const DUEL_LUANSHI_JOIN_LAYER_HEIGHT = 1220;
export const DUEL_LUANSHI_JOIN_BUTTON_WIDTH = 212;
export const DUEL_LUANSHI_JOIN_BUTTON_HEIGHT = 60;
export const DUEL_LUANSHI_JOIN_BUTTON_Y = -520;
export const DUEL_LUANSHI_SKILL_EFFECT_SCALE = 0.9;
export const DUEL_LUANSHI_BLUE_MAGIC_SKILL_EFFECT_SCALE = 0.72;
export const DUEL_LUANSHI_DEFENSE_SKILL_EFFECT_SCALE = 1.22;
export const DUEL_LUANSHI_SKILL_EFFECT_START_X = 150;
export const DUEL_LUANSHI_SKILL_EFFECT_TARGET_X = 205;
export const DUEL_LUANSHI_BLUE_MAGIC_SKILL_EFFECT_TARGET_X = 112;
export const DUEL_LUANSHI_SKILL_EFFECT_Y = 60;
export const DUEL_LUANSHI_DEFENSE_SKILL_EFFECT_Y = 130;
export const DUEL_LUANSHI_SKILL_EFFECT_TRAVEL_SECONDS = 0.32;
export const DUEL_LUANSHI_AUTO_SKILL_DELAY_MIN = 0.56;
export const DUEL_LUANSHI_AUTO_SKILL_DELAY_MAX = 1.24;
export const DUEL_LUANSHI_AUTO_SKILL_Y_MIN = -40;
export const DUEL_LUANSHI_AUTO_SKILL_Y_MAX = 285;
export const DUEL_LUANSHI_AUTO_EFFECT_POOL_SIZE = 10;
export const DUEL_LUANSHI_AUTO_ATTACK_SKILL_WEIGHT = 1;
export const DUEL_LUANSHI_AUTO_DEFENSE_SKILL_WEIGHT = 0.22;
export const UI_DUEL_ROOM_NAME_CURRENCY_BG = `${DUEL_UI_ROOT}/duel_room_name_currency_bg`;
export const UI_DUEL_YUANBAO_ICON = `${DUEL_UI_ROOT}/duel_yuanbao_icon`;
export const UI_DUEL_INVEST_BUTTON_BG = `${DUEL_UI_ROOT}/duel_invest_button_bg`;
export const UI_DUEL_AMOUNT_INPUT_BG = `${DUEL_UI_ROOT}/duel_amount_input_bg`;
export const UI_DUEL_JIANGHU_KILLER_TIMER_BG = `${DUEL_UI_ROOT}/duel_jianghu_killer_timer_bg`;
export const UI_DUEL_JIANGHU_PERIOD_BG = `${DUEL_UI_ROOT}/duel_jianghu_period_bg`;
export const UI_DUEL_JIANGHU_ROOM_HIGHLIGHT_FRAME = `${DUEL_UI_ROOT}/duel_jianghu_room_highlight_frame`;
export const UI_DUEL_JIANGHU_PLAYER_ARROW = `${DUEL_UI_ROOT}/duel_jianghu_player_arrow`;
export const UI_DUEL_JIANGHU_RESULT_POPUP_BG = `${DUEL_UI_ROOT}/duel_jianghu_result_popup_bg`;
export const UI_DUEL_JIANGHU_RECORD_ICON = `${DUEL_UI_ROOT}/duel_jianghu_record_icon`;
export const UI_DUEL_JIANGHU_RANK_ICON = `${DUEL_UI_ROOT}/duel_jianghu_rank_icon`;
export const DUEL_JIANGHU_RECORD_UI_ROOT = `${DUEL_UI_ROOT}/Record`;
export const UI_DUEL_JIANGHU_RECORD_BG = `${DUEL_JIANGHU_RECORD_UI_ROOT}/duel_jianghu_record_bg`;
export const UI_DUEL_JIANGHU_RECORD_STAT_PANEL = `${DUEL_JIANGHU_RECORD_UI_ROOT}/duel_jianghu_record_stat_panel`;
export const UI_DUEL_JIANGHU_RECORD_TITLE_BAR = `${DUEL_JIANGHU_RECORD_UI_ROOT}/duel_jianghu_record_title_bar`;
export const UI_DUEL_JIANGHU_RECORD_ROOM_CELL = `${DUEL_JIANGHU_RECORD_UI_ROOT}/duel_jianghu_record_room_cell`;
export const UI_DUEL_JIANGHU_RECORD_PERSONAL_ROW = `${DUEL_JIANGHU_RECORD_UI_ROOT}/duel_jianghu_record_personal_row`;
export const DUEL_JIANGHU_RECORD_PERSONAL_ROW_SCALE = 1.1;
export const DUEL_JIANGHU_RECORD_PERSONAL_ROW_START_Y = 132;
export const DUEL_JIANGHU_RECORD_PERSONAL_ROW_STEP = 174;
export const DUEL_JIANGHU_RANK_UI_ROOT = `${DUEL_UI_ROOT}/Rank`;
export const UI_DUEL_JIANGHU_RANK_BG = `${DUEL_JIANGHU_RANK_UI_ROOT}/duel_jianghu_rank_bg`;
export const UI_DUEL_JIANGHU_RANK_TOP1_BG = `${DUEL_JIANGHU_RANK_UI_ROOT}/duel_jianghu_rank_top1_bg`;
export const UI_DUEL_JIANGHU_RANK_TOP2_BG = `${DUEL_JIANGHU_RANK_UI_ROOT}/duel_jianghu_rank_top2_bg`;
export const UI_DUEL_JIANGHU_RANK_TOP3_BG = `${DUEL_JIANGHU_RANK_UI_ROOT}/duel_jianghu_rank_top3_bg`;
export const UI_DUEL_JIANGHU_RANK_ROW_BG = `${DUEL_JIANGHU_RANK_UI_ROOT}/duel_jianghu_rank_row_bg`;
export const UI_DUEL_JIANGHU_RANK_TAB_ACTIVE = `${DUEL_JIANGHU_RANK_UI_ROOT}/duel_jianghu_rank_tab_active`;
export const UI_DUEL_JIANGHU_RANK_TAB_INACTIVE = `${DUEL_JIANGHU_RANK_UI_ROOT}/duel_jianghu_rank_tab_inactive`;
export const DUEL_GAMEPLAY_TAG_WIDTH = 735;
export const DUEL_GAMEPLAY_TAG_HEIGHT = 235;
export const DUEL_GAMEPLAY_NAME_WIDTH = 280;
export const DUEL_GAMEPLAY_NAME_HEIGHT = 76;
export const DUEL_GAMEPLAY_NAME_X = -238;
export const DUEL_GAMEPLAY_NAME_Y = 14;
export const DUEL_GAMEPLAY_TAGS = [
    {
        id: 'luanshi_zhengxiong',
        label: '\u4e71\u4e16\u4e89\u96c4',
        nodeName: 'DuelGameplayTag_1',
        labelNodeName: 'DuelGameplayName_1',
        skinPath: `${DUEL_UI_ROOT}/GameplayTags/duel_gameplay_luanshi_zhengxiong`,
        y: -118,
    },
    {
        id: 'guxu_tanbao',
        label: '\u53e4\u589f\u63a2\u5b9d',
        nodeName: 'DuelGameplayTag_2',
        labelNodeName: 'DuelGameplayName_2',
        skinPath: `${DUEL_UI_ROOT}/GameplayTags/duel_gameplay_guxu_tanbao`,
        y: 160,
    },
    {
        id: 'jianghu_taosha',
        label: '\u6c5f\u6e56\u9003\u6740',
        nodeName: 'DuelGameplayTag_3',
        labelNodeName: 'DuelGameplayName_3',
        skinPath: `${DUEL_UI_ROOT}/GameplayTags/duel_gameplay_jianghu_taosha`,
        y: 438,
    },
    {
        id: 'taxian_chumo',
        label: '\u8e0f\u9669\u9664\u9b54',
        nodeName: 'DuelGameplayTag_4',
        labelNodeName: 'DuelGameplayName_4',
        skinPath: `${DUEL_UI_ROOT}/GameplayTags/duel_gameplay_taxian_chumo`,
        y: -396,
    },
] as const;
export type DuelGameplayId = typeof DUEL_GAMEPLAY_TAGS[number]['id'];
export const DUEL_JIANGHU_KILLER_SECONDS = '20';
export const DUEL_JIANGHU_ROUND_SECONDS = 20;
export const DUEL_JIANGHU_INVEST_SWITCH_LOCK_SECONDS = 3;
export const DUEL_JIANGHU_CURRENT_PERIOD = '15472';
export const DUEL_JIANGHU_TOP_ROOT_WIDTH = 610;
export const DUEL_JIANGHU_TOP_ROOT_HEIGHT = 170;
export const DUEL_JIANGHU_TOP_ROOT_X = 0;
export const DUEL_JIANGHU_TOP_ROOT_Y = 686;
export const DUEL_JIANGHU_KILLER_TIMER_WIDTH = 360;
export const DUEL_JIANGHU_KILLER_TIMER_HEIGHT = 104;
export const DUEL_JIANGHU_KILLER_TIMER_X = -95;
export const DUEL_JIANGHU_KILLER_TIMER_Y = 54;
export const DUEL_JIANGHU_PERIOD_WIDTH = 212;
export const DUEL_JIANGHU_PERIOD_HEIGHT = 46;
export const DUEL_JIANGHU_PERIOD_X = -210;
export const DUEL_JIANGHU_PERIOD_Y = -36;
export const DUEL_JIANGHU_YUANBAO_AMOUNT_WIDTH = 226;
export const DUEL_JIANGHU_YUANBAO_AMOUNT_HEIGHT = 56;
export const DUEL_JIANGHU_YUANBAO_AMOUNT_X = 116;
export const DUEL_JIANGHU_YUANBAO_AMOUNT_Y = -36;
export const DUEL_JIANGHU_ROOM_LABEL_WIDTH = 194;
export const DUEL_JIANGHU_ROOM_LABEL_HEIGHT = 58;
export const DUEL_JIANGHU_INVEST_DEFAULT_AMOUNT = '1';
export const DUEL_JIANGHU_INVEST_ROOT_Y = -666;
export const DUEL_JIANGHU_INVEST_INPUT_Y = 58;
export const DUEL_JIANGHU_INVEST_BUTTON_Y = -24;
export const DUEL_JIANGHU_INVEST_INPUT_WIDTH = 226;
export const DUEL_JIANGHU_INVEST_INPUT_HEIGHT = 56;
export const DUEL_JIANGHU_INVEST_BUTTON_WIDTH = 260;
export const DUEL_JIANGHU_INVEST_BUTTON_HEIGHT = 92;
export const DUEL_JIANGHU_SIDE_BUTTON_ROOT_X = 304;
export const DUEL_JIANGHU_SIDE_BUTTON_ROOT_Y = -558;
export const DUEL_JIANGHU_SIDE_BUTTON_ROOT_WIDTH = 118;
export const DUEL_JIANGHU_SIDE_BUTTON_ROOT_HEIGHT = 220;
export const DUEL_JIANGHU_SIDE_BUTTON_SIZE = 86;
export const DUEL_JIANGHU_SIDE_BUTTON_GAP = 108;
export const DUEL_JIANGHU_ACTOR_ROOT_WIDTH = VIEW_WIDTH;
export const DUEL_JIANGHU_ACTOR_ROOT_HEIGHT = VIEW_HEIGHT;
export const DUEL_JIANGHU_NPC_PER_ROOM = 10;
export const DUEL_JIANGHU_LOBBY_NPC_COUNT = 26;
export const DUEL_JIANGHU_COMMON_ACTOR_SCALE = 0.125;
export const DUEL_JIANGHU_KILLER_ACTOR_SCALE = 0.2;
export const DUEL_JIANGHU_SPECIAL_ACTOR_SCALE = 0.18;
export const DUEL_JIANGHU_ROOM_HIGHLIGHT_SELECTED_OPACITY = 145;
export const DUEL_JIANGHU_ACTOR_LABEL_Y = 60;
export const DUEL_JIANGHU_PLAYER_ARROW_Y = 92;
export const DUEL_JIANGHU_PLAYER_ARROW_WIDTH = 24;
export const DUEL_JIANGHU_PLAYER_ARROW_HEIGHT = 38;
export const DUEL_JIANGHU_ENTRY_X = 0;
export const DUEL_JIANGHU_ENTRY_Y = -566;
export const DUEL_JIANGHU_EXIT_X = 0;
export const DUEL_JIANGHU_EXIT_Y = -610;
export const DUEL_JIANGHU_KILLER_ENTRY_X = 0;
export const DUEL_JIANGHU_KILLER_ENTRY_Y = -566;
export const DUEL_JIANGHU_LOBBY_AREA_X = 0;
export const DUEL_JIANGHU_LOBBY_AREA_Y = -505;
export const DUEL_JIANGHU_LOBBY_AREA_WIDTH = 520;
export const DUEL_JIANGHU_LOBBY_AREA_HEIGHT = 170;
export const DUEL_JIANGHU_ROUTE_POINT_SIZE = 32;
export const DUEL_JIANGHU_ROUTE_START_X = 0;
export const DUEL_JIANGHU_ROUTE_START_Y = -535;
export const DUEL_JIANGHU_ROUTE_TURN1_X = 165;
export const DUEL_JIANGHU_ROUTE_TURN1_Y = -535;
export const DUEL_JIANGHU_ROUTE_TURN2_X = 165;
export const DUEL_JIANGHU_ROUTE_TURN2_Y = -430;
export const DUEL_JIANGHU_ROUTE_TURN3_X = 0;
export const DUEL_JIANGHU_ROUTE_TURN3_Y = -430;
export const DUEL_JIANGHU_ROUTE_TURN4_X = 0;
export const DUEL_JIANGHU_ROUTE_TURN4_Y = 80;
export const DUEL_JIANGHU_ROUTE_TURN5_X = 0;
export const DUEL_JIANGHU_ROUTE_TURN5_Y = 315;
export const DUEL_JIANGHU_ROUTE_TURN6_X = 165;
export const DUEL_JIANGHU_ROUTE_TURN6_Y = 80;
export const DUEL_JIANGHU_ROUTE_TURN7_X = -16;
export const DUEL_JIANGHU_ROUTE_TURN7_Y = -115.94;
export const DUEL_JIANGHU_ACTOR_WALK_STEP_TIME = 0.55;
export const DUEL_JIANGHU_KILLER_WALK_STEP_TIME = 0.42;
export const DUEL_JIANGHU_ATTACK_WAIT_TIME = 1.2;
export const DUEL_JIANGHU_ROOM_DOOR_PAUSE_TIME = 0;
export const DUEL_JIANGHU_HURT_WAIT_TIME = 0.38;
export const DUEL_JIANGHU_COUNTER_HIT_DELAY = 0.32;
export const DUEL_JIANGHU_KILLER_ATTACK_HURT_DELAY = 0.25;
export const DUEL_JIANGHU_KILLER_ATTACK_REPEAT_COUNT = 3;
export const DUEL_JIANGHU_KILLER_ATTACK_REPEAT_WAIT_TIME = 0.48;
export const DUEL_JIANGHU_RESULT_POPUP_WIDTH = 725;
export const DUEL_JIANGHU_RESULT_POPUP_HEIGHT = 505;
export const DUEL_JIANGHU_SPINE_ROOT = 'Spine/Duel/JianghuTaosha';
export const DUEL_JIANGHU_SPINE_COMMON = `${DUEL_JIANGHU_SPINE_ROOT}/Common/cha_2042`;
export const DUEL_JIANGHU_SPINE_ASSASSIN = `${DUEL_JIANGHU_SPINE_ROOT}/Assassin/cha_2052`;
export const DUEL_JIANGHU_SPINE_REBEL = `${DUEL_JIANGHU_SPINE_ROOT}/Rebel/cha_2073`;
export const DUEL_JIANGHU_SPINE_DOUBLE_MALE = `${DUEL_JIANGHU_SPINE_ROOT}/DoubleMale/cha_3042`;
export const DUEL_JIANGHU_SPINE_DOUBLE_FEMALE = `${DUEL_JIANGHU_SPINE_ROOT}/DoubleFemale/cha_3124`;
export const DUEL_JIANGHU_SPINE_GUARD_SOLDIER = `${DUEL_JIANGHU_SPINE_ROOT}/GuardSoldier/cha_3011`;
export const DUEL_JIANGHU_SPINE_GENERAL = `${DUEL_JIANGHU_SPINE_ROOT}/General/cha_2177`;
export const DUEL_JIANGHU_ROOM_LABELS = [
    {
        id: 'mibao_youge',
        name: '\u79d8\u5b9d\u5e7d\u9601',
        amount: '55.8',
        nodeName: 'JianghuRoom_MibaoYouge',
        x: 0,
        y: 350,
        highlightX: 0,
        highlightY: -78,
        highlightWidth: 246,
        highlightHeight: 218,
        actorAreaWidth: 230,
        actorAreaHeight: 145,
        routeDoorNodeName: 'JianghuRouteDoor_MibaoYouge',
        routeDoorX: 0,
        routeDoorY: 360,
    },
    {
        id: 'wudao_jingtan',
        name: '\u609f\u9053\u9759\u575b',
        amount: '110.1',
        nodeName: 'JianghuRoom_WudaoJingtan',
        x: -205,
        y: -40,
        highlightX: 0,
        highlightY: -78,
        highlightWidth: 230,
        highlightHeight: 212,
        actorAreaWidth: 180,
        actorAreaHeight: 132,
        routeDoorNodeName: 'JianghuRouteDoor_WudaoJingtan',
        routeDoorX: -182,
        routeDoorY: 145,
    },
    {
        id: 'bingjia_wutang',
        name: '\u5175\u7532\u6b66\u5802',
        amount: '254.6',
        nodeName: 'JianghuRoom_BingjiaWutang',
        x: 202,
        y: -40,
        highlightX: 0,
        highlightY: -78,
        highlightWidth: 230,
        highlightHeight: 212,
        actorAreaWidth: 180,
        actorAreaHeight: 128,
        routeDoorNodeName: 'JianghuRouteDoor_BingjiaWutang',
        routeDoorX: 165,
        routeDoorY: 145,
    },
    {
        id: 'xianting_keshe',
        name: '\u95f2\u5ead\u5ba2\u820d',
        amount: '117.3',
        nodeName: 'JianghuRoom_XiantingKeshe',
        x: -205,
        y: -395,
        highlightX: 0,
        highlightY: -78,
        highlightWidth: 230,
        highlightHeight: 212,
        actorAreaWidth: 176,
        actorAreaHeight: 132,
        routeDoorNodeName: 'JianghuRouteDoor_XiantingKeshe',
        routeDoorX: -177,
        routeDoorY: -305,
    },
    {
        id: 'juyi_zunshi',
        name: '\u805a\u4e49\u5c0a\u5ba4',
        amount: '52.4',
        nodeName: 'JianghuRoom_JuyiZunshi',
        x: 202,
        y: -395,
        highlightX: 0,
        highlightY: -78,
        highlightWidth: 230,
        highlightHeight: 212,
        actorAreaWidth: 184,
        actorAreaHeight: 132,
        routeDoorNodeName: 'JianghuRouteDoor_JuyiZunshi',
        routeDoorX: 169,
        routeDoorY: -215,
    },
] as const;
export const UI_BATTLE_ENTRY_BG = `${BATTLE_UI_ROOT}/battle_entry_bg`;
export const UI_BATTLE_COMBAT_BG = `${BATTLE_UI_ROOT}/battle_combat_bg`;
export const UI_BATTLE_AUTO_HOST_ICON = `${BATTLE_UI_ROOT}/battle_auto_host_icon`;
export const UI_BATTLE_MATERIAL_BAR_BG = `${COMMON_UI_ROOT}/common_upgrade_material_bg`;
export const UI_BATTLE_ACTION_BUTTON_BG = `${COMMON_UI_ROOT}/common_action_button_bg`;
export const UI_BATTLE_TICKET_ICON = `${BATTLE_UI_ROOT}/battle_ticket_icon`;
export const UI_BATTLE_MATERIAL_ROOT = `${BATTLE_UI_ROOT}/Materials`;
export const UI_BATTLE_UPGRADE_OUTPUT_ROOT = `${BATTLE_UI_ROOT}/UpgradeOutputs`;
export const UI_BATTLE_REWARD_POPUP_BG = `${BATTLE_UI_ROOT}/battle_reward_popup_bg`;
export const UI_BATTLE_DAMAGE_DIGIT_ROOT = `${BATTLE_UI_ROOT}/DamageDigits`;
export const UI_BATTLE_LEVEL_SUBTITLE_BG = `${BATTLE_UI_ROOT}/battle_level_subtitle_bg`;
export const UI_BATTLE_UPGRADE_POPUP_BG = `${BATTLE_UI_ROOT}/battle_upgrade_popup_bg`;
export const UI_BATTLE_UPGRADE_CURRENT_FRAME = `${BATTLE_UI_ROOT}/battle_upgrade_current_frame`;
export const UI_BATTLE_UPGRADE_NEXT_FRAME = `${BATTLE_UI_ROOT}/battle_upgrade_next_frame`;
export const UI_BATTLE_UPGRADE_ICON = `${BATTLE_UI_ROOT}/battle_upgrade_icon`;
export const UI_BATTLE_UPGRADE_ARROW = `${BATTLE_UI_ROOT}/battle_upgrade_arrow`;
export const UI_BATTLE_UPGRADE_OUTPUT_PANEL_BG = `${BATTLE_UI_ROOT}/battle_upgrade_output_panel_bg`;
export const UI_BATTLE_TARGET_CHECKBOX_UNCHECKED = `${BATTLE_UI_ROOT}/battle_target_checkbox_unchecked`;
export const UI_BATTLE_TARGET_CHECKBOX_CHECKED = `${BATTLE_UI_ROOT}/battle_target_checkbox_checked`;
export const UI_BATTLE_TARGET_OPTION_SELECTED_BG = `${BATTLE_UI_ROOT}/battle_target_option_selected_bg`;
export const UI_CHARACTER_SELECT_BG = `${CHARACTER_SELECT_UI_ROOT}/character_select_new_bg`;
export const UI_CHARACTER_SELECT_BTN_LEFT = `${CHARACTER_SELECT_UI_ROOT}/character_select_btn_left`;
export const UI_CHARACTER_SELECT_BTN_RIGHT = `${CHARACTER_SELECT_UI_ROOT}/character_select_btn_right`;
export const UI_CHARACTER_SELECT_NAME_BG = `${CHARACTER_SELECT_UI_ROOT}/character_select_new_name_bg`;
export const UI_CHARACTER_SELECT_RANDOM_BTN = `${CHARACTER_SELECT_UI_ROOT}/character_select_new_random_btn`;
export const UI_CHARACTER_SELECT_CONFIRM_BTN = `${CHARACTER_SELECT_UI_ROOT}/character_select_confirm_btn`;
export const UI_CHARACTER_SELECT_FEMALE_NORMAL = `${CHARACTER_SELECT_UI_ROOT}/character_select_female_normal`;
export const UI_CHARACTER_SELECT_FEMALE_ACTIVE = `${CHARACTER_SELECT_UI_ROOT}/character_select_female_active`;
export const UI_CHARACTER_SELECT_MALE_NORMAL = `${CHARACTER_SELECT_UI_ROOT}/character_select_male_normal`;
export const UI_CHARACTER_SELECT_MALE_ACTIVE = `${CHARACTER_SELECT_UI_ROOT}/character_select_male_active`;
export const UI_CHARACTER_SELECT_FRAME_HIGHLIGHT = `${CHARACTER_SELECT_UI_ROOT}/character_select_frame_highlight`;
export const UI_CHARACTER_SELECT_SPEECH_BUBBLE = `${CHARACTER_SELECT_UI_ROOT}/character_select_speech_bubble`;
export const UI_RANK_BG = `${RANK_UI_ROOT}/rank_bg`;
export const UI_RANK_BACK = `${RANK_UI_ROOT}/rank_back`;
export const UI_RANK_TAB_ACTIVE = `${RANK_UI_ROOT}/rank_tab_active`;
export const UI_RANK_TAB_NORMAL = `${RANK_UI_ROOT}/rank_tab_normal`;
export const UI_RANK_CARD_1 = `${RANK_UI_ROOT}/rank_card_1`;
export const UI_RANK_CARD_2 = `${RANK_UI_ROOT}/rank_card_2`;
export const UI_RANK_CARD_3 = `${RANK_UI_ROOT}/rank_card_3`;
export const UI_RANK_BADGE_1 = `${RANK_UI_ROOT}/rank_badge_1`;
export const UI_RANK_BADGE_2 = `${RANK_UI_ROOT}/rank_badge_2`;
export const UI_RANK_BADGE_3 = `${RANK_UI_ROOT}/rank_badge_3`;
export const UI_RANK_ROW_BG = `${RANK_UI_ROOT}/rank_row_bg`;
export const UI_BTN_CLOSE = `${MAIL_UI_ROOT}/btn_close`;
export const UI_MAIL_BTN_CLOSE = `${MAIL_UI_ROOT}/mail_btn_close`;
export const UI_BTN_CLAIM = `${MAIL_UI_ROOT}/btn_claim`;
export const UI_BTN_DELETE = `${MAIL_UI_ROOT}/btn_delete`;
export const BOTTOM_ENTRY_BACK_BUTTON_WIDTH = 95;
export const BOTTOM_ENTRY_BACK_BUTTON_HEIGHT = 90;
export const BOTTOM_ENTRY_BACK_BUTTON_X = -300;
export const BOTTOM_ENTRY_BACK_BUTTON_Y = -720;
export const BAG_ILLUSTRATION_BUTTON_WIDTH = 95;
export const BAG_ILLUSTRATION_BUTTON_HEIGHT = 95;
export const BAG_ILLUSTRATION_BUTTON_X = 300;
export const BAG_ILLUSTRATION_BUTTON_Y = 620;
export const ENABLE_ROLE_SKEL_ANIMATION = true;
export const IDLE_ANIMATIONS = ['stand2', 'stand1', 'stand', 'idle', 'wait', 'daiji', 'animation'];
export const WALK_ANIMATIONS = ['run', 'run2', 'move', 'walk', 'zoulu'];
export const LOADING_ANIMATIONS = ['run', 'run2', 'animation', 'idle'];
export const CHARACTER_SELECT_BG_SKEL_PATH = 'Spine/CharacterSelect/Background/skeleton';
export const CHARACTER_SELECT_BG_ANIMATIONS = ['animation', 'idle'];
export const CHARACTER_SELECT_BG_SCALE = 1.18;
export const CHARACTER_SELECT_BG_OFFSET_X = 0;
export const CHARACTER_SELECT_BG_OFFSET_Y = 0;
export const CHARACTER_SELECT_ROLE_Y = -150;
export const CHARACTER_SELECT_SWITCH_BUTTON_Y = -20;
export const CHARACTER_SELECT_SWIPE_Y = -5;
export const CHARACTER_SELECT_ROLE_SKEL_PATHS: Record<RoleGender, string> = {
    female: 'Spine/CharacterSelect/Female/beauty_chennv',
    male: 'Spine/CharacterSelect/Male/beauty_langke',
};
export const CHARACTER_SELECT_ROLE_ANIMATIONS = ['click1', 'idle', 'animation'];
export const CHARACTER_SELECT_ROLE_SCALE: Record<RoleGender, number> = {
    female: 3,
    male: 3.2,
};
export const CHARACTER_SELECT_ROLE_OFFSET: Record<RoleGender, { x: number; y: number }> = {
    female: { x: 0, y: -54.099 },
    male: { x: 76, y: -54.099 },
};
export const CHARACTER_NAME_CURSOR_CHAR_WIDTH = 30;
export const CHARACTER_SELECT_ROLE_FADE_OUT_TIME = 0.12;
export const CHARACTER_SELECT_ROLE_FADE_IN_TIME = 0.16;
export const ROLE_PAGE_STAGE_WIDTH = 750;
export const ROLE_PAGE_STAGE_HEIGHT = 1000;
export const ROLE_PAGE_STAGE_X = 0;
export const ROLE_PAGE_STAGE_Y = -180;
export const ROLE_PAGE_CONTENT_OFFSET_Y = -50;
export const ROLE_PAGE_EQUIP_OFFSET_Y = -40;
export const ROLE_PAGE_ROLE_NODE_WIDTH = 560;
export const ROLE_PAGE_ROLE_NODE_HEIGHT = 720;
export const ROLE_PAGE_PLAYER_LEVEL = 1;
export const ROLE_PAGE_NAME_LABEL_WIDTH = 360;
export const ROLE_PAGE_NAME_LABEL_HEIGHT = 44;
export const ROLE_PAGE_NAME_LABEL_OFFSET_Y = 380;
export const ROLE_PAGE_NAME_LABEL_FONT_SIZE = 22;
export const ROLE_PAGE_POWER_FRAME_WIDTH = 293;
export const ROLE_PAGE_POWER_FRAME_HEIGHT = 74;
export const ROLE_PAGE_POWER_FRAME_OFFSET_Y = 456;
export const ROLE_PAGE_POWER_DIGIT_HEIGHT = 25;
export const ROLE_PAGE_POWER_DIGIT_SPACING = -1;
export const ROLE_PAGE_POWER_DIGIT_OFFSET_X = 25;
export const ROLE_PAGE_POWER_DIGIT_OFFSET_Y = -4;
export const ROLE_PAGE_POWER_DETAIL_BUTTON_SIZE = 50;
export const ROLE_PAGE_POWER_DETAIL_BUTTON_X = 176;
export const ROLE_PAGE_POWER_DETAIL_BUTTON_Y = 0;
export const ROLE_EQUIP_SELECTED_FRAME_SIZE = 136;
export const ROLE_ADVANCE_POWER_FRAME_Y = 452;
export const ROLE_ADVANCE_PANEL_WIDTH = 650;
export const ROLE_ADVANCE_PANEL_HEIGHT = 920;
export const ROLE_ADVANCE_PANEL_Y = -58;
export const ROLE_ADVANCE_ATTR_WIDTH = 632;
export const ROLE_ADVANCE_ATTR_HEIGHT = 398;
export const ROLE_ADVANCE_ATTR_Y = 114;
export const ROLE_ADVANCE_ATTR_SIDE_WIDTH = 214;
export const ROLE_ADVANCE_ATTR_SIDE_HEIGHT = 398;
export const ROLE_ADVANCE_CURRENT_ATTR_X = -158;
export const ROLE_ADVANCE_NEXT_ATTR_X = 158;
export const ROLE_ADVANCE_EXP_BAR_WIDTH = 610;
export const ROLE_ADVANCE_EXP_BAR_HEIGHT = 24;
export const ROLE_ADVANCE_EXP_FILL_WIDTH = 610;
export const ROLE_ADVANCE_EXP_EFFECT_DURATION = 0.35;
export const ROLE_ADVANCE_EXP_Y = -228;
export const ROLE_ADVANCE_BREAKTHROUGH_COST_Y = -274;
export const ROLE_ADVANCE_BREAKTHROUGH_COST_TITLE_X = -246;
export const ROLE_ADVANCE_BREAKTHROUGH_COST_ITEM_SIZE = 42;
export const ROLE_ADVANCE_BREAKTHROUGH_COST_ICON_SIZE = 31;
export const ROLE_ADVANCE_BREAKTHROUGH_COST_SPACING = 112;
export const ROLE_ADVANCE_ORB_SIZE = 72;
export const ROLE_ADVANCE_ORB_SLOT_SIZE = 96;
export const ROLE_ADVANCE_ORB_Y = -405;
export const ROLE_ADVANCE_ORB_SPACING = 124;
export const ROLE_STRENGTHEN_MATERIAL_Y = -405;
export const ROLE_STRENGTHEN_MATERIAL_SPACING = 160;
export const ROLE_STRENGTHEN_MATERIAL_ICON_SIZE = 44;
export const ROLE_STRENGTHEN_MATERIAL_BG_WIDTH = 138;
export const ROLE_STRENGTHEN_MATERIAL_BG_HEIGHT = 32;
export const ROLE_STRENGTHEN_MATERIAL_BG_Y = -26;
export const ROLE_STRENGTHEN_MATERIAL_ICON_X = -52;
export const ROLE_STRENGTHEN_MATERIAL_ICON_Y = -23;
export const ROLE_STRENGTHEN_MATERIAL_COUNT_X = 20;
export const ROLE_STRENGTHEN_MATERIAL_COUNT_WIDTH = 82;
export const ROLE_STRENGTHEN_STATUS_Y = -510;
export const ROLE_STRENGTHEN_BUTTON_WIDTH = 180;
export const ROLE_STRENGTHEN_BUTTON_HEIGHT = 50;
export const ROLE_STRENGTHEN_BUTTON_Y = -600;
export const ROLE_SUCCESS_SKEL_PATH = 'Spine/Common/RewardText/shenglishibaigongxihuode/shenglishibaigongxihuode';
export const ROLE_SUCCESS_POPUP_WIDTH = 752;
export const ROLE_SUCCESS_POPUP_HEIGHT = 376;
export const ROLE_SUCCESS_POPUP_Y = 70;
export const ROLE_SUCCESS_SPINE_WIDTH = 680;
export const ROLE_SUCCESS_SPINE_HEIGHT = 260;
export const ROLE_SUCCESS_SPINE_Y = -38;
export const ROLE_SUCCESS_SPINE_SCALE = 1.04;
export const ROLE_SUCCESS_LEVEL_Y = 10;
export const ROLE_SUCCESS_STAT_START_Y = -28;
export const ROLE_SUCCESS_STAT_GAP = 32;
export const ROLE_SUCCESS_POWER_FRAME_WIDTH = 293;
export const ROLE_SUCCESS_POWER_FRAME_HEIGHT = 74;
export const ROLE_SUCCESS_POWER_FRAME_Y = -164;
export const ROLE_SUCCESS_POWER_VALUE_OFFSET_X = 54;
export const ROLE_SUCCESS_POWER_VALUE_OFFSET_Y = -4;
export const ROLE_SUCCESS_POWER_PLUS_WIDTH = 17;
export const ROLE_SUCCESS_POWER_PLUS_HEIGHT = 20;
export const ROLE_SUCCESS_POWER_DIGIT_HEIGHT = 25;
export const ROLE_SUCCESS_POWER_DIGIT_SPACING = -1;
export const ROLE_SUCCESS_HINT_Y = -212;
export const ROLE_SUCCESS_ANIMATIONS = {
    upgrade: { intro: 'shengjiechenggong_chufa', loop: 'shengjiechenggong_loop' },
    breakthrough: { intro: 'tupochenggong_chufa', loop: 'tupochenggong_loop' },
    strengthen: { intro: 'qianghuachenggong_chufa', loop: 'qianghuachenggong_loop' },
} as const;
export const ROLE_BASE_ATTACK_PER_LEVEL = 10;
export const ROLE_BASE_LIFE_PER_LEVEL = 140;
export const ROLE_BASE_DEFENSE_PER_LEVEL = 5;
export const ROLE_POWER_ATTACK_RATE = 10;
export const ROLE_POWER_LIFE_RATE = 1.4;
export const ROLE_POWER_DEFENSE_RATE = 20;
export const ROLE_STRENGTHEN_COST_BASE = 7;
export const ROLE_STRENGTHEN_COST_PER_LEVEL = 2;
export const ROLE_ATTR_DETAIL_WIDTH = 725;
export const ROLE_ATTR_DETAIL_HEIGHT = 505;
export const ROLE_ATTR_DETAIL_Y = 0;
export const ROLE_EQUIP_DETAIL_WIDTH = 725;
export const ROLE_EQUIP_DETAIL_HEIGHT = 505;
export const ROLE_EQUIP_REPLACE_WIDTH = 530;
export const ROLE_EQUIP_REPLACE_HEIGHT = 768;
export const ROLE_EQUIP_REPLACE_GRID_COLS = 4;
export const ROLE_EQUIP_REPLACE_GRID_START_X = -180;
export const ROLE_EQUIP_REPLACE_GRID_GAP_X = 120;
export const ROLE_EQUIP_REPLACE_GRID_GAP_Y = 122;
export const ROLE_PAGE_BOTTOM_Y = -720;
export const ROLE_PAGE_BOTTOM_BUTTON_WIDTH = 108;
export const ROLE_PAGE_BOTTOM_BUTTON_HEIGHT = 108;
export const ROLE_PAGE_BOTTOM_BUTTON_SPACING = 170;
export const ROLE_PAGE_BOTTOM_BUTTON_Y = 0;
export const BAG_PAGE_BOTTOM_Y = -720;
export const BAG_PAGE_BOTTOM_BUTTON_WIDTH = 108;
export const BAG_PAGE_BOTTOM_BUTTON_HEIGHT = 108;
export const BAG_PAGE_BOTTOM_BUTTON_SPACING = 166;
export const BAG_PAGE_BOTTOM_BUTTON_Y = 0;
export const BAG_PAGE_BOTTOM_GROUP_OFFSET_X = 36;
export const BAG_MATERIAL_BOARD_WIDTH = 646;
export const BAG_MATERIAL_BOARD_HEIGHT = 900;
export const BAG_MATERIAL_BOARD_Y = -120;
export const BAG_CATEGORY_TAB_WIDTH = 138;
export const BAG_CATEGORY_TAB_HEIGHT = 57;
export const BAG_CATEGORY_TAB_START_X = -207;
export const BAG_CATEGORY_TAB_SPACING_X = 138;
export const BAG_CATEGORY_TAB_Y = BAG_MATERIAL_BOARD_HEIGHT / 2 + 18;
export const BAG_GRID_VIEWPORT_WIDTH = 700;
export const BAG_GRID_VIEWPORT_HEIGHT = 820;
export const BAG_GRID_VIEWPORT_X = 0;
export const BAG_GRID_VIEWPORT_Y = -25;
export const BAG_DECOMPOSE_VIEWPORT_HEIGHT = BAG_GRID_VIEWPORT_HEIGHT;
export const BAG_DECOMPOSE_VIEWPORT_Y = BAG_GRID_VIEWPORT_Y;
export const BAG_SYNTH_VIEWPORT_HEIGHT = BAG_GRID_VIEWPORT_HEIGHT;
export const BAG_SYNTH_VIEWPORT_Y = BAG_GRID_VIEWPORT_Y;
export const BAG_GRID_COLS = 5;
export const BAG_GRID_CELL_SIZE = 118;
export const BAG_GRID_FRAME_SIZE = 108;
export const BAG_GRID_ICON_SIZE = 80;
export const BAG_GRID_ICON_OFFSET_Y = 4;
export const BAG_GRID_COUNT_FONT_SIZE = 22;
export const BAG_GRID_COUNT_WIDTH = 82;
export const BAG_GRID_COUNT_HEIGHT = 30;
export const BAG_GRID_COUNT_X = 30;
export const BAG_GRID_COUNT_Y = -36;
export const BAG_GRID_CELL_GAP_X = 14;
export const BAG_GRID_CELL_GAP_Y = 16;
export const BAG_MODE_ROOT_WIDTH = 620;
export const BAG_DECOMPOSE_MODE_ROOT_HEIGHT = 260;
export const BAG_DECOMPOSE_MODE_ROOT_Y = 600;
export const BAG_DECOMPOSE_MODE_SLOT_SIZE = 122;
export const BAG_DECOMPOSE_MODE_INPUT_X = -170;
export const BAG_DECOMPOSE_MODE_OUTPUT_X = 170;
export const BAG_DECOMPOSE_MODE_ARROW_WIDTH = 66;
export const BAG_DECOMPOSE_MODE_ARROW_HEIGHT = 54;
export const BAG_DECOMPOSE_ACTION_BUTTON_WIDTH = 162;
export const BAG_DECOMPOSE_ACTION_BUTTON_HEIGHT = 62;
export const BAG_DECOMPOSE_ACTION_BUTTON_Y = -96;
export const BAG_DECOMPOSE_ACTION_BUTTON_X = 170;
export const BAG_DECOMPOSE_LOCK_WIDTH = 37;
export const BAG_DECOMPOSE_LOCK_HEIGHT = 46;
export const BAG_DECOMPOSE_LOCK_Y = 4;
export const BAG_SYNTH_MODE_ROOT_HEIGHT = 270;
export const BAG_SYNTH_MODE_ROOT_Y = 610;
export const BAG_SYNTH_MODE_SLOT_SIZE = 118;
export const BAG_SYNTH_MODE_LEFT_X = -170;
export const BAG_SYNTH_MODE_TOP_Y = 82;
export const BAG_SYNTH_MODE_BOTTOM_Y = -82;
export const BAG_SYNTH_MODE_OUTPUT_X = 180;
export const BAG_SYNTH_MODE_PLUS_SIZE = 82;
export const BAG_SYNTH_MODE_ARROW_WIDTH = 132;
export const BAG_SYNTH_MODE_ARROW_HEIGHT = 122;
export const MAGIC_SCENE_ROOT_WIDTH = VIEW_WIDTH;
export const MAGIC_SCENE_ROOT_HEIGHT = VIEW_HEIGHT;
export const MAGIC_SCENE_ROOT_Y = 0;
export const MAGIC_SCENE_BG_SOURCE_WIDTH = 2025;
export const MAGIC_SCENE_BG_SOURCE_HEIGHT = 777;
export const MAGIC_SCENE_WORLD_HEIGHT = VIEW_HEIGHT;
export const MAGIC_SCENE_WORLD_WIDTH = MAGIC_SCENE_BG_SOURCE_WIDTH * (MAGIC_SCENE_WORLD_HEIGHT / MAGIC_SCENE_BG_SOURCE_HEIGHT);
export const MAGIC_SCENE_WORLD_X_LIMIT = (MAGIC_SCENE_WORLD_WIDTH - VIEW_WIDTH) / 2;
export const MAGIC_SCENE_SPINE_SCALE = 1;
export const MAGIC_SCENE_SPINE_Y = 10;
export const MAGIC_SCENE_ENTRY_WIDTH = 186;
export const MAGIC_SCENE_ENTRY_HEIGHT = 154;
export const MAGIC_SCENE_ENTRY_SPINE_SCALE_FACTOR = 0.38;
export const MAGIC_SCENE_SELECTED_ENTRY_SCALE = 1.12;
export const MAGIC_SCENE_NAME_FRAME_WIDTH = 55;
export const MAGIC_SCENE_NAME_FRAME_HEIGHT = 340;
export const MAGIC_SCENE_NAME_FRAME_OFFSET_X = -94;
export const MAGIC_SCENE_NAME_FRAME_OFFSET_Y = 0;
export const MAGIC_SCENE_NAME_LABEL_WIDTH = 40;
export const MAGIC_SCENE_NAME_LABEL_HEIGHT = 286;
export const MAGIC_SCENE_DRAG_THRESHOLD = 14;
export const MAGIC_SCENE_CLOUD_SPINE_PATH = 'Spine/Common/Cloud/172464265161517';
export const MAGIC_SCENE_CLOUD_ANIMATIONS = ['idle'];
export const MAGIC_SWITCH_BUTTON_WIDTH = 48;
export const MAGIC_SWITCH_BUTTON_HEIGHT = 90;
export const MAGIC_SWITCH_BUTTON_X = 312;
export const MAGIC_SWITCH_BUTTON_Y = 18;
export const MAGIC_ENTER_BUTTON_WIDTH = 220;
export const MAGIC_ENTER_BUTTON_HEIGHT = 90;
export const MAGIC_ENTER_BUTTON_Y = -700;
export const MAGIC_LEVEL_FRAME_WIDTH = 104;
export const MAGIC_LEVEL_FRAME_HEIGHT = 109;
export const MAGIC_LEVEL_FRAME_Y = -410;
export const MAGIC_LEVEL_REQUIREMENTS = [10, 20, 24, 27, 30, 37, 40, 45, 50] as const;
export const MAGIC_FLOOR_BOARD_WIDTH = 600;
export const MAGIC_FLOOR_BOARD_HEIGHT = 1040;
export const MAGIC_FLOOR_ROLL_WIDTH = 579;
export const MAGIC_FLOOR_ROLL_HEIGHT = 120;
export const MAGIC_FLOOR_ROLL_Y = 408;
export const MAGIC_FLOOR_SCROLL_WIDTH = 544;
export const MAGIC_FLOOR_SCROLL_HEIGHT = 936;
export const MAGIC_FLOOR_SCROLL_Y = -65;
export const MAGIC_FLOOR_SCROLL_TOP_Y = 403;
export const MAGIC_FLOOR_TITLE_Y = 278;
export const MAGIC_FLOOR_CONTENT_Y = -76;
export const MAGIC_FLOOR_CONTENT_WIDTH = 500;
export const MAGIC_FLOOR_CONTENT_HEIGHT = 660;
export const MAGIC_FLOOR_ROW_WIDTH = 492;
export const MAGIC_FLOOR_ROW_HEIGHT = 122;
export const MAGIC_FLOOR_ROW_START_Y = 122;
export const MAGIC_FLOOR_ROW_GAP_Y = 145;
export const MAGIC_FLOOR_ICON_WIDTH = 39;
export const MAGIC_FLOOR_ICON_HEIGHT = 69;
export const MAGIC_FLOOR_ICON_X = -224;
export const MAGIC_FLOOR_ICON_Y = 4;
export const MAGIC_FLOOR_TEXT_X = -58;
export const MAGIC_FLOOR_TEXT_WIDTH = 228;
export const MAGIC_FLOOR_NAMES = ['\u4e00\u5c42', '\u4e8c\u5c42', '\u4e09\u5c42', '\u56db\u5c42'] as const;
export const MAGIC_SCENE_ANIMATIONS = ['Down_Idle', 'idle', 'animation'];
export const MAGIC_MAP_SMALL_MONSTER_SKEL_PATH = 'Spine/Magic/Monsters/Small/H30074';
export const MAGIC_MAP_BOSS_MONSTER_SKEL_PATH = 'Spine/Magic/Monsters/Boss/H30009';
export const MAGIC_MAP_IDLE_ANIMATIONS = ['stand2', 'stand', 'idle'];
export const MAGIC_MAP_WALK_ANIMATIONS = ['run', 'walk', 'move'];
export const MAGIC_MAP_HURT_ANIMATIONS = ['hurt', 'hit', 'damage'];
export const MAGIC_MAP_SMALL_MONSTER_COUNT = 10;
export const MAGIC_MAP_WORLD_WIDTH = 5600;
export const MAGIC_MAP_WORLD_HEIGHT = 3150;
export const MAGIC_MAP_VIEW_WIDTH = 750;
export const MAGIC_MAP_VIEW_HEIGHT = 1624;
export const MAGIC_MAP_WORLD_X_LIMIT = (MAGIC_MAP_WORLD_WIDTH - MAGIC_MAP_VIEW_WIDTH) / 2;
export const MAGIC_MAP_WORLD_Y_LIMIT = (MAGIC_MAP_WORLD_HEIGHT - MAGIC_MAP_VIEW_HEIGHT) / 2;
export const MAGIC_MAP_MONSTER_MIN_X = -2250;
export const MAGIC_MAP_MONSTER_MAX_X = 2250;
export const MAGIC_MAP_MONSTER_MIN_Y = -1120;
export const MAGIC_MAP_MONSTER_MAX_Y = 180;
export const MAGIC_MAP_PLAYER_MIN_X = -2250;
export const MAGIC_MAP_PLAYER_MAX_X = 2250;
export const MAGIC_MAP_PLAYER_MIN_Y = -1120;
export const MAGIC_MAP_PLAYER_MAX_Y = 180;
export const MAGIC_MAP_SMALL_MONSTER_SCALE = 0.56;
export const MAGIC_MAP_BOSS_MONSTER_SCALE = 0.48;
export const MAGIC_MAP_PLAYER_SCALE = 0.46;
export const MAGIC_MAP_PLAYER_MOVE_SPEED = 360;
export const MAGIC_MAP_SMALL_MONSTER_MOVE_SPEED = 110;
export const MAGIC_MAP_BOSS_MONSTER_MOVE_SPEED = 85;
export const MAGIC_MAP_SMALL_MONSTER_SPAWN_POINTS = [
    { x: -1780, y: -120 },
    { x: -1280, y: -520 },
    { x: -920, y: 20 },
    { x: -420, y: -360 },
    { x: 120, y: 90 },
    { x: 560, y: -570 },
    { x: 1180, y: -180 },
    { x: 1600, y: 80 },
    { x: 1850, y: -620 },
    { x: 2180, y: -260 },
] as const;
export const MAGIC_MAP_BOSS_SPAWN_POINT = { x: 1500, y: -410 } as const;
export const MAGIC_MAP_PLAYER_MAX_HP = 40070;
export const MAGIC_MAP_SMALL_MONSTER_MAX_HP = 40070;
export const MAGIC_MAP_BOSS_MONSTER_MAX_HP = 120210;
export const MAGIC_MAP_PLAYER_HEALTH_INFO_Y = 185;
export const MAGIC_MAP_SMALL_MONSTER_HEALTH_INFO_Y = 175;
export const MAGIC_MAP_BOSS_HEALTH_INFO_Y = 235;
export const MAGIC_MAP_HEALTH_NAME_WIDTH = 310;
export const MAGIC_MAP_HEALTH_VALUE_WIDTH = 220;
export const MAGIC_MAP_PLAYER_HEALTH_BAR_WIDTH = 165;
export const MAGIC_MAP_MONSTER_HEALTH_BAR_WIDTH = 145;
export const MAGIC_MAP_BOSS_HEALTH_BAR_WIDTH = 178;
export const MAGIC_MAP_HEALTH_BAR_HEIGHT = 14;
export const MAGIC_MAP_DURATION_SECONDS = 10 * 60;
export const MAGIC_MAP_DRAG_THRESHOLD = 12;
export const MAGIC_MONSTER_BATTLE_RESULT_DELAY = 8;
export const MAGIC_MONSTER_BATTLE_ATTACK_GAP = 0.06;
export const MAGIC_BATTLE_SMALL_MONSTER_SCALE = 0.78;
export const MAGIC_BATTLE_BOSS_MONSTER_SCALE = 0.86;
export const MAGIC_BATTLE_MONSTER_HEALTH_INFO_Y = 245;
export const MAGIC_BATTLE_PLAYER_DAMAGE_PER_HIT_RATIO = 1 / 7;
export const MAGIC_BATTLE_BOSS_DAMAGE_PER_HIT_RATIO = 1 / 10;
export const MAGIC_BATTLE_DAMAGE_PANEL_X = 176;
export const MAGIC_BATTLE_DAMAGE_PANEL_Y = -228;
export const MAGIC_BATTLE_DAMAGE_PANEL_WIDTH = 396;
export const MAGIC_BATTLE_DAMAGE_PANEL_HEIGHT = 548;
export const MAGIC_BATTLE_DAMAGE_ROW_WIDTH = 368;
export const MAGIC_BATTLE_DAMAGE_ROW_HEIGHT = 78;
export const MAGIC_BATTLE_DAMAGE_ROW_START_Y = 126;
export const MAGIC_BATTLE_DAMAGE_ROW_GAP = 82;
export const MAGIC_BATTLE_DAMAGE_INFO_BG_WIDTH = 368;
export const MAGIC_BATTLE_DAMAGE_INFO_BG_HEIGHT = 468;
export const MAGIC_BATTLE_DAMAGE_INFO_BG_Y = -40;
export const MAGIC_BATTLE_DAMAGE_BAR_WIDTH = 180;
export const MAGIC_BATTLE_DAMAGE_BAR_HEIGHT = 16;
export const MAGIC_BATTLE_DAMAGE_DUEL_BUTTON_WIDTH = 104;
export const MAGIC_BATTLE_DAMAGE_DUEL_BUTTON_HEIGHT = 40;
export const MAGIC_BATTLE_DAMAGE_COLLAPSED_X = 536;
export const MAGIC_BATTLE_ASSIST_CARD_ROOT_X = 304;
export const MAGIC_BATTLE_ASSIST_CARD_ROOT_Y = -486;
export const MAGIC_BATTLE_ASSIST_CARD_SLOT_WIDTH = 114;
export const MAGIC_BATTLE_ASSIST_CARD_SLOT_HEIGHT = 126;
export const MAGIC_BATTLE_ASSIST_CARD_ICON_SIZE = 62;
export const MAGIC_BATTLE_ASSIST_CARD_ICON_Y = 18;
export const MAGIC_BATTLE_ASSIST_CARD_USE_LABEL_Y = -42;
export const MAGIC_BATTLE_ASSIST_CARD_SLOT_GAP = 140;
export const MAGIC_BATTLE_ASSIST_CONFIRM_POPUP_WIDTH = 725;
export const MAGIC_BATTLE_ASSIST_CONFIRM_POPUP_HEIGHT = 505;
export const MAGIC_BATTLE_ASSIST_CONFIRM_TITLE_WIDTH = 486;
export const MAGIC_BATTLE_ASSIST_CONFIRM_TITLE_HEIGHT = 84;
export const MAGIC_BATTLE_ASSIST_CONFIRM_TITLE_Y = 182;
export const MAGIC_BATTLE_ASSIST_CONFIRM_ICON_SIZE = 58;
export const MAGIC_BATTLE_ASSIST_CONFIRM_BUTTON_WIDTH = 162;
export const MAGIC_BATTLE_ASSIST_CONFIRM_BUTTON_HEIGHT = 62;
export const MAGIC_BATTLE_ASSIST_CONFIRM_BUTTON_Y = -186;
export const MAGIC_BATTLE_ASSIST_CONFIRM_BUTTON_X = 112;
export const MAGIC_BATTLE_DUEL_POPUP_WIDTH = 706;
export const MAGIC_BATTLE_DUEL_POPUP_HEIGHT = 480;
export const MAGIC_BATTLE_DUEL_CARD_WIDTH = 238;
export const MAGIC_BATTLE_DUEL_CARD_HEIGHT = 304;
export const MAGIC_BATTLE_DUEL_PLAYER_CARD_X = -176;
export const MAGIC_BATTLE_DUEL_TARGET_CARD_X = 176;
export const MAGIC_BATTLE_DUEL_CARD_Y = -28;
export const MAGIC_BATTLE_DUEL_VISUAL_Y = -56;
export const MAGIC_BATTLE_DUEL_PLAYER_SCALE = 0.36;
export const MAGIC_BATTLE_DUEL_NPC_SCALE = 0.36;
export const MAGIC_BATTLE_DUEL_HP_BAR_WIDTH = 166;
export const MAGIC_BATTLE_DUEL_HP_BAR_HEIGHT = 14;
export const MAGIC_BATTLE_DUEL_DURATION = 3;
export const MAGIC_BATTLE_DUEL_TURN_DELAY = 0.72;
export const MAGIC_BATTLE_FRAGMENT_REWARD_IDS = ['item_102', 'item_104', 'item_106', 'item_108'] as const;
export const MAGIC_SCENES = [
    { title: '\u4e00\u91cd\uff1a\u4e07\u89e6\u9b54\u754c', skelPath: 'Spine/Magic/Level1/25402', scale: 1.65, x: 0, y: -70 },
    { title: '\u4e8c\u91cd\uff1a\u5bd2\u51b0\u9b54\u754c', skelPath: 'Spine/Magic/Level2/26160', scale: 0.82, x: 0, y: 10 },
    { title: '\u4e09\u91cd\uff1a\u846c\u9b42\u9b54\u754c', skelPath: 'Spine/Magic/Level3/26162', scale: 0.52, x: 0, y: 20 },
    { title: '\u56db\u91cd\uff1a\u8d64\u864e\u9b54\u754c', skelPath: 'Spine/Magic/Level4/26163', scale: 0.40, x: 0, y: 10 },
    { title: '\u4e94\u91cd\uff1a\u6bd2\u6f6d\u9b54\u754c', skelPath: 'Spine/Magic/Level5/26166', scale: 0.45, x: 0, y: 20 },
    { title: '\u516d\u91cd\uff1a\u53e4\u6811\u9b54\u754c', skelPath: 'Spine/Magic/Level6/26300', scale: 1.55, x: 0, y: -10 },
    { title: '\u4e03\u91cd\uff1a\u9f9f\u9675\u9b54\u754c', skelPath: 'Spine/Magic/Level7/26614', scale: 1.12, x: 0, y: 10 },
    { title: '\u516b\u91cd\uff1a\u796d\u4ead\u9b54\u754c', skelPath: 'Spine/Magic/Level8/27007', scale: 1.55, x: 0, y: 20 },
    { title: '\u4e5d\u91cd\uff1a\u5e7b\u6c60\u9b54\u754c', skelPath: 'Spine/Magic/Level9/26319', scale: 1.28, x: 0, y: 0 },
] as const;
export const MAGIC_SCENE_ENTRY_POINTS = [
    { sourceX: 350, sourceY: 405 },
    { sourceX: 510, sourceY: 342 },
    { sourceX: 650, sourceY: 462 },
    { sourceX: 820, sourceY: 390 },
    { sourceX: 1005, sourceY: 450 },
    { sourceX: 1190, sourceY: 365 },
    { sourceX: 1390, sourceY: 450 },
    { sourceX: 1610, sourceY: 395 },
    { sourceX: 1815, sourceY: 475 },
] as const;
export const BEAST_CARD_ROOT_WIDTH = 720;
export const BEAST_CARD_ROOT_HEIGHT = 1240;
export const BEAST_CARD_ROOT_Y = -20;
export const BEAST_CARD_SPINE_Y = 165;
export const BEAST_CARD_SWITCH_WIDTH = 52;
export const BEAST_CARD_SWITCH_HEIGHT = 98;
export const BEAST_CARD_SWITCH_X = 320;
export const BEAST_CARD_SWITCH_Y = 150;
export const BEAST_CARD_BOTTOM_FRAME_WIDTH = 720;
export const BEAST_CARD_BOTTOM_FRAME_HEIGHT = 677;
export const BEAST_CARD_BOTTOM_FRAME_Y = -454;
export const BEAST_CARD_BOTTOM_NAME_LABEL_Y = -350;
export const BEAST_CARD_BOTTOM_NAME_LABEL_WIDTH = 360;
export const BEAST_CARD_BOTTOM_NAME_LABEL_HEIGHT = 58;
export const BEAST_CARD_BOTTOM_NAME_LABELS = [
    '\u9752\u72ee\u517d\u5361',
    '\u767d\u9e7f\u517d\u5361',
    '\u91d1\u9e64\u517d\u5361',
    '\u8d64\u72d0\u517d\u5361',
] as const;
export const BEAST_CARD_REWARD_ROOT_Y = -512;
export const BEAST_CARD_REWARD_FRAME_WIDTH = 128;
export const BEAST_CARD_REWARD_FRAME_HEIGHT = 138;
export const BEAST_CARD_REWARD_ICON_WIDTH = 128;
export const BEAST_CARD_REWARD_ICON_HEIGHT = 96;
export const BEAST_CARD_REWARD_RECORD_X = 185;
export const BEAST_CARD_REWARD_RECORD_SIZE = 86;
export const BEAST_CARD_STRENGTHEN_BUTTON_WIDTH = 96;
export const BEAST_CARD_STRENGTHEN_BUTTON_HEIGHT = 110;
export const BEAST_CARD_STRENGTHEN_BUTTON_X = 285;
export const BEAST_CARD_STRENGTHEN_BUTTON_Y = 620;
export const BEAST_STRENGTHEN_STORAGE_KEY = 'duxiachuan_beast_strengthen_v1';
export const BEAST_STRENGTHEN_DEFAULT_YUANBAO = 20000;
export const BEAST_STRENGTHEN_UNLOCK_COST = 100;
export const BEAST_STRENGTHEN_EQUIPMENT_BONUS = 10;
export const BEAST_STRENGTHEN_GEM_SLOT_COUNT = 6;
export const BEAST_STRENGTHEN_GEM_PANEL_WIDTH = 672;
export const BEAST_STRENGTHEN_GEM_PANEL_HEIGHT = 597;
export const BEAST_STRENGTHEN_GEM_PANEL_Y = 245;
export const BEAST_STRENGTHEN_CENTER_EQUIP_SIZE = 148;
export const BEAST_STRENGTHEN_EQUIP_SLOT_SIZE = 95;
export const BEAST_STRENGTHEN_EQUIP_ICON_SIZE = 68;
export const BEAST_STRENGTHEN_GEM_SLOT_SIZE = 95;
export const BEAST_STRENGTHEN_GEM_ICON_SIZE = 66;
export const BEAST_STRENGTHEN_EQUIP_ROW_Y = -278;
export const BEAST_STRENGTHEN_BONUS_Y = -485;
export const BEAST_STRENGTHEN_ACTION_Y = -630;
export const BEAST_CARD_YUANBAO_MULTIPLIER = 1.25;
export const BEAST_CARD_YUANBAO_RATE_X = -260;
export const BEAST_CARD_YUANBAO_RATE_Y = 735;
export const BEAST_CARD_YUANBAO_RATE_WIDTH = 207;
export const BEAST_CARD_YUANBAO_RATE_HEIGHT = 65;
export const BEAST_CARD_OUTPUT_COUNTDOWN_Y = -628;
export const BEAST_CARD_OUTPUT_RATE_Y = -672;
export const BEAST_CARD_OUTPUT_AMOUNT_Y = -706;
export const BEAST_CARD_OUTPUT_TEXT_WIDTH = 560;
export const BEAST_CARD_OUTPUT_RATE_HOURS = 24;
export const BEAST_CARD_OUTPUT_AMOUNT = '189.8952';
export const BEAST_CARD_OUTPUT_MULTIPLIER = '1.32';
export const BEAST_RECORD_POPUP_WIDTH = 536;
export const BEAST_RECORD_POPUP_HEIGHT = 768;
export const BEAST_RECORD_POPUP_Y = 20;
export const BEAST_RECORD_TITLE_FRAME_WIDTH = 486;
export const BEAST_RECORD_TITLE_FRAME_HEIGHT = 84;
export const BEAST_RECORD_VIEWPORT_WIDTH = 490;
export const BEAST_RECORD_VIEWPORT_HEIGHT = 560;
export const BEAST_RECORD_VIEWPORT_Y = -42;
export const BEAST_RECORD_ROW_HEIGHT = 70;
export const BEAST_RECORD_ROW_GAP = 76;
export const BEAST_RECORD_ROW_COUNT = 8;
export const BEAST_CARD_ANIMATIONS = ['animation', 'idle'];
export const BEAST_CARDS = [
    {
        name: '\u51b0\u7130\u50b2\u72ee',
        description: '\u51b0\u7130\u62a4\u4f53\u00b7\u653b\u5b88\u517c\u5907',
        skelPath: 'Spine/Beast/Card1/pet03',
        x: 0,
        y: BEAST_CARD_SPINE_Y,
        scale: 0.85,
    },
    {
        name: '\u5e7b\u96ea\u9e3e\u821e',
        description: '\u5e7b\u96ea\u6d41\u5149\u00b7\u7075\u52a8\u8fc5\u6377',
        skelPath: 'Spine/Beast/Card2/pet5',
        x: 0,
        y: BEAST_CARD_SPINE_Y,
        scale: 0.68,
    },
    {
        name: '\u91d1\u7130\u76f8\u7fbd',
        description: '\u91d1\u7130\u5929\u7fd4\u00b7\u707c\u70e7\u7834\u9635',
        skelPath: 'Spine/Beast/Card3/pet08',
        x: 0,
        y: BEAST_CARD_SPINE_Y,
        scale: 1,
    },
    {
        name: '\u7130\u708e\u4e5d\u5c3e\u72d0',
        description: '\u4e5d\u5c3e\u7130\u821e\u00b7\u6301\u7eed\u707c\u70e7',
        skelPath: 'Spine/Beast/Card4/pet10',
        x: 0,
        y: BEAST_CARD_SPINE_Y,
        scale: 0.82,
    },
] as const;
export const BATTLE_BG_SKEL_PATH = 'Spine/Battle/\u4ed9\u57df\u80cc\u666fspine\u52a8\u753b/skeleton';
export const BATTLE_BG_ANIMATIONS = ['idle', 'animation'];
export const BATTLE_BG_SCALE = 1.20;
export const BATTLE_BG_OFFSET_X = -10;
export const BATTLE_BG_OFFSET_Y = -10;
export const BATTLE_LEVEL_SUBTITLE_WIDTH = 250;
export const BATTLE_LEVEL_SUBTITLE_HEIGHT = 36;
export const BATTLE_LEVEL_SUBTITLE_Y = 670;
export const BATTLE_LEVEL_SUBTITLE_TEXT = '\u6218\u573a\u7b49\u7ea7\uff1a0\u7ea7';
export const BATTLE_ENTRY_MATERIAL_BAR_WIDTH = 470;
export const BATTLE_ENTRY_MATERIAL_BAR_HEIGHT = 184;
export const BATTLE_ENTRY_MATERIAL_BAR_Y = 535;
export const BATTLE_DAILY_CHALLENGE_COUNT_Y = 426;
export const BATTLE_DAILY_CHALLENGE_TEXT = '\u4eca\u65e5\u53ef\u6311\u6218\u6b21\u6570';
export const BATTLE_DAILY_CHALLENGE_VALUE = '(5/20)';
export const BATTLE_DAILY_CHALLENGE_TEXT_WIDTH = 208;
export const BATTLE_DAILY_CHALLENGE_VALUE_WIDTH = 96;
export const BATTLE_DAILY_CHALLENGE_TEXT_X = -42;
export const BATTLE_DAILY_CHALLENGE_VALUE_X = 106;
export const BATTLE_ENTRY_MATERIAL_ITEM_WIDTH = 138;
export const BATTLE_ENTRY_MATERIAL_ITEM_HEIGHT = 44;
export const BATTLE_ENTRY_MATERIAL_ICON_SIZE = 40;
export const BATTLE_ENTRY_MATERIAL_AMOUNT_BG_WIDTH = 138;
export const BATTLE_ENTRY_MATERIAL_AMOUNT_BG_HEIGHT = 32;
export const BATTLE_ENTRY_MATERIAL_FIRST_ROW_COUNT = 3;
export const BATTLE_ENTRY_MATERIAL_SECOND_ROW_START_COLUMN = 0;
export const BATTLE_ENTRY_MATERIAL_COLUMN_SPACING = 150;
export const BATTLE_ENTRY_MATERIAL_ROW_SPACING = 62;
export const BATTLE_ENTRY_MATERIAL_ICON_X = -52;
export const BATTLE_ENTRY_MATERIAL_ICON_Y = 3;
export const BATTLE_ENTRY_MATERIAL_AMOUNT_LABEL_X = 20;
export const BATTLE_ENTRY_MATERIAL_AMOUNT_LABEL_WIDTH = 82;
export const BATTLE_ENTRY_ACTION_BUTTON_WIDTH = 180;
export const BATTLE_ENTRY_ACTION_BUTTON_HEIGHT = 69;
export const BATTLE_ENTRY_ACTION_BUTTON_Y = -610;
export const BATTLE_ENTRY_ACTION_BUTTON_SPACING = 190;
export const BATTLE_ENTRY_TICKET_COST_WIDTH = 92;
export const BATTLE_ENTRY_TICKET_COST_HEIGHT = 34;
export const BATTLE_ENTRY_TICKET_ICON_SIZE = 28;
export const BATTLE_ENTRY_TICKET_ICON_X = -26;
export const BATTLE_ENTRY_TICKET_AMOUNT_LABEL_X = 14;
export const BATTLE_ENTRY_TICKET_AMOUNT_LABEL_WIDTH = 58;
export const BATTLE_ENTRY_TICKET_COST_OFFSET_X = -30;
export const BATTLE_ENTRY_TICKET_COST_Y = 58;
export const BATTLE_CHALLENGE_TICKET_COST = 80;
export const BATTLE_TARGET_CHALLENGE_TICKET_COST = 160;
export const BATTLE_CHALLENGE_REMAIN_Y = -674;
export const BATTLE_CHALLENGE_FREE_TIME_Y = -704;
export const BATTLE_CHALLENGE_REMAIN_TEXT = '\u5269\u4f59\u6b21\u6570 0/4';
export const BATTLE_CHALLENGE_FREE_TIME_TEXT = '13:21 \u540e\u83b7\u5f97 1 \u6b21\u514d\u8d39\u6311\u6218\u6b21\u6570';
export const BATTLE_ENTRY_MATERIALS = [
    { icon: `${UI_BATTLE_MATERIAL_ROOT}/battle_material_1`, amount: '9526' },
    { icon: `${UI_BATTLE_MATERIAL_ROOT}/battle_material_2`, amount: '4127' },
    { icon: `${UI_BATTLE_MATERIAL_ROOT}/battle_material_3`, amount: '879' },
    { icon: `${UI_BATTLE_MATERIAL_ROOT}/battle_material_4`, amount: '814' },
    { icon: `${UI_BATTLE_MATERIAL_ROOT}/battle_material_5`, amount: '0' },
] as const;
export const BATTLE_UPGRADE_POPUP_WIDTH = 536;
export const BATTLE_UPGRADE_POPUP_HEIGHT = 768;
export const BATTLE_UPGRADE_CARD_CURRENT_X = -130;
export const BATTLE_UPGRADE_CARD_NEXT_X = 130;
export const BATTLE_UPGRADE_CARD_Y = 214;
export const BATTLE_UPGRADE_CURRENT_FRAME_WIDTH = 169;
export const BATTLE_UPGRADE_CURRENT_FRAME_HEIGHT = 264;
export const BATTLE_UPGRADE_NEXT_FRAME_WIDTH = 169;
export const BATTLE_UPGRADE_NEXT_FRAME_HEIGHT = 269;
export const BATTLE_UPGRADE_ICON_SIZE = 108;
export const BATTLE_UPGRADE_ICON_Y = 270;
export const BATTLE_UPGRADE_LEVEL_Y = 202;
export const BATTLE_UPGRADE_ARROW_Y = 256;
export const BATTLE_UPGRADE_OUTPUT_PANEL_WIDTH = 244;
export const BATTLE_UPGRADE_OUTPUT_PANEL_HEIGHT = 178;
export const BATTLE_UPGRADE_OUTPUT_PANEL_X = 128;
export const BATTLE_UPGRADE_OUTPUT_PANEL_Y = -18;
export const BATTLE_UPGRADE_OUTPUT_ITEM_WIDTH = 72;
export const BATTLE_UPGRADE_OUTPUT_ITEM_HEIGHT = 54;
export const BATTLE_UPGRADE_OUTPUT_ITEM_COLUMN_GAP = 76;
export const BATTLE_UPGRADE_OUTPUT_ITEM_ROW_GAP = 56;
export const BATTLE_UPGRADE_OUTPUT_ICON_SIZE = 34;
export const BATTLE_UPGRADE_OUTPUT_LABEL_WIDTH = 78;
export const BATTLE_UPGRADE_OUTPUT_LABEL_HEIGHT = 24;
export const BATTLE_UPGRADE_OUTPUT_LABEL_FONT_SIZE = 15;
export const BATTLE_UPGRADE_MATERIAL_BAR_WIDTH = 510;
export const BATTLE_UPGRADE_MATERIAL_BAR_HEIGHT = 70;
export const BATTLE_UPGRADE_MATERIAL_BAR_Y = -216;
export const BATTLE_UPGRADE_MATERIAL_ITEM_WIDTH = 160;
export const BATTLE_UPGRADE_MATERIAL_ITEM_HEIGHT = 46;
export const BATTLE_UPGRADE_MATERIAL_ITEM_SPACING = 168;
export const BATTLE_UPGRADE_MATERIAL_ICON_SIZE = 42;
export const BATTLE_UPGRADE_MATERIAL_ICON_X = -54;
export const BATTLE_UPGRADE_MATERIAL_TEXT_X = 28;
export const BATTLE_UPGRADE_BUTTON_WIDTH = 162;
export const BATTLE_UPGRADE_BUTTON_HEIGHT = 62;
export const BATTLE_UPGRADE_BUTTON_Y = -310;
export const BATTLE_UPGRADE_MATERIALS = [
    { icon: `${UI_BATTLE_MATERIAL_ROOT}/battle_material_1`, owned: '82604', need: '17250' },
    { icon: `${UI_BATTLE_MATERIAL_ROOT}/battle_material_2`, owned: '7376', need: '3330' },
    { icon: `${UI_BATTLE_MATERIAL_ROOT}/battle_material_3`, owned: '11933', need: '990' },
] as const;
export const BATTLE_UPGRADE_CURRENT_OUTPUTS = [
    { name: '\u51e1\u6307\u6212', icon: `${UI_BATTLE_MATERIAL_ROOT}/battle_material_1` },
    { name: '\u5e73\u5b89\u4f69', icon: `${UI_BATTLE_MATERIAL_ROOT}/battle_material_2` },
    { name: '\u7f20\u4e1d\u73af', icon: `${UI_BATTLE_MATERIAL_ROOT}/battle_material_3` },
    { name: '\u4e00\u7ea7\u7ecf\u9a8c\u73e0', icon: `${UI_BATTLE_UPGRADE_OUTPUT_ROOT}/battle_output_exp_1` },
    { name: '\u4e00\u7ea7\u7a81\u7834\u73e0', icon: `${UI_BATTLE_UPGRADE_OUTPUT_ROOT}/battle_output_break_1` },
    { name: '\u4e8c\u7ea7\u7ecf\u9a8c\u73e0', icon: `${UI_BATTLE_UPGRADE_OUTPUT_ROOT}/battle_output_exp_2` },
    { name: '\u4e8c\u7ea7\u7a81\u7834\u73e0', icon: `${UI_BATTLE_UPGRADE_OUTPUT_ROOT}/battle_output_break_2` },
] as const;
export const BATTLE_UPGRADE_NEXT_OUTPUTS = [
    { name: '\u5e73\u5b89\u4f69', icon: `${UI_BATTLE_MATERIAL_ROOT}/battle_material_2` },
    { name: '\u7f20\u4e1d\u73af', icon: `${UI_BATTLE_MATERIAL_ROOT}/battle_material_3` },
    { name: '\u82cd\u7483\u7389', icon: `${UI_BATTLE_MATERIAL_ROOT}/battle_material_4` },
    { name: '\u4e8c\u7ea7\u7ecf\u9a8c\u73e0', icon: `${UI_BATTLE_UPGRADE_OUTPUT_ROOT}/battle_output_exp_2` },
    { name: '\u4e8c\u7ea7\u7a81\u7834\u73e0', icon: `${UI_BATTLE_UPGRADE_OUTPUT_ROOT}/battle_output_break_2` },
    { name: '\u4e09\u7ea7\u7ecf\u9a8c\u73e0', icon: `${UI_BATTLE_UPGRADE_OUTPUT_ROOT}/battle_output_exp_3` },
    { name: '\u4e09\u7ea7\u7a81\u7834\u73e0', icon: `${UI_BATTLE_UPGRADE_OUTPUT_ROOT}/battle_output_break_3` },
] as const;
export const BATTLE_TARGET_CHALLENGE_POPUP_WIDTH = 725;
export const BATTLE_TARGET_CHALLENGE_POPUP_HEIGHT = 505;
export const BATTLE_TARGET_CHALLENGE_TITLE_WIDTH = 486;
export const BATTLE_TARGET_CHALLENGE_TITLE_HEIGHT = 84;
export const BATTLE_TARGET_CHALLENGE_TITLE_Y = 182;
export const BATTLE_TARGET_CHALLENGE_CONTENT_WIDTH = 520;
export const BATTLE_TARGET_CHALLENGE_CONTENT_HEIGHT = 236;
export const BATTLE_TARGET_CHALLENGE_CONTENT_Y = 18;
export const BATTLE_TARGET_CHALLENGE_OPTION_WIDTH = 420;
export const BATTLE_TARGET_CHALLENGE_OPTION_HEIGHT = 56;
export const BATTLE_TARGET_CHALLENGE_OPTION_GAP = 58;
export const BATTLE_TARGET_CHALLENGE_OPTION_LABEL_X = -76;
export const BATTLE_TARGET_CHALLENGE_OPTION_CHECKBOX_X = 160;
export const BATTLE_TARGET_CHALLENGE_CHECKBOX_SIZE = 44;
export const BATTLE_TARGET_CHALLENGE_SELECTED_BG_X = -76;
export const BATTLE_TARGET_CHALLENGE_SELECTED_BG_WIDTH = 158;
export const BATTLE_TARGET_CHALLENGE_SELECTED_BG_HEIGHT = 62;
export const BATTLE_TARGET_CHALLENGE_MESSAGE_WIDTH = 540;
export const BATTLE_TARGET_CHALLENGE_MESSAGE_HEIGHT = 180;
export const BATTLE_TARGET_CHALLENGE_MESSAGE_Y = 18;
export const BATTLE_TARGET_CHALLENGE_BUTTON_WIDTH = 162;
export const BATTLE_TARGET_CHALLENGE_BUTTON_HEIGHT = 62;
export const BATTLE_TARGET_CHALLENGE_BUTTON_Y = -186;
export const BATTLE_TARGET_CHALLENGE_BUTTON_X = 112;
export const BATTLE_AUTO_HOST_BUTTON_SIZE = 86;
export const BATTLE_AUTO_HOST_ICON_SIZE = 70;
export const BATTLE_AUTO_HOST_BUTTON_X = 302;
export const BATTLE_AUTO_HOST_BUTTON_Y = 704;
export const BATTLE_TARGET_CHALLENGE_OPTIONS = [
    '\u6218\u573a\u6750\u6599',
    '\u7ecf\u9a8c\u73e0',
    '\u7a81\u7834\u73e0',
    '\u88c5\u5907',
] as const;
export const BATTLE_COMBAT_BG_SKEL_PATH = 'Spine/Battle/\u4ed9\u57df\u6218\u573a\u80cc\u666fspine\u52a8\u753b/skeleton';
export const BATTLE_COMBAT_BG_ANIMATIONS = ['idle', 'animation'];
export const BATTLE_COMBAT_BG_SCALE = 1.8;
export const BATTLE_MONSTER_SKEL_PATH = 'Spine/Battle/IronGuard/skeleton';
export const BATTLE_MONSTER_IDLE_ANIMATIONS = ['ready'];
export const BATTLE_MONSTER_WALK_ANIMATIONS = ['run'];
export const BATTLE_MONSTER_HURT_ANIMATIONS = ['hit1', 'hit2', 'hit3', 'hurt', 'hit', 'damage'];
export const BATTLE_MONSTER_DIE_ANIMATIONS = ['dead'];
export const BATTLE_MONSTER_SKIN_NAMES = ['default'];
export const BATTLE_ROLE_NORMAL_ATTACK_ANIMATIONS = ['action1', 'gongji_1', 'attack', 'atk'];
export const BATTLE_WAVE_TOTAL = 6;
export const BATTLE_WAVE_LABEL_Y = 610;
export const BATTLE_WAVE_LABEL_WIDTH = 260;
export const BATTLE_WAVE_LABEL_HEIGHT = 52;
export const BATTLE_WAVE_LABEL_FONT_SIZE = 30;
export const BATTLE_WAVE_ATTACK_START_DELAY = 1.55;
export const BATTLE_WAVE_DURATION = 4.25;
export const BATTLE_WAVE_DEATH_FALLBACK_DURATION = 0.85;
export const BATTLE_WAVE_NEXT_DELAY = 0.38;
export const BATTLE_DAMAGE_DIGIT_WIDTH = 29;
export const BATTLE_DAMAGE_DIGIT_HEIGHT = 35;
export const BATTLE_DAMAGE_DIGIT_SPACING = 20;
export const BATTLE_DAMAGE_NUMBER_SCALE = 1.18;
export const BATTLE_DAMAGE_NUMBER_FLOAT_TIME = 0.82;
export const BATTLE_DAMAGE_NUMBER_START_OFFSET_X = 6;
export const BATTLE_DAMAGE_NUMBER_START_OFFSET_Y = 110;
export const BATTLE_DAMAGE_NUMBER_FLOAT_X = 92;
export const BATTLE_DAMAGE_NUMBER_FLOAT_Y = 76;
export const BATTLE_DAMAGE_NUMBER_STAGGER_X = 10;
export const BATTLE_DAMAGE_NUMBER_STAGGER_Y = 8;
export const BATTLE_REWARD_TEXT_SKEL_PATH = 'Spine/Common/RewardText/shenglishibaigongxihuode/shenglishibaigongxihuode';
export const BATTLE_REWARD_TEXT_INTRO_ANIMATION = 'gongxihuode_chufa';
export const BATTLE_REWARD_TEXT_LOOP_ANIMATION = 'gongxihuode_loop';
export const BATTLE_REWARD_POPUP_WIDTH = 752;
export const BATTLE_REWARD_POPUP_HEIGHT = 376;
export const BATTLE_REWARD_POPUP_Y = -32;
export const BATTLE_REWARD_TEXT_Y = -50;
export const BATTLE_REWARD_TEXT_WIDTH = 620;
export const BATTLE_REWARD_TEXT_HEIGHT = 260;
export const BATTLE_REWARD_TEXT_SCALE = 1.05;
export const BATTLE_REWARD_GRID_Y = -58;
export const BATTLE_REWARD_GRID_COLUMNS = 5;
export const BATTLE_REWARD_GRID_ITEM_COUNT = 8;
export const BATTLE_REWARD_GRID_COLUMN_GAP = 112;
export const BATTLE_REWARD_GRID_ROW_GAP = 102;
export const BATTLE_REWARD_SLOT_SIZE = 94;
export const BATTLE_REWARD_FRAME_SIZE = 86;
export const BATTLE_REWARD_ICON_SIZE = 64;
export const BATTLE_REWARD_COUNT_VALUES = ['5', '7', '10', '1', '20', '5', '20', '1'] as const;
export const MAIL_ROW_WIDTH = 560;
export const MAIL_ROW_HEIGHT = 143;
export const MAIL_ROW_START_Y = 390;
export const MAIL_ROW_GAP = 150;
export const MAIL_ROW_CLAIM_BUTTON_WIDTH = 116;
export const MAIL_ROW_CLAIM_BUTTON_HEIGHT = 48;
export const MAIL_ROW_CLAIM_BUTTON_X = 214;
export const MAIL_ROW_UNREAD_DOT_X = 252;
export const MAIL_ROW_UNREAD_DOT_Y = 46;
export const BATTLE_ROLE_SCALE = 0.45;
export const BATTLE_MONSTER_SCALE = 4.2;
export const BATTLE_ROLE_ATTACK_TIME_SCALE = 2;
export const BATTLE_ROLE_ATTACK_GAP = 0.06;
export const BATTLE_ROLE_ATTACK_FALLBACK_DURATIONS: Record<RoleGender, { normal: number; skill: number }> = {
    male: { normal: 2.867, skill: 3.8 },
    female: { normal: 1.5, skill: 1.833 },
};
export const BATTLE_ROLE_POSITION = new Vec3(-155, -15, 0);
export const BATTLE_MONSTER_START_POSITIONS = [
    new Vec3(250, 365, 0),
    new Vec3(298, 192, 0),
    new Vec3(244, 14, 0),
    new Vec3(102, 308, 0),
    new Vec3(106, -76, 0),
    new Vec3(318, -124, 0),
];
export const BATTLE_MONSTER_TARGET_POSITIONS = [
    new Vec3(66, 14, 0),
    new Vec3(148, -12, 0),
    new Vec3(226, -46, 0),
    new Vec3(92, -102, 0),
    new Vec3(178, -138, 0),
    new Vec3(264, -106, 0),
];
export const ROLE_PAGE_LEFT_EQUIPS = [UI_ROLE_EQUIP_WEAPON, UI_ROLE_EQUIP_NECKLACE, UI_ROLE_EQUIP_WRIST, UI_ROLE_EQUIP_LEG];
export const ROLE_PAGE_RIGHT_EQUIPS = [UI_ROLE_EQUIP_HELMET, UI_ROLE_EQUIP_ARMOR, UI_ROLE_EQUIP_RING, UI_ROLE_EQUIP_SHOES];
export const ROLE_LEVEL_EXP_TABLE = [
    { level: 2, needExp: 10, totalExp: 10 },
    { level: 3, needExp: 18, totalExp: 28 },
    { level: 4, needExp: 28, totalExp: 56 },
    { level: 5, needExp: 40, totalExp: 96 },
    { level: 6, needExp: 54, totalExp: 150 },
    { level: 7, needExp: 70, totalExp: 220 },
    { level: 8, needExp: 88, totalExp: 308 },
    { level: 9, needExp: 108, totalExp: 416 },
    { level: 10, needExp: 130, totalExp: 546 },
    { level: 11, needExp: 402, totalExp: 948 },
    { level: 12, needExp: 866, totalExp: 1814 },
    { level: 13, needExp: 986, totalExp: 2800 },
    { level: 14, needExp: 1114, totalExp: 3914 },
    { level: 15, needExp: 1250, totalExp: 5164 },
    { level: 16, needExp: 1394, totalExp: 6558 },
    { level: 17, needExp: 1546, totalExp: 8104 },
    { level: 18, needExp: 1706, totalExp: 9810 },
    { level: 19, needExp: 1874, totalExp: 11684 },
    { level: 20, needExp: 2050, totalExp: 13734 },
    { level: 21, needExp: 6988, totalExp: 20722 },
    { level: 22, needExp: 7492, totalExp: 28214 },
    { level: 23, needExp: 8012, totalExp: 36226 },
    { level: 24, needExp: 8548, totalExp: 44774 },
    { level: 25, needExp: 37931, totalExp: 82706 },
    { level: 26, needExp: 41230, totalExp: 123937 },
    { level: 27, needExp: 44689, totalExp: 168626 },
    { level: 28, needExp: 48588, totalExp: 217214 },
    { level: 29, needExp: 52089, totalExp: 269304 },
    { level: 30, needExp: 56035, totalExp: 325339 },
    { level: 31, needExp: 160878, totalExp: 486218 },
    { level: 32, needExp: 179940, totalExp: 666158 },
    { level: 33, needExp: 205895, totalExp: 872053 },
    { level: 34, needExp: 221972, totalExp: 1094026 },
    { level: 35, needExp: 335943, totalExp: 1429970 },
    { level: 36, needExp: 361919, totalExp: 1791889 },
    { level: 37, needExp: 389136, totalExp: 2181025 },
    { level: 38, needExp: 417617, totalExp: 2598643 },
    { level: 39, needExp: 447387, totalExp: 3046031 },
    { level: 40, needExp: 686172, totalExp: 3732203 },
    { level: 41, needExp: 747808, totalExp: 4480011 },
    { level: 42, needExp: 798808, totalExp: 5278820 },
    { level: 43, needExp: 852013, totalExp: 6130833 },
    { level: 44, needExp: 907465, totalExp: 7038298 },
    { level: 45, needExp: 2033650, totalExp: 9071948 },
    { level: 46, needExp: 2170932, totalExp: 11242880 },
    { level: 47, needExp: 2314286, totalExp: 13557166 },
    { level: 48, needExp: 2463844, totalExp: 16021010 },
    { level: 49, needExp: 2619738, totalExp: 18640748 },
    { level: 50, needExp: 2782100, totalExp: 21591810 },
] as const;
export const ROLE_BREAKTHROUGH_TABLE = [
    { level: 5, white: 5, green: 0, blue: 0, purple: 0 },
    { level: 10, white: 20, green: 0, blue: 0, purple: 0 },
    { level: 15, white: 200, green: 50, blue: 0, purple: 0 },
    { level: 20, white: 400, green: 200, blue: 100, purple: 0 },
    { level: 25, white: 2000, green: 1000, blue: 500, purple: 0 },
    { level: 30, white: 4000, green: 1500, blue: 1000, purple: 1000 },
    { level: 35, white: 8000, green: 3000, blue: 1800, purple: 1500 },
    { level: 40, white: 12000, green: 5000, blue: 3000, purple: 2500 },
    { level: 45, white: 20000, green: 8000, blue: 4800, purple: 4000 },
] as const;
export const ROLE_EQUIPMENT_LEVEL_TABLE = [
    { level: 1, armorDefense: 20, wristLife: 400, ringDefense: 5, helmetDefense: 3, legDefense: 2, weaponAttack: 40, necklaceLife: 100, shoesAttack: 5 },
    { level: 2, armorDefense: 40, wristLife: 800, ringDefense: 10, helmetDefense: 5, legDefense: 5, weaponAttack: 80, necklaceLife: 200, shoesAttack: 10 },
    { level: 3, armorDefense: 60, wristLife: 1200, ringDefense: 15, helmetDefense: 8, legDefense: 7, weaponAttack: 120, necklaceLife: 300, shoesAttack: 15 },
    { level: 4, armorDefense: 80, wristLife: 1600, ringDefense: 20, helmetDefense: 10, legDefense: 10, weaponAttack: 160, necklaceLife: 400, shoesAttack: 20 },
    { level: 5, armorDefense: 100, wristLife: 2000, ringDefense: 25, helmetDefense: 13, legDefense: 12, weaponAttack: 200, necklaceLife: 500, shoesAttack: 25 },
    { level: 6, armorDefense: 120, wristLife: 2400, ringDefense: 30, helmetDefense: 15, legDefense: 15, weaponAttack: 240, necklaceLife: 600, shoesAttack: 30 },
    { level: 7, armorDefense: 140, wristLife: 2800, ringDefense: 35, helmetDefense: 18, legDefense: 17, weaponAttack: 280, necklaceLife: 700, shoesAttack: 35 },
    { level: 8, armorDefense: 160, wristLife: 3200, ringDefense: 40, helmetDefense: 20, legDefense: 20, weaponAttack: 320, necklaceLife: 800, shoesAttack: 40 },
    { level: 9, armorDefense: 180, wristLife: 3600, ringDefense: 45, helmetDefense: 23, legDefense: 22, weaponAttack: 360, necklaceLife: 900, shoesAttack: 45 },
    { level: 10, armorDefense: 200, wristLife: 4000, ringDefense: 50, helmetDefense: 25, legDefense: 25, weaponAttack: 400, necklaceLife: 1000, shoesAttack: 50 },
    { level: 11, armorDefense: 220, wristLife: 4400, ringDefense: 55, helmetDefense: 28, legDefense: 27, weaponAttack: 440, necklaceLife: 1100, shoesAttack: 55 },
    { level: 12, armorDefense: 240, wristLife: 4800, ringDefense: 60, helmetDefense: 30, legDefense: 30, weaponAttack: 480, necklaceLife: 1200, shoesAttack: 60 },
    { level: 13, armorDefense: 260, wristLife: 5200, ringDefense: 65, helmetDefense: 33, legDefense: 32, weaponAttack: 520, necklaceLife: 1300, shoesAttack: 65 },
    { level: 14, armorDefense: 280, wristLife: 5600, ringDefense: 70, helmetDefense: 35, legDefense: 35, weaponAttack: 560, necklaceLife: 1400, shoesAttack: 70 },
    { level: 15, armorDefense: 300, wristLife: 6000, ringDefense: 75, helmetDefense: 38, legDefense: 37, weaponAttack: 600, necklaceLife: 1500, shoesAttack: 75 },
    { level: 16, armorDefense: 320, wristLife: 6400, ringDefense: 80, helmetDefense: 40, legDefense: 40, weaponAttack: 640, necklaceLife: 1600, shoesAttack: 80 },
    { level: 17, armorDefense: 340, wristLife: 6800, ringDefense: 85, helmetDefense: 43, legDefense: 42, weaponAttack: 680, necklaceLife: 1700, shoesAttack: 85 },
    { level: 18, armorDefense: 360, wristLife: 7200, ringDefense: 90, helmetDefense: 45, legDefense: 45, weaponAttack: 720, necklaceLife: 1800, shoesAttack: 90 },
    { level: 19, armorDefense: 380, wristLife: 7600, ringDefense: 95, helmetDefense: 48, legDefense: 47, weaponAttack: 760, necklaceLife: 1900, shoesAttack: 95 },
    { level: 20, armorDefense: 400, wristLife: 8000, ringDefense: 100, helmetDefense: 50, legDefense: 50, weaponAttack: 800, necklaceLife: 2000, shoesAttack: 100 },
    { level: 21, armorDefense: 600, wristLife: 12000, ringDefense: 150, helmetDefense: 75, legDefense: 75, weaponAttack: 1200, necklaceLife: 3000, shoesAttack: 150 },
    { level: 22, armorDefense: 800, wristLife: 16000, ringDefense: 200, helmetDefense: 100, legDefense: 100, weaponAttack: 1600, necklaceLife: 4000, shoesAttack: 200 },
    { level: 23, armorDefense: 1000, wristLife: 20000, ringDefense: 250, helmetDefense: 125, legDefense: 125, weaponAttack: 2000, necklaceLife: 5000, shoesAttack: 250 },
    { level: 24, armorDefense: 1200, wristLife: 24000, ringDefense: 300, helmetDefense: 150, legDefense: 150, weaponAttack: 2400, necklaceLife: 6000, shoesAttack: 300 },
    { level: 25, armorDefense: 1520, wristLife: 30400, ringDefense: 380, helmetDefense: 190, legDefense: 190, weaponAttack: 3040, necklaceLife: 7600, shoesAttack: 380 },
    { level: 26, armorDefense: 1840, wristLife: 36800, ringDefense: 460, helmetDefense: 230, legDefense: 230, weaponAttack: 3680, necklaceLife: 9200, shoesAttack: 460 },
    { level: 27, armorDefense: 2160, wristLife: 43200, ringDefense: 540, helmetDefense: 270, legDefense: 270, weaponAttack: 4320, necklaceLife: 10800, shoesAttack: 540 },
    { level: 28, armorDefense: 2400, wristLife: 48000, ringDefense: 600, helmetDefense: 300, legDefense: 300, weaponAttack: 4800, necklaceLife: 12000, shoesAttack: 600 },
    { level: 29, armorDefense: 2640, wristLife: 52800, ringDefense: 660, helmetDefense: 330, legDefense: 330, weaponAttack: 5280, necklaceLife: 13200, shoesAttack: 660 },
    { level: 30, armorDefense: 2880, wristLife: 57600, ringDefense: 720, helmetDefense: 360, legDefense: 360, weaponAttack: 5760, necklaceLife: 14400, shoesAttack: 720 },
    { level: 31, armorDefense: 3080, wristLife: 61600, ringDefense: 770, helmetDefense: 385, legDefense: 385, weaponAttack: 6160, necklaceLife: 15400, shoesAttack: 770 },
    { level: 32, armorDefense: 3280, wristLife: 65600, ringDefense: 820, helmetDefense: 410, legDefense: 410, weaponAttack: 6560, necklaceLife: 16400, shoesAttack: 820 },
    { level: 33, armorDefense: 3480, wristLife: 69600, ringDefense: 870, helmetDefense: 435, legDefense: 435, weaponAttack: 6960, necklaceLife: 17400, shoesAttack: 870 },
    { level: 34, armorDefense: 3680, wristLife: 73600, ringDefense: 920, helmetDefense: 460, legDefense: 460, weaponAttack: 7360, necklaceLife: 18400, shoesAttack: 920 },
    { level: 35, armorDefense: 3880, wristLife: 77600, ringDefense: 970, helmetDefense: 485, legDefense: 485, weaponAttack: 7760, necklaceLife: 19400, shoesAttack: 970 },
    { level: 36, armorDefense: 4080, wristLife: 81600, ringDefense: 1020, helmetDefense: 510, legDefense: 510, weaponAttack: 8160, necklaceLife: 20400, shoesAttack: 1020 },
    { level: 37, armorDefense: 4400, wristLife: 88000, ringDefense: 1100, helmetDefense: 550, legDefense: 550, weaponAttack: 8800, necklaceLife: 22000, shoesAttack: 1100 },
    { level: 38, armorDefense: 4800, wristLife: 96000, ringDefense: 1200, helmetDefense: 600, legDefense: 600, weaponAttack: 9600, necklaceLife: 24000, shoesAttack: 1200 },
    { level: 39, armorDefense: 5200, wristLife: 104000, ringDefense: 1300, helmetDefense: 650, legDefense: 650, weaponAttack: 10400, necklaceLife: 26000, shoesAttack: 1300 },
    { level: 40, armorDefense: 5600, wristLife: 112000, ringDefense: 1400, helmetDefense: 700, legDefense: 700, weaponAttack: 11200, necklaceLife: 28000, shoesAttack: 1400 },
    { level: 41, armorDefense: 6800, wristLife: 136000, ringDefense: 1700, helmetDefense: 850, legDefense: 850, weaponAttack: 13600, necklaceLife: 34000, shoesAttack: 1700 },
    { level: 42, armorDefense: 8000, wristLife: 160000, ringDefense: 2000, helmetDefense: 1000, legDefense: 1000, weaponAttack: 16000, necklaceLife: 40000, shoesAttack: 2000 },
    { level: 43, armorDefense: 9200, wristLife: 184000, ringDefense: 2300, helmetDefense: 1150, legDefense: 1150, weaponAttack: 18400, necklaceLife: 46000, shoesAttack: 2300 },
    { level: 44, armorDefense: 10400, wristLife: 208000, ringDefense: 2600, helmetDefense: 1300, legDefense: 1300, weaponAttack: 20800, necklaceLife: 52000, shoesAttack: 2600 },
    { level: 45, armorDefense: 11600, wristLife: 232000, ringDefense: 2900, helmetDefense: 1450, legDefense: 1450, weaponAttack: 23200, necklaceLife: 58000, shoesAttack: 2900 },
    { level: 46, armorDefense: 12800, wristLife: 256000, ringDefense: 3200, helmetDefense: 1600, legDefense: 1600, weaponAttack: 25600, necklaceLife: 64000, shoesAttack: 3200 },
    { level: 47, armorDefense: 14000, wristLife: 280000, ringDefense: 3500, helmetDefense: 1750, legDefense: 1750, weaponAttack: 28000, necklaceLife: 70000, shoesAttack: 3500 },
    { level: 48, armorDefense: 15200, wristLife: 304000, ringDefense: 3800, helmetDefense: 1900, legDefense: 1900, weaponAttack: 30400, necklaceLife: 76000, shoesAttack: 3800 },
    { level: 49, armorDefense: 16400, wristLife: 328000, ringDefense: 4100, helmetDefense: 2050, legDefense: 2050, weaponAttack: 32800, necklaceLife: 82000, shoesAttack: 4100 },
    { level: 50, armorDefense: 17600, wristLife: 352000, ringDefense: 4400, helmetDefense: 2200, legDefense: 2200, weaponAttack: 35200, necklaceLife: 88000, shoesAttack: 4400 },
] as const;
export const ROLE_ADVANCE_EXP_ORBS = [
    { id: 'exp1', itemId: 'material_081', icon: `${UI_ROLE_ADVANCE_EXP_ORB_ROOT}_1`, frame: `${UI_ROLE_ADVANCE_EXP_ORB_FRAME_ROOT}1`, count: 300, exp: 5 },
    { id: 'exp2', itemId: 'material_082', icon: `${UI_ROLE_ADVANCE_EXP_ORB_ROOT}_2`, frame: `${UI_ROLE_ADVANCE_EXP_ORB_FRAME_ROOT}2`, count: 160, exp: 50 },
    { id: 'exp3', itemId: 'material_169', icon: `${UI_ROLE_ADVANCE_EXP_ORB_ROOT}_3`, frame: `${UI_ROLE_ADVANCE_EXP_ORB_FRAME_ROOT}3`, count: 80, exp: 200 },
    { id: 'exp4', itemId: 'material_170', icon: `${UI_ROLE_ADVANCE_EXP_ORB_ROOT}_4`, frame: `${UI_ROLE_ADVANCE_EXP_ORB_FRAME_ROOT}4`, count: 30, exp: 1000 },
    { id: 'exp5', itemId: 'material_171', icon: `${UI_ROLE_ADVANCE_EXP_ORB_ROOT}_5`, frame: `${UI_ROLE_ADVANCE_EXP_ORB_FRAME_ROOT}5`, count: 8, exp: 8000 },
] as const;
export const ROLE_BREAKTHROUGH_MATERIALS = [
    { id: 'white', itemId: 'material_086', name: '\u4e00\u7ea7\u7a81\u7834\u73e0', count: 50000 },
    { id: 'green', itemId: 'material_083', name: '\u4e8c\u7ea7\u7a81\u7834\u73e0', count: 20000 },
    { id: 'blue', itemId: 'material_084', name: '\u4e09\u7ea7\u7a81\u7834\u73e0', count: 12000 },
    { id: 'purple', itemId: 'material_085', name: '\u56db\u7ea7\u7a81\u7834\u73e0', count: 10000 },
] as const;
export const ROLE_STRENGTHEN_MATERIALS = [
    { type: 'attack', itemId: 'material_098', icon: `${UI_ROLE_STRENGTHEN_MATERIAL_ROOT}/strengthen_material_attack`, name: '\u91d1\u83b2\u73e0', count: 360 },
    { type: 'life', itemId: 'material_099', icon: `${UI_ROLE_STRENGTHEN_MATERIAL_ROOT}/strengthen_material_life`, name: '\u6e05\u98ce\u73e0', count: 360 },
    { type: 'defense', itemId: 'material_100', icon: `${UI_ROLE_STRENGTHEN_MATERIAL_ROOT}/strengthen_material_defense`, name: '\u4e39\u51e4\u73e0', count: 360 },
] as const;
export const ROLE_INITIAL_BAG_MATERIALS = [
    ...ROLE_ADVANCE_EXP_ORBS.map((item) => ({ itemId: item.itemId, count: item.count })),
    ...ROLE_BREAKTHROUGH_MATERIALS.map((item) => ({ itemId: item.itemId, count: item.count })),
    ...ROLE_STRENGTHEN_MATERIALS.map((item) => ({ itemId: item.itemId, count: item.count })),
];
export const ROLE_INITIAL_BAG_EQUIPMENTS = BAG_ILLUSTRATION_CATALOG
    .filter((item) => item.category === 'equipment')
    .map((item) => ({ itemId: item.id, count: 3 }));
export const ROLE_INITIAL_BAG_GEMS = BAG_ILLUSTRATION_CATALOG
    .filter((item) => item.category === 'gem')
    .map((item) => ({ itemId: item.id, count: 12 }));
export const ROLE_INITIAL_BAG_ITEMS = [
    ...ROLE_INITIAL_BAG_MATERIALS,
    ...ROLE_INITIAL_BAG_EQUIPMENTS,
    ...ROLE_INITIAL_BAG_GEMS,
];
export const BAG_CATEGORY_TABS: Array<{ category: BagIllustrationCategory; title: string }> = [
    { category: 'equipment', title: '\u88c5\u5907' },
    { category: 'item', title: '\u9053\u5177' },
    { category: 'material', title: '\u6750\u6599' },
    { category: 'gem', title: '\u5b9d\u77f3' },
];

export const SHOP_ITEMS: ShopItemData[] = [
    { id: 'challenge_card', name: '挑战卡', desc: '征战挑战所需道具。', amount: 1, price: 80, iconPath: UI_SHOP_CHALLENGE_CARD },
    { id: 'magic_ticket', name: '魔界门票', desc: '进入魔界玩法所需门票。', amount: 1, price: 100, iconPath: UI_SHOP_MAGIC_TICKET },
    { id: 'rename_card', name: '改名卡', desc: '用于修改角色名称。', amount: 1, price: 300, iconPath: UI_SHOP_RENAME_CARD },
    { id: 'protect_card', name: '保护卡', desc: '用于关键玩法保护消耗。', amount: 1, price: 80, iconPath: UI_SHOP_PROTECT_CARD },
    { id: 'treasure_ticket', name: '挖宝券', desc: '用于参与挖宝玩法的消耗券。', amount: 1, price: 100, iconPath: UI_SHOP_TREASURE_TICKET },
    { id: 'power_card', name: '战力卡', desc: '用于提升战力相关玩法的消耗道具。', amount: 1, price: 80, iconPath: UI_SHOP_POWER_CARD },
];

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

export const ROLE_ASSETS: Record<RoleGender, RoleAssetConfig> = {
    male: {
        gender: 'male',
        displayName: '\u7537\u89d2\u8272',
        skelPath: 'Spine/Role/\u7537\u89d2\u8272/H30066',
        skelUuid: '',
        mapScale: 0.5,
        mapOffsetX: 0,
        mapOffsetY: -8,
        previewScale: 0.72,
        previewOffsetX: 0,
        previewOffsetY: -20,
        pageScale: 0.7,
        pageOffsetX: 0,
        pageOffsetY: 0,
    },
    female: {
        gender: 'female',
        displayName: '\u5973\u89d2\u8272',
        skelPath: 'Spine/Role/\u5973\u89d2\u8272/H30027',
        skelUuid: '',
        mapScale: 0.5,
        mapOffsetX: 0,
        mapOffsetY: -8,
        previewScale: 0.72,
        previewOffsetX: 0,
        previewOffsetY: -20,
        pageScale: 0.7,
        pageOffsetX: 0,
        pageOffsetY: 0,
    },
};
