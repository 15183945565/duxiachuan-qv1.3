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
            this.closeBeastCardRecordPopup();
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
        board.setSiblingIndex(1);
        board.off(Node.EventType.TOUCH_END);
        board.on(Node.EventType.TOUCH_END, (event: EventTouch) => {
            event.propagationStopped = true;
        }, this);

        const titleFrame = this.getOrCreateBeastCardChildSkinnedNode(
            board,
            'BeastCardRecordTitleFrame',
            HomeConfig.BEAST_RECORD_TITLE_FRAME_WIDTH,
            HomeConfig.BEAST_RECORD_TITLE_FRAME_HEIGHT,
            0,
            330,
            HomeConfig.UI_BEAST_RECORD_TITLE_FRAME,
        );
        titleFrame.setSiblingIndex(1);
        const title = this.getOrCreateBeastCardChildLabel(
            titleFrame,
            'BeastCardRecordTitle',
            '\u6398\u5b9d\u8bb0\u5f55',
            30,
            0,
            2,
            240,
            46,
            new Color(225, 203, 162, 255),
            HorizontalTextAlignment.CENTER,
        );
        title.lineHeight = 38;
        this.setLabelOutline(title, new Color(54, 30, 18, 255), 2);
        title.node.setSiblingIndex(2);

        const close = this.getOrCreateBeastCardChildSkinnedNode(
            board,
            'BeastCardRecordCloseButton',
            58,
            58,
            244,
            346,
            HomeConfig.UI_MAIL_BTN_CLOSE,
        );
        close.setSiblingIndex(5);
        this.bindScaledClick(close, () => this.closeBeastCardRecordPopup());

        const list = this.getOrCreateBeastCardChildNode(
            board,
            'BeastCardRecordList',
            HomeConfig.BEAST_RECORD_VIEWPORT_WIDTH,
            HomeConfig.BEAST_RECORD_VIEWPORT_HEIGHT,
            0,
            HomeConfig.BEAST_RECORD_VIEWPORT_Y,
        ).node;
        const listTransform = list.getComponent(UITransform) || list.addComponent(UITransform);
        listTransform.setContentSize(HomeConfig.BEAST_RECORD_VIEWPORT_WIDTH, HomeConfig.BEAST_RECORD_VIEWPORT_HEIGHT);
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

        const content = this.getOrCreateBeastCardChildNode(
            list,
            'BeastCardRecordContent',
            HomeConfig.BEAST_RECORD_VIEWPORT_WIDTH,
            HomeConfig.BEAST_RECORD_VIEWPORT_HEIGHT,
            0,
            0,
        ).node;
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

        const content = this.getOrCreateBeastCardChildNode(
            list,
            'BeastCardRecordContent',
            HomeConfig.BEAST_RECORD_VIEWPORT_WIDTH,
            HomeConfig.BEAST_RECORD_VIEWPORT_HEIGHT,
            0,
            0,
        ).node;
        list.children
            .filter((child) => child !== content && /^BeastCardRecordRow_\d+$/.test(child.name))
            .forEach((child) => {
                child.setParent(content);
            });

        const viewportHeight = HomeConfig.BEAST_RECORD_VIEWPORT_HEIGHT;
        const topPadding = 20;
        const bottomPadding = 20;
        const contentHeight = Math.max(
            viewportHeight,
            topPadding + bottomPadding + records.length * HomeConfig.BEAST_RECORD_ROW_GAP,
        );
        const contentTransform = content.getComponent(UITransform) || content.addComponent(UITransform);
        contentTransform.setContentSize(HomeConfig.BEAST_RECORD_VIEWPORT_WIDTH, contentHeight);
        content.setPosition(0, (viewportHeight - contentHeight) / 2, 0);
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

        const startY = contentHeight / 2 - topPadding - HomeConfig.BEAST_RECORD_ROW_HEIGHT / 2;
        for (let index = 0; index < records.length; index += 1) {
            const record = records[index];
            const row = this.getOrCreateBeastCardChildNode(
                content,
                `BeastCardRecordRow_${index + 1}`,
                HomeConfig.BEAST_RECORD_VIEWPORT_WIDTH,
                HomeConfig.BEAST_RECORD_ROW_HEIGHT,
                0,
                startY - index * HomeConfig.BEAST_RECORD_ROW_GAP,
            ).node;
            row.setPosition(0, startY - index * HomeConfig.BEAST_RECORD_ROW_GAP, 0);
            (row.getComponent(UITransform) || row.addComponent(UITransform)).setContentSize(
                HomeConfig.BEAST_RECORD_VIEWPORT_WIDTH,
                HomeConfig.BEAST_RECORD_ROW_HEIGHT,
            );
            row.active = true;
            row.setSiblingIndex(index);
            this.applyBeastCardRecordRow(row, record.time, record.beastName, record.amount);
        }
    }

    protected applyBeastCardRecordRow(row: Node, time: string, beastName: string, amount: string): void {
        [
            'BeastCardRecordTime',
            'BeastCardRecordBeastName',
            'BeastCardRecordOutputText',
            'BeastCardRecordAmount',
        ].forEach((nodeName) => {
            const labelNode = row.getChildByName(nodeName);
            if (labelNode?.isValid) labelNode.active = false;
        });

        const richNode = this.getOrCreateBeastCardChildNode(row, 'BeastCardRecordRichText', 470, 63.28, 7, -9).node;
        richNode.active = true;
        richNode.setPosition(7, -9, 0);
        (richNode.getComponent(UITransform) || richNode.addComponent(UITransform)).setContentSize(470, 63.28);
        const label = richNode.getComponent(Label);
        if (label) label.enabled = false;
        const richText = richNode.getComponent(RichText) || richNode.addComponent(RichText);
        richText.enabled = true;
        richText.string = this.formatBeastCardRecordRichText(time, beastName, amount);
        richText.fontSize = 21;
        richText.lineHeight = 28;
        richText.maxWidth = 470;
        richText.horizontalAlign = HorizontalTextAlignment.LEFT;
        applySimKaiFontToRichText(richText);

        const divider = this.getOrCreateBeastCardChildSkinnedNode(
            row,
            'BeastCardRecordDivider',
            456,
            4,
            0,
            -35,
            HomeConfig.UI_BEAST_RECORD_DIVIDER,
        );
        divider.setSiblingIndex(0);
        richNode.setSiblingIndex(1);
    }

    protected formatBeastCardRecordRichText(time: string, beastName: string, amount: string): string {
        const baseColor = '#ead9bd';
        const valueGreen = '#3dee30';
        const amountColor = '#ff3434';
        const outlineColor = '#1a0e08';
        return [
            `<outline color=${outlineColor} width=2>`,
            `<color=${baseColor}>${this.escapeRichText(time)}</color><br/>`,
            `<color=${valueGreen}>${this.escapeRichText(beastName)}</color>`,
            `<color=${baseColor}>  \u4ea7\u51fa</color>`,
            `<color=${amountColor}>${this.escapeRichText(amount)}</color>`,
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
