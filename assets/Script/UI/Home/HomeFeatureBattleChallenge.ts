import {
    Color,
    EventTouch,
    Graphics,
    HorizontalTextAlignment,
    Label,
    Node,
    Overflow,
    UITransform,
    VerticalTextAlignment,
} from 'cc';
import { type BagIllustrationCatalogItem } from './BagIllustrationCatalog.generated';
import * as HomeConfig from './HomeConfig';
import { HomeViewBase } from './HomeViewBase';

abstract class HomeFeatureBattleChallengeHost extends HomeViewBase {
    protected abstract battleTargetChallengePopup: Node | null;
    protected abstract battleTargetChallengeBoard: Node | null;
    protected abstract battleTargetChallengeTitleLabel: Label | null;
    protected abstract battleTargetChallengeContentRoot: Node | null;
    protected abstract battleTargetChallengeConfirmLabel: Label | null;
    protected abstract battleTargetChallengeSelected: string;
    protected abstract battleTargetChallengeMode: 'select' | 'confirm';
    protected abstract battleChallengeConfirmType: 'normal' | 'target' | 'host';
    protected abstract setLabelOutline(label: Label, color: Color, width: number): void;
    protected abstract getBattleRewardItems(): Array<{ item: BagIllustrationCatalogItem; amount: string }>;
}

/**
 * Owns normal, targeted and hosted Battle challenge confirmation flows.
 */
export abstract class HomeFeatureBattleChallenge extends HomeFeatureBattleChallengeHost {
    protected openBattleChallengeConfirmPopup(): void {
        const popup = this.ensureBattleTargetChallengePopup();
        this.battleTargetChallengeSelected = '';
        this.battleTargetChallengeMode = 'confirm';
        this.battleChallengeConfirmType = 'normal';
        this.refreshBattleTargetChallengePopup();
        popup.active = true;
        this.ensureInputBlocker(popup);
        popup.setSiblingIndex((popup.parent?.children.length || 1) - 1);
    }

    protected openBattleTargetChallengePopup(): void {
        const popup = this.ensureBattleTargetChallengePopup();
        this.battleTargetChallengeSelected = '';
        this.battleTargetChallengeMode = 'select';
        this.battleChallengeConfirmType = 'target';
        this.refreshBattleTargetChallengePopup();
        popup.active = true;
        this.ensureInputBlocker(popup);
        popup.setSiblingIndex((popup.parent?.children.length || 1) - 1);
    }

    protected openBattleAutoHostConfirmPopup(): void {
        const popup = this.ensureBattleTargetChallengePopup();
        this.battleTargetChallengeSelected = '';
        this.battleTargetChallengeMode = 'confirm';
        this.battleChallengeConfirmType = 'host';
        this.refreshBattleTargetChallengePopup();
        popup.active = true;
        this.ensureInputBlocker(popup);
        popup.setSiblingIndex((popup.parent?.children.length || 1) - 1);
    }

    protected closeBattleTargetChallengePopup(): void {
        if (!this.battleTargetChallengePopup?.isValid) {
            this.battleTargetChallengePopup = this.battlePanel?.getChildByName('BattleTargetChallengePopup') || null;
        }
        if (!this.battleTargetChallengePopup?.isValid) return;

        this.battleTargetChallengePopup.active = false;
    }

