import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const scenePath = path.join(projectRoot, 'assets', 'Scene', 'MainScene.scene');
const manifestPath = path.join(
    projectRoot,
    'assets',
    'Script',
    'UI',
    'Home',
    'HomeUIPrefabManifest.ts',
);
const bundleRoot = path.join(projectRoot, 'assets', 'Bundle', 'UIHome');
const shouldWrite = process.argv.includes('--write');

function readManifest() {
    const source = fs.readFileSync(manifestPath, 'utf8');
    const pattern = /\{\s*rootName:\s*'([^']+)',\s*layer:\s*'(page|popup)',\s*path:\s*'([^']+)'\s*\}/g;
    const definitions = [];
    for (const match of source.matchAll(pattern)) {
        definitions.push({
            rootName: match[1],
            layer: match[2],
            assetPath: match[3],
        });
    }
    if (definitions.length !== 31) {
        throw new Error(`Expected 31 home UI prefab definitions, found ${definitions.length}.`);
    }
    return definitions;
}

function clone(value) {
    return JSON.parse(JSON.stringify(value));
}

function visitIdReferences(value, callback, propertyPath = '') {
    if (!value || typeof value !== 'object') return;
    if (Number.isInteger(value.__id__)) {
        callback(value.__id__, propertyPath);
        return;
    }
    if (Array.isArray(value)) {
        value.forEach((child, index) => visitIdReferences(child, callback, `${propertyPath}[${index}]`));
        return;
    }
    for (const [key, child] of Object.entries(value)) {
        visitIdReferences(child, callback, propertyPath ? `${propertyPath}.${key}` : key);
    }
}

function remapIdReferences(value, idMap, context) {
    if (!value || typeof value !== 'object') return;
    if (Number.isInteger(value.__id__)) {
        const mappedId = idMap.get(value.__id__);
        if (!Number.isInteger(mappedId)) {
            throw new Error(`${context}: unresolved object reference ${value.__id__}.`);
        }
        value.__id__ = mappedId;
        return;
    }
    if (Array.isArray(value)) {
        value.forEach((child) => remapIdReferences(child, idMap, context));
        return;
    }
    Object.values(value).forEach((child) => remapIdReferences(child, idMap, context));
}

function getNodeIds(scene) {
    const ids = [];
    scene.forEach((entry, index) => {
        if (entry?.__type__ === 'cc.Node') ids.push(index);
    });
    return ids;
}

function getDirectChildIds(scene, parentId) {
    return (scene[parentId]?._children || []).map((reference) => reference.__id__);
}

function collectNodeSubtree(scene, rootId) {
    const nodeIds = new Set();
    const visit = (nodeId) => {
        if (nodeIds.has(nodeId)) return;
        const node = scene[nodeId];
        if (node?.__type__ !== 'cc.Node') {
            throw new Error(`Expected cc.Node at object ${nodeId}.`);
        }
        nodeIds.add(nodeId);
        getDirectChildIds(scene, nodeId).forEach(visit);
    };
    visit(rootId);
    return nodeIds;
}

function collectOwnedObjects(scene, rootId, parentId) {
    const nodeIds = collectNodeSubtree(scene, rootId);
    const ownedIds = new Set(nodeIds);
    for (const nodeId of nodeIds) {
        for (const componentReference of scene[nodeId]._components || []) {
            ownedIds.add(componentReference.__id__);
        }
    }

    let changed = true;
    while (changed) {
        changed = false;
        for (const objectId of [...ownedIds]) {
            visitIdReferences(scene[objectId], (targetId) => {
                if (ownedIds.has(targetId)) return;
                if (objectId === rootId && targetId === parentId) return;
                const target = scene[targetId];
                if (!target) {
                    throw new Error(`${scene[rootId]._name}: object ${objectId} references missing object ${targetId}.`);
                }
                if (target.__type__ === 'cc.Node'
                    || target.__type__ === 'cc.Scene'
                    || target.__type__ === 'cc.SceneAsset') {
                    return;
                }
                ownedIds.add(targetId);
                changed = true;
            });
        }
    }

    const outbound = [];
    for (const objectId of ownedIds) {
        visitIdReferences(scene[objectId], (targetId, referencePath) => {
            if (ownedIds.has(targetId)) return;
            if (objectId === rootId && targetId === parentId && referencePath === '_parent') return;
            outbound.push({ objectId, referencePath, targetId });
        });
    }
    if (outbound.length > 0) {
        throw new Error(
            `${scene[rootId]._name}: prefab boundary has outbound references: ${JSON.stringify(outbound.slice(0, 8))}`,
        );
    }

    const inbound = [];
    scene.forEach((entry, objectId) => {
        if (ownedIds.has(objectId)) return;
        visitIdReferences(entry, (targetId, referencePath) => {
            if (!ownedIds.has(targetId)) return;
            if (objectId === parentId && targetId === rootId && referencePath.startsWith('_children[')) return;
            inbound.push({ objectId, referencePath, targetId });
        });
    });
    if (inbound.length > 0) {
        throw new Error(
            `${scene[rootId]._name}: prefab boundary has inbound references: ${JSON.stringify(inbound.slice(0, 8))}`,
        );
    }

    return { nodeIds, ownedIds };
}

