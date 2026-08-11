import {
    Color,
    EventTouch,
    Node,
    Tween,
    UIOpacity,
    Vec3,
    tween,
    sp,
} from 'cc';
import * as HomeConfig from './HomeConfig';
import { HomeViewBase } from './HomeViewBase';

/**
 * Owns Battle combat scene setup, waves, attacks and floating damage numbers.
 */
export abstract class HomeFeatureBattleCombat extends HomeViewBase {
    private battleMonsterHurtSequenceId = 0;

    protected resetBattlePanelToEntry(): void {
        this.closeBattleUpgradePopup();
        this.closeBattleTargetChallengePopup();
        this.stopBattleChallengeSequence();
        this.setBattleTitle('\u5f81\u6218');
    
        if (this.battleEntryUiRoot?.isValid) {
            this.createBattleEntryMaterialBar(this.battleEntryUiRoot);
            this.battleEntryUiRoot.active = true;
        }
        if (this.battleChallengeButton?.isValid) {
            this.battleChallengeButton.active = true;
        }
    
        this.raiseBattleTopControls();
    }
    protected async startBattleChallenge(): Promise<void> {
        if (!this.battlePanel?.active) return;
        if (!this.canEnterBattleChallenge(true)) return;
    
        this.buildBattleCombatLayer();
        if (!this.battleCombatLayer) return;
    
        this.stopBattleChallengeSequence();
        this.setBattleTitle('\u5f81\u6218\u6218\u573a');
        if (this.battleEntryUiRoot?.isValid) {
            this.battleEntryUiRoot.active = false;
        }
        if (this.battleChallengeButton?.isValid) {
            this.battleChallengeButton.active = false;
        }
        this.setSkeletonVisible(this.battleBgSkeleton, false);
    
        this.battleCombatLayer.active = true;
        this.ensureInputBlocker(this.battleCombatLayer);
        this.battleCombatLayer.setSiblingIndex((this.battleCombatLayer.parent?.children.length || 1) - 1);
        this.raiseBattleTopControls();
    
        try {
            await this.loadBattleCombatAssets();
            this.playBattleCombatSequence();
            this.showToast('\u6311\u6218\u5df2\u5f00\u59cb');
        } catch (err) {
            console.warn('[MainHomeView] battle combat assets not ready', err);
            this.showToast('\u6218\u6597\u8d44\u6e90\u52a0\u8f7d\u5931\u8d25');
            this.resetBattlePanelToEntry();
            this.playBattleBackgroundAnimation();
        }
    }
    protected buildBattleCombatLayer(): void {
        if (!this.battlePanel || this.battleCombatLayer) return;
    
        const editorLayer = this.battlePanel.getChildByName('BattleCombatLayer');
        this.battleCombatLayer = editorLayer || this.createNode('BattleCombatLayer', this.battlePanel, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT, 0, 0);
        this.battleCombatLayer.active = false;
        this.battleCombatLayer.on(Node.EventType.TOUCH_END, (event: EventTouch) => {
            event.propagationStopped = true;
        }, this);
    
        const bgNode = this.createSkinnedNode('BattleCombatBackground', this.battleCombatLayer, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT, 0, 0, HomeConfig.UI_BATTLE_COMBAT_BG);
        bgNode.setSiblingIndex(0);
    
        const roleNode = this.createNode('BattleCombatRole', this.battleCombatLayer, HomeConfig.ROLE_RENDER_SIZE, HomeConfig.ROLE_RENDER_SIZE, HomeConfig.BATTLE_ROLE_POSITION.x, HomeConfig.BATTLE_ROLE_POSITION.y);
        roleNode.setSiblingIndex(2);
        const roleScale = this.getRoleMapScale(this.profile.gender);
        roleNode.setScale(roleScale, roleScale, 1);
        this.battleCombatRoleSkeleton = roleNode.addComponent(sp.Skeleton);
        this.prepareSkeletonRenderer(this.battleCombatRoleSkeleton);
        this.setSkeletonVisible(this.battleCombatRoleSkeleton, false);
    
        this.battleMonsterNodes.length = 0;
        this.battleMonsterSkeletons.length = 0;
        HomeConfig.BATTLE_MONSTER_START_POSITIONS.forEach((position, index) => {
            const monsterNode = this.createNode(`BattleMonster_${index + 1}`, this.battleCombatLayer, 360, 360, position.x, position.y);
            monsterNode.setSiblingIndex(3 + index);
            monsterNode.setScale(-HomeConfig.BATTLE_MONSTER_SCALE, HomeConfig.BATTLE_MONSTER_SCALE, 1);
            const skeleton = monsterNode.addComponent(sp.Skeleton);
            this.prepareSkeletonRenderer(skeleton);
            this.setSkeletonVisible(skeleton, false);
            this.battleMonsterNodes.push(monsterNode);
            this.battleMonsterSkeletons.push(skeleton);
        });

        const hitEffectNode = this.createNode('BattleMonsterHitEffect', this.battleCombatLayer, 640, 420, 0, 0);
        hitEffectNode.active = false;
        hitEffectNode.setScale(HomeConfig.BATTLE_MONSTER_HIT_EFFECT_SCALE, HomeConfig.BATTLE_MONSTER_HIT_EFFECT_SCALE, 1);
        hitEffectNode.setSiblingIndex(3 + HomeConfig.BATTLE_MONSTER_START_POSITIONS.length);
        this.battleMonsterHitEffectSkeleton = hitEffectNode.addComponent(sp.Skeleton);
        this.prepareSkeletonRenderer(this.battleMonsterHitEffectSkeleton);
        this.setSkeletonVisible(this.battleMonsterHitEffectSkeleton, false);
    
        this.battleWaveLabel = this.createLabel(
            this.battleCombatLayer,
            'BattleWaveLabel',
            '',
            HomeConfig.BATTLE_WAVE_LABEL_FONT_SIZE,
            0,
            HomeConfig.BATTLE_WAVE_LABEL_Y,
            HomeConfig.BATTLE_WAVE_LABEL_WIDTH,
            HomeConfig.BATTLE_WAVE_LABEL_HEIGHT,
            new Color(255, 238, 174, 255),
        );
        this.applyBattleEntryTextStyle(this.battleWaveLabel, 2);
        this.battleWaveLabel.node.setSiblingIndex(this.battleCombatLayer.children.length - 1);
    
        this.battleDamageNumberRoot = this.createNode('BattleDamageNumberRoot', this.battleCombatLayer, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT, 0, 0);
        this.battleDamageNumberRoot.setSiblingIndex(this.battleCombatLayer.children.length - 1);
        this.raiseBattleCombatRoleLayer();
        this.createBattleAutoHostButton();
    }
    protected createBattleAutoHostButton(): void {
        if (!this.battleCombatLayer?.isValid) return;
    
        const buttonInfo = this.getOrCreateBattleNode(
            this.battleCombatLayer,
            'BattleAutoHostButton',
            HomeConfig.BATTLE_AUTO_HOST_BUTTON_SIZE,
            HomeConfig.BATTLE_AUTO_HOST_BUTTON_SIZE,
            HomeConfig.BATTLE_AUTO_HOST_BUTTON_X,
            HomeConfig.BATTLE_AUTO_HOST_BUTTON_Y,
        );
        const button = buttonInfo.node;
        button.active = true;
        button.setPosition(HomeConfig.BATTLE_AUTO_HOST_BUTTON_X, HomeConfig.BATTLE_AUTO_HOST_BUTTON_Y, 0);
        button.setSiblingIndex(this.battleCombatLayer.children.length - 1);
    
        this.getOrCreateBattleSkinnedNode(
            button,
            'BattleAutoHostButtonIcon',
            HomeConfig.BATTLE_AUTO_HOST_ICON_SIZE,
            HomeConfig.BATTLE_AUTO_HOST_ICON_SIZE,
            0,
            0,
            HomeConfig.UI_BATTLE_AUTO_HOST_ICON,
        ).node.setSiblingIndex(1);
        this.bindScaledClick(button, () => this.openBattleAutoHostConfirmPopup());
    }
    protected async loadBattleCombatAssets(): Promise<void> {
        const monsterData = await this.loadSkeletonAsset(HomeConfig.BATTLE_MONSTER_SKEL_PATH);
        this.battleMonsterSkeletonData = monsterData;

        try {
            this.battleMonsterHitEffectSkeletonData = await this.loadSkeletonAsset(HomeConfig.BATTLE_MONSTER_HIT_EFFECT_SKEL_PATH);
        } catch (error) {
            console.warn('[MainHomeView] battle monster hit effect asset is not ready.', error);
            this.battleMonsterHitEffectSkeletonData = null;
        }

        await this.ensureRoleSkeletonData(this.profile.gender);
    }
    protected playBattleCombatSequence(): void {
        if (!this.battleCombatLayer?.active) return;
    
        this.stopBattleTweens();
        this.clearBattleDamageNumbers();
        this.battleAttackCount = 0;
        this.battleTotalAttackCount = 0;
        this.battleCurrentWave = 0;
        this.battleWaveStartTimeMs = 0;
        this.battleWaveEnding = false;
    
        const roleData = this.getRoleSkeletonData(this.profile.gender);
        if (roleData && this.battleCombatRoleSkeleton?.isValid) {
            this.prepareSkeletonRenderer(this.battleCombatRoleSkeleton);
            this.battleCombatRoleSkeleton.skeletonData = roleData;
            this.battleCombatRoleSkeleton.node.setPosition(HomeConfig.BATTLE_ROLE_POSITION);
            const roleScale = this.getRoleMapScale(this.profile.gender);
            this.battleCombatRoleSkeleton.node.setScale(roleScale, roleScale, 1);
            this.battleCombatRoleSkeleton.timeScale = 1;
            this.setSkeletonVisible(this.battleCombatRoleSkeleton, true);
            this.playSkeletonAnimation(this.battleCombatRoleSkeleton, HomeConfig.IDLE_ANIMATIONS, true);
            this.raiseBattleCombatRoleLayer();
        }

        this.hideBattleMonsterHitEffect();
    
        this.startBattleWave(1);
    }
    protected startBattleWave(wave: number): void {
        if (!this.battleCombatLayer?.active || !this.battleMonsterSkeletonData) return;
    
        this.stopBattleTweens();
        this.unschedule(this.startBattleRoleAttack);
        this.unschedule(this.finishCurrentBattleWave);
        this.unschedule(this.startNextBattleWave);
        this.unschedule(this.finishBattleChallenge);
        this.unschedule(this.playBattleMonsterHurt);
        this.battleMonsterHurtSequenceId += 1;
        this.battleCurrentWave = Math.min(Math.max(1, wave), HomeConfig.BATTLE_WAVE_TOTAL);
        this.battleWaveStartTimeMs = Date.now();
        this.battleWaveEnding = false;
        this.battleAttackCount = 0;
        this.battleAttackTimer = 0;
        this.battleCombatAttacking = false;
        this.clearBattleDamageNumbers();
        this.hideBattleMonsterHitEffect();
        this.updateBattleWaveLabel();
    
        if (this.battleCombatRoleSkeleton?.isValid && this.battleCombatRoleSkeleton.skeletonData) {
            this.battleCombatRoleSkeleton.timeScale = 1;
            this.playSkeletonAnimation(this.battleCombatRoleSkeleton, HomeConfig.IDLE_ANIMATIONS, true);
            this.setSkeletonVisible(this.battleCombatRoleSkeleton, true);
        }
    
        this.battleMonsterSkeletons.forEach((skeleton, index) => {
            const node = this.battleMonsterNodes[index];
            const start = HomeConfig.BATTLE_MONSTER_START_POSITIONS[index];
            const target = HomeConfig.BATTLE_MONSTER_TARGET_POSITIONS[index];
            if (!node?.isValid || !skeleton?.isValid || !start || !target) return;
    
            node.active = true;
            node.setPosition(start);
            node.setScale(-HomeConfig.BATTLE_MONSTER_SCALE, HomeConfig.BATTLE_MONSTER_SCALE, 1);
            this.prepareSkeletonRenderer(skeleton);
            skeleton.skeletonData = this.battleMonsterSkeletonData;
            this.applyBattleMonsterSkin(skeleton);
            this.setSkeletonVisible(skeleton, true);
            this.playSkeletonAnimation(skeleton, HomeConfig.BATTLE_MONSTER_IDLE_ANIMATIONS, true);
    
            const runDelay = 0.18 + index * 0.08;
            const runTime = 0.82 + index * 0.04;
            const monsterTween = tween(node)
                .delay(runDelay)
                .call(() => {
                    if (this.battleWaveEnding || !skeleton.isValid || !skeleton.skeletonData) return;
                    this.playSkeletonAnimation(skeleton, HomeConfig.BATTLE_MONSTER_WALK_ANIMATIONS, true);
                })
                .to(runTime, { position: target.clone() }, { easing: 'sineOut' })
                .call(() => {
                    if (this.battleWaveEnding || !skeleton.isValid || !skeleton.skeletonData) return;
                    this.playSkeletonAnimation(skeleton, HomeConfig.BATTLE_MONSTER_IDLE_ANIMATIONS, true);
                })
                .start();
            this.battleTweens.push(monsterTween);
        });
    
        this.raiseBattleCombatRoleLayer();
        this.scheduleOnce(this.startBattleRoleAttack, HomeConfig.BATTLE_WAVE_ATTACK_START_DELAY);
        this.scheduleOnce(this.finishCurrentBattleWave, HomeConfig.BATTLE_WAVE_DURATION);
    }
    protected applyBattleMonsterSkin(skeleton: sp.Skeleton): void {
        for (const skinName of HomeConfig.BATTLE_MONSTER_SKIN_NAMES) {
            try {
                skeleton.setSkin(skinName);
                skeleton.setToSetupPose();
                return;
            } catch {
                // Try the next skin name exported by the Spine asset.
            }
        }
    }
    protected updateBattleWaveLabel(): void {
        if (!this.battleWaveLabel?.isValid) return;
    
        this.battleWaveLabel.node.active = true;
        this.battleWaveLabel.string = `\u7b2c${this.battleCurrentWave}/${HomeConfig.BATTLE_WAVE_TOTAL}\u6ce2`;
    }
    protected finishCurrentBattleWave(): void {
        if (!this.battleCombatLayer?.active || this.battleWaveEnding) return;
    
        this.battleWaveEnding = true;
        this.battleCombatAttacking = false;
        this.battleAttackTimer = 0;
        this.unschedule(this.startBattleRoleAttack);
        this.unschedule(this.playBattleMonsterHurt);
        this.battleMonsterHurtSequenceId += 1;
        this.hideBattleMonsterHitEffect();
        this.stopBattleTweens();
    
        if (this.battleCombatRoleSkeleton?.isValid && this.battleCombatRoleSkeleton.skeletonData) {
            this.battleCombatRoleSkeleton.timeScale = 1;
            this.playSkeletonAnimation(this.battleCombatRoleSkeleton, HomeConfig.IDLE_ANIMATIONS, true);
        }
    
        let maxDeathDuration = HomeConfig.BATTLE_WAVE_DEATH_FALLBACK_DURATION;
        this.battleMonsterSkeletons.forEach((skeleton) => {
            if (!skeleton?.isValid || !skeleton.skeletonData || !skeleton.node.active) return;
            const duration = this.playBattleMonsterAnimation(skeleton, HomeConfig.BATTLE_MONSTER_DIE_ANIMATIONS, false, HomeConfig.BATTLE_WAVE_DEATH_FALLBACK_DURATION);
            maxDeathDuration = Math.max(maxDeathDuration, duration);
        });
    
        this.scheduleOnce(() => {
            if (!this.battleCombatLayer?.active || !this.battleWaveEnding) return;
            this.hideBattleMonsterWave();
            if (this.battleCurrentWave >= HomeConfig.BATTLE_WAVE_TOTAL) {
                this.scheduleOnce(this.finishBattleChallenge, 0.12);
                return;
            }
            this.scheduleOnce(this.startNextBattleWave, HomeConfig.BATTLE_WAVE_NEXT_DELAY);
        }, maxDeathDuration);
    }
    protected startNextBattleWave(): void {
        this.startBattleWave(this.battleCurrentWave + 1);
    }
    protected hideBattleMonsterWave(): void {
        this.hideBattleMonsterHitEffect();
        this.battleMonsterSkeletons.forEach((skeleton, index) => {
            this.setSkeletonVisible(skeleton, false);
            const node = this.battleMonsterNodes[index];
            if (node?.isValid) {
                node.active = false;
            }
        });
    }
    protected playBattleMonsterAnimation(skeleton: sp.Skeleton, candidates: string[], loop: boolean, fallbackDuration: number): number {
        if (!skeleton.skeletonData) return fallbackDuration;
    
        for (const animation of candidates) {
            try {
                skeleton.clearTracks();
                skeleton.setToSetupPose();
                const track = skeleton.setAnimation(0, animation, loop);
                if (track) {
                    skeleton.updateAnimation(0);
                    skeleton.markForUpdateRenderData(true);
                    return this.getTrackAnimationDuration(track) || fallbackDuration;
                }
            } catch {
                // Try the next monster animation candidate.
            }
        }
    
        console.warn('[MainHomeView] battle monster animation missing', candidates.join('|'));
        return fallbackDuration;
    }
    protected startBattleRoleAttack(): void {
        this.playBattleRoleAttack();
    }
    protected playBattleRoleAttack(): void {
        if (!this.battleCombatLayer?.active || !this.battleCombatRoleSkeleton?.isValid) return;
        if (!this.battleCombatRoleSkeleton.skeletonData) return;
    
        this.battleCombatRoleSkeleton.timeScale = HomeConfig.BATTLE_ROLE_ATTACK_TIME_SCALE;
        this.battleAttackCount = 0;
        this.battleCombatAttacking = true;
        this.unschedule(this.playBattleMonsterHurt);
        this.battleAttackTimer = this.playBattleRoleAttackTick();
    }
    protected updateBattleAttackLoop(deltaTime: number): void {
        if (!this.battleCombatAttacking) return;
        if (this.battleWaveEnding) {
            this.battleCombatAttacking = false;
            return;
        }
        if (!this.battleCombatLayer?.active || !this.battleCombatRoleSkeleton?.isValid || !this.battleCombatRoleSkeleton.skeletonData) {
            this.battleCombatAttacking = false;
            return;
        }
    
        this.battleAttackTimer -= deltaTime;
        if (this.battleAttackTimer > 0) return;
    
        this.battleAttackTimer = this.playBattleRoleAttackTick();
    }
    protected playBattleRoleAttackTick(): number {
        if (!this.battleCombatLayer?.active || !this.battleCombatRoleSkeleton?.isValid) return HomeConfig.BATTLE_ROLE_ATTACK_GAP;
        if (!this.battleCombatRoleSkeleton.skeletonData) return HomeConfig.BATTLE_ROLE_ATTACK_GAP;
        if (this.battleWaveEnding) return HomeConfig.BATTLE_ROLE_ATTACK_GAP;
    
        this.battleCombatRoleSkeleton.timeScale = HomeConfig.BATTLE_ROLE_ATTACK_TIME_SCALE;
        this.raiseBattleCombatRoleLayer();
        this.battleAttackCount += 1;
        const duration = this.playBattleRoleAttackAnimation(false, false);
        this.scheduleBattleRoleAttackHits(false, this.battleCurrentWave, this.battleAttackCount);
        return duration / HomeConfig.BATTLE_ROLE_ATTACK_TIME_SCALE + HomeConfig.BATTLE_ROLE_ATTACK_GAP;
    }
    protected scheduleBattleRoleAttackHits(isSkill: boolean, wave: number, attackIndex: number): void {
        const hitTimes = HomeConfig.BATTLE_ROLE_NORMAL_ATTACK_HIT_TIMES[this.profile.gender];
        hitTimes.forEach((hitTime) => {
            const delay = Math.max(0, hitTime / HomeConfig.BATTLE_ROLE_ATTACK_TIME_SCALE);
            const playHit = (): void => {
                if (wave !== this.battleCurrentWave || attackIndex !== this.battleAttackCount) return;
                this.playBattleMonsterAttackHit(isSkill);
            };
            if (delay <= 0) {
                playHit();
                return;
            }
            this.scheduleOnce(playHit, delay);
        });
    }
    protected playBattleMonsterAttackHit(isSkill: boolean): void {
        if (!this.battleCombatLayer?.active || this.battleWaveEnding) return;
        this.battleTotalAttackCount += 1;
        if (!isSkill) this.playBattleAttackSound();
        this.playBattleMonsterHurt(isSkill);
    }
    protected raiseBattleCombatRoleLayer(): void {
        const roleNode = this.battleCombatRoleSkeleton?.node;
        if (!roleNode?.isValid || !this.battleCombatLayer?.isValid) return;
    
        const hasDamageRoot = this.battleDamageNumberRoot?.isValid && this.battleDamageNumberRoot.parent === this.battleCombatLayer;
        roleNode.setSiblingIndex(Math.max(0, this.battleCombatLayer.children.length - (hasDamageRoot ? 2 : 1)));
        if (this.battleWaveLabel?.node?.isValid) {
            this.battleWaveLabel.node.setSiblingIndex(Math.max(0, this.battleCombatLayer.children.length - (hasDamageRoot ? 2 : 1)));
        }
        if (hasDamageRoot) {
            this.battleDamageNumberRoot!.setSiblingIndex(this.battleCombatLayer.children.length - 1);
        }
        const autoHostButton = this.battleCombatLayer.getChildByName('BattleAutoHostButton');
        if (autoHostButton?.isValid) {
            autoHostButton.setSiblingIndex(this.battleCombatLayer.children.length - 1);
        }
    }
    protected playBattleRoleAttackAnimation(isSkill: boolean, loop: boolean): number {
        const target = this.battleCombatRoleSkeleton;
        const fallbackDuration = this.getBattleRoleAttackFallbackDuration(isSkill);
        if (!target?.isValid || !target.skeletonData) return fallbackDuration;
    
        const candidates = HomeConfig.BATTLE_ROLE_NORMAL_ATTACK_ANIMATIONS[this.profile.gender];
        for (const animation of candidates) {
            try {
                target.clearTracks();
                target.setToSetupPose();
                const track = target.setAnimation(0, animation, loop);
                if (track) {
                    target.updateAnimation(0);
                    target.markForUpdateRenderData(true);
                    return this.getTrackAnimationDuration(track) || fallbackDuration;
                }
            } catch {
                // Try the next candidate name.
            }
        }
    
        console.warn('[MainHomeView] battle role attack animation missing', candidates.join('|'));
        return fallbackDuration;
    }
    protected getBattleRoleAttackFallbackDuration(isSkill: boolean): number {
        const config = HomeConfig.BATTLE_ROLE_ATTACK_FALLBACK_DURATIONS[this.profile.gender];
        return isSkill ? config.skill : config.normal;
    }
    protected getTrackAnimationDuration(track: unknown): number {
        const entry = track as {
            animationStart?: number;
            animationEnd?: number;
            animation?: { duration?: number; getDuration?: () => number };
        };
    
        const start = typeof entry.animationStart === 'number' ? entry.animationStart : 0;
        const end = typeof entry.animationEnd === 'number' ? entry.animationEnd : 0;
        if (end > start) {
            return end - start;
        }
    
        const duration = entry.animation?.duration;
        if (typeof duration === 'number' && duration > 0) {
            return duration;
        }
    
        const getDuration = entry.animation?.getDuration;
        if (typeof getDuration === 'function') {
            const value = getDuration.call(entry.animation);
            if (typeof value === 'number' && value > 0) {
                return value;
            }
        }
    
        return 0;
    }
    protected playBattleMonsterHurt(isSkill = false): void {
        if (!this.battleCombatLayer?.active || this.battleWaveEnding) return;
    
        const wave = this.battleCurrentWave;
        const hurtSequenceId = ++this.battleMonsterHurtSequenceId;
        const activeTargets: Array<{ skeleton: sp.Skeleton; node: Node; index: number }> = [];
    
        this.battleMonsterSkeletons.forEach((skeleton, index) => {
            const monsterNode = this.battleMonsterNodes[index];
            if (!skeleton?.isValid || !skeleton.skeletonData || !monsterNode?.isValid || !monsterNode.active) return;
            activeTargets.push({ skeleton, node: monsterNode, index });
        });

        if (activeTargets.length > 0) {
            this.playBattleMonsterHitEffect();
        }

        activeTargets.forEach(({ skeleton, node: monsterNode, index }) => {
    
            this.playBattleMonsterAnimation(skeleton, HomeConfig.BATTLE_MONSTER_HURT_ANIMATIONS, false, isSkill ? 0.52 : 0.36);
            this.spawnBattleDamageNumber(monsterNode, index);
            this.scheduleOnce(() => {
                if (hurtSequenceId !== this.battleMonsterHurtSequenceId) return;
                if (!this.battleCombatLayer?.active || wave !== this.battleCurrentWave || this.battleWaveEnding) return;
                if (!skeleton.isValid || !skeleton.skeletonData || !monsterNode.isValid || !monsterNode.active) return;
                this.playSkeletonAnimation(skeleton, HomeConfig.BATTLE_MONSTER_IDLE_ANIMATIONS, true);
            }, (isSkill ? 0.52 : 0.36) + index * 0.025);
        });
    }
    protected playBattleMonsterHitEffect(): void {
        const skeleton = this.battleMonsterHitEffectSkeleton;
        const data = this.battleMonsterHitEffectSkeletonData;
        const effectNode = skeleton?.node;
        if (!this.battleCombatLayer?.isValid || !skeleton?.isValid || !effectNode?.isValid || !data) return;

        this.unschedule(this.hideBattleMonsterHitEffect);
        effectNode.active = true;
        effectNode.setPosition(HomeConfig.BATTLE_MONSTER_HIT_EFFECT_POSITION);
        effectNode.setScale(HomeConfig.BATTLE_MONSTER_HIT_EFFECT_SCALE, HomeConfig.BATTLE_MONSTER_HIT_EFFECT_SCALE, 1);
        const damageRootIndex = this.battleDamageNumberRoot?.parent === this.battleCombatLayer
            ? this.battleCombatLayer.children.indexOf(this.battleDamageNumberRoot)
            : -1;
        effectNode.setSiblingIndex(damageRootIndex >= 0 ? Math.max(0, damageRootIndex) : this.battleCombatLayer.children.length - 1);

        this.prepareSkeletonRenderer(skeleton);
        skeleton.skeletonData = data;
        skeleton.timeScale = 1;
        this.setSkeletonVisible(skeleton, true);
        const duration = this.playBattleMonsterAnimation(
            skeleton,
            HomeConfig.BATTLE_MONSTER_HIT_EFFECT_ANIMATIONS,
            false,
            HomeConfig.BATTLE_MONSTER_HIT_EFFECT_FALLBACK_DURATION,
        );
        this.scheduleOnce(this.hideBattleMonsterHitEffect, duration);
    }
    protected hideBattleMonsterHitEffect(): void {
        this.unschedule(this.hideBattleMonsterHitEffect);
        if (!this.battleMonsterHitEffectSkeleton?.isValid) return;

        this.setSkeletonVisible(this.battleMonsterHitEffectSkeleton, false);
        if (this.battleMonsterHitEffectSkeleton.node?.isValid) {
            this.battleMonsterHitEffectSkeleton.node.active = false;
        }
    }
    protected spawnBattleDamageNumber(monsterNode: Node, monsterIndex: number): void {
        if (!this.battleDamageNumberRoot?.isValid) return;
    
        const value = this.getBattleDamageValue(monsterIndex);
        const digits = value.split('');
        const startPosition = monsterNode.position.clone();
        const stagger = (this.battleTotalAttackCount + monsterIndex) % 4;
        const x = startPosition.x
            + HomeConfig.BATTLE_DAMAGE_NUMBER_START_OFFSET_X
            + stagger * HomeConfig.BATTLE_DAMAGE_NUMBER_STAGGER_X;
        const y = startPosition.y
            + HomeConfig.BATTLE_DAMAGE_NUMBER_START_OFFSET_Y
            + (monsterIndex % 3) * HomeConfig.BATTLE_DAMAGE_NUMBER_STAGGER_Y;
        const damageNode = this.createNode(
            `BattleDamageNumber_${this.battleCurrentWave}_${this.battleTotalAttackCount}_${monsterIndex}`,
            this.battleDamageNumberRoot,
            digits.length * HomeConfig.BATTLE_DAMAGE_DIGIT_SPACING + HomeConfig.BATTLE_DAMAGE_DIGIT_WIDTH,
            HomeConfig.BATTLE_DAMAGE_DIGIT_HEIGHT,
            x,
            y,
        );
        damageNode.setScale(HomeConfig.BATTLE_DAMAGE_NUMBER_SCALE, HomeConfig.BATTLE_DAMAGE_NUMBER_SCALE, 1);
        damageNode.setSiblingIndex(this.battleDamageNumberRoot.children.length - 1);
        const opacity = damageNode.addComponent(UIOpacity);
        opacity.opacity = 255;
    
        const totalWidth = (digits.length - 1) * HomeConfig.BATTLE_DAMAGE_DIGIT_SPACING + HomeConfig.BATTLE_DAMAGE_DIGIT_WIDTH;
        const startX = -totalWidth / 2 + HomeConfig.BATTLE_DAMAGE_DIGIT_WIDTH / 2;
        digits.forEach((digit, digitIndex) => {
            const digitNode = this.createSkinnedNode(
                `BattleDamageDigit_${digitIndex}`,
                damageNode,
                HomeConfig.BATTLE_DAMAGE_DIGIT_WIDTH,
                HomeConfig.BATTLE_DAMAGE_DIGIT_HEIGHT,
                startX + digitIndex * HomeConfig.BATTLE_DAMAGE_DIGIT_SPACING,
                0,
                `${HomeConfig.UI_BATTLE_DAMAGE_DIGIT_ROOT}/n_${digit}`,
            );
            digitNode.setSiblingIndex(digitIndex);
        });
    
        const targetX = x + HomeConfig.BATTLE_DAMAGE_NUMBER_FLOAT_X + stagger * 6;
        const targetY = y + HomeConfig.BATTLE_DAMAGE_NUMBER_FLOAT_Y + stagger * 4;
        tween(damageNode)
            .to(
                HomeConfig.BATTLE_DAMAGE_NUMBER_FLOAT_TIME,
                {
                    position: new Vec3(targetX, targetY, 0),
                    scale: new Vec3(1, 1, 1),
                },
                { easing: 'sineOut' },
            )
            .start();
        tween(opacity)
            .delay(0.14)
            .to(Math.max(0.1, HomeConfig.BATTLE_DAMAGE_NUMBER_FLOAT_TIME - 0.14), { opacity: 0 }, { easing: 'sineIn' })
            .call(() => {
                if (!damageNode.isValid) return;
                damageNode.removeFromParent();
                damageNode.destroy();
            })
            .start();
    }
    protected getBattleDamageValue(monsterIndex: number): string {
        const seed = this.battleCurrentWave * 531 + this.battleTotalAttackCount * 173 + monsterIndex * 67;
        return `${Math.max(1, 7200 + seed)}`;
    }
    protected clearBattleDamageNumbers(): void {
        if (!this.battleDamageNumberRoot?.isValid) return;
    
        [...this.battleDamageNumberRoot.children].forEach((child) => {
            Tween.stopAllByTarget(child);
            const opacity = child.getComponent(UIOpacity);
            if (opacity) {
                Tween.stopAllByTarget(opacity);
            }
            child.removeFromParent();
            child.destroy();
        });
    }
}
