import fs from 'node:fs';
import path from 'node:path';

const projectRoot = path.resolve(import.meta.dirname, '..');
const assetsRoot = path.join(projectRoot, 'assets');
const resRoot = path.join(assetsRoot, 'Res');
const featureMagicRoot = path.join(assetsRoot, 'Bundle', 'FeatureMagic');
const featureBattleRoot = path.join(assetsRoot, 'Bundle', 'FeatureBattle');
const featureDuelRoot = path.join(assetsRoot, 'Bundle', 'FeatureDuel');
const featureBeastRoot = path.join(assetsRoot, 'Bundle', 'FeatureBeast');
const featureShopRoot = path.join(assetsRoot, 'Bundle', 'FeatureShop');
const featureProfileRoot = path.join(assetsRoot, 'Bundle', 'FeatureProfile');
const featureShareRoot = path.join(assetsRoot, 'Bundle', 'FeatureShare');
const featureBagRoot = path.join(assetsRoot, 'Bundle', 'FeatureBag');
const featureRoleRoot = path.join(assetsRoot, 'Bundle', 'FeatureRole');
const featureBagPaths = [
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
];

function walk(directory, output = []) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
        const fullPath = path.join(directory, entry.name);
        output.push({ fullPath, entry });
        if (entry.isDirectory()) walk(fullPath, output);
    }
    return output;
}

function normalizeResourcePath(value) {
    return value.replaceAll('\\', '/').replace(/^\/+/, '').replace(/\.(png|jpg|jpeg|json|skel|atlas|mp3|ttf)$/i, '');
}

function decodeQuotedString(quote, value) {
    try {
        if (quote === '"') return JSON.parse(`"${value}"`);
        return JSON.parse(`"${value.replaceAll('"', '\\"')}"`);
    } catch {
        return value;
    }
}

const entries = walk(assetsRoot);
let failed = false;

for (const { fullPath, entry } of entries) {
    if (entry.name.endsWith('.meta')) continue;
    if (!fs.existsSync(`${fullPath}.meta`)) {
        failed = true;
        console.error(`Missing meta: ${path.relative(projectRoot, fullPath)}`);
    }
}

for (const { fullPath, entry } of entries) {
    if (!entry.isFile() || !entry.name.endsWith('.meta')) continue;
    const sourcePath = fullPath.slice(0, -'.meta'.length);
    if (!fs.existsSync(sourcePath)) {
        failed = true;
        console.error(`Orphan meta: ${path.relative(projectRoot, fullPath)}`);
    }
    try {
        JSON.parse(fs.readFileSync(fullPath, 'utf8'));
    } catch (error) {
        failed = true;
        console.error(`Invalid meta JSON: ${path.relative(projectRoot, fullPath)} (${error.message})`);
    }
}

