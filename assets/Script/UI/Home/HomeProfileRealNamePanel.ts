import {
    Color,
    EditBox,
    EventTouch,
    Graphics,
    HorizontalTextAlignment,
    Label,
    Node,
    Overflow,
    sys,
    UITransform,
    VerticalTextAlignment,
} from 'cc';
import { applySimKaiFont } from '../Common/UIFont';
import * as HomeConfig from './HomeConfig';
import { ensureEditorNodeSize, getEditorNodeSize } from './HomeEditorLayout';
import type { HomeViewBase } from './HomeViewBase';

interface ProfileRealNameRuntime {
    node: Node;
    profilePopupRoot?: Node | null;
    popupRoot?: Node | null;
    uiHudLayer?: Node | null;
    findNode(name: string, root?: Node): Node | null;
    createNode(name: string, parent: Node, width: number, height: number, x: number, y: number): Node;
    createSkinnedNode(name: string, parent: Node, width: number, height: number, x: number, y: number, skinPath: string, fallbackColor?: Color): Node;
    createLabel(parent: Node, name: string, text: string, fontSize: number, x: number, y: number, width: number, height: number, color: Color): Label;
    drawRect(node: Node, width: number, height: number, color: Color): Graphics;
    applyUiSkinKeepingEditorSize(node: Node, skinPath: string, fallbackWidth: number, fallbackHeight: number): void;
    bindScaledClick(node: Node, onClick: (event: EventTouch) => void): void;
    ensureInputBlocker(node: Node, width?: number, height?: number): void;
    showToast?(message: string): void;
    refreshRootLayerOrder(): void;
}

interface ProfileRealNameState {
    status: string;
    nameMasked: string;
    certificateMasked: string;
}

const PANEL_NAME = 'ProfileRealNamePopup';
const BOARD_NAME = 'ProfileRealNameBoard';
const TEXT_COLOR = new Color(105, 72, 48, 255);
const TITLE_COLOR = new Color(54, 91, 84, 255);
const INPUT_FILL_COLOR = new Color(255, 249, 229, 255);
const INPUT_STROKE_COLOR = new Color(198, 170, 128, 255);
const INPUT_TEXT_COLOR = new Color(105, 72, 48, 255);
const INPUT_PLACEHOLDER_COLOR = new Color(174, 135, 111, 255);

export function openProfileRealNamePanel(host: HomeViewBase): void {
    const api = host as unknown as ProfileRealNameRuntime;
    const panel = ensureProfileRealNamePanel(api);
    panel.active = true;
    api.ensureInputBlocker(panel, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT);
    panel.setSiblingIndex((panel.parent?.children.length || 1) - 1);
    bindProfileRealNamePanel(api, panel);
    refreshProfileRealNamePanel(api, panel);
    api.refreshRootLayerOrder();
}

export function closeProfileRealNamePanel(host: HomeViewBase): void {
    const api = host as unknown as ProfileRealNameRuntime;
    const panel = findProfileRealNamePanel(api);
    if (panel?.isValid) {
        panel.active = false;
    }
}

function ensureProfileRealNamePanel(api: ProfileRealNameRuntime): Node {
    const root = getProfilePopupRoot(api, true);
    let panel = root.getChildByName(PANEL_NAME);
    if (!panel?.isValid) {
        panel = api.createNode(PANEL_NAME, root, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT, 0, 0);
        buildProfileRealNamePanel(api, panel);
    } else {
        prepareProfileRealNamePanel(api, panel);
    }
    return panel;
}

function findProfileRealNamePanel(api: ProfileRealNameRuntime): Node | null {
    const root = getProfilePopupRoot(api, false);
    return root?.getChildByName(PANEL_NAME) || null;
}

function buildProfileRealNamePanel(api: ProfileRealNameRuntime, panel: Node): void {
    const mask = api.createNode('ProfileRealNameMask', panel, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT, 0, 0);
    api.ensureInputBlocker(mask, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT);
    api.drawRect(mask, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT, new Color(0, 0, 0, 120));

    const board = api.createSkinnedNode(
        BOARD_NAME,
        panel,
        HomeConfig.PROFILE_REAL_NAME_POPUP_WIDTH,
        HomeConfig.PROFILE_REAL_NAME_POPUP_HEIGHT,
        0,
        0,
        HomeConfig.UI_PROFILE_REAL_NAME_POPUP_BG,
    );
    board.setSiblingIndex(1);
    api.ensureInputBlocker(board, HomeConfig.PROFILE_REAL_NAME_POPUP_WIDTH, HomeConfig.PROFILE_REAL_NAME_POPUP_HEIGHT);

    buildProfileRealNameBoard(api, board);
}

