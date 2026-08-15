import {
    Color,
    EditBox,
    EventTouch,
    HorizontalTextAlignment,
    instantiate,
    Label,
    Mask,
    Node,
    Overflow,
    ScrollView,
    Sprite,
    sys,
    UITransform,
    VerticalTextAlignment,
} from 'cc';
import { applySimKaiFont } from '../Common/UIFont';
import * as HomeConfig from './HomeConfig';
import {
    ensureEditorNodeSize,
    getEditorNodeSize,
    needsFallbackSprite,
} from './HomeEditorLayout';
import type { HomeViewBase } from './HomeViewBase';

type ProfileDaoYouTabId = typeof HomeConfig.PROFILE_DAOYOU_TABS[number]['id'];
type ProfileDaoYouMember = typeof HomeConfig.PROFILE_DAOYOU_MEMBERS_BY_TAB[ProfileDaoYouTabId][number];
interface ProfileDaoYouChiefPlayer {
    uid: string;
    name: string;
    level: number;
    avatarPath: string;
}

interface ProfileDaoYouRuntime {
    node: Node;
    profilePopupRoot?: Node | null;
    profilePopupBoard?: Node | null;
    popupRoot?: Node | null;
    uiHudLayer?: Node | null;
    findNode(name: string, root?: Node): Node | null;
    createNode(name: string, parent: Node, width: number, height: number, x: number, y: number): Node;
    createSkinnedNode(name: string, parent: Node, width: number, height: number, x: number, y: number, skinPath: string, fallbackColor?: Color): Node;
    createLabel(parent: Node, name: string, text: string, fontSize: number, x: number, y: number, width: number, height: number, color: Color): Label;
    applyUiSkinKeepingEditorSize(node: Node, skinPath: string, fallbackWidth: number, fallbackHeight: number): void;
    bindScaledClick(node: Node, onClick: (event: EventTouch) => void): void;
    ensureInputBlocker(node: Node, width?: number, height?: number): void;
    showToast?(message: string): void;
    refreshRootLayerOrder(): void;
}

const PANEL_NAME = 'ProfileDaoYouPanel';
const ROW_TEMPLATE_NAME = 'ProfileDaoYouRowTemplate';
const MY_CHIEF_BUTTON_NAME = 'ProfileDaoYouMyChiefButton';
const MY_CHIEF_POPUP_NAME = 'ProfileDaoYouMyChiefPopup';
const DEFAULT_TAB: ProfileDaoYouTabId = 'chief';
const ROW_SCALE = 1.1;
const ROW_VISIBLE_GAP = 28;
const ROW_TOP_PADDING = 14;

export function openProfileDaoYouPanel(host: HomeViewBase): void {
    const api = host as unknown as ProfileDaoYouRuntime;
    const panel = ensureProfileDaoYouPanel(api);
    panel.active = true;
    setProfilePopupBoardVisible(api, false);
    api.ensureInputBlocker(panel, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT);
    panel.setSiblingIndex((panel.parent?.children.length || 1) - 1);
    bindProfileDaoYouPanel(api, panel);
    refreshProfileDaoYouPanel(api, panel, DEFAULT_TAB);
    api.refreshRootLayerOrder();
}

export function closeProfileDaoYouPanel(host: HomeViewBase): void {
    const api = host as unknown as ProfileDaoYouRuntime;
    const panel = findProfileDaoYouPanel(api);
    if (panel?.isValid) {
        panel.active = false;
    }
    setProfilePopupBoardVisible(api, true);
}

function ensureProfileDaoYouPanel(api: ProfileDaoYouRuntime): Node {
    const root = getProfilePopupRoot(api);
    let panel = api.findNode(PANEL_NAME, root);
    if (!panel?.isValid) {
        panel = buildProfileDaoYouPanel(api, root);
    }
    bindProfileDaoYouPanel(api, panel);
    return panel;
}

function findProfileDaoYouPanel(api: ProfileDaoYouRuntime): Node | null {
    const root = getProfilePopupRoot(api, false);
    return root ? api.findNode(PANEL_NAME, root) : null;
}

function getProfilePopupRoot(api: ProfileDaoYouRuntime, required = true): Node {
    const root = api.profilePopupRoot?.isValid
        ? api.profilePopupRoot
        : api.findNode('ProfilePopup', api.popupRoot || api.uiHudLayer || api.node);
    if (!root && required) {
        throw new Error('[MainHomeView] ProfilePopup is required before opening DaoYou panel');
    }
    return root || api.node;
}

