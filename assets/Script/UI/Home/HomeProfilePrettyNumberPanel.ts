import {
    Color,
    EventTouch,
    Graphics,
    HorizontalTextAlignment,
    Label,
    Mask,
    Node,
    Overflow,
    RichText,
    ScrollView,
    Sprite,
    SpriteFrame,
    UITransform,
    VerticalTextAlignment,
} from 'cc';
import { applySimKaiFont } from '../Common/UIFont';
import * as HomeConfig from './HomeConfig';
import type { HomeViewBase } from './HomeViewBase';

interface ProfilePrettyNumberRuntime {
    node: Node;
    profilePopupRoot?: Node | null;
    profilePopupBoard?: Node | null;
    popupRoot?: Node | null;
    uiHudLayer?: Node | null;
    findNode(name: string, root?: Node): Node | null;
    createNode(name: string, parent: Node, width: number, height: number, x: number, y: number): Node;
    createSkinnedNode(name: string, parent: Node, width: number, height: number, x: number, y: number, skinPath: string, fallbackColor?: Color): Node;
    createLabel(parent: Node, name: string, text: string, fontSize: number, x: number, y: number, width: number, height: number, color: Color): Label;
    drawRect(node: Node, width: number, height: number, color: Color): Graphics;
    applyUiSkinKeepingEditorSize(node: Node, skinPath: string, fallbackWidth: number, fallbackHeight: number): void;
    loadSpriteFrameAsset?(path: string, fallbackUuid?: string): Promise<SpriteFrame>;
    bindScaledClick(node: Node, onClick: (event: EventTouch) => void): void;
    ensureInputBlocker(node: Node, width?: number, height?: number): void;
    openSharedFlowPopup?(popupName: string, content?: { title?: string; message?: string; onConfirm?: () => void }): void;
    showToast?(message: string): void;
    refreshRootLayerOrder(): void;
}

type PrettyNumberItem = typeof HomeConfig.PROFILE_PRETTY_NUMBER_ITEMS[number];

const PANEL_NAME = 'ProfilePrettyNumberPanel';
const BOARD_NAME = 'ProfilePrettyNumberBoard';
const TEXT_COLOR = new Color(110, 90, 71, 255);
const TITLE_COLOR = new Color(110, 90, 71, 255);
const PRICE_COLOR = new Color(110, 90, 71, 255);
const BUY_BUTTON_LABEL_COLOR = new Color(110, 90, 71, 255);
const EFFECT_INTERVAL_MS = 80;

let selectedPrettyNumberId = '';
let borderEffectFramePromise: Promise<SpriteFrame[]> | null = null;
let borderEffectRunId = 0;
const borderEffectTimers = new WeakMap<Node, ReturnType<typeof setInterval>>();
const borderEffectRunIds = new WeakMap<Node, number>();

export function openProfilePrettyNumberPanel(host: HomeViewBase): void {
    const api = host as unknown as ProfilePrettyNumberRuntime;
    const panel = ensureProfilePrettyNumberPanel(api);
    selectedPrettyNumberId = '';
    panel.active = true;
    setProfilePopupBoardVisible(api, false);
    api.ensureInputBlocker(panel, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT);
    panel.setSiblingIndex((panel.parent?.children.length || 1) - 1);
    bindProfilePrettyNumberPanel(api, panel);
    refreshProfilePrettyNumberPanel(api, panel);
    resetPrettyNumberScroll(panel);
    startPrettyNumberBorderEffect(api, panel);
    api.refreshRootLayerOrder();
}

export function closeProfilePrettyNumberPanel(host: HomeViewBase): void {
    const api = host as unknown as ProfilePrettyNumberRuntime;
    const panel = findProfilePrettyNumberPanel(api);
    if (panel?.isValid) {
        stopPrettyNumberBorderEffect(panel);
        panel.active = false;
    }
    setProfilePopupBoardVisible(api, true);
}

