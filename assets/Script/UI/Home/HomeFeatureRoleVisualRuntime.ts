import {
    Color,
    Node,
    sp,
} from 'cc';
import * as HomeConfig from './HomeConfig';
import type { RoleGender } from './HomeTypes';
import { HomeViewBase } from './HomeViewBase';

/**
 * Owns role visual selection, Spine renderer state, animation playback, and role scale application.
 */
export abstract class HomeFeatureRoleVisualRuntime extends HomeViewBase {
    protected applyCurrentRole(): void {
        const skeletonData = HomeConfig.ENABLE_ROLE_SKEL_ANIMATION ? this.roleSkeletonData.get(this.profile.gender) : null;
        if (!skeletonData) {
            this.setSkeletonVisible(this.mapSkeleton, false);
            this.setSkeletonVisible(this.previewSkeleton, false);
            this.setSkeletonVisible(this.rolePageSkeleton, false);
            return;
        }
    
        const mapAnimation = this.isRoleMoving ? 'walk' : 'idle';
        this.applySkeleton(this.mapSkeleton, skeletonData, mapAnimation, true);
        this.applySkeleton(this.previewSkeleton, skeletonData, 'idle', true);
    
        if (this.roleSpineNode) {
            this.applyRoleScale(this.roleSpineNode, this.profile.gender, this.getRoleMapScale(this.profile.gender));
        }
    
        if (this.previewSkeleton?.node) {
            this.applyRoleScale(this.previewSkeleton.node, this.profile.gender, this.getRolePreviewScale(this.profile.gender));
        }
    
        this.refreshRolePageRole();
    }
    protected hasRoleVisual(gender: RoleGender): boolean {
        return HomeConfig.ENABLE_ROLE_SKEL_ANIMATION && this.roleSkeletonData.has(gender);
    }
    protected isUsingRoleSkel(gender: RoleGender): boolean {
        return HomeConfig.ENABLE_ROLE_SKEL_ANIMATION && this.roleSkeletonData.has(gender);
    }
    protected getRoleMapScale(gender: RoleGender): number {
        return HomeConfig.ROLE_ASSETS[gender].mapScale;
    }
    protected getRolePreviewScale(gender: RoleGender): number {
        return HomeConfig.ROLE_ASSETS[gender].previewScale;
    }
    protected setSkeletonVisible(target: sp.Skeleton | null, visible: boolean): void {
        if (!target) return;
    
        target.enabled = visible;
        if (!visible) {
            target.clearTracks();
            if (target === this.mapSkeleton) {
                this.currentRoleAnimation = '';
            }
        }
    }
    protected applySkeleton(target: sp.Skeleton | null, data: sp.SkeletonData, animation: string, loop: boolean): void {
        if (!target) return;
    
        this.prepareSkeletonRenderer(target);
        target.skeletonData = data;
        try {
            target.setSkin('default');
        } catch {
            // Some exported skel assets only contain the implicit default skin.
        }
        const nextAnimation = animation === 'walk' ? 'walk' : 'idle';
        const played = this.playSkeletonAnimation(target, nextAnimation === 'walk' ? HomeConfig.WALK_ANIMATIONS : HomeConfig.IDLE_ANIMATIONS, loop);
        if (played && target === this.mapSkeleton) {
            this.currentRoleAnimation = nextAnimation;
        }
        target.updateAnimation(0);
        target.markForUpdateRenderData(true);
    }
    protected setRoleAnimation(animation: string, loop: boolean): void {
        const nextAnimation = animation === 'walk' ? 'walk' : 'idle';
        if (!this.mapSkeleton?.enabled || !this.mapSkeleton.skeletonData) return;
        if (this.currentRoleAnimation === nextAnimation) return;
    
        const played = this.playSkeletonAnimation(this.mapSkeleton, nextAnimation === 'walk' ? HomeConfig.WALK_ANIMATIONS : HomeConfig.IDLE_ANIMATIONS, loop);
        if (played) {
            this.currentRoleAnimation = nextAnimation;
        }
    }
    protected playSkeletonAnimation(target: sp.Skeleton, candidates: string[], loop: boolean): boolean {
        if (!target.skeletonData) return false;
    
        for (const animation of candidates) {
            if (!target.findAnimation(animation)) continue;
            try {
                target.clearTracks();
                target.setToSetupPose();
                const track = target.setAnimation(0, animation, loop);
                if (track) {
                    target.updateAnimation(0);
                    target.markForUpdateRenderData(true);
                    return true;
                }
            } catch {
                // Try the next common animation name used by imported Spine assets.
            }
        }
        console.warn('[MainHomeView] skel animation missing', candidates.join('|'));
        return false;
    }
    protected prepareSkeletonRenderer(target: sp.Skeleton | null): void {
        if (!target) return;
    
        target.enabled = true;
        target.node.active = true;
        target.paused = false;
        target.timeScale = 1;
        target.color = Color.WHITE;
        target.premultipliedAlpha = false;
        target.enableBatch = false;
        this.useRealtimeSkeletonMode(target);
    }
    protected useRealtimeSkeletonMode(target: sp.Skeleton): void {
        const skeleton = target as unknown as {
            setAnimationCacheMode?: (mode: number) => void;
            cacheMode?: number;
            invalidAnimationCache?: () => void;
        };
        const skeletonCtor = sp.Skeleton as unknown as {
            AnimationCacheMode?: { REALTIME?: number };
        };
        const realtimeMode = skeletonCtor.AnimationCacheMode?.REALTIME ?? 0;
    
        if (typeof skeleton.setAnimationCacheMode === 'function') {
            skeleton.setAnimationCacheMode(realtimeMode);
        } else if (typeof skeleton.cacheMode === 'number') {
            skeleton.cacheMode = realtimeMode;
        }
        if (typeof skeleton.invalidAnimationCache === 'function') {
            skeleton.invalidAnimationCache();
        }
    }
    protected applyRoleScale(node: Node, gender: RoleGender, scale: number): void {
        const isMapRole = node === this.roleSpineNode;
    
        const signedScale = isMapRole ? scale * this.roleFacing : scale;
        const config = HomeConfig.ROLE_ASSETS[gender];
        const offsetX = isMapRole
            ? config.mapOffsetX
            : config.previewOffsetX;
        const offsetY = isMapRole
            ? config.mapOffsetY
            : config.previewOffsetY;
    
        node.setScale(signedScale, scale, 1);
        node.setPosition(offsetX, offsetY, 0);
    }
}
