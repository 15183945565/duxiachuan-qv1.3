import {
    _decorator,
    AssetManager,
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
import { HomeViewBase } from './HomeViewBase';

type RoleEquipmentSlotId = 'weapon' | 'helmet' | 'armor' | 'wrist' | 'leg' | 'shoes' | 'necklace' | 'ring';
type RoleEquipmentStatType = 'attack' | 'life' | 'defense';
type RoleEquipmentTableKey =
    | 'armorDefense'
    | 'wristLife'
    | 'ringDefense'
    | 'helmetDefense'
    | 'legDefense'
    | 'weaponAttack'
    | 'necklaceLife'
    | 'shoesAttack';
type CharacterSelectCardLayout = {
    x: number;
    y: number;
    width: number;
    height: number;
    highlightWidth: number;
    highlightHeight: number;
    siblingIndex: number;
};
type RoleProgressSuccessKind = 'upgrade' | 'breakthrough' | 'strengthen';
type RoleBreakthroughMaterialId = typeof HomeConfig.ROLE_BREAKTHROUGH_MATERIALS[number]['id'];

interface RoleEquipmentSlotConfig {
    id: RoleEquipmentSlotId;
    displayName: string;
    iconPath: string;
    keywords: string[];
    frameName: string;
    slotIndex: number;
}

interface RoleEquipmentStatRule {
    type: RoleEquipmentStatType;
    detailLabel: string;
    statusLabel: string;
    materialLabel: string;
    materialType: RoleEquipmentStatType;
    tableKey: RoleEquipmentTableKey;
    growth: number;
}

type RoleEquipmentRuntimeItem = BagIllustrationCatalogItem & {
    displayLevel?: number;
    baseTier?: number;
};

interface RoleAttributeSet {
    attack: number;
    life: number;
    defense: number;
}

interface RoleProgressSnapshot {
    level: number;
    attrs: RoleAttributeSet;
    power: number;
}

type BagDecomposeResult = {
    material: BagIllustrationCatalogItem;
    count: number;
    statType: RoleEquipmentStatType;
};

type DuelJianghuRoomConfig = typeof HomeConfig.DUEL_JIANGHU_ROOM_LABELS[number];
type DuelJianghuRoomId = DuelJianghuRoomConfig['id'];
type DuelJianghuActorKind = 'common' | 'lobbyCommon' | 'player' | 'assassin' | 'doubleMale' | 'doubleFemale' | 'rebel' | 'guardSoldier' | 'general';
type DuelJianghuSpecialRoomKind = 'guardSoldier' | 'general';
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
    specialKind?: DuelJianghuSpecialRoomKind;
    specialKindsByRoom?: Partial<Record<DuelJianghuRoomId, DuelJianghuSpecialRoomKind>>;
};
type DuelJianghuConfrontPositions = {
    special: Vec3;
    killer: Vec3;
};
type DuelJianghuRankMetric = 'dodge' | 'streak';
type DuelJianghuRankPeriod = 'today' | 'lastWeek';
type DuelJianghuRankEntry = {
    name: string;
    dodge: number;
    streak: number;
};
type WanderingMerchantRecycleItem = {
    catalogId: string;
    price: number;
    purchaseLimit: number;
};
type WanderingMerchantRecycleEntry = WanderingMerchantRecycleItem & {
    catalog: BagIllustrationCatalogItem;
};
export abstract class HomeViewRoleBag extends HomeViewBase {
    protected abstract formatCommercePrice(value: number): string;
    protected abstract layoutCommerceQuantityConfirmPopup(
        popup: Node,
        titleText: string,
        actionText: string,
        itemName: string,
        unitPrice: number,
        currencyName?: string,
    ): { quantityValue: Label | null; message: RichText | null };

    protected readonly roleEquippedItems = new Map<RoleEquipmentSlotId, RoleEquipmentRuntimeItem>();
    protected roleEquipDetailPopup: Node | null = null;
    protected roleEquipReplacePopup: Node | null = null;
    protected activeRoleEquipSlot: RoleEquipmentSlotConfig | null = null;
    protected pendingRoleEquipItem: RoleEquipmentRuntimeItem | null = null;
    protected roleStrengthenSelectedSlot: RoleEquipmentSlotConfig | null = null;
    protected roleRuntimeLevel = HomeConfig.ROLE_PAGE_PLAYER_LEVEL;
    protected roleRuntimeExp = 0;
    protected roleAdvanceExpTweenState: { ratio: number } | null = null;
    protected roleProgressSuccessPopup: Node | null = null;
    protected roleProgressSuccessSkeleton: sp.Skeleton | null = null;
    protected roleProgressSuccessLoadVersion = 0;
    protected bagDecomposeSelectedItem: BagIllustrationCatalogItem | null = null;
    protected bagSynthSelectedFragment: BagIllustrationCatalogItem | null = null;
    protected duelJianghuSelectedRoomName = '';
    protected duelJianghuSelectedRoomId: DuelJianghuRoomId | '' = '';
    protected duelJianghuCountdown = HomeConfig.DUEL_JIANGHU_ROUND_SECONDS;
    protected duelJianghuRoundActive = false;
    protected duelJianghuPreviewActive = false;
    protected duelJianghuRoundSerial = 0;
    protected duelJianghuCurrentInvestAmount = Number(HomeConfig.DUEL_JIANGHU_INVEST_DEFAULT_AMOUNT);
    protected duelJianghuNpcSpawnInProgress = false;
    protected duelJianghuPlayerActor: DuelJianghuActorRuntime | null = null;
    protected duelJianghuLobbyPlayerPromise: Promise<DuelJianghuActorRuntime | null> | null = null;
    protected readonly duelJianghuRoomInvestAmounts = new Map<DuelJianghuRoomId, number>();
    protected duelJianghuRankMetric: DuelJianghuRankMetric = 'dodge';
    protected duelJianghuRankPeriod: DuelJianghuRankPeriod = 'today';
    protected readonly duelJianghuActors: DuelJianghuActorRuntime[] = [];
    protected readonly duelJianghuSkeletonData = new Map<DuelJianghuActorKind, sp.SkeletonData>();
    protected readonly characterSelectRoleSkeletons = new Map<RoleGender, sp.Skeleton>();
    protected readonly characterSelectCardRoots = new Map<RoleGender, Node>();
    protected readonly roleEquipmentLevels = new Map<RoleEquipmentSlotId, number>();
    protected readonly wanderingMerchantRemaining = new Map<string, number>();
    protected readonly roleInventoryCounts = new Map<string, number>(
        HomeConfig.ROLE_INITIAL_BAG_ITEMS.map((item) => [item.itemId, item.count] as [string, number]),
    );