function buildProfileDaoYouPanel(api: ProfileDaoYouRuntime, root: Node): Node {
    const panel = api.createNode(PANEL_NAME, root, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT, 0, 0);
    panel.active = false;
    api.createSkinnedNode('ProfileDaoYouBg', panel, HomeConfig.VIEW_WIDTH, 1660, 0, 0, HomeConfig.UI_PROFILE_DAOYOU_BG).setSiblingIndex(0);
    api.createSkinnedNode('ProfileDaoYouBackButton', panel, HomeConfig.BOTTOM_ENTRY_BACK_BUTTON_WIDTH, HomeConfig.BOTTOM_ENTRY_BACK_BUTTON_HEIGHT, -310, 694, HomeConfig.UI_RANK_BACK).setSiblingIndex(2);
    api.createSkinnedNode('ProfileDaoYouTitleBg', panel, 486, 84, 0, 662, HomeConfig.UI_PROFILE_DAOYOU_TITLE_BG).setSiblingIndex(1);
    createStyledLabel(api, panel, 'ProfileDaoYouTitleLabel', '\u6211\u7684\u9053\u53cb', 38, 0, 663, 300, 64, new Color(255, 239, 185, 255), HorizontalTextAlignment.CENTER, 2).setSiblingIndex(3);
    api.createSkinnedNode(
        MY_CHIEF_BUTTON_NAME,
        panel,
        HomeConfig.PROFILE_DAOYOU_MY_CHIEF_BUTTON_WIDTH,
        HomeConfig.PROFILE_DAOYOU_MY_CHIEF_BUTTON_HEIGHT,
        HomeConfig.PROFILE_DAOYOU_MY_CHIEF_BUTTON_X,
        HomeConfig.PROFILE_DAOYOU_MY_CHIEF_BUTTON_Y,
        HomeConfig.UI_PROFILE_DAOYOU_MY_CHIEF_BUTTON,
    ).setSiblingIndex(4);

    const tabs = api.createNode('ProfileDaoYouTabs', panel, 340, 64, 0, 520);
    tabs.setSiblingIndex(5);
    createTabNode(api, tabs, 'chief', -88);
    createTabNode(api, tabs, 'generation', 88);

    createStyledLabel(api, panel, 'ProfileDaoYouCountLabel', '', 25, 0, 455, 360, 44, new Color(102, 62, 35, 255), HorizontalTextAlignment.CENTER, 1).setSiblingIndex(6);
    const board = api.createNode('ProfileDaoYouBoard', panel, HomeConfig.PROFILE_DAOYOU_BOARD_WIDTH, HomeConfig.PROFILE_DAOYOU_BOARD_HEIGHT, 0, -168);
    hideDecorativeSprite(board);
    board.setSiblingIndex(7);

    const scroll = api.createNode('ProfileDaoYouScrollView', panel, HomeConfig.PROFILE_DAOYOU_SCROLL_WIDTH, HomeConfig.PROFILE_DAOYOU_SCROLL_HEIGHT, 0, -168);
    scroll.setSiblingIndex(8);
    const content = api.createNode('ProfileDaoYouScrollContent', scroll, HomeConfig.PROFILE_DAOYOU_SCROLL_WIDTH, HomeConfig.PROFILE_DAOYOU_SCROLL_HEIGHT, 0, 0);
    createRowTemplate(api, content);
    setupProfileDaoYouScrollView(scroll, content);
    return panel;
}

function bindProfileDaoYouPanel(api: ProfileDaoYouRuntime, panel: Node): void {
    api.ensureInputBlocker(panel, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT);
    panel.off(Node.EventType.TOUCH_END);
    panel.on(Node.EventType.TOUCH_END, (event: EventTouch) => {
        event.propagationStopped = true;
    });

    ensureSkinnedChild(api, panel, 'ProfileDaoYouBg', HomeConfig.VIEW_WIDTH, 1660, 0, 0, HomeConfig.UI_PROFILE_DAOYOU_BG);
    ensureSkinnedChild(api, panel, 'ProfileDaoYouBackButton', HomeConfig.BOTTOM_ENTRY_BACK_BUTTON_WIDTH, HomeConfig.BOTTOM_ENTRY_BACK_BUTTON_HEIGHT, -310, 694, HomeConfig.UI_RANK_BACK);
    ensureSkinnedChild(api, panel, 'ProfileDaoYouTitleBg', 486, 84, 0, 662, HomeConfig.UI_PROFILE_DAOYOU_TITLE_BG);
    const myChiefButton = ensureSkinnedChild(
        api,
        panel,
        MY_CHIEF_BUTTON_NAME,
        HomeConfig.PROFILE_DAOYOU_MY_CHIEF_BUTTON_WIDTH,
        HomeConfig.PROFILE_DAOYOU_MY_CHIEF_BUTTON_HEIGHT,
        HomeConfig.PROFILE_DAOYOU_MY_CHIEF_BUTTON_X,
        HomeConfig.PROFILE_DAOYOU_MY_CHIEF_BUTTON_Y,
        HomeConfig.UI_PROFILE_DAOYOU_MY_CHIEF_BUTTON,
    );
    myChiefButton.setSiblingIndex(4);
    api.bindScaledClick(myChiefButton, () => {
        openProfileDaoYouMyChiefPopup(api);
    });
    ensureStyledLabel(
        api,
        panel,
        'ProfileDaoYouTitleLabel',
        '\u6211\u7684\u9053\u53cb',
        38,
        0,
        663,
        300,
        64,
        new Color(255, 239, 185, 255),
        HorizontalTextAlignment.CENTER,
        2,
    );
    ensureStyledLabel(
        api,
        panel,
        'ProfileDaoYouCountLabel',
        '',
        25,
        0,
        455,
        360,
        44,
        new Color(102, 62, 35, 255),
        HorizontalTextAlignment.CENTER,
        1,
    );
    const board = ensureNodeChild(api, panel, 'ProfileDaoYouBoard', HomeConfig.PROFILE_DAOYOU_BOARD_WIDTH, HomeConfig.PROFILE_DAOYOU_BOARD_HEIGHT, 0, -168);
    hideDecorativeSprite(board);
    board.setSiblingIndex(7);

    const back = api.findNode('ProfileDaoYouBackButton', panel);
    if (back) {
        api.bindScaledClick(back, () => {
            closeProfileDaoYouPanel(api as unknown as HomeViewBase);
        });
    }

    let tabs = api.findNode('ProfileDaoYouTabs', panel);
    if (!tabs?.isValid) {
        tabs = api.createNode('ProfileDaoYouTabs', panel, 340, 64, 0, 520);
    }
    tabs.setSiblingIndex(5);
    createOrRefreshTab(api, tabs, 'chief', -88);
    createOrRefreshTab(api, tabs, 'generation', 88);

    let scroll = api.findNode('ProfileDaoYouScrollView', panel);
    if (!scroll?.isValid) {
        scroll = api.createNode('ProfileDaoYouScrollView', panel, HomeConfig.PROFILE_DAOYOU_SCROLL_WIDTH, HomeConfig.PROFILE_DAOYOU_SCROLL_HEIGHT, 0, -168);
    } else {
        ensureEditorNodeSize(scroll, HomeConfig.PROFILE_DAOYOU_SCROLL_WIDTH, HomeConfig.PROFILE_DAOYOU_SCROLL_HEIGHT);
    }
    scroll.setSiblingIndex(8);

    const scrollSize = getEditorNodeSize(scroll, HomeConfig.PROFILE_DAOYOU_SCROLL_WIDTH, HomeConfig.PROFILE_DAOYOU_SCROLL_HEIGHT);
    let content = api.findNode('ProfileDaoYouScrollContent', scroll);
    if (!content?.isValid) {
        content = api.createNode('ProfileDaoYouScrollContent', scroll, scrollSize.width, scrollSize.height, 0, 0);
    } else {
        ensureEditorNodeSize(content, scrollSize.width, scrollSize.height);
    }
    if (!api.findNode(ROW_TEMPLATE_NAME, content)) {
        createRowTemplate(api, content);
    }
    setupProfileDaoYouScrollView(scroll, content);
}

