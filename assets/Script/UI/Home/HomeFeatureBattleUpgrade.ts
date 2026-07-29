import {
    Color,
    EventTouch,
    Graphics,
    HorizontalTextAlignment,
    Node,
    Overflow,
    UITransform,
    VerticalTextAlignment,
} from 'cc';
import * as HomeConfig from './HomeConfig';
import { HomeViewBase } from './HomeViewBase';

/**
 * Owns the Battle arena upgrade popup, output comparison and material confirmation.
 */
export abstract class HomeFeatureBattleUpgrade extends HomeViewBase {
    protected openBattleUpgradePopup(): void {
        const popup = this.ensureBattleUpgradePopup();
        popup.active = true;
        this.ensureInputBlocker(popup);
        popup.setSiblingIndex((popup.parent?.children.length || 1) - 1);
    }

    protected closeBattleUpgradePopup(): void {
        if (!this.battleUpgradePopup?.isValid) {
            this.battleUpgradePopup = this.battlePanel?.getChildByName('BattleUpgradePopup') || null;
        }
        if (!this.battleUpgradePopup?.isValid) return;

        this.battleUpgradePopup.active = false;
    }

    protected ensureBattleUpgradePopup(): Node {
        if (!this.battlePanel) {
            throw new Error('BattlePanel is not ready');
        }

        const popupInfo = this.getOrCreateBattleNode(this.battlePanel, 'BattleUpgradePopup', HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT, 0, 0);
        const popup = popupInfo.node;
        this.battleUpgradePopup = popup;
        if (!popupInfo.existed) {
            popup.setPosition(0, 0, 0);
            (popup.getComponent(UITransform) || popup.addComponent(UITransform)).setContentSize(HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT);
        }
        if (!popup.getComponent(Graphics)) {
            this.drawRect(popup, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT, new Color(0, 0, 0, 110));
        }
        popup.off(Node.EventType.TOUCH_END);
        popup.on(Node.EventType.TOUCH_END, (event: EventTouch) => {
            event.propagationStopped = true;
            this.closeBattleUpgradePopup();
        }, this);

        const boardInfo = this.getOrCreateBattleNode(popup, 'BattleUpgradeBoard', HomeConfig.BATTLE_UPGRADE_POPUP_WIDTH, HomeConfig.BATTLE_UPGRADE_POPUP_HEIGHT, 0, 0);
        const board = boardInfo.node;
        this.battleUpgradeBoard = board;
        board.active = true;
        if (!boardInfo.existed) {
            board.setPosition(0, 0, 0);
        }
        board.off(Node.EventType.TOUCH_END);
        board.on(Node.EventType.TOUCH_END, (event: EventTouch) => {
            event.propagationStopped = true;
        }, this);

        this.getOrCreateBattleSkinnedNode(board, 'BattleUpgradeBoardSkin', HomeConfig.BATTLE_UPGRADE_POPUP_WIDTH, HomeConfig.BATTLE_UPGRADE_POPUP_HEIGHT, 0, 0, HomeConfig.UI_BATTLE_UPGRADE_POPUP_BG).node.setSiblingIndex(0);
        const title = this.getOrCreateBattleLabel(board, 'BattleUpgradeTitle', '\u6218\u573a\u5347\u7ea7', 32, 0, 348, 220, 52, Color.WHITE).label;
        title.fontSize = 32;
        title.color = Color.WHITE;
        this.applyBattleEntryTextStyle(title, 2);
        title.node.setSiblingIndex(2);

        this.createBattleUpgradeCard(board, 'BattleUpgradeCurrent', HomeConfig.UI_BATTLE_UPGRADE_CURRENT_FRAME, HomeConfig.BATTLE_UPGRADE_CURRENT_FRAME_WIDTH, HomeConfig.BATTLE_UPGRADE_CURRENT_FRAME_HEIGHT, HomeConfig.BATTLE_UPGRADE_CARD_CURRENT_X, '\u5f53\u524d', '22');
        this.createBattleUpgradeCard(board, 'BattleUpgradeNext', HomeConfig.UI_BATTLE_UPGRADE_NEXT_FRAME, HomeConfig.BATTLE_UPGRADE_NEXT_FRAME_WIDTH, HomeConfig.BATTLE_UPGRADE_NEXT_FRAME_HEIGHT, HomeConfig.BATTLE_UPGRADE_CARD_NEXT_X, '\u4e0b\u4e00\u7ea7', '23');
        this.getOrCreateBattleSkinnedNode(board, 'BattleUpgradeArrow', 36, 30, 0, HomeConfig.BATTLE_UPGRADE_ARROW_Y, HomeConfig.UI_BATTLE_UPGRADE_ARROW).node.setSiblingIndex(5);
        this.createBattleUpgradeOutputPanels(board);
        this.createBattleUpgradeMaterialBar(board);
        this.createBattleUpgradeConfirmButton(board);
        return popup;
    }

