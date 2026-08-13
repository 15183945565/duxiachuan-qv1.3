import {
    Node,
    Tween,
    Vec3,
    sp,
    tween,
} from 'cc';
import {
    BAG_ILLUSTRATION_CATALOG,
    type BagIllustrationCatalogItem,
} from './BagIllustrationCatalog.generated';
import * as HomeConfig from './HomeConfig';
import { HomeViewBase } from './HomeViewBase';
import { MagicMapMonsterRuntime, type RoleGender } from './HomeTypes';

type MagicBattleParticipantId = 'player' | 'npc-half' | 'npc-double';

interface MagicBattleDamageParticipant {
    id: MagicBattleParticipantId;
    name: string;
    isPlayer: boolean;
    skelPath?: string;
    duelScale?: number;
    duelGender?: RoleGender;
    damageMultiplier: number;
    damage: number;
    hp: number;
    maxHp: number;
    active: boolean;
    duelOutcome: 'win' | 'lose' | null;
}

abstract class HomeFeatureMagicBattleHost extends HomeViewBase {
    protected abstract magicBattleDamageHudRoot: Node | null;
    protected abstract magicBattleDamageCollapsed: boolean;
    protected abstract magicBattlePlayerDamage: number;
    protected abstract readonly magicBattleParticipants: MagicBattleDamageParticipant[];
    protected abstract magicBattleDuelPopup: Node | null;
    protected abstract magicBattleDuelPlayerSkeleton: sp.Skeleton | null;
    protected abstract magicBattleDuelTargetSkeleton: sp.Skeleton | null;
    protected abstract magicBattleDuelVersion: number;
    protected abstract magicBattleDuelTargetId: MagicBattleParticipantId | '';

    protected abstract setupMagicMapAssistCards(): void;
    protected abstract closeMagicMapAssistCardConfirmPopup(): void;
    protected abstract hideLegacyMagicBattleAssistCards(): void;
    protected abstract refreshMagicBattleAssistEffectLabels(): void;
    protected abstract getMagicBattlePowerMultiplier(): number;
    protected abstract openBattleRewardPopup(
        rewards?: Array<{ item: BagIllustrationCatalogItem; amount: string }> | null,
        closeMode?: 'battle' | 'popupOnly' | 'magic',
    ): void;
}

/**
 * 魔界战斗主循环、Spine 攻击、血量刷新、奖励场景与返回流程。
 */
