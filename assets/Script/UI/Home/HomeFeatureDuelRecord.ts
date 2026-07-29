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

type DuelJianghuRoomId = typeof HomeConfig.DUEL_JIANGHU_ROOM_LABELS[number]['id'];

type DuelJianghuRecordKillEntry = {
    period: number;
    roomName: string;
    killerName: string;
};

type DuelJianghuPersonalRecordEntry = {
    period: number;
    time: string;
    selectedRoomName: string;
    targetRoomNames: string[];
    success: boolean;
    investAmount: number;
    rewardAmount: number;
};

abstract class HomeFeatureDuelRecordHost extends HomeViewBase {
    protected abstract getOrCreateEditorNode(name: string, parent: Node, width: number, height: number, x: number, y: number): Node;
    protected abstract getOrCreateEditorSkinnedNode(name: string, parent: Node, width: number, height: number, x: number, y: number, skinPath: string): Node;
    protected abstract getOrCreateDuelRoomLabel(parent: Node, name: string, text: string, fontSize: number, x: number, y: number, width: number, height: number, color: Color): Label;
    protected abstract setLabelOutline(label: Label, color: Color, width: number): void;
    protected abstract formatDuelJianghuYuanbaoAmount(value: number): string;
}

/**
 * 江湖逃杀战绩页面、统计详情与当前前端演示数据。
 */
export abstract class HomeFeatureDuelRecord extends HomeFeatureDuelRecordHost {
    protected ensureDuelJianghuRecordPage(page: Node): Node {
        const recordPage = this.getOrCreateEditorNode('JianghuRecordPage', page, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT, 0, 0);
        this.ensureInputBlocker(recordPage);

        const bg = this.getOrCreateEditorSkinnedNode(
            'JianghuRecordPageBackground',
            recordPage,
            HomeConfig.VIEW_WIDTH,
            HomeConfig.VIEW_HEIGHT,
            0,
            0,
            HomeConfig.UI_DUEL_JIANGHU_RECORD_BG,
        );
        const legacyGraphics = bg.getComponent(Graphics);
        if (legacyGraphics) {
            legacyGraphics.clear();
            legacyGraphics.enabled = false;
        }
        bg.active = true;
        bg.setSiblingIndex(0);

        const backButton = recordPage.getChildByName('JianghuRecordBackButton');
        if (backButton) {
            backButton.active = false;
            backButton.off(Node.EventType.TOUCH_START);
            backButton.off(Node.EventType.TOUCH_END);
            backButton.off(Node.EventType.TOUCH_CANCEL);
        }

        const titleBar = this.getOrCreateEditorSkinnedNode('JianghuRecordHeaderTitleBar', recordPage, 330, 72, 0, 680, HomeConfig.UI_DUEL_JIANGHU_RECORD_TITLE_BAR);
        titleBar.active = true;
        titleBar.setSiblingIndex(2);
        const title = this.getOrCreateDuelRoomLabel(titleBar, 'JianghuRecordHeaderTitleLabel', '\u8bb0\u5f55', 38, 0, 4, 230, 58, new Color(60, 44, 30, 255));
        title.horizontalAlign = HorizontalTextAlignment.CENTER;
        title.overflow = Overflow.SHRINK;
        this.setLabelOutline(title, new Color(255, 246, 214, 255), 2);
        title.node.setSiblingIndex(0);

        const legacyTitle = recordPage.getChildByName('JianghuRecordPageTitle');
        if (legacyTitle) legacyTitle.active = false;
        const placeholder = recordPage.getChildByName('JianghuRecordPagePlaceholder');
        if (placeholder) placeholder.active = false;

        const mainScroll = this.getOrCreateEditorNode('JianghuRecordMainScroll', recordPage, 662, 1220, 0, -82);
        mainScroll.active = true;
        mainScroll.setSiblingIndex(3);
        const mainContent = this.getOrCreateEditorNode('JianghuRecordMainContent', mainScroll, 662, 2480, 0, -630);
        mainContent.active = true;
        this.setupDuelJianghuRecordScrollView(mainScroll, mainContent);

        const statsPanel = this.ensureDuelJianghuRecordStatsPanel(mainContent);
        statsPanel.off(Node.EventType.TOUCH_START);
        statsPanel.off(Node.EventType.TOUCH_END);
        statsPanel.off(Node.EventType.TOUCH_CANCEL);
        this.ensureDuelJianghuRecordRecentPanel(mainContent);
        this.ensureDuelJianghuRecordSummaryPanel(mainContent);
        this.ensureDuelJianghuRecordPersonalRows(mainContent, this.getDuelJianghuPersonalRecords());
        const statDetail = recordPage.getChildByName('JianghuRecordStatDetailPanel');
        if (statDetail) statDetail.active = false;

        this.refreshDuelJianghuRecordPage(recordPage);
        return recordPage;
    }

