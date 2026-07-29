import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const projectRoot = path.resolve(import.meta.dirname, '..');
const resMetaPath = path.join(projectRoot, 'assets', 'Res.meta');
const homeMetaPath = path.join(projectRoot, 'assets', 'Bundle', 'UIHome.meta');
const magicMetaPath = path.join(projectRoot, 'assets', 'Bundle', 'FeatureMagic.meta');
const battleMetaPath = path.join(projectRoot, 'assets', 'Bundle', 'FeatureBattle.meta');
const duelMetaPath = path.join(projectRoot, 'assets', 'Bundle', 'FeatureDuel.meta');
const beastMetaPath = path.join(projectRoot, 'assets', 'Bundle', 'FeatureBeast.meta');
const shopMetaPath = path.join(projectRoot, 'assets', 'Bundle', 'FeatureShop.meta');
const profileMetaPath = path.join(projectRoot, 'assets', 'Bundle', 'FeatureProfile.meta');
const shareMetaPath = path.join(projectRoot, 'assets', 'Bundle', 'FeatureShare.meta');
const bagMetaPath = path.join(projectRoot, 'assets', 'Bundle', 'FeatureBag.meta');
const roleMetaPath = path.join(projectRoot, 'assets', 'Bundle', 'FeatureRole.meta');
const assetManifestPath = path.join(
    projectRoot,
    'assets',
    'Script',
    'UI',
    'Home',
    'HomeAssetBundleManifest.ts',
);
const homeManifestPath = path.join(
    projectRoot,
    'assets',
    'Script',
    'UI',
    'Home',
    'HomeUIPrefabManifest.ts',
);
const mainHomeViewPath = path.join(
    projectRoot,
    'assets',
    'Script',
    'UI',
    'Home',
    'MainHomeView.ts',
);
const sharedBottomFeaturePrefabPath = path.join(
    projectRoot,
    'assets',
    'Bundle',
    'UIHome',
    'Prefabs',
    'Page',
    'BottomFeaturePanel.prefab',
);
const scriptDirectory = path.join(projectRoot, 'assets', 'Script');
const buildAssetsPath = path.join(projectRoot, 'build', 'web-mobile', 'assets');

function readJson(filePath) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function fail(message) {
    console.error(`Bundle ownership audit failed: ${message}`);
    process.exit(1);
}

function assertBundle(metaPath, expectedName) {
    if (!fs.existsSync(metaPath)) fail(`missing ${path.relative(projectRoot, metaPath)}`);
    const meta = readJson(metaPath);
    const userData = meta.userData || {};
    if (userData.isBundle !== true) {
        fail(`${path.relative(projectRoot, metaPath)} is not configured as an Asset Bundle`);
    }
    if (userData.bundleName !== expectedName) {
        fail(
            `${path.relative(projectRoot, metaPath)} bundleName must be "${expectedName}", `
            + `got "${userData.bundleName || ''}"`,
        );
    }
    if (!Number.isInteger(userData.priority)) {
        fail(`${path.relative(projectRoot, metaPath)} must define an integer priority`);
    }
    return userData;
}

function directorySize(directory) {
    let bytes = 0;
    let files = 0;
    const pending = [directory];
    while (pending.length > 0) {
        const current = pending.pop();
        for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
            const entryPath = path.join(current, entry.name);
            if (entry.isDirectory()) {
                pending.push(entryPath);
            } else if (entry.isFile()) {
                files += 1;
                bytes += fs.statSync(entryPath).size;
            }
        }
    }
    return { bytes, files };
}

function collectUuidBases(value, output) {
    if (!value || typeof value !== 'object') return;
    if (typeof value.uuid === 'string') output.add(value.uuid.split('@')[0]);
    Object.values(value).forEach((child) => collectUuidBases(child, output));
}

function collectSerializedAssetUuids(value, output = []) {
    if (!value || typeof value !== 'object') return output;
    if (typeof value.__uuid__ === 'string') output.push(value.__uuid__);
    Object.values(value).forEach((child) => collectSerializedAssetUuids(child, output));
    return output;
}

