import {
    Color,
    EventTouch,
    HorizontalTextAlignment,
    Label,
    Mask,
    Node,
    UITransform,
    VerticalTextAlignment,
} from 'cc';
import { applySimKaiFont } from '../Common/UIFont';
import * as HomeConfig from './HomeConfig';
import { HomeViewBase } from './HomeViewBase';

abstract class HomeFeatureBattleEntryHost extends HomeViewBase {
    protected abstract openBattleUpgradePopup(): void;
    protected abstract closeBattleUpgradePopup(): void;
    protected abstract openBattleChallengeConfirmPopup(): void;
    protected abstract openBattleTargetChallengePopup(): void;
    protected abstract closeBattleTargetChallengePopup(): void;
}

/**
 * Owns Battle page creation, entry materials, counters and entry actions.
 */
export abstract class HomeFeatureBattleEntry extends HomeFeatureBattleEntryHost {
    protected openBattlePanel(): void {
        this.buildBattlePanel();
        if (!this.battlePanel) return;

        this.closeOtherBottomEntryPages(this.battlePanel);
        this.battlePanel.active = true;
        this.ensureInputBlocker(this.battlePanel);
        this.battlePanel.setSiblingIndex((this.battlePanel.parent?.children.length || 1) - 1);
        this.resetBattlePanelToEntry();
        this.playBattleBackgroundAnimation();
        this.refreshBattleAutoHostEntryState();
        this.refreshBottomEntryChrome();
    }

    protected closeBattlePanel(): void {
        if (!this.battlePanel) return;

        this.battlePanel.active = false;
        this.closeBattleUpgradePopup();
        this.closeBattleTargetChallengePopup();
        this.stopBattleChallengeSequence();
        this.stopBattleBackgroundAnimation();
        this.stopMagicScene();
        this.stopBeastCard();
        this.refreshBottomEntryChrome();
        this.showToast('\u5f81\u6218\u5df2\u5173\u95ed');
    }

    protected buildBattlePanel(): void {
        if (this.battlePanel) return;

        const popupParent = this.pageRoot || this.popupRoot || this.node;
        const editorPanel = popupParent.getChildByName('BattlePanel') || this.findNode('BattlePanel');
        this.battlePanel = editorPanel || this.createNode('BattlePanel', popupParent, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT, 0, 0);
        if (this.battlePanel.parent !== popupParent) {
            this.battlePanel.setParent(popupParent);
        }
        if (!editorPanel) {
            this.battlePanel.setPosition(0, 0, 0);
            (this.battlePanel.getComponent(UITransform) || this.battlePanel.addComponent(UITransform)).setContentSize(HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT);
        }
        this.battlePanel.active = false;
        this.battlePanel.on(Node.EventType.TOUCH_END, (event: EventTouch) => {
            event.propagationStopped = true;
        }, this);

        const mask = this.battlePanel.getComponent(Mask) || this.battlePanel.addComponent(Mask);
        mask.type = Mask.Type.GRAPHICS_RECT;
        mask.enabled = true;

        const backdropInfo = this.getOrCreateBattleNode(this.battlePanel, 'BattleBackdrop', HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT, 0, 0);
        const backdrop = backdropInfo.node;
        if (!backdropInfo.existed) {
            this.drawRect(backdrop, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT, new Color(4, 14, 21, 255));
        }
        backdrop.setSiblingIndex(0);

        const bgSlot = this.getOrCreateBattleNode(this.battlePanel, 'BattleBackgroundSlot', HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT, 0, 0).node;
        bgSlot.setSiblingIndex(1);
        this.getOrCreateBattleSkinnedNode(bgSlot, 'BattleEntryBackground', HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT, 0, 0, HomeConfig.UI_BATTLE_ENTRY_BG).node.setSiblingIndex(0);
        this.battleBgSkeleton = null;

        this.getOrCreateBattleLabel(this.battlePanel, 'BattleTitle', '\u5f81\u6218', 44, 0, 720, 220, 70, new Color(255, 239, 191, 255));
        this.createBattleLevelSubtitle(this.battlePanel);
        const handleBack = (): void => {
            if (this.battleCombatLayer?.isValid && this.battleCombatLayer.active) {
                this.openBattleAutoHostConfirmPopup();
                return;
            }
            this.closeBattlePanel();
        };
        const editorBack = this.battlePanel.getChildByName('BattleBack');
        if (editorBack) {
            this.applyUiSkinKeepingEditorSize(editorBack, HomeConfig.UI_RANK_BACK, HomeConfig.BOTTOM_ENTRY_BACK_BUTTON_WIDTH, HomeConfig.BOTTOM_ENTRY_BACK_BUTTON_HEIGHT);
            this.bindScaledClick(editorBack, handleBack);
        } else {
            this.createMailButton(this.battlePanel, 'BattleBack', '', HomeConfig.BOTTOM_ENTRY_BACK_BUTTON_X, HomeConfig.BOTTOM_ENTRY_BACK_BUTTON_Y, HomeConfig.BOTTOM_ENTRY_BACK_BUTTON_WIDTH, HomeConfig.BOTTOM_ENTRY_BACK_BUTTON_HEIGHT, new Color(110, 72, 52, 0), handleBack, HomeConfig.UI_RANK_BACK);
        }

        this.createBattleEntryUi();
    }