    protected ensureBattleTargetChallengePopup(): Node {
        if (!this.battlePanel) {
            throw new Error('BattlePanel is not ready');
        }

        const popupInfo = this.getOrCreateBattleNode(this.battlePanel, 'BattleTargetChallengePopup', HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT, 0, 0);
        const popup = popupInfo.node;
        this.battleTargetChallengePopup = popup;
        if (!popupInfo.existed) {
            popup.setPosition(0, 0, 0);
            (popup.getComponent(UITransform) || popup.addComponent(UITransform)).setContentSize(HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT);
            popup.active = false;
        }
        if (!popup.getComponent(Graphics)) {
            this.drawRect(popup, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT, new Color(0, 0, 0, 130));
        }
        popup.off(Node.EventType.TOUCH_END);
        popup.on(Node.EventType.TOUCH_END, (event: EventTouch) => {
            event.propagationStopped = true;
            this.closeBattleTargetChallengePopup();
        }, this);

        const boardInfo = this.getOrCreateBattleNode(
            popup,
            'BattleTargetChallengeBoard',
            HomeConfig.BATTLE_TARGET_CHALLENGE_POPUP_WIDTH,
            HomeConfig.BATTLE_TARGET_CHALLENGE_POPUP_HEIGHT,
            0,
            0,
        );
        const board = boardInfo.node;
        this.battleTargetChallengeBoard = board;
        board.active = true;
        if (!boardInfo.existed) {
            board.setPosition(0, 0, 0);
        }
        board.off(Node.EventType.TOUCH_END);
        board.on(Node.EventType.TOUCH_END, (event: EventTouch) => {
            event.propagationStopped = true;
        }, this);

        this.getOrCreateBattleSkinnedNode(
            board,
            'BattleTargetChallengeBoardSkin',
            HomeConfig.BATTLE_TARGET_CHALLENGE_POPUP_WIDTH,
            HomeConfig.BATTLE_TARGET_CHALLENGE_POPUP_HEIGHT,
            0,
            0,
            HomeConfig.UI_CONFIRM_POPUP_BG,
        ).node.setSiblingIndex(0);

        this.getOrCreateBattleSkinnedNode(
            board,
            'BattleTargetChallengeTitleSkin',
            HomeConfig.BATTLE_TARGET_CHALLENGE_TITLE_WIDTH,
            HomeConfig.BATTLE_TARGET_CHALLENGE_TITLE_HEIGHT,
            0,
            HomeConfig.BATTLE_TARGET_CHALLENGE_TITLE_Y,
            HomeConfig.UI_CONFIRM_TITLE_BG,
        ).node.setSiblingIndex(1);

        const title = this.getOrCreateBattleLabel(
            board,
            'BattleTargetChallengeTitle',
            '\u9009\u62e9',
            30,
            0,
            HomeConfig.BATTLE_TARGET_CHALLENGE_TITLE_Y + 3,
            280,
            52,
            new Color(126, 74, 36, 255),
        ).label;
        this.battleTargetChallengeTitleLabel = title;
        title.fontSize = 30;
        title.lineHeight = 38;
        title.color = new Color(126, 74, 36, 255);
        title.overflow = Overflow.SHRINK;
        this.setLabelOutline(title, new Color(255, 245, 215, 255), 2);
        title.node.setSiblingIndex(2);

        this.createBattleTargetChallengeOptions(board);
        this.createBattleTargetChallengeConfirmMessage(board);
        this.createBattleTargetChallengeActionButtons(board);
        this.refreshBattleTargetChallengePopup();
        return popup;
    }

    protected createBattleTargetChallengeOptions(parent: Node): void {
        const rootInfo = this.getOrCreateBattleNode(
            parent,
            'BattleTargetChallengeContentRoot',
            HomeConfig.BATTLE_TARGET_CHALLENGE_CONTENT_WIDTH,
            HomeConfig.BATTLE_TARGET_CHALLENGE_CONTENT_HEIGHT,
            0,
            HomeConfig.BATTLE_TARGET_CHALLENGE_CONTENT_Y,
        );
        const root = rootInfo.node;
        this.battleTargetChallengeContentRoot = root;
        root.active = true;
        if (!rootInfo.existed) {
            root.setPosition(0, HomeConfig.BATTLE_TARGET_CHALLENGE_CONTENT_Y, 0);
        }
        root.setSiblingIndex(3);

        const startY = ((HomeConfig.BATTLE_TARGET_CHALLENGE_OPTIONS.length - 1) / 2) * HomeConfig.BATTLE_TARGET_CHALLENGE_OPTION_GAP;
        HomeConfig.BATTLE_TARGET_CHALLENGE_OPTIONS.forEach((option, index) => {
            const y = startY - index * HomeConfig.BATTLE_TARGET_CHALLENGE_OPTION_GAP;
            const rowInfo = this.getOrCreateBattleNode(
                root,
                `BattleTargetChallengeOption_${index + 1}`,
                HomeConfig.BATTLE_TARGET_CHALLENGE_OPTION_WIDTH,
                HomeConfig.BATTLE_TARGET_CHALLENGE_OPTION_HEIGHT,
                0,
                y,
            );
            const row = rowInfo.node;
            row.active = true;
            if (!rowInfo.existed) {
                row.setPosition(0, y, 0);
            }
            row.setSiblingIndex(index);
    
            const selectedBg = this.getOrCreateBattleNode(
                row,
                `BattleTargetChallengeSelectedBg_${index + 1}`,
                HomeConfig.BATTLE_TARGET_CHALLENGE_SELECTED_BG_WIDTH,
                HomeConfig.BATTLE_TARGET_CHALLENGE_SELECTED_BG_HEIGHT,
                HomeConfig.BATTLE_TARGET_CHALLENGE_SELECTED_BG_X,
                0,
            ).node;
            selectedBg.setPosition(HomeConfig.BATTLE_TARGET_CHALLENGE_SELECTED_BG_X, 0, 0);
            selectedBg.active = false;
            selectedBg.setSiblingIndex(0);

            const label = this.getOrCreateBattleLabel(
                row,
                `BattleTargetChallengeOptionLabel_${index + 1}`,
                option,
                28,
                HomeConfig.BATTLE_TARGET_CHALLENGE_SELECTED_BG_X,
                0,
                HomeConfig.BATTLE_TARGET_CHALLENGE_SELECTED_BG_WIDTH,
                48,
                new Color(107, 75, 46, 255),
            ).label;
            label.node.setPosition(HomeConfig.BATTLE_TARGET_CHALLENGE_SELECTED_BG_X, 0, 0);
            label.fontSize = 28;
            label.lineHeight = 36;
            label.color = new Color(107, 75, 46, 255);
            label.horizontalAlign = HorizontalTextAlignment.CENTER;
            label.verticalAlign = VerticalTextAlignment.CENTER;
            this.setLabelOutline(label, new Color(255, 246, 220, 255), 1);
            label.node.setSiblingIndex(1);

            const legacyCheckbox = row.getChildByName(`BattleTargetChallengeCheckbox_${index + 1}`);
            if (legacyCheckbox?.isValid) {
                legacyCheckbox.active = false;
            }

            this.bindScaledClick(row, () => this.selectBattleTargetChallengeOption(option));
        });
    }

