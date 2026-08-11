import {
    Color,
    EventTouch,
    HorizontalTextAlignment,
    Label,
    Mask,
    Node,
    Overflow,
    RichText,
    ScrollView,
    UITransform,
    VerticalTextAlignment,
} from 'cc';
import { applySimKaiFont, applySimKaiFontToRichText } from '../Common/UIFont';
import * as HomeConfig from './HomeConfig';
import { HomeViewBase } from './HomeViewBase';

const RECORD_PAGE_TITLE_COLOR = new Color(79, 64, 43, 255);
const RECORD_ROW_OUTLINE_COLOR = new Color(246, 245, 235, 255);

abstract class HomeFeatureBeastCardRecordHost extends HomeViewBase {
    protected abstract beastCardRecordPopup: Node | null;
    protected abstract beastCardRecordScrollView: ScrollView | null;
    protected abstract beastCardRecordContent: Node | null;
    protected abstract getOrCreateBeastCardNode(
        name: string,
        width: number,
        height: number,
        x: number,
        y: number,
    ): { node: Node; existed: boolean };
    protected abstract setLabelOutline(label: Label, color: Color, width: number): void;
}

/**
 * Owns Beast Card output-record popup construction, rendering and scrolling.
 */
export abstract class HomeFeatureBeastCardRecord extends HomeFeatureBeastCardRecordHost {
    protected ensureBeastCardRecordPopup(): void {
        if (!this.beastCardRoot?.isValid) return;

        const popup = this.getOrCreateBeastCardNode(
            'BeastCardRecordPopup',
            HomeConfig.VIEW_WIDTH,
            HomeConfig.VIEW_HEIGHT,
            0,
            0,
        ).node;
        this.beastCardRecordPopup = popup;
        popup.setSiblingIndex(40);
        this.ensureInputBlocker(popup);
        popup.off(Node.EventType.TOUCH_END);
        popup.on(Node.EventType.TOUCH_END, (event: EventTouch) => {
            event.propagationStopped = true;
        }, this);

        const board = this.getOrCreateBeastCardChildSkinnedNode(
            popup,
            'BeastCardRecordBoard',
            HomeConfig.BEAST_RECORD_POPUP_WIDTH,
            HomeConfig.BEAST_RECORD_POPUP_HEIGHT,
            0,
            HomeConfig.BEAST_RECORD_POPUP_Y,
            HomeConfig.UI_BEAST_RECORD_POPUP_BG,
        );
        this.applyUiSkinKeepingEditorSize(
            board,
            HomeConfig.UI_BEAST_RECORD_POPUP_BG,
            HomeConfig.BEAST_RECORD_POPUP_WIDTH,
            HomeConfig.BEAST_RECORD_POPUP_HEIGHT,
        );
        board.setSiblingIndex(1);
        board.off(Node.EventType.TOUCH_END);
        board.on(Node.EventType.TOUCH_END, (event: EventTouch) => {
            event.propagationStopped = true;
        }, this);

        this.hideLegacyBeastCardRecordNode(board, 'BeastCardRecordTitleFrame');

        const pageTitle = this.getOrCreateBeastCardChildLabel(
            board,
            'BeastCardRecordTitle',
            '\u4ea7\u51fa\u8bb0\u5f55',
            42,
            0,
            HomeConfig.BEAST_RECORD_TITLE_Y,
            HomeConfig.BEAST_RECORD_TITLE_WIDTH,
            HomeConfig.BEAST_RECORD_TITLE_HEIGHT,
            RECORD_PAGE_TITLE_COLOR,
            HorizontalTextAlignment.CENTER,
        );
        pageTitle.lineHeight = 52;
        pageTitle.overflow = Overflow.SHRINK;
        pageTitle.enableWrapText = false;
        this.setLabelOutline(pageTitle, RECORD_ROW_OUTLINE_COLOR, 1);
        pageTitle.node.setSiblingIndex(1);

        this.hideLegacyBeastCardRecordNode(board, 'BeastCardRecordCloseButton');

        const listResult = this.getOrCreateBeastCardChildNode(
            board,
            'BeastCardRecordList',
            HomeConfig.BEAST_RECORD_VIEWPORT_WIDTH,
            HomeConfig.BEAST_RECORD_VIEWPORT_HEIGHT,
            0,
            HomeConfig.BEAST_RECORD_VIEWPORT_Y,
        );
        const list = listResult.node;
        const listTransform = list.getComponent(UITransform) || list.addComponent(UITransform);
        if (!listResult.existed || listTransform.contentSize.width <= 0 || listTransform.contentSize.height <= 0) {
            listTransform.setContentSize(HomeConfig.BEAST_RECORD_VIEWPORT_WIDTH, HomeConfig.BEAST_RECORD_VIEWPORT_HEIGHT);
        }
        const listMask = list.getComponent(Mask) || list.addComponent(Mask);
        listMask.type = Mask.Type.GRAPHICS_RECT;
        listMask.enabled = true;
        const scroll = list.getComponent(ScrollView) || list.addComponent(ScrollView);
        scroll.horizontal = false;
        scroll.vertical = true;
        scroll.inertia = true;
        scroll.brake = 0.75;
        scroll.elastic = true;
        scroll.bounceDuration = 0.2;
        scroll.cancelInnerEvents = true;
        this.beastCardRecordScrollView = scroll;
        list.setSiblingIndex(2);

        const viewportSize = listTransform.contentSize;
        const contentResult = this.getOrCreateBeastCardChildNode(
            list,
            'BeastCardRecordContent',
            viewportSize.width > 0 ? viewportSize.width : HomeConfig.BEAST_RECORD_VIEWPORT_WIDTH,
            viewportSize.height > 0 ? viewportSize.height : HomeConfig.BEAST_RECORD_VIEWPORT_HEIGHT,
            0,
            0,
        );
        const content = contentResult.node;
        const contentTransform = content.getComponent(UITransform) || content.addComponent(UITransform);
        if (!contentResult.existed || contentTransform.contentSize.width <= 0 || contentTransform.contentSize.height <= 0) {
            contentTransform.setContentSize(
                viewportSize.width > 0 ? viewportSize.width : HomeConfig.BEAST_RECORD_VIEWPORT_WIDTH,
                viewportSize.height > 0 ? viewportSize.height : HomeConfig.BEAST_RECORD_VIEWPORT_HEIGHT,
            );
        }
        content.setSiblingIndex(0);
        this.beastCardRecordContent = content;
        scroll.content = content;
        this.refreshBeastCardRecordPopup();
        popup.active = false;
    }

