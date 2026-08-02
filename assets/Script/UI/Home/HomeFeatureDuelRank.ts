import {
    Color,
    Graphics,
    HorizontalTextAlignment,
    Label,
    Mask,
    Node,
    Overflow,
    ScrollView,
    UITransform,
    VerticalTextAlignment,
} from 'cc';
import * as HomeConfig from './HomeConfig';
import { HomeViewBase } from './HomeViewBase';
import type { RoleGender } from './HomeTypes';

type DuelJianghuRankEntry = {
    name: string;
    investAmount: number;
    rewardAmount: number;
    gender: RoleGender;
};

const JIANGHU_RANK_INVEST_ROW_WIDTH = 740.946;
const JIANGHU_RANK_INVEST_ROW_HEIGHT = 116.995;
const JIANGHU_RANK_INVEST_ROW_GAP = 12;
const JIANGHU_RANK_INVEST_ROW_TOP_PADDING = 12;
const JIANGHU_RANK_INVEST_ROW_BOTTOM_PADDING = 96;
const JIANGHU_RANK_INVEST_VIEW_WIDTH = 750;
const JIANGHU_RANK_INVEST_VIEW_HEIGHT = 666.009;

abstract class HomeFeatureDuelRankHost extends HomeViewBase {
    protected abstract getOrCreateEditorNode(name: string, parent: Node, width: number, height: number, x: number, y: number): Node;
    protected abstract getOrCreateEditorSkinnedNode(name: string, parent: Node, width: number, height: number, x: number, y: number, skinPath: string): Node;
    protected abstract getOrCreateDuelRoomLabel(parent: Node, name: string, text: string, fontSize: number, x: number, y: number, width: number, height: number, color: Color): Label;
    protected abstract setLabelOutline(label: Label, color: Color, width: number): void;
}

