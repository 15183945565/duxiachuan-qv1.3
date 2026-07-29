import {
    EventTouch,
    Tween,
    UITransform,
    Vec3,
    tween,
} from 'cc';
import * as HomeConfig from './HomeConfig';
import { HomeViewBase } from './HomeViewBase';

/**
 * Owns map touch translation, role movement/facing, camera follow bounds, and platform idle motion.
 */
export abstract class HomeFeatureWorldMovement extends HomeViewBase {
    protected onMapTouchEnd(event: EventTouch): void {
        if (this.characterPanel?.active || this.rolePagePanel?.active || this.transitionLoadingLayer?.active || !this.mapLayer || !this.roleStageNode) return;
    
        const mapTransform = this.mapLayer.getComponent(UITransform);
        if (!mapTransform) return;
    
        const uiPos = event.getUILocation();
        const local = mapTransform.convertToNodeSpaceAR(new Vec3(uiPos.x, uiPos.y, 0));
        const bounds = this.getCenteredRoleBounds();
        const target = new Vec3(
            this.clamp(local.x, bounds.minX, bounds.maxX),
            this.clamp(local.y, bounds.minY, bounds.maxY),
            0,
        );
    
        this.moveRoleTo(target);
    }
    protected moveRoleTo(target: Vec3): void {
        if (!this.roleStageNode || !this.mapLayer) return;
    
        Tween.stopAllByTarget(this.roleStageNode);
        Tween.stopAllByTarget(this.mapLayer);
    
        const start = this.roleStageNode.position.clone();
        this.updateRoleFacing(start, target);
    
        if (Vec3.distance(start, target) < 4) {
            this.roleMoveTarget = null;
            this.isRoleMoving = false;
            this.roleMapPosition.set(start);
            this.mapLayer.setPosition(this.getMapFollowPosition(start));
            this.setRoleAnimation('idle', true);
            return;
        }
    
        this.roleMoveTarget = target.clone();
        this.isRoleMoving = true;
        this.roleMapPosition.set(target.x, target.y, 0);
        this.setRoleAnimation('walk', true);
    }
    protected updateRoleFacing(start: Readonly<Vec3>, target: Readonly<Vec3>): void {
        if (Math.abs(target.x - start.x) <= 8) return;
    
        this.roleFacing = target.x >= start.x ? 1 : -1;
        if (this.roleSpineNode) {
            this.applyRoleScale(this.roleSpineNode, this.profile.gender, this.getRoleMapScale(this.profile.gender));
        }
    }
    protected updateRoleMovement(deltaTime: number): void {
        if (!this.isRoleMoving || !this.roleMoveTarget || !this.roleStageNode || !this.mapLayer) return;
    
        const current = this.roleStageNode.position;
        const target = this.roleMoveTarget;
        const distance = Vec3.distance(current, target);
        const step = HomeConfig.ROLE_MOVE_SPEED * deltaTime;
    
        if (distance <= Math.max(4, step)) {
            this.roleStageNode.setPosition(target);
            this.roleMapPosition.set(target);
            this.mapLayer.setPosition(this.getMapFollowPosition(target));
            this.roleMoveTarget = null;
            this.isRoleMoving = false;
            this.setRoleAnimation('idle', true);
            return;
        }
    
        const ratio = step / distance;
        const next = new Vec3(
            current.x + (target.x - current.x) * ratio,
            current.y + (target.y - current.y) * ratio,
            0,
        );
    
        this.roleStageNode.setPosition(next);
        this.roleMapPosition.set(next);
        this.mapLayer.setPosition(this.getMapFollowPosition(next));
        this.setRoleAnimation('walk', true);
    }
    protected updateMapFollow(): void {
        if (!this.isRoleMoving || !this.roleStageNode || !this.mapLayer) return;
    
        this.mapLayer.setPosition(this.getMapFollowPosition(this.roleStageNode.position));
    }
    protected getCenteredRoleBounds(): { minX: number; maxX: number; minY: number; maxY: number } {
        const metrics = this.getMapDisplayMetrics();
        const maxFollowX = Math.max(0, (metrics.width * metrics.mapScaleX - HomeConfig.VIEW_WIDTH) / 2);
        const maxFollowY = Math.max(0, (metrics.height * metrics.mapScaleY - HomeConfig.VIEW_HEIGHT) / 2);
        const contentScaleX = metrics.width / HomeConfig.MAP_WIDTH;
        const contentScaleY = metrics.height / HomeConfig.MAP_HEIGHT;
    
        return {
            minX: Math.max(-metrics.width / 2 + 170 * contentScaleX, -maxFollowX / metrics.mapScaleX),
            maxX: Math.min(metrics.width / 2 - 170 * contentScaleX, maxFollowX / metrics.mapScaleX),
            minY: Math.max(HomeConfig.MAP_WALKABLE_MIN_Y * contentScaleY, (HomeConfig.MAP_FOLLOW_OFFSET_Y - maxFollowY) / metrics.mapScaleY),
            maxY: Math.min(HomeConfig.MAP_WALKABLE_MAX_Y * contentScaleY, (HomeConfig.MAP_FOLLOW_OFFSET_Y + maxFollowY) / metrics.mapScaleY),
        };
    }
    protected getMapFollowPosition(rolePos: Vec3): Vec3 {
        const metrics = this.getMapDisplayMetrics();
        const scaledW = metrics.width * metrics.mapScaleX;
        const scaledH = metrics.height * metrics.mapScaleY;
        const maxX = Math.max(0, (scaledW - HomeConfig.VIEW_WIDTH) / 2);
        const maxY = Math.max(0, (scaledH - HomeConfig.VIEW_HEIGHT) / 2);
    
        return new Vec3(
            this.clamp(-rolePos.x * metrics.mapScaleX, -maxX, maxX),
            this.clamp(-rolePos.y * metrics.mapScaleY + HomeConfig.MAP_FOLLOW_OFFSET_Y, -maxY, maxY),
            0,
        );
    }
    private getMapDisplayMetrics(): { width: number; height: number; mapScaleX: number; mapScaleY: number } {
        const mapTransform = this.mapLayer?.getComponent(UITransform);
        const backgroundTransform = this.mapBackground?.getComponent(UITransform);
        const backgroundScale = this.mapBackground?.scale;
        const mapScale = this.mapLayer?.scale;
        const backgroundScaleX = Math.max(0.0001, Math.abs(backgroundScale?.x ?? 1));
        const backgroundScaleY = Math.max(0.0001, Math.abs(backgroundScale?.y ?? 1));
    
        return {
            width: Math.max(
                HomeConfig.VIEW_WIDTH,
                (backgroundTransform?.contentSize.width || mapTransform?.contentSize.width || HomeConfig.MAP_WIDTH) * backgroundScaleX,
            ),
            height: Math.max(
                HomeConfig.VIEW_HEIGHT,
                (backgroundTransform?.contentSize.height || mapTransform?.contentSize.height || HomeConfig.MAP_HEIGHT) * backgroundScaleY,
            ),
            mapScaleX: Math.max(0.0001, Math.abs(mapScale?.x ?? HomeConfig.MAP_VIEW_SCALE)),
            mapScaleY: Math.max(0.0001, Math.abs(mapScale?.y ?? HomeConfig.MAP_VIEW_SCALE)),
        };
    }
    protected playPlatformIdle(): void {
        if (!this.platformNode || !this.platformNode.active) return;
    
        const start = this.platformNode.scale.clone();
        const platformTween = tween(this.platformNode)
            .repeatForever(
                tween()
                    .to(1.5, { scale: new Vec3(start.x * 1.03, start.y * 1.03, start.z) })
                    .to(1.5, { scale: start }),
            )
            .start();
        this.idleTweens.push(platformTween);
    }
}