function prepareProfileRealNamePanel(api: ProfileRealNameRuntime, panel: Node): void {
    const panelSize = getEditorNodeSize(panel, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT);
    api.ensureInputBlocker(panel, panelSize.width, panelSize.height);

    const mask = panel.getChildByName('ProfileRealNameMask');
    if (mask?.isValid) {
        const maskSize = getEditorNodeSize(mask, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT);
        api.ensureInputBlocker(mask, maskSize.width, maskSize.height);
        api.drawRect(mask, maskSize.width, maskSize.height, new Color(0, 0, 0, 120));
    }

    const board = panel.getChildByName(BOARD_NAME);
    if (!board?.isValid) {
        buildProfileRealNamePanel(api, panel);
        return;
    }

    const boardSize = getEditorNodeSize(board, HomeConfig.PROFILE_REAL_NAME_POPUP_WIDTH, HomeConfig.PROFILE_REAL_NAME_POPUP_HEIGHT);
    api.applyUiSkinKeepingEditorSize(board, HomeConfig.UI_PROFILE_REAL_NAME_POPUP_BG, boardSize.width, boardSize.height);
    api.ensureInputBlocker(board, boardSize.width, boardSize.height);
    prepareProfileRealNameBoard(api, board);
}

function prepareProfileRealNameBoard(api: ProfileRealNameRuntime, board: Node): void {
    prepareSkinnedChild(api, board, 'ProfileRealNameClose', 56, 64, 238, 258, HomeConfig.UI_PROFILE_REAL_NAME_CLOSE).setSiblingIndex(20);

    prepareLabel(api, board, 'ProfileRealNameTitle', '\u5b9e\u540d\u8ba4\u8bc1', 42, 0, 234, 300, 58, TITLE_COLOR, HorizontalTextAlignment.CENTER, 0);
    prepareLabel(api, board, 'ProfileRealNameStatus', '', 25, 0, 171, 380, 36, TEXT_COLOR, HorizontalTextAlignment.CENTER, 0);
    prepareLabel(api, board, 'ProfileRealNameNameValue', '', 25, 0, 137, 380, 36, TEXT_COLOR, HorizontalTextAlignment.CENTER, 0);
    prepareLabel(api, board, 'ProfileRealNameCertificateValue', '', 25, 0, 103, 430, 36, TEXT_COLOR, HorizontalTextAlignment.CENTER, 0);

    prepareInputRow(api, board, 'Name', '\u59d3\u540d', '\u8bf7\u8f93\u5165\u771f\u5b9e\u59d3\u540d', 30, 12, false);
    prepareInputRow(api, board, 'Certificate', '\u8bc1\u4ef6\u53f7', '\u8bf7\u8f93\u5165\u8eab\u4efd\u8bc1\u53f7', -58, 18, true);

    const refreshButton = prepareSkinnedChild(api, board, 'ProfileRealNameRefreshButton', 162, 62, -104, -248, HomeConfig.UI_PROFILE_REAL_NAME_BUTTON_BG);
    prepareLabel(api, refreshButton, 'ProfileRealNameRefreshButtonLabel', '\u5237\u65b0\u72b6\u6001', 27, 0, 2, 132, 40, Color.WHITE, HorizontalTextAlignment.CENTER, 2);

    const submitButton = prepareSkinnedChild(api, board, 'ProfileRealNameSubmitButton', 162, 62, 104, -248, HomeConfig.UI_PROFILE_REAL_NAME_BUTTON_BG);
    prepareLabel(api, submitButton, 'ProfileRealNameSubmitButtonLabel', '\u5f00\u59cb\u8ba4\u8bc1', 27, 0, 2, 132, 40, Color.WHITE, HorizontalTextAlignment.CENTER, 2);
}