    protected setupDuelJianghuRecordScrollView(scrollRoot: Node, content: Node): ScrollView {
        const mask = scrollRoot.getComponent(Mask) || scrollRoot.addComponent(Mask);
        mask.type = Mask.Type.GRAPHICS_RECT;
        const scrollView = scrollRoot.getComponent(ScrollView) || scrollRoot.addComponent(ScrollView);
        scrollView.horizontal = false;
        scrollView.vertical = true;
        scrollView.inertia = true;
        scrollView.elastic = true;
        scrollView.cancelInnerEvents = true;
        scrollView.content = content;
        return scrollView;
    }

    protected ensureDuelJianghuRecordSectionTitle(parent: Node, nodeName: string, text: string, y: number, width = 410): Node {
        const titleBar = this.getOrCreateEditorSkinnedNode(nodeName, parent, width, 64, 0, y, HomeConfig.UI_DUEL_JIANGHU_RECORD_TITLE_BAR);
        titleBar.active = true;
        const label = this.getOrCreateDuelRoomLabel(titleBar, `${nodeName}Label`, text, 29, 0, 2, width - 58, 48, new Color(73, 57, 37, 255));
        label.string = text;
        label.fontSize = 29;
        label.lineHeight = 35;
        label.color = new Color(73, 57, 37, 255);
        label.horizontalAlign = HorizontalTextAlignment.CENTER;
        label.overflow = Overflow.SHRINK;
        this.setLabelOutline(label, new Color(255, 248, 220, 255), 1);
        label.node.setSiblingIndex(0);
        return titleBar;
    }

    protected ensureDuelJianghuRecordStatsPanel(parent: Node): Node {
        const panel = this.getOrCreateEditorSkinnedNode('JianghuRecordStatsPanel', parent, 640, 315, 0, 1080, HomeConfig.UI_DUEL_JIANGHU_RECORD_STAT_PANEL);
        panel.active = true;
        panel.setSiblingIndex(0);
        this.ensureDuelJianghuRecordSectionTitle(panel, 'JianghuRecordStatsTitleBar', '\u8fd1100\u671f\u88ab\u6740\u7edf\u8ba1', 104);
        const positions = [
            { x: -205, y: 28 },
            { x: 0, y: 28 },
            { x: 205, y: 28 },
            { x: -102, y: -76 },
            { x: 102, y: -76 },
        ];
        HomeConfig.DUEL_JIANGHU_ROOM_LABELS.forEach((room, index) => {
            const pos = positions[index] || { x: 0, y: -76 };
            this.ensureDuelJianghuRecordValueCell(panel, `JianghuRecordStatsCell_${room.id}`, pos.x, pos.y, 184, 82);
        });
        return panel;
    }

    protected ensureDuelJianghuRecordRecentPanel(parent: Node): Node {
        const panel = this.getOrCreateEditorSkinnedNode('JianghuRecordRecentPanel', parent, 640, 315, 0, 724, HomeConfig.UI_DUEL_JIANGHU_RECORD_STAT_PANEL);
        panel.active = true;
        panel.setSiblingIndex(1);
        this.ensureDuelJianghuRecordSectionTitle(panel, 'JianghuRecordRecentTitleBar', '\u8fd110\u671f\u5927\u9003\u6740\u8bb0\u5f55', 104);
        const xs = [-252, -126, 0, 126, 252];
        const ys = [18, -78];
        for (let index = 0; index < 10; index += 1) {
            this.ensureDuelJianghuRecordValueCell(panel, `JianghuRecordRecentCell_${index + 1}`, xs[index % 5], ys[Math.floor(index / 5)], 112, 88);
        }
        return panel;
    }

