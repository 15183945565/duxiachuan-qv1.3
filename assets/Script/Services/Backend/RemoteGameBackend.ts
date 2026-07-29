import type { IGameBackend } from './IGameBackend';
import type {
    ApiResult,
    BattleResultDto,
    BattleStartDto,
    BootstrapDto,
    MailDto,
    MarketListingDto,
    PlayerProfileDto,
    RankingEntryDto,
    ShopProductDto,
} from './GameBackendTypes';

export interface RemoteBackendOptions {
    baseUrl: string;
    tokenProvider: () => string;
    timeoutMs?: number;
}

export class RemoteGameBackend implements IGameBackend {
    private readonly baseUrl: string;
    private readonly timeoutMs: number;

    constructor(private readonly options: RemoteBackendOptions) {
        this.baseUrl = options.baseUrl.trim().replace(/\/+$/, '');
        if (!/^https?:\/\//i.test(this.baseUrl)) {
            throw new Error('RemoteGameBackend baseUrl must be an absolute HTTP(S) URL');
        }
        this.timeoutMs = options.timeoutMs || 10000;
    }

    initialize(): Promise<ApiResult<BootstrapDto>> {
        return this.request('GET', '/v1/game/bootstrap');
    }

    saveProfile(profile: Partial<PlayerProfileDto>): Promise<ApiResult<PlayerProfileDto>> {
        return this.request('PATCH', '/v1/player/profile', profile);
    }

    listMails(): Promise<ApiResult<MailDto[]>> { return this.request('GET', '/v1/mails'); }
    readMail(mailId: string): Promise<ApiResult<MailDto>> {
        return this.request('POST', `/v1/mails/${encodeURIComponent(mailId)}/read`);
    }
    claimMail(mailId: string): Promise<ApiResult<MailDto>> {
        return this.request('POST', `/v1/mails/${encodeURIComponent(mailId)}/claim`);
    }
    claimAllMails(): Promise<ApiResult<MailDto[]>> { return this.request('POST', '/v1/mails/claim-all'); }
    deleteMail(mailId: string): Promise<ApiResult<void>> {
        return this.request('DELETE', `/v1/mails/${encodeURIComponent(mailId)}`);
    }

    listShopProducts(): Promise<ApiResult<ShopProductDto[]>> { return this.request('GET', '/v1/shop/products'); }
    purchaseProduct(productId: string, quantity: number): Promise<ApiResult<BootstrapDto>> {
        return this.request('POST', '/v1/shop/purchase', { productId, quantity });
    }

    listMarket(category = 'all'): Promise<ApiResult<MarketListingDto[]>> {
        return this.request('GET', `/v1/market/listings?category=${encodeURIComponent(category)}`);
    }

    buyMarketListing(listingId: string, quantity: number): Promise<ApiResult<BootstrapDto>> {
        return this.request('POST', `/v1/market/listings/${encodeURIComponent(listingId)}/buy`, { quantity });
    }

    createMarketListing(itemId: string, quantity: number, unitPrice: number): Promise<ApiResult<MarketListingDto>> {
        return this.request('POST', '/v1/market/listings', { itemId, quantity, unitPrice });
    }

    listRankings(type: 'power' | 'battleLevel'): Promise<ApiResult<RankingEntryDto[]>> {
        return this.request('GET', `/v1/rankings/${encodeURIComponent(type)}`);
    }

    startBattle(mode: string, targetId?: string): Promise<ApiResult<BattleStartDto>> {
        return this.request('POST', '/v1/battles/start', { mode, targetId });
    }

    submitBattleResult(result: BattleResultDto): Promise<ApiResult<BootstrapDto>> {
        return this.request('POST', `/v1/battles/${encodeURIComponent(result.battleId)}/result`, result);
    }

    private async request<T>(method: string, path: string, body?: unknown): Promise<ApiResult<T>> {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), this.timeoutMs);
        try {
            const headers: Record<string, string> = {
                Accept: 'application/json',
            };
            const token = this.options.tokenProvider().trim();
            if (token.length > 0) headers.Authorization = `Bearer ${token}`;
            if (body !== undefined) headers['Content-Type'] = 'application/json';

            const response = await fetch(`${this.baseUrl}${path}`, {
                method,
                headers,
                body: body === undefined ? undefined : JSON.stringify(body),
                signal: controller.signal,
            });
            const responseText = await response.text();
            let parsedPayload: unknown;
            if (responseText.trim().length > 0) {
                try {
                    parsedPayload = JSON.parse(responseText);
                } catch {
                    if (response.ok) {
                        return {
                            ok: false,
                            errorCode: 'INVALID_RESPONSE',
                            message: '服务器返回了无法解析的数据',
                        };
                    }
                }
            }
            const payload = this.isApiResult<T>(parsedPayload) ? parsedPayload : undefined;
            if (!response.ok) {
                return {
                    ok: false,
                    errorCode: payload?.errorCode || `HTTP_${response.status}`,
                    message: payload?.message || response.statusText || '服务器请求失败',
                };
            }
            if (response.status === 204 && responseText.length === 0) return { ok: true };
            if (!payload) {
                return {
                    ok: false,
                    errorCode: 'INVALID_RESPONSE',
                    message: '服务器响应格式不符合约定',
                };
            }
            return payload;
        } catch (error) {
            if (controller.signal.aborted) {
                return {
                    ok: false,
                    errorCode: 'TIMEOUT',
                    message: '请求超时，请稍后重试',
                };
            }
            return {
                ok: false,
                errorCode: 'NETWORK_ERROR',
                message: error instanceof Error ? error.message : String(error),
            };
        } finally {
            clearTimeout(timer);
        }
    }

    private isApiResult<T>(value: unknown): value is ApiResult<T> {
        return typeof value === 'object'
            && value !== null
            && typeof (value as { ok?: unknown }).ok === 'boolean';
    }
}