function buildProfileRealNameBoard(api: ProfileRealNameRuntime, board: Node): void {
    ensureSkinnedChild(api, board, 'ProfileRealNameClose', 56, 64, 238, 258, HomeConfig.UI_PROFILE_REAL_NAME_CLOSE).setSiblingIndex(20);

    ensureLabel(api, board, 'ProfileRealNameTitle', '\u5b9e\u540d\u8ba4\u8bc1', 42, 0, 234, 300, 58, TITLE_COLOR, HorizontalTextAlignment.CENTER, 0);
    ensureLabel(api, board, 'ProfileRealNameStatus', '', 25, 0, 171, 380, 36, TEXT_COLOR, HorizontalTextAlignment.CENTER, 0);
    ensureLabel(api, board, 'ProfileRealNameNameValue', '', 25, 0, 137, 380, 36, TEXT_COLOR, HorizontalTextAlignment.CENTER, 0);
    ensureLabel(api, board, 'ProfileRealNameCertificateValue', '', 25, 0, 103, 430, 36, TEXT_COLOR, HorizontalTextAlignment.CENTER, 0);

    ensureInputRow(api, board, 'Name', '\u59d3\u540d', '\u8bf7\u8f93\u5165\u771f\u5b9e\u59d3\u540d', 30, 12, false);
    ensureInputRow(api, board, 'Certificate', '\u8bc1\u4ef6\u53f7', '\u8bf7\u8f93\u5165\u8eab\u4efd\u8bc1\u53f7', -58, 18, true);

    const refreshButton = ensureSkinnedChild(api, board, 'ProfileRealNameRefreshButton', 162, 62, -104, -248, HomeConfig.UI_PROFILE_REAL_NAME_BUTTON_BG);
    ensureLabel(api, refreshButton, 'ProfileRealNameRefreshButtonLabel', '\u5237\u65b0\u72b6\u6001', 27, 0, 2, 132, 40, Color.WHITE, HorizontalTextAlignment.CENTER, 2);

    const submitButton = ensureSkinnedChild(api, board, 'ProfileRealNameSubmitButton', 162, 62, 104, -248, HomeConfig.UI_PROFILE_REAL_NAME_BUTTON_BG);
    ensureLabel(api, submitButton, 'ProfileRealNameSubmitButtonLabel', '\u5f00\u59cb\u8ba4\u8bc1', 27, 0, 2, 132, 40, Color.WHITE, HorizontalTextAlignment.CENTER, 2);
}

function bindProfileRealNamePanel(api: ProfileRealNameRuntime, panel: Node): void {
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

    const mask = panel.getChildByName('ProfileRealNameMask');
    if (mask?.isValid) {
        mask.off(Node.EventType.TOUCH_END);
        mask.on(Node.EventType.TOUCH_END, (event: EventTouch) => {
            event.propagationStopped = true;
            closeProfileRealNamePanel(api as unknown as HomeViewBase);
        });
    }

    const close = board.getChildByName('ProfileRealNameClose');
    if (close?.isValid) {
        api.bindScaledClick(close, () => closeProfileRealNamePanel(api as unknown as HomeViewBase));
    }

    const refresh = board.getChildByName('ProfileRealNameRefreshButton');
    if (refresh?.isValid) {
        api.bindScaledClick(refresh, () => {
            refreshProfileRealNamePanel(api, panel);
            api.showToast?.('\u5b9e\u540d\u72b6\u6001\u5df2\u5237\u65b0');
        });
    }

    const submit = board.getChildByName('ProfileRealNameSubmitButton');
    if (submit?.isValid) {
        api.bindScaledClick(submit, () => {
            const name = getEditBoxString(board, 'ProfileRealNameNameInputBg').trim();
            const certificate = getEditBoxString(board, 'ProfileRealNameCertificateInputBg').trim();
            if (!name || !certificate) {
                api.showToast?.('\u8bf7\u586b\u5199\u771f\u5b9e\u59d3\u540d\u548c\u8bc1\u4ef6\u53f7');
                return;
            }
            saveProfileRealNameState({
                status: '\u5df2\u8ba4\u8bc1',
                nameMasked: maskName(name),
                certificateMasked: maskCertificate(certificate),
            });
            refreshProfileRealNamePanel(api, panel);
            api.showToast?.('\u5df2\u63d0\u4ea4\u5b9e\u540d\u8ba4\u8bc1\u4fe1\u606f');
        });
    }
}

