import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const projectRoot = path.resolve(import.meta.dirname, '..');
const assetsRoot = path.join(projectRoot, 'assets');
const argumentsSet = new Set(process.argv.slice(2));
const buildDirectoryArgumentIndex = process.argv.indexOf('--build-dir');
const buildDirectoryName = buildDirectoryArgumentIndex >= 0
    ? process.argv[buildDirectoryArgumentIndex + 1]
    : 'web-mobile';
const requireRelease = argumentsSet.has('--release');
const printJsonReport = argumentsSet.has('--report');
const buildRoot = path.join(projectRoot, 'build', buildDirectoryName);
const buildSourceRoot = path.join(buildRoot, 'src');
const buildIndexPath = path.join(buildRoot, 'index.html');
const buildRuntimeConfigPath = path.join(buildRoot, 'runtime-config.js');
const settingsFileName = fs.existsSync(buildSourceRoot)
    ? fs.readdirSync(buildSourceRoot).find((name) => /^settings(?:\.[0-9a-f]+)?\.json$/i.test(name))
    : undefined;
const settingsPath = settingsFileName
    ? path.join(buildSourceRoot, settingsFileName)
    : path.join(buildSourceRoot, 'settings.json');
const budgetPath = path.join(projectRoot, 'tools', 'web-mobile-size-budget.json');
const budget = readJson(budgetPath);
const uuidPattern = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

function readJson(filePath) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function fail(message) {
    console.error(`Web delivery audit failed: ${message}`);
    process.exit(1);
}

function walkFiles(directory) {
    if (!fs.existsSync(directory)) return [];
    const files = [];
    const pending = [directory];
    while (pending.length > 0) {
        const current = pending.pop();
        for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
            const entryPath = path.join(current, entry.name);
            if (entry.isDirectory()) pending.push(entryPath);
            else if (entry.isFile()) files.push(entryPath);
        }
    }
    return files;
}

function formatBytes(bytes) {
    if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(2)} MiB`;
    if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KiB`;
    return `${bytes} B`;
}

function relative(filePath) {
    return path.relative(projectRoot, filePath).replaceAll(path.sep, '/');
}

function collectUuidPaths(value, sourcePath, output) {
    if (!value || typeof value !== 'object') return;
    if (typeof value.uuid === 'string') {
        output.set(value.uuid.split('@')[0], sourcePath);
    }
    Object.values(value).forEach((child) => collectUuidPaths(child, sourcePath, output));
}

function createSourceAssetIndex() {
    const index = new Map();
    for (const metaPath of walkFiles(assetsRoot).filter((filePath) => filePath.endsWith('.meta'))) {
        let meta;
        try {
            meta = readJson(metaPath);
        } catch (error) {
            fail(`${relative(metaPath)} is not valid JSON: ${error.message}`);
        }
        collectUuidPaths(meta, relative(metaPath.slice(0, -'.meta'.length)), index);
    }
    return index;
}

function collectDirectoryStats(directory) {
    const files = walkFiles(directory);
    return {
        bytes: files.reduce((sum, filePath) => sum + fs.statSync(filePath).size, 0),
        files: files.length,
    };
}

function resolveBuiltAssetSource(filePath, sourceAssetIndex) {
    const match = relative(filePath).match(uuidPattern);
    if (!match) return '';
    return sourceAssetIndex.get(match[0]) || '';
}

function inspectTextureConfiguration() {
    let imageCount = 0;
    let configuredCount = 0;
    for (const metaPath of walkFiles(assetsRoot).filter((filePath) => filePath.endsWith('.meta'))) {
        const meta = readJson(metaPath);
        if (meta.importer !== 'image') continue;
        imageCount += 1;
        const userData = meta.userData || {};
        const platformSettings = userData.platformSettings;
        const compressSettings = userData.compressSettings;
        const hasPlatformSettings = Array.isArray(platformSettings)
            ? platformSettings.length > 0
            : Boolean(platformSettings && Object.keys(platformSettings).length > 0);
        const hasCompressSettings = Array.isArray(compressSettings)
            ? compressSettings.length > 0
            : Boolean(compressSettings && Object.keys(compressSettings).length > 0);
        if (hasPlatformSettings || hasCompressSettings) configuredCount += 1;
    }
    return { imageCount, configuredCount };
}

