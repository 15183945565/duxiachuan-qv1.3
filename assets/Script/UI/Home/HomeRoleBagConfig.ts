import { BAG_ILLUSTRATION_CATALOG, type BagIllustrationCategory } from './BagIllustrationCatalog.generated';
import { BAG_UI_ROOT, CHARACTER_SELECT_UI_ROOT, COMMON_UI_ROOT, ROLE_UI_ROOT } from './HomeBaseConfig';
import type { RoleAssetConfig, RoleGender } from './HomeTypes';

export const UI_ROLE_PAGE_BG = `${ROLE_UI_ROOT}/role_page_bg`;
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
export const UI_ROLE_EQUIPPED_BADGE = `${ROLE_UI_ROOT}/role_equipped_badge`;
export const UI_ROLE_ADVANCE_DETAIL_BG = `${ROLE_UI_ROOT}/role_advance_detail_bg`;
export const UI_ROLE_ADVANCE_CURRENT_ATTR_BG = `${ROLE_UI_ROOT}/role_advance_current_attr_bg`;
export const UI_ROLE_ADVANCE_NEXT_ATTR_BG = `${ROLE_UI_ROOT}/role_advance_next_attr_bg`;
export const UI_ROLE_ADVANCE_EXP_BAR_BG = `${ROLE_UI_ROOT}/role_advance_exp_bar_bg`;
export const UI_ROLE_ADVANCE_EXP_BAR_FILL = `${ROLE_UI_ROOT}/role_advance_exp_bar_fill`;
export const UI_ROLE_ADVANCE_EXP_ORB_ROOT = `${ROLE_UI_ROOT}/AdvanceExpOrbs/advance_exp_orb`;
export const UI_ROLE_ADVANCE_EXP_ORB_FRAME_ROOT = `${BAG_UI_ROOT}/ItemFrames/item_frame_lv`;
export const UI_ROLE_STRENGTHEN_BUTTON = `${ROLE_UI_ROOT}/role_strengthen_button`;
export const UI_ROLE_EQUIP_DETAIL_BUTTON_BG = `${ROLE_UI_ROOT}/role_equip_detail_button_bg`;
export const UI_ROLE_STRENGTHEN_MATERIAL_BG = `${COMMON_UI_ROOT}/common_upgrade_material_bg`;
export const UI_ROLE_STRENGTHEN_MATERIAL_ROOT = `${ROLE_UI_ROOT}/StrengthenMaterials`;
export const UI_ROLE_SUCCESS_POPUP_BG = `${ROLE_UI_ROOT}/role_success_popup_bg`;
export const UI_ROLE_SUCCESS_ARROW = `${ROLE_UI_ROOT}/role_success_arrow`;
export const UI_ROLE_SUCCESS_POWER_PLUS = `${ROLE_UI_ROOT}/role_success_power_plus`;
export const UI_ROLE_EQUIP_REPLACE_BG = `${COMMON_UI_ROOT}/common_equip_replace_bg`;
export const UI_ROLE_EQUIP_REPLACE_DRAWER_BG = `${ROLE_UI_ROOT}/role_equip_replace_drawer_bg`;
export const UI_BAG_PAGE_BG = `${BAG_UI_ROOT}/bag_page_bg`;
export const UI_BAG_FRAME = `${BAG_UI_ROOT}/bag_frame`;
export const UI_BAG_CATEGORY_TAB_ACTIVE = `${BAG_UI_ROOT}/bag_category_tab_active`;
export const UI_BAG_CATEGORY_TAB_NORMAL = `${BAG_UI_ROOT}/bag_category_tab_normal`;
export const UI_BAG_ILLUSTRATION_BTN = `${BAG_UI_ROOT}/bag_illustration_btn`;
export const UI_BAG_ITEM_DETAIL_OBTAIN_BG = `${BAG_UI_ROOT}/bag_item_detail_obtain_bg`;
export const UI_BAG_ITEM_DETAIL_ATTR_BG = `${BAG_UI_ROOT}/bag_item_detail_attr_bg`;
export const UI_BAG_ITEM_DETAIL_TITLE_BG = `${BAG_UI_ROOT}/bag_item_detail_title_bg`;
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
export const UI_BAG_ACTION_BUTTON_BG = `${BAG_UI_ROOT}/bag_action_button_bg`;
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
export const BAG_ITEM_DETAIL_ATTR_FRAME_WIDTH = 725;
export const BAG_ITEM_DETAIL_ATTR_FRAME_HEIGHT = 505;
export const BAG_ITEM_DETAIL_TITLE_WIDTH = 486;
export const BAG_ITEM_DETAIL_TITLE_HEIGHT = 84;

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
export const UI_CHARACTER_SELECT_FEMALE_PORTRAIT = `${CHARACTER_SELECT_UI_ROOT}/character_select_female_portrait`;
export const UI_CHARACTER_SELECT_MALE_PORTRAIT = `${CHARACTER_SELECT_UI_ROOT}/character_select_male_portrait`;
export const UI_CHARACTER_SELECT_FRAME_HIGHLIGHT = `${CHARACTER_SELECT_UI_ROOT}/character_select_frame_highlight`;
export const UI_CHARACTER_SELECT_SPEECH_BUBBLE = `${CHARACTER_SELECT_UI_ROOT}/character_select_speech_bubble`;

