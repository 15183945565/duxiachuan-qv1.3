import fs from 'node:fs';
import path from 'node:path';

const projectRoot = path.resolve(import.meta.dirname, '..');
const scriptRoot = path.join(projectRoot, 'assets', 'Script');
const runtimeConfigPath = path.join(scriptRoot, 'Services', 'RuntimeConfig.ts');
const backendRuntimePath = path.join(scriptRoot, 'Services', 'BackendRuntime.ts');
const bootPath = path.join(scriptRoot, 'UI', 'Boot', 'BootLoadingView.ts');
const webTemplateRoot = path.join(projectRoot, 'build-templates', 'web-mobile');
const webIndexTemplatePath = path.join(webTemplateRoot, 'index.ejs');
const webRuntimeConfigPath = path.join(webTemplateRoot, 'runtime-config.js');
const releaseBuildConfigPath = path.join(projectRoot, 'tools', 'build-config', 'web-mobile.release.json');

const fail = (message) => {
    console.error(`Runtime configuration audit failed: ${message}`);
    process.exitCode = 1;
};
const read = (filePath) => fs.readFileSync(filePath, 'utf8');
const walk = (directory) => fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolutePath = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(absolutePath) : [absolutePath];
});

const configSource = read(runtimeConfigPath);
const backendSource = read(backendRuntimePath);
const bootSource = read(bootPath);
const webIndexTemplate = read(webIndexTemplatePath);
const webRuntimeConfig = read(webRuntimeConfigPath);
const releaseBuildConfig = JSON.parse(read(releaseBuildConfigPath));
const typeScriptFiles = walk(scriptRoot).filter((filePath) => filePath.endsWith('.ts'));

const requiredConfigGuards = [
    "RUNTIME_CONFIG_GLOBAL_KEY = '__QV_RUNTIME_CONFIG__'",
    "backendMode: 'local-preview'",
    'SENSITIVE_KEY_PATTERN',
    'CREDENTIALS_IN_URL_PATTERN',
    'Unknown runtime config field',
    'requestTimeoutMs < 1000',
    'requestTimeoutMs > 60000',
    "backendMode === 'remote' && !apiBaseUrl",
    'apiBaseUrl must be an absolute HTTP(S) URL',
    'webSocketBaseUrl must be an absolute WS(S) URL',
    'cdnBaseUrl must be an absolute HTTP(S) URL',
    'Runtime service URLs must not contain embedded credentials',
    'Object.freeze',
];
for (const guard of requiredConfigGuards) {
    if (!configSource.includes(guard)) fail(`RuntimeConfig is missing guard: ${guard}`);
}

const requiredBackendGuards = [
    "config.backendMode === 'remote'",
    'new RemoteGameBackend({',
    'tokenProvider: () => AuthService.getToken()',
    'timeoutMs: config.requestTimeoutMs',
    'new LocalPreviewBackend()',
];
for (const guard of requiredBackendGuards) {
    if (!backendSource.includes(guard)) fail(`BackendRuntime is missing route: ${guard}`);
}

const bootInitializeIndex = bootSource.indexOf('BackendRuntime.initialize();');
const bootUiIndex = bootSource.indexOf('applySimKaiFontToTree(this.node);');
if (!bootSource.includes("import { BackendRuntime } from '../../Services/BackendRuntime';")) {
    fail('BootLoadingView must import BackendRuntime');
}
if (bootInitializeIndex < 0 || bootUiIndex < 0 || bootInitializeIndex > bootUiIndex) {
    fail('BackendRuntime must initialize before BootLoadingView starts UI setup');
}

const templateConfigIndex = webIndexTemplate.indexOf('<script src="runtime-config.js"');
const templateCocosIndex = webIndexTemplate.indexOf('<%- include(cocosTemplate, {}) %>');
if (templateConfigIndex < 0 || templateCocosIndex < 0 || templateConfigIndex > templateCocosIndex) {
    fail('web-mobile index.ejs must load runtime-config.js before the Cocos boot template');
}
if (!webRuntimeConfig.includes("backendMode: 'local-preview'")) {
    fail('runtime-config.js must default to local-preview');
}
if (!webRuntimeConfig.includes('if (scope.__QV_RUNTIME_CONFIG__ != null) return;')) {
    fail('runtime-config.js must preserve a host-provided configuration');
}
if (!webRuntimeConfig.includes('Object.freeze({')) {
    fail('runtime-config.js must publish an immutable default object');
}
if (!releaseBuildConfig.md5CacheOptions?.excludes?.includes('runtime-config.js')) {
    fail('release MD5 configuration must keep runtime-config.js unhashed for deployment replacement');
}

for (const filePath of typeScriptFiles) {
    const relativePath = path.relative(scriptRoot, filePath).replaceAll('\\', '/');
    const source = read(filePath);
    if (relativePath !== 'Services/RuntimeConfig.ts' && source.includes('__QV_RUNTIME_CONFIG__')) {
        fail(`${relativePath} reads the runtime global outside RuntimeConfig`);
    }
    if (relativePath !== 'Services/BackendRuntime.ts' && source.includes('new RemoteGameBackend(')) {
        fail(`${relativePath} constructs RemoteGameBackend outside BackendRuntime`);
    }
}

if (!process.exitCode) {
    console.log(
        'Runtime configuration OK '
        + '(local-preview default; build template injection; one boot entry; '
        + 'remote API/WS/CDN/version/channel allowlist; no secret fields)',
    );
}