function createFileId(seed) {
    return crypto.createHash('sha256').update(seed).digest().subarray(0, 16).toString('base64').replace(/=+$/, '');
}

function createPrefab(scene, definition, rootId, ownedIds) {
    const sortedIds = [...ownedIds].sort((left, right) => left - right);
    const idMap = new Map();
    sortedIds.forEach((oldId, index) => idMap.set(oldId, index + 1));
    const rootNewId = idMap.get(rootId);
    const prefabInfoId = sortedIds.length + 1;
    const prefab = [{
        __type__: 'cc.Prefab',
        _name: definition.rootName,
        _objFlags: 0,
        _native: '',
        data: { __id__: rootNewId },
        optimizationPolicy: 0,
        asyncLoadAssets: false,
        persistent: false,
    }];

    for (const oldId of sortedIds) {
        const entry = clone(scene[oldId]);
        if (oldId === rootId) entry._parent = null;
        remapIdReferences(entry, idMap, `${definition.rootName} object ${oldId}`);
        if (typeof entry._id === 'string') entry._id = '';
        prefab.push(entry);
    }

    const root = prefab[rootNewId];
    root._prefab = { __id__: prefabInfoId };
    prefab.push({
        __type__: 'cc.PrefabInfo',
        root: { __id__: rootNewId },
        asset: { __id__: 0 },
        fileId: createFileId(`${definition.rootName}:${scene[rootId]._id || rootId}`),
    });
    return prefab;
}

function createDirectoryMeta(uuid, isBundle = false) {
    return {
        ver: '1.2.0',
        importer: 'directory',
        imported: true,
        uuid,
        files: [],
        subMetas: {},
        userData: {
            compressionType: {},
            isRemoteBundle: {},
            isBundle,
            bundleConfigID: 'default',
            bundleName: isBundle ? 'ui-home' : '',
            priority: 1,
        },
    };
}

function createPrefabMeta(uuid, rootName) {
    return {
        ver: '1.1.50',
        importer: 'prefab',
        imported: true,
        uuid,
        files: ['.json'],
        subMetas: {},
        userData: {
            syncNodeName: rootName,
        },
    };
}