function openProfileDaoYouMyChiefPopup(api: ProfileDaoYouRuntime): void {
    const panel = findProfileDaoYouPanel(api) || ensureProfileDaoYouPanel(api);
    const popup = ensureProfileDaoYouMyChiefPopup(api, panel);
    popup.active = true;
    popup.setSiblingIndex((popup.parent?.children.length || 1) - 1);
    const selectedChief = loadProfileDaoYouChief();
    renderProfileDaoYouMyChiefPopup(api, popup, selectedChief ? 'confirmed' : 'search', selectedChief || undefined);
    api.refreshRootLayerOrder();
}

function closeProfileDaoYouMyChiefPopup(api: ProfileDaoYouRuntime): void {
    const panel = findProfileDaoYouPanel(api);
    const popup = panel?.getChildByName(MY_CHIEF_POPUP_NAME);
    if (popup?.isValid) popup.active = false;
}

function ensureProfileDaoYouMyChiefPopup(api: ProfileDaoYouRuntime, panel: Node): Node {
    let popup = panel.getChildByName(MY_CHIEF_POPUP_NAME);
    if (!popup?.isValid) {
        popup = api.createNode(MY_CHIEF_POPUP_NAME, panel, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT, 0, 0);
    } else {
        popup.active = true;
        popup.setPosition(0, 0, 0);
        ensureEditorNodeSize(popup, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT);
    }
    api.ensureInputBlocker(popup, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT);
    popup.off(Node.EventType.TOUCH_END);
    popup.on(Node.EventType.TOUCH_END, (event: EventTouch) => {
        event.propagationStopped = true;
        closeProfileDaoYouMyChiefPopup(api);
    });

    const board = ensurePopupSkinnedChild(
        api,
        popup,
        'ProfileDaoYouMyChiefBoard',
        HomeConfig.PROFILE_DAOYOU_MY_CHIEF_POPUP_WIDTH,
        HomeConfig.PROFILE_DAOYOU_MY_CHIEF_POPUP_HEIGHT,
        0,
        HomeConfig.PROFILE_DAOYOU_MY_CHIEF_POPUP_Y,
        HomeConfig.UI_CONFIRM_POPUP_BG,
    );
    board.setSiblingIndex(1);
    api.ensureInputBlocker(board, HomeConfig.PROFILE_DAOYOU_MY_CHIEF_POPUP_WIDTH, HomeConfig.PROFILE_DAOYOU_MY_CHIEF_POPUP_HEIGHT);
    board.off(Node.EventType.TOUCH_END);
    board.on(Node.EventType.TOUCH_END, (event: EventTouch) => {
        event.propagationStopped = true;
    });

    return popup;
}

