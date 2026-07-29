import fs from 'node:fs';
import path from 'node:path';

const projectRoot = path.resolve(import.meta.dirname, '..');
const scriptRoot = path.join(projectRoot, 'assets', 'Script');

function collectTypeScript(directory, output = []) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
        const fullPath = path.join(directory, entry.name);
        if (entry.isDirectory()) collectTypeScript(fullPath, output);
        else if (entry.name.endsWith('.ts')) output.push(fullPath);
    }
    return output;
}

const files = collectTypeScript(scriptRoot);
let failed = false;

for (const file of files) {
    if (!fs.existsSync(`${file}.meta`)) {
        failed = true;
        console.error(`TypeScript meta missing: ${path.relative(projectRoot, file)}`);
    }
    const source = fs.readFileSync(file, 'utf8');
    if (/\bLabelOutline\b/.test(source)) {
        failed = true;
        console.error(
            `Deprecated LabelOutline component usage in ${path.relative(projectRoot, file)}; `
            + 'use Label.enableOutline/outlineColor/outlineWidth instead',
        );
    }
    for (const match of source.matchAll(/(?:from\s+|import\s*\()(['"])([^'"]+)\1/g)) {
        const importPath = match[2];
        if (!importPath.startsWith('.')) continue;
        const absoluteBase = path.resolve(path.dirname(file), importPath);
        const candidates = [`${absoluteBase}.ts`, path.join(absoluteBase, 'index.ts')];
        if (!candidates.some((candidate) => fs.existsSync(candidate))) {
            failed = true;
            console.error(`Broken relative import in ${path.relative(projectRoot, file)}: ${importPath}`);
        }
    }
}

const homeConfigPath = path.join(scriptRoot, 'UI', 'Home', 'HomeConfig.ts');
const homeConfig = fs.readFileSync(homeConfigPath, 'utf8');
const exportedConfigNames = new Set(
    [...homeConfig.matchAll(/export\s+const\s+([A-Z][A-Z0-9_]*)/g)].map((match) => match[1]),
);
const missingConfigNames = new Set();
for (const file of files) {
    if (file === homeConfigPath) continue;
    const source = fs.readFileSync(file, 'utf8');
    for (const match of source.matchAll(/HomeConfig\.([A-Z][A-Z0-9_]*)/g)) {
        if (!exportedConfigNames.has(match[1])) missingConfigNames.add(match[1]);
    }
}
if (missingConfigNames.size > 0) {
    failed = true;
    console.error(`Missing HomeConfig exports: ${[...missingConfigNames].sort().join(', ')}`);
}

const bootLoadingPath = path.join(scriptRoot, 'UI', 'Boot', 'BootLoadingView.ts');
const bootLoadingSource = fs.readFileSync(bootLoadingPath, 'utf8');
const bootEditorOwnershipViolations = [
    'view.getVisibleSize()',
    'sys.getSafeAreaRect()',
    'layoutEnterGameButton()',
    'enterGameButtonEditorPosition',
];
for (const violation of bootEditorOwnershipViolations) {
    if (!bootLoadingSource.includes(violation)) continue;
    failed = true;
    console.error(`Boot enter-game editor ownership violated: ${violation}`);
}

const editorOwnedUiModules = [
    path.join(scriptRoot, 'UI', 'Home', 'HomeProfileDaoYouPanel.ts'),
    path.join(scriptRoot, 'UI', 'Home', 'HomeShareTaskPanel.ts'),
];
for (const file of editorOwnedUiModules) {
    const source = fs.readFileSync(file, 'utf8');
    const relativePath = path.relative(projectRoot, file);
    if (!source.includes("from './HomeEditorLayout'")) {
        failed = true;
        console.error(`Editor-owned UI layout helper missing: ${relativePath}`);
    }
    if (source.includes('setNodeLayout(')) {
        failed = true;
        console.error(`Editor-owned UI layout must not reset static position/size: ${relativePath}`);
    }
    if (!source.includes('ensureStyledLabel(') || !source.includes('needsFallbackSprite(')) {
        failed = true;
        console.error(`Editor-owned UI fallback guards missing: ${relativePath}`);
    }
}

if (failed) process.exit(1);
console.log(`Code integrity OK (${files.length} TypeScript modules, ${exportedConfigNames.size} HomeConfig exports)`);
