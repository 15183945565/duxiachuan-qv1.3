import { SHARE_UI_ROOT } from './HomeBaseConfig';

export const UI_SHARE_PAGE_BG = `${SHARE_UI_ROOT}/share_page_bg`;
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
