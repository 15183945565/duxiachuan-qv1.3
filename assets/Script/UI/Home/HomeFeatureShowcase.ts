import {
    Color,
    Graphics,
    HorizontalTextAlignment,
    Label,
    Node,
    Overflow,
    Sprite,
    UIOpacity,
    UITransform,
    VerticalTextAlignment,
} from 'cc';
import { BAG_ILLUSTRATION_CATALOG } from './BagIllustrationCatalog.generated';
import * as HomeConfig from './HomeConfig';
import { HomeViewBase } from './HomeViewBase';
import { ShowcaseTab } from './HomeTypes';

abstract class HomeFeatureShowcaseHost extends HomeViewBase {
    protected abstract getOrCreateEditorLabel(parent: Node, name: string, text: string, fontSize: number, x: number, y: number, width: number, height: number, color: Color): Label;
    protected abstract getOrCreateEditorNode(name: string, parent: Node, width: number, height: number, x: number, y: number): Node;
    protected abstract getOrCreateEditorSkinnedNode(name: string, parent: Node, width: number, height: number, x: number, y: number, skinPath: string): Node;
    protected abstract setLabelOutline(label: Label, color: Color, width: number): void;
}

/**
 * 珍藏展示页面、统计面板、兽卡增量和趋势图渲染。
 *
 * 展示页只消费目录与编辑器节点能力，不持有业务资产或资源生命周期状态。
 */
