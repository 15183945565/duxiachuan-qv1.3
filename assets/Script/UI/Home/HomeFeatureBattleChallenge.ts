import {
    Color,
    EventTouch,
    Graphics,
    HorizontalTextAlignment,
    Label,
    Node,
    Overflow,
    Sprite,
    SpriteFrame,
    Texture2D,
    UITransform,
    VerticalTextAlignment,
    sys,
} from 'cc';
import { type BagIllustrationCatalogItem } from './BagIllustrationCatalog.generated';
import * as HomeConfig from './HomeConfig';
import { type BattleAutoHostState, type MailReward } from './HomeTypes';
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
    protected abstract queueBattleHostedMailRewards(rewards: MailReward[]): void;
}

/**
 * Owns normal, targeted and hosted Battle challenge confirmation flows.
 */
export abstract class HomeFeatureBattleChallenge extends HomeFeatureBattleChallengeHost {
    protected openBattleChallengeConfirmPopup(): void {
        if (!this.canEnterBattleChallenge(true)) return;

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
        if (!this.canEnterBattleChallenge(true)) return;

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
        if (this.completeDueBattleAutoHostIfNeeded(false)) {
            return;
        }
        const existingState = this.loadBattleAutoHostState();
        if (existingState) {
            this.showToast(`\u6218\u573a\u6258\u7ba1\u4e2d\uff0c\u5269\u4f59${this.formatBattleAutoHostRemainTime(existingState.finishTime)}`);
            this.refreshBattleAutoHostEntryState();
            return;
        }

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
            HomeConfig.SHARED_CONFIRM_BOARD_WIDTH,
            HomeConfig.SHARED_CONFIRM_BOARD_HEIGHT,
            0,
            0,
            HomeConfig.UI_CONFIRM_POPUP_BG,
        ).node.setSiblingIndex(0);

        const titleSkin = this.getOrCreateBattleNode(
            board,
            'BattleTargetChallengeTitleSkin',
            HomeConfig.SHARED_CONFIRM_TITLE_WIDTH,
            HomeConfig.SHARED_CONFIRM_TITLE_HEIGHT,
            0,
            HomeConfig.SHARED_CONFIRM_TITLE_Y,
        ).node;
        titleSkin.active = false;
        titleSkin.setSiblingIndex(1);