    protected getOrCreateBattleNode(parent: Node, name: string, width: number, height: number, x: number, y: number): { node: Node; existed: boolean } {
        const existing = parent.getChildByName(name);
        if (existing?.isValid) {
            const transform = existing.getComponent(UITransform) || existing.addComponent(UITransform);
            if (transform.contentSize.width <= 0 || transform.contentSize.height <= 0) {
                transform.setContentSize(width, height);
            }
            return { node: existing, existed: true };
        }

        return { node: this.createNode(name, parent, width, height, x, y), existed: false };
    }

    protected getOrCreateBattleSkinnedNode(parent: Node, name: string, width: number, height: number, x: number, y: number, skinPath: string): { node: Node; existed: boolean } {
        const result = this.getOrCreateBattleNode(parent, name, width, height, x, y);
        this.applyUiSkinKeepingEditorSize(result.node, skinPath, width, height);
        return result;
    }

    protected getOrCreateBattleLabel(parent: Node, name: string, text: string, fontSize: number, x: number, y: number, width: number, height: number, color: Color): { label: Label; existed: boolean } {
        const result = this.getOrCreateBattleNode(parent, name, width, height, x, y);
        const label = result.node.getComponent(Label) || result.node.addComponent(Label);
        label.string = text;
        if (!result.existed) {
            applySimKaiFont(label);
            label.fontSize = fontSize;
            label.lineHeight = fontSize + 8;
            label.color = color;
            label.horizontalAlign = HorizontalTextAlignment.CENTER;
            label.verticalAlign = VerticalTextAlignment.CENTER;
        }
        return { label, existed: result.existed };
    }

    protected createBattleEntryUi(): void {
        if (!this.battlePanel) return;

        this.battleEntryUiRoot = this.getOrCreateBattleNode(this.battlePanel, 'BattleEntryUiRoot', HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT, 0, 0).node;
        this.battleEntryUiRoot.setSiblingIndex(3);
        this.createBattleEntryMaterialBar(this.battleEntryUiRoot);
        this.createBattleDailyChallengeCount(this.battleEntryUiRoot);
        this.createBattleEntryActionButtons(this.battleEntryUiRoot);
        this.createBattleChallengeLimitHint(this.battleEntryUiRoot);
        this.refreshBattleAutoHostEntryState();
    }

