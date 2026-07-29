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
        this.updateBeastCardCountdown(0.25);
    }

    protected switchBeastCard(step: number): void {
        const nextIndex = Math.min(Math.max(this.beastCardIndex + step, 0), HomeConfig.BEAST_CARDS.length - 1);
        if (nextIndex === this.beastCardIndex) return;

        this.beastCardIndex = nextIndex;
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
    }
}
