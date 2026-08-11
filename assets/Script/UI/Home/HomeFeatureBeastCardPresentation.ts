import {
    Color,
    HorizontalTextAlignment,
    Label,
    Node,
    Overflow,
    Sprite,
    UITransform,
    UIOpacity,
    VerticalTextAlignment,
    sys,
} from 'cc';
import { applySimKaiFont } from '../Common/UIFont';
import * as HomeConfig from './HomeConfig';
import { HomeViewBase } from './HomeViewBase';

abstract class HomeFeatureBeastCardPresentationHost extends HomeViewBase {
    protected abstract beastCardYuanbaoRateValueLabel: Label | null;
    protected abstract getOrCreateBeastCardChildSkinnedNode(
        parent: Node,
        name: string,
        width: number,
        height: number,
        x: number,
        y: number,
        skinPath: string,
    ): Node;
    protected abstract getOrCreateBeastCardChildLabel(
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
    ): Label;
    protected abstract openBeastCardRecordPopup(): void;
}

/**
 * Owns Beast Card presentation helpers, output display and Spine refresh lifecycle.
 */
export abstract class HomeFeatureBeastCardPresentation extends HomeFeatureBeastCardPresentationHost {
    protected getOrCreateBeastCardNode(name: string, width: number, height: number, x: number, y: number): { node: Node; existed: boolean } {
        if (!this.beastCardRoot?.isValid) {
            return { node: this.createNode(name, this.bottomFeaturePanel || this.node, width, height, x, y), existed: false };
        }

        const existing = this.beastCardRoot.getChildByName(name);
        if (existing?.isValid) {
            existing.active = true;
            const transform = existing.getComponent(UITransform) || existing.addComponent(UITransform);
            if (transform.contentSize.width <= 0 || transform.contentSize.height <= 0) {
                transform.setContentSize(width, height);
            }
            return { node: existing, existed: true };
        }

        return { node: this.createNode(name, this.beastCardRoot, width, height, x, y), existed: false };
    }

    protected getOrCreateBeastCardSkinnedNode(name: string, width: number, height: number, x: number, y: number, skinPath: string): Node {
        const result = this.getOrCreateBeastCardNode(name, width, height, x, y);
        const transform = result.node.getComponent(UITransform) || result.node.addComponent(UITransform);
        const currentSize = transform.contentSize;
        const targetWidth = result.existed && currentSize.width > 0 ? currentSize.width : width;
        const targetHeight = result.existed && currentSize.height > 0 ? currentSize.height : height;
        this.applyUiSkinKeepingEditorSize(result.node, skinPath, targetWidth, targetHeight);
        return result.node;
    }

    protected getOrCreateBeastCardLabel(
        name: string,
        text: string,
        fontSize: number,
        x: number,
        y: number,
        width: number,
        height: number,
        color: Color,
    ): Label {
        const result = this.getOrCreateBeastCardNode(name, width, height, x, y);
        const label = result.node.getComponent(Label) || result.node.addComponent(Label);
        applySimKaiFont(label);
        label.enabled = true;
        label.string = text;
        label.fontSize = fontSize;
        label.lineHeight = fontSize + 8;
        label.color = color;
        label.horizontalAlign = HorizontalTextAlignment.CENTER;
        label.verticalAlign = VerticalTextAlignment.CENTER;
        return label;
    }

    protected clearBeastCardLegacyBottomInfo(): void {
        if (!this.beastCardRoot?.isValid) return;

        [
            'BeastCardDescriptionLabel',
            'BeastCardStatusLabel',
            'BeastCardOutputRateLabel',
            'BeastCardCountdownLabel',
            'BeastCardRecordButton',
            'BeastCardHelpButton',
        ].forEach((nodeName) => {
            const node = this.beastCardRoot?.getChildByName(nodeName);
            if (node?.isValid) node.destroy();
        });
    }