    protected createBattleLevelSubtitle(parent: Node): void {
        const rootInfo = this.getOrCreateBattleNode(parent, 'BattleLevelSubtitle', HomeConfig.BATTLE_LEVEL_SUBTITLE_WIDTH, HomeConfig.BATTLE_LEVEL_SUBTITLE_HEIGHT, 0, HomeConfig.BATTLE_LEVEL_SUBTITLE_Y);
        const root = rootInfo.node;
        root.active = true;
        if (!rootInfo.existed) {
            (root.getComponent(UITransform) || root.addComponent(UITransform)).setContentSize(HomeConfig.BATTLE_LEVEL_SUBTITLE_WIDTH, HomeConfig.BATTLE_LEVEL_SUBTITLE_HEIGHT);
            root.setPosition(0, HomeConfig.BATTLE_LEVEL_SUBTITLE_Y, 0);
        }
        root.setSiblingIndex(4);

        const bgInfo = this.getOrCreateBattleSkinnedNode(root, 'BattleLevelSubtitleBg', HomeConfig.BATTLE_LEVEL_SUBTITLE_WIDTH, HomeConfig.BATTLE_LEVEL_SUBTITLE_HEIGHT, 0, 0, HomeConfig.UI_BATTLE_LEVEL_SUBTITLE_BG);
        const bg = bgInfo.node;
        if (!bgInfo.existed) {
            bg.setPosition(0, 0, 0);
            (bg.getComponent(UITransform) || bg.addComponent(UITransform)).setContentSize(HomeConfig.BATTLE_LEVEL_SUBTITLE_WIDTH, HomeConfig.BATTLE_LEVEL_SUBTITLE_HEIGHT);
        }
        bg.setSiblingIndex(0);
        const labelInfo = this.getOrCreateBattleLabel(root, 'BattleLevelSubtitleLabel', HomeConfig.BATTLE_LEVEL_SUBTITLE_TEXT, 22, 0, 0, HomeConfig.BATTLE_LEVEL_SUBTITLE_WIDTH - 28, HomeConfig.BATTLE_LEVEL_SUBTITLE_HEIGHT - 4, new Color(255, 239, 191, 255));
        const label = labelInfo.label;
        if (!labelInfo.existed) {
            label.fontSize = 22;
            label.color = new Color(255, 239, 191, 255);
            label.node.setPosition(0, 0, 0);
            (label.node.getComponent(UITransform) || label.node.addComponent(UITransform)).setContentSize(HomeConfig.BATTLE_LEVEL_SUBTITLE_WIDTH - 28, HomeConfig.BATTLE_LEVEL_SUBTITLE_HEIGHT - 4);
            this.applyBattleEntryTextStyle(label, 2);
        }
        label.node.setSiblingIndex(1);
    }

    protected createBattleDailyChallengeCount(parent: Node): void {
        const rootInfo = this.getOrCreateBattleNode(parent, 'BattleDailyChallengeCount', 330, 38, 0, HomeConfig.BATTLE_DAILY_CHALLENGE_COUNT_Y);
        const root = rootInfo.node;
        root.active = true;
        if (!rootInfo.existed) {
            (root.getComponent(UITransform) || root.addComponent(UITransform)).setContentSize(330, 38);
            root.setPosition(0, HomeConfig.BATTLE_DAILY_CHALLENGE_COUNT_Y, 0);
        }
        root.setSiblingIndex(4);

        const textInfo = this.getOrCreateBattleLabel(root, 'BattleDailyChallengeCountText', HomeConfig.BATTLE_DAILY_CHALLENGE_TEXT, 22, HomeConfig.BATTLE_DAILY_CHALLENGE_TEXT_X, 0, HomeConfig.BATTLE_DAILY_CHALLENGE_TEXT_WIDTH, 34, new Color(255, 232, 176, 255));
        const text = textInfo.label;
        if (!textInfo.existed) {
            text.node.setPosition(HomeConfig.BATTLE_DAILY_CHALLENGE_TEXT_X, 0, 0);
            (text.node.getComponent(UITransform) || text.node.addComponent(UITransform)).setContentSize(HomeConfig.BATTLE_DAILY_CHALLENGE_TEXT_WIDTH, 34);
            text.fontSize = 22;
            text.color = new Color(255, 232, 176, 255);
            text.horizontalAlign = HorizontalTextAlignment.RIGHT;
            this.applyBattleEntryTextStyle(text, 3);
        }
        text.node.setSiblingIndex(0);

        const valueInfo = this.getOrCreateBattleLabel(root, 'BattleDailyChallengeCountValue', HomeConfig.BATTLE_DAILY_CHALLENGE_VALUE, 22, HomeConfig.BATTLE_DAILY_CHALLENGE_VALUE_X, 0, HomeConfig.BATTLE_DAILY_CHALLENGE_VALUE_WIDTH, 34, new Color(86, 255, 75, 255));
        const value = valueInfo.label;
        if (!valueInfo.existed) {
            value.node.setPosition(HomeConfig.BATTLE_DAILY_CHALLENGE_VALUE_X, 0, 0);
            (value.node.getComponent(UITransform) || value.node.addComponent(UITransform)).setContentSize(HomeConfig.BATTLE_DAILY_CHALLENGE_VALUE_WIDTH, 34);
            value.fontSize = 22;
            value.color = new Color(86, 255, 75, 255);
            value.horizontalAlign = HorizontalTextAlignment.LEFT;
            this.applyBattleEntryTextStyle(value, 3);
        }
        value.node.setSiblingIndex(1);
    }

