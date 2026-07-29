import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const projectRoot = path.resolve(import.meta.dirname, '..');
const scriptRoot = path.join(projectRoot, 'assets', 'Script');
const remoteBackendRelativePath = 'Services/Backend/RemoteGameBackend.ts';
const localStorageAllowlist = new Set([
    'Services/AuthService.ts',
    'UI/Home/HomeFeatureBeastStrengthenRules.ts',
    'UI/Home/HomeFeatureMailData.ts',
    'UI/Home/HomeFeatureNotice.ts',
    'UI/Home/HomeFeatureProfileAvatarFrame.ts',
    'UI/Home/HomeFeatureProfileSettings.ts',
    'UI/Home/HomeFeatureProfileShell.ts',
    'UI/Home/HomeFeatureShop.ts',
]);

function fail(message) {
    console.error(`Backend boundary audit failed: ${message}`);
    process.exit(1);
}

function walkTypeScriptFiles(directory) {
    const files = [];
    const pending = [directory];
    while (pending.length > 0) {
        const current = pending.pop();
        for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
            const entryPath = path.join(current, entry.name);
            if (entry.isDirectory()) pending.push(entryPath);
            else if (entry.isFile() && entry.name.endsWith('.ts')) files.push(entryPath);
        }
    }
    return files;
}

function relative(filePath) {
    return path.relative(scriptRoot, filePath).replaceAll(path.sep, '/');
}

const files = walkTypeScriptFiles(scriptRoot);
const fetchOwners = [];
const localStorageOwners = [];
for (const filePath of files) {
    const source = fs.readFileSync(filePath, 'utf8');
    const file = relative(filePath);
    if (/\bfetch\s*\(/.test(source)) fetchOwners.push(file);
    if (source.includes('sys.localStorage')) localStorageOwners.push(file);
}

if (fetchOwners.length !== 1 || fetchOwners[0] !== remoteBackendRelativePath) {
    fail(
        `HTTP fetch must stay centralized in ${remoteBackendRelativePath}; `
        + `found ${fetchOwners.join(', ') || 'none'}`,
    );
}

const unexpectedLocalStorageOwners = localStorageOwners.filter((file) => !localStorageAllowlist.has(file));
const missingLocalStorageOwners = [...localStorageAllowlist].filter((file) => !localStorageOwners.includes(file));
if (unexpectedLocalStorageOwners.length > 0) {
    fail(`new localStorage owner(s) require an explicit truth-ownership review: ${unexpectedLocalStorageOwners.join(', ')}`);
}
if (missingLocalStorageOwners.length > 0) {
    fail(
        `localStorage allowlist is stale; remove migrated owner(s): `
        + missingLocalStorageOwners.join(', '),
    );
}

const remoteSource = fs.readFileSync(
    path.join(scriptRoot, ...remoteBackendRelativePath.split('/')),
    'utf8',
);
const requiredRemoteGuards = [
    "errorCode: 'TIMEOUT'",
    "errorCode: 'NETWORK_ERROR'",
    "errorCode: 'INVALID_RESPONSE'",
    'response.text()',
    'encodeURIComponent(',
    "headers.Authorization = `Bearer ${token}`",
    "headers['Content-Type'] = 'application/json'",
    'response.status === 204',
];
for (const guard of requiredRemoteGuards) {
    if (!remoteSource.includes(guard)) {
        fail(`RemoteGameBackend is missing transport guard: ${guard}`);
    }
}
if (remoteSource.includes("Authorization: `Bearer ${this.options.tokenProvider()}`")) {
    fail('RemoteGameBackend must not send an empty unconditional Authorization header');
}

console.log(
    `Backend boundary OK (fetch centralized; ${localStorageOwners.length} reviewed local truth owners; `
    + 'timeout/network/invalid-response/204/path guards enforced)',
);