function collectMetaUuidBases(directory, output) {
    const pending = [directory];
    while (pending.length > 0) {
        const current = pending.pop();
        for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
            const entryPath = path.join(current, entry.name);
            if (entry.isDirectory()) {
                pending.push(entryPath);
            } else if (entry.isFile() && entry.name.endsWith('.meta')) {
                collectUuidBases(readJson(entryPath), output);
            }
        }
    }
}

const resBundle = assertBundle(resMetaPath, 'res');
const homeBundle = assertBundle(homeMetaPath, 'ui-home');
const magicBundle = assertBundle(magicMetaPath, 'feature-magic');
const battleBundle = assertBundle(battleMetaPath, 'feature-battle');
const duelBundle = assertBundle(duelMetaPath, 'feature-duel');
const beastBundle = assertBundle(beastMetaPath, 'feature-beast');
const shopBundle = assertBundle(shopMetaPath, 'feature-shop');
const profileBundle = assertBundle(profileMetaPath, 'feature-profile');
const shareBundle = assertBundle(shareMetaPath, 'feature-share');
const bagBundle = assertBundle(bagMetaPath, 'feature-bag');
const roleBundle = assertBundle(roleMetaPath, 'feature-role');
const featureBundles = [
    ['feature-magic', magicBundle],
    ['feature-battle', battleBundle],
    ['feature-duel', duelBundle],
    ['feature-beast', beastBundle],
    ['feature-shop', shopBundle],
    ['feature-profile', profileBundle],
    ['feature-share', shareBundle],
    ['feature-bag', bagBundle],
    ['feature-role', roleBundle],
];
const featureAssetUuidBases = new Set();
const featureAssetBundleByUuidBase = new Map();
const assetBundleDirectory = path.join(projectRoot, 'assets', 'Bundle');
fs.readdirSync(assetBundleDirectory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name.startsWith('Feature'))
    .forEach((entry) => {
        const directory = path.join(assetBundleDirectory, entry.name);
        const bundleMeta = readJson(`${directory}.meta`);
        const bundleName = bundleMeta.userData?.bundleName;
        if (typeof bundleName !== 'string' || bundleName.length === 0) {
            fail(`${path.relative(projectRoot, directory)} has no bundleName`);
        }
        const directoryUuidBases = new Set();
        collectMetaUuidBases(directory, directoryUuidBases);
        for (const uuidBase of directoryUuidBases) {
            featureAssetUuidBases.add(uuidBase);
            featureAssetBundleByUuidBase.set(uuidBase, bundleName);
        }
    });
const sharedBottomFeaturePrefab = readJson(sharedBottomFeaturePrefabPath);
const sharedBottomFeatureAssetLeaks = collectSerializedAssetUuids(sharedBottomFeaturePrefab)
    .filter((uuid) => featureAssetUuidBases.has(uuid.split('@')[0]));
if (sharedBottomFeatureAssetLeaks.length > 0) {
    fail(
        `BottomFeaturePanel.prefab serializes ${sharedBottomFeatureAssetLeaks.length} feature asset reference(s); `
        + 'the shared shell must load Magic/Beast assets by runtime path after its entry bundle is acquired',
    );
}
if (
    featureBundles.some(([, bundle]) => bundle.priority <= resBundle.priority)
    || resBundle.priority <= homeBundle.priority
) {
    fail(
        `feature bundle priorities (${featureBundles.map(([name, bundle]) => `${name}:${bundle.priority}`).join(', ')}) `
        + `must be greater than res (${resBundle.priority}), which must be greater than `
        + `ui-home (${homeBundle.priority})`,
    );
}

const manifestSource = fs.readFileSync(homeManifestPath, 'utf8');
if (!manifestSource.includes("HOME_UI_SHARED_BUNDLE_NAME = 'res'")) {
    fail('HomeUIPrefabManifest.ts must declare res as HOME_UI_SHARED_BUNDLE_NAME');
}
const prefabDefinitions = new Map(
    [...manifestSource.matchAll(
        /\{\s*rootName:\s*'([^']+)',\s*layer:\s*'(page|popup)',\s*path:\s*'([^']+)'\s*\}/g,
    )].map((match) => [match[1], match[3]]),
);
const startupRootNamesBlock = manifestSource.match(
    /const HOME_UI_STARTUP_ROOT_NAMES = new Set\(\[([\s\S]*?)\]\);/,
);
if (!startupRootNamesBlock) fail('HomeUIPrefabManifest.ts startup prefab set is not parseable');
const startupRootNames = [...startupRootNamesBlock[1].matchAll(/'([^']+)'/g)]
    .map((match) => match[1]);