    protected openBeastCardRecordPopup(): void {
        this.ensureBeastCardRecordPopup();
        if (!this.beastCardRecordPopup?.isValid) return;

        this.refreshBeastCardRecordPopup();
        this.beastCardRecordPopup.active = true;
        this.beastCardRecordPopup.setSiblingIndex(40);
        const back = this.bottomFeaturePanel?.getChildByName('BottomFeatureBack');
        if (back?.isValid && this.bottomFeaturePanel?.isValid) {
            back.active = true;
            back.setSiblingIndex((this.bottomFeaturePanel.children.length || 1) - 1);
        }
        this.scheduleOnce(() => {
            this.beastCardRecordScrollView?.scrollToTop(0.01);
        }, 0);
    }

    protected closeBeastCardRecordPopup(): void {
        if (this.beastCardRecordPopup?.isValid) {
            this.beastCardRecordPopup.active = false;
        }
    }

    protected refreshBeastCardRecordPopup(): void {
        const list = this.beastCardRecordPopup
            ?.getChildByName('BeastCardRecordBoard')
            ?.getChildByName('BeastCardRecordList');
        if (!list?.isValid) return;

        const records = this.getBeastCardOutputRecords();
        const scroll = list.getComponent(ScrollView) || list.addComponent(ScrollView);
        scroll.horizontal = false;
        scroll.vertical = true;
        scroll.inertia = true;
        scroll.brake = 0.75;
        scroll.elastic = true;
        scroll.bounceDuration = 0.2;
        scroll.cancelInnerEvents = true;

        const mask = list.getComponent(Mask) || list.addComponent(Mask);
        mask.type = Mask.Type.GRAPHICS_RECT;
        mask.enabled = true;

        const listTransform = list.getComponent(UITransform) || list.addComponent(UITransform);
        const viewportSize = listTransform.contentSize;
        const viewportWidth = viewportSize.width > 0 ? viewportSize.width : HomeConfig.BEAST_RECORD_VIEWPORT_WIDTH;
        const viewportHeight = viewportSize.height > 0 ? viewportSize.height : HomeConfig.BEAST_RECORD_VIEWPORT_HEIGHT;

        const contentResult = this.getOrCreateBeastCardChildNode(
            list,
            'BeastCardRecordContent',
            viewportWidth,
            viewportHeight,
            0,
            0,
        );
        const content = contentResult.node;
        list.children
            .filter((child) => child !== content && /^BeastCardRecordRow_\d+$/.test(child.name))
            .forEach((child) => {
                child.setParent(content);
            });

        const contentTransform = content.getComponent(UITransform) || content.addComponent(UITransform);
        const existingRecordRows = content.children
            .filter((child) => /^BeastCardRecordRow_\d+$/.test(child.name))
            .sort((a, b) => {
                const aIndex = Number(a.name.replace('BeastCardRecordRow_', ''));
                const bIndex = Number(b.name.replace('BeastCardRecordRow_', ''));
                return aIndex - bIndex;
            });
        const templateRow = content.getChildByName('BeastCardRecordRow_1') || existingRecordRows[0] || null;
        const secondTemplateRow = content.getChildByName('BeastCardRecordRow_2') || existingRecordRows[1] || null;
        const templateTransform = templateRow?.getComponent(UITransform) || null;
        const templateSize = templateTransform?.contentSize;
        const rowWidth = templateSize && templateSize.width > 0 ? templateSize.width : HomeConfig.BEAST_RECORD_ROW_WIDTH;
        const rowHeight = templateSize && templateSize.height > 0 ? templateSize.height : HomeConfig.BEAST_RECORD_ROW_HEIGHT;
        const rowX = templateRow?.position.x ?? 0;
        let rowStep = templateRow && secondTemplateRow
            ? Math.abs(templateRow.position.y - secondTemplateRow.position.y)
            : rowHeight + HomeConfig.BEAST_RECORD_ROW_GAP;
        if (!Number.isFinite(rowStep) || rowStep <= 0) {
            rowStep = rowHeight + HomeConfig.BEAST_RECORD_ROW_GAP;
        }

        const contentSize = contentTransform.contentSize;
        let contentHeight = contentSize.height > 0 ? contentSize.height : viewportHeight;
        const lastTemplateRow = existingRecordRows[existingRecordRows.length - 1] || templateRow;
        const topPadding = templateRow && contentHeight > 0
            ? Math.max(0, contentHeight / 2 - templateRow.position.y - rowHeight / 2)
            : HomeConfig.BEAST_RECORD_ROW_TOP_PADDING;
        const bottomPadding = lastTemplateRow && contentHeight > 0
            ? Math.max(0, contentHeight / 2 + lastTemplateRow.position.y - rowHeight / 2)
            : 40;
        const requiredContentHeight = Math.max(
            viewportHeight,
            topPadding
                + bottomPadding
                + records.length * rowHeight
                + Math.max(0, records.length - 1) * Math.max(0, rowStep - rowHeight),
        );
        contentHeight = Math.max(contentHeight, requiredContentHeight);
        contentTransform.setContentSize(viewportWidth, contentHeight);
        if (!contentResult.existed) {
            content.setPosition(0, (viewportHeight - contentHeight) / 2, 0);
        }
        content.active = true;
        content.setSiblingIndex(0);
        scroll.content = content;
        this.beastCardRecordScrollView = scroll;
        this.beastCardRecordContent = content;

        content.children
            .filter((child) => /^BeastCardRecordRow_\d+$/.test(child.name))
            .forEach((child) => {
                child.active = false;
            });

        const startY = contentHeight / 2 - topPadding - rowHeight / 2;
        for (let index = 0; index < records.length; index += 1) {
            const record = records[index];
            const row = this.getOrCreateBeastCardChildNode(
                content,
                `BeastCardRecordRow_${index + 1}`,
                rowWidth,
                rowHeight,
                rowX,
                startY - index * rowStep,
            ).node;
            row.setPosition(rowX, startY - index * rowStep, 0);
            (row.getComponent(UITransform) || row.addComponent(UITransform)).setContentSize(
                rowWidth,
                rowHeight,
            );
            row.active = true;
            row.setSiblingIndex(index);
            this.applyBeastCardRecordRow(row, record.time, record.beastName, record.amount);
        }
    }