export abstract class HomeFeatureMagicBattle extends HomeFeatureMagicBattleHost {
    protected openMagicDuelResult(monster: MagicMapMonsterRuntime): void {
        void this.startMagicMonsterBattle(monster);
    }
    protected async startMagicMonsterBattle(monster: MagicMapMonsterRuntime): Promise<void> {
        if (!this.magicMonsterBattlePanel?.isValid) return;
        this.stopMagicMapWander();
        this.stopMagicMapPlayerMovement(true);
        if (this.magicMapPanel) this.magicMapPanel.active = false;
        this.magicMonsterBattlePanel.active = true;
        this.ensureInputBlocker(this.magicMonsterBattlePanel);
        this.magicMonsterBattlePanel.setSiblingIndex((this.magicMonsterBattlePanel.parent?.children.length || 1) - 1);
        this.magicBattleTarget = monster;
        this.magicBattleActive = false;
        this.magicBattleDuelTargetId = '';
        this.magicBattleAttackSequenceId += 1;
        this.magicBattleRoomPreviewSoundCooldown = 0;
        this.magicBattleRoomPreviewHurtCooldown = 0;
        this.magicBattleRoomPreviewHitEffectCooldown = 0;
        const baseMaxHp = monster.maxHp || (monster.isBoss ? HomeConfig.MAGIC_MAP_BOSS_MONSTER_MAX_HP : HomeConfig.MAGIC_MAP_SMALL_MONSTER_MAX_HP);
        this.magicBattleEnemyMaxHp = this.isMagicBattleRoomPreviewEnabled()
            ? Math.ceil(baseMaxHp * HomeConfig.MAGIC_BATTLE_ROOM_PREVIEW_HP_MULTIPLIER)
            : baseMaxHp;
        this.magicBattleEnemyHp = this.magicBattleEnemyMaxHp;
        this.ensureMagicBattleDamageHud();
        this.ensureMagicBattleDuelPopup();
        this.hideLegacyMagicBattleAssistCards();
        this.closeMagicMapAssistCardConfirmPopup();
        this.refreshMagicBattleAssistEffectLabels();
        this.magicBattleDamageCollapsed = false;
        this.resetMagicBattleDamageState();
        if (this.magicBattleEnemyNameLabel) {
            this.magicBattleEnemyNameLabel.string = monster.isBoss ? '\u9b54\u754c\u9996\u9886' : '\u9b54\u754c\u5c0f\u5996';
            this.magicBattleEnemyNameLabel.node.active = false;
        }
        if (this.magicBattleEnemyHpLabel) {
            this.magicBattleEnemyHpLabel.node.active = false;
        }
        this.refreshMagicBattleHp();
        if (this.magicBattleHintLabel) this.magicBattleHintLabel.string = '\u6218\u6597\u8d44\u6e90\u52a0\u8f7d\u4e2d';
    
        try {
            const monsterPath = HomeConfig.getMagicMapMonsterSkelPath(this.magicMapActiveRealmIndex, monster.isBoss);
            const [monsterData, hitEffectData] = await Promise.all([
                this.loadSkeletonAsset(monsterPath),
                this.loadSkeletonAsset(HomeConfig.BATTLE_MONSTER_HIT_EFFECT_SKEL_PATH).catch((error) => {
                    console.warn('[MainHomeView] magic battle hit effect asset is not ready.', error);
                    return null;
                }),
            ]);
            if (!this.magicMonsterBattlePanel.active || this.magicBattleTarget !== monster) return;
            this.magicBattleHitEffectSkeletonData = hitEffectData;
            const roleData = await this.ensureRoleSkeletonData(this.profile.gender);
            if (!roleData || !this.magicBattleRoleSkeleton || !this.magicBattleMonsterSkeleton) {
                throw new Error('Magic battle skeleton node is missing');
            }
            const previewRoleData = await this.loadMagicBattleRoomPreviewRoleData(roleData);
    
            this.magicBattleRoleSkeleton.skeletonData = roleData;
            const roleScale = this.getRoleMapScale(this.profile.gender);
            this.magicBattleRoleSkeleton.node.setScale(roleScale, roleScale, 1);
            this.magicBattleMonsterSkeleton.skeletonData = monsterData;
            this.setSkeletonVisible(this.magicBattleBackgroundSkeleton, false);
            this.setSkeletonVisible(this.magicBattleRoleSkeleton, true);
            this.setSkeletonVisible(this.magicBattleMonsterSkeleton, true);
            this.playSkeletonAnimation(this.magicBattleRoleSkeleton, HomeConfig.IDLE_ANIMATIONS, true);
            this.playSkeletonAnimation(this.magicBattleMonsterSkeleton, HomeConfig.MAGIC_MAP_IDLE_ANIMATIONS, true);
            const monsterScale = HomeConfig.getMagicMapMonsterScale(this.magicMapActiveRealmIndex, monster.isBoss, true);
            this.magicBattleMonsterSkeleton.node.setScale(-monsterScale, monsterScale, 1);
            this.resetMagicBattleRoomActors();
            this.setupMagicBattleRoomPreviewActors(previewRoleData);
            this.ensureMagicBattleHitEffect();
            this.refreshMagicBattleHp();
    
            this.magicBattleAttackTimer = HomeConfig.MAGIC_BATTLE_ATTACK_START_DELAY;
            this.magicBattleResultTimer = this.isMagicBattleRoomPreviewEnabled()
                ? HomeConfig.MAGIC_BATTLE_ROOM_PREVIEW_RESULT_DELAY
                : HomeConfig.MAGIC_MONSTER_BATTLE_RESULT_DELAY;
            this.magicBattleActive = true;
            if (this.magicBattleHintLabel) this.magicBattleHintLabel.string = '\u6218\u6597\u4e2d';
            this.showToast('\u9b54\u754c\u6311\u6218\u5df2\u5f00\u59cb');
        } catch (err) {
            console.warn('[MainHomeView] magic monster battle assets not ready', err);
            this.showToast('\u9b54\u754c\u6218\u6597\u8d44\u6e90\u52a0\u8f7d\u5931\u8d25');
            this.returnToMagicScenePanel();
        }
    }
    protected updateMagicMonsterBattle(deltaTime: number): void {
        if (!this.magicBattleActive || !this.magicMonsterBattlePanel?.active) return;
        if (this.magicBattleDuelTargetId) return;
    
        this.updateMagicBattleRoomPreviewFeedbackCooldowns(deltaTime);
        this.magicBattleResultTimer -= deltaTime;
        this.magicBattleAttackTimer -= deltaTime;
        if ((this.magicBattleEnemyHp <= 0 || this.magicBattleResultTimer <= 0) && this.magicBattleAttackTimer <= 0) {
            this.finishMagicMonsterBattle();
            return;
        }
        if (this.magicBattleAttackTimer <= 0) {
            this.startMagicBattleAttackCycle();
        }
    }
    protected getMagicBattleRoleAnchor(): Node | null {
        return this.magicBattleRoleSkeleton?.node?.parent || this.findNode('MagicBattleRoleAnchor', this.magicMonsterBattlePanel || undefined);
    }
    protected getMagicBattleMonsterAnchor(): Node | null {
        return this.magicBattleMonsterSkeleton?.node?.parent || this.findNode('MagicBattleMonsterAnchor', this.magicMonsterBattlePanel || undefined);
    }
    protected getMagicBattlePlayerSlotPosition(slotIndex: number): Vec3 {
        const count = Math.max(1, HomeConfig.MAGIC_BATTLE_PLAYER_SLOT_COUNT);
        const clampedIndex = this.clamp(Math.floor(slotIndex), 0, count - 1);
        const span = HomeConfig.MAGIC_BATTLE_PLAYER_SLOT_TOP_Y - HomeConfig.MAGIC_BATTLE_PLAYER_SLOT_BOTTOM_Y;
        const step = count > 1 ? span / (count - 1) : 0;
        let y = HomeConfig.MAGIC_BATTLE_PLAYER_SLOT_CENTER_Y;
        if (clampedIndex > 0) {
            const offsetIndex = Math.ceil(clampedIndex / 2);
            const direction = clampedIndex % 2 === 1 ? 1 : -1;
            y = HomeConfig.MAGIC_BATTLE_PLAYER_SLOT_CENTER_Y + direction * offsetIndex * step;
        }
        return new Vec3(
            HomeConfig.MAGIC_BATTLE_PLAYER_SLOT_X,
            this.clamp(y, HomeConfig.MAGIC_BATTLE_PLAYER_SLOT_BOTTOM_Y, HomeConfig.MAGIC_BATTLE_PLAYER_SLOT_TOP_Y),
            0,
        );
    }
    protected getMagicBattleRoleAttackPosition(homePosition: Vec3): Vec3 {
        const attackPosition = HomeConfig.MAGIC_BATTLE_ROLE_ATTACK_POSITION.clone();
        const slotOffsetY = homePosition.y - HomeConfig.MAGIC_BATTLE_PLAYER_SLOT_CENTER_Y;
        attackPosition.y += slotOffsetY * HomeConfig.MAGIC_BATTLE_ROLE_ATTACK_Y_OFFSET_RATIO;
        return attackPosition;
    }
    protected isMagicBattleRoomPreviewEnabled(): boolean {
        return HomeConfig.MAGIC_BATTLE_ROOM_PREVIEW_ENABLED
            && this.magicMapActiveRealmIndex === HomeConfig.MAGIC_BATTLE_ROOM_PREVIEW_REALM_INDEX;
    }
    protected async loadMagicBattleRoomPreviewRoleData(fallbackRoleData: sp.SkeletonData): Promise<Partial<Record<RoleGender, sp.SkeletonData>>> {
        if (!this.isMagicBattleRoomPreviewEnabled()) return {};

        const [maleData, femaleData] = await Promise.all([
            this.ensureRoleSkeletonData('male').catch((err) => {
                console.warn('[MainHomeView] magic battle room preview male role load failed', err);
                return null;
            }),
            this.ensureRoleSkeletonData('female').catch((err) => {
                console.warn('[MainHomeView] magic battle room preview female role load failed', err);
                return null;
            }),
        ]);
        return {
            male: maleData || fallbackRoleData,
            female: femaleData || fallbackRoleData,
        };
    }
    protected setupMagicBattleRoomPreviewActors(roleDataByGender: Partial<Record<RoleGender, sp.SkeletonData>>): void {
        this.clearMagicBattleRoomPreviewActors();
        if (!this.isMagicBattleRoomPreviewEnabled() || !this.magicMonsterBattlePanel?.isValid) return;

        const otherCount = Math.min(
            HomeConfig.MAGIC_BATTLE_ROOM_PREVIEW_OTHER_PLAYER_COUNT,
            Math.max(0, HomeConfig.MAGIC_BATTLE_PLAYER_SLOT_COUNT - 1),
        );
        const positions = this.createMagicBattleRoomPreviewPositions(otherCount);
        const genders = this.createMagicBattleRoomPreviewGenders(otherCount);
        for (let index = 0; index < otherCount; index += 1) {
            const gender = genders[index] || (Math.random() < 0.5 ? 'male' : 'female');
            const skeletonData = roleDataByGender[gender] || roleDataByGender[this.profile.gender];
            if (!skeletonData) continue;
            const homePosition = positions[index] || this.getMagicBattlePlayerSlotPosition(index + 1);

            const anchor = this.createNode(
                `MagicBattleRoomPreviewActor_${index + 1}`,
                this.magicMonsterBattlePanel,
                260,
                360,
                0,
                0,
            );
            anchor.setPosition(homePosition);
            const visual = this.createNode('MagicBattleRoomPreviewVisual', anchor, 420, 420, 0, 0);
            const skeleton = visual.addComponent(sp.Skeleton);
            this.prepareSkeletonRenderer(skeleton);
            skeleton.skeletonData = skeletonData;
            const baseScale = this.getRoleMapScale(gender) * HomeConfig.MAGIC_BATTLE_ROOM_PREVIEW_ROLE_SCALE_MULTIPLIER;
            visual.setScale(baseScale, baseScale, 1);
            this.setSkeletonVisible(skeleton, true);
            this.playSkeletonAnimation(skeleton, HomeConfig.IDLE_ANIMATIONS, true);
            const attackPhase = otherCount > 1
                ? (index / (otherCount - 1)) * HomeConfig.MAGIC_BATTLE_ROOM_PREVIEW_ATTACK_DELAY_MAX
                : 0;
            this.magicBattleRoomPreviewActors.push({ anchor, skeleton, homePosition, gender, attackPhase });
        }
        this.raiseMagicBattleOverlayLayers();
    }
    protected createMagicBattleRoomPreviewPositions(count: number): Vec3[] {
        const localPosition = this.getMagicBattlePlayerSlotPosition(HomeConfig.MAGIC_BATTLE_LOCAL_PLAYER_SLOT_INDEX);
        const columns = 7;
        const rows = 8;
        const minX = HomeConfig.MAGIC_BATTLE_ROOM_PREVIEW_AREA_MIN_X;
        const maxX = HomeConfig.MAGIC_BATTLE_ROOM_PREVIEW_AREA_MAX_X;
        const topY = HomeConfig.MAGIC_BATTLE_ROOM_PREVIEW_AREA_TOP_Y;
        const bottomY = HomeConfig.MAGIC_BATTLE_ROOM_PREVIEW_AREA_BOTTOM_Y;
        const cellWidth = columns > 1 ? (maxX - minX) / (columns - 1) : 0;
        const cellHeight = rows > 1 ? (topY - bottomY) / (rows - 1) : 0;
        const candidates: Vec3[] = [];

        for (let row = 0; row < rows; row += 1) {
            for (let column = 0; column < columns; column += 1) {
                const x = minX + column * cellWidth
                    + (Math.random() * 2 - 1) * HomeConfig.MAGIC_BATTLE_ROOM_PREVIEW_POSITION_JITTER_X;
                const y = topY - row * cellHeight
                    + (Math.random() * 2 - 1) * HomeConfig.MAGIC_BATTLE_ROOM_PREVIEW_POSITION_JITTER_Y;
                if (Math.hypot(x - localPosition.x, y - localPosition.y) < HomeConfig.MAGIC_BATTLE_ROOM_PREVIEW_MIN_LOCAL_DISTANCE) {
                    continue;
                }
                candidates.push(new Vec3(
                    this.clamp(x, minX, maxX),
                    this.clamp(y, bottomY, topY),
                    0,
                ));
            }
        }

        this.shuffleMagicBattleRoomPreviewItems(candidates);
        return candidates.slice(0, count);
    }
    protected createMagicBattleRoomPreviewGenders(count: number): RoleGender[] {
        const genders: RoleGender[] = [];
        for (let index = 0; index < count; index += 1) {
            genders.push(index % 2 === 0 ? 'male' : 'female');
        }
        this.shuffleMagicBattleRoomPreviewItems(genders);
        return genders;
    }
    protected shuffleMagicBattleRoomPreviewItems<T>(items: T[]): void {
        for (let index = items.length - 1; index > 0; index -= 1) {
            const swapIndex = Math.floor(Math.random() * (index + 1));
            [items[index], items[swapIndex]] = [items[swapIndex], items[index]];
        }
    }
    protected clearMagicBattleRoomPreviewActors(): void {
        this.magicBattleRoomPreviewActors.forEach((actor) => {
            if (actor.anchor?.isValid) {
                Tween.stopAllByTarget(actor.anchor);
                actor.anchor.destroy();
            }
        });
        this.magicBattleRoomPreviewActors.length = 0;

        const panel = this.magicMonsterBattlePanel;
        if (!panel?.isValid) return;
        [...panel.children].forEach((child) => {
            if (!child.name.startsWith('MagicBattleRoomPreviewActor_')) return;
            Tween.stopAllByTarget(child);
            child.destroy();
        });
    }
    protected resetMagicBattleRoomActors(): void {
        this.clearMagicBattleRoomPreviewActors();
        const roleAnchor = this.getMagicBattleRoleAnchor();
        if (roleAnchor?.isValid) {
            Tween.stopAllByTarget(roleAnchor);
            roleAnchor.setPosition(this.getMagicBattlePlayerSlotPosition(HomeConfig.MAGIC_BATTLE_LOCAL_PLAYER_SLOT_INDEX));
        }
        const monsterAnchor = this.getMagicBattleMonsterAnchor();
        if (monsterAnchor?.isValid) {
            Tween.stopAllByTarget(monsterAnchor);
            monsterAnchor.setPosition(HomeConfig.MAGIC_BATTLE_MONSTER_POSITION);
        }
        if (this.magicBattleRoleSkeleton?.isValid && this.magicBattleRoleSkeleton.skeletonData) {
            this.playSkeletonAnimation(this.magicBattleRoleSkeleton, HomeConfig.IDLE_ANIMATIONS, true);
        }
        if (this.magicBattleMonsterSkeleton?.isValid && this.magicBattleMonsterSkeleton.skeletonData) {
            this.playSkeletonAnimation(this.magicBattleMonsterSkeleton, HomeConfig.MAGIC_MAP_IDLE_ANIMATIONS, true);
        }
        this.raiseMagicBattleActorLayers();
    }
    protected startMagicBattleAttackCycle(): void {
        if (this.magicBattleEnemyHp <= 0) {
            this.magicBattleAttackTimer = HomeConfig.MAGIC_MONSTER_BATTLE_ATTACK_GAP;
            return;
        }
        const roleAnchor = this.getMagicBattleRoleAnchor();
        const monsterAnchor = this.getMagicBattleMonsterAnchor();
        if (!roleAnchor?.isValid || !monsterAnchor?.isValid) {
            this.magicBattleAttackTimer = HomeConfig.MAGIC_MONSTER_BATTLE_ATTACK_GAP;
            return;
        }

        const sequenceId = ++this.magicBattleAttackSequenceId;
        const timeline = HomeConfig.MAGIC_BATTLE_ATTACK_TIMELINES[this.profile.gender];
        const frameRate = HomeConfig.BATTLE_ROLE_ATTACK_FRAME_RATE;
        const homePosition = this.getMagicBattlePlayerSlotPosition(HomeConfig.MAGIC_BATTLE_LOCAL_PLAYER_SLOT_INDEX);
        const attackPosition = this.getMagicBattleRoleAttackPosition(homePosition);
        roleAnchor.setPosition(homePosition);
        Tween.stopAllByTarget(roleAnchor);
        this.raiseMagicBattleActorLayers();
        this.playMagicBattleOneShot(
            this.magicBattleRoleSkeleton,
            HomeConfig.BATTLE_ROLE_NORMAL_ATTACK_ANIMATIONS[this.profile.gender],
            HomeConfig.IDLE_ANIMATIONS,
            HomeConfig.BATTLE_ROLE_ATTACK_TIME_SCALE,
        );
        this.scheduleMagicBattleRoleMove(sequenceId, roleAnchor, attackPosition, timeline.moveStartFrame, timeline.moveEndFrame);
        this.scheduleMagicBattleRoleMove(sequenceId, roleAnchor, homePosition, timeline.returnStartFrame, timeline.returnEndFrame);
        this.startMagicBattleRoomPreviewAttackCycle(sequenceId);

        const minimumHitTime = timeline.moveEndFrame / frameRate;
        const hitTimes = HomeConfig.BATTLE_ROLE_NORMAL_ATTACK_HIT_TIMES[this.profile.gender];
        hitTimes.forEach((hitTime, index) => {
            this.scheduleOnce(() => {
                this.playMagicBattleAttackHit(sequenceId, index, hitTimes.length);
            }, Math.max(minimumHitTime, hitTime / Math.max(HomeConfig.BATTLE_ROLE_ATTACK_TIME_SCALE, 0.01)));
        });

        this.scheduleOnce(() => {
            if (!this.isMagicBattleAttackSequenceValid(sequenceId) || !roleAnchor.isValid) return;
            Tween.stopAllByTarget(roleAnchor);
            roleAnchor.setPosition(homePosition);
            if (this.magicBattleRoleSkeleton?.isValid && this.magicBattleRoleSkeleton.skeletonData) {
                this.playSkeletonAnimation(this.magicBattleRoleSkeleton, HomeConfig.IDLE_ANIMATIONS, true);
            }
        }, Math.max(0, timeline.endFrame / frameRate));

        const previewDelay = this.isMagicBattleRoomPreviewEnabled()
            ? HomeConfig.MAGIC_BATTLE_ROOM_PREVIEW_ATTACK_DELAY_MAX
            : 0;
        this.magicBattleAttackTimer = Math.max(
            0.1,
            timeline.endFrame / frameRate + previewDelay + HomeConfig.MAGIC_MONSTER_BATTLE_ATTACK_GAP,
        );
    }
    protected startMagicBattleRoomPreviewAttackCycle(sequenceId: number): void {
        if (!this.magicBattleRoomPreviewActors.length) return;
        this.magicBattleRoomPreviewActors.forEach((actor) => {
            const { anchor, skeleton, homePosition, gender, attackPhase } = actor;
            if (!anchor?.isValid || !skeleton?.isValid || !skeleton.skeletonData) return;
            if (Math.random() > HomeConfig.MAGIC_BATTLE_ROOM_PREVIEW_ATTACK_RATE) return;

            const timeline = HomeConfig.MAGIC_BATTLE_ATTACK_TIMELINES[gender];
            const frameRate = HomeConfig.BATTLE_ROLE_ATTACK_FRAME_RATE;
            const attackPosition = this.getMagicBattleRoleAttackPosition(homePosition);
            const delay = Math.max(
                0,
                attackPhase + (Math.random() * 2 - 1) * HomeConfig.MAGIC_BATTLE_ROOM_PREVIEW_ATTACK_PHASE_JITTER,
            );
            Tween.stopAllByTarget(anchor);
            anchor.setPosition(homePosition);
            this.scheduleOnce(() => {
                if (!this.isMagicBattleAttackSequenceValid(sequenceId) || !anchor.isValid) return;
                this.playMagicBattleOneShot(
                    skeleton,
                    HomeConfig.BATTLE_ROLE_NORMAL_ATTACK_ANIMATIONS[gender],
                    HomeConfig.IDLE_ANIMATIONS,
                    HomeConfig.BATTLE_ROLE_ATTACK_TIME_SCALE,
                );
            }, delay);
            this.scheduleMagicBattleRoleMove(sequenceId, anchor, attackPosition, timeline.moveStartFrame, timeline.moveEndFrame, delay);
            this.scheduleMagicBattleRoleMove(sequenceId, anchor, homePosition, timeline.returnStartFrame, timeline.returnEndFrame, delay);
            const minimumHitTime = timeline.moveEndFrame / frameRate;
            const hitTimes = HomeConfig.BATTLE_ROLE_NORMAL_ATTACK_HIT_TIMES[gender];
            const hitTime = hitTimes[Math.floor(Math.random() * Math.max(1, hitTimes.length))] || minimumHitTime;
            this.scheduleOnce(() => {
                this.playMagicBattleRoomPreviewAttackHit(sequenceId);
            }, delay + Math.max(minimumHitTime, hitTime / Math.max(HomeConfig.BATTLE_ROLE_ATTACK_TIME_SCALE, 0.01)));
            this.scheduleOnce(() => {
                if (!this.isMagicBattleAttackSequenceValid(sequenceId) || !anchor.isValid) return;
                Tween.stopAllByTarget(anchor);
                anchor.setPosition(homePosition);
                if (skeleton.isValid && skeleton.skeletonData) {
                    this.playSkeletonAnimation(skeleton, HomeConfig.IDLE_ANIMATIONS, true);
                }
            }, Math.max(0, timeline.endFrame / frameRate + delay));
        });
    }
    protected scheduleMagicBattleRoleMove(
        sequenceId: number,
        roleAnchor: Node,
        targetPosition: Vec3,
        startFrame: number,
        endFrame: number,
        extraDelay = 0,
    ): void {
        const frameRate = HomeConfig.BATTLE_ROLE_ATTACK_FRAME_RATE;
        const delay = Math.max(0, startFrame / frameRate + extraDelay);
        const duration = Math.max(0, (endFrame - startFrame) / frameRate);
        this.scheduleOnce(() => {
            if (!this.isMagicBattleAttackSequenceValid(sequenceId) || !roleAnchor.isValid) return;
            Tween.stopAllByTarget(roleAnchor);
            this.raiseMagicBattleOverlayLayers();
            if (duration <= 0.001) {
                roleAnchor.setPosition(targetPosition);
                return;
            }
            tween(roleAnchor)
                .to(duration, { position: targetPosition.clone() }, { easing: 'sineInOut' })
                .start();
        }, delay);
    }
    protected isMagicBattleAttackSequenceValid(sequenceId: number): boolean {
        return sequenceId === this.magicBattleAttackSequenceId
            && this.magicBattleActive
            && this.magicMonsterBattlePanel?.active === true
            && !this.magicBattleDuelTargetId;
    }
    protected updateMagicBattleRoomPreviewFeedbackCooldowns(deltaTime: number): void {
        if (!this.isMagicBattleRoomPreviewEnabled()) return;

        this.magicBattleRoomPreviewSoundCooldown = Math.max(0, this.magicBattleRoomPreviewSoundCooldown - deltaTime);
        this.magicBattleRoomPreviewHurtCooldown = Math.max(0, this.magicBattleRoomPreviewHurtCooldown - deltaTime);
        this.magicBattleRoomPreviewHitEffectCooldown = Math.max(0, this.magicBattleRoomPreviewHitEffectCooldown - deltaTime);
    }
    protected playMagicBattleAttackHit(sequenceId: number, hitIndex: number, hitCount: number): void {
        if (!this.isMagicBattleAttackSequenceValid(sequenceId)) return;
        if (this.magicBattleEnemyHp <= 0) return;

        this.playBattleAttackSound();
        this.playMagicBattleMonsterHurt();
        const totalDamage = this.getMagicBattleAttackCycleDamage();
        const count = Math.max(1, hitCount);
        const sliceStart = Math.floor((totalDamage * hitIndex) / count);
        const sliceEnd = Math.floor((totalDamage * (hitIndex + 1)) / count);
        const damage = Math.max(1, sliceEnd - sliceStart);
        const appliedDamage = Math.min(this.magicBattleEnemyHp, damage);
        this.magicBattleEnemyHp = Math.max(0, this.magicBattleEnemyHp - appliedDamage);
        this.applyMagicBattlePlayerDamage(appliedDamage);
        this.refreshMagicBattleHp();
        this.raiseMagicBattleOverlayLayers();
    }
    protected playMagicBattleRoomPreviewAttackHit(sequenceId: number): void {
        if (!this.isMagicBattleAttackSequenceValid(sequenceId)) return;
        if (!this.isMagicBattleRoomPreviewEnabled()) return;
        if (this.magicBattleEnemyHp <= 0) return;

        if (this.magicBattleRoomPreviewSoundCooldown <= 0) {
            this.playBattleAttackSound();
            this.magicBattleRoomPreviewSoundCooldown = HomeConfig.MAGIC_BATTLE_ROOM_PREVIEW_SOUND_COOLDOWN;
        }
        if (this.magicBattleRoomPreviewHitEffectCooldown <= 0 && Math.random() < HomeConfig.MAGIC_BATTLE_ROOM_PREVIEW_HIT_EFFECT_CHANCE) {
            this.playMagicBattleHitEffect();
            this.magicBattleRoomPreviewHitEffectCooldown = HomeConfig.MAGIC_BATTLE_ROOM_PREVIEW_HIT_EFFECT_COOLDOWN;
        }
        if (this.magicBattleRoomPreviewHurtCooldown <= 0) {
            this.playMagicBattleOneShot(
                this.magicBattleMonsterSkeleton,
                [...HomeConfig.BATTLE_MONSTER_HURT_ANIMATIONS, ...HomeConfig.MAGIC_MAP_HURT_ANIMATIONS],
                HomeConfig.MAGIC_MAP_IDLE_ANIMATIONS,
                1,
            );
            this.magicBattleRoomPreviewHurtCooldown = HomeConfig.MAGIC_BATTLE_ROOM_PREVIEW_HURT_COOLDOWN;
        }
        const damage = Math.max(1, Math.ceil(this.magicBattleEnemyMaxHp * HomeConfig.MAGIC_BATTLE_ROOM_PREVIEW_ACTOR_DAMAGE_RATIO));
        this.magicBattleEnemyHp = Math.max(0, this.magicBattleEnemyHp - Math.min(this.magicBattleEnemyHp, damage));
        this.refreshMagicBattleHp();
        this.raiseMagicBattleOverlayLayers();
    }
    protected playMagicBattleMonsterHurt(): void {
        this.playMagicBattleHitEffect();
        this.playMagicBattleOneShot(
            this.magicBattleMonsterSkeleton,
            [...HomeConfig.BATTLE_MONSTER_HURT_ANIMATIONS, ...HomeConfig.MAGIC_MAP_HURT_ANIMATIONS],
            HomeConfig.MAGIC_MAP_IDLE_ANIMATIONS,
            1,
        );
    }
    protected getMagicBattleAttackCycleDamage(): number {
        const damageRatio = this.magicBattleTarget?.isBoss
            ? HomeConfig.MAGIC_BATTLE_BOSS_DAMAGE_PER_HIT_RATIO
            : HomeConfig.MAGIC_BATTLE_PLAYER_DAMAGE_PER_HIT_RATIO;
        const previewMultiplier = this.isMagicBattleRoomPreviewEnabled()
            ? HomeConfig.MAGIC_BATTLE_ROOM_PREVIEW_LOCAL_DAMAGE_MULTIPLIER
            : 1;
        return Math.ceil(this.magicBattleEnemyMaxHp * damageRatio * this.getMagicBattlePowerMultiplier() * previewMultiplier);
    }
    protected ensureMagicBattleHitEffect(): sp.Skeleton | null {
        if (!this.magicMonsterBattlePanel?.isValid) return null;
        if (!this.magicBattleHitEffectSkeleton?.isValid) {
            const effectNode = this.createNode(
                'MagicBattleMonsterHitEffect',
                this.magicMonsterBattlePanel,
                HomeConfig.MAGIC_BATTLE_HIT_EFFECT_WIDTH,
                HomeConfig.MAGIC_BATTLE_HIT_EFFECT_HEIGHT,
                0,
                0,
            );
            effectNode.active = false;
            effectNode.setScale(HomeConfig.MAGIC_BATTLE_HIT_EFFECT_SCALE, HomeConfig.MAGIC_BATTLE_HIT_EFFECT_SCALE, 1);
            this.magicBattleHitEffectSkeleton = effectNode.addComponent(sp.Skeleton);
            this.prepareSkeletonRenderer(this.magicBattleHitEffectSkeleton);
            this.setSkeletonVisible(this.magicBattleHitEffectSkeleton, false);
        }
        return this.magicBattleHitEffectSkeleton;
    }
    protected playMagicBattleHitEffect(): void {
        const skeleton = this.ensureMagicBattleHitEffect();
        const data = this.magicBattleHitEffectSkeletonData;
        const effectNode = skeleton?.node;
        const monsterAnchor = this.getMagicBattleMonsterAnchor();
        if (!this.magicMonsterBattlePanel?.isValid || !skeleton?.isValid || !effectNode?.isValid || !data || !monsterAnchor?.isValid) return;

        this.unschedule(this.hideMagicBattleHitEffect);
        effectNode.active = true;
        effectNode.setPosition(
            monsterAnchor.position.x + HomeConfig.MAGIC_BATTLE_HIT_EFFECT_OFFSET.x,
            monsterAnchor.position.y + HomeConfig.MAGIC_BATTLE_HIT_EFFECT_OFFSET.y,
            monsterAnchor.position.z + HomeConfig.MAGIC_BATTLE_HIT_EFFECT_OFFSET.z,
        );
        effectNode.setScale(HomeConfig.MAGIC_BATTLE_HIT_EFFECT_SCALE, HomeConfig.MAGIC_BATTLE_HIT_EFFECT_SCALE, 1);
        this.prepareSkeletonRenderer(skeleton);
        skeleton.skeletonData = data;
        skeleton.timeScale = 1;
        this.setSkeletonVisible(skeleton, true);
        const duration = this.playMagicBattleOneShot(
            skeleton,
            HomeConfig.BATTLE_MONSTER_HIT_EFFECT_ANIMATIONS,
            [],
            1,
        ) || HomeConfig.BATTLE_MONSTER_HIT_EFFECT_FALLBACK_DURATION;
        this.raiseMagicBattleOverlayLayers();
        this.scheduleOnce(this.hideMagicBattleHitEffect, duration);
    }
    protected hideMagicBattleHitEffect(): void {
        this.unschedule(this.hideMagicBattleHitEffect);
        if (!this.magicBattleHitEffectSkeleton?.isValid) return;

        this.setSkeletonVisible(this.magicBattleHitEffectSkeleton, false);
        if (this.magicBattleHitEffectSkeleton.node?.isValid) {
            this.magicBattleHitEffectSkeleton.node.active = false;
        }
    }
    protected raiseMagicBattleActorLayers(): void {
        const panel = this.magicMonsterBattlePanel;
        const roleAnchor = this.getMagicBattleRoleAnchor();
        const monsterAnchor = this.getMagicBattleMonsterAnchor();
        if (!panel?.isValid || !roleAnchor?.isValid || !monsterAnchor?.isValid) return;
        if (roleAnchor.parent !== panel || monsterAnchor.parent !== panel) return;

        const roleIndex = panel.children.indexOf(roleAnchor);
        const monsterIndex = panel.children.indexOf(monsterAnchor);
        if (roleIndex < 0 || monsterIndex < 0 || roleIndex > monsterIndex) return;

        monsterAnchor.setSiblingIndex(roleIndex);
        this.magicBattleRoomPreviewActors.forEach((actor) => {
            if (!actor.anchor?.isValid || actor.anchor.parent !== panel) return;
            actor.anchor.setSiblingIndex(Math.max(0, panel.children.length - 1));
        });
        roleAnchor.setSiblingIndex(Math.max(0, panel.children.length - 1));
    }
    protected raiseMagicBattleOverlayLayers(): void {
        const panel = this.magicMonsterBattlePanel;
        if (!panel?.isValid) return;

        this.raiseMagicBattleActorLayers();
        if (this.magicBattleHitEffectSkeleton?.node?.isValid && this.magicBattleHitEffectSkeleton.node.parent === panel) {
            this.magicBattleHitEffectSkeleton.node.setSiblingIndex(Math.max(0, panel.children.length - 1));
        }
        if (this.magicBattleDamageHudRoot?.isValid && this.magicBattleDamageHudRoot.parent === panel) {
            this.magicBattleDamageHudRoot.setSiblingIndex(Math.max(0, panel.children.length - 1));
        }
        if (this.magicBattleDuelPopup?.isValid && this.magicBattleDuelPopup.active && this.magicBattleDuelPopup.parent === panel) {
            this.magicBattleDuelPopup.setSiblingIndex(Math.max(0, panel.children.length - 1));
        }
    }
    protected playMagicBattleOneShot(
        target: sp.Skeleton | null,
        oneShotCandidates: readonly string[],
        idleCandidates: readonly string[],
        timeScale: number,
    ): number {
        if (!target?.isValid || !target.skeletonData) return 1;
        target.timeScale = timeScale;
    
        for (const animation of oneShotCandidates) {
            try {
                target.clearTracks();
                target.setToSetupPose();
                const track = target.setAnimation(0, animation, false);
                if (!track) continue;
                for (const idleAnimation of idleCandidates) {
                    if (!target.findAnimation(idleAnimation)) continue;
                    try {
                        const idleTrack = target.addAnimation(0, idleAnimation, true, 0);
                        if (idleTrack) break;
                    } catch {
                        // Try the next idle animation name.
                    }
                }
                target.updateAnimation(0);
                target.markForUpdateRenderData(true);
                const rawDuration = this.getTrackAnimationDuration(track) || 1;
                return rawDuration / Math.max(timeScale, 0.01);
            } catch {
                // Try the next one-shot animation name.
            }
        }
    
        this.playSkeletonAnimation(target, [...idleCandidates], true);
        return 1;
    }
    protected refreshMagicBattleHp(): void {
        if (this.magicBattleEnemyHpLabel) {
            this.magicBattleEnemyHpLabel.string = `\u8840\u91cf ${this.magicBattleEnemyHp}/${this.magicBattleEnemyMaxHp}`;
            this.magicBattleEnemyHpLabel.node.active = false;
        }
        const target = this.magicBattleTarget;
        const monsterAnchor = this.findNode('MagicBattleMonsterAnchor', this.magicMonsterBattlePanel || undefined);
        if (!target || !monsterAnchor?.isValid) return;

        this.setupMagicMapHealthInfo(
            monsterAnchor,
            'MagicBattleEnemyHealthInfo',
            target.isBoss ? '\u9b54\u754c\u9996\u9886' : `\u9b54\u754c\u5c0f\u5996 ${this.getMagicMonsterDisplayIndex(target)}`,
            this.magicBattleEnemyHp,
            this.magicBattleEnemyMaxHp,
            HomeConfig.MAGIC_BATTLE_MONSTER_HEALTH_INFO_Y,
            target.isBoss ? HomeConfig.MAGIC_MAP_BOSS_HEALTH_BAR_WIDTH : HomeConfig.MAGIC_MAP_MONSTER_HEALTH_BAR_WIDTH,
            target.isBoss ? 26 : 22,
        );
    }
    protected getMagicMonsterDisplayIndex(monster: MagicMapMonsterRuntime): number {
        const match = /small-(\d+)/.exec(monster.id);
        return match ? Number(match[1]) : 1;
    }
    protected getMagicMonsterRewardItems(): Array<{ item: BagIllustrationCatalogItem; amount: string }> {
        const fragments = HomeConfig.MAGIC_BATTLE_FRAGMENT_REWARD_IDS
            .map((id) => BAG_ILLUSTRATION_CATALOG.find((item) => item.id === id))
            .filter((item): item is BagIllustrationCatalogItem => !!item);
        if (!fragments.length) return [];

        const first = fragments[Math.floor(Math.random() * fragments.length)];
        const rewards: Array<{ item: BagIllustrationCatalogItem; amount: string }> = [
            { item: first, amount: `${3 + Math.floor(Math.random() * 5)}` },
        ];
        if (fragments.length > 1 && Math.random() < 0.35) {
            const second = fragments.find((item) => item.id !== first.id) || fragments[0];
            rewards.push({ item: second, amount: `${1 + Math.floor(Math.random() * 3)}` });
        }
        return rewards;
    }
    protected finishMagicMonsterBattle(): void {
        if (!this.magicBattleActive) return;
        const playerRank = this.getMagicBattlePlayerRank();
        const defeated = this.magicBattleEnemyHp <= 0;
        if (!defeated) {
            this.showToast('\u6311\u6218\u65f6\u95f4\u7ed3\u675f\uff0c\u672a\u51fb\u8d25\u5996\u602a');
            this.returnToMagicScenePanel();
            return;
        }

        const rewards = playerRank === 1 ? this.getMagicMonsterRewardItems() : [];
        if (rewards.length > 0) {
            this.prepareMagicMonsterBattleRewardScene();
            this.openBattleRewardPopup(rewards, 'magic');
            return;
        }

        this.showToast(`\u4f24\u5bb3\u6392\u540d\u7b2c${playerRank || '-'}\uff0c\u672a\u83b7\u5f97\u9b54\u754c\u5956\u52b1`);
        this.returnToMagicScenePanel();
    }
    protected prepareMagicMonsterBattleRewardScene(): void {
        this.magicBattleActive = false;
        this.magicBattleAttackTimer = 0;
        this.magicBattleAttackSequenceId += 1;
        this.magicBattleResultTimer = 0;
        this.magicBattleDuelTargetId = '';
        this.magicBattleDuelVersion += 1;
        const roleAnchor = this.getMagicBattleRoleAnchor();
        if (roleAnchor?.isValid) Tween.stopAllByTarget(roleAnchor);
        const monsterAnchor = this.getMagicBattleMonsterAnchor();
        if (monsterAnchor?.isValid) Tween.stopAllByTarget(monsterAnchor);
        this.hideMagicBattleHitEffect();
        this.clearMagicBattleRoomPreviewActors();
        if (this.magicBattleDamageHudRoot?.isValid) this.magicBattleDamageHudRoot.active = false;
        if (this.magicBattleDuelPopup?.isValid) this.magicBattleDuelPopup.active = false;
        this.closeMagicMapAssistCardConfirmPopup();
        if (this.magicBattleDuelPlayerSkeleton?.isValid) {
            Tween.stopAllByTarget(this.magicBattleDuelPlayerSkeleton.node);
            this.setSkeletonVisible(this.magicBattleDuelPlayerSkeleton, false);
        }
        if (this.magicBattleDuelTargetSkeleton?.isValid) {
            Tween.stopAllByTarget(this.magicBattleDuelTargetSkeleton.node);
            this.setSkeletonVisible(this.magicBattleDuelTargetSkeleton, false);
        }
        this.magicBattlePlayerDamage = 0;
        this.magicBattleParticipants.length = 0;
        if (this.magicBattleHintLabel) this.magicBattleHintLabel.string = '\u6311\u6218\u80dc\u5229';
        if (this.magicMonsterBattlePanel?.isValid) {
            this.magicMonsterBattlePanel.active = true;
            this.ensureInputBlocker(this.magicMonsterBattlePanel);
            this.magicMonsterBattlePanel.setSiblingIndex((this.magicMonsterBattlePanel.parent?.children.length || 1) - 1);
        }
    }
    protected stopMagicMonsterBattle(): void {
        this.magicBattleActive = false;
        this.magicBattleAttackTimer = 0;
        this.magicBattleAttackSequenceId += 1;
        this.magicBattleResultTimer = 0;
        this.magicBattleDuelTargetId = '';
        this.magicBattleDuelVersion += 1;
        const roleAnchor = this.getMagicBattleRoleAnchor();
        if (roleAnchor?.isValid) Tween.stopAllByTarget(roleAnchor);
        const monsterAnchor = this.getMagicBattleMonsterAnchor();
        if (monsterAnchor?.isValid) Tween.stopAllByTarget(monsterAnchor);
        this.hideMagicBattleHitEffect();
        this.clearMagicBattleRoomPreviewActors();
        if (this.magicBattleDamageHudRoot?.isValid) this.magicBattleDamageHudRoot.active = false;
        if (this.magicBattleDuelPopup?.isValid) this.magicBattleDuelPopup.active = false;
        if (this.magicBattleDuelPlayerSkeleton?.isValid) {
            Tween.stopAllByTarget(this.magicBattleDuelPlayerSkeleton.node);
            this.setSkeletonVisible(this.magicBattleDuelPlayerSkeleton, false);
        }
        if (this.magicBattleDuelTargetSkeleton?.isValid) {
            Tween.stopAllByTarget(this.magicBattleDuelTargetSkeleton.node);
            this.setSkeletonVisible(this.magicBattleDuelTargetSkeleton, false);
        }
        this.magicBattlePlayerDamage = 0;
        this.magicBattleParticipants.length = 0;
        this.setSkeletonVisible(this.magicBattleBackgroundSkeleton, false);
        this.setSkeletonVisible(this.magicBattleRoleSkeleton, false);
        this.setSkeletonVisible(this.magicBattleMonsterSkeleton, false);
    }
    protected returnToMagicMap(): void {
        this.stopMagicMonsterBattle();
        if (this.magicMonsterBattlePanel) this.magicMonsterBattlePanel.active = false;
        if (this.magicMapPanel) {
            this.magicMapPanel.active = true;
            this.ensureInputBlocker(this.magicMapPanel);
            this.magicMapPanel.setSiblingIndex((this.magicMapPanel.parent?.children.length || 1) - 1);
        }
        this.setupMagicMapAssistCards();
        this.closeMagicMapAssistCardConfirmPopup();
        this.magicMapMonsters.forEach((monster) => this.setSkeletonVisible(monster.skeleton, true));
        this.setSkeletonVisible(this.magicMapPlayerSkeleton, true);
        if (this.magicMapStatusLabel) this.magicMapStatusLabel.string = '\u70b9\u51fb\u5730\u9762\u79fb\u52a8\uff0c\u70b9\u51fb\u5996\u602a\u6311\u6218';
        this.startMagicMapWander();
        this.refreshRootLayerOrder();
    }
    protected returnToMagicScenePanel(): void {
        const currentRealmIndex = this.magicMapActiveRealmIndex;
        this.stopMagicMonsterBattle();
        this.stopMagicMapWander();
        this.stopMagicMapPlayerMovement(false);
        ++this.magicMapLoadVersion;
        if (this.magicMonsterBattlePanel) this.magicMonsterBattlePanel.active = false;
        if (this.magicMapPanel) this.magicMapPanel.active = false;
        this.closeMagicMapAssistCardConfirmPopup();
        this.magicMapMonsters.forEach((monster) => this.setSkeletonVisible(monster.skeleton, false));
        this.setSkeletonVisible(this.magicMapPlayerSkeleton, false);
        this.openMagicPanel();
        this.magicSceneIndex = this.clamp(currentRealmIndex, 0, HomeConfig.MAGIC_SCENES.length - 1);
        this.refreshMagicScene(false);
    }
    protected openMagicFloorReservedPage(realmIndex: number, floorIndex: number): void {
        const realm = HomeConfig.MAGIC_SCENES[realmIndex];
        const floorName = HomeConfig.MAGIC_FLOOR_NAMES[floorIndex];
        this.closeMagicFloorPanel();
        console.info('[MainHomeView] magic floor page reserved', {
            realmIndex,
            floorIndex,
            realm: realm.title,
            floor: floorName,
        });
        this.openSharedFlowPopup('ConfirmPopup', {
            title: '\u7cfb\u7edf\u63d0\u793a',
            message: `\u662f\u5426\u5728\u5f53\u524d\u9b54\u754c\u5c42\u6570\u8fdb\u884c\u6311\u6218`,
            variant: 'magicFloorConfirm',
            onConfirm: () => {
                if (!this.consumeMagicFloorTicket()) {
                    this.showToast('\u9b54\u754c\u95e8\u7968\u4e0d\u8db3');
                    return;
                }
                void this.openMagicMapPanel(realmIndex, floorIndex);
            },
        });
    }
}