function inspectSourceBundleConfiguration() {
    const bundleMetas = [
        path.join(assetsRoot, 'Res.meta'),
        ...walkFiles(path.join(assetsRoot, 'Bundle'))
            .filter((filePath) => filePath.endsWith('.meta')),
    ];
    const bundles = [];
    for (const metaPath of bundleMetas) {
        const meta = readJson(metaPath);
        if (meta.userData?.isBundle !== true) continue;
        const remoteSetting = meta.userData.isRemoteBundle;
        const compressionSetting = meta.userData.compressionType;
        bundles.push({
            name: meta.userData.bundleName,
            priority: meta.userData.priority,
            remote: remoteSetting === true
                || Boolean(remoteSetting && Object.values(remoteSetting).includes(true)),
            compressionConfigured: typeof compressionSetting === 'string'
                || Boolean(compressionSetting && Object.keys(compressionSetting).length > 0),
            source: relative(metaPath),
        });
    }
    return bundles.sort((left, right) => left.name.localeCompare(right.name));
}

if (!fs.existsSync(settingsPath)) {
    console.log(`Web delivery build check skipped (${relative(buildRoot)} is not present).`);
    process.exit(0);
}

if (!fs.existsSync(buildIndexPath) || !fs.existsSync(buildRuntimeConfigPath)) {
    fail('runtime configuration output is missing index.html or runtime-config.js');
}
const buildIndexSource = fs.readFileSync(buildIndexPath, 'utf8');
const runtimeConfigScriptIndex = buildIndexSource.indexOf('src="runtime-config.js"');
const applicationBootIndex = buildIndexSource.indexOf('System.import(');
if (
    runtimeConfigScriptIndex < 0
    || applicationBootIndex < 0
    || runtimeConfigScriptIndex > applicationBootIndex
) {
    fail('index.html must load runtime-config.js before the Cocos application boot');
}
const buildRuntimeConfigSource = fs.readFileSync(buildRuntimeConfigPath, 'utf8');
if (
    !buildRuntimeConfigSource.includes('__QV_RUNTIME_CONFIG__')
    || !buildRuntimeConfigSource.includes("backendMode: 'local-preview'")
) {
    fail('runtime-config.js does not contain the reviewed local-preview default');
}

const settings = readJson(settingsPath);
if (settings.CocosEngine !== '3.8.8') {
    fail(`expected Cocos Engine 3.8.8, got ${settings.CocosEngine || 'unknown'}`);
}
if (settings.engine?.platform !== 'web-mobile') {
    fail(`expected web-mobile, got ${settings.engine?.platform || 'unknown'}`);
}
if (settings.launch?.launchScene !== 'db://assets/Scene/LoadingScene.scene') {
    fail(`launch scene must be LoadingScene, got ${settings.launch?.launchScene || 'missing'}`);
}

const remoteBundles = settings.assets?.remoteBundles || [];
const resourceServer = settings.assets?.server || '';
if ((remoteBundles.length > 0) !== (resourceServer.length > 0)) {
    fail('remoteBundles and the resource server address must be configured together');
}

if (requireRelease) {
    if (settings.engine?.debug !== false) fail('release build still has engine.debug enabled');
    const resolution = settings.screen?.designResolution || {};
    if (resolution.width !== 750 || resolution.height !== 1624 || resolution.policy !== 4) {
        fail(
            `release design resolution must be 750x1624/FIXED_WIDTH(4), got `
            + `${resolution.width || 0}x${resolution.height || 0}/policy ${resolution.policy}`,
        );
    }
    if (settings.screen?.orientation !== 'portrait') {
        fail(`release orientation must be portrait, got ${settings.screen?.orientation || 'missing'}`);
    }
    if (Object.keys(settings.assets?.bundleVers || {}).length === 0) {
        fail('release build has no bundle versions; MD5 cache is not active');
    }
}

