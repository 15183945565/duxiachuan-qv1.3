import {
    AssetManager,
    Color,
    Graphics,
    ImageAsset,
    Node,
    Rect,
    Size,
    Sprite,
    SpriteFrame,
    Texture2D,
    UITransform,
    assetManager,
    sp,
} from 'cc';
import * as HomeConfig from './HomeConfig';
import type { RoleAssetConfig } from './HomeTypes';
import { HomeViewBase } from './HomeViewBase';

/**
 * Owns Home asset loading, sprite-frame conversion, UI skin application, and transition skeleton loading.
 */
export abstract class HomeFeatureAssetRuntime extends HomeViewBase {
    protected async loadRoleAssets(): Promise<void> {
        try {
            await this.acquireHomeSharedBundle();
    
            await this.loadMapBackground().catch((err) => {
                console.warn('[MainHomeView] main map background load failed', err);
            });
    
            if (HomeConfig.ENABLE_ROLE_SKEL_ANIMATION) {
                await this.loadSkeletonData(HomeConfig.ROLE_ASSETS.male).catch((err) => {
                    console.warn('[MainHomeView] male skel load failed', err);
                });
                await this.loadSkeletonData(HomeConfig.ROLE_ASSETS.female).catch((err) => {
                    console.warn('[MainHomeView] female skel load failed', err);
                });
                this.applyCurrentRole();
            }
    
            await this.loadTransitionSkeletonData();
    
            if (!this.hasRoleVisual(this.profile.gender)) {
                this.profile.gender = 'male';
            }
            if (!this.hasRoleVisual(this.profile.gender)) {
                throw new Error('No available role visual data');
            }
            this.applyCurrentRole();
        } catch (err) {
            console.error('[MainHomeView] load role visual failed', err);
            this.showToast('\u89d2\u8272\u8d44\u6e90\u52a0\u8f7d\u5931\u8d25');
        }
    }
    protected async loadMapBackground(): Promise<void> {
        const spriteFrame = await this.loadSpriteFrameAsset(HomeConfig.MAP_BACKGROUND_PATH, HomeConfig.MAP_BACKGROUND_UUID);
        if (!this.mapBackground?.isValid) return;
    
        this.applySpriteFrameToNode(this.mapBackground, spriteFrame, HomeConfig.MAP_WIDTH, HomeConfig.MAP_HEIGHT);
    
        if (this.roleStageNode) {
            this.roleStageNode.setSiblingIndex(1);
        }
    }
    protected async loadSourceMapLayer(name: string, path: string, width: number, height: number, x: number, y: number, siblingIndex: number): Promise<void> {
        if (!this.mapLayer) return;
    
        const frame = await this.loadSpriteFrameAsset(path);
        let layer = this.mapLayer.getChildByName(name);
        if (!layer) {
            layer = new Node(name);
            this.mapLayer.addChild(layer);
        }
        layer.setPosition(x, y, 0);
        layer.setSiblingIndex(siblingIndex);
        this.applySpriteFrameToNode(layer, frame, width, height);
    }
    protected applySpriteFrameToNode(node: Node, spriteFrame: SpriteFrame, width: number, height: number): void {
        node.active = true;
        (node.getComponent(UITransform) || node.addComponent(UITransform)).setContentSize(width, height);
    
        const graphics = node.getComponent(Graphics);
        if (graphics) {
            graphics.destroy();
        }
    
        const sprite = node.getComponent(Sprite) || node.addComponent(Sprite);
        sprite.type = Sprite.Type.SIMPLE;
        sprite.sizeMode = Sprite.SizeMode.CUSTOM;
        sprite.spriteFrame = spriteFrame;
        sprite.enabled = true;
    }
    protected createSkinnedNode(name: string, parent: Node, width: number, height: number, x: number, y: number, skinPath: string, fallbackColor?: Color): Node {
        const node = this.createNode(name, parent, width, height, x, y);
        if (fallbackColor) {
            this.drawRect(node, width, height, fallbackColor);
        }
        this.applyUiSkin(node, skinPath, width, height);
        return node;
    }
    protected applyUiSkin(node: Node, skinPath: string, width: number, height: number): void {
        const applyVersion = ++this.skinApplyVersion;
        this.skinApplyVersions.set(node, applyVersion);
        const pendingSprite = node.getComponent(Sprite);
        if (pendingSprite && !pendingSprite.spriteFrame) {
            pendingSprite.enabled = false;
        }
    
        const apply = (): Promise<void> => this.loadSpriteFrameAsset(skinPath)
            .then((spriteFrame) => {
                if (!node.isValid) return;
                if (this.skinApplyVersions.get(node) !== applyVersion) return;
                this.applySpriteFrameToNode(node, spriteFrame, width, height);
            });
    
        if (this.resBundle) {
            void apply()
                .catch((err) => {
                    console.warn('[MainHomeView] ui skin load failed', skinPath, err);
                });
            return;
        }
    
        void this.acquireHomeSharedBundle()
            .then((bundle) => {
                return apply();
            })
            .catch((err) => {
                console.warn('[MainHomeView] ui skin load failed', skinPath, err);
            });
    }
    protected getNodeRenderSize(node: Node, fallbackWidth: number, fallbackHeight: number): Size {
        const transform = node.getComponent(UITransform) || node.addComponent(UITransform);
        const current = transform.contentSize;
        const width = current.width > 0 ? current.width : fallbackWidth;
        const height = current.height > 0 ? current.height : fallbackHeight;
        transform.setContentSize(width, height);
        return new Size(width, height);
    }
    protected applyUiSkinKeepingEditorSize(node: Node, skinPath: string, fallbackWidth: number, fallbackHeight: number): void {
        const size = this.getNodeRenderSize(node, fallbackWidth, fallbackHeight);
        this.applyUiSkin(node, skinPath, size.width, size.height);
    }
    protected loadSkeletonData(config: RoleAssetConfig): Promise<void> {
        return new Promise((resolve, reject) => {
            const bundle = this.resBundle;
            if (!bundle) {
                reject(new Error('res bundle is not ready'));
                return;
            }
    
            const apply = (asset: sp.SkeletonData): void => {
                this.roleSkeletonData.set(config.gender, asset);
                resolve();
            };
    
            const loadByPath = (): void => {
                bundle.load(config.skelPath, sp.SkeletonData, (pathErr, skeletonData) => {
                    if (!pathErr && skeletonData) {
                        apply(skeletonData);
                        return;
                    }
    
                    if (!config.skelUuid) {
                        reject(pathErr || new Error(`SkeletonData not found: ${config.skelPath}`));
                        return;
                    }
    
                    assetManager.loadAny({ uuid: config.skelUuid }, (uuidErr, asset) => {
                        if (!uuidErr && asset) {
                            apply(asset as sp.SkeletonData);
                            return;
                        }
    
                        reject(pathErr || uuidErr || new Error(`SkeletonData not found: ${config.skelPath}`));
                    });
                });
            };
    
            loadByPath();
        });
    }
    protected async loadSpriteFrameAsset(path: string, fallbackUuid?: string): Promise<SpriteFrame> {
        const bundle = await this.acquireHomeAssetBundle(path);
        return new Promise((resolve, reject) => {
            const apply = (asset: ImageAsset | Texture2D | SpriteFrame): void => {
                resolve(this.createSpriteFrame(asset));
            };
    
            bundle.load(`${path}/spriteFrame`, SpriteFrame, (frameErr, frame) => {
                if (!frameErr && frame) {
                    apply(frame);
                    return;
                }
    
                bundle.load(`${path}/texture`, Texture2D, (textureErr, texture) => {
                    if (!textureErr && texture) {
                        apply(texture);
                        return;
                    }
    
                    bundle.load(path, Texture2D, (directErr, directTexture) => {
                        if (!directErr && directTexture) {
                            apply(directTexture);
                            return;
                        }
    
                        if (!fallbackUuid) {
                            reject(frameErr || textureErr || directErr || new Error(`Sprite asset not found: ${path}`));
                            return;
                        }
    
                        assetManager.loadAny({ uuid: fallbackUuid }, (uuidErr, asset) => {
                            if (uuidErr || !asset) {
                                reject(uuidErr || frameErr || textureErr || directErr || new Error(`Sprite asset not found: ${path}`));
                                return;
                            }
    
                            apply(asset as ImageAsset | Texture2D | SpriteFrame);
                        });
                    });
                });
            });
        });
    }
    protected async loadSkeletonAsset(path: string): Promise<sp.SkeletonData> {
        const bundle = await this.acquireHomeAssetBundle(path);
        return new Promise((resolve, reject) => {
            const loadByPath = (assetPath: string, fallback: (() => void) | null): void => {
                bundle.load(assetPath, sp.SkeletonData, (err, asset) => {
                    if (!err && asset) {
                        resolve(asset);
                        return;
                    }

                    if (fallback) {
                        fallback();
                        return;
                    }

                    reject(err || new Error(`SkeletonData not found: ${path}`));
                });
            };

            loadByPath(path, path.endsWith('.skel') ? null : () => {
                loadByPath(`${path}.skel`, null);
            });
        });
    }
    protected createSpriteFrame(asset: ImageAsset | Texture2D | SpriteFrame): SpriteFrame {
        if (asset instanceof SpriteFrame) {
            return asset;
        }
    
        const texture = asset instanceof Texture2D ? asset : new Texture2D();
        if (asset instanceof ImageAsset) {
            texture.image = asset;
        }
    
        const width = Math.max(1, texture.width || (asset instanceof ImageAsset ? asset.width : 0));
        const height = Math.max(1, texture.height || (asset instanceof ImageAsset ? asset.height : 0));
        const spriteFrame = new SpriteFrame();
        spriteFrame.reset({
            texture,
            originalSize: new Size(width, height),
            rect: new Rect(0, 0, width, height),
        });
        return spriteFrame;
    }
    protected loadTransitionSkeletonData(): Promise<void> {
        return new Promise((resolve) => {
            if (!this.resBundle || !this.transitionLoadingSkeleton) {
                resolve();
                return;
            }
    
            this.resBundle.load(HomeConfig.TRANSITION_LOADING_SKEL_PATH, sp.SkeletonData, (err, asset) => {
                if (!err && asset && this.transitionLoadingSkeleton?.isValid) {
                    this.prepareSkeletonRenderer(this.transitionLoadingSkeleton);
                    this.transitionLoadingSkeleton.skeletonData = asset;
                    this.playSkeletonAnimation(this.transitionLoadingSkeleton, HomeConfig.LOADING_ANIMATIONS, true);
                } else if (err) {
                    console.warn('[MainHomeView] transition loading skel not ready', err);
                }
                resolve();
            });
        });
    }
}
