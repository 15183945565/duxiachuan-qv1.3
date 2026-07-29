import {
    Color,
    EventTouch,
    Node,
    UIOpacity,
    Vec3,
    sp,
    tween,
} from 'cc';
import * as HomeConfig from './HomeConfig';
import { HomeViewBase } from './HomeViewBase';

/**
 * 跨玩法过渡遮罩、加载 Spine 与三点循环动画。
 */
export abstract class HomeFeatureTransitionLoading extends HomeViewBase {
    protected buildTransitionLoadingLayer(): void {
        if (this.transitionLoadingLayer) return;
    
        const popupParent = this.popupRoot || this.node;
        const editorLayer = popupParent.getChildByName('TransitionLoadingLayer') || this.findNode('TransitionLoadingLayer');
        this.transitionLoadingLayer = editorLayer || this.createNode('TransitionLoadingLayer', popupParent, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT, 0, 0);
        if (this.transitionLoadingLayer.parent !== popupParent) {
            this.transitionLoadingLayer.setParent(popupParent);
        }
        this.transitionLoadingLayer.active = false;
        this.transitionLoadingLayer.on(Node.EventType.TOUCH_END, (event: EventTouch) => {
            event.propagationStopped = true;
        }, this);
        this.drawRect(this.transitionLoadingLayer, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT, new Color(0, 0, 0, HomeConfig.TRANSITION_LOADING_MASK_ALPHA));
    
        const spineNode = this.createNode('TransitionLoadingSpine', this.transitionLoadingLayer, 300, 300, 0, HomeConfig.TRANSITION_LOADING_SPINE_Y);
        spineNode.setScale(-HomeConfig.TRANSITION_LOADING_SCALE, HomeConfig.TRANSITION_LOADING_SCALE, 1);
        this.transitionLoadingSkeleton = spineNode.addComponent(sp.Skeleton);
        this.prepareSkeletonRenderer(this.transitionLoadingSkeleton);
    
        const dotsRoot = this.createNode('TransitionLoadingDots', this.transitionLoadingLayer, 180, 48, 0, HomeConfig.TRANSITION_LOADING_DOTS_Y);
        [-48, 0, 48].forEach((x, index) => {
            const dot = this.createNode(`TransitionDot_${index + 1}`, dotsRoot, 22, 22, x, 0);
            const opacity = dot.addComponent(UIOpacity);
            dot.setScale(HomeConfig.TRANSITION_DOT_MIN_SCALE, HomeConfig.TRANSITION_DOT_MIN_SCALE, 1);
            opacity.opacity = HomeConfig.TRANSITION_DOT_MIN_OPACITY;
            this.drawCircle(dot, 9, new Color(255, 238, 190, 255));
        });
    }
    protected async withTransitionLoading(action: () => void | Promise<void>): Promise<void> {
        this.setTransitionLoadingVisible(true);
        try {
            await this.wait(0.42);
            await action();
            await this.wait(0.26);
        } finally {
            this.setTransitionLoadingVisible(false);
        }
    }
    protected setTransitionLoadingVisible(visible: boolean): void {
        if (!this.transitionLoadingLayer) return;
    
        this.transitionLoadingLayer.active = visible;
        if (visible) {
            this.transitionLoadingLayer.setSiblingIndex((this.transitionLoadingLayer.parent?.children.length || 1) - 1);
            if (this.transitionLoadingSkeleton) {
                this.playSkeletonAnimation(this.transitionLoadingSkeleton, HomeConfig.LOADING_ANIMATIONS, true);
            }
            this.startTransitionDots();
            return;
        }
    
        this.stopTransitionDots();
    }
    protected startTransitionDots(): void {
        this.stopTransitionDots();
        const dotsRoot = this.transitionLoadingLayer?.getChildByName('TransitionLoadingDots');
        if (!dotsRoot) return;
    
        dotsRoot.children.forEach((dot, index) => {
            const opacity = dot.getComponent(UIOpacity);
            if (!opacity) return;
    
            const delay = index * HomeConfig.TRANSITION_DOT_DELAY;
            const halfCycle = HomeConfig.TRANSITION_DOT_CYCLE_TIME / 2;
    
            dot.setScale(HomeConfig.TRANSITION_DOT_MIN_SCALE, HomeConfig.TRANSITION_DOT_MIN_SCALE, 1);
            opacity.opacity = HomeConfig.TRANSITION_DOT_MIN_OPACITY;
    
            const scaleTween = tween(dot)
                .delay(delay)
                .repeatForever(
                    tween<Node>()
                        .to(halfCycle, {
                            scale: new Vec3(HomeConfig.TRANSITION_DOT_MAX_SCALE, HomeConfig.TRANSITION_DOT_MAX_SCALE, 1),
                        }, { easing: 'sineOut' })
                        .to(halfCycle, {
                            scale: new Vec3(HomeConfig.TRANSITION_DOT_MIN_SCALE, HomeConfig.TRANSITION_DOT_MIN_SCALE, 1),
                        }, { easing: 'sineIn' }),
                )
                .start();
    
            const opacityTween = tween(opacity)
                .delay(delay)
                .repeatForever(
                    tween<UIOpacity>()
                        .to(halfCycle, { opacity: HomeConfig.TRANSITION_DOT_MAX_OPACITY }, { easing: 'sineOut' })
                        .to(halfCycle, { opacity: HomeConfig.TRANSITION_DOT_MIN_OPACITY }, { easing: 'sineIn' }),
                )
                .start();
    
            this.transitionDotTweens.push(scaleTween, opacityTween);
        });
    }
    protected stopTransitionDots(): void {
        this.transitionDotTweens.forEach((tw) => tw.stop());
        this.transitionDotTweens.length = 0;
    }
    protected wait(seconds: number): Promise<void> {
        return new Promise((resolve) => {
            this.scheduleOnce(resolve, seconds);
        });
    }
}