export const BAG_ILLUSTRATION_BUTTON_WIDTH = 95;
export const BAG_ILLUSTRATION_BUTTON_HEIGHT = 95;
export const BAG_ILLUSTRATION_BUTTON_X = 300;
export const BAG_ILLUSTRATION_BUTTON_Y = 620;
export const ENABLE_ROLE_SKEL_ANIMATION = true;
export const IDLE_ANIMATIONS = ['ready', 'style', 'stand2', 'stand1', 'stand', 'idle', 'wait', 'daiji', 'animation'];
export const WALK_ANIMATIONS = ['run', 'run2', 'move', 'walk', 'zoulu'];
export const LOADING_ANIMATIONS = ['run', 'run2', 'ready', 'animation', 'idle'];
export const CHARACTER_SELECT_BG_SKEL_PATH = 'Spine/CharacterSelect/Background/skeleton';
export const CHARACTER_SELECT_BG_ANIMATIONS = ['animation', 'idle'];
export const CHARACTER_SELECT_BG_SCALE = 1.18;
export const CHARACTER_SELECT_BG_OFFSET_X = 0;
export const CHARACTER_SELECT_BG_OFFSET_Y = 0;
export const CHARACTER_SELECT_ROLE_Y = -150;
export const CHARACTER_SELECT_SWITCH_BUTTON_Y = -20;
export const CHARACTER_SELECT_SWIPE_Y = -5;
export const CHARACTER_SELECT_ROLE_SKEL_PATHS: Record<RoleGender, string> = {
    female: 'Spine/RoleWeapon/Level01_20/Female/skeleton',
    male: 'Spine/RoleWeapon/Level01_20/Male/skeleton',
};
export const CHARACTER_SELECT_ROLE_ANIMATIONS = ['ready', 'style', 'appear', 'click1', 'idle', 'animation'];
export const CHARACTER_SELECT_ROLE_SCALE: Record<RoleGender, number> = {
    female: 8.2,
    male: 8.2,
};
export const CHARACTER_SELECT_ROLE_PORTRAIT_PATHS: Record<RoleGender, string> = {
    female: UI_CHARACTER_SELECT_FEMALE_PORTRAIT,
    male: UI_CHARACTER_SELECT_MALE_PORTRAIT,
};
export const CHARACTER_SELECT_ROLE_PORTRAIT_SIZE: Record<RoleGender, { width: number; height: number }> = {
    female: { width: 760, height: 760 },
    male: { width: 1040, height: 1040 },
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
export const ROLE_ADVANCE_EXP_ORB_HOLD_DELAY = 0.35;
export const ROLE_ADVANCE_EXP_ORB_HOLD_INTERVAL = 0.12;
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
export const ROLE_STRENGTHEN_BUTTON_WIDTH = 162;
export const ROLE_STRENGTHEN_BUTTON_HEIGHT = 62;
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
export const ROLE_EQUIP_REPLACE_DRAWER_WIDTH = 768;
export const ROLE_EQUIP_REPLACE_DRAWER_HEIGHT = 530;
export const ROLE_EQUIP_REPLACE_DRAWER_Y = -547;
export const ROLE_EQUIP_REPLACE_DRAWER_HIDDEN_Y = -1090;
export const ROLE_EQUIP_REPLACE_DRAWER_TITLE_Y = 204;
export const ROLE_EQUIP_REPLACE_DRAWER_VIEWPORT_WIDTH = 710;
export const ROLE_EQUIP_REPLACE_DRAWER_VIEWPORT_HEIGHT = 400;
export const ROLE_EQUIP_REPLACE_DRAWER_VIEWPORT_Y = -40;
export const ROLE_EQUIP_REPLACE_DRAWER_GRID_COLS = 5;
export const ROLE_EQUIP_REPLACE_DRAWER_GRID_START_X = -280;
export const ROLE_EQUIP_REPLACE_DRAWER_GRID_GAP_X = 140;
export const ROLE_EQUIP_REPLACE_DRAWER_GRID_GAP_Y = 150;
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
export const BAG_SYNTH_ACTION_BUTTON_WIDTH = 162;
export const BAG_SYNTH_ACTION_BUTTON_HEIGHT = 62;
export const BAG_SYNTH_ACTION_BUTTON_Y = -118;
export const BAG_SYNTH_CARD_ITEM_ID = 'item_110';
export const BAG_SYNTH_FRAGMENT_COST = 100;
export const BAG_SYNTH_CARD_COST = 1;
export const BAG_SYNTH_DISABLED_CARD_OPACITY = 90;

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
    .filter((item) => item.category === 'equipment' && !/^equipment_[a-z]+_lv\d{3}$/.test(item.id))
    .map((item) => ({ itemId: item.id, count: /^equipment_(15[3-9]|16[0-8])$/.test(item.id) ? 1 : 3 }));
export const ROLE_INITIAL_BAG_GEMS = BAG_ILLUSTRATION_CATALOG
    .filter((item) => item.category === 'gem')
    .map((item) => ({ itemId: item.id, count: 12 }));
export const ROLE_INITIAL_BAG_SYNTH_ITEMS = [
    { itemId: 'item_102', count: 300 },
    { itemId: 'item_104', count: 300 },
    { itemId: 'item_106', count: 300 },
    { itemId: 'item_108', count: 300 },
    { itemId: 'item_110', count: 10 },
] as const;
export const ROLE_INITIAL_BAG_ITEMS = [
    ...ROLE_INITIAL_BAG_MATERIALS,
    ...ROLE_INITIAL_BAG_EQUIPMENTS,
    ...ROLE_INITIAL_BAG_GEMS,
    ...ROLE_INITIAL_BAG_SYNTH_ITEMS,
];
export const BAG_CATEGORY_TABS: Array<{ category: BagIllustrationCategory; title: string }> = [
    { category: 'equipment', title: '\u88c5\u5907' },
    { category: 'item', title: '\u9053\u5177' },
    { category: 'material', title: '\u6750\u6599' },
    { category: 'gem', title: '\u5b9d\u77f3' },
];

export const ROLE_ASSETS: Record<RoleGender, RoleAssetConfig> = {
    male: {
        gender: 'male',
        displayName: '\u7537\u89d2\u8272',
        skelPath: 'Spine/RoleWeapon/Level01_20/Male/skeleton',
        skelUuid: '',
        mapScale: 4.5,
        mapOffsetX: 0,
        mapOffsetY: -8,
        previewScale: 4.5,
        previewOffsetX: 0,
        previewOffsetY: -20,
        pageScale: 5.85,
        pageOffsetX: 0,
        pageOffsetY: 0,
    },
    female: {
        gender: 'female',
        displayName: '\u5973\u89d2\u8272',
        skelPath: 'Spine/RoleWeapon/Level01_20/Female/skeleton',
        skelUuid: '',
        mapScale: 4.2,
        mapOffsetX: 0,
        mapOffsetY: -8,
        previewScale: 4.2,
        previewOffsetX: 0,
        previewOffsetY: -20,
        pageScale: 5.85,
        pageOffsetX: 0,
        pageOffsetY: 0,
    },
};

export const ROLE_WEAPON_SPINE_ASSETS: Record<RoleGender, Array<RoleAssetConfig & { minWeaponLevel: number; maxWeaponLevel: number }>> = {
    male: [
        { ...ROLE_ASSETS.male, skelPath: 'Spine/RoleWeapon/Level01_20/Male/skeleton', minWeaponLevel: 1, maxWeaponLevel: 20 },
        { ...ROLE_ASSETS.male, skelPath: 'Spine/RoleWeapon/Level21_30/Male/skeleton', minWeaponLevel: 21, maxWeaponLevel: 30 },
        { ...ROLE_ASSETS.male, skelPath: 'Spine/RoleWeapon/Level31_40/Male/skeleton', minWeaponLevel: 31, maxWeaponLevel: 40 },
        { ...ROLE_ASSETS.male, skelPath: 'Spine/RoleWeapon/Level41_50/Male/skeleton', minWeaponLevel: 41, maxWeaponLevel: 50 },
    ],
    female: [
        { ...ROLE_ASSETS.female, skelPath: 'Spine/RoleWeapon/Level01_20/Female/skeleton', minWeaponLevel: 1, maxWeaponLevel: 20 },
        { ...ROLE_ASSETS.female, skelPath: 'Spine/RoleWeapon/Level21_30/Female/skeleton', minWeaponLevel: 21, maxWeaponLevel: 30 },
        { ...ROLE_ASSETS.female, skelPath: 'Spine/RoleWeapon/Level31_40/Female/skeleton', minWeaponLevel: 31, maxWeaponLevel: 40 },
        { ...ROLE_ASSETS.female, skelPath: 'Spine/RoleWeapon/Level41_50/Female/skeleton', minWeaponLevel: 41, maxWeaponLevel: 50 },
    ],
};

export function getRoleAssetForWeaponLevel(gender: RoleGender, weaponLevel: number): RoleAssetConfig {
    const level = Math.max(1, Math.min(50, Math.floor(weaponLevel || 1)));
    return ROLE_WEAPON_SPINE_ASSETS[gender].find((asset) => level >= asset.minWeaponLevel && level <= asset.maxWeaponLevel)
        || ROLE_ASSETS[gender];
}
