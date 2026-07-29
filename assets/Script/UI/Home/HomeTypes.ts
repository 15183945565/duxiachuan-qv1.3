import { _decorator, Node, Vec3, sp } from 'cc';
import type { BagIllustrationCatalogItem, BagIllustrationCategory } from './BagIllustrationCatalog.generated';

const { ccclass, property } = _decorator;

export type RoleGender = 'male' | 'female';
export type RolePageTab = 'equipment' | 'advance' | 'forge';
export type BagPageTab = 'bag' | 'decompose' | 'synth';
export type MailTab = 'normal' | 'system' | 'unread';
export type RankTab = 'power' | 'battleLevel';
export type MarketTab = 'buy' | 'sell' | 'history';
export type MarketMode = 'trade' | 'request';
export type MarketFilterLevel = 'primary' | 'secondary' | 'tertiary';
export type MarketPrimaryFilterKey = 'all' | 'item' | 'material' | 'gem';
export type AllianceTab = 'hall' | 'members' | 'mine' | 'record';
export type DuelTab = 'match' | 'record';
export type ShowcaseTab = 'overview' | 'cards' | 'record';
export type MarketCategory = BagIllustrationCategory | 'all';

export interface MarketFilterOption {
    key: string;
    title: string;
    itemIds?: readonly string[];
}

@ccclass('MagicSceneLayoutConfig')
export class MagicSceneLayoutConfig {
    @property({ displayName: '\u573a\u666f\u540d\u79f0' })
    sceneName = '';

    @property({ displayName: '\u6a2a\u5411\u4f4d\u7f6e X' })
    x = 0;

    @property({ displayName: '\u7eb5\u5411\u4f4d\u7f6e Y' })
    y = 0;

    @property({ displayName: '\u7f29\u653e' })
    scale = 1;

    constructor(sceneName = '', x = 0, y = 0, scale = 1) {
        this.sceneName = sceneName;
        this.x = x;
        this.y = y;
        this.scale = scale;
    }
}

@ccclass('BeastCardLayoutConfig')
export class BeastCardLayoutConfig {
    @property({ displayName: '\u517d\u5361\u540d\u79f0' })
    cardName = '';

    @property({ displayName: '\u6a2a\u5411\u4f4d\u7f6e X' })
    x = 0;

    @property({ displayName: '\u7eb5\u5411\u4f4d\u7f6e Y' })
    y = 0;

    @property({ displayName: '\u7f29\u653e' })
    scale = 1;

    constructor(cardName = '', x = 0, y = 0, scale = 1) {
        this.cardName = cardName;
        this.x = x;
        this.y = y;
        this.scale = scale;
    }
}

export interface EntryButton {
    nodeName: string;
    displayName: string;
}

export interface SharedPopupContent {
    title?: string;
    message?: string;
    variant?: 'magicFloorConfirm' | 'beastStrengthenConfirm' | 'commerceQuantityConfirm';
    onConfirm?: () => void;
    onAgain?: () => void;
    onClose?: () => void;
}

export interface MagicMapMonsterRuntime {
    id: string;
    node: Node;
    visualNode: Node;
    skeleton: sp.Skeleton;
    spawnPosition: Vec3;
    isBoss: boolean;
    occupiedBy: string;
    hp: number;
    maxHp: number;
}

export interface RoleProfile {
    name: string;
    gender: RoleGender;
    created: boolean;
    version: number;
}

export interface RoleAssetConfig {
    gender: RoleGender;
    displayName: string;
    skelPath: string;
    skelUuid: string;
    mapScale: number;
    mapOffsetX: number;
    mapOffsetY: number;
    previewScale: number;
    previewOffsetX: number;
    previewOffsetY: number;
    pageScale: number;
    pageOffsetX: number;
    pageOffsetY: number;
}

export interface MailReward {
    name: string;
    count: string;
    itemId?: string;
    iconPath?: string;
    framePath?: string;
}

export interface MailData {
    id: string;
    category?: Exclude<MailTab, 'unread'>;
    source?: string;
    title: string;
    content: string;
    senderName: string;
    createTime: number;
    state: 0 | 1 | 2;
    rewards: MailReward[];
}

export type NoticeType = 'notice' | 'activity';

export interface NoticeData {
    id: string;
    title: string;
    content: string;
    collapseContent: string;
    time: string;
    type: NoticeType;
}

export interface RankPlayerData {
    rank: number | string;
    name: string;
    power: string;
    gender: RoleGender;
}

export interface ShopItemData {
    id: string;
    name: string;
    desc: string;
    amount: number;
    price: number;
    iconPath: string;
}

export interface ShopStoreState {
    currency: number;
    inventory: Record<string, number>;
}

export interface MarketListingData {
    id: string;
    itemId: string;
    name: string;
    category: BagIllustrationCategory;
    amount: number;
    unitPrice: number;
    iconPath: string;
    framePath: string;
}

export interface MarketSellListingData extends MarketListingData {
    mode?: MarketMode;
    categoryPath: string;
    minPrice: number;
    maxPrice: number;
}

export interface MarketTransactionData {
    id: string;
    itemId: string;
    action: 'buy' | 'sell';
    mode?: MarketMode;
    itemName: string;
    amount: number;
    totalPrice: number;
}

export interface BagBottomTabButton {
    node: Node;
    tab: BagPageTab;
    title: string;
    normalPath: string;
    activePath: string;
}

export interface BagCatalogView {
    board: Node;
    tabs: Map<BagIllustrationCategory, Node>;
    activeCategory: BagIllustrationCategory;
    itemSource: readonly BagIllustrationCatalogItem[];
    viewportName: string;
}

export interface RoleBottomTabButton {
    node: Node;
    tab: RolePageTab;
    normalPath: string;
    activePath: string;
}