export abstract class HomeFeatureShowcase extends HomeFeatureShowcaseHost {
    protected bindShowcasePage(panel: Node): void {
        panel.children.forEach((child) => {
            child.active = child.name === 'ShowcasePanelBackground' || child.name === 'ShowcaseBack' || child.name === 'ShowcaseRebuildRoot';
        });

        const background = this.findNode('ShowcasePanelBackground', panel);
        if (background?.isValid) {
            background.active = true;
            background.setSiblingIndex(0);
            (background.getComponent(UITransform) || background.addComponent(UITransform))
                .setContentSize(HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT);
            this.applyUiSkinKeepingEditorSize(background, HomeConfig.UI_SHOWCASE_PAGE_BG, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT);
        }

        const root = this.getOrCreateEditorNode('ShowcaseRebuildRoot', panel, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT, 0, 0);
        root.active = true;
        root.setSiblingIndex(1);
        this.buildShowcaseDashboard(root);

        const back = this.findNode('ShowcaseBack', panel);
        if (back?.isValid) {
            back.active = true;
            back.setSiblingIndex((panel.children.length || 1) - 1);
        }
    }
    protected buildShowcaseDashboard(root: Node): void {
        const panelWidth = 724;
        const topPanel = this.createShowcasePanel(root, 'ShowcaseCrystalPanel', '\u5e73\u53f0\u5143\u5b9d\u6570\u91cf', panelWidth, 198, 0, 510);
        this.createShowcaseLabel(topPanel, 'ShowcaseInflationLabel', '\u81a8\u80c0\u7387\uff1a0.387', 28, 0, 20, 300, 42, new Color(255, 236, 182, 255));
        this.createShowcaseLabel(topPanel, 'ShowcaseTurnoverName', '\u6362\u624b\u7387\uff1a', 25, -190, -52, 134, 36, new Color(245, 226, 190, 255), HorizontalTextAlignment.RIGHT);
        this.createShowcaseLabel(topPanel, 'ShowcaseTurnoverValue', '39.22%', 25, -88, -52, 126, 36, new Color(232, 54, 48, 255), HorizontalTextAlignment.LEFT);
        this.createShowcaseLabel(topPanel, 'ShowcaseCirculationName', '\u6d41\u901a\u7387\uff1a', 25, 108, -52, 134, 36, new Color(245, 226, 190, 255), HorizontalTextAlignment.RIGHT);
        this.createShowcaseLabel(topPanel, 'ShowcaseCirculationValue', '41.69%', 25, 212, -52, 126, 36, new Color(72, 218, 88, 255), HorizontalTextAlignment.LEFT);

        const cardPanel = this.createShowcasePanel(root, 'ShowcaseCardDailyPanel', '\u4eca\u65e5\u65b0\u589e\u5361\u6570', panelWidth, 252, 0, 270);
        const cards = [
            { id: 'item_107', name: '\u9752\u72ee\u517d\u5361', count: 4 },
            { id: 'item_103', name: '\u767d\u9e7f\u517d\u5361', count: 1 },
            { id: 'item_101', name: '\u91d1\u9e64\u517d\u5361', count: 0 },
            { id: 'item_105', name: '\u8d64\u72d0\u517d\u5361', count: 0 },
        ];
        const cardXs = [-270, -90, 90, 270];
        cards.forEach((card, index) => {
            const item = BAG_ILLUSTRATION_CATALOG.find((catalogItem) => catalogItem.id === card.id);
            const slot = this.getOrCreateEditorNode(`ShowcaseCardSlot_${index + 1}`, cardPanel, 146, 148, cardXs[index], -38);
            slot.active = true;
            this.createShowcaseLabel(slot, 'ShowcaseCardName', card.name, 23, 0, 56, 146, 34, new Color(255, 238, 190, 255));
            if (item) {
                this.getOrCreateEditorSkinnedNode('ShowcaseCardIcon', slot, 58, 58, -22, -14, item.iconPath).setSiblingIndex(1);
            }
            this.createShowcaseLabel(slot, 'ShowcaseCardCount', String(card.count), 23, 42, -22, 50, 34, new Color(255, 245, 216, 255), HorizontalTextAlignment.LEFT);
        });

        const gainPanel = this.createShowcasePanel(root, 'ShowcaseGainPanel', '\u4eca\u65e5\u589e\u76ca', panelWidth, 252, 0, 18);
        const gains = [
            { label: '\u517d\u8109\u4ea7\u51fa\u500d\u7387', value: '1.49', x: -182, y: 28 },
            { label: '\u5e7f\u544a\u83b7\u5f97\u5143\u5b9d\u500d\u7387', value: '1.13', x: 182, y: 28 },
            { label: '\u6218\u573a\u83b7\u5f97\u5143\u5b9d\u500d\u7387', value: '1.25', x: -182, y: -62 },
            { label: '\u53e4\u8463\u83b7\u5f97\u500d\u7387', value: '0.63', x: 182, y: -62 },
        ];
        gains.forEach((gain, index) => {
            this.createShowcaseLabel(gainPanel, `ShowcaseGainName_${index + 1}`, gain.label, 24, gain.x, gain.y + 20, 310, 38, new Color(246, 226, 184, 255));
            this.createShowcaseLabel(gainPanel, `ShowcaseGainValue_${index + 1}`, gain.value, 25, gain.x, gain.y - 24, 138, 38, new Color(255, 244, 210, 255));
        });

        const chartPanel = this.createShowcasePanel(root, 'ShowcaseTrendPanel', '\u517d\u8109\u4ea7\u51fa\u500d\u7387', panelWidth, 486, 0, -346);
        this.createShowcaseTrendChart(chartPanel);
    }
    protected createShowcasePanel(parent: Node, name: string, title: string, width: number, height: number, x: number, y: number): Node {
        const panel = this.getOrCreateEditorNode(name, parent, width, height, x, y);
        panel.active = true;
        const bg = this.getOrCreateEditorSkinnedNode(`${name}Bg`, panel, width, height, 0, 0, HomeConfig.UI_SHOWCASE_PANEL_BG);
        const bgSprite = bg.getComponent(Sprite);
        if (bgSprite) bgSprite.color = Color.WHITE;
        const bgOpacity = bg.getComponent(UIOpacity);
        if (bgOpacity) bgOpacity.opacity = 255;
        bg.setSiblingIndex(0);

        const titleFrame = this.getOrCreateEditorSkinnedNode(`${name}TitleFrame`, panel, 488, 66, 0, height / 2 - 42, HomeConfig.UI_SHOWCASE_TITLE_FRAME);
        const titleSprite = titleFrame.getComponent(Sprite);
        if (titleSprite) titleSprite.color = Color.WHITE;
        titleFrame.setSiblingIndex(1);

        const titleLabel = this.createShowcaseLabel(panel, `${name}Title`, `\u2022 ${title} \u2022`, 27, 0, height / 2 - 42, 430, 46, new Color(255, 223, 143, 255));
        titleLabel.node.setSiblingIndex(2);
        return panel;
    }
    protected createShowcaseLabel(
        parent: Node,
        name: string,
        text: string,
        fontSize: number,
        x: number,
        y: number,
        width: number,
        height: number,
        color: Color,
        align: HorizontalTextAlignment = HorizontalTextAlignment.CENTER,
    ): Label {
        const effectiveColor = name === 'ShowcaseTurnoverValue' || name === 'ShowcaseCirculationValue'
            ? color
            : Color.WHITE;
        const label = this.getOrCreateEditorLabel(parent, name, text, fontSize, x, y, width, height, effectiveColor);
        label.horizontalAlign = align;
        label.verticalAlign = VerticalTextAlignment.CENTER;
        label.overflow = Overflow.SHRINK;
        label.color = effectiveColor;
        this.setLabelOutline(label, Color.BLACK, 2);
        return label;
    }
    protected createShowcaseTrendChart(parent: Node): void {
        const chart = this.getOrCreateEditorNode('ShowcaseTrendChartCanvas', parent, 642, 314, 20, -62);
        chart.active = true;
        const graphics = chart.getComponent(Graphics) || chart.addComponent(Graphics);
        graphics.clear();

        const left = -286;
        const right = 288;
        const top = 116;
        const bottom = -108;
        const yLabels = [1.27, 1.41, 1.55, 1.69, 1.83];
        const data = [1.49, 1.72, 1.67, 1.67, 1.55, 1.59, 1.52];
        const min = yLabels[0];
        const max = yLabels[yLabels.length - 1];
        const mapY = (value: number): number => bottom + ((value - min) / (max - min)) * (top - bottom);
        const mapX = (index: number): number => left + (index / (data.length - 1)) * (right - left);

        graphics.lineWidth = 2;
        graphics.strokeColor = new Color(185, 168, 125, 105);
        yLabels.forEach((value, index) => {
            const y = bottom + (index / (yLabels.length - 1)) * (top - bottom);
            graphics.moveTo(left, y);
            graphics.lineTo(right, y);
            this.createShowcaseLineSegment(chart, `ShowcaseTrendGridLine_${index + 1}`, left, y, right, y, 2, new Color(185, 168, 125, 105));
            this.createShowcaseLabel(chart, `ShowcaseTrendY_${index + 1}`, value.toFixed(2), 18, left - 48, y, 58, 28, new Color(224, 204, 164, 255), HorizontalTextAlignment.RIGHT);
        });
        graphics.stroke();

        graphics.lineWidth = 4;
        graphics.strokeColor = new Color(232, 184, 58, 255);
        data.forEach((value, index) => {
            const x = mapX(index);
            const y = mapY(value);
            if (index === 0) {
                graphics.moveTo(x, y);
            } else {
                graphics.lineTo(x, y);
                this.createShowcaseLineSegment(chart, `ShowcaseTrendLine_${index}`, mapX(index - 1), mapY(data[index - 1]), x, y, 4, new Color(232, 184, 58, 255));
            }
        });
        graphics.stroke();

        graphics.fillColor = new Color(255, 210, 72, 255);
        data.forEach((value, index) => {
            const x = mapX(index);
            const y = mapY(value);
            graphics.circle(x, y, 5);
            graphics.fill();
            const dot = this.getOrCreateEditorSkinnedNode(`ShowcaseTrendDot_${index + 1}`, chart, 10, 10, x, y, HomeConfig.UI_SHOWCASE_CHART_PIXEL);
            const dotSprite = dot.getComponent(Sprite);
            if (dotSprite) dotSprite.color = new Color(255, 210, 72, 255);
            dot.setSiblingIndex(8);
            this.createShowcaseLabel(chart, `ShowcaseTrendValue_${index + 1}`, value.toFixed(2), 17, x, y + 24, 62, 28, new Color(245, 203, 86, 255));
        });

        ['05\u670823\u65e5', '05\u670824\u65e5', '05\u670825\u65e5', '05\u670826\u65e5', '05\u670827\u65e5', '05\u670828\u65e5', '05\u670829\u65e5'].forEach((date, index) => {
            this.createShowcaseLabel(chart, `ShowcaseTrendDate_${index + 1}`, date, 17, mapX(index), bottom - 38, 82, 28, new Color(218, 198, 158, 255));
        });
    }
    protected createShowcaseLineSegment(parent: Node, name: string, x1: number, y1: number, x2: number, y2: number, thickness: number, color: Color): Node {
        const width = Math.max(1, Math.hypot(x2 - x1, y2 - y1));
        const x = (x1 + x2) / 2;
        const y = (y1 + y2) / 2;
        const line = this.getOrCreateEditorSkinnedNode(name, parent, width, thickness, x, y, HomeConfig.UI_SHOWCASE_CHART_PIXEL);
        line.active = true;
        line.setRotationFromEuler(0, 0, Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI);
        const sprite = line.getComponent(Sprite);
        if (sprite) sprite.color = color;
        line.setSiblingIndex(4);
        return line;
    }
    protected switchShowcaseTab(panel: Node, tab: ShowcaseTab): void {
        this.showcaseActiveTab = tab;
        const metricConfigs: Record<ShowcaseTab, Array<[string, string]>> = {
            overview: [
                ['\u5e73\u53f0\u517d\u5361', '0'],
                ['\u4eca\u65e5\u4ea7\u51fa', '0'],
                ['\u7d2f\u8ba1\u6536\u76ca', '0'],
            ],
            cards: [
                ['\u517d\u5361\u603b\u6570', '0'],
                ['\u6700\u9ad8\u54c1\u8d28', '-'],
                ['\u53ef\u4e0a\u9635', '0'],
            ],
            record: [
                ['\u4eca\u65e5\u6536\u76ca', '0'],
                ['\u6628\u65e5\u6536\u76ca', '0'],
                ['\u7d2f\u8ba1\u6536\u76ca', '0'],
            ],
        };
        const rowConfigs: Record<ShowcaseTab, Array<[string, string]>> = {
            overview: [
                ['\u767d\u8272\u517d\u5361', '0'],
                ['\u9752\u8272\u517d\u5361', '0'],
                ['\u7d2b\u8272\u517d\u5361', '0'],
                ['\u4e03\u5f69\u517d\u5361', '0'],
            ],
            cards: [
                ['\u51b0\u7130\u50b2\u72ee', '0'],
                ['\u5e7b\u96ea\u9e3e\u821e', '0'],
                ['\u91d1\u7130\u76f8\u7fbd', '0'],
                ['\u7130\u708e\u4e5d\u5c3e\u72d0', '0'],
            ],
            record: [
                ['\u4ea7\u51fa\u8bb0\u5f55', '\u6682\u65e0'],
                ['\u6536\u53d6\u8bb0\u5f55', '\u6682\u65e0'],
                ['\u500d\u7387\u53d8\u66f4', '\u6682\u65e0'],
                ['\u517d\u5361\u53d8\u66f4', '\u6682\u65e0'],
            ],
        };
        metricConfigs[tab].forEach(([title, value], index) => {
            this.setFeatureLabel(panel, `ShowcaseMetricTitle_${index + 1}`, title);
            this.setFeatureLabel(panel, `ShowcaseMetricValue_${index + 1}`, value);
        });
        rowConfigs[tab].forEach(([title, value], index) => {
            this.setFeatureLabel(panel, `ShowcaseCardName_${index + 1}`, title);
            this.setFeatureLabel(panel, `ShowcaseCardValue_${index + 1}`, value);
        });
        const recordButton = this.findNode('ShowcaseRecordButton', panel);
        if (recordButton) recordButton.active = tab !== 'record';
        this.refreshFeatureTabState(panel, [
            ['overview', 'ShowcaseTabOverview'],
            ['cards', 'ShowcaseTabCards'],
            ['record', 'ShowcaseTabRecord'],
        ], tab);
    }
}