    protected ensureBeastCardBottomNameLabel(): void {
        if (!this.beastCardRoot?.isValid) return;

        this.beastCardBottomNameLabel = this.getOrCreateBeastCardLabel(
            'BeastCardBottomNameLabel',
            '',
            31,
            0,
            HomeConfig.BEAST_CARD_BOTTOM_NAME_LABEL_Y,
            HomeConfig.BEAST_CARD_BOTTOM_NAME_LABEL_WIDTH,
            HomeConfig.BEAST_CARD_BOTTOM_NAME_LABEL_HEIGHT,
            Color.WHITE,
        );
        const label = this.beastCardBottomNameLabel;
        const labelNode = label.node;
        labelNode.active = true;
        label.fontSize = 31;
        label.color = Color.WHITE;
        label.horizontalAlign = HorizontalTextAlignment.CENTER;
        label.verticalAlign = VerticalTextAlignment.CENTER;
        label.overflow = Overflow.SHRINK;
        this.applyBattleEntryTextStyle(label, 3);
        labelNode.setSiblingIndex(6);
    }

    protected ensureBeastCardRewardArea(): void {
        if (!this.beastCardRoot?.isValid) return;

        const rewardRoot = this.getOrCreateBeastCardNode(
            'BeastCardRewardRoot',
            420,
            170,
            0,
            HomeConfig.BEAST_CARD_REWARD_ROOT_Y,
        ).node;
        rewardRoot.active = true;
        this.beastCardRewardRoot = rewardRoot;

        const frame = this.getOrCreateBeastCardChildSkinnedNode(
            rewardRoot,
            'BeastCardYuanbaoFrame',
            HomeConfig.BEAST_CARD_REWARD_FRAME_WIDTH,
            HomeConfig.BEAST_CARD_REWARD_FRAME_HEIGHT,
            0,
            0,
            HomeConfig.UI_BEAST_YUANBAO_FRAME,
        );
        frame.setSiblingIndex(1);

        const yuanbao = this.getOrCreateBeastCardChildSkinnedNode(
            rewardRoot,
            'BeastCardYuanbaoIcon',
            HomeConfig.BEAST_CARD_REWARD_ICON_WIDTH,
            HomeConfig.BEAST_CARD_REWARD_ICON_HEIGHT,
            0,
            9,
            HomeConfig.UI_BEAST_YUANBAO_LARGE,
        );
        yuanbao.setSiblingIndex(2);

        const recordButton = this.getOrCreateBeastCardChildSkinnedNode(
            rewardRoot,
            'BeastCardOutputRecordButton',
            HomeConfig.BEAST_CARD_REWARD_RECORD_SIZE,
            HomeConfig.BEAST_CARD_REWARD_RECORD_SIZE,
            HomeConfig.BEAST_CARD_REWARD_RECORD_X,
            0,
            HomeConfig.UI_BEAST_RECORD_ICON,
        );
        recordButton.setSiblingIndex(3);
        this.bindScaledClick(recordButton, () => this.openBeastCardRecordPopup());
        this.beastCardRecordButton = recordButton;
        rewardRoot.setSiblingIndex(7);

        this.beastCardCountdownLabel = this.getOrCreateBeastCardLabel(
            'BeastCardOutputCountdownLabel',
            '',
            28,
            0,
            HomeConfig.BEAST_CARD_OUTPUT_COUNTDOWN_Y,
            HomeConfig.BEAST_CARD_OUTPUT_TEXT_WIDTH,
            40,
            new Color(61, 238, 48, 255),
        );
        this.beastCardCountdownLabel.color = new Color(61, 238, 48, 255);
        this.applyBattleEntryTextStyle(this.beastCardCountdownLabel, 3);
        this.beastCardCountdownLabel.node.setSiblingIndex(8);

        const rateRoot = this.getOrCreateBeastCardNode(
            'BeastCardOutputRateRoot',
            HomeConfig.BEAST_CARD_OUTPUT_TEXT_WIDTH,
            34,
            0,
            HomeConfig.BEAST_CARD_OUTPUT_RATE_Y,
        ).node;
        rateRoot.active = true;
        rateRoot.setSiblingIndex(8);
        this.beastCardOutputRateTitleLabel = this.getOrCreateBeastCardChildLabel(
            rateRoot,
            'BeastCardOutputRateTitleLabel',
            '\u5f53\u524d\u4ea7\u51fa\u901f\u7387:',
            24,
            -55,
            0,
            210,
            34,
            new Color(234, 217, 189, 255),
            HorizontalTextAlignment.RIGHT,
        );
        this.beastCardOutputRateValueLabel = this.getOrCreateBeastCardChildLabel(
            rateRoot,
            'BeastCardOutputRateValueLabel',
            '',
            24,
            116,
            0,
            170,
            34,
            new Color(61, 238, 48, 255),
            HorizontalTextAlignment.LEFT,
        );

        const amountRoot = this.getOrCreateBeastCardNode(
            'BeastCardOutputAmountRoot',
            HomeConfig.BEAST_CARD_OUTPUT_TEXT_WIDTH,
            34,
            0,
            HomeConfig.BEAST_CARD_OUTPUT_AMOUNT_Y,
        ).node;
        amountRoot.active = true;
        amountRoot.setSiblingIndex(8);
        this.beastCardOutputAmountTitleLabel = this.getOrCreateBeastCardChildLabel(
            amountRoot,
            'BeastCardOutputAmountTitleLabel',
            '\u6bcf\u6b21\u4ea7\u51fa\u6570\u91cf:',
            24,
            -126,
            0,
            220,
            34,
            new Color(234, 217, 189, 255),
            HorizontalTextAlignment.RIGHT,
        );
        this.beastCardOutputAmountValueLabel = this.getOrCreateBeastCardChildLabel(
            amountRoot,
            'BeastCardOutputAmountValueLabel',
            '',
            24,
            82,
            0,
            260,
            34,
            new Color(255, 52, 52, 255),
            HorizontalTextAlignment.LEFT,
        );
        this.beastCardOutputAmountUnitLabel = this.getOrCreateBeastCardChildLabel(
            amountRoot,
            'BeastCardOutputAmountUnitLabel',
            '\u4e2a',
            24,
            238,
            0,
            44,
            34,
            new Color(234, 217, 189, 255),
            HorizontalTextAlignment.LEFT,
        );

        this.refreshBeastCardOutputInfo();
    }