function renderProfileDaoYouMyChiefPopup(
    api: ProfileDaoYouRuntime,
    popup: Node,
    mode: 'search' | 'candidate' | 'confirmed',
    player?: ProfileDaoYouChiefPlayer,
): void {
    const board = popup.getChildByName('ProfileDaoYouMyChiefBoard');
    if (!board?.isValid) return;

    ensurePopupLabel(
        api,
        board,
        'ProfileDaoYouMyChiefTitle',
        '\u6211\u7684\u9053\u957f',
        30,
        0,
        HomeConfig.PROFILE_DAOYOU_MY_CHIEF_TITLE_Y,
        280,
        50,
        new Color(126, 74, 36, 255),
        HorizontalTextAlignment.CENTER,
        2,
    ).setSiblingIndex(2);

    const close = ensurePopupSkinnedChild(
        api,
        board,
        'ProfileDaoYouMyChiefClose',
        48,
        58,
        HomeConfig.PROFILE_DAOYOU_MY_CHIEF_CLOSE_X,
        HomeConfig.PROFILE_DAOYOU_MY_CHIEF_CLOSE_Y,
        HomeConfig.UI_PROFILE_DAOYOU_CHIEF_CLOSE,
    );
    close.setSiblingIndex(8);
    api.bindScaledClick(close, () => closeProfileDaoYouMyChiefPopup(api));

    const searchRoot = ensurePopupNodeChild(api, board, 'ProfileDaoYouMyChiefSearchRoot', 540, 68, 0, HomeConfig.PROFILE_DAOYOU_MY_CHIEF_SEARCH_Y);
    searchRoot.active = mode !== 'confirmed';
    if (searchRoot.active) {
        const inputBg = ensurePopupSkinnedChild(
            api,
            searchRoot,
            'ProfileDaoYouMyChiefUidInput',
            HomeConfig.PROFILE_DAOYOU_MY_CHIEF_INPUT_WIDTH,
            HomeConfig.PROFILE_DAOYOU_MY_CHIEF_INPUT_HEIGHT,
            HomeConfig.PROFILE_DAOYOU_MY_CHIEF_INPUT_X,
            0,
            HomeConfig.UI_PROFILE_DAOYOU_CHIEF_INPUT_BG,
        );
        const editBox = setupProfileDaoYouChiefEditBox(api, inputBg);
        const searchButton = ensurePopupSkinnedChild(
            api,
            searchRoot,
            'ProfileDaoYouMyChiefSearchButton',
            132,
            50,
            HomeConfig.PROFILE_DAOYOU_MY_CHIEF_SEARCH_BUTTON_X,
            0,
            HomeConfig.UI_PROFILE_DAOYOU_CHIEF_BUTTON_BG,
        );
        ensurePopupLabel(api, searchButton, 'ProfileDaoYouMyChiefSearchButtonLabel', '\u641c\u7d22', 28, 0, 2, 110, 38, Color.WHITE, HorizontalTextAlignment.CENTER, 2);
        api.bindScaledClick(searchButton, () => {
            const searchedPlayer = resolveProfileDaoYouChiefSearch((editBox.string || '').trim());
            renderProfileDaoYouMyChiefPopup(api, popup, 'candidate', searchedPlayer);
        });
    }

    const hasPlayer = !!player;
    const result = ensurePopupNodeChild(api, board, 'ProfileDaoYouMyChiefResult', 490, 94, 0, HomeConfig.PROFILE_DAOYOU_MY_CHIEF_RESULT_Y);
    result.active = hasPlayer;
    if (player) fillProfileDaoYouChiefResult(api, result, player);

    const prompt = ensurePopupLabel(
        api,
        board,
        'ProfileDaoYouMyChiefPrompt',
        mode === 'candidate' ? '\u662f\u5426\u4ee5\u4ed6\u4e3a\u9053\u957f' : '',
        24,
        0,
        HomeConfig.PROFILE_DAOYOU_MY_CHIEF_PROMPT_Y,
        420,
        42,
        new Color(111, 72, 45, 255),
        HorizontalTextAlignment.CENTER,
        1,
    );
    prompt.active = mode === 'candidate';

    const buttons = ensurePopupNodeChild(api, board, 'ProfileDaoYouMyChiefConfirmButtons', 420, 64, 0, HomeConfig.PROFILE_DAOYOU_MY_CHIEF_CONFIRM_BUTTON_Y);
    buttons.active = mode === 'candidate';
    if (buttons.active && player) {
        const cancel = ensurePopupSkinnedChild(api, buttons, 'ProfileDaoYouMyChiefCancel', 142, 54, -105, 0, HomeConfig.UI_PROFILE_DAOYOU_CHIEF_BUTTON_BG);
        ensurePopupLabel(api, cancel, 'ProfileDaoYouMyChiefCancelLabel', '\u53d6\u6d88', 28, 0, 2, 110, 38, Color.WHITE, HorizontalTextAlignment.CENTER, 2);
        api.bindScaledClick(cancel, () => closeProfileDaoYouMyChiefPopup(api));

        const confirm = ensurePopupSkinnedChild(api, buttons, 'ProfileDaoYouMyChiefConfirm', 142, 54, 105, 0, HomeConfig.UI_PROFILE_DAOYOU_CHIEF_BUTTON_BG);
        ensurePopupLabel(api, confirm, 'ProfileDaoYouMyChiefConfirmLabel', '\u786e\u5b9a', 28, 0, 2, 110, 38, Color.WHITE, HorizontalTextAlignment.CENTER, 2);
        api.bindScaledClick(confirm, () => {
            saveProfileDaoYouChief(player);
            api.showToast?.('\u9053\u957f\u5df2\u8bbe\u7f6e');
            renderProfileDaoYouMyChiefPopup(api, popup, 'confirmed', player);
        });
    }
}

