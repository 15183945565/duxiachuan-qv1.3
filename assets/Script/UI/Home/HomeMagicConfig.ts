import { BOTTOM_FEATURE_UI_ROOT, MAGIC_UI_ROOT, VIEW_HEIGHT, VIEW_WIDTH } from './HomeBaseConfig';

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
export const MAGIC_MAP_PLAYER_SCALE = 4.5;
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
export const MAGIC_BATTLE_DUEL_PLAYER_SCALE = 4.5;
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
