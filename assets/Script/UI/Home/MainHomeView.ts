import {
    _decorator,
    AssetManager,
    AudioClip,
    AudioSource,
    Color,
    Component,
    EditBox,
    EventTouch,
    Graphics,
    HorizontalTextAlignment,
    ImageAsset,
    instantiate,
    Label,
    Mask,
    Node,
    Overflow,
    Prefab,
    Rect,
    Size,
    Sprite,
    SpriteFrame,
    ScrollView,
    Texture2D,
    Tween,
    UIOpacity,
    tween,
    UITransform,
    Vec3,
    VerticalTextAlignment,
    assetManager,
    screen,
    sp,
    sys,
} from 'cc';
import { ResourceManager, ResourceScope } from '../../Managers/ResourceManager';
import { GameBackend } from '../../Services/Backend/GameBackend';
import { DisplayAdapter } from '../../Services/DisplayAdapter';
import { UI_LAYER_NAMES, UI_PAGE_LAYER_ORDER } from '../Common/UIConvention';
import { applySimKaiFont, applySimKaiFontToTree } from '../Common/UIFont';
import { BAG_ILLUSTRATION_CATALOG, type BagIllustrationCatalogItem, type BagIllustrationCategory } from './BagIllustrationCatalog.generated';

import {
    RoleGender,
    RolePageTab,
    BagPageTab,
    MailTab,
    RankTab,
    MarketTab,
    AllianceTab,
    DuelTab,
    MarketCategory,
    MagicSceneLayoutConfig,
    BeastCardLayoutConfig,
    EntryButton,
    SharedPopupContent,
    MagicMapMonsterRuntime,
    RoleProfile,
    RoleAssetConfig,
    MailReward,
    MailData,
    NoticeType,
    NoticeData,
    RankPlayerData,
    ShopItemData,
    ShopStoreState,
    MarketListingData,
    MarketTransactionData,
    BagBottomTabButton,
    BagCatalogView,
    RoleBottomTabButton,
} from './HomeTypes';
import * as HomeConfig from './HomeConfig';
import { HomeFeatureAssetRuntime } from './HomeFeatureAssetRuntime';
import { HomeFeatureBag } from './HomeFeatureBag';
import { HomeFeatureBattleChallenge } from './HomeFeatureBattleChallenge';
import { HomeFeatureBattleCombat } from './HomeFeatureBattleCombat';
import { HomeFeatureBattleEntry } from './HomeFeatureBattleEntry';
import { HomeFeatureBattleLifecycle } from './HomeFeatureBattleLifecycle';
import { HomeFeatureBattleReward } from './HomeFeatureBattleReward';
import { HomeFeatureBattleUpgrade } from './HomeFeatureBattleUpgrade';
import { HomeFeatureBeastCardPresentation } from './HomeFeatureBeastCardPresentation';
import { HomeFeatureBeastCardRecord } from './HomeFeatureBeastCardRecord';
import { HomeFeatureBeastCardShell } from './HomeFeatureBeastCardShell';
import { HomeFeatureBeastStrengthenInteraction } from './HomeFeatureBeastStrengthenInteraction';
import { HomeFeatureBeastStrengthenPage } from './HomeFeatureBeastStrengthenPage';
import { HomeFeatureBeastStrengthenRules } from './HomeFeatureBeastStrengthenRules';
import { HomeFeatureBottomFeatureShell } from './HomeFeatureBottomFeatureShell';
import { HomeFeatureCharacter } from './HomeFeatureCharacter';
import { HomeFeatureCharacterCreationUI } from './HomeFeatureCharacterCreationUI';
import { HomeFeatureCommerceConfirm } from './HomeFeatureCommerceConfirm';
import { HomeFeatureDuelActorRuntime } from './HomeFeatureDuelActorRuntime';
import { HomeFeatureDuelInvest } from './HomeFeatureDuelInvest';
import { HomeFeatureDuelLobby } from './HomeFeatureDuelLobby';
import { HomeFeatureDuelLuanshi } from './HomeFeatureDuelLuanshi';
import { HomeFeatureDuelLuanshiBattle } from './HomeFeatureDuelLuanshiBattle';
import { HomeFeatureDuelRank } from './HomeFeatureDuelRank';
import { HomeFeatureDuelRecord } from './HomeFeatureDuelRecord';
import { HomeFeatureDuelRoundClock } from './HomeFeatureDuelRoundClock';
import { HomeFeatureDuelRoundResolution } from './HomeFeatureDuelRoundResolution';
import { HomeFeatureDuelSceneUI } from './HomeFeatureDuelSceneUI';
import { HomeFeatureGiftShare } from './HomeFeatureGiftShare';
import { HomeFeatureHomeUIRoot } from './HomeFeatureHomeUIRoot';
import { HomeFeatureHomeSceneShell } from './HomeFeatureHomeSceneShell';
import { HomeFeatureItemDetail } from './HomeFeatureItemDetail';
import { HomeFeatureMagicBattle } from './HomeFeatureMagicBattle';
import { HomeFeatureMagicBattleAssistCards } from './HomeFeatureMagicBattleAssistCards';
import { HomeFeatureMagicBattleDamage } from './HomeFeatureMagicBattleDamage';
import { HomeFeatureMagicBattleDuel } from './HomeFeatureMagicBattleDuel';
import { HomeFeatureMagicMap } from './HomeFeatureMagicMap';
import { HomeFeatureMagicScene } from './HomeFeatureMagicScene';
import { HomeFeatureMailData } from './HomeFeatureMailData';
import { HomeFeatureMailDetail } from './HomeFeatureMailDetail';
import { HomeFeatureMailPanel } from './HomeFeatureMailPanel';
import { HomeFeatureMarketSell } from './HomeFeatureMarketSell';
import { HomeFeatureMarketShell } from './HomeFeatureMarketShell';
import { HomeFeatureMarketTrade } from './HomeFeatureMarketTrade';
import { HomeFeatureNotice } from './HomeFeatureNotice';
import { HomeFeatureProfileAvatarFrame } from './HomeFeatureProfileAvatarFrame';
import { HomeFeatureProfileSettings } from './HomeFeatureProfileSettings';
import { HomeFeatureProfileShell } from './HomeFeatureProfileShell';
import { HomeFeatureRank } from './HomeFeatureRank';
import { HomeFeatureRoleAdvance } from './HomeFeatureRoleAdvance';
import { HomeFeatureRoleDisplay } from './HomeFeatureRoleDisplay';
import { HomeFeatureRoleEquipment } from './HomeFeatureRoleEquipment';
import { HomeFeatureRoleProgression } from './HomeFeatureRoleProgression';
import { HomeFeatureRoleStrengthen } from './HomeFeatureRoleStrengthen';
import { HomeFeatureRoleVisualRuntime } from './HomeFeatureRoleVisualRuntime';
import { HomeFeatureShop } from './HomeFeatureShop';
import { HomeFeatureShowcase } from './HomeFeatureShowcase';
import { HomeFeatureToast } from './HomeFeatureToast';
import { HomeFeatureTransitionLoading } from './HomeFeatureTransitionLoading';
import { HomeFeatureWorldMovement } from './HomeFeatureWorldMovement';
import {
    getHomeAssetBundleName,
    getHomeEntryAssetBundleNames,
    HOME_SHARED_ASSET_BUNDLE_NAME,
} from './HomeAssetBundleManifest';
import { HomeViewBase } from './HomeViewBase';
import { HomeViewAdventure } from './HomeViewAdventure';
import { HomeViewRoleBag } from './HomeViewRoleBag';
import { composeStatefulFeature, composeStatelessFeature } from './HomeFeatureComposer';
import {
    HOME_UI_BUNDLE_NAME,
    HOME_UI_STARTUP_PREFABS,
    HOME_UI_SHARED_BUNDLE_NAME,
    getHomeUIEntryPrefabs,
    type HomeUIPrefabDefinition,
} from './HomeUIPrefabManifest';

