import {
    Color,
    EventTouch,
    HorizontalTextAlignment,
    instantiate,
    Label,
    Mask,
    Node,
    Overflow,
    ScrollView,
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

type ProfileBillRecord = typeof HomeConfig.PROFILE_BILL_RECORDS[number];
type ProfileBillType = 'income' | 'expense';

interface ProfileBillRuntime {
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
    refreshRootLayerOrder(): void;
}

const PANEL_NAME = 'ProfileBillPanel';
const ROW_TEMPLATE_NAME = 'ProfileBillRowTemplate';
const TITLE_COLOR = new Color(79, 64, 43, 255);
const ROW_TITLE_COLOR = new Color(31, 31, 26, 255);
const ROW_TIME_COLOR = new Color(143, 139, 130, 255);
const YUANBAO_COLOR = new Color(42, 170, 48, 255);
const YUANBAO_EXPENSE_COLOR = new Color(207, 50, 42, 255);
const LIGHT_OUTLINE = new Color(246, 245, 235, 255);
const BILL_TAB_ACTIVE_LABEL_COLOR = new Color(255, 248, 218, 255);
const BILL_TAB_INACTIVE_LABEL_COLOR = new Color(238, 225, 198, 255);
const billTabSelections = new WeakMap<ProfileBillRuntime, ProfileBillType>();
const PROFILE_BILL_TABS: ReadonlyArray<{ id: ProfileBillType; label: string; x: number }> = [
    { id: 'income', label: '\u6536\u5165', x: HomeConfig.PROFILE_BILL_INCOME_TAB_X },
    { id: 'expense', label: '\u652f\u51fa', x: HomeConfig.PROFILE_BILL_EXPENSE_TAB_X },
];

export function openProfileBillPanel(host: HomeViewBase): void {
    const api = host as unknown as ProfileBillRuntime;
    const panel = ensureProfileBillPanel(api);
    panel.active = true;
    setProfilePopupBoardVisible(api, false);
    api.ensureInputBlocker(panel, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT);
    panel.setSiblingIndex((panel.parent?.children.length || 1) - 1);
    if (!billTabSelections.has(api)) {
        billTabSelections.set(api, 'income');
    }
    bindProfileBillPanel(api, panel);
    refreshProfileBillRows(api, panel);
    api.refreshRootLayerOrder();
}

export function closeProfileBillPanel(host: HomeViewBase): void {
    const api = host as unknown as ProfileBillRuntime;
    const panel = findProfileBillPanel(api);
    if (panel?.isValid) {
        panel.active = false;
    }
    setProfilePopupBoardVisible(api, true);
}

function ensureProfileBillPanel(api: ProfileBillRuntime): Node {
    const root = getProfilePopupRoot(api);
    let panel = api.findNode(PANEL_NAME, root);
    if (!panel?.isValid) {
        panel = buildProfileBillPanel(api, root);
    }
    bindProfileBillPanel(api, panel);
    return panel;
}

function findProfileBillPanel(api: ProfileBillRuntime): Node | null {
    const root = getProfilePopupRoot(api, false);
    return root ? api.findNode(PANEL_NAME, root) : null;
}

function getProfilePopupRoot(api: ProfileBillRuntime, required = true): Node {
    const root = api.profilePopupRoot?.isValid
        ? api.profilePopupRoot
        : api.findNode('ProfilePopup', api.popupRoot || api.uiHudLayer || api.node);
    if (!root && required) {
        throw new Error('[MainHomeView] ProfilePopup is required before opening bill panel');
    }
    return root || api.node;
}

function buildProfileBillPanel(api: ProfileBillRuntime, root: Node): Node {
    const panel = api.createNode(PANEL_NAME, root, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT, 0, 0);
    panel.active = false;
    api.createSkinnedNode('ProfileBillBg', panel, HomeConfig.PROFILE_BILL_BG_WIDTH, HomeConfig.PROFILE_BILL_BG_HEIGHT, 0, 0, HomeConfig.UI_PROFILE_BILL_BG).setSiblingIndex(0);
    api.createSkinnedNode('ProfileBillBackButton', panel, HomeConfig.BOTTOM_ENTRY_BACK_BUTTON_WIDTH, HomeConfig.BOTTOM_ENTRY_BACK_BUTTON_HEIGHT, -310, 694, HomeConfig.UI_RANK_BACK).setSiblingIndex(1);
    createStyledLabel(api, panel, 'ProfileBillTitleLabel', '\u5143\u5b9d\u8d26\u5355', 42, 0, 680, 260, 66, TITLE_COLOR, HorizontalTextAlignment.CENTER, 1).setSiblingIndex(2);
    const tabs = api.createNode('ProfileBillTabs', panel, 240, 60, 0, HomeConfig.PROFILE_BILL_TAB_Y);
    tabs.setSiblingIndex(3);
    createOrRefreshBillTabs(api, panel);

    const scroll = api.createNode('ProfileBillScrollView', panel, HomeConfig.PROFILE_BILL_SCROLL_WIDTH, HomeConfig.PROFILE_BILL_SCROLL_HEIGHT, 0, HomeConfig.PROFILE_BILL_SCROLL_Y);
    scroll.setSiblingIndex(4);
    const content = api.createNode('ProfileBillScrollContent', scroll, HomeConfig.PROFILE_BILL_SCROLL_WIDTH, HomeConfig.PROFILE_BILL_SCROLL_HEIGHT, 0, 0);
    createRowTemplate(api, content);
    setupProfileBillScrollView(scroll, content);
    return panel;
}

function bindProfileBillPanel(api: ProfileBillRuntime, panel: Node): void {
    api.ensureInputBlocker(panel, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT);
    panel.off(Node.EventType.TOUCH_END);
    panel.on(Node.EventType.TOUCH_END, (event: EventTouch) => {
        event.propagationStopped = true;
    });

    ensureSkinnedChild(api, panel, 'ProfileBillBg', HomeConfig.PROFILE_BILL_BG_WIDTH, HomeConfig.PROFILE_BILL_BG_HEIGHT, 0, 0, HomeConfig.UI_PROFILE_BILL_BG);
    const back = ensureSkinnedChild(api, panel, 'ProfileBillBackButton', HomeConfig.BOTTOM_ENTRY_BACK_BUTTON_WIDTH, HomeConfig.BOTTOM_ENTRY_BACK_BUTTON_HEIGHT, -310, 694, HomeConfig.UI_RANK_BACK);
    api.bindScaledClick(back, () => closeProfileBillPanel(api as unknown as HomeViewBase));
    ensureStyledLabel(api, panel, 'ProfileBillTitleLabel', '\u5143\u5b9d\u8d26\u5355', 42, 0, 680, 260, 66, TITLE_COLOR, HorizontalTextAlignment.CENTER, 1);
    createOrRefreshBillTabs(api, panel);

    let scroll = api.findNode('ProfileBillScrollView', panel);
    if (!scroll?.isValid) {
        scroll = api.createNode('ProfileBillScrollView', panel, HomeConfig.PROFILE_BILL_SCROLL_WIDTH, HomeConfig.PROFILE_BILL_SCROLL_HEIGHT, 0, HomeConfig.PROFILE_BILL_SCROLL_Y);
    } else {
        ensureEditorNodeSize(scroll, HomeConfig.PROFILE_BILL_SCROLL_WIDTH, HomeConfig.PROFILE_BILL_SCROLL_HEIGHT);
    }

    const scrollSize = getEditorNodeSize(scroll, HomeConfig.PROFILE_BILL_SCROLL_WIDTH, HomeConfig.PROFILE_BILL_SCROLL_HEIGHT);
    let content = api.findNode('ProfileBillScrollContent', scroll);
    if (!content?.isValid) {
        content = api.createNode('ProfileBillScrollContent', scroll, scrollSize.width, scrollSize.height, 0, 0);
    }
    if (!content.getChildByName(ROW_TEMPLATE_NAME)?.isValid) {
        createRowTemplate(api, content);
    }
    setupProfileBillScrollView(scroll, content);
    refreshProfileBillTabs(api, panel, getSelectedBillType(api));
}

function refreshProfileBillRows(api: ProfileBillRuntime, panel: Node): void {
    const scroll = api.findNode('ProfileBillScrollView', panel);
    const content = scroll ? api.findNode('ProfileBillScrollContent', scroll) : null;
    const template = content?.getChildByName(ROW_TEMPLATE_NAME);
    if (!content?.isValid || !template?.isValid) return;

    content.children
        .filter((child) => child.name.startsWith('ProfileBillRow_'))
        .forEach((child) => {
            child.active = false;
        });

    const visibleSize = getEditorNodeSize(content.parent, HomeConfig.PROFILE_BILL_SCROLL_WIDTH, HomeConfig.PROFILE_BILL_SCROLL_HEIGHT);
    const currentContentSize = getEditorNodeSize(content, visibleSize.width, visibleSize.height);
    const rowStep = HomeConfig.PROFILE_BILL_ROW_HEIGHT + HomeConfig.PROFILE_BILL_ROW_GAP;
    const billType = getSelectedBillType(api);
    const records = HomeConfig.PROFILE_BILL_RECORDS;
    const contentHeight = Math.max(
        visibleSize.height,
        records.length * rowStep + HomeConfig.PROFILE_BILL_ROW_TOP_PADDING,
    );
    setNodeSize(content, Math.max(currentContentSize.width, visibleSize.width), contentHeight);
    template.active = false;

    const topY = contentHeight / 2 - HomeConfig.PROFILE_BILL_ROW_HEIGHT / 2 - HomeConfig.PROFILE_BILL_ROW_TOP_PADDING;
    records.forEach((record, index) => {
        const rowName = `ProfileBillRow_${record.id}`;
        let row = content.getChildByName(rowName);
        if (!row?.isValid) {
            row = instantiate(template);
            row.name = rowName;
            row.setParent(content);
        }
        row.setPosition(row.position.x, topY - index * rowStep, row.position.z);
        row.active = true;
        fillProfileBillRow(api, row, record, billType);
    });
    scroll.getComponent(ScrollView)?.scrollToTop(0.01);
}

function getSelectedBillType(api: ProfileBillRuntime): ProfileBillType {
    return billTabSelections.get(api) || 'income';
}

function selectProfileBillTab(api: ProfileBillRuntime, panel: Node, type: ProfileBillType): void {
    billTabSelections.set(api, type);
    refreshProfileBillTabs(api, panel, type);
    refreshProfileBillRows(api, panel);
}

function createOrRefreshBillTabs(api: ProfileBillRuntime, panel: Node): Node {
    let tabs = api.findNode('ProfileBillTabs', panel);
    if (!tabs?.isValid) {
        tabs = api.createNode('ProfileBillTabs', panel, 240, 60, 0, HomeConfig.PROFILE_BILL_TAB_Y);
    } else {
        ensureEditorNodeSize(tabs, 240, 60);
    }

    PROFILE_BILL_TABS.forEach((config) => {
        const nodeName = `ProfileBillTab_${config.id}`;
        let tabNode = tabs.getChildByName(nodeName);
        if (!tabNode?.isValid) {
            tabNode = api.createSkinnedNode(
                nodeName,
                tabs,
                HomeConfig.PROFILE_BILL_TAB_WIDTH,
                HomeConfig.PROFILE_BILL_TAB_HEIGHT,
                config.x,
                0,
                HomeConfig.UI_PROFILE_BILL_TAB_INACTIVE,
            );
        } else {
            ensureEditorNodeSize(tabNode, HomeConfig.PROFILE_BILL_TAB_WIDTH, HomeConfig.PROFILE_BILL_TAB_HEIGHT);
        }
        ensureStyledLabel(
            api,
            tabNode,
            `${nodeName}Label`,
            config.label,
            24,
            0,
            1,
            HomeConfig.PROFILE_BILL_TAB_WIDTH - 12,
            HomeConfig.PROFILE_BILL_TAB_HEIGHT - 8,
            BILL_TAB_INACTIVE_LABEL_COLOR,
            HorizontalTextAlignment.CENTER,
            1,
        );
        api.bindScaledClick(tabNode, () => selectProfileBillTab(api, panel, config.id));
    });

    return tabs;
}

function refreshProfileBillTabs(api: ProfileBillRuntime, panel: Node, activeType: ProfileBillType): void {
    const tabs = api.findNode('ProfileBillTabs', panel);
    if (!tabs?.isValid) return;

    PROFILE_BILL_TABS.forEach((config) => {
        const tabNode = tabs.getChildByName(`ProfileBillTab_${config.id}`);
        if (!tabNode?.isValid) return;
        const selected = config.id === activeType;
        api.applyUiSkinKeepingEditorSize(
            tabNode,
            selected ? HomeConfig.UI_PROFILE_BILL_TAB_ACTIVE : HomeConfig.UI_PROFILE_BILL_TAB_INACTIVE,
            HomeConfig.PROFILE_BILL_TAB_WIDTH,
            HomeConfig.PROFILE_BILL_TAB_HEIGHT,
        );
        const label = tabNode.getChildByName(`ProfileBillTab_${config.id}Label`)?.getComponent(Label);
        if (!label) return;
        styleLabel(
            label,
            selected ? BILL_TAB_ACTIVE_LABEL_COLOR : BILL_TAB_INACTIVE_LABEL_COLOR,
            HorizontalTextAlignment.CENTER,
            selected ? 2 : 1,
        );
        label.string = config.label;
        label.fontSize = 24;
        label.lineHeight = 32;
    });
}

function createRowTemplate(api: ProfileBillRuntime, parent: Node): Node {
    const row = api.createNode(ROW_TEMPLATE_NAME, parent, HomeConfig.PROFILE_BILL_ROW_WIDTH, HomeConfig.PROFILE_BILL_ROW_HEIGHT, 0, 0);
    row.active = false;
    createStyledLabel(api, row, 'ProfileBillRowTitle', '', 26, -155, 16, 420, 38, ROW_TITLE_COLOR, HorizontalTextAlignment.LEFT, 3).setSiblingIndex(0);
    api.createSkinnedNode('ProfileBillYuanbaoIcon', row, 38, 38, 184, 17, HomeConfig.UI_HOME_JIFEN_ICON).setSiblingIndex(1);
    createStyledLabel(api, row, 'ProfileBillYuanbaoLabel', '', 28, 254, 17, 128, 40, YUANBAO_COLOR, HorizontalTextAlignment.LEFT, 2).setSiblingIndex(2);
    createStyledLabel(api, row, 'ProfileBillTimeLabel', '', 23, 178, -24, 286, 34, ROW_TIME_COLOR, HorizontalTextAlignment.RIGHT, 0).setSiblingIndex(3);
    api.createSkinnedNode('ProfileBillDivider', row, HomeConfig.PROFILE_BILL_ROW_WIDTH, 4, 0, -42, HomeConfig.UI_PROFILE_BILL_DIVIDER).setSiblingIndex(4);
    return row;
}

function fillProfileBillRow(api: ProfileBillRuntime, row: Node, record: ProfileBillRecord, billType: ProfileBillType): void {
    const amountPrefix = billType === 'expense' ? '-' : '+';
    const amountColor = billType === 'expense' ? YUANBAO_EXPENSE_COLOR : YUANBAO_COLOR;
    ensureEditorNodeSize(row, HomeConfig.PROFILE_BILL_ROW_WIDTH, HomeConfig.PROFILE_BILL_ROW_HEIGHT);
    ensureStyledLabel(api, row, 'ProfileBillRowTitle', record.title, 26, -155, 16, 420, 38, ROW_TITLE_COLOR, HorizontalTextAlignment.LEFT, 3).string = record.title;
    ensureSkinnedChild(api, row, 'ProfileBillYuanbaoIcon', 38, 38, 184, 17, HomeConfig.UI_HOME_JIFEN_ICON);
    ensureStyledLabel(api, row, 'ProfileBillYuanbaoLabel', `${amountPrefix}${record.yuanbao}`, 28, 254, 17, 128, 40, amountColor, HorizontalTextAlignment.LEFT, 2).string = `${amountPrefix}${record.yuanbao}`;
    ensureStyledLabel(api, row, 'ProfileBillTimeLabel', record.time, 23, 178, -24, 286, 34, ROW_TIME_COLOR, HorizontalTextAlignment.RIGHT, 0).string = record.time;
    ensureSkinnedChild(api, row, 'ProfileBillDivider', HomeConfig.PROFILE_BILL_ROW_WIDTH, 4, 0, -42, HomeConfig.UI_PROFILE_BILL_DIVIDER);
}

function setupProfileBillScrollView(scrollNode: Node, content: Node): void {
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

function ensureSkinnedChild(api: ProfileBillRuntime, parent: Node, name: string, width: number, height: number, x: number, y: number, skinPath: string): Node {
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

function ensureStyledLabel(
    api: ProfileBillRuntime,
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
        ensureEditorNodeSize(label.node, width, height);
    }
    label.node.active = true;
    styleLabel(label, color, align, outlineWidth);
    label.string = text;
    label.fontSize = fontSize;
    label.lineHeight = fontSize + 8;
    return label;
}

function createStyledLabel(
    api: ProfileBillRuntime,
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
    label.outlineColor = LIGHT_OUTLINE;
    label.outlineWidth = outlineWidth;
}

function setNodeSize(node: Node, width: number, height: number): void {
    (node.getComponent(UITransform) || node.addComponent(UITransform)).setContentSize(width, height);
}

function setProfilePopupBoardVisible(api: ProfileBillRuntime, visible: boolean): void {
    const root = getProfilePopupRoot(api, false);
    const board = api.profilePopupBoard?.isValid
        ? api.profilePopupBoard
        : root?.getChildByName('ProfilePopupBoard') || null;
    if (board?.isValid) {
        board.active = visible;
    }
}