/** 江湖逃杀投入榜页面。 */
export abstract class HomeFeatureDuelRank extends HomeFeatureDuelRankHost {
    protected ensureDuelJianghuRankPage(page: Node): Node {
        const rankPage = this.getOrCreateEditorNode('JianghuRankPage', page, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT, 0, 0);
        this.ensureInputBlocker(rankPage);

        const bg = this.getOrCreateEditorSkinnedNode(
            'JianghuRankPageBackground',
            rankPage,
            HomeConfig.VIEW_WIDTH,
            HomeConfig.VIEW_HEIGHT,
            0,
            0,
            HomeConfig.UI_DUEL_JIANGHU_RANK_BG,
        );
        const legacyGraphics = bg.getComponent(Graphics);
        if (legacyGraphics) {
            legacyGraphics.clear();
            legacyGraphics.enabled = false;
        }
        bg.active = true;
        bg.setSiblingIndex(0);

        this.hideLegacyDuelJianghuRankNodes(rankPage);
        this.ensureDuelJianghuRankInvestTitle(rankPage);
        this.ensureDuelJianghuRankTopRoot(rankPage);
        this.ensureDuelJianghuRankInvestHeader(rankPage);
        this.ensureDuelJianghuRankInvestList(rankPage);
        this.ensureDuelJianghuRankInvestFooter(rankPage);

        this.refreshDuelJianghuRankPage(rankPage);
        return rankPage;
    }
    protected hideLegacyDuelJianghuRankNodes(rankPage: Node): void {
        [
            'JianghuRankPageTitle',
            'JianghuRankMetricTabs',
            'JianghuRankListRows',
            'JianghuRankSelfRow',
            'JianghuRankPeriodTabs',
            'JianghuRankPagePlaceholder',
        ].forEach((name) => {
            const node = rankPage.getChildByName(name);
            if (node) node.active = false;
        });
    }
    protected ensureDuelJianghuRankInvestTitle(rankPage: Node): void {
        const titleBarExisted = !!rankPage.getChildByName('JianghuRankInvestTitleBar');
        const titleBar = this.getOrCreateEditorSkinnedNode(
            'JianghuRankInvestTitleBar',
            rankPage,
            182,
            36,
            0,
            680,
            HomeConfig.UI_DUEL_JIANGHU_RANK_INVEST_TITLE_BAR,
        );
        titleBar.active = true;
        if (!titleBarExisted) titleBar.setScale(1.5, 1.5, 1);
        titleBar.setSiblingIndex(2);

        const titleExisted = !!titleBar.getChildByName('JianghuRankInvestTitleLabel');
        const title = this.getOrCreateDuelRoomLabel(
            titleBar,
            'JianghuRankInvestTitleLabel',
            '\u5468\u699c',
            27,
            0,
            1.363,
            130,
            32,
            new Color(60, 44, 30, 255),
        );
        title.string = '\u5468\u699c';
        if (!titleExisted) {
            title.fontSize = 27;
            title.lineHeight = 33;
            title.color = new Color(60, 44, 30, 255);
            title.horizontalAlign = HorizontalTextAlignment.CENTER;
            title.verticalAlign = VerticalTextAlignment.CENTER;
            title.overflow = Overflow.SHRINK;
            this.setLabelOutline(title, new Color(255, 246, 214, 255), 2);
        }
        title.node.setSiblingIndex(0);
    }
    protected ensureDuelJianghuRankTopRoot(rankPage: Node): Node {
        const topRootExisted = !!rankPage.getChildByName('JianghuRankTopRoot');
        const topRoot = this.getOrCreateEditorNode('JianghuRankTopRoot', rankPage, 700, 320, 0, 405);
        topRoot.active = true;
        if (!topRootExisted) topRoot.setScale(1.1, 1.1, 1);
        topRoot.setSiblingIndex(3);
        this.ensureDuelJianghuRankTopCard(topRoot, 'JianghuRankTop2', HomeConfig.UI_DUEL_JIANGHU_RANK_TOP2_BG, -233.675, -8, 198, 232, 1.1);
        this.ensureDuelJianghuRankTopCard(topRoot, 'JianghuRankTop1', HomeConfig.UI_DUEL_JIANGHU_RANK_TOP1_BG, 0, 24, 216, 252, 1.3);
        this.ensureDuelJianghuRankTopCard(topRoot, 'JianghuRankTop3', HomeConfig.UI_DUEL_JIANGHU_RANK_TOP3_BG, 234.131, -8, 198, 230, 1.1);
        return topRoot;
    }
    protected ensureDuelJianghuRankTopCard(parent: Node, name: string, skinPath: string, x: number, y: number, width: number, height: number, scale = 1): Node {
        const cardExisted = !!parent.getChildByName(name);
        const card = this.getOrCreateEditorSkinnedNode(name, parent, width, height, x, y, skinPath);
        card.active = true;
        if (!cardExisted) {
            card.setScale(scale, scale, 1);
            (card.getComponent(UITransform) || card.addComponent(UITransform)).setContentSize(width, height);
        }
        card.setSiblingIndex(name.endsWith('1') ? 1 : name.endsWith('2') ? 0 : 2);

        this.ensureDuelJianghuRankAvatar(card, `${name}Avatar`, 0, 26, 74, 58);

        const nameLabelExisted = !!card.getChildByName(`${name}NameLabel`);
        const nameLabel = this.getOrCreateDuelRoomLabel(card, `${name}NameLabel`, '\u5c11\u4fa0', 23, 0, -50, width - 28, 38, new Color(255, 246, 210, 255));
        if (!nameLabelExisted) {
            nameLabel.horizontalAlign = HorizontalTextAlignment.CENTER;
            nameLabel.overflow = Overflow.SHRINK;
            this.setLabelOutline(nameLabel, new Color(94, 46, 20, 255), 2);
        }
        nameLabel.node.setSiblingIndex(2);

        const metricLabelExisted = !!card.getChildByName(`${name}MetricLabel`);
        const metricLabel = this.getOrCreateDuelRoomLabel(card, `${name}MetricLabel`, '', 19, 0, -86, width - 28, 34, new Color(139, 54, 20, 255));
        metricLabel.node.active = false;
        if (!metricLabelExisted) {
            metricLabel.horizontalAlign = HorizontalTextAlignment.CENTER;
            metricLabel.overflow = Overflow.SHRINK;
            this.setLabelOutline(metricLabel, new Color(255, 231, 164, 255), 1);
        }
        metricLabel.node.setSiblingIndex(3);
        return card;
    }
    protected ensureDuelJianghuRankInvestHeader(rankPage: Node): void {
        const headerExisted = !!rankPage.getChildByName('JianghuRankInvestHeader');
        const header = this.getOrCreateEditorNode('JianghuRankInvestHeader', rankPage, 640, 42, 0, 210);
        header.active = true;
        if (!headerExisted) header.setScale(1.1, 1.1, 1);
        header.setSiblingIndex(4);

        [
            { name: 'Rank', text: '\u540d\u6b21', x: -280, width: 70 },
            { name: 'Avatar', text: '\u5934\u50cf', x: -220, width: 70 },
            { name: 'Player', text: '\u73a9\u5bb6\u540d', x: -112, width: 160 },
            { name: 'Invest', text: '\u6295\u5165\u5143\u5b9d\u6570', x: 82, width: 150 },
            { name: 'Reward', text: '\u5956\u52b1\uff08\u5143\u5b9d\u6570\u91cf\uff09', x: 235, width: 160 },
        ].forEach((column) => {
            const labelExisted = !!header.getChildByName(`JianghuRankInvestHeader${column.name}Label`);
            const label = this.getOrCreateDuelRoomLabel(
                header,
                `JianghuRankInvestHeader${column.name}Label`,
                column.text,
                20,
                column.x,
                0,
                column.width,
                36,
                new Color(103, 64, 35, 255),
            );
            label.string = column.text;
            if (!labelExisted) {
                label.fontSize = 20;
                label.lineHeight = 26;
                label.color = new Color(103, 64, 35, 255);
                label.horizontalAlign = HorizontalTextAlignment.CENTER;
                label.verticalAlign = VerticalTextAlignment.CENTER;
                label.overflow = Overflow.SHRINK;
                this.setLabelOutline(label, new Color(255, 246, 214, 255), 1);
            }
        });
    }
    protected ensureDuelJianghuRankInvestList(rankPage: Node): Node {
        const listExisted = !!rankPage.getChildByName('JianghuRankInvestList');
        const list = this.getOrCreateEditorNode('JianghuRankInvestList', rankPage, JIANGHU_RANK_INVEST_VIEW_WIDTH, JIANGHU_RANK_INVEST_VIEW_HEIGHT, 0, -142);
        list.active = true;
        if (!listExisted) {
            (list.getComponent(UITransform) || list.addComponent(UITransform)).setContentSize(JIANGHU_RANK_INVEST_VIEW_WIDTH, JIANGHU_RANK_INVEST_VIEW_HEIGHT);
        }
        list.setSiblingIndex(5);

        const contentHeight = this.getDuelJianghuRankInvestContentHeight();
        const content = this.getOrCreateEditorNode('JianghuRankInvestContent', list, JIANGHU_RANK_INVEST_VIEW_WIDTH, contentHeight, 0, 0);
        content.active = true;
        this.moveLegacyDuelJianghuRankRowsIntoContent(list, content);

        const rowLayout = this.getDuelJianghuRankInvestRowLayout(content);
        (content.getComponent(UITransform) || content.addComponent(UITransform)).setContentSize(JIANGHU_RANK_INVEST_VIEW_WIDTH, rowLayout.contentHeight);
        content.setPosition(0, this.getDuelJianghuRankInvestContentTopY(list, rowLayout.contentHeight), 0);
        this.setupDuelJianghuRankInvestScroll(list, content);

        for (let index = 0; index < 10; index += 1) {
            const rank = index + 1;
            const rowY = rowLayout.firstRowY - index * rowLayout.rowStep;
            const row = this.ensureDuelJianghuRankInvestRow(content, `JianghuRankInvestRow_${rank}`, 0, rowY);
            row.setPosition(0, rowY, 0);
            row.setSiblingIndex(index);
        }

        return list;
    }
    protected ensureDuelJianghuRankInvestRow(parent: Node, name: string, x: number, y: number): Node {
        const rowExisted = !!parent.getChildByName(name);
        const row = this.getOrCreateEditorSkinnedNode(name, parent, JIANGHU_RANK_INVEST_ROW_WIDTH, JIANGHU_RANK_INVEST_ROW_HEIGHT, x, y, this.getDuelJianghuRankInvestRowBg(name));
        row.active = true;
        if (!rowExisted) {
            (row.getComponent(UITransform) || row.addComponent(UITransform)).setContentSize(JIANGHU_RANK_INVEST_ROW_WIDTH, JIANGHU_RANK_INVEST_ROW_HEIGHT);
        }

        const rankLabelExisted = !!row.getChildByName(`${name}RankLabel`);
        const rankLabel = this.getOrCreateDuelRoomLabel(row, `${name}RankLabel`, '1', 24, -307.828, 0, 60, 42, new Color(210, 102, 46, 255));
        if (!rankLabelExisted) this.applyDuelJianghuRankText(rankLabel, 24, new Color(210, 102, 46, 255), HorizontalTextAlignment.CENTER, 0);
        rankLabel.node.setSiblingIndex(0);

        this.ensureDuelJianghuRankAvatar(row, `${name}Avatar`, -242.03, 0, 54, 44);

        const nameLabelExisted = !!row.getChildByName(`${name}NameLabel`);
        const nameLabel = this.getOrCreateDuelRoomLabel(row, `${name}NameLabel`, '\u5c11\u4fa0', 22, -79.535, 0, 170, 42, new Color(73, 43, 24, 255));
        if (!nameLabelExisted) this.applyDuelJianghuRankText(nameLabel, 22, new Color(73, 43, 24, 255), HorizontalTextAlignment.LEFT, 0);
        nameLabel.node.setSiblingIndex(3);

        const investIconExisted = !!row.getChildByName(`${name}InvestYuanbaoIcon`);
        const investIcon = this.getOrCreateEditorSkinnedNode(`${name}InvestYuanbaoIcon`, row, 26, 24, 57.066, 9.703, HomeConfig.UI_DUEL_YUANBAO_ICON);
        investIcon.active = true;
        if (!investIconExisted) investIcon.setPosition(57.066, 9.703, 0);
        investIcon.setSiblingIndex(4);

        const investLabelExisted = !!row.getChildByName(`${name}InvestAmountLabel`);
        const investLabel = this.getOrCreateDuelRoomLabel(row, `${name}InvestAmountLabel`, '0', 22, 123.066, 9.703, 104, 42, new Color(115, 68, 29, 255));
        if (!investLabelExisted) this.applyDuelJianghuRankText(investLabel, 22, new Color(115, 68, 29, 255), HorizontalTextAlignment.LEFT, 0);
        investLabel.node.setSiblingIndex(5);

        const rewardIconExisted = !!row.getChildByName(`${name}RewardYuanbaoIcon`);
        const rewardIcon = this.getOrCreateEditorSkinnedNode(`${name}RewardYuanbaoIcon`, row, 26, 24, 203.066, 9.703, HomeConfig.UI_DUEL_YUANBAO_ICON);
        rewardIcon.active = true;
        if (!rewardIconExisted) rewardIcon.setPosition(203.066, 9.703, 0);
        rewardIcon.setSiblingIndex(6);

        const rewardLabelExisted = !!row.getChildByName(`${name}RewardAmountLabel`);
        const rewardLabel = this.getOrCreateDuelRoomLabel(row, `${name}RewardAmountLabel`, '0', 22, 269.066, 8.36, 104, 42, new Color(115, 68, 29, 255));
        if (!rewardLabelExisted) this.applyDuelJianghuRankText(rewardLabel, 22, new Color(115, 68, 29, 255), HorizontalTextAlignment.LEFT, 0);
        rewardLabel.node.setSiblingIndex(7);

        return row;
    }
    protected getDuelJianghuRankInvestContentHeight(): number {
        return JIANGHU_RANK_INVEST_ROW_TOP_PADDING
            + JIANGHU_RANK_INVEST_ROW_BOTTOM_PADDING
            + JIANGHU_RANK_INVEST_ROW_HEIGHT * 10
            + JIANGHU_RANK_INVEST_ROW_GAP * 9;
    }
    protected getDuelJianghuRankInvestRowLayout(content: Node): { contentHeight: number; firstRowY: number; rowStep: number; rowHeight: number } {
        const firstRow = content.getChildByName('JianghuRankInvestRow_1');
        const secondRow = content.getChildByName('JianghuRankInvestRow_2');
        const firstTransform = firstRow?.getComponent(UITransform);
        const rowHeight = firstTransform?.contentSize.height || JIANGHU_RANK_INVEST_ROW_HEIGHT;
        const rowStep = firstRow && secondRow
            ? Math.abs(firstRow.position.y - secondRow.position.y) || rowHeight + JIANGHU_RANK_INVEST_ROW_GAP
            : rowHeight + JIANGHU_RANK_INVEST_ROW_GAP;
        const contentHeight = rowHeight
            + rowStep * 9
            + JIANGHU_RANK_INVEST_ROW_TOP_PADDING
            + JIANGHU_RANK_INVEST_ROW_BOTTOM_PADDING;
        const firstRowY = contentHeight / 2 - JIANGHU_RANK_INVEST_ROW_TOP_PADDING - rowHeight / 2;
        return { contentHeight, firstRowY, rowStep, rowHeight };
    }
    protected getDuelJianghuRankInvestContentTopY(list: Node, contentHeight: number): number {
        const listHeight = list.getComponent(UITransform)?.contentSize.height || JIANGHU_RANK_INVEST_VIEW_HEIGHT;
        return listHeight / 2 - contentHeight / 2;
    }
    protected moveLegacyDuelJianghuRankRowsIntoContent(list: Node, content: Node): void {
        for (let rank = 1; rank <= 10; rank += 1) {
            const row = list.getChildByName(`JianghuRankInvestRow_${rank}`);
            if (row) row.setParent(content);
        }
    }
    protected setupDuelJianghuRankInvestScroll(list: Node, content: Node): void {
        const mask = list.getComponent(Mask) || list.addComponent(Mask);
        mask.type = Mask.Type.GRAPHICS_RECT;
        mask.enabled = true;

        const scroll = list.getComponent(ScrollView) || list.addComponent(ScrollView);
        scroll.content = content;
        scroll.horizontal = false;
        scroll.vertical = true;
        scroll.inertia = true;
        scroll.brake = 0.75;
        scroll.elastic = false;
        scroll.bounceDuration = 0;
        scroll.enabled = true;
    }
    protected getDuelJianghuRankInvestRowBg(rowName: string): string {
        const rank = Number(rowName.replace('JianghuRankInvestRow_', ''));
        if (rank === 1) return HomeConfig.UI_DUEL_JIANGHU_RANK_ROW_TOP1_BG;
        if (rank === 2) return HomeConfig.UI_DUEL_JIANGHU_RANK_ROW_TOP2_BG;
        if (rank === 3) return HomeConfig.UI_DUEL_JIANGHU_RANK_ROW_TOP3_BG;
        return HomeConfig.UI_DUEL_JIANGHU_RANK_ROW_BG;
    }
    protected ensureDuelJianghuRankInvestFooter(rankPage: Node): void {
        const footerExisted = !!rankPage.getChildByName('JianghuRankInvestFooterLabel');
        const footer = this.getOrCreateDuelRoomLabel(
            rankPage,
            'JianghuRankInvestFooterLabel',
            '\u5b9a\u699c\u65f6\u95f4\uff1a\u4eca\u592922\uff1a00\n\u6392\u884c\u699c\u6bcf\u5929\u5237\u65b0\u4e00\u6b21',
            20,
            132.487,
            -720,
            360,
            66,
            new Color(91, 62, 38, 255),
        );
        footer.string = '\u5b9a\u699c\u65f6\u95f4\uff1a\u4eca\u592922\uff1a00\n\u6392\u884c\u699c\u6bcf\u5929\u5237\u65b0\u4e00\u6b21';
        if (!footerExisted) {
            footer.fontSize = 20;
            footer.lineHeight = 28;
            footer.color = new Color(91, 62, 38, 255);
            footer.horizontalAlign = HorizontalTextAlignment.RIGHT;
            footer.verticalAlign = VerticalTextAlignment.CENTER;
            footer.overflow = Overflow.SHRINK;
            this.setLabelOutline(footer, new Color(255, 246, 214, 255), 1);
        }
        footer.node.setSiblingIndex(6);
    }
    protected ensureDuelJianghuRankAvatar(parent: Node, name: string, x: number, y: number, frameSize: number, iconSize: number): Node {
        const frameExisted = !!parent.getChildByName(`${name}Frame`);
        const frame = this.getOrCreateEditorSkinnedNode(
            `${name}Frame`,
            parent,
            frameSize,
            frameSize,
            x,
            y,
            HomeConfig.UI_HOME_PROFILE_FRAME,
        );
        frame.active = true;
        if (!frameExisted) {
            frame.setPosition(x, y, 0);
            (frame.getComponent(UITransform) || frame.addComponent(UITransform)).setContentSize(frameSize, frameSize);
        }
        frame.setSiblingIndex(1);

        const iconExisted = !!frame.getChildByName(`${name}Icon`);
        const icon = this.getOrCreateEditorSkinnedNode(
            `${name}Icon`,
            frame,
            iconSize,
            iconSize,
            0,
            0,
            this.getHomeAvatarSkin('female'),
        );
        icon.active = true;
        if (!iconExisted) {
            icon.setPosition(0, 0, 0);
            (icon.getComponent(UITransform) || icon.addComponent(UITransform)).setContentSize(iconSize, iconSize);
        }
        icon.setSiblingIndex(0);
        return frame;
    }
    protected refreshDuelJianghuRankPage(rankPage: Node): void {
        if (!rankPage?.isValid) return;
        this.hideLegacyDuelJianghuRankNodes(rankPage);

        const entries = this.getDuelJianghuRankEntries()
            .sort((left, right) => right.investAmount - left.investAmount)
            .slice(0, 10);
        const topRoot = rankPage.getChildByName('JianghuRankTopRoot') || this.ensureDuelJianghuRankTopRoot(rankPage);
        [
            { nodeName: 'JianghuRankTop1', entry: entries[0] },
            { nodeName: 'JianghuRankTop2', entry: entries[1] },
            { nodeName: 'JianghuRankTop3', entry: entries[2] },
        ].forEach((item) => {
            const card = topRoot.getChildByName(item.nodeName);
            if (card && item.entry) this.refreshDuelJianghuRankTopCard(card, item.entry);
        });

        const list = rankPage.getChildByName('JianghuRankInvestList') || this.ensureDuelJianghuRankInvestList(rankPage);
        const content = list.getChildByName('JianghuRankInvestContent') || list;

        entries.forEach((entry, index) => {
            const rank = index + 1;
            const row = content.getChildByName(`JianghuRankInvestRow_${rank}`);
            if (row) this.refreshDuelJianghuRankInvestRow(row, rank, entry);
        });

        for (let rank = entries.length + 1; rank <= 10; rank += 1) {
            const row = content.getChildByName(`JianghuRankInvestRow_${rank}`);
            if (row) row.active = false;
        }
    }
    protected refreshDuelJianghuRankTopCard(card: Node, entry: DuelJianghuRankEntry): void {
        const name = card.getChildByName(`${card.name}NameLabel`)?.getComponent(Label);
        if (name) name.string = entry.name;
        this.applyDuelJianghuRankAvatarSkin(card, `${card.name}Avatar`, entry.gender);
        const metric = card.getChildByName(`${card.name}MetricLabel`)?.getComponent(Label);
        if (metric) {
            metric.string = '';
            metric.node.active = false;
        }
    }
    protected refreshDuelJianghuRankInvestRow(row: Node, rank: number, entry: DuelJianghuRankEntry): void {
        row.active = true;
        const rankLabel = row.getChildByName(`${row.name}RankLabel`)?.getComponent(Label);
        if (rankLabel) rankLabel.string = `${rank}`;

        const name = row.getChildByName(`${row.name}NameLabel`)?.getComponent(Label);
        if (name) name.string = entry.name;
        this.applyDuelJianghuRankAvatarSkin(row, `${row.name}Avatar`, entry.gender);

        const invest = row.getChildByName(`${row.name}InvestAmountLabel`)?.getComponent(Label);
        if (invest) invest.string = this.formatDuelJianghuRankAmount(entry.investAmount);

        const reward = row.getChildByName(`${row.name}RewardAmountLabel`)?.getComponent(Label);
        if (reward) reward.string = this.formatDuelJianghuRankAmount(entry.rewardAmount);
    }
    protected applyDuelJianghuRankText(label: Label, fontSize: number, color: Color, align: HorizontalTextAlignment, outlineWidth: number): void {
        label.fontSize = fontSize;
        label.lineHeight = fontSize + 6;
        label.color = color;
        label.horizontalAlign = align;
        label.verticalAlign = VerticalTextAlignment.CENTER;
        label.overflow = Overflow.SHRINK;
        this.setLabelOutline(label, new Color(255, 246, 214, 255), outlineWidth);
    }
    protected applyDuelJianghuRankAvatarSkin(parent: Node, avatarBaseName: string, gender: RoleGender): void {
        const frame = parent.getChildByName(`${avatarBaseName}Frame`);
        const icon = frame?.getChildByName(`${avatarBaseName}Icon`);
        const iconSize = icon?.getComponent(UITransform)?.contentSize;
        this.applyHomeAvatarSkin(icon, iconSize?.width || 58, iconSize?.height || 58, gender);
    }
    protected formatDuelJianghuRankAmount(value: number): string {
        return value.toFixed(4).replace(/\.?0+$/, '') || '0';
    }
    protected getDuelJianghuRankEntries(): DuelJianghuRankEntry[] {
        return [
            { name: '\u68a6\u56de\u6c5f\u6e56', investAmount: 1580, rewardAmount: 2396.8, gender: 'female' },
            { name: '\u541b\u770b\u5c71\u5dc5', investAmount: 1420, rewardAmount: 2100, gender: 'male' },
            { name: '\u9ed8\u6b4c', investAmount: 1360, rewardAmount: 2016, gender: 'female' },
            { name: 'nehsiac', investAmount: 1288, rewardAmount: 1940.4, gender: 'male' },
            { name: '\u8f6f\u6c90\u7fa4\u4e03\u4e09', investAmount: 1200, rewardAmount: 1788, gender: 'female' },
            { name: '\u725b\u9a6c', investAmount: 980, rewardAmount: 1430.6, gender: 'male' },
            { name: '\u660e\u62fe\u5c01\u4f60\u5bb6', investAmount: 860, rewardAmount: 1254.4, gender: 'female' },
            { name: '\u53f6\u843d\u77e5\u79cb', investAmount: 760, rewardAmount: 1113.2, gender: 'male' },
            { name: '\u767d\u65e0\u5c18', investAmount: 650, rewardAmount: 988, gender: 'female' },
            { name: '\u9752\u886b\u5ba2', investAmount: 520, rewardAmount: 780, gender: 'male' },
        ];
    }
}