    public static initializeFeatureState(target: HomeViewRoleBag): void {
        Object.assign(target, {
            roleEquippedItems: new Map<RoleEquipmentSlotId, RoleEquipmentRuntimeItem>(),
            roleEquipDetailPopup: null,
            roleEquipReplacePopup: null,
            activeRoleEquipSlot: null,
            pendingRoleEquipItem: null,
            roleStrengthenSelectedSlot: null,
            roleRuntimeLevel: HomeConfig.ROLE_PAGE_PLAYER_LEVEL,
            roleRuntimeExp: 0,
            roleAdvanceExpTweenState: null,
            roleProgressSuccessPopup: null,
            roleProgressSuccessSkeleton: null,
            roleProgressSuccessLoadVersion: 0,
            bagDecomposeSelectedItem: null,
            bagSynthSelectedFragment: null,
            duelJianghuSelectedRoomName: '',
            duelJianghuSelectedRoomId: '',
            duelJianghuCountdown: HomeConfig.DUEL_JIANGHU_ROUND_SECONDS,
            duelJianghuRoundActive: false,
            duelJianghuPreviewActive: false,
            duelJianghuRoundSerial: 0,
            duelJianghuCurrentInvestAmount: Number(HomeConfig.DUEL_JIANGHU_INVEST_DEFAULT_AMOUNT),
            duelJianghuNpcSpawnInProgress: false,
            duelJianghuPlayerActor: null,
            duelJianghuLobbyPlayerPromise: null,
            duelJianghuRoomInvestAmounts: new Map<DuelJianghuRoomId, number>(),
            duelJianghuRankMetric: 'dodge',
            duelJianghuRankPeriod: 'today',
            duelJianghuActors: [],
            duelJianghuSkeletonData: new Map<DuelJianghuActorKind, sp.SkeletonData>(),
            characterSelectRoleSkeletons: new Map<RoleGender, sp.Skeleton>(),
            characterSelectCardRoots: new Map<RoleGender, Node>(),
            roleEquipmentLevels: new Map<RoleEquipmentSlotId, number>(),
            wanderingMerchantRemaining: new Map<string, number>(),
            roleInventoryCounts: new Map<string, number>(
                HomeConfig.ROLE_INITIAL_BAG_ITEMS.map(
                    (item) => [item.itemId, item.count] as [string, number],
                ),
            ),
        });
    }