for (const rootName of startupRootNames) {
    const assetPath = prefabDefinitions.get(rootName);
    if (!assetPath) fail(`startup prefab "${rootName}" has no HOME_UI_PREFABS definition`);
    const prefabPath = path.join(projectRoot, 'assets', 'Bundle', 'UIHome', `${assetPath}.prefab`);
    const featureLeaks = collectSerializedAssetUuids(readJson(prefabPath))
        .filter((uuid) => featureAssetUuidBases.has(uuid.split('@')[0]));
    if (featureLeaks.length > 0) {
        fail(
            `startup prefab ${rootName} serializes ${featureLeaks.length} feature asset reference(s); `
            + 'move genuinely shared assets back to res or make the prefab entry-lazy',
        );
    }
}
const assetManifestSource = fs.readFileSync(assetManifestPath, 'utf8');
if (
    !assetManifestSource.includes("HOME_MAGIC_ASSET_BUNDLE_NAME = 'feature-magic'")
    || !assetManifestSource.includes("'Spine/Magic'")
    || !assetManifestSource.includes("'Texture/UI/Magic'")
    || !assetManifestSource.includes('TabShowcase: [HOME_MAGIC_ASSET_BUNDLE_NAME, HOME_SHOP_ASSET_BUNDLE_NAME]')
    || !assetManifestSource.includes("HOME_BATTLE_ASSET_BUNDLE_NAME = 'feature-battle'")
    || !assetManifestSource.includes("'Spine/Battle'")
    || !assetManifestSource.includes("'Texture/UI/Battle'")
    || !assetManifestSource.includes('TabBattle: [HOME_BATTLE_ASSET_BUNDLE_NAME]')
    || !assetManifestSource.includes("HOME_DUEL_ASSET_BUNDLE_NAME = 'feature-duel'")
    || !assetManifestSource.includes("'Spine/Duel'")
    || !assetManifestSource.includes("'Texture/UI/Duel'")
    || !assetManifestSource.includes('BtnDuel: [HOME_DUEL_ASSET_BUNDLE_NAME]')
    || !assetManifestSource.includes("HOME_BEAST_ASSET_BUNDLE_NAME = 'feature-beast'")
    || !assetManifestSource.includes("'Spine/Beast'")
    || !assetManifestSource.includes("'Texture/UI/Beast'")
    || !assetManifestSource.includes('TabBoss: [HOME_BEAST_ASSET_BUNDLE_NAME]')
    || !assetManifestSource.includes("HOME_SHOP_ASSET_BUNDLE_NAME = 'feature-shop'")
    || !assetManifestSource.includes("'Spine/Shop'")
    || !assetManifestSource.includes("'Texture/UI/Shop'")
    || !assetManifestSource.includes('BtnShop: [HOME_SHOP_ASSET_BUNDLE_NAME]')
    || !assetManifestSource.includes("HOME_PROFILE_ASSET_BUNDLE_NAME = 'feature-profile'")
    || !assetManifestSource.includes("'Spine/Profile'")
    || !assetManifestSource.includes("'Texture/UI/Profile'")
    || !assetManifestSource.includes('BtnProfile: [HOME_PROFILE_ASSET_BUNDLE_NAME]')
    || !assetManifestSource.includes("HOME_SHARE_ASSET_BUNDLE_NAME = 'feature-share'")
    || !assetManifestSource.includes("'Texture/UI/Share'")
    || !assetManifestSource.includes('BtnShare: [HOME_SHARE_ASSET_BUNDLE_NAME]')
    || !assetManifestSource.includes("HOME_BAG_ASSET_BUNDLE_NAME = 'feature-bag'")
    || !assetManifestSource.includes("'Texture/UI/Bag/Mode'")
    || !assetManifestSource.includes('TabBag: [HOME_BAG_ASSET_BUNDLE_NAME]')
    || !assetManifestSource.includes("HOME_ROLE_ASSET_BUNDLE_NAME = 'feature-role'")
    || !assetManifestSource.includes("'Texture/UI/Role'")
    || !assetManifestSource.includes('TabRole: [HOME_ROLE_ASSET_BUNDLE_NAME]')
) {
    fail('HomeAssetBundleManifest.ts must route Magic, Battle, Role-strengthen, Duel, Beast, Shop, Profile, Share, and Bag assets by entry');
}
const assetBundleConstants = new Map(
    [...assetManifestSource.matchAll(
        /export const (HOME_[A-Z_]+_ASSET_BUNDLE_NAME) = '([^']+)';/g,
    )].map((match) => [match[1], match[2]]),
);
const entryAssetBundleBlock = assetManifestSource.match(
    /const HOME_ENTRY_ASSET_BUNDLES[\s\S]*?= \{([\s\S]*?)\n\};/,
);
if (!entryAssetBundleBlock) fail('HomeAssetBundleManifest.ts entry bundle map is not parseable');
const entryAssetBundles = new Map();
for (const match of entryAssetBundleBlock[1].matchAll(/(\w+):\s*\[([^\]]*)\]/g)) {
    const bundles = [...match[2].matchAll(/HOME_[A-Z_]+_ASSET_BUNDLE_NAME/g)]
        .map((constantMatch) => assetBundleConstants.get(constantMatch[0]))
        .filter(Boolean);
    entryAssetBundles.set(match[1], new Set(bundles));
}
const uiEntryRootNamesBlock = manifestSource.match(
    /const HOME_UI_ENTRY_ROOT_NAMES[\s\S]*?= \{([\s\S]*?)\n\};\n\nconst HOME_UI_PREFAB_BY_ROOT_NAME/,
);
if (!uiEntryRootNamesBlock) fail('HomeUIPrefabManifest.ts entry prefab map is not parseable');
for (const match of uiEntryRootNamesBlock[1].matchAll(/(\w+):\s*\[([\s\S]*?)\],/g)) {
    const entryName = match[1];
    const rootNames = [...match[2].matchAll(/'([^']+)'/g)].map((rootMatch) => rootMatch[1]);
    const acquiredBundles = entryAssetBundles.get(entryName) || new Set();
    for (const rootName of rootNames) {
        const assetPath = prefabDefinitions.get(rootName);
        if (!assetPath) fail(`entry prefab "${rootName}" has no HOME_UI_PREFABS definition`);
        const prefabPath = path.join(projectRoot, 'assets', 'Bundle', 'UIHome', `${assetPath}.prefab`);
        const requiredBundles = new Set(
            collectSerializedAssetUuids(readJson(prefabPath))
                .map((uuid) => featureAssetBundleByUuidBase.get(uuid.split('@')[0]))
                .filter(Boolean),
        );
        const missingBundles = [...requiredBundles].filter((bundle) => !acquiredBundles.has(bundle));
        if (missingBundles.length > 0) {
            fail(
                `${entryName} mounts ${rootName}, which serializes assets from `
                + `${missingBundles.join(', ')} without acquiring those bundles first`,
            );
        }
    }
}

