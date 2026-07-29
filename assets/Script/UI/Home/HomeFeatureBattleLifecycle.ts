import {
    AssetManager,
    Label,
    Tween,
    sp,
} from 'cc';
import * as HomeConfig from './HomeConfig';
import { HomeViewBase } from './HomeViewBase';

/**
 * Owns Battle cancellation, tween cleanup, top controls and background Spine lifecycle.
 */
export abstract class HomeFeatureBattleLifecycle extends HomeViewBase {
    protected stopBattleChallengeSequence(): void {
        this.hideBattleRewardPopup();
        this.stopBattleTweens();
        this.unschedule(this.startBattleRoleAttack);
        this.unschedule(this.finishCurrentBattleWave);
        this.unschedule(this.startNextBattleWave);
        this.unschedule(this.finishBattleChallenge);
        this.unschedule(this.playBattleMonsterHurt);
        this.battleAttackCount = 0;
        this.battleTotalAttackCount = 0;
        this.battleAttackTimer = 0;
        this.battleCombatAttacking = false;
        this.battleCurrentWave = 0;
        this.battleWaveEnding = false;
        this.clearBattleDamageNumbers();
        if (this.battleWaveLabel?.node?.isValid) {
            this.battleWaveLabel.node.active = false;
        }
    
        if (this.battleCombatBgSkeleton?.isValid) {
            this.setSkeletonVisible(this.battleCombatBgSkeleton, false);
        }
        if (this.battleCombatRoleSkeleton?.isValid) {
            this.battleCombatRoleSkeleton.timeScale = 1;
            this.setSkeletonVisible(this.battleCombatRoleSkeleton, false);
        }
        this.battleMonsterSkeletons.forEach((skeleton) => {
            this.setSkeletonVisible(skeleton, false);
            if (skeleton?.node?.isValid) {
                skeleton.node.active = false;
            }
        });
        if (this.battleCombatLayer?.isValid) {
            this.battleCombatLayer.active = false;
        }
    }
    protected stopBattleTweens(): void {
        this.battleTweens.forEach((tw) => tw.stop());
        this.battleTweens.length = 0;
        this.battleMonsterNodes.forEach((node) => {
            if (node?.isValid) {
                Tween.stopAllByTarget(node);
            }
        });
    }
    protected setBattleTitle(text: string): void {
        const title = this.battlePanel?.getChildByName('BattleTitle')?.getComponent(Label);
        if (title) {
            title.string = text;
        }
    }
    protected raiseBattleTopControls(): void {
        if (!this.battlePanel) return;
    
        const titleNode = this.battlePanel.getChildByName('BattleTitle');
        const closeNode = this.battlePanel.getChildByName('BattleBack');
        const entryNode = this.battleEntryUiRoot;
        const lastIndex = this.battlePanel.children.length - 1;
    
        if (entryNode?.isValid && entryNode.active) {
            entryNode.setSiblingIndex(Math.max(0, lastIndex - 2));
        }
        if (titleNode?.isValid) {
            titleNode.setSiblingIndex(Math.max(0, lastIndex - 1));
        }
        if (closeNode?.isValid) {
            closeNode.setSiblingIndex(lastIndex);
        }
    }
    protected loadBattleBackgroundSkeletonData(): Promise<void> {
        return new Promise((resolve) => {
            if (!this.battleBgSkeleton?.isValid) {
                resolve();
                return;
            }
    
            const loadFromBundle = (bundle: AssetManager.Bundle): void => {
                bundle.load(HomeConfig.BATTLE_BG_SKEL_PATH, sp.SkeletonData, (err, asset) => {
                    if (!err && asset && this.battleBgSkeleton?.isValid) {
                        this.prepareSkeletonRenderer(this.battleBgSkeleton);
                        this.battleBgSkeleton.skeletonData = asset;
                        this.battleBgSkeleton.node.setPosition(HomeConfig.BATTLE_BG_OFFSET_X, HomeConfig.BATTLE_BG_OFFSET_Y, 0);
                        this.battleBgSkeleton.node.setScale(HomeConfig.BATTLE_BG_SCALE, HomeConfig.BATTLE_BG_SCALE, 1);
                        this.setSkeletonVisible(this.battleBgSkeleton, this.battlePanel?.active === true);
                        if (this.battlePanel?.active === true) {
                            this.playSkeletonAnimation(this.battleBgSkeleton, HomeConfig.BATTLE_BG_ANIMATIONS, true);
                        }
                    } else if (err) {
                        console.warn('[MainHomeView] battle bg skel not ready', err);
                    }
                    resolve();
                });
            };
    
            void this.acquireHomeAssetBundle(HomeConfig.BATTLE_BG_SKEL_PATH)
                .then((bundle) => {
                    loadFromBundle(bundle);
                })
                .catch((err) => {
                    console.warn('[MainHomeView] battle bg bundle not ready', err);
                    resolve();
                });
        });
    }
    protected playBattleBackgroundAnimation(): void {
        if (!this.battleBgSkeleton?.isValid) return;
    
        this.battleBgSkeleton.node.setPosition(HomeConfig.BATTLE_BG_OFFSET_X, HomeConfig.BATTLE_BG_OFFSET_Y, 0);
        this.battleBgSkeleton.node.setScale(HomeConfig.BATTLE_BG_SCALE, HomeConfig.BATTLE_BG_SCALE, 1);
        this.battleBgSkeleton.node.setSiblingIndex(0);
        if (!this.battleBgSkeleton.skeletonData) {
            void this.loadBattleBackgroundSkeletonData();
            return;
        }
    
        this.setSkeletonVisible(this.battleBgSkeleton, true);
        this.playSkeletonAnimation(this.battleBgSkeleton, HomeConfig.BATTLE_BG_ANIMATIONS, true);
    }
    protected stopBattleBackgroundAnimation(): void {
        if (this.battleBgSkeleton?.isValid) {
            this.setSkeletonVisible(this.battleBgSkeleton, false);
        }
    }
}