    protected applyBeastCardRecordRow(row: Node, time: string, beastName: string, amount: string): void {
        [
            'BeastCardRecordBeastName',
            'BeastCardRecordOutputText',
            'BeastCardRecordYuanbaoIcon',
            'BeastCardRecordAmount',
            'BeastCardRecordTime',
        ].forEach((nodeName) => {
            const child = row.getChildByName(nodeName);
            if (!child?.isValid) return;
            this.skinApplyVersions.set(child, ++this.skinApplyVersion);
            child.active = false;
        });

        const richResult = this.getOrCreateBeastCardChildNode(
            row,
            'BeastCardRecordRichText',
            HomeConfig.BEAST_RECORD_RICH_TEXT_WIDTH,
            HomeConfig.BEAST_RECORD_RICH_TEXT_HEIGHT,
            HomeConfig.BEAST_RECORD_RICH_TEXT_X,
            HomeConfig.BEAST_RECORD_RICH_TEXT_Y,
        );
        const richNode = richResult.node;
        richNode.active = true;
        if (!richResult.existed) {
            richNode.setPosition(
                HomeConfig.BEAST_RECORD_RICH_TEXT_X,
                HomeConfig.BEAST_RECORD_RICH_TEXT_Y,
                0,
            );
        }
        const richTransform = richNode.getComponent(UITransform) || richNode.addComponent(UITransform);
        if (!richResult.existed || richTransform.contentSize.width <= 0 || richTransform.contentSize.height <= 0) {
            richTransform.setContentSize(
                HomeConfig.BEAST_RECORD_RICH_TEXT_WIDTH,
                HomeConfig.BEAST_RECORD_RICH_TEXT_HEIGHT,
            );
        }
        const richSize = richTransform.contentSize;
        const label = richNode.getComponent(Label);
        if (label) label.enabled = false;
        const richText = richNode.getComponent(RichText) || richNode.addComponent(RichText);
        richText.enabled = true;
        richText.string = this.formatBeastCardRecordRichText(time, beastName, amount);
        richText.fontSize = richResult.existed && richText.fontSize > 0 ? richText.fontSize : 25;
        richText.lineHeight = richResult.existed && richText.lineHeight > 0 ? richText.lineHeight : 34;
        richText.maxWidth = richSize.width > 0 ? richSize.width : HomeConfig.BEAST_RECORD_RICH_TEXT_WIDTH;
        richText.horizontalAlign = HorizontalTextAlignment.LEFT;
        applySimKaiFontToRichText(richText);

        const divider = this.getOrCreateBeastCardChildSkinnedNode(
            row,
            'BeastCardRecordDivider',
            HomeConfig.BEAST_RECORD_ROW_WIDTH,
            4,
            0,
            -35,
            HomeConfig.UI_BEAST_RECORD_DIVIDER,
        );
        divider.setSiblingIndex(0);
        richNode.setSiblingIndex(1);
    }