const { ccclass, property } = _decorator;
const RoleBagFeature = composeStatefulFeature(
    HomeViewBase,
    HomeViewRoleBag,
    HomeViewRoleBag.initializeFeatureState,
);
const DuelRecordFeature = composeStatelessFeature(
    RoleBagFeature.componentClass,
    HomeFeatureDuelRecord,
);
const DuelRankFeature = composeStatelessFeature(
    DuelRecordFeature,
    HomeFeatureDuelRank,
);
const DuelInvestFeature = composeStatelessFeature(
    DuelRankFeature,
    HomeFeatureDuelInvest,
);
const DuelRoundClockFeature = composeStatelessFeature(
    DuelInvestFeature,
    HomeFeatureDuelRoundClock,
);
const DuelRoundResolutionFeature = composeStatelessFeature(
    DuelRoundClockFeature,
    HomeFeatureDuelRoundResolution,
);
const DuelActorRuntimeFeature = composeStatelessFeature(
    DuelRoundResolutionFeature,
    HomeFeatureDuelActorRuntime,
);
const DuelSceneUIFeature = composeStatelessFeature(
    DuelActorRuntimeFeature,
    HomeFeatureDuelSceneUI,
);
const DuelLobbyFeature = composeStatelessFeature(
    DuelSceneUIFeature,
    HomeFeatureDuelLobby,
);
const DuelLuanshiFeature = composeStatelessFeature(
    DuelLobbyFeature,
    HomeFeatureDuelLuanshi,
);
const DuelLuanshiBattleFeature = composeStatelessFeature(
    DuelLuanshiFeature,
    HomeFeatureDuelLuanshiBattle,
);
const ShowcaseFeature = composeStatelessFeature(
    DuelLuanshiBattleFeature,
    HomeFeatureShowcase,
);
const ItemDetailFeature = composeStatelessFeature(
    ShowcaseFeature,
    HomeFeatureItemDetail,
);
const CommerceConfirmFeature = composeStatelessFeature(
    ItemDetailFeature,
    HomeFeatureCommerceConfirm,
);
const BagFeature = composeStatelessFeature(
    CommerceConfirmFeature,
    HomeFeatureBag,
);
const RoleEquipmentFeature = composeStatelessFeature(
    BagFeature,
    HomeFeatureRoleEquipment,
);
const RoleProgressionFeature = composeStatelessFeature(
    RoleEquipmentFeature,
    HomeFeatureRoleProgression,
);
const RoleAdvanceFeature = composeStatelessFeature(
    RoleProgressionFeature,
    HomeFeatureRoleAdvance,
);
const RoleStrengthenFeature = composeStatelessFeature(
    RoleAdvanceFeature,
    HomeFeatureRoleStrengthen,
);
const CharacterCreationUIFeature = composeStatelessFeature(
    RoleStrengthenFeature,
    HomeFeatureCharacterCreationUI,
);
const CharacterFeature = composeStatelessFeature(
    CharacterCreationUIFeature,
    HomeFeatureCharacter,
);
const GiftShareFeature = composeStatelessFeature(
    CharacterFeature,
    HomeFeatureGiftShare,
);
const ProfileShellFeature = composeStatelessFeature(
    GiftShareFeature,
    HomeFeatureProfileShell,
);
const ProfileAvatarFrameFeature = composeStatelessFeature(
    ProfileShellFeature,
    HomeFeatureProfileAvatarFrame,
);
const ProfileSettingsFeature = composeStatelessFeature(
    ProfileAvatarFrameFeature,
    HomeFeatureProfileSettings,
);
const HomeUIRootFeature = composeStatelessFeature(
    ProfileSettingsFeature,
    HomeFeatureHomeUIRoot,
);
const HomeSceneShellFeature = composeStatelessFeature(
    HomeUIRootFeature,
    HomeFeatureHomeSceneShell,
);
const AssetRuntimeFeature = composeStatelessFeature(
    HomeSceneShellFeature,
    HomeFeatureAssetRuntime,
);
const RoleVisualRuntimeFeature = composeStatelessFeature(
    AssetRuntimeFeature,
    HomeFeatureRoleVisualRuntime,
);
const WorldMovementFeature = composeStatelessFeature(
    RoleVisualRuntimeFeature,
    HomeFeatureWorldMovement,
);
const ToastFeature = composeStatelessFeature(
    WorldMovementFeature,
    HomeFeatureToast,
);
const RoleDisplayFeature = composeStatelessFeature(
    ToastFeature,
    HomeFeatureRoleDisplay,
);
const TransitionLoadingFeature = composeStatelessFeature(
    RoleDisplayFeature,
    HomeFeatureTransitionLoading,
);
const BottomFeatureShellFeature = composeStatelessFeature(
    TransitionLoadingFeature,
    HomeFeatureBottomFeatureShell,
    { overrides: ['closeOtherBottomEntryPages'] },
);
const MagicSceneFeature = composeStatelessFeature(
    BottomFeatureShellFeature,
    HomeFeatureMagicScene,
);
const MagicMapFeature = composeStatelessFeature(
    MagicSceneFeature,
    HomeFeatureMagicMap,
);
const MagicBattleDamageFeature = composeStatelessFeature(
    MagicMapFeature,
    HomeFeatureMagicBattleDamage,
);
const MagicBattleDuelFeature = composeStatelessFeature(
    MagicBattleDamageFeature,
    HomeFeatureMagicBattleDuel,
);
const MagicBattleAssistCardsFeature = composeStatelessFeature(
    MagicBattleDuelFeature,
    HomeFeatureMagicBattleAssistCards,
);
const MagicBattleFeature = composeStatelessFeature(
    MagicBattleAssistCardsFeature,
    HomeFeatureMagicBattle,
);
const BeastStrengthenRulesFeature = composeStatelessFeature(
    MagicBattleFeature,
    HomeFeatureBeastStrengthenRules,
);
const BeastCardPresentationFeature = composeStatelessFeature(
    BeastStrengthenRulesFeature,
    HomeFeatureBeastCardPresentation,
);
const BeastCardRecordFeature = composeStatelessFeature(
    BeastCardPresentationFeature,
    HomeFeatureBeastCardRecord,
);
const BeastCardShellFeature = composeStatelessFeature(
    BeastCardRecordFeature,
    HomeFeatureBeastCardShell,
);
const BeastStrengthenPageFeature = composeStatelessFeature(
    BeastCardShellFeature,
    HomeFeatureBeastStrengthenPage,
);
const BeastStrengthenInteractionFeature = composeStatelessFeature(
    BeastStrengthenPageFeature,
    HomeFeatureBeastStrengthenInteraction,
);
const BattleEntryFeature = composeStatelessFeature(
    BeastStrengthenInteractionFeature,
    HomeFeatureBattleEntry,
);
const BattleUpgradeFeature = composeStatelessFeature(
    BattleEntryFeature,
    HomeFeatureBattleUpgrade,
);
const BattleChallengeFeature = composeStatelessFeature(
    BattleUpgradeFeature,
    HomeFeatureBattleChallenge,
);
const BattleCombatFeature = composeStatelessFeature(
    BattleChallengeFeature,
    HomeFeatureBattleCombat,
);
const BattleRewardFeature = composeStatelessFeature(
    BattleCombatFeature,
    HomeFeatureBattleReward,
);
const BattleLifecycleFeature = composeStatelessFeature(
    BattleRewardFeature,
    HomeFeatureBattleLifecycle,
);
const AdventureFeature = composeStatefulFeature(
    BattleLifecycleFeature,
    HomeViewAdventure,
    HomeViewAdventure.initializeFeatureState,
    { overrides: ['openSharedFlowPopup'] },
);
const NoticeFeature = composeStatelessFeature(
    AdventureFeature.componentClass,
    HomeFeatureNotice,
);
const RankFeature = composeStatelessFeature(
    NoticeFeature,
    HomeFeatureRank,
);
const MailDataFeature = composeStatelessFeature(
    RankFeature,
    HomeFeatureMailData,
    { overrides: ['queueBattleHostedRewards'] },
);
const MailPanelFeature = composeStatelessFeature(
    MailDataFeature,
    HomeFeatureMailPanel,
);
const MailDetailFeature = composeStatelessFeature(
    MailPanelFeature,
    HomeFeatureMailDetail,
);
const MarketShellFeature = composeStatelessFeature(
    MailDetailFeature,
    HomeFeatureMarketShell,
);
const MarketSellFeature = composeStatelessFeature(
    MarketShellFeature,
    HomeFeatureMarketSell,
);
const MarketTradeFeature = composeStatelessFeature(
    MarketSellFeature,
    HomeFeatureMarketTrade,
);
const HomeViewWithShop = composeStatelessFeature(
    MarketTradeFeature,
    HomeFeatureShop,
);

