import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const shouldWrite = process.argv.includes('--write');

const spriteImages = [
    'assets/Res/Texture/UI/Role/role_advance_exp_bar_bg.png',
    'assets/Res/Texture/UI/Role/role_advance_exp_bar_fill.png',
    'assets/Res/Texture/UI/Bag/ItemFrames/item_frame_lv2.png',
    'assets/Res/Texture/UI/Bag/ItemFrames/item_frame_lv3.png',
    'assets/Res/Texture/UI/Bag/ItemFrames/item_frame_lv4.png',
    'assets/Res/Texture/UI/Bag/ItemFrames/item_frame_lv5.png',
    'assets/Res/Texture/UI/Market/market_mode_trade_active.png',
    'assets/Res/Texture/UI/Market/market_mode_request.png',
];

function readPngSize(filePath) {
    const png = fs.readFileSync(filePath);
    const signature = png.subarray(0, 8).toString('hex');
    if (signature !== '89504e470d0a1a0a' || png.subarray(12, 16).toString('ascii') !== 'IHDR') {
        throw new Error(`Not a supported PNG: ${path.relative(projectRoot, filePath)}`);
    }
    return {
        width: png.readUInt32BE(16),
        height: png.readUInt32BE(20),
    };
}

function createSpriteFrameMeta(meta, displayName, width, height) {
    const halfWidth = width / 2;
    const halfHeight = height / 2;
    const uuid = `${meta.uuid}@f9941`;

    return {
        importer: 'sprite-frame',
        uuid,
        displayName,
        id: 'f9941',
        name: 'spriteFrame',
        userData: {
            width,
            height,
            rawWidth: width,
            rawHeight: height,
            trimType: 'none',
            trimThreshold: 1,
            rotated: false,
            offsetX: 0,
            offsetY: 0,
            isUuid: true,
            imageUuidOrDatabaseUri: `${meta.uuid}@6c48a`,
            packable: true,
            pixelsToUnit: 100,
            pivotX: 0.5,
            pivotY: 0.5,
            trimX: 0,
            trimY: 0,
            borderTop: 0,
            borderBottom: 0,
            borderLeft: 0,
            borderRight: 0,
            meshType: 0,
            vertices: {
                rawPosition: [
                    -halfWidth, -halfHeight, 0,
                    halfWidth, -halfHeight, 0,
                    -halfWidth, halfHeight, 0,
                    halfWidth, halfHeight, 0,
                ],
                indexes: [0, 1, 2, 2, 1, 3],
                uv: [0, height, width, height, 0, 0, width, 0],
                nuv: [0, 0, 1, 0, 0, 1, 1, 1],
                minPos: [-halfWidth, -halfHeight, 0],
                maxPos: [halfWidth, halfHeight, 0],
            },
            atlasUuid: '',
        },
        ver: '1.0.12',
        imported: true,
        files: ['.json'],
        subMetas: {},
    };
}

let changedCount = 0;

for (const relativeImagePath of spriteImages) {
    const imagePath = path.join(projectRoot, relativeImagePath);
    const metaPath = `${imagePath}.meta`;
    const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
    const { width, height } = readPngSize(imagePath);
    const displayName = path.basename(imagePath, path.extname(imagePath));
    const expected = createSpriteFrameMeta(meta, displayName, width, height);
    const current = meta.subMetas?.f9941;
    const isValid = meta.userData?.type === 'sprite-frame'
        && current?.uuid === expected.uuid
        && current?.userData?.width === width
        && current?.userData?.height === height
        && current?.userData?.imageUuidOrDatabaseUri === `${meta.uuid}@6c48a`;

    if (isValid) {
        console.log(`[OK] ${relativeImagePath} (${width}x${height})`);
        continue;
    }

    changedCount += 1;
    console.log(`[${shouldWrite ? 'FIX' : 'NEEDS_FIX'}] ${relativeImagePath} (${width}x${height})`);
    if (shouldWrite) {
        meta.subMetas ??= {};
        meta.subMetas.f9941 = expected;
        meta.userData ??= {};
        meta.userData.type = 'sprite-frame';
        meta.userData.redirect = `${meta.uuid}@6c48a`;
        fs.writeFileSync(metaPath, `${JSON.stringify(meta, null, 2)}\n`);
    }
}

if (changedCount > 0 && !shouldWrite) {
    console.error(`Found ${changedCount} SpriteFrame meta file(s) requiring repair. Run with --write.`);
    process.exitCode = 1;
} else {
    console.log(`${shouldWrite ? 'Repaired' : 'Verified'} ${spriteImages.length} SpriteFrame meta file(s).`);
}
