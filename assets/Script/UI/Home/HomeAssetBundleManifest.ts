export const HOME_SHARED_ASSET_BUNDLE_NAME = 'res';
export const HOME_MAGIC_ASSET_BUNDLE_NAME = 'feature-magic';
export const HOME_BATTLE_ASSET_BUNDLE_NAME = 'feature-battle';
export const HOME_DUEL_ASSET_BUNDLE_NAME = 'feature-duel';
export const HOME_BEAST_ASSET_BUNDLE_NAME = 'feature-beast';
export const HOME_SHOP_ASSET_BUNDLE_NAME = 'feature-shop';
export const HOME_PROFILE_ASSET_BUNDLE_NAME = 'feature-profile';
export const HOME_SHARE_ASSET_BUNDLE_NAME = 'feature-share';
export const HOME_BAG_ASSET_BUNDLE_NAME = 'feature-bag';
export const HOME_ROLE_ASSET_BUNDLE_NAME = 'feature-role';

const HOME_BAG_FEATURE_ASSET_PATHS = [
    'Texture/UI/Bag/Mode',
    'Texture/UI/Bag/bag_bottom_button_bg',
    'Texture/UI/Bag/bag_category_tab_active',
    'Texture/UI/Bag/bag_category_tab_normal',
    'Texture/UI/Bag/bag_decompose_frame',
    'Texture/UI/Bag/bag_filter_tab_bg',
    'Texture/UI/Bag/bag_frame',
    'Texture/UI/Bag/bag_illustration_btn',
    'Texture/UI/Bag/bag_item_detail_title_bg',
    'Texture/UI/Bag/bag_one_key_lock',
    'Texture/UI/Bag/bag_page_bg',
    'Texture/UI/Bag/bag_synth_frame',
    'Texture/UI/Bag/bag_tab_bag',
    'Texture/UI/Bag/bag_tab_bag_active',
    'Texture/UI/Bag/bag_tab_beast_synth',
    'Texture/UI/Bag/bag_tab_crystal_synth',
    'Texture/UI/Bag/bag_tab_decompose',
    'Texture/UI/Bag/bag_tab_decompose_active',
    'Texture/UI/Bag/bag_tab_synth_active',
] as const;

const HOME_FEATURE_ASSET_RULES = [
    {
        bundleName: HOME_MAGIC_ASSET_BUNDLE_NAME,
        prefixes: ['Spine/Magic', 'Texture/UI/Magic'],
    },
    {
        bundleName: HOME_BATTLE_ASSET_BUNDLE_NAME,
        prefixes: ['Spine/Battle', 'Texture/UI/Battle'],
    },
    {
        bundleName: HOME_DUEL_ASSET_BUNDLE_NAME,
        prefixes: ['Spine/Duel', 'Texture/UI/Duel'],
    },
    {
        bundleName: HOME_BEAST_ASSET_BUNDLE_NAME,
        prefixes: ['Spine/Beast', 'Texture/UI/Beast'],
    },
    {
        bundleName: HOME_SHOP_ASSET_BUNDLE_NAME,
        prefixes: ['Spine/Shop', 'Texture/UI/Shop'],
    },
    {
        bundleName: HOME_PROFILE_ASSET_BUNDLE_NAME,
        prefixes: ['Spine/Profile', 'Texture/UI/Profile'],
    },
    {
        bundleName: HOME_SHARE_ASSET_BUNDLE_NAME,
        prefixes: ['Texture/UI/Share'],
    },
    {
        bundleName: HOME_BAG_ASSET_BUNDLE_NAME,
        prefixes: HOME_BAG_FEATURE_ASSET_PATHS,
    },
    {
        bundleName: HOME_ROLE_ASSET_BUNDLE_NAME,
        prefixes: ['Texture/UI/Role'],
    },
] as const;

const HOME_ENTRY_ASSET_BUNDLES: Readonly<Record<string, readonly string[]>> = {
    BtnProfile: [HOME_PROFILE_ASSET_BUNDLE_NAME],
    BtnShare: [HOME_SHARE_ASSET_BUNDLE_NAME],
    TabBag: [HOME_BAG_ASSET_BUNDLE_NAME],
    TabRole: [HOME_ROLE_ASSET_BUNDLE_NAME],
    TabShowcase: [HOME_MAGIC_ASSET_BUNDLE_NAME, HOME_SHOP_ASSET_BUNDLE_NAME],
    TabBattle: [HOME_BATTLE_ASSET_BUNDLE_NAME],
    BtnDuel: [HOME_DUEL_ASSET_BUNDLE_NAME],
    TabBoss: [HOME_BEAST_ASSET_BUNDLE_NAME],
    BtnShop: [HOME_SHOP_ASSET_BUNDLE_NAME],
};

export function getHomeAssetBundleName(assetPath: string): string {
    if (typeof assetPath !== 'string' || assetPath.length === 0) {
        throw new TypeError(`Home asset path must be a non-empty string, got ${typeof assetPath}`);
    }
    const matchedRule = HOME_FEATURE_ASSET_RULES.find(({ prefixes }) => (
        prefixes.some((prefix) => assetPath === prefix || assetPath.startsWith(`${prefix}/`))
    ));
    return matchedRule?.bundleName || HOME_SHARED_ASSET_BUNDLE_NAME;
}

export function getHomeEntryAssetBundleNames(entryName: string): readonly string[] {
    return HOME_ENTRY_ASSET_BUNDLES[entryName] || [];
}
