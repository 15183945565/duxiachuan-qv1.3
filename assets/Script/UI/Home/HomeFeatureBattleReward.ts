import {
    Color,
    EventTouch,
    Graphics,
    HorizontalTextAlignment,
    Mask,
    Node,
    Sprite,
    UITransform,
    sp,
} from 'cc';
import {
    BAG_ILLUSTRATION_CATALOG,
    type BagIllustrationCatalogItem,
} from './BagIllustrationCatalog.generated';
import * as HomeConfig from './HomeConfig';
import { HomeViewBase } from './HomeViewBase';

abstract class HomeFeatureBattleRewardHost extends HomeViewBase {
    protected abstract battleRewardItemsOverride: Array<{ item: BagIllustrationCatalogItem; amount: string }> | null;
    protected abstract battleRewardCloseMode: 'battle' | 'popupOnly' | 'magic';
    protected abstract getTrackAnimationDuration(track: unknown): number;
}

/**
 * Owns Battle reward popup rendering, reward animation and result routing.
 */
export abstract class HomeFeatureBattleReward extends HomeFeatureBattleRewardHost {
    protected ensureBattleRewardPopup(): Node {
        const parent = this.popupRoot || this.uiHudLayer || this.node;
        let popup = parent.getChildByName('BattleRewardPopup') || this.findNode('BattleRewardPopup');
        if (!popup?.isValid) {
            popup = this.createNode('BattleRewardPopup', parent, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT, 0, 0);
        } else if (popup.parent !== parent) {
            popup.setParent(parent);
        }
        popup.active = false;
        (popup.getComponent(UITransform) || popup.addComponent(UITransform)).setContentSize(HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT);
        popup.off(Node.EventType.TOUCH_END);
        popup.on(Node.EventType.TOUCH_END, (event: EventTouch) => {
            event.propagationStopped = true;
            this.closeBattleRewardPopupAndReturn();
        }, this);
    
        const mask = this.getOrCreateBattleNode(popup, 'BattleRewardMask', HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT, 0, 0).node;
        const maskGraphic = mask.getComponent(Graphics);
        if (maskGraphic) {
            maskGraphic.clear();
            maskGraphic.fillColor = new Color(0, 0, 0, 120);
            maskGraphic.rect(-HomeConfig.VIEW_WIDTH / 2, -HomeConfig.VIEW_HEIGHT / 2, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT);
            maskGraphic.fill();
        } else if (!mask.getComponent(Sprite)) {
            this.drawRect(mask, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT, new Color(0, 0, 0, 120));
        }
        mask.setSiblingIndex(0);
        mask.off(Node.EventType.TOUCH_END);
        mask.on(Node.EventType.TOUCH_END, (event: EventTouch) => {
            event.propagationStopped = true;
            this.closeBattleRewardPopupAndReturn();
        }, this);
    
        const board = this.getOrCreateBattleNode(
            popup,
            'BattleRewardBoard',
            HomeConfig.BATTLE_REWARD_POPUP_WIDTH,
            HomeConfig.BATTLE_REWARD_POPUP_HEIGHT,
            0,
            HomeConfig.BATTLE_REWARD_POPUP_Y,
        ).node;
        board.off(Node.EventType.TOUCH_START);
        board.off(Node.EventType.TOUCH_END);
        board.on(Node.EventType.TOUCH_START, (event: EventTouch) => {
            event.propagationStopped = true;
        }, this);
        board.on(Node.EventType.TOUCH_END, (event: EventTouch) => {
            event.propagationStopped = true;
        }, this);
        board.setSiblingIndex(1);
        this.getOrCreateBattleSkinnedNode(
            board,
            'BattleRewardBoardSkin',
            HomeConfig.BATTLE_REWARD_POPUP_WIDTH,
            HomeConfig.BATTLE_REWARD_POPUP_HEIGHT,
            0,
            0,
            HomeConfig.UI_BATTLE_REWARD_POPUP_BG,
        ).node.setSiblingIndex(0);
    
        const itemsRoot = this.getOrCreateBattleNode(
            board,
            'BattleRewardItemsRoot',
            HomeConfig.BATTLE_REWARD_POPUP_WIDTH,
            HomeConfig.BATTLE_REWARD_POPUP_HEIGHT,
            0,
            HomeConfig.BATTLE_REWARD_GRID_Y,
        ).node;
        itemsRoot.setSiblingIndex(1);
    
        const titleNode = this.getOrCreateBattleNode(
            popup,
            'BattleRewardTitleSpine',
            HomeConfig.BATTLE_REWARD_TEXT_WIDTH,
            HomeConfig.BATTLE_REWARD_TEXT_HEIGHT,
            0,
            HomeConfig.BATTLE_REWARD_TEXT_Y,
        ).node;
        titleNode.setSiblingIndex(2);
        titleNode.setScale(HomeConfig.BATTLE_REWARD_TEXT_SCALE, HomeConfig.BATTLE_REWARD_TEXT_SCALE, 1);
        this.battleRewardTextSkeleton = titleNode.getComponent(sp.Skeleton) || titleNode.addComponent(sp.Skeleton);
        this.setSkeletonVisible(this.battleRewardTextSkeleton, false);
    
        this.battleRewardPopup = popup;
        this.battleRewardBoard = board;
        this.battleRewardItemsRoot = itemsRoot;
        return popup;
    }
    protected openBattleRewardPopup(
        rewards: Array<{ item: BagIllustrationCatalogItem; amount: string }> | null = null,
        closeMode: 'battle' | 'popupOnly' | 'magic' = 'battle',
    ): void {
        this.battleRewardItemsOverride = rewards;
        this.battleRewardCloseMode = closeMode;
        const popup = this.ensureBattleRewardPopup();
        this.sharedFlowPopupNames.forEach((name) => {
            const other = this.popupRoot?.getChildByName(name) || this.findNode(name);
            if (other?.isValid) other.active = false;
        });
        this.populateBattleRewardItems();
        popup.active = true;
        this.ensureInputBlocker(popup);
        popup.setSiblingIndex((popup.parent?.children.length || 1) - 1);
        this.refreshRootLayerOrder();
        this.playBattleRewardTextAnimation();
    }
    protected populateBattleRewardItems(): void {
        if (!this.battleRewardItemsRoot?.isValid) return;
    
        this.battleRewardItemsRoot.removeAllChildren();
        const rewards = this.getBattleRewardItems();
        const columns = HomeConfig.BATTLE_REWARD_GRID_COLUMNS;
        const firstRowCount = Math.min(columns, rewards.length);
        rewards.forEach((reward, index) => {
            const row = index < firstRowCount ? 0 : 1;
            const rowStart = row === 0 ? 0 : firstRowCount;
            const rowItemCount = row === 0 ? firstRowCount : rewards.length - firstRowCount;
            const column = index - rowStart;
            const x = (column - (rowItemCount - 1) / 2) * HomeConfig.BATTLE_REWARD_GRID_COLUMN_GAP;
            const y = (row === 0 ? 0.5 : -0.5) * HomeConfig.BATTLE_REWARD_GRID_ROW_GAP;
            this.createBattleRewardItem(this.battleRewardItemsRoot!, index, reward.item, reward.amount, x, y);
        });
    }
    protected getBattleRewardItems(): Array<{ item: BagIllustrationCatalogItem; amount: string }> {
        if (this.battleRewardItemsOverride?.length) {
            return this.battleRewardItemsOverride;
        }

        const materials = this.sortBagCatalogItems(
            BAG_ILLUSTRATION_CATALOG.filter((item) => item.category === 'material'),
        );
        const source = materials.length > 0
            ? materials.slice(0, HomeConfig.BATTLE_REWARD_GRID_ITEM_COUNT)
            : BAG_ILLUSTRATION_CATALOG.slice(0, HomeConfig.BATTLE_REWARD_GRID_ITEM_COUNT);
    
        return source.map((item, index) => ({
            item,
            amount: HomeConfig.BATTLE_REWARD_COUNT_VALUES[index] || '1',
        }));
    }
    protected createBattleRewardItem(parent: Node, index: number, item: BagIllustrationCatalogItem, amount: string, x: number, y: number): void {
        const slot = this.createNode(`BattleRewardSlot_${index + 1}`, parent, HomeConfig.BATTLE_REWARD_SLOT_SIZE, HomeConfig.BATTLE_REWARD_SLOT_SIZE, x, y);
        slot.setSiblingIndex(index + 1);
        this.createSkinnedNode('BattleRewardItemFrame', slot, HomeConfig.BATTLE_REWARD_FRAME_SIZE, HomeConfig.BATTLE_REWARD_FRAME_SIZE, 0, 0, item.framePath).setSiblingIndex(0);
        this.createSkinnedNode('BattleRewardItemIcon', slot, HomeConfig.BATTLE_REWARD_ICON_SIZE, HomeConfig.BATTLE_REWARD_ICON_SIZE, 0, 3, item.iconPath).setSiblingIndex(1);
        const count = this.createLabel(slot, 'BattleRewardItemCount', amount, 20, 25, -30, 56, 28, Color.WHITE);
        count.horizontalAlign = HorizontalTextAlignment.RIGHT;
        count.enableOutline = true;
        count.outlineColor = new Color(25, 20, 14, 255);
        count.outlineWidth = 2;
        count.node.setSiblingIndex(2);
        this.bindGridItemTap(slot, () => {
            this.openBagIllustrationItemDetailPopup(item, HomeConfig.MARKET_CATEGORY_TITLES[item.category] || '\u6750\u6599');
        });
    }
    protected playBattleRewardTextAnimation(): void {
        const skeleton = this.battleRewardTextSkeleton;
        if (!skeleton?.isValid) return;
    
        const loadVersion = ++this.battleRewardLoadVersion;
        this.setSkeletonVisible(skeleton, false);
        void this.loadSkeletonAsset(HomeConfig.BATTLE_REWARD_TEXT_SKEL_PATH)
            .then((skeletonData) => {
                if (loadVersion !== this.battleRewardLoadVersion || !this.battleRewardPopup?.active || !skeleton.isValid) return;
    
                this.prepareSkeletonRenderer(skeleton);
                skeleton.skeletonData = skeletonData;
                skeleton.node.setScale(HomeConfig.BATTLE_REWARD_TEXT_SCALE, HomeConfig.BATTLE_REWARD_TEXT_SCALE, 1);
                skeleton.clearTracks();
                skeleton.setToSetupPose();
                let introDuration = 0.8;
                try {
                    const track = skeleton.setAnimation(0, HomeConfig.BATTLE_REWARD_TEXT_INTRO_ANIMATION, false);
                    introDuration = this.getTrackAnimationDuration(track) || introDuration;
                    skeleton.updateAnimation(0);
                    skeleton.markForUpdateRenderData(true);
                } catch (err) {
                    console.warn('[MainHomeView] battle reward intro animation missing', err);
                    this.startBattleRewardTextLoop(loadVersion);
                    return;
                }
    
                const listenerTarget = skeleton as unknown as {
                    setCompleteListener?: (listener: ((entry: unknown) => void) | null) => void;
                };
                let loopStarted = false;
                const startLoop = (): void => {
                    if (loopStarted) return;
                    loopStarted = true;
                    listenerTarget.setCompleteListener?.(null);
                    this.startBattleRewardTextLoop(loadVersion);
                };
                listenerTarget.setCompleteListener?.(() => startLoop());
                this.scheduleOnce(startLoop, introDuration + 0.02);
            })
            .catch((err) => {
                console.warn('[MainHomeView] battle reward spine load failed', err);
            });
    }
    protected startBattleRewardTextLoop(loadVersion: number): void {
        const skeleton = this.battleRewardTextSkeleton;
        if (loadVersion !== this.battleRewardLoadVersion || !this.battleRewardPopup?.active || !skeleton?.isValid || !skeleton.skeletonData) return;
    
        try {
            skeleton.clearTracks();
            skeleton.setToSetupPose();
            skeleton.setAnimation(0, HomeConfig.BATTLE_REWARD_TEXT_LOOP_ANIMATION, true);
            skeleton.updateAnimation(0);
            skeleton.markForUpdateRenderData(true);
        } catch (err) {
            console.warn('[MainHomeView] battle reward loop animation missing', err);
        }
    }
    protected hideBattleRewardPopup(): void {
        this.battleRewardLoadVersion += 1;
        const listenerTarget = this.battleRewardTextSkeleton as unknown as {
            setCompleteListener?: (listener: ((entry: unknown) => void) | null) => void;
        } | null;
        listenerTarget?.setCompleteListener?.(null);
        if (this.battleRewardTextSkeleton?.isValid) {
            this.setSkeletonVisible(this.battleRewardTextSkeleton, false);
        }
        if (this.battleRewardPopup?.isValid) {
            this.battleRewardPopup.active = false;
        }
        this.battleRewardItemsOverride = null;
        this.battleRewardCloseMode = 'battle';
    }
    protected closeBattleRewardPopupAndReturn(): void {
        const closeMode = this.battleRewardCloseMode;
        this.hideBattleRewardPopup();
        if (closeMode === 'battle') {
            this.resetBattlePanelToEntry();
            this.playBattleBackgroundAnimation();
            return;
        }
        if (closeMode === 'magic') {
            this.returnToMagicScenePanel();
        }
    }
    protected finishBattleChallenge(): void {
        if (!this.battlePanel?.active || !this.battleCombatLayer?.active) return;
    
        this.battleCombatAttacking = false;
        this.battleAttackTimer = 0;
        this.unschedule(this.playBattleMonsterHurt);
        if (this.battleCombatRoleSkeleton?.isValid) {
            this.battleCombatRoleSkeleton.timeScale = 1;
            this.playSkeletonAnimation(this.battleCombatRoleSkeleton, HomeConfig.IDLE_ANIMATIONS, true);
        }
        this.hideBattleMonsterWave();
        this.clearBattleDamageNumbers();
    
        this.openBattleRewardPopup();
    }
    protected returnToBattleEntryFromResult(): void {
        this.hideBattleRewardPopup();
        const popup = this.popupRoot?.getChildByName('BattleResultPopup') || this.findNode('BattleResultPopup');
        if (popup) this.closeSharedFlowPopup(popup);
        this.resetBattlePanelToEntry();
        this.playBattleBackgroundAnimation();
    }
}
