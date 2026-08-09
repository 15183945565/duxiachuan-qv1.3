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
    protected abstract getBagEquipmentSlotId(item: BagIllustrationCatalogItem): string | null;
    protected abstract getEquipmentLevel(item?: BagIllustrationCatalogItem | null): number;
    protected abstract setLabelOutline(label: Label, color: Color, width: number): void;
}

const BAG_ILLUSTRATION_DETAIL_LAYOUT = {
    board: { width: 600, height: 380 },
    titleSkin: { x: 2.266, y: 121.974, width: 250, height: 60 },
    title: { x: 0, y: 124.974, width: 300, height: 52 },
    iconFrame: { x: -132.088, y: -10.589, width: 120, height: 120 },
    icon: { x: 0, y: 2, width: 90, height: 90 },
    equipmentLevel: { x: 142.648, y: 52.28, width: 360, height: 32 },
    equipmentStat: { x: 142.648, y: 22.28, width: 360, height: 32 },
    usageTitle: { x: 14.648, y: 31.28, width: 104, height: 36 },
    usageValue: { x: 232.648, y: 31.28, width: 420, height: 36 },
    obtainTitle: { x: 14.648, y: -10.72, width: 104, height: 36 },
    obtainValue: { x: 231, y: -10.589, width: 420, height: 36 },
    equipmentUsageY: -12.72,
    equipmentObtainY: -49.72,
} as const;
const BAG_ILLUSTRATION_TITLE_FONT_SIZE = 30;
const BAG_ILLUSTRATION_TITLE_HORIZONTAL_PADDING = 108;
const BAG_ILLUSTRATION_TITLE_MAX_WIDTH = 450;

/**
 * 通用物品详情、背包图鉴详情与市场物品详情布局。
 *
 * 模块只负责详情内容和交互编排；弹窗根层、关闭流程与资源加载仍由宿主统一管理。
 */