        const title = this.getOrCreateBattleLabel(
            board,
            'BattleTargetChallengeTitle',
            '\u9009\u62e9',
            HomeConfig.SHARED_CONFIRM_TITLE_FONT_SIZE,
            0,
            HomeConfig.SHARED_CONFIRM_TITLE_Y,
            HomeConfig.SHARED_CONFIRM_TITLE_LABEL_WIDTH,
            HomeConfig.SHARED_CONFIRM_TITLE_LABEL_HEIGHT,
            new Color(126, 74, 36, 255),
        ).label;
        this.battleTargetChallengeTitleLabel = title;
        title.fontSize = HomeConfig.SHARED_CONFIRM_TITLE_FONT_SIZE;
        title.lineHeight = HomeConfig.SHARED_CONFIRM_TITLE_LINE_HEIGHT;
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
                x: HomeConfig.SHARED_CONFIRM_CANCEL_BUTTON_X,
                onClick: () => this.closeBattleTargetChallengePopup(),
            },
            {
                name: 'BattleTargetChallengeConfirmButton',
                labelName: 'BattleTargetChallengeConfirmButtonLabel',
                text: '\u786e\u5b9a',
                x: HomeConfig.SHARED_CONFIRM_ACCEPT_BUTTON_X,
                onClick: () => this.handleBattleTargetChallengeConfirm(),
            },
        ];

        configs.forEach((config, index) => {
            const button = this.getOrCreateBattleSkinnedNode(
                parent,
                config.name,
                HomeConfig.SHARED_CONFIRM_BUTTON_WIDTH,
                HomeConfig.SHARED_CONFIRM_BUTTON_HEIGHT,
                config.x,
                HomeConfig.SHARED_CONFIRM_BUTTON_Y,
                HomeConfig.UI_BATTLE_ACTION_BUTTON_BG,
            ).node;
            button.active = true;
            button.setSiblingIndex(5 + index);

            const label = this.getOrCreateBattleLabel(
                button,
                config.labelName,
                config.text,
                HomeConfig.SHARED_CONFIRM_BUTTON_FONT_SIZE,
                0,
                HomeConfig.SHARED_CONFIRM_BUTTON_LABEL_Y,
                HomeConfig.SHARED_CONFIRM_BUTTON_LABEL_WIDTH,
                HomeConfig.SHARED_CONFIRM_BUTTON_LABEL_HEIGHT,
                new Color(255, 238, 218, 255),
            ).label;
            label.fontSize = HomeConfig.SHARED_CONFIRM_BUTTON_FONT_SIZE;
            label.lineHeight = HomeConfig.SHARED_CONFIRM_BUTTON_LINE_HEIGHT;
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
            return '\u662f\u5426\u5f00\u59cb\u6258\u7ba1\uff1f\u6258\u7ba1\u5b8c\u6210\u540e\u6218\u573a\u4ea7\u51fa\u6750\u6599\u5c06\u901a\u8fc7\u90ae\u4ef6\u53d1\u9001';
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

        if (!this.canEnterBattleChallenge(true)) {
            this.closeBattleTargetChallengePopup();
            return;
        }

        this.closeBattleTargetChallengePopup();
        void this.startBattleChallenge();
    }

    protected confirmBattleAutoHost(): void {
        const rewards = this.getBattleRewardItems();
        const remainingSeconds = this.getBattleAutoHostRemainingSeconds();
        const now = Math.floor(Date.now() / 1000);
        const state: BattleAutoHostState = {
            id: `battle_auto_host_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
            startTime: now,
            finishTime: now + Math.ceil(remainingSeconds),
            rewards: rewards.map((reward) => ({
                name: reward.item.name,
                count: reward.amount,
                itemId: reward.item.id,
                iconPath: reward.item.iconPath,
                framePath: reward.item.framePath,
            })),
        };

        this.closeBattleTargetChallengePopup();
        this.stopBattleChallengeSequence();
        this.saveBattleAutoHostState(state);
        this.resetBattlePanelToEntry();
        this.playBattleBackgroundAnimation();
        this.refreshBattleAutoHostEntryState();
        this.showToast(`\u6258\u7ba1\u5df2\u5f00\u59cb\uff0c${this.formatBattleAutoHostRemainTime(state.finishTime)}\u540e\u53ef\u5728\u90ae\u4ef6\u9886\u53d6`);
    }

    protected canEnterBattleChallenge(showToast = true): boolean {
        this.completeDueBattleAutoHostIfNeeded(false);
        const state = this.loadBattleAutoHostState();
        if (!state) return true;

        if (showToast) {
            this.showToast(`\u6218\u573a\u6258\u7ba1\u4e2d\uff0c\u5269\u4f59${this.formatBattleAutoHostRemainTime(state.finishTime)}`);
        }
        this.refreshBattleAutoHostEntryState();
        return false;
    }

    protected refreshBattleAutoHostEntryState(): void {
        this.completeDueBattleAutoHostIfNeeded(false);
        const state = this.loadBattleAutoHostState();
        const indicator = this.ensureBattleAutoHostIndicator();
        if (!indicator?.isValid) return;

        indicator.active = !!state;
        if (!state) return;

        this.applyBattleAutoHostIndicatorFrame();
        this.ensureBattleAutoHostIndicatorFrames();
    }

    protected updateBattleAutoHostIndicator(deltaTime: number): void {
        this.battleAutoHostCheckTimer -= deltaTime;
        if (this.battleAutoHostCheckTimer <= 0) {
            this.battleAutoHostCheckTimer = 0.5;
            if (this.completeDueBattleAutoHostIfNeeded(true)) {
                this.refreshBattleAutoHostEntryState();
                return;
            }
        }

        if (!this.battleAutoHostIndicator?.active || this.battleAutoHostIndicatorFrames.length <= 1) return;
        const sprite = this.battleAutoHostIndicator.getComponent(Sprite);
        if (!sprite) return;

        this.battleAutoHostIndicatorFrameTimer += deltaTime;
        if (this.battleAutoHostIndicatorFrameTimer < HomeConfig.BATTLE_AUTO_HOSTING_FRAME_INTERVAL) return;

        this.battleAutoHostIndicatorFrameTimer = 0;
        this.battleAutoHostIndicatorFrameIndex = (this.battleAutoHostIndicatorFrameIndex + 1) % this.battleAutoHostIndicatorFrames.length;
        sprite.spriteFrame = this.battleAutoHostIndicatorFrames[this.battleAutoHostIndicatorFrameIndex];
    }

    protected completeDueBattleAutoHostIfNeeded(showToast = false): boolean {
        const state = this.loadBattleAutoHostState();
        if (!state) return false;

        const now = Math.floor(Date.now() / 1000);
        if (now < state.finishTime) return false;

        this.clearBattleAutoHostState();
        this.queueBattleHostedMailRewards(state.rewards);
        if (showToast) {
            this.showToast('\u6258\u7ba1\u5df2\u5b8c\u6210\uff0c\u5956\u52b1\u5df2\u53d1\u9001\u81f3\u90ae\u4ef6');
        }
        return true;
    }

    protected loadBattleAutoHostState(): BattleAutoHostState | null {
        if (this.battleAutoHostState) return this.battleAutoHostState;

        const raw = sys.localStorage.getItem(HomeConfig.BATTLE_AUTO_HOST_STATE_KEY);
        if (!raw) return null;

        try {
            const parsed = JSON.parse(raw) as BattleAutoHostState;
            if (!parsed || typeof parsed.finishTime !== 'number' || !Array.isArray(parsed.rewards)) {
                sys.localStorage.removeItem(HomeConfig.BATTLE_AUTO_HOST_STATE_KEY);
                sys.localStorage.removeItem(HomeConfig.BATTLE_AUTO_HOST_MAIL_BACKUP_KEY);
                return null;
            }

            this.battleAutoHostState = {
                id: parsed.id || `battle_auto_host_${Date.now()}`,
                startTime: typeof parsed.startTime === 'number' ? parsed.startTime : Math.floor(Date.now() / 1000),
                finishTime: parsed.finishTime,
                rewards: parsed.rewards.map((reward) => ({
                    name: reward.name || '',
                    count: reward.count || '0',
                    itemId: reward.itemId || '',
                    iconPath: reward.iconPath || '',
                    framePath: reward.framePath || '',
                })),
            };
            return this.battleAutoHostState;
        } catch (error) {
            console.warn('[MainHomeView] invalid battle auto host state', error);
            sys.localStorage.removeItem(HomeConfig.BATTLE_AUTO_HOST_STATE_KEY);
            sys.localStorage.removeItem(HomeConfig.BATTLE_AUTO_HOST_MAIL_BACKUP_KEY);
            return null;
        }
    }

    protected saveBattleAutoHostState(state: BattleAutoHostState): void {
        this.battleAutoHostState = state;
        const raw = JSON.stringify(state);
        sys.localStorage.setItem(HomeConfig.BATTLE_AUTO_HOST_STATE_KEY, raw);
        sys.localStorage.setItem(HomeConfig.BATTLE_AUTO_HOST_MAIL_BACKUP_KEY, raw);
    }

    protected clearBattleAutoHostState(removeMailBackup = false): void {
        this.battleAutoHostState = null;
        sys.localStorage.removeItem(HomeConfig.BATTLE_AUTO_HOST_STATE_KEY);
        if (removeMailBackup) {
            sys.localStorage.removeItem(HomeConfig.BATTLE_AUTO_HOST_MAIL_BACKUP_KEY);
        }
    }

    protected getBattleAutoHostRemainingSeconds(): number {
        const currentWave = this.clamp(
            this.battleCurrentWave > 0 ? this.battleCurrentWave : 1,
            1,
            HomeConfig.BATTLE_WAVE_TOTAL,
        );
        const elapsedSeconds = this.battleWaveStartTimeMs > 0
            ? Math.max(0, (Date.now() - this.battleWaveStartTimeMs) / 1000)
            : 0;
        const waveWrapSeconds = HomeConfig.BATTLE_WAVE_DEATH_FALLBACK_DURATION
            + (currentWave < HomeConfig.BATTLE_WAVE_TOTAL ? HomeConfig.BATTLE_WAVE_NEXT_DELAY : 0);
        const currentWaveRemaining = this.battleWaveEnding
            ? Math.max(0, waveWrapSeconds - Math.max(0, elapsedSeconds - HomeConfig.BATTLE_WAVE_DURATION))
            : Math.max(0, HomeConfig.BATTLE_WAVE_DURATION - elapsedSeconds) + waveWrapSeconds;
        let futureWaveRemaining = 0;
        for (let wave = currentWave + 1; wave <= HomeConfig.BATTLE_WAVE_TOTAL; wave += 1) {
            futureWaveRemaining += HomeConfig.BATTLE_WAVE_DURATION + HomeConfig.BATTLE_WAVE_DEATH_FALLBACK_DURATION;
            if (wave < HomeConfig.BATTLE_WAVE_TOTAL) {
                futureWaveRemaining += HomeConfig.BATTLE_WAVE_NEXT_DELAY;
            }
        }

        return Math.max(
            HomeConfig.BATTLE_AUTO_HOST_MIN_REMAIN_SECONDS,
            currentWaveRemaining + futureWaveRemaining,
        );
    }

    protected formatBattleAutoHostRemainTime(finishTime: number): string {
        const seconds = Math.max(0, finishTime - Math.floor(Date.now() / 1000));
        const minutes = Math.floor(seconds / 60);
        const remainSeconds = seconds % 60;
        if (minutes > 0) return `${minutes}\u5206${remainSeconds}\u79d2`;
        return `${remainSeconds}\u79d2`;
    }

    protected ensureBattleAutoHostIndicator(): Node | null {
        if (!this.battleEntryUiRoot?.isValid) return null;

        const result = this.getOrCreateBattleNode(
            this.battleEntryUiRoot,
            'BattleAutoHostingIndicator',
            HomeConfig.BATTLE_AUTO_HOSTING_ICON_WIDTH,
            HomeConfig.BATTLE_AUTO_HOSTING_ICON_HEIGHT,
            HomeConfig.BATTLE_AUTO_HOSTING_ICON_X,
            HomeConfig.BATTLE_AUTO_HOSTING_ICON_Y,
        );
        const indicator = result.node;
        this.battleAutoHostIndicator = indicator;
        indicator.setPosition(
            HomeConfig.BATTLE_AUTO_HOSTING_ICON_X,
            HomeConfig.BATTLE_AUTO_HOSTING_ICON_Y,
            0,
        );
        (indicator.getComponent(UITransform) || indicator.addComponent(UITransform)).setContentSize(
            HomeConfig.BATTLE_AUTO_HOSTING_ICON_WIDTH,
            HomeConfig.BATTLE_AUTO_HOSTING_ICON_HEIGHT,
        );
        indicator.setSiblingIndex(Math.max(0, this.battleEntryUiRoot.children.length - 1));
        const sprite = indicator.getComponent(Sprite) || indicator.addComponent(Sprite);
        sprite.enabled = true;
        if (!sprite.spriteFrame) {
            this.applyUiSkin(
                indicator,
                HomeConfig.UI_BATTLE_AUTO_HOSTING_ICON_FRAMES[0],
                HomeConfig.BATTLE_AUTO_HOSTING_ICON_WIDTH,
                HomeConfig.BATTLE_AUTO_HOSTING_ICON_HEIGHT,
            );
        }
        return indicator;
    }

    protected ensureBattleAutoHostIndicatorFrames(): void {
        if (this.battleAutoHostIndicatorFrames.length > 0) {
            this.applyBattleAutoHostIndicatorFrame();
            return;
        }
        if (this.battleAutoHostIndicatorLoadPromise) return;

        this.battleAutoHostIndicatorLoadPromise = Promise.all(
            HomeConfig.UI_BATTLE_AUTO_HOSTING_ICON_FRAMES.map((path, index) => (
                this.loadBattleAutoHostIndicatorFrame(path, HomeConfig.UI_BATTLE_AUTO_HOSTING_ICON_FRAME_UUIDS[index]).catch((error) => {
                    console.warn('[MainHomeView] battle auto host indicator frame missing', path, error);
                    return null;
                })
            )),
        )
            .then((frames) => {
                this.battleAutoHostIndicatorFrames = frames.filter((frame): frame is SpriteFrame => !!frame);
                this.battleAutoHostIndicatorFrameIndex = 0;
                this.battleAutoHostIndicatorFrameTimer = 0;
                this.applyBattleAutoHostIndicatorFrame();
                return this.battleAutoHostIndicatorFrames;
            })
            .catch((error) => {
                console.warn('[MainHomeView] battle auto host indicator missing', error);
                this.battleAutoHostIndicatorLoadPromise = null;
                return [];
            });
    }

    protected async loadBattleAutoHostIndicatorFrame(path: string, fallbackUuid?: string): Promise<SpriteFrame> {
        const bundle = await this.acquireHomeAssetBundle(path);
        return new Promise((resolve, reject) => {
            const resolveTexture = (texture: Texture2D): void => {
                resolve(this.createSpriteFrame(texture));
            };

            bundle.load(`${path}/texture`, Texture2D, (textureErr, texture) => {
                if (!textureErr && texture) {
                    resolveTexture(texture);
                    return;
                }

                bundle.load(path, Texture2D, (directErr, directTexture) => {
                    if (!directErr && directTexture) {
                        resolveTexture(directTexture);
                        return;
                    }

                    this.loadSpriteFrameAsset(path, fallbackUuid)
                        .then(resolve)
                        .catch((spriteErr) => {
                            reject(textureErr || directErr || spriteErr || new Error(`Battle auto host texture not found: ${path}`));
                        });
                });
            });
        });
    }

    protected applyBattleAutoHostIndicatorFrame(): void {
        const indicator = this.battleAutoHostIndicator;
        if (!indicator?.isValid) return;

        const frame = this.battleAutoHostIndicatorFrames[this.battleAutoHostIndicatorFrameIndex]
            || this.battleAutoHostIndicatorFrames[0];
        if (!frame) return;

        this.applySpriteFrameToNode(
            indicator,
            frame,
            HomeConfig.BATTLE_AUTO_HOSTING_ICON_WIDTH,
            HomeConfig.BATTLE_AUTO_HOSTING_ICON_HEIGHT,
        );
    }

    protected queueBattleHostedRewards(_rewards: Array<{ item: BagIllustrationCatalogItem; amount: string }>): void {
        // HomeFeatureMailData overrides this hook to create the actual mail entry.
    }
}