function refreshProfileRealNamePanel(api: ProfileRealNameRuntime, panel: Node): void {
    const board = panel.getChildByName(BOARD_NAME);
    if (!board?.isValid) return;
    const state = loadProfileRealNameState();
    setLabelString(board, 'ProfileRealNameStatus', `\u5f53\u524d\u72b6\u6001\uff1a${state.status}`);
    setLabelString(board, 'ProfileRealNameNameValue', `\u59d3\u540d\uff1a${state.nameMasked}`);
    setLabelString(board, 'ProfileRealNameCertificateValue', `\u8bc1\u4ef6\uff1a${state.certificateMasked}`);

    const nameEditBox = board.getChildByName('ProfileRealNameNameInputBg')?.getChildByName('EditBoxTouch')?.getComponent(EditBox);
    const certEditBox = board.getChildByName('ProfileRealNameCertificateInputBg')?.getChildByName('EditBoxTouch')?.getComponent(EditBox);
    if (nameEditBox) nameEditBox.string = '';
    if (certEditBox) certEditBox.string = '';
    void api;
}

function ensureInputRow(
    api: ProfileRealNameRuntime,
    board: Node,
    key: 'Name' | 'Certificate',
    labelText: string,
    placeholder: string,
    y: number,
    maxLength: number,
    certificateMode: boolean,
): EditBox {
    ensureLabel(api, board, `ProfileRealName${key}Label`, labelText, 25, -196, y, 88, 44, TEXT_COLOR, HorizontalTextAlignment.CENTER, 0);

    const inputBg = ensureNodeChild(
        api,
        board,
        `ProfileRealName${key}InputBg`,
        HomeConfig.PROFILE_REAL_NAME_INPUT_WIDTH,
        HomeConfig.PROFILE_REAL_NAME_INPUT_HEIGHT,
        64,
        y,
    );
    drawInputBackground(inputBg, HomeConfig.PROFILE_REAL_NAME_INPUT_WIDTH, HomeConfig.PROFILE_REAL_NAME_INPUT_HEIGHT);
    return setupProfileRealNameEditBox(api, inputBg, placeholder, maxLength, certificateMode);
}

function setupProfileRealNameEditBox(
    api: ProfileRealNameRuntime,
    inputBg: Node,
    placeholder: string,
    maxLength: number,
    certificateMode: boolean,
): EditBox {
    const inputSize = getEditorNodeSize(inputBg, HomeConfig.PROFILE_REAL_NAME_INPUT_WIDTH, HomeConfig.PROFILE_REAL_NAME_INPUT_HEIGHT);
    const width = Math.max(80, inputSize.width - 34);
    const height = Math.max(24, inputSize.height - 10);
    const editNode = ensureNodeChild(api, inputBg, 'EditBoxTouch', width, height, 4, 0);
    const size = getEditorNodeSize(editNode, width, height);
    let editBox = editNode.getComponent(EditBox);
    editBox ||= editNode.addComponent(EditBox);

    const textLabel = ensureLabel(api, editNode, 'TEXT_LABEL', '', 24, 0, 0, size.width, size.height, INPUT_TEXT_COLOR, HorizontalTextAlignment.LEFT, 0);
    const placeholderLabel = ensureLabel(api, editNode, 'PLACEHOLDER_LABEL', placeholder, 24, 0, 0, size.width, size.height, INPUT_PLACEHOLDER_COLOR, HorizontalTextAlignment.LEFT, 0);
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
        lineHeight?: number;
        string?: string;
        _textLabel?: Label;
        _placeholderLabel?: Label;
        _inputMode?: number;
        _inputFlag?: number;
        _returnType?: number;
        _fontSize?: number;
        _placeholderFontSize?: number;
        _fontColor?: Color;
        _placeholderFontColor?: Color;
        _cursorColor?: Color;
        _backgroundImage?: null;
        _placeholder?: string;
        _maxLength?: number;
        _lineHeight?: number;
        _string?: string;
    };
    const inputMode = (EditBox as unknown as { InputMode?: { SINGLE_LINE?: number } }).InputMode?.SINGLE_LINE ?? 6;
    const inputFlag = (EditBox as unknown as { InputFlag?: { SENSITIVE?: number } }).InputFlag?.SENSITIVE ?? 1;
    const returnType = (EditBox as unknown as { KeyboardReturnType?: { DONE?: number } }).KeyboardReturnType?.DONE ?? 0;
    const currentValue = editBox.string || editBoxCompat._string || '';
    editBoxCompat.textLabel = textLabel;
    editBoxCompat.placeholderLabel = placeholderLabel;
    editBoxCompat.inputMode = inputMode;
    editBoxCompat.inputFlag = inputFlag;
    editBoxCompat.returnType = returnType;
    editBoxCompat.fontSize = 24;
    editBoxCompat.placeholderFontSize = 24;
    editBoxCompat.fontColor = INPUT_TEXT_COLOR;
    editBoxCompat.placeholderFontColor = INPUT_PLACEHOLDER_COLOR;
    editBoxCompat.cursorColor = INPUT_TEXT_COLOR;
    editBoxCompat.backgroundImage = null;
    editBoxCompat.placeholder = placeholder;
    editBoxCompat.maxLength = maxLength;
    editBoxCompat.lineHeight = 32;
    editBoxCompat.string = currentValue;
    editBoxCompat._textLabel = textLabel;
    editBoxCompat._placeholderLabel = placeholderLabel;
    editBoxCompat._inputMode = inputMode;
    editBoxCompat._inputFlag = inputFlag;
    editBoxCompat._returnType = returnType;
    editBoxCompat._fontSize = 24;
    editBoxCompat._placeholderFontSize = 24;
    editBoxCompat._fontColor = INPUT_TEXT_COLOR;
    editBoxCompat._placeholderFontColor = INPUT_PLACEHOLDER_COLOR;
    editBoxCompat._cursorColor = INPUT_TEXT_COLOR;
    editBoxCompat._backgroundImage = null;
    editBoxCompat._placeholder = placeholder;
    editBoxCompat._maxLength = maxLength;
    editBoxCompat._lineHeight = 32;
    editBoxCompat._string = currentValue;
    textLabel.string = currentValue;
    placeholderLabel.string = placeholder;
    textLabel.node.active = currentValue.length > 0;
    placeholderLabel.node.active = currentValue.length <= 0;

    const changed = getEditBoxEventType('TEXT_CHANGED');
    editNode.off(changed);
    editNode.on(changed, () => {
        const raw = editBox.string || '';
        if (certificateMode) {
            const clean = raw.replace(/[^\dXx]/g, '').toUpperCase();
            if (raw !== clean) editBox.string = clean;
        }
        textLabel.string = editBox.string || '';
        textLabel.node.active = !!textLabel.string;
        placeholderLabel.node.active = !textLabel.string;
    });
    return editBox;
}

