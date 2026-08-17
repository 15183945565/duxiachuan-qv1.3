import {
    Color,
    EditBox,
    EventTouch,
    Graphics,
    HorizontalTextAlignment,
    Label,
    Node,
    Overflow,
    RichText,
    Sprite,
    UITransform,
    VerticalTextAlignment,
    sys,
} from 'cc';
import { applySimKaiFont } from '../Common/UIFont';
import * as HomeConfig from './HomeConfig';
import type { RoleProfile } from './HomeTypes';
import { HomeViewBase } from './HomeViewBase';
import { closeProfileBillPanel } from './HomeProfileBillPanel';
import { closeProfileDaoYouPanel, openProfileDaoYouPanel } from './HomeProfileDaoYouPanel';
import { closeProfilePrettyNumberPanel, openProfilePrettyNumberPanel } from './HomeProfilePrettyNumberPanel';
import { closeProfileRealNamePanel, openProfileRealNamePanel } from './HomeProfileRealNamePanel';

/**
 * Owns the profile entry, main profile popup, labels, and action routing.
 */
export abstract class HomeFeatureProfileShell extends HomeViewBase {
    protected profileRenameEditBox: EditBox | null = null;
    protected profileRenameDisplayLabel: Label | null = null;
    protected profileRenamePendingOldName = '';
    protected profileRenamePendingNewName = '';
    protected profileRenameInputSyncing = false;