function writeJson(filePath, value) {
    fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function ensureDirectory(directory, isBundle = false) {
    fs.mkdirSync(directory, { recursive: true });
    const metaPath = `${directory}.meta`;
    if (!fs.existsSync(metaPath)) {
        writeJson(metaPath, createDirectoryMeta(crypto.randomUUID(), isBundle));
    }
}

function validateSceneReferences(scene) {
    scene.forEach((entry, objectId) => {
        visitIdReferences(entry, (targetId) => {
            if (!scene[targetId]) {
                throw new Error(`Rewritten scene object ${objectId} references missing object ${targetId}.`);
            }
        });
    });
}

const definitions = readManifest();
const scene = JSON.parse(fs.readFileSync(scenePath, 'utf8'));
const nodeIds = getNodeIds(scene);
const nodeByName = new Map();
for (const nodeId of nodeIds) {
    const list = nodeByName.get(scene[nodeId]._name) || [];
    list.push(nodeId);
    nodeByName.set(scene[nodeId]._name, list);
}

const pageLayerId = nodeByName.get('PageLayer')?.[0];
const popupLayerId = nodeByName.get('PopupLayer')?.[0];
if (!Number.isInteger(pageLayerId) || !Number.isInteger(popupLayerId)) {
    throw new Error('MainScene is missing PageLayer or PopupLayer.');
}

const expectedChildren = {
    page: definitions.filter((definition) => definition.layer === 'page').map((definition) => definition.rootName),
    popup: definitions.filter((definition) => definition.layer === 'popup').map((definition) => definition.rootName),
};
const layerIds = { page: pageLayerId, popup: popupLayerId };
const currentChildren = {
    page: getDirectChildIds(scene, pageLayerId).map((nodeId) => scene[nodeId]._name),
    popup: getDirectChildIds(scene, popupLayerId).map((nodeId) => scene[nodeId]._name),
};

const alreadyExtracted = currentChildren.page.length === 0 && currentChildren.popup.length === 0;
if (alreadyExtracted) {
    const missingPrefabs = definitions.filter((definition) => {
        const prefabPath = path.join(bundleRoot, `${definition.assetPath}.prefab`);
        return !fs.existsSync(prefabPath) || !fs.existsSync(`${prefabPath}.meta`);
    });
    if (missingPrefabs.length > 0) {
        throw new Error(`Scene is already stripped but ${missingPrefabs.length} prefab asset(s) are missing.`);
    }
    console.log('MainScene is already a shell and all 31 home UI prefabs exist.');
    process.exit(0);
}

for (const layer of ['page', 'popup']) {
    const actual = currentChildren[layer];
    const expected = expectedChildren[layer];
    if (actual.length !== expected.length || expected.some((name, index) => actual[index] !== name)) {
        throw new Error(
            `${layer} layer order differs from HomeUIPrefabManifest.\n`
            + `Expected: ${expected.join(' > ')}\nActual: ${actual.join(' > ')}`,
        );
    }
}

const extractions = [];
const allRemovedIds = new Set();
for (const definition of definitions) {
    const parentId = layerIds[definition.layer];
    const rootId = getDirectChildIds(scene, parentId)
        .find((nodeId) => scene[nodeId]._name === definition.rootName);
    if (!Number.isInteger(rootId)) {
        throw new Error(`Missing direct ${definition.layer} child "${definition.rootName}".`);
    }
    const boundary = collectOwnedObjects(scene, rootId, parentId);
    for (const objectId of boundary.ownedIds) {
        if (allRemovedIds.has(objectId)) {
            throw new Error(`${definition.rootName}: object ${objectId} overlaps another prefab boundary.`);
        }
        allRemovedIds.add(objectId);
    }
    extractions.push({
        ...definition,
        rootId,
        parentId,
        ...boundary,
        prefab: createPrefab(scene, definition, rootId, boundary.ownedIds),
    });
}

const extractedNodeCount = extractions.reduce((total, extraction) => total + extraction.nodeIds.size, 0);
if (nodeIds.length !== 1747 || extractedNodeCount !== 1653) {
    throw new Error(
        `Extraction guard failed: expected 1747 scene nodes / 1653 feature nodes, `
        + `found ${nodeIds.length} / ${extractedNodeCount}. Re-audit before writing.`,
    );
}

const strippedScene = clone(scene);
strippedScene[pageLayerId]._children = [];
strippedScene[popupLayerId]._children = [];
const remainingOldIds = strippedScene
    .map((_, index) => index)
    .filter((oldId) => !allRemovedIds.has(oldId));
const sceneIdMap = new Map();
remainingOldIds.forEach((oldId, newId) => sceneIdMap.set(oldId, newId));
const rewrittenScene = remainingOldIds.map((oldId) => {
    const entry = strippedScene[oldId];
    remapIdReferences(entry, sceneIdMap, `MainScene object ${oldId}`);
    return entry;
});
validateSceneReferences(rewrittenScene);

const remainingNodeCount = getNodeIds(rewrittenScene).length;
if (remainingNodeCount !== 94) {
    throw new Error(`Expected a 94-node shell scene, found ${remainingNodeCount} nodes.`);
}

for (const extraction of extractions) {
    const relativePath = path.relative(
        projectRoot,
        path.join(bundleRoot, `${extraction.assetPath}.prefab`),
    );
    console.log(
        `[${shouldWrite ? 'EXTRACT' : 'READY'}] ${extraction.rootName}: `
        + `${extraction.nodeIds.size} nodes, ${extraction.ownedIds.size} objects -> ${relativePath}`,
    );
}
console.log(
    `MainScene: ${nodeIds.length} -> ${remainingNodeCount} nodes; `
    + `${scene.length} -> ${rewrittenScene.length} serialized objects.`,
);

if (!shouldWrite) {
    console.log('Dry run complete. Re-run with --write after reviewing every boundary above.');
    process.exit(0);
}

for (const extraction of extractions) {
    const prefabPath = path.join(bundleRoot, `${extraction.assetPath}.prefab`);
    if (fs.existsSync(prefabPath) || fs.existsSync(`${prefabPath}.meta`)) {
        throw new Error(`Refusing to overwrite existing prefab asset: ${path.relative(projectRoot, prefabPath)}`);
    }
}

ensureDirectory(path.join(projectRoot, 'assets', 'Bundle'));
ensureDirectory(bundleRoot, true);
ensureDirectory(path.join(bundleRoot, 'Prefabs'));
ensureDirectory(path.join(bundleRoot, 'Prefabs', 'Page'));
ensureDirectory(path.join(bundleRoot, 'Prefabs', 'Popup'));

for (const extraction of extractions) {
    const prefabPath = path.join(bundleRoot, `${extraction.assetPath}.prefab`);
    writeJson(prefabPath, extraction.prefab);
    writeJson(`${prefabPath}.meta`, createPrefabMeta(crypto.randomUUID(), extraction.rootName));
}
writeJson(scenePath, rewrittenScene);
console.log('Extracted 31 prefabs and rewrote MainScene as a 94-node shell.');