    protected getBattleEntryMaterials(): Array<{ icon: string; amount: string }> {
        this.ensureShopStore();
        const challengeCardCount = this.shopStore?.inventory.challenge_card || 0;
        return [
            ...HomeConfig.BATTLE_ENTRY_MATERIALS,
            { icon: HomeConfig.UI_BATTLE_TICKET_ICON, amount: `${challengeCardCount}` },
        ];
    }

    protected createBattleEntryMaterialBar(parent: Node): void {
        const barInfo = this.getOrCreateBattleNode(parent, 'BattleMaterialBar', HomeConfig.BATTLE_ENTRY_MATERIAL_BAR_WIDTH, HomeConfig.BATTLE_ENTRY_MATERIAL_BAR_HEIGHT, 0, HomeConfig.BATTLE_ENTRY_MATERIAL_BAR_Y);
        const bar = barInfo.node;
        bar.active = true;
        if (!barInfo.existed) {
            bar.setPosition(0, HomeConfig.BATTLE_ENTRY_MATERIAL_BAR_Y, 0);
        }

        const materials = this.getBattleEntryMaterials();
        const firstRowCount = Math.min(
            HomeConfig.BATTLE_ENTRY_MATERIAL_FIRST_ROW_COUNT,
            materials.length,
        );
        const rowCount = Math.ceil(materials.length / firstRowCount);
        materials.forEach((material, index) => {
            const row = index < firstRowCount ? 0 : 1;
            const rowStart = row === 0 ? 0 : firstRowCount;
            const column = index - rowStart;
            const alignedColumn = row === 0
                ? column
                : column + HomeConfig.BATTLE_ENTRY_MATERIAL_SECOND_ROW_START_COLUMN;
            const x = (alignedColumn - (firstRowCount - 1) / 2) * HomeConfig.BATTLE_ENTRY_MATERIAL_COLUMN_SPACING;
            const y = ((rowCount - 1) / 2 - row) * HomeConfig.BATTLE_ENTRY_MATERIAL_ROW_SPACING;
            const itemInfo = this.getOrCreateBattleNode(bar, `BattleMaterialItem_${index + 1}`, HomeConfig.BATTLE_ENTRY_MATERIAL_ITEM_WIDTH, HomeConfig.BATTLE_ENTRY_MATERIAL_ITEM_HEIGHT, x, y);
            const item = itemInfo.node;
            item.active = true;
            if (!itemInfo.existed) {
                item.setPosition(x, y, 0);
                (item.getComponent(UITransform) || item.addComponent(UITransform)).setContentSize(HomeConfig.BATTLE_ENTRY_MATERIAL_ITEM_WIDTH, HomeConfig.BATTLE_ENTRY_MATERIAL_ITEM_HEIGHT);
            }
            const amountBgInfo = this.getOrCreateBattleSkinnedNode(item, `BattleMaterialAmountBg_${index + 1}`, HomeConfig.BATTLE_ENTRY_MATERIAL_AMOUNT_BG_WIDTH, HomeConfig.BATTLE_ENTRY_MATERIAL_AMOUNT_BG_HEIGHT, 0, 0, HomeConfig.UI_BATTLE_MATERIAL_BAR_BG);
            const amountBg = amountBgInfo.node;
            if (!amountBgInfo.existed) {
                amountBg.setPosition(0, 0, 0);
            }
            amountBg.setSiblingIndex(0);
            const iconInfo = this.getOrCreateBattleSkinnedNode(item, `BattleMaterialIcon_${index + 1}`, HomeConfig.BATTLE_ENTRY_MATERIAL_ICON_SIZE, HomeConfig.BATTLE_ENTRY_MATERIAL_ICON_SIZE, HomeConfig.BATTLE_ENTRY_MATERIAL_ICON_X, HomeConfig.BATTLE_ENTRY_MATERIAL_ICON_Y, material.icon);
            const icon = iconInfo.node;
            if (!iconInfo.existed) {
                icon.setPosition(HomeConfig.BATTLE_ENTRY_MATERIAL_ICON_X, HomeConfig.BATTLE_ENTRY_MATERIAL_ICON_Y, 0);
            }
            icon.setSiblingIndex(1);
            const amountLabelInfo = this.getOrCreateBattleLabel(item, `BattleMaterialAmount_${index + 1}`, material.amount, 20, HomeConfig.BATTLE_ENTRY_MATERIAL_AMOUNT_LABEL_X, 1, HomeConfig.BATTLE_ENTRY_MATERIAL_AMOUNT_LABEL_WIDTH, HomeConfig.BATTLE_ENTRY_MATERIAL_AMOUNT_BG_HEIGHT, Color.WHITE);
            const amountLabel = amountLabelInfo.label;
            if (!amountLabelInfo.existed) {
                amountLabel.node.setPosition(HomeConfig.BATTLE_ENTRY_MATERIAL_AMOUNT_LABEL_X, 1, 0);
                (amountLabel.node.getComponent(UITransform) || amountLabel.node.addComponent(UITransform)).setContentSize(HomeConfig.BATTLE_ENTRY_MATERIAL_AMOUNT_LABEL_WIDTH, HomeConfig.BATTLE_ENTRY_MATERIAL_AMOUNT_BG_HEIGHT);
                amountLabel.horizontalAlign = HorizontalTextAlignment.CENTER;
                this.applyBattleEntryTextStyle(amountLabel, 2);
            }
            amountLabel.node.setSiblingIndex(2);
        });
        bar.children.forEach((child) => {
            const match = /^BattleMaterialItem_(\d+)$/.exec(child.name);
            if (match && Number(match[1]) > materials.length) {
                child.active = false;
            }
        });
    }

