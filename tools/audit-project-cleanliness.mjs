import fs from 'node:fs';
import path from 'node:path';

const projectRoot = path.resolve(import.meta.dirname, '..');
const generatedDirectories = new Set([
    '.git', 'build', 'library', 'local', 'node_modules', 'profiles', 'temp',
]);
const forbiddenDirectories = [
    '.codex-backup', '.codex-tmp', '.codex_tmp', 'tmp',
    'generated_beast_equipment_icons', 'generated_icon_tmp', 'generated_home_icons',
    'generated', 'imagegen_checks',
];
const forbiddenExtensions = new Set(['.log', '.tmp', '.bak', '.orig', '.rej']);
const forbiddenNamePatterns = [/^codex-clipboard-/i, /(?:^|[_.-])(backup|temp|tmp)(?:[_.-]|$)/i];
const allowedTopLevel = new Set([
    '.editorconfig', '.gitattributes', '.gitignore',
    'assets', 'build-templates', 'docs', 'package.json', 'README.md', 'settings', 'tools', 'tsconfig.json',
    ...generatedDirectories,
]);
const requiredIgnoreRules = [
    '/library/', '/temp/', '/local/', '/build/', '/profiles/', '/node_modules/',
];

let failed = false;
for (const entry of fs.readdirSync(projectRoot, { withFileTypes: true })) {
    if (!allowedTopLevel.has(entry.name)) {
        failed = true;
        console.error(`Unexpected top-level delivery entry: ${entry.name}`);
    }
}
for (const directory of forbiddenDirectories) {
    if (fs.existsSync(path.join(projectRoot, directory))) {
        failed = true;
        console.error(`Forbidden delivery directory: ${directory}`);
    }
}

function inspect(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
        const fullPath = path.join(directory, entry.name);
        const relativePath = path.relative(projectRoot, fullPath);
        if (entry.isDirectory()) {
            if (directory === projectRoot && generatedDirectories.has(entry.name)) continue;
            inspect(fullPath);
            continue;
        }
        const extension = path.extname(entry.name).toLowerCase();
        if (forbiddenExtensions.has(extension) || forbiddenNamePatterns.some((pattern) => pattern.test(entry.name))) {
            failed = true;
            console.error(`Temporary or backup file in delivery: ${relativePath}`);
        }
    }
}

inspect(projectRoot);

const gitignoreRules = new Set(
    fs.readFileSync(path.join(projectRoot, '.gitignore'), 'utf8')
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line.length > 0 && !line.startsWith('#')),
);
for (const rule of requiredIgnoreRules) {
    if (gitignoreRules.has(rule)) continue;
    failed = true;
    console.error(`Missing required Cocos cache ignore rule: ${rule}`);
}

const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8'));
if (packageJson.name !== 'duxiachuan-qv1-3') {
    failed = true;
    console.error(`package.json name must be duxiachuan-qv1-3, got ${packageJson.name}`);
}
if (packageJson.creator?.version !== '3.8.8') {
    failed = true;
    console.error(`Cocos Creator version must be 3.8.8, got ${packageJson.creator?.version || 'missing'}`);
}

if (failed) process.exit(1);
console.log('Project hygiene OK (generated Cocos workspace directories are ignored)');
