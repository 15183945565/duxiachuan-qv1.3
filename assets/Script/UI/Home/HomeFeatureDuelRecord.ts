import {
    Color,
    Graphics,
    HorizontalTextAlignment,
    Label,
    Mask,
    Node,
    Overflow,
    ScrollView,
    Tween,
    UITransform,
    VerticalTextAlignment,
} from 'cc';
import { applyMicrosoftYaHeiFontToTree } from '../Common/UIFont';
import * as HomeConfig from './HomeConfig';
import { HomeViewBase } from './HomeViewBase';

type DuelJianghuRoomId = typeof HomeConfig.DUEL_JIANGHU_ROOM_LABELS[number]['id'];

type DuelJianghuRecordKillEntry = {
    period: number;
    roomName: string;
    roomNames?: string[];
    killerName: string;
    resultTags?: Array<'counterKill'>;
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

type DuelLuanshiRecordRecentEntry = {
    period: number;
    winner: 'wudang' | 'gaibang';
    winnerName: string;
};

type DuelLuanshiPersonalRecordEntry = {
    period: number;
    time: string;
    selectedFactionName: string;
    winnerName: string;
    success: boolean;
    investAmount: number;
    rewardAmount: number;
};

type DuelLuanshiRecordSiblingState = {
    node: Node;
    active: boolean;
};

type DuelLuanshiRecordPageHost = Node & {
    duelLuanshiRecordSiblingStates?: DuelLuanshiRecordSiblingState[];
};

type DuelJianghuRecordLabelStyle = {
    positionX: number;
    positionY: number;
    positionZ: number;
    scaleX: number;
    scaleY: number;
    scaleZ: number;
    width: number;
    height: number;
    fontSize: number;
    lineHeight: number;
    color: Color;
    horizontalAlign: HorizontalTextAlignment;
    verticalAlign: VerticalTextAlignment;
    overflow: Overflow;
    enableOutline: boolean;
    outlineColor: Color;
    outlineWidth: number;
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

        const titleBar = this.getOrCreateEditorSkinnedNode('JianghuRecordHeaderTitleBar', recordPage, 182, 36, 0, 680, HomeConfig.UI_DUEL_JIANGHU_RECORD_TITLE_BAR);
        titleBar.active = true;
        titleBar.setSiblingIndex(2);
        const title = this.getOrCreateDuelRoomLabel(titleBar, 'JianghuRecordHeaderTitleLabel', '\u8bb0\u5f55', 27, 0, 2, 130, 32, new Color(60, 44, 30, 255));
        title.fontSize = 27;
        title.lineHeight = 33;
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
        scrollView.elastic = false;
        scrollView.cancelInnerEvents = true;
        scrollView.content = content;
        return scrollView;
    }

    protected ensureDuelJianghuRecordSectionTitle(parent: Node, nodeName: string, text: string, y: number, width = 220): Node {
        const titleBar = this.getOrCreateEditorSkinnedNode(nodeName, parent, width, 42, 0, y, HomeConfig.UI_DUEL_JIANGHU_RECORD_SECTION_TITLE_BAR);
        titleBar.active = true;
        const label = this.getOrCreateDuelRoomLabel(titleBar, `${nodeName}Label`, text, 23, 0, 2, width - 28, 36, new Color(73, 57, 37, 255));
        label.string = text;
        label.fontSize = 23;
        label.lineHeight = 29;
        label.color = new Color(73, 57, 37, 255);
        label.horizontalAlign = HorizontalTextAlignment.CENTER;
        label.overflow = Overflow.SHRINK;
        this.setLabelOutline(label, new Color(255, 248, 220, 255), 0.5);
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
        const nameLabelExisted = !!cell.getChildByName(`${name}NameLabel`);
        const nameLabel = this.getOrCreateDuelRoomLabel(cell, `${name}NameLabel`, '\u79d8\u5b9d\u5e7d\u9601', Math.min(24, Math.max(18, Math.floor(width / 7))), 0, 18, width - 22, 34, new Color(102, 66, 48, 255));
        if (!nameLabelExisted) {
            nameLabel.horizontalAlign = HorizontalTextAlignment.CENTER;
            nameLabel.overflow = Overflow.SHRINK;
            this.setLabelOutline(nameLabel, new Color(255, 246, 218, 255), 0.5);
        }
        const valueLabelExisted = !!cell.getChildByName(`${name}ValueLabel`);
        const valueLabel = this.getOrCreateDuelRoomLabel(cell, `${name}ValueLabel`, '0', Math.min(24, Math.max(19, Math.floor(width / 7))), 0, -20, width - 24, 34, new Color(42, 36, 28, 255));
        if (!valueLabelExisted) {
            valueLabel.horizontalAlign = HorizontalTextAlignment.CENTER;
            valueLabel.overflow = Overflow.SHRINK;
            this.setLabelOutline(valueLabel, new Color(255, 246, 218, 255), 0.5);
        }
        if (name.startsWith('JianghuRecordRecentCell_')) this.ensureDuelJianghuRecordRecentResultLabel(cell);
        this.syncDuelJianghuRecordValueCellRootFromTemplate(cell);
        return cell;
    }

    protected ensureDuelJianghuRecordRecentResultLabel(cell: Node): Label {
        const name = `${cell.name}ResultLabel`;
        const existed = !!cell.getChildByName(name);
        const label = this.getOrCreateDuelRoomLabel(cell, name, '\uff08\u53cd\u6740\uff09', 17, 0, -34, 98, 24, new Color(184, 42, 32, 255));
        if (!existed) {
            label.horizontalAlign = HorizontalTextAlignment.CENTER;
            label.overflow = Overflow.SHRINK;
            this.clearDuelJianghuRecordLabelOutline(label);
            label.node.active = false;
        }
        return label;
    }

    protected ensureDuelJianghuRecordPersonalRow(parent: Node, name: string, y: number): Node {
        const existing = parent.getChildByName(name);
        const row = this.getOrCreateEditorSkinnedNode(name, parent, 640, 142, 0, y, HomeConfig.UI_DUEL_JIANGHU_RECORD_PERSONAL_ROW);
        row.active = true;
        if (!existing) row.setScale(HomeConfig.DUEL_JIANGHU_RECORD_PERSONAL_ROW_SCALE, HomeConfig.DUEL_JIANGHU_RECORD_PERSONAL_ROW_SCALE, 1);
        const labels = [
            { suffix: 'PeriodLabel', text: '15472\u671f', fontSize: 25, x: -252, y: 42, width: 118, color: new Color(42, 36, 27, 255) },
            { suffix: 'TimeLabel', text: '2026-07-21 12:00:00', fontSize: 23, x: -35, y: 42, width: 300, color: new Color(42, 36, 27, 255) },
            { suffix: 'StatusLabel', text: '\u8eb2\u907f\u6210\u529f', fontSize: 26, x: 246, y: 42, width: 150, color: new Color(42, 138, 50, 255) },
            { suffix: 'SelectLabel', text: '\u6211\u9009\u62e9\uff1a[\u609f\u9053\u9759\u575b]', fontSize: 22, x: -150, y: -10, width: 310, color: new Color(43, 34, 25, 255) },
            { suffix: 'TargetLabel', text: '\u88ad\u51fb\uff1a[\u79d8\u5b9d\u5e7d\u9601]', fontSize: 22, x: 172, y: -10, width: 310, color: new Color(43, 34, 25, 255) },
            { suffix: 'InvestLabel', text: '\u6295\u5165\u5143\u5b9d\uff1a1', fontSize: 22, x: -150, y: -52, width: 310, color: new Color(43, 34, 25, 255) },
            { suffix: 'RewardLabel', text: '\u83b7\u5f97\u5143\u5b9d\uff1a1.2', fontSize: 22, x: 172, y: -52, width: 310, color: new Color(43, 34, 25, 255) },
        ];
        labels.forEach((item) => {
            const labelExisted = !!row.getChildByName(`${name}${item.suffix}`);
            const label = this.getOrCreateDuelRoomLabel(row, `${name}${item.suffix}`, item.text, item.fontSize, item.x, item.y, item.width, 34, item.color);
            if (!labelExisted) {
                label.horizontalAlign = item.suffix === 'StatusLabel' ? HorizontalTextAlignment.CENTER : HorizontalTextAlignment.LEFT;
                label.overflow = Overflow.SHRINK;
                if (item.suffix === 'StatusLabel') this.clearDuelJianghuRecordLabelOutline(label);
                else this.setLabelOutline(label, new Color(255, 247, 220, 255), 0.5);
            }
        });
        this.syncDuelJianghuRecordPersonalRowFromTemplate(parent, row);
        return row;
    }

    protected syncDuelJianghuRecordValueCellRootFromTemplate(cell: Node): void {
        const template = this.getDuelJianghuRecordValueCellTemplate(cell);
        if (!template || template === cell) return;
        const templateTransform = template.getComponent(UITransform);
        if (templateTransform) {
            const transform = cell.getComponent(UITransform) || cell.addComponent(UITransform);
            transform.setContentSize(templateTransform.contentSize.width, templateTransform.contentSize.height);
        }
        cell.setScale(template.scale.x, template.scale.y, template.scale.z);
    }

    protected syncDuelJianghuRecordPersonalRowFromTemplate(parent: Node, row: Node): void {
        const templateName = row.name.startsWith('LuanshiRecordPersonalRow_') ? 'LuanshiRecordPersonalRow_1' : 'JianghuRecordPersonalRow_1';
        const template = parent.getChildByName(templateName);
        if (!template || template === row) return;

        const rowY = row.position.y;
        row.setPosition(template.position.x, rowY, template.position.z);
        row.setScale(template.scale.x, template.scale.y, template.scale.z);

        const templateTransform = template.getComponent(UITransform);
        if (templateTransform) {
            const rowTransform = row.getComponent(UITransform) || row.addComponent(UITransform);
            rowTransform.setContentSize(templateTransform.contentSize.width, templateTransform.contentSize.height);
        }

        [
            'PeriodLabel',
            'TimeLabel',
            'StatusLabel',
            'SelectLabel',
            'TargetLabel',
            'InvestLabel',
            'RewardLabel',
        ].forEach((suffix) => {
            const source = template.getChildByName(`${template.name}${suffix}`)?.getComponent(Label);
            const target = row.getChildByName(`${row.name}${suffix}`)?.getComponent(Label);
            if (!source || !target) return;
            this.applyDuelJianghuRecordLabelStyle(this.captureDuelJianghuRecordLabelStyle(source), target);
        });
    }

    protected getDuelJianghuRecordValueCellTemplate(cell: Node): Node | null {
        const parent = cell.parent;
        if (!parent) return cell;
        if (cell.name.startsWith('JianghuRecordStatsCell_')) return parent.getChildByName('JianghuRecordStatsCell_mibao_youge') || cell;
        if (cell.name.startsWith('JianghuRecordRecentCell_')) return parent.getChildByName('JianghuRecordRecentCell_1') || cell;
        if (cell.name.startsWith('JianghuRecordSummaryCell_')) return parent.getChildByName('JianghuRecordSummaryCell_Invest') || cell;
        if (cell.name.startsWith('LuanshiRecordRecentCell_')) return parent.getChildByName('LuanshiRecordRecentCell_1') || cell;
        if (cell.name.startsWith('LuanshiRecordSummaryCell_')) return parent.getChildByName('LuanshiRecordSummaryCell_Invest') || cell;
        return cell;
    }

    protected applyDuelJianghuRecordValueCellStyle(cell: Node): void {
        const template = this.getDuelJianghuRecordValueCellTemplate(cell);
        if (!template) return;
        const nameSource = template.getChildByName(`${template.name}NameLabel`)?.getComponent(Label);
        const valueSource = template.getChildByName(`${template.name}ValueLabel`)?.getComponent(Label);
        const nameStyle = nameSource ? this.captureDuelJianghuRecordLabelStyle(nameSource) : null;
        const valueStyle = valueSource ? this.captureDuelJianghuRecordLabelStyle(valueSource) : null;
        const nameLabel = cell.getChildByName(`${cell.name}NameLabel`)?.getComponent(Label);
        const valueLabel = cell.getChildByName(`${cell.name}ValueLabel`)?.getComponent(Label);
        this.applyDuelJianghuRecordLabelStyle(nameStyle, nameLabel);
        this.applyDuelJianghuRecordLabelStyle(valueStyle, valueLabel);
        const resultSource = template.getChildByName(`${template.name}ResultLabel`)?.getComponent(Label);
        const resultLabel = cell.getChildByName(`${cell.name}ResultLabel`)?.getComponent(Label);
        if (resultSource && resultLabel) this.applyDuelJianghuRecordLabelStyle(this.captureDuelJianghuRecordLabelStyle(resultSource), resultLabel);
    }

    protected captureDuelJianghuRecordLabelStyle(label: Label): DuelJianghuRecordLabelStyle {
        const transform = label.node.getComponent(UITransform);
        return {
            positionX: label.node.position.x,
            positionY: label.node.position.y,
            positionZ: label.node.position.z,
            scaleX: label.node.scale.x,
            scaleY: label.node.scale.y,
            scaleZ: label.node.scale.z,
            width: transform?.contentSize.width || 0,
            height: transform?.contentSize.height || 0,
            fontSize: label.fontSize,
            lineHeight: label.lineHeight,
            color: this.cloneDuelJianghuRecordColor(label.color),
            horizontalAlign: label.horizontalAlign,
            verticalAlign: label.verticalAlign,
            overflow: label.overflow,
            enableOutline: label.enableOutline,
            outlineColor: this.cloneDuelJianghuRecordColor(label.outlineColor),
            outlineWidth: label.outlineWidth,
        };
    }

    protected applyDuelJianghuRecordLabelStyle(style: DuelJianghuRecordLabelStyle | null, label: Label | null | undefined): void {
        if (!style || !label) return;
        this.applyDuelJianghuRecordLabelLayout(style, label);
        this.applyDuelJianghuRecordLabelTextStyle(style, label);
    }

    protected applyDuelJianghuRecordLabelLayout(style: DuelJianghuRecordLabelStyle | null, label: Label | null | undefined): void {
        if (!style || !label) return;
        label.node.setPosition(style.positionX, style.positionY, style.positionZ);
        label.node.setScale(style.scaleX, style.scaleY, style.scaleZ);
        const transform = label.node.getComponent(UITransform) || label.node.addComponent(UITransform);
        if (style.width > 0 && style.height > 0) transform.setContentSize(style.width, style.height);
        label.horizontalAlign = style.horizontalAlign;
        label.verticalAlign = style.verticalAlign;
        label.overflow = style.overflow;
    }

    protected applyDuelJianghuRecordLabelTextStyle(style: DuelJianghuRecordLabelStyle | null, label: Label | null | undefined): void {
        if (!style || !label) return;
        label.fontSize = style.fontSize;
        label.lineHeight = style.lineHeight;
        label.color = this.cloneDuelJianghuRecordColor(style.color);
        label.enableOutline = style.enableOutline;
        label.outlineColor = this.cloneDuelJianghuRecordColor(style.outlineColor);
        label.outlineWidth = style.outlineWidth;
    }

    protected cloneDuelJianghuRecordColor(color: Color): Color {
        return new Color(color.r, color.g, color.b, color.a);
    }

    protected clearDuelJianghuRecordLabelOutline(label: Label | null | undefined): void {
        if (!label) return;
        label.enableOutline = false;
        label.outlineWidth = 0;
    }

    protected ensureDuelJianghuRecordStatDetailPanel(recordPage: Node): Node {
        const detail = this.getOrCreateEditorNode('JianghuRecordStatDetailPanel', recordPage, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT, 0, 0);
        this.ensureInputBlocker(detail);
        detail.active = false;
        detail.setSiblingIndex(20);

        const bg = this.getOrCreateEditorSkinnedNode('JianghuRecordStatDetailBg', detail, 690, 1320, 0, -24, HomeConfig.UI_DUEL_JIANGHU_RECORD_STAT_PANEL);
        bg.active = true;
        bg.setSiblingIndex(0);
        this.ensureDuelJianghuRecordSectionTitle(detail, 'JianghuRecordStatDetailTitleBar', '\u8fd1100\u671f\u88ab\u6740\u7edf\u8ba1', 608);

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

    protected openDuelLuanshiRecordPage(page: Node): void {
        const recordPage = this.ensureDuelLuanshiRecordPage(page);
        this.hideDuelLuanshiPageSiblingsForRecord(page, recordPage);
        recordPage.active = true;
        this.refreshDuelLuanshiRecordPage(page, recordPage);
        this.ensureInputBlocker(recordPage);
        recordPage.setSiblingIndex((page.children.length || 1) - 1);
        this.positionDuelBackForLuanshiRecord(page);
    }

    protected closeDuelLuanshiRecordPage(recordPage: Node): void {
        recordPage.active = false;
        const page = recordPage.parent;
        if (page) {
            this.restoreDuelLuanshiPageSiblingsAfterRecord(page);
            this.restoreDuelBackAfterLuanshiRecord(page);
        }
    }

    protected positionDuelBackForLuanshiRecord(page: Node): void {
        const panel = page.parent;
        const back = panel?.getChildByName('DuelBack');
        if (!back) return;
        Tween.stopAllByTarget(back);
        back.active = true;
        back.setPosition(HomeConfig.BOTTOM_ENTRY_BACK_BUTTON_X, HomeConfig.BOTTOM_ENTRY_BACK_BUTTON_Y, 0);
        back.setSiblingIndex((panel.children.length || 1) - 1);
    }

    protected restoreDuelBackAfterLuanshiRecord(page: Node): void {
        const panel = page.parent;
        const back = panel?.getChildByName('DuelBack');
        if (!back) return;
        Tween.stopAllByTarget(back);
        const dock = this.findDuelLuanshiMainNode(page, 'LuanshiZhengxiongBottomDock');
        const backX = HomeConfig.DUEL_LUANSHI_BACK_X;
        const backY = dock?.isValid
            ? HomeConfig.DUEL_LUANSHI_SIDE_BUTTON_Y + dock.position.y
            : HomeConfig.DUEL_BACK_Y;
        back.active = true;
        back.setPosition(backX, backY, 0);
        back.setSiblingIndex((panel.children.length || 1) - 1);
    }

    protected hideDuelLuanshiPageSiblingsForRecord(page: Node, recordPage: Node): void {
        const runtime = page as DuelLuanshiRecordPageHost;
        if (!runtime.duelLuanshiRecordSiblingStates) {
            runtime.duelLuanshiRecordSiblingStates = page.children
                .filter((child) => child !== recordPage)
                .map((node) => ({ node, active: node.active }));
        }
        runtime.duelLuanshiRecordSiblingStates.forEach((state) => {
            if (state.node?.isValid) state.node.active = false;
        });
    }

    protected restoreDuelLuanshiPageSiblingsAfterRecord(page: Node): void {
        const runtime = page as DuelLuanshiRecordPageHost;
        runtime.duelLuanshiRecordSiblingStates?.forEach((state) => {
            if (state.node?.isValid) state.node.active = state.active;
        });
        runtime.duelLuanshiRecordSiblingStates = undefined;
    }

    protected ensureDuelLuanshiRecordPage(page: Node): Node {
        const recordPage = this.getOrCreateEditorNode('LuanshiRecordPage', page, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT, 0, 0);
        this.ensureInputBlocker(recordPage);

        const bg = this.getOrCreateEditorSkinnedNode(
            'LuanshiRecordPageBackground',
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

        const titleBar = this.getOrCreateEditorSkinnedNode('LuanshiRecordHeaderTitleBar', recordPage, 182, 36, 0, 680, HomeConfig.UI_DUEL_JIANGHU_RECORD_TITLE_BAR);
        titleBar.active = true;
        titleBar.setSiblingIndex(1);
        const title = this.getOrCreateDuelRoomLabel(titleBar, 'LuanshiRecordHeaderTitleLabel', '\u8bb0\u5f55', 27, 0, 2, 130, 32, new Color(60, 44, 30, 255));
        title.fontSize = 27;
        title.lineHeight = 33;
        title.horizontalAlign = HorizontalTextAlignment.CENTER;
        title.overflow = Overflow.SHRINK;
        this.setLabelOutline(title, new Color(255, 246, 214, 255), 2);
        title.node.setSiblingIndex(0);

        const legacyBack = recordPage.getChildByName('LuanshiRecordBackButton');
        if (legacyBack) {
            legacyBack.active = false;
            legacyBack.removeFromParent();
        }

        const mainScroll = this.getOrCreateEditorNode('LuanshiRecordMainScroll', recordPage, 662, 1220, 0, -82);
        mainScroll.active = true;
        mainScroll.setSiblingIndex(3);
        const contentHeight = 2519.49;
        const contentY = -610.255;
        const mainContent = this.getOrCreateEditorNode('LuanshiRecordMainContent', mainScroll, 662, contentHeight, 0, contentY);
        mainContent.active = true;
        this.setupDuelJianghuRecordScrollView(mainScroll, mainContent);

        this.ensureDuelLuanshiRecordRecentPanel(mainContent);
        this.ensureDuelLuanshiRecordSummaryPanel(mainContent);
        this.ensureDuelLuanshiRecordPersonalRows(mainContent, this.getDuelLuanshiPersonalRecords(page));
        this.applyDuelJianghuRecordFont(recordPage);
        return recordPage;
    }

    protected ensureDuelLuanshiRecordRecentPanel(parent: Node): Node {
        const panel = this.getOrCreateEditorSkinnedNode('LuanshiRecordRecentPanel', parent, 640, 315, 0.457, 735, HomeConfig.UI_DUEL_JIANGHU_RECORD_STAT_PANEL);
        panel.active = true;
        panel.setSiblingIndex(0);
        this.ensureDuelJianghuRecordSectionTitle(panel, 'LuanshiRecordRecentTitleBar', '\u8fd110\u671f\u4e71\u4e16\u4e89\u96c4\u8bb0\u5f55', 104, 300);
        const xs = [-252, -126, 0, 126, 252];
        const ys = [18, -78];
        for (let index = 0; index < 10; index += 1) {
            this.ensureDuelJianghuRecordValueCell(panel, `LuanshiRecordRecentCell_${index + 1}`, xs[index % 5], ys[Math.floor(index / 5)], 112, 88);
        }
        return panel;
    }

    protected ensureDuelLuanshiRecordSummaryPanel(parent: Node): Node {
        const panel = this.getOrCreateEditorSkinnedNode('LuanshiRecordSummaryPanel', parent, 640, 250, 0, 390, HomeConfig.UI_DUEL_JIANGHU_RECORD_STAT_PANEL);
        panel.active = true;
        panel.setSiblingIndex(1);
        this.ensureDuelJianghuRecordSectionTitle(panel, 'LuanshiRecordSummaryTitleBar', '\u6211\u53c2\u4e0e\u7684\u8bb0\u5f55', 74);
        [
            { name: 'Invest', x: -210 },
            { name: 'Success', x: 0 },
            { name: 'Reward', x: 210 },
        ].forEach((item) => this.ensureDuelJianghuRecordValueCell(panel, `LuanshiRecordSummaryCell_${item.name}`, item.x, -42, 190, 92));
        return panel;
    }

    protected ensureDuelLuanshiRecordPersonalRows(parent: Node, records: DuelLuanshiPersonalRecordEntry[]): void {
        records.forEach((_, index) => {
            this.ensureDuelJianghuRecordPersonalRow(parent, `LuanshiRecordPersonalRow_${index + 1}`, this.getDuelLuanshiRecordPersonalRowY(parent, index));
        });
    }

    protected getDuelLuanshiRecordPersonalRowY(parent: Node, zeroBasedIndex: number): number {
        const existing = parent.getChildByName(`LuanshiRecordPersonalRow_${zeroBasedIndex + 1}`);
        if (existing) return existing.position.y;

        const rows = parent.children
            .map((child) => {
                const match = /^LuanshiRecordPersonalRow_(\d+)$/.exec(child.name);
                return match ? { index: Number(match[1]) - 1, node: child } : null;
            })
            .filter((item): item is { index: number; node: Node } => !!item)
            .sort((a, b) => a.index - b.index);
        const last = rows[rows.length - 1];
        const prev = rows[rows.length - 2];
        if (last && prev) {
            const step = Math.abs(prev.node.position.y - last.node.position.y) || HomeConfig.DUEL_JIANGHU_RECORD_PERSONAL_ROW_STEP;
            return last.node.position.y - Math.max(0, zeroBasedIndex - last.index) * step;
        }
        if (last) {
            return last.node.position.y - Math.max(0, zeroBasedIndex - last.index) * HomeConfig.DUEL_JIANGHU_RECORD_PERSONAL_ROW_STEP;
        }
        return 112 - zeroBasedIndex * HomeConfig.DUEL_JIANGHU_RECORD_PERSONAL_ROW_STEP;
    }

    protected refreshDuelLuanshiRecordPage(page: Node, recordPage: Node): void {
        if (!recordPage?.isValid) return;
        const recentRecords = this.getDuelLuanshiRecentRecords(page);
        const personalRecords = this.getDuelLuanshiPersonalRecords(page);
        const mainContent = recordPage.getChildByName('LuanshiRecordMainScroll')?.getChildByName('LuanshiRecordMainContent');
        const recentPanel = mainContent?.getChildByName('LuanshiRecordRecentPanel');
        if (recentPanel) this.refreshDuelLuanshiRecordRecentPanel(recentPanel, recentRecords);
        const summaryPanel = mainContent?.getChildByName('LuanshiRecordSummaryPanel');
        if (summaryPanel) this.refreshDuelLuanshiRecordSummaryPanel(summaryPanel, personalRecords);
        if (mainContent) this.refreshDuelLuanshiRecordPersonalRows(mainContent, personalRecords);
        const scroll = recordPage.getChildByName('LuanshiRecordMainScroll');
        if (scroll && mainContent) this.resizeDuelLuanshiRecordContentToRows(scroll, mainContent);
        this.applyDuelJianghuRecordFont(recordPage);
    }

    protected resizeDuelLuanshiRecordContentToRows(scrollRoot: Node, content: Node): void {
        const scrollHeight = scrollRoot.getComponent(UITransform)?.contentSize.height || 1298.648;
        const contentTransform = content.getComponent(UITransform) || content.addComponent(UITransform);
        const recentPanel = content.getChildByName('LuanshiRecordRecentPanel');
        const rows = content.children
            .map((child) => {
                const match = /^LuanshiRecordPersonalRow_(\d+)$/.exec(child.name);
                return match ? { index: Number(match[1]), node: child } : null;
            })
            .filter((item): item is { index: number; node: Node } => !!item)
            .sort((a, b) => a.index - b.index);
        const lastRow = rows[rows.length - 1]?.node;
        const topHeight = recentPanel
            ? (recentPanel.getComponent(UITransform)?.contentSize.height || 315) * recentPanel.scale.y
            : 315;
        const rowHeight = lastRow
            ? (lastRow.getComponent(UITransform)?.contentSize.height || 142) * lastRow.scale.y
            : 142;
        const top = (recentPanel?.position.y || 1080) + topHeight / 2 + 30;
        const bottom = (lastRow?.position.y || -408) - rowHeight / 2 - 80;
        const contentHeight = Math.max(scrollHeight, top - bottom);
        contentTransform.setContentSize(contentTransform.contentSize.width || 662, contentHeight);
        content.setPosition(content.position.x, (scrollHeight - contentHeight) / 2, content.position.z);
    }

    protected refreshDuelLuanshiRecordRecentPanel(panel: Node, entries: DuelLuanshiRecordRecentEntry[]): void {
        entries.forEach((entry, index) => {
            const cell = panel.getChildByName(`LuanshiRecordRecentCell_${index + 1}`);
            this.setDuelJianghuRecordValueCell(cell, `${entry.winnerName}\u80dc\u5229`, `\u7b2c${entry.period}\u671f`);
            const nameLabel = cell?.getChildByName(`${cell.name}NameLabel`)?.getComponent(Label);
            if (nameLabel) {
                nameLabel.fontSize = 18;
                nameLabel.lineHeight = 22;
                nameLabel.color = entry.winner === 'wudang'
                    ? new Color(42, 138, 50, 255)
                    : new Color(186, 46, 36, 255);
            }
        });
    }

    protected refreshDuelLuanshiRecordSummaryPanel(panel: Node, records: DuelLuanshiPersonalRecordEntry[]): void {
        const invest = records.reduce((sum, record) => sum + record.investAmount, 0);
        const reward = records.reduce((sum, record) => sum + record.rewardAmount, 0);
        const wins = records.filter((record) => record.success).length;
        this.setDuelJianghuRecordValueCell(panel.getChildByName('LuanshiRecordSummaryCell_Invest'), this.formatDuelJianghuYuanbaoAmount(invest), '\u603b\u6295\u5165');
        this.setDuelJianghuRecordValueCell(panel.getChildByName('LuanshiRecordSummaryCell_Success'), `${wins}\u6b21`, '\u80dc\u5229\u6b21\u6570');
        this.setDuelJianghuRecordValueCell(panel.getChildByName('LuanshiRecordSummaryCell_Reward'), this.formatDuelJianghuYuanbaoAmount(reward), '\u603b\u83b7\u5f97');
    }

    protected refreshDuelLuanshiRecordPersonalRows(parent: Node, records: DuelLuanshiPersonalRecordEntry[]): void {
        records.forEach((record, index) => {
            const row = this.ensureDuelJianghuRecordPersonalRow(parent, `LuanshiRecordPersonalRow_${index + 1}`, this.getDuelLuanshiRecordPersonalRowY(parent, index));
            const status = row.getChildByName(`${row.name}StatusLabel`)?.getComponent(Label);
            if (status) {
                status.string = record.success ? '\u80dc\u5229' : '\u5931\u8d25';
                status.color = record.success ? new Color(42, 138, 50, 255) : new Color(186, 46, 36, 255);
                this.clearDuelJianghuRecordLabelOutline(status);
            }
            const period = row.getChildByName(`${row.name}PeriodLabel`)?.getComponent(Label);
            if (period) period.string = `\u7b2c${record.period}\u671f`;
            const time = row.getChildByName(`${row.name}TimeLabel`)?.getComponent(Label);
            if (time) time.string = record.time;
            const select = row.getChildByName(`${row.name}SelectLabel`)?.getComponent(Label);
            if (select) select.string = `\u6211\u9009\u62e9\uff1a[${record.selectedFactionName}]`;
            const target = row.getChildByName(`${row.name}TargetLabel`)?.getComponent(Label);
            if (target) target.string = `\u80dc\u65b9\uff1a[${record.winnerName}]`;
            const invest = row.getChildByName(`${row.name}InvestLabel`)?.getComponent(Label);
            if (invest) invest.string = `\u6295\u5165\u5143\u5b9d\uff1a${this.formatDuelJianghuYuanbaoAmount(record.investAmount)}`;
            const reward = row.getChildByName(`${row.name}RewardLabel`)?.getComponent(Label);
            if (reward) reward.string = `\u83b7\u5f97\u5143\u5b9d\uff1a${this.formatDuelJianghuYuanbaoAmount(record.rewardAmount)}`;
        });
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
        this.applyDuelJianghuRecordFont(recordPage);
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
            this.setDuelJianghuRecordRecentCell(cell, entry);
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
                status.color = record.success ? new Color(42, 138, 50, 255) : new Color(186, 46, 36, 255);
                this.clearDuelJianghuRecordLabelOutline(status);
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
            this.setLabelOutline(period, new Color(255, 248, 220, 255), 0.5);
            const room = this.getOrCreateDuelRoomLabel(row, `${row.name}RoomLabel`, `\u88ab\u6740\u623f\u95f4\uff1a${entry.roomName}`, 22, 10, 0, 270, 42, new Color(64, 46, 32, 255));
            room.horizontalAlign = HorizontalTextAlignment.LEFT;
            room.overflow = Overflow.SHRINK;
            this.setLabelOutline(room, new Color(255, 248, 220, 255), 0.5);
            const killer = this.getOrCreateDuelRoomLabel(row, `${row.name}KillerLabel`, entry.killerName, 21, 222, 0, 130, 42, new Color(126, 70, 42, 255));
            killer.horizontalAlign = HorizontalTextAlignment.CENTER;
            killer.overflow = Overflow.SHRINK;
            this.setLabelOutline(killer, new Color(255, 248, 220, 255), 0.5);
        });
    }

    protected setDuelJianghuRecordValueCell(cell: Node | null | undefined, name: string, value: string): void {
        if (!cell) return;
        this.applyDuelJianghuRecordValueCellStyle(cell);
        const nameLabel = cell.getChildByName(`${cell.name}NameLabel`)?.getComponent(Label);
        if (nameLabel) nameLabel.string = name;
        const valueLabel = cell.getChildByName(`${cell.name}ValueLabel`)?.getComponent(Label);
        if (valueLabel) valueLabel.string = value;
    }

    protected setDuelJianghuRecordRecentCell(cell: Node | null | undefined, entry: DuelJianghuRecordKillEntry): void {
        if (!cell) return;
        this.applyDuelJianghuRecordValueCellStyle(cell);
        const roomNames = this.getDuelJianghuRecordEntryRoomNames(entry);
        const isDoubleKill = roomNames.length > 1;
        const hasCounterKill = (entry.resultTags || []).indexOf('counterKill') >= 0;
        const nameLabel = cell.getChildByName(`${cell.name}NameLabel`)?.getComponent(Label);
        if (nameLabel) {
            nameLabel.string = roomNames.join('\n');
            nameLabel.fontSize = isDoubleKill ? 17 : nameLabel.fontSize;
            nameLabel.lineHeight = isDoubleKill ? 20 : nameLabel.lineHeight;
        }
        const valueLabel = cell.getChildByName(`${cell.name}ValueLabel`)?.getComponent(Label);
        if (valueLabel) valueLabel.string = `${entry.period}\u671f`;
        const resultLabel = this.ensureDuelJianghuRecordRecentResultLabel(cell);
        resultLabel.string = '\uff08\u53cd\u6740\uff09';
        resultLabel.color = new Color(184, 42, 32, 255);
        this.clearDuelJianghuRecordLabelOutline(resultLabel);
        resultLabel.node.active = hasCounterKill;
    }

    protected showDuelJianghuRecordStatDetail(recordPage: Node): void {
        const detail = this.ensureDuelJianghuRecordStatDetailPanel(recordPage);
        this.refreshDuelJianghuRecordStatDetailRows(recordPage, this.getDuelJianghuRecordKillHistory(100));
        detail.active = true;
        detail.setSiblingIndex((recordPage.children.length || 1) - 1);
        this.applyDuelJianghuRecordFont(detail);
    }

    protected closeDuelJianghuRecordStatDetail(recordPage: Node): void {
        const detail = recordPage.getChildByName('JianghuRecordStatDetailPanel');
        if (detail) detail.active = false;
    }

    protected getDuelJianghuRecordStats(history: DuelJianghuRecordKillEntry[]): Array<{ roomName: string; count: number; roomId: DuelJianghuRoomId }> {
        return HomeConfig.DUEL_JIANGHU_ROOM_LABELS.map((room) => ({
            roomName: room.name,
            roomId: room.id,
            count: history.reduce((sum, entry) => sum + this.getDuelJianghuRecordEntryRoomNames(entry).filter((name) => name === room.name).length, 0),
        }));
    }

    protected getDuelJianghuRecordEntryRoomNames(entry: DuelJianghuRecordKillEntry): string[] {
        const names = entry.roomNames?.filter((name) => !!name) || [];
        if (names.length > 0) return names;
        return entry.roomName ? [entry.roomName] : [];
    }

    protected applyDuelJianghuRecordFont(root: Node): void {
        applyMicrosoftYaHeiFontToTree(root);
    }

    protected getDuelJianghuRecordKillHistory(limit: number): DuelJianghuRecordKillEntry[] {
        const rooms = HomeConfig.DUEL_JIANGHU_ROOM_LABELS;
        const killers = ['\u523a\u5ba2', '\u53db\u95e8\u9006\u5f92', '\u767e\u6218\u5c06\u519b', '\u5217\u9635\u5175\u5352'];
        const currentPeriod = Number(HomeConfig.DUEL_JIANGHU_CURRENT_PERIOD) || 15472;
        return Array.from({ length: limit }, (_, index) => {
            const room = rooms[(index * 3 + Math.floor(index / 4)) % rooms.length];
            const nextRoom = rooms[(index * 3 + Math.floor(index / 4) + 2) % rooms.length];
            const isCounterKill = index === 1 || (index > 10 && index % 17 === 0);
            const isDoubleKill = index === 2 || (index > 10 && index % 19 === 0);
            const roomNames = isDoubleKill ? [room.name, nextRoom.name] : [room.name];
            return {
                period: currentPeriod - index,
                roomName: room.name,
                roomNames,
                killerName: killers[index % killers.length],
                resultTags: isCounterKill ? ['counterKill'] : undefined,
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

    protected getDuelLuanshiCurrentPeriod(page: Node): number {
        const runtime = page as { duelLuanshiRoundIndex?: number };
        return Math.max(10, Math.floor(runtime.duelLuanshiRoundIndex || 10));
    }

    protected getDuelLuanshiRecordFactionName(faction: 'wudang' | 'gaibang'): string {
        return faction === 'wudang' ? '\u6b66\u5f53' : '\u4e10\u5e2e';
    }

    protected getDuelLuanshiRecentRecords(page: Node): DuelLuanshiRecordRecentEntry[] {
        const currentPeriod = this.getDuelLuanshiCurrentPeriod(page);
        return Array.from({ length: 10 }, (_, index) => {
            const winner = (index % 3 === 1 ? 'gaibang' : 'wudang') as 'wudang' | 'gaibang';
            return {
                period: currentPeriod - index,
                winner,
                winnerName: this.getDuelLuanshiRecordFactionName(winner),
            };
        });
    }

    protected getDuelLuanshiPersonalRecords(page: Node): DuelLuanshiPersonalRecordEntry[] {
        const currentPeriod = this.getDuelLuanshiCurrentPeriod(page);
        const joinedFaction = ((page as { duelLuanshiFaction?: 'wudang' | 'gaibang' }).duelLuanshiFaction || 'wudang') as 'wudang' | 'gaibang';
        const fallbackOpposite = joinedFaction === 'wudang' ? 'gaibang' : 'wudang';
        const source: Array<{ selected: 'wudang' | 'gaibang'; winner: 'wudang' | 'gaibang'; invest: number; reward: number; time: string }> = [
            { selected: joinedFaction, winner: joinedFaction, invest: 80, reward: 128.6, time: '2026-07-21 12:18:06' },
            { selected: joinedFaction, winner: fallbackOpposite, invest: 80, reward: 0, time: '2026-07-21 11:58:31' },
            { selected: fallbackOpposite, winner: fallbackOpposite, invest: 160, reward: 235.2, time: '2026-07-21 11:38:14' },
            { selected: joinedFaction, winner: joinedFaction, invest: 80, reward: 116.8, time: '2026-07-21 11:17:52' },
            { selected: fallbackOpposite, winner: joinedFaction, invest: 80, reward: 0, time: '2026-07-21 10:57:45' },
            { selected: joinedFaction, winner: joinedFaction, invest: 160, reward: 246.4, time: '2026-07-21 10:37:29' },
        ];
        return source.map((record, index) => ({
            period: currentPeriod - index * 2,
            time: record.time,
            selectedFactionName: this.getDuelLuanshiRecordFactionName(record.selected),
            winnerName: this.getDuelLuanshiRecordFactionName(record.winner),
            success: record.selected === record.winner,
            investAmount: record.invest,
            rewardAmount: record.reward,
        }));
    }
}