    protected setupAvatarProfileButton(): void {
        const topHud = this.persistentCurrencyHud || this.findNode('TopHud', this.uiMainLayer || this.node) || this.findNode('TopHud');
        if (!topHud) return;
        const avatarIcon = this.findNode('AvatarIcon', topHud);
        if (avatarIcon) {
            avatarIcon.active = true;
            this.applyHomeAvatarSkin(avatarIcon, HomeConfig.HOME_PROFILE_AVATAR_SIZE, HomeConfig.HOME_PROFILE_AVATAR_SIZE);
        }
        const targets = [
            this.findNode('ProfileInfoFrame', topHud),
            this.findNode('AvatarFrame', topHud),
            avatarIcon,
            this.findNode('LabelLevel', topHud),
            this.findNode('LabelPlayerName', topHud),
            this.findNode('LabelUid', topHud),
            this.findNode('LabelCombatPower', topHud),
        ].filter((node): node is Node => !!node);
        const bound = new Set<Node>();
        targets.forEach((target) => {
            if (bound.has(target)) return;
            bound.add(target);
            this.bindScaledClick(target, () => {
                void this.openProfileEntry().catch((error) => {
                    console.error('[MainHomeView] failed to open profile entry', error);
                    this.showToast('\u6863\u6848\u8d44\u6e90\u52a0\u8f7d\u5931\u8d25');
                });
            });
        });
        this.loadProfileAvatarFrameState();
        this.refreshProfileAvatarSkins();
        this.applyEquippedProfileAvatarFrameVisual();
    }
    protected async openProfileEntry(): Promise<void> {
        await this.withTransitionLoading(async () => {
            await this.prepareHomeEntry('BtnProfile');
            if (!this.node.isValid) return;
            this.openProfilePopup();
        });
    }
    protected openProfilePopup(): void {
        const panel = this.ensureProfilePopup();
        panel.active = true;
        closeProfileDaoYouPanel(this);
        closeProfileBillPanel(this);
        closeProfileRealNamePanel(this);
        closeProfilePrettyNumberPanel(this);
        this.ensureInputBlocker(panel);
        panel.setSiblingIndex((panel.parent?.children.length || 1) - 1);
        this.refreshRootLayerOrder();
        this.refreshProfilePopupLabels();
        this.applyEquippedProfileAvatarFrameVisual();
    }
    protected closeProfilePopup(): void {
        closeProfileDaoYouPanel(this);
        closeProfileBillPanel(this);
        closeProfileRealNamePanel(this);
        closeProfilePrettyNumberPanel(this);
        this.closeProfileSettingsPopup();
        this.closeProfileAvatarFramePopup();
        if (this.profilePopupRoot?.isValid) {
            this.profilePopupRoot.active = false;
        }
    }
    protected ensureProfilePopup(): Node {
        if (this.profilePopupRoot?.isValid) {
            return this.profilePopupRoot;
        }

        const parent = this.popupRoot || this.uiHudLayer || this.node;
        let root = parent.getChildByName('ProfilePopup');
        if (root) {
            root.active = false;
            if (this.bindProfilePopupFromEditor(root)) {
                return root;
            }
        }
        if (!root) {
            root = this.createNode('ProfilePopup', parent, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT, 0, 0);
        }
        root.active = false;
        root.removeAllChildren();

        const mask = this.createNode('ProfilePopupMask', root, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT, 0, 0);
        this.drawRect(mask, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT, new Color(0, 0, 0, 118));
        mask.on(Node.EventType.TOUCH_END, (event: EventTouch) => {
            event.propagationStopped = true;
            this.closeProfilePopup();
        }, this);
        const board = this.createNode(
            'ProfilePopupBoard',
            root,
            HomeConfig.PROFILE_POPUP_WIDTH,
            HomeConfig.PROFILE_POPUP_HEIGHT,
            0,
            HomeConfig.PROFILE_POPUP_Y,
        );
        board.on(Node.EventType.TOUCH_START, (event: EventTouch) => {
            event.propagationStopped = true;
        }, this);
        board.on(Node.EventType.TOUCH_END, (event: EventTouch) => {
            event.propagationStopped = true;
        }, this);

        this.profilePopupRoot = root;
        this.profilePopupBoard = board;
        this.buildProfilePopupBoardSkin(board);
        this.buildProfileHeader(board);
        this.buildProfileActionButtons(board);
        return root;
    }
    protected bindProfilePopupFromEditor(root: Node): boolean {
        const board = this.findNode('ProfilePopupBoard', root);
        if (!board) {
            return false;
        }
        this.profilePopupRoot = root;
        this.profilePopupBoard = board;
        this.refreshEditorProfilePopupSkins(root, board);
        const mask = this.findNode('ProfilePopupMask', root);
        if (mask) {
            (mask.getComponent(UITransform) || mask.addComponent(UITransform)).setContentSize(HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT);
            if (!mask.getComponent(Graphics) && !mask.getComponent(Sprite)) {
                this.drawRect(mask, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT, new Color(0, 0, 0, 118));
            }
            mask.off(Node.EventType.TOUCH_END);
            mask.on(Node.EventType.TOUCH_END, (event: EventTouch) => {
                event.propagationStopped = true;
                this.closeProfilePopup();
            }, this);
        }

        board.off(Node.EventType.TOUCH_START);
        board.off(Node.EventType.TOUCH_END);
        board.on(Node.EventType.TOUCH_START, (event: EventTouch) => {
            event.propagationStopped = true;
        }, this);
        board.on(Node.EventType.TOUCH_END, (event: EventTouch) => {
            event.propagationStopped = true;
        }, this);

        const nameLabel = this.findNode('ProfileNameLabel', board)?.getComponent(Label) || null;
        if (nameLabel) {
            this.profilePopupNameLabel = nameLabel;
            applySimKaiFont(nameLabel);
            this.applyProfileNicknameLabelStyle(nameLabel);
        }

        const uidLabel = this.findNode('ProfileUidLabel', board)?.getComponent(Label) || null;
        if (uidLabel) {
            this.profilePopupUidLabel = uidLabel;
            applySimKaiFont(uidLabel);
            this.applyProfileTextOutline(uidLabel, 2);
        }

        const editButton = this.findNode('ProfileEditButton', board);
        if (editButton) {
            this.bindScaledClick(editButton, () => this.openProfileRenameInputPopup());
        }

        const copyButton = this.findNode('ProfileCopyButton', board);
        if (copyButton) {
            this.bindScaledClick(copyButton, () => this.copyProfileUid());
        }
        this.ensureProfileAvatarFrameButton(board);
        this.hideProfileBillEntry(board);

        [
            { slotName: 'ProfileCustomerButtonSlot', buttonName: 'ProfileCustomerButton', message: '' },
            { slotName: 'ProfileFriendButtonSlot', buttonName: 'ProfileFriendButton', message: '\u9053\u53cb\u529f\u80fd\u9884\u7559' },
            { slotName: 'ProfileSettingsButtonSlot', buttonName: 'ProfileSettingsButton', message: '\u8bbe\u7f6e\u529f\u80fd\u9884\u7559' },
            { slotName: 'ProfileRealNameButtonSlot', buttonName: 'ProfileRealNameButton', message: '\u5b9e\u540d\u529f\u80fd\u9884\u7559' },
            { slotName: 'ProfileStreamerButtonSlot', buttonName: 'ProfileStreamerButton', message: '\u9753\u53f7\u529f\u80fd\u9884\u7559' },
        ].forEach((action) => {
            const slot = this.findNode(action.slotName, board);
            if (slot) {
                slot.off(Node.EventType.TOUCH_START);
                slot.off(Node.EventType.TOUCH_END);
                slot.off(Node.EventType.TOUCH_CANCEL);
            }

            const button = this.findNode(action.buttonName, board);
            if (button) {
                this.bindScaledClick(button, () => {
                    if (action.buttonName === 'ProfileCustomerButton') {
                        this.openCustomerServiceUrl();
                        return;
                    }
                    if (action.buttonName === 'ProfileFriendButton') {
                        openProfileDaoYouPanel(this);
                        return;
                    }
                    if (action.buttonName === 'ProfileSettingsButton') {
                        this.openProfileSettingsPopup();
                        return;
                    }
                    if (action.buttonName === 'ProfileRealNameButton') {
                        openProfileRealNamePanel(this);
                        return;
                    }
                    if (action.buttonName === 'ProfileStreamerButton') {
                        closeProfileDaoYouPanel(this);
                        closeProfileBillPanel(this);
                        closeProfileRealNamePanel(this);
                        openProfilePrettyNumberPanel(this);
                        return;
                    }
                    this.showToast(action.message);
                });
            }
        });

        return true;
    }
    protected refreshEditorProfilePopupSkins(root: Node, board: Node): void {
        const skin = (name: string, path: string, width: number, height: number, searchRoot: Node = board): void => {
            const target = this.findNode(name, searchRoot);
            if (target) {
                this.applyUiSkinKeepingEditorSize(target, path, width, height);
            }
        };

        skin('ProfilePopupBoardSkin', HomeConfig.UI_PROFILE_POPUP_BG, HomeConfig.PROFILE_POPUP_WIDTH, HomeConfig.PROFILE_POPUP_HEIGHT);
        skin('ProfileAvatarFrame', HomeConfig.UI_HOME_PROFILE_FRAME, 104, 104);
        skin('ProfileAvatarIcon', this.getHomeAvatarSkin(), 92, 92);
        this.hideProfileNameBar(board);
        skin('ProfileEditButton', HomeConfig.UI_PROFILE_BTN_EDIT, 34, 34);
        skin('ProfileCopyButton', HomeConfig.UI_PROFILE_BTN_COPY, 34, 34);

        [
            { name: 'ProfileCustomerButton', path: HomeConfig.UI_PROFILE_BTN_CUSTOMER },
            { name: 'ProfileFriendButton', path: HomeConfig.UI_PROFILE_BTN_FRIEND },
            { name: 'ProfileSettingsButton', path: HomeConfig.UI_PROFILE_BTN_SETTINGS },
            { name: 'ProfileRealNameButton', path: HomeConfig.UI_PROFILE_BTN_REALNAME },
            { name: 'ProfileStreamerButton', path: HomeConfig.UI_PROFILE_BTN_STREAMER },
        ].forEach((item) => {
            skin(item.name, item.path, 92, 93);
        });
        this.hideProfileBillEntry(board);

        if (root !== board) {
            root.setSiblingIndex((root.parent?.children.length || 1) - 1);
        }
    }
    protected buildProfilePopupBoardSkin(board: Node): void {
        const skin = this.createSkinnedNode(
            'ProfilePopupBoardSkin',
            board,
            HomeConfig.PROFILE_POPUP_WIDTH,
            HomeConfig.PROFILE_POPUP_HEIGHT,
            0,
            0,
            HomeConfig.UI_PROFILE_POPUP_BG,
        );
        skin.setSiblingIndex(0);
    }
    protected buildProfileHeader(board: Node): void {
        const header = this.createNode('ProfileHeader', board, 470, 150, -105, 92);
        header.setSiblingIndex(3);
        this.createSkinnedNode('ProfileAvatarFrame', header, 104, 104, -210, 8, HomeConfig.UI_HOME_PROFILE_FRAME).setSiblingIndex(0);
        this.createSkinnedNode('ProfileAvatarIcon', header, 92, 92, -210, 8, this.getHomeAvatarSkin()).setSiblingIndex(1);

        const nameBar = this.createSkinnedNode('ProfileNameBar', header, 230, 44, -28, 36, HomeConfig.UI_HOME_RESOURCE_BAR);
        nameBar.active = false;
        const nameBarSprite = nameBar.getComponent(Sprite);
        if (nameBarSprite) nameBarSprite.enabled = false;
        nameBar.setSiblingIndex(0);
        this.profilePopupNameLabel = this.createLabel(header, 'ProfileNameLabel', this.getProfileNicknameText(), 25, -86.2, 60.16, 210.786, 44, Color.WHITE);
        this.applyProfileNicknameLabelStyle(this.profilePopupNameLabel);

        const editButton = this.createSkinnedNode('ProfileEditButton', header, 34, 34, 13.547, 60.16, HomeConfig.UI_PROFILE_BTN_EDIT);
        this.bindScaledClick(editButton, () => this.openProfileRenameInputPopup());

        this.profilePopupUidLabel = this.createLabel(header, 'ProfileUidLabel', `UID: ${HomeConfig.DEFAULT_UID}`, 25, 249.518, 60.16, 209.078, 45.58, Color.WHITE);
        this.applyProfileTextOutline(this.profilePopupUidLabel, 2);

        const copyButton = this.createSkinnedNode('ProfileCopyButton', header, 34, 34, 374.203, 60.16, HomeConfig.UI_PROFILE_BTN_COPY);
        this.bindScaledClick(copyButton, () => this.copyProfileUid());
        this.ensureProfileAvatarFrameButton(board);
    }
    protected ensureProfileAvatarFrameButton(board: Node): void {
        const header = this.findNode('ProfileHeader', board);
        if (!header?.isValid) return;

        let button = header.getChildByName('ProfileAvatarFrameButton');
        if (!button?.isValid) {
            button = this.createSkinnedNode('ProfileAvatarFrameButton', header, 118, 39, -210, -70, HomeConfig.UI_PROFILE_AVATAR_FRAME_BUTTON_BG);
        } else {
            button.active = true;
        }

        let labelNode = button.getChildByName('ProfileAvatarFrameButtonLabel');
        if (!labelNode?.isValid) {
            labelNode = this.createNode('ProfileAvatarFrameButtonLabel', button, 106, 30, 0, 1);
            const label = labelNode.getComponent(Label) || labelNode.addComponent(Label);
            applySimKaiFont(label);
            label.string = '\u6362\u5934\u50cf\u6846';
            label.fontSize = 20;
            label.lineHeight = 28;
            label.color = new Color(96, 58, 31, 255);
            label.horizontalAlign = HorizontalTextAlignment.CENTER;
            label.verticalAlign = VerticalTextAlignment.CENTER;
            label.overflow = Overflow.SHRINK;
            label.enableWrapText = false;
            this.applyProfileTextOutline(label, 1);
        }
        labelNode.active = true;

        this.bindScaledClick(button, () => this.openProfileAvatarFramePopup());
    }
    protected buildProfileActionButtons(board: Node): void {
        const actions = [
            { name: 'ProfileCustomerButton', icon: HomeConfig.UI_PROFILE_BTN_CUSTOMER, x: 0, y: 21.921, message: '' },
            { name: 'ProfileRealNameButton', icon: HomeConfig.UI_PROFILE_BTN_REALNAME, x: 100.134, y: 21.921, message: '\u5b9e\u540d\u529f\u80fd\u9884\u7559' },
            { name: 'ProfileFriendButton', icon: HomeConfig.UI_PROFILE_BTN_FRIEND, x: 200.267, y: 21.921, message: '\u9053\u53cb\u529f\u80fd\u9884\u7559' },
            { name: 'ProfileSettingsButton', icon: HomeConfig.UI_PROFILE_BTN_SETTINGS, x: 3.609, y: -76, message: '\u8bbe\u7f6e\u529f\u80fd\u9884\u7559' },
            { name: 'ProfileStreamerButton', icon: HomeConfig.UI_PROFILE_BTN_STREAMER, x: 101.589, y: -76, message: '\u9753\u53f7\u529f\u80fd\u9884\u7559' },
        ];

        actions.forEach((action) => {
            const slot = this.createNode(`${action.name}Slot`, board, 92, 92, action.x, action.y);
            slot.setSiblingIndex(3);
            const button = this.createSkinnedNode(action.name, slot, 92, 93, 0, 0, action.icon);
            button.setSiblingIndex(0);
            this.bindScaledClick(button, () => {
                if (action.name === 'ProfileCustomerButton') {
                    this.openCustomerServiceUrl();
                    return;
                }
                if (action.name === 'ProfileFriendButton') {
                    openProfileDaoYouPanel(this);
                    return;
                }
                if (action.name === 'ProfileSettingsButton') {
                    this.openProfileSettingsPopup();
                    return;
                }
                if (action.name === 'ProfileRealNameButton') {
                    openProfileRealNamePanel(this);
                    return;
                }
                if (action.name === 'ProfileStreamerButton') {
                    closeProfileDaoYouPanel(this);
                    closeProfileBillPanel(this);
                    closeProfileRealNamePanel(this);
                    openProfilePrettyNumberPanel(this);
                    return;
                }
                this.showToast(action.message);
            });
        });
    }
    protected hideProfileBillEntry(board: Node): void {
        ['ProfileBillButtonSlot', 'ProfileBillButton'].forEach((name) => {
            const node = this.findNode(name, board);
            if (node?.isValid) {
                node.active = false;
                node.off(Node.EventType.TOUCH_START);
                node.off(Node.EventType.TOUCH_END);
                node.off(Node.EventType.TOUCH_CANCEL);
            }
        });
    }
    protected refreshProfilePopupLabels(): void {
        if (this.profilePopupNameLabel?.isValid) {
            this.profilePopupNameLabel.string = this.getProfileNicknameText();
            this.applyProfileNicknameLabelStyle(this.profilePopupNameLabel);
            this.syncProfileEditButtonPosition();
        }
        if (this.profilePopupUidLabel?.isValid) {
            this.profilePopupUidLabel.string = `UID: ${HomeConfig.DEFAULT_UID}`;
        }
        this.refreshProfileAvatarSkins();
    }
    protected refreshProfileAvatarSkins(): void {
        const topHud = this.persistentCurrencyHud || this.findNode('TopHud', this.uiMainLayer || this.node) || this.findNode('TopHud');
        this.applyHomeAvatarSkin(topHud ? this.findNode('AvatarIcon', topHud) : null, HomeConfig.HOME_PROFILE_AVATAR_SIZE, HomeConfig.HOME_PROFILE_AVATAR_SIZE);

        const board = this.profilePopupBoard?.isValid ? this.profilePopupBoard : this.findNode('ProfilePopupBoard');
        this.applyHomeAvatarSkin(board ? this.findNode('ProfileAvatarIcon', board) : null, 92, 92);
    }
    protected getProfileNicknameText(): string {
        return `\u6635\u79f0\uff1a${this.profile.name || HomeConfig.DEFAULT_NAME}`;
    }
    protected hideProfileNameBar(root: Node): void {
        const nameBar = this.findNode('ProfileNameBar', root);
        if (!nameBar?.isValid) return;
        nameBar.active = false;
        const sprite = nameBar.getComponent(Sprite);
        if (sprite) sprite.enabled = false;
    }
    protected applyProfileNicknameLabelStyle(label: Label): void {
        const node = label.node;
        node.active = true;
        const transform = node.getComponent(UITransform) || node.addComponent(UITransform);
        if (transform.contentSize.width <= 1 || transform.contentSize.height <= 1) {
            transform.setContentSize(210.786, 44);
        }
        label.string = this.getProfileNicknameText();
        label.fontSize = 25;
        label.lineHeight = 33;
        label.color = Color.WHITE;
        label.horizontalAlign = HorizontalTextAlignment.CENTER;
        label.verticalAlign = VerticalTextAlignment.CENTER;
        label.overflow = Overflow.SHRINK;
        label.enableWrapText = false;
        applySimKaiFont(label);
        this.applyProfileTextOutline(label, 2);
    }
    protected syncProfileEditButtonPosition(): void {
        const label = this.profilePopupNameLabel;
        if (!label?.isValid) return;
        const labelNode = label.node;
        const header = labelNode.parent;
        if (!header?.isValid) return;
        const editButton = header.getChildByName('ProfileEditButton');
        if (!editButton?.isValid) return;

        const labelTransform = labelNode.getComponent(UITransform);
        const buttonTransform = editButton.getComponent(UITransform);
        if (!labelTransform || !buttonTransform) return;

        const labelPos = labelNode.position;
        const labelWidth = labelTransform.contentSize.width;
        const labelLeft = labelPos.x - labelWidth * labelTransform.anchorPoint.x;
        const labelRight = labelLeft + labelWidth;
        const visibleTextWidth = Math.min(labelWidth, this.estimateProfileNicknameTextWidth(label.string, label.fontSize));
        let textRight = labelRight;
        if (label.horizontalAlign === HorizontalTextAlignment.LEFT) {
            textRight = labelLeft + visibleTextWidth;
        } else if (label.horizontalAlign === HorizontalTextAlignment.CENTER) {
            textRight = labelLeft + (labelWidth + visibleTextWidth) / 2;
        }

        const gap = 8;
        const buttonHalfWidth = buttonTransform.contentSize.width / 2;
        let nextX = textRight + gap + buttonHalfWidth;
        const uidLabel = header.getChildByName('ProfileUidLabel');
        const uidTransform = uidLabel?.getComponent(UITransform);
        if (uidLabel?.isValid && uidTransform) {
            const uidLeft = uidLabel.position.x - uidTransform.contentSize.width * uidTransform.anchorPoint.x;
            nextX = Math.min(nextX, uidLeft - gap - buttonHalfWidth);
        }
        editButton.setPosition(nextX, editButton.position.y, editButton.position.z);
    }
    protected estimateProfileNicknameTextWidth(text: string, fontSize: number): number {
        let units = 0;
        for (const char of text) {
            const code = char.charCodeAt(0);
            if (code <= 0x20) {
                units += 0.35;
            } else if (code < 0x7f) {
                units += /[A-Z0-9]/.test(char) ? 0.62 : 0.55;
            } else {
                units += 1;
            }
        }
        return units * fontSize;
    }
    protected copyProfileUid(): void {
        const clipboard = (globalThis as unknown as { navigator?: { clipboard?: { writeText?: (text: string) => Promise<void> } } }).navigator?.clipboard;
        if (clipboard?.writeText) {
            void clipboard.writeText(HomeConfig.DEFAULT_UID).catch((err) => {
                console.warn('[MainHomeView] copy uid failed', err);
            });
        }
        this.showToast('UID\u5df2\u590d\u5236');
    }
    protected openCustomerServiceUrl(): void {
        const fallbackOpen = (globalThis as unknown as { open?: (url: string, target?: string) => void }).open;
        try {
            if (typeof sys.openURL === 'function') {
                sys.openURL(HomeConfig.CUSTOMER_SERVICE_URL);
                return;
            }
            if (typeof fallbackOpen === 'function') {
                fallbackOpen(HomeConfig.CUSTOMER_SERVICE_URL, '_blank');
                return;
            }
        } catch (err) {
            console.warn('[MainHomeView] open customer service failed', err);
        }
        this.showToast('\u5ba2\u670d\u94fe\u63a5\u6253\u5f00\u5931\u8d25');
    }
    protected openProfileRenameInputPopup(): void {
        this.profileRenamePendingOldName = this.profile.name || HomeConfig.DEFAULT_NAME;
        this.profileRenamePendingNewName = '';
        this.profileRenameEditBox = null;
        this.profileRenameDisplayLabel = null;
        this.openSharedFlowPopup('ConfirmPopup', {
            title: '\u7cfb\u7edf\u63d0\u793a',
            onConfirm: () => this.handleProfileRenameInputConfirm(),
        });

        const popup = this.popupRoot?.getChildByName('ConfirmPopup') || this.findNode('ConfirmPopup');
        if (!popup?.isValid) return;
        this.layoutProfileRenameInputPopup(popup);
    }
    protected layoutProfileRenameInputPopup(popup: Node): void {
        const board = this.findNode('ConfirmPopupBoard', popup);
        if (!board?.isValid) return;

        const messageNode = this.findNode('ConfirmMessage', popup);
        if (messageNode?.isValid) {
            const richText = messageNode.getComponent(RichText);
            if (richText) richText.string = '';
            const label = messageNode.getComponent(Label);
            if (label) label.string = '';
            messageNode.active = false;
        }

        const messageBg = this.findNode('ConfirmMessageBg', popup);
        if (messageBg?.isValid) messageBg.active = false;

        const quantityRoot = this.findNode('ConfirmQuantityRoot', popup);
        if (quantityRoot?.isValid) quantityRoot.active = false;

        const inputRoot = this.getOrCreateProfileRenameNode(board, 'ProfileRenameInputRoot', 470, 90, 0, 4);
        inputRoot.setSiblingIndex(5);

        const inputBg = this.getOrCreateProfileRenameNode(inputRoot, 'ProfileRenameInputBg', 420, 62, 0, 0);
        this.drawProfileRenameInputBackground(inputBg, 420, 62);
        inputBg.setSiblingIndex(0);
        this.profileRenameDisplayLabel = this.getOrCreateProfileRenameLabel(inputBg, 'ProfileRenameDisplayText', '', 28, 0, 0, 382, 48, new Color(105, 72, 48, 255));
        this.profileRenameDisplayLabel.horizontalAlign = HorizontalTextAlignment.LEFT;
        this.profileRenameDisplayLabel.overflow = Overflow.CLAMP;
        this.profileRenameDisplayLabel.node.setSiblingIndex(1);
        this.profileRenameEditBox = this.setupProfileRenameEditBox(inputBg);
        this.syncProfileRenameEditBox(this.profileRenameEditBox, '');
    }
    protected getOrCreateProfileRenameNode(parent: Node, name: string, width: number, height: number, x: number, y: number): Node {
        let node = parent.getChildByName(name);
        if (!node?.isValid) {
            node = this.createNode(name, parent, width, height, x, y);
        }
        if (node.parent !== parent) {
            node.setParent(parent);
        }
        node.active = true;
        node.setPosition(x, y, 0);
        (node.getComponent(UITransform) || node.addComponent(UITransform)).setContentSize(width, height);
        return node;
    }
    protected drawProfileRenameInputBackground(node: Node, width: number, height: number): void {
        const transform = node.getComponent(UITransform) || node.addComponent(UITransform);
        transform.setContentSize(width, height);
        const graphics = node.getComponent(Graphics) || node.addComponent(Graphics);
        graphics.clear();
        graphics.fillColor = new Color(255, 249, 229, 255);
        graphics.strokeColor = new Color(198, 170, 128, 255);
        graphics.lineWidth = 2;
        graphics.rect(-width / 2, -height / 2, width, height);
        graphics.fill();
        graphics.stroke();
    }
    protected setupProfileRenameEditBox(inputBg: Node): EditBox {
        this.hideNativeProfileRenameInputChrome();
        const width = 420;
        const height = 62;
        const editNode = this.getOrCreateProfileRenameNode(inputBg, 'EditBoxTouch', width, height, 0, 0);
        editNode.setSiblingIndex(2);

        const hiddenColor = new Color(0, 0, 0, 0);
        const textLabel = this.getOrCreateProfileRenameLabel(editNode, 'TEXT_LABEL', '', 1, 0, 0, 1, 1, hiddenColor);
        textLabel.color = hiddenColor;
        const placeholderLabel = this.getOrCreateProfileRenameLabel(editNode, 'PLACEHOLDER_LABEL', '', 1, 0, 0, 1, 1, hiddenColor);
        placeholderLabel.color = hiddenColor;

        let editBox = editNode.getComponent(EditBox);
        editBox ||= editNode.addComponent(EditBox);
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
        const hiddenTextColor = new Color(0, 0, 0, 0);

        editBoxCompat.textLabel = textLabel;
        editBoxCompat.placeholderLabel = placeholderLabel;
        editBoxCompat.inputMode = inputMode;
        editBoxCompat.inputFlag = inputFlag;
        editBoxCompat.returnType = returnType;
        editBoxCompat.fontSize = 1;
        editBoxCompat.placeholderFontSize = 1;
        editBoxCompat.fontColor = hiddenTextColor;
        editBoxCompat.placeholderFontColor = hiddenTextColor;
        editBoxCompat.cursorColor = hiddenTextColor;
        editBoxCompat.backgroundImage = null;
        editBoxCompat.placeholder = '';
        editBoxCompat.maxLength = 8;
        editBoxCompat.lineHeight = 1;
        editBoxCompat._textLabel = textLabel;
        editBoxCompat._placeholderLabel = placeholderLabel;
        editBoxCompat._inputMode = inputMode;
        editBoxCompat._inputFlag = inputFlag;
        editBoxCompat._returnType = returnType;
        editBoxCompat._fontSize = 1;
        editBoxCompat._placeholderFontSize = 1;
        editBoxCompat._fontColor = hiddenTextColor;
        editBoxCompat._placeholderFontColor = hiddenTextColor;
        editBoxCompat._cursorColor = hiddenTextColor;
        editBoxCompat._backgroundImage = null;
        editBoxCompat._placeholder = '';
        editBoxCompat._maxLength = 8;
        editBoxCompat._lineHeight = 1;

        editNode.targetOff(this);
        editNode.on(this.getProfileRenameEditBoxEventType('TEXT_CHANGED'), () => this.applyProfileRenameInput(editBox), this);
        editNode.on(this.getProfileRenameEditBoxEventType('EDITING_DID_ENDED'), () => this.applyProfileRenameInput(editBox), this);
        editNode.on(this.getProfileRenameEditBoxEventType('EDITING_RETURN'), () => this.applyProfileRenameInput(editBox), this);
        return editBox;
    }
    protected hideNativeProfileRenameInputChrome(): void {
        const doc = (globalThis as unknown as { document?: Document }).document;
        if (!doc || doc.getElementById('duxiachuan-profile-rename-input-chrome')) return;

        const style = doc.createElement('style');
        style.id = 'duxiachuan-profile-rename-input-chrome';
        style.textContent = [
            'input, textarea {',
            'caret-color: transparent !important;',
            'background: transparent !important;',
            'border: 0 !important;',
            'outline: none !important;',
            'box-shadow: none !important;',
            'color: transparent !important;',
            '}',
        ].join('');
        doc.head?.appendChild(style);
    }
    protected getOrCreateProfileRenameLabel(parent: Node, name: string, text: string, fontSize: number, x: number, y: number, width: number, height: number, color: Color): Label {
        let label = parent.getChildByName(name)?.getComponent(Label) || null;
        if (!label) {
            label = this.createLabel(parent, name, text, fontSize, x, y, width, height, color);
        } else {
            label.node.active = true;
            label.node.setPosition(x, y, 0);
            (label.node.getComponent(UITransform) || label.node.addComponent(UITransform)).setContentSize(width, height);
        }
        applySimKaiFont(label);
        label.enabled = true;
        label.string = text;
        label.fontSize = fontSize;
        label.lineHeight = fontSize + 8;
        label.color = color;
        label.horizontalAlign = HorizontalTextAlignment.CENTER;
        label.verticalAlign = VerticalTextAlignment.CENTER;
        label.enableWrapText = false;
        return label;
    }
    protected getProfileRenameEditBoxEventType(name: 'TEXT_CHANGED' | 'EDITING_DID_ENDED' | 'EDITING_RETURN'): string {
        const eventType = EditBox as unknown as { EventType?: Record<string, string> };
        return eventType.EventType?.[name] || {
            TEXT_CHANGED: 'text-changed',
            EDITING_DID_ENDED: 'editing-did-ended',
            EDITING_RETURN: 'editing-return',
        }[name];
    }
    protected applyProfileRenameInput(editBox: EditBox): void {
        if (this.profileRenameInputSyncing) return;
        const raw = editBox.string || '';
        const clean = raw.replace(/\s+/g, '').slice(0, 8);
        this.syncProfileRenameEditBox(editBox, clean);
    }
    protected syncProfileRenameEditBox(editBox: EditBox, value: string): void {
        this.profileRenameInputSyncing = true;
        const editBoxCompat = editBox as unknown as {
            string?: string;
            _string?: string;
            textLabel?: Label;
            _textLabel?: Label;
            placeholderLabel?: Label;
            _placeholderLabel?: Label;
        };
        editBoxCompat.string = value;
        editBoxCompat._string = value;
        const textLabel = editBoxCompat.textLabel || editBoxCompat._textLabel;
        if (textLabel) {
            textLabel.string = value;
            textLabel.node.active = true;
        }
        const placeholderLabel = editBoxCompat.placeholderLabel || editBoxCompat._placeholderLabel;
        if (placeholderLabel) {
            placeholderLabel.string = '';
            placeholderLabel.node.active = true;
        }
        const displayLabel = this.profileRenameDisplayLabel?.isValid
            ? this.profileRenameDisplayLabel
            : editBox.node.parent?.getChildByName('ProfileRenameDisplayText')?.getComponent(Label) || null;
        if (displayLabel) {
            this.profileRenameDisplayLabel = displayLabel;
            displayLabel.string = value;
            displayLabel.node.active = true;
        }
        this.profileRenameInputSyncing = false;
    }
    protected handleProfileRenameInputConfirm(): void {
        const newName = (this.profileRenameEditBox?.string || '').replace(/\s+/g, '').trim();
        const oldName = this.profileRenamePendingOldName || this.profile.name || HomeConfig.DEFAULT_NAME;
        this.profileRenameEditBox = null;
        if (!newName) {
            this.showToast('\u8bf7\u8f93\u5165\u65b0\u6635\u79f0');
            return;
        }
        if (newName === oldName) {
            this.showToast('\u65b0\u6635\u79f0\u4e0d\u80fd\u548c\u539f\u6635\u79f0\u76f8\u540c');
            return;
        }

        this.profileRenamePendingNewName = newName;
        this.openSharedFlowPopup('ConfirmPopup', {
            title: '\u7cfb\u7edf\u63d0\u793a',
            message: `\u662f\u5426\u6d88\u8017\u4e00\u5f20\u6539\u540d\u5361\u5c06\u539f\u6765\u7684\u540d\u5b57${oldName}\u6539\u6210${newName}\uff1f`,
            onConfirm: () => this.confirmProfileRename(),
        });
    }
    protected confirmProfileRename(): void {
        const newName = this.profileRenamePendingNewName.trim();
        if (!newName) {
            this.showToast('\u8bf7\u8f93\u5165\u65b0\u6635\u79f0');
            return;
        }

        this.ensureShopStore();
        if (!this.shopStore) return;
        const count = this.shopStore.inventory.rename_card || 0;
        if (count <= 0) {
            this.showToast('\u6539\u540d\u5361\u4e0d\u8db3');
            return;
        }

        this.shopStore.inventory.rename_card = count - 1;
        this.saveShopStore();
        this.profile.name = newName;
        this.saveProfile(this.profile);
        this.updateProfileLabels();
        this.refreshShopPanel();
        this.showToast('\u6539\u540d\u6210\u529f');
    }
    protected applyProfileTextOutline(label: Label, width: number): void {
        label.enableOutline = width > 0;
        label.outlineColor = new Color(28, 26, 22, 255);
        label.outlineWidth = width;
    }
    protected updateProfileLabels(): void {
        if (this.playerNameLabel) {
            this.playerNameLabel.string = this.profile.name;
        }
        this.refreshPersistentCurrencyHud();
        this.refreshRolePageNameLabel(this.getCurrentRoleAssetConfig(this.profile.gender));
        this.refreshProfilePopupLabels();
    }
    protected loadProfile(): RoleProfile {
        const raw = sys.localStorage.getItem(HomeConfig.PROFILE_KEY);
        if (!raw) {
            return { name: HomeConfig.DEFAULT_NAME, gender: 'male', created: false, version: HomeConfig.PROFILE_VERSION };
        }

        try {
            const parsed = JSON.parse(raw) as Partial<RoleProfile>;
            return {
                name: parsed.name || HomeConfig.DEFAULT_NAME,
                gender: parsed.gender === 'female' ? 'female' : 'male',
                created: parsed.version === HomeConfig.PROFILE_VERSION && parsed.created === true,
                version: HomeConfig.PROFILE_VERSION,
            };
        } catch (err) {
            console.warn('[MainHomeView] invalid local profile', err);
            return { name: HomeConfig.DEFAULT_NAME, gender: 'male', created: false, version: HomeConfig.PROFILE_VERSION };
        }
    }
    protected saveProfile(profile: RoleProfile): void {
        sys.localStorage.setItem(HomeConfig.PROFILE_KEY, JSON.stringify({ ...profile, version: HomeConfig.PROFILE_VERSION }));
    }
}
