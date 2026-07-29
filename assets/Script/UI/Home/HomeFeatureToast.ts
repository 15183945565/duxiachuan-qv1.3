import {
    HorizontalTextAlignment,
    Overflow,
    Sprite,
    UITransform,
    VerticalTextAlignment,
} from 'cc';
import * as HomeConfig from './HomeConfig';
import { HomeViewBase } from './HomeViewBase';

/**
 * Owns toast visibility, sizing, sibling order, scheduling, and background skin loading.
 */
export abstract class HomeFeatureToast extends HomeViewBase {
    protected showToast(message: string): void {
        if (!this.toastLabel) return;
    
        this.toastLabel.string = message;
        this.toastLabel.node.active = true;
        this.refreshToastBackground(message);
        this.unschedule(this.hideToast);
        this.scheduleOnce(this.hideToast, 1.4);
    }
    protected hideToast(): void {
        if (!this.toastLabel) return;
    
        this.toastLabel.string = '';
        this.toastLabel.node.active = false;
        if (this.toastBackground?.isValid) {
            this.toastBackground.active = false;
        }
    }
    protected setupToastBackground(): void {
        const labelNode = this.toastLabel?.node;
        const parent = this.uiHudLayer || labelNode?.parent || null;
        if (!labelNode || !parent) return;

        const bg = parent.getChildByName('ToastBg');
        if (!bg) throw new Error('[MainHomeView] editor-authored ToastLayer/ToastBg is missing');
        const bgSprite = bg.getComponent(Sprite);
        if (bgSprite && !bgSprite.spriteFrame) {
            bgSprite.enabled = false;
        }
        bg.active = false;
        this.toastBackground = bg;
        this.alignToastLayerOrder();
        this.loadToastBackgroundSkin();
    }
    protected refreshToastBackground(message: string): void {
        this.setupToastBackground();
        const labelNode = this.toastLabel?.node;
        const bg = this.toastBackground;
        if (!labelNode || !bg?.isValid || !this.toastLabel) return;

        const width = this.getToastBackgroundWidth(message);
        const textWidth = Math.max(1, width - HomeConfig.TOAST_TEXT_HORIZONTAL_PADDING);
        const labelTransform = labelNode.getComponent(UITransform) || labelNode.addComponent(UITransform);
        labelTransform.setContentSize(textWidth, HomeConfig.TOAST_TEXT_HEIGHT);
        this.toastLabel.horizontalAlign = HorizontalTextAlignment.CENTER;
        this.toastLabel.verticalAlign = VerticalTextAlignment.CENTER;
        this.toastLabel.overflow = Overflow.SHRINK;
        this.toastLabel.lineHeight = HomeConfig.TOAST_TEXT_HEIGHT;

        const bgTransform = bg.getComponent(UITransform) || bg.addComponent(UITransform);
        bgTransform.setContentSize(width, HomeConfig.TOAST_BG_HEIGHT);
        bg.setPosition(labelNode.position);
        bg.active = true;
        this.alignToastLayerOrder();
    }
    protected alignToastLayerOrder(): void {
        const labelNode = this.toastLabel?.node;
        const bg = this.toastBackground;
        const parent = labelNode?.parent || null;
        if (!labelNode || !bg?.isValid || !parent || bg.parent !== parent) return;

        const labelIndex = parent.children.indexOf(labelNode);
        bg.setSiblingIndex(Math.max(0, labelIndex));
        labelNode.setSiblingIndex(Math.min(parent.children.length - 1, labelIndex + 1));
    }
    protected getToastBackgroundWidth(message: string): number {
        const fontSize = this.toastLabel?.fontSize || 26;
        let weight = 0;
        for (const char of Array.from(message)) {
            const code = char.codePointAt(0) || 0;
            weight += code <= 0x7f ? 0.56 : code <= 0xff ? 0.72 : 1;
        }
        const estimated = Math.ceil(weight * fontSize + HomeConfig.TOAST_TEXT_HORIZONTAL_PADDING);
        return this.clamp(estimated, HomeConfig.TOAST_BG_MIN_WIDTH, HomeConfig.TOAST_BG_MAX_WIDTH);
    }
    protected loadToastBackgroundSkin(): void {
        if (this.toastBackgroundSkinLoaded || this.toastBackgroundSkinLoading) return;
        const bg = this.toastBackground;
        if (!bg?.isValid) return;

        this.toastBackgroundSkinLoading = true;
        const apply = (): Promise<void> => this.loadSpriteFrameAsset(HomeConfig.UI_TOAST_BG)
            .then((spriteFrame) => {
                if (!bg.isValid) return;
                const transform = bg.getComponent(UITransform) || bg.addComponent(UITransform);
                const size = transform.contentSize;
                const shouldShow = bg.active;
                this.applySpriteFrameToNode(
                    bg,
                    spriteFrame,
                    size.width > 0 ? size.width : HomeConfig.TOAST_BG_MIN_WIDTH,
                    size.height > 0 ? size.height : HomeConfig.TOAST_BG_HEIGHT,
                );
                bg.active = shouldShow;
                const sprite = bg.getComponent(Sprite);
                if (sprite) {
                    sprite.type = Sprite.Type.SIMPLE;
                    sprite.sizeMode = Sprite.SizeMode.CUSTOM;
                }
                this.toastBackgroundSkinLoaded = true;
            });
        const finish = (): void => {
            this.toastBackgroundSkinLoading = false;
        };
        const onFail = (err: unknown): void => {
            console.warn('[MainHomeView] toast bg load failed', err);
        };

        if (this.resBundle) {
            void apply().then(finish, (err) => {
                onFail(err);
                finish();
            });
            return;
        }

        void this.acquireHomeSharedBundle()
            .then((bundle) => {
                return apply();
            })
            .then(finish, (err) => {
                onFail(err);
                finish();
            });
    }
}
