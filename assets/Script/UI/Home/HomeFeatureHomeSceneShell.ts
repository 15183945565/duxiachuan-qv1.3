import {
    EventTouch,
    Mask,
    Node,
    Sprite,
    Tween,
    UITransform,
    Vec3,
    sp,
    tween,
} from 'cc';
import { UI_LAYER_NAMES } from '../Common/UIConvention';
import * as HomeConfig from './HomeConfig';
import type { EntryButton } from './HomeTypes';
import { HomeViewBase } from './HomeViewBase';

/**
 * Owns the editor-authored world shell, role node wiring, entry binding, and shared button-scale feedback.
 */
export abstract class HomeFeatureHomeSceneShell extends HomeViewBase {
    protected setupGameSceneClip(): void {
        if (!this.gameSceneLayer) throw new Error('[MainHomeView] GameSceneLayer is not initialized');
        if (!this.gameSceneLayer.getComponent(UITransform) || !this.gameSceneLayer.getComponent(Mask)) {
            throw new Error('[MainHomeView] GameSceneLayer must contain editor-authored UITransform and Mask components');
        }
    }
    protected setupMapLayer(): void {
        if (!this.mapBackground || !this.roleStageNode || this.mapLayer) return;
    
        if (!this.gameSceneLayer) {
            this.gameSceneLayer = this.requireRootLayer(UI_LAYER_NAMES.gameScene);
            this.setupGameSceneClip();
        }
    
        this.mapLayer = this.gameSceneLayer.getChildByName('MapLayer');
        if (!this.mapLayer) throw new Error('[MainHomeView] editor-authored GameSceneLayer/MapLayer is missing');
        this.mapLayer.setSiblingIndex(1);
        this.mapLayer.setScale(HomeConfig.MAP_VIEW_SCALE, HomeConfig.MAP_VIEW_SCALE, 1);
        (this.mapLayer.getComponent(UITransform) || this.mapLayer.addComponent(UITransform)).setContentSize(HomeConfig.MAP_WIDTH, HomeConfig.MAP_HEIGHT);
    
        if (this.mapBackground.parent !== this.mapLayer) {
            this.mapBackground.setParent(this.mapLayer);
        }
        if (this.roleStageNode.parent !== this.mapLayer) {
            this.roleStageNode.setParent(this.mapLayer);
        }
        const wanderingMerchant = this.findNode('BtnWanderingMerchant');
        if (wanderingMerchant && wanderingMerchant.parent !== this.mapLayer) {
            wanderingMerchant.setParent(this.mapLayer);
            wanderingMerchant.setPosition(HomeConfig.WANDERING_MERCHANT_MAP_X, HomeConfig.WANDERING_MERCHANT_MAP_Y, 0);
        }
        this.mapBackground.setPosition(0, 0, 0);
        this.roleStageNode.setPosition(0, HomeConfig.ROLE_STAGE_INITIAL_Y, 0);
        this.roleStageNode.setScale(HomeConfig.ROLE_STAGE_SCALE, HomeConfig.ROLE_STAGE_SCALE, 1);
        if (wanderingMerchant) {
            this.setupWanderingMerchantSpine(wanderingMerchant);
            wanderingMerchant.setSiblingIndex(1);
            this.roleStageNode.setSiblingIndex(2);
        } else {
            this.roleStageNode.setSiblingIndex(1);
        }
        this.roleMapPosition.set(this.roleStageNode.position);
        if (this.platformNode) {
            this.platformNode.active = false;
        }
    
        const bgTransform = this.mapBackground.getComponent(UITransform);
        bgTransform?.setContentSize(HomeConfig.MAP_WIDTH, HomeConfig.MAP_HEIGHT);
    
        const bgSprite = this.mapBackground.getComponent(Sprite);
        if (bgSprite) {
            bgSprite.sizeMode = Sprite.SizeMode.CUSTOM;
        }
    
        this.sceneClickArea = this.findNode('SceneClickArea') || new Node('SceneClickArea');
        if (this.sceneClickArea.parent !== this.gameSceneLayer) {
            this.sceneClickArea.setParent(this.gameSceneLayer);
        }
        this.sceneClickArea.setPosition(0, 0, 0);
        (this.sceneClickArea.getComponent(UITransform) || this.sceneClickArea.addComponent(UITransform)).setContentSize(HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT);
        this.sceneClickArea.setSiblingIndex(0);
        this.sceneClickArea.active = false;
    
        this.mapLayer.setPosition(this.getMapFollowPosition(this.roleStageNode.position));
    }
    protected setupWanderingMerchantSpine(wanderingMerchant: Node): void {
        const skeleton = wanderingMerchant.getChildByName('MerchantSpine')?.getComponent(sp.Skeleton);
        if (!skeleton?.skeletonData) return;

        this.prepareSkeletonRenderer(skeleton);
        const listenerTarget = skeleton as unknown as {
            setCompleteListener?: (listener: ((entry: unknown) => void) | null) => void;
        };
        listenerTarget.setCompleteListener?.(null);

        const idleAnimation = HomeConfig.WANDERING_MERCHANT_IDLE_ANIMATION;
        const accentAnimation = HomeConfig.WANDERING_MERCHANT_ACCENT_ANIMATION;
        if (!skeleton.findAnimation(idleAnimation)) {
            this.playSkeletonAnimation(skeleton, [accentAnimation], true);
            return;
        }
        if (!skeleton.findAnimation(accentAnimation)) {
            this.playSkeletonAnimation(skeleton, [idleAnimation], true);
            return;
        }

        let idlePlayCount = 0;
        const playNext = (): void => {
            if (!skeleton.isValid || !wanderingMerchant.isValid || !wanderingMerchant.activeInHierarchy) {
                listenerTarget.setCompleteListener?.(null);
                return;
            }

            const shouldPlayAccent = idlePlayCount >= HomeConfig.WANDERING_MERCHANT_IDLE_REPEAT_COUNT;
            const animation = shouldPlayAccent ? accentAnimation : idleAnimation;
            idlePlayCount = shouldPlayAccent ? 0 : idlePlayCount + 1;
            try {
                skeleton.setAnimation(0, animation, false);
                skeleton.updateAnimation(0);
                skeleton.markForUpdateRenderData(true);
            } catch (err) {
                listenerTarget.setCompleteListener?.(null);
                console.warn('[MainHomeView] wandering merchant animation failed', err);
                this.playSkeletonAnimation(skeleton, [idleAnimation, accentAnimation], true);
            }
        };

        try {
            skeleton.clearTracks();
            skeleton.setToSetupPose();
            listenerTarget.setCompleteListener?.(() => playNext());
            playNext();
        } catch (err) {
            listenerTarget.setCompleteListener?.(null);
            console.warn('[MainHomeView] wandering merchant animation setup failed', err);
            this.playSkeletonAnimation(skeleton, [idleAnimation, accentAnimation], true);
        }
    }
    protected setupRoleNode(): void {
        if (!this.roleNode) return;
    
        const fallbackSprite = this.roleNode.getComponent(Sprite);
        if (fallbackSprite) {
            fallbackSprite.destroy();
        }
    
        const oldSkeleton = this.roleNode.getComponent(sp.Skeleton);
        if (oldSkeleton) {
            oldSkeleton.destroy();
        }
    
        const oldFallbackNode = this.roleNode.getChildByName('RoleFallback');
        if (oldFallbackNode) {
            oldFallbackNode.active = false;
            oldFallbackNode.destroy();
        }
    
        this.roleSpineNode = this.roleNode.getChildByName('RoleSpine') || new Node('RoleSpine');
        if (!this.roleSpineNode.parent) {
            this.roleNode.addChild(this.roleSpineNode);
        }
        if (this.roleStageNode) {
            this.roleStageNode.active = true;
        }
        this.roleNode.active = true;
        this.roleSpineNode.active = true;
        this.roleSpineNode.setPosition(0, 0, 0);
        (this.roleStageNode?.getComponent(UITransform) || this.roleStageNode?.addComponent(UITransform))?.setContentSize(HomeConfig.ROLE_RENDER_SIZE, HomeConfig.ROLE_RENDER_SIZE);
        (this.roleNode.getComponent(UITransform) || this.roleNode.addComponent(UITransform)).setContentSize(HomeConfig.ROLE_RENDER_SIZE, HomeConfig.ROLE_RENDER_SIZE);
        (this.roleSpineNode.getComponent(UITransform) || this.roleSpineNode.addComponent(UITransform)).setContentSize(HomeConfig.ROLE_RENDER_SIZE, HomeConfig.ROLE_RENDER_SIZE);
        this.roleNode.setSiblingIndex(this.roleNode.parent ? this.roleNode.parent.children.length - 1 : 0);
        this.roleSpineNode.setSiblingIndex(0);
    
        const oldSpineSprite = this.roleSpineNode.getComponent(Sprite);
        if (oldSpineSprite) {
            oldSpineSprite.destroy();
        }
        this.mapSkeleton = this.roleSpineNode.getComponent(sp.Skeleton);
        if (HomeConfig.ENABLE_ROLE_SKEL_ANIMATION) {
            this.mapSkeleton = this.mapSkeleton || this.roleSpineNode.addComponent(sp.Skeleton);
            this.prepareSkeletonRenderer(this.mapSkeleton);
            this.mapSkeleton.skeletonData = null;
            this.setSkeletonVisible(this.mapSkeleton, false);
        } else if (this.mapSkeleton) {
            this.mapSkeleton.skeletonData = null;
            this.mapSkeleton.enabled = false;
        }
        this.roleNode.setPosition(0, 0, 0);
        this.roleNode.setScale(1, 1, 1);
        this.applyRoleScale(this.roleSpineNode, this.profile.gender, this.getRoleMapScale(this.profile.gender));
    }
    protected bindMapTouch(): void {
        if (!this.gameSceneLayer) return;
    
        this.sceneClickArea?.off(Node.EventType.TOUCH_END, this.onMapTouchEnd, this);
        this.gameSceneLayer.off(Node.EventType.TOUCH_END, this.onMapTouchEnd, this);
        this.gameSceneLayer.on(Node.EventType.TOUCH_END, this.onMapTouchEnd, this);
    }
    protected bindEntry(entry: EntryButton): void {
        const target = this.findNode(entry.nodeName);
        if (!target) return;
    
        target.off(Node.EventType.TOUCH_START);
        target.off(Node.EventType.TOUCH_END);
        target.off(Node.EventType.TOUCH_CANCEL);
        this.bindScaledClick(target, () => {
            void this.triggerEntry(entry).catch((error) => {
                console.error(`[MainHomeView] failed to open entry "${entry.nodeName}"`, error);
                this.showToast('\u9875\u9762\u8d44\u6e90\u52a0\u8f7d\u5931\u8d25');
            });
        });
    }
    protected bindScaledClick(node: Node, onClick: (event: EventTouch) => void): void {
        node.off(Node.EventType.TOUCH_START);
        node.off(Node.EventType.TOUCH_END);
        node.off(Node.EventType.TOUCH_CANCEL);
        if (!this.buttonBaseScales.has(node)) {
            this.buttonBaseScales.set(node, node.scale.clone());
        }
        node.on(Node.EventType.TOUCH_START, (event: EventTouch) => {
            event.propagationStopped = true;
            this.playButtonScale(node, true);
        }, this);
        node.on(Node.EventType.TOUCH_CANCEL, (event: EventTouch) => {
            event.propagationStopped = true;
            this.playButtonScale(node, false);
        }, this);
        node.on(Node.EventType.TOUCH_END, (event: EventTouch) => {
            event.propagationStopped = true;
            this.playButtonScale(node, false);
            onClick(event);
        }, this);
    }
    protected playButtonScale(node: Node, pressed: boolean): void {
        const baseScale = this.buttonBaseScales.get(node) || node.scale.clone();
        this.buttonBaseScales.set(node, baseScale);
        const targetScale = pressed
            ? new Vec3(baseScale.x * HomeConfig.BUTTON_PRESS_SCALE, baseScale.y * HomeConfig.BUTTON_PRESS_SCALE, baseScale.z)
            : baseScale.clone();
    
        Tween.stopAllByTarget(node);
        tween(node)
            .to(pressed ? HomeConfig.BUTTON_PRESS_DURATION : HomeConfig.BUTTON_RELEASE_DURATION, { scale: targetScale }, { easing: 'sineOut' })
            .start();
    }
}