    protected ensureDuelJianghuRecordSummaryPanel(parent: Node): Node {
        const panel = this.getOrCreateEditorSkinnedNode('JianghuRecordSummaryPanel', parent, 640, 250, 0, 394, HomeConfig.UI_DUEL_JIANGHU_RECORD_STAT_PANEL);
        panel.active = true;
        panel.setSiblingIndex(2);
        this.ensureDuelJianghuRecordSectionTitle(panel, 'JianghuRecordSummaryTitleBar', '\u6211\u53c2\u4e0e\u7684\u8bb0\u5f55', 74);
        [
            { name: 'Invest', x: -210 },
            { name: 'Success', x: 0 },
            { name: 'Reward', x: 210 },
        ].forEach((item) => this.ensureDuelJianghuRecordValueCell(panel, `JianghuRecordSummaryCell_${item.name}`, item.x, -42, 190, 92));
        return panel;
    }

    protected ensureDuelJianghuRecordPersonalRows(parent: Node, records: DuelJianghuPersonalRecordEntry[]): void {
        records.forEach((_, index) => {
            this.ensureDuelJianghuRecordPersonalRow(parent, `JianghuRecordPersonalRow_${index + 1}`, HomeConfig.DUEL_JIANGHU_RECORD_PERSONAL_ROW_START_Y - index * HomeConfig.DUEL_JIANGHU_RECORD_PERSONAL_ROW_STEP);
        });
    }

    protected ensureDuelJianghuRecordValueCell(parent: Node, name: string, x: number, y: number, width: number, height: number): Node {
        const cell = this.getOrCreateEditorSkinnedNode(name, parent, width, height, x, y, HomeConfig.UI_DUEL_JIANGHU_RECORD_ROOM_CELL);
        cell.active = true;
        cell.setPosition(x, y, 0);
        (cell.getComponent(UITransform) || cell.addComponent(UITransform)).setContentSize(width, height);
        const nameLabel = this.getOrCreateDuelRoomLabel(cell, `${name}NameLabel`, '\u79d8\u5b9d\u5e7d\u9601', Math.min(24, Math.max(18, Math.floor(width / 7))), 0, 18, width - 22, 34, new Color(102, 66, 48, 255));
        nameLabel.horizontalAlign = HorizontalTextAlignment.CENTER;
        nameLabel.overflow = Overflow.SHRINK;
        this.setLabelOutline(nameLabel, new Color(255, 246, 218, 255), 1);
        const valueLabel = this.getOrCreateDuelRoomLabel(cell, `${name}ValueLabel`, '0', Math.min(24, Math.max(19, Math.floor(width / 7))), 0, -20, width - 24, 34, new Color(42, 36, 28, 255));
        valueLabel.horizontalAlign = HorizontalTextAlignment.CENTER;
        valueLabel.overflow = Overflow.SHRINK;
        this.setLabelOutline(valueLabel, new Color(255, 246, 218, 255), 1);
        return cell;
    }