const sourceFiles = entries
    .filter(({ entry }) => entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.json')))
    .map(({ fullPath }) => fullPath);
const sourceText = sourceFiles.map((file) => fs.readFileSync(file, 'utf8')).join('\n');
const referencedPaths = new Set();
const resourceLiteralPattern = /(['"])((?:Audio|Config|Font|Spine|Texture)\/[^'"`\r\n]+)\1/g;
for (const match of sourceText.matchAll(resourceLiteralPattern)) {
    referencedPaths.add(normalizeResourcePath(decodeQuotedString(match[1], match[2])));
}

const constants = new Map();
const homeConfigPath = path.join(assetsRoot, 'Script', 'UI', 'Home', 'HomeConfig.ts');
const homeConfig = fs.readFileSync(homeConfigPath, 'utf8');
for (const match of homeConfig.matchAll(/export const ([A-Z][A-Z0-9_]*) = (['"])(.*?)\2;/g)) {
    constants.set(match[1], decodeQuotedString(match[2], match[3]));
}
let changed = true;
while (changed) {
    changed = false;
    for (const match of homeConfig.matchAll(/export const ([A-Z][A-Z0-9_]*) = `\$\{([A-Z][A-Z0-9_]*)\}([^`]*)`;/g)) {
        if (constants.has(match[1]) || !constants.has(match[2])) continue;
        constants.set(match[1], `${constants.get(match[2])}${match[3]}`);
        changed = true;
    }
}
for (const value of constants.values()) {
    if (/^(Audio|Config|Font|Spine|Texture)\//.test(value)) {
        referencedPaths.add(normalizeResourcePath(value));
    }
}
for (const match of sourceText.matchAll(/`\$\{(?:HomeConfig\.)?([A-Z][A-Z0-9_]*)\}\/([^`$]+)`/g)) {
    const root = constants.get(match[1]);
    if (root) referencedPaths.add(normalizeResourcePath(`${root}/${match[2]}`));
}
if (sourceText.includes('loadConfigDir(')) {
    referencedPaths.add('Config');
}

const resourceExtensions = ['.png', '.jpg', '.jpeg', '.json', '.skel', '.atlas', '.mp3', '.ttf'];
function getResourceRoot(resourcePath) {
    if (
        resourcePath === 'Spine/Magic'
        || resourcePath.startsWith('Spine/Magic/')
        || resourcePath === 'Texture/UI/Magic'
        || resourcePath.startsWith('Texture/UI/Magic/')
    ) {
        return featureMagicRoot;
    }
    if (
        resourcePath === 'Spine/Battle'
        || resourcePath.startsWith('Spine/Battle/')
        || resourcePath === 'Texture/UI/Battle'
        || resourcePath.startsWith('Texture/UI/Battle/')
    ) {
        return featureBattleRoot;
    }
    if (
        resourcePath === 'Spine/Duel'
        || resourcePath.startsWith('Spine/Duel/')
        || resourcePath === 'Texture/UI/Duel'
        || resourcePath.startsWith('Texture/UI/Duel/')
    ) {
        return featureDuelRoot;
    }
    if (
        resourcePath === 'Spine/Beast'
        || resourcePath.startsWith('Spine/Beast/')
        || resourcePath === 'Texture/UI/Beast'
        || resourcePath.startsWith('Texture/UI/Beast/')
    ) {
        return featureBeastRoot;
    }
    if (
        resourcePath === 'Spine/Shop'
        || resourcePath.startsWith('Spine/Shop/')
        || resourcePath === 'Texture/UI/Shop'
        || resourcePath.startsWith('Texture/UI/Shop/')
    ) {
        return featureShopRoot;
    }
    if (
        resourcePath === 'Spine/Profile'
        || resourcePath.startsWith('Spine/Profile/')
        || resourcePath === 'Texture/UI/Profile'
        || resourcePath.startsWith('Texture/UI/Profile/')
    ) {
        return featureProfileRoot;
    }
    if (
        resourcePath === 'Texture/UI/Share'
        || resourcePath.startsWith('Texture/UI/Share/')
    ) {
        return featureShareRoot;
    }
    if (featureBagPaths.some((featurePath) => (
        resourcePath === featurePath || resourcePath.startsWith(`${featurePath}/`)
    ))) {
        return featureBagRoot;
    }
    if (
        resourcePath === 'Texture/UI/Role'
        || resourcePath.startsWith('Texture/UI/Role/')
    ) {
        return featureRoleRoot;
    }
    return resRoot;
}
for (const resourcePath of referencedPaths) {
    const resourceRoot = getResourceRoot(resourcePath);
    const absoluteBase = path.join(resourceRoot, ...resourcePath.split('/'));
    const exists = fs.existsSync(absoluteBase)
        || resourceExtensions.some((extension) => fs.existsSync(`${absoluteBase}${extension}`))
        || (fs.existsSync(path.dirname(absoluteBase))
            && fs.readdirSync(path.dirname(absoluteBase)).some((name) => name.startsWith(path.basename(absoluteBase))));
    if (!exists) {
        failed = true;
        console.error(
            `Missing dynamic resource: ${path.relative(assetsRoot, resourceRoot)}/${resourcePath}`,
        );
    }
}

const atlasFiles = entries.filter(({ entry }) => entry.isFile() && entry.name.endsWith('.atlas'));
for (const { fullPath } of atlasFiles) {
    const basePath = fullPath.slice(0, -'.atlas'.length);
    if (!fs.existsSync(`${basePath}.json`) && !fs.existsSync(`${basePath}.skel`)) {
        failed = true;
        console.error(`Spine skeleton missing for: ${path.relative(projectRoot, fullPath)}`);
    }
    if (!fs.existsSync(`${basePath}.png`)) {
        failed = true;
        console.error(`Spine texture missing for: ${path.relative(projectRoot, fullPath)}`);
    }
}

const spineAnimationContracts = [
    ...['Level01_20', 'Level21_30', 'Level31_40', 'Level41_50'].flatMap((level) => [
        {
            path: `Spine/RoleWeapon/${level}/Male/skeleton.json`,
            animations: ['ready', 'run', 'skill0', 'hit1', 'dead'],
        },
        {
            path: `Spine/RoleWeapon/${level}/Female/skeleton.json`,
            animations: ['ready', 'run', 'skill2', 'hit1', 'dead'],
        },
    ]),
    {
        path: 'Spine/Common/Cloud/172464265161517.json',
        animations: ['idle'],
    },
    ...[
        ['Level1', '25402'],
        ['Level2', '26160'],
        ['Level3', '26162'],
        ['Level4', '26163'],
        ['Level5', '26166'],
        ['Level6', '26300'],
        ['Level7', '26614'],
        ['Level8', '27007'],
        ['Level9', '26319'],
    ].map(([level, file]) => ({
        path: `Spine/Magic/${level}/${file}.json`,
        animations: ['Down_Idle'],
    })),
    {
        path: 'Spine/Magic/Monsters/Small/H30074.json',
        animations: ['action1', 'action2', 'hurt', 'run', 'stand2'],
    },
    {
        path: 'Spine/Magic/Monsters/Boss/H30009.json',
        animations: ['action1', 'action2', 'hurt', 'run', 'stand2'],
    },
    {
        path: 'Spine/Battle/仙域背景spine动画/skeleton.json',
        animations: ['idle'],
    },
    {
        path: 'Spine/Battle/仙域战场背景spine动画/skeleton.json',
        animations: ['idle'],
    },
    {
        path: 'Spine/Battle/IronGuard/skeleton.json',
        animations: ['ready', 'run', 'hit1', 'dead'],
    },
    {
        path: 'Spine/Common/RewardText/shenglishibaigongxihuode/shenglishibaigongxihuode.json',
        animations: ['gongxihuode_chufa', 'gongxihuode_loop'],
    },
    ...[
        ['Assassin', 'cha_2052'],
        ['Common', 'cha_2042'],
        ['DoubleFemale', 'cha_3124'],
        ['DoubleMale', 'cha_3042'],
        ['General', 'cha_2177'],
        ['GuardSoldier', 'cha_3011'],
        ['Rebel', 'cha_2073'],
    ].map(([role, file]) => ({
        path: `Spine/Duel/JianghuTaosha/${role}/${file}.json`,
        animations: ['attack', 'hurt', 'run', 'stand2'],
    })),
    ...[
        ['Card1', 'pet03'],
        ['Card2', 'pet5'],
        ['Card3', 'pet08'],
        ['Card4', 'pet10'],
    ].map(([card, file]) => ({
        path: `Spine/Beast/${card}/${file}.json`,
        animations: ['animation'],
    })),
    {
        path: 'Spine/Shop/Character/S20506.json',
        animations: ['stand1', 'stand2'],
    },
    ...[
        'frame_0354',
        'frame_0355',
        'frame_0358',
        'frame_0363',
        'frame_0375',
        'frame_0378',
        'frame_0387',
        'frame_0393',
        'frame_0414',
        'frame_0415',
    ].map((frame) => ({
        path: `Spine/Profile/AvatarFrame/${frame}/${frame}.json`,
        animations: ['animation'],
    })),
];
for (const contract of spineAnimationContracts) {
    const filePath = path.join(getResourceRoot(contract.path), ...contract.path.split('/'));
    const skeletonJson = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const animations = new Set(Object.keys(skeletonJson.animations || {}));
    const missing = contract.animations.filter((animation) => !animations.has(animation));
    if (missing.length > 0) {
        failed = true;
        console.error(
            `Spine animation contract failed for Res/${contract.path}: missing ${missing.join(', ')}`,
        );
    }
}

if (failed) {
    process.exit(1);
}

const assetFileCount = entries.filter(({ entry }) => entry.isFile() && !entry.name.endsWith('.meta')).length;
console.log(`Resource integrity OK (${assetFileCount} assets, ${referencedPaths.size} checked dynamic paths, ${atlasFiles.length} Spine packages)`);
