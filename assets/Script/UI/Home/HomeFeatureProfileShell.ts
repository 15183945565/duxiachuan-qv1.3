import {
    Color,
    EventTouch,
    Graphics,
    HorizontalTextAlignment,
    Label,
    Node,
    Overflow,
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
            this.bindScaledClick(editButton, () => this.showToast('\u6539\u540d\u529f\u80fd\u9884\u7559'));
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
        this.bindScaledClick(editButton, () => this.showToast('\u6539\u540d\u529f\u80fd\u9884\u7559'));

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
