import {
    Color,
    HorizontalTextAlignment,
    Label,
    Node,
    Overflow,
    Size,
    Tween,
    tween,
    UITransform,
    Vec3,
    sp,
} from 'cc';
import * as HomeConfig from './HomeConfig';
import { HomeViewBase } from './HomeViewBase';

type DuelJianghuRoomConfig = typeof HomeConfig.DUEL_JIANGHU_ROOM_LABELS[number];
type DuelJianghuRoomId = DuelJianghuRoomConfig['id'];
type DuelJianghuActorKind = 'common' | 'lobbyCommon' | 'player' | 'assassin' | 'doubleMale' | 'doubleFemale' | 'rebel' | 'guardSoldier' | 'general';
type DuelJianghuActorAnimation = 'walk' | 'stand' | 'attack' | 'hurt' | 'dead';
type DuelJianghuActorRuntime = {
    node: Node;
    kind: DuelJianghuActorKind;
    roomId?: DuelJianghuRoomId;
    skeleton?: sp.Skeleton | null;
};
type DuelJianghuRoundOutcome = {
    success: boolean;
    modeName: string;
    targetRoomNames: string[];
    investAmount: number;
    rewardAmount: number;
    description: string;
};
type DuelJianghuRoundPlan = DuelJianghuRoundOutcome & {
    targetRoomIds: DuelJianghuRoomId[];
    killerKinds: DuelJianghuActorKind[];
    specialKind?: DuelJianghuActorKind;
};
type DuelJianghuConfrontPositions = {
    special: Vec3;
    killer: Vec3;
};

abstract class HomeFeatureDuelActorRuntimeHost extends HomeViewBase {
    protected abstract readonly duelJianghuActors: DuelJianghuActorRuntime[];
    protected abstract duelJianghuLobbyPlayerPromise: Promise<DuelJianghuActorRuntime | null> | null;
    protected abstract duelJianghuNpcSpawnInProgress: boolean;
    protected abstract duelJianghuPlayerActor: DuelJianghuActorRuntime | null;
    protected abstract duelJianghuPreviewActive: boolean;
    protected abstract duelJianghuRoundActive: boolean;
    protected abstract readonly duelJianghuSkeletonData: Map<DuelJianghuActorKind, sp.SkeletonData>;

    protected abstract getDuelJianghuRoomById(roomId: DuelJianghuRoomId | ''): DuelJianghuRoomConfig | null;
    protected abstract getOrCreateDuelRoomLabel(parent: Node, name: string, text: string, fontSize: number, x: number, y: number, width: number, height: number, color: Color): Label;
    protected abstract getOrCreateEditorNode(name: string, parent: Node, width: number, height: number, x: number, y: number): Node;
    protected abstract getOrCreateEditorSkinnedNode(name: string, parent: Node, width: number, height: number, x: number, y: number, skinPath: string): Node;
    protected abstract setLabelOutline(label: Label, color: Color, width: number): void;
}

/**
 * 江湖逃杀演员资源、Spine 动画、攻击序列、移动路线和空间计算运行时。
 * 状态仍由 RoleBag 初始化器持有，规则与结果计算由独立回合模块负责。
 */