    protected createBattleUpgradeCard(parent: Node, prefix: string, framePath: string, width: number, height: number, x: number, caption: string, level: string): void {
        const cardInfo = this.getOrCreateBattleSkinnedNode(parent, `${prefix}Card`, width, height, x, HomeConfig.BATTLE_UPGRADE_CARD_Y, framePath);
        const card = cardInfo.node;
        card.active = true;
        if (!cardInfo.existed) {
            card.setPosition(x, HomeConfig.BATTLE_UPGRADE_CARD_Y, 0);
        }
        card.setSiblingIndex(3);

        const iconInfo = this.getOrCreateBattleSkinnedNode(parent, `${prefix}Icon`, HomeConfig.BATTLE_UPGRADE_ICON_SIZE, HomeConfig.BATTLE_UPGRADE_ICON_SIZE, x, HomeConfig.BATTLE_UPGRADE_ICON_Y, HomeConfig.UI_BATTLE_UPGRADE_ICON);
        const icon = iconInfo.node;
        icon.active = true;
        if (!iconInfo.existed) {
            icon.setPosition(x, HomeConfig.BATTLE_UPGRADE_ICON_Y, 0);
        }
        icon.setSiblingIndex(4);

        const captionLabel = this.getOrCreateBattleLabel(parent, `${prefix}Caption`, caption, 20, x, 324, 120, 28, new Color(94, 64, 35, 255)).label;
        captionLabel.color = new Color(94, 64, 35, 255);
        captionLabel.fontSize = 20;
        captionLabel.node.setSiblingIndex(5);

        const levelLabel = this.getOrCreateBattleLabel(parent, `${prefix}Level`, level, 18, x, HomeConfig.BATTLE_UPGRADE_LEVEL_Y, 52, 30, new Color(255, 226, 112, 255)).label;
        levelLabel.color = new Color(255, 226, 112, 255);
        levelLabel.fontSize = 18;
        this.applyBattleEntryTextStyle(levelLabel, 2);
        levelLabel.node.setSiblingIndex(6);
    }

    protected createBattleUpgradeOutputPanels(parent: Node): void {
        const oldDesc = parent.getChildByName('BattleUpgradeDescription');
        if (oldDesc?.isValid) oldDesc.active = false;

        this.createBattleUpgradeOutputPanel(
            parent,
            'BattleUpgradeOutputPanelCurrent',
            -HomeConfig.BATTLE_UPGRADE_OUTPUT_PANEL_X,
            HomeConfig.BATTLE_UPGRADE_CURRENT_OUTPUTS,
        );
        this.createBattleUpgradeOutputPanel(
            parent,
            'BattleUpgradeOutputPanelNext',
            HomeConfig.BATTLE_UPGRADE_OUTPUT_PANEL_X,
            HomeConfig.BATTLE_UPGRADE_NEXT_OUTPUTS,
        );
    }