function ensureProfilePrettyNumberPanel(api: ProfilePrettyNumberRuntime): Node {
    const root = getProfilePopupRoot(api);
    let panel = api.findNode(PANEL_NAME, root);
    if (!panel?.isValid) {
        panel = buildProfilePrettyNumberPanel(api, root);
    } else {
        prepareProfilePrettyNumberPanel(api, panel);
    }
    return panel;
}

function findProfilePrettyNumberPanel(api: ProfilePrettyNumberRuntime): Node | null {
    const root = getProfilePopupRoot(api, false);
    return root ? api.findNode(PANEL_NAME, root) : null;
}

function getProfilePopupRoot(api: ProfilePrettyNumberRuntime, required = true): Node {
    const root = api.profilePopupRoot?.isValid
        ? api.profilePopupRoot
        : api.findNode('ProfilePopup', api.popupRoot || api.uiHudLayer || api.node);
    if (!root && required) {
        throw new Error('[MainHomeView] ProfilePopup is required before opening PrettyNumber panel');
    }
    return root || api.node;
}

function buildProfilePrettyNumberPanel(api: ProfilePrettyNumberRuntime, root: Node): Node {
    const panel = api.createNode(PANEL_NAME, root, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT, 0, 0);
    panel.active = false;

    const mask = api.createNode('ProfilePrettyNumberMask', panel, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT, 0, 0);
    api.ensureInputBlocker(mask, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT);
    api.drawRect(mask, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT, new Color(0, 0, 0, 0));

    const board = api.createSkinnedNode(
        BOARD_NAME,
        panel,
        HomeConfig.PROFILE_PRETTY_NUMBER_POPUP_WIDTH,
        HomeConfig.PROFILE_PRETTY_NUMBER_POPUP_HEIGHT,
        0,
        0,
        HomeConfig.UI_PROFILE_PRETTY_NUMBER_POPUP_BG,
    );
    board.setSiblingIndex(1);
    api.ensureInputBlocker(board, HomeConfig.PROFILE_PRETTY_NUMBER_POPUP_WIDTH, HomeConfig.PROFILE_PRETTY_NUMBER_POPUP_HEIGHT);

    buildProfilePrettyNumberBoard(api, board);
    return panel;
}

function prepareProfilePrettyNumberPanel(api: ProfilePrettyNumberRuntime, panel: Node): void {
    api.ensureInputBlocker(panel, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT);

    const mask = panel.getChildByName('ProfilePrettyNumberMask');
    if (mask?.isValid) {
        setNodeSize(mask, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT);
        api.ensureInputBlocker(mask, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT);
        api.drawRect(mask, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT, new Color(0, 0, 0, 0));
    }

    let board = panel.getChildByName(BOARD_NAME);
    if (!board?.isValid) {
        board = api.createSkinnedNode(
            BOARD_NAME,
            panel,
            HomeConfig.PROFILE_PRETTY_NUMBER_POPUP_WIDTH,
            HomeConfig.PROFILE_PRETTY_NUMBER_POPUP_HEIGHT,
            0,
            0,
            HomeConfig.UI_PROFILE_PRETTY_NUMBER_POPUP_BG,
        );
    }
    board.setSiblingIndex(1);
    api.applyUiSkinKeepingEditorSize(board, HomeConfig.UI_PROFILE_PRETTY_NUMBER_POPUP_BG, HomeConfig.PROFILE_PRETTY_NUMBER_POPUP_WIDTH, HomeConfig.PROFILE_PRETTY_NUMBER_POPUP_HEIGHT);
    api.ensureInputBlocker(board, HomeConfig.PROFILE_PRETTY_NUMBER_POPUP_WIDTH, HomeConfig.PROFILE_PRETTY_NUMBER_POPUP_HEIGHT);
    buildProfilePrettyNumberBoard(api, board);
}

