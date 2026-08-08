import {
    _decorator,
    AssetManager,
    BlockInputEvents,
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
    Rect,
    RichText,
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
    sp,
    sys,
} from 'cc';
import { ResourceManager } from '../../Managers/ResourceManager';
import { UI_LAYER_NAMES, UI_ROOT_LAYER_ORDER } from '../Common/UIConvention';
import { applySimKaiFont, applySimKaiFontToTree } from '../Common/UIFont';
import { BAG_ILLUSTRATION_CATALOG, type BagIllustrationCatalogItem, type BagIllustrationCategory } from './BagIllustrationCatalog.generated';

import {
    RoleGender,
    RolePageTab,
    BagPageTab,
    MailTab,
    RankTab,
    MarketTab,
    MarketMode,
    MarketFilterLevel,
    MarketPrimaryFilterKey,
    AllianceTab,
    DuelTab,
    ShowcaseTab,
    MarketCategory,
    ShopMallTab,
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
    MarketSellListingData,
    MarketTransactionData,
    BagBottomTabButton,
    BagCatalogView,
    RoleBottomTabButton,
} from './HomeTypes';
import * as HomeConfig from './HomeConfig';

const { ccclass, property } = _decorator;
type ProfileAvatarFrameItem = (typeof HomeConfig.PROFILE_AVATAR_FRAME_ITEMS)[number];
type HomeRoleAttributeSet = { attack: number; life: number; defense: number };
type HomeRoleProgressSnapshot = { level: number; attrs: HomeRoleAttributeSet; power: number };
type HomeRoleBreakthroughMaterialId = typeof HomeConfig.ROLE_BREAKTHROUGH_MATERIALS[number]['id'];