function setupProfileDaoYouChiefEditBox(api: ProfileDaoYouRuntime, inputBg: Node): EditBox {
    const editNode = ensurePopupNodeChild(api, inputBg, 'EditBoxTouch', HomeConfig.PROFILE_DAOYOU_MY_CHIEF_INPUT_WIDTH - 28, HomeConfig.PROFILE_DAOYOU_MY_CHIEF_INPUT_HEIGHT - 8, 0, 0);
    const size = getEditorNodeSize(editNode, HomeConfig.PROFILE_DAOYOU_MY_CHIEF_INPUT_WIDTH - 28, HomeConfig.PROFILE_DAOYOU_MY_CHIEF_INPUT_HEIGHT - 8);
    let editBox = editNode.getComponent(EditBox);
    editBox ||= editNode.addComponent(EditBox);

    const textLabel = ensurePopupLabel(api, editNode, 'TEXT_LABEL', '', 22, 0, 0, size.width, size.height, new Color(255, 248, 225, 255), HorizontalTextAlignment.CENTER, 1).getComponent(Label);
    const placeholderLabel = ensurePopupLabel(api, editNode, 'PLACEHOLDER_LABEL', '\u70b9\u51fb\u8f93\u5165\u73a9\u5bb6\u7684UID', 22, 0, 0, size.width, size.height, new Color(230, 223, 205, 230), HorizontalTextAlignment.CENTER, 1).getComponent(Label);
    const editBoxCompat = editBox as unknown as {
        textLabel?: Label;
        placeholderLabel?: Label;
        inputMode?: number;
        inputFlag?: number;
        returnType?: number;
        fontSize?: number;
        placeholderFontSize?: number;
        fontColor?: Color;
        placeholderFontColor?: Color;
        cursorColor?: Color;
        backgroundImage?: null;
        placeholder?: string;
        maxLength?: number;
        string?: string;
    };
    editBoxCompat.textLabel = textLabel || undefined;
    editBoxCompat.placeholderLabel = placeholderLabel || undefined;
    editBoxCompat.inputMode = (EditBox as unknown as { InputMode?: { SINGLE_LINE?: number } }).InputMode?.SINGLE_LINE ?? 6;
    editBoxCompat.inputFlag = (EditBox as unknown as { InputFlag?: { SENSITIVE?: number } }).InputFlag?.SENSITIVE ?? 1;
    editBoxCompat.returnType = (EditBox as unknown as { KeyboardReturnType?: { DONE?: number } }).KeyboardReturnType?.DONE ?? 0;
    editBoxCompat.fontSize = 22;
    editBoxCompat.placeholderFontSize = 22;
    editBoxCompat.fontColor = new Color(255, 248, 225, 255);
    editBoxCompat.placeholderFontColor = new Color(230, 223, 205, 230);
    editBoxCompat.cursorColor = new Color(255, 248, 225, 255);
    editBoxCompat.backgroundImage = null;
    editBoxCompat.placeholder = '\u70b9\u51fb\u8f93\u5165\u73a9\u5bb6\u7684UID';
    editBoxCompat.maxLength = 12;

    const changed = getProfileDaoYouChiefEditBoxEventType('TEXT_CHANGED');
    editNode.off(changed);
    editNode.on(changed, () => {
        const raw = editBox.string || '';
        const digits = raw.replace(/[^\d]/g, '');
        if (raw !== digits) editBox.string = digits;
    });
    return editBox;
}

function getProfileDaoYouChiefEditBoxEventType(name: 'TEXT_CHANGED'): string {
    const eventType = EditBox as unknown as { EventType?: Record<string, string> };
    return eventType.EventType?.[name] || 'text-changed';
}

function fillProfileDaoYouChiefResult(api: ProfileDaoYouRuntime, row: Node, player: ProfileDaoYouChiefPlayer): void {
    ensurePopupSkinnedChild(api, row, 'ProfileDaoYouMyChiefAvatarFrame', 78, 78, -182, 0, HomeConfig.UI_HOME_PROFILE_FRAME).setSiblingIndex(0);
    ensurePopupSkinnedChild(api, row, 'ProfileDaoYouMyChiefAvatar', 68, 68, -182, 0, player.avatarPath).setSiblingIndex(1);
    ensurePopupLabel(api, row, 'ProfileDaoYouMyChiefName', player.name, 25, -70, 18, 260, 34, new Color(74, 50, 35, 255), HorizontalTextAlignment.LEFT, 0).setSiblingIndex(2);
    ensurePopupLabel(api, row, 'ProfileDaoYouMyChiefUid', `UID: ${player.uid}`, 22, -70, -18, 260, 34, new Color(74, 50, 35, 255), HorizontalTextAlignment.LEFT, 0).setSiblingIndex(3);
    ensurePopupLabel(api, row, 'ProfileDaoYouMyChiefLevel', `Lv.${player.level}`, 22, 170, -2, 90, 34, new Color(181, 54, 63, 255), HorizontalTextAlignment.LEFT, 0).setSiblingIndex(4);
}

function resolveProfileDaoYouChiefSearch(uid: string): ProfileDaoYouChiefPlayer {
    const cleanUid = uid.replace(/[^\d]/g, '') || HomeConfig.PROFILE_DAOYOU_MY_CHIEF_DEFAULT.uid;
    if (cleanUid === HomeConfig.PROFILE_DAOYOU_MY_CHIEF_DEFAULT.uid) {
        return createDefaultProfileDaoYouChiefPlayer();
    }
    return {
        uid: cleanUid,
        name: `\u9053\u53cb${cleanUid.slice(-4) || '0000'}`,
        level: 1,
        avatarPath: HomeConfig.UI_HOME_AVATAR_MALE,
    };
}

function createDefaultProfileDaoYouChiefPlayer(): ProfileDaoYouChiefPlayer {
    return {
        ...HomeConfig.PROFILE_DAOYOU_MY_CHIEF_DEFAULT,
        avatarPath: HomeConfig.UI_HOME_AVATAR_MALE,
    };
}

