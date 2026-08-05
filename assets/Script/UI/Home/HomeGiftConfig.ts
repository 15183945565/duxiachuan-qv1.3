import { DEFAULT_UID, UI_HOME_AVATAR_MALE } from './HomeBaseConfig';

export interface GiftTargetPlayerConfig {
    uid: string;
    nickname: string;
    avatarPath: string;
}

export const GIFT_UI_ROOT = 'Texture/UI/Gift';
export const UI_GIFT_TRANSFER_PANEL_BG = `${GIFT_UI_ROOT}/gift_transfer_panel_bg`;
export const UI_GIFT_YUANBAO_SLOT_BG = `${GIFT_UI_ROOT}/gift_yuanbao_slot_bg`;
export const UI_GIFT_TRANSLUCENT_BAR = `${GIFT_UI_ROOT}/gift_translucent_bar`;
export const UI_GIFT_PLUS_BUTTON = `${GIFT_UI_ROOT}/gift_plus_btn`;
export const UI_GIFT_MINUS_BUTTON = `${GIFT_UI_ROOT}/gift_minus_btn`;

export const GIFT_DEFAULT_AMOUNT = 1;
export const GIFT_MIN_AMOUNT = 20;
export const GIFT_FEE_RATE = 0.1;

export const GIFT_PREVIEW_PLAYERS: readonly GiftTargetPlayerConfig[] = [
    {
        uid: DEFAULT_UID,
        nickname: '\u5192\u65e0\u5c18',
        avatarPath: UI_HOME_AVATAR_MALE,
    },
];
