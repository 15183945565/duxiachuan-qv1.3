import { Asset, AssetManager, JsonAsset, assetManager } from 'cc';

export interface ResourceDiagnostics {
    readonly loadedBundles: readonly string[];
    readonly bundleReferences: Readonly<Record<string, number>>;
    readonly retainedAssetCount: number;
}

/**
 * Owns the resources used by one page, popup, or gameplay feature.
 *
 * A scope retains each asset/bundle at most once and releases everything in
 * reverse ownership order when the feature closes. Destroy the owning view
 * before disposing its scope; a pooled view must keep its scope alive.
 */
export class ResourceScope {
    private readonly bundleNames = new Set<string>();
    private readonly assets = new Set<Asset>();
    private disposed = false;

    public constructor(
        private readonly manager: ResourceManager,
        public readonly label: string,
    ) {}

    public async acquireBundle(name: string): Promise<AssetManager.Bundle> {
        this.assertActive();
        if (this.bundleNames.has(name)) {
            return this.manager.getLoadedBundle(name)
                || this.manager.acquireBundle(name, false);
        }

        this.bundleNames.add(name);
        let bundle: AssetManager.Bundle;
        try {
            bundle = await this.manager.acquireBundle(name);
        } catch (error) {
            this.bundleNames.delete(name);
            throw error;
        }
        if (this.disposed) {
            this.manager.releaseBundle(name);
            throw new Error(`ResourceScope "${this.label}" was disposed while loading bundle "${name}".`);
        }
        return bundle;
    }

    public retain<T extends Asset>(asset: T): T {
        this.assertActive();
        if (!this.assets.has(asset)) {
            this.assets.add(asset);
            this.manager.retainAsset(asset);
        }
        return asset;
    }

    public releaseAsset(asset: Asset): void {
        if (!this.assets.delete(asset)) return;
        this.manager.releaseAsset(asset);
    }

    public dispose(): void {
        if (this.disposed) return;
        this.disposed = true;

        for (const asset of this.assets) {
            this.manager.releaseAsset(asset);
        }
        this.assets.clear();

        for (const bundleName of this.bundleNames) {
            this.manager.releaseBundle(bundleName);
        }
        this.bundleNames.clear();
    }

    private assertActive(): void {
        if (this.disposed) {
            throw new Error(`ResourceScope "${this.label}" has already been disposed.`);
        }
    }
}

export class ResourceManager {
    private static _instance: ResourceManager | null = null;
    private readonly bundles = new Map<string, AssetManager.Bundle>();
    private readonly pendingBundles = new Map<string, Promise<AssetManager.Bundle>>();
    private readonly bundleReferences = new Map<string, number>();
    private readonly assetReferences = new Map<Asset, number>();

    public static get instance(): ResourceManager {
        if (!this._instance) this._instance = new ResourceManager();
        return this._instance;
    }

    public createScope(label: string): ResourceScope {
        return new ResourceScope(this, label);
    }

    public async acquireBundle(name: string, increaseReference = true): Promise<AssetManager.Bundle> {
        const bundle = await this.ensureBundle(name);
        if (increaseReference) {
            this.bundleReferences.set(name, (this.bundleReferences.get(name) || 0) + 1);
        }
        return bundle;
    }

    public releaseBundle(name: string): boolean {
        const current = this.bundleReferences.get(name) || 0;
        if (current <= 0) return false;

        if (current > 1) {
            this.bundleReferences.set(name, current - 1);
            return false;
        }

        this.bundleReferences.delete(name);
        return this.unloadBundle(name);
    }

    public retainAsset<T extends Asset>(asset: T): T {
        const current = this.assetReferences.get(asset) || 0;
        if (current === 0) asset.addRef();
        this.assetReferences.set(asset, current + 1);
        return asset;
    }

    public releaseAsset(asset: Asset): boolean {
        const current = this.assetReferences.get(asset) || 0;
        if (current <= 0) return false;

        if (current > 1) {
            this.assetReferences.set(asset, current - 1);
            return false;
        }

        this.assetReferences.delete(asset);
        asset.decRef();
        return true;
    }

    public getLoadedBundle(name: string): AssetManager.Bundle | null {
        const cached = this.bundles.get(name);
        const engineBundle = assetManager.getBundle(name);
        if (cached && cached === engineBundle) return cached;
        if (engineBundle) {
            this.bundles.set(name, engineBundle);
            return engineBundle;
        }
        this.bundles.delete(name);
        return null;
    }

    public getDiagnostics(): ResourceDiagnostics {
        const bundleReferences: Record<string, number> = {};
        for (const [name, count] of this.bundleReferences) {
            bundleReferences[name] = count;
        }
        return {
            loadedBundles: Array.from(this.bundles.keys()),
            bundleReferences,
            retainedAssetCount: this.assetReferences.size,
        };
    }

    private ensureBundle(name: string): Promise<AssetManager.Bundle> {
        const cached = this.getLoadedBundle(name);
        if (cached) return Promise.resolve(cached);

        const pending = this.pendingBundles.get(name);
        if (pending) return pending;

        const request = new Promise<AssetManager.Bundle>((resolve, reject) => {
            assetManager.loadBundle(name, (err, bundle) => {
                this.pendingBundles.delete(name);
                if (err || !bundle) {
                    reject(err || new Error(`Bundle not found: ${name}`));
                    return;
                }
                this.bundles.set(name, bundle);
                resolve(bundle);
            });
        });
        this.pendingBundles.set(name, request);
        return request;
    }

    private unloadBundle(name: string): boolean {
        const bundle = this.getLoadedBundle(name);
        if (!bundle) return false;
        bundle.releaseAll();
        assetManager.removeBundle(bundle);
        this.bundles.delete(name);
        this.pendingBundles.delete(name);
        return true;
    }

    public loadDir<T extends Asset>(
        bundle: AssetManager.Bundle,
        path: string,
        type: new (...args: never[]) => T,
        onProgress?: (progress: number) => void,
    ): Promise<T[]> {
        return new Promise((resolve, reject) => {
            bundle.loadDir(
                path,
                type,
                (finished, total) => {
                    onProgress?.(total > 0 ? finished / total : 1);
                },
                (err, assets) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(assets || []);
                },
            );
        });
    }

    public loadConfigDir(bundle: AssetManager.Bundle, onProgress?: (progress: number) => void): Promise<JsonAsset[]> {
        return this.loadDir(bundle, 'Config', JsonAsset, onProgress);
    }
}