function loadProfileDaoYouChief(): ProfileDaoYouChiefPlayer | null {
    try {
        const raw = sys.localStorage?.getItem(HomeConfig.PROFILE_DAOYOU_MY_CHIEF_STORAGE_KEY);
        if (!raw) return null;
        const value = JSON.parse(raw) as Partial<ProfileDaoYouChiefPlayer>;
        if (!value.uid || !value.name) return null;
        return {
            uid: `${value.uid}`,
            name: `${value.name}`,
            level: Math.max(1, Number(value.level) || 1),
            avatarPath: value.avatarPath || HomeConfig.UI_HOME_AVATAR_MALE,
        };
    } catch {
        return null;
    }
}

function saveProfileDaoYouChief(player: ProfileDaoYouChiefPlayer): void {
    try {
        sys.localStorage?.setItem(HomeConfig.PROFILE_DAOYOU_MY_CHIEF_STORAGE_KEY, JSON.stringify(player));
    } catch {
        // Local storage may be unavailable in some editor preview states.
    }
}

function ensurePopupSkinnedChild(api: ProfileDaoYouRuntime, parent: Node, name: string, width: number, height: number, x: number, y: number, skinPath: string): Node {
    const node = ensurePopupNodeChild(api, parent, name, width, height, x, y);
    if (needsFallbackSprite(node)) {
        api.applyUiSkinKeepingEditorSize(node, skinPath, width, height);
    } else {
        api.applyUiSkinKeepingEditorSize(node, skinPath, width, height);
    }
    return node;
}

function ensurePopupNodeChild(api: ProfileDaoYouRuntime, parent: Node, name: string, width: number, height: number, x: number, y: number): Node {
    let node = parent.getChildByName(name);
    if (!node?.isValid) {
        node = api.createNode(name, parent, width, height, x, y);
    } else {
        node.active = true;
        ensureEditorNodeSize(node, width, height);
        node.setPosition(x, y, 0);
    }
    return node;
}

function ensurePopupLabel(
    api: ProfileDaoYouRuntime,
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
): Node {
    const label = ensureStyledLabel(api, parent, name, text, fontSize, x, y, width, height, color, align, outlineWidth);
    label.node.setPosition(x, y, 0);
    label.string = text;
    styleLabel(label, color, align, outlineWidth);
    return label.node;
}

function createTabNode(api: ProfileDaoYouRuntime, parent: Node, tab: ProfileDaoYouTabId, x: number): Node {
    const node = api.createSkinnedNode(`ProfileDaoYouTab_${tab}`, parent, 138, 57, x, 0, HomeConfig.UI_PROFILE_DAOYOU_TAB_INACTIVE);
    createStyledLabel(api, node, `ProfileDaoYouTab_${tab}Label`, getTabConfig(tab).label, 22, 0, 1, 124, 44, new Color(255, 245, 217, 255), HorizontalTextAlignment.CENTER, 1);
    return node;
}

function createOrRefreshTab(api: ProfileDaoYouRuntime, parent: Node, tab: ProfileDaoYouTabId, x: number): Node {
    let node = parent.getChildByName(`ProfileDaoYouTab_${tab}`);
    if (!node?.isValid) {
        node = createTabNode(api, parent, tab, x);
    } else {
        ensureEditorNodeSize(node, 138, 57);
    }
    ensureStyledLabel(
        api,
        node,
        `ProfileDaoYouTab_${tab}Label`,
        getTabConfig(tab).label,
        22,
        0,
        1,
        124,
        44,
        new Color(255, 245, 217, 255),
        HorizontalTextAlignment.CENTER,
        1,
    );
    api.bindScaledClick(node, () => {
        const panel = findPanelFromTab(node);
        if (panel) {
            refreshProfileDaoYouPanel(api, panel, tab);
        }
    });
    return node;
}

function refreshProfileDaoYouPanel(api: ProfileDaoYouRuntime, panel: Node, activeTab: ProfileDaoYouTabId): void {
    refreshProfileDaoYouTabs(api, panel, activeTab);
    const members = HomeConfig.PROFILE_DAOYOU_MEMBERS_BY_TAB[activeTab];
    const tabConfig = getTabConfig(activeTab);
    const countLabel = api.findNode('ProfileDaoYouCountLabel', panel)?.getComponent(Label);
    if (countLabel) {
        countLabel.string = `${tabConfig.countPrefix}${members.length}\u4eba`;
    }

    const scroll = api.findNode('ProfileDaoYouScrollView', panel);
    const content = scroll ? api.findNode('ProfileDaoYouScrollContent', scroll) : null;
    const template = content ? api.findNode(ROW_TEMPLATE_NAME, content) : null;
    if (!scroll || !content || !template) return;

    refreshProfileDaoYouRows(api, content, template, members);
    setupProfileDaoYouScrollView(scroll, content);
    scroll.getComponent(ScrollView)?.scrollToTop(0.01);
}

function refreshProfileDaoYouTabs(api: ProfileDaoYouRuntime, panel: Node, activeTab: ProfileDaoYouTabId): void {
    const tabs = api.findNode('ProfileDaoYouTabs', panel);
    if (!tabs) return;

    HomeConfig.PROFILE_DAOYOU_TABS.forEach((config) => {
        const tabNode = tabs.getChildByName(`ProfileDaoYouTab_${config.id}`);
        if (!tabNode) return;
        const selected = config.id === activeTab;
        api.applyUiSkinKeepingEditorSize(tabNode, selected ? HomeConfig.UI_PROFILE_DAOYOU_TAB_ACTIVE : HomeConfig.UI_PROFILE_DAOYOU_TAB_INACTIVE, 138, 57);
        const label = tabNode.getChildByName(`ProfileDaoYouTab_${config.id}Label`)?.getComponent(Label);
        if (label) {
            label.string = config.label;
            styleLabel(
                label,
                selected ? new Color(255, 248, 218, 255) : new Color(238, 225, 198, 255),
                HorizontalTextAlignment.CENTER,
                selected ? 2 : 1,
            );
        }
    });
}

