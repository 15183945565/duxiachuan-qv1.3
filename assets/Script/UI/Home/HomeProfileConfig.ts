import { PROFILE_UI_ROOT, VIEW_HEIGHT, VIEW_WIDTH } from './HomeBaseConfig';

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

export const PROFILE_DAOYOU_UI_ROOT = `${PROFILE_UI_ROOT}/DaoYou`;
export const UI_PROFILE_DAOYOU_BG = `${PROFILE_DAOYOU_UI_ROOT}/profile_daoyou_bg`;
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
export const PROFILE_AVATAR_FRAME_HUD_SPINE_SCALE = 0.76;
export const PROFILE_AVATAR_FRAME_HUD_TO_AVATAR_RATIO = 1.3;
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

export const PROFILE_BILL_UI_ROOT = `${PROFILE_UI_ROOT}/Bill`;
export const UI_PROFILE_BILL_BG = `${PROFILE_BILL_UI_ROOT}/profile_bill_bg`;
export const UI_PROFILE_BILL_DIVIDER = `${PROFILE_BILL_UI_ROOT}/profile_bill_divider`;
export const UI_PROFILE_BILL_TAB_ACTIVE = `${PROFILE_BILL_UI_ROOT}/profile_bill_tab_active`;
export const UI_PROFILE_BILL_TAB_INACTIVE = `${PROFILE_BILL_UI_ROOT}/profile_bill_tab_inactive`;
export const PROFILE_BILL_BG_WIDTH = VIEW_WIDTH;
export const PROFILE_BILL_BG_HEIGHT = VIEW_HEIGHT;
export const PROFILE_BILL_TAB_WIDTH = 96;
export const PROFILE_BILL_TAB_HEIGHT = 44;
export const PROFILE_BILL_TAB_Y = 540;
export const PROFILE_BILL_INCOME_TAB_X = -56;
export const PROFILE_BILL_EXPENSE_TAB_X = 56;
export const PROFILE_BILL_SCROLL_WIDTH = 690;
export const PROFILE_BILL_SCROLL_HEIGHT = 1060;
export const PROFILE_BILL_SCROLL_Y = -80;
export const PROFILE_BILL_ROW_WIDTH = 660;
export const PROFILE_BILL_ROW_HEIGHT = 88;
export const PROFILE_BILL_ROW_GAP = 14;
export const PROFILE_BILL_ROW_TOP_PADDING = 12;
export const PROFILE_BILL_RECORDS = [
    { id: 'bill_001', type: 'income', title: '\u9274\u5b9d\u4e7e\u5764-\u6d3e\u5956-\u9274\u5b9d\u5764\u95e8', yuanbao: 1360, time: '2026-05-24 01:55:40' },
    { id: 'bill_002', type: 'income', title: '\u9053\u53cb\u52a9\u529b-\u5956\u52b1-\u9996\u5e2d\u9053\u53cb', yuanbao: 520, time: '2026-05-23 22:18:09' },
    { id: 'bill_003', type: 'income', title: '\u5206\u4eab\u4efb\u52a1-\u6d3e\u5956-\u5143\u5b9d', yuanbao: 300, time: '2026-05-23 18:42:31' },
    { id: 'bill_004', type: 'income', title: '\u9b54\u754c\u5386\u7ec3-\u901a\u5173-\u5143\u5b9d', yuanbao: 188, time: '2026-05-23 12:36:18' },
    { id: 'bill_005', type: 'income', title: '\u767b\u5f55\u798f\u5229-\u6bcf\u65e5-\u5143\u5b9d', yuanbao: 120, time: '2026-05-23 08:10:05' },
    { id: 'bill_006', type: 'income', title: '\u6218\u529b\u8fbe\u6807-\u6d3e\u5956-\u5143\u5b9d', yuanbao: 260, time: '2026-05-22 23:08:44' },
    { id: 'bill_007', type: 'income', title: '\u6d3b\u52a8\u8865\u53d1-\u90ae\u4ef6-\u5143\u5b9d', yuanbao: 80, time: '2026-05-22 19:27:16' },
    { id: 'bill_008', type: 'income', title: '\u6c5f\u6e56\u8bd5\u70bc-\u9996\u80dc-\u5143\u5b9d', yuanbao: 160, time: '2026-05-22 15:04:52' },
    { id: 'bill_009', type: 'income', title: '\u5728\u7ebf\u5956\u52b1-\u9886\u53d6-\u5143\u5b9d', yuanbao: 60, time: '2026-05-22 11:20:37' },
    { id: 'bill_010', type: 'income', title: '\u4fee\u884c\u8fdb\u5ea6-\u7a81\u7834-\u5143\u5b9d', yuanbao: 100, time: '2026-05-21 21:46:08' },
] as const;
