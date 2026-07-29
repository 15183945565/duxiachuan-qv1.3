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

type ProfileDaoYouTabId = typeof HomeConfig.PROFILE_DAOYOU_TABS[number]['id'];
type ProfileDaoYouMember = typeof HomeConfig.PROFILE_DAOYOU_MEMBERS_BY_TAB[ProfileDaoYouTabId][number];

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
    refreshRootLayerOrder(): void;
}

const PANEL_NAME = 'ProfileDaoYouPanel';
const ROW_TEMPLATE_NAME = 'ProfileDaoYouRowTemplate';
const DEFAULT_TAB: ProfileDaoYouTabId = 'chief';

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

    const tabs = api.createNode('ProfileDaoYouTabs', panel, 340, 64, 0, 520);
    tabs.setSiblingIndex(4);
    createTabNode(api, tabs, 'chief', -88);
    createTabNode(api, tabs, 'generation', 88);

    createStyledLabel(api, panel, 'ProfileDaoYouCountLabel', '', 25, 0, 455, 360, 44, new Color(102, 62, 35, 255), HorizontalTextAlignment.CENTER, 1).setSiblingIndex(5);
    api.createSkinnedNode('ProfileDaoYouBoard', panel, HomeConfig.PROFILE_DAOYOU_BOARD_WIDTH, HomeConfig.PROFILE_DAOYOU_BOARD_HEIGHT, 0, -168, HomeConfig.UI_PROFILE_DAOYOU_BOARD).setSiblingIndex(6);

    const scroll = api.createNode('ProfileDaoYouScrollView', panel, HomeConfig.PROFILE_DAOYOU_SCROLL_WIDTH, HomeConfig.PROFILE_DAOYOU_SCROLL_HEIGHT, 0, -168);
    scroll.setSiblingIndex(7);
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
    ensureSkinnedChild(api, panel, 'ProfileDaoYouBoard', HomeConfig.PROFILE_DAOYOU_BOARD_WIDTH, HomeConfig.PROFILE_DAOYOU_BOARD_HEIGHT, 0, -168, HomeConfig.UI_PROFILE_DAOYOU_BOARD);

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
    createOrRefreshTab(api, tabs, 'chief', -88);
    createOrRefreshTab(api, tabs, 'generation', 88);

    let scroll = api.findNode('ProfileDaoYouScrollView', panel);
    if (!scroll?.isValid) {
        scroll = api.createNode('ProfileDaoYouScrollView', panel, HomeConfig.PROFILE_DAOYOU_SCROLL_WIDTH, HomeConfig.PROFILE_DAOYOU_SCROLL_HEIGHT, 0, -168);
    } else {
        ensureEditorNodeSize(scroll, HomeConfig.PROFILE_DAOYOU_SCROLL_WIDTH, HomeConfig.PROFILE_DAOYOU_SCROLL_HEIGHT);
    }

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
    const contentHeight = Math.max(
        currentContentSize.height,
        visibleSize.height,
        members.length * HomeConfig.PROFILE_DAOYOU_ROW_HEIGHT + Math.max(0, members.length - 1) * HomeConfig.PROFILE_DAOYOU_ROW_GAP + 18,
    );
    setNodeSize(content, Math.max(currentContentSize.width, visibleSize.width), contentHeight);
    template.active = false;

    members.forEach((member, index) => {
        const rowName = `ProfileDaoYouRow_${member.id}`;
        let row = content.getChildByName(rowName);
        if (!row?.isValid) {
            row = instantiate(template);
            row.name = rowName;
            row.setParent(content);
            row.setPosition(0, getFallbackRowY(content, contentHeight, members, index), 0);
        }
        row.active = true;
        fillProfileDaoYouRow(api, row, member);
    });
}

function createRowTemplate(api: ProfileDaoYouRuntime, parent: Node): Node {
    const row = api.createSkinnedNode(ROW_TEMPLATE_NAME, parent, HomeConfig.PROFILE_DAOYOU_ROW_WIDTH, HomeConfig.PROFILE_DAOYOU_ROW_HEIGHT, 0, 0, HomeConfig.UI_PROFILE_DAOYOU_ROW_BG);
    row.active = false;
    api.createSkinnedNode('ProfileDaoYouAvatarFrame', row, 86, 86, -246, 0, HomeConfig.UI_HOME_PROFILE_FRAME).setSiblingIndex(0);
    api.createSkinnedNode('ProfileDaoYouAvatarIcon', row, 74, 74, -246, 0, HomeConfig.UI_HOME_AVATAR).setSiblingIndex(1);
    createStyledLabel(api, row, 'ProfileDaoYouRowName', '', 26, -54, 22, 288, 36, new Color(82, 55, 42, 255), HorizontalTextAlignment.LEFT, 0).setSiblingIndex(2);
    createStyledLabel(api, row, 'ProfileDaoYouRowLevel', '', 20, -54, -22, 288, 30, new Color(181, 54, 63, 255), HorizontalTextAlignment.LEFT, 0).setSiblingIndex(3);
    api.createSkinnedNode('ProfileDaoYouYuanbaoIcon', row, 44, 44, 150, 0, HomeConfig.UI_HOME_JIFEN_ICON).setSiblingIndex(4);
    createStyledLabel(api, row, 'ProfileDaoYouYuanbaoLabel', '', 25, 240, 0, 110, 40, new Color(93, 65, 42, 255), HorizontalTextAlignment.LEFT, 0).setSiblingIndex(5);
    return row;
}

function getFallbackRowY(content: Node, contentHeight: number, members: readonly ProfileDaoYouMember[], index: number): number {
    const rowStep = HomeConfig.PROFILE_DAOYOU_ROW_HEIGHT + HomeConfig.PROFILE_DAOYOU_ROW_GAP;
    for (let previousIndex = index - 1; previousIndex >= 0; previousIndex -= 1) {
        const previous = content.getChildByName(`ProfileDaoYouRow_${members[previousIndex].id}`);
        if (previous?.isValid) {
            return previous.position.y - rowStep * (index - previousIndex);
        }
    }
    for (let nextIndex = index + 1; nextIndex < members.length; nextIndex += 1) {
        const next = content.getChildByName(`ProfileDaoYouRow_${members[nextIndex].id}`);
        if (next?.isValid) {
            return next.position.y + rowStep * (nextIndex - index);
        }
    }
    return contentHeight / 2 - HomeConfig.PROFILE_DAOYOU_ROW_HEIGHT / 2 - 9 - index * rowStep;
}

function fillProfileDaoYouRow(api: ProfileDaoYouRuntime, row: Node, member: ProfileDaoYouMember): void {
    flattenLegacyRowSkin(row);
    ensureEditorNodeSize(row, HomeConfig.PROFILE_DAOYOU_ROW_WIDTH, HomeConfig.PROFILE_DAOYOU_ROW_HEIGHT);
    if (needsFallbackSprite(row)) {
        api.applyUiSkinKeepingEditorSize(row, HomeConfig.UI_PROFILE_DAOYOU_ROW_BG, HomeConfig.PROFILE_DAOYOU_ROW_WIDTH, HomeConfig.PROFILE_DAOYOU_ROW_HEIGHT);
    }
    ensureSkinnedChild(api, row, 'ProfileDaoYouAvatarFrame', 86, 86, -246, 0, HomeConfig.UI_HOME_PROFILE_FRAME);
    ensureSkinnedChild(api, row, 'ProfileDaoYouAvatarIcon', 74, 74, -246, 0, HomeConfig.UI_HOME_AVATAR);
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
