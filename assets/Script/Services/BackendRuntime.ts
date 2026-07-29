import { AuthService } from './AuthService';
import { GameBackend } from './Backend/GameBackend';
import { LocalPreviewBackend } from './Backend/LocalPreviewBackend';
import { RemoteGameBackend } from './Backend/RemoteGameBackend';
import { GameRuntimeConfig, RuntimeConfig } from './RuntimeConfig';

export class BackendRuntime {
    private static initialized = false;
    private static runtimeConfig: Readonly<GameRuntimeConfig> | null = null;

    static initialize(): Readonly<GameRuntimeConfig> {
        if (this.initialized && this.runtimeConfig) return this.runtimeConfig;

        const config = RuntimeConfig.resolve();
        if (config.backendMode === 'remote') {
            GameBackend.configure(new RemoteGameBackend({
                baseUrl: config.apiBaseUrl,
                tokenProvider: () => AuthService.getToken(),
                timeoutMs: config.requestTimeoutMs,
            }));
        } else {
            GameBackend.configure(new LocalPreviewBackend());
        }

        this.runtimeConfig = config;
        this.initialized = true;
        return config;
    }

    static get config(): Readonly<GameRuntimeConfig> {
        return this.runtimeConfig || this.initialize();
    }
}