    protected ensureBeastCardActivationArea(): void {
        if (!this.beastCardRoot?.isValid || !this.beastCardRewardRoot?.isValid) return;

        const button = this.getOrCreateBeastCardChildSkinnedNode(
            this.beastCardRewardRoot,
            'BeastCardActivationButton',
            HomeConfig.BEAST_CARD_ACTIVATE_BUTTON_WIDTH,
            HomeConfig.BEAST_CARD_ACTIVATE_BUTTON_HEIGHT,
            0,
            HomeConfig.BEAST_CARD_ACTIVATE_BUTTON_Y,
            HomeConfig.UI_BEAST_CARD_ACTIVATE_BUTTON_BG,
        );
        this.beastCardActivationButton = button;
        button.setSiblingIndex(4);
        this.bindScaledClick(button, () => this.openBeastCardActivationConfirm());

        const buttonLabel = this.getOrCreateBeastCardChildLabel(
            button,
            'BeastCardActivationButtonLabel',
            '\u6fc0\u6d3b',
            28,
            0,
            1,
            130,
            42,
            new Color(86, 42, 12, 255),
            HorizontalTextAlignment.CENTER,
        );
        buttonLabel.enableWrapText = false;
        this.setMagicFloorTextEdge(buttonLabel, false);

        const statusActive = this.isCurrentBeastCardActivated();
        const existingStatusRoot = this.beastCardRoot.getChildByName('BeastCardActivationStatusRoot');
        const statusRootExisted = !!existingStatusRoot?.isValid;
        const statusRoot = statusRootExisted
            ? existingStatusRoot!
            : this.createNode(
                'BeastCardActivationStatusRoot',
                this.beastCardRoot,
                HomeConfig.BEAST_CARD_ACTIVE_STATUS_WIDTH,
                HomeConfig.BEAST_CARD_ACTIVE_STATUS_HEIGHT,
                0,
                HomeConfig.BEAST_CARD_ACTIVE_STATUS_Y,
            );
        const statusTransform = statusRoot.getComponent(UITransform) || statusRoot.addComponent(UITransform);
        if (statusTransform.contentSize.width <= 0 || statusTransform.contentSize.height <= 0) {
            statusTransform.setContentSize(HomeConfig.BEAST_CARD_ACTIVE_STATUS_WIDTH, HomeConfig.BEAST_CARD_ACTIVE_STATUS_HEIGHT);
        }
        if (!statusRootExisted) {
            statusRoot.setPosition(0, HomeConfig.BEAST_CARD_ACTIVE_STATUS_Y, 0);
        }
        statusRoot.active = statusActive;
        if (statusActive && !statusRoot.getComponent(Sprite)?.spriteFrame) {
            this.applyUiSkinKeepingEditorSize(
                statusRoot,
                HomeConfig.UI_BEAST_CARD_ACTIVE_STATUS_BG,
                HomeConfig.BEAST_CARD_ACTIVE_STATUS_WIDTH,
                HomeConfig.BEAST_CARD_ACTIVE_STATUS_HEIGHT,
            );
        }
        statusRoot.setSiblingIndex(9);
        this.beastCardActivationStatusRoot = statusRoot;

        this.beastCardActivationStatusTitleLabel = this.getOrCreateBeastCardChildLabel(
            statusRoot,
            'BeastCardActivationStatusTitle',
            '',
            22,
            0,
            HomeConfig.BEAST_CARD_ACTIVE_STATUS_TITLE_Y,
            230,
            28,
            new Color(61, 238, 48, 255),
            HorizontalTextAlignment.CENTER,
        );
        this.beastCardActivationStatusTimeLabel = this.getOrCreateBeastCardChildLabel(
            statusRoot,
            'BeastCardActivationStatusTime',
            '',
            20,
            0,
            HomeConfig.BEAST_CARD_ACTIVE_STATUS_TIME_Y,
            240,
            26,
            new Color(61, 238, 48, 255),
            HorizontalTextAlignment.CENTER,
        );
        [this.beastCardActivationStatusTitleLabel, this.beastCardActivationStatusTimeLabel].forEach((label) => {
            if (!label?.node?.isValid) return;
            label.enableWrapText = false;
            this.applyBattleEntryTextStyle(label, 2);
        });

        this.refreshBeastCardActivationArea();
    }

