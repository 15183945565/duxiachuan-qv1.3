import fs from 'node:fs';
import path from 'node:path';

const projectRoot = path.resolve(import.meta.dirname, '..');
const bundleRoot = path.join(projectRoot, 'assets', 'Bundle');
const targetPrefabs = [
    path.join(bundleRoot, 'UIHome', 'Prefabs', 'Page', 'BottomFeaturePanel.prefab'),
];
const shouldWrite = process.argv.includes('--write');

function walk(directory, predicate, output = []) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
        const fullPath = path.join(directory, entry.name);
        if (entry.isDirectory()) {
            walk(fullPath, predicate, output);
        } else if (predicate(fullPath)) {
            output.push(fullPath);
        }
    }
    return output;
}

function collectUuidBases(value, output) {
    if (!value || typeof value !== 'object') return;
    if (typeof value.uuid === 'string') output.add(value.uuid.split('@')[0]);
    Object.values(value).forEach((child) => collectUuidBases(child, output));
}

function collectFeatureAssetUuidBases() {
    const output = new Set();
    for (const entry of fs.readdirSync(bundleRoot, { withFileTypes: true })) {
        if (!entry.isDirectory() || !entry.name.startsWith('Feature')) continue;
        const directory = path.join(bundleRoot, entry.name);
        for (const metaPath of walk(directory, (file) => file.endsWith('.meta'))) {
            collectUuidBases(JSON.parse(fs.readFileSync(metaPath, 'utf8')), output);
        }
    }
    return output;
}

function stripFeatureReferences(value, featureUuidBases, removed) {
    if (!value || typeof value !== 'object') return;
    const entries = Array.isArray(value)
        ? value.map((child, index) => [index, child])
        : Object.entries(value);
    for (const [key, child] of entries) {
        if (!child || typeof child !== 'object') continue;
        if (
            typeof child.__uuid__ === 'string'
            && featureUuidBases.has(child.__uuid__.split('@')[0])
        ) {
            removed.push(child.__uuid__);
            value[key] = null;
            continue;
        }
        stripFeatureReferences(child, featureUuidBases, removed);
    }
}

const featureUuidBases = collectFeatureAssetUuidBases();
for (const prefabPath of targetPrefabs) {
    const prefab = JSON.parse(fs.readFileSync(prefabPath, 'utf8'));
    const removed = [];
    stripFeatureReferences(prefab, featureUuidBases, removed);
    console.log(
        `${shouldWrite ? 'STRIP' : 'FOUND'} ${path.relative(projectRoot, prefabPath)}: `
        + `${removed.length} feature asset reference(s), ${new Set(removed).size} unique`,
    );
    if (shouldWrite && removed.length > 0) {
        fs.writeFileSync(prefabPath, `${JSON.stringify(prefab, null, 2)}\n`);
    }
}

if (!shouldWrite) {
    console.log('Dry run complete. Re-run with --write to clear these runtime-loaded references.');
}
