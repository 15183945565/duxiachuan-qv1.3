import {
    Color,
    EventTouch,
    HorizontalTextAlignment,
    Label,
    Mask,
    Node,
    Overflow,
    Size,
    Tween,
    UIOpacity,
    UITransform,
    Vec3,
    sp,
    tween,
} from 'cc';
import * as HomeConfig from './HomeConfig';
import { HomeViewBase } from './HomeViewBase';

abstract class HomeFeatureMagicSceneHost extends HomeViewBase {
    protected abstract readonly magicSceneEntryBaseScales: Vec3[];
}

/**
 * 魔界九重场景、横向选择交互、层级入口与楼层弹窗。
 */
export abstract class HomeFeatureMagicScene extends HomeFeatureMagicSceneHost {
    protected ensureMagicScenePanel(): void {
        if (!this.bottomFeaturePanel || this.magicSceneRoot?.isValid) return;
    
        const rootInfo = this.getOrCreateBottomFeatureNode(
            this.bottomFeaturePanel,
            'MagicSceneRoot',
            HomeConfig.MAGIC_SCENE_ROOT_WIDTH,
            HomeConfig.MAGIC_SCENE_ROOT_HEIGHT,
            0,
            HomeConfig.MAGIC_SCENE_ROOT_Y,
        );
        this.magicSceneRoot = rootInfo.node;
        this.magicSceneRoot.active = false;

        this.magicSceneViewport = this.getOrCreateBottomFeatureNode(this.magicSceneRoot, 'MagicSceneViewport', HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT, 0, 0).node;
        const viewportMask = this.magicSceneViewport.getComponent(Mask) || this.magicSceneViewport.addComponent(Mask);
        viewportMask.type = Mask.Type.GRAPHICS_RECT;
        viewportMask.enabled = true;

        this.magicSceneWorld = this.getOrCreateBottomFeatureNode(this.magicSceneViewport, 'MagicSceneWorld', HomeConfig.MAGIC_SCENE_WORLD_WIDTH, HomeConfig.MAGIC_SCENE_WORLD_HEIGHT, 0, 0).node;
        const bg = this.getOrCreateBottomFeatureSkinnedNode(
            this.magicSceneWorld,
            'MagicSceneScrollBackground',
            HomeConfig.MAGIC_SCENE_WORLD_WIDTH,
            HomeConfig.MAGIC_SCENE_WORLD_HEIGHT,
            0,
            0,
            HomeConfig.UI_MAGIC_SCENE_SCROLL_BG,
        ).node;
        bg.setSiblingIndex(0);

        this.magicSceneEntryNodes.length = 0;
        this.magicSceneEntrySkeletons.length = 0;
        HomeConfig.MAGIC_SCENES.forEach((config, index) => {
            const point = this.getMagicSceneEntryPosition(index);
            const entryInfo = this.getOrCreateBottomFeatureNode(
                this.magicSceneWorld!,
                `MagicSceneEntry_${index + 1}`,
                HomeConfig.MAGIC_SCENE_ENTRY_WIDTH,
                HomeConfig.MAGIC_SCENE_ENTRY_HEIGHT,
                point.x,
                point.y,
            );
            const entry = entryInfo.node;
            entry.setSiblingIndex(4 + index);
            this.magicSceneEntryNodes[index] = entry;
            this.magicSceneEntryBaseScales[index] = entry.scale.clone();

            const visualInfo = this.getOrCreateBottomFeatureNode(entry, 'MagicSceneEntryVisual', HomeConfig.MAGIC_SCENE_ENTRY_WIDTH, HomeConfig.MAGIC_SCENE_ENTRY_HEIGHT, 0, 0);
            const visual = visualInfo.node;
            const layout = this.magicSceneLayouts[index];
            const existingSkeleton = visual.getComponent(sp.Skeleton);
            const skeleton = existingSkeleton || visual.addComponent(sp.Skeleton);
            this.prepareSkeletonRenderer(skeleton);
            if (!visualInfo.existed || !existingSkeleton) {
                visual.setPosition(layout?.x ?? config.x, layout?.y ?? config.y, 0);
                const visualScale = (layout?.scale ?? config.scale) * HomeConfig.MAGIC_SCENE_ENTRY_SPINE_SCALE_FACTOR;
                visual.setScale(visualScale, visualScale, 1);
            }
            this.setSkeletonVisible(skeleton, false);
            this.magicSceneEntrySkeletons[index] = skeleton;
            this.bindMagicSceneEntry(entry, index);
            this.bindMagicSceneEntry(visual, index);
        });

        this.magicSceneNameFrames.length = 0;
        this.magicSceneNameLabels.length = 0;
        const legacyNameFrame = this.magicSceneWorld.getChildByName('MagicSceneNameFrame');
        if (legacyNameFrame?.isValid) {
            legacyNameFrame.active = false;
        }
        this.magicSceneEntryNodes.forEach((entry, index) => {
            if (!entry?.isValid) return;
            const nameFrame = this.getOrCreateBottomFeatureSkinnedNode(
                entry,
                `MagicSceneNameFrame_${index + 1}`,
                HomeConfig.MAGIC_SCENE_NAME_FRAME_WIDTH,
                HomeConfig.MAGIC_SCENE_NAME_FRAME_HEIGHT,
                HomeConfig.MAGIC_SCENE_NAME_FRAME_OFFSET_X,
                HomeConfig.MAGIC_SCENE_NAME_FRAME_OFFSET_Y,
                HomeConfig.UI_MAGIC_SCENE_NAME_FRAME,
            ).node;
            nameFrame.setSiblingIndex(30);
            this.magicSceneNameFrames[index] = nameFrame;
            const nameLabel = this.getOrCreateBottomFeatureLabel(
                nameFrame,
                `MagicSceneNameLabel_${index + 1}`,
                this.getVerticalMagicSceneTitle(HomeConfig.MAGIC_SCENES[index]?.title || ''),
                22,
                0,
                8,
                HomeConfig.MAGIC_SCENE_NAME_LABEL_WIDTH,
                HomeConfig.MAGIC_SCENE_NAME_LABEL_HEIGHT,
                new Color(255, 229, 182, 255),
            ).label;
            nameLabel.enableWrapText = true;
            nameLabel.overflow = Overflow.SHRINK;
            this.applyBattleEntryTextStyle(nameLabel, 2);
            this.magicSceneNameLabels[index] = nameLabel;
            this.bindMagicSceneEntry(nameFrame, index);
            this.bindMagicSceneEntry(nameLabel.node, index);
        });
        this.magicSceneNameFrame = this.magicSceneNameFrames[this.magicSceneIndex] || null;
        this.magicSceneNameLabel = this.magicSceneNameLabels[this.magicSceneIndex] || null;

        this.magicPrevButton = this.getOrCreateBottomFeatureSkinnedNode(this.magicSceneRoot, 'MagicPrevButton', HomeConfig.MAGIC_SWITCH_BUTTON_WIDTH, HomeConfig.MAGIC_SWITCH_BUTTON_HEIGHT, -HomeConfig.MAGIC_SWITCH_BUTTON_X, HomeConfig.MAGIC_SWITCH_BUTTON_Y, HomeConfig.UI_MAGIC_SWITCH_LEFT).node;
        this.magicPrevButton.setSiblingIndex(10);
        this.bindScaledClick(this.magicPrevButton, () => this.switchMagicScene(-1));
    
        this.magicNextButton = this.getOrCreateBottomFeatureSkinnedNode(this.magicSceneRoot, 'MagicNextButton', HomeConfig.MAGIC_SWITCH_BUTTON_WIDTH, HomeConfig.MAGIC_SWITCH_BUTTON_HEIGHT, HomeConfig.MAGIC_SWITCH_BUTTON_X, HomeConfig.MAGIC_SWITCH_BUTTON_Y, HomeConfig.UI_MAGIC_SWITCH_RIGHT).node;
        this.magicNextButton.setSiblingIndex(10);
        this.bindScaledClick(this.magicNextButton, () => this.switchMagicScene(1));
    
        this.magicLevelFrame = this.getOrCreateBottomFeatureSkinnedNode(this.magicSceneRoot, 'MagicLevelFrame', HomeConfig.MAGIC_LEVEL_FRAME_WIDTH, HomeConfig.MAGIC_LEVEL_FRAME_HEIGHT, 0, HomeConfig.MAGIC_LEVEL_FRAME_Y, HomeConfig.UI_MAGIC_LEVEL_FRAME).node;
        this.magicLevelFrame.setSiblingIndex(11);
        this.magicLevelLabel = this.getOrCreateBottomFeatureLabel(this.magicLevelFrame, 'MagicLevelLabel', '', 26, 0, 0, 82, 42, new Color(235, 242, 255, 255)).label;
        this.magicLevelLabel.overflow = Overflow.SHRINK;
        this.applyBattleEntryTextStyle(this.magicLevelLabel, 2);

        this.magicEnterButton = this.getOrCreateBottomFeatureSkinnedNode(this.magicSceneRoot, 'MagicEnterButton', HomeConfig.MAGIC_ENTER_BUTTON_WIDTH, HomeConfig.MAGIC_ENTER_BUTTON_HEIGHT, 0, HomeConfig.MAGIC_ENTER_BUTTON_Y, HomeConfig.UI_MAGIC_ENTER_BUTTON).node;
        this.magicEnterButton.setSiblingIndex(12);
        const enterLabel = this.getOrCreateBottomFeatureLabel(this.magicEnterButton, 'MagicEnterButtonLabel', '\u8fdb\u5165', 34, 0, 1, HomeConfig.MAGIC_ENTER_BUTTON_WIDTH - 24, HomeConfig.MAGIC_ENTER_BUTTON_HEIGHT - 18, new Color(92, 56, 29, 255)).label;
        this.applyBattleEntryTextStyle(enterLabel, 2);
        this.bindScaledClick(this.magicEnterButton, () => this.openMagicFloorPanel());
        this.setupMagicSceneInput();
        this.ensureMagicSceneCloudAnimation();
    }
    protected ensureMagicSceneCloudAnimation(): void {
        const cloudLayer = this.magicSceneRoot?.getChildByName('MagicSceneCloudLayer');
        const cloudNode = cloudLayer?.getChildByName('MagicSceneCloudSpine');
        const skeleton = cloudNode?.getComponent(sp.Skeleton);
        if (!skeleton?.isValid) return;

        this.prepareSkeletonRenderer(skeleton);
        if (
            skeleton.skeletonData
            && HomeConfig.MAGIC_SCENE_CLOUD_ANIMATIONS.some((animation) => skeleton.findAnimation(animation))
        ) {
            this.playSkeletonAnimation(skeleton, HomeConfig.MAGIC_SCENE_CLOUD_ANIMATIONS, true);
            return;
        }
        // The editor Prefab may still carry a placeholder SkeletonData.
        // Clear it before asynchronously assigning the dedicated cloud asset.
        skeleton.skeletonData = null;

        const loadVersion = this.magicSceneLoadVersion;
        void this.loadSkeletonAsset(HomeConfig.MAGIC_SCENE_CLOUD_SPINE_PATH)
            .then((asset) => {
                if (loadVersion !== this.magicSceneLoadVersion) return;
                if (!this.magicSceneRoot?.active || !skeleton.isValid) return;
                this.prepareSkeletonRenderer(skeleton);
                skeleton.skeletonData = asset;
                this.playSkeletonAnimation(skeleton, HomeConfig.MAGIC_SCENE_CLOUD_ANIMATIONS, true);
            })
            .catch((err) => {
                console.warn('[MainHomeView] magic scene cloud spine load failed', err);
            });
    }
    protected setupMagicSceneInput(): void {
        if (!this.magicSceneViewport) return;
        this.magicSceneViewport.off(Node.EventType.TOUCH_START, this.onMagicSceneTouchStart, this);
        this.magicSceneViewport.off(Node.EventType.TOUCH_MOVE, this.onMagicSceneTouchMove, this);
        this.magicSceneViewport.off(Node.EventType.TOUCH_END, this.onMagicSceneTouchEnd, this);
        this.magicSceneViewport.off(Node.EventType.TOUCH_CANCEL, this.onMagicSceneTouchEnd, this);
        this.magicSceneViewport.on(Node.EventType.TOUCH_START, this.onMagicSceneTouchStart, this);
        this.magicSceneViewport.on(Node.EventType.TOUCH_MOVE, this.onMagicSceneTouchMove, this);
        this.magicSceneViewport.on(Node.EventType.TOUCH_END, this.onMagicSceneTouchEnd, this);
        this.magicSceneViewport.on(Node.EventType.TOUCH_CANCEL, this.onMagicSceneTouchEnd, this);
    }
    protected onMagicSceneTouchStart(event: EventTouch): void {
        if (!this.magicSceneRoot?.active || !this.magicSceneWorld?.isValid) return;
        event.propagationStopped = true;
        Tween.stopAllByTarget(this.magicSceneWorld);
        this.magicSceneTouchStartX = event.getUILocation().x;
        this.magicSceneTouchStartWorldX = this.magicSceneWorld.position.x;
        this.magicSceneTouchTravel = 0;
        this.magicSceneDragging = false;
    }
    protected onMagicSceneTouchMove(event: EventTouch): void {
        if (!this.magicSceneRoot?.active || !this.magicSceneWorld?.isValid) return;
        event.propagationStopped = true;
        const delta = event.getUILocation().x - this.magicSceneTouchStartX;
        this.magicSceneTouchTravel += Math.hypot(event.getUIDelta().x, event.getUIDelta().y);
        this.magicSceneDragging = this.magicSceneTouchTravel >= HomeConfig.MAGIC_SCENE_DRAG_THRESHOLD;
        this.setMagicSceneWorldX(this.magicSceneTouchStartWorldX + delta, false);
    }
    protected onMagicSceneTouchEnd(event: EventTouch): void {
        if (!this.magicSceneRoot?.active || !this.magicSceneWorld?.isValid) return;
        event.propagationStopped = true;
        const travel = Math.abs(event.getUILocation().x - this.magicSceneTouchStartX);
        if (this.magicSceneDragging || travel >= HomeConfig.MAGIC_SCENE_DRAG_THRESHOLD) {
            this.snapMagicSceneToNearestEntry();
        }
        this.magicSceneDragging = false;
    }
    protected bindMagicSceneEntry(entry: Node, index: number): void {
        entry.off(Node.EventType.TOUCH_END);
        entry.off(Node.EventType.TOUCH_CANCEL);
        entry.on(Node.EventType.TOUCH_END, (event: EventTouch) => {
            event.propagationStopped = true;
            const travel = Math.abs(event.getUILocation().x - this.magicSceneTouchStartX);
            if (this.magicSceneDragging || travel >= HomeConfig.MAGIC_SCENE_DRAG_THRESHOLD) {
                this.snapMagicSceneToNearestEntry();
                return;
            }
            this.selectMagicScene(index, true);
        }, this);
        entry.on(Node.EventType.TOUCH_CANCEL, (event: EventTouch) => {
            event.propagationStopped = true;
            if (this.magicSceneDragging) {
                this.snapMagicSceneToNearestEntry();
            }
            this.magicSceneDragging = false;
        }, this);
    }
    protected snapMagicSceneToNearestEntry(): void {
        if (!this.magicSceneRoot?.active || !this.magicSceneWorld?.isValid) return;

        this.magicSceneIndex = this.getNearestMagicSceneEntryIndex();
        this.refreshMagicScene(true);
        this.magicSceneTouchStartWorldX = this.magicSceneWorld.position.x;
        this.magicSceneDragging = false;
    }
    protected selectMagicScene(index: number, animate: boolean): void {
        const nextIndex = this.clamp(index, 0, HomeConfig.MAGIC_SCENES.length - 1);
        const reselecting = nextIndex === this.magicSceneIndex;
        if (nextIndex !== this.magicSceneIndex) {
            this.closeMagicFloorPanel();
        }
        this.magicSceneIndex = nextIndex;
        this.refreshMagicScene(animate);
        if (reselecting) {
            this.playMagicSceneEntryTapFeedback(nextIndex);
        }
    }
    protected playMagicSceneEntryTapFeedback(index: number): void {
        const entry = this.magicSceneEntryNodes[index];
        if (!entry?.isValid) return;
        const baseScale = this.magicSceneEntryBaseScales[index] || new Vec3(1, 1, 1);
        const selectedScale = index === this.magicSceneIndex ? HomeConfig.MAGIC_SCENE_SELECTED_ENTRY_SCALE : 1;
        const normalScale = new Vec3(baseScale.x * selectedScale, baseScale.y * selectedScale, baseScale.z);
        const pulseScale = new Vec3(normalScale.x * 1.08, normalScale.y * 1.08, normalScale.z);
        Tween.stopAllByTarget(entry);
        entry.setScale(normalScale);
        tween(entry)
            .to(0.08, { scale: pulseScale }, { easing: 'sineOut' })
            .to(0.12, { scale: normalScale }, { easing: 'sineOut' })
            .start();
    }
    protected getNearestMagicSceneEntryIndex(): number {
        if (!this.magicSceneWorld?.isValid) return this.magicSceneIndex;
        const centerInWorld = -this.magicSceneWorld.position.x;
        let nearestIndex = this.magicSceneIndex;
        let nearestDistance = Number.POSITIVE_INFINITY;
        this.magicSceneEntryNodes.forEach((entry, index) => {
            if (!entry?.isValid) return;
            const distance = Math.abs(entry.position.x - centerInWorld);
            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearestIndex = index;
            }
        });
        return nearestIndex;
    }
    protected getMagicSceneEntryPosition(index: number): Vec3 {
        const point = HomeConfig.MAGIC_SCENE_ENTRY_POINTS[index] || HomeConfig.MAGIC_SCENE_ENTRY_POINTS[0];
        return new Vec3(
            (point.sourceX / HomeConfig.MAGIC_SCENE_BG_SOURCE_WIDTH - 0.5) * HomeConfig.MAGIC_SCENE_WORLD_WIDTH,
            (0.5 - point.sourceY / HomeConfig.MAGIC_SCENE_BG_SOURCE_HEIGHT) * HomeConfig.MAGIC_SCENE_WORLD_HEIGHT,
            0,
        );
    }
    protected setMagicSceneWorldX(x: number, animate: boolean): void {
        if (!this.magicSceneWorld?.isValid) return;
        const targetX = this.clamp(x, -HomeConfig.MAGIC_SCENE_WORLD_X_LIMIT, HomeConfig.MAGIC_SCENE_WORLD_X_LIMIT);
        Tween.stopAllByTarget(this.magicSceneWorld);
        if (!animate) {
            this.magicSceneWorld.setPosition(targetX, this.magicSceneWorld.position.y, 0);
            return;
        }
        tween(this.magicSceneWorld)
            .to(0.24, { position: new Vec3(targetX, this.magicSceneWorld.position.y, 0) }, { easing: 'sineOut' })
            .start();
    }
    protected focusMagicSceneEntry(index: number, animate: boolean): void {
        const entry = this.magicSceneEntryNodes[index];
        if (!entry?.isValid) return;
        this.setMagicSceneWorldX(-entry.position.x, animate);
    }
    protected loadMagicSceneEntrySkeletons(): void {
        const loadVersion = this.magicSceneLoadVersion;
        HomeConfig.MAGIC_SCENES.forEach((config, index) => {
            const skeleton = this.magicSceneEntrySkeletons[index];
            if (!skeleton?.isValid) return;
            if (skeleton.skeletonData) {
                this.setSkeletonVisible(skeleton, true);
                this.playSkeletonAnimation(
                    skeleton,
                    skeleton.animation
                        ? [skeleton.animation, ...HomeConfig.MAGIC_SCENE_ANIMATIONS]
                        : HomeConfig.MAGIC_SCENE_ANIMATIONS,
                    true,
                );
                return;
            }
            void this.loadSkeletonAsset(config.skelPath)
                .then((asset) => {
                    if (loadVersion !== this.magicSceneLoadVersion) return;
                    if (!this.magicSceneRoot?.active || !skeleton.isValid) return;
                    this.prepareSkeletonRenderer(skeleton);
                    skeleton.skeletonData = asset;
                    try {
                        skeleton.setSkin('default');
                    } catch {
                        // Some Spine exports only contain the implicit default skin.
                    }
                    this.setSkeletonVisible(skeleton, true);
                    this.playSkeletonAnimation(skeleton, HomeConfig.MAGIC_SCENE_ANIMATIONS, true);
                    skeleton.updateAnimation(0);
                    skeleton.markForUpdateRenderData(true);
                })
                .catch((err) => {
                    console.warn('[MainHomeView] magic scene entry spine load failed', config.skelPath, err);
                });
        });
    }
    protected refreshMagicSceneEntrySelection(): void {
        this.magicSceneEntryNodes.forEach((entry, index) => {
            if (!entry?.isValid) return;
            const baseScale = this.magicSceneEntryBaseScales[index] || new Vec3(1, 1, 1);
            const scale = index === this.magicSceneIndex ? HomeConfig.MAGIC_SCENE_SELECTED_ENTRY_SCALE : 1;
            Tween.stopAllByTarget(entry);
            entry.setScale(baseScale.x * scale, baseScale.y * scale, baseScale.z);
            entry.setSiblingIndex(index === this.magicSceneIndex ? 24 : 4 + index);
        });
        this.magicSceneNameFrames.forEach((frame, index) => {
            if (!frame?.isValid) return;
            frame.active = index === this.magicSceneIndex;
            if (frame.active) {
                frame.setSiblingIndex(30);
            }
        });
        this.magicSceneNameFrame = this.magicSceneNameFrames[this.magicSceneIndex] || null;
        this.magicSceneNameLabel = this.magicSceneNameLabels[this.magicSceneIndex] || null;
    }
    protected getVerticalMagicSceneTitle(title: string): string {
        return Array.from(title.replace('\uff1a', '')).join('\n');
    }
    protected openMagicFloorPanel(): void {
        this.ensureMagicFloorPanel();
        if (!this.magicFloorPanel?.isValid || !this.magicFloorContentRoot?.isValid) return;
    
        const config = HomeConfig.MAGIC_SCENES[this.magicSceneIndex];
        const realmName = config.title.split('\uff1a')[1] || config.title;
        if (this.magicFloorTitleLabel) {
            this.magicFloorTitleLabel.string = `${config.title}\u00b7\u5c42\u6570\u9009\u62e9`;
        }
    
        this.ensureMagicFloorRows(realmName);
    
        this.magicFloorPanel.active = true;
        this.ensureInputBlocker(this.magicFloorPanel);
        this.magicFloorPanel.setSiblingIndex((this.magicFloorPanel.parent?.children.length || 1) - 1);
        this.refreshRootLayerOrder();
        this.playMagicFloorOpenAnimation();
    }
    protected ensureMagicFloorPanel(): void {
        if (this.magicFloorPanel?.isValid) return;
    
        const popupParent = this.popupRoot || this.node;
        const editorPanel = popupParent.getChildByName('MagicFloorPanel') || this.findNode('MagicFloorPanel');
        this.magicFloorPanel = editorPanel || this.createNode('MagicFloorPanel', popupParent, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT, 0, 0);
        if (this.magicFloorPanel.parent !== popupParent) {
            this.magicFloorPanel.setParent(popupParent);
        }
        this.magicFloorPanel.active = false;
        this.drawRect(this.magicFloorPanel, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT, new Color(5, 8, 12, 178));
        this.magicFloorPanel.on(Node.EventType.TOUCH_END, (event: EventTouch) => {
            if (!this.magicFloorOpening && !this.isMagicFloorTouchInsideBoard(event)) {
                this.closeMagicFloorPanel();
            }
            event.propagationStopped = true;
        }, this);
    
        this.magicFloorBoard = this.getOrCreateBottomFeatureNode(this.magicFloorPanel, 'MagicFloorBoard', HomeConfig.MAGIC_FLOOR_BOARD_WIDTH, HomeConfig.MAGIC_FLOOR_BOARD_HEIGHT, 0, 0).node;
        this.magicFloorBoard.setSiblingIndex(4);

        this.magicFloorScrollBody = this.getOrCreateBottomFeatureSkinnedNode(
            this.magicFloorBoard,
            'MagicFloorScrollBody',
            HomeConfig.MAGIC_FLOOR_SCROLL_WIDTH,
            HomeConfig.MAGIC_FLOOR_SCROLL_HEIGHT,
            0,
            HomeConfig.MAGIC_FLOOR_SCROLL_Y,
            HomeConfig.UI_MAGIC_FLOOR_SCROLL_BG,
        ).node;
        this.magicFloorScrollBody.setSiblingIndex(0);

        const roll = this.getOrCreateBottomFeatureSkinnedNode(
            this.magicFloorBoard,
            'MagicFloorRoll',
            HomeConfig.MAGIC_FLOOR_ROLL_WIDTH,
            HomeConfig.MAGIC_FLOOR_ROLL_HEIGHT,
            0,
            HomeConfig.MAGIC_FLOOR_ROLL_Y,
            HomeConfig.UI_MAGIC_FLOOR_ROLL,
        ).node;
        roll.setSiblingIndex(8);

        this.magicFloorTitleLabel = this.getOrCreateBottomFeatureLabel(this.magicFloorBoard, 'MagicFloorTitle', '', 30, 0, HomeConfig.MAGIC_FLOOR_TITLE_Y, 460, 54, new Color(50, 31, 19, 255)).label;
        this.setMagicFloorTextEdge(this.magicFloorTitleLabel, false);

        this.magicFloorContentRoot = this.getOrCreateBottomFeatureNode(
            this.magicFloorBoard,
            'MagicFloorContentRoot',
            HomeConfig.MAGIC_FLOOR_CONTENT_WIDTH,
            HomeConfig.MAGIC_FLOOR_CONTENT_HEIGHT,
            0,
            HomeConfig.MAGIC_FLOOR_CONTENT_Y,
        ).node;
        this.magicFloorContentRoot.setSiblingIndex(5);
    }
    protected ensureMagicFloorRows(realmName: string): void {
        if (!this.magicFloorContentRoot?.isValid) return;

        HomeConfig.MAGIC_FLOOR_NAMES.forEach((floorName, floorIndex) => {
            const rowY = HomeConfig.MAGIC_FLOOR_ROW_START_Y - floorIndex * HomeConfig.MAGIC_FLOOR_ROW_GAP_Y;
            const row = this.getOrCreateBottomFeatureSkinnedNode(
                this.magicFloorContentRoot!,
                `MagicFloorRow_${floorIndex + 1}`,
                HomeConfig.MAGIC_FLOOR_ROW_WIDTH,
                HomeConfig.MAGIC_FLOOR_ROW_HEIGHT,
                0,
                rowY,
                HomeConfig.UI_MAGIC_FLOOR_ROW,
            ).node;
            row.active = true;
            row.setSiblingIndex(floorIndex);

            const iconPath = HomeConfig.UI_MAGIC_FLOOR_ICONS[floorIndex] || HomeConfig.UI_MAGIC_FLOOR_ICONS[0];
            const icon = this.getOrCreateBottomFeatureSkinnedNode(row, 'MagicFloorIcon', HomeConfig.MAGIC_FLOOR_ICON_WIDTH, HomeConfig.MAGIC_FLOOR_ICON_HEIGHT, HomeConfig.MAGIC_FLOOR_ICON_X, HomeConfig.MAGIC_FLOOR_ICON_Y, iconPath).node;
            icon.setSiblingIndex(1);

            const title = this.getOrCreateBottomFeatureLabel(row, 'MagicFloorName', realmName, 25, HomeConfig.MAGIC_FLOOR_TEXT_X, 28, HomeConfig.MAGIC_FLOOR_TEXT_WIDTH, 38, new Color(46, 31, 20, 255)).label;
            title.horizontalAlign = HorizontalTextAlignment.LEFT;
            this.setMagicFloorTextEdge(title, false);

            const detail = this.getOrCreateBottomFeatureLabel(row, 'MagicFloorDetail', '\u63a8\u8350\u6218\u529b\uff1a0\n\u9996\u9886\u8fdb\u5ea6\uff1a0/5', 20, HomeConfig.MAGIC_FLOOR_TEXT_X, -20, HomeConfig.MAGIC_FLOOR_TEXT_WIDTH, 62, new Color(90, 62, 40, 255)).label;
            detail.horizontalAlign = HorizontalTextAlignment.LEFT;
            this.setMagicFloorTextEdge(detail, false);

            const status = this.getOrCreateBottomFeatureLabel(row, 'MagicFloorStatus', '\u53ef\u6311\u6218', 20, 156, 34, 136, 32, new Color(15, 139, 60, 255)).label;
            this.setMagicFloorTextEdge(status, false);

            const enter = this.getOrCreateBottomFeatureSkinnedNode(row, 'MagicFloorEnterButton', 150, 58, 156, -18, HomeConfig.UI_MAGIC_FLOOR_ENTER_BUTTON).node;
            enter.setSiblingIndex(6);
            const enterText = this.getOrCreateBottomFeatureLabel(enter, 'MagicFloorEnterLabel', '\u8fdb\u5165', 27, 0, 1, 128, 44, new Color(42, 22, 8, 255)).label;
            this.setMagicFloorTextEdge(enterText, false);
            this.bindScaledClick(enter, () => this.openMagicFloorReservedPage(this.magicSceneIndex, floorIndex));
        });
    }
    protected setMagicFloorTextEdge(label: Label, enabled: boolean, color = new Color(255, 241, 200, 255), width = 1): void {
        label.enableOutline = enabled;
        label.outlineColor = color;
        label.outlineWidth = enabled ? width : 0;
    }
    protected closeMagicFloorPanel(): void {
        if (this.magicFloorPanel?.isValid) {
            if (this.magicFloorBoard?.isValid) Tween.stopAllByTarget(this.magicFloorBoard);
            if (this.magicFloorScrollBody?.isValid) Tween.stopAllByTarget(this.magicFloorScrollBody);
            if (this.magicFloorTitleLabel?.node?.isValid) Tween.stopAllByTarget(this.magicFloorTitleLabel.node.getComponent(UIOpacity) || this.magicFloorTitleLabel.node);
            if (this.magicFloorContentRoot?.isValid) Tween.stopAllByTarget(this.magicFloorContentRoot.getComponent(UIOpacity) || this.magicFloorContentRoot);
            this.magicFloorOpening = false;
            this.magicFloorPanel.active = false;
        }
    }
    protected playMagicFloorOpenAnimation(): void {
        if (!this.magicFloorBoard?.isValid || !this.magicFloorScrollBody?.isValid) return;

        const body = this.magicFloorScrollBody;
        const titleNode = this.magicFloorTitleLabel?.node || null;
        const titleOpacity = this.getOrCreateOpacity(this.magicFloorTitleLabel?.node || null);
        const contentOpacity = this.getOrCreateOpacity(this.magicFloorContentRoot);
        const finalBodyY = HomeConfig.MAGIC_FLOOR_SCROLL_Y;
        const startScaleY = 0.04;
        const startBodyY = HomeConfig.MAGIC_FLOOR_SCROLL_TOP_Y - (HomeConfig.MAGIC_FLOOR_SCROLL_HEIGHT * startScaleY * 0.5);

        this.magicFloorOpening = true;
        Tween.stopAllByTarget(body);
        body.setScale(body.scale.x || 1, startScaleY, body.scale.z || 1);
        body.setPosition(new Vec3(body.position.x, startBodyY, body.position.z));

        if (titleNode?.isValid) {
            titleNode.active = false;
        }
        if (titleOpacity) {
            Tween.stopAllByTarget(titleOpacity);
            titleOpacity.opacity = 0;
        }
        if (this.magicFloorContentRoot?.isValid) {
            this.magicFloorContentRoot.active = false;
        }
        if (contentOpacity) {
            Tween.stopAllByTarget(contentOpacity);
            contentOpacity.opacity = 0;
        }

        tween(body)
            .to(0.34, {
                position: new Vec3(body.position.x, finalBodyY, body.position.z),
                scale: new Vec3(body.scale.x || 1, 1, body.scale.z || 1),
            }, { easing: 'sineOut' })
            .call(() => {
                if (titleNode?.isValid) {
                    titleNode.active = true;
                }
                if (this.magicFloorContentRoot?.isValid) {
                    this.magicFloorContentRoot.active = true;
                }
                if (titleOpacity?.isValid) {
                    tween(titleOpacity).to(0.12, { opacity: 255 }, { easing: 'sineOut' }).start();
                }
                if (contentOpacity?.isValid) {
                    tween(contentOpacity)
                        .to(0.16, { opacity: 255 }, { easing: 'sineOut' })
                        .call(() => {
                            this.magicFloorOpening = false;
                        })
                        .start();
                } else {
                    this.magicFloorOpening = false;
                }
            })
            .start();
    }
    protected isMagicFloorTouchInsideBoard(event: EventTouch): boolean {
        if (!this.magicFloorBoard?.isValid) return false;
        const transform = this.magicFloorBoard.getComponent(UITransform);
        if (!transform) return false;

        const location = event.getUILocation();
        const local = transform.convertToNodeSpaceAR(new Vec3(location.x, location.y, 0));
        const size = transform.contentSize;
        return Math.abs(local.x) <= size.width * 0.5 && Math.abs(local.y) <= size.height * 0.5;
    }
    protected getOrCreateOpacity(node: Node | null): UIOpacity | null {
        if (!node?.isValid) return null;
        return node.getComponent(UIOpacity) || node.addComponent(UIOpacity);
    }
    protected switchMagicScene(step: number): void {
        const nextIndex = Math.min(Math.max(this.magicSceneIndex + step, 0), HomeConfig.MAGIC_SCENES.length - 1);
        if (nextIndex === this.magicSceneIndex) return;
    
        this.selectMagicScene(nextIndex, true);
    }
    protected refreshMagicScene(animate = false): void {
        if (!this.magicSceneRoot?.active) return;
    
        this.magicSceneNameLabels.forEach((label, index) => {
            const scene = HomeConfig.MAGIC_SCENES[index];
            if (label?.isValid && scene) {
                label.string = this.getVerticalMagicSceneTitle(scene.title);
            }
        });
        if (this.magicPrevButton?.isValid) {
            this.magicPrevButton.active = this.magicSceneIndex > 0;
        }
        if (this.magicNextButton?.isValid) {
            this.magicNextButton.active = this.magicSceneIndex < HomeConfig.MAGIC_SCENES.length - 1;
        }
        if (this.magicLevelFrame?.isValid && this.magicLevelLabel?.isValid) {
            const requiredLevel = HomeConfig.MAGIC_LEVEL_REQUIREMENTS[this.magicSceneIndex];
            this.magicLevelFrame.active = typeof requiredLevel === 'number';
            this.magicLevelLabel.string = typeof requiredLevel === 'number' ? `${requiredLevel}\u7ea7` : '';
        }

        this.refreshMagicSceneEntrySelection();
        this.focusMagicSceneEntry(this.magicSceneIndex, animate);
        this.loadMagicSceneEntrySkeletons();
    }
    protected stopMagicScene(): void {
        this.magicSceneLoadVersion += 1;
        if (this.magicSceneRoot?.isValid) {
            this.magicSceneRoot.active = false;
        }
        if (this.magicSceneSkeleton?.isValid) {
            this.setSkeletonVisible(this.magicSceneSkeleton, false);
        }
        this.magicSceneEntrySkeletons.forEach((skeleton) => {
            if (skeleton?.isValid) this.setSkeletonVisible(skeleton, false);
        });
        if (this.magicSceneWorld?.isValid) {
            Tween.stopAllByTarget(this.magicSceneWorld);
        }
    }
}