    protected ensureDuelJianghuRecordPersonalRow(parent: Node, name: string, y: number): Node {
        const row = this.getOrCreateEditorSkinnedNode(name, parent, 640, 142, 0, y, HomeConfig.UI_DUEL_JIANGHU_RECORD_PERSONAL_ROW);
        row.active = true;
        row.setPosition(0, y, 0);
        row.setScale(HomeConfig.DUEL_JIANGHU_RECORD_PERSONAL_ROW_SCALE, HomeConfig.DUEL_JIANGHU_RECORD_PERSONAL_ROW_SCALE, 1);
        (row.getComponent(UITransform) || row.addComponent(UITransform)).setContentSize(640, 142);
        const labels = [
            { suffix: 'PeriodLabel', text: '15472\u671f', fontSize: 24, x: -252, y: 42, width: 118, color: new Color(48, 42, 31, 255) },
            { suffix: 'TimeLabel', text: '2026-07-21 12:00:00', fontSize: 22, x: -35, y: 42, width: 300, color: new Color(48, 42, 31, 255) },
            { suffix: 'StatusLabel', text: '\u8eb2\u907f\u6210\u529f', fontSize: 25, x: 246, y: 42, width: 150, color: new Color(72, 150, 64, 255) },
            { suffix: 'SelectLabel', text: '\u6211\u9009\u62e9\uff1a[\u609f\u9053\u9759\u575b]', fontSize: 21, x: -150, y: -10, width: 310, color: new Color(67, 52, 38, 255) },
            { suffix: 'TargetLabel', text: '\u88ad\u51fb\uff1a[\u79d8\u5b9d\u5e7d\u9601]', fontSize: 21, x: 172, y: -10, width: 310, color: new Color(67, 52, 38, 255) },
            { suffix: 'InvestLabel', text: '\u6295\u5165\u5143\u5b9d\uff1a1', fontSize: 21, x: -150, y: -52, width: 310, color: new Color(67, 52, 38, 255) },
            { suffix: 'RewardLabel', text: '\u83b7\u5f97\u5143\u5b9d\uff1a1.2', fontSize: 21, x: 172, y: -52, width: 310, color: new Color(67, 52, 38, 255) },
        ];
        labels.forEach((item) => {
            const label = this.getOrCreateDuelRoomLabel(row, `${name}${item.suffix}`, item.text, item.fontSize, item.x, item.y, item.width, 34, item.color);
            label.horizontalAlign = item.suffix === 'StatusLabel' ? HorizontalTextAlignment.CENTER : HorizontalTextAlignment.LEFT;
            label.overflow = Overflow.SHRINK;
            this.setLabelOutline(label, new Color(255, 247, 220, 255), 1);
        });
        return row;
    }

    protected ensureDuelJianghuRecordStatDetailPanel(recordPage: Node): Node {
        const detail = this.getOrCreateEditorNode('JianghuRecordStatDetailPanel', recordPage, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT, 0, 0);
        this.ensureInputBlocker(detail);
        detail.active = false;
        detail.setSiblingIndex(20);

        const bg = this.getOrCreateEditorSkinnedNode('JianghuRecordStatDetailBg', detail, 690, 1320, 0, -24, HomeConfig.UI_DUEL_JIANGHU_RECORD_STAT_PANEL);
        bg.active = true;
        bg.setSiblingIndex(0);
        this.ensureDuelJianghuRecordSectionTitle(detail, 'JianghuRecordStatDetailTitleBar', '\u8fd1100\u671f\u88ab\u6740\u7edf\u8ba1', 608, 430);

        const back = this.getOrCreateEditorSkinnedNode('JianghuRecordStatDetailBackButton', detail, 68, 68, -294, 610, HomeConfig.UI_RANK_BACK);
        back.active = true;
        back.setSiblingIndex(2);
        this.bindScaledClick(back, () => this.closeDuelJianghuRecordStatDetail(recordPage));

        const scroll = this.getOrCreateEditorNode('JianghuRecordStatDetailScroll', detail, 610, 1110, 0, -18);
        scroll.active = true;
        scroll.setSiblingIndex(3);
        const content = this.getOrCreateEditorNode('JianghuRecordStatDetailContent', scroll, 610, 1110, 0, 0);
        content.active = true;
        this.setupDuelJianghuRecordScrollView(scroll, content);
        return detail;
    }

