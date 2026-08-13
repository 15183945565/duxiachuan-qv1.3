import { Vec3 } from 'cc';
import { BOTTOM_FEATURE_UI_ROOT, MAGIC_UI_ROOT, VIEW_HEIGHT, VIEW_WIDTH } from './HomeBaseConfig';
import {
    SHARED_CONFIRM_ACCEPT_BUTTON_X,
    SHARED_CONFIRM_BOARD_HEIGHT,
    SHARED_CONFIRM_BOARD_WIDTH,
    SHARED_CONFIRM_BUTTON_HEIGHT,
    SHARED_CONFIRM_BUTTON_WIDTH,
    SHARED_CONFIRM_BUTTON_Y,
    SHARED_CONFIRM_CANCEL_BUTTON_X,
    SHARED_CONFIRM_TITLE_HEIGHT,
    SHARED_CONFIRM_TITLE_WIDTH,
    SHARED_CONFIRM_TITLE_Y,
} from './HomeCommonUiConfig';
import type { RoleGender } from './HomeTypes';

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
export const UI_MAGIC_DAMAGE_INFO_BG = `${MAGIC_UI_ROOT}/magic_damage_info_bg`;
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
export const MAGIC_SCENE_BACKGROUND_X = 385.702;
export const MAGIC_SCENE_BACKGROUND_Y = 240.30600000000004;
export const MAGIC_SCENE_BACKGROUND_SCALE = 1.3;
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
export const MAGIC_CHALLENGE_COUNT_ROOT_WIDTH = 428;
export const MAGIC_CHALLENGE_COUNT_ROOT_HEIGHT = 38;
export const MAGIC_CHALLENGE_COUNT_ROOT_X = 145;
export const MAGIC_CHALLENGE_COUNT_ROOT_Y = 664;
export const MAGIC_CHALLENGE_COUNT_PREFIX_TEXT = '\u5269\u4f59\u6b21\u6570:';
export const MAGIC_CHALLENGE_COUNT_VALUE_TEXT = '10/10';
export const MAGIC_CHALLENGE_COUNT_RESET_TEXT = '\uff08\u6bcf\u65e50\u70b9\u91cd\u7f6e\u6b21\u6570\uff09';
export const MAGIC_CHALLENGE_COUNT_FONT_SIZE = 22;
export const MAGIC_CHALLENGE_COUNT_LINE_HEIGHT = 30;
export const MAGIC_CHALLENGE_COUNT_TEXT_HEIGHT = 32;
export const MAGIC_CHALLENGE_COUNT_PREFIX_WIDTH = 112;
export const MAGIC_CHALLENGE_COUNT_VALUE_WIDTH = 72;
export const MAGIC_CHALLENGE_COUNT_RESET_WIDTH = 244;
export const MAGIC_CHALLENGE_COUNT_PREFIX_X = -158;
export const MAGIC_CHALLENGE_COUNT_VALUE_X = -66;
export const MAGIC_CHALLENGE_COUNT_RESET_X = 92;
export const MAGIC_FLOOR_TICKET_SHOP_ITEM_ID = 'magic_ticket';
export const MAGIC_FLOOR_TICKET_BAG_ITEM_ID = 'item_111';
export const MAGIC_FLOOR_TICKET_COST = 2;
export const MAGIC_FLOOR_INITIAL_TICKET_COUNT = 1000;
export const MAGIC_FLOOR_TICKET_GRANT_STORAGE_KEY = 'duxiachuan_magic_ticket_grant_v4';
export const MAGIC_BATTLE_ASSIST_PROTECT_SHOP_ITEM_ID = 'protect_card';
export const MAGIC_BATTLE_ASSIST_POWER_SHOP_ITEM_ID = 'power_card';
export const MAGIC_BATTLE_ASSIST_PROTECT_BAG_ITEM_ID = 'item_172';
export const MAGIC_BATTLE_ASSIST_POWER_BAG_ITEM_ID = 'item_174';
export const MAGIC_BATTLE_ASSIST_INITIAL_CARD_COUNT = 1000;
export const MAGIC_BATTLE_ASSIST_CARD_GRANT_STORAGE_KEY = 'duxiachuan_magic_assist_card_grant_v1';
export const MAGIC_FLOOR_CONFIRM_MESSAGE_Y = 54;
export const MAGIC_FLOOR_CONFIRM_MESSAGE_WIDTH = 560;
export const MAGIC_FLOOR_CONFIRM_MESSAGE_HEIGHT = 64;
export const MAGIC_FLOOR_CONFIRM_TICKET_ROOT_Y = -20;
export const MAGIC_FLOOR_CONFIRM_TICKET_ROOT_WIDTH = 360;
export const MAGIC_FLOOR_CONFIRM_TICKET_ROOT_HEIGHT = 48;
export const MAGIC_FLOOR_CONFIRM_TICKET_CAPTION_X = -72;
export const MAGIC_FLOOR_CONFIRM_TICKET_CAPTION_WIDTH = 140;
export const MAGIC_FLOOR_CONFIRM_TICKET_ICON_X = 14;
export const MAGIC_FLOOR_CONFIRM_TICKET_ICON_SIZE = 38;
export const MAGIC_FLOOR_CONFIRM_TICKET_COUNT_X = 96;
export const MAGIC_FLOOR_CONFIRM_TICKET_COUNT_WIDTH = 128;
export const MAGIC_FLOOR_CONFIRM_TICKET_FONT_SIZE = 26;
export const MAGIC_FLOOR_CONFIRM_DAILY_ROOT_Y = -78;
export const MAGIC_FLOOR_CONFIRM_DAILY_ROOT_WIDTH = 340;
export const MAGIC_FLOOR_CONFIRM_DAILY_ROOT_HEIGHT = 36;
export const MAGIC_FLOOR_CONFIRM_DAILY_PREFIX_X = -44;
export const MAGIC_FLOOR_CONFIRM_DAILY_PREFIX_WIDTH = 178;
export const MAGIC_FLOOR_CONFIRM_DAILY_VALUE_X = 96;
export const MAGIC_FLOOR_CONFIRM_DAILY_VALUE_WIDTH = 90;
export const MAGIC_FLOOR_CONFIRM_DAILY_FONT_SIZE = 24;
export const MAGIC_FLOOR_BOARD_WIDTH = 600;
export const MAGIC_FLOOR_BOARD_HEIGHT = 1040;
export const MAGIC_FLOOR_BOARD_SCALE = 1.08;
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
export const MAGIC_FLOOR_DETAIL_X = -41;
export const MAGIC_FLOOR_DETAIL_WIDTH = 262;
export const MAGIC_FLOOR_STATUS_TEXT = '\u9650\u5236\u4eba\u6570(0/50)';
export const MAGIC_FLOOR_STATUS_X = 156;
export const MAGIC_FLOOR_STATUS_Y = 34;
export const MAGIC_FLOOR_STATUS_WIDTH = 172;
export const MAGIC_FLOOR_STATUS_HEIGHT = 32;
export const MAGIC_FLOOR_STATUS_FONT_SIZE = 18;
export const MAGIC_FLOOR_NAMES = ['\u4e00\u5c42', '\u4e8c\u5c42', '\u4e09\u5c42', '\u56db\u5c42'] as const;
export const MAGIC_FLOOR_DETAIL_TEXT_COLOR = '#5a3e28';
export const MAGIC_FLOOR_DETAIL_NUMBER_COLOR = '#d62920';
export const MAGIC_FLOOR_MONSTER_REMAIN_TEXT = '11/11';
export const MAGIC_FLOOR_ATTACK_LIMITS = [
    '2700-5000',
    '1.6\u4e07-2.0\u4e07',
    '4.4\u4e07-5.2\u4e07',
    '10\u4e07-12\u4e07',
    '23\u4e07-27\u4e07',
    '50\u4e07-57\u4e07',
    '105\u4e07-120\u4e07',
    '230\u4e07-262\u4e07',
    '500\u4e07-568\u4e07',
] as const;
export const MAGIC_SCENE_ANIMATIONS = ['Down_Idle', 'idle', 'animation'];
export const MAGIC_MAP_SMALL_MONSTER_SKEL_PATH = 'Spine/Magic/Monsters/Small/H30074';
export const MAGIC_MAP_BOSS_MONSTER_SKEL_PATH = 'Spine/Magic/Monsters/Boss/H30009';
export const MAGIC_MAP_REALM_MONSTER_SKEL_PATHS: Record<number, { small: string; boss: string }> = {
    1: {
        small: 'Spine/Magic/Monsters/Level2/Small/C516_S01B',
        boss: 'Spine/Magic/Monsters/Level2/Boss/C518_S01B',
    },
    2: {
        small: 'Spine/Magic/Monsters/Level3/Small/C059_S01D',
        boss: 'Spine/Magic/Monsters/Level3/Boss/C061_S01B',
    },
    3: {
        small: 'Spine/Magic/Monsters/Level4/Small/C524_S01R',
        boss: 'Spine/Magic/Monsters/Level4/Boss/C512_S01R',
    },
    4: {
        small: 'Spine/Magic/Monsters/Level5/Small/C056_S01B',
        boss: 'Spine/Magic/Monsters/Level5/Boss/C049_S01B',
    },
    5: {
        small: 'Spine/Magic/Monsters/Level6/Small/C558_S01G',
        boss: 'Spine/Magic/Monsters/Level6/Boss/C557_S01G',
    },
    6: {
        small: 'Spine/Magic/Monsters/Level7/Small/C544_S01B',
        boss: 'Spine/Magic/Monsters/Level7/Boss/C543_S01B',
    },
    7: {
        small: 'Spine/Magic/Monsters/Level8/Small/C030_S01B',
        boss: 'Spine/Magic/Monsters/Level8/Boss/C022_S01B',
    },
    8: {
        small: 'Spine/Magic/Monsters/Level9/Small/C520_S01L',
        boss: 'Spine/Magic/Monsters/Level9/Boss/C522_S01L',
    },
};
export function getMagicMapMonsterSkelPath(realmIndex: number, boss: boolean): string {
    const realmPaths = MAGIC_MAP_REALM_MONSTER_SKEL_PATHS[realmIndex];
    if (realmPaths) return boss ? realmPaths.boss : realmPaths.small;
    return boss ? MAGIC_MAP_BOSS_MONSTER_SKEL_PATH : MAGIC_MAP_SMALL_MONSTER_SKEL_PATH;
}
export const MAGIC_MAP_IDLE_ANIMATIONS = ['Idle_Battle_00', 'Idle_Battle_0', 'Idle_Normal_00', 'stand2', 'stand', 'idle'];
export const MAGIC_MAP_WALK_ANIMATIONS = ['Run_Battle_00', 'run', 'walk', 'move'];
export const MAGIC_MAP_HURT_ANIMATIONS = ['Hit_00', 'hurt', 'hit', 'damage'];
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
export const MAGIC_MAP_GROUND_OFFSET_Y = -160;
export const MAGIC_MAP_SMALL_MONSTER_SCALE = 0.56;
export const MAGIC_MAP_BOSS_MONSTER_SCALE = 0.48;
export const MAGIC_MAP_REALM_MONSTER_SCALES: Record<number, { small: number; boss: number; battleSmall: number; battleBoss: number }> = {
    1: {
        small: 0.34,
        boss: 0.32,
        battleSmall: 0.48,
        battleBoss: 0.48,
    },
    2: {
        small: 0.22,
        boss: 0.24,
        battleSmall: 0.33,
        battleBoss: 0.38,
    },
    3: {
        small: 0.18,
        boss: 0.36,
        battleSmall: 0.28,
        battleBoss: 0.54,
    },
    4: {
        small: 0.18,
        boss: 0.34,
        battleSmall: 0.28,
        battleBoss: 0.52,
    },
    5: {
        small: 0.18,
        boss: 0.3,
        battleSmall: 0.28,
        battleBoss: 0.46,
    },
    6: {
        small: 0.39,
        boss: 0.5,
        battleSmall: 0.62,
        battleBoss: 0.68,
    },
    7: {
        small: 0.2,
        boss: 0.27,
        battleSmall: 0.31,
        battleBoss: 0.43,
    },
    8: {
        small: 0.34,
        boss: 0.32,
        battleSmall: 0.48,
        battleBoss: 0.48,
    },
};
export function getMagicMapMonsterScale(realmIndex: number, boss: boolean, battle = false): number {
    const realmScales = MAGIC_MAP_REALM_MONSTER_SCALES[realmIndex];
    if (realmScales) {
        if (battle) return boss ? realmScales.battleBoss : realmScales.battleSmall;
        return boss ? realmScales.boss : realmScales.small;
    }
    if (battle) return boss ? MAGIC_BATTLE_BOSS_MONSTER_SCALE : MAGIC_BATTLE_SMALL_MONSTER_SCALE;
    return boss ? MAGIC_MAP_BOSS_MONSTER_SCALE : MAGIC_MAP_SMALL_MONSTER_SCALE;
}
export const MAGIC_MAP_PLAYER_SCALE = 4.5;
export const MAGIC_MAP_SMALL_MONSTER_HIT_WIDTH = 170;
export const MAGIC_MAP_SMALL_MONSTER_HIT_HEIGHT = 170;
export const MAGIC_MAP_BOSS_MONSTER_HIT_WIDTH = 260;
export const MAGIC_MAP_BOSS_MONSTER_HIT_HEIGHT = 260;
export const MAGIC_MAP_PLAYER_MOVE_SPEED = 360;
export const MAGIC_MAP_SMALL_MONSTER_MOVE_SPEED = 110;
export const MAGIC_MAP_BOSS_MONSTER_MOVE_SPEED = 85;
export const MAGIC_MAP_SMALL_MONSTER_SPAWN_RANDOM_X = 110;
export const MAGIC_MAP_SMALL_MONSTER_SPAWN_RANDOM_Y = 80;
export const MAGIC_MAP_SMALL_MONSTER_WANDER_RADIUS = 280;
export const MAGIC_MAP_BOSS_MONSTER_WANDER_RADIUS = 150;
export const MAGIC_MAP_SMALL_MONSTER_SPAWN_POINTS = [
    { x: -1040, y: -320 },
    { x: -920, y: -860 },
    { x: -650, y: -90 },
    { x: -420, y: -610 },
    { x: -110, y: -1010 },
    { x: 560, y: -900 },
    { x: 720, y: -150 },
    { x: 910, y: -560 },
    { x: 1060, y: -340 },
    { x: -760, y: -1120 },
] as const;
export const MAGIC_MAP_BOSS_SPAWN_POINT = { x: 220, y: -360 } as const;
export const MAGIC_MAP_PLAYER_MAX_HP = 40070;
export const MAGIC_MAP_SMALL_MONSTER_MAX_HP = 40070;
export const MAGIC_MAP_BOSS_MONSTER_MAX_HP = 120210;
export const MAGIC_MAP_PLAYER_HEALTH_INFO_Y = 250;
export const MAGIC_MAP_SMALL_MONSTER_HEALTH_INFO_Y = 175;
export const MAGIC_MAP_BOSS_HEALTH_INFO_Y = 235;
export const MAGIC_MAP_HEALTH_NAME_WIDTH = 310;
export const MAGIC_MAP_HEALTH_VALUE_WIDTH = 220;
export const MAGIC_MAP_PLAYER_HEALTH_BAR_WIDTH = 165;
export const MAGIC_MAP_MONSTER_HEALTH_BAR_WIDTH = 145;
export const MAGIC_MAP_BOSS_HEALTH_BAR_WIDTH = 178;
export const MAGIC_MAP_HEALTH_BAR_HEIGHT = 14;
export const MAGIC_MAP_DURATION_SECONDS = 10 * 60;
export const MAGIC_MAP_TIMER_X = 0;
export const MAGIC_MAP_DRAG_THRESHOLD = 12;
export const MAGIC_MONSTER_BATTLE_RESULT_DELAY = 8;
export const MAGIC_MONSTER_BATTLE_ATTACK_GAP = 0.06;
export const MAGIC_BATTLE_SMALL_MONSTER_SCALE = 0.78;
export const MAGIC_BATTLE_BOSS_MONSTER_SCALE = 0.86;
export const MAGIC_BATTLE_PLAYER_SLOT_COUNT = 50;
export const MAGIC_BATTLE_LOCAL_PLAYER_SLOT_INDEX = 0;
export const MAGIC_BATTLE_ROOM_PREVIEW_ENABLED = true;
export const MAGIC_BATTLE_ROOM_PREVIEW_REALM_INDEX = 0;
export const MAGIC_BATTLE_ROOM_PREVIEW_OTHER_PLAYER_COUNT = 10;
export const MAGIC_BATTLE_ROOM_PREVIEW_ROLE_SCALE_MULTIPLIER = 1;
export const MAGIC_BATTLE_ROOM_PREVIEW_AREA_MIN_X = -330;
export const MAGIC_BATTLE_ROOM_PREVIEW_AREA_MAX_X = -90;
export const MAGIC_BATTLE_ROOM_PREVIEW_AREA_TOP_Y = 170;
export const MAGIC_BATTLE_ROOM_PREVIEW_AREA_BOTTOM_Y = -330;
export const MAGIC_BATTLE_ROOM_PREVIEW_POSITION_JITTER_X = 16;
export const MAGIC_BATTLE_ROOM_PREVIEW_POSITION_JITTER_Y = 18;
export const MAGIC_BATTLE_ROOM_PREVIEW_MIN_LOCAL_DISTANCE = 52;
export const MAGIC_BATTLE_ROOM_PREVIEW_ATTACK_DELAY_MAX = 1.6;
export const MAGIC_BATTLE_ROOM_PREVIEW_ATTACK_PHASE_JITTER = 0.16;
export const MAGIC_BATTLE_ROOM_PREVIEW_ATTACK_RATE = 1;
export const MAGIC_BATTLE_ROOM_PREVIEW_SOUND_COOLDOWN = 0.35;
export const MAGIC_BATTLE_ROOM_PREVIEW_HURT_COOLDOWN = 0.45;
export const MAGIC_BATTLE_ROOM_PREVIEW_HIT_EFFECT_COOLDOWN = 0.22;
export const MAGIC_BATTLE_ROOM_PREVIEW_HIT_EFFECT_CHANCE = 0.7;
export const MAGIC_BATTLE_ROOM_PREVIEW_HP_MULTIPLIER = 80;
export const MAGIC_BATTLE_ROOM_PREVIEW_RESULT_DELAY = 90;
export const MAGIC_BATTLE_ROOM_PREVIEW_LOCAL_DAMAGE_MULTIPLIER = 0.08;
export const MAGIC_BATTLE_ROOM_PREVIEW_ACTOR_DAMAGE_RATIO = 0.00035;
export const MAGIC_BATTLE_PLAYER_SLOT_X = -170;
export const MAGIC_BATTLE_PLAYER_SLOT_TOP_Y = 220;
export const MAGIC_BATTLE_PLAYER_SLOT_BOTTOM_Y = -310;
export const MAGIC_BATTLE_PLAYER_SLOT_CENTER_Y = -45;
export const MAGIC_BATTLE_MONSTER_POSITION = new Vec3(170, -45, 0);
export const MAGIC_BATTLE_ROLE_ATTACK_POSITION = new Vec3(20, -45, 0);
export const MAGIC_BATTLE_ROLE_ATTACK_Y_OFFSET_RATIO = 0.3;
export const MAGIC_BATTLE_HIT_EFFECT_OFFSET = new Vec3(-45, 70, 0);
export const MAGIC_BATTLE_HIT_EFFECT_WIDTH = 640;
export const MAGIC_BATTLE_HIT_EFFECT_HEIGHT = 420;
export const MAGIC_BATTLE_HIT_EFFECT_SCALE = 0.68;
export const MAGIC_BATTLE_ATTACK_START_DELAY = 0.35;
export const MAGIC_BATTLE_ATTACK_TIMELINES: Record<RoleGender, {
    moveStartFrame: number;
    moveEndFrame: number;
    returnStartFrame: number;
    returnEndFrame: number;
    endFrame: number;
}> = {
    male: { moveStartFrame: 1, moveEndFrame: 1, returnStartFrame: 40, returnEndFrame: 45, endFrame: 45 },
    female: { moveStartFrame: 6, moveEndFrame: 7, returnStartFrame: 34, returnEndFrame: 42, endFrame: 42 },
};
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
export const MAGIC_BATTLE_ASSIST_CARD_ICON_SIZE = 82;
export const MAGIC_BATTLE_ASSIST_CARD_ICON_Y = 9;
export const MAGIC_BATTLE_ASSIST_CARD_USE_LABEL_Y = -49;
export const MAGIC_BATTLE_ASSIST_CARD_SLOT_GAP = 140;
export const MAGIC_BATTLE_ASSIST_CONFIRM_POPUP_WIDTH = SHARED_CONFIRM_BOARD_WIDTH;
export const MAGIC_BATTLE_ASSIST_CONFIRM_POPUP_HEIGHT = SHARED_CONFIRM_BOARD_HEIGHT;
export const MAGIC_BATTLE_ASSIST_CONFIRM_TITLE_WIDTH = SHARED_CONFIRM_TITLE_WIDTH;
export const MAGIC_BATTLE_ASSIST_CONFIRM_TITLE_HEIGHT = SHARED_CONFIRM_TITLE_HEIGHT;
export const MAGIC_BATTLE_ASSIST_CONFIRM_TITLE_Y = SHARED_CONFIRM_TITLE_Y;
export const MAGIC_BATTLE_ASSIST_CONFIRM_ICON_SIZE = 46;
export const MAGIC_BATTLE_ASSIST_CONFIRM_BUTTON_WIDTH = SHARED_CONFIRM_BUTTON_WIDTH;
export const MAGIC_BATTLE_ASSIST_CONFIRM_BUTTON_HEIGHT = SHARED_CONFIRM_BUTTON_HEIGHT;
export const MAGIC_BATTLE_ASSIST_CONFIRM_BUTTON_Y = SHARED_CONFIRM_BUTTON_Y;
export const MAGIC_BATTLE_ASSIST_CONFIRM_CANCEL_BUTTON_X = SHARED_CONFIRM_CANCEL_BUTTON_X;
export const MAGIC_BATTLE_ASSIST_CONFIRM_OK_BUTTON_X = SHARED_CONFIRM_ACCEPT_BUTTON_X;
export const MAGIC_BATTLE_ASSIST_CONFIRM_BUTTON_X = Math.abs(SHARED_CONFIRM_CANCEL_BUTTON_X);
export const MAGIC_BATTLE_DUEL_POPUP_WIDTH = 706;
export const MAGIC_BATTLE_DUEL_POPUP_HEIGHT = 480;
export const MAGIC_BATTLE_DUEL_CARD_WIDTH = 238;
export const MAGIC_BATTLE_DUEL_CARD_HEIGHT = 304;
export const MAGIC_BATTLE_DUEL_PLAYER_CARD_X = -176;
export const MAGIC_BATTLE_DUEL_TARGET_CARD_X = 176;
export const MAGIC_BATTLE_DUEL_CARD_Y = -28;
export const MAGIC_BATTLE_DUEL_VISUAL_Y = -92;
export const MAGIC_BATTLE_DUEL_PLAYER_SCALE = 4.5;
export const MAGIC_BATTLE_DUEL_NPC_SCALE = 0.36;
export const MAGIC_BATTLE_DUEL_HP_BAR_WIDTH = 166;
export const MAGIC_BATTLE_DUEL_HP_BAR_HEIGHT = 14;
export const MAGIC_BATTLE_DUEL_DURATION = 3;
export const MAGIC_BATTLE_DUEL_TURN_DELAY = 1.56;
export const MAGIC_BATTLE_DUEL_ATTACK_STOP_OFFSET_X = 120;
export const MAGIC_BATTLE_DUEL_ATTACK_OFFSET_Y = 0;
export const MAGIC_BATTLE_DUEL_HIT_EFFECT_OFFSET_X = 48;
export const MAGIC_BATTLE_DUEL_HIT_EFFECT_RIGHT_TO_LEFT_OFFSET_X = -48;
export const MAGIC_BATTLE_DUEL_HIT_EFFECT_OFFSET_Y = 92;
export const MAGIC_BATTLE_DUEL_HIT_EFFECT_WIDTH = 640;
export const MAGIC_BATTLE_DUEL_HIT_EFFECT_HEIGHT = 420;
export const MAGIC_BATTLE_DUEL_HIT_EFFECT_SCALE = 0.52;
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