    protected setBeastCardActivationStatusVisible(active: boolean): void {
        if (!this.beastCardRoot?.isValid) return;

        this.beastCardRoot.children
            .filter((child) => child?.isValid && child.name === 'BeastCardActivationStatusRoot')
            .forEach((root) => {
                const visible = active && root === this.beastCardActivationStatusRoot;
                if (!visible) {
                    this.skinApplyVersions.set(root, ++this.skinApplyVersion);
                }

                const opacity = root.getComponent(UIOpacity) || root.addComponent(UIOpacity);
                opacity.opacity = visible ? 255 : 0;
                const sprite = root.getComponent(Sprite);
                if (sprite) sprite.enabled = visible;
                root.children.forEach((child) => {
                    child.active = visible;
                });
                root.active = visible;
            });

        if (!active || !this.beastCardActivationStatusRoot?.isValid) return;

        const statusRoot = this.beastCardActivationStatusRoot;
        const sprite = statusRoot.getComponent(Sprite);
        if (sprite?.spriteFrame) {
            sprite.enabled = true;
            return;
        }
        this.applyUiSkinKeepingEditorSize(
            statusRoot,
            HomeConfig.UI_BEAST_CARD_ACTIVE_STATUS_BG,
            HomeConfig.BEAST_CARD_ACTIVE_STATUS_WIDTH,
            HomeConfig.BEAST_CARD_ACTIVE_STATUS_HEIGHT,
        );
    }

    protected ensureBeastCardActivationState(): void {
        if (this.beastCardActivationStateLoaded) return;

        this.beastCardActivationStateLoaded = true;
        this.beastCardActiveUntilByKey.clear();
        const raw = sys.localStorage.getItem(HomeConfig.BEAST_CARD_ACTIVATION_STORAGE_KEY);
        if (!raw) return;

        try {
            const parsed = JSON.parse(raw) as Record<string, number>;
            Object.keys(parsed).forEach((key) => {
                const until = parsed[key];
                if (typeof until === 'number' && Number.isFinite(until) && until > 0) {
                    this.beastCardActiveUntilByKey.set(key, until);
                }
            });
        } catch (err) {
            console.warn('[MainHomeView] beast card activation state parse failed', err);
        }
    }

