import { JsonAsset } from 'cc';

export class ConfigManager {
    private static _instance: ConfigManager | null = null;
    private readonly configs = new Map<string, unknown>();

    public static get instance(): ConfigManager {
        if (!this._instance) this._instance = new ConfigManager();
        return this._instance;
    }

    public loadFromAssets(assets: JsonAsset[]): void {
        assets.forEach((asset) => {
            this.configs.set(asset.name, asset.json);
        });
    }

    public get<T>(name: string): T | null {
        return (this.configs.get(name) as T | undefined) || null;
    }
}
