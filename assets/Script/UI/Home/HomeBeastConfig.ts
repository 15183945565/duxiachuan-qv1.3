import { BEAST_UI_ROOT, COMMERCE_UI_ROOT, VIEW_HEIGHT, VIEW_WIDTH } from './HomeBaseConfig';

export const UI_BEAST_BOTTOM_FRAME = `${BEAST_UI_ROOT}/beast_page_bottom_frame`;
export const UI_BEAST_SWITCH_LEFT = `${BEAST_UI_ROOT}/beast_switch_left`;
export const UI_BEAST_SWITCH_RIGHT = `${BEAST_UI_ROOT}/beast_switch_right`;
export const UI_BEAST_YUANBAO_LARGE = `${BEAST_UI_ROOT}/beast_yuanbao_large`;
export const UI_BEAST_YUANBAO_FRAME = `${BEAST_UI_ROOT}/beast_yuanbao_frame`;
export const UI_BEAST_RECORD_ICON = `${BEAST_UI_ROOT}/beast_record_icon`;
export const UI_BEAST_STRENGTHEN_ICON = `${BEAST_UI_ROOT}/beast_strengthen_icon`;
export const UI_BEAST_STRENGTHEN_BG = `${BEAST_UI_ROOT}/beast_strengthen_bg`;
export const UI_BEAST_CARD_ACTIVATE_BUTTON_BG = `${BEAST_UI_ROOT}/beast_card_activate_button_bg`;
export const UI_BEAST_CARD_ACTIVE_STATUS_BG = `${BEAST_UI_ROOT}/beast_card_active_status_bg`;
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
export const UI_BEAST_STRENGTHEN_SELECTED_FRAME = `${BEAST_STRENGTHEN_UI_ROOT}/beast_strengthen_selected_frame`;
export const UI_BEAST_STRENGTHEN_GEM_SELECT_BG = `${BEAST_STRENGTHEN_UI_ROOT}/beast_strengthen_gem_select_bg`;
export const UI_BEAST_STRENGTHEN_POPUP_BG = `${BEAST_STRENGTHEN_UI_ROOT}/beast_strengthen_popup_bg`;
export const UI_BEAST_STRENGTHEN_YUANBAO_RATE_FRAME = `${BEAST_STRENGTHEN_UI_ROOT}/beast_strengthen_yuanbao_rate_frame`;
export const BEAST_RECORD_UI_ROOT = `${BEAST_UI_ROOT}/Record`;
export const UI_BEAST_RECORD_POPUP_BG = `${BEAST_RECORD_UI_ROOT}/beast_record_popup_bg`;
export const UI_BEAST_RECORD_TITLE_FRAME = `${BEAST_RECORD_UI_ROOT}/beast_record_title_frame`;
export const UI_BEAST_RECORD_DIVIDER = `${COMMERCE_UI_ROOT}/beast_record_divider`;

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
    '\u767d\u9e7f\u517d\u5361',
    '\u9752\u72ee\u517d\u5361',
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
export const BEAST_CARD_ACTIVATE_BUTTON_WIDTH = 162;
export const BEAST_CARD_ACTIVATE_BUTTON_HEIGHT = 62;
export const BEAST_CARD_ACTIVATE_BUTTON_Y = -92;
export const BEAST_CARD_ACTIVE_STATUS_WIDTH = 260;
export const BEAST_CARD_ACTIVE_STATUS_HEIGHT = 59;
export const BEAST_CARD_ACTIVE_STATUS_Y = -248;
export const BEAST_CARD_ACTIVE_STATUS_TITLE_Y = 11;
export const BEAST_CARD_ACTIVE_STATUS_TIME_Y = -13;
export const BEAST_CARD_ACTIVATION_STORAGE_KEY = 'duxiachuan_beast_card_activation_v1';
export const BEAST_CARD_ACTIVATION_DURATION_SECONDS = 15 * 24 * 60 * 60;
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
export const BEAST_STRENGTHEN_EQUIP_SELECTED_FRAME_SIZE = 112;
export const BEAST_STRENGTHEN_EQUIP_ICON_SIZE = 68;
export const BEAST_STRENGTHEN_EQUIP_ICON_SOURCE_WIDTH = 78;
export const BEAST_STRENGTHEN_EQUIP_ICON_SOURCE_HEIGHT = 75;
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
export const BEAST_CARD_ACTIVATION_CONFIGS = [
    { key: 'bailu', beastName: '\u767d\u9e7f', cardLabel: '\u767d\u9e7f\u5361', beastCardLabel: '\u767d\u9e7f\u517d\u5361', itemId: 'item_103' },
    { key: 'qingshi', beastName: '\u9752\u72ee', cardLabel: '\u9752\u72ee\u5361', beastCardLabel: '\u9752\u72ee\u517d\u5361', itemId: 'item_107' },
    { key: 'jinhe', beastName: '\u91d1\u9e64', cardLabel: '\u91d1\u9e64\u5361', beastCardLabel: '\u91d1\u9e64\u517d\u5361', itemId: 'item_101' },
    { key: 'chihu', beastName: '\u8d64\u72d0', cardLabel: '\u8d64\u72d0\u5361', beastCardLabel: '\u8d64\u72d0\u517d\u5361', itemId: 'item_105' },
] as const;
export const BEAST_STRENGTHEN_EQUIP_ICON_SOURCE_OFFSETS: Record<string, { x: number; y: number }> = {
    equipment_153: { x: 0.5, y: -1 },
    equipment_154: { x: 0.5, y: -0.5 },
    equipment_155: { x: 1, y: -0.5 },
    equipment_156: { x: 10, y: 0 },
    equipment_157: { x: 1.5, y: -1 },
    equipment_158: { x: 0.5, y: -1 },
    equipment_159: { x: 1.5, y: -1 },
    equipment_160: { x: -9.5, y: -1 },
    equipment_161: { x: 7.5, y: -0.5 },
    equipment_162: { x: 1, y: -0.5 },
    equipment_163: { x: 0.5, y: -0.5 },
    equipment_164: { x: -8.5, y: -0.5 },
    equipment_165: { x: 5, y: -0.5 },
    equipment_166: { x: 0.5, y: -0.5 },
    equipment_167: { x: 0.5, y: -0.5 },
    equipment_168: { x: 6, y: -0.5 },
};
export const BEAST_RECORD_POPUP_WIDTH = VIEW_WIDTH;
export const BEAST_RECORD_POPUP_HEIGHT = VIEW_HEIGHT;
export const BEAST_RECORD_POPUP_Y = 20;
export const BEAST_RECORD_TITLE_Y = 680;
export const BEAST_RECORD_TITLE_WIDTH = 320;
export const BEAST_RECORD_TITLE_HEIGHT = 70;
export const BEAST_RECORD_TITLE_FRAME_WIDTH = 486;
export const BEAST_RECORD_TITLE_FRAME_HEIGHT = 84;
export const BEAST_RECORD_VIEWPORT_WIDTH = 690;
export const BEAST_RECORD_VIEWPORT_HEIGHT = 1246.021;
export const BEAST_RECORD_VIEWPORT_Y = -27.4195;
export const BEAST_RECORD_ROW_WIDTH = 660;
export const BEAST_RECORD_ROW_HEIGHT = 88;
export const BEAST_RECORD_ROW_GAP = 14;
export const BEAST_RECORD_ROW_TOP_PADDING = 32.5495;
export const BEAST_RECORD_RICH_TEXT_WIDTH = 640;
export const BEAST_RECORD_RICH_TEXT_HEIGHT = 48;
export const BEAST_RECORD_RICH_TEXT_X = 0;
export const BEAST_RECORD_RICH_TEXT_Y = 10;
export const BEAST_RECORD_ROW_COUNT = 8;
export const BEAST_CARD_ANIMATIONS = ['animation', 'idle'];
export const BEAST_CARDS = [
    {
        name: '\u5e7b\u96ea\u9e3e\u821e',
        description: '\u5e7b\u96ea\u6d41\u5149\u00b7\u7075\u52a8\u8fc5\u6377',
        skelPath: 'Spine/Beast/Card2/pet5',
        x: 0,
        y: BEAST_CARD_SPINE_Y,
        scale: 0.68,
    },
    {
        name: '\u51b0\u7130\u50b2\u72ee',
        description: '\u51b0\u7130\u62a4\u4f53\u00b7\u653b\u5b88\u517c\u5907',
        skelPath: 'Spine/Beast/Card1/pet03',
        x: 0,
        y: BEAST_CARD_SPINE_Y,
        scale: 0.85,
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