@ccclass('MainHomeView')
export class MainHomeView extends HomeViewWithShop {
    private mainHomeMusicSource: AudioSource | null = null;
    private mainHomeMusicClip: AudioClip | null = null;
    private mainHomeMusicPromise: Promise<AudioClip> | null = null;
    private readonly homeUiResourceScope: ResourceScope = ResourceManager.instance.createScope('MainHomeView/ui-home');
    private readonly homeFeatureResourceScopes = new Map<string, ResourceScope>();
    private readonly homeUiMountPromises = new Map<string, Promise<Node>>();
    private homeInitialized = false;
    private lifecycleStarted = false;
    private platformIdleStarted = false;

    protected onLoad(): void {
        DisplayAdapter.apply();
        this.disableEmptySprites(this.node);
        screen.on('window-resize', this.onDisplayChanged, this);
        screen.on('orientation-change', this.onDisplayChanged, this);
        RoleBagFeature.initialize(this);
        AdventureFeature.initialize(this);
        applySimKaiFontToTree(this.node);
        void GameBackend.api.initialize();
        this.setupMainHomeMusicSource();
        this.toastLabel = this.findNode('ToastLabel')?.getComponent(Label) || null;
        this.playerNameLabel = this.findNode('LabelPlayerName')?.getComponent(Label) || null;
        this.topSoulLabel = this.findNode('LabelSoul')?.getComponent(Label) || null;
        this.topPointLabel = this.findNode('LabelGold')?.getComponent(Label) || null;
        this.roleNode = this.findNode('Role');
        this.roleStageNode = this.findNode('RoleStage');
        this.platformNode = this.findNode('Platform');
        this.mapBackground = this.findNode('MainBg');
    
        this.profile = this.loadProfile();
        this.loadProfileAudioSettings();
        this.setupUILayers();
        if (this.uiHudLayer) this.uiHudLayer.active = false;
        void this.initializeHomeView();
    }
    private async initializeHomeView(): Promise<void> {
        try {
            this.setupMapLayer();
            this.setupRoleNode();

            await this.mountHomeUIPrefabs(HOME_UI_STARTUP_PREFABS);
            if (!this.node.isValid) return;
            applySimKaiFontToTree(this.node);
    
            this.setupAvatarProfileButton();
            this.bindSharedFlowPopups();
            this.hideHomeButtonTextLabels();
            this.entries.forEach((entry) => this.bindEntry(entry));
            this.updateProfileLabels();
            this.ensureShopStore();
            this.updateShopCurrencyLabels();
            this.buildCharacterPanel();
            this.openCharacterPanel(true);
            this.buildTransitionLoadingLayer();
            this.ensureMailData();
            this.updateMailBadge();
            this.bindMapTouch();
    
            void this.loadRoleAssets();
            this.playMainHomeMusic();
            this.homeInitialized = true;
            if (this.uiHudLayer) this.uiHudLayer.active = true;
            this.tryStartPlatformIdle();
            this.showToast('\u4e3b\u754c\u9762\u52a0\u8f7d\u5b8c\u6210');
        } catch (error) {
            console.error('[MainHomeView] ui-home bundle initialization failed', error);
            this.showToast('\u4e3b\u754c\u9762\u8d44\u6e90\u52a0\u8f7d\u5931\u8d25');
        }
    }
    protected async acquireHomeSharedBundle(): Promise<AssetManager.Bundle> {
        const bundle = await this.homeUiResourceScope.acquireBundle(HOME_UI_SHARED_BUNDLE_NAME);
        this.resBundle = bundle;
        return bundle;
    }
    protected async acquireHomeAssetBundle(assetPath: string): Promise<AssetManager.Bundle> {
        const bundleName = getHomeAssetBundleName(assetPath);
        if (bundleName === HOME_SHARED_ASSET_BUNDLE_NAME) {
            return this.acquireHomeSharedBundle();
        }
        return this.acquireHomeFeatureBundle(bundleName);
    }
    private async acquireHomeFeatureBundle(bundleName: string): Promise<AssetManager.Bundle> {
        let scope = this.homeFeatureResourceScopes.get(bundleName);
        if (!scope) {
            scope = ResourceManager.instance.createScope(`MainHomeView/${bundleName}`);
            this.homeFeatureResourceScopes.set(bundleName, scope);
        }
        return scope.acquireBundle(bundleName);
    }
    protected async prepareHomeEntry(entryName: string): Promise<void> {
        await Promise.all(
            getHomeEntryAssetBundleNames(entryName)
                .map((bundleName) => this.acquireHomeFeatureBundle(bundleName)),
        );
        const mountedNodes = await this.mountHomeUIPrefabs(getHomeUIEntryPrefabs(entryName));
        mountedNodes.forEach((node) => applySimKaiFontToTree(node));
        if (entryName === 'TabShowcase') {
            this.setupMagicMapPages();
        }
    }
    private async mountHomeUIPrefabs(
        definitions: readonly HomeUIPrefabDefinition[],
    ): Promise<readonly Node[]> {
        // Cocos assigns shared dependencies to the higher-priority bundle.
        // `res` must be ready before `ui-home` because all editor-authored
        // prefab textures, fonts, and Spine data are owned by `res`.
        await this.acquireHomeSharedBundle();
        const bundle = await this.homeUiResourceScope.acquireBundle(HOME_UI_BUNDLE_NAME);
        return Promise.all(
            definitions.map((definition) => this.mountHomeUIPrefab(bundle, definition)),
        );
    }
    private mountHomeUIPrefab(
        bundle: AssetManager.Bundle,
        definition: HomeUIPrefabDefinition,
    ): Promise<Node> {
        const parent = definition.layer === 'page' ? this.pageRoot : this.popupRoot;
        if (!parent?.isValid) {
            return Promise.reject(
                new Error(`Missing ${definition.layer} layer for prefab "${definition.rootName}".`),
            );
        }
        const existing = parent.getChildByName(definition.rootName);
        if (existing?.isValid) return Promise.resolve(existing);

        const pending = this.homeUiMountPromises.get(definition.rootName);
        if (pending) return pending;

        const request = this.loadHomeUIPrefab(bundle, definition)
            .then((loadedPrefab) => {
                if (!this.node.isValid || !parent.isValid) {
                    throw new Error(`Home view was destroyed while loading prefab "${definition.rootName}".`);
                }
                const mounted = parent.getChildByName(definition.rootName);
                if (mounted?.isValid) return mounted;

                const prefab = this.homeUiResourceScope.retain(loadedPrefab);
                const instance = instantiate(prefab);
                this.disableEmptySprites(instance);
                if (instance.name !== definition.rootName) {
                    instance.destroy();
                    throw new Error(
                        `Prefab root mismatch at "${definition.path}": expected "${definition.rootName}", got "${instance.name}".`,
                    );
                }
                instance.active = false;
                parent.addChild(instance);
                return instance;
            });
        this.homeUiMountPromises.set(definition.rootName, request);
        void request.then(
            () => this.homeUiMountPromises.delete(definition.rootName),
            () => this.homeUiMountPromises.delete(definition.rootName),
        );
        return request;
    }
    private loadHomeUIPrefab(
        bundle: AssetManager.Bundle,
        definition: HomeUIPrefabDefinition,
    ): Promise<Prefab> {
        return new Promise((resolve, reject) => {
            bundle.load(definition.path, Prefab, (error, prefab) => {
                if (error || !prefab) {
                    reject(error || new Error(`Prefab not found: ${definition.path}`));
                    return;
                }
                resolve(prefab);
            });
        });
    }