    protected createBattleUpgradeOutputPanel(
        parent: Node,
        name: string,
        x: number,
        outputs: readonly { name: string; icon: string }[],
    ): void {
        const panelInfo = this.getOrCreateBattleNode(
            parent,
            name,
            HomeConfig.BATTLE_UPGRADE_OUTPUT_PANEL_WIDTH,
            HomeConfig.BATTLE_UPGRADE_OUTPUT_PANEL_HEIGHT,
            x,
            HomeConfig.BATTLE_UPGRADE_OUTPUT_PANEL_Y,
        );
        const panel = panelInfo.node;
        panel.active = true;
        if (!panelInfo.existed) {
            panel.setPosition(x, HomeConfig.BATTLE_UPGRADE_OUTPUT_PANEL_Y, 0);
        }
        panel.setSiblingIndex(7);

        this.getOrCreateBattleSkinnedNode(
            panel,
            `${name}Bg`,
            HomeConfig.BATTLE_UPGRADE_OUTPUT_PANEL_WIDTH,
            HomeConfig.BATTLE_UPGRADE_OUTPUT_PANEL_HEIGHT,
            0,
            0,
            HomeConfig.UI_BATTLE_UPGRADE_OUTPUT_PANEL_BG,
        ).node.setSiblingIndex(0);

        const columns = 3;
        const startX = -HomeConfig.BATTLE_UPGRADE_OUTPUT_ITEM_COLUMN_GAP;
        const startY = HomeConfig.BATTLE_UPGRADE_OUTPUT_ITEM_ROW_GAP;
        outputs.forEach((output, index) => {
            const column = index % columns;
            const row = Math.floor(index / columns);
            const itemX = startX + column * HomeConfig.BATTLE_UPGRADE_OUTPUT_ITEM_COLUMN_GAP;
            const itemY = startY - row * HomeConfig.BATTLE_UPGRADE_OUTPUT_ITEM_ROW_GAP;
            const itemInfo = this.getOrCreateBattleNode(
                panel,
                `${name}Item_${index + 1}`,
                HomeConfig.BATTLE_UPGRADE_OUTPUT_ITEM_WIDTH,
                HomeConfig.BATTLE_UPGRADE_OUTPUT_ITEM_HEIGHT,
                itemX,
                itemY,
            );
            const item = itemInfo.node;
            item.active = true;
            if (!itemInfo.existed) {
                item.setPosition(itemX, itemY, 0);
            }
            item.setSiblingIndex(index + 1);

            const icon = this.getOrCreateBattleSkinnedNode(
                item,
                `${name}ItemIcon_${index + 1}`,
                HomeConfig.BATTLE_UPGRADE_OUTPUT_ICON_SIZE,
                HomeConfig.BATTLE_UPGRADE_OUTPUT_ICON_SIZE,
                0,
                10,
                output.icon,
            ).node;
            icon.active = true;
            icon.setSiblingIndex(0);

            const label = this.getOrCreateBattleLabel(
                item,
                `${name}ItemName_${index + 1}`,
                output.name,
                HomeConfig.BATTLE_UPGRADE_OUTPUT_LABEL_FONT_SIZE,
                0,
                -18,
                HomeConfig.BATTLE_UPGRADE_OUTPUT_LABEL_WIDTH,
                HomeConfig.BATTLE_UPGRADE_OUTPUT_LABEL_HEIGHT,
                new Color(62, 40, 23, 255),
            ).label;
            label.string = output.name;
            label.fontSize = HomeConfig.BATTLE_UPGRADE_OUTPUT_LABEL_FONT_SIZE;
            label.lineHeight = HomeConfig.BATTLE_UPGRADE_OUTPUT_LABEL_FONT_SIZE + 4;
            label.color = new Color(62, 40, 23, 255);
            label.horizontalAlign = HorizontalTextAlignment.CENTER;
            label.verticalAlign = VerticalTextAlignment.CENTER;
            label.overflow = Overflow.SHRINK;
            label.node.setSiblingIndex(1);
        });
    }

