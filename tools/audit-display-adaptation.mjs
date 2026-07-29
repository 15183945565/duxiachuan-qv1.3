import fs from 'node:fs';
import path from 'node:path';

const projectRoot = path.resolve(import.meta.dirname, '..');
const DESIGN_WIDTH = 750;
const DESIGN_HEIGHT = 1624;
const EXPECTED_CANVAS_POSITION = {
    x: DESIGN_WIDTH / 2,
    y: DESIGN_HEIGHT / 2,
};
const scenePaths = [
    'assets/Scene/LoadingScene.scene',
    'assets/Scene/MainScene.scene',
];

let failed = false;
const fail = (message) => {
    failed = true;
    console.error(`Display adaptation audit failed: ${message}`);
};
const read = (relativePath) => fs.readFileSync(path.join(projectRoot, relativePath), 'utf8');

const projectSettings = JSON.parse(read('settings/v2/packages/project.json'));
const resolution = projectSettings.general?.designResolution;
if (
    resolution?.width !== DESIGN_WIDTH
    || resolution?.height !== DESIGN_HEIGHT
    || resolution?.fitWidth !== true
    || resolution?.fitHeight !== false
) {
    fail(
        'project designResolution must be '
        + `${DESIGN_WIDTH}x${DESIGN_HEIGHT}, fitWidth=true, fitHeight=false`,
    );
}

for (const scenePath of scenePaths) {
    const scene = JSON.parse(read(scenePath));
    const canvasComponent = scene.find((entry) => entry?.__type__ === 'cc.Canvas');
    if (!canvasComponent) {
        fail(`${scenePath} is missing cc.Canvas`);
        continue;
    }

    const canvasNode = scene[canvasComponent.node?.__id__];
    const canvasTransform = (canvasNode?._components || [])
        .map((componentRef) => scene[componentRef.__id__])
        .find((component) => component?.__type__ === 'cc.UITransform');
    const canvasWidget = (canvasNode?._components || [])
        .map((componentRef) => scene[componentRef.__id__])
        .find((component) => component?.__type__ === 'cc.Widget');

    if (
        canvasTransform?._contentSize?.width !== DESIGN_WIDTH
        || canvasTransform?._contentSize?.height !== DESIGN_HEIGHT
    ) {
        fail(`${scenePath} Canvas UITransform must be ${DESIGN_WIDTH}x${DESIGN_HEIGHT}`);
    }
    if (
        canvasNode?._lpos?.x !== EXPECTED_CANVAS_POSITION.x
        || canvasNode?._lpos?.y !== EXPECTED_CANVAS_POSITION.y
    ) {
        fail(
            `${scenePath} Canvas editor position must be `
            + `${EXPECTED_CANVAS_POSITION.x},${EXPECTED_CANVAS_POSITION.y}`,
        );
    }
    if (canvasComponent._alignCanvasWithScreen !== true) {
        fail(`${scenePath} Canvas must align with the screen`);
    }
    if (!canvasWidget || canvasWidget._enabled === false || canvasWidget._alignFlags !== 45) {
        fail(`${scenePath} Canvas must keep its full-stretch Widget`);
    }
}

const adapterSource = read('assets/Script/Services/DisplayAdapter.ts');
for (const guard of [
    `DESIGN_WIDTH = ${DESIGN_WIDTH}`,
    `DESIGN_HEIGHT = ${DESIGN_HEIGHT}`,
    'ResolutionPolicy.FIXED_WIDTH',
    'view.setDesignResolutionSize(',
]) {
    if (!adapterSource.includes(guard)) {
        fail(`DisplayAdapter is missing guard: ${guard}`);
    }
}

const bootSource = read('assets/Script/UI/Boot/BootLoadingView.ts');
const bootApplyIndex = bootSource.indexOf('DisplayAdapter.apply();');
const bootRuntimeIndex = bootSource.indexOf('BackendRuntime.initialize();');
if (bootApplyIndex < 0 || bootRuntimeIndex < 0 || bootApplyIndex > bootRuntimeIndex) {
    fail('BootLoadingView must apply display adaptation before boot services and UI setup');
}
if ((bootSource.match(/DisplayAdapter\.apply\(\);/g) || []).length < 3) {
    fail('BootLoadingView must re-apply adaptation on window and orientation changes');
}

const mainSource = read('assets/Script/UI/Home/MainHomeView.ts');
const mainApplyIndex = mainSource.indexOf('DisplayAdapter.apply();');
const mainFeatureIndex = mainSource.indexOf('RoleBagFeature.initialize(this);');
if (mainApplyIndex < 0 || mainFeatureIndex < 0 || mainApplyIndex > mainFeatureIndex) {
    fail('MainHomeView must apply display adaptation before feature initialization');
}
for (const guard of [
    "screen.on('window-resize', this.onDisplayChanged, this);",
    "screen.on('orientation-change', this.onDisplayChanged, this);",
    "screen.off('window-resize', this.onDisplayChanged, this);",
    "screen.off('orientation-change', this.onDisplayChanged, this);",
]) {
    if (!mainSource.includes(guard)) {
        fail(`MainHomeView is missing lifecycle guard: ${guard}`);
    }
}

if (failed) process.exit(1);
console.log(
    'Display adaptation OK '
    + `(${DESIGN_WIDTH}x${DESIGN_HEIGHT}; FIXED_WIDTH; `
    + `${scenePaths.length} aligned Canvases; boot/main runtime guards)`,
);