    protected refreshDuelJianghuRecordPage(recordPage: Node): void {
        if (!recordPage?.isValid) return;
        const history = this.getDuelJianghuRecordKillHistory(100);
        const stats = this.getDuelJianghuRecordStats(history);
        const personalRecords = this.getDuelJianghuPersonalRecords();
        const statsPanel = recordPage.getChildByName('JianghuRecordMainScroll')?.getChildByName('JianghuRecordMainContent')?.getChildByName('JianghuRecordStatsPanel');
        if (statsPanel) this.refreshDuelJianghuRecordStatsPanel(statsPanel, stats);
        const recentPanel = recordPage.getChildByName('JianghuRecordMainScroll')?.getChildByName('JianghuRecordMainContent')?.getChildByName('JianghuRecordRecentPanel');
        if (recentPanel) this.refreshDuelJianghuRecordRecentPanel(recentPanel, history.slice(0, 10));
        const summaryPanel = recordPage.getChildByName('JianghuRecordMainScroll')?.getChildByName('JianghuRecordMainContent')?.getChildByName('JianghuRecordSummaryPanel');
        if (summaryPanel) this.refreshDuelJianghuRecordSummaryPanel(summaryPanel, personalRecords);
        const mainContent = recordPage.getChildByName('JianghuRecordMainScroll')?.getChildByName('JianghuRecordMainContent');
        if (mainContent) this.refreshDuelJianghuRecordPersonalRows(mainContent, personalRecords);
        const detail = recordPage.getChildByName('JianghuRecordStatDetailPanel');
        if (detail) detail.active = false;
    }

    protected refreshDuelJianghuRecordStatsPanel(panel: Node, stats: Array<{ roomName: string; count: number; roomId: DuelJianghuRoomId }>): void {
        stats.forEach((entry) => {
            const cell = panel.getChildByName(`JianghuRecordStatsCell_${entry.roomId}`);
            this.setDuelJianghuRecordValueCell(cell, entry.roomName, `${entry.count}\u6b21`);
        });
    }

    protected refreshDuelJianghuRecordRecentPanel(panel: Node, entries: DuelJianghuRecordKillEntry[]): void {
        entries.forEach((entry, index) => {
            const cell = panel.getChildByName(`JianghuRecordRecentCell_${index + 1}`);
            this.setDuelJianghuRecordValueCell(cell, entry.roomName, `${entry.period}\u671f`);
        });
    }

    protected refreshDuelJianghuRecordSummaryPanel(panel: Node, records: DuelJianghuPersonalRecordEntry[]): void {
        const invest = records.reduce((sum, record) => sum + record.investAmount, 0);
        const reward = records.reduce((sum, record) => sum + record.rewardAmount, 0);
        const success = records.filter((record) => record.success).length;
        this.setDuelJianghuRecordValueCell(panel.getChildByName('JianghuRecordSummaryCell_Invest'), this.formatDuelJianghuYuanbaoAmount(invest), '\u603b\u6295\u5165');
        this.setDuelJianghuRecordValueCell(panel.getChildByName('JianghuRecordSummaryCell_Success'), `${success}\u6b21`, '\u6210\u529f\u8eb2\u907f');
        this.setDuelJianghuRecordValueCell(panel.getChildByName('JianghuRecordSummaryCell_Reward'), this.formatDuelJianghuYuanbaoAmount(reward), '\u603b\u83b7\u5f97');
    }

