export const UI_LAYER_NAMES = {
    canvas: 'Canvas',
    mainRoot: 'MainRoot',
    gameScene: 'GameSceneLayer',
    hud: 'HudLayer',
    page: 'PageLayer',
    popup: 'PopupLayer',
    guide: 'GuideLayer',
    toast: 'ToastLayer',
} as const;

export const UI_PAGE_LAYER_ORDER = {
    gameScene: 0,
    hud: 10,
    page: 20,
    popup: 30,
    guide: 40,
    toast: 50,
} as const;

export const UI_ROOT_LAYER_ORDER = [
    UI_LAYER_NAMES.gameScene,
    UI_LAYER_NAMES.hud,
    UI_LAYER_NAMES.page,
    UI_LAYER_NAMES.popup,
    UI_LAYER_NAMES.guide,
    UI_LAYER_NAMES.toast,
] as const;

export type UILayerName = typeof UI_LAYER_NAMES[keyof typeof UI_LAYER_NAMES];
