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

export interface IGameBackend {
    initialize(): Promise<ApiResult<BootstrapDto>>;
    saveProfile(profile: Partial<PlayerProfileDto>): Promise<ApiResult<PlayerProfileDto>>;

    listMails(): Promise<ApiResult<MailDto[]>>;
    readMail(mailId: string): Promise<ApiResult<MailDto>>;
    claimMail(mailId: string): Promise<ApiResult<MailDto>>;
    claimAllMails(): Promise<ApiResult<MailDto[]>>;
    deleteMail(mailId: string): Promise<ApiResult<void>>;

    listShopProducts(): Promise<ApiResult<ShopProductDto[]>>;
    purchaseProduct(productId: string, quantity: number): Promise<ApiResult<BootstrapDto>>;

    listMarket(category?: string): Promise<ApiResult<MarketListingDto[]>>;
    buyMarketListing(listingId: string, quantity: number): Promise<ApiResult<BootstrapDto>>;
    createMarketListing(itemId: string, quantity: number, unitPrice: number): Promise<ApiResult<MarketListingDto>>;

    listRankings(type: 'power' | 'battleLevel'): Promise<ApiResult<RankingEntryDto[]>>;
    startBattle(mode: string, targetId?: string): Promise<ApiResult<BattleStartDto>>;
    submitBattleResult(result: BattleResultDto): Promise<ApiResult<BootstrapDto>>;
}