export abstract class HomeFeatureDuelActorRuntime extends HomeFeatureDuelActorRuntimeHost {
    protected async ensureDuelJianghuNpcCrowd(page: Node, force = false): Promise<void> {
        if (this.duelJianghuNpcSpawnInProgress && !force) return;
        const existingNpcs = this.duelJianghuActors.filter((actor) => actor.node.isValid && actor.kind === 'common');
        const existingLobbyNpcs = this.duelJianghuActors.filter((actor) => actor.node.isValid && actor.kind === 'lobbyCommon');
        const existingPlayer = this.duelJianghuPlayerActor?.node.isValid ? this.duelJianghuPlayerActor : null;
        const expected = HomeConfig.DUEL_JIANGHU_ROOM_LABELS.length * HomeConfig.DUEL_JIANGHU_NPC_PER_ROOM;
        const expectedLobby = HomeConfig.DUEL_JIANGHU_LOBBY_NPC_COUNT;
        if (!force && existingNpcs.length >= expected && existingLobbyNpcs.length >= expectedLobby && existingPlayer) return;

        if (force || existingNpcs.length > expected) {
            this.removeDuelJianghuActors(page, (actor) => actor.kind === 'common');
        }
        if (force || existingLobbyNpcs.length > expectedLobby) {
            this.removeDuelJianghuActors(page, (actor) => actor.kind === 'lobbyCommon');
        }
        if (force && existingPlayer && !this.duelJianghuRoundActive) {
            this.removeDuelJianghuActors(page, (actor) => actor.kind === 'player');
        }

        this.duelJianghuNpcSpawnInProgress = true;
        try {
            const actorLayer = this.getDuelJianghuActorLayer(page);
            await this.ensureDuelJianghuLobbyPlayer(page, true, actorLayer);
            for (const room of HomeConfig.DUEL_JIANGHU_ROOM_LABELS) {
                const currentCount = this.duelJianghuActors.filter((actor) => actor.kind === 'common' && actor.roomId === room.id && actor.node.isValid).length;
                for (let index = currentCount; index < HomeConfig.DUEL_JIANGHU_NPC_PER_ROOM; index += 1) {
                    if (!page.active) return;
                    const position = this.getDuelJianghuRoomGridPoint(page, room.id, index);
                    await this.createDuelJianghuActor('common', actorLayer, `JianghuActor_Npc_${room.id}_${index}`, position, room.id, '...');
                }
            }
            const currentLobbyCount = this.duelJianghuActors.filter((actor) => actor.kind === 'lobbyCommon' && actor.node.isValid).length;
            for (let index = currentLobbyCount; index < expectedLobby; index += 1) {
                if (!page.active) return;
                const position = this.getDuelJianghuLobbyPoint(page, index);
                await this.createDuelJianghuActor('lobbyCommon', actorLayer, `JianghuLobby_Npc_${index}`, position, undefined, '...');
            }
        } finally {
            this.duelJianghuNpcSpawnInProgress = false;
        }
    }
    protected async ensureDuelJianghuLobbyPlayer(page: Node, reuseCurrent = true, actorLayer?: Node): Promise<DuelJianghuActorRuntime | null> {
        const current = this.duelJianghuPlayerActor;
        if (reuseCurrent && current?.node.isValid) {
            current.node.active = true;
            this.playDuelJianghuActorAnimation(current, 'stand', true);
            return current;
        }

        const existingPlayer = this.duelJianghuActors.find((actor) => actor.kind === 'player' && actor.node.isValid) || null;
        if (reuseCurrent && existingPlayer) {
            this.duelJianghuPlayerActor = existingPlayer;
            existingPlayer.node.active = true;
            this.playDuelJianghuActorAnimation(existingPlayer, 'stand', true);
            return existingPlayer;
        }

        if (this.duelJianghuLobbyPlayerPromise) return this.duelJianghuLobbyPlayerPromise;

        const layer = actorLayer || this.getDuelJianghuActorLayer(page);
        this.duelJianghuLobbyPlayerPromise = (async () => {
            if (!page.active || !page.isValid) return null;
            const player = await this.createDuelJianghuActor(
                'player',
                layer,
                'JianghuActor_Player_Lobby',
                this.getDuelJianghuPlayerStartPoint(page),
                undefined,
                '\u81ea\u5df1',
            );
            if (player) {
                this.duelJianghuPlayerActor = player;
                this.playDuelJianghuActorAnimation(player, 'stand', true);
            }
            return player;
        })();

        try {
            return await this.duelJianghuLobbyPlayerPromise;
        } finally {
            this.duelJianghuLobbyPlayerPromise = null;
        }
    }
    protected async playDuelJianghuKillerSequence(page: Node, plan: DuelJianghuRoundPlan): Promise<void> {
        const actorLayer = this.getDuelJianghuActorLayer(page);
        const confrontPositions = new Map<DuelJianghuRoomId, DuelJianghuConfrontPositions>();
        const specialActorByRoom = new Map<DuelJianghuRoomId, DuelJianghuActorRuntime>();
        if (plan.specialKind) {
            for (const roomId of plan.targetRoomIds) {
                const positions = this.getDuelJianghuConfrontPositions(page, roomId);
                confrontPositions.set(roomId, positions);
                const special = await this.createDuelJianghuActor(plan.specialKind, actorLayer, `JianghuSpecial_${plan.specialKind}_${roomId}`, positions.special, roomId, '');
                if (special) {
                    specialActorByRoom.set(roomId, special);
                    this.faceDuelJianghuActorTo(special, positions.killer);
                }
            }
            await this.waitDuelJianghuSeconds(0.35);
        }

        const killerActors = await Promise.all(plan.targetRoomIds.map((roomId, index) => {
            const killerKind = plan.killerKinds[index] || plan.killerKinds[0] || 'assassin';
            const positions = confrontPositions.get(roomId);
            const specialTarget = specialActorByRoom.get(roomId);
            const onAttackHit = specialTarget && (plan.specialKind === 'guardSoldier' || plan.specialKind === 'general')
                ? () => {
                    if (!specialTarget.node.isValid) return;
                    if (positions) this.faceDuelJianghuActorTo(specialTarget, positions.killer);
                    this.playDuelJianghuActorAnimation(specialTarget, 'hurt', false);
                }
                : undefined;
            return this.playDuelJianghuKillerAttack(page, roomId, killerKind, positions?.killer, positions?.special, onAttackHit);
        }));

        const specialActors = Array.from(specialActorByRoom.values())
            .filter((actor) => actor.node.isValid && (actor.kind === 'guardSoldier' || actor.kind === 'general'));

        if (plan.specialKind === 'guardSoldier') {
            specialActors.forEach((actor) => this.playDuelJianghuActorAnimation(actor, 'dead', false));
        } else if (plan.specialKind === 'general') {
            specialActors.forEach((actor) => {
                const positions = actor.roomId ? confrontPositions.get(actor.roomId) : null;
                if (positions) this.faceDuelJianghuActorTo(actor, positions.killer);
                this.playDuelJianghuActorAnimation(actor, 'attack', false);
            });
            await this.waitDuelJianghuSeconds(HomeConfig.DUEL_JIANGHU_COUNTER_HIT_DELAY);
            killerActors
                .filter((actor): actor is DuelJianghuActorRuntime => !!actor && actor.node.isValid && actor.kind === 'rebel')
                .forEach((actor) => this.playDuelJianghuActorAnimation(actor, 'dead', false));
        }
        if (plan.specialKind) await this.waitDuelJianghuSeconds(HomeConfig.DUEL_JIANGHU_ATTACK_WAIT_TIME);
        const finishedKillers = new Set(killerActors.filter((actor): actor is DuelJianghuActorRuntime => !!actor && actor.node.isValid));
        this.removeDuelJianghuActors(page, (actor) => finishedKillers.has(actor));
    }
    protected async playDuelJianghuKillerAttack(
        page: Node,
        roomId: DuelJianghuRoomId,
        kind: DuelJianghuActorKind,
        targetOverride?: Vec3,
        faceTarget?: Vec3,
        onAttackHit?: (attacker: DuelJianghuActorRuntime, hitIndex: number) => void,
    ): Promise<DuelJianghuActorRuntime | null> {
        const room = this.getDuelJianghuRoomById(roomId);
        if (!room) return null;
        const actorLayer = this.getDuelJianghuActorLayer(page);
        const start = this.getDuelJianghuRouteStartPoint(page);
        const target = targetOverride?.clone() || this.getDuelJianghuRoomRandomPoint(page, room.id, 0.28);
        const killer = await this.createDuelJianghuActor(kind, actorLayer, `JianghuKiller_${kind}_${room.id}`, start, room.id, '');
        if (!killer) return null;
        await this.moveDuelJianghuActorIntoRoom(page, killer, room.id, target, HomeConfig.DUEL_JIANGHU_KILLER_WALK_STEP_TIME, faceTarget);
        if (faceTarget) this.faceDuelJianghuActorTo(killer, faceTarget);
        await this.playDuelJianghuKillerAttackAnimation(killer, onAttackHit);
        return killer;
    }
    protected async moveDuelJianghuCommonActorsOut(page: Node, killedRoomIds: DuelJianghuRoomId[] = []): Promise<void> {
        const killedRooms = new Set<DuelJianghuRoomId>(killedRoomIds);
        const walkers = this.duelJianghuActors.filter((actor) => actor.node.isValid && (actor.kind === 'common' || (actor.kind === 'player' && !!actor.roomId)));
        await Promise.all(walkers.map((actor, index) => {
            const target = this.getDuelJianghuLobbyPoint(page, HomeConfig.DUEL_JIANGHU_LOBBY_NPC_COUNT + index);
            if (actor.roomId && killedRooms.has(actor.roomId)) {
                this.refreshDuelJianghuActorToLobby(actor, target);
                return Promise.resolve();
            }
            return this.moveDuelJianghuActorOutToLobby(
                page,
                actor,
                target,
                HomeConfig.DUEL_JIANGHU_ACTOR_WALK_STEP_TIME + (index % 4) * 0.05,
            );
        }));
    }
    protected refreshDuelJianghuActorToLobby(actor: DuelJianghuActorRuntime, target: Vec3): void {
        if (!actor.node.isValid) return;
        this.stopDuelJianghuActorTweens(actor.node);
        actor.node.active = true;
        actor.node.setPosition(target);
        actor.roomId = undefined;
        this.playDuelJianghuActorAnimation(actor, 'stand', true);
    }
    protected async prepareDuelJianghuRoomActorsForRound(page: Node): Promise<void> {
        await this.ensureDuelJianghuNpcCrowd(page);
        if (!page.active || this.duelJianghuPreviewActive) return;

        const rooms = HomeConfig.DUEL_JIANGHU_ROOM_LABELS;
        const walkers = this.duelJianghuActors.filter((actor) => actor.node.isValid && actor.kind === 'common' && !actor.roomId);
        await Promise.all(walkers.map((actor, index) => {
            const room = rooms[index % rooms.length];
            if (!room) return Promise.resolve();
            const slotIndex = Math.floor(index / rooms.length);
            const target = this.getDuelJianghuRoomGridPoint(page, room.id, slotIndex);
            return this.moveDuelJianghuActorIntoRoom(
                page,
                actor,
                room.id,
                target,
                HomeConfig.DUEL_JIANGHU_ACTOR_WALK_STEP_TIME + (index % 4) * 0.04,
            );
        }));
    }
    protected async createDuelJianghuActor(
        kind: DuelJianghuActorKind,
        actorLayer: Node,
        name: string,
        position: Vec3,
        roomId?: DuelJianghuRoomId,
        labelText = '...',
    ): Promise<DuelJianghuActorRuntime | null> {
        let skeletonData: sp.SkeletonData;
        try {
            skeletonData = await this.loadDuelJianghuSkeletonData(kind);
        } catch (err) {
            console.warn('[MainHomeView] duel jianghu skeleton load failed', kind, err);
            return null;
        }

        const actorNode = this.createNode(`${name}_${Date.now()}_${Math.floor(Math.random() * 10000)}`, actorLayer, 90, 118, position.x, position.y);
        actorNode.setSiblingIndex((actorLayer.children.length || 1) - 1);

        const spineNode = this.createNode('JianghuActorSpine', actorNode, 90, 118, 0, 0);
        const scale = this.getDuelJianghuActorScale(kind);
        spineNode.setScale(scale, scale, 1);
        const skeleton = spineNode.addComponent(sp.Skeleton);
        skeleton.skeletonData = skeletonData;
        this.prepareSkeletonRenderer(skeleton);
        this.prepareDuelJianghuSkeletonSkin(skeleton);

        const nameLabel = this.getOrCreateDuelRoomLabel(
            actorNode,
            'JianghuActorNameLabel',
            labelText,
            kind === 'player' ? 20 : 18,
            0,
            HomeConfig.DUEL_JIANGHU_ACTOR_LABEL_Y,
            84,
            28,
            kind === 'player' ? new Color(255, 244, 140, 255) : new Color(235, 241, 255, 255),
        );
        nameLabel.node.active = !!labelText;
        nameLabel.horizontalAlign = HorizontalTextAlignment.CENTER;
        nameLabel.overflow = Overflow.SHRINK;
        this.setLabelOutline(nameLabel, new Color(20, 24, 30, 255), 2);
        nameLabel.node.setSiblingIndex(1);

        const actor: DuelJianghuActorRuntime = { node: actorNode, kind, roomId, skeleton };
        if (kind === 'player') this.attachDuelJianghuPlayerArrow(actor);
        const startsInsideRoom = kind === 'common' || kind === 'lobbyCommon' || kind === 'guardSoldier' || kind === 'general';
        this.playDuelJianghuActorAnimation(actor, startsInsideRoom ? 'stand' : 'walk', true);
        this.duelJianghuActors.push(actor);
        return actor;
    }
    protected attachDuelJianghuPlayerArrow(actor: DuelJianghuActorRuntime): void {
        const arrow = this.getOrCreateEditorSkinnedNode(
            'JianghuPlayerArrow',
            actor.node,
            HomeConfig.DUEL_JIANGHU_PLAYER_ARROW_WIDTH,
            HomeConfig.DUEL_JIANGHU_PLAYER_ARROW_HEIGHT,
            0,
            HomeConfig.DUEL_JIANGHU_PLAYER_ARROW_Y,
            HomeConfig.UI_DUEL_JIANGHU_PLAYER_ARROW,
        );
        arrow.setSiblingIndex(2);
        Tween.stopAllByTarget(arrow);
        arrow.setPosition(0, HomeConfig.DUEL_JIANGHU_PLAYER_ARROW_Y, 0);
        tween(arrow)
            .repeatForever(
                tween<Node>()
                    .by(0.42, { position: new Vec3(0, 8, 0) })
                    .by(0.42, { position: new Vec3(0, -8, 0) }),
            )
            .start();
    }
    protected async loadDuelJianghuSkeletonData(kind: DuelJianghuActorKind): Promise<sp.SkeletonData> {
        const cached = this.duelJianghuSkeletonData.get(kind);
        if (cached) return cached;

        const pathMap: Record<DuelJianghuActorKind, string> = {
            common: HomeConfig.DUEL_JIANGHU_SPINE_COMMON,
            lobbyCommon: HomeConfig.DUEL_JIANGHU_SPINE_COMMON,
            player: HomeConfig.DUEL_JIANGHU_SPINE_COMMON,
            assassin: HomeConfig.DUEL_JIANGHU_SPINE_ASSASSIN,
            doubleMale: HomeConfig.DUEL_JIANGHU_SPINE_DOUBLE_MALE,
            doubleFemale: HomeConfig.DUEL_JIANGHU_SPINE_DOUBLE_FEMALE,
            rebel: HomeConfig.DUEL_JIANGHU_SPINE_REBEL,
            guardSoldier: HomeConfig.DUEL_JIANGHU_SPINE_GUARD_SOLDIER,
            general: HomeConfig.DUEL_JIANGHU_SPINE_GENERAL,
        };
        const skeletonData = await this.loadSkeletonAsset(pathMap[kind]);
        this.duelJianghuSkeletonData.set(kind, skeletonData);
        if (kind === 'common' || kind === 'lobbyCommon' || kind === 'player') {
            this.duelJianghuSkeletonData.set('common', skeletonData);
            this.duelJianghuSkeletonData.set('lobbyCommon', skeletonData);
            this.duelJianghuSkeletonData.set('player', skeletonData);
        }
        return skeletonData;
    }
    protected getDuelJianghuActorScale(kind: DuelJianghuActorKind): number {
        if (kind === 'player') return HomeConfig.DUEL_JIANGHU_COMMON_ACTOR_SCALE;
        if (kind === 'assassin' || kind === 'doubleMale' || kind === 'doubleFemale' || kind === 'rebel') {
            return HomeConfig.DUEL_JIANGHU_KILLER_ACTOR_SCALE;
        }
        if (kind === 'guardSoldier' || kind === 'general') return HomeConfig.DUEL_JIANGHU_SPECIAL_ACTOR_SCALE;
        return HomeConfig.DUEL_JIANGHU_COMMON_ACTOR_SCALE;
    }
    protected playDuelJianghuActorAnimation(actor: DuelJianghuActorRuntime, animation: DuelJianghuActorAnimation, loop: boolean): number {
        if (!actor.skeleton || !actor.skeleton.node.isValid) return 0;
        const candidates = animation === 'stand'
            ? ['ready', 'style', 'stand', 'stand2', 'idle', 'walk']
            : animation === 'walk'
                ? ['run', 'walk', 'ready', 'stand', 'stand2']
                : animation === 'hurt'
                    ? ['hit1', 'hit2', 'hit3', 'hurt', 'hit', 'damage', 'ready', 'stand']
                    : animation === 'dead'
                        ? ['dead', 'death', 'die', 'hurt', 'ready', 'stand']
                        : ['attack', 'skill', 'animation', 'stand', 'walk'];
        const duration = this.playDuelJianghuSkeletonAnimation(actor.skeleton, candidates, loop);
        if (duration < 0 && animation === 'attack' && actor.kind === 'player') return 0;
        if (duration < 0 && (animation === 'attack' || animation === 'hurt' || animation === 'dead')) {
            const fallback = animation === 'dead' || animation === 'hurt'
                ? ['ready', 'style', 'stand', 'stand2', 'idle']
                : ['attack', 'animation', 'stand', 'walk'];
            this.playDuelJianghuSkeletonAnimation(actor.skeleton, fallback, true);
        }
        return Math.max(0, duration);
    }
    protected playDuelJianghuSkeletonAnimation(target: sp.Skeleton, candidates: readonly string[], loop: boolean): number {
        if (!target.skeletonData) return -1;

        for (const animation of candidates) {
            try {
                target.clearTracks();
                target.setToSetupPose();
                const track = target.setAnimation(0, animation, loop);
                if (track) {
                    target.updateAnimation(0);
                    target.markForUpdateRenderData(true);
                    return this.getTrackAnimationDuration(track) || 0;
                }
            } catch {
                // Try the next common animation name used by imported Spine assets.
            }
        }
        console.warn('[MainHomeView] duel jianghu animation missing', candidates.join('|'));
        return -1;
    }
    protected async playDuelJianghuKillerAttackAnimation(
        actor: DuelJianghuActorRuntime,
        onAttackHit?: (attacker: DuelJianghuActorRuntime, hitIndex: number) => void,
    ): Promise<void> {
        const repeatCount = Math.max(1, HomeConfig.DUEL_JIANGHU_KILLER_ATTACK_REPEAT_COUNT);
        for (let index = 0; index < repeatCount; index += 1) {
            if (!actor.node.isValid) return;
            const duration = this.playDuelJianghuActorAnimation(actor, 'attack', false);
            const waitTime = duration > 0
                ? Math.min(Math.max(duration, 0.25), HomeConfig.DUEL_JIANGHU_ATTACK_WAIT_TIME)
                : HomeConfig.DUEL_JIANGHU_KILLER_ATTACK_REPEAT_WAIT_TIME;
            const hitDelay = Math.min(Math.max(HomeConfig.DUEL_JIANGHU_KILLER_ATTACK_HURT_DELAY, 0), waitTime);
            if (onAttackHit && hitDelay > 0) {
                await this.waitDuelJianghuSeconds(hitDelay);
                if (!actor.node.isValid) return;
                onAttackHit(actor, index);
                await this.waitDuelJianghuSeconds(Math.max(0, waitTime - hitDelay));
            } else {
                onAttackHit?.(actor, index);
                await this.waitDuelJianghuSeconds(waitTime);
            }
        }
    }
    protected prepareDuelJianghuSkeletonSkin(skeleton: sp.Skeleton): void {
        try {
            skeleton.setSkin('default');
        } catch {
            // Some exported skel assets only contain the implicit default skin.
        }
        try {
            (skeleton as unknown as { setSlotsToSetupPose?: () => void }).setSlotsToSetupPose?.();
        } catch {
            // Keep the loaded setup pose if the current runtime does not expose this API.
        }
        skeleton.updateAnimation(0);
        skeleton.markForUpdateRenderData(true);
    }
    protected moveDuelJianghuActorAlongRoute(actor: DuelJianghuActorRuntime, route: Vec3[], stepTime: number): Promise<void> {
        if (!actor.node.isValid || route.length <= 0) return Promise.resolve();
        Tween.stopAllByTarget(actor.node);
        this.playDuelJianghuActorAnimation(actor, 'walk', true);

        return new Promise((resolve) => {
            let index = 0;
            const moveNext = (): void => {
                if (!actor.node.isValid || index >= route.length) {
                    resolve();
                    return;
                }
                const target = route[index].clone();
                index += 1;
                this.faceDuelJianghuActorTo(actor, target);
                tween(actor.node)
                    .to(stepTime, { position: target })
                    .call(moveNext)
                    .start();
            };
            moveNext();
        });
    }
    protected async moveDuelJianghuActorIntoRoom(page: Node, actor: DuelJianghuActorRuntime, roomId: DuelJianghuRoomId, target: Vec3, stepTime: number, faceTarget?: Vec3, canContinue?: () => boolean): Promise<void> {
        if (!actor.node.isValid) return;
        const start = actor.node.position.clone();
        await this.moveDuelJianghuActorAlongRoute(actor, this.getDuelJianghuRouteToDoor(page, start, roomId), stepTime);
        if (!actor.node.isValid || canContinue?.() === false) return;

        actor.roomId = roomId;
        this.playDuelJianghuActorAnimation(actor, 'stand', true);
        await this.waitDuelJianghuSeconds(HomeConfig.DUEL_JIANGHU_ROOM_DOOR_PAUSE_TIME);
        if (!actor.node.isValid || canContinue?.() === false) return;

        await this.moveDuelJianghuActorAlongRoute(
            actor,
            this.compactDuelJianghuRoute(actor.node.position.clone(), [target.clone()]),
            Math.max(0.2, stepTime * 0.72),
        );
        if (!actor.node.isValid || canContinue?.() === false) return;
        if (faceTarget) this.faceDuelJianghuActorTo(actor, faceTarget);
        this.playDuelJianghuActorAnimation(actor, 'stand', true);
    }
    protected async moveDuelJianghuActorOutToLobby(page: Node, actor: DuelJianghuActorRuntime, target: Vec3, stepTime: number): Promise<void> {
        await this.moveDuelJianghuActorAlongRoute(actor, this.getDuelJianghuExitRoute(page, actor, target), stepTime);
        if (!actor.node.isValid) return;
        actor.roomId = undefined;
        this.playDuelJianghuActorAnimation(actor, 'stand', true);
    }
    protected faceDuelJianghuActorTo(actor: DuelJianghuActorRuntime, target: Vec3): void {
        const spineNode = actor.node.getChildByName('JianghuActorSpine');
        if (!spineNode) return;
        const deltaX = target.x - actor.node.position.x;
        if (Math.abs(deltaX) < 2) return;
        const scaleX = Math.abs(spineNode.scale.x) || this.getDuelJianghuActorScale(actor.kind);
        spineNode.setScale(deltaX < 0 ? -scaleX : scaleX, spineNode.scale.y, spineNode.scale.z);
    }
    protected getDuelJianghuActorLayer(page: Node): Node {
        const layer = page.getChildByName('JianghuActorLayer')
            || this.getOrCreateEditorNode('JianghuActorLayer', page, HomeConfig.DUEL_JIANGHU_ACTOR_ROOT_WIDTH, HomeConfig.DUEL_JIANGHU_ACTOR_ROOT_HEIGHT, 0, 0);
        layer.active = true;
        return layer;
    }
    protected getDuelJianghuPointPosition(page: Node, nodeName: string, fallbackX: number, fallbackY: number): Vec3 {
        const point = this.getDuelJianghuActorLayer(page).getChildByName(nodeName);
        return point ? point.position.clone() : new Vec3(fallbackX, fallbackY, 0);
    }
    protected getDuelJianghuEntryRoute(page: Node, start: Vec3, roomId: DuelJianghuRoomId, target: Vec3): Vec3[] {
        return this.compactDuelJianghuRoute(start, this.createDuelJianghuCorridorRoute(page, roomId, target));
    }
    protected getDuelJianghuKillerRoute(page: Node, roomId: DuelJianghuRoomId, target: Vec3): Vec3[] {
        const start = this.getDuelJianghuRouteStartPoint(page);
        return this.compactDuelJianghuRoute(start, this.createDuelJianghuCorridorRoute(page, roomId, target));
    }
    protected getDuelJianghuRouteToDoor(page: Node, start: Vec3, roomId: DuelJianghuRoomId): Vec3[] {
        return this.compactDuelJianghuRoute(start, this.createDuelJianghuRouteToDoor(page, roomId));
    }
    protected getDuelJianghuExitRoute(page: Node, actor: DuelJianghuActorRuntime, finalTarget: Vec3): Vec3[] {
        const start = actor.node.position.clone();
        const routeStart = this.getDuelJianghuRouteStartPoint(page);
        const roomId = actor.roomId && this.getDuelJianghuRoomById(actor.roomId) ? actor.roomId : null;
        if (roomId) {
            const routePoints = this.getDuelJianghuRoutePointsForRoom(page, roomId);
            const turn1 = this.getDuelJianghuRouteTurnPoint(page, 1);
            const branchPoint = routePoints[routePoints.length - 1] || turn1;
            const door = this.getDuelJianghuRouteDoorPosition(page, roomId);
            return this.compactDuelJianghuRoute(start, [
                door,
                new Vec3(door.x, branchPoint.y, 0),
                ...routePoints.slice().reverse(),
                routeStart,
                finalTarget.clone(),
            ]);
        }

        return this.compactDuelJianghuRoute(start, [
            routeStart,
            finalTarget.clone(),
        ]);
    }
    protected createDuelJianghuCorridorRoute(page: Node, roomId: DuelJianghuRoomId, target: Vec3): Vec3[] {
        return [
            ...this.createDuelJianghuRouteToDoor(page, roomId),
            target.clone(),
        ];
    }
    protected createDuelJianghuRouteToDoor(page: Node, roomId: DuelJianghuRoomId): Vec3[] {
        const routePoints = this.getDuelJianghuRoutePointsForRoom(page, roomId);
        const routeStart = this.getDuelJianghuRouteStartPoint(page);
        const branchPoint = routePoints[routePoints.length - 1] || routeStart;
        const door = this.getDuelJianghuRouteDoorPosition(page, roomId);
        const route: Vec3[] = [];
        route.push(routeStart);
        route.push(...routePoints);
        route.push(new Vec3(door.x, branchPoint.y, 0));
        route.push(door);
        return route;
    }
    protected getDuelJianghuRouteStartPoint(page: Node): Vec3 {
        return this.getDuelJianghuPointPosition(page, 'JianghuRoute_StartPoint', HomeConfig.DUEL_JIANGHU_ROUTE_START_X, HomeConfig.DUEL_JIANGHU_ROUTE_START_Y);
    }
    protected getDuelJianghuRouteTurnPoint(page: Node, index: 1 | 2 | 3 | 4 | 5 | 6 | 7): Vec3 {
        const fallbackMap: Record<1 | 2 | 3 | 4 | 5 | 6 | 7, { x: number; y: number }> = {
            1: { x: HomeConfig.DUEL_JIANGHU_ROUTE_TURN1_X, y: HomeConfig.DUEL_JIANGHU_ROUTE_TURN1_Y },
            2: { x: HomeConfig.DUEL_JIANGHU_ROUTE_TURN2_X, y: HomeConfig.DUEL_JIANGHU_ROUTE_TURN2_Y },
            3: { x: HomeConfig.DUEL_JIANGHU_ROUTE_TURN3_X, y: HomeConfig.DUEL_JIANGHU_ROUTE_TURN3_Y },
            4: { x: HomeConfig.DUEL_JIANGHU_ROUTE_TURN4_X, y: HomeConfig.DUEL_JIANGHU_ROUTE_TURN4_Y },
            5: { x: HomeConfig.DUEL_JIANGHU_ROUTE_TURN5_X, y: HomeConfig.DUEL_JIANGHU_ROUTE_TURN5_Y },
            6: { x: HomeConfig.DUEL_JIANGHU_ROUTE_TURN6_X, y: HomeConfig.DUEL_JIANGHU_ROUTE_TURN6_Y },
            7: { x: HomeConfig.DUEL_JIANGHU_ROUTE_TURN7_X, y: HomeConfig.DUEL_JIANGHU_ROUTE_TURN7_Y },
        };
        const fallback = fallbackMap[index];
        return this.getDuelJianghuPointPosition(page, `JianghuRoute_Turn${index}`, fallback.x, fallback.y);
    }
    protected getDuelJianghuRoutePointsForRoom(page: Node, roomId: DuelJianghuRoomId): Vec3[] {
        const turn1 = this.getDuelJianghuRouteTurnPoint(page, 1);
        const turn2 = this.getDuelJianghuRouteTurnPoint(page, 2);
        const turn3 = this.getDuelJianghuRouteTurnPoint(page, 3);
        const turn4 = this.getDuelJianghuRouteTurnPoint(page, 4);
        const turn5 = this.getDuelJianghuRouteTurnPoint(page, 5);
        const turn6 = this.getDuelJianghuRouteTurnPoint(page, 6);
        const turn7 = this.getDuelJianghuRouteTurnPoint(page, 7);
        if (roomId === 'mibao_youge') return [turn1, turn2, turn3, turn4, turn5];
        if (roomId === 'bingjia_wutang') return [turn1, turn2, turn3, turn4, turn6];
        if (roomId === 'wudao_jingtan') return [turn1, turn2, turn3, turn4];
        if (roomId === 'juyi_zunshi') return [turn1, turn2, turn3, turn7];
        return [turn1, turn2, turn3];
    }
    protected getDuelJianghuRouteDoorPosition(page: Node, roomId: DuelJianghuRoomId): Vec3 {
        const config = this.getDuelJianghuRoomById(roomId);
        if (!config) return new Vec3(0, 0, 0);
        return this.getDuelJianghuPointPosition(page, config.routeDoorNodeName, config.routeDoorX, config.routeDoorY);
    }
    protected compactDuelJianghuRoute(start: Vec3, route: Vec3[]): Vec3[] {
        const output: Vec3[] = [];
        let previous = start.clone();
        route.forEach((point) => {
            if (Math.abs(point.x - previous.x) + Math.abs(point.y - previous.y) > 4) {
                output.push(point);
                previous = point;
            }
        });
        return output;
    }
    protected getDuelJianghuConfrontPositions(page: Node, roomId: DuelJianghuRoomId): DuelJianghuConfrontPositions {
        const config = this.getDuelJianghuRoomById(roomId);
        if (!config) {
            return {
                special: new Vec3(-34, 0, 0),
                killer: new Vec3(34, 0, 0),
            };
        }

        const area = this.getDuelJianghuRoomArea(page, config);
        const xOffset = Math.max(32, area.width * 0.18);
        const yOffset = Math.max(6, area.height * 0.04);
        return {
            special: new Vec3(area.center.x - xOffset, area.center.y - yOffset, 0),
            killer: new Vec3(area.center.x + xOffset, area.center.y + yOffset, 0),
        };
    }
    protected getDuelJianghuRoomGridPoint(page: Node, roomId: DuelJianghuRoomId, index: number): Vec3 {
        const config = this.getDuelJianghuRoomById(roomId);
        if (!config) return new Vec3(0, 0, 0);
        const area = this.getDuelJianghuRoomArea(page, config);
        const slots = [
            [-0.34, -0.18], [-0.06, 0.18], [0.28, -0.25], [0.07, -0.02], [-0.25, 0.26],
            [0.36, 0.14], [-0.02, -0.31], [0.19, 0.31], [-0.39, 0.04], [0.02, 0.23],
        ];
        const slot = slots[index % slots.length];
        const jitterX = (Math.random() - 0.5) * area.width * 0.16;
        const jitterY = (Math.random() - 0.5) * area.height * 0.14;
        const minX = area.center.x - area.width * 0.43;
        const maxX = area.center.x + area.width * 0.43;
        const minY = area.center.y - area.height * 0.34;
        const maxY = area.center.y + area.height * 0.34;
        const x = Math.max(minX, Math.min(maxX, area.center.x + slot[0] * area.width + jitterX));
        const y = Math.max(minY, Math.min(maxY, area.center.y + slot[1] * area.height + jitterY));
        return new Vec3(
            x,
            y,
            0,
        );
    }
    protected getDuelJianghuLobbyPoint(page: Node, index: number): Vec3 {
        const area = this.getDuelJianghuLobbyArea(page);
        const slots = [
            [-0.44, -0.2], [-0.29, 0.22], [-0.12, -0.05], [0.03, 0.28], [0.21, -0.24], [0.39, 0.08],
            [-0.38, 0.3], [-0.22, -0.32], [-0.04, 0.08], [0.13, -0.34], [0.31, 0.28], [0.46, -0.12],
            [-0.5, 0.02], [-0.34, -0.38], [-0.18, 0.37], [0, -0.18], [0.18, 0.12], [0.35, -0.36],
            [-0.43, 0.42], [-0.25, -0.02], [-0.08, -0.42], [0.1, 0.42], [0.28, -0.02], [0.45, 0.36],
            [-0.03, 0.22], [0.24, 0.4],
        ];
        const slot = slots[index % slots.length];
        const jitterX = (Math.random() - 0.5) * area.width * 0.08;
        const jitterY = (Math.random() - 0.5) * area.height * 0.1;
        return new Vec3(
            area.center.x + slot[0] * area.width + jitterX,
            area.center.y + slot[1] * area.height + jitterY,
            0,
        );
    }
    protected getDuelJianghuPlayerStartPoint(page: Node): Vec3 {
        return this.getDuelJianghuLobbyPoint(page, HomeConfig.DUEL_JIANGHU_LOBBY_NPC_COUNT + 3);
    }
    protected getDuelJianghuLobbyArea(page: Node): { center: Vec3; width: number; height: number } {
        const layer = this.getDuelJianghuActorLayer(page);
        const areaNode = layer.getChildByName('JianghuLobbyCrowdArea');
        if (!areaNode) {
            return {
                center: new Vec3(HomeConfig.DUEL_JIANGHU_LOBBY_AREA_X, HomeConfig.DUEL_JIANGHU_LOBBY_AREA_Y, 0),
                width: HomeConfig.DUEL_JIANGHU_LOBBY_AREA_WIDTH,
                height: HomeConfig.DUEL_JIANGHU_LOBBY_AREA_HEIGHT,
            };
        }
        const transform = areaNode.getComponent(UITransform);
        const size = transform?.contentSize || new Size(HomeConfig.DUEL_JIANGHU_LOBBY_AREA_WIDTH, HomeConfig.DUEL_JIANGHU_LOBBY_AREA_HEIGHT);
        const scale = this.getDuelJianghuNodeScaleToPage(page, areaNode);
        return {
            center: this.getDuelJianghuNodePositionInPage(page, areaNode),
            width: Math.max(40, size.width * Math.abs(scale.x)),
            height: Math.max(40, size.height * Math.abs(scale.y)),
        };
    }
    protected getDuelJianghuRoomRandomPoint(page: Node, roomId: DuelJianghuRoomId, insetRatio = 0.5): Vec3 {
        const config = this.getDuelJianghuRoomById(roomId);
        if (!config) return new Vec3(0, 0, 0);
        const area = this.getDuelJianghuRoomArea(page, config);
        const width = Math.max(40, area.width * insetRatio);
        const height = Math.max(40, area.height * insetRatio);
        return new Vec3(
            area.center.x + (Math.random() - 0.5) * width,
            area.center.y + (Math.random() - 0.5) * height,
            0,
        );
    }
    protected getDuelJianghuRoomArea(page: Node, config: DuelJianghuRoomConfig): { center: Vec3; width: number; height: number } {
        const roomsRoot = page.getChildByName('JianghuTaoshaRooms');
        const room = roomsRoot?.getChildByName(config.nodeName) || null;
        const actorArea = room?.getChildByName('JianghuRoomActorArea') || null;
        const highlight = room?.getChildByName('JianghuRoomHighlightFrame') || room;
        const target = actorArea || highlight;
        const fallbackCenter = new Vec3(config.x + config.highlightX, config.y + config.highlightY, 0);
        if (!target) {
            return {
                center: fallbackCenter,
                width: config.actorAreaWidth,
                height: config.actorAreaHeight,
            };
        }

        const center = this.getDuelJianghuNodePositionInPage(page, target);
        const transform = target.getComponent(UITransform);
        const size = transform?.contentSize || new Size(config.actorAreaWidth, config.actorAreaHeight);
        const scale = this.getDuelJianghuNodeScaleToPage(page, target);
        const width = size.width * Math.abs(scale.x);
        const height = size.height * Math.abs(scale.y);
        return {
            center,
            width: Math.max(40, actorArea ? width : Math.min(width, config.actorAreaWidth)),
            height: Math.max(40, actorArea ? height : Math.min(height, config.actorAreaHeight)),
        };
    }
    protected getDuelJianghuNodePositionInPage(page: Node, target: Node): Vec3 {
        const pageTransform = page.getComponent(UITransform);
        if (!pageTransform) return target.position.clone();
        const world = target.getWorldPosition(new Vec3());
        return pageTransform.convertToNodeSpaceAR(world);
    }
    protected getDuelJianghuNodeScaleToPage(page: Node, target: Node): Vec3 {
        let scaleX = 1;
        let scaleY = 1;
        let cursor: Node | null = target;
        while (cursor) {
            scaleX *= cursor.scale.x;
            scaleY *= cursor.scale.y;
            if (cursor === page) break;
            cursor = cursor.parent;
        }
        return new Vec3(scaleX, scaleY, 1);
    }
    protected removeDuelJianghuActors(page: Node, predicate?: (actor: DuelJianghuActorRuntime) => boolean): void {
        for (let index = this.duelJianghuActors.length - 1; index >= 0; index -= 1) {
            const actor = this.duelJianghuActors[index];
            if (predicate && !predicate(actor)) continue;
            this.stopDuelJianghuActorTweens(actor.node);
            if (actor.node.isValid) actor.node.destroy();
            this.duelJianghuActors.splice(index, 1);
            if (this.duelJianghuPlayerActor === actor) this.duelJianghuPlayerActor = null;
        }

        const layer = page.getChildByName('JianghuActorLayer');
        if (!layer || predicate) return;
        layer.children
            .filter((child) => /^(JianghuActor_|JianghuLobby_|JianghuKiller_|JianghuSpecial_)/.test(child.name))
            .forEach((child) => {
                this.stopDuelJianghuActorTweens(child);
                child.destroy();
            });
        this.duelJianghuActors.length = 0;
        this.duelJianghuPlayerActor = null;
    }
    protected stopDuelJianghuActorTweens(node: Node): void {
        Tween.stopAllByTarget(node);
        node.children.forEach((child) => {
            Tween.stopAllByTarget(child);
            child.children.forEach((grandChild) => Tween.stopAllByTarget(grandChild));
        });
    }
    protected waitDuelJianghuSeconds(seconds: number): Promise<void> {
        return new Promise((resolve) => {
            this.scheduleOnce(() => resolve(), seconds);
        });
    }
}