    protected refreshDuelJianghuRecordPersonalRows(parent: Node, records: DuelJianghuPersonalRecordEntry[]): void {
        records.forEach((record, index) => {
            const row = this.ensureDuelJianghuRecordPersonalRow(parent, `JianghuRecordPersonalRow_${index + 1}`, HomeConfig.DUEL_JIANGHU_RECORD_PERSONAL_ROW_START_Y - index * HomeConfig.DUEL_JIANGHU_RECORD_PERSONAL_ROW_STEP);
            const status = row.getChildByName(`${row.name}StatusLabel`)?.getComponent(Label);
            if (status) {
                status.string = record.success ? '\u8eb2\u907f\u6210\u529f' : '\u8eb2\u907f\u5931\u8d25';
                status.color = record.success ? new Color(72, 150, 64, 255) : new Color(188, 55, 42, 255);
            }
            const period = row.getChildByName(`${row.name}PeriodLabel`)?.getComponent(Label);
            if (period) period.string = `${record.period}\u671f`;
            const time = row.getChildByName(`${row.name}TimeLabel`)?.getComponent(Label);
            if (time) time.string = record.time;
            const select = row.getChildByName(`${row.name}SelectLabel`)?.getComponent(Label);
            if (select) select.string = `\u6211\u9009\u62e9\uff1a[${record.selectedRoomName}]`;
            const target = row.getChildByName(`${row.name}TargetLabel`)?.getComponent(Label);
            if (target) target.string = `\u88ad\u51fb\uff1a[${record.targetRoomNames.join('\u3001')}]`;
            const invest = row.getChildByName(`${row.name}InvestLabel`)?.getComponent(Label);
            if (invest) invest.string = `\u6295\u5165\u5143\u5b9d\uff1a${this.formatDuelJianghuYuanbaoAmount(record.investAmount)}`;
            const reward = row.getChildByName(`${row.name}RewardLabel`)?.getComponent(Label);
            if (reward) reward.string = `\u83b7\u5f97\u5143\u5b9d\uff1a${this.formatDuelJianghuYuanbaoAmount(record.rewardAmount)}`;
        });
    }

    protected refreshDuelJianghuRecordStatDetailRows(recordPage: Node, entries: DuelJianghuRecordKillEntry[]): void {
        const scroll = recordPage.getChildByName('JianghuRecordStatDetailPanel')?.getChildByName('JianghuRecordStatDetailScroll');
        if (!scroll) return;
        const viewportHeight = (scroll.getComponent(UITransform) || scroll.addComponent(UITransform)).contentSize.height || 1110;
        const rowHeight = 78;
        const rowGap = 12;
        const rowStep = rowHeight + rowGap;
        const contentHeight = Math.max(viewportHeight, entries.length * rowStep + 20);
        const content = this.getOrCreateEditorNode('JianghuRecordStatDetailContent', scroll, 610, contentHeight, 0, (viewportHeight - contentHeight) / 2);
        content.active = true;
        content.setPosition(0, (viewportHeight - contentHeight) / 2, 0);
        (content.getComponent(UITransform) || content.addComponent(UITransform)).setContentSize(610, contentHeight);
        this.setupDuelJianghuRecordScrollView(scroll, content);
        entries.forEach((entry, index) => {
            const rowY = contentHeight / 2 - rowHeight / 2 - 10 - index * rowStep;
            const row = this.getOrCreateEditorSkinnedNode(`JianghuRecordStatDetailRow_${index + 1}`, content, 590, rowHeight, 0, rowY, HomeConfig.UI_DUEL_JIANGHU_RECORD_ROOM_CELL);
            row.active = true;
            row.setPosition(0, rowY, 0);
            (row.getComponent(UITransform) || row.addComponent(UITransform)).setContentSize(590, rowHeight);
            const period = this.getOrCreateDuelRoomLabel(row, `${row.name}PeriodLabel`, `${entry.period}\u671f`, 22, -222, 0, 120, 42, new Color(64, 46, 32, 255));
            period.horizontalAlign = HorizontalTextAlignment.CENTER;
            period.overflow = Overflow.SHRINK;
            this.setLabelOutline(period, new Color(255, 248, 220, 255), 1);
            const room = this.getOrCreateDuelRoomLabel(row, `${row.name}RoomLabel`, `\u88ab\u6740\u623f\u95f4\uff1a${entry.roomName}`, 22, 10, 0, 270, 42, new Color(64, 46, 32, 255));
            room.horizontalAlign = HorizontalTextAlignment.LEFT;
            room.overflow = Overflow.SHRINK;
            this.setLabelOutline(room, new Color(255, 248, 220, 255), 1);
            const killer = this.getOrCreateDuelRoomLabel(row, `${row.name}KillerLabel`, entry.killerName, 21, 222, 0, 130, 42, new Color(126, 70, 42, 255));
            killer.horizontalAlign = HorizontalTextAlignment.CENTER;
            killer.overflow = Overflow.SHRINK;
            this.setLabelOutline(killer, new Color(255, 248, 220, 255), 1);
        });
    }