const sourceAssetIndex = createSourceAssetIndex();
const allBuildFiles = walkFiles(buildRoot);
const totalBytes = allBuildFiles.reduce((sum, filePath) => sum + fs.statSync(filePath).size, 0);
if (totalBytes > budget.maximumBuildBytes) {
    fail(`build is ${formatBytes(totalBytes)}, budget is ${formatBytes(budget.maximumBuildBytes)}`);
}

const largestFiles = allBuildFiles
    .map((filePath) => ({
        bytes: fs.statSync(filePath).size,
        file: relative(filePath),
        source: resolveBuiltAssetSource(filePath, sourceAssetIndex),
    }))
    .sort((left, right) => right.bytes - left.bytes);
if (largestFiles[0]?.bytes > budget.maximumSingleFileBytes) {
    fail(
        `${largestFiles[0].file} is ${formatBytes(largestFiles[0].bytes)}, `
        + `single-file budget is ${formatBytes(budget.maximumSingleFileBytes)}`,
    );
}

const bundleStats = [];
for (const [bundleName, maximumBytes] of Object.entries(budget.bundles)) {
    const directory = path.join(buildRoot, 'assets', bundleName);
    if (!fs.existsSync(directory)) fail(`required bundle output assets/${bundleName} is missing`);
    const stats = collectDirectoryStats(directory);
    if (stats.bytes > maximumBytes) {
        fail(
            `assets/${bundleName} is ${formatBytes(stats.bytes)}, `
            + `budget is ${formatBytes(maximumBytes)}`,
        );
    }
    bundleStats.push({
        name: bundleName,
        bytes: stats.bytes,
        files: stats.files,
        maximumBytes,
    });
}

const mainNativeDirectory = path.join(buildRoot, 'assets', 'main', 'native');
const mainLargestAssets = walkFiles(mainNativeDirectory)
    .map((filePath) => ({
        bytes: fs.statSync(filePath).size,
        file: relative(filePath),
        source: resolveBuiltAssetSource(filePath, sourceAssetIndex),
    }))
    .sort((left, right) => right.bytes - left.bytes)
    .slice(0, 10);
const textureConfiguration = inspectTextureConfiguration();
const sourceBundles = inspectSourceBundleConfiguration();
const report = {
    build: relative(buildRoot),
    mode: settings.engine.debug ? 'debug' : 'release',
    engine: settings.CocosEngine,
    launchScene: settings.launch.launchScene,
    resolution: settings.screen?.designResolution,
    orientation: settings.screen?.orientation,
    totalBytes,
    maximumBuildBytes: budget.maximumBuildBytes,
    resourceServer,
    remoteBundles,
    textureConfiguration,
    sourceBundles,
    bundleStats,
    mainLargestAssets,
    largestFiles: largestFiles.slice(0, 20),
};

if (printJsonReport) {
    console.log(JSON.stringify(report, null, 2));
} else {
    console.log(
        `Web delivery OK (${buildDirectoryName}, ${report.mode}, total ${formatBytes(totalBytes)}; `
        + `launch LoadingScene; remote bundles ${remoteBundles.length})`,
    );
    console.log(
        `Texture profiles: ${textureConfiguration.configuredCount}/`
        + `${textureConfiguration.imageCount} image sources explicitly configured`,
    );
    console.log(
        `Bundle budgets: ${bundleStats.map((item) => (
            `${item.name} ${formatBytes(item.bytes)}/${formatBytes(item.maximumBytes)}`
        )).join('; ')}`,
    );
    console.log('Largest main native assets:');
    for (const item of mainLargestAssets) {
        console.log(
            `  ${formatBytes(item.bytes).padStart(10)}  ${item.source || item.file}`,
        );
    }
}
