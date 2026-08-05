import {
    Color,
    EventTouch,
    HorizontalTextAlignment,
    Label,
    Mask,
    Node,
    Overflow,
    Tween,
    UITransform,
    Vec3,
    VerticalTextAlignment,
    sp,
    tween,
} from 'cc';
import { applySimKaiFont } from '../Common/UIFont';
import * as HomeConfig from './HomeConfig';
import { HomeViewBase } from './HomeViewBase';
import { MagicMapMonsterRuntime } from './HomeTypes';

abstract class HomeFeatureMagicMapHost extends HomeViewBase {
    protected abstract setLabelOutline(label: Label, color: Color, width: number): void;
    protected abstract ensureMagicBattleDamageHud(): void;
    protected abstract ensureMagicBattleDuelPopup(): Node;
    protected abstract openMagicDuelResult(monster: MagicMapMonsterRuntime): void;
    protected abstract setupMagicMapAssistCards(): void;
    protected abstract closeMagicMapAssistCardConfirmPopup(): void;
    protected abstract startMagicMonsterBattle(monster: MagicMapMonsterRuntime): Promise<void>;
}

/**
 * 魔界地图节点、角色/怪物加载、拖拽移动、怪物游荡、倒计时与房间提示。
 */
export abstract class HomeFeatureMagicMap extends HomeFeatureMagicMapHost {
    protected setupMagicMapPages(): void {
        this.magicMapPanel = this.pageRoot?.getChildByName('MagicMapPanel') || this.findNode('MagicMapPanel');
        this.magicMonsterBattlePanel = this.pageRoot?.getChildByName('MagicMonsterBattlePanel') || this.findNode('MagicMonsterBattlePanel');
        if (!this.magicMapPanel?.isValid || !this.magicMonsterBattlePanel?.isValid) {
            console.warn('[MainHomeView] fixed magic map pages are missing from MainScene');
            return;
        }
    
        this.magicMapViewport = this.findNode('MagicMapViewport', this.magicMapPanel);
        this.magicMapWorld = this.findNode('MagicMapWorld', this.magicMapPanel);
        this.magicMapPlayerAnchor = this.findNode('MagicMapPlayerAnchor', this.magicMapPanel);
        this.magicMapTitleLabel = this.findNode('MagicMapTitle', this.magicMapPanel)?.getComponent(Label) || null;
        this.magicMapTimerLabel = this.findNode('MagicMapTimer', this.magicMapPanel)?.getComponent(Label) || null;
        this.magicMapStatusLabel = this.findNode('MagicMapStatus', this.magicMapPanel)?.getComponent(Label) || null;
    
        if (this.magicMapViewport) {
            (this.magicMapViewport.getComponent(UITransform) || this.magicMapViewport.addComponent(UITransform))
                .setContentSize(HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT);
            const viewportMask = this.magicMapViewport.getComponent(Mask) || this.magicMapViewport.addComponent(Mask);
            viewportMask.type = Mask.Type.GRAPHICS_RECT;
            viewportMask.enabled = true;
        }
        if (this.magicMapWorld) {
            (this.magicMapWorld.getComponent(UITransform) || this.magicMapWorld.addComponent(UITransform))
                .setContentSize(HomeConfig.MAGIC_MAP_WORLD_WIDTH, HomeConfig.MAGIC_MAP_WORLD_HEIGHT);
        }
    
        const background = this.findNode('MagicMapBackground', this.magicMapPanel);
        if (background) {
            (background.getComponent(UITransform) || background.addComponent(UITransform))
                .setContentSize(HomeConfig.MAGIC_MAP_WORLD_WIDTH, HomeConfig.MAGIC_MAP_WORLD_HEIGHT);
            this.applyUiSkin(background, HomeConfig.UI_MAGIC_FLOOR_MAP, HomeConfig.MAGIC_MAP_WORLD_WIDTH, HomeConfig.MAGIC_MAP_WORLD_HEIGHT);
        }
    
        if (this.magicMapPlayerAnchor) {
            this.magicMapPlayerSpawnPosition = this.clampMagicMapGroundPosition(this.magicMapPlayerAnchor.position, false);
            this.magicMapPlayerAnchor.setPosition(this.magicMapPlayerSpawnPosition);
            const playerScale = this.getRoleMapScale(this.profile.gender);
            const playerVisual = this.ensureMagicSkeletonVisual(this.magicMapPlayerAnchor, 'MagicMapPlayerVisual', playerScale);
            this.setMagicVisualFacing(playerVisual.node, playerScale, playerVisual.node.scale.x >= 0);
            this.magicMapPlayerVisual = playerVisual.node;
            this.magicMapPlayerSkeleton = playerVisual.skeleton;
            this.setupMagicPlayerHealthInfo();
        }
    
        this.magicMapMonsters.length = 0;
        for (let index = 0; index < HomeConfig.MAGIC_MAP_SMALL_MONSTER_COUNT; index += 1) {
            const anchor = this.ensureMagicMapMonsterAnchor(index);
            if (!anchor) continue;
            const spawnPosition = this.clampMagicMapGroundPosition(anchor.position, true);
            anchor.setPosition(spawnPosition);
            const visual = this.ensureMagicSkeletonVisual(anchor, 'MonsterVisual', HomeConfig.MAGIC_MAP_SMALL_MONSTER_SCALE);
            const maxHp = HomeConfig.MAGIC_MAP_SMALL_MONSTER_MAX_HP;
            const monster: MagicMapMonsterRuntime = {
                id: `small-${index + 1}`,
                node: anchor,
                visualNode: visual.node,
                skeleton: visual.skeleton,
                spawnPosition: spawnPosition.clone(),
                isBoss: false,
                occupiedBy: index === 2 ? '\u4e91\u6e38\u5251\u5ba2' : '',
                hp: maxHp,
                maxHp,
            };
            this.setupMagicMonsterLabel(monster, index + 1);
            this.bindMagicMonsterClick(monster);
            this.magicMapMonsters.push(monster);
        }
    
        const bossAnchor = this.findNode('MagicMapBossAnchor', this.magicMapPanel);
        if (bossAnchor) {
            const bossSpawnPosition = this.clampMagicMapGroundPosition(bossAnchor.position, true);
            bossAnchor.setPosition(bossSpawnPosition);
            const visual = this.ensureMagicSkeletonVisual(bossAnchor, 'MonsterVisual', HomeConfig.MAGIC_MAP_BOSS_MONSTER_SCALE);
            const maxHp = HomeConfig.MAGIC_MAP_BOSS_MONSTER_MAX_HP;
            const boss: MagicMapMonsterRuntime = {
                id: 'boss-1',
                node: bossAnchor,
                visualNode: visual.node,
                skeleton: visual.skeleton,
                spawnPosition: bossSpawnPosition.clone(),
                isBoss: true,
                occupiedBy: '',
                hp: maxHp,
                maxHp,
            };
            this.setupMagicMonsterLabel(boss, 1);
            this.bindMagicMonsterClick(boss);
            this.magicMapMonsters.push(boss);
        }
    
        this.setupMagicMapInput();
        const mapBack = this.findNode('MagicMapBack', this.magicMapPanel);
        if (mapBack) this.bindScaledClick(mapBack, () => this.returnToMagicScenePanel());
    
        const battleBack = this.findNode('MagicBattleBack', this.magicMonsterBattlePanel);
        if (battleBack) this.bindScaledClick(battleBack, () => this.returnToMagicScenePanel());
        this.magicBattleEnemyNameLabel = this.findNode('MagicBattleEnemyName', this.magicMonsterBattlePanel)?.getComponent(Label) || null;
        this.magicBattleEnemyHpLabel = this.findNode('MagicBattleEnemyHp', this.magicMonsterBattlePanel)?.getComponent(Label) || null;
        this.magicBattleHintLabel = this.findNode('MagicBattleHint', this.magicMonsterBattlePanel)?.getComponent(Label) || null;
        const battlePanelTransform = this.magicMonsterBattlePanel.getComponent(UITransform)
            || this.magicMonsterBattlePanel.addComponent(UITransform);
        battlePanelTransform.setContentSize(HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT);
        const battleMask = this.magicMonsterBattlePanel.getComponent(Mask) || this.magicMonsterBattlePanel.addComponent(Mask);
        battleMask.type = Mask.Type.GRAPHICS_RECT;
        battleMask.enabled = true;
    
        const battleBackgroundAnchor = this.findNode('MagicBattleBackgroundAnchor', this.magicMonsterBattlePanel);
        const battleRoleAnchor = this.findNode('MagicBattleRoleAnchor', this.magicMonsterBattlePanel);
        const battleMonsterAnchor = this.findNode('MagicBattleMonsterAnchor', this.magicMonsterBattlePanel);
        if (battleBackgroundAnchor) {
            this.ensureMagicBattleBackgroundImage(battleBackgroundAnchor);
            this.magicBattleBackgroundSkeleton = this.ensureMagicSkeletonVisual(
                battleBackgroundAnchor,
                'MagicBattleBackgroundVisual',
                HomeConfig.BATTLE_COMBAT_BG_SCALE,
            ).skeleton;
            this.setSkeletonVisible(this.magicBattleBackgroundSkeleton, false);
        }
        if (battleRoleAnchor) {
            this.magicBattleRoleSkeleton = this.ensureMagicSkeletonVisual(
                battleRoleAnchor,
                'MagicBattleRoleVisual',
                this.getRoleMapScale(this.profile.gender),
            ).skeleton;
        }
        if (battleMonsterAnchor) {
            battleMonsterAnchor.setPosition(0, 30, 0);
            this.magicBattleMonsterSkeleton = this.ensureMagicSkeletonVisual(
                battleMonsterAnchor,
                'MagicBattleMonsterVisual',
                HomeConfig.MAGIC_MAP_BOSS_MONSTER_SCALE,
            ).skeleton;
        }
        this.ensureMagicBattleDamageHud();
        this.ensureMagicBattleDuelPopup();
    
        this.magicMapPanel.active = false;
        this.magicMonsterBattlePanel.active = false;
    }
    protected ensureMagicSkeletonVisual(anchor: Node, name: string, scale: number): { node: Node; skeleton: sp.Skeleton } {
        let visual = anchor.getChildByName(name);
        if (!visual) {
            visual = this.createNode(name, anchor, 420, 420, 0, 0);
            visual.setScale(scale, scale, 1);
        }
        const skeleton = visual.getComponent(sp.Skeleton) || visual.addComponent(sp.Skeleton);
        this.prepareSkeletonRenderer(skeleton);
        this.setSkeletonVisible(skeleton, false);
        return { node: visual, skeleton };
    }
    protected ensureMagicBattleBackgroundImage(parent: Node): Node {
        let background = parent.getChildByName('MagicBattleBackgroundImage');
        if (!background) {
            background = this.createNode('MagicBattleBackgroundImage', parent, HomeConfig.VIEW_WIDTH, 1660, 0, 0);
        } else {
            background.active = true;
            background.setPosition(0, 0, 0);
            (background.getComponent(UITransform) || background.addComponent(UITransform)).setContentSize(HomeConfig.VIEW_WIDTH, 1660);
        }
        this.applyUiSkin(background, HomeConfig.UI_MAGIC_BATTLE_BG, HomeConfig.VIEW_WIDTH, 1660);
        background.setSiblingIndex(0);
        return background;
    }
    protected ensureMagicMapMonsterAnchor(index: number): Node | null {
        const nodeName = `MagicMapMonsterAnchor_${index + 1}`;
        const existing = this.findNode(nodeName, this.magicMapPanel) || this.magicMapWorld?.getChildByName(nodeName);
        if (existing?.isValid) return existing;
        if (!this.magicMapWorld?.isValid) return null;

        const fallback = HomeConfig.MAGIC_MAP_SMALL_MONSTER_SPAWN_POINTS[index] || { x: 0, y: 0 };
        return this.createNode(nodeName, this.magicMapWorld, 300, 300, fallback.x, fallback.y);
    }
    protected setupMagicPlayerHealthInfo(): void {
        if (!this.magicMapPlayerAnchor?.isValid) return;
        const hp = HomeConfig.MAGIC_MAP_PLAYER_MAX_HP;
        this.setupMagicMapHealthInfo(
            this.magicMapPlayerAnchor,
            'MagicMapPlayerHealthInfo',
            this.profile.name || HomeConfig.DEFAULT_NAME,
            hp,
            hp,
            HomeConfig.MAGIC_MAP_PLAYER_HEALTH_INFO_Y,
            HomeConfig.MAGIC_MAP_PLAYER_HEALTH_BAR_WIDTH,
            24,
        );
    }
    protected setupMagicMonsterLabel(monster: MagicMapMonsterRuntime, displayIndex: number): void {
        const legacy = monster.node.getChildByName('MonsterInfo');
        if (legacy?.isValid) legacy.destroy();

        this.setupMagicMapHealthInfo(
            monster.node,
            'MonsterHealthInfo',
            monster.isBoss ? '\u9b54\u754c\u9996\u9886' : `\u9b54\u754c\u5c0f\u5996 ${displayIndex}`,
            monster.hp,
            monster.maxHp,
            monster.isBoss ? HomeConfig.MAGIC_MAP_BOSS_HEALTH_INFO_Y : HomeConfig.MAGIC_MAP_SMALL_MONSTER_HEALTH_INFO_Y,
            monster.isBoss ? HomeConfig.MAGIC_MAP_BOSS_HEALTH_BAR_WIDTH : HomeConfig.MAGIC_MAP_MONSTER_HEALTH_BAR_WIDTH,
            monster.isBoss ? 26 : 22,
        );
    }
    protected setupMagicMapHealthInfo(parent: Node, rootName: string, displayName: string, hp: number, maxHp: number, y: number, barWidth: number, nameFontSize: number): void {
        let root = parent.getChildByName(rootName);
        if (!root) {
            root = this.createNode(rootName, parent, 340, 92, 0, y);
        } else {
            root.active = true;
            root.setPosition(0, y, 0);
            (root.getComponent(UITransform) || root.addComponent(UITransform)).setContentSize(340, 92);
        }

        const nameLabel = this.getOrCreateMagicMapHealthLabel(
            root,
            'HealthName',
            displayName,
            nameFontSize,
            0,
            30,
            HomeConfig.MAGIC_MAP_HEALTH_NAME_WIDTH,
            34,
            new Color(255, 224, 103, 255),
        );
        this.applyBattleEntryTextStyle(nameLabel, 3);

        const hpText = `${Math.max(0, Math.floor(hp))}/${Math.max(1, Math.floor(maxHp))}`;
        const valueLabel = this.getOrCreateMagicMapHealthLabel(
            root,
            'HealthValue',
            hpText,
            20,
            0,
            5,
            HomeConfig.MAGIC_MAP_HEALTH_VALUE_WIDTH,
            30,
            Color.WHITE,
        );
        this.applyBattleEntryTextStyle(valueLabel, 2);

        const frame = this.getOrCreateMagicMapHealthSkin(root, 'HealthFrame', barWidth, HomeConfig.MAGIC_MAP_HEALTH_BAR_HEIGHT, 0, -21, HomeConfig.UI_MAGIC_HP_FRAME);
        frame.setSiblingIndex(2);
        const ratio = this.clamp(maxHp > 0 ? hp / maxHp : 0, 0, 1);
        const fillWidth = Math.max(1, barWidth * ratio);
        const fill = this.getOrCreateMagicMapHealthSkin(root, 'HealthBar', fillWidth, HomeConfig.MAGIC_MAP_HEALTH_BAR_HEIGHT, -(barWidth - fillWidth) * 0.5, -21, HomeConfig.UI_MAGIC_HP_BAR);
        (fill.getComponent(UITransform) || fill.addComponent(UITransform)).setContentSize(fillWidth, HomeConfig.MAGIC_MAP_HEALTH_BAR_HEIGHT);
        fill.setPosition(-(barWidth - fillWidth) * 0.5, -21, 0);
        fill.setSiblingIndex(3);
    }
    protected getOrCreateMagicMapHealthLabel(parent: Node, name: string, text: string, fontSize: number, x: number, y: number, width: number, height: number, color: Color): Label {
        let node = parent.getChildByName(name);
        if (!node) {
            node = this.createNode(name, parent, width, height, x, y);
        } else {
            node.active = true;
            node.setPosition(x, y, 0);
            (node.getComponent(UITransform) || node.addComponent(UITransform)).setContentSize(width, height);
        }
        const label = node.getComponent(Label) || node.addComponent(Label);
        applySimKaiFont(label);
        label.enabled = true;
        label.string = text;
        label.fontSize = fontSize;
        label.lineHeight = fontSize + 8;
        label.color = color;
        label.horizontalAlign = HorizontalTextAlignment.CENTER;
        label.verticalAlign = VerticalTextAlignment.CENTER;
        label.overflow = Overflow.SHRINK;
        return label;
    }
    protected getOrCreateMagicMapHealthSkin(parent: Node, name: string, width: number, height: number, x: number, y: number, skinPath: string): Node {
        let node = parent.getChildByName(name);
        if (!node) {
            node = this.createNode(name, parent, width, height, x, y);
        } else {
            node.active = true;
            node.setPosition(x, y, 0);
            (node.getComponent(UITransform) || node.addComponent(UITransform)).setContentSize(width, height);
        }
        this.applyUiSkin(node, skinPath, width, height);
        return node;
    }
    /** Backend occupancy push hook: an empty player name means the monster is available. */
    protected syncMagicMonsterOccupancy(occupancy: Readonly<Record<string, string>>): void {
        this.magicMapMonsters.forEach((monster) => {
            monster.occupiedBy = occupancy[monster.id] || '';
            const stateLabel = monster.node.getChildByName('MonsterInfo')
                ?.getChildByName('MonsterState')
                ?.getComponent(Label);
            if (stateLabel) {
                stateLabel.string = monster.occupiedBy
                    ? `\u6218\u6597\u4e2d\u00b7${monster.occupiedBy}`
                    : '\u8840\u91cf 0/0';
            }
        });
    }
    protected bindMagicMonsterClick(monster: MagicMapMonsterRuntime): void {
        monster.node.off(Node.EventType.TOUCH_END);
        monster.node.on(Node.EventType.TOUCH_END, (event: EventTouch) => {
            event.propagationStopped = true;
            this.openMagicMonsterTarget(monster);
        }, this);
    }
    protected setupMagicMapInput(): void {
        if (!this.magicMapViewport) return;
        this.magicMapViewport.off(Node.EventType.TOUCH_START, this.onMagicMapTouchStart, this);
        this.magicMapViewport.off(Node.EventType.TOUCH_MOVE, this.onMagicMapTouchMove, this);
        this.magicMapViewport.off(Node.EventType.TOUCH_END, this.onMagicMapTouchEnd, this);
        this.magicMapViewport.off(Node.EventType.TOUCH_CANCEL, this.onMagicMapTouchEnd, this);
        this.magicMapViewport.on(Node.EventType.TOUCH_START, this.onMagicMapTouchStart, this);
        this.magicMapViewport.on(Node.EventType.TOUCH_MOVE, this.onMagicMapTouchMove, this);
        this.magicMapViewport.on(Node.EventType.TOUCH_END, this.onMagicMapTouchEnd, this);
        this.magicMapViewport.on(Node.EventType.TOUCH_CANCEL, this.onMagicMapTouchEnd, this);
    }
    protected onMagicMapTouchStart(event: EventTouch): void {
        this.magicMapTouchStartX = event.getUILocation().x;
        this.magicMapTouchTravel = 0;
        this.magicMapDragging = false;
    }
    protected onMagicMapTouchMove(event: EventTouch): void {
        if (!this.magicMapPanel?.active) return;
        const delta = event.getUIDelta();
        this.magicMapTouchTravel += Math.hypot(delta.x, delta.y);
        this.magicMapDragging = this.magicMapTouchTravel >= HomeConfig.MAGIC_MAP_DRAG_THRESHOLD;
    }
    protected onMagicMapTouchEnd(event: EventTouch): void {
        if (!this.magicMapPanel?.active || !this.magicMapWorld?.isValid) return;
        const travelFromStart = Math.abs(event.getUILocation().x - this.magicMapTouchStartX);
        if (!this.magicMapDragging && travelFromStart < HomeConfig.MAGIC_MAP_DRAG_THRESHOLD) {
            this.moveMagicMapPlayerToTouch(event);
        }
        this.magicMapDragging = false;
    }
    protected moveMagicMapPlayerToTouch(event: EventTouch): void {
        if (!this.magicMapWorld || !this.magicMapPlayerAnchor || !this.magicMapPlayerSkeleton || !this.magicMapPlayerVisual) return;
        const worldTransform = this.magicMapWorld.getComponent(UITransform);
        if (!worldTransform) return;
        const location = event.getUILocation();
        const local = worldTransform.convertToNodeSpaceAR(new Vec3(location.x, location.y, 0));
        const target = this.clampMagicMapGroundPosition(local, false);
        const start = this.magicMapPlayerAnchor.position.clone();
        const distance = Math.hypot(target.x - start.x, target.y - start.y);
        if (distance < 8) return;
    
        Tween.stopAllByTarget(this.magicMapPlayerAnchor);
        Tween.stopAllByTarget(this.magicMapWorld);
        this.setMagicVisualFacing(this.magicMapPlayerVisual, this.getRoleMapScale(this.profile.gender), target.x > start.x);
        if (!this.magicMapPlayerMoving) {
            this.magicMapPlayerMoving = true;
            this.playSkeletonAnimation(this.magicMapPlayerSkeleton, HomeConfig.WALK_ANIMATIONS, true);
        }
        const moveDuration = Math.max(distance / HomeConfig.MAGIC_MAP_PLAYER_MOVE_SPEED, 0.06);
        tween(this.magicMapPlayerAnchor)
            .to(moveDuration, { position: target }, { easing: 'linear' })
            .call(() => {
                this.magicMapPlayerMoving = false;
                if (this.magicMapPlayerSkeleton) this.playSkeletonAnimation(this.magicMapPlayerSkeleton, HomeConfig.IDLE_ANIMATIONS, true);
                this.refreshMagicMapDepth();
            })
            .start();
    
        const followX = this.clamp(-target.x, -HomeConfig.MAGIC_MAP_WORLD_X_LIMIT, HomeConfig.MAGIC_MAP_WORLD_X_LIMIT);
        const followY = this.clamp(-target.y, -HomeConfig.MAGIC_MAP_WORLD_Y_LIMIT, HomeConfig.MAGIC_MAP_WORLD_Y_LIMIT);
        tween(this.magicMapWorld)
            .to(moveDuration, { position: new Vec3(followX, followY, 0) }, { easing: 'linear' })
            .start();
    }
    protected setMagicVisualFacing(visual: Node, baseScale: number, towardRight: boolean): void {
        visual.setScale(towardRight ? baseScale : -baseScale, baseScale, 1);
    }
    protected clampMagicMapGroundPosition(position: Vec3, monster: boolean): Vec3 {
        const minX = monster ? HomeConfig.MAGIC_MAP_MONSTER_MIN_X : HomeConfig.MAGIC_MAP_PLAYER_MIN_X;
        const maxX = monster ? HomeConfig.MAGIC_MAP_MONSTER_MAX_X : HomeConfig.MAGIC_MAP_PLAYER_MAX_X;
        const minY = monster ? HomeConfig.MAGIC_MAP_MONSTER_MIN_Y : HomeConfig.MAGIC_MAP_PLAYER_MIN_Y;
        const maxY = monster ? HomeConfig.MAGIC_MAP_MONSTER_MAX_Y : HomeConfig.MAGIC_MAP_PLAYER_MAX_Y;
        return new Vec3(
            this.clamp(position.x, minX, maxX),
            this.clamp(position.y, minY, maxY),
            0,
        );
    }
    protected async openMagicMapPanel(realmIndex: number, floorIndex: number): Promise<void> {
        this.setupMagicMapPages();
        if (!this.magicMapPanel?.isValid || !this.magicMapWorld?.isValid || !this.magicMapPlayerAnchor?.isValid) return;
    
        this.closeMagicFloorPanel();
        this.closeOtherBottomEntryPages(this.magicMapPanel);
        this.stopMagicMapPlayerMovement(false);
        this.magicMapActiveRealmIndex = realmIndex;
        this.magicMapActiveFloorIndex = floorIndex;
        this.magicMapRemainingSeconds = HomeConfig.MAGIC_MAP_DURATION_SECONDS;
        this.magicMapPanel.active = true;
        this.ensureInputBlocker(this.magicMapPanel);
        this.magicMapPanel.setSiblingIndex((this.magicMapPanel.parent?.children.length || 1) - 1);
        this.magicMapPlayerMoving = false;
        this.magicMapWorld.setPosition(
            this.clamp(-this.magicMapPlayerSpawnPosition.x, -HomeConfig.MAGIC_MAP_WORLD_X_LIMIT, HomeConfig.MAGIC_MAP_WORLD_X_LIMIT),
            this.clamp(-this.magicMapPlayerSpawnPosition.y, -HomeConfig.MAGIC_MAP_WORLD_Y_LIMIT, HomeConfig.MAGIC_MAP_WORLD_Y_LIMIT),
            0,
        );
        this.magicMapPlayerAnchor.setPosition(this.clampMagicMapGroundPosition(this.magicMapPlayerSpawnPosition, false));
        this.magicMapMonsters.forEach((monster) => monster.node.setPosition(monster.spawnPosition));
        if (this.magicMapTitleLabel) {
            const realm = HomeConfig.MAGIC_SCENES[realmIndex]?.title || '\u9b54\u754c';
            const floor = HomeConfig.MAGIC_FLOOR_NAMES[floorIndex] || '\u4e00\u5c42';
            this.magicMapTitleLabel.string = `${realm}\u00b7${floor}`;
        }
        if (this.magicMapStatusLabel) this.magicMapStatusLabel.string = '\u70b9\u51fb\u5730\u9762\u79fb\u52a8\uff0c\u70b9\u51fb\u5996\u602a\u6311\u6218';
        this.refreshMagicMapTimerLabel();
        this.setupMagicMapAssistCards();
        this.closeMagicMapAssistCardConfirmPopup();
        this.refreshRootLayerOrder();
    
        const loadVersion = ++this.magicMapLoadVersion;
        try {
            await this.loadMagicMapActors(loadVersion);
            if (loadVersion !== this.magicMapLoadVersion || !this.magicMapPanel.active) return;
            this.startMagicMapWander();
            this.refreshMagicMapDepth();
        } catch (err) {
            console.warn('[MainHomeView] magic map assets not ready', err);
            if (this.magicMapStatusLabel) this.magicMapStatusLabel.string = '\u9b54\u754c\u5996\u602a\u8d44\u6e90\u52a0\u8f7d\u5931\u8d25';
            this.showToast('\u9b54\u754c\u5730\u56fe\u8d44\u6e90\u52a0\u8f7d\u5931\u8d25');
        }
    }
    protected async loadMagicMapActors(loadVersion: number): Promise<void> {
        const [smallData, bossData] = await Promise.all([
            this.loadSkeletonAsset(HomeConfig.MAGIC_MAP_SMALL_MONSTER_SKEL_PATH),
            this.loadSkeletonAsset(HomeConfig.MAGIC_MAP_BOSS_MONSTER_SKEL_PATH),
        ]);
        if (loadVersion !== this.magicMapLoadVersion) return;
    
        this.magicMapSmallMonsterData = smallData;
        this.magicMapBossMonsterData = bossData;
        const roleData = await this.ensureRoleSkeletonData(this.profile.gender);
        if (roleData && this.magicMapPlayerSkeleton?.isValid) {
            this.prepareSkeletonRenderer(this.magicMapPlayerSkeleton);
            this.magicMapPlayerSkeleton.skeletonData = roleData;
            if (this.magicMapPlayerVisual?.isValid) {
                this.setMagicVisualFacing(this.magicMapPlayerVisual, this.getRoleMapScale(this.profile.gender), this.magicMapPlayerVisual.scale.x >= 0);
            }
            this.setSkeletonVisible(this.magicMapPlayerSkeleton, true);
            this.playSkeletonAnimation(this.magicMapPlayerSkeleton, HomeConfig.IDLE_ANIMATIONS, true);
        }
    
        this.magicMapMonsters.forEach((monster) => {
            const data = monster.isBoss ? bossData : smallData;
            this.prepareSkeletonRenderer(monster.skeleton);
            monster.skeleton.skeletonData = data;
            this.setSkeletonVisible(monster.skeleton, true);
            this.playSkeletonAnimation(monster.skeleton, HomeConfig.MAGIC_MAP_IDLE_ANIMATIONS, true);
        });
    }
    protected startMagicMapWander(): void {
        this.stopMagicMapWander();
        this.magicMapMonsters.forEach((monster, index) => this.scheduleMagicMonsterWander(monster, index * 0.16));
    }
    protected scheduleMagicMonsterWander(monster: MagicMapMonsterRuntime, delay = 0): void {
        if (!this.magicMapPanel?.active || this.magicBattleActive || !monster.node.isValid) return;
        const current = monster.node.position.clone();
        const radius = monster.isBoss ? 180 : 260;
        const target = this.clampMagicMapGroundPosition(new Vec3(
            monster.spawnPosition.x + (Math.random() * 2 - 1) * radius,
            monster.spawnPosition.y + (Math.random() * 2 - 1) * radius,
            0,
        ), true);
        const distance = Math.hypot(target.x - current.x, target.y - current.y);
        const moveSpeed = monster.isBoss ? HomeConfig.MAGIC_MAP_BOSS_MONSTER_MOVE_SPEED : HomeConfig.MAGIC_MAP_SMALL_MONSTER_MOVE_SPEED;
        const duration = Math.max(distance / moveSpeed, 0.08);
        const pause = 0.7 + Math.random() * 1.8;
        const baseScale = monster.isBoss ? HomeConfig.MAGIC_MAP_BOSS_MONSTER_SCALE : HomeConfig.MAGIC_MAP_SMALL_MONSTER_SCALE;
    
        tween(monster.node)
            .delay(delay + pause)
            .call(() => {
                if (!this.magicMapPanel?.active) return;
                this.setMagicVisualFacing(monster.visualNode, baseScale, target.x > current.x);
                this.playSkeletonAnimation(monster.skeleton, HomeConfig.MAGIC_MAP_WALK_ANIMATIONS, true);
            })
            .to(duration, { position: target }, { easing: 'linear' })
            .call(() => {
                if (!this.magicMapPanel?.active) return;
                this.playSkeletonAnimation(monster.skeleton, HomeConfig.MAGIC_MAP_IDLE_ANIMATIONS, true);
                this.refreshMagicMapDepth();
                this.scheduleMagicMonsterWander(monster);
            })
            .start();
    }
    protected stopMagicMapWander(): void {
        this.magicMapMonsters.forEach((monster) => {
            if (monster.node?.isValid) Tween.stopAllByTarget(monster.node);
        });
    }
    protected stopMagicMapPlayerMovement(playIdle: boolean): void {
        if (this.magicMapPlayerAnchor?.isValid) Tween.stopAllByTarget(this.magicMapPlayerAnchor);
        if (this.magicMapWorld?.isValid) Tween.stopAllByTarget(this.magicMapWorld);
        this.magicMapPlayerMoving = false;
        if (playIdle && this.magicMapPlayerSkeleton?.isValid) {
            this.playSkeletonAnimation(this.magicMapPlayerSkeleton, HomeConfig.IDLE_ANIMATIONS, true);
        }
    }
    protected refreshMagicMapDepth(): void {
        if (!this.magicMapWorld) return;
        const actors = this.magicMapMonsters.map((monster) => monster.node);
        if (this.magicMapPlayerAnchor) actors.push(this.magicMapPlayerAnchor);
        actors
            .sort((left, right) => right.position.y - left.position.y)
            .forEach((actor, index) => actor.setSiblingIndex(index + 1));
    }
    protected updateMagicMapCountdown(deltaTime: number): void {
        if (!this.magicMapPanel?.active || this.magicBattleActive) return;
        this.magicMapRemainingSeconds = Math.max(0, this.magicMapRemainingSeconds - deltaTime);
        this.refreshMagicMapTimerLabel();
        if (this.magicMapRemainingSeconds <= 0) {
            this.showToast('\u672c\u5c42\u9b54\u754c\u6311\u6218\u65f6\u95f4\u7ed3\u675f');
            this.exitMagicMapToFloor();
        }
    }
    protected refreshMagicMapTimerLabel(): void {
        if (!this.magicMapTimerLabel) return;
        const totalSeconds = Math.ceil(this.magicMapRemainingSeconds);
        const minuteValue = Math.floor(totalSeconds / 60);
        const secondValue = totalSeconds % 60;
        const minutes = minuteValue < 10 ? `0${minuteValue}` : `${minuteValue}`;
        const seconds = secondValue < 10 ? `0${secondValue}` : `${secondValue}`;
        this.magicMapTimerLabel.string = `\u5269\u4f59\u6311\u6218\u65f6\u95f4 ${minutes}:${seconds}`;
    }
    protected exitMagicMapToFloor(): void {
        this.returnToMagicScenePanel();
    }
    protected openMagicMonsterTarget(monster: MagicMapMonsterRuntime): void {
        if (this.magicMapStatusLabel) {
            this.magicMapStatusLabel.string = monster.occupiedBy
                ? `${monster.occupiedBy}\u6b63\u5728\u6311\u6218\uff0c\u53ef\u53d1\u8d77\u5bf9\u51b3`
                : `\u5df2\u9009\u4e2d${monster.isBoss ? '\u9b54\u754c\u9996\u9886' : '\u9b54\u754c\u5c0f\u5996'}`;
        }
        this.stopMagicMapWander();
        this.openMagicMonsterRoomPrompt(monster);
    }
    protected openMagicMonsterRoomPrompt(monster: MagicMapMonsterRuntime): void {
        this.openSharedFlowPopup('ConfirmPopup', {
            title: '\u7cfb\u7edf\u63d0\u793a',
            message: '',
            onConfirm: () => {
                if (monster.occupiedBy) {
                    this.openMagicDuelResult(monster);
                    return;
                }
                void this.startMagicMonsterBattle(monster);
            },
        });

        const popup = this.popupRoot?.getChildByName('ConfirmPopup') || this.findNode('ConfirmPopup');
        if (!popup?.isValid) return;
        this.layoutMagicMonsterRoomPrompt(popup, monster);
    }
    protected layoutMagicMonsterRoomPrompt(popup: Node, monster: MagicMapMonsterRuntime): void {
        const popupTransform = popup.getComponent(UITransform) || popup.addComponent(UITransform);
        popupTransform.setContentSize(HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT);

        const board = this.getOrCreateConfirmSkin(
            popup,
            popup,
            'ConfirmPopupBoard',
            725,
            505,
            0,
            0,
            HomeConfig.UI_CONFIRM_POPUP_BG,
        );
        board.setSiblingIndex(1);

        const titleSkin = this.findNode('ConfirmPopupTitleSkin', popup);
        if (titleSkin?.isValid) {
            if (titleSkin.parent !== board) titleSkin.setParent(board);
            titleSkin.active = true;
            titleSkin.setPosition(0, 178, 0);
            (titleSkin.getComponent(UITransform) || titleSkin.addComponent(UITransform)).setContentSize(486, 84);
            this.applyUiSkinKeepingEditorSize(titleSkin, HomeConfig.UI_CONFIRM_TITLE_BG, 486, 84);
            titleSkin.setSiblingIndex(1);
        }
        const messageBg = this.findNode('ConfirmMessageBg', popup);
        this.hideConfirmNodeForMagicMonsterPrompt(messageBg);
        const messageNode = this.findNode('ConfirmMessage', popup);
        this.hideConfirmNodeForMagicMonsterPrompt(messageNode);
        const quantityRoot = this.findNode('ConfirmQuantityRoot', popup);
        this.hideConfirmNodeForMagicMonsterPrompt(quantityRoot);
        const cancel = this.findNode('ConfirmCancelButton', popup);
        this.hideConfirmNodeForMagicMonsterPrompt(cancel);
        const cancelLabel = this.findNode('ConfirmCancelButtonLabel', popup);
        this.hideConfirmNodeForMagicMonsterPrompt(cancelLabel);

        const title = this.getOrCreateConfirmLabel(
            board,
            popup,
            'ConfirmPopupTitle',
            '\u7cfb\u7edf\u63d0\u793a',
            31,
            0,
            178,
            260,
            48,
            new Color(126, 74, 36, 255),
        );
        title.lineHeight = 38;
        title.overflow = Overflow.SHRINK;
        this.setLabelOutline(title, new Color(255, 245, 215, 255), 2);
        title.node.setSiblingIndex(2);

        const monsterName = this.getMagicMonsterRoomPromptName(monster);
        const question = this.getOrCreateConfirmRichText(
            board,
            popup,
            'MagicMonsterRoomQuestion',
            `<outline color=#fff7dc width=1><color=#6f462a>\u662f\u5426\u6311\u6218</color><color=#2cad37>${this.escapeRichText(monsterName)}</color><color=#6f462a>\uff1f</color></outline>`,
            26,
            0,
            86,
            520,
            44,
        );
        question.lineHeight = 36;
        question.node.setSiblingIndex(3);

        const hpCaption = this.getOrCreateConfirmLabel(
            board,
            popup,
            'MagicMonsterRoomHpCaption',
            'BOSS\u5269\u4f59\u8840\u91cf:',
            25,
            -162,
            28,
            205,
            38,
            new Color(111, 70, 42, 255),
        );
        hpCaption.horizontalAlign = HorizontalTextAlignment.LEFT;
        hpCaption.lineHeight = 33;
        this.setLabelOutline(hpCaption, new Color(255, 247, 220, 255), 1);
        hpCaption.node.setSiblingIndex(4);

        const maxHp = Math.max(1, monster.maxHp || (monster.isBoss ? HomeConfig.MAGIC_MAP_BOSS_MONSTER_MAX_HP : HomeConfig.MAGIC_MAP_SMALL_MONSTER_MAX_HP));
        const currentHp = Math.max(0, Math.min(maxHp, monster.hp || maxHp));
        const hpRatio = currentHp / maxHp;
        const hpFrameWidth = 270;
        const hpBarWidth = 254;
        const hpFillWidth = Math.max(4, Math.round(hpBarWidth * hpRatio));
        this.getOrCreateConfirmSkin(
            board,
            popup,
            'MagicMonsterRoomHpFrame',
            hpFrameWidth,
            22,
            105,
            28,
            HomeConfig.UI_MAGIC_HP_FRAME,
        ).setSiblingIndex(5);
        this.getOrCreateConfirmSkin(
            board,
            popup,
            'MagicMonsterRoomHpBar',
            hpFillWidth,
            14,
            105 - (hpBarWidth - hpFillWidth) / 2,
            28,
            HomeConfig.UI_MAGIC_HP_BAR,
        ).setSiblingIndex(6);

        const roomCount = monster.occupiedBy ? 1 : 0;
        const roomLabel = this.getOrCreateConfirmLabel(
            board,
            popup,
            'MagicMonsterRoomCount',
            `\u5f53\u524d\u623f\u95f4\u4eba\u6570\uff1a${roomCount}`,
            25,
            -88,
            -30,
            380,
            38,
            new Color(111, 70, 42, 255),
        );
        roomLabel.horizontalAlign = HorizontalTextAlignment.LEFT;
        roomLabel.lineHeight = 33;
        this.setLabelOutline(roomLabel, new Color(255, 247, 220, 255), 1);
        roomLabel.node.setSiblingIndex(7);

        this.layoutMagicMonsterRoomButton(popup, '\u8fdb\u5165\u623f\u95f4');

        const close = this.findNode('ConfirmPopupClose', popup);
        if (close?.isValid) {
            if (close.parent !== board) close.setParent(board);
            close.active = true;
            close.setScale(1, 1, 1);
            close.setPosition(306, 214, 0);
            (close.getComponent(UITransform) || close.addComponent(UITransform)).setContentSize(62, 62);
            this.applyUiSkinKeepingEditorSize(close, HomeConfig.UI_BTN_CLOSE, 62, 62);
            close.setSiblingIndex(10);
            this.bindScaledClick(close, () => {
                this.closeSharedFlowPopup(popup);
                this.startMagicMapWander();
            });
        }
    }
    protected layoutMagicMonsterRoomButton(popup: Node, text: string): void {
        const button = this.findNode('ConfirmAcceptButton', popup);
        if (!button?.isValid) return;

        const board = this.findNode('ConfirmPopupBoard', popup);
        if (board?.isValid && button.parent !== board) button.setParent(board);
        button.active = true;
        button.setPosition(0, -128, 0);
        (button.getComponent(UITransform) || button.addComponent(UITransform)).setContentSize(162, 62);
        this.applyUiSkinKeepingEditorSize(button, HomeConfig.UI_CONFIRM_MAGIC_BUTTON, 162, 62);
        button.setSiblingIndex(8);

        const labelNode = this.findNode('ConfirmAcceptButtonLabel', button) || this.findNode('ConfirmAcceptButtonLabel', popup);
        const label = labelNode?.getComponent(Label);
        if (!labelNode?.isValid || !label) return;
        labelNode.active = true;
        if (labelNode.parent !== button) labelNode.setParent(button);
        labelNode.setPosition(0, 1, 0);
        (labelNode.getComponent(UITransform) || labelNode.addComponent(UITransform)).setContentSize(134, 42);
        label.string = text;
        label.fontSize = 27;
        label.lineHeight = 36;
        label.color = new Color(42, 22, 8, 255);
        label.horizontalAlign = HorizontalTextAlignment.CENTER;
        label.verticalAlign = VerticalTextAlignment.CENTER;
        this.setMagicFloorTextEdge(label, false);
        label.node.setSiblingIndex(1);
    }
    protected hideConfirmNodeForMagicMonsterPrompt(node: Node | null): void {
        if (!node?.isValid) return;

        this.skinApplyVersions.set(node, ++this.skinApplyVersion);
        node.active = false;
        node.setPosition(-9999, -9999, 0);
    }
    protected getMagicMonsterRoomPromptName(monster: MagicMapMonsterRuntime): string {
        if (monster.isBoss) return '\u9b54\u754c\u9996\u9886';
        const match = /^small-(\d+)$/.exec(monster.id);
        const index = match ? Number(match[1]) : Math.max(1, this.magicMapMonsters.filter((item) => !item.isBoss).indexOf(monster) + 1);
        return `\u9ab7\u9ac5\u6218\u5c06${index}\u53f7`;
    }
}