    protected saveBeastCardActivationState(): void {
        this.ensureBeastCardActivationState();
        const now = Date.now();
        const data: Record<string, number> = {};
        this.beastCardActiveUntilByKey.forEach((until, key) => {
            if (until > now) data[key] = until;
        });
        sys.localStorage.setItem(HomeConfig.BEAST_CARD_ACTIVATION_STORAGE_KEY, JSON.stringify(data));
    }

    protected getBeastCardActivationConfig(index = this.beastCardIndex): typeof HomeConfig.BEAST_CARD_ACTIVATION_CONFIGS[number] {
        return HomeConfig.BEAST_CARD_ACTIVATION_CONFIGS[index] || HomeConfig.BEAST_CARD_ACTIVATION_CONFIGS[0];
    }

    protected isBeastCardActivated(index = this.beastCardIndex): boolean {
        const remainingMs = this.getBeastCardActivationRemainingMs(index);
        return remainingMs > 0;
    }

    protected isCurrentBeastCardActivated(): boolean {
        return this.isBeastCardActivated(this.beastCardIndex);
    }

    protected getBeastCardActivationRemainingMs(index = this.beastCardIndex): number {
        this.ensureBeastCardActivationState();
        const config = this.getBeastCardActivationConfig(index);
        const until = this.beastCardActiveUntilByKey.get(config.key) || 0;
        return Math.max(0, until - Date.now());
    }

    protected formatBeastCardActivationRemainingTime(ms: number): string {
        const totalMinutes = Math.max(0, Math.ceil(ms / 60000));
        const days = Math.floor(totalMinutes / (24 * 60));
        const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
        const minutes = totalMinutes % 60;
        return days > 0
            ? `${days}\u65e5${hours}\u5c0f\u65f6${minutes}\u5206`
            : `${hours}\u5c0f\u65f6${minutes}\u5206`;
    }

    protected openBeastCardActivationConfirm(): void {
        const config = this.getBeastCardActivationConfig();
        if (this.isCurrentBeastCardActivated()) {
            this.showToast(`${config.cardLabel}\u6b63\u5728\u751f\u6548\u4e2d`);
            return;
        }
        if (this.getRoleInventoryCount(config.itemId) < 1) {
            this.showToast(`${config.beastCardLabel}\u4e0d\u8db3`);
            return;
        }

        this.openSharedFlowPopup('ConfirmPopup', {
            title: '\u7cfb\u7edf\u63d0\u793a',
            message: `\u662f\u5426\u6d88\u80171\u5f20${config.cardLabel}\u6fc0\u6d3b${config.beastName}\u517d\u8109`,
            variant: 'beastStrengthenConfirm',
            onConfirm: () => {
                if (!this.consumeRoleInventory(config.itemId, 1)) {
                    this.showToast(`${config.beastCardLabel}\u4e0d\u8db3`);
                    return;
                }
                this.ensureBeastCardActivationState();
                this.beastCardActiveUntilByKey.set(
                    config.key,
                    Date.now() + HomeConfig.BEAST_CARD_ACTIVATION_DURATION_SECONDS * 1000,
                );
                this.saveBeastCardActivationState();
                this.refreshRoleInventoryViews(false);
                this.showToast(`${config.cardLabel}\u5df2\u6fc0\u6d3b`);
                this.refreshBeastCard();
            },
        });
    }

    protected showCurrentBeastCardActivationRequiredToast(): void {
        const config = this.getBeastCardActivationConfig();
        this.showToast(`\u8bf7\u5148\u6fc0\u6d3b${config.beastCardLabel}`);
    }

    protected getBeastCardActivationButtonLabel(): Label | null {
        const labelNode = this.beastCardActivationButton?.getChildByName('BeastCardActivationButtonLabel');
        return labelNode?.getComponent(Label) || null;
    }