    protected switchRolePageTab(tab: RolePageTab): void {
        this.rolePageActiveTab = tab;
        this.closeRoleAttrDetailPanel();
        this.refreshRoleBottomTabState(tab);
        if (tab !== 'forge') {
            this.roleStrengthenSelectedSlot = null;
            this.updateRoleStrengthenSelectionHighlight();
        }
    
        if (this.rolePageTitleLabel?.node?.isValid) {
            this.rolePageTitleLabel.string = tab === 'advance' ? '\u5347\u9636' : tab === 'forge' ? '\u5f3a\u5316' : '\u89d2\u8272';
            this.rolePageTitleLabel.node.setSiblingIndex(29);
        }
        if (this.rolePageEquipmentRoot?.isValid) {
            this.rolePageEquipmentRoot.active = tab !== 'advance';
        }
        if (this.rolePageAdvanceRoot?.isValid) {
            this.rolePageAdvanceRoot.active = tab === 'advance';
        }
        if (this.rolePageStrengthenRoot?.isValid) {
            this.rolePageStrengthenRoot.active = tab === 'forge';
        }
        this.refreshRolePageEquipmentInlineAttrs();
        if (tab === 'equipment' || tab === 'forge') {
            if (tab === 'forge') {
                this.resetRoleStrengthenSelection();
                this.refreshRoleStrengthenMaterials();
            }
            this.refreshRolePageRole();
            return;
        }
    
        this.setSkeletonVisible(this.rolePageSkeleton, false);
        if (this.rolePageNameLabel?.node?.isValid) {
            this.rolePageNameLabel.node.active = false;
        }
        this.refreshRoleAdvancePage();
        this.refreshRolePagePower(this.getCurrentRoleAssetConfig(this.profile.gender));
    }
    protected refreshRoleBottomTabState(activeTab: RolePageTab): void {
        this.roleBottomTabButtons.forEach((buttonConfig) => {
            if (!buttonConfig.node.isValid) return;
    
            const skinPath = buttonConfig.tab === activeTab ? buttonConfig.activePath : buttonConfig.normalPath;
            this.applyUiSkinKeepingEditorSize(buttonConfig.node, skinPath, HomeConfig.ROLE_PAGE_BOTTOM_BUTTON_WIDTH, HomeConfig.ROLE_PAGE_BOTTOM_BUTTON_HEIGHT);
        });
    }
    protected openEditorFeaturePage(panelName: string): void {
        const panel = this.pageRoot?.getChildByName(panelName)
            || this.popupRoot?.getChildByName(panelName)
            || this.findNode(panelName);
        if (!panel?.isValid) {
            console.warn(`[MainHomeView] editor feature page missing: ${panelName}`);
            this.showToast('\u9875\u9762\u8282\u70b9\u672a\u5c31\u7eea');
            return;
        }
    
        const isPage = panel.parent === this.pageRoot;
        if (isPage) {
            this.closeOtherBottomEntryPages(panel);
        } else {
            this.hideOtherEditorFeaturePages(panel);
        }
    
        panel.active = true;
        this.ensureInputBlocker(panel);
        panel.setSiblingIndex((panel.parent?.children.length || 1) - 1);
        this.bindEditorFeaturePage(panel);
        if (panelName === 'ValueGiftPanel') {
            this.bindValueGiftPage(panel);
            this.playValueGiftCaishenAnimation(panel);
        }
        this.refreshBottomEntryChrome();
        this.refreshRootLayerOrder();
    }
    protected playValueGiftCaishenAnimation(panel: Node): void {
        const spineNode = this.findNode('ValueGiftCaishenSpine', panel);
        const skeleton = spineNode?.getComponent(sp.Skeleton);
        if (!skeleton?.isValid || !skeleton.skeletonData) return;

        this.prepareSkeletonRenderer(skeleton);
        skeleton.node.active = true;
        skeleton.timeScale = 1;
        try {
            skeleton.clearTracks();
            skeleton.setToSetupPose();
            if (skeleton.findAnimation('show')) {
                skeleton.setAnimation(0, 'show', false);
                if (skeleton.findAnimation('idle')) {
                    skeleton.addAnimation(0, 'idle', true, 0);
                }
            } else if (skeleton.findAnimation('idle')) {
                skeleton.setAnimation(0, 'idle', true);
            }
            skeleton.updateAnimation(0);
            skeleton.markForUpdateRenderData(true);
        } catch (err) {
            console.warn('[MainHomeView] value gift caishen animation failed', err);
        }
    }
    protected closeEditorFeaturePage(panel: Node): void {
        panel.active = false;
        this.refreshBottomEntryChrome();
        this.refreshRootLayerOrder();
    }
    protected bindEditorFeaturePage(panel: Node): void {
        const closeNames = [
            'AllianceBack',
            'DuelBack',
            'GiftClose',
            'ShareClose',
            'ShowcaseBack',
            'WanderingMerchantClose',
        ];
        closeNames.forEach((nodeName) => {
            const button = this.findNode(nodeName, panel);
            if (button) {
                this.bindScaledClick(button, () => this.closeEditorFeaturePage(panel));
            }
        });
    
        const actions: Array<[string, string]> = [
            ['AllianceTabHall', '\u5b97\u95e8\u5927\u5385\u5df2\u5207\u6362'],
            ['AllianceTabMembers', '\u5b97\u95e8\u6210\u5458\u5df2\u5207\u6362'],
            ['AllianceTabMine', '\u5b97\u95e8\u77ff\u8109\u5df2\u5207\u6362'],
            ['AllianceTabRecord', '\u5b97\u95e8\u8bb0\u5f55\u5df2\u5207\u6362'],
            ['ShowcaseTabOverview', '\u5c55\u53f0\u6570\u636e\u5df2\u5207\u6362'],
            ['ShowcaseTabCards', '\u517d\u5361\u5e93\u5b58\u5df2\u5207\u6362'],
            ['ShowcaseTabRecord', '\u6536\u76ca\u8bb0\u5f55\u5df2\u5207\u6362'],
            ['ShowcaseRecordButton', '\u6536\u76ca\u8bb0\u5f55\u5df2\u6253\u5f00'],
            ['ShareActionButton', '\u5206\u4eab\u6d41\u7a0b\u5df2\u89e6\u53d1'],
        ];
    
        actions.forEach(([nodeName, message]) => {
            const button = this.findNode(nodeName, panel);
            if (button) {
                this.bindScaledClick(button, () => this.showToast(message));
            }
        });
    
        const alliancePrimary = this.findNode('AlliancePrimaryButton', panel);
        if (alliancePrimary) {
            this.bindScaledClick(alliancePrimary, () => {
                this.openSharedFlowPopup('ConfirmPopup', {
                    title: '\u5b97\u95e8\u786e\u8ba4',
                    message: '\u786e\u5b9a\u521b\u5efa\u6216\u7533\u8bf7\u52a0\u5165\u5f53\u524d\u5b97\u95e8\u5417\uff1f',
                    onConfirm: () => this.openSharedFlowPopup('RewardPopup', {
                        title: '\u5b97\u95e8\u6d41\u7a0b',
                        message: '\u7533\u8bf7\u5df2\u63d0\u4ea4\uff0c\u7b49\u5f85\u540e\u7aef\u8fd4\u56de\u7ed3\u679c',
                    }),
                });
            });
        }
    
        const claimButtons = ['GiftClaimAll', 'ShareClaimButton'];
        for (let index = 1; index <= 4; index += 1) {
            claimButtons.push(`GiftClaim_${index}`);
        }
        claimButtons.forEach((nodeName) => {
            const claim = this.findNode(nodeName, panel);
            if (!claim) return;
            this.bindScaledClick(claim, () => this.openSharedFlowPopup('RewardPopup', {
                title: '\u83b7\u5f97\u5956\u52b1',
                message: '\u9886\u53d6\u8bf7\u6c42\u5df2\u5b8c\u6210\uff0c\u5956\u52b1\u6570\u636e\u7b49\u5f85\u540e\u7aef\u8fd4\u56de',
            }));
        });
    
        if (panel.name === 'AlliancePanel') {
            this.bindAlliancePage(panel);
        } else if (panel.name === 'DuelPanel') {
            this.bindDuelPage(panel);
        } else if (panel.name === 'ShowcasePanel') {
            this.bindShowcasePage(panel);
        } else if (panel.name === 'GiftPanel') {
            this.bindGiftPage(panel);
        } else if (panel.name === 'SharePanel') {
            this.bindSharePage(panel);
        } else if (panel.name === 'WanderingMerchantPanel') {
            this.bindWanderingMerchantPage(panel);
        }
    }
    protected bindAlliancePage(panel: Node): void {
        const tabs: Array<[AllianceTab, string]> = [
            ['hall', 'AllianceTabHall'],
            ['members', 'AllianceTabMembers'],
            ['mine', 'AllianceTabMine'],
            ['record', 'AllianceTabRecord'],
        ];
        tabs.forEach(([tab, nodeName]) => {
            const button = this.findNode(nodeName, panel);
            if (button) this.bindScaledClick(button, () => this.switchAllianceTab(panel, tab));
        });
        this.switchAllianceTab(panel, 'hall');
    }
    protected switchAllianceTab(panel: Node, tab: AllianceTab): void {
        this.allianceActiveTab = tab;
        const configs: Record<AllianceTab, {
            title: string;
            info: string;
            primary: string;
            hint: string;
            rows: Array<[string, string]>;
        }> = {
            hall: {
                title: '\u72ec\u4fa0\u5b97\u95e8',
                info: '\u5b97\u95e8\u7b49\u7ea7 0\n\u6210\u5458 0/50\n\u4eca\u65e5\u8d21\u732e 0',
                primary: '\u521b\u5efa/\u7533\u8bf7',
                hint: '\u9009\u62e9\u4e0a\u65b9\u6807\u7b7e\u67e5\u770b\u5b97\u95e8\u5185\u5bb9',
                rows: [
                    ['\u5b97\u95e8\u516c\u544a', '\u5b97\u95e8\u516c\u544a\u5c06\u5728\u540e\u7aef\u63a5\u5165\u540e\u663e\u793a'],
                    ['\u6bcf\u65e5\u8d21\u732e', '\u4eca\u65e5\u8d21\u732e 0    \u53ef\u9886\u53d6 0'],
                    ['\u5b97\u95e8\u4efb\u52a1', '\u4efb\u52a1\u8fdb\u5ea6 0/0    \u5956\u52b1 0'],
                ],
            },
            members: {
                title: '\u5b97\u95e8\u6210\u5458',
                info: '\u5f53\u524d\u6210\u5458 0/50\n\u5728\u7ebf 0\n\u6211\u7684\u804c\u4f4d \u65e0',
                primary: '\u7533\u8bf7\u52a0\u5165',
                hint: '\u6210\u5458\u6570\u636e\u5c06\u7531\u540e\u7aef\u5206\u9875\u8fd4\u56de',
                rows: [
                    ['\u5b97\u4e3b', '\u6682\u65e0\u6210\u5458    \u8d21\u732e 0'],
                    ['\u957f\u8001', '\u6682\u65e0\u6210\u5458    \u8d21\u732e 0'],
                    ['\u6210\u5458', '\u6682\u65e0\u6210\u5458    \u8d21\u732e 0'],
                ],
            },
            mine: {
                title: '\u5b97\u95e8\u77ff\u8109',
                info: '\u77ff\u8109\u7b49\u7ea7 0\n\u4eca\u65e5\u4ea7\u51fa 0\n\u53ef\u9886\u53d6 0',
                primary: '\u9886\u53d6\u4ea7\u51fa',
                hint: '\u77ff\u8109\u4ea7\u51fa\u548c\u5347\u7ea7\u6570\u636e\u7b49\u5f85\u540e\u7aef\u63a5\u5165',
                rows: [
                    ['\u7075\u77f3\u77ff\u8109', '\u7b49\u7ea7 0    \u6bcf\u65f6\u4ea7\u51fa 0'],
                    ['\u4ed9\u6728\u77ff\u8109', '\u7b49\u7ea7 0    \u6bcf\u65f6\u4ea7\u51fa 0'],
                    ['\u8d21\u732e\u52a0\u6210', '\u5f53\u524d\u52a0\u6210 0%    \u4e0b\u7ea7 0%'],
                ],
            },
            record: {
                title: '\u5b97\u95e8\u8bb0\u5f55',
                info: '\u4eca\u65e5\u8bb0\u5f55 0\n\u672c\u5468\u8bb0\u5f55 0\n\u5f85\u5904\u7406\u7533\u8bf7 0',
                primary: '',
                hint: '\u5b97\u95e8\u8bb0\u5f55\u5c06\u6309\u65f6\u95f4\u5012\u5e8f\u663e\u793a',
                rows: [
                    ['\u52a0\u5165\u8bb0\u5f55', '\u6682\u65e0\u6570\u636e'],
                    ['\u8d21\u732e\u8bb0\u5f55', '\u6682\u65e0\u6570\u636e'],
                    ['\u77ff\u8109\u8bb0\u5f55', '\u6682\u65e0\u6570\u636e'],
                ],
            },
        };
        const config = configs[tab];
        this.setFeatureLabel(panel, 'AllianceSummaryTitle', config.title);
        this.setFeatureLabel(panel, 'AllianceSummaryInfo', config.info);
        this.setFeatureLabel(panel, 'AllianceContentHint', config.hint);
        config.rows.forEach(([title, detail], index) => {
            this.setFeatureLabel(panel, `AllianceRowTitle_${index + 1}`, title);
            this.setFeatureLabel(panel, `AllianceRowDetail_${index + 1}`, detail);
        });
    
        const primary = this.findNode('AlliancePrimaryButton', panel);
        if (primary) {
            primary.active = Boolean(config.primary);
            this.setFeatureLabel(primary, 'AlliancePrimaryButtonLabel', config.primary);
            if (primary.active) {
                this.bindScaledClick(primary, () => this.handleAlliancePrimary(tab));
            }
        }
        this.refreshFeatureTabState(panel, [
            ['hall', 'AllianceTabHall'],
            ['members', 'AllianceTabMembers'],
            ['mine', 'AllianceTabMine'],
            ['record', 'AllianceTabRecord'],
        ], tab);
    }
    protected handleAlliancePrimary(tab: AllianceTab): void {
        if (tab === 'mine') {
            this.openSharedFlowPopup('RewardPopup', {
                title: '\u77ff\u8109\u4ea7\u51fa',
                message: '\u4ea7\u51fa\u9886\u53d6\u8bf7\u6c42\u5df2\u63d0\u4ea4\uff0c\u7b49\u5f85\u540e\u7aef\u8fd4\u56de\u5956\u52b1\u3002',
            });
            return;
        }
        this.openSharedFlowPopup('ConfirmPopup', {
            title: tab === 'members' ? '\u7533\u8bf7\u52a0\u5165' : '\u5b97\u95e8\u786e\u8ba4',
            message: tab === 'members'
                ? '\u786e\u5b9a\u7533\u8bf7\u52a0\u5165\u5f53\u524d\u5b97\u95e8\u5417\uff1f'
                : '\u786e\u5b9a\u521b\u5efa\u6216\u7533\u8bf7\u52a0\u5165\u5f53\u524d\u5b97\u95e8\u5417\uff1f',
            onConfirm: () => this.openSharedFlowPopup('RewardPopup', {
                title: '\u5b97\u95e8\u6d41\u7a0b',
                message: '\u8bf7\u6c42\u5df2\u63d0\u4ea4\uff0c\u7b49\u5f85\u540e\u7aef\u8fd4\u56de\u7ed3\u679c\u3002',
            }),
        });
    }
    protected setFeatureLabel(root: Node, nodeName: string, value: string): void {
        const label = this.findNode(nodeName, root)?.getComponent(Label);
        if (label) label.string = value;
    }
    protected refreshFeatureTabState<T extends string>(root: Node, tabs: Array<[T, string]>, activeTab: T): void {
        tabs.forEach(([tab, nodeName]) => {
            const node = this.findNode(nodeName, root);
            if (!node) return;
            const selected = tab === activeTab;
            const sprite = node.getComponent(Sprite);
            if (sprite) sprite.color = selected ? Color.WHITE : new Color(180, 170, 150, 255);
            const label = node.getComponentInChildren(Label);
            if (label) label.color = selected ? new Color(101, 52, 18, 255) : new Color(65, 57, 45, 255);
        });
    }
    protected getWanderingMerchantRecycleConfigs(): WanderingMerchantRecycleItem[] {
        return [
            { catalogId: 'material_092', price: 20, purchaseLimit: 50 },
            { catalogId: 'material_087', price: 40, purchaseLimit: 40 },
            { catalogId: 'material_089', price: 80, purchaseLimit: 30 },
            { catalogId: 'material_090', price: 120, purchaseLimit: 20 },
            { catalogId: 'material_091', price: 180, purchaseLimit: 15 },
            { catalogId: 'material_088', price: 260, purchaseLimit: 10 },
        ];
    }
    protected getWanderingMerchantRecycleEntries(): WanderingMerchantRecycleEntry[] {
        return this.getWanderingMerchantRecycleConfigs()
            .map((config) => {
                const catalog = BAG_ILLUSTRATION_CATALOG.find((item) => item.id === config.catalogId);
                return catalog ? { ...config, catalog } : null;
            })
            .filter((entry): entry is WanderingMerchantRecycleEntry => Boolean(entry));
    }
    protected ensureWanderingMerchantRemaining(): void {
        if (this.wanderingMerchantRemaining.size > 0) return;

        let parsed: Record<string, number> = {};
        const raw = sys.localStorage.getItem(HomeConfig.WANDERING_MERCHANT_STORE_KEY);
        if (raw) {
            try {
                parsed = JSON.parse(raw) as Record<string, number>;
            } catch (err) {
                console.warn('[MainHomeView] invalid wandering merchant store', err);
            }
        }

        this.getWanderingMerchantRecycleConfigs().forEach((config) => {
            const stored = parsed[config.catalogId];
            const remaining = typeof stored === 'number' && Number.isFinite(stored)
                ? Math.max(0, Math.min(config.purchaseLimit, Math.floor(stored)))
                : config.purchaseLimit;
            this.wanderingMerchantRemaining.set(config.catalogId, remaining);
        });
    }
    protected saveWanderingMerchantRemaining(): void {
        const data: Record<string, number> = {};
        this.wanderingMerchantRemaining.forEach((value, key) => {
            data[key] = Math.max(0, Math.floor(value));
        });
        sys.localStorage.setItem(HomeConfig.WANDERING_MERCHANT_STORE_KEY, JSON.stringify(data));
    }
    protected getWanderingMerchantRemaining(entry: WanderingMerchantRecycleEntry): number {
        this.ensureWanderingMerchantRemaining();
        return Math.max(0, this.wanderingMerchantRemaining.get(entry.catalogId) ?? entry.purchaseLimit);
    }
    protected bindWanderingMerchantPage(panel: Node): void {
        this.ensureWanderingMerchantRemaining();

        const oldScrollView = this.findNode('WanderingMerchantScrollView', panel);
        if (oldScrollView) oldScrollView.active = false;
        const oldTemplate = this.findNode('WanderingMerchantArticleTemplate', panel);
        if (oldTemplate) oldTemplate.active = false;

        const board = this.findNode('WanderingMerchantBoard', panel) || panel;
        let grid = this.findNode('WanderingMerchantRecycleGrid', panel);
        if (!grid?.isValid) {
            grid = this.createNode('WanderingMerchantRecycleGrid', board, 672, 664, 0, 78);
        }
        if (grid.parent !== board) {
            grid.setParent(board);
        }
        grid.active = true;
        grid.setPosition(0, 78, 0);
        (grid.getComponent(UITransform) || grid.addComponent(UITransform)).setContentSize(672, 664);
        [...grid.children].forEach((child) => {
            child.removeFromParent();
            child.destroy();
        });

        this.getWanderingMerchantRecycleEntries().forEach((entry, index) => {
            this.createWanderingMerchantCard(grid!, entry, index);
        });
    }
    protected createWanderingMerchantCard(parent: Node, entry: WanderingMerchantRecycleEntry, index: number): void {
        const cardWidth = 207;
        const cardHeight = 278;
        const col = index % 3;
        const row = Math.floor(index / 3);
        const x = (col - 1) * 224;
        const y = 166 - row * 320;
        const cell = this.createNode(`WanderingMerchantRecycle_${entry.catalogId}`, parent, cardWidth, cardHeight, x, y);

        this.createSkinnedNode('WanderingMerchantItemBg', cell, cardWidth, cardHeight, 0, 0, HomeConfig.UI_WANDERING_MERCHANT_ITEM_BG).setSiblingIndex(0);

        const name = this.createLabel(cell, 'WanderingMerchantItemName', entry.catalog.name, 20, 0, 98, 176, 38, new Color(92, 55, 28, 255));
        name.lineHeight = 26;
        name.overflow = Overflow.SHRINK;
        this.setLabelOutline(name, new Color(255, 244, 202, 255), 1);
        name.node.setSiblingIndex(2);

        const iconFrame = this.createSkinnedNode('WanderingMerchantItemFrame', cell, 96, 96, 0, 29, entry.catalog.framePath);
        iconFrame.setSiblingIndex(3);
        this.createSkinnedNode('WanderingMerchantItemIcon', iconFrame, 72, 72, 0, 2, entry.catalog.iconPath).setSiblingIndex(1);

        const sellButton = this.createSkinnedNode('WanderingMerchantSellButton', cell, 92, 40, 0, -103, HomeConfig.UI_WANDERING_MERCHANT_SELL_BUTTON);
        sellButton.setSiblingIndex(5);
        const sellLabel = this.createLabel(sellButton, 'WanderingMerchantSellButtonLabel', '出售', 22, 0, 1, 86, 34, new Color(255, 238, 218, 255));
        sellLabel.lineHeight = 28;
        this.setLabelOutline(sellLabel, new Color(94, 36, 35, 255), 2);
        sellLabel.node.setSiblingIndex(1);
        const opacity = sellButton.getComponent(UIOpacity) || sellButton.addComponent(UIOpacity);
        opacity.opacity = this.getWanderingMerchantRemaining(entry) > 0 ? 255 : 135;
        this.bindScaledClick(sellButton, () => this.openWanderingMerchantSellConfirm(entry));
    }
    protected formatWanderingMerchantSellRichMessage(entry: WanderingMerchantRecycleEntry, quantity: number): string {
        const totalPrice = this.formatCommercePrice(entry.price * quantity);
        const remaining = this.getWanderingMerchantRemaining(entry);
        const normal = '#6f462a';
        const red = '#d83a2e';
        const name = this.escapeRichText(entry.catalog.name);
        return `<outline color=#fff7dc width=1><color=${normal}>是否以</color><color=${red}>${totalPrice}</color><color=${normal}>元宝出售给流浪商人${name} x</color><color=${red}>${quantity}</color><color=${normal}>？\n（剩余收购数量：${remaining}）</color></outline>`;
    }
    protected openWanderingMerchantSellConfirm(entry: WanderingMerchantRecycleEntry): void {
        const remaining = this.getWanderingMerchantRemaining(entry);
        if (remaining <= 0) {
            this.showToast('该遗珍今日收购数量已满');
            return;
        }

        this.commerceQuantity = 1;
        this.commerceQuantityMax = remaining;
        this.openSharedFlowPopup('ConfirmPopup', {
            title: '提示说明',
            variant: 'commerceQuantityConfirm',
            onConfirm: () => this.completeWanderingMerchantSale(entry, this.commerceQuantity),
        });

        const popup = this.popupRoot?.getChildByName('ConfirmPopup') || this.findNode('ConfirmPopup');
        if (!popup?.isValid) return;
        const { quantityValue, message } = this.layoutCommerceQuantityConfirmPopup(popup, '提示说明', '出售', entry.catalog.name, entry.price, '元宝');
        const refresh = (): void => {
            if (quantityValue) quantityValue.string = `${this.commerceQuantity}`;
            if (message) message.string = this.formatWanderingMerchantSellRichMessage(entry, this.commerceQuantity);
        };
        const minus = this.findNode('ConfirmQuantityMinus', popup);
        const plus = this.findNode('ConfirmQuantityPlus', popup);
        if (minus) this.bindScaledClick(minus, () => {
            if (this.commerceQuantity <= 1) {
                this.showToast('数量不能低于1');
                refresh();
                return;
            }
            this.commerceQuantity = Math.max(1, this.commerceQuantity - 1);
            refresh();
        });
        if (plus) this.bindScaledClick(plus, () => {
            if (this.commerceQuantity >= this.commerceQuantityMax) {
                this.showToast(`数量已达到上限：${this.commerceQuantityMax}`);
                refresh();
                return;
            }
            this.commerceQuantity = Math.min(this.commerceQuantityMax, this.commerceQuantity + 1);
            refresh();
        });
        refresh();
    }
    protected completeWanderingMerchantSale(entry: WanderingMerchantRecycleEntry, quantity: number): void {
        const remaining = this.getWanderingMerchantRemaining(entry);
        const soldCount = Math.max(0, Math.min(remaining, Math.floor(quantity)));
        if (soldCount <= 0) {
            this.showToast('该遗珍今日收购数量已满');
            return;
        }

        const nextRemaining = Math.max(0, remaining - soldCount);
        this.wanderingMerchantRemaining.set(entry.catalogId, nextRemaining);
        this.saveWanderingMerchantRemaining();
        this.showToast(`出售成功，获得${this.formatCommercePrice(entry.price * soldCount)}元宝`);

        const panel = this.popupRoot?.getChildByName('WanderingMerchantPanel') || this.findNode('WanderingMerchantPanel');
        if (panel?.isValid && panel.active) {
            this.bindWanderingMerchantPage(panel);
        }
    }
    protected ensureSharedPopupDimMask(popup: Node, closeOnTap: boolean): Node {
        const maskName = `${popup.name}DimMask`;
        let mask = popup.getChildByName(maskName);
        if (!mask?.isValid) {
            mask = this.createNode(maskName, popup, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT, 0, 0);
        }

        if (mask.parent !== popup) {
            mask.setParent(popup);
        }
        mask.active = true;
        mask.setPosition(0, 0, 0);
        (mask.getComponent(UITransform) || mask.addComponent(UITransform)).setContentSize(HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT);

        const graphics = mask.getComponent(Graphics) || mask.addComponent(Graphics);
        graphics.clear();
        graphics.fillColor = new Color(0, 0, 0, 118);
        graphics.rect(-HomeConfig.VIEW_WIDTH / 2, -HomeConfig.VIEW_HEIGHT / 2, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT);
        graphics.fill();

        mask.setSiblingIndex(0);
        mask.off(Node.EventType.TOUCH_START);
        mask.off(Node.EventType.TOUCH_CANCEL);
        mask.off(Node.EventType.TOUCH_END);
        mask.on(Node.EventType.TOUCH_START, (event: EventTouch) => {
            event.propagationStopped = true;
        }, this);
        mask.on(Node.EventType.TOUCH_CANCEL, (event: EventTouch) => {
            event.propagationStopped = true;
        }, this);
        mask.on(Node.EventType.TOUCH_END, (event: EventTouch) => {
            event.propagationStopped = true;
            if (closeOnTap) {
                this.closeSharedFlowPopup(popup);
            }
        }, this);
        return mask;
    }
    protected bindSharedFlowPopups(): void {
        this.sharedFlowPopupNames.forEach((popupName) => {
            const popup = this.popupRoot?.getChildByName(popupName) || this.findNode(popupName);
            if (!popup?.isValid) return;
            popup.active = false;
            if (popupName === 'ItemDetailPopup' || popupName === 'BagIllustrationDetailPopup') {
                popup.on(Node.EventType.TOUCH_END, (event: EventTouch) => {
                    event.propagationStopped = true;
                    this.closeSharedFlowPopup(popup);
                }, this);
                const boardName = popupName === 'BagIllustrationDetailPopup'
                    ? 'BagIllustrationDetailPopupBoard'
                    : 'ItemDetailPopupBoard';
                const board = this.findNode(boardName, popup);
                board?.on(Node.EventType.TOUCH_END, (event: EventTouch) => {
                    event.propagationStopped = true;
                }, this);
            }
    
            const closeNames = [
                `${popupName}Close`,
                'ItemDetailSecondaryButton',
                'ConfirmCancelButton',
                'RewardConfirmButton',
                'BattleResultCloseButton',
            ];
            if (popupName === 'GiftTransferConfirmPopup') {
                closeNames.push('ConfirmPopupClose');
            }
            closeNames.forEach((nodeName) => {
                const button = this.findNode(nodeName, popup);
                if (button) {
                    this.bindScaledClick(button, () => this.closeSharedFlowPopup(popup));
                }
            });
        });
    
        ['ConfirmPopup', 'GiftTransferConfirmPopup'].forEach((confirmPopupName) => {
            const confirmPopup = this.popupRoot?.getChildByName(confirmPopupName) || this.findNode(confirmPopupName);
            const confirm = confirmPopup ? this.findNode('ConfirmAcceptButton', confirmPopup) : null;
            if (!confirm) return;
            this.bindScaledClick(confirm, () => {
                const action = this.sharedPopupConfirmAction;
                const popup = this.popupRoot?.getChildByName(confirmPopupName) || this.findNode(confirmPopupName);
                if (popup) this.closeSharedFlowPopup(popup);
                this.sharedPopupConfirmAction = null;
                action?.();
            });
        });
    
        const itemPrimary = this.findNode('ItemDetailPrimaryButton', this.popupRoot || this.node);
        if (itemPrimary) {
            this.bindScaledClick(itemPrimary, () => {
                this.showToast('\u7269\u54c1\u64cd\u4f5c\u5df2\u63d0\u4ea4');
                const popup = this.popupRoot?.getChildByName('ItemDetailPopup') || this.findNode('ItemDetailPopup');
                if (popup) this.closeSharedFlowPopup(popup);
            });
        }
    
        const battleAgain = this.findNode('BattleResultAgainButton', this.popupRoot || this.node);
        if (battleAgain) {
            this.bindScaledClick(battleAgain, () => {
                const popup = this.popupRoot?.getChildByName('BattleResultPopup') || this.findNode('BattleResultPopup');
                if (popup) this.closeSharedFlowPopup(popup);
                const action = this.sharedBattleAgainAction;
                this.sharedBattleAgainAction = null;
                this.sharedBattleCloseAction = null;
                action?.();
            });
        }
    
        ['BattleResultPopupClose', 'BattleResultCloseButton'].forEach((nodeName) => {
            const button = this.findNode(nodeName, this.popupRoot || this.node);
            if (!button) return;
            this.bindScaledClick(button, () => {
                const action = this.sharedBattleCloseAction;
                if (action) {
                    const popup = this.popupRoot?.getChildByName('BattleResultPopup') || this.findNode('BattleResultPopup');
                    if (popup) this.closeSharedFlowPopup(popup);
                    this.sharedBattleAgainAction = null;
                    this.sharedBattleCloseAction = null;
                    action();
                    return;
                }
                this.returnToBattleEntryFromResult();
            });
        });
    }
    protected openSharedFlowPopup(popupName: string, content: SharedPopupContent = {}): void {
        const popup = this.popupRoot?.getChildByName(popupName) || this.findNode(popupName);
        if (!popup?.isValid) {
            console.warn(`[MainHomeView] shared popup missing: ${popupName}`);
            return;
        }
    
        this.sharedFlowPopupNames.forEach((name) => {
            const other = this.popupRoot?.getChildByName(name) || this.findNode(name);
            if (other?.isValid && other !== popup) other.active = false;
        });
        this.sharedPopupConfirmAction = content.onConfirm || null;
        if (popupName === 'BattleResultPopup') {
            this.sharedBattleAgainAction = content.onAgain || null;
            this.sharedBattleCloseAction = content.onClose || null;
        }
    
        const titleNodeName = popupName === 'GiftTransferConfirmPopup'
            ? 'ConfirmPopupTitle'
            : `${popupName}Title`;
        const title = this.findNode(titleNodeName, popup)?.getComponent(Label);
        if (title && content.title) title.string = content.title;
        const messageNodeName = popupName === 'ConfirmPopup' || popupName === 'GiftTransferConfirmPopup'
            ? 'ConfirmMessage'
            : popupName === 'RewardPopup'
                ? 'RewardMessage'
                : '';
        if (messageNodeName && content.message) {
            const messageNode = this.findNode(messageNodeName, popup);
            const richText = messageNode?.getComponent(RichText);
            if (richText) {
                richText.string = this.formatPlainConfirmRichText(content.message);
                const label = messageNode?.getComponent(Label);
                if (label) label.enabled = false;
            } else {
                const message = messageNode?.getComponent(Label);
                if (message) {
                    message.enabled = true;
                    message.string = content.message;
                }
            }
        }
        if (popupName === 'ConfirmPopup' || popupName === 'GiftTransferConfirmPopup') {
            const quantityRoot = this.findNode('ConfirmQuantityRoot', popup);
            if (quantityRoot) quantityRoot.active = false;
        }
        this.ensureSharedPopupDimMask(
            popup,
            popupName === 'ItemDetailPopup' || popupName === 'BagIllustrationDetailPopup',
        );
    
        popup.active = true;
        this.ensureInputBlocker(popup);
        popup.setSiblingIndex((popup.parent?.children.length || 1) - 1);
        this.refreshRootLayerOrder();
    }
    protected setLabelOutline(label: Label, color: Color, width: number): void {
        label.enableOutline = width > 0;
        label.outlineColor = color;
        label.outlineWidth = width;
    }
    protected closeSharedFlowPopup(popup: Node): void {
        popup.active = false;
        if (popup.name === 'ConfirmPopup' || popup.name === 'GiftTransferConfirmPopup') {
            this.sharedPopupConfirmAction = null;
            const quantityRoot = this.findNode('ConfirmQuantityRoot', popup);
            if (quantityRoot) quantityRoot.active = false;
        }
        this.refreshRootLayerOrder();
    }
    protected openRolePagePanel(): void {
        this.buildRolePagePanel();
        if (!this.rolePagePanel) return;
    
        this.closeOtherBottomEntryPages(this.rolePagePanel);
        this.rolePagePanel.active = true;
        this.ensureInputBlocker(this.rolePagePanel);
        this.rolePagePanel.setSiblingIndex((this.rolePagePanel.parent?.children.length || 1) - 1);
        this.switchRolePageTab('equipment');
        this.refreshBottomEntryChrome();
    }
    protected closeRolePagePanel(): void {
        if (!this.rolePagePanel) return;
    
        this.closeRoleAttrDetailPanel();
        this.closeRoleEquipDetailPopup(false);
        this.closeRoleEquipReplacePopup(false);
        this.closeRoleProgressSuccessPopup(false);
        this.rolePagePanel.active = false;
        this.setSkeletonVisible(this.rolePageSkeleton, false);
        this.refreshBottomEntryChrome();
    }
}
