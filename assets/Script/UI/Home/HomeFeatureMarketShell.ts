import {
    Color,
    EventTouch,
    HorizontalTextAlignment,
    Label,
    Mask,
    Node,
    Overflow,
    UITransform,
    Vec3,
} from 'cc';
import * as HomeConfig from './HomeConfig';
import type {
    MarketFilterLevel,
    MarketFilterOption,
    MarketListingData,
    MarketMode,
    MarketPrimaryFilterKey,
    MarketSellListingData,
    MarketTab,
    MarketTransactionData,
} from './HomeTypes';
import { HomeViewBase } from './HomeViewBase';

/**
 * Owns market entry, mode/tab/filter state, and list refresh orchestration.
 */
export abstract class HomeFeatureMarketShell extends HomeViewBase {
    protected openMarketPanel(): void {
        this.buildMarketPanel();
        if (!this.marketPanel) return;

        const openVersion = ++this.marketOpenVersion;
        this.setMarketModeButtonsVisible(false);
        void this.openMarketPanelWhenReady(openVersion);
    }
    protected async openMarketPanelWhenReady(openVersion: number): Promise<void> {
        try {
            await this.preloadMarketModeButtonSpriteFrames();
        } catch (err) {
            console.warn('[MainHomeView] market mode button preload failed', err);
        }
        if (openVersion !== this.marketOpenVersion || !this.marketPanel?.isValid) return;

        this.marketPanel.active = true;
        this.ensureInputBlocker(this.marketPanel);
        this.marketPanel.setSiblingIndex((this.marketPanel.parent?.children.length || 1) - 1);
        this.switchMarketMode('trade', true);
        this.setMarketModeButtonsVisible(true);
    }
    protected buildMarketPanel(): void {
        if (this.marketPanel?.isValid) return;
    
        const popupParent = this.popupRoot || this.node;
        const editorPanel = popupParent.getChildByName('MarketPanel') || this.findNode('MarketPanel');
        this.marketPanel = editorPanel || this.getOrCreateEditorNode('MarketPanel', popupParent, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT, 0, 0);
        if (this.marketPanel.parent !== popupParent) {
            this.marketPanel.setParent(popupParent);
        }
        if (!editorPanel) {
            this.marketPanel.setPosition(0, 0, 0);
            (this.marketPanel.getComponent(UITransform) || this.marketPanel.addComponent(UITransform)).setContentSize(HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT);
        }
        this.marketPanel.active = false;
        this.marketPanel.off(Node.EventType.TOUCH_END);
        this.marketPanel.on(Node.EventType.TOUCH_END, (event: EventTouch) => {
            event.propagationStopped = true;
        }, this);
    
        const background = this.getOrCreateEditorSkinnedNode('MarketBackground', this.marketPanel, HomeConfig.VIEW_WIDTH, 1700, 0, 0, HomeConfig.UI_MARKET_BG);
        background.active = true;
        background.setSiblingIndex(0);
        const title = this.getOrCreateEditorLabel(this.marketPanel, 'MarketTitle', '\u96c6\u5e02', 46, 0, 720, 260, 64, new Color(255, 239, 188, 255));
        title.node.active = true;
        this.applyStrongTextStyle(title);
    
        this.marketBoard = this.getOrCreateEditorNode('MarketBoard', this.marketPanel, HomeConfig.MARKET_BOARD_WIDTH, HomeConfig.MARKET_BOARD_HEIGHT, 0, HomeConfig.MARKET_BOARD_Y);
        this.marketBoard.active = true;
        const boardSkin = this.getOrCreateEditorSkinnedNode('MarketBoardSkin', this.marketBoard, HomeConfig.MARKET_BOARD_WIDTH, HomeConfig.MARKET_BOARD_HEIGHT, 0, 0, HomeConfig.UI_MARKET_BOARD);
        boardSkin.active = true;
        boardSkin.setSiblingIndex(0);
    
        const tabsRoot = this.getOrCreateEditorNode('MarketTabs', this.marketPanel, 650, HomeConfig.MARKET_TAB_HEIGHT, 0, HomeConfig.MARKET_TAB_Y);
        tabsRoot.active = true;
        HomeConfig.MARKET_TABS.forEach((config, index) => {
            const x = (index - 1) * HomeConfig.MARKET_TAB_SPACING;
            const tab = this.getOrCreateEditorSkinnedNode(`MarketTab_${config.tab}`, tabsRoot, HomeConfig.MARKET_TAB_WIDTH, HomeConfig.MARKET_TAB_HEIGHT, x, 0, HomeConfig.UI_MARKET_TAB_NORMAL);
            tab.active = true;
            const label = this.getOrCreateEditorLabel(tab, 'MarketTabLabel', this.getMarketTabTitle(config.tab), 27, 0, 0, HomeConfig.MARKET_TAB_WIDTH - 18, HomeConfig.MARKET_TAB_HEIGHT - 12, new Color(79, 55, 35, 255));
            label.node.active = true;
            this.applyMarketTextStyle(label, 0);
            this.applyMarketTabLabelSingleLine(tab, label);
            this.marketTabNodes[config.tab] = tab;
            this.bindScaledClick(tab, () => this.switchMarketTab(config.tab));
        });
    
        const editorFilterRoot = this.marketPanel.getChildByName('MarketFilterRoot');
        this.marketFilterRoot = this.getOrCreateEditorNode('MarketFilterRoot', this.marketPanel, HomeConfig.MARKET_FILTER_ROOT_WIDTH, HomeConfig.MARKET_FILTER_ROOT_HEIGHT, 0, HomeConfig.MARKET_FILTER_Y);
        this.marketFilterRoot.active = true;
        if (!editorFilterRoot?.isValid) {
            (this.marketFilterRoot.getComponent(UITransform) || this.marketFilterRoot.addComponent(UITransform)).setContentSize(HomeConfig.MARKET_FILTER_ROOT_WIDTH, HomeConfig.MARKET_FILTER_ROOT_HEIGHT);
        }

        const primaryFilter = this.createMarketFilterSelect(
            'MarketCategoryFilter',
            'MarketCategoryLabel',
            'MarketCategoryDropdown',
            HomeConfig.MARKET_FILTER_PRIMARY_X,
            HomeConfig.MARKET_FILTER_TOP_ROW_Y,
            HomeConfig.MARKET_FILTER_CONTROL_WIDTH,
            'primary',
        );
        this.marketCategoryLabel = primaryFilter.getChildByName('MarketCategoryLabel')?.getComponent(Label) || null;

        const secondaryFilter = this.createMarketFilterSelect(
            'MarketSecondaryFilter',
            'MarketSecondaryLabel',
            'MarketSecondaryDropdown',
            HomeConfig.MARKET_FILTER_SECONDARY_X,
            HomeConfig.MARKET_FILTER_TOP_ROW_Y,
            HomeConfig.MARKET_FILTER_CONTROL_WIDTH,
            'secondary',
        );
        this.marketSecondaryFilterLabel = secondaryFilter.getChildByName('MarketSecondaryLabel')?.getComponent(Label) || null;

        const tertiaryFilter = this.createMarketFilterSelect(
            'MarketTertiaryFilter',
            'MarketTertiaryLabel',
            'MarketTertiaryDropdown',
            HomeConfig.MARKET_FILTER_TERTIARY_X,
            HomeConfig.MARKET_FILTER_BOTTOM_ROW_Y,
            HomeConfig.MARKET_FILTER_CONTROL_WIDTH,
            'tertiary',
        );
        this.marketTertiaryFilterLabel = tertiaryFilter.getChildByName('MarketTertiaryLabel')?.getComponent(Label) || null;

        const editorRefresh = this.marketFilterRoot.getChildByName('MarketRefreshButton');
        const refresh = this.getOrCreateEditorSkinnedNode('MarketRefreshButton', this.marketFilterRoot, HomeConfig.MARKET_FILTER_REFRESH_SIZE, HomeConfig.MARKET_FILTER_CONTROL_HEIGHT, HomeConfig.MARKET_FILTER_REFRESH_X, HomeConfig.MARKET_FILTER_TOP_ROW_Y, HomeConfig.UI_MARKET_FILTER_BG);
        refresh.active = true;
        if (!editorRefresh?.isValid) {
            refresh.setPosition(HomeConfig.MARKET_FILTER_REFRESH_X, HomeConfig.MARKET_FILTER_TOP_ROW_Y, 0);
            (refresh.getComponent(UITransform) || refresh.addComponent(UITransform)).setContentSize(HomeConfig.MARKET_FILTER_REFRESH_SIZE, HomeConfig.MARKET_FILTER_CONTROL_HEIGHT);
        }
        const editorRefreshLabel = refresh.getChildByName('MarketRefreshLabel');
        const refreshLabel = this.getOrCreateEditorLabel(refresh, 'MarketRefreshLabel', '\u5237\u65b0', 20, -10, 0, 42, HomeConfig.MARKET_FILTER_CONTROL_HEIGHT, new Color(81, 59, 41, 255));
        refreshLabel.node.active = true;
        if (!editorRefreshLabel?.isValid) {
            refreshLabel.node.setPosition(-10, 0, 0);
        }
        refreshLabel.horizontalAlign = HorizontalTextAlignment.CENTER;
        this.applyMarketFilterTextStyle(refreshLabel);
        const editorRefreshIcon = refresh.getChildByName('MarketRefreshIcon');
        const refreshIcon = this.getOrCreateEditorSkinnedNode('MarketRefreshIcon', refresh, HomeConfig.MARKET_FILTER_REFRESH_ICON_SIZE, HomeConfig.MARKET_FILTER_REFRESH_ICON_SIZE, 23, 0, HomeConfig.UI_MARKET_REFRESH);
        refreshIcon.active = true;
        if (!editorRefreshIcon?.isValid) {
            refreshIcon.setPosition(23, 0, 0);
        }
        this.bindScaledClick(refresh, () => {
            this.closeMarketFilterDropdown();
            this.refreshMarketList();
            this.showToast('\u96c6\u5e02\u5df2\u5237\u65b0');
        });
    
        const editorSort = this.marketFilterRoot.getChildByName('MarketSortFilter');
        const sort = this.getOrCreateEditorSkinnedNode('MarketSortFilter', this.marketFilterRoot, HomeConfig.MARKET_FILTER_SORT_WIDTH, HomeConfig.MARKET_FILTER_CONTROL_HEIGHT, HomeConfig.MARKET_FILTER_SORT_X, HomeConfig.MARKET_FILTER_BOTTOM_ROW_Y, HomeConfig.UI_MARKET_FILTER_BG);
        sort.active = true;
        if (!editorSort?.isValid) {
            (sort.getComponent(UITransform) || sort.addComponent(UITransform)).setContentSize(HomeConfig.MARKET_FILTER_SORT_WIDTH, HomeConfig.MARKET_FILTER_CONTROL_HEIGHT);
        }
        this.marketSortLabel = this.getOrCreateEditorLabel(sort, 'MarketSortLabel', '', 21, -24, 0, HomeConfig.MARKET_FILTER_SORT_WIDTH - 70, HomeConfig.MARKET_FILTER_CONTROL_HEIGHT, new Color(81, 59, 41, 255));
        this.marketSortLabel.node.active = true;
        this.marketSortLabel.horizontalAlign = HorizontalTextAlignment.CENTER;
        this.applyMarketFilterTextStyle(this.marketSortLabel);
        const sortDropdown = this.getOrCreateEditorSkinnedNode('MarketSortDropdown', sort, 14, 24, HomeConfig.MARKET_FILTER_SORT_WIDTH / 2 - 28, 0, HomeConfig.UI_MARKET_SORT_LOW_ARROW);
        sortDropdown.active = true;
        this.bindScaledClick(sort, () => this.toggleMarketSort());
        this.getOrCreateEditorNode('MarketDropdownLayer', this.marketPanel, HomeConfig.MARKET_FILTER_CONTROL_WIDTH, HomeConfig.MARKET_DROPDOWN_ROW_HEIGHT, 0, 0).active = false;
    
        this.marketViewport = this.getOrCreateEditorNode('MarketListViewport', this.marketPanel, HomeConfig.MARKET_VIEWPORT_WIDTH, HomeConfig.MARKET_VIEWPORT_HEIGHT, 0, HomeConfig.MARKET_VIEWPORT_Y);
        this.marketViewport.active = true;
        const viewportMask = this.marketViewport.getComponent(Mask) || this.marketViewport.addComponent(Mask);
        viewportMask.type = Mask.Type.GRAPHICS_RECT;
        this.marketContent = this.getOrCreateEditorNode('MarketListContent', this.marketViewport, HomeConfig.MARKET_VIEWPORT_WIDTH, HomeConfig.MARKET_VIEWPORT_HEIGHT, 0, 0);
        this.marketContent.active = true;
        this.getOrCreateEditorNode('MarketHistoryContent', this.marketViewport, HomeConfig.MARKET_VIEWPORT_WIDTH, HomeConfig.MARKET_VIEWPORT_HEIGHT, 0, 0).active = false;

        this.createMarketModeButtons();

        const back = this.getOrCreateEditorSkinnedNode('MarketBack', this.marketPanel, HomeConfig.BOTTOM_ENTRY_BACK_BUTTON_WIDTH, HomeConfig.BOTTOM_ENTRY_BACK_BUTTON_HEIGHT, -310, -708, HomeConfig.UI_MARKET_BACK);
        back.active = true;
        back.setSiblingIndex(30);
        this.bindScaledClick(back, () => this.closeMarketPanel());
    }
    protected createMarketFilterSelect(nodeName: string, labelName: string, dropdownName: string, x: number, y: number, width: number, level: MarketFilterLevel): Node {
        const editorFilter = this.marketFilterRoot!.getChildByName(nodeName);
        const filter = this.getOrCreateEditorSkinnedNode(nodeName, this.marketFilterRoot!, width, HomeConfig.MARKET_FILTER_CONTROL_HEIGHT, x, y, HomeConfig.UI_MARKET_FILTER_BG);
        filter.active = true;
        if (!editorFilter?.isValid) {
            filter.setPosition(x, y, 0);
            (filter.getComponent(UITransform) || filter.addComponent(UITransform)).setContentSize(width, HomeConfig.MARKET_FILTER_CONTROL_HEIGHT);
        }

        const editorLabel = filter.getChildByName(labelName);
        const label = this.getOrCreateEditorLabel(filter, labelName, '', 21, -18, 0, width - 48, HomeConfig.MARKET_FILTER_CONTROL_HEIGHT, new Color(81, 59, 41, 255));
        label.node.active = true;
        if (!editorLabel?.isValid) {
            label.node.setPosition(-18, 0, 0);
            (label.node.getComponent(UITransform) || label.node.addComponent(UITransform)).setContentSize(width - 48, HomeConfig.MARKET_FILTER_CONTROL_HEIGHT);
        }
        label.horizontalAlign = HorizontalTextAlignment.CENTER;
        this.applyMarketFilterTextStyle(label);

        const editorDropdown = filter.getChildByName(dropdownName);
        const dropdown = this.getOrCreateEditorSkinnedNode(dropdownName, filter, HomeConfig.MARKET_FILTER_DROPDOWN_SIZE, HomeConfig.MARKET_FILTER_DROPDOWN_SIZE, width / 2 - 19, 0, HomeConfig.UI_MARKET_DROPDOWN);
        dropdown.active = true;
        if (!editorDropdown?.isValid) {
            dropdown.setPosition(width / 2 - 19, 0, 0);
            (dropdown.getComponent(UITransform) || dropdown.addComponent(UITransform)).setContentSize(HomeConfig.MARKET_FILTER_DROPDOWN_SIZE, HomeConfig.MARKET_FILTER_DROPDOWN_SIZE);
        }
        this.bindScaledClick(filter, () => this.openMarketFilterDropdown(level));
        return filter;
    }
    protected closeMarketPanel(): void {
        this.marketOpenVersion++;
        this.closeMarketFilterDropdown();
        this.closeMarketSellItemSelectPopup();
        this.closeMarketSellConfirmPopup();
        if (this.marketPanel?.isValid) {
            this.marketPanel.active = false;
        }
    }
    protected getMarketTabTitle(tab: MarketTab): string {
        const configs = HomeConfig.MARKET_TABS_BY_MODE[this.marketMode] || HomeConfig.MARKET_TABS;
        const baseTitle = configs.find((config) => config.tab === tab)?.title || HomeConfig.MARKET_TABS.find((config) => config.tab === tab)?.title || '';
        if (tab === 'sell') {
            return `${baseTitle}\uff08${this.getCurrentMarketPostedListings().length}/${HomeConfig.MARKET_SELL_MAX_LISTINGS}\uff09`;
        }
        return baseTitle;
    }
    protected applyMarketTabLabelSingleLine(tab: Node, label: Label): void {
        const tabSize = tab.getComponent(UITransform)?.contentSize;
        const labelTransform = label.node.getComponent(UITransform) || label.node.addComponent(UITransform);
        const width = Math.max(1, (tabSize?.width || HomeConfig.MARKET_TAB_WIDTH) - 8);
        const height = Math.max(1, (tabSize?.height || HomeConfig.MARKET_TAB_HEIGHT) - 10);
        labelTransform.setContentSize(width, height);
        label.enableWrapText = false;
        label.overflow = Overflow.SHRINK;
        label.lineHeight = Math.min(height, label.fontSize + 6);
    }
    protected refreshMarketTabLabels(): void {
        HomeConfig.MARKET_TABS.forEach((config) => {
            const tabNode = this.marketTabNodes[config.tab];
            const label = tabNode?.getChildByName('MarketTabLabel')?.getComponent(Label);
            if (!tabNode?.isValid || !label) return;
            label.string = this.getMarketTabTitle(config.tab);
            this.applyMarketTextStyle(label, 0);
            this.applyMarketTabLabelSingleLine(tabNode, label);
        });
    }
    protected getMarketModeButtonSkinPaths(): string[] {
        const paths = new Set<string>();
        HomeConfig.MARKET_MODE_BUTTONS.forEach((config) => {
            paths.add(config.normalPath);
            paths.add(config.activePath);
        });
        return Array.from(paths);
    }
    protected async preloadMarketModeButtonSpriteFrames(): Promise<void> {
        const unloadedPaths = this.getMarketModeButtonSkinPaths()
            .filter((path) => !this.marketModeButtonSpriteFrames.has(path));
        if (unloadedPaths.length === 0) return;

        await Promise.all(unloadedPaths.map(async (path) => {
            const frame = await this.loadSpriteFrameAsset(path);
            this.marketModeButtonSpriteFrames.set(path, frame);
        }));
    }
    protected setMarketModeButtonsVisible(visible: boolean): void {
        const root = this.marketPanel?.getChildByName('MarketModeButtons');
        if (root?.isValid) root.active = visible;
    }
    protected applyMarketModeButtonSkin(node: Node, skinPath: string): void {
        const frame = this.marketModeButtonSpriteFrames.get(skinPath);
        const size = this.getNodeRenderSize(node, HomeConfig.MARKET_MODE_BUTTON_WIDTH, HomeConfig.MARKET_MODE_BUTTON_HEIGHT);
        if (frame) {
            this.applySpriteFrameToNode(node, frame, size.width, size.height);
            return;
        }
        this.applyUiSkin(node, skinPath, size.width, size.height);
    }
    protected createMarketModeButtons(): void {
        if (!this.marketPanel?.isValid) return;

        const editorRoot = this.marketPanel.getChildByName('MarketModeButtons');
        const root = this.getOrCreateEditorNode('MarketModeButtons', this.marketPanel, HomeConfig.VIEW_WIDTH, 116, 0, HomeConfig.MARKET_MODE_BUTTON_ROOT_Y);
        root.active = true;
        if (!editorRoot?.isValid) {
            root.setPosition(0, HomeConfig.MARKET_MODE_BUTTON_ROOT_Y, 0);
            (root.getComponent(UITransform) || root.addComponent(UITransform)).setContentSize(HomeConfig.VIEW_WIDTH, 116);
        }
        root.setSiblingIndex(31);
        HomeConfig.MARKET_MODE_BUTTONS.forEach((config) => {
            const initialSkinPath = config.mode === this.marketMode ? config.activePath : config.normalPath;
            const editorButton = root.getChildByName(config.nodeName);
            const button = this.getOrCreateEditorSkinnedNode(
                config.nodeName,
                root,
                HomeConfig.MARKET_MODE_BUTTON_WIDTH,
                HomeConfig.MARKET_MODE_BUTTON_HEIGHT,
                config.x,
                HomeConfig.MARKET_MODE_BUTTON_Y,
                initialSkinPath,
            );
            button.active = true;
            if (!editorButton?.isValid) {
                button.setPosition(config.x, HomeConfig.MARKET_MODE_BUTTON_Y, 0);
                (button.getComponent(UITransform) || button.addComponent(UITransform)).setContentSize(HomeConfig.MARKET_MODE_BUTTON_WIDTH, HomeConfig.MARKET_MODE_BUTTON_HEIGHT);
            }
            button.setSiblingIndex((button.parent?.children.length || 1) - 1);
            this.marketModeButtonNodes[config.mode] = button;
            this.bindScaledClick(button, () => this.switchMarketMode(config.mode));
        });
        this.refreshMarketModeButtonState();
    }
    protected switchMarketMode(mode: MarketMode, resetTab = false): void {
        const shouldResetTab = resetTab || this.marketMode !== mode;
        this.marketMode = mode;
        this.refreshMarketModeButtonState();
        this.refreshMarketTabLabels();
        this.switchMarketTab(shouldResetTab ? 'buy' : this.marketActiveTab);
    }
    protected refreshMarketModeButtonState(): void {
        HomeConfig.MARKET_MODE_BUTTONS.forEach((config) => {
            const node = this.marketModeButtonNodes[config.mode];
            if (!node?.isValid) return;
            const skinPath = config.mode === this.marketMode ? config.activePath : config.normalPath;
            this.applyMarketModeButtonSkin(node, skinPath);
        });
    }
    protected switchMarketTab(tab: MarketTab): void {
        this.closeMarketFilterDropdown();
        this.marketActiveTab = tab;
        this.refreshMarketTabLabels();
        this.refreshMarketModeButtonState();
        HomeConfig.MARKET_TABS.forEach((config) => {
            const node = this.marketTabNodes[config.tab];
            if (!node?.isValid) return;
            this.applyUiSkinKeepingEditorSize(node, config.tab === tab ? HomeConfig.UI_MARKET_TAB_ACTIVE : HomeConfig.UI_MARKET_TAB_NORMAL, HomeConfig.MARKET_TAB_WIDTH, HomeConfig.MARKET_TAB_HEIGHT);
        });
        if (this.marketFilterRoot?.isValid) {
            this.marketFilterRoot.active = tab !== 'history' && !this.isMarketSellManagePage();
        }
        this.refreshMarketFilterLabels();
        this.refreshMarketList();
    }
    protected isMarketSellManagePage(): boolean {
        return this.marketActiveTab === 'sell';
    }
    protected getMarketListingMode(item: MarketSellListingData): MarketMode {
        return item.mode || 'trade';
    }
    protected getMarketListingCreatedAt(item: MarketSellListingData, now = Date.now()): number {
        if (Number.isFinite(item.createdAt) && (item.createdAt || 0) > 0) return item.createdAt as number;
        const match = `${item.id || ''}`.match(/_post_(\d{10,})_/);
        const parsed = match ? Number(match[1]) : NaN;
        return Number.isFinite(parsed) && parsed > 0 ? parsed : now;
    }
    protected normalizeMarketListingExpiry(item: MarketSellListingData, now = Date.now()): void {
        const createdAt = this.getMarketListingCreatedAt(item, now);
        item.createdAt = createdAt;
        if (!Number.isFinite(item.expiresAt) || (item.expiresAt || 0) <= 0) {
            item.expiresAt = createdAt + HomeConfig.MARKET_POST_EXPIRE_DURATION_MS;
        }
    }
    protected pruneExpiredMarketPostedListings(now = Date.now()): number {
        let removedCount = 0;
        for (let index = this.marketSellListings.length - 1; index >= 0; index--) {
            const item = this.marketSellListings[index];
            this.normalizeMarketListingExpiry(item, now);
            if ((item.expiresAt || 0) > now) continue;
            this.marketSellListings.splice(index, 1);
            removedCount++;
            this.marketTransactions.unshift({
                id: `${now}_${item.id}_expire`,
                itemId: item.itemId,
                action: 'expire',
                mode: this.getMarketListingMode(item),
                itemName: item.name,
                amount: item.amount,
                totalPrice: this.getMarketTotalPrice(item.unitPrice, item.amount),
                iconPath: item.iconPath,
                framePath: item.framePath,
            });
        }
        return removedCount;
    }
    protected getCurrentMarketPostedListings(mode: MarketMode = this.marketMode): MarketSellListingData[] {
        this.pruneExpiredMarketPostedListings();
        return this.marketSellListings.filter((item) => this.getMarketListingMode(item) === mode);
    }
    protected isMarketRequestPostPage(): boolean {
        return this.marketMode === 'request' && this.marketActiveTab === 'sell';
    }
    protected getMarketPostLimitText(): string {
        return this.marketMode === 'request' ? '\u6700\u591a\u53ea\u80fd\u53d1\u5e038\u4e2a\u6c42\u8d2d\u5355' : '\u6700\u591a\u53ea\u80fd\u4e0a\u67b68\u4e2a\u7269\u54c1';
    }
    protected getMarketPostFullSuccessText(): string {
        return this.marketMode === 'request' ? '\u6c42\u8d2d\u53d1\u5e03\u6210\u529f\uff0c\u5df2\u8fbe\u5230\u6c42\u8d2d\u4e0a\u9650' : '\u4e0a\u67b6\u6210\u529f\uff0c\u5df2\u8fbe\u5230\u4e0a\u67b6\u4e0a\u9650';
    }
    protected getMarketPostSuccessText(): string {
        return this.marketMode === 'request' ? '\u6c42\u8d2d\u53d1\u5e03\u6210\u529f' : '\u4e0a\u67b6\u6210\u529f';
    }
    protected getMarketPostDoneLabel(): string {
        return this.marketMode === 'request' ? '\u5df2\u53d1\u5e03' : '\u5df2\u4e0a\u67b6';
    }
    protected getMarketPostDetailTitle(): string {
        return this.marketMode === 'request' ? '\u6c42\u8d2d\u5355\u8be6\u60c5' : '\u4e0a\u67b6\u8be6\u60c5';
    }
    protected getMarketPostPriceRangePrefix(): string {
        return this.marketMode === 'request' ? '\u6c42\u8d2d\u4ef7\u683c\u8303\u56f4' : '\u4ef7\u683c\u8303\u56f4';
    }
    protected cycleMarketCategory(): void {
        this.openMarketFilterDropdown('primary');
    }
    protected getMarketPrimaryFilterKey(key: string): MarketPrimaryFilterKey {
        return key === 'item' || key === 'material' || key === 'gem' ? key : 'all';
    }
    protected getMarketFilterOptions(level: MarketFilterLevel): MarketFilterOption[] {
        if (level === 'primary') return HomeConfig.MARKET_PRIMARY_FILTER_OPTIONS;
        if (level === 'secondary') return HomeConfig.MARKET_SECONDARY_FILTER_OPTIONS[this.marketPrimaryFilter] || [HomeConfig.MARKET_FILTER_ALL_OPTION];
        return HomeConfig.MARKET_TERTIARY_FILTER_OPTIONS[this.marketSecondaryFilter] || [HomeConfig.MARKET_FILTER_ALL_OPTION];
    }
    protected getMarketFilterSelectedKey(level: MarketFilterLevel): string {
        if (level === 'primary') return this.marketPrimaryFilter;
        if (level === 'secondary') return this.marketSecondaryFilter;
        return this.marketTertiaryFilter;
    }
    protected getMarketFilterNode(level: MarketFilterLevel): Node | null {
        if (!this.marketFilterRoot?.isValid) return null;
        if (level === 'primary') return this.marketFilterRoot.getChildByName('MarketCategoryFilter');
        if (level === 'secondary') return this.marketFilterRoot.getChildByName('MarketSecondaryFilter');
        return this.marketFilterRoot.getChildByName('MarketTertiaryFilter');
    }
    protected getMarketFilterDropdownIconNode(level: MarketFilterLevel): Node | null {
        const filter = this.getMarketFilterNode(level);
        if (!filter?.isValid) return null;
        if (level === 'primary') return filter.getChildByName('MarketCategoryDropdown');
        if (level === 'secondary') return filter.getChildByName('MarketSecondaryDropdown');
        return filter.getChildByName('MarketTertiaryDropdown');
    }
    protected refreshMarketFilterDropdownIcons(openLevel: MarketFilterLevel | null): void {
        (['primary', 'secondary', 'tertiary'] as MarketFilterLevel[]).forEach((level) => {
            const icon = this.getMarketFilterDropdownIconNode(level);
            if (!icon?.isValid) return;
            this.applyUiSkinKeepingEditorSize(
                icon,
                level === openLevel ? HomeConfig.UI_MARKET_DROPDOWN_UP : HomeConfig.UI_MARKET_DROPDOWN,
                HomeConfig.MARKET_FILTER_DROPDOWN_SIZE,
                HomeConfig.MARKET_FILTER_DROPDOWN_SIZE,
            );
        });
    }
    protected getMarketFilterTitle(level: MarketFilterLevel): string {
        const selectedKey = this.getMarketFilterSelectedKey(level);
        return this.getMarketFilterOptions(level).find((option) => option.key === selectedKey)?.title || HomeConfig.MARKET_FILTER_ALL_OPTION.title;
    }
    protected openMarketFilterDropdown(level: MarketFilterLevel): void {
        if (!this.marketPanel?.isValid) return;

        const dropdownLayer = this.marketPanel.getChildByName('MarketDropdownLayer') || this.getOrCreateEditorNode('MarketDropdownLayer', this.marketPanel, HomeConfig.MARKET_FILTER_CONTROL_WIDTH, HomeConfig.MARKET_DROPDOWN_ROW_HEIGHT, 0, 0);
        if (this.marketOpenFilterDropdown === level && dropdownLayer.active) {
            this.closeMarketFilterDropdown();
            return;
        }

        const source = this.getMarketFilterNode(level);
        if (!source?.isValid) return;

        const options = this.getMarketFilterOptions(level);
        const selectedKey = this.getMarketFilterSelectedKey(level);
        const sourceSize = this.getNodeRenderSize(source, HomeConfig.MARKET_FILTER_CONTROL_WIDTH, HomeConfig.MARKET_FILTER_CONTROL_HEIGHT);
        const dropdownWidth = sourceSize.width || HomeConfig.MARKET_FILTER_CONTROL_WIDTH;
        const dropdownHeight = Math.max(HomeConfig.MARKET_DROPDOWN_ROW_HEIGHT, options.length * HomeConfig.MARKET_DROPDOWN_ROW_HEIGHT);
        const panelTransform = this.marketPanel.getComponent(UITransform) || this.marketPanel.addComponent(UITransform);
        const localPosition = panelTransform.convertToNodeSpaceAR(source.getWorldPosition(new Vec3()));
        dropdownLayer.active = true;
        this.marketOpenFilterDropdown = level;
        this.refreshMarketFilterDropdownIcons(level);
        dropdownLayer.setSiblingIndex((dropdownLayer.parent?.children.length || 1) - 1);
        dropdownLayer.setPosition(localPosition.x, localPosition.y - sourceSize.height / 2 - dropdownHeight / 2 - 2, 0);
        (dropdownLayer.getComponent(UITransform) || dropdownLayer.addComponent(UITransform)).setContentSize(dropdownWidth, dropdownHeight);
        dropdownLayer.children
            .filter((child) => /^MarketDropdownItem_\d+$/.test(child.name))
            .forEach((child) => {
                child.active = false;
            });

        const startY = dropdownHeight / 2 - HomeConfig.MARKET_DROPDOWN_ROW_HEIGHT / 2;
        options.forEach((option, index) => {
            const selected = option.key === selectedKey;
            const rowY = startY - index * HomeConfig.MARKET_DROPDOWN_ROW_HEIGHT;
            const skinPath = selected ? HomeConfig.UI_MARKET_DROPDOWN_ITEM_ACTIVE : HomeConfig.UI_MARKET_DROPDOWN_ITEM_NORMAL;
            const row = this.getOrCreateEditorSkinnedNode(
                `MarketDropdownItem_${index + 1}`,
                dropdownLayer,
                dropdownWidth,
                HomeConfig.MARKET_DROPDOWN_ROW_HEIGHT,
                0,
                rowY,
                skinPath,
            );
            row.active = true;
            row.setPosition(0, rowY, 0);
            (row.getComponent(UITransform) || row.addComponent(UITransform)).setContentSize(dropdownWidth, HomeConfig.MARKET_DROPDOWN_ROW_HEIGHT);
            this.applyUiSkin(row, skinPath, dropdownWidth, HomeConfig.MARKET_DROPDOWN_ROW_HEIGHT);
            const label = this.getOrCreateEditorLabel(row, 'MarketDropdownItemLabel', option.title, HomeConfig.MARKET_DROPDOWN_LABEL_FONT_SIZE, 0, 0, dropdownWidth - 12, HomeConfig.MARKET_DROPDOWN_ROW_HEIGHT, selected ? new Color(255, 240, 192, 255) : new Color(184, 157, 118, 255));
            label.node.active = true;
            label.node.setPosition(0, 0, 0);
            (label.node.getComponent(UITransform) || label.node.addComponent(UITransform)).setContentSize(dropdownWidth - 12, HomeConfig.MARKET_DROPDOWN_ROW_HEIGHT);
            label.horizontalAlign = HorizontalTextAlignment.CENTER;
            this.applyMarketDropdownTextStyle(label, selected);
            this.bindScaledClick(row, () => this.selectMarketFilter(level, option.key));
        });
    }
    protected closeMarketFilterDropdown(): void {
        this.marketOpenFilterDropdown = null;
        const dropdownLayer = this.marketPanel?.getChildByName('MarketDropdownLayer');
        if (dropdownLayer?.isValid) dropdownLayer.active = false;
        this.refreshMarketFilterDropdownIcons(null);
    }
    protected selectMarketFilter(level: MarketFilterLevel, key: string): void {
        if (level === 'primary') {
            this.marketPrimaryFilter = this.getMarketPrimaryFilterKey(key);
            this.marketCategory = this.marketPrimaryFilter === 'all' ? 'all' : this.marketPrimaryFilter;
            this.marketSecondaryFilter = 'all';
            this.marketTertiaryFilter = 'all';
        } else if (level === 'secondary') {
            this.marketSecondaryFilter = this.getMarketFilterOptions('secondary').some((option) => option.key === key) ? key : 'all';
            this.marketTertiaryFilter = 'all';
        } else {
            this.marketTertiaryFilter = this.getMarketFilterOptions('tertiary').some((option) => option.key === key) ? key : 'all';
        }

        this.closeMarketFilterDropdown();
        this.refreshMarketFilterLabels();
        this.refreshMarketList();
    }
    protected toggleMarketSort(): void {
        this.closeMarketFilterDropdown();
        this.marketSortAscending = !this.marketSortAscending;
        this.refreshMarketFilterLabels();
        this.refreshMarketList();
    }
    protected refreshMarketFilterLabels(): void {
        if (this.marketCategoryLabel) {
            this.marketCategoryLabel.string = this.getMarketFilterTitle('primary');
            this.applyMarketFilterTextStyle(this.marketCategoryLabel);
        }
        if (this.marketSecondaryFilterLabel) {
            this.marketSecondaryFilterLabel.string = this.getMarketFilterTitle('secondary');
            this.applyMarketFilterTextStyle(this.marketSecondaryFilterLabel);
        }
        if (this.marketTertiaryFilterLabel) {
            this.marketTertiaryFilterLabel.string = this.getMarketFilterTitle('tertiary');
            this.applyMarketFilterTextStyle(this.marketTertiaryFilterLabel);
        }
        if (this.marketSortLabel) {
            this.marketSortLabel.string = this.marketSortAscending ? '\u4ef7\u683c\u4ece\u4f4e\u5230\u9ad8' : '\u4ef7\u683c\u4ece\u9ad8\u5230\u4f4e';
            this.applyMarketFilterTextStyle(this.marketSortLabel);
        }
        const sortDropdown = this.marketFilterRoot?.getChildByName('MarketSortFilter')?.getChildByName('MarketSortDropdown');
        if (sortDropdown?.isValid) {
            this.applyUiSkinKeepingEditorSize(sortDropdown, this.marketSortAscending ? HomeConfig.UI_MARKET_SORT_LOW_ARROW : HomeConfig.UI_MARKET_SORT_HIGH_ARROW, 14, 24);
        }
    }
    protected getMarketCurrentAction(): 'buy' | 'sell' {
        if (this.marketMode === 'request') {
            return this.marketActiveTab === 'sell' ? 'buy' : 'sell';
        }
        return this.marketActiveTab === 'sell' ? 'sell' : 'buy';
    }
    protected getMarketActionButtonText(): string {
        if (this.marketMode === 'request') {
            return this.marketActiveTab === 'sell' ? '\u6c42\u8d2d' : '\u51fa\u552e';
        }
        return this.marketActiveTab === 'sell' ? '\u4e0a\u67b6' : '\u8d2d\u4e70';
    }
    protected getMarketDetailActionText(): string {
        if (this.marketMode === 'request') {
            return this.marketActiveTab === 'sell' ? '\u53d1\u5e03\u6c42\u8d2d' : '\u51fa\u552e\u7ed9\u6c42\u8d2d\u5355';
        }
        return this.marketActiveTab === 'sell' ? '\u51fa\u552e\u4e0a\u67b6' : '\u8d2d\u4e70';
    }
    protected getMarketConfirmTitle(): string {
        if (this.marketMode === 'request') {
            return this.marketActiveTab === 'sell' ? '\u6c42\u8d2d\u786e\u8ba4' : '\u51fa\u552e\u786e\u8ba4';
        }
        return this.marketActiveTab === 'sell' ? '\u4e0a\u67b6\u786e\u8ba4' : '\u8d2d\u4e70\u786e\u8ba4';
    }
    protected getMarketSuccessTitle(action: 'buy' | 'sell'): string {
        if (this.marketMode === 'request') {
            return action === 'buy' ? '\u6c42\u8d2d\u53d1\u5e03\u6210\u529f' : '\u51fa\u552e\u6210\u529f';
        }
        return action === 'buy' ? '\u8d2d\u4e70\u6210\u529f' : '\u4e0a\u67b6\u6210\u529f';
    }
    protected getMarketHistoryEmptyText(): string {
        return this.marketMode === 'request' ? '\u6682\u65e0\u6c42\u8d2d\u8bb0\u5f55' : '\u6682\u65e0\u4ea4\u6613\u8bb0\u5f55';
    }
    protected getMarketTransactionStatus(transaction: MarketTransactionData): string {
        const mode = transaction.mode || 'trade';
        if (mode === 'request') {
            if (transaction.action === 'post') return '\u53d1\u5e03\u6c42\u8d2d';
            if (transaction.action === 'cancel') return '\u64a4\u9500\u6c42\u8d2d';
            if (transaction.action === 'expire') return '\u6c42\u8d2d\u5230\u671f';
            return transaction.action === 'buy' ? '\u6c42\u8d2d\u53d1\u5e03' : '\u51fa\u552e\u6210\u529f';
        }
        if (transaction.action === 'post') return '\u4e0a\u67b6\u6210\u529f';
        if (transaction.action === 'cancel') return '\u7269\u54c1\u4e0b\u67b6';
        if (transaction.action === 'expire') return '\u5230\u671f\u4e0b\u67b6';
        return transaction.action === 'buy' ? '\u8d2d\u4e70\u6210\u529f' : '\u51fa\u552e\u6210\u529f';
    }
    protected getMarketRecordTitle(mode: MarketMode = this.marketMode): string {
        return mode === 'request' ? '\u6c42\u8d2d\u8bb0\u5f55' : '\u4ea4\u6613\u8bb0\u5f55';
    }
    protected marketFilterMatchesOption(item: MarketListingData, option: MarketFilterOption | undefined): boolean {
        if (!option || option.key === 'all') return true;
        const itemId = item.itemId || item.id.replace(/^market_/, '');
        return !!option.itemIds && option.itemIds.indexOf(itemId) >= 0;
    }
    protected marketListingMatchesFilters(item: MarketListingData): boolean {
        if (this.marketPrimaryFilter !== 'all' && item.category !== this.marketPrimaryFilter) return false;
        const secondaryOption = this.getMarketFilterOptions('secondary').find((option) => option.key === this.marketSecondaryFilter);
        if (!this.marketFilterMatchesOption(item, secondaryOption)) return false;
        const tertiaryOption = this.getMarketFilterOptions('tertiary').find((option) => option.key === this.marketTertiaryFilter);
        return this.marketFilterMatchesOption(item, tertiaryOption);
    }
    protected refreshMarketList(): void {
        if (!this.marketPanel?.isValid) return;
        this.pruneExpiredMarketPostedListings();
    
        const sellManagePage = this.isMarketSellManagePage();
        const historyPage = this.marketActiveTab === 'history';
        const viewportHeight = historyPage
            ? HomeConfig.MARKET_HISTORY_VIEWPORT_HEIGHT
            : sellManagePage
                ? HomeConfig.MARKET_SELL_VIEWPORT_HEIGHT
                : HomeConfig.MARKET_VIEWPORT_HEIGHT;
        const viewportY = historyPage
            ? HomeConfig.MARKET_HISTORY_VIEWPORT_Y
            : sellManagePage
                ? HomeConfig.MARKET_SELL_VIEWPORT_Y
                : HomeConfig.MARKET_VIEWPORT_Y;
        this.marketViewport = this.getOrCreateEditorNode('MarketListViewport', this.marketPanel, HomeConfig.MARKET_VIEWPORT_WIDTH, viewportHeight, 0, viewportY);
        this.marketViewport.active = true;
        this.marketViewport.setPosition(0, viewportY, 0);
        (this.marketViewport.getComponent(UITransform) || this.marketViewport.addComponent(UITransform)).setContentSize(HomeConfig.MARKET_VIEWPORT_WIDTH, viewportHeight);
        this.marketViewport.setSiblingIndex(15);
        const viewportTransform = this.marketViewport.getComponent(UITransform) || this.marketViewport.addComponent(UITransform);
        const effectiveViewportWidth = viewportTransform.contentSize.width || HomeConfig.MARKET_VIEWPORT_WIDTH;
        const effectiveViewportHeight = viewportTransform.contentSize.height || viewportHeight;
        const mask = this.marketViewport.getComponent(Mask) || this.marketViewport.addComponent(Mask);
        mask.type = Mask.Type.GRAPHICS_RECT;
    
        if (this.marketActiveTab === 'history') {
            this.buildMarketHistoryList();
            return;
        }

        if (this.isMarketSellManagePage()) {
            this.buildMarketSellListingPage();
            return;
        }
    
        const listings = HomeConfig.MARKET_ITEMS
            .filter((item) => this.marketListingMatchesFilters(item))
            .sort((a, b) => this.marketSortAscending ? a.unitPrice - b.unitPrice : b.unitPrice - a.unitPrice);
        const existingContent = this.marketViewport.getChildByName('MarketListContent');
        const templateRow1 = existingContent?.getChildByName('MarketListing_1');
        const templateRow2 = existingContent?.getChildByName('MarketListing_2');
        const templateGap = templateRow1?.isValid && templateRow2?.isValid
            ? Math.abs(templateRow1.position.y - templateRow2.position.y)
            : 0;
        const rowGap = templateGap >= HomeConfig.MARKET_ROW_HEIGHT ? templateGap : HomeConfig.MARKET_ROW_GAP;
        const contentHeight = Math.max(effectiveViewportHeight, listings.length * rowGap + 16);
        const historyContent = this.marketViewport.getChildByName('MarketHistoryContent');
        if (historyContent?.isValid) historyContent.active = false;
        this.marketContent = this.getOrCreateEditorNode('MarketListContent', this.marketViewport, effectiveViewportWidth, contentHeight, 0, 0);
        this.marketContent.active = true;
        (this.marketContent.getComponent(UITransform) || this.marketContent.addComponent(UITransform)).setContentSize(effectiveViewportWidth, contentHeight);
        this.marketContent.children
            .filter((child) => /^MarketListing_\d+$/.test(child.name)
                || /^MarketSellListing_\d+$/.test(child.name)
                || child.name === 'MarketSellAddSlot')
            .forEach((child) => {
                child.active = false;
            });
        const empty = this.getOrCreateEditorLabel(this.marketContent, 'MarketListEmpty', '\u6682\u65e0\u7b26\u5408\u6761\u4ef6\u7684\u5546\u54c1', 28, 0, 260, 420, 56, new Color(92, 70, 50, 255));
        empty.node.active = listings.length === 0;
        this.applyMarketTextStyle(empty, 1);
        const startY = templateRow1?.isValid && templateGap >= HomeConfig.MARKET_ROW_HEIGHT
            ? templateRow1.position.y
            : templateRow2?.isValid
                ? templateRow2.position.y + rowGap
                : templateRow1?.isValid
                    ? templateRow1.position.y
                    : effectiveViewportHeight / 2 - HomeConfig.MARKET_ROW_HEIGHT / 2 - 10;
        listings.forEach((item, index) => {
            this.createMarketListingRow(this.marketContent!, item, index, startY - index * rowGap);
        });
        this.syncMarketListingPriceLayout(this.marketContent);
    
        const maxScrollY = Math.max(0, contentHeight - effectiveViewportHeight);
        this.clampMarketListScroll(this.marketContent, maxScrollY);
        this.bindBagGridScroll(this.marketViewport, this.marketContent, maxScrollY);
        this.bindBagGridScroll(this.marketContent, this.marketContent, maxScrollY);
    }
}