    protected createBattleTargetChallengeConfirmMessage(parent: Node): void {
        const message = this.getOrCreateBattleLabel(
            parent,
            'BattleTargetChallengeConfirmMessage',
            '',
            28,
            0,
            HomeConfig.BATTLE_TARGET_CHALLENGE_MESSAGE_Y,
            HomeConfig.BATTLE_TARGET_CHALLENGE_MESSAGE_WIDTH,
            HomeConfig.BATTLE_TARGET_CHALLENGE_MESSAGE_HEIGHT,
            new Color(107, 75, 46, 255),
        ).label;
        this.battleTargetChallengeConfirmLabel = message;
        message.fontSize = 28;
        message.lineHeight = 40;
        message.color = new Color(107, 75, 46, 255);
        message.horizontalAlign = HorizontalTextAlignment.CENTER;
        message.verticalAlign = VerticalTextAlignment.CENTER;
        message.enableWrapText = true;
        message.overflow = Overflow.SHRINK;
        this.setLabelOutline(message, new Color(255, 246, 220, 255), 1);
        message.node.setSiblingIndex(4);
    }

    protected createBattleTargetChallengeActionButtons(parent: Node): void {
        const configs = [
            {
                name: 'BattleTargetChallengeCancelButton',
                labelName: 'BattleTargetChallengeCancelButtonLabel',
                text: '\u53d6\u6d88',
                x: -HomeConfig.BATTLE_TARGET_CHALLENGE_BUTTON_X,
                onClick: () => this.closeBattleTargetChallengePopup(),
            },
            {
                name: 'BattleTargetChallengeConfirmButton',
                labelName: 'BattleTargetChallengeConfirmButtonLabel',
                text: '\u786e\u5b9a',
                x: HomeConfig.BATTLE_TARGET_CHALLENGE_BUTTON_X,
                onClick: () => this.handleBattleTargetChallengeConfirm(),
            },
        ];

        configs.forEach((config, index) => {
            const button = this.getOrCreateBattleSkinnedNode(
                parent,
                config.name,
                HomeConfig.BATTLE_TARGET_CHALLENGE_BUTTON_WIDTH,
                HomeConfig.BATTLE_TARGET_CHALLENGE_BUTTON_HEIGHT,
                config.x,
                HomeConfig.BATTLE_TARGET_CHALLENGE_BUTTON_Y,
                HomeConfig.UI_BATTLE_ACTION_BUTTON_BG,
            ).node;
            button.active = true;
            button.setSiblingIndex(5 + index);

            const label = this.getOrCreateBattleLabel(
                button,
                config.labelName,
                config.text,
                31,
                0,
                1,
                124,
                42,
                new Color(255, 238, 218, 255),
            ).label;
            label.fontSize = 31;
            label.lineHeight = 38;
            label.color = new Color(255, 238, 218, 255);
            this.setLabelOutline(label, new Color(94, 36, 35, 255), 2);
            label.node.setSiblingIndex(1);
            this.bindScaledClick(button, config.onClick);
        });
    }

    protected selectBattleTargetChallengeOption(option: string): void {
        this.battleTargetChallengeSelected = option;
        this.battleTargetChallengeMode = 'select';
        this.refreshBattleTargetChallengePopup();
    }