const mainHomeSource = fs.readFileSync(mainHomeViewPath, 'utf8');
const sharedAcquireIndex = mainHomeSource.indexOf(
    'acquireBundle(HOME_UI_SHARED_BUNDLE_NAME)',
);
const homeAcquireIndex = mainHomeSource.indexOf(
    'acquireBundle(HOME_UI_BUNDLE_NAME)',
);
if (sharedAcquireIndex < 0 || homeAcquireIndex < 0 || sharedAcquireIndex > homeAcquireIndex) {
    fail('MainHomeView must acquire res before ui-home');
}
if (!mainHomeSource.includes('mountHomeUIPrefabs(HOME_UI_STARTUP_PREFABS)')) {
    fail('MainHomeView must mount only the startup Home UI prefab group during initialization');
}
if (!mainHomeSource.includes('getHomeUIEntryPrefabs(entryName)')) {
    fail('MainHomeView must resolve feature prefabs lazily by entry name');
}
if (
    !mainHomeSource.includes('getHomeEntryAssetBundleNames(entryName)')
    || !mainHomeSource.includes('homeFeatureResourceScopes')
) {
    fail('MainHomeView must acquire and own feature bundles through entry-scoped routing');
}

const legacyPinnedCall = "ResourceManager.instance.loadBundle('res')";
const pendingScriptDirectories = [scriptDirectory];
while (pendingScriptDirectories.length > 0) {
    const directory = pendingScriptDirectories.pop();
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
        const entryPath = path.join(directory, entry.name);
        if (entry.isDirectory()) {
            pendingScriptDirectories.push(entryPath);
            continue;
        }
        if (!entry.isFile() || !entry.name.endsWith('.ts')) continue;
        const source = fs.readFileSync(entryPath, 'utf8');
        if (source.includes(legacyPinnedCall)) {
            fail(
                `${path.relative(projectRoot, entryPath)} still pins res through `
                + 'the removed loadBundle compatibility API',
            );
        }
    }
}