    protected applyBeastCardSkeletonActivationVisual(active: boolean): void {
        if (!this.beastCardSkeleton?.isValid) return;

        const skeletonNode = this.beastCardSkeleton.node;
        const opacity = skeletonNode.getComponent(UIOpacity);
        if (opacity) opacity.opacity = 255;
        this.beastCardSkeleton.color = active ? Color.WHITE : new Color(80, 80, 80, 255);
        this.beastCardSkeleton.timeScale = active ? 1 : 0;
        this.beastCardSkeleton.markForUpdateRenderData(true);
    }

    protected refreshBeastCardActivationArea(): void {
        const active = this.isCurrentBeastCardActivated();
        const config = this.getBeastCardActivationConfig();
        const remainingMs = this.getBeastCardActivationRemainingMs();

        if (this.beastCardActivationButton?.isValid) {
            this.beastCardActivationButton.active = true;
            const opacity = this.beastCardActivationButton.getComponent(UIOpacity)
                || this.beastCardActivationButton.addComponent(UIOpacity);
            opacity.opacity = active ? 150 : 255;
        }
        const buttonLabel = this.getBeastCardActivationButtonLabel();
        if (buttonLabel?.isValid) {
            buttonLabel.string = active ? '\u5df2\u6fc0\u6d3b' : '\u6fc0\u6d3b';
            buttonLabel.color = active ? new Color(104, 82, 58, 255) : new Color(86, 42, 12, 255);
        }
        this.setBeastCardActivationStatusVisible(active);
        if (this.beastCardActivationStatusTitleLabel?.isValid) {
            this.beastCardActivationStatusTitleLabel.string = active ? `${config.cardLabel}\u751f\u6548\u4e2d` : '';
        }
        if (this.beastCardActivationStatusTimeLabel?.isValid) {
            this.beastCardActivationStatusTimeLabel.string = active
                ? `\u5269\u4f59\u65f6\u95f4\uff1a${this.formatBeastCardActivationRemainingTime(remainingMs)}`
                : '';
        }
        this.applyBeastCardSkeletonActivationVisual(active);
    }

    protected refreshBeastCardOutputInfo(): void {
        if (this.beastCardOutputRateTitleLabel) {
            this.beastCardOutputRateTitleLabel.string = '\u5f53\u524d\u4ea7\u51fa\u901f\u7387:';
        }
        if (this.beastCardOutputRateValueLabel) {
            this.beastCardOutputRateValueLabel.string = `${HomeConfig.BEAST_CARD_OUTPUT_RATE_HOURS}\u5c0f\u65f6\u4e00\u6b21`;
        }
        if (this.beastCardOutputAmountTitleLabel) {
            this.beastCardOutputAmountTitleLabel.string = '\u6bcf\u6b21\u4ea7\u51fa\u6570\u91cf:';
        }
        if (this.beastCardOutputAmountValueLabel) {
            this.beastCardOutputAmountValueLabel.string = `${HomeConfig.BEAST_CARD_OUTPUT_AMOUNT}(${HomeConfig.BEAST_CARD_OUTPUT_MULTIPLIER}\u500d)`;
        }
        if (this.beastCardOutputAmountUnitLabel) {
            this.beastCardOutputAmountUnitLabel.string = '\u4e2a';
        }
        if (this.beastCardYuanbaoRateValueLabel) {
            this.beastCardYuanbaoRateValueLabel.string = this.getBeastCardYuanbaoRateText();
        }
        this.refreshBeastCardActivationArea();
        this.updateBeastCardCountdown(0.25);
    }

    protected switchBeastCard(step: number): void {
        const nextIndex = Math.min(Math.max(this.beastCardIndex + step, 0), HomeConfig.BEAST_CARDS.length - 1);
        if (nextIndex === this.beastCardIndex) return;

        this.beastCardIndex = nextIndex;
        this.refreshBeastCardActivationArea();
        this.refreshBeastCard();
    }

