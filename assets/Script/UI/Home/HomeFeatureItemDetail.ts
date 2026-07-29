import {
    Color,
    HorizontalTextAlignment,
    Label,
    Node,
    Overflow,
    UITransform,
    VerticalTextAlignment,
} from 'cc';
import { applySimKaiFont } from '../Common/UIFont';
import { type BagIllustrationCatalogItem } from './BagIllustrationCatalog.generated';
import * as HomeConfig from './HomeConfig';
import { HomeViewBase } from './HomeViewBase';

abstract class HomeFeatureItemDetailHost extends HomeViewBase {
    protected abstract getCatalogDisplayName(item: BagIllustrationCatalogItem | null | undefined): string;
    protected abstract setLabelOutline(label: Label, color: Color, width: number): void;
}

/**
 * 通用物品详情、背包图鉴详情与市场物品详情布局。
 *
 * 模块只负责详情内容和交互编排；弹窗根层、关闭流程与资源加载仍由宿主统一管理。
 */
export abstract class HomeFeatureItemDetail extends HomeFeatureItemDetailHost {
    protected getItemDetailAttrFramePath(framePath?: string): string {
        const match = framePath ? /item_frame_lv(\d+)/.exec(framePath) : null;
        const level = Math.max(1, Math.min(6, match ? Number(match[1]) : 1));
        const framePaths = [
            HomeConfig.UI_BAG_ITEM_DETAIL_ATTR_FRAME_LV1,
            HomeConfig.UI_BAG_ITEM_DETAIL_ATTR_FRAME_LV2,
            HomeConfig.UI_BAG_ITEM_DETAIL_ATTR_FRAME_LV3,
            HomeConfig.UI_BAG_ITEM_DETAIL_ATTR_FRAME_LV4,
            HomeConfig.UI_BAG_ITEM_DETAIL_ATTR_FRAME_LV5,
            HomeConfig.UI_BAG_ITEM_DETAIL_ATTR_FRAME_LV6,
        ];
        return framePaths[level - 1] || HomeConfig.UI_BAG_ITEM_DETAIL_ATTR_FRAME_LV1;
    }
    protected openItemDetailPopup(name: string, type: string, description: string, count: string, framePath?: string): void {
        this.openSharedFlowPopup('ItemDetailPopup', { title: '\u7269\u54c1\u8be6\u60c5' });
        const popup = this.popupRoot?.getChildByName('ItemDetailPopup') || this.findNode('ItemDetailPopup');
        if (!popup?.isValid) return;
        this.prepareDefaultItemDetailPopup(popup, framePath);
    
        const nameLabel = this.findNode('ItemDetailName', popup)?.getComponent(Label);
        const typeLabel = this.findNode('ItemDetailType', popup)?.getComponent(Label);
        const countLabel = this.findNode('ItemDetailCount', popup)?.getComponent(Label);
        const descriptionLabel = this.findNode('ItemDetailDescription', popup)?.getComponent(Label);
        const placeholderLabel = this.findNode('ItemDetailIconPlaceholder', popup)?.getComponent(Label);
        const detailIcon = this.findNode('ItemDetailIcon', popup);
        if (nameLabel) nameLabel.string = name;
        if (typeLabel) typeLabel.string = `\u7c7b\u578b\uff1a${type}`;
        if (countLabel) countLabel.string = `\u6570\u91cf\uff1a${count}`;
        if (descriptionLabel) descriptionLabel.string = description;
        if (placeholderLabel) {
            placeholderLabel.string = name.slice(0, 1) || '\u7269';
            placeholderLabel.node.active = true;
        }
        if (detailIcon) {
            this.skinApplyVersions.set(detailIcon, ++this.skinApplyVersion);
            detailIcon.active = false;
        }
    
        const primary = this.findNode('ItemDetailPrimaryButton', popup);
        if (primary?.isValid) primary.active = false;
        const secondary = this.findNode('ItemDetailSecondaryButton', popup);
        if (secondary?.isValid) secondary.active = false;
    }
    protected prepareDefaultItemDetailPopup(popup: Node, framePath?: string): void {
        const resetNode = (nodeName: string, x: number, y: number, width: number, height: number): Node | null => {
            const node = this.findNode(nodeName, popup);
            if (!node?.isValid) return null;
            node.active = true;
            node.setPosition(x, y, 0);
            (node.getComponent(UITransform) || node.addComponent(UITransform)).setContentSize(width, height);
            return node;
        };

        const board = this.findNode('ItemDetailPopupBoard', popup);
        if (board?.isValid) {
            (board.getComponent(UITransform) || board.addComponent(UITransform)).setContentSize(HomeConfig.BAG_ITEM_DETAIL_ATTR_FRAME_WIDTH, HomeConfig.BAG_ITEM_DETAIL_ATTR_FRAME_HEIGHT);
            board.setPosition(0, 0, 0);
            this.applyUiSkin(board, this.getItemDetailAttrFramePath(framePath), HomeConfig.BAG_ITEM_DETAIL_ATTR_FRAME_WIDTH, HomeConfig.BAG_ITEM_DETAIL_ATTR_FRAME_HEIGHT);
        }
        const titleSkin = this.findNode('ItemDetailPopupTitleSkin', popup);
        if (titleSkin?.isValid) {
            titleSkin.active = false;
        }
        const title = this.findNode('ItemDetailPopupTitle', popup);
        if (title?.isValid) {
            title.active = false;
        }
        const iconFrame = resetNode('ItemDetailIconFrame', -168, 28, 96, 96);
        if (iconFrame) {
            this.applyUiSkin(iconFrame, framePath || HomeConfig.UI_ROLE_EQUIP_FRAME_LV1, 96, 96);
        }
        resetNode('ItemDetailIcon', 0, 2, 72, 72);
        resetNode('ItemDetailIconPlaceholder', 0, 0, 82, 82);
        resetNode('ItemDetailName', 78, 86, 286, 38);
        resetNode('ItemDetailType', 78, 50, 286, 32);
        resetNode('ItemDetailCount', 78, 18, 286, 32);
        resetNode('ItemDetailDescription', 78, -60, 286, 92);
        resetNode('ItemDetailPrimaryButton', 0, -172, 160, 58);
        resetNode('ItemDetailSecondaryButton', 108, -172, 160, 58);
        [
            'ItemDetailIconFrame',
            'ItemDetailName',
            'ItemDetailType',
            'ItemDetailCount',
            'ItemDetailDescription',
        ].forEach((nodeName) => {
            const node = this.findNode(nodeName, popup);
            if (node?.isValid) node.active = true;
        });
        ['ItemDetailPrimaryButton', 'ItemDetailSecondaryButton'].forEach((nodeName) => {
            const node = this.findNode(nodeName, popup);
            if (node?.isValid) node.active = false;
        });
        const nameLabel = this.findNode('ItemDetailName', popup)?.getComponent(Label);
        if (nameLabel) {
            nameLabel.fontSize = 24;
            nameLabel.lineHeight = 30;
            nameLabel.color = new Color(255, 241, 190, 255);
            nameLabel.horizontalAlign = HorizontalTextAlignment.LEFT;
            nameLabel.verticalAlign = VerticalTextAlignment.CENTER;
            nameLabel.overflow = Overflow.SHRINK;
            this.setLabelOutline(nameLabel, new Color(67, 28, 14, 255), 2);
        }
        ['ItemDetailType', 'ItemDetailCount'].forEach((nodeName) => {
            const label = this.findNode(nodeName, popup)?.getComponent(Label);
            if (!label) return;
            label.fontSize = 20;
            label.lineHeight = 26;
            label.color = new Color(236, 218, 184, 255);
            label.horizontalAlign = HorizontalTextAlignment.LEFT;
            label.verticalAlign = VerticalTextAlignment.CENTER;
            label.overflow = Overflow.SHRINK;
            this.setLabelOutline(label, new Color(38, 24, 18, 255), 1);
        });
        const descLabel = this.findNode('ItemDetailDescription', popup)?.getComponent(Label);
        if (descLabel) {
            descLabel.fontSize = 18;
            descLabel.lineHeight = 24;
            descLabel.color = new Color(223, 207, 176, 255);
            descLabel.horizontalAlign = HorizontalTextAlignment.LEFT;
            descLabel.verticalAlign = VerticalTextAlignment.TOP;
            descLabel.overflow = Overflow.SHRINK;
            descLabel.enableWrapText = true;
            this.setLabelOutline(descLabel, new Color(34, 23, 18, 255), 1);
        }
        const close = this.findNode('ItemDetailPopupClose', popup);
        if (close?.isValid) close.active = false;
        [
            'ItemIllustrationUsageTitle',
            'ItemIllustrationUsageValue',
            'ItemIllustrationObtainBg',
            'ItemIllustrationObtainTitle',
            'ItemIllustrationObtainValue',
        ].forEach((nodeName) => {
            const node = this.findNode(nodeName, popup);
            if (node?.isValid) node.active = false;
        });
    }
    protected openBagIllustrationItemDetailPopup(item: BagIllustrationCatalogItem, type: string): void {
        this.openSharedFlowPopup('BagIllustrationDetailPopup', { title: this.getCatalogDisplayName(item) });
        const popup = this.popupRoot?.getChildByName('BagIllustrationDetailPopup') || this.findNode('BagIllustrationDetailPopup');
        if (!popup?.isValid) return;

        const board = this.findNode('BagIllustrationDetailPopupBoard', popup);
        if (!board?.isValid) return;

        (board.getComponent(UITransform) || board.addComponent(UITransform)).setContentSize(
            HomeConfig.BAG_ITEM_DETAIL_ATTR_FRAME_WIDTH,
            HomeConfig.BAG_ITEM_DETAIL_ATTR_FRAME_HEIGHT,
        );
        board.setPosition(0, 0, 0);
        this.applyUiSkin(
            board,
            this.getItemDetailAttrFramePath(item.framePath),
            HomeConfig.BAG_ITEM_DETAIL_ATTR_FRAME_WIDTH,
            HomeConfig.BAG_ITEM_DETAIL_ATTR_FRAME_HEIGHT,
        );

        this.layoutBagIllustrationDetailPopup(popup, board, item, type);
        popup.active = true;
        popup.setSiblingIndex((popup.parent?.children.length || 1) - 1);
        this.refreshRootLayerOrder();
    }
    protected hideDefaultItemDetailFields(popup: Node): void {
        [
            'ItemDetailType',
            'ItemDetailCount',
            'ItemDetailDescription',
            'ItemDetailPrimaryButton',
            'ItemDetailSecondaryButton',
            'ItemDetailIconPlaceholder',
        ].forEach((nodeName) => {
            const node = this.findNode(nodeName, popup);
            if (node?.isValid) node.active = false;
        });
    }
    protected layoutBagIllustrationDetailPopup(popup: Node, board: Node, item: BagIllustrationCatalogItem, type: string): void {
        const titleSkin = board.getChildByName('BagIllustrationDetailPopupTitleSkin');
        if (titleSkin?.isValid) titleSkin.active = false;

        const titleLabel = this.getOrCreatePopupLabel(board, 'BagIllustrationDetailPopupTitle', this.getCatalogDisplayName(item), 24, 78, 86, 286, 38, new Color(255, 241, 190, 255));
        titleLabel.horizontalAlign = HorizontalTextAlignment.LEFT;
        titleLabel.verticalAlign = VerticalTextAlignment.CENTER;
        titleLabel.overflow = Overflow.SHRINK;
        titleLabel.color = new Color(255, 241, 190, 255);
        titleLabel.fontSize = 24;
        titleLabel.lineHeight = 30;
        this.setLabelOutline(titleLabel, new Color(67, 28, 14, 255), 2);
        titleLabel.node.setSiblingIndex(3);

        const close = this.findNode('BagIllustrationDetailPopupClose', popup);
        if (close?.isValid) {
            close.active = false;
            close.setSiblingIndex(20);
        }

        const iconFrame = this.findNode('BagIllustrationDetailIconFrame', popup) || this.createSkinnedNode('BagIllustrationDetailIconFrame', board, 96, 96, -168, 28, item.framePath);
        iconFrame.active = true;
        iconFrame.setPosition(-168, 28, 0);
        (iconFrame.getComponent(UITransform) || iconFrame.addComponent(UITransform)).setContentSize(96, 96);
        this.applyUiSkin(iconFrame, item.framePath, 96, 96);
        iconFrame.setSiblingIndex(4);

        const existingDetailIcon = this.findNode('BagIllustrationDetailIcon', popup);
        const detailIcon = existingDetailIcon || this.createSkinnedNode('BagIllustrationDetailIcon', iconFrame, 72, 72, 0, 2, item.iconPath);
        detailIcon.active = true;
        if (!existingDetailIcon && detailIcon.parent !== iconFrame) detailIcon.setParent(iconFrame);
        detailIcon.setPosition(0, 2, 0);
        (detailIcon.getComponent(UITransform) || detailIcon.addComponent(UITransform)).setContentSize(72, 72);
        this.applyUiSkin(detailIcon, item.iconPath, 72, 72);
        detailIcon.setSiblingIndex(2);

        const usageTitle = this.getOrCreatePopupLabel(board, 'BagIllustrationUsageTitle', '\u7528\u9014\uff1a', 20, 78, 50, 88, 30, new Color(236, 218, 184, 255));
        usageTitle.horizontalAlign = HorizontalTextAlignment.LEFT;
        usageTitle.fontSize = 20;
        usageTitle.lineHeight = 26;
        this.setLabelOutline(usageTitle, new Color(38, 24, 18, 255), 1);
        usageTitle.node.setSiblingIndex(5);

        const usageValue = this.getOrCreatePopupLabel(
            board,
            'BagIllustrationUsageValue',
            this.getBagIllustrationUsage(item, type),
            20,
            174,
            50,
            190,
            30,
            new Color(236, 218, 184, 255),
        );
        usageValue.horizontalAlign = HorizontalTextAlignment.LEFT;
        usageValue.overflow = Overflow.SHRINK;
        usageValue.fontSize = 20;
        usageValue.lineHeight = 26;
        this.setLabelOutline(usageValue, new Color(38, 24, 18, 255), 1);
        usageValue.node.setSiblingIndex(5);

        const obtainBg = this.getOrCreatePopupSkinnedNode(
            board,
            'BagIllustrationObtainBg',
            600,
            62,
            0,
            -104,
            HomeConfig.UI_BAG_ITEM_DETAIL_OBTAIN_BG,
        );
        obtainBg.active = false;

        const obtainTitle = this.getOrCreatePopupLabel(board, 'BagIllustrationObtainTitle', '\u83b7\u5f97\uff1a', 20, 78, 18, 88, 30, new Color(236, 218, 184, 255));
        obtainTitle.horizontalAlign = HorizontalTextAlignment.LEFT;
        obtainTitle.fontSize = 20;
        obtainTitle.lineHeight = 26;
        this.setLabelOutline(obtainTitle, new Color(38, 24, 18, 255), 1);
        obtainTitle.node.setSiblingIndex(6);

        const obtainValue = this.getOrCreatePopupLabel(
            board,
            'BagIllustrationObtainValue',
            this.getBagIllustrationObtainSource(item, type),
            20,
            174,
            18,
            190,
            30,
            new Color(236, 218, 184, 255),
        );
        obtainValue.horizontalAlign = HorizontalTextAlignment.LEFT;
        obtainValue.overflow = Overflow.SHRINK;
        obtainValue.fontSize = 20;
        obtainValue.lineHeight = 26;
        this.setLabelOutline(obtainValue, new Color(38, 24, 18, 255), 1);
        obtainValue.node.setSiblingIndex(6);
    }
    protected getOrCreatePopupSkinnedNode(parent: Node, name: string, width: number, height: number, x: number, y: number, skinPath: string): Node {
        let node = parent.getChildByName(name);
        if (!node?.isValid) {
            node = this.createSkinnedNode(name, parent, width, height, x, y, skinPath);
        } else {
            node.active = true;
            node.setPosition(x, y, 0);
            (node.getComponent(UITransform) || node.addComponent(UITransform)).setContentSize(width, height);
            this.applyUiSkin(node, skinPath, width, height);
        }
        return node;
    }
    protected getOrCreatePopupLabel(parent: Node, name: string, text: string, fontSize: number, x: number, y: number, width: number, height: number, color: Color): Label {
        let node = parent.getChildByName(name);
        const existed = node?.isValid;
        if (!node?.isValid) {
            node = this.createNode(name, parent, width, height, x, y);
        } else {
            node.active = true;
            node.setPosition(x, y, 0);
            (node.getComponent(UITransform) || node.addComponent(UITransform)).setContentSize(width, height);
        }
        const label = node.getComponent(Label) || node.addComponent(Label);
        label.string = text;
        if (!existed) {
            applySimKaiFont(label);
            label.fontSize = fontSize;
            label.lineHeight = fontSize + 8;
            label.color = color;
            label.horizontalAlign = HorizontalTextAlignment.CENTER;
            label.verticalAlign = VerticalTextAlignment.CENTER;
        }
        return label;
    }
    protected getBagIllustrationUsage(item: BagIllustrationCatalogItem, type: string): string {
        const name = this.getCatalogDisplayName(item);
        if (name.includes('\u7ecf\u9a8c')) return '\u89d2\u8272\u5347\u7ea7';
        if (name.includes('\u7a81\u7834')) return '\u89d2\u8272\u7a81\u7834';
        if (name.includes('\u7389\u77f3')) return '\u4ed9\u57df\u5347\u7ea7';
        if (name.includes('\u788e\u7247')) return '\u517d\u5361\u5408\u6210';
        if (name.includes('\u517d\u5361')) return '\u517d\u5361\u6fc0\u6d3b';
        if (name.includes('\u5b9d\u77f3')) return '\u5b9d\u77f3\u9576\u5d4c';
        if (name.includes('\u9057\u73cd')) return '\u4ea4\u6613\u51fa\u552e';
        if (type === '\u88c5\u5907') return name.includes('\u91d1\u9e64') || name.includes('\u9752\u72ee') || name.includes('\u767d\u9e7f') || name.includes('\u8d64\u72d0')
            ? '\u517d\u8109\u88c5\u5907'
            : '\u89d2\u8272\u88c5\u5907';
        if (type === '\u6750\u6599') return '\u6750\u6599\u517b\u6210';
        return '\u9053\u5177\u4f7f\u7528';
    }
    protected getBagIllustrationObtainSource(item: BagIllustrationCatalogItem, type: string): string {
        const name = this.getCatalogDisplayName(item);
        if (name.includes('\u9057\u73cd')) return '\u9b54\u754c';
        if (name.includes('\u7389\u77f3')) return '\u4ed9\u57df';
        if (name.includes('\u5b9d\u77f3') || name.includes('\u517d\u5361')) return '\u517d\u5361';
        if (type === '\u9053\u5177') return '\u5546\u57ce';
        return '\u6218\u573a';
    }
    protected openCommerceItemDetail(
        name: string,
        type: string,
        description: string,
        countText: string,
        iconPath: string,
        actionText: string,
        onAction: () => void,
        framePath?: string,
        style: 'default' | 'market' = 'default',
    ): void {
        this.openItemDetailPopup(name, type, description, countText, framePath);
        const popup = this.popupRoot?.getChildByName('ItemDetailPopup') || this.findNode('ItemDetailPopup');
        if (!popup?.isValid) return;

        if (style === 'market') {
            this.layoutMarketCommerceItemDetailPopup(popup, name);
        }
    
        const placeholder = this.findNode('ItemDetailIconPlaceholder', popup);
        if (placeholder) placeholder.active = false;
        const detailIcon = this.findNode('ItemDetailIcon', popup);
        if (detailIcon) {
            detailIcon.active = true;
            const size = detailIcon.getComponent(UITransform)?.contentSize;
            this.applyUiSkinKeepingEditorSize(detailIcon, iconPath, size?.width || 72, size?.height || 72);
        }
        const primary = this.findNode('ItemDetailPrimaryButton', popup);
        if (primary) {
            primary.active = true;
            if (style === 'market') {
                primary.setPosition(0, -188, 0);
                (primary.getComponent(UITransform) || primary.addComponent(UITransform)).setContentSize(162, 62);
                this.applyUiSkin(primary, HomeConfig.UI_MARKET_DETAIL_BUTTON_BG, 162, 62);
            } else {
                primary.setPosition(0, -172, 0);
                (primary.getComponent(UITransform) || primary.addComponent(UITransform)).setContentSize(160, 58);
            }
            this.setFeatureLabel(primary, 'ItemDetailPrimaryButtonLabel', actionText);
            if (style === 'market') {
                const label = primary.getChildByName('ItemDetailPrimaryButtonLabel')?.getComponent(Label);
                if (label) {
                    label.node.setPosition(0, 1, 0);
                    (label.node.getComponent(UITransform) || label.node.addComponent(UITransform)).setContentSize(132, 42);
                    label.fontSize = 29;
                    label.lineHeight = 38;
                    label.color = new Color(255, 238, 218, 255);
                    label.horizontalAlign = HorizontalTextAlignment.CENTER;
                    label.verticalAlign = VerticalTextAlignment.CENTER;
                    this.setLabelOutline(label, new Color(85, 48, 30, 255), 2);
                }
            }
            this.bindScaledClick(primary, () => {
                this.closeSharedFlowPopup(popup);
                onAction();
            });
        }
    }
    protected layoutMarketCommerceItemDetailPopup(popup: Node, titleText: string): void {
        const board = this.findNode('ItemDetailPopupBoard', popup);
        if (!board?.isValid) return;

        board.active = true;
        board.setPosition(0, 0, 0);
        (board.getComponent(UITransform) || board.addComponent(UITransform)).setContentSize(725, 505);
        this.applyUiSkin(board, HomeConfig.UI_MARKET_DETAIL_POPUP_BG, 725, 505);
        board.setSiblingIndex(1);

        const titleSkin = this.findNode('ItemDetailPopupTitleSkin', popup);
        if (titleSkin?.isValid) {
            if (titleSkin.parent !== board) titleSkin.setParent(board);
            titleSkin.active = true;
            titleSkin.setPosition(0, 182, 0);
            (titleSkin.getComponent(UITransform) || titleSkin.addComponent(UITransform)).setContentSize(486, 84);
            this.applyUiSkin(titleSkin, HomeConfig.UI_MARKET_DETAIL_TITLE_BG, 486, 84);
            titleSkin.setSiblingIndex(1);
        }

        const title = this.findNode('ItemDetailPopupTitle', popup);
        const titleLabel = title?.getComponent(Label);
        if (title?.isValid && titleLabel) {
            if (title.parent !== board) title.setParent(board);
            title.active = true;
            title.setPosition(0, 185, 0);
            (title.getComponent(UITransform) || title.addComponent(UITransform)).setContentSize(300, 52);
            titleLabel.string = titleText;
            titleLabel.fontSize = 30;
            titleLabel.lineHeight = 38;
            titleLabel.color = new Color(126, 74, 36, 255);
            titleLabel.horizontalAlign = HorizontalTextAlignment.CENTER;
            titleLabel.verticalAlign = VerticalTextAlignment.CENTER;
            titleLabel.overflow = Overflow.SHRINK;
            this.setLabelOutline(titleLabel, new Color(255, 245, 215, 255), 2);
            title.setSiblingIndex(2);
        }

        const iconFrame = this.findNode('ItemDetailIconFrame', popup);
        if (iconFrame?.isValid) {
            iconFrame.setPosition(0, 86, 0);
            (iconFrame.getComponent(UITransform) || iconFrame.addComponent(UITransform)).setContentSize(96, 96);
            iconFrame.setSiblingIndex(3);
        }
        const icon = this.findNode('ItemDetailIcon', popup);
        if (icon?.isValid) {
            icon.setPosition(0, 2, 0);
            (icon.getComponent(UITransform) || icon.addComponent(UITransform)).setContentSize(72, 72);
            icon.setSiblingIndex(4);
        }

        const name = this.findNode('ItemDetailName', popup);
        if (name?.isValid) name.active = false;

        const fields: Array<{ nodeName: string; x: number; y: number; width: number; height: number; fontSize: number; lineHeight: number; top?: boolean }> = [
            { nodeName: 'ItemDetailType', x: 0, y: 20, width: 520, height: 32, fontSize: 22, lineHeight: 30 },
            { nodeName: 'ItemDetailCount', x: 0, y: -14, width: 520, height: 32, fontSize: 22, lineHeight: 30 },
            { nodeName: 'ItemDetailDescription', x: 0, y: -64, width: 580, height: 58, fontSize: 21, lineHeight: 29, top: true },
        ];
        fields.forEach((config) => {
            const node = this.findNode(config.nodeName, popup);
            const label = node?.getComponent(Label);
            if (!node?.isValid || !label) return;
            node.active = true;
            node.setPosition(config.x, config.y, 0);
            (node.getComponent(UITransform) || node.addComponent(UITransform)).setContentSize(config.width, config.height);
            label.fontSize = config.fontSize;
            label.lineHeight = config.lineHeight;
            label.color = new Color(92, 65, 43, 255);
            label.horizontalAlign = HorizontalTextAlignment.CENTER;
            label.verticalAlign = config.top ? VerticalTextAlignment.TOP : VerticalTextAlignment.CENTER;
            label.overflow = Overflow.SHRINK;
            label.enableWrapText = config.nodeName === 'ItemDetailDescription';
            this.setLabelOutline(label, new Color(255, 247, 224, 255), 1);
        });

        const secondary = this.findNode('ItemDetailSecondaryButton', popup);
        if (secondary?.isValid) secondary.active = false;
        const close = this.findNode('ItemDetailPopupClose', popup);
        if (close?.isValid) close.active = false;
    }
}