const resourceManagerSource = fs.readFileSync(
    path.join(scriptDirectory, 'Managers', 'ResourceManager.ts'),
    'utf8',
);
if (resourceManagerSource.includes('public loadBundle(') || resourceManagerSource.includes('pinnedBundles')) {
    fail('ResourceManager must not expose the removed permanent bundle pin API');
}

console.log(
    `Source bundle ownership OK (feature bundles priority ${magicBundle.priority} > `
    + `res priority ${resBundle.priority} > `
    + `ui-home priority ${homeBundle.priority}; Scope-only loading and `
    + 'entry-lazy feature/prefab split enforced)',
);

const homeConfigPath = path.join(buildAssetsPath, 'ui-home', 'config.json');
const resConfigPath = path.join(buildAssetsPath, 'res', 'config.json');
const magicConfigPath = path.join(buildAssetsPath, 'feature-magic', 'config.json');
const battleConfigPath = path.join(buildAssetsPath, 'feature-battle', 'config.json');
const duelConfigPath = path.join(buildAssetsPath, 'feature-duel', 'config.json');
const beastConfigPath = path.join(buildAssetsPath, 'feature-beast', 'config.json');
const shopConfigPath = path.join(buildAssetsPath, 'feature-shop', 'config.json');
const profileConfigPath = path.join(buildAssetsPath, 'feature-profile', 'config.json');
const shareConfigPath = path.join(buildAssetsPath, 'feature-share', 'config.json');
const bagConfigPath = path.join(buildAssetsPath, 'feature-bag', 'config.json');
const roleConfigPath = path.join(buildAssetsPath, 'feature-role', 'config.json');
if (
    !fs.existsSync(homeConfigPath)
    || !fs.existsSync(resConfigPath)
    || !fs.existsSync(magicConfigPath)
    || !fs.existsSync(battleConfigPath)
    || !fs.existsSync(duelConfigPath)
    || !fs.existsSync(beastConfigPath)
    || !fs.existsSync(shopConfigPath)
    || !fs.existsSync(profileConfigPath)
    || !fs.existsSync(shareConfigPath)
    || !fs.existsSync(bagConfigPath)
    || !fs.existsSync(roleConfigPath)
) {
    console.log('Build artifact check skipped (build/web-mobile bundle configs not present).');
    process.exit(0);
}

const homeConfig = readJson(homeConfigPath);
if (!Array.isArray(homeConfig.deps) || !homeConfig.deps.includes('res')) {
    fail('built ui-home/config.json must depend on res');
}

const homeStats = directorySize(path.join(buildAssetsPath, 'ui-home'));
const maximumShellBundleBytes = 5 * 1024 * 1024;
if (homeStats.bytes > maximumShellBundleBytes) {
    fail(
        `built ui-home is ${(homeStats.bytes / 1024 / 1024).toFixed(2)} MiB; `
        + 'shared textures/Spine data are likely duplicated',
    );
}