    protected formatBeastCardRecordTime(time: string): string {
        return time.replace(/[\uff0c,]\s*$/, '');
    }

    protected formatBeastCardRecordRichText(time: string, beastName: string, amount: string): string {
        return [
            '<outline color=#f5efe4 width=1>',
            `<color=#8f7b58>${this.escapeRichText(this.formatBeastCardRecordTime(time))}\uff0c</color>`,
            `<color=#19b82d>${this.escapeRichText(beastName)}</color>`,
            '<color=#8f7b58>\u4ea7\u51fa</color>',
            `<color=#d63030>${this.escapeRichText(amount)}</color>`,
            '</outline>',
        ].join('');
    }

    protected applyBeastCardRecordTextStyle(label: Label, outlineColor: Color, outlineWidth: number): void {
        applySimKaiFont(label);
        label.lineHeight = label.fontSize + 7;
        label.overflow = Overflow.SHRINK;
        label.enableWrapText = false;
        this.setLabelOutline(label, outlineColor, outlineWidth);
    }

    protected getBeastCardOutputRecords(): Array<{ time: string; beastName: string; amount: string }> {
        const beastNames = HomeConfig.BEAST_CARD_BOTTOM_NAME_LABELS;
        const amount = `${HomeConfig.BEAST_CARD_OUTPUT_AMOUNT}\u5143\u5b9d`;
        return [
            { time: '2024\u5e7407\u670805\u65e522\u65f601\u5206\uff0c', beastName: beastNames[0], amount },
            { time: '2024\u5e7407\u670806\u65e500\u65f615\u5206\uff0c', beastName: beastNames[1], amount },
            { time: '2024\u5e7407\u670805\u65e500\u65f616\u5206\uff0c', beastName: beastNames[2], amount: '5.24\u5143\u5b9d' },
            { time: '2024\u5e7407\u670804\u65e518\u65f625\u5206\uff0c', beastName: beastNames[3], amount: '2.6\u5143\u5b9d' },
            { time: '2024\u5e7407\u670804\u65e522\u65f601\u5206\uff0c', beastName: beastNames[0], amount: '1.32\u5143\u5b9d' },
            { time: '2024\u5e7407\u670805\u65e500\u65f615\u5206\uff0c', beastName: beastNames[1], amount: '173.706\u5143\u5b9d' },
            { time: '2024\u5e7407\u670804\u65e500\u65f616\u5206\uff0c', beastName: beastNames[2], amount: '5.24\u5143\u5b9d' },
            { time: '2024\u5e7407\u670804\u65e500\u65f615\u5206\uff0c', beastName: beastNames[3], amount: '168.335\u5143\u5b9d' },
            { time: '2024\u5e7407\u670803\u65e522\u65f601\u5206\uff0c', beastName: beastNames[0], amount: '1.24\u5143\u5b9d' },
            { time: '2024\u5e7407\u670803\u65e500\u65f615\u5206\uff0c', beastName: beastNames[1], amount: '169.105\u5143\u5b9d' },
            { time: '2024\u5e7407\u670802\u65e500\u65f616\u5206\uff0c', beastName: beastNames[2], amount: '5.18\u5143\u5b9d' },
            { time: '2024\u5e7407\u670802\u65e500\u65f615\u5206\uff0c', beastName: beastNames[3], amount: '166.335\u5143\u5b9d' },
        ];
    }