function refreshProfileDaoYouRows(api: ProfileDaoYouRuntime, content: Node, template: Node, members: readonly ProfileDaoYouMember[]): void {
    content.children
        .filter((child) => child.name.startsWith('ProfileDaoYouRow_'))
        .forEach((child) => {
            child.active = false;
        });

    const visibleSize = getEditorNodeSize(content.parent, HomeConfig.PROFILE_DAOYOU_SCROLL_WIDTH, HomeConfig.PROFILE_DAOYOU_SCROLL_HEIGHT);
    const currentContentSize = getEditorNodeSize(content, visibleSize.width, visibleSize.height);
    const rowVisualHeight = HomeConfig.PROFILE_DAOYOU_ROW_HEIGHT * ROW_SCALE;
    const contentHeight = Math.max(
        visibleSize.height,
        members.length * rowVisualHeight + Math.max(0, members.length - 1) * ROW_VISIBLE_GAP + 18,
    );
    setNodeSize(content, Math.max(currentContentSize.width, visibleSize.width), contentHeight);
    template.active = false;
    const rowStep = rowVisualHeight + ROW_VISIBLE_GAP;
    const topY = contentHeight / 2 - rowVisualHeight / 2 - ROW_TOP_PADDING;

    members.forEach((member, index) => {
        const rowName = `ProfileDaoYouRow_${member.id}`;
        let row = content.getChildByName(rowName);
        if (!row?.isValid) {
            row = instantiate(template);
            row.name = rowName;
            row.setParent(content);
        }
        row.setPosition(0, topY - index * rowStep, 0);
        row.active = true;
        fillProfileDaoYouRow(api, row, member);
    });
}

function createRowTemplate(api: ProfileDaoYouRuntime, parent: Node): Node {
    const row = api.createSkinnedNode(ROW_TEMPLATE_NAME, parent, HomeConfig.PROFILE_DAOYOU_ROW_WIDTH, HomeConfig.PROFILE_DAOYOU_ROW_HEIGHT, 0, 0, HomeConfig.UI_PROFILE_DAOYOU_ROW_BG);
    row.setScale(ROW_SCALE, ROW_SCALE, 1);
    row.active = false;
    api.createSkinnedNode('ProfileDaoYouAvatarFrame', row, 86, 86, -246, 0, HomeConfig.UI_HOME_PROFILE_FRAME).setSiblingIndex(0);
    api.createSkinnedNode('ProfileDaoYouAvatarIcon', row, 74, 74, -246, 0, HomeConfig.UI_HOME_AVATAR_FEMALE).setSiblingIndex(1);
    createStyledLabel(api, row, 'ProfileDaoYouRowName', '', 26, -54, 22, 288, 36, new Color(82, 55, 42, 255), HorizontalTextAlignment.LEFT, 0).setSiblingIndex(2);
    createStyledLabel(api, row, 'ProfileDaoYouRowLevel', '', 20, -54, -22, 288, 30, new Color(181, 54, 63, 255), HorizontalTextAlignment.LEFT, 0).setSiblingIndex(3);
    api.createSkinnedNode('ProfileDaoYouYuanbaoIcon', row, 44, 44, 150, 0, HomeConfig.UI_HOME_JIFEN_ICON).setSiblingIndex(4);
    createStyledLabel(api, row, 'ProfileDaoYouYuanbaoLabel', '', 25, 240, 0, 110, 40, new Color(93, 65, 42, 255), HorizontalTextAlignment.LEFT, 0).setSiblingIndex(5);
    return row;
}

function fillProfileDaoYouRow(api: ProfileDaoYouRuntime, row: Node, member: ProfileDaoYouMember): void {
    flattenLegacyRowSkin(row);
    ensureEditorNodeSize(row, HomeConfig.PROFILE_DAOYOU_ROW_WIDTH, HomeConfig.PROFILE_DAOYOU_ROW_HEIGHT);
    row.setScale(ROW_SCALE, ROW_SCALE, 1);
    if (needsFallbackSprite(row)) {
        api.applyUiSkinKeepingEditorSize(row, HomeConfig.UI_PROFILE_DAOYOU_ROW_BG, HomeConfig.PROFILE_DAOYOU_ROW_WIDTH, HomeConfig.PROFILE_DAOYOU_ROW_HEIGHT);
    }
    ensureSkinnedChild(api, row, 'ProfileDaoYouAvatarFrame', 86, 86, -246, 0, HomeConfig.UI_HOME_PROFILE_FRAME);
    ensureSkinnedChild(api, row, 'ProfileDaoYouAvatarIcon', 74, 74, -246, 0, getProfileDaoYouAvatarPath(member));
    ensureSkinnedChild(api, row, 'ProfileDaoYouYuanbaoIcon', 44, 44, 150, 0, HomeConfig.UI_HOME_JIFEN_ICON);

    const name = ensureStyledLabel(
        api,
        row,
        'ProfileDaoYouRowName',
        member.name,
        26,
        -54,
        22,
        288,
        36,
        new Color(82, 55, 42, 255),
        HorizontalTextAlignment.LEFT,
        0,
    );
    name.string = member.name;

    const level = ensureStyledLabel(
        api,
        row,
        'ProfileDaoYouRowLevel',
        '',
        20,
        -54,
        -22,
        288,
        30,
        new Color(181, 54, 63, 255),
        HorizontalTextAlignment.LEFT,
        0,
    );
    level.string = `\u6218\u573a\u7b49\u7ea7\uff1a${member.battleLevel}`;

    const yuanbao = ensureStyledLabel(
        api,
        row,
        'ProfileDaoYouYuanbaoLabel',
        '',
        25,
        240,
        0,
        110,
        40,
        new Color(93, 65, 42, 255),
        HorizontalTextAlignment.LEFT,
        0,
    );
    yuanbao.string = `${member.yuanbao}`;
}