    protected refreshBattleTargetChallengePopup(): void {
        if (this.battleTargetChallengeTitleLabel?.isValid) {
            this.battleTargetChallengeTitleLabel.string = this.battleTargetChallengeMode === 'select'
                ? '\u9009\u62e9'
                : '\u7cfb\u7edf\u63d0\u793a';
        }

        if (this.battleTargetChallengeContentRoot?.isValid) {
            this.battleTargetChallengeContentRoot.active = this.battleTargetChallengeMode === 'select';
            HomeConfig.BATTLE_TARGET_CHALLENGE_OPTIONS.forEach((option, index) => {
                const row = this.battleTargetChallengeContentRoot?.getChildByName(`BattleTargetChallengeOption_${index + 1}`);
                const selectedBg = row?.getChildByName(`BattleTargetChallengeSelectedBg_${index + 1}`);
                const legacyCheckbox = row?.getChildByName(`BattleTargetChallengeCheckbox_${index + 1}`);
                const isSelected = this.battleTargetChallengeSelected === option;
                if (selectedBg?.isValid) {
                    selectedBg.setPosition(HomeConfig.BATTLE_TARGET_CHALLENGE_SELECTED_BG_X, 0, 0);
                    selectedBg.active = isSelected;
                    if (isSelected) {
                        this.applyUiSkinKeepingEditorSize(
                            selectedBg,
                            HomeConfig.UI_BATTLE_TARGET_OPTION_SELECTED_BG,
                            HomeConfig.BATTLE_TARGET_CHALLENGE_SELECTED_BG_WIDTH,
                            HomeConfig.BATTLE_TARGET_CHALLENGE_SELECTED_BG_HEIGHT,
                        );
                    } else {
                        this.skinApplyVersions.set(selectedBg, ++this.skinApplyVersion);
                    }
                }
                if (legacyCheckbox?.isValid) {
                    legacyCheckbox.active = false;
                }
            });
        }

        if (this.battleTargetChallengeConfirmLabel?.isValid) {
            const isConfirm = this.battleTargetChallengeMode === 'confirm';
            this.battleTargetChallengeConfirmLabel.node.active = isConfirm;
            this.battleTargetChallengeConfirmLabel.string = isConfirm
                ? this.getBattleChallengeConfirmMessage()
                : '';
        }
    }

    protected getBattleChallengeConfirmMessage(): string {
        if (this.battleChallengeConfirmType === 'normal') {
            return `\u662f\u5426\u82b1\u8d39${HomeConfig.BATTLE_CHALLENGE_TICKET_COST}\u6311\u6218\u5361\u8fdb\u884c\u6311\u6218`;
        }
        if (this.battleChallengeConfirmType === 'host') {
            return '\u662f\u5426\u6258\u7ba1\uff08\u6258\u7ba1\u540e\u6218\u573a\u4ea7\u51fa\u6750\u6599\u5c06\u901a\u8fc7\u90ae\u4ef6\u53d1\u9001\uff09';
        }

        return `\u662f\u5426\u82b1\u8d39${HomeConfig.BATTLE_TARGET_CHALLENGE_TICKET_COST}\u6311\u6218\u5361\u5e76\u9009\u62e9${this.battleTargetChallengeSelected}\u4ea7\u51fa\u8fdb\u884c\u5b9a\u5411\u6311\u6218`;
    }

    protected handleBattleTargetChallengeConfirm(): void {
        if (this.battleTargetChallengeMode === 'select') {
            if (!this.battleTargetChallengeSelected) {
                this.showToast('\u8bf7\u5148\u9009\u62e9\u5b9a\u5411\u4ea7\u51fa');
                return;
            }
            this.battleTargetChallengeMode = 'confirm';
            this.refreshBattleTargetChallengePopup();
            return;
        }

        if (this.battleChallengeConfirmType === 'host') {
            this.confirmBattleAutoHost();
            return;
        }

        this.closeBattleTargetChallengePopup();
        void this.startBattleChallenge();
    }

    protected confirmBattleAutoHost(): void {
        const rewards = this.getBattleRewardItems();
        this.closeBattleTargetChallengePopup();
        this.stopBattleChallengeSequence();
        this.queueBattleHostedRewards(rewards);
        this.resetBattlePanelToEntry();
        this.playBattleBackgroundAnimation();
        this.showToast('\u6258\u7ba1\u5df2\u5b8c\u6210\uff0c\u5956\u52b1\u5df2\u53d1\u9001\u81f3\u90ae\u4ef6');
    }

    protected queueBattleHostedRewards(_rewards: Array<{ item: BagIllustrationCatalogItem; amount: string }>): void {
        // HomeFeatureMailData overrides this hook to create the actual mail entry.
    }
}
