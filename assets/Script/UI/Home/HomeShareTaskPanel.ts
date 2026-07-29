import {
    Color,
    HorizontalTextAlignment,
    Label,
    Mask,
    Node,
    Overflow,
    ScrollView,
    Sprite,
    UIOpacity,
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
import { openProfileDaoYouPanel } from './HomeProfileDaoYouPanel';
import type { HomeViewBase } from './HomeViewBase';

type ShareTask = typeof HomeConfig.SHARE_TASKS[number];

interface ShareTaskRuntime {
    claimedShareTaskIds: Set<string>;
    findNode(name: string, root?: Node): Node | null;
    createNode(name: string, parent: Node, width: number, height: number, x: number, y: number): Node;
    createSkinnedNode(name: string, parent: Node, width: number, height: number, x: number, y: number, skinPath: string, fallbackColor?: Color): Node;
    createLabel(parent: Node, name: string, text: string, fontSize: number, x: number, y: number, width: number, height: number, color: Color): Label;
    applyUiSkinKeepingEditorSize(node: Node, skinPath: string, fallbackWidth: number, fallbackHeight: number): void;
    bindScaledClick(node: Node, onClick: () => void): void;
    openSharedFlowPopup(popupName: string, content?: { title?: string; message?: string }): void;
    showToast(message: string): void;
    refreshRootLayerOrder(): void;
    openProfilePopup?: () => void;
}

const ROW_W = 609;
const ROW_H = 113;
const ROW_GAP = 16;
const VIEW_W = 650;
const VIEW_H = 760;

export function bindShareTaskPanel(host: HomeViewBase, panel: Node): void {
    const api = host as unknown as ShareTaskRuntime;
    ensureShareTaskLayout(api, panel);
    HomeConfig.SHARE_TASKS.forEach((task) => {
        const button = api.findNode(`ShareTaskActionButton_${task.id}`, panel);
        if (button) api.bindScaledClick(button, () => handleShareTaskAction(host, panel, task.id));
    });
    refreshShareTaskPanel(host, panel);
}

export function handleShareTaskAction(host: HomeViewBase, panel: Node, taskId?: string): void {
    const api = host as unknown as ShareTaskRuntime;
    const task = findShareTask(taskId);
    if (!task) return;
    if (api.claimedShareTaskIds.has(task.id)) {
        api.showToast('\u8be5\u5206\u4eab\u4efb\u52a1\u5df2\u9886\u53d6');
        return;
    }
    if (getShareTaskProgress(task) >= task.requiredCount) {
        claimShareTaskReward(host, panel, task.id);
        return;
    }
    panel.active = false;
    api.openProfilePopup?.();
    openProfileDaoYouPanel(host);
    api.showToast('\u8bf7\u7ee7\u7eed\u57f9\u517b\u9053\u53cb\u5b8c\u6210\u5206\u4eab\u4efb\u52a1');
}

export function claimShareTaskReward(host: HomeViewBase, panel: Node, taskId?: string): void {
    const api = host as unknown as ShareTaskRuntime;
    const task = findShareTask(taskId);
    if (!task) return;
    if (api.claimedShareTaskIds.has(task.id)) {
        api.showToast('\u8be5\u5206\u4eab\u4efb\u52a1\u5df2\u9886\u53d6');
        return;
    }
    if (getShareTaskProgress(task) < task.requiredCount) {
        api.showToast('\u5206\u4eab\u4efb\u52a1\u672a\u5b8c\u6210');
        return;
    }
    api.claimedShareTaskIds.add(task.id);
    refreshShareTaskPanel(host, panel);
    api.openSharedFlowPopup('RewardPopup', {
        title: '\u5206\u4eab\u4efb\u52a1',
        message: `\u5df2\u9886\u53d6 ${formatReward(task.reward)} \u5143\u5b9d`,
    });
}

export function refreshShareTaskPanel(host: HomeViewBase, panel: Node): void {
    const api = host as unknown as ShareTaskRuntime;
    HomeConfig.SHARE_TASKS.forEach((task) => {
        const progress = Math.min(getShareTaskProgress(task), task.requiredCount);
        const done = progress >= task.requiredCount;
        const claimed = api.claimedShareTaskIds.has(task.id);
        setLabel(api.findNode(`ShareTaskProgressLabel_${task.id}`, panel), `${progress}/${task.requiredCount}`);
        setLabel(api.findNode(`ShareTaskActionLabel_${task.id}`, panel), claimed ? '\u5df2\u9886\u53d6' : done ? '\u9886\u53d6' : '\u524d\u5f80');
        const fill = api.findNode(`ShareTaskProgressFill_${task.id}`, panel);
        if (fill) {
            const transform = fill.getComponent(UITransform) || fill.addComponent(UITransform);
            const currentSize = transform.contentSize;
            const progressBgSize = getEditorNodeSize(fill.parent, 300, 18);
            const maxWidth = Math.max(0, progressBgSize.width - 14);
            const ratio = Math.max(0, Math.min(1, progress / task.requiredCount));
            const width = ratio * maxWidth;
            transform.setContentSize(width, currentSize.height > 0 ? currentSize.height : 17);
            (fill.getComponent(UIOpacity) || fill.addComponent(UIOpacity)).opacity = ratio > 0 ? 255 : 0;
        }
        const button = api.findNode(`ShareTaskActionButton_${task.id}`, panel);
        const sprite = button?.getComponent(Sprite);
        if (sprite) sprite.color = claimed ? new Color(150, 140, 125, 255) : Color.WHITE;
    });
}

function ensureShareTaskLayout(api: ShareTaskRuntime, panel: Node): void {
    ensureSkin(api, panel, 'SharePageBackground', HomeConfig.VIEW_WIDTH, 1667, 0, 0, HomeConfig.UI_SHARE_PAGE_BG).setSiblingIndex(0);
    ensureSkin(api, panel, 'ShareClose', HomeConfig.BOTTOM_ENTRY_BACK_BUTTON_WIDTH, HomeConfig.BOTTOM_ENTRY_BACK_BUTTON_HEIGHT, -300, 694, HomeConfig.UI_RANK_BACK).setSiblingIndex(1);
    ensureSkin(api, panel, 'ShareTaskTitleBg', 486, 84, 0, 662, HomeConfig.UI_SHARE_TITLE_BG).setSiblingIndex(2);
    ensureStyledLabel(
        api,
        panel,
        'ShareTaskTitleLabel',
        '\u5206\u4eab\u4efb\u52a1',
        38,
        0,
        664,
        300,
        64,
        new Color(255, 239, 185, 255),
        HorizontalTextAlignment.CENTER,
        2,
    );
    const board = ensureSkin(api, panel, 'ShareTaskBoard', 701, 835, 0, -166, HomeConfig.UI_SHARE_BOARD);
    board.setSiblingIndex(3);
    const view = ensureNode(api, board, 'ShareTaskScrollView', VIEW_W, VIEW_H, 0, 0);
    const contentH = Math.max(VIEW_H, HomeConfig.SHARE_TASKS.length * ROW_H + (HomeConfig.SHARE_TASKS.length - 1) * ROW_GAP + 20);
    const content = ensureNode(api, view, 'ShareTaskScrollContent', VIEW_W, contentH, 0, (VIEW_H - contentH) / 2);
    setupScroll(view, content);
    const topY = contentH / 2 - ROW_H / 2 - 10;
    HomeConfig.SHARE_TASKS.forEach((task, index) => ensureShareTaskRow(api, content, task, topY - index * (ROW_H + ROW_GAP)));
}

function ensureShareTaskRow(api: ShareTaskRuntime, parent: Node, task: ShareTask, y: number): void {
    const row = ensureSkin(api, parent, `ShareTaskRow_${task.id}`, ROW_W, ROW_H, 0, y, HomeConfig.UI_SHARE_TASK_ROW_BG);
    ensureSkin(api, row, `ShareTaskYuanbaoIcon_${task.id}`, 40, 37, -266, 13, HomeConfig.UI_SHARE_YUANBAO);
    ensureStyledLabel(
        api,
        row,
        `ShareTaskRewardLabel_${task.id}`,
        formatReward(task.reward),
        19,
        -266,
        -28,
        80,
        28,
        new Color(255, 238, 172, 255),
        HorizontalTextAlignment.CENTER,
        2,
    );
    ensureStyledLabel(
        api,
        row,
        `ShareTaskText_${task.id}`,
        `${task.requiredCount}\u4e2a${task.label}\u6218\u573a\u7b49\u7ea7\u8fbe\u5230${task.requiredLevel}\u7ea7`,
        22,
        -50,
        23,
        370,
        34,
        new Color(87, 62, 42, 255),
        HorizontalTextAlignment.LEFT,
        0,
    );
    const progressBg = ensureSkin(api, row, `ShareTaskProgressBg_${task.id}`, 300, 18, -50, -24, HomeConfig.UI_SHARE_PROGRESS_BG);
    const fillWasMissing = !progressBg.getChildByName(`ShareTaskProgressFill_${task.id}`);
    const fill = ensureSkin(api, progressBg, `ShareTaskProgressFill_${task.id}`, 286, 17, -143, 0, HomeConfig.UI_SHARE_PROGRESS_FILL);
    if (fillWasMissing) {
        (fill.getComponent(UITransform) || fill.addComponent(UITransform)).setAnchorPoint(0, 0.5);
    }
    ensureStyledLabel(
        api,
        progressBg,
        `ShareTaskProgressLabel_${task.id}`,
        '',
        17,
        0,
        0,
        300,
        24,
        Color.WHITE,
        HorizontalTextAlignment.CENTER,
        1,
    );
    const button = ensureSkin(api, row, `ShareTaskActionButton_${task.id}`, 132, 50, 225, 0, HomeConfig.UI_SHARE_BUTTON_BG);
    ensureStyledLabel(
        api,
        button,
        `ShareTaskActionLabel_${task.id}`,
        '\u524d\u5f80',
        24,
        0,
        0,
        116,
        42,
        new Color(84, 54, 28, 255),
        HorizontalTextAlignment.CENTER,
        1,
    );
}

function getShareTaskProgress(task: ShareTask): number {
    return HomeConfig.PROFILE_DAOYOU_MEMBERS_BY_TAB[task.tab].filter((member) => member.battleLevel >= task.requiredLevel).length;
}

function findShareTask(taskId?: string): ShareTask | undefined {
    return HomeConfig.SHARE_TASKS.find((task) => task.id === taskId);
}

function ensureNode(api: ShareTaskRuntime, parent: Node, name: string, width: number, height: number, x: number, y: number): Node {
    const existing = parent.getChildByName(name);
    if (existing?.isValid) {
        existing.active = true;
        ensureEditorNodeSize(existing, width, height);
        return existing;
    }
    return api.createNode(name, parent, width, height, x, y);
}

function ensureSkin(api: ShareTaskRuntime, parent: Node, name: string, width: number, height: number, x: number, y: number, path: string): Node {
    const existing = parent.getChildByName(name);
    const node = ensureNode(api, parent, name, width, height, x, y);
    if (!existing?.isValid || needsFallbackSprite(node)) {
        api.applyUiSkinKeepingEditorSize(node, path, width, height);
    }
    return node;
}

function ensureLabel(api: ShareTaskRuntime, parent: Node, name: string, text: string, fontSize: number, x: number, y: number, width: number, height: number): Label {
    const existingNode = parent.getChildByName(name);
    let label = existingNode?.getComponent(Label) || null;
    if (!label) {
        if (existingNode?.isValid) {
            label = existingNode.addComponent(Label);
            ensureEditorNodeSize(existingNode, width, height);
            label.fontSize = fontSize;
            label.lineHeight = fontSize + 8;
            applySimKaiFont(label);
        } else {
            label = api.createLabel(parent, name, text, fontSize, x, y, width, height, Color.WHITE);
        }
    } else {
        label.node.active = true;
        ensureEditorNodeSize(label.node, width, height);
    }
    label.string = text;
    return label;
}

function ensureStyledLabel(
    api: ShareTaskRuntime,
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

function styleLabel(label: Label, color: Color, align: HorizontalTextAlignment, outlineWidth: number): void {
    label.color = color;
    label.horizontalAlign = align;
    label.verticalAlign = VerticalTextAlignment.CENTER;
    label.overflow = Overflow.SHRINK;
    label.enableWrapText = false;
    label.enableOutline = outlineWidth > 0;
    label.outlineColor = new Color(72, 44, 24, 255);
    label.outlineWidth = outlineWidth;
}

function setupScroll(view: Node, content: Node): void {
    const mask = view.getComponent(Mask) || view.addComponent(Mask);
    mask.type = Mask.Type.GRAPHICS_RECT;
    const scroll = view.getComponent(ScrollView) || view.addComponent(ScrollView);
    scroll.content = content;
    scroll.horizontal = false;
    scroll.vertical = true;
    scroll.elastic = true;
    scroll.inertia = true;
}

function setLabel(node: Node | null, text: string): void {
    const label = node?.getComponent(Label);
    if (label) label.string = text;
}

function formatReward(reward: number): string {
    return Number.isInteger(reward) ? `${reward}` : `${reward}`;
}
