import fs from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();
const assetsRoot = path.join(projectRoot, 'assets');
const serializedAssetFiles = process.argv.length > 2
    ? process.argv.slice(2).map((file) => path.resolve(file))
    : collectFiles(assetsRoot, (file) => file.endsWith('.scene') || file.endsWith('.prefab'));

function collectFiles(directory, predicate, output = []) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
        const fullPath = path.join(directory, entry.name);
        if (entry.isDirectory()) {
            collectFiles(fullPath, predicate, output);
        } else if (predicate(fullPath)) {
            output.push(fullPath);
        }
    }
    return output;
}

function collectKnownUuids() {
    const exact = new Set();
    const base = new Set();
    const metaFiles = collectFiles(assetsRoot, (file) => file.endsWith('.meta'));
    for (const metaFile of metaFiles) {
        try {
            const meta = JSON.parse(fs.readFileSync(metaFile, 'utf8'));
            const stack = [meta];
            while (stack.length > 0) {
                const value = stack.pop();
                if (!value || typeof value !== 'object') continue;
                if (typeof value.uuid === 'string') {
                    exact.add(value.uuid);
                    base.add(value.uuid.split('@')[0]);
                }
                for (const child of Object.values(value)) {
                    if (child && typeof child === 'object') stack.push(child);
                }
            }
        } catch (error) {
            console.warn(`Skip invalid meta: ${path.relative(projectRoot, metaFile)}`, error);
        }
    }
    return { exact, base };
}

function collectSceneUuids(value, output = []) {
    if (!value || typeof value !== 'object') return output;
    if (typeof value.__uuid__ === 'string') output.push(value.__uuid__);
    for (const child of Object.values(value)) {
        if (child && typeof child === 'object') collectSceneUuids(child, output);
    }
    return output;
}

function collectDuplicateSceneObjectIds(scene) {
    const ids = new Map();
    scene.forEach((entry, index) => {
        if (!entry || typeof entry._id !== 'string' || entry._id.length === 0) return;

        const list = ids.get(entry._id) || [];
        list.push({ index, type: entry.__type__ || 'unknown', name: entry._name || '' });
        ids.set(entry._id, list);
    });

    return [...ids.entries()].filter(([, entries]) => entries.length > 1);
}

function collectDuplicatePrefabFileIds(scene) {
    const ids = new Map();
    scene.forEach((entry, index) => {
        if (!entry || typeof entry.fileId !== 'string' || entry.fileId.length === 0) return;

        const list = ids.get(entry.fileId) || [];
        list.push({ index, type: entry.__type__ || 'unknown' });
        ids.set(entry.fileId, list);
    });

    return [...ids.entries()].filter(([, entries]) => entries.length > 1);
}

const knownUuids = collectKnownUuids();
let failed = false;

for (const serializedAssetFile of serializedAssetFiles) {
    const scene = JSON.parse(fs.readFileSync(serializedAssetFile, 'utf8'));
    const unresolved = new Map();
    for (const uuid of collectSceneUuids(scene)) {
        if (knownUuids.exact.has(uuid)) continue;
        const current = unresolved.get(uuid) || {
            count: 0,
            baseAssetExists: knownUuids.base.has(uuid.split('@')[0]),
        };
        current.count += 1;
        unresolved.set(uuid, current);
    }

    const relativePath = path.relative(projectRoot, serializedAssetFile);
    const duplicateIds = collectDuplicateSceneObjectIds(scene);
    const duplicateFileIds = collectDuplicatePrefabFileIds(scene);

    if (unresolved.size === 0 && duplicateIds.length === 0 && duplicateFileIds.length === 0) {
        console.log(`${relativePath}: OK`);
        continue;
    }

    failed = true;
    if (unresolved.size > 0) {
        console.error(`${relativePath}: unresolved asset or subasset references`);
        for (const [uuid, detail] of unresolved) {
            const reason = detail.baseAssetExists
                ? 'base asset exists, referenced subasset is missing'
                : 'base asset is missing';
            console.error(`  ${detail.count} x ${uuid} (${reason})`);
        }
    }
    if (duplicateIds.length > 0) {
        console.error(`${relativePath}: duplicate scene object _id values`);
        for (const [id, entries] of duplicateIds) {
            const locations = entries
                .map((entry) => `${entry.index}:${entry.type}:${entry.name}`)
                .join(', ');
            console.error(`  ${id}: ${locations}`);
        }
    }
    if (duplicateFileIds.length > 0) {
        console.error(`${relativePath}: duplicate prefab fileId values`);
        for (const [id, entries] of duplicateFileIds) {
            const locations = entries
                .map((entry) => `${entry.index}:${entry.type}`)
                .join(', ');
            console.error(`  ${id}: ${locations}`);
        }
    }
}

if (failed) process.exitCode = 1;
