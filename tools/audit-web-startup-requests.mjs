import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const projectRoot = path.resolve(import.meta.dirname, '..');
const buildDirectoryName = process.argv[2] || 'web-mobile-release';
const requestLogArgument = process.argv[3] || 'temp/codex-preview-release.log';
const buildRoot = path.join(projectRoot, 'build', buildDirectoryName);
const requestLogPath = path.resolve(projectRoot, requestLogArgument);
const budget = JSON.parse(
    fs.readFileSync(path.join(projectRoot, 'tools', 'web-mobile-size-budget.json'), 'utf8'),
);
const featureBundleNames = [
    'feature-magic',
    'feature-battle',
    'feature-duel',
    'feature-beast',
    'feature-shop',
    'feature-profile',
    'feature-bag',
    'feature-role',
];

function fail(message) {
    console.error(`Web startup request audit failed: ${message}`);
    process.exit(1);
}

function formatBytes(bytes) {
    return `${(bytes / 1024 / 1024).toFixed(2)} MiB`;
}

if (!fs.existsSync(path.join(buildRoot, 'index.html'))) {
    fail(`build/${buildDirectoryName} is not a complete Web build`);
}
if (!fs.existsSync(requestLogPath)) {
    fail(
        `${path.relative(projectRoot, requestLogPath)} is missing; `
        + 'run the release preview with --log-requests and stop after MainScene becomes stable',
    );
}

const requestPaths = [...new Set(
    fs.readFileSync(requestLogPath, 'utf8')
        .split(/\r?\n/)
        .filter((line) => line.startsWith('GET '))
        .map((line) => {
            const pathname = decodeURIComponent(line.slice('GET '.length).split('?')[0]);
            return pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
        }),
)];
if (requestPaths.length === 0) fail('request log contains no GET requests');

const featureRequests = requestPaths.filter((requestPath) => (
    featureBundleNames.some((bundleName) => requestPath.startsWith(`assets/${bundleName}/`))
));
if (featureRequests.length > 0) {
    fail(
        `startup requested ${featureRequests.length} feature file(s): `
        + featureRequests.slice(0, 5).join(', '),
    );
}

const groups = new Map();
let totalBytes = 0;
for (const requestPath of requestPaths) {
    const filePath = path.resolve(buildRoot, requestPath);
    if (
        !filePath.startsWith(`${buildRoot}${path.sep}`)
        || !fs.existsSync(filePath)
        || !fs.statSync(filePath).isFile()
    ) {
        fail(`request does not resolve to a build file: ${requestPath}`);
    }
    const bytes = fs.statSync(filePath).size;
    totalBytes += bytes;
    const groupMatch = requestPath.match(/^assets\/([^/]+)/);
    const group = groupMatch ? `assets/${groupMatch[1]}` : requestPath.split('/')[0];
    const stats = groups.get(group) || { bytes: 0, files: 0 };
    stats.bytes += bytes;
    stats.files += 1;
    groups.set(group, stats);
}

if (totalBytes > budget.maximumStartupTransferBytes) {
    fail(
        `startup requested ${formatBytes(totalBytes)}, `
        + `budget is ${formatBytes(budget.maximumStartupTransferBytes)}`,
    );
}

console.log(
    `Web startup requests OK (${requestPaths.length} unique files, `
    + `${formatBytes(totalBytes)}/${formatBytes(budget.maximumStartupTransferBytes)}, `
    + '0 feature bundle requests)',
);
console.log(
    [...groups.entries()]
        .sort((left, right) => right[1].bytes - left[1].bytes)
        .map(([name, stats]) => `${name} ${stats.files} files/${formatBytes(stats.bytes)}`)
        .join('; '),
);
