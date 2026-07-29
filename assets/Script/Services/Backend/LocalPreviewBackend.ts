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

const emptyProfile: PlayerProfileDto = {
    id: 'local-preview-player',
    name: '独侠少侠',
    gender: 'male',
    level: 0,
    power: 0,
    soul: 0,
    points: 0,
};

export class LocalPreviewBackend implements IGameBackend {
    private profile = { ...emptyProfile };

    async initialize(): Promise<ApiResult<BootstrapDto>> {
        return this.bootstrap();
    }

    async saveProfile(profile: Partial<PlayerProfileDto>): Promise<ApiResult<PlayerProfileDto>> {
        this.profile = { ...this.profile, ...profile };
        return { ok: true, data: { ...this.profile } };
    }

    async listMails(): Promise<ApiResult<MailDto[]>> { return { ok: true, data: [] }; }
    async readMail(): Promise<ApiResult<MailDto>> { return this.notConnected<MailDto>(); }
    async claimMail(): Promise<ApiResult<MailDto>> { return this.notConnected<MailDto>(); }
    async claimAllMails(): Promise<ApiResult<MailDto[]>> { return { ok: true, data: [] }; }
    async deleteMail(): Promise<ApiResult<void>> { return { ok: true }; }

    async listShopProducts(): Promise<ApiResult<ShopProductDto[]>> { return { ok: true, data: [] }; }
    async purchaseProduct(): Promise<ApiResult<BootstrapDto>> { return this.bootstrap(); }

    async listMarket(): Promise<ApiResult<MarketListingDto[]>> { return { ok: true, data: [] }; }
    async buyMarketListing(): Promise<ApiResult<BootstrapDto>> { return this.bootstrap(); }
    async createMarketListing(): Promise<ApiResult<MarketListingDto>> { return this.notConnected<MarketListingDto>(); }

    async listRankings(): Promise<ApiResult<RankingEntryDto[]>> { return { ok: true, data: [] }; }

    async startBattle(mode: string, targetId = ''): Promise<ApiResult<BattleStartDto>> {
        return {
            ok: true,
            data: {
                battleId: `local-${mode}-${targetId || 'default'}`,
                seed: 0,
                expiresAt: Date.now() + 300000,
                enemies: [],
            },
        };
    }

    async submitBattleResult(_result: BattleResultDto): Promise<ApiResult<BootstrapDto>> {
        return this.bootstrap();
    }

    private async bootstrap(): Promise<ApiResult<BootstrapDto>> {
        return {
            ok: true,
            data: {
                profile: { ...this.profile },
                inventory: [],
                serverTime: Date.now(),
                featureFlags: {},
            },
        };
    }

    private notConnected<T>(): ApiResult<T> {
        return { ok: false, errorCode: 'LOCAL_PREVIEW_ONLY', message: '等待后端接口接入' };
    }
}
