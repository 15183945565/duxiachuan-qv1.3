export type Gender = 'male' | 'female';

export interface PlayerProfileDto {
    id: string;
    name: string;
    gender: Gender;
    level: number;
    power: number;
    soul: number;
    points: number;
}

export interface InventoryItemDto {
    id: string;
    templateId: string;
    amount: number;
    locked?: boolean;
}

export interface MailDto {
    id: string;
    category: 'normal' | 'system';
    title: string;
    content: string;
    senderName: string;
    createTime: number;
    state: 0 | 1 | 2;
    rewards: Array<{ templateId: string; amount: number }>;
}

export interface ShopProductDto {
    id: string;
    templateId: string;
    amount: number;
    price: number;
    currency: 'soul' | 'points';
    purchaseLimit?: number;
}

export interface MarketListingDto {
    id: string;
    sellerId: string;
    templateId: string;
    amount: number;
    unitPrice: number;
    createdAt: number;
}

export interface RankingEntryDto {
    rank: number;
    playerId: string;
    playerName: string;
    gender: Gender;
    value: number;
}

export interface BattleStartDto {
    battleId: string;
    seed: number;
    expiresAt: number;
    enemies: Array<{ id: string; templateId: string; hp: number }>;
}

export interface BattleResultDto {
    battleId: string;
    victory: boolean;
    damage: number;
    durationMs: number;
}

export interface BootstrapDto {
    profile: PlayerProfileDto;
    inventory: InventoryItemDto[];
    serverTime: number;
    featureFlags: Record<string, boolean>;
}

export interface ApiResult<T> {
    ok: boolean;
    data?: T;
    errorCode?: string;
    message?: string;
}
