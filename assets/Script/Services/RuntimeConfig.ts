export type BackendMode = 'local-preview' | 'remote';

export interface GameRuntimeConfig {
    readonly backendMode: BackendMode;
    readonly apiBaseUrl: string;
    readonly webSocketBaseUrl: string;
    readonly cdnBaseUrl: string;
    readonly requestTimeoutMs: number;
    readonly clientVersion: string;
    readonly resourceVersion: string;
    readonly channel: string;
}

type RuntimeConfigInput = Partial<GameRuntimeConfig>;

export const RUNTIME_CONFIG_GLOBAL_KEY = '__QV_RUNTIME_CONFIG__';

const ALLOWED_KEYS = new Set<keyof GameRuntimeConfig>([
    'backendMode',
    'apiBaseUrl',
    'webSocketBaseUrl',
    'cdnBaseUrl',
    'requestTimeoutMs',
    'clientVersion',
    'resourceVersion',
    'channel',
]);
const SENSITIVE_KEY_PATTERN = /(token|secret|password|private.?key|access.?key)/i;
const CREDENTIALS_IN_URL_PATTERN = /^[a-z]+:\/\/[^/\s]*@/i;
const VERSION_PATTERN = /^[0-9A-Za-z._+-]{0,64}$/;
const CHANNEL_PATTERN = /^[0-9A-Za-z._-]{0,64}$/;
const DEFAULT_CONFIG: GameRuntimeConfig = Object.freeze({
    backendMode: 'local-preview',
    apiBaseUrl: '',
    webSocketBaseUrl: '',
    cdnBaseUrl: '',
    requestTimeoutMs: 10000,
    clientVersion: '',
    resourceVersion: '',
    channel: '',
});

export class RuntimeConfig {
    private static resolved: Readonly<GameRuntimeConfig> | null = null;

    static get current(): Readonly<GameRuntimeConfig> {
        return this.resolved || this.resolve();
    }

    static resolve(): Readonly<GameRuntimeConfig> {
        if (this.resolved) return this.resolved;
        const container = globalThis as unknown as Record<string, unknown>;
        this.resolved = this.parse(container[RUNTIME_CONFIG_GLOBAL_KEY]);
        return this.resolved;
    }

    private static parse(value: unknown): Readonly<GameRuntimeConfig> {
        if (value === undefined || value === null) return DEFAULT_CONFIG;
        if (!this.isPlainObject(value)) {
            throw new Error(`${RUNTIME_CONFIG_GLOBAL_KEY} must be a plain object`);
        }

        for (const key of Object.keys(value)) {
            if (SENSITIVE_KEY_PATTERN.test(key)) {
                throw new Error(`Runtime config must not contain sensitive field "${key}"`);
            }
            if (!ALLOWED_KEYS.has(key as keyof GameRuntimeConfig)) {
                throw new Error(`Unknown runtime config field "${key}"`);
            }
        }

        const input = value as RuntimeConfigInput;
        const backendMode = input.backendMode ?? DEFAULT_CONFIG.backendMode;
        if (backendMode !== 'local-preview' && backendMode !== 'remote') {
            throw new Error('backendMode must be "local-preview" or "remote"');
        }

        const apiBaseUrl = this.readString(input.apiBaseUrl, 'apiBaseUrl', 512);
        const webSocketBaseUrl = this.readString(input.webSocketBaseUrl, 'webSocketBaseUrl', 512);
        const cdnBaseUrl = this.readString(input.cdnBaseUrl, 'cdnBaseUrl', 512);
        const clientVersion = this.readString(input.clientVersion, 'clientVersion', 64);
        const resourceVersion = this.readString(input.resourceVersion, 'resourceVersion', 64);
        const channel = this.readString(input.channel, 'channel', 64);
        const requestTimeoutMs = input.requestTimeoutMs ?? DEFAULT_CONFIG.requestTimeoutMs;

        if (!Number.isInteger(requestTimeoutMs) || requestTimeoutMs < 1000 || requestTimeoutMs > 60000) {
            throw new Error('requestTimeoutMs must be an integer between 1000 and 60000');
        }
        if (backendMode === 'remote' && !apiBaseUrl) {
            throw new Error('apiBaseUrl is required when backendMode is "remote"');
        }
        if (apiBaseUrl && !/^https?:\/\/[^/\s]+(?:\/[^\s]*)?$/i.test(apiBaseUrl)) {
            throw new Error('apiBaseUrl must be an absolute HTTP(S) URL');
        }
        if (webSocketBaseUrl && !/^wss?:\/\/[^/\s]+(?:\/[^\s]*)?$/i.test(webSocketBaseUrl)) {
            throw new Error('webSocketBaseUrl must be an absolute WS(S) URL');
        }
        if (cdnBaseUrl && !/^https?:\/\/[^/\s]+(?:\/[^\s]*)?$/i.test(cdnBaseUrl)) {
            throw new Error('cdnBaseUrl must be an absolute HTTP(S) URL');
        }
        if (
            CREDENTIALS_IN_URL_PATTERN.test(apiBaseUrl)
            || CREDENTIALS_IN_URL_PATTERN.test(webSocketBaseUrl)
            || CREDENTIALS_IN_URL_PATTERN.test(cdnBaseUrl)
        ) {
            throw new Error('Runtime service URLs must not contain embedded credentials');
        }
        if (!VERSION_PATTERN.test(clientVersion) || !VERSION_PATTERN.test(resourceVersion)) {
            throw new Error('clientVersion and resourceVersion contain unsupported characters');
        }
        if (!CHANNEL_PATTERN.test(channel)) {
            throw new Error('channel contains unsupported characters');
        }

        return Object.freeze({
            backendMode,
            apiBaseUrl: apiBaseUrl.replace(/\/+$/, ''),
            webSocketBaseUrl: webSocketBaseUrl.replace(/\/+$/, ''),
            cdnBaseUrl: cdnBaseUrl.replace(/\/+$/, ''),
            requestTimeoutMs,
            clientVersion,
            resourceVersion,
            channel,
        });
    }

    private static readString(value: unknown, key: string, maxLength: number): string {
        if (value === undefined || value === null) return '';
        if (typeof value !== 'string') throw new Error(`${key} must be a string`);
        const normalized = value.trim();
        if (normalized.length > maxLength) throw new Error(`${key} exceeds ${maxLength} characters`);
        return normalized;
    }

    private static isPlainObject(value: unknown): value is Record<string, unknown> {
        if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
        const prototype = Object.getPrototypeOf(value);
        return prototype === Object.prototype || prototype === null;
    }
}