    protected setDuelJianghuRecordValueCell(cell: Node | null | undefined, name: string, value: string): void {
        if (!cell) return;
        const nameLabel = cell.getChildByName(`${cell.name}NameLabel`)?.getComponent(Label);
        if (nameLabel) nameLabel.string = name;
        const valueLabel = cell.getChildByName(`${cell.name}ValueLabel`)?.getComponent(Label);
        if (valueLabel) valueLabel.string = value;
    }

    protected showDuelJianghuRecordStatDetail(recordPage: Node): void {
        const detail = this.ensureDuelJianghuRecordStatDetailPanel(recordPage);
        this.refreshDuelJianghuRecordStatDetailRows(recordPage, this.getDuelJianghuRecordKillHistory(100));
        detail.active = true;
        detail.setSiblingIndex((recordPage.children.length || 1) - 1);
    }

    protected closeDuelJianghuRecordStatDetail(recordPage: Node): void {
        const detail = recordPage.getChildByName('JianghuRecordStatDetailPanel');
        if (detail) detail.active = false;
    }

    protected getDuelJianghuRecordStats(history: DuelJianghuRecordKillEntry[]): Array<{ roomName: string; count: number; roomId: DuelJianghuRoomId }> {
        return HomeConfig.DUEL_JIANGHU_ROOM_LABELS.map((room) => ({
            roomName: room.name,
            roomId: room.id,
            count: history.filter((entry) => entry.roomName === room.name).length,
        }));
    }

    protected getDuelJianghuRecordKillHistory(limit: number): DuelJianghuRecordKillEntry[] {
        const rooms = HomeConfig.DUEL_JIANGHU_ROOM_LABELS;
        const killers = ['\u523a\u5ba2', '\u53db\u95e8\u9006\u5f92', '\u767e\u6218\u5c06\u519b', '\u5217\u9635\u5175\u5352'];
        const currentPeriod = Number(HomeConfig.DUEL_JIANGHU_CURRENT_PERIOD) || 15472;
        return Array.from({ length: limit }, (_, index) => {
            const room = rooms[(index * 3 + Math.floor(index / 4)) % rooms.length];
            return {
                period: currentPeriod - index,
                roomName: room.name,
                killerName: killers[index % killers.length],
            };
        });
    }

    protected getDuelJianghuPersonalRecords(): DuelJianghuPersonalRecordEntry[] {
        const rooms = HomeConfig.DUEL_JIANGHU_ROOM_LABELS;
        const currentPeriod = Number(HomeConfig.DUEL_JIANGHU_CURRENT_PERIOD) || 15472;
        const source = [
            { selected: 1, targets: [4], success: true, invest: 1, reward: 1.5163, time: '2026-07-21 12:18:06' },
            { selected: 4, targets: [4], success: false, invest: 1, reward: 0, time: '2026-07-21 11:58:31' },
            { selected: 0, targets: [2, 3], success: true, invest: 2, reward: 3.2, time: '2026-07-21 11:38:14' },
            { selected: 2, targets: [1], success: true, invest: 1, reward: 1.28, time: '2026-07-21 11:17:52' },
            { selected: 3, targets: [0, 3], success: false, invest: 1.5, reward: 0, time: '2026-07-21 10:57:45' },
            { selected: 1, targets: [0], success: true, invest: 1, reward: 1.8, time: '2026-07-21 10:37:29' },
            { selected: 4, targets: [2], success: true, invest: 2, reward: 2.64, time: '2026-07-21 10:16:18' },
            { selected: 0, targets: [1, 4], success: false, invest: 1, reward: 0, time: '2026-07-21 09:55:02' },
        ];
        return source.map((record, index) => ({
            period: currentPeriod - index * 3,
            time: record.time,
            selectedRoomName: rooms[record.selected]?.name || rooms[0].name,
            targetRoomNames: record.targets.map((roomIndex) => rooms[roomIndex]?.name || rooms[0].name),
            success: record.success,
            investAmount: record.invest,
            rewardAmount: record.reward,
        }));
    }
}