function buildProfilePrettyNumberBoard(api: ProfilePrettyNumberRuntime, board: Node): void {
    ensureSkinnedChild(api, board, 'ProfilePrettyNumberTitleBg', 202, 58, 0, 250, HomeConfig.UI_PROFILE_PRETTY_NUMBER_TITLE_BG).setSiblingIndex(2);
    ensureStyledLabel(api, board, 'ProfilePrettyNumberTitleLabel', '\u9753\u53f7', 29, 0, 251, 160, 44, TITLE_COLOR, HorizontalTextAlignment.CENTER, 0).node.setSiblingIndex(3);

    const content = ensurePrettyNumberScrollContent(api, board);
    hideStaleBoardItems(board);
    const rowCount = Math.ceil(HomeConfig.PROFILE_PRETTY_NUMBER_ITEMS.length / HomeConfig.PROFILE_PRETTY_NUMBER_GRID_COLUMNS);
    const contentHeight = Math.max(
        HomeConfig.PROFILE_PRETTY_NUMBER_SCROLL_HEIGHT,
        rowCount * HomeConfig.PROFILE_PRETTY_NUMBER_GRID_ROW_GAP + 16,
    );
    setNodeSize(content, HomeConfig.PROFILE_PRETTY_NUMBER_SCROLL_WIDTH, contentHeight);
    const topY = contentHeight / 2 - HomeConfig.PROFILE_PRETTY_NUMBER_CELL_HEIGHT / 2 - 8;
    HomeConfig.PROFILE_PRETTY_NUMBER_ITEMS.forEach((item, index) => {
        const row = Math.floor(index / HomeConfig.PROFILE_PRETTY_NUMBER_GRID_COLUMNS);
        const col = index % HomeConfig.PROFILE_PRETTY_NUMBER_GRID_COLUMNS;
        const middle = (HomeConfig.PROFILE_PRETTY_NUMBER_GRID_COLUMNS - 1) / 2;
        const x = (col - middle) * HomeConfig.PROFILE_PRETTY_NUMBER_GRID_COLUMN_GAP;
        const y = topY - row * HomeConfig.PROFILE_PRETTY_NUMBER_GRID_ROW_GAP;
        buildPrettyNumberItem(api, content, item, index, x, y);
    });
    ensurePrettyNumberBuyButton(api, board);
    board.getChildByName('ProfilePrettyNumberScrollView')?.getComponent(ScrollView)?.scrollToTop(0.01);
}

function buildPrettyNumberItem(api: ProfilePrettyNumberRuntime, content: Node, item: PrettyNumberItem, index: number, x: number, y: number): Node {
    const root = ensureNodeChild(api, content, `ProfilePrettyNumberItem_${index}`, HomeConfig.PROFILE_PRETTY_NUMBER_CELL_WIDTH, HomeConfig.PROFILE_PRETTY_NUMBER_CELL_HEIGHT, x, y);
    root.setSiblingIndex(10 + index);

    ensureSkinnedChild(
        api,
        root,
        `ProfilePrettyNumberItemBg_${index}`,
        HomeConfig.PROFILE_PRETTY_NUMBER_CELL_WIDTH,
        HomeConfig.PROFILE_PRETTY_NUMBER_CELL_HEIGHT,
        0,
        0,
        HomeConfig.UI_PROFILE_PRETTY_NUMBER_CELL_BG,
    ).setSiblingIndex(0);

    const borderEffect = ensureNodeChild(
        api,
        root,
        `ProfilePrettyNumberBorderEffect_${index}`,
        HomeConfig.PROFILE_PRETTY_NUMBER_CELL_WIDTH,
        HomeConfig.PROFILE_PRETTY_NUMBER_CELL_HEIGHT,
        0,
        2,
    );
    borderEffect.getComponent(Sprite) || borderEffect.addComponent(Sprite);
    borderEffect.setScale(1.3, 1.3, 1);
    borderEffect.setSiblingIndex(1);

    const selected = ensureSelectedFrame(
        api,
        root,
        `ProfilePrettyNumberSelected_${index}`,
        HomeConfig.PROFILE_PRETTY_NUMBER_SELECTED_WIDTH,
        HomeConfig.PROFILE_PRETTY_NUMBER_SELECTED_HEIGHT,
        6.709999999999977,
        -0.7825000000000003,
        HomeConfig.UI_PROFILE_PRETTY_NUMBER_SELECTED,
    );
    selected.setSiblingIndex(5);

    ensureStyledLabel(api, root, `ProfilePrettyNumberValue_${index}`, item.number, 23, 0, 12, 126, 32, TEXT_COLOR, HorizontalTextAlignment.CENTER, 0).node.setSiblingIndex(2);

    const priceRoot = ensureNodeChild(api, root, `ProfilePrettyNumberPriceRoot_${index}`, 100, 28, 8.934166666666643, -18);
    priceRoot.setSiblingIndex(3);
    ensureSkinnedChild(api, priceRoot, `ProfilePrettyNumberYuanbaoIcon_${index}`, 22, 20, -20, 0, HomeConfig.UI_PROFILE_PRETTY_NUMBER_YUANBAO_ICON).setSiblingIndex(0);
    ensureStyledLabel(api, priceRoot, `ProfilePrettyNumberPrice_${index}`, `${item.price}`, 18, 21, 0, 60, 26, PRICE_COLOR, HorizontalTextAlignment.LEFT, 0).node.setSiblingIndex(1);

    api.bindScaledClick(root, () => {
        saveSelectedPrettyNumber(item.id);
        refreshProfilePrettyNumberPanel(api, findPrettyNumberPanelFromNode(root) || content);
        api.showToast?.(`\u5df2\u9009\u62e9\u9753\u53f7 ${item.number}`);
    });

    return root;
}