    protected createBattleEntryActionButtons(parent: Node): void {
        const buttonRootInfo = this.getOrCreateBattleNode(parent, 'BattleActionButtons', HomeConfig.VIEW_WIDTH, HomeConfig.BATTLE_ENTRY_ACTION_BUTTON_HEIGHT, 0, HomeConfig.BATTLE_ENTRY_ACTION_BUTTON_Y);
        const buttonRoot = buttonRootInfo.node;
        buttonRoot.active = true;
        if (!buttonRootInfo.existed) {
            buttonRoot.setPosition(0, HomeConfig.BATTLE_ENTRY_ACTION_BUTTON_Y, 0);
        }
        const configs = [
            { name: 'BattleUpgradeButton', text: '\u5347\u7ea7\u6218\u573a', x: -HomeConfig.BATTLE_ENTRY_ACTION_BUTTON_SPACING, ticketCost: '', onClick: () => this.openBattleUpgradePopup() },
            { name: 'BattleChallengeButton', text: '\u7acb\u5373\u6311\u6218', x: 0, ticketCost: `x${HomeConfig.BATTLE_CHALLENGE_TICKET_COST}`, onClick: () => this.openBattleChallengeConfirmPopup() },
            { name: 'BattleTargetChallengeButton', text: '\u5b9a\u5411\u6311\u6218', x: HomeConfig.BATTLE_ENTRY_ACTION_BUTTON_SPACING, ticketCost: `x${HomeConfig.BATTLE_TARGET_CHALLENGE_TICKET_COST}`, onClick: () => this.openBattleTargetChallengePopup() },
        ];

        configs.forEach((config) => {
            const buttonInfo = this.getOrCreateBattleSkinnedNode(buttonRoot, config.name, HomeConfig.BATTLE_ENTRY_ACTION_BUTTON_WIDTH, HomeConfig.BATTLE_ENTRY_ACTION_BUTTON_HEIGHT, config.x, 0, HomeConfig.UI_BATTLE_ACTION_BUTTON_BG);
            const button = buttonInfo.node;
            button.active = true;
            if (!buttonInfo.existed) {
                button.setPosition(config.x, 0, 0);
            }
            if (config.ticketCost.length > 0) {
                this.createBattleTicketCost(buttonRoot, `${config.name}TicketCost`, config.ticketCost, config.x);
            }
            const labelInfo = this.getOrCreateBattleLabel(button, `${config.name}Label`, config.text, 25, 8, -5, HomeConfig.BATTLE_ENTRY_ACTION_BUTTON_WIDTH - 36, HomeConfig.BATTLE_ENTRY_ACTION_BUTTON_HEIGHT - 20, new Color(255, 238, 171, 255));
            const label = labelInfo.label;
            if (!labelInfo.existed) {
                label.fontSize = 25;
                label.color = new Color(255, 238, 171, 255);
                this.applyBattleEntryTextStyle(label, 2);
            }
            this.bindScaledClick(button, config.onClick);
            if (config.name === 'BattleChallengeButton') {
                this.battleChallengeButton = button;
            }
        });
    }