@ccclass('HomeViewBase')
export abstract class HomeViewBase extends Component {
    @property({
        type: [MagicSceneLayoutConfig],
        displayName: '\u9b54\u754c\u4e5d\u91cd\u573a\u666f\u5e03\u5c40',
        tooltip: '\u7b2c 1-9 \u9879\u5206\u522b\u5bf9\u5e94\u4e00\u91cd\u5230\u4e5d\u91cd\uff0c\u53ef\u5355\u72ec\u8c03\u6574 X\u3001Y \u548c\u7f29\u653e\u3002',
    })
    magicSceneLayouts: MagicSceneLayoutConfig[] = HomeConfig.MAGIC_SCENES.map(
        (scene) => new MagicSceneLayoutConfig(scene.title, scene.x, scene.y, scene.scale),
    );
    @property({
        type: [BeastCardLayoutConfig],
        displayName: '\u517d\u5361\u56db\u5f20\u5e03\u5c40',
        tooltip: '\u7b2c 1-4 \u9879\u5206\u522b\u5bf9\u5e94\u5e7b\u96ea\u9e3e\u821e\u3001\u51b0\u7130\u50b2\u72ee\u3001\u91d1\u7130\u76f8\u7fbd\u548c\u7130\u708e\u4e5d\u5c3e\u72d0\uff0c\u53ef\u5355\u72ec\u8c03\u6574 X\u3001Y \u548c\u7f29\u653e\u3002',
    })
    beastCardLayouts: BeastCardLayoutConfig[] = HomeConfig.BEAST_CARDS.map(
        (card) => new BeastCardLayoutConfig(card.name, card.x, card.y, card.scale),
    );
    protected readonly entries: EntryButton[] = [
        { nodeName: 'BtnMail', displayName: '\u90ae\u4ef6' },
        { nodeName: 'BtnNotice', displayName: '\u516c\u544a' },
        { nodeName: 'BtnShop', displayName: '\u5546\u94fa' },
        { nodeName: 'BtnRank', displayName: '\u6392\u884c' },
        { nodeName: 'BtnAlliance', displayName: '\u5b97\u95e8' },
        { nodeName: 'BtnMarket', displayName: '\u96c6\u5e02' },
        { nodeName: 'BtnDuel', displayName: '\u5bf9\u51b3' },
        { nodeName: 'BtnShare', displayName: '\u5206\u4eab' },
        { nodeName: 'BtnAdGift', displayName: '\u8d85\u503c\u793c\u5305' },
        { nodeName: 'BtnBoss', displayName: '\u5c55\u53f0' },
        { nodeName: 'BtnWanderingMerchant', displayName: '\u6d41\u6d6a\u5546\u4eba' },
        { nodeName: 'TabRole', displayName: '\u89d2\u8272' },
        { nodeName: 'TabBag', displayName: '\u80cc\u5305' },
        { nodeName: 'TabBattle', displayName: '\u5f81\u6218' },
        { nodeName: 'TabShowcase', displayName: '\u9b54\u754c' },
        { nodeName: 'TabBoss', displayName: '\u517d\u5361' },
    ];
    protected resBundle: AssetManager.Bundle | null = null;
    protected readonly roleSkeletonData = new Map<RoleGender, sp.SkeletonData>();
    protected readonly roleSkeletonPaths = new Map<RoleGender, string>();
    protected readonly idleTweens: Tween<Node>[] = [];
    protected readonly transitionDotTweens: Array<Tween<Node> | Tween<UIOpacity>> = [];
    protected readonly buttonBaseScales = new WeakMap<Node, Vec3>();
    protected readonly skinApplyVersions = new WeakMap<Node, number>();
    protected skinApplyVersion = 0;
    protected toastLabel: Label | null = null;
    protected toastBackground: Node | null = null;
    protected toastBackgroundSkinLoading = false;
    protected toastBackgroundSkinLoaded = false;
    protected playerNameLabel: Label | null = null;
    protected topSoulLabel: Label | null = null;
    protected topPointLabel: Label | null = null;
    protected persistentCurrencyHud: Node | null = null;
    protected persistentSoulLabel: Label | null = null;
    protected persistentPointLabel: Label | null = null;
    protected profilePopupRoot: Node | null = null;
    protected profilePopupBoard: Node | null = null;
    protected profilePopupNameLabel: Label | null = null;
    protected profilePopupUidLabel: Label | null = null;
    protected profileAvatarFramePopupRoot: Node | null = null;
    protected profileAvatarFramePopupBoard: Node | null = null;
    protected profileAvatarFrameScrollView: ScrollView | null = null;
    protected readonly profileAvatarFrameButtonLabels = new Map<string, Label>();
    protected readonly profileAvatarFramePriceIcons = new Map<string, Node>();
    protected readonly profileAvatarFrameSkeletonData = new Map<string, sp.SkeletonData>();
    protected readonly profileAvatarFrameSkeletonVersions = new WeakMap<Node, number>();
    protected readonly profileAvatarFramePurchased = new Set<string>();
    protected profileAvatarFrameEquipped = '';
    protected profileSettingsPopupRoot: Node | null = null;
    protected profileSettingsPopupBoard: Node | null = null;
    protected profileSettingsMusicVolume = 1;
    protected profileSettingsEffectVolume = 1;
    protected profileSettingsMuted = false;
    protected gameSceneLayer: Node | null = null;
    protected uiMainLayer: Node | null = null;
    protected uiHudLayer: Node | null = null;
    protected pageRoot: Node | null = null;
    protected popupRoot: Node | null = null;
    protected guideRoot: Node | null = null;
    protected readonly editorFeaturePageNames = [
        'AlliancePanel',
        'DuelPanel',
        'GiftPanel',
        'ValueGiftPanel',
        'SharePanel',
        'ShowcasePanel',
    ];
    protected readonly sharedFlowPopupNames = [
        'ItemDetailPopup',
        'BagIllustrationDetailPopup',
        'ConfirmPopup',
        'GiftTransferConfirmPopup',
        'RewardPopup',
        'BattleResultPopup',
    ];
    protected sharedPopupConfirmAction: (() => void) | null = null;
    protected sharedBattleAgainAction: (() => void) | null = null;
    protected sharedBattleCloseAction: (() => void) | null = null;
    protected allianceActiveTab: AllianceTab = 'hall';
    protected duelActiveTab: DuelTab = 'match';
    protected showcaseActiveTab: ShowcaseTab = 'overview';
    protected readonly claimedGiftIndexes = new Set<number>();
    protected giftUidEditBox: EditBox | null = null;
    protected giftAmountEditBox: EditBox | null = null;
    protected giftSelectedPlayer: { uid: string; nickname: string; avatarPath: string } | null = null;
    protected giftAmount = HomeConfig.GIFT_DEFAULT_AMOUNT;
    protected readonly claimedShareTaskIds = new Set<string>();
    protected shareProgress = 0;
    protected shareRewardClaimed = false;
    protected roleNode: Node | null = null;
    protected roleSpineNode: Node | null = null;
    protected roleStageNode: Node | null = null;
    protected platformNode: Node | null = null;
    protected mapLayer: Node | null = null;
    protected mapBackground: Node | null = null;
    protected sceneClickArea: Node | null = null;
    protected mapSkeleton: sp.Skeleton | null = null;
    protected previewSkeleton: sp.Skeleton | null = null;
    protected characterSelectBgSkeleton: sp.Skeleton | null = null;
    protected characterPreviewRoot: Node | null = null;
    protected characterGenderLabel: Label | null = null;
    protected nameDisplayLabel: Label | null = null;
    protected nameCursorNode: Node | null = null;
    protected transitionLoadingLayer: Node | null = null;
    protected transitionLoadingSkeleton: sp.Skeleton | null = null;
    protected characterPanel: Node | null = null;
    protected rolePagePanel: Node | null = null;
    protected rolePageTitleLabel: Label | null = null;
    protected rolePageEquipmentRoot: Node | null = null;
    protected rolePageAdvanceRoot: Node | null = null;
    protected rolePageStrengthenRoot: Node | null = null;
    protected roleStrengthenStatusRoot: Node | null = null;
    protected roleStrengthenHintLabel: Label | null = null;
    protected roleStrengthenButton: Node | null = null;
    protected rolePageActiveTab: RolePageTab = 'equipment';
    protected bagPanel: Node | null = null;
    protected bagPageTitleLabel: Label | null = null;
    protected bagBottomTabButtons = new Map<BagPageTab, BagBottomTabButton>();
    protected bagPageActiveTab: BagPageTab = 'bag';
    protected bagBottomTabsRoot: Node | null = null;
    protected bagIllustrationButton: Node | null = null;
    protected bagDecomposeModeFrame: Node | null = null;
    protected bagSynthModeFrame: Node | null = null;
    protected bagCatalogView: BagCatalogView | null = null;
    protected bagIllustrationMode = false;
    protected bagIllustrationPanel: Node | null = null;
    protected bagIllustrationTitleLabel: Label | null = null;
    protected bagIllustrationView: BagCatalogView | null = null;
    protected rolePageSkeleton: sp.Skeleton | null = null;
    protected rolePageNameLabel: Label | null = null;
    protected rolePagePowerFrame: Node | null = null;
    protected rolePagePowerDigitRoot: Node | null = null;
    protected rolePageRoleUsesEditorTransform = false;
    protected rolePagePowerUsesEditorTransform = false;
    protected rolePageNameUsesEditorTransform = false;
    protected roleBottomTabButtons = new Map<RolePageTab, RoleBottomTabButton>();
    protected roleAdvanceExpFill: Node | null = null;
    protected roleAttrDetailPanel: Node | null = null;
    protected noticePanel: Node | null = null;
    protected noticeBoard: Node | null = null;
    protected noticeListRoot: Node | null = null;
    protected noticeContentRoot: Node | null = null;
    protected noticeScrollNode: Node | null = null;
    protected noticeScrollView: ScrollView | null = null;
    protected noticeScrollContent: Node | null = null;
    protected noticeArticleTemplate: Node | null = null;
    protected noticeDetailTitleLabel: Label | null = null;
    protected noticeDetailTimeLabel: Label | null = null;
    protected noticeDetailContentLabel: Label | null = null;
    protected noticeToggleHintLabel: Label | null = null;
    protected rankPanel: Node | null = null;
    protected rankScrollNode: Node | null = null;
    protected rankScrollView: ScrollView | null = null;
    protected rankScrollContent: Node | null = null;
    protected rankRowTemplate: Node | null = null;
    protected rankActiveTab: RankTab = 'power';
    protected readonly rankTabNodes: Partial<Record<RankTab, Node>> = {};
    protected marketPanel: Node | null = null;
    protected marketBoard: Node | null = null;
    protected marketFilterRoot: Node | null = null;
    protected marketCategoryLabel: Label | null = null;
    protected marketSecondaryFilterLabel: Label | null = null;
    protected marketTertiaryFilterLabel: Label | null = null;
    protected marketSortLabel: Label | null = null;
    protected marketViewport: Node | null = null;
    protected marketContent: Node | null = null;
    protected marketActiveTab: MarketTab = 'buy';
    protected marketCategory: MarketCategory = 'all';
    protected marketPrimaryFilter: MarketPrimaryFilterKey = 'all';
    protected marketSecondaryFilter = 'all';
    protected marketTertiaryFilter = 'all';
    protected marketOpenFilterDropdown: MarketFilterLevel | null = null;
    protected marketSortAscending = true;
    protected marketOpenVersion = 0;
    protected readonly marketTabNodes: Partial<Record<MarketTab, Node>> = {};
    protected marketMode: MarketMode = 'trade';
    protected readonly marketModeButtonNodes: Partial<Record<MarketMode, Node>> = {};
    protected readonly marketModeButtonSpriteFrames = new Map<string, SpriteFrame>();
    protected readonly marketTransactions: MarketTransactionData[] = [];
    protected readonly marketSellListings: MarketSellListingData[] = [];
    protected marketSellSelectedItem: BagIllustrationCatalogItem | null = null;
    protected marketSellDraftQuantity = 1;
    protected marketSellDraftUnitPrice = 0;
    protected marketSellDraftMinPrice = 0;
    protected marketSellDraftMaxPrice = 0;
    protected commerceQuantity = 1;
    protected commerceQuantityMax = 1;
    protected mailPanel: Node | null = null;
    protected mailListRoot: Node | null = null;
    protected mailListContent: Node | null = null;
    protected mailListScrollView: ScrollView | null = null;
    protected mailRowTemplate: Node | null = null;
    protected mailEmptyLabel: Label | null = null;
    protected mailCountLabel: Label | null = null;
    protected mailDetailPanel: Node | null = null;
    protected mailActiveTab: MailTab = 'normal';
    protected mailUsesEditorLayout = false;
    protected readonly mailTabNodes: Partial<Record<MailTab, Node>> = {};
    protected mailUnreadDot: Node | null = null;
    protected battlePanel: Node | null = null;
    protected battleBgSkeleton: sp.Skeleton | null = null;
    protected battleEntryUiRoot: Node | null = null;
    protected battleChallengeButton: Node | null = null;
    protected battleUpgradePopup: Node | null = null;
    protected battleUpgradeBoard: Node | null = null;
    protected battleCombatLayer: Node | null = null;
    protected battleCombatBgSkeleton: sp.Skeleton | null = null;
    protected battleCombatRoleSkeleton: sp.Skeleton | null = null;
    protected battleWaveLabel: Label | null = null;
    protected battleDamageNumberRoot: Node | null = null;
    protected battleRewardPopup: Node | null = null;
    protected battleRewardBoard: Node | null = null;
    protected battleRewardTextSkeleton: sp.Skeleton | null = null;
    protected battleRewardItemsRoot: Node | null = null;
    protected battleRewardLoadVersion = 0;
    protected battleMonsterSkeletonData: sp.SkeletonData | null = null;
    protected readonly battleMonsterNodes: Node[] = [];
    protected readonly battleMonsterSkeletons: sp.Skeleton[] = [];
    protected readonly battleTweens: Tween<Node>[] = [];
    protected battleAttackCount = 0;
    protected battleTotalAttackCount = 0;
    protected battleAttackTimer = 0;
    protected battleCombatAttacking = false;
    protected battleCurrentWave = 0;
    protected battleWaveEnding = false;
    protected shopPanel: Node | null = null;
    protected shopGridRoot: Node | null = null;
    protected shopCurrencyLabel: Label | null = null;
    protected shopCharacterSkeleton: sp.Skeleton | null = null;
    protected bottomFeaturePanel: Node | null = null;
    protected bottomFeatureBackground: Node | null = null;
    protected bottomFeatureTitleLabel: Label | null = null;
    protected bottomFeatureHintLabel: Label | null = null;
    protected magicSceneRoot: Node | null = null;
    protected magicSceneViewport: Node | null = null;
    protected magicSceneWorld: Node | null = null;
    protected magicSceneNameFrame: Node | null = null;
    protected magicSceneSkeleton: sp.Skeleton | null = null;
    protected magicSceneNameLabel: Label | null = null;
    protected magicPrevButton: Node | null = null;
    protected magicNextButton: Node | null = null;
    protected magicEnterButton: Node | null = null;
    protected magicLevelFrame: Node | null = null;
    protected magicLevelLabel: Label | null = null;
    protected readonly magicSceneEntryNodes: Node[] = [];
    protected readonly magicSceneEntrySkeletons: sp.Skeleton[] = [];
    protected readonly magicSceneNameFrames: Node[] = [];
    protected readonly magicSceneNameLabels: Label[] = [];
    protected magicFloorPanel: Node | null = null;
    protected magicFloorBoard: Node | null = null;
    protected magicFloorScrollBody: Node | null = null;
    protected magicFloorContentRoot: Node | null = null;
    protected magicFloorTitleLabel: Label | null = null;
    protected magicFloorOpening = false;
    protected magicSceneIndex = 0;
    protected magicSceneLoadVersion = 0;
    protected magicSceneTouchStartX = 0;
    protected magicSceneTouchStartWorldX = 0;
    protected magicSceneTouchTravel = 0;
    protected magicSceneDragging = false;
    protected magicMapPanel: Node | null = null;
    protected magicMapViewport: Node | null = null;
    protected magicMapWorld: Node | null = null;
    protected magicMapPlayerAnchor: Node | null = null;
    protected magicMapPlayerVisual: Node | null = null;
    protected magicMapPlayerSkeleton: sp.Skeleton | null = null;
    protected magicMapTitleLabel: Label | null = null;
    protected magicMapTimerLabel: Label | null = null;
    protected magicMapStatusLabel: Label | null = null;
    protected readonly magicMapMonsters: MagicMapMonsterRuntime[] = [];
    protected magicMapSmallMonsterData: sp.SkeletonData | null = null;
    protected magicMapBossMonsterData: sp.SkeletonData | null = null;
    protected magicMapPlayerSpawnPosition = new Vec3(-250, -110, 0);
    protected magicMapActiveRealmIndex = 0;
    protected magicMapActiveFloorIndex = 0;
    protected magicMapRemainingSeconds = HomeConfig.MAGIC_MAP_DURATION_SECONDS;
    protected magicMapLoadVersion = 0;
    protected magicMapTouchStartX = 0;
    protected magicMapTouchTravel = 0;
    protected magicMapDragging = false;
    protected magicMapPlayerMoving = false;
    protected magicMonsterBattlePanel: Node | null = null;
    protected magicBattleBackgroundSkeleton: sp.Skeleton | null = null;
    protected magicBattleRoleSkeleton: sp.Skeleton | null = null;
    protected magicBattleMonsterSkeleton: sp.Skeleton | null = null;
    protected magicBattleEnemyNameLabel: Label | null = null;
    protected magicBattleEnemyHpLabel: Label | null = null;
    protected magicBattleHintLabel: Label | null = null;
    protected magicBattleTarget: MagicMapMonsterRuntime | null = null;
    protected magicBattleActive = false;
    protected magicBattleAttackTimer = 0;
    protected magicBattleResultTimer = 0;
    protected magicBattleEnemyHp = 100;
    protected magicBattleEnemyMaxHp = 100;
    protected beastCardRoot: Node | null = null;
    protected beastCardSkeleton: sp.Skeleton | null = null;
    protected beastCardNameLabel: Label | null = null;
    protected beastCardBottomNameLabel: Label | null = null;
    protected beastCardRewardRoot: Node | null = null;
    protected beastCardDescriptionLabel: Label | null = null;
    protected beastCardCountdownLabel: Label | null = null;
    protected beastCardOutputRateTitleLabel: Label | null = null;
    protected beastCardOutputRateValueLabel: Label | null = null;
    protected beastCardOutputAmountTitleLabel: Label | null = null;
    protected beastCardOutputAmountValueLabel: Label | null = null;
    protected beastCardOutputAmountUnitLabel: Label | null = null;
    protected beastCardRecordButton: Node | null = null;
    protected beastCardStrengthenButton: Node | null = null;
    protected beastStrengthenPage: Node | null = null;
    protected beastStrengthenBackground: Node | null = null;
    protected beastCardPrevButton: Node | null = null;
    protected beastCardNextButton: Node | null = null;
    protected beastCardIndex = 0;
    protected beastCardLoadVersion = 0;
    protected beastCardCountdownElapsed = 0;
    protected beastCardNextOutputAt = Date.now() + 24 * 60 * 60 * 1000;
    protected roleDropdown: Node | null = null;
    protected roleSelectLabel: Label | null = null;
    protected nameEditBox: EditBox | null = null;
    protected nameEditing = false;
    protected nameCursorVisible = false;
    protected profile: RoleProfile = { name: HomeConfig.DEFAULT_NAME, gender: 'male', created: false, version: HomeConfig.PROFILE_VERSION };
    protected noticeData: NoticeData[] = [];
    protected selectedNoticeId = '';
    protected noticeExpanded = false;
    protected mailData: MailData[] = [];
    protected mailDataLoaded = false;
    protected shopStore: ShopStoreState | null = null;
    protected readonly roleMapPosition = new Vec3(0, HomeConfig.ROLE_STAGE_INITIAL_Y, 0);
    protected roleMoveTarget: Vec3 | null = null;
    protected roleFacing = 1;
    protected isRoleMoving = false;
    protected currentRoleAnimation: 'idle' | 'walk' | '' = '';
    protected previewTouchStartX = 0;
    protected onProfileAudioSettingsChanged(_musicVolume: number, _effectVolume: number, _muted: boolean): void {
        // Overridden by concrete views that own audio sources.
    }
    protected clamp01(value: number): number {
        if (!Number.isFinite(value)) return 0;
        return Math.max(0, Math.min(1, value));
    }
    protected getHomeAvatarSkin(gender: RoleGender = this.profile.gender): string {
        return HomeConfig.getHomeAvatarPath(gender);
    }
    protected applyHomeAvatarSkin(node: Node | null | undefined, fallbackWidth: number, fallbackHeight: number, gender: RoleGender = this.profile.gender): void {
        if (!node?.isValid) return;
        this.applyUiSkinKeepingEditorSize(node, this.getHomeAvatarSkin(gender), fallbackWidth, fallbackHeight);
    }
    protected async triggerEntry(entry: EntryButton): Promise<void> {
        if (entry.nodeName === 'BtnAlliance') {
            this.showToast('\u5b97\u95e8\u6682\u672a\u5f00\u653e');
            return;
        }

        await this.withTransitionLoading(async () => {
            await this.prepareHomeEntry(entry.nodeName);
            if (entry.nodeName === 'BtnMail') {
                this.openMailPanel();
                this.showToast('\u90ae\u4ef6\u6d41\u7a0b\u5df2\u89e6\u53d1');
                return;
            }
    
            if (entry.nodeName === 'BtnNotice') {
                this.openNoticePanel();
                this.showToast('\u516c\u544a\u6d41\u7a0b\u5df2\u89e6\u53d1');
                return;
            }
    
            if (entry.nodeName === 'BtnShop') {
                this.openShopPanel();
                this.showToast('\u5546\u57ce\u6d41\u7a0b\u5df2\u89e6\u53d1');
                return;
            }
    
            if (entry.nodeName === 'BtnMarket') {
                this.openMarketPanel();
                this.showToast('\u96c6\u5e02\u5df2\u6253\u5f00');
                return;
            }
    
            if (entry.nodeName === 'BtnRank') {
                this.openRankPanel();
                this.showToast('\u6392\u884c\u699c\u5df2\u6253\u5f00');
                return;
            }
    
            if (entry.nodeName === 'BtnDuel') {
                this.openEditorFeaturePage('DuelPanel');
                this.showToast('\u5bf9\u51b3\u5df2\u6253\u5f00');
                return;
            }
    
            if (entry.nodeName === 'BtnShare') {
                this.openEditorFeaturePage('SharePanel');
                this.showToast('\u5206\u4eab\u9875\u5df2\u6253\u5f00');
                return;
            }
    
            if (entry.nodeName === 'BtnAdGift') {
                this.openEditorFeaturePage('ValueGiftPanel');
                this.showToast('\u8d85\u503c\u793c\u5305\u5df2\u6253\u5f00');
                return;
            }
    
            if (entry.nodeName === 'TabRole') {
                this.openRolePagePanel();
                this.showToast('\u89d2\u8272\u9875\u9762\u5df2\u6253\u5f00');
                return;
            }
    
            if (entry.nodeName === 'TabBag') {
                this.openBagPanel();
                this.showToast('\u80cc\u5305\u5df2\u6253\u5f00');
                return;
            }
    
            if (entry.nodeName === 'TabBattle') {
                this.openBattlePanel();
                this.showToast('\u5f81\u6218\u5df2\u6253\u5f00');
                return;
            }
    
            if (entry.nodeName === 'TabShowcase') {
                this.openMagicPanel();
                this.showToast('\u9b54\u754c\u5df2\u6253\u5f00');
                return;
            }
    
            if (entry.nodeName === 'TabBoss') {
                this.openBeastCardPanel();
                this.showToast('\u517d\u5361\u5df2\u6253\u5f00');
                return;
            }
    
            if (entry.nodeName === 'BtnBoss') {
                this.openEditorFeaturePage('ShowcasePanel');
                this.showToast('\u5c55\u53f0\u5df2\u6253\u5f00');
                return;
            }

            if (entry.nodeName === 'BtnWanderingMerchant') {
                this.openEditorFeaturePage('WanderingMerchantPanel');
                this.showToast('\u6d41\u6d6a\u5546\u4eba\u5df2\u6253\u5f00');
                return;
            }
    
            this.showToast(`${entry.displayName} \u6d41\u7a0b\u5df2\u89e6\u53d1`);
        });
    }
    protected createNode(name: string, parent: Node, width: number, height: number, x: number, y: number): Node {
        const node = new Node(name);
        parent.addChild(node);
        node.setPosition(x, y, 0);
        node.addComponent(UITransform).setContentSize(width, height);
        if (this.shouldAutoBlockInput(name, width, height)) {
            this.ensureInputBlocker(node, width, height);
        }
        return node;
    }
    protected createLabel(parent: Node, name: string, text: string, fontSize: number, x: number, y: number, width: number, height: number, color: Color): Label {
        const node = this.createNode(name, parent, width, height, x, y);
        const label = node.addComponent(Label);
        applySimKaiFont(label);
        label.string = text;
        label.fontSize = fontSize;
        label.lineHeight = fontSize + 8;
        label.color = color;
        label.horizontalAlign = HorizontalTextAlignment.CENTER;
        label.verticalAlign = VerticalTextAlignment.CENTER;
        return label;
    }
    protected drawRect(node: Node, width: number, height: number, color: Color): Graphics {
        const graphics = node.addComponent(Graphics);
        graphics.clear();
        graphics.fillColor = color;
        graphics.rect(-width / 2, -height / 2, width, height);
        graphics.fill();
        return graphics;
    }
    protected drawFrame(node: Node, width: number, height: number, color: Color, lineWidth: number): Graphics {
        const graphics = node.addComponent(Graphics);
        graphics.clear();
        graphics.strokeColor = color;
        graphics.lineWidth = lineWidth;
        graphics.rect(-width / 2, -height / 2, width, height);
        graphics.stroke();
        return graphics;
    }
    protected drawCircle(node: Node, radius: number, color: Color): Graphics {
        const graphics = node.addComponent(Graphics);
        graphics.clear();
        graphics.fillColor = color;
        graphics.circle(0, 0, radius);
        graphics.fill();
        return graphics;
    }
    protected clamp(value: number, min: number, max: number): number {
        return Math.max(min, Math.min(max, value));
    }
    protected findNode(name: string, root: Node = this.node): Node | null {
        if (root.name === name) return root;
    
        for (const child of root.children) {
            const found = this.findNode(name, child);
            if (found) return found;
        }
        return null;
    }