export abstract class HomeFeatureItemDetail extends HomeFeatureItemDetailHost {
    protected getItemDetailAttrFramePath(_framePath?: string): string {
        return HomeConfig.UI_BAG_ITEM_DETAIL_ATTR_BG;
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
            if (board?.isValid && titleSkin.parent !== board) titleSkin.setParent(board);
            titleSkin.active = true;
            titleSkin.setPosition(0, 182, 0);
            (titleSkin.getComponent(UITransform) || titleSkin.addComponent(UITransform)).setContentSize(
                HomeConfig.BAG_ITEM_DETAIL_TITLE_WIDTH,
                HomeConfig.BAG_ITEM_DETAIL_TITLE_HEIGHT,
            );
            this.applyUiSkin(
                titleSkin,
                HomeConfig.UI_BAG_ITEM_DETAIL_TITLE_BG,
                HomeConfig.BAG_ITEM_DETAIL_TITLE_WIDTH,
                HomeConfig.BAG_ITEM_DETAIL_TITLE_HEIGHT,
            );
            titleSkin.setSiblingIndex(1);
        }
        const title = this.findNode('ItemDetailPopupTitle', popup);
        const titleLabel = title?.getComponent(Label);
        if (title?.isValid && titleLabel) {
            if (board?.isValid && title.parent !== board) title.setParent(board);
            title.active = true;
            title.setPosition(0, 185, 0);
            (title.getComponent(UITransform) || title.addComponent(UITransform)).setContentSize(300, 52);
            titleLabel.string = '\u7269\u54c1\u8be6\u60c5';
            titleLabel.fontSize = 30;
            titleLabel.lineHeight = 38;
            titleLabel.color = new Color(126, 74, 36, 255);
            titleLabel.horizontalAlign = HorizontalTextAlignment.CENTER;
            titleLabel.verticalAlign = VerticalTextAlignment.CENTER;
            titleLabel.overflow = Overflow.SHRINK;
            this.setLabelOutline(titleLabel, new Color(255, 245, 215, 255), 2);
            title.setSiblingIndex(2);
        }
        const iconFrame = resetNode('ItemDetailIconFrame', -232, 72, 120, 120);
        if (iconFrame) {
            this.applyUiSkin(iconFrame, framePath || HomeConfig.UI_ROLE_EQUIP_FRAME_LV1, 120, 120);
            iconFrame.setSiblingIndex(3);
        }
        resetNode('ItemDetailIcon', 0, 2, 90, 90);
        resetNode('ItemDetailIconPlaceholder', 0, 0, 104, 104);
        resetNode('ItemDetailName', 82, 112, 450, 42);
        resetNode('ItemDetailType', 82, 68, 450, 38);
        resetNode('ItemDetailCount', 82, 30, 450, 38);
        resetNode('ItemDetailDescription', 0, -82, 590, 136);
        resetNode('ItemDetailPrimaryButton', 0, -188, 160, 58);
        resetNode('ItemDetailSecondaryButton', 108, -188, 160, 58);
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
            nameLabel.fontSize = 28;
            nameLabel.lineHeight = 36;
            nameLabel.color = new Color(255, 241, 190, 255);
            nameLabel.horizontalAlign = HorizontalTextAlignment.LEFT;
            nameLabel.verticalAlign = VerticalTextAlignment.CENTER;
            nameLabel.overflow = Overflow.SHRINK;
            this.setLabelOutline(nameLabel, new Color(67, 28, 14, 255), 2);
        }
        ['ItemDetailType', 'ItemDetailCount'].forEach((nodeName) => {
            const label = this.findNode(nodeName, popup)?.getComponent(Label);
            if (!label) return;
            label.fontSize = 24;
            label.lineHeight = 32;
            label.color = new Color(236, 218, 184, 255);
            label.horizontalAlign = HorizontalTextAlignment.LEFT;
            label.verticalAlign = VerticalTextAlignment.CENTER;
            label.overflow = Overflow.SHRINK;
            this.setLabelOutline(label, new Color(38, 24, 18, 255), 1);
        });
        const descLabel = this.findNode('ItemDetailDescription', popup)?.getComponent(Label);
        if (descLabel) {
            descLabel.fontSize = 22;
            descLabel.lineHeight = 30;
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
            BAG_ILLUSTRATION_DETAIL_LAYOUT.board.width,
            BAG_ILLUSTRATION_DETAIL_LAYOUT.board.height,
        );
        board.setPosition(0, 0, 0);
        this.applyUiSkin(
            board,
            this.getItemDetailAttrFramePath(item.framePath),
            BAG_ILLUSTRATION_DETAIL_LAYOUT.board.width,
            BAG_ILLUSTRATION_DETAIL_LAYOUT.board.height,
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
        const displayTitle = this.getCatalogDisplayName(item);
        const titleSkinWidth = this.getBagIllustrationDetailTitleSkinWidth(displayTitle);
        const titleLabelWidth = Math.max(BAG_ILLUSTRATION_DETAIL_LAYOUT.title.width, titleSkinWidth + 24);

        const titleSkin = board.getChildByName('BagIllustrationDetailPopupTitleSkin');
        if (titleSkin?.isValid) {
            const titleSkinLayout = BAG_ILLUSTRATION_DETAIL_LAYOUT.titleSkin;
            titleSkin.active = true;
            titleSkin.setPosition(titleSkinLayout.x, titleSkinLayout.y, 0);
            (titleSkin.getComponent(UITransform) || titleSkin.addComponent(UITransform)).setContentSize(titleSkinWidth, titleSkinLayout.height);
            this.applyUiSkin(
                titleSkin,
                HomeConfig.UI_BAG_ITEM_DETAIL_TITLE_BG,
                titleSkinWidth,
                titleSkinLayout.height,
            );
            titleSkin.setSiblingIndex(1);
        }

        const titleLayout = BAG_ILLUSTRATION_DETAIL_LAYOUT.title;
        const titleLabel = this.getOrCreatePopupLabel(
            board,
            'BagIllustrationDetailPopupTitle',
            displayTitle,
            BAG_ILLUSTRATION_TITLE_FONT_SIZE,
            titleLayout.x,
            titleLayout.y,
            titleLabelWidth,
            titleLayout.height,
            new Color(126, 74, 36, 255),
        );
        titleLabel.horizontalAlign = HorizontalTextAlignment.CENTER;
        titleLabel.verticalAlign = VerticalTextAlignment.CENTER;
        titleLabel.overflow = Overflow.SHRINK;
        titleLabel.color = new Color(126, 74, 36, 255);
        titleLabel.fontSize = BAG_ILLUSTRATION_TITLE_FONT_SIZE;
        titleLabel.lineHeight = 38;
        this.setLabelOutline(titleLabel, new Color(255, 245, 215, 255), 2);
        titleLabel.node.setSiblingIndex(2);

        const close = this.findNode('BagIllustrationDetailPopupClose', popup);
        if (close?.isValid) {
            close.active = false;
            close.setSiblingIndex(20);
        }

        const iconFrameLayout = BAG_ILLUSTRATION_DETAIL_LAYOUT.iconFrame;
        const iconFrame = this.findNode('BagIllustrationDetailIconFrame', popup)
            || this.createSkinnedNode(
                'BagIllustrationDetailIconFrame',
                board,
                iconFrameLayout.width,
                iconFrameLayout.height,
                iconFrameLayout.x,
                iconFrameLayout.y,
                item.framePath,
            );
        iconFrame.active = true;
        iconFrame.setPosition(iconFrameLayout.x, iconFrameLayout.y, 0);
        (iconFrame.getComponent(UITransform) || iconFrame.addComponent(UITransform)).setContentSize(iconFrameLayout.width, iconFrameLayout.height);
        this.applyUiSkin(iconFrame, item.framePath, iconFrameLayout.width, iconFrameLayout.height);
        iconFrame.setSiblingIndex(3);

        const iconLayout = BAG_ILLUSTRATION_DETAIL_LAYOUT.icon;
        const existingDetailIcon = this.findNode('BagIllustrationDetailIcon', popup);
        const detailIcon = existingDetailIcon
            || this.createSkinnedNode('BagIllustrationDetailIcon', iconFrame, iconLayout.width, iconLayout.height, iconLayout.x, iconLayout.y, item.iconPath);
        detailIcon.active = true;
        if (!existingDetailIcon && detailIcon.parent !== iconFrame) detailIcon.setParent(iconFrame);
        detailIcon.setPosition(iconLayout.x, iconLayout.y, 0);
        (detailIcon.getComponent(UITransform) || detailIcon.addComponent(UITransform)).setContentSize(iconLayout.width, iconLayout.height);
        this.applyUiSkin(detailIcon, item.iconPath, iconLayout.width, iconLayout.height);
        detailIcon.setSiblingIndex(2);

        const equipmentAttrLines = this.getBagIllustrationEquipmentAttrLines(item);
        const equipmentLevelNode = board.getChildByName('BagIllustrationEquipmentLevel');
        const equipmentStatNode = board.getChildByName('BagIllustrationEquipmentStat');
        if (equipmentAttrLines) {
            const levelLayout = BAG_ILLUSTRATION_DETAIL_LAYOUT.equipmentLevel;
            const levelLabel = this.getOrCreatePopupLabel(
                board,
                'BagIllustrationEquipmentLevel',
                equipmentAttrLines[0],
                24,
                levelLayout.x,
                levelLayout.y,
                levelLayout.width,
                levelLayout.height,
                new Color(236, 218, 184, 255),
                true,
            );
            levelLabel.horizontalAlign = HorizontalTextAlignment.LEFT;
            levelLabel.fontSize = 24;
            levelLabel.lineHeight = 30;
            this.setLabelOutline(levelLabel, new Color(38, 24, 18, 255), 1);
            levelLabel.node.setSiblingIndex(5);

            const statLayout = BAG_ILLUSTRATION_DETAIL_LAYOUT.equipmentStat;
            const statLabel = this.getOrCreatePopupLabel(
                board,
                'BagIllustrationEquipmentStat',
                equipmentAttrLines[1],
                24,
                statLayout.x,
                statLayout.y,
                statLayout.width,
                statLayout.height,
                new Color(236, 218, 184, 255),
                true,
            );
            statLabel.horizontalAlign = HorizontalTextAlignment.LEFT;
            statLabel.fontSize = 24;
            statLabel.lineHeight = 30;
            this.setLabelOutline(statLabel, new Color(38, 24, 18, 255), 1);
            statLabel.node.setSiblingIndex(5);
        } else {
            if (equipmentLevelNode?.isValid) equipmentLevelNode.active = false;
            if (equipmentStatNode?.isValid) equipmentStatNode.active = false;
        }

        const usageTitleLayout = BAG_ILLUSTRATION_DETAIL_LAYOUT.usageTitle;
        const usageY = equipmentAttrLines ? BAG_ILLUSTRATION_DETAIL_LAYOUT.equipmentUsageY : usageTitleLayout.y;
        const usageTitle = this.getOrCreatePopupLabel(
            board,
            'BagIllustrationUsageTitle',
            '\u7528\u9014\uff1a',
            24,
            usageTitleLayout.x,
            usageY,
            usageTitleLayout.width,
            usageTitleLayout.height,
            new Color(236, 218, 184, 255),
            true,
        );
        usageTitle.horizontalAlign = HorizontalTextAlignment.LEFT;
        usageTitle.fontSize = 24;
        usageTitle.lineHeight = 32;
        this.setLabelOutline(usageTitle, new Color(38, 24, 18, 255), 1);
        usageTitle.node.setSiblingIndex(5);

        const usageValueLayout = BAG_ILLUSTRATION_DETAIL_LAYOUT.usageValue;
        const usageValue = this.getOrCreatePopupLabel(
            board,
            'BagIllustrationUsageValue',
            this.getBagIllustrationUsage(item, type),
            24,
            usageValueLayout.x,
            usageY,
            usageValueLayout.width,
            usageValueLayout.height,
            new Color(236, 218, 184, 255),
            true,
        );
        usageValue.horizontalAlign = HorizontalTextAlignment.LEFT;
        usageValue.overflow = Overflow.SHRINK;
        usageValue.fontSize = 24;
        usageValue.lineHeight = 32;
        this.setLabelOutline(usageValue, new Color(38, 24, 18, 255), 1);
        usageValue.node.setSiblingIndex(5);

        const obtainBg = board.getChildByName('BagIllustrationObtainBg') || this.findNode('BagIllustrationObtainBg', popup);
        if (obtainBg?.isValid) {
            obtainBg.active = false;
        }

        const obtainTitleLayout = BAG_ILLUSTRATION_DETAIL_LAYOUT.obtainTitle;
        const obtainY = equipmentAttrLines ? BAG_ILLUSTRATION_DETAIL_LAYOUT.equipmentObtainY : obtainTitleLayout.y;
        const obtainTitle = this.getOrCreatePopupLabel(
            board,
            'BagIllustrationObtainTitle',
            '\u83b7\u5f97\uff1a',
            24,
            obtainTitleLayout.x,
            obtainY,
            obtainTitleLayout.width,
            obtainTitleLayout.height,
            new Color(236, 218, 184, 255),
            true,
        );
        obtainTitle.horizontalAlign = HorizontalTextAlignment.LEFT;
        obtainTitle.fontSize = 24;
        obtainTitle.lineHeight = 32;
        this.setLabelOutline(obtainTitle, new Color(38, 24, 18, 255), 1);
        obtainTitle.node.setSiblingIndex(6);

        const obtainValueLayout = BAG_ILLUSTRATION_DETAIL_LAYOUT.obtainValue;
        const obtainValue = this.getOrCreatePopupLabel(
            board,
            'BagIllustrationObtainValue',
            this.getBagIllustrationObtainSource(item, type),
            24,
            obtainValueLayout.x,
            obtainY,
            obtainValueLayout.width,
            obtainValueLayout.height,
            new Color(236, 218, 184, 255),
            true,
        );
        obtainValue.horizontalAlign = HorizontalTextAlignment.LEFT;
        obtainValue.overflow = Overflow.SHRINK;
        obtainValue.fontSize = 24;
        obtainValue.lineHeight = 32;
        this.setLabelOutline(obtainValue, new Color(38, 24, 18, 255), 1);
        obtainValue.node.setSiblingIndex(6);
    }
    protected getBagIllustrationEquipmentAttrLines(item: BagIllustrationCatalogItem): [string, string] | null {
        if (item.category !== 'equipment') return null;
        const slotId = this.getBagEquipmentSlotId(item);
        if (!slotId) return null;

        const slotConfig = this.getRoleEquipmentSlotConfigs().find((config) => config.id === slotId);
        if (!slotConfig) return null;

        const level = Math.max(1, Math.floor(this.getEquipmentLevel(item) || 1));
        const statRule = this.getRoleEquipmentStatRule(slotConfig);
        const statLabel = statRule?.detailLabel || '\u5c5e\u6027';
        const statValue = this.getEquipmentStatValueForLevel(slotConfig, level);
        return [
            `\u7b49\u7ea7\uff1alv.${level}`,
            `${statLabel}\uff1a+${statValue}`,
        ];
    }
    protected getBagIllustrationDetailTitleSkinWidth(title: string): number {
        const weight = Array.from(title).reduce((sum, char) => {
            return sum + (/^[\x00-\x7F]$/.test(char) ? 0.58 : 1);
        }, 0);
        const estimated = Math.ceil(weight * BAG_ILLUSTRATION_TITLE_FONT_SIZE + BAG_ILLUSTRATION_TITLE_HORIZONTAL_PADDING);
        return this.clamp(
            estimated,
            BAG_ILLUSTRATION_DETAIL_LAYOUT.titleSkin.width,
            BAG_ILLUSTRATION_TITLE_MAX_WIDTH,
        );
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
    protected getOrCreatePopupLabel(parent: Node, name: string, text: string, fontSize: number, x: number, y: number, width: number, height: number, color: Color, preserveExistingTransform = false): Label {
        let node = parent.getChildByName(name);
        const existed = node?.isValid;
        if (!node?.isValid) {
            node = this.createNode(name, parent, width, height, x, y);
        } else if (!preserveExistingTransform) {
            node.active = true;
            node.setPosition(x, y, 0);
            (node.getComponent(UITransform) || node.addComponent(UITransform)).setContentSize(width, height);
        } else {
            node.active = true;
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
        if (name.includes('\u6539\u540d\u5361')) return '\u4fee\u6539\u6635\u79f0';
        if (name.includes('\u5408\u6210\u5361')) return '\u5408\u6210\u517d\u5361';
        if (name.includes('\u9b54\u754c\u95e8\u7968')) return '\u9b54\u754c\u6d88\u8017';
        if (name.includes('\u6311\u6218\u5361')) return '\u5f81\u6218\u6d88\u8017';
        if (name.includes('\u4fdd\u62a4\u5361')) return '\u9b54\u754c\u9053\u5177';
        if (name.includes('\u6316\u5b9d\u5238')) return '\u6316\u5b9d\u73a9\u6cd5';
        if (name.includes('\u6218\u529b\u5361')) return '\u9b54\u754c\u9053\u5177';
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
        if (name.includes('\u517d\u5361\u788e\u7247')) return '\u9b54\u754c\u4ea7\u51fa';
        if (name.includes('\u517d\u5361')) return '\u788e\u7247\u5408\u6210';
        if (name.includes('\u5b9d\u77f3')) return '\u517d\u5361';
        if (type === '\u88c5\u5907' && (name.includes('\u91d1\u9e64') || name.includes('\u9752\u72ee') || name.includes('\u767d\u9e7f') || name.includes('\u8d64\u72d0'))) return '\u5143\u5b9d\u89e3\u9501';
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
                primary.setPosition(0, -188, 0);
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
