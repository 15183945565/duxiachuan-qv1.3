import {
    Node,
    Tween,
    sp,
    tween,
} from 'cc';
import {
    BAG_ILLUSTRATION_CATALOG,
    type BagIllustrationCatalogItem,
} from './BagIllustrationCatalog.generated';
import * as HomeConfig from './HomeConfig';
import { HomeViewBase } from './HomeViewBase';
import { MagicMapMonsterRuntime } from './HomeTypes';

type MagicBattleParticipantId = 'player' | 'npc-half' | 'npc-double';

interface MagicBattleDamageParticipant {
    id: MagicBattleParticipantId;
    name: string;
    isPlayer: boolean;
    skelPath?: string;
    duelScale?: number;
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
        this.openSharedFlowPopup('BattleResultPopup', {
            title: '\u9b54\u754c\u5bf9\u51b3\u7ed3\u7b97',
            onAgain: () => this.openMagicMonsterTarget(monster),
            onClose: () => {
                if (this.magicMapPanel) {
                    this.magicMapPanel.active = true;
                    this.ensureInputBlocker(this.magicMapPanel);
                    this.magicMapPanel.setSiblingIndex((this.magicMapPanel.parent?.children.length || 1) - 1);
                }
                this.startMagicMapWander();
            },
        });
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
        this.magicBattleEnemyMaxHp = monster.maxHp || (monster.isBoss ? HomeConfig.MAGIC_MAP_BOSS_MONSTER_MAX_HP : HomeConfig.MAGIC_MAP_SMALL_MONSTER_MAX_HP);
        this.magicBattleEnemyHp = this.magicBattleEnemyMaxHp;
        this.ensureMagicBattleDamageHud();
        this.ensureMagicBattleDuelPopup();
        this.hideLegacyMagicBattleAssistCards();
        this.closeMagicMapAssistCardConfirmPopup();
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
            const [monsterData] = await Promise.all([
                this.loadSkeletonAsset(monster.isBoss ? HomeConfig.MAGIC_MAP_BOSS_MONSTER_SKEL_PATH : HomeConfig.MAGIC_MAP_SMALL_MONSTER_SKEL_PATH),
            ]);
            if (!this.magicMonsterBattlePanel.active || this.magicBattleTarget !== monster) return;
            if (!this.roleSkeletonData.has(this.profile.gender)) {
                await this.loadSkeletonData(HomeConfig.ROLE_ASSETS[this.profile.gender]);
            }
            const roleData = this.roleSkeletonData.get(this.profile.gender);
            if (!roleData || !this.magicBattleRoleSkeleton || !this.magicBattleMonsterSkeleton) {
                throw new Error('Magic battle skeleton node is missing');
            }
    
            this.magicBattleRoleSkeleton.skeletonData = roleData;
            this.magicBattleMonsterSkeleton.skeletonData = monsterData;
            this.setSkeletonVisible(this.magicBattleBackgroundSkeleton, false);
            this.setSkeletonVisible(this.magicBattleRoleSkeleton, true);
            this.setSkeletonVisible(this.magicBattleMonsterSkeleton, true);
            this.playSkeletonAnimation(this.magicBattleRoleSkeleton, HomeConfig.IDLE_ANIMATIONS, true);
            this.playSkeletonAnimation(this.magicBattleMonsterSkeleton, HomeConfig.MAGIC_MAP_IDLE_ANIMATIONS, true);
            const monsterScale = monster.isBoss ? HomeConfig.MAGIC_BATTLE_BOSS_MONSTER_SCALE : HomeConfig.MAGIC_BATTLE_SMALL_MONSTER_SCALE;
            this.magicBattleMonsterSkeleton.node.setScale(-monsterScale, monsterScale, 1);
            this.refreshMagicBattleHp();
    
            this.magicBattleAttackTimer = 0.45;
            this.magicBattleResultTimer = HomeConfig.MAGIC_MONSTER_BATTLE_RESULT_DELAY;
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
    
        this.magicBattleResultTimer -= deltaTime;
        this.magicBattleAttackTimer -= deltaTime;
        if ((this.magicBattleEnemyHp <= 0 || this.magicBattleResultTimer <= 0) && this.magicBattleAttackTimer <= 0) {
            this.finishMagicMonsterBattle();
            return;
        }
        if (this.magicBattleAttackTimer <= 0) {
            const roleDuration = this.playMagicBattleOneShot(
                this.magicBattleRoleSkeleton,
                HomeConfig.BATTLE_ROLE_NORMAL_ATTACK_ANIMATIONS,
                HomeConfig.IDLE_ANIMATIONS,
                HomeConfig.BATTLE_ROLE_ATTACK_TIME_SCALE,
            );
            this.playMagicBattleOneShot(
                this.magicBattleMonsterSkeleton,
                HomeConfig.MAGIC_MAP_HURT_ANIMATIONS,
                HomeConfig.MAGIC_MAP_IDLE_ANIMATIONS,
                1,
            );
            this.magicBattleAttackTimer = roleDuration + HomeConfig.MAGIC_MONSTER_BATTLE_ATTACK_GAP;
            const damageRatio = this.magicBattleTarget?.isBoss
                ? HomeConfig.MAGIC_BATTLE_BOSS_DAMAGE_PER_HIT_RATIO
                : HomeConfig.MAGIC_BATTLE_PLAYER_DAMAGE_PER_HIT_RATIO;
            const damage = Math.ceil(this.magicBattleEnemyMaxHp * damageRatio);
            const appliedDamage = Math.min(this.magicBattleEnemyHp, damage);
            this.magicBattleEnemyHp = Math.max(0, this.magicBattleEnemyHp - damage);
            this.applyMagicBattlePlayerDamage(appliedDamage);
            this.refreshMagicBattleHp();
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
                    try {
                        target.addAnimation(0, idleAnimation, true, 0);
                        break;
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
        this.magicBattleResultTimer = 0;
        this.magicBattleDuelTargetId = '';
        this.magicBattleDuelVersion += 1;
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
        this.magicBattleResultTimer = 0;
        this.magicBattleDuelTargetId = '';
        this.magicBattleDuelVersion += 1;
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
                void this.openMagicMapPanel(realmIndex, floorIndex);
            },
        });
    }
}