    private disableEmptySprites(root: Node): void {
        const sprite = root.getComponent(Sprite);
        if (sprite && !sprite.spriteFrame) {
            sprite.enabled = false;
        }
        root.children.forEach((child) => this.disableEmptySprites(child));
    }

    protected start(): void {
        this.lifecycleStarted = true;
        this.tryStartPlatformIdle();
    }
    private tryStartPlatformIdle(): void {
        if (!this.lifecycleStarted || !this.homeInitialized || this.platformIdleStarted) return;
        this.platformIdleStarted = true;
        this.playPlatformIdle();
    }
    protected hideEditorShopPanelOnLoad(): void {
        const shopPanel = this.popupRoot?.getChildByName('ShopPanel') || this.findNode('ShopPanel');
        if (shopPanel) {
            shopPanel.active = false;
        }
    }
    protected onDestroy(): void {
        screen.off('window-resize', this.onDisplayChanged, this);
        screen.off('orientation-change', this.onDisplayChanged, this);
        this.idleTweens.forEach((tw) => tw.stop());
        this.idleTweens.length = 0;
        this.transitionDotTweens.forEach((tw) => tw.stop());
        this.transitionDotTweens.length = 0;
        this.unschedule(this.blinkCharacterNameCursor);
        this.stopBattleChallengeSequence();
        this.stopBattleBackgroundAnimation();
        this.stopMagicMapWander();
        this.stopMagicMonsterBattle();
        this.stopMainHomeMusic();
        this.homeUiMountPromises.clear();
        this.homeFeatureResourceScopes.forEach((scope) => scope.dispose());
        this.homeFeatureResourceScopes.clear();
        this.homeUiResourceScope.dispose();
    }
    private onDisplayChanged(): void {
        DisplayAdapter.apply();
    }
    protected update(deltaTime: number): void {
        if (!this.homeInitialized) return;
        this.updateRoleMovement(deltaTime);
        this.updateBattleAttackLoop(deltaTime);
        this.updateBeastCardCountdown(deltaTime);
        this.updateMagicMapCountdown(deltaTime);
        this.updateMagicMonsterBattle(deltaTime);
    }