function ensurePrettyNumberScrollContent(api: ProfilePrettyNumberRuntime, board: Node): Node {
    const scroll = ensureNodeChild(
        api,
        board,
        'ProfilePrettyNumberScrollView',
        HomeConfig.PROFILE_PRETTY_NUMBER_SCROLL_WIDTH,
        HomeConfig.PROFILE_PRETTY_NUMBER_SCROLL_HEIGHT,
        0,
        HomeConfig.PROFILE_PRETTY_NUMBER_SCROLL_Y,
    );
    scroll.setSiblingIndex(4);
    const content = ensureNodeChild(
        api,
        scroll,
        'ProfilePrettyNumberScrollContent',
        HomeConfig.PROFILE_PRETTY_NUMBER_SCROLL_WIDTH,
        HomeConfig.PROFILE_PRETTY_NUMBER_SCROLL_HEIGHT,
        0,
        0,
    );
    setupProfilePrettyNumberScrollView(scroll, content);
    return content;
}

function setupProfilePrettyNumberScrollView(scrollNode: Node, content: Node): void {
    const mask = scrollNode.getComponent(Mask) || scrollNode.addComponent(Mask);
    mask.type = Mask.Type.GRAPHICS_RECT;
    mask.enabled = true;
    const scroll = scrollNode.getComponent(ScrollView) || scrollNode.addComponent(ScrollView);
    scroll.content = content;
    scroll.horizontal = false;
    scroll.vertical = true;
    scroll.elastic = true;
    scroll.inertia = true;
    scroll.enabled = true;
}

function hideStaleBoardItems(board: Node): void {
    board.children
        .filter((child) => /^ProfilePrettyNumberItem_\d+$/.test(child.name))
        .forEach((child) => {
            child.active = false;
        });
}