    protected getOrCreateBeastCardChildNode(parent: Node, name: string, width: number, height: number, x: number, y: number): { node: Node; existed: boolean } {
        const existing = parent.getChildByName(name);
        if (existing?.isValid) {
            existing.active = true;
            const transform = existing.getComponent(UITransform) || existing.addComponent(UITransform);
            if (transform.contentSize.width <= 0 || transform.contentSize.height <= 0) {
                transform.setContentSize(width, height);
            }
            return { node: existing, existed: true };
        }

        return { node: this.createNode(name, parent, width, height, x, y), existed: false };
    }

    protected hideLegacyBeastCardRecordNode(parent: Node, name: string): void {
        const node = parent.getChildByName(name);
        if (!node?.isValid) return;

        this.skinApplyVersions.set(node, ++this.skinApplyVersion);
        node.off(Node.EventType.TOUCH_END);
        node.children.forEach((child) => {
            this.skinApplyVersions.set(child, ++this.skinApplyVersion);
            child.active = false;
        });
        node.active = false;
    }

    protected getOrCreateBeastCardChildSkinnedNode(parent: Node, name: string, width: number, height: number, x: number, y: number, skinPath: string): Node {
        const result = this.getOrCreateBeastCardChildNode(parent, name, width, height, x, y);
        const transform = result.node.getComponent(UITransform) || result.node.addComponent(UITransform);
        const currentSize = transform.contentSize;
        const targetWidth = result.existed && currentSize.width > 0 ? currentSize.width : width;
        const targetHeight = result.existed && currentSize.height > 0 ? currentSize.height : height;
        this.applyUiSkinKeepingEditorSize(result.node, skinPath, targetWidth, targetHeight);
        return result.node;
    }

    protected getOrCreateBeastCardChildLabel(
        parent: Node,
        name: string,
        text: string,
        fontSize: number,
        x: number,
        y: number,
        width: number,
        height: number,
        color: Color,
        align: HorizontalTextAlignment,
    ): Label {
        const result = this.getOrCreateBeastCardChildNode(parent, name, width, height, x, y);
        const richText = result.node.getComponent(RichText);
        if (richText) richText.enabled = false;
        const label = result.node.getComponent(Label) || result.node.addComponent(Label);
        applySimKaiFont(label);
        label.enabled = true;
        label.string = text;
        label.fontSize = fontSize;
        label.lineHeight = fontSize + 8;
        label.color = color;
        label.horizontalAlign = align;
        label.verticalAlign = VerticalTextAlignment.CENTER;
        label.overflow = Overflow.SHRINK;
        this.applyBattleEntryTextStyle(label, 2);
        return label;
    }
}