function ensureSkinnedChild(api: ProfileRealNameRuntime, parent: Node, name: string, width: number, height: number, x: number, y: number, skinPath: string): Node {
    const node = ensureNodeChild(api, parent, name, width, height, x, y);
    api.applyUiSkinKeepingEditorSize(node, skinPath, width, height);
    return node;
}

function prepareSkinnedChild(api: ProfileRealNameRuntime, parent: Node, name: string, width: number, height: number, x: number, y: number, skinPath: string): Node {
    let node = parent.getChildByName(name);
    if (!node?.isValid) {
        node = ensureSkinnedChild(api, parent, name, width, height, x, y, skinPath);
    } else {
        node.active = true;
        const size = getEditorNodeSize(node, width, height);
        api.applyUiSkinKeepingEditorSize(node, skinPath, size.width, size.height);
    }
    return node;
}

function prepareInputRow(
    api: ProfileRealNameRuntime,
    board: Node,
    key: 'Name' | 'Certificate',
    labelText: string,
    placeholder: string,
    y: number,
    maxLength: number,
    certificateMode: boolean,
): EditBox {
    prepareLabel(api, board, `ProfileRealName${key}Label`, labelText, 25, -196, y, 88, 44, TEXT_COLOR, HorizontalTextAlignment.CENTER, 0);

    const inputName = `ProfileRealName${key}InputBg`;
    const inputBg = board.getChildByName(inputName);
    if (!inputBg?.isValid) {
        return ensureInputRow(api, board, key, labelText, placeholder, y, maxLength, certificateMode);
    }

    inputBg.active = true;
    const size = getEditorNodeSize(inputBg, HomeConfig.PROFILE_REAL_NAME_INPUT_WIDTH, HomeConfig.PROFILE_REAL_NAME_INPUT_HEIGHT);
    drawInputBackground(inputBg, size.width, size.height);
    return setupProfileRealNameEditBox(api, inputBg, placeholder, maxLength, certificateMode);
}

