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
} from 'cc';
import * as HomeConfig from './HomeConfig';
import { HomeViewBase } from './HomeViewBase';

type DuelJianghuRankMetric = 'dodge' | 'streak';
type DuelJianghuRankPeriod = 'today' | 'lastWeek';
type DuelJianghuRankEntry = {
    name: string;
    dodge: number;
    streak: number;
};

abstract class HomeFeatureDuelRankHost extends HomeViewBase {
    protected abstract duelJianghuRankMetric: DuelJianghuRankMetric;
    protected abstract duelJianghuRankPeriod: DuelJianghuRankPeriod;
    protected abstract getOrCreateEditorNode(name: string, parent: Node, width: number, height: number, x: number, y: number): Node;
    protected abstract getOrCreateEditorSkinnedNode(name: string, parent: Node, width: number, height: number, x: number, y: number, skinPath: string): Node;
    protected abstract getOrCreateDuelRoomLabel(parent: Node, name: string, text: string, fontSize: number, x: number, y: number, width: number, height: number, color: Color): Label;
    protected abstract setLabelOutline(label: Label, color: Color, width: number): void;
}

/** ??????????????????????? */
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

        const title = this.getOrCreateDuelRoomLabel(
            rankPage,
            'JianghuRankPageTitle',
            '\u6392\u884c\u699c',
            34,
            -238,
            702,
            210,
            58,
            new Color(92, 53, 28, 255),
        );
        title.node.active = true;
        title.node.setPosition(-238, 702, 0);
        (title.node.getComponent(UITransform) || title.node.addComponent(UITransform)).setContentSize(210, 58);
        title.horizontalAlign = HorizontalTextAlignment.LEFT;
        title.overflow = Overflow.SHRINK;
        this.setLabelOutline(title, new Color(255, 239, 186, 255), 2);
        title.node.setSiblingIndex(1);

        const placeholder = rankPage.getChildByName('JianghuRankPagePlaceholder');
        if (placeholder) placeholder.active = false;

        const metricTabs = this.getOrCreateEditorNode('JianghuRankMetricTabs', rankPage, 300, 62, 218, 704);
        metricTabs.active = true;
        metricTabs.setSiblingIndex(2);
        this.ensureDuelJianghuRankTab(metricTabs, 'JianghuRankTab_Dodge', '\u8eb2\u907f\u699c', -74, 0, () => {
            this.switchDuelJianghuRankMetric(rankPage, 'dodge');
        });
        this.ensureDuelJianghuRankTab(metricTabs, 'JianghuRankTab_Streak', '\u8fde\u80dc\u699c', 74, 0, () => {
            this.switchDuelJianghuRankMetric(rankPage, 'streak');
        });

        const topRoot = this.getOrCreateEditorNode('JianghuRankTopRoot', rankPage, 700, 320, 0, 405);
        topRoot.active = true;
        topRoot.setSiblingIndex(3);
        this.ensureDuelJianghuRankTopCard(topRoot, 'JianghuRankTop2', HomeConfig.UI_DUEL_JIANGHU_RANK_TOP2_BG, -220, -4, 198, 232);
        this.ensureDuelJianghuRankTopCard(topRoot, 'JianghuRankTop1', HomeConfig.UI_DUEL_JIANGHU_RANK_TOP1_BG, 0, 24, 216, 252);
        this.ensureDuelJianghuRankTopCard(topRoot, 'JianghuRankTop3', HomeConfig.UI_DUEL_JIANGHU_RANK_TOP3_BG, 220, -8, 198, 230);

        const listRoot = this.getOrCreateEditorNode('JianghuRankListRows', rankPage, 640, 610, 0, -112);
        listRoot.active = true;
        listRoot.setSiblingIndex(4);
        const listMask = listRoot.getComponent(Mask) || listRoot.addComponent(Mask);
        listMask.type = Mask.Type.GRAPHICS_RECT;
        const scrollView = listRoot.getComponent(ScrollView) || listRoot.addComponent(ScrollView);
        scrollView.horizontal = false;
        scrollView.vertical = true;
        scrollView.inertia = true;
        scrollView.elastic = true;
        scrollView.cancelInnerEvents = true;

        const listContent = this.getOrCreateEditorNode('JianghuRankListContent', listRoot, 640, 610, 0, 0);
        listContent.active = true;
        listContent.setSiblingIndex(0);
        scrollView.content = listContent;

        const selfRow = this.ensureDuelJianghuRankRow(rankPage, 'JianghuRankSelfRow', 0, -588, true);
        selfRow.setSiblingIndex(5);

        const periodTabs = this.getOrCreateEditorNode('JianghuRankPeriodTabs', rankPage, 300, 62, 0, -720);
        periodTabs.active = true;
        periodTabs.setSiblingIndex(6);
        this.ensureDuelJianghuRankTab(periodTabs, 'JianghuRankTab_Today', '\u4eca\u65e5\u699c', -74, 0, () => {
            this.switchDuelJianghuRankPeriod(rankPage, 'today');
        });
        this.ensureDuelJianghuRankTab(periodTabs, 'JianghuRankTab_LastWeek', '\u4e0a\u5468\u699c', 74, 0, () => {
            this.switchDuelJianghuRankPeriod(rankPage, 'lastWeek');
        });

        this.refreshDuelJianghuRankPage(rankPage);
        return rankPage;
    }
    protected ensureDuelJianghuRankTab(parent: Node, name: string, text: string, x: number, y: number, onClick: () => void): Node {
        const tab = this.getOrCreateEditorSkinnedNode(
            name,
            parent,
            138,
            57,
            x,
            y,
            HomeConfig.UI_DUEL_JIANGHU_RANK_TAB_INACTIVE,
        );
        tab.active = true;
        tab.setPosition(x, y, 0);
        (tab.getComponent(UITransform) || tab.addComponent(UITransform)).setContentSize(138, 57);
        const label = this.getOrCreateDuelRoomLabel(
            tab,
            `${name}Label`,
            text,
            24,
            0,
            2,
            116,
            42,
            new Color(104, 62, 31, 255),
        );
        label.horizontalAlign = HorizontalTextAlignment.CENTER;
        label.overflow = Overflow.SHRINK;
        this.setLabelOutline(label, new Color(255, 239, 186, 255), 1);
        label.node.setSiblingIndex(0);
        this.bindScaledClick(tab, () => onClick());
        return tab;
    }
    protected ensureDuelJianghuRankTopCard(parent: Node, name: string, skinPath: string, x: number, y: number, width: number, height: number): Node {
        const card = this.getOrCreateEditorSkinnedNode(name, parent, width, height, x, y, skinPath);
        card.active = true;
        card.setPosition(x, y, 0);
        (card.getComponent(UITransform) || card.addComponent(UITransform)).setContentSize(width, height);
        card.setSiblingIndex(name.endsWith('1') ? 1 : name.endsWith('2') ? 0 : 2);

        this.ensureDuelJianghuRankAvatar(card, `${name}Avatar`, 0, 26, 74, 58);

        const nameLabel = this.getOrCreateDuelRoomLabel(card, `${name}NameLabel`, '\u5c11\u4fa0', 23, 0, -50, width - 28, 38, new Color(255, 246, 210, 255));
        nameLabel.horizontalAlign = HorizontalTextAlignment.CENTER;
        nameLabel.overflow = Overflow.SHRINK;
        this.setLabelOutline(nameLabel, new Color(94, 46, 20, 255), 2);
        nameLabel.node.setSiblingIndex(2);

        const metricLabel = this.getOrCreateDuelRoomLabel(card, `${name}MetricLabel`, '\u8eb2\u907f\u6b21\u6570:0', 20, 0, -86, width - 28, 34, new Color(139, 54, 20, 255));
        metricLabel.horizontalAlign = HorizontalTextAlignment.CENTER;
        metricLabel.overflow = Overflow.SHRINK;
        this.setLabelOutline(metricLabel, new Color(255, 231, 164, 255), 1);
        metricLabel.node.setSiblingIndex(3);
        return card;
    }
    protected ensureDuelJianghuRankRow(parent: Node, name: string, x: number, y: number, fixedSelf: boolean): Node {
        const row = this.getOrCreateEditorSkinnedNode(name, parent, fixedSelf ? 640 : 626, fixedSelf ? 118 : 106, x, y, HomeConfig.UI_DUEL_JIANGHU_RANK_ROW_BG);
        row.active = true;
        row.setPosition(x, y, 0);
        (row.getComponent(UITransform) || row.addComponent(UITransform)).setContentSize(fixedSelf ? 640 : 626, fixedSelf ? 118 : 106);

        const rankLabel = this.getOrCreateDuelRoomLabel(row, `${name}RankLabel`, '4', fixedSelf ? 25 : 27, -270, 2, 74, 48, new Color(210, 102, 46, 255));
        rankLabel.horizontalAlign = HorizontalTextAlignment.CENTER;
        rankLabel.overflow = Overflow.SHRINK;
        this.setLabelOutline(rankLabel, new Color(255, 237, 191, 255), 2);
        rankLabel.node.setSiblingIndex(0);

        this.ensureDuelJianghuRankAvatar(row, `${name}Avatar`, -208, 0, fixedSelf ? 62 : 56, fixedSelf ? 50 : 46);

        const nameLabel = this.getOrCreateDuelRoomLabel(row, `${name}NameLabel`, '\u5c11\u4fa0', fixedSelf ? 24 : 25, -64, 22, 260, 44, new Color(73, 43, 24, 255));
        nameLabel.horizontalAlign = HorizontalTextAlignment.LEFT;
        nameLabel.overflow = Overflow.SHRINK;
        this.setLabelOutline(nameLabel, new Color(255, 245, 214, 255), 1);
        nameLabel.node.setSiblingIndex(3);

        const metricLabel = this.getOrCreateDuelRoomLabel(row, `${name}MetricLabel`, '\u8eb2\u907f\u6b21\u6570:0', fixedSelf ? 21 : 20, -64, -20, 260, 36, new Color(158, 65, 21, 255));
        metricLabel.node.active = false;

        const countLabel = this.getOrCreateDuelRoomLabel(row, `${name}CountLabel`, '0', fixedSelf ? 28 : 27, 222, 0, 170, 52, new Color(88, 70, 48, 255));
        countLabel.node.active = false;

        const dodgeLabel = this.getOrCreateDuelRoomLabel(row, `${name}DodgeLabel`, '\u8eb2\u907f\u6b21\u6570:0', fixedSelf ? 21 : 20, 206, 0, 210, 34, new Color(128, 68, 25, 255));
        dodgeLabel.node.active = true;
        dodgeLabel.node.setPosition(206, 0, 0);
        dodgeLabel.horizontalAlign = HorizontalTextAlignment.LEFT;
        dodgeLabel.overflow = Overflow.SHRINK;
        this.setLabelOutline(dodgeLabel, new Color(255, 239, 190, 255), 1);
        dodgeLabel.node.setSiblingIndex(4);

        const streakLabel = this.getOrCreateDuelRoomLabel(row, `${name}StreakLabel`, '\u8fde\u80dc\u6b21\u6570:0', fixedSelf ? 21 : 20, 206, 0, 210, 34, new Color(128, 68, 25, 255));
        streakLabel.node.active = false;
        streakLabel.node.setPosition(206, 0, 0);
        streakLabel.horizontalAlign = HorizontalTextAlignment.LEFT;
        streakLabel.overflow = Overflow.SHRINK;
        this.setLabelOutline(streakLabel, new Color(255, 239, 190, 255), 1);
        streakLabel.node.setSiblingIndex(5);
        return row;
    }
    protected ensureDuelJianghuRankAvatar(parent: Node, name: string, x: number, y: number, frameSize: number, iconSize: number): Node {
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
        frame.setPosition(x, y, 0);
        (frame.getComponent(UITransform) || frame.addComponent(UITransform)).setContentSize(frameSize, frameSize);
        frame.setSiblingIndex(1);

        const icon = this.getOrCreateEditorSkinnedNode(
            `${name}Icon`,
            frame,
            iconSize,
            iconSize,
            0,
            0,
            HomeConfig.UI_HOME_AVATAR,
        );
        icon.active = true;
        icon.setPosition(0, 0, 0);
        (icon.getComponent(UITransform) || icon.addComponent(UITransform)).setContentSize(iconSize, iconSize);
        icon.setSiblingIndex(0);
        return frame;
    }
    protected switchDuelJianghuRankMetric(rankPage: Node, metric: DuelJianghuRankMetric): void {
        this.duelJianghuRankMetric = metric;
        this.refreshDuelJianghuRankPage(rankPage);
    }
    protected switchDuelJianghuRankPeriod(rankPage: Node, period: DuelJianghuRankPeriod): void {
        this.duelJianghuRankPeriod = period;
        this.refreshDuelJianghuRankPage(rankPage);
    }
    protected refreshDuelJianghuRankPage(rankPage: Node): void {
        if (!rankPage?.isValid) return;
        this.refreshDuelJianghuRankTabs(rankPage);

        const entries = this.getDuelJianghuRankEntries(this.duelJianghuRankPeriod)
            .sort((left, right) => this.getDuelJianghuRankValue(right) - this.getDuelJianghuRankValue(left));
        const topRoot = rankPage.getChildByName('JianghuRankTopRoot');
        [
            { rank: 1, nodeName: 'JianghuRankTop1', entry: entries[0] },
            { rank: 2, nodeName: 'JianghuRankTop2', entry: entries[1] },
            { rank: 3, nodeName: 'JianghuRankTop3', entry: entries[2] },
        ].forEach((item) => {
            const card = topRoot?.getChildByName(item.nodeName);
            if (card && item.entry) this.refreshDuelJianghuRankTopCard(card, item.entry);
        });

        this.refreshDuelJianghuRankScrollableRows(rankPage, entries.slice(3));

        const selfEntry = this.getDuelJianghuSelfRankEntry();
        const selfRank = entries.filter((entry) => this.getDuelJianghuRankValue(entry) > this.getDuelJianghuRankValue(selfEntry)).length + 1;
        const selfRow = rankPage.getChildByName('JianghuRankSelfRow');
        if (selfRow) this.refreshDuelJianghuRankRow(selfRow, selfRank, selfEntry, true);
    }
    protected refreshDuelJianghuRankScrollableRows(rankPage: Node, entries: DuelJianghuRankEntry[]): void {
        const listRoot = rankPage.getChildByName('JianghuRankListRows');
        if (!listRoot) return;
        const scrollView = listRoot.getComponent(ScrollView) || listRoot.addComponent(ScrollView);
        scrollView.horizontal = false;
        scrollView.vertical = true;
        scrollView.inertia = true;
        scrollView.elastic = true;
        scrollView.cancelInnerEvents = true;

        const listMask = listRoot.getComponent(Mask) || listRoot.addComponent(Mask);
        listMask.type = Mask.Type.GRAPHICS_RECT;

        const viewportHeight = (listRoot.getComponent(UITransform) || listRoot.addComponent(UITransform)).contentSize.height || 610;
        const rowHeight = 106;
        const rowGap = 18;
        const rowStep = rowHeight + rowGap;
        const contentHeight = Math.max(viewportHeight, entries.length * rowStep - rowGap);
        const content = this.getOrCreateEditorNode('JianghuRankListContent', listRoot, 640, contentHeight, 0, (viewportHeight - contentHeight) / 2);
        content.active = true;
        content.setPosition(0, (viewportHeight - contentHeight) / 2, 0);
        (content.getComponent(UITransform) || content.addComponent(UITransform)).setContentSize(640, contentHeight);
        scrollView.content = content;
        listRoot.children
            .filter((child) => child !== content && /^JianghuRankRow_\d+$/.test(child.name))
            .forEach((child) => {
                child.active = false;
            });

        entries.forEach((entry, index) => {
            const rank = index + 4;
            const rowY = contentHeight / 2 - rowHeight / 2 - index * rowStep;
            const row = this.ensureDuelJianghuRankRow(content, `JianghuRankRow_${rank}`, 0, rowY, false);
            row.setSiblingIndex(index);
            this.refreshDuelJianghuRankRow(row, rank, entry);
        });

        content.children
            .filter((child) => /^JianghuRankRow_\d+$/.test(child.name) && Number(child.name.replace('JianghuRankRow_', '')) >= entries.length + 4)
            .forEach((child) => {
                child.active = false;
            });
    }
    protected refreshDuelJianghuRankTabs(rankPage: Node): void {
        const metricTabs = rankPage.getChildByName('JianghuRankMetricTabs');
        const periodTabs = rankPage.getChildByName('JianghuRankPeriodTabs');
        [
            { node: metricTabs?.getChildByName('JianghuRankTab_Dodge'), active: this.duelJianghuRankMetric === 'dodge' },
            { node: metricTabs?.getChildByName('JianghuRankTab_Streak'), active: this.duelJianghuRankMetric === 'streak' },
            { node: periodTabs?.getChildByName('JianghuRankTab_Today'), active: this.duelJianghuRankPeriod === 'today' },
            { node: periodTabs?.getChildByName('JianghuRankTab_LastWeek'), active: this.duelJianghuRankPeriod === 'lastWeek' },
        ].forEach((tab) => {
            if (!tab.node) return;
            this.applyUiSkinKeepingEditorSize(
                tab.node,
                tab.active ? HomeConfig.UI_DUEL_JIANGHU_RANK_TAB_ACTIVE : HomeConfig.UI_DUEL_JIANGHU_RANK_TAB_INACTIVE,
                138,
                57,
            );
            const label = tab.node.children.find((child) => child.name.endsWith('Label'))?.getComponent(Label);
            if (label) {
                label.color = tab.active ? new Color(116, 54, 18, 255) : new Color(95, 76, 48, 255);
            }
        });
    }
    protected refreshDuelJianghuRankTopCard(card: Node, entry: DuelJianghuRankEntry): void {
        const name = card.getChildByName(`${card.name}NameLabel`)?.getComponent(Label);
        if (name) name.string = entry.name;
        const metric = card.getChildByName(`${card.name}MetricLabel`)?.getComponent(Label);
        if (metric) metric.string = `${this.getDuelJianghuRankMetricText()}:${this.getDuelJianghuRankValue(entry)}`;
    }
    protected refreshDuelJianghuRankRow(row: Node, rank: number, entry: DuelJianghuRankEntry, self = false): void {
        const rankLabel = row.getChildByName(`${row.name}RankLabel`)?.getComponent(Label);
        if (rankLabel) rankLabel.string = self ? `\u6211 ${rank}` : `${rank}`;
        const name = row.getChildByName(`${row.name}NameLabel`)?.getComponent(Label);
        if (name) name.string = entry.name;
        const metric = row.getChildByName(`${row.name}MetricLabel`)?.getComponent(Label);
        if (metric) {
            metric.node.active = false;
            metric.string = '';
        }
        const count = row.getChildByName(`${row.name}CountLabel`)?.getComponent(Label);
        if (count) {
            count.node.active = false;
            count.string = '';
        }
        const dodge = row.getChildByName(`${row.name}DodgeLabel`)?.getComponent(Label);
        if (dodge) {
            dodge.node.active = this.duelJianghuRankMetric === 'dodge';
            dodge.node.setPosition(206, 0, 0);
            dodge.string = `${self ? '\u5f53\u524d' : '\u8eb2\u907f\u6b21\u6570'}:${entry.dodge}`;
        }
        const streak = row.getChildByName(`${row.name}StreakLabel`)?.getComponent(Label);
        if (streak) {
            streak.node.active = this.duelJianghuRankMetric === 'streak';
            streak.node.setPosition(206, 0, 0);
            streak.string = `${self ? '\u5f53\u524d' : '\u8fde\u80dc\u6b21\u6570'}:${entry.streak}`;
        }
    }
    protected getDuelJianghuRankMetricText(): string {
        return this.duelJianghuRankMetric === 'dodge' ? '\u8eb2\u907f\u6b21\u6570' : '\u8fde\u80dc\u6b21\u6570';
    }
    protected getDuelJianghuRankValue(entry: DuelJianghuRankEntry): number {
        return this.duelJianghuRankMetric === 'dodge' ? entry.dodge : entry.streak;
    }
    protected getDuelJianghuRankEntries(period: DuelJianghuRankPeriod): DuelJianghuRankEntry[] {
        const today: DuelJianghuRankEntry[] = [
            { name: '\u68a6\u56de\u6c5f\u6e56', dodge: 31, streak: 12 },
            { name: '\u541b\u770b\u5c71\u5dc5', dodge: 27, streak: 15 },
            { name: '\u9ed8\u6b4c', dodge: 24, streak: 11 },
            { name: 'nehsiac', dodge: 21, streak: 10 },
            { name: '\u8f6f\u6c90\u7fa4\u4e03\u4e09', dodge: 19, streak: 9 },
            { name: '\u725b\u9a6c', dodge: 18, streak: 8 },
            { name: '\u660e\u62fe\u5c01\u4f60\u5bb6', dodge: 17, streak: 8 },
            { name: '\u53f6\u843d\u77e5\u79cb', dodge: 16, streak: 7 },
            { name: '\u73af\u513f', dodge: 15, streak: 7 },
            { name: '\u6211\u662f\u62c9\u62c9', dodge: 14, streak: 6 },
        ];
        const extraNames = [
            '\u6e05\u98ce\u5f52\u5ba2', '\u9752\u886b\u65e0\u5c18', '\u957f\u6cb3\u843d\u65e5', '\u5b64\u706f\u542c\u96e8',
            '\u4e91\u8d77\u65e0\u75d5', '\u5c71\u6708\u4e0d\u7720', '\u5317\u98ce\u5c11\u5e74', '\u4e00\u5251\u5bd2\u661f',
            '\u6c5f\u5357\u65e7\u68a6', '\u9189\u5367\u677e\u95f4', '\u65e0\u540d\u4fa0\u5ba2', '\u9752\u77f3\u5c0f\u9053',
            '\u767d\u9a6c\u8f7b\u88d8', '\u5251\u5f71\u6d41\u5149', '\u98ce\u96ea\u591c\u5f52', '\u5bd2\u6f6d\u6620\u6708',
            '\u6d6e\u751f\u534a\u65e5', '\u4e91\u6d77\u5b64\u9e3f', '\u78a7\u843d\u661f\u6cb3', '\u706b\u6811\u94f6\u82b1',
            '\u957f\u5b89\u5f52\u4eba', '\u6d6a\u5ba2\u5341\u4e09', '\u5c18\u5916\u95f2\u4eba', '\u96c1\u8fc7\u7559\u58f0',
            '\u6e14\u706b\u5bf9\u6101', '\u897f\u7a97\u542c\u7af9', '\u9752\u6885\u716e\u96ea', '\u6d41\u4e91\u6563\u4eba',
            '\u58a8\u67d3\u5c71\u6cb3', '\u5251\u95ee\u4e5d\u5dde', '\u70df\u96e8\u5e73\u751f', '\u660e\u6708\u7167\u5f52',
            '\u5c71\u9b3c\u4e0d\u8bed', '\u5343\u91cc\u5feb\u54c9', '\u98de\u82b1\u9010\u6708', '\u661f\u706b\u957f\u660e',
            '\u6d77\u68e0\u672a\u7720', '\u5170\u821f\u50ac\u53d1', '\u5341\u6b65\u4e00\u5251', '\u5f52\u96c1\u5357\u98de',
        ];
        const fullToday = today.concat(extraNames.map((name, index) => ({
            name,
            dodge: Math.max(1, 14 - Math.floor(index / 3)),
            streak: Math.max(0, 6 - Math.floor(index / 6)),
        }))).slice(0, 50);
        if (period === 'today') return fullToday;
        return fullToday.map((entry, index) => ({
            name: entry.name,
            dodge: Math.max(1, entry.dodge * 6 + 18 - index * 3),
            streak: Math.max(0, entry.streak * 4 + 7 - Math.floor(index / 2)),
        }));
    }
    protected getDuelJianghuSelfRankEntry(): DuelJianghuRankEntry {
        const name = this.profile?.name || HomeConfig.DEFAULT_NAME;
        if (this.duelJianghuRankPeriod === 'lastWeek') {
            return { name, dodge: 68, streak: 23 };
        }
        return { name, dodge: 9, streak: 4 };
    }
}
