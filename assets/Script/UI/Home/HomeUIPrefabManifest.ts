export type HomeUILayer = 'page' | 'popup';

export interface HomeUIPrefabDefinition {
    readonly rootName: string;
    readonly layer: HomeUILayer;
    readonly path: string;
}

export const HOME_UI_BUNDLE_NAME = 'ui-home';
export const HOME_UI_SHARED_BUNDLE_NAME = 'res';

export const HOME_UI_PREFABS: readonly HomeUIPrefabDefinition[] = [
    { rootName: 'RolePagePanel', layer: 'page', path: 'Prefabs/Page/RolePagePanel' },
    { rootName: 'BagPanel', layer: 'page', path: 'Prefabs/Page/BagPanel' },
    { rootName: 'AlliancePanel', layer: 'page', path: 'Prefabs/Page/AlliancePanel' },
    { rootName: 'DuelPanel', layer: 'page', path: 'Prefabs/Page/DuelPanel' },
    { rootName: 'ShowcasePanel', layer: 'page', path: 'Prefabs/Page/ShowcasePanel' },
    { rootName: 'MagicMapPanel', layer: 'page', path: 'Prefabs/Page/MagicMapPanel' },
    { rootName: 'MagicMonsterBattlePanel', layer: 'page', path: 'Prefabs/Page/MagicMonsterBattlePanel' },
    { rootName: 'BattlePanel', layer: 'page', path: 'Prefabs/Page/BattlePanel' },
    { rootName: 'ShopPanel', layer: 'page', path: 'Prefabs/Page/ShopPanel' },
    { rootName: 'BottomFeaturePanel', layer: 'page', path: 'Prefabs/Page/BottomFeaturePanel' },
    { rootName: 'CharacterCreatePanel', layer: 'page', path: 'Prefabs/Page/CharacterCreatePanel' },

    { rootName: 'MailPanel', layer: 'popup', path: 'Prefabs/Popup/MailPanel' },
    { rootName: 'NoticePanel', layer: 'popup', path: 'Prefabs/Popup/NoticePanel' },
    { rootName: 'RankPanel', layer: 'popup', path: 'Prefabs/Popup/RankPanel' },
    { rootName: 'GiftPanel', layer: 'popup', path: 'Prefabs/Popup/GiftPanel' },
    { rootName: 'SharePanel', layer: 'popup', path: 'Prefabs/Popup/SharePanel' },
    { rootName: 'ItemDetailPopup', layer: 'popup', path: 'Prefabs/Popup/ItemDetailPopup' },
    { rootName: 'ConfirmPopup', layer: 'popup', path: 'Prefabs/Popup/ConfirmPopup' },
    { rootName: 'RewardPopup', layer: 'popup', path: 'Prefabs/Popup/RewardPopup' },
    { rootName: 'BattleResultPopup', layer: 'popup', path: 'Prefabs/Popup/BattleResultPopup' },
    { rootName: 'ProfilePopup', layer: 'popup', path: 'Prefabs/Popup/ProfilePopup' },
    { rootName: 'BagIllustrationDetailPopup', layer: 'popup', path: 'Prefabs/Popup/BagIllustrationDetailPopup' },
    { rootName: 'MarketPanel', layer: 'popup', path: 'Prefabs/Popup/MarketPanel' },
    { rootName: 'MagicFloorPanel', layer: 'popup', path: 'Prefabs/Popup/MagicFloorPanel' },
    { rootName: 'BattleRewardPopup', layer: 'popup', path: 'Prefabs/Popup/BattleRewardPopup' },
    { rootName: 'RoleEquipDetailPopup', layer: 'popup', path: 'Prefabs/Popup/RoleEquipDetailPopup' },
    { rootName: 'RoleEquipReplacePopup', layer: 'popup', path: 'Prefabs/Popup/RoleEquipReplacePopup' },
    { rootName: 'RoleProgressSuccessPopup', layer: 'popup', path: 'Prefabs/Popup/RoleProgressSuccessPopup' },
    { rootName: 'TransitionLoadingLayer', layer: 'popup', path: 'Prefabs/Popup/TransitionLoadingLayer' },
    { rootName: 'ProfileSettingsPopup', layer: 'popup', path: 'Prefabs/Popup/ProfileSettingsPopup' },
    { rootName: 'ProfileAvatarFramePopup', layer: 'popup', path: 'Prefabs/Popup/ProfileAvatarFramePopup' },
    { rootName: 'WanderingMerchantPanel', layer: 'popup', path: 'Prefabs/Popup/WanderingMerchantPanel' },
] as const;

const HOME_UI_STARTUP_ROOT_NAMES = new Set([
    'CharacterCreatePanel',
    'ItemDetailPopup',
    'ConfirmPopup',
    'RewardPopup',
    'BattleResultPopup',
    'TransitionLoadingLayer',
]);

const HOME_UI_ENTRY_ROOT_NAMES: Readonly<Record<string, readonly string[]>> = {
    BtnProfile: ['ProfilePopup', 'ProfileSettingsPopup', 'ProfileAvatarFramePopup'],
    BtnMail: ['MailPanel'],
    BtnNotice: ['NoticePanel'],
    BtnShop: ['ShopPanel'],
    BtnRank: ['RankPanel'],
    BtnAlliance: ['AlliancePanel'],
    BtnMarket: ['MarketPanel'],
    BtnDuel: ['DuelPanel'],
    BtnShare: ['SharePanel'],
    BtnAdGift: ['GiftPanel'],
    BtnBoss: ['ShowcasePanel'],
    BtnWanderingMerchant: ['WanderingMerchantPanel'],
    TabRole: [
        'RolePagePanel',
        'RoleEquipDetailPopup',
        'RoleEquipReplacePopup',
        'RoleProgressSuccessPopup',
    ],
    TabBag: ['BagPanel', 'BagIllustrationDetailPopup'],
    TabBattle: ['BattlePanel', 'BattleRewardPopup'],
    TabShowcase: [
        'BottomFeaturePanel',
        'MagicFloorPanel',
        'MagicMapPanel',
        'MagicMonsterBattlePanel',
    ],
    TabBoss: ['BottomFeaturePanel'],
};

const HOME_UI_PREFAB_BY_ROOT_NAME = new Map(
    HOME_UI_PREFABS.map((definition) => [definition.rootName, definition] as const),
);

function resolveHomeUIPrefabs(rootNames: Iterable<string>): readonly HomeUIPrefabDefinition[] {
    const definitions: HomeUIPrefabDefinition[] = [];
    for (const rootName of rootNames) {
        const definition = HOME_UI_PREFAB_BY_ROOT_NAME.get(rootName);
        if (!definition) {
            throw new Error(`Unknown Home UI prefab root: ${rootName}`);
        }
        definitions.push(definition);
    }
    return definitions;
}

export const HOME_UI_STARTUP_PREFABS = resolveHomeUIPrefabs(HOME_UI_STARTUP_ROOT_NAMES);

export function getHomeUIEntryPrefabs(entryName: string): readonly HomeUIPrefabDefinition[] {
    return resolveHomeUIPrefabs(HOME_UI_ENTRY_ROOT_NAMES[entryName] || []);
}