    protected refreshBeastCard(): void {
        if (!this.beastCardRoot?.active || !this.beastCardSkeleton?.isValid) return;

        const card = HomeConfig.BEAST_CARDS[this.beastCardIndex];
        if (this.beastCardNameLabel) {
            this.beastCardNameLabel.string = card.name;
        }
        if (this.beastCardBottomNameLabel) {
            this.beastCardBottomNameLabel.string = HomeConfig.BEAST_CARD_BOTTOM_NAME_LABELS[this.beastCardIndex] || card.name;
        }
        this.ensureBeastCardActivationArea();
        this.refreshBeastCardOutputInfo();
        if (this.beastCardDescriptionLabel) {
            this.beastCardDescriptionLabel.string = card.description;
        }
        if (this.beastCardPrevButton?.isValid) {
            this.beastCardPrevButton.active = this.beastCardIndex > 0;
        }
        if (this.beastCardNextButton?.isValid) {
            this.beastCardNextButton.active = this.beastCardIndex < HomeConfig.BEAST_CARDS.length - 1;
        }

        const loadVersion = ++this.beastCardLoadVersion;
        this.setSkeletonVisible(this.beastCardSkeleton, false);
        void this.loadSkeletonAsset(card.skelPath)
            .then((asset) => {
                if (loadVersion !== this.beastCardLoadVersion) return;
                if (!this.beastCardSkeleton?.isValid || !this.beastCardRoot?.active) return;

                this.prepareSkeletonRenderer(this.beastCardSkeleton);
                this.beastCardSkeleton.skeletonData = asset;
                try {
                    this.beastCardSkeleton.setSkin('default');
                } catch {
                    // Some Spine exports only contain the implicit default skin.
                }
                const editorLayout = this.beastCardLayouts[this.beastCardIndex];
                const scale = Number.isFinite(editorLayout?.scale) ? editorLayout.scale : card.scale;
                const x = Number.isFinite(editorLayout?.x) ? editorLayout.x : card.x;
                const y = Number.isFinite(editorLayout?.y) ? editorLayout.y : card.y;
                this.beastCardSkeleton.node.setPosition(x, y, 0);
                this.beastCardSkeleton.node.setScale(scale, scale, 1);
                this.setSkeletonVisible(this.beastCardSkeleton, true);
                this.playSkeletonAnimation(this.beastCardSkeleton, HomeConfig.BEAST_CARD_ANIMATIONS, true);
                this.applyBeastCardSkeletonActivationVisual(this.isCurrentBeastCardActivated());
                this.beastCardSkeleton.updateAnimation(0);
                this.beastCardSkeleton.markForUpdateRenderData(true);
            })
            .catch((err) => {
                console.warn('[MainHomeView] beast card spine load failed', card.skelPath, err);
                this.showToast('\u517d\u5361\u52a8\u753b\u8d44\u6e90\u52a0\u8f7d\u5931\u8d25');
            });
    }

    protected stopBeastCard(): void {
        this.beastCardLoadVersion += 1;
        if (this.beastCardRoot?.isValid) {
            this.beastCardRoot.active = false;
        }
        if (this.beastStrengthenPage?.isValid) {
            this.beastStrengthenPage.active = false;
        }
        if (this.beastCardSkeleton?.isValid) {
            this.setSkeletonVisible(this.beastCardSkeleton, false);
            this.applyBeastCardSkeletonActivationVisual(true);
        }
    }

    protected updateBeastCardCountdown(deltaTime: number): void {
        if (!this.beastCardRoot?.active || !this.beastCardCountdownLabel?.node?.isValid) return;
        this.beastCardCountdownElapsed += deltaTime;
        if (this.beastCardCountdownElapsed < 0.25) return;
        this.beastCardCountdownElapsed = 0;

        const remainingSeconds = Math.max(0, Math.ceil((this.beastCardNextOutputAt - Date.now()) / 1000));
        const hours = Math.floor(remainingSeconds / 3600);
        const minutes = Math.floor((remainingSeconds % 3600) / 60);
        const seconds = remainingSeconds % 60;
        const twoDigits = (value: number): string => value < 10 ? `0${value}` : `${value}`;
        this.beastCardCountdownLabel.string = `${hours}\u5c0f\u65f6${twoDigits(minutes)}\u5206${twoDigits(seconds)}\u79d2`;
        this.refreshBeastCardActivationArea();
    }
}