function ensureNodeChild(api: ProfileRealNameRuntime, parent: Node, name: string, width: number, height: number, x: number, y: number): Node {
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

function prepareLabel(
    api: ProfileRealNameRuntime,
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
    const node = parent.getChildByName(name);
    if (!node?.isValid) {
        return ensureLabel(api, parent, name, text, fontSize, x, y, width, height, color, align, outlineWidth);
    }

    node.active = true;
    ensureEditorNodeSize(node, width, height);
    let label = node.getComponent(Label);
    label ||= node.addComponent(Label);
    applyProfileRealNameLabelStyle(label, text, fontSize, color, align, outlineWidth);
    return label;
}

function ensureLabel(
    api: ProfileRealNameRuntime,
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
        ensureEditorNodeSize(label.node, width, height);
        label.node.setPosition(x, y, 0);
    }
    applySimKaiFont(label);
    applyProfileRealNameLabelStyle(label, text, fontSize, color, align, outlineWidth);
    return label;
}

function applyProfileRealNameLabelStyle(
    label: Label,
    text: string,
    fontSize: number,
    color: Color,
    align: HorizontalTextAlignment,
    outlineWidth: number,
): void {
    applySimKaiFont(label);
    label.string = text;
    label.fontSize = fontSize;
    label.lineHeight = fontSize + 8;
    label.color = color;
    label.horizontalAlign = align;
    label.verticalAlign = VerticalTextAlignment.CENTER;
    label.enableWrapText = false;
    label.overflow = Overflow.SHRINK;
    label.enableOutline = outlineWidth > 0;
    label.outlineColor = new Color(76, 38, 22, 255);
    label.outlineWidth = outlineWidth;
}

function drawInputBackground(node: Node, width: number, height: number): void {
    const graphics = node.getComponent(Graphics) || node.addComponent(Graphics);
    graphics.clear();
    graphics.fillColor = INPUT_FILL_COLOR;
    graphics.strokeColor = INPUT_STROKE_COLOR;
    graphics.lineWidth = 2;
    graphics.rect(-width / 2, -height / 2, width, height);
    graphics.fill();
    graphics.stroke();
}

function getEditBoxString(board: Node, inputName: string): string {
    return board.getChildByName(inputName)?.getChildByName('EditBoxTouch')?.getComponent(EditBox)?.string || '';
}

function setLabelString(parent: Node, name: string, text: string): void {
    const label = parent.getChildByName(name)?.getComponent(Label);
    if (label) label.string = text;
}

function getEditBoxEventType(name: 'TEXT_CHANGED'): string {
    const eventType = EditBox as unknown as { EventType?: Record<string, string> };
    return eventType.EventType?.[name] || 'text-changed';
}

function getProfilePopupRoot(api: ProfileRealNameRuntime, required: true): Node;
function getProfilePopupRoot(api: ProfileRealNameRuntime, required: false): Node | null;
function getProfilePopupRoot(api: ProfileRealNameRuntime, required: boolean): Node | null {
    const root = api.profilePopupRoot?.isValid
        ? api.profilePopupRoot
        : api.popupRoot?.getChildByName('ProfilePopup')
            || api.findNode('ProfilePopup', api.popupRoot || api.uiHudLayer || api.node);
    if (!root && required) {
        throw new Error('[MainHomeView] ProfilePopup is required before opening real-name panel');
    }
    return root || null;
}

function loadProfileRealNameState(): ProfileRealNameState {
    try {
        const raw = sys.localStorage?.getItem(HomeConfig.PROFILE_REAL_NAME_STORAGE_KEY);
        if (raw) {
            const state = JSON.parse(raw) as Partial<ProfileRealNameState>;
            if (state.status && state.nameMasked && state.certificateMasked) {
                return {
                    status: `${state.status}`,
                    nameMasked: `${state.nameMasked}`,
                    certificateMasked: `${state.certificateMasked}`,
                };
            }
        }
    } catch {
        // Local storage may be unavailable in editor preview.
    }
    return {
        status: '\u5df2\u8ba4\u8bc1',
        nameMasked: '\u9ad8***',
        certificateMasked: '511************2354',
    };
}

function saveProfileRealNameState(state: ProfileRealNameState): void {
    try {
        sys.localStorage?.setItem(HomeConfig.PROFILE_REAL_NAME_STORAGE_KEY, JSON.stringify(state));
    } catch {
        // Local storage may be unavailable in editor preview.
    }
}

function maskName(name: string): string {
    const clean = name.trim();
    if (!clean) return '\u9ad8***';
    return `${clean[0]}***`;
}

function maskCertificate(certificate: string): string {
    const clean = certificate.trim().replace(/\s+/g, '').toUpperCase();
    if (clean.length <= 7) return '511************2354';
    return `${clean.slice(0, 3)}${'*'.repeat(Math.max(4, clean.length - 7))}${clean.slice(-4)}`;
}
