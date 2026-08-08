import { Vec3 } from 'cc';
import { BATTLE_UI_ROOT, COMMON_UI_ROOT } from './HomeBaseConfig';
import type { RoleGender } from './HomeTypes';

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
export const BATTLE_ROLE_NORMAL_ATTACK_ANIMATIONS: Record<RoleGender, readonly string[]> = {
    male: ['skill0'],
    female: ['skill2'],
};
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
export const MAIL_BUTTON_WIDTH = 162;
export const MAIL_BUTTON_HEIGHT = 62;
export const MAIL_ROW_WIDTH = 609;
export const MAIL_ROW_HEIGHT = 113;
export const MAIL_ROW_START_Y = 300;
export const MAIL_ROW_GAP = 150;
export const MAIL_ROW_CLAIM_BUTTON_WIDTH = MAIL_BUTTON_WIDTH;
export const MAIL_ROW_CLAIM_BUTTON_HEIGHT = MAIL_BUTTON_HEIGHT;
export const MAIL_ROW_CLAIM_BUTTON_X = 214;
export const MAIL_ROW_UNREAD_DOT_X = 252;
export const MAIL_ROW_UNREAD_DOT_Y = 46;
export const BATTLE_ROLE_SCALE = 4.5;
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