function ensurePrettyNumberBuyButton(api: ProfilePrettyNumberRuntime, board: Node): Node {
    const button = ensureOptionalSkinnedChild(
        api,
        board,
        'ProfilePrettyNumberBuyButton',
        HomeConfig.PROFILE_PRETTY_NUMBER_BUY_BUTTON_WIDTH,
        HomeConfig.PROFILE_PRETTY_NUMBER_BUY_BUTTON_HEIGHT,
        0,
        HomeConfig.PROFILE_PRETTY_NUMBER_BUY_BUTTON_Y,
        HomeConfig.UI_PROFILE_PRETTY_NUMBER_BUY_BUTTON_BG,
    );
    button.setSiblingIndex(6);
    ensureStyledLabel(
        api,
        button,
        'ProfilePrettyNumberBuyButtonLabel',
        '\u8d2d\u4e70',
        27,
        0,
        1,
        104,
        40,
        BUY_BUTTON_LABEL_COLOR,
        HorizontalTextAlignment.CENTER,
        0,
    ).node.setSiblingIndex(1);
    api.bindScaledClick(button, () => {
        const item = HomeConfig.PROFILE_PRETTY_NUMBER_ITEMS.find((entry) => entry.id === selectedPrettyNumberId);
        if (!item) return;
        openPrettyNumberPurchaseConfirm(api, item);
    });
    button.active = Boolean(selectedPrettyNumberId);
    return button;
}

function openPrettyNumberPurchaseConfirm(api: ProfilePrettyNumberRuntime, item: PrettyNumberItem): void {
    if (!api.openSharedFlowPopup) {
        api.showToast?.('\u8d2d\u4e70\u6210\u529f');
        return;
    }
    const message = `\u662f\u5426\u786e\u5b9a\u6d88\u8017${item.price}\u5143\u5b9d\u8d2d\u4e70\u9753\u53f7${item.number}\uff1f`;
    api.openSharedFlowPopup('ConfirmPopup', {
        title: '\u63d0\u793a\u8bf4\u660e',
        message,
        onConfirm: () => {
            api.showToast?.('\u8d2d\u4e70\u6210\u529f');
        },
    });
    stylePrettyNumberPurchaseConfirm(api, item);
}

function stylePrettyNumberPurchaseConfirm(api: ProfilePrettyNumberRuntime, item: PrettyNumberItem): void {
    const popup = api.findNode('ConfirmPopup', api.popupRoot || api.uiHudLayer || api.node);
    if (!popup?.isValid) return;

    const quantityRoot = api.findNode('ConfirmQuantityRoot', popup);
    if (quantityRoot?.isValid) {
        quantityRoot.active = false;
    }

    const message = api.findNode('ConfirmMessage', popup)?.getComponent(RichText);
    if (message) {
        message.string = `<outline color=#fff7dc width=1><color=#6f462a>\u662f\u5426\u786e\u5b9a\u6d88\u8017</color><color=#d83a2e>${item.price}</color><color=#6f462a>\u5143\u5b9d\u8d2d\u4e70\u9753\u53f7${escapePrettyNumberRichText(item.number)}\uff1f</color></outline>`;
    }
}