function getProfileDaoYouAvatarPath(member: ProfileDaoYouMember): string {
    const match = member.id.match(/(\d+)$/);
    const index = match ? Number(match[1]) : 1;
    return HomeConfig.getHomeAvatarPath(index % 2 === 0 ? 'male' : 'female');
}

function setupProfileDaoYouScrollView(scrollNode: Node, content: Node): void {
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

function ensureSkinnedChild(api: ProfileDaoYouRuntime, parent: Node, name: string, width: number, height: number, x: number, y: number, skinPath: string): Node {
    let node = parent.getChildByName(name);
    if (!node?.isValid) {
        node = api.createSkinnedNode(name, parent, width, height, x, y, skinPath);
    } else {
        ensureEditorNodeSize(node, width, height);
    }
    node.active = true;
    if (needsFallbackSprite(node)) {
        api.applyUiSkinKeepingEditorSize(node, skinPath, width, height);
    }
    return node;
}

function ensureNodeChild(api: ProfileDaoYouRuntime, parent: Node, name: string, width: number, height: number, x: number, y: number): Node {
    let node = parent.getChildByName(name);
    if (!node?.isValid) {
        node = api.createNode(name, parent, width, height, x, y);
    } else {
        node.active = true;
        ensureEditorNodeSize(node, width, height);
    }
    return node;
}

function hideDecorativeSprite(node: Node): void {
    const sprite = node.getComponent(Sprite);
    if (!sprite) return;
    sprite.enabled = false;
    sprite.spriteFrame = null;
}

function ensureLabel(api: ProfileDaoYouRuntime, parent: Node, name: string, text: string, fontSize: number, x: number, y: number, width: number, height: number): Label {
    let node = parent.getChildByName(name);
    if (!node?.isValid) {
        return api.createLabel(parent, name, text, fontSize, x, y, width, height, Color.WHITE);
    }
    ensureEditorNodeSize(node, width, height);
    let label = node.getComponent(Label);
    if (!label) {
        label = node.addComponent(Label);
        label.fontSize = fontSize;
        label.lineHeight = fontSize + 8;
        applySimKaiFont(label);
    }
    label.string = text;
    return label;
}

function ensureStyledLabel(
    api: ProfileDaoYouRuntime,
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
    const hadLabel = !!parent.getChildByName(name)?.getComponent(Label);
    const label = ensureLabel(api, parent, name, text, fontSize, x, y, width, height);
    if (!hadLabel) styleLabel(label, color, align, outlineWidth);
    return label;
}

function createStyledLabel(
    api: ProfileDaoYouRuntime,
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
): Node {
    const label = api.createLabel(parent, name, text, fontSize, x, y, width, height, color);
    styleLabel(label, color, align, outlineWidth);
    return label.node;
}

function styleLabel(label: Label, color: Color, align: HorizontalTextAlignment, outlineWidth: number): void {
    applySimKaiFont(label);
    label.color = color;
    label.horizontalAlign = align;
    label.verticalAlign = VerticalTextAlignment.CENTER;
    label.overflow = Overflow.SHRINK;
    label.enableWrapText = false;
    label.enableOutline = outlineWidth > 0;
    label.outlineColor = new Color(43, 34, 25, 255);
    label.outlineWidth = outlineWidth;
}

function setNodeSize(node: Node, width: number, height: number): void {
    (node.getComponent(UITransform) || node.addComponent(UITransform)).setContentSize(width, height);
}

function flattenLegacyRowSkin(row: Node): void {
    const legacyBox = row.getChildByName('ProfileDaoYouRowSkin');
    if (!legacyBox?.isValid) return;

    [...legacyBox.children].forEach((child) => child.setParent(row));
    legacyBox.removeFromParent();
    legacyBox.destroy();
}

function setProfilePopupBoardVisible(api: ProfileDaoYouRuntime, visible: boolean): void {
    const root = getProfilePopupRoot(api, false);
    const board = api.profilePopupBoard?.isValid
        ? api.profilePopupBoard
        : root?.getChildByName('ProfilePopupBoard') || null;
    if (board?.isValid) {
        board.active = visible;
    }
}

function getTabConfig(tab: ProfileDaoYouTabId): typeof HomeConfig.PROFILE_DAOYOU_TABS[number] {
    return HomeConfig.PROFILE_DAOYOU_TABS.find((config) => config.id === tab) || HomeConfig.PROFILE_DAOYOU_TABS[0];
}

function findPanelFromTab(tabNode: Node): Node | null {
    let cursor: Node | null = tabNode;
    while (cursor) {
        if (cursor.name === PANEL_NAME) return cursor;
        cursor = cursor.parent;
    }
    return null;
}