    private setupMainHomeMusicSource(): void {
        this.mainHomeMusicSource = this.node.getComponent(AudioSource) || this.node.addComponent(AudioSource);
        this.mainHomeMusicSource.playOnAwake = false;
        this.mainHomeMusicSource.loop = true;
        this.mainHomeMusicSource.volume = this.profileSettingsMuted ? 0 : this.profileSettingsMusicVolume;
    }

    private playMainHomeMusic(): void {
        if (!this.mainHomeMusicSource) this.setupMainHomeMusicSource();
        if (!this.mainHomeMusicSource) return;

        if (this.mainHomeMusicClip) {
            this.mainHomeMusicSource.clip = this.mainHomeMusicClip;
            this.mainHomeMusicSource.loop = true;
            this.mainHomeMusicSource.play();
            return;
        }

        this.mainHomeMusicPromise = this.mainHomeMusicPromise || this.loadMainHomeMusicClip();
        void this.mainHomeMusicPromise
            .then((clip) => {
                this.mainHomeMusicClip = clip;
                if (!this.mainHomeMusicSource?.isValid) return;
                this.mainHomeMusicSource.clip = clip;
                this.mainHomeMusicSource.loop = true;
                this.mainHomeMusicSource.play();
            })
            .catch((err) => {
                console.warn('[MainHomeView] main home music missing', err);
            });
    }

    private stopMainHomeMusic(): void {
        if (!this.mainHomeMusicSource) return;
        this.mainHomeMusicSource.stop();
    }

    protected onProfileAudioSettingsChanged(musicVolume: number, _effectVolume: number, muted: boolean): void {
        if (!this.mainHomeMusicSource?.isValid) return;
        this.mainHomeMusicSource.volume = muted ? 0 : musicVolume;
    }

    private async loadMainHomeMusicClip(): Promise<AudioClip> {
        const bundle = await this.acquireHomeSharedBundle();

        return new Promise((resolve, reject) => {
            bundle.load(HomeConfig.MAIN_HOME_MUSIC_PATH, AudioClip, (err, clip) => {
                if (err || !clip) {
                    reject(err || new Error(`AudioClip not found: ${HomeConfig.MAIN_HOME_MUSIC_PATH}`));
                    return;
                }
                resolve(clip);
            });
        });
    }
}