function escapePrettyNumberRichText(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function findPrettyNumberPanelFromNode(node: Node): Node | null {
    let cursor: Node | null = node;
    while (cursor?.isValid) {
        if (cursor.name === PANEL_NAME) return cursor;
        cursor = cursor.parent;
    }
    return null;
}

function bindProfilePrettyNumberPanel(api: ProfilePrettyNumberRuntime, panel: Node): void {
    const board = panel.getChildByName(BOARD_NAME);
    if (!board?.isValid) return;

    board.off(Node.EventType.TOUCH_START);
    board.off(Node.EventType.TOUCH_END);
    board.on(Node.EventType.TOUCH_START, (event: EventTouch) => {
        event.propagationStopped = true;
    });
    board.on(Node.EventType.TOUCH_END, (event: EventTouch) => {
        event.propagationStopped = true;
    });

    const mask = panel.getChildByName('ProfilePrettyNumberMask');
    if (mask?.isValid) {
        mask.off(Node.EventType.TOUCH_END);
        mask.on(Node.EventType.TOUCH_END, (event: EventTouch) => {
            event.propagationStopped = true;
            closeProfilePrettyNumberPanel(api as unknown as HomeViewBase);
        });
    }
}

function refreshProfilePrettyNumberPanel(api: ProfilePrettyNumberRuntime, panel: Node): void {
    const board = panel.name === BOARD_NAME ? panel : panel.getChildByName(BOARD_NAME);
    if (!board?.isValid) return;

    const selectedId = loadSelectedPrettyNumber();
    const content = board.getChildByName('ProfilePrettyNumberScrollView')?.getChildByName('ProfilePrettyNumberScrollContent') || board;
    HomeConfig.PROFILE_PRETTY_NUMBER_ITEMS.forEach((item, index) => {
        const itemRoot = content.getChildByName(`ProfilePrettyNumberItem_${index}`);
        const selected = itemRoot?.getChildByName(`ProfilePrettyNumberSelected_${index}`);
        if (selected?.isValid) {
            selected.active = item.id === selectedId;
        }
    });
    const button = board.getChildByName('ProfilePrettyNumberBuyButton');
    if (button?.isValid) {
        button.active = Boolean(selectedId);
    }
}

function resetPrettyNumberScroll(panel: Node): void {
    panel.getChildByName(BOARD_NAME)
        ?.getChildByName('ProfilePrettyNumberScrollView')
        ?.getComponent(ScrollView)
        ?.scrollToTop(0.01);
}

function loadSelectedPrettyNumber(): string {
    return selectedPrettyNumberId;
}

function saveSelectedPrettyNumber(id: string): void {
    selectedPrettyNumberId = id;
}

function ensureSkinnedChild(api: ProfilePrettyNumberRuntime, parent: Node, name: string, width: number, height: number, x: number, y: number, skinPath: string): Node {
    const node = ensureNodeChild(api, parent, name, width, height, x, y);
    api.applyUiSkinKeepingEditorSize(node, skinPath, width, height);
    return node;
}

function ensureOptionalSkinnedChild(api: ProfilePrettyNumberRuntime, parent: Node, name: string, width: number, height: number, x: number, y: number, skinPath: string): Node {
    const existing = parent.getChildByName(name);
    const wasActive = existing?.isValid ? existing.active : false;
    const node = ensureNodeChild(api, parent, name, width, height, x, y);
    const sprite = node.getComponent(Sprite);
    if (!sprite?.spriteFrame) {
        api.applyUiSkinKeepingEditorSize(node, skinPath, width, height);
    }
    node.active = wasActive;
    return node;
}

function ensureSelectedFrame(api: ProfilePrettyNumberRuntime, parent: Node, name: string, width: number, height: number, x: number, y: number, skinPath: string): Node {
    const existing = parent.getChildByName(name);
    const wasActive = existing?.isValid ? existing.active : false;
    const node = ensureNodeChild(api, parent, name, width, height, x, y);
    const sprite = node.getComponent(Sprite);
    if (!sprite?.spriteFrame) {
        api.applyUiSkinKeepingEditorSize(node, skinPath, width, height);
    }
    node.active = wasActive;
    return node;
}

function ensureNodeChild(api: ProfilePrettyNumberRuntime, parent: Node, name: string, width: number, height: number, x: number, y: number): Node {
    let node = parent.getChildByName(name);
    if (!node?.isValid) {
        node = api.createNode(name, parent, width, height, x, y);
    } else {
        node.active = true;
        const transform = node.getComponent(UITransform) || node.addComponent(UITransform);
        transform.setContentSize(width, height);
        node.setPosition(x, y, node.position.z);
    }
    return node;
}

function ensureStyledLabel(
    api: ProfilePrettyNumberRuntime,
    parent: Node,
    name: string,
    text: string,
    fontSize: number,
    x: number,
    y: number,
    width: number,
    height: number,
    color: Color,
    align: HorizontalTextAlignment,
    outlineWidth: number,
): Label {
    let label = parent.getChildByName(name)?.getComponent(Label) || null;
    if (!label) {
        label = api.createLabel(parent, name, text, fontSize, x, y, width, height, color);
    } else {
        label.node.active = true;
        const transform = label.node.getComponent(UITransform) || label.node.addComponent(UITransform);
        transform.setContentSize(width, height);
        label.node.setPosition(x, y, label.node.position.z);
    }
    applySimKaiFont(label);
    label.string = text;
    label.fontSize = fontSize;
    label.lineHeight = fontSize + 8;
    label.color = color;
    label.horizontalAlign = align;
    label.verticalAlign = VerticalTextAlignment.CENTER;
    label.overflow = Overflow.SHRINK;
    label.enableWrapText = false;
    label.enableOutline = outlineWidth > 0;
    label.outlineColor = new Color(54, 34, 18, 255);
    label.outlineWidth = outlineWidth;
    return label;
}

function startPrettyNumberBorderEffect(api: ProfilePrettyNumberRuntime, panel: Node): void {
    stopPrettyNumberBorderEffect(panel);
    const board = panel.getChildByName(BOARD_NAME);
    const content = board?.getChildByName('ProfilePrettyNumberScrollView')?.getChildByName('ProfilePrettyNumberScrollContent');
    if (!board?.isValid || !content?.isValid) return;

    const runId = ++borderEffectRunId;
    borderEffectRunIds.set(panel, runId);
    void loadPrettyNumberBorderEffectFrames(api)
        .then((frames) => {
            if (!frames.length || !panel.isValid || !panel.active) return;
            if (borderEffectRunIds.get(panel) !== runId) return;
            let frameIndex = 0;
            let frameDirection = 1;
            const render = (): void => {
                if (!panel.isValid || !panel.active) {
                    stopPrettyNumberBorderEffect(panel);
                    return;
                }
                HomeConfig.PROFILE_PRETTY_NUMBER_ITEMS.forEach((_, index) => {
                    const effect = content.getChildByName(`ProfilePrettyNumberItem_${index}`)?.getChildByName(`ProfilePrettyNumberBorderEffect_${index}`);
                    const sprite = effect?.getComponent(Sprite);
                    if (sprite?.isValid) {
                        sprite.spriteFrame = frames[frameIndex];
                        sprite.sizeMode = Sprite.SizeMode.CUSTOM;
                        sprite.enabled = true;
                    }
                });
                if (frames.length <= 1) return;
                if (frameIndex >= frames.length - 1) {
                    frameDirection = -1;
                } else if (frameIndex <= 0) {
                    frameDirection = 1;
                }
                frameIndex += frameDirection;
            };
            render();
            const timer = setInterval(render, EFFECT_INTERVAL_MS);
            borderEffectTimers.set(panel, timer);
        })
        .catch((err) => {
            console.warn('[MainHomeView] pretty number border effect load failed', err);
        });
}

function stopPrettyNumberBorderEffect(panel: Node): void {
    borderEffectRunIds.set(panel, ++borderEffectRunId);
    const timer = borderEffectTimers.get(panel);
    if (timer) {
        clearInterval(timer);
        borderEffectTimers.delete(panel);
    }
}

function loadPrettyNumberBorderEffectFrames(api: ProfilePrettyNumberRuntime): Promise<SpriteFrame[]> {
    if (borderEffectFramePromise) return borderEffectFramePromise;
    if (!api.loadSpriteFrameAsset) {
        borderEffectFramePromise = Promise.resolve([]);
        return borderEffectFramePromise;
    }
    borderEffectFramePromise = Promise.all(
        HomeConfig.PROFILE_PRETTY_NUMBER_BORDER_EFFECT_PATHS.map((path) => api.loadSpriteFrameAsset!(path)),
    ).catch((err) => {
        borderEffectFramePromise = null;
        throw err;
    });
    return borderEffectFramePromise;
}

function setNodeSize(node: Node, width: number, height: number): void {
    (node.getComponent(UITransform) || node.addComponent(UITransform)).setContentSize(width, height);
}

function setProfilePopupBoardVisible(api: ProfilePrettyNumberRuntime, visible: boolean): void {
    const root = getProfilePopupRoot(api, false);
    const board = api.profilePopupBoard?.isValid
        ? api.profilePopupBoard
        : root?.getChildByName('ProfilePopupBoard') || null;
    if (board?.isValid) {
        board.active = visible;
    }
}
