import {
    Color,
    EventTouch,
    Graphics,
    HorizontalTextAlignment,
    Label,
    Node,
    Sprite,
    UITransform,
    Vec3,
    VerticalTextAlignment,
    sys,
} from 'cc';
import { applySimKaiFont } from '../Common/UIFont';
import * as HomeConfig from './HomeConfig';
import { HomeViewBase } from './HomeViewBase';

/**
 * Owns profile audio settings, editor bindings, sliders, mute state, and persistence.
 */
export abstract class HomeFeatureProfileSettings extends HomeViewBase {
    private static readonly PROFILE_SETTINGS_TOGGLE_TEXT_COLOR = new Color(82, 55, 42, 255);

    protected openProfileSettingsPopup(): void {
        const popup = this.ensureProfileSettingsPopup();
        popup.active = true;
        this.ensureInputBlocker(popup);
        popup.setSiblingIndex((popup.parent?.children.length || 1) - 1);
        this.refreshRootLayerOrder();
        this.loadProfileAudioSettings();
        this.refreshProfileSettingsPopup();
    }
    protected closeProfileSettingsPopup(): void {
        if (!this.profileSettingsPopupRoot?.isValid) return;
        this.profileSettingsPopupRoot.active = false;
    }
    protected ensureProfileSettingsPopup(): Node {
        const parent = this.popupRoot || this.findNode('PopupLayer') || this.node;
        let root = parent.getChildByName('ProfileSettingsPopup');
        if (root?.isValid) {
            this.bindProfileSettingsPopupFromEditor(root);
            return root;
        }

        root = this.createNode('ProfileSettingsPopup', parent, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT, 0, 0);
        root.active = false;
        this.ensureInputBlocker(root);

        const mask = this.createNode('ProfileSettingsMask', root, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT, 0, 0);
        this.drawRect(mask, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT, new Color(0, 0, 0, 0));
        this.bindScaledClick(mask, () => this.closeProfileSettingsPopup());
        mask.setSiblingIndex(0);

        const board = this.createNode(
            'ProfileSettingsBoard',
            root,
            HomeConfig.PROFILE_SETTINGS_POPUP_WIDTH,
            HomeConfig.PROFILE_SETTINGS_POPUP_HEIGHT,
            0,
            HomeConfig.PROFILE_SETTINGS_POPUP_Y,
        );
        this.ensureInputBlocker(board, HomeConfig.PROFILE_SETTINGS_POPUP_WIDTH, HomeConfig.PROFILE_SETTINGS_POPUP_HEIGHT);
        this.createSkinnedNode('ProfileSettingsBoardSkin', board, HomeConfig.PROFILE_SETTINGS_POPUP_WIDTH, HomeConfig.PROFILE_SETTINGS_POPUP_HEIGHT, 0, 0, HomeConfig.UI_PROFILE_SETTINGS_POPUP_BG).setSiblingIndex(0);
        this.createSkinnedNode('ProfileSettingsTitleBg', board, 486, 84, 0, 104, HomeConfig.UI_PROFILE_SETTINGS_TITLE_BG).setSiblingIndex(1);
        const title = this.createLabel(board, 'ProfileSettingsTitleLabel', '\u58f0\u97f3\u8bbe\u7f6e', 34, 0, 112, 280, 54, new Color(79, 70, 58, 255));
        title.node.setSiblingIndex(2);

        this.createProfileSettingsSliderRow(board, 'Music', '\u97f3\u4e50', 38, 1);
        this.createProfileSettingsSliderRow(board, 'Effect', '\u97f3\u6548', -38, 1);
        this.createProfileSettingsMuteRow(board, -114);

        this.bindProfileSettingsPopupFromEditor(root);
        return root;
    }
    protected bindProfileSettingsPopupFromEditor(root: Node): void {
        this.profileSettingsPopupRoot = root;
        const board = this.findNode('ProfileSettingsBoard', root);
        if (!board?.isValid) return;

        this.profileSettingsPopupBoard = board;
        root.active = false;
        this.ensureInputBlocker(root);
        this.ensureInputBlocker(board, HomeConfig.PROFILE_SETTINGS_POPUP_WIDTH, HomeConfig.PROFILE_SETTINGS_POPUP_HEIGHT);
        this.refreshEditorProfileSettingsPopupSkins(root, board);

        const mask = this.findNode('ProfileSettingsMask', root);
        if (mask) {
            (mask.getComponent(UITransform) || mask.addComponent(UITransform)).setContentSize(HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT);
            if (!mask.getComponent(Graphics) && !mask.getComponent(Sprite)) {
                this.drawRect(mask, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT, new Color(0, 0, 0, 0));
            }
            this.bindScaledClick(mask, () => this.closeProfileSettingsPopup());
        }

        this.bindProfileSettingsSlider('Music', (value) => this.setProfileSettingsMusicVolume(value));
        this.bindProfileSettingsSlider('Effect', (value) => this.setProfileSettingsEffectVolume(value));
        const toggle = this.findNode('ProfileSettingsMuteToggle', board);
        if (toggle) {
            this.bindScaledClick(toggle, () => this.setProfileSettingsMuted(!this.profileSettingsMuted));
        }
        this.loadProfileAudioSettings();
        this.refreshProfileSettingsPopup();
    }
    protected refreshEditorProfileSettingsPopupSkins(_root: Node, board: Node): void {
        const skin = (name: string, path: string, width: number, height: number): void => {
            const target = this.findNode(name, board);
            if (target) this.applyUiSkinKeepingEditorSize(target, path, width, height);
        };
        const skinIfMissing = (name: string, path: string, width: number, height: number): void => {
            const target = this.findNode(name, board);
            if (!target) return;
            const sprite = target.getComponent(Sprite);
            if (!sprite?.spriteFrame) this.applyUiSkinKeepingEditorSize(target, path, width, height);
        };
        skin('ProfileSettingsBoardSkin', HomeConfig.UI_PROFILE_SETTINGS_POPUP_BG, HomeConfig.PROFILE_SETTINGS_POPUP_WIDTH, HomeConfig.PROFILE_SETTINGS_POPUP_HEIGHT);
        skin('ProfileSettingsTitleBg', HomeConfig.UI_PROFILE_SETTINGS_TITLE_BG, 486, 84);
        skin('ProfileSettingsMusicSliderBg', HomeConfig.UI_PROFILE_SETTINGS_SLIDER_BG, 520, 32);
        skinIfMissing('ProfileSettingsMusicSliderFill', HomeConfig.UI_PROFILE_SETTINGS_SLIDER_FILL, 488, 8);
        skin('ProfileSettingsMusicSliderThumb', HomeConfig.UI_PROFILE_SETTINGS_SLIDER_THUMB, 34, 34);
        skin('ProfileSettingsEffectSliderBg', HomeConfig.UI_PROFILE_SETTINGS_SLIDER_BG, 520, 32);
        skinIfMissing('ProfileSettingsEffectSliderFill', HomeConfig.UI_PROFILE_SETTINGS_SLIDER_FILL, 488, 8);
        skin('ProfileSettingsEffectSliderThumb', HomeConfig.UI_PROFILE_SETTINGS_SLIDER_THUMB, 34, 34);
        skin('ProfileSettingsMuteToggle', this.profileSettingsMuted ? HomeConfig.UI_PROFILE_SETTINGS_TOGGLE_ON : HomeConfig.UI_PROFILE_SETTINGS_TOGGLE_OFF, 86, 39);
    }
    protected createProfileSettingsSliderRow(board: Node, key: 'Music' | 'Effect', labelText: string, y: number, value: number): void {
        const label = this.createLabel(board, `ProfileSettings${key}Label`, labelText, 30, -268, y, 100, 42, new Color(79, 70, 58, 255));
        label.horizontalAlign = HorizontalTextAlignment.LEFT;
        this.createSkinnedNode(`ProfileSettings${key}SliderBg`, board, 520, 32, 62, y, HomeConfig.UI_PROFILE_SETTINGS_SLIDER_BG).setSiblingIndex(3);
        this.createSkinnedNode(`ProfileSettings${key}SliderFill`, board, 488, 8, 62, y, HomeConfig.UI_PROFILE_SETTINGS_SLIDER_FILL).setSiblingIndex(4);
        this.createSkinnedNode(`ProfileSettings${key}SliderThumb`, board, 34, 34, 306, y, HomeConfig.UI_PROFILE_SETTINGS_SLIDER_THUMB).setSiblingIndex(5);
        this.refreshProfileSettingsSlider(key, value);
    }
    protected createProfileSettingsMuteRow(board: Node, y: number): void {
        const label = this.createLabel(board, 'ProfileSettingsMuteLabel', '\u9759\u97f3', 30, -268, y, 100, 42, new Color(79, 70, 58, 255));
        label.horizontalAlign = HorizontalTextAlignment.LEFT;
        const toggle = this.createSkinnedNode('ProfileSettingsMuteToggle', board, 86, 39, -176, y, HomeConfig.UI_PROFILE_SETTINGS_TOGGLE_OFF);
        toggle.setSiblingIndex(3);
        const offValue = this.createLabel(toggle, 'ProfileSettingsMuteOffLabel', '\u5173', 24, HomeConfig.PROFILE_SETTINGS_MUTE_OFF_LABEL_X, 0, 52, 30, HomeFeatureProfileSettings.PROFILE_SETTINGS_TOGGLE_TEXT_COLOR);
        offValue.horizontalAlign = HorizontalTextAlignment.CENTER;
        offValue.verticalAlign = VerticalTextAlignment.CENTER;
        offValue.node.setRotationFromEuler(0, 0, 0);
        const onValue = this.createLabel(toggle, 'ProfileSettingsMuteOnLabel', '\u5f00', 24, HomeConfig.PROFILE_SETTINGS_MUTE_ON_LABEL_X, 0, 52, 30, HomeFeatureProfileSettings.PROFILE_SETTINGS_TOGGLE_TEXT_COLOR);
        onValue.horizontalAlign = HorizontalTextAlignment.CENTER;
        onValue.verticalAlign = VerticalTextAlignment.CENTER;
        onValue.node.setRotationFromEuler(0, 0, 0);
        onValue.node.active = false;
    }
    protected bindProfileSettingsSlider(key: 'Music' | 'Effect', setter: (value: number) => void): void {
        const board = this.profileSettingsPopupBoard;
        if (!board?.isValid) return;

        const bg = this.findNode(`ProfileSettings${key}SliderBg`, board);
        const thumb = this.findNode(`ProfileSettings${key}SliderThumb`, board);
        const bindTarget = (target: Node | null): void => {
            if (!target?.isValid) return;
            target.off(Node.EventType.TOUCH_START);
            target.off(Node.EventType.TOUCH_MOVE);
            target.off(Node.EventType.TOUCH_END);
            target.off(Node.EventType.TOUCH_CANCEL);
            const update = (event: EventTouch): void => {
                event.propagationStopped = true;
                const range = this.getProfileSettingsSliderRange(key);
                const boardTransform = board.getComponent(UITransform);
                if (!boardTransform || !range || range.right <= range.left) return;
                const pos = event.getUILocation();
                const local = boardTransform.convertToNodeSpaceAR(new Vec3(pos.x, pos.y, 0));
                const value = this.clamp01((local.x - range.left) / (range.right - range.left));
                setter(value);
            };
            target.on(Node.EventType.TOUCH_START, update, this);
            target.on(Node.EventType.TOUCH_MOVE, update, this);
            target.on(Node.EventType.TOUCH_END, update, this);
            target.on(Node.EventType.TOUCH_CANCEL, (event: EventTouch) => {
                event.propagationStopped = true;
            }, this);
        };
        bindTarget(bg);
        bindTarget(thumb);
    }
    protected setProfileSettingsMusicVolume(value: number, save = true): void {
        this.profileSettingsMusicVolume = this.clamp01(value);
        this.refreshProfileSettingsSlider('Music', this.profileSettingsMusicVolume);
        if (save) this.saveProfileAudioSettings();
        this.onProfileAudioSettingsChanged(this.profileSettingsMusicVolume, this.profileSettingsEffectVolume, this.profileSettingsMuted);
    }
    protected setProfileSettingsEffectVolume(value: number, save = true): void {
        this.profileSettingsEffectVolume = this.clamp01(value);
        this.refreshProfileSettingsSlider('Effect', this.profileSettingsEffectVolume);
        if (save) this.saveProfileAudioSettings();
        this.onProfileAudioSettingsChanged(this.profileSettingsMusicVolume, this.profileSettingsEffectVolume, this.profileSettingsMuted);
    }
    protected setProfileSettingsMuted(muted: boolean, save = true): void {
        this.profileSettingsMuted = muted;
        this.refreshProfileSettingsToggle();
        if (save) this.saveProfileAudioSettings();
        this.onProfileAudioSettingsChanged(this.profileSettingsMusicVolume, this.profileSettingsEffectVolume, this.profileSettingsMuted);
    }
    protected refreshProfileSettingsPopup(): void {
        this.refreshProfileSettingsSlider('Music', this.profileSettingsMusicVolume);
        this.refreshProfileSettingsSlider('Effect', this.profileSettingsEffectVolume);
        this.refreshProfileSettingsToggle();
    }
    protected refreshProfileSettingsSlider(key: 'Music' | 'Effect', value: number): void {
        const board = this.profileSettingsPopupBoard;
        if (!board?.isValid) return;

        const bg = this.findNode(`ProfileSettings${key}SliderBg`, board);
        const fill = this.findNode(`ProfileSettings${key}SliderFill`, board);
        const thumb = this.findNode(`ProfileSettings${key}SliderThumb`, board);
        const normalized = this.clamp01(value);
        const fillSprite = fill?.getComponent(Sprite);
        if (fillSprite) {
            fillSprite.type = Sprite.Type.FILLED;
            fillSprite.fillType = Sprite.FillType.HORIZONTAL;
            fillSprite.fillStart = 0;
            fillSprite.fillRange = normalized;
        }
        const range = this.getProfileSettingsSliderRange(key);
        if (thumb?.isValid && range) {
            const { left, right } = range;
            thumb.setPosition(left + (right - left) * normalized, thumb.position.y, 0);
        }
    }
    protected getProfileSettingsSliderRange(key: 'Music' | 'Effect'): { left: number; right: number } | null {
        const board = this.profileSettingsPopupBoard;
        if (!board?.isValid) return null;
        const fill = this.findNode(`ProfileSettings${key}SliderFill`, board);
        const fillTransform = fill?.getComponent(UITransform);
        if (!fill?.isValid || !fillTransform) return null;

        const fillWidth = fillTransform.contentSize.width * Math.abs(fill.scale.x);
        const halfTravel = Math.max(0, fillWidth / 2);
        return {
            left: fill.position.x - halfTravel,
            right: fill.position.x + halfTravel,
        };
    }
    protected getProfileSettingsSliderEditorValue(key: 'Music' | 'Effect', fallback: number): number {
        const board = this.profileSettingsPopupBoard;
        if (!board?.isValid) return this.clamp01(fallback);
        const thumb = this.findNode(`ProfileSettings${key}SliderThumb`, board);
        const range = this.getProfileSettingsSliderRange(key);
        if (!thumb?.isValid || !range) return this.clamp01(fallback);

        const width = range.right - range.left;
        if (width <= 0) return this.clamp01(fallback);
        return this.clamp01((thumb.position.x - range.left) / width);
    }
    protected refreshProfileSettingsToggle(): void {
        const board = this.profileSettingsPopupBoard;
        if (!board?.isValid) return;
        const toggle = this.findNode('ProfileSettingsMuteToggle', board);
        if (toggle) {
            this.applyUiSkinKeepingEditorSize(
                toggle,
                this.profileSettingsMuted ? HomeConfig.UI_PROFILE_SETTINGS_TOGGLE_ON : HomeConfig.UI_PROFILE_SETTINGS_TOGGLE_OFF,
                86,
                39,
            );
        }
        const offValue = this.findNode('ProfileSettingsMuteOffLabel', board)?.getComponent(Label);
        const onValue = this.findNode('ProfileSettingsMuteOnLabel', board)?.getComponent(Label);
        if (offValue || onValue) {
            if (offValue) {
                applySimKaiFont(offValue);
                offValue.string = '\u5173';
                offValue.color = HomeFeatureProfileSettings.PROFILE_SETTINGS_TOGGLE_TEXT_COLOR;
                offValue.node.active = !this.profileSettingsMuted;
                offValue.node.setPosition(HomeConfig.PROFILE_SETTINGS_MUTE_OFF_LABEL_X, 0, 0);
                offValue.node.setRotationFromEuler(0, 0, 0);
                offValue.node.setSiblingIndex((offValue.node.parent?.children.length || 1) - 1);
            }
            if (onValue) {
                applySimKaiFont(onValue);
                onValue.string = '\u5f00';
                onValue.color = HomeFeatureProfileSettings.PROFILE_SETTINGS_TOGGLE_TEXT_COLOR;
                onValue.node.active = this.profileSettingsMuted;
                onValue.node.setPosition(HomeConfig.PROFILE_SETTINGS_MUTE_ON_LABEL_X, 0, 0);
                onValue.node.setRotationFromEuler(0, 0, 0);
                onValue.node.setSiblingIndex((onValue.node.parent?.children.length || 1) - 1);
            }
            const legacyValue = this.findNode('ProfileSettingsMuteValueLabel', board);
            if (legacyValue) legacyValue.active = false;
            return;
        }

        const legacyValue = this.findNode('ProfileSettingsMuteValueLabel', board)?.getComponent(Label);
        if (legacyValue) {
            applySimKaiFont(legacyValue);
            legacyValue.string = this.profileSettingsMuted ? '\u5f00' : '\u5173';
            legacyValue.color = HomeFeatureProfileSettings.PROFILE_SETTINGS_TOGGLE_TEXT_COLOR;
            legacyValue.node.setRotationFromEuler(0, 0, 0);
            legacyValue.node.setPosition(
                this.profileSettingsMuted
                    ? HomeConfig.PROFILE_SETTINGS_MUTE_ON_LABEL_X
                    : HomeConfig.PROFILE_SETTINGS_MUTE_OFF_LABEL_X,
                legacyValue.node.position.y,
                0,
            );
        }
    }
    protected loadProfileAudioSettings(): void {
        try {
            const raw = sys.localStorage.getItem(HomeConfig.PROFILE_SETTINGS_STORAGE_KEY);
            if (!raw) {
                this.profileSettingsMusicVolume = this.getProfileSettingsSliderEditorValue('Music', this.profileSettingsMusicVolume);
                this.profileSettingsEffectVolume = this.getProfileSettingsSliderEditorValue('Effect', this.profileSettingsEffectVolume);
                this.onProfileAudioSettingsChanged(this.profileSettingsMusicVolume, this.profileSettingsEffectVolume, this.profileSettingsMuted);
                return;
            }
            const parsed = JSON.parse(raw) as { musicVolume?: number; effectVolume?: number; muted?: boolean };
            this.profileSettingsMusicVolume = this.clamp01(Number(parsed.musicVolume ?? 1));
            this.profileSettingsEffectVolume = this.clamp01(Number(parsed.effectVolume ?? 1));
            this.profileSettingsMuted = Boolean(parsed.muted);
        } catch {
            this.profileSettingsMusicVolume = this.getProfileSettingsSliderEditorValue('Music', 1);
            this.profileSettingsEffectVolume = this.getProfileSettingsSliderEditorValue('Effect', 1);
            this.profileSettingsMuted = false;
        }
        this.onProfileAudioSettingsChanged(this.profileSettingsMusicVolume, this.profileSettingsEffectVolume, this.profileSettingsMuted);
    }
    protected saveProfileAudioSettings(): void {
        const payload = {
            musicVolume: this.profileSettingsMusicVolume,
            effectVolume: this.profileSettingsEffectVolume,
            muted: this.profileSettingsMuted,
        };
        sys.localStorage.setItem(HomeConfig.PROFILE_SETTINGS_STORAGE_KEY, JSON.stringify(payload));
    }
}