const resStats = directorySize(path.join(buildAssetsPath, 'res'));
const magicStats = directorySize(path.join(buildAssetsPath, 'feature-magic'));
const battleStats = directorySize(path.join(buildAssetsPath, 'feature-battle'));
const duelStats = directorySize(path.join(buildAssetsPath, 'feature-duel'));
const beastStats = directorySize(path.join(buildAssetsPath, 'feature-beast'));
const shopStats = directorySize(path.join(buildAssetsPath, 'feature-shop'));
const profileStats = directorySize(path.join(buildAssetsPath, 'feature-profile'));
const shareStats = directorySize(path.join(buildAssetsPath, 'feature-share'));
const bagStats = directorySize(path.join(buildAssetsPath, 'feature-bag'));
const roleStats = directorySize(path.join(buildAssetsPath, 'feature-role'));
const maximumSharedBundleBytes = 60 * 1024 * 1024;
const maximumMagicBundleBytes = 55 * 1024 * 1024;
const maximumBattleBundleBytes = 25 * 1024 * 1024;
const maximumDuelBundleBytes = 20 * 1024 * 1024;
const maximumBeastBundleBytes = 10 * 1024 * 1024;
const maximumShopBundleBytes = 8 * 1024 * 1024;
const maximumProfileBundleBytes = 10 * 1024 * 1024;
const maximumShareBundleBytes = 6 * 1024 * 1024;
const maximumBagBundleBytes = 5 * 1024 * 1024;
const maximumRoleBundleBytes = 5 * 1024 * 1024;
if (resStats.bytes > maximumSharedBundleBytes) {
    fail(
        `built res is ${(resStats.bytes / 1024 / 1024).toFixed(1)} MiB; `
        + 'feature assets may have leaked back into the shared bundle',
    );
}
if (magicStats.bytes > maximumMagicBundleBytes) {
    fail(`built feature-magic is ${(magicStats.bytes / 1024 / 1024).toFixed(1)} MiB`);
}
if (battleStats.bytes > maximumBattleBundleBytes) {
    fail(`built feature-battle is ${(battleStats.bytes / 1024 / 1024).toFixed(1)} MiB`);
}
if (duelStats.bytes > maximumDuelBundleBytes) {
    fail(`built feature-duel is ${(duelStats.bytes / 1024 / 1024).toFixed(1)} MiB`);
}
if (beastStats.bytes > maximumBeastBundleBytes) {
    fail(`built feature-beast is ${(beastStats.bytes / 1024 / 1024).toFixed(1)} MiB`);
}
if (shopStats.bytes > maximumShopBundleBytes) {
    fail(`built feature-shop is ${(shopStats.bytes / 1024 / 1024).toFixed(1)} MiB`);
}
if (profileStats.bytes > maximumProfileBundleBytes) {
    fail(`built feature-profile is ${(profileStats.bytes / 1024 / 1024).toFixed(1)} MiB`);
}
if (shareStats.bytes > maximumShareBundleBytes) {
    fail(`built feature-share is ${(shareStats.bytes / 1024 / 1024).toFixed(1)} MiB`);
}
if (bagStats.bytes > maximumBagBundleBytes) {
    fail(`built feature-bag is ${(bagStats.bytes / 1024 / 1024).toFixed(1)} MiB`);
}
if (roleStats.bytes > maximumRoleBundleBytes) {
    fail(`built feature-role is ${(roleStats.bytes / 1024 / 1024).toFixed(1)} MiB`);
}
console.log(
    `Built bundle ownership OK (ui-home ${homeStats.files} files, `
    + `${(homeStats.bytes / 1024).toFixed(1)} KiB; `
    + `res ${(resStats.bytes / 1024 / 1024).toFixed(1)} MiB; `
    + `feature-magic ${(magicStats.bytes / 1024 / 1024).toFixed(1)} MiB; `
    + `feature-battle ${(battleStats.bytes / 1024 / 1024).toFixed(1)} MiB; `
    + `feature-duel ${(duelStats.bytes / 1024 / 1024).toFixed(1)} MiB; `
    + `feature-beast ${(beastStats.bytes / 1024 / 1024).toFixed(1)} MiB; `
    + `feature-shop ${(shopStats.bytes / 1024 / 1024).toFixed(1)} MiB; `
    + `feature-profile ${(profileStats.bytes / 1024 / 1024).toFixed(1)} MiB; `
    + `feature-share ${(shareStats.bytes / 1024 / 1024).toFixed(1)} MiB; `
    + `feature-bag ${(bagStats.bytes / 1024 / 1024).toFixed(1)} MiB; `
    + `feature-role ${(roleStats.bytes / 1024 / 1024).toFixed(1)} MiB)`,
);