    protected createBattleUpgradeMaterialBar(parent: Node): void {
        const barInfo = this.getOrCreateBattleNode(parent, 'BattleUpgradeMaterialBar', HomeConfig.BATTLE_UPGRADE_MATERIAL_BAR_WIDTH, HomeConfig.BATTLE_UPGRADE_MATERIAL_BAR_HEIGHT, 0, HomeConfig.BATTLE_UPGRADE_MATERIAL_BAR_Y);
        const bar = barInfo.node;
        bar.active = true;
        if (!barInfo.existed) {
            bar.setPosition(0, HomeConfig.BATTLE_UPGRADE_MATERIAL_BAR_Y, 0);
        }
        bar.setSiblingIndex(8);

        HomeConfig.BATTLE_UPGRADE_MATERIALS.forEach((material, index) => {
            const x = (index - 1) * HomeConfig.BATTLE_UPGRADE_MATERIAL_ITEM_SPACING;
            const itemInfo = this.getOrCreateBattleNode(bar, `BattleUpgradeMaterialItem_${index + 1}`, HomeConfig.BATTLE_UPGRADE_MATERIAL_ITEM_WIDTH, HomeConfig.BATTLE_UPGRADE_MATERIAL_ITEM_HEIGHT, x, 0);
            const item = itemInfo.node;
            item.active = true;
            if (!itemInfo.existed) {
                item.setPosition(x, 0, 0);
            }
            item.setSiblingIndex(index);
            const oldMaterialBg = item.getChildByName(`BattleUpgradeMaterialBg_${index + 1}`);
            if (oldMaterialBg) {
                oldMaterialBg.active = false;
            }
            this.getOrCreateBattleSkinnedNode(item, `BattleUpgradeMaterialIcon_${index + 1}`, HomeConfig.BATTLE_UPGRADE_MATERIAL_ICON_SIZE, HomeConfig.BATTLE_UPGRADE_MATERIAL_ICON_SIZE, HomeConfig.BATTLE_UPGRADE_MATERIAL_ICON_X, 1, material.icon).node.setSiblingIndex(1);

            const owned = this.getOrCreateBattleLabel(item, `BattleUpgradeMaterialOwned_${index + 1}`, `${material.owned} /`, 18, HomeConfig.BATTLE_UPGRADE_MATERIAL_TEXT_X - 18, 0, 74, 32, new Color(94, 224, 83, 255)).label;
            owned.fontSize = 18;
            owned.color = new Color(94, 224, 83, 255);
            owned.horizontalAlign = HorizontalTextAlignment.RIGHT;
            this.applyBattleEntryTextStyle(owned, 2);
            owned.node.setSiblingIndex(2);

            const need = this.getOrCreateBattleLabel(item, `BattleUpgradeMaterialNeed_${index + 1}`, material.need, 18, HomeConfig.BATTLE_UPGRADE_MATERIAL_TEXT_X + 44, 0, 58, 32, Color.WHITE).label;
            need.fontSize = 18;
            need.color = Color.WHITE;
            need.horizontalAlign = HorizontalTextAlignment.LEFT;
            this.applyBattleEntryTextStyle(need, 2);
            need.node.setSiblingIndex(3);
        });
    }

    protected createBattleUpgradeConfirmButton(parent: Node): void {
        const buttonInfo = this.getOrCreateBattleSkinnedNode(parent, 'BattleUpgradeConfirmButton', HomeConfig.BATTLE_UPGRADE_BUTTON_WIDTH, HomeConfig.BATTLE_UPGRADE_BUTTON_HEIGHT, 0, HomeConfig.BATTLE_UPGRADE_BUTTON_Y, HomeConfig.UI_BATTLE_ACTION_BUTTON_BG);
        const button = buttonInfo.node;
        button.active = true;
        if (!buttonInfo.existed) {
            button.setPosition(0, HomeConfig.BATTLE_UPGRADE_BUTTON_Y, 0);
        }
        button.setSiblingIndex(9);
        const label = this.getOrCreateBattleLabel(button, 'BattleUpgradeConfirmButtonLabel', '\u5347\u7ea7', 26, 0, 0, HomeConfig.BATTLE_UPGRADE_BUTTON_WIDTH - 28, HomeConfig.BATTLE_UPGRADE_BUTTON_HEIGHT - 12, new Color(255, 238, 171, 255)).label;
        label.fontSize = 26;
        label.color = new Color(255, 238, 171, 255);
        this.applyBattleEntryTextStyle(label, 2);
        label.node.setSiblingIndex(1);
        this.bindScaledClick(button, () => this.handleBattleUpgradeConfirm());
    }

    protected handleBattleUpgradeConfirm(): void {
        this.showToast('\u6218\u573a\u5347\u7ea7\u8bf7\u6c42\u5df2\u63d0\u4ea4');
        this.closeBattleUpgradePopup();
    }
}