    protected ensureDuelLuanshiMainPageRoot(page: Node): Node {
        if (page.name === 'LuanshiZhengxiongMainPage') return page;
        const existing = page.getChildByName('LuanshiZhengxiongMainPage');
        if (existing) {
            existing.active = true;
            return existing;
        }
        return this.createNode('LuanshiZhengxiongMainPage', page, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT, 0, 0);
    }

    protected getDuelLuanshiMainPageRoot(page: Node): Node {
        if (page.name === 'LuanshiZhengxiongMainPage') return page;
        return page.getChildByName('LuanshiZhengxiongMainPage') || page;
    }

    protected findDuelLuanshiMainNode(page: Node, name: string): Node | null {
        const mainPage = this.getDuelLuanshiMainPageRoot(page);
        return mainPage.getChildByName(name) || page.getChildByName(name);
    }

    // Feature contracts keep cross-feature calls typed while implementations live in dedicated modules.
    protected abstract buildCharacterPanel(): void;
    protected abstract getOrCreateEditorNode(name: string, parent: Node, width: number, height: number, x: number, y: number): Node;
    protected abstract getOrCreateEditorSkinnedNode(name: string, parent: Node, width: number, height: number, x: number, y: number, skinPath: string): Node;
    protected abstract getOrCreateEditorLabel(parent: Node, name: string, text: string, fontSize: number, x: number, y: number, width: number, height: number, color: Color): Label;
    protected abstract setupHiddenNameEditBox(inputNode: Node): void;
    protected abstract createHiddenEditBoxLabel(parent: Node, name: string): Label;
    protected abstract refreshCharacterNameDisplay(): void;
    protected abstract showCharacterNameCursor(): void;
    protected abstract hideCharacterNameCursor(): void;
    protected abstract updateCharacterNameCursorPosition(): void;
    protected abstract blinkCharacterNameCursor(): void;
    protected abstract hideNativeNameCaret(): void;
    protected abstract loadCharacterSelectBackground(): void;
    protected abstract buildRolePagePanel(): void;
    protected abstract getOrCreateRolePageNode(parent: Node, name: string, width: number, height: number, x: number, y: number): { node: Node; existed: boolean };
    protected abstract getOrCreateRolePageSkinnedNode(parent: Node, name: string, width: number, height: number, x: number, y: number, skinPath: string): { node: Node; existed: boolean };
    protected abstract getOrCreateRolePageLabel(parent: Node, name: string, text: string, fontSize: number, x: number, y: number, width: number, height: number, color: Color): { label: Label; existed: boolean };
    protected abstract getRoleEquipmentSlotConfigs(): any[];
    protected abstract getRoleEquipmentStatRule(config: any): any;
    protected abstract getCurrentEquipmentStatValue(config: any): number;
    protected abstract getEquipmentLevelBySlot(config: any): number;
    protected abstract getEquipmentStatValueForLevel(config: any, level: number): number;
    protected abstract getRoleStrengthenCost(level: number): number;
    protected abstract syncRoleEquipmentSlot(config: any): void;
    protected abstract drawRoleEquipDim(node: Node): void;
    protected abstract getOrCreateRoleEquipChild(parent: Node, name: string, width: number, height: number, x: number, y: number): Node;
    protected abstract getOrCreateRoleEquipSkin(parent: Node, name: string, width: number, height: number, x: number, y: number, skinPath: string): Node;
    protected abstract getOrCreateRoleEquipLabel(parent: Node, name: string, text: string, fontSize: number, x: number, y: number, width: number, height: number, color: Color): Label;
    protected abstract fadeRoleEquipPopup(node: Node, from: number, to: number, duration?: number): Promise<void>;
    protected abstract applyRoleEquipSelectedFrameSkin(node: Node): void;
    protected abstract closeRoleEquipDetailPopup(fade?: boolean): void;
    protected abstract closeRoleEquipReplacePopup(fade?: boolean): void;
    protected abstract getCatalogDisplayName(item: BagIllustrationCatalogItem | null | undefined): string;
    protected abstract getRoleCurrentLevel(): number;
    protected abstract getRoleLevelExpConfig(targetLevel: number): typeof HomeConfig.ROLE_LEVEL_EXP_TABLE[number] | null;
    protected abstract getRoleNextLevel(): number;
    protected abstract getRoleNextLevelNeedExp(): number;
    protected abstract getRoleExpProgressRatio(): number;
    protected abstract getRoleLevelAttrs(level: number): HomeRoleAttributeSet;
    protected abstract addRoleAttrs(base: HomeRoleAttributeSet, add: HomeRoleAttributeSet): HomeRoleAttributeSet;
    protected abstract getRoleEquipmentAttrs(): HomeRoleAttributeSet;
    protected abstract getRoleTotalAttrs(level?: number): HomeRoleAttributeSet;
    protected abstract getRolePowerFromAttrs(attrs: HomeRoleAttributeSet): number;
    protected abstract getRoleTotalPower(level?: number): number;
    protected abstract getRoleSnapshot(level?: number): HomeRoleProgressSnapshot;
    protected abstract getRoleInventoryCount(itemId: string): number;
    protected abstract setRoleInventoryCount(itemId: string, count: number): void;
    protected abstract addRoleInventory(itemId: string, amount: number): void;
    protected abstract consumeRoleInventory(itemId: string, amount: number): boolean;
    protected abstract getRoleSeededBagItems(): BagIllustrationCatalogItem[];
    protected abstract getBagItemCount(item: BagIllustrationCatalogItem): number;
    protected abstract refreshRoleInventoryViews(syncAdvanceFill?: boolean): void;
    protected abstract getRoleBreakthroughConfig(level: number): typeof HomeConfig.ROLE_BREAKTHROUGH_TABLE[number] | null;
    protected abstract getRoleUpcomingBreakthroughLevel(): number;
    protected abstract getRolePendingBreakthroughLevel(): number;
    protected abstract isRoleBreakthroughPending(): boolean;
    protected abstract getRoleBreakthroughMaterialConfig(id: HomeRoleBreakthroughMaterialId): typeof HomeConfig.ROLE_BREAKTHROUGH_MATERIALS[number] | null;
    protected abstract getRoleBreakthroughDisplayCosts(level: number): Array<{ id: HomeRoleBreakthroughMaterialId; amount: number; itemId: string; name: string; iconPath: string; framePath: string }>;
    protected abstract getRoleBreakthroughCosts(level: number): Array<{ id: HomeRoleBreakthroughMaterialId; amount: number; itemId: string; name: string }>;
    protected abstract getRoleBreakthroughMissingText(costs: Array<{ amount: number; itemId: string; name: string }>): string;
    protected abstract findRoleBreakthroughBlockWithExp(addExp: number): { level: number; missing: string } | null;
    protected abstract canConsumeRoleBreakthrough(level: number): boolean;
    protected abstract consumeRoleBreakthrough(level: number): void;
    protected abstract refreshRoleAdvancePage(syncFill?: boolean): void;
    protected abstract refreshRoleStrengthenMaterials(): void;
    protected abstract getOrCreateBottomFeatureNode(parent: Node, name: string, width: number, height: number, x: number, y: number): { node: Node; existed: boolean };
    protected abstract getOrCreateBottomFeatureSkinnedNode(parent: Node, name: string, width: number, height: number, x: number, y: number, skinPath: string): { node: Node; existed: boolean };
    protected abstract getOrCreateBottomFeatureLabel(parent: Node, name: string, text: string, fontSize: number, x: number, y: number, width: number, height: number, color: Color): { label: Label; existed: boolean };
    protected abstract hideBottomFeatureContentRoots(except?: Node | null): void;
    protected abstract raiseBottomFeatureBackButton(): void;
    protected abstract createRolePageSideFrame(parent: Node, name: string, x: number, y: number, equipIconPaths: string[]): Node;
    protected abstract createRolePageBottomTabs(): void;
    protected abstract createRolePageBottomButton(parent: Node, name: string, tab: RolePageTab, normalPath: string, activePath: string, x: number, onClick: () => void): Node;
    protected abstract buildRoleAdvancePage(): void;
    protected abstract createRoleAdvanceAttrLine(parent: Node, name: string, value: string, centerX: number, y: number): void;
    protected abstract createRoleAdvanceExpBar(): void;
    protected abstract createRoleAdvanceExpOrb(index: number, x: number, iconPath: string, framePath: string, count: number, exp: number): void;
    protected abstract playRoleAdvanceExpEffect(): void;
    protected abstract buildRoleStrengthenPage(): void;
    protected abstract createRoleStrengthenMaterial(x: number, iconPath: string, name: string, count: number): void;
    protected abstract resetRoleStrengthenSelection(): void;
    protected abstract selectRoleStrengthenEquipment(config: any): void;
    protected abstract updateRoleStrengthenSelectionHighlight(): void;
    protected abstract closeRoleProgressSuccessPopup(fade?: boolean): void;
    protected abstract switchRolePageTab(tab: RolePageTab): void;
    protected abstract refreshRoleBottomTabState(activeTab: RolePageTab): void;
    protected abstract openEditorFeaturePage(panelName: string): void;
    protected abstract closeEditorFeaturePage(panel: Node): void;
    protected abstract bindEditorFeaturePage(panel: Node): void;
    protected abstract bindAlliancePage(panel: Node): void;
    protected abstract switchAllianceTab(panel: Node, tab: AllianceTab): void;
    protected abstract handleAlliancePrimary(tab: AllianceTab): void;
    protected abstract bindDuelPage(panel: Node): void;
    protected abstract switchDuelTab(panel: Node, tab: DuelTab): void;
    protected abstract ensureDuelJianghuRecordPage(page: Node): Node;
    protected abstract refreshDuelJianghuRecordPage(recordPage: Node): void;
    protected abstract ensureDuelJianghuRankPage(page: Node): Node;
    protected abstract refreshDuelJianghuRankPage(rankPage: Node): void;
    protected abstract startDuelJianghuInvestRound(page: Node, amountText: string): Promise<void>;
    protected abstract isDuelJianghuInvestSwitchLocked(): boolean;
    protected abstract bindShowcasePage(panel: Node): void;
    protected abstract bindGiftPage(panel: Node): void;
    protected abstract claimGift(panel: Node, index: number): void;
    protected abstract claimAllGifts(panel: Node): void;
    protected abstract refreshGiftPage(panel: Node): void;
    protected abstract bindSharePage(panel: Node): void;
    protected abstract handleShareAction(panel: Node): void;
    protected abstract claimShareReward(panel: Node): void;
    protected abstract refreshSharePage(panel: Node): void;
    protected abstract setFeatureLabel(root: Node, nodeName: string, value: string): void;
    protected abstract refreshFeatureTabState<T extends string>(root: Node, tabs: Array<[T, string]>, activeTab: T): void;
    protected abstract bindSharedFlowPopups(): void;
    protected abstract openSharedFlowPopup(popupName: string, content?: SharedPopupContent): void;
    protected abstract getOrCreateConfirmSkin(parent: Node, popup: Node, name: string, width: number, height: number, x: number, y: number, skinPath: string): Node;
    protected abstract getOrCreateConfirmLabel(parent: Node, popup: Node, name: string, text: string, fontSize: number, x: number, y: number, width: number, height: number, color: Color): Label;
    protected abstract getOrCreateConfirmRichText(parent: Node, popup: Node, name: string, text: string, fontSize: number, x: number, y: number, width: number, height: number): RichText;
    protected abstract escapeRichText(value: string): string;
    protected abstract formatPlainConfirmRichText(message: string): string;
    protected abstract hideCommerceConfirmMessageBg(messageBg: Node | null): void;
    protected abstract openItemDetailPopup(name: string, type: string, description: string, count: string, framePath?: string): void;
    protected abstract openBagIllustrationItemDetailPopup(item: BagIllustrationCatalogItem, type: string): void;
    protected abstract openCommerceItemDetail(name: string, type: string, description: string, countText: string, iconPath: string, actionText: string, onAction: () => void, framePath?: string, style?: 'default' | 'market'): void;
    protected abstract openCommerceQuantityConfirm(title: string, itemName: string, unitPrice: number, maxQuantity: number, actionText: string, onConfirm: (quantity: number) => void, currencyName?: string): void;
    protected abstract closeSharedFlowPopup(popup: Node): void;
    protected abstract openRolePagePanel(): void;
    protected abstract closeRolePagePanel(): void;
    protected abstract openBagPanel(): void;
    protected abstract closeBagPanel(): void;
    protected abstract buildBagPanel(): void;
    protected abstract createBagMaterialBoard(): void;
    protected abstract ensureBagModeFrames(): void;
    protected abstract raiseActiveBagModeFrame(): void;
    protected abstract openBagIllustrationPanel(): void;
    protected abstract closeBagIllustrationPanel(): void;
    protected abstract buildBagIllustrationPanel(): void;
    protected abstract createBagCatalogView(parent: Node, boardName: string, y: number, initialCategory: BagIllustrationCategory, itemSource: readonly BagIllustrationCatalogItem[], viewportName: string): BagCatalogView;
    protected abstract createBagCategoryTabs(view: BagCatalogView): void;
    protected abstract switchBagCatalogCategory(view: BagCatalogView, category: BagIllustrationCategory): void;
    protected abstract refreshBagCategoryTabs(view: BagCatalogView): void;
    protected abstract refreshBagCatalogGrid(view: BagCatalogView): void;
    protected abstract sortBagCatalogItems(items: BagIllustrationCatalogItem[]): BagIllustrationCatalogItem[];
    protected abstract getBagItemIconIndex(item: BagIllustrationCatalogItem): number;
    protected abstract getBagGridLayout(view: BagCatalogView): { height: number; y: number };
    protected abstract createBagGridItem(parent: Node, index: number, item: BagIllustrationCatalogItem | undefined, x: number, y: number): void;
    protected abstract bindGridItemTap(node: Node, onTap: () => void): void;
    protected abstract bindBagGridScroll(node: Node, content: Node, maxScrollY: number): void;
    protected abstract createBagBottomTabs(): void;
    protected abstract createBagBottomButton(parent: Node, name: string, x: number, tab: BagPageTab, title: string, normalPath: string, activePath: string): Node;
    protected abstract switchBagPage(tab: BagPageTab): void;
    protected abstract refreshBagBottomTabState(activeTab: BagPageTab): void;
    protected abstract openRoleAttrDetailPanel(): void;
    protected abstract closeRoleAttrDetailPanel(): void;
    protected abstract buildRoleAttrDetailPanel(): void;
    protected abstract createRoleOption(parent: Node, config: RoleAssetConfig, y: number): void;
    protected abstract selectGender(gender: RoleGender): void;
    protected abstract switchGenderByStep(step: number): void;
    protected abstract fadeCharacterPreviewAndApply(): void;
    protected abstract refreshCharacterGenderLabel(): void;
    protected abstract randomizeCharacterName(): void;
    protected abstract createRandomRoleName(): string;
    protected abstract toggleRoleDropdown(): void;
    protected abstract confirmCharacter(): void;
    protected abstract syncProfileNameFromPanel(): void;
    protected abstract openCharacterPanel(firstCreate: boolean): void;
    protected abstract openBottomFeaturePanel(title: string, hint: string, backgroundPath?: any): void;
    protected abstract openMagicPanel(): void;
    protected abstract openBeastCardPanel(): void;
    protected abstract refreshBottomFeatureBackground(backgroundPath: string): void;
    protected abstract closeBottomFeaturePanel(): void;
    protected abstract buildBottomFeaturePanel(backgroundPath?: any): void;
    protected abstract ensureMagicScenePanel(): void;
    protected abstract openMagicFloorPanel(): void;
    protected abstract ensureMagicFloorPanel(): void;
    protected abstract closeMagicFloorPanel(): void;
    protected abstract setupMagicMapPages(): void;
    protected abstract ensureMagicSkeletonVisual(anchor: Node, name: string, scale: number): { node: Node; skeleton: sp.Skeleton };
    protected abstract setupMagicMonsterLabel(monster: MagicMapMonsterRuntime, displayIndex: number): void;
    protected abstract syncMagicMonsterOccupancy(occupancy: Readonly<Record<string, string>>): void;
    protected abstract bindMagicMonsterClick(monster: MagicMapMonsterRuntime): void;
    protected abstract setupMagicMapInput(): void;
    protected abstract onMagicMapTouchStart(event: EventTouch): void;
    protected abstract onMagicMapTouchMove(event: EventTouch): void;
    protected abstract onMagicMapTouchEnd(event: EventTouch): void;
    protected abstract moveMagicMapPlayerToTouch(event: EventTouch): void;
    protected abstract setMagicVisualFacing(visual: Node, baseScale: number, towardRight: boolean): void;
    protected abstract openMagicMapPanel(realmIndex: number, floorIndex: number): Promise<void>;
    protected abstract loadMagicMapActors(loadVersion: number): Promise<void>;
    protected abstract startMagicMapWander(): void;
    protected abstract scheduleMagicMonsterWander(monster: MagicMapMonsterRuntime, delay?: any): void;
    protected abstract stopMagicMapWander(): void;
    protected abstract stopMagicMapPlayerMovement(playIdle: boolean): void;
    protected abstract refreshMagicMapDepth(): void;
    protected abstract updateMagicMapCountdown(deltaTime: number): void;
    protected abstract refreshMagicMapTimerLabel(): void;
    protected abstract exitMagicMapToFloor(): void;
    protected abstract openMagicMonsterTarget(monster: MagicMapMonsterRuntime): void;
    protected abstract openMagicDuelResult(monster: MagicMapMonsterRuntime): void;
    protected abstract startMagicMonsterBattle(monster: MagicMapMonsterRuntime): Promise<void>;
    protected abstract updateMagicMonsterBattle(deltaTime: number): void;
    protected abstract playMagicBattleOneShot(target: sp.Skeleton | null, oneShotCandidates: readonly string[], idleCandidates: readonly string[], timeScale: number): number;
    protected abstract refreshMagicBattleHp(): void;
    protected abstract finishMagicMonsterBattle(): void;
    protected abstract stopMagicMonsterBattle(): void;
    protected abstract returnToMagicMap(): void;
    protected abstract openMagicFloorReservedPage(realmIndex: number, floorIndex: number): void;
    protected abstract switchMagicScene(step: number): void;
    protected abstract refreshMagicScene(animate?: boolean): void;
    protected abstract selectMagicScene(index: number, animate: boolean): void;
    protected abstract focusMagicSceneEntry(index: number, animate: boolean): void;
    protected abstract loadMagicSceneEntrySkeletons(): void;
    protected abstract refreshMagicSceneEntrySelection(): void;
    protected abstract getVerticalMagicSceneTitle(title: string): string;
    protected abstract setMagicFloorTextEdge(label: Label, enabled: boolean, color?: Color, width?: number): void;
    protected abstract setupMagicMapHealthInfo(parent: Node, rootName: string, displayName: string, hp: number, maxHp: number, y: number, barWidth: number, nameFontSize: number): void;
    protected abstract hideConfirmNodeForMagicMonsterPrompt(node: Node | null): void;
    protected abstract returnToMagicScenePanel(): void;
    protected abstract getOrCreateBattleNode(parent: Node, name: string, width: number, height: number, x: number, y: number): { node: Node; existed: boolean };
    protected abstract getOrCreateBattleSkinnedNode(parent: Node, name: string, width: number, height: number, x: number, y: number, skinPath: string): { node: Node; existed: boolean };
    protected abstract getOrCreateBattleLabel(parent: Node, name: string, text: string, fontSize: number, x: number, y: number, width: number, height: number, color: Color): { label: Label; existed: boolean };
    protected abstract closeBattleUpgradePopup(): void;
    protected abstract openBattleAutoHostConfirmPopup(): void;
    protected abstract closeBattleTargetChallengePopup(): void;
    protected abstract ensureMagicBattleDamageHud(): void;
    protected abstract ensureMagicBattleDuelPopup(): Node;
    protected abstract resetMagicBattleDamageState(): void;
    protected abstract applyMagicBattlePlayerDamage(damage: number): void;
    protected abstract refreshMagicBattleDamageHud(): void;
    protected abstract getMagicBattlePlayerRank(): number;
    protected abstract ensureBeastStrengthenState(): any;
    protected abstract seedBeastStrengthenDefaultGemSlots(state: any): void;
    protected abstract saveBeastStrengthenState(): void;
    protected abstract spendBeastStrengthenYuanbao(cost: number): boolean;
    protected abstract getCurrentBeastStrengthenBeast(): any;
    protected abstract getBeastStrengthenEquipmentConfigs(beast: any): any[];
    protected abstract getSelectedBeastStrengthenEquipmentConfig(): any | null;
    protected abstract getBeastStrengthenGemItems(beastKey: string): BagIllustrationCatalogItem[];
    protected abstract getBeastStrengthenGemLevel(item: BagIllustrationCatalogItem | null | undefined): number;
    protected abstract getBeastStrengthenTotalBonus(beastKey: string): number;
    protected abstract isBeastStrengthenEquipmentUnlocked(config: any): boolean;
    protected abstract isBeastStrengthenGemSlotUnlocked(config: any, index: number): boolean;
    protected abstract getBeastStrengthenEquipmentKey(beastKey: string, part: string): string;
    protected abstract getBeastStrengthenGemSlotKey(beastKey: string, part: string, index: number): string;
    protected abstract getBeastStrengthenActionText(action: string): string;
    protected abstract setNodeOpacity(node: Node, opacity: number): void;
    protected abstract stopMagicScene(): void;
    protected abstract ensureBeastCardPanel(): void;
    protected abstract getBeastCardYuanbaoRateText(): string;
    protected abstract getOrCreateBeastStrengthenLabel(parent: Node, name: string, text: string, fontSize: number, x: number, y: number, width: number, height: number, color: Color): Label;
    protected abstract layoutBeastStrengthenButtonLabel(label: Label | null, text: string): void;
    protected abstract ensureBeastStrengthenGemSelectPopup(): Node | null;
    protected abstract closeBeastStrengthenGemSelectPopup(): void;
    protected abstract switchBeastCard(step: number): void;
    protected abstract refreshBeastCard(): void;
    protected abstract stopBeastCard(): void;
    protected abstract updateBeastCardCountdown(deltaTime: number): void;
    protected abstract refreshRolePageRole(): void;
    protected abstract refreshRolePagePower(config: RoleAssetConfig): void;
    protected abstract refreshRolePagePowerDigits(value: number): void;
    protected abstract getRolePowerDigitWidth(digit: string): number;
    protected abstract refreshRolePageNameLabel(config: RoleAssetConfig): void;
    protected abstract applyRolePageNameLabelStyle(label: Label): void;
    protected abstract applyRoleAttrLabelStyle(label: Label, outlineWidth: number): void;
    protected abstract applyBagLabelStyle(label: Label, outlineWidth: number): void;
    protected abstract applyBattleEntryTextStyle(label: Label, outlineWidth: number): void;
    protected abstract openBattlePanel(): void;
    protected abstract closeBattlePanel(): void;
    protected abstract buildBattlePanel(): void;
    protected abstract createBattleEntryUi(): void;
    protected abstract createBattleEntryMaterialBar(parent: Node): void;
    protected abstract createBattleEntryActionButtons(parent: Node): void;
    protected abstract createBattleTicketCost(parent: Node, name: string, amount: string, buttonX: number): void;
    protected abstract resetBattlePanelToEntry(): void;
    protected abstract hideBattleMonsterWave(): void;
    protected abstract clearBattleDamageNumbers(): void;
    protected abstract finishCurrentBattleWave(): void;
    protected abstract startNextBattleWave(): void;
    protected abstract openBattleRewardPopup(rewards?: Array<{ item: BagIllustrationCatalogItem; amount: string }> | null, closeMode?: 'battle' | 'popupOnly' | 'magic'): void;
    protected abstract createBattleRewardItem(parent: Node, index: number, item: BagIllustrationCatalogItem, amount: string, x: number, y: number): void;
    protected abstract hideBattleRewardPopup(): void;
    protected abstract startBattleChallenge(): Promise<void>;
    protected abstract buildBattleCombatLayer(): void;
    protected abstract loadBattleCombatAssets(): Promise<void>;
    protected abstract playBattleCombatSequence(): void;
    protected abstract startBattleRoleAttack(): void;
    protected abstract playBattleRoleAttack(): void;
    protected abstract updateBattleAttackLoop(deltaTime: number): void;
    protected abstract playBattleRoleAttackTick(): number;
    protected abstract playBattleRoleAttackAnimation(isSkill: boolean, loop: boolean): number;
    protected abstract getBattleRoleAttackFallbackDuration(isSkill: boolean): number;
    protected abstract getTrackAnimationDuration(track: unknown): number;
    protected abstract playBattleMonsterHurt(isSkill?: boolean): void;
    protected abstract finishBattleChallenge(): void;
    protected abstract returnToBattleEntryFromResult(): void;
    protected abstract stopBattleChallengeSequence(): void;
    protected abstract stopBattleTweens(): void;
    protected abstract setBattleTitle(text: string): void;
    protected abstract raiseBattleTopControls(): void;
    protected abstract loadBattleBackgroundSkeletonData(): Promise<void>;
    protected abstract playBattleBackgroundAnimation(): void;
    protected abstract stopBattleBackgroundAnimation(): void;
    protected abstract buildTransitionLoadingLayer(): void;
    protected abstract withTransitionLoading(action: () => void | Promise<void>): Promise<void>;
    protected abstract setTransitionLoadingVisible(visible: boolean): void;
    protected abstract startTransitionDots(): void;
    protected abstract stopTransitionDots(): void;
    protected abstract wait(seconds: number): Promise<void>;
    protected abstract ensureNoticeData(): void;
    protected abstract createDefaultNotices(): NoticeData[];
    protected abstract openNoticePanel(): void;
    protected abstract buildNoticePanel(): void;
    protected abstract bindEditorNoticePanel(panel: Node): void;
    protected abstract closeNoticePanel(): void;
    protected abstract refreshNoticePanel(): void;
    protected abstract createNoticeArticleTemplate(parent: Node): Node;
    protected abstract createNoticeArticleFromTemplate(notice: NoticeData, index: number, height: number): Node;
    protected abstract calculateNoticeArticleHeight(notice: NoticeData): number;
    protected abstract estimateNoticeTextHeight(text: string, width: number, fontSize: number, lineHeight: number): number;
    protected abstract clearNoticeArticleRuntimeChildren(): void;
    protected abstract setupNoticeScrollView(scrollNode: Node, content: Node): void;
    protected abstract createSlicedSkinnedNode(name: string, parent: Node, width: number, height: number, x: number, y: number, skinPath: string): Node;
    protected abstract applySlicedUiSkin(node: Node, skinPath: string, width: number, height: number): void;
    protected abstract getNoticeTypeText(type: NoticeType): string;
    protected abstract formatTodayKey(): string;
    protected abstract openRankPanel(): void;
    protected abstract buildRankPanel(): void;
    protected abstract bindEditorRankPanel(panel: Node): void;
    protected abstract closeRankPanel(): void;
    protected abstract switchRankTab(tab: RankTab): void;
    protected abstract refreshRankPanel(): void;
    protected abstract refreshRankTabs(): void;
    protected abstract createRankTab(parent: Node, name: string, text: string, x: number, tab: RankTab): Node;
    protected abstract createRankTopCard(parent: Node, name: string, rank: 1 | 2 | 3, x: number, y: number, width: number, height: number): Node;
    protected abstract updateRankTopCard(rank: 1 | 2 | 3, data: RankPlayerData): void;
    protected abstract createRankRowTemplate(parent: Node): Node;
    protected abstract refreshRankRows(rows: RankPlayerData[]): void;
    protected abstract createRankRowFromTemplate(data: RankPlayerData, index: number): Node;
    protected abstract clearSpriteFrame(node: Node | null | undefined): void;
    protected abstract clearRankRows(): void;
    protected abstract setupRankScrollView(scrollNode: Node, content: Node): void;
    protected abstract getRankPlayers(): RankPlayerData[];
    protected abstract setRankLabel(root: Node, labelName: string, value: string): void;
    protected abstract applyStrongTextStyle(label: Label): void;
    protected abstract applyRankListTextStyle(label: Label): void;
    protected abstract openMarketPanel(): void;
    protected abstract buildMarketPanel(): void;
    protected abstract closeMarketPanel(): void;
    protected abstract switchMarketTab(tab: MarketTab): void;
    protected abstract cycleMarketCategory(): void;
    protected abstract openMarketFilterDropdown(level: MarketFilterLevel): void;
    protected abstract closeMarketFilterDropdown(): void;
    protected abstract toggleMarketSort(): void;
    protected abstract refreshMarketFilterLabels(): void;
    protected abstract applyMarketFilterTextStyle(label: Label): void;
    protected abstract applyMarketDropdownTextStyle(label: Label, selected: boolean): void;
    protected abstract refreshMarketList(): void;
    protected abstract buildMarketSellListingPage(): void;
    protected abstract closeMarketSellItemSelectPopup(): void;
    protected abstract closeMarketSellConfirmPopup(): void;
    protected abstract clampMarketListScroll(content: Node, maxScrollY: number): void;
    protected abstract getCurrentMarketPostedListings(mode?: MarketMode): MarketSellListingData[];
    protected abstract getMarketListingMode(item: MarketSellListingData): MarketMode;
    protected abstract isMarketRequestPostPage(): boolean;
    protected abstract getMarketPostLimitText(): string;
    protected abstract getMarketPostFullSuccessText(): string;
    protected abstract getMarketPostSuccessText(): string;
    protected abstract getMarketPostPriceRangePrefix(): string;
    protected abstract refreshMarketTabLabels(): void;
    protected abstract getMarketActionButtonText(): string;
    protected abstract getMarketCurrentAction(): 'buy' | 'sell';
    protected abstract getMarketDetailActionText(): string;
    protected abstract getMarketConfirmTitle(): string;
    protected abstract getMarketSuccessTitle(action: 'buy' | 'sell'): string;
    protected abstract getMarketHistoryEmptyText(): string;
    protected abstract getMarketTransactionStatus(transaction: MarketTransactionData): string;
    protected abstract getMarketRecordTitle(mode?: MarketMode): string;
    protected abstract getMarketListingLayoutTemplate(parent: Node, row: Node): Node | null;
    protected abstract applyMarketListingChildLayout(row: Node, template: Node | null, childName: string, fallbackX: number, fallbackY: number, fallbackWidth: number, fallbackHeight: number): void;
    protected abstract getMarketTotalPrice(unitPrice: number, amount: number): number;
    protected abstract formatMarketPrice(value: number): string;
    protected abstract openMarketSellListingDetail(item: MarketSellListingData): void;
    protected abstract createMarketListingRow(parent: Node, item: MarketListingData, index: number, y: number): void;
    protected abstract handleMarketAction(item: MarketListingData): void;
    protected abstract completeMarketAction(item: MarketListingData, action: 'buy' | 'sell', quantity: number): void;
    protected abstract buildMarketHistoryList(): void;
    protected abstract openMarketTransactionDetail(transaction: MarketTransactionData): void;
    protected abstract applyMarketTextStyle(label: Label, outlineWidth: number): void;
    protected abstract openShopPanel(tab?: ShopMallTab): void;
    protected abstract buildShopPanel(): void;
    protected abstract prepareEditorShopPanel(): void;
    protected abstract closeShopPanel(): void;
    protected abstract refreshShopPanel(): void;
    protected abstract refreshEditorShopItems(): boolean;
    protected abstract updateEditorShopItemCell(item: ShopItemData, index: number): void;
    protected abstract applyEditorShopSkin(node: Node | null, skinPath: string, fallbackWidth: number, fallbackHeight: number): void;
    protected abstract updateEditorShopLabel(node: Node | null, text: string, lineHeight: number, outlineWidth: number): void;
    protected abstract createShopItemCell(item: ShopItemData, index: number): void;
    protected abstract getSoulCurrencyText(): string;
    protected abstract getPointCurrencyText(): string;
    protected applyCurrencyLabelStyle(label: Label, isGiftText: boolean): void {
        label.lineHeight = isGiftText ? 46 : 34;
        label.horizontalAlign = HorizontalTextAlignment.CENTER;
        label.verticalAlign = VerticalTextAlignment.CENTER;

        const outlinedLabel = label as unknown as {
            enableOutline?: boolean;
            outlineColor?: Color;
            outlineWidth?: number;
        };
        outlinedLabel.enableOutline = true;
        outlinedLabel.outlineColor = new Color(42, 25, 12, 255);
        outlinedLabel.outlineWidth = 2;
    }
    protected abstract applyShopLabelStyle(label: Label, lineHeight: number, outlineWidth: number): void;
    protected abstract openShopItemDetail(item: ShopItemData): void;
    protected abstract completeShopPurchase(item: ShopItemData, quantity: number): void;
    protected abstract createShopCurrencyIcon(parent: Node, x: number, y: number, size: number): Node;
    protected abstract ensureShopStore(): void;
    protected abstract saveShopStore(): void;
    protected abstract updateShopCurrencyLabels(): void;
    protected abstract formatCurrency(value: number): string;
    protected abstract refreshProfilePopupLabels(): void;
    protected abstract getProfileNicknameText(): string;
    protected abstract openProfileAvatarFramePopup(): void;
    protected abstract closeProfileAvatarFramePopup(): void;
    protected abstract loadProfileAvatarFrameState(): void;
    protected abstract applyEquippedProfileAvatarFrameVisual(): void;
    protected abstract openProfileSettingsPopup(): void;
    protected abstract closeProfileSettingsPopup(): void;
    protected abstract updateProfileLabels(): void;
    protected abstract loadProfile(): RoleProfile;
    protected abstract saveProfile(profile: RoleProfile): void;
    protected abstract setupUILayers(): void;
    protected abstract refreshRootLayerOrder(): void;
    protected abstract refreshBottomEntryChrome(): void;
    protected abstract closeBaseBottomEntryPages(activePanel: Node | null): void;
    protected abstract closeOtherBottomEntryPages(activePanel: Node | null): void;
    protected abstract hideOtherEditorFeaturePages(activePanel: Node | null): void;
    protected abstract stopDuelJianghuGameplay(page?: Node | null): void;
    protected abstract closeDuelLuanshiZhengxiongPage(panel: Node): void;
    protected abstract ensureInputBlocker(node: Node, width?: number, height?: number): void;
    protected abstract shouldAutoBlockInput(name: string, width: number, height: number): boolean;
    protected abstract stopTouchThrough(event: EventTouch): void;
    protected abstract hideHomeButtonTextLabels(): void;
    protected abstract setupPersistentCurrencyHud(): void;
    protected abstract setupSceneCurrencyHud(hud: Node): void;
    protected abstract hideOriginalTopCurrencyHud(): void;
    protected abstract refreshPersistentCurrencyHud(): void;
    protected abstract requireRootLayer(name: string): Node;
    protected abstract assertDirectChildOrder(parent: Node, expectedNames: readonly string[]): void;
    protected abstract setupGameSceneClip(): void;
    protected abstract setupMapLayer(): void;
    protected abstract setupRoleNode(): void;
    protected abstract bindMapTouch(): void;
    protected abstract bindEntry(entry: EntryButton): void;
    protected abstract bindScaledClick(node: Node, onClick: (event: EventTouch) => void): void;
    protected abstract playButtonScale(node: Node, pressed: boolean): void;
    protected abstract acquireHomeSharedBundle(): Promise<AssetManager.Bundle>;
    protected abstract acquireHomeAssetBundle(assetPath: string): Promise<AssetManager.Bundle>;
    protected abstract prepareHomeEntry(entryName: string): Promise<void>;
    protected abstract loadRoleAssets(): Promise<void>;
    protected abstract loadMapBackground(): Promise<void>;
    protected abstract loadSourceMapLayer(name: string, path: string, width: number, height: number, x: number, y: number, siblingIndex: number): Promise<void>;
    protected abstract applySpriteFrameToNode(node: Node, spriteFrame: SpriteFrame, width: number, height: number): void;
    protected abstract createSkinnedNode(name: string, parent: Node, width: number, height: number, x: number, y: number, skinPath: string, fallbackColor?: Color): Node;
    protected abstract applyUiSkin(node: Node, skinPath: string, width: number, height: number): void;
    protected abstract getNodeRenderSize(node: Node, fallbackWidth: number, fallbackHeight: number): Size;
    protected abstract applyUiSkinKeepingEditorSize(node: Node, skinPath: string, fallbackWidth: number, fallbackHeight: number): void;
    protected abstract loadSkeletonData(config: RoleAssetConfig): Promise<void>;
    protected abstract loadSpriteFrameAsset(path: string, fallbackUuid?: string): Promise<SpriteFrame>;
    protected abstract loadSkeletonAsset(path: string): Promise<sp.SkeletonData>;
    protected abstract createSpriteFrame(asset: ImageAsset | Texture2D | SpriteFrame): SpriteFrame;
    protected abstract loadTransitionSkeletonData(): Promise<void>;
    protected abstract applyCurrentRole(): void;
    protected abstract getCurrentRoleAssetConfig(gender: RoleGender): RoleAssetConfig;
    protected abstract ensureRoleSkeletonData(gender: RoleGender): Promise<sp.SkeletonData | null>;
    protected abstract getRoleSkeletonData(gender: RoleGender): sp.SkeletonData | null;
    protected abstract refreshCurrentRoleSkeletonFromEquipment(): Promise<void>;
    protected abstract hasRoleVisual(gender: RoleGender): boolean;
    protected abstract isUsingRoleSkel(gender: RoleGender): boolean;
    protected abstract getRoleMapScale(gender: RoleGender): number;
    protected abstract getRolePreviewScale(gender: RoleGender): number;
    protected abstract setSkeletonVisible(target: sp.Skeleton | null, visible: boolean): void;
    protected abstract applySkeleton(target: sp.Skeleton | null, data: sp.SkeletonData, animation: string, loop: boolean): void;
    protected abstract setRoleAnimation(animation: string, loop: boolean): void;
    protected abstract playSkeletonAnimation(target: sp.Skeleton, candidates: string[], loop: boolean): boolean;
    protected abstract prepareSkeletonRenderer(target: sp.Skeleton | null): void;
    protected abstract useRealtimeSkeletonMode(target: sp.Skeleton): void;
    protected abstract applyRoleScale(node: Node, gender: RoleGender, scale: number): void;
    protected abstract onMapTouchEnd(event: EventTouch): void;
    protected abstract moveRoleTo(target: Vec3): void;
    protected abstract updateRoleFacing(start: Readonly<Vec3>, target: Readonly<Vec3>): void;
    protected abstract updateRoleMovement(deltaTime: number): void;
    protected abstract updateMapFollow(): void;
    protected abstract getCenteredRoleBounds(): { minX: number; maxX: number; minY: number; maxY: number };
    protected abstract getMapFollowPosition(rolePos: Vec3): Vec3;
    protected abstract playPlatformIdle(): void;
    protected abstract showToast(message: string): void;
    protected abstract setupToastBackground(): void;
    protected abstract ensureMailData(): void;
    protected abstract createDefaultMails(): MailData[];
    protected abstract saveMails(): void;
    protected abstract openMailPanel(): void;
    protected abstract buildMailPanel(): void;
    protected abstract bindEditorMailPanel(panel: Node): void;
    protected abstract bindEditorButton(root: Node, name: string, onClick: () => void): void;
    protected abstract ensureButtonText(button: Node, labelName: string, text: string): Label;
    protected abstract createMailRowTemplate(parent: Node): Node;
    protected abstract createMailTab(parent: Node, name: string, text: string, x: number, tabType: MailTab): Node;
    protected abstract switchMailTab(tab: MailTab): void;
    protected abstract refreshMailTabs(): void;
    protected abstract getVisibleMails(): MailData[];
    protected abstract closeMailPanel(): void;
    protected abstract refreshMailPanel(): void;
    protected abstract createMailRow(mail: MailData, index: number): void;
    protected abstract createMailRowFromTemplate(mail: MailData, index: number): boolean;
    protected abstract setMailRowLabel(row: Node, labelName: string, text: string, preserveEditorLayout?: boolean): void;
    protected abstract clearMailListRuntimeChildren(): void;
    protected abstract openMailDetail(mailId: string): void;
    protected abstract closeMailDetail(): void;
    protected abstract claimMailReward(mailId: string, reopenDetail?: boolean): void;
    protected abstract claimAllMailRewards(): void;
    protected abstract deleteMail(mailId: string): void;
    protected abstract deleteReadMails(): void;
    protected abstract updateMailBadge(): void;
    protected abstract createMailButton(parent: Node, name: string, text: string, x: number, y: number, width: number, height: number, color: Color, onClick: () => void, skinPath?: string): Node;
    protected abstract clearChildren(node: Node): void;
    protected abstract getMailStateText(mail: MailData): string;
    protected abstract formatMailTime(seconds: number): string;
    protected abstract formatMailShortTime(seconds: number): string;
    protected abstract getMailPreview(content: string): string;
    protected abstract formatMailRemainTime(createTime: number): string;
    protected abstract formatRewardList(mail: MailData): string;
}