    protected createBattleChallengeLimitHint(parent: Node): void {
        const remainInfo = this.getOrCreateBattleLabel(parent, 'BattleChallengeRemainLabel', HomeConfig.BATTLE_CHALLENGE_REMAIN_TEXT, 22, 0, HomeConfig.BATTLE_CHALLENGE_REMAIN_Y, 280, 34, new Color(255, 58, 39, 255));
        const remain = remainInfo.label;
        if (!remainInfo.existed) {
            (remain.node.getComponent(UITransform) || remain.node.addComponent(UITransform)).setContentSize(280, 34);
            remain.fontSize = 22;
            remain.color = new Color(255, 58, 39, 255);
            remain.horizontalAlign = HorizontalTextAlignment.CENTER;
            this.applyBattleEntryTextStyle(remain, 3);
        }
        remain.node.setSiblingIndex(8);

        const freeTimeInfo = this.getOrCreateBattleLabel(parent, 'BattleChallengeFreeTimeLabel', HomeConfig.BATTLE_CHALLENGE_FREE_TIME_TEXT, 20, 0, HomeConfig.BATTLE_CHALLENGE_FREE_TIME_Y, 430, 34, new Color(255, 58, 39, 255));
        const freeTime = freeTimeInfo.label;
        if (!freeTimeInfo.existed) {
            (freeTime.node.getComponent(UITransform) || freeTime.node.addComponent(UITransform)).setContentSize(430, 34);
            freeTime.fontSize = 20;
            freeTime.color = new Color(255, 58, 39, 255);
            freeTime.horizontalAlign = HorizontalTextAlignment.CENTER;
            this.applyBattleEntryTextStyle(freeTime, 3);
        }
        freeTime.node.setSiblingIndex(9);
    }

    protected createBattleTicketCost(parent: Node, name: string, amount: string, buttonX: number): void {
        const costRootInfo = this.getOrCreateBattleNode(parent, name, HomeConfig.BATTLE_ENTRY_TICKET_COST_WIDTH, HomeConfig.BATTLE_ENTRY_TICKET_COST_HEIGHT, buttonX + HomeConfig.BATTLE_ENTRY_TICKET_COST_OFFSET_X, HomeConfig.BATTLE_ENTRY_TICKET_COST_Y);
        const costRoot = costRootInfo.node;
        costRoot.active = true;
        if (!costRootInfo.existed) {
            costRoot.setPosition(buttonX + HomeConfig.BATTLE_ENTRY_TICKET_COST_OFFSET_X, HomeConfig.BATTLE_ENTRY_TICKET_COST_Y, 0);
        }
        this.getOrCreateBattleSkinnedNode(costRoot, `${name}Icon`, HomeConfig.BATTLE_ENTRY_TICKET_ICON_SIZE, HomeConfig.BATTLE_ENTRY_TICKET_ICON_SIZE, HomeConfig.BATTLE_ENTRY_TICKET_ICON_X, 1, HomeConfig.UI_BATTLE_TICKET_ICON).node.setSiblingIndex(0);
        const amountLabelInfo = this.getOrCreateBattleLabel(costRoot, `${name}Amount`, amount, 18, HomeConfig.BATTLE_ENTRY_TICKET_AMOUNT_LABEL_X, 1, HomeConfig.BATTLE_ENTRY_TICKET_AMOUNT_LABEL_WIDTH, 28, Color.WHITE);
        const amountLabel = amountLabelInfo.label;
        if (!amountLabelInfo.existed) {
            amountLabel.fontSize = 18;
            amountLabel.color = Color.WHITE;
            amountLabel.horizontalAlign = HorizontalTextAlignment.CENTER;
            this.applyBattleEntryTextStyle(amountLabel, 2);
        }
        amountLabel.node.setSiblingIndex(1);
    }
}
