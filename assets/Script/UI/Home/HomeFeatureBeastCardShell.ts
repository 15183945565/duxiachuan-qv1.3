import {
    Color,
    HorizontalTextAlignment,
    Label,
    Node,
    UITransform,
    sp,
} from 'cc';
import * as HomeConfig from './HomeConfig';
import { HomeViewBase } from './HomeViewBase';

abstract class HomeFeatureBeastCardShellHost extends HomeViewBase {
    protected abstract beastCardYuanbaoRateValueLabel: Label | null;
    protected abstract getOrCreateBeastCardNode(
        name: string,
        width: number,
        height: number,
        x: number,
        y: number,
    ): { node: Node; existed: boolean };
    protected abstract getOrCreateBeastCardSkinnedNode(
        name: string,
        width: number,
        height: number,
        x: number,
        y: number,
        skinPath: string,
    ): Node;
    protected abstract getOrCreateBeastCardLabel(
        name: string,
        text: string,
        fontSize: number,
        x: number,
        y: number,
        width: number,
        height: number,
        color: Color,
    ): Label;
    protected abstract getOrCreateBeastCardChildNode(
        parent: Node,
        name: string,
        width: number,
        height: number,
        x: number,
        y: number,
    ): { node: Node; existed: boolean };
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
    protected abstract clearBeastCardLegacyBottomInfo(): void;
    protected abstract ensureBeastCardBottomNameLabel(): void;
    protected abstract ensureBeastCardRewardArea(): void;
    protected abstract ensureBeastCardActivationArea(): void;
    protected abstract ensureBeastCardRecordPopup(): void;
    protected abstract ensureBeastStrengthenPage(): void;
    protected abstract openBeastStrengthenPage(): void;
}

/**
 * Owns the Beast Card page shell and its entry controls.
 * Runtime state remains in the existing Base/Adventure initializers.
 */
export abstract class HomeFeatureBeastCardShell extends HomeFeatureBeastCardShellHost {
    protected ensureBeastCardPanel(): void {
        if (!this.bottomFeaturePanel || this.beastCardRoot?.isValid) return;

        const editorRoot = this.bottomFeaturePanel.getChildByName('BeastCardRoot') || this.findNode('BeastCardRoot');
        this.beastCardRoot = editorRoot?.isValid
            ? editorRoot
            : this.createNode(
                'BeastCardRoot',
                this.bottomFeaturePanel,
                HomeConfig.BEAST_CARD_ROOT_WIDTH,
                HomeConfig.BEAST_CARD_ROOT_HEIGHT,
                0,
                HomeConfig.BEAST_CARD_ROOT_Y,
            );
        if (this.beastCardRoot.parent !== this.bottomFeaturePanel) {
            this.beastCardRoot.setParent(this.bottomFeaturePanel);
        }
        if (!editorRoot?.isValid) {
            this.beastCardRoot.setPosition(0, HomeConfig.BEAST_CARD_ROOT_Y, 0);
        }
        const rootTransform = this.beastCardRoot.getComponent(UITransform) || this.beastCardRoot.addComponent(UITransform);
        if (rootTransform.contentSize.width <= 0 || rootTransform.contentSize.height <= 0) {
            rootTransform.setContentSize(HomeConfig.BEAST_CARD_ROOT_WIDTH, HomeConfig.BEAST_CARD_ROOT_HEIGHT);
        }
        this.beastCardRoot.active = false;

        this.beastCardNameLabel = this.getOrCreateBeastCardLabel(
            'BeastCardNameLabel',
            '',
            38,
            0,
            535,
            460,
            64,
            new Color(255, 232, 170, 255),
        );
        this.applyBattleEntryTextStyle(this.beastCardNameLabel, 3);
        this.beastCardNameLabel.node.setSiblingIndex(8);

        const spineInfo = this.getOrCreateBeastCardNode(
            'BeastCardSpine',
            HomeConfig.BEAST_CARD_ROOT_WIDTH,
            900,
            0,
            HomeConfig.BEAST_CARD_SPINE_Y,
        );
        this.beastCardSkeleton = spineInfo.node.getComponent(sp.Skeleton) || spineInfo.node.addComponent(sp.Skeleton);
        this.prepareSkeletonRenderer(this.beastCardSkeleton);
        this.setSkeletonVisible(this.beastCardSkeleton, false);
        spineInfo.node.setSiblingIndex(1);

        const bottomFrame = this.getOrCreateBeastCardSkinnedNode(
            'BeastCardBottomFrame',
            HomeConfig.BEAST_CARD_BOTTOM_FRAME_WIDTH,
            HomeConfig.BEAST_CARD_BOTTOM_FRAME_HEIGHT,
            0,
            HomeConfig.BEAST_CARD_BOTTOM_FRAME_Y,
            HomeConfig.UI_BEAST_BOTTOM_FRAME,
        );
        bottomFrame.setSiblingIndex(3);

        this.beastCardDescriptionLabel = null;
        this.beastCardCountdownLabel = null;
        this.clearBeastCardLegacyBottomInfo();

        this.ensureBeastCardBottomNameLabel();
        this.ensureBeastCardRewardArea();
        this.ensureBeastCardActivationArea();
        this.ensureBeastCardStrengthenButton();
        this.ensureBeastCardYuanbaoRatePanel();
        this.ensureBeastCardRecordPopup();
        this.ensureBeastStrengthenPage();

        this.beastCardPrevButton = this.getOrCreateBeastCardSkinnedNode(
            'BeastCardPrevButton',
            HomeConfig.BEAST_CARD_SWITCH_WIDTH,
            HomeConfig.BEAST_CARD_SWITCH_HEIGHT,
            -HomeConfig.BEAST_CARD_SWITCH_X,
            HomeConfig.BEAST_CARD_SWITCH_Y,
            HomeConfig.UI_BEAST_SWITCH_LEFT,
        );
        this.beastCardPrevButton.setSiblingIndex(10);
        this.bindScaledClick(this.beastCardPrevButton, () => this.switchBeastCard(-1));

        this.beastCardNextButton = this.getOrCreateBeastCardSkinnedNode(
            'BeastCardNextButton',
            HomeConfig.BEAST_CARD_SWITCH_WIDTH,
            HomeConfig.BEAST_CARD_SWITCH_HEIGHT,
            HomeConfig.BEAST_CARD_SWITCH_X,
            HomeConfig.BEAST_CARD_SWITCH_Y,
            HomeConfig.UI_BEAST_SWITCH_RIGHT,
        );
        this.beastCardNextButton.setSiblingIndex(10);
        this.bindScaledClick(this.beastCardNextButton, () => this.switchBeastCard(1));
    }

    protected ensureBeastCardStrengthenButton(): void {
        if (!this.beastCardRoot?.isValid) return;

        this.beastCardStrengthenButton = this.getOrCreateBeastCardSkinnedNode(
            'BeastCardStrengthenButton',
            HomeConfig.BEAST_CARD_STRENGTHEN_BUTTON_WIDTH,
            HomeConfig.BEAST_CARD_STRENGTHEN_BUTTON_HEIGHT,
            HomeConfig.BEAST_CARD_STRENGTHEN_BUTTON_X,
            HomeConfig.BEAST_CARD_STRENGTHEN_BUTTON_Y,
            HomeConfig.UI_BEAST_STRENGTHEN_ICON,
        );
        this.beastCardStrengthenButton.setSiblingIndex(12);
        this.bindScaledClick(this.beastCardStrengthenButton, () => this.openBeastStrengthenPage());
    }

    protected ensureBeastCardYuanbaoRatePanel(): void {
        if (!this.beastCardRoot?.isValid) return;

        const root = this.getOrCreateBeastCardNode(
            'BeastCardYuanbaoRateRoot',
            HomeConfig.BEAST_CARD_YUANBAO_RATE_WIDTH,
            HomeConfig.BEAST_CARD_YUANBAO_RATE_HEIGHT,
            HomeConfig.BEAST_CARD_YUANBAO_RATE_X,
            HomeConfig.BEAST_CARD_YUANBAO_RATE_Y,
        ).node;
        root.active = true;
        root.setSiblingIndex(11);

        this.getOrCreateBeastCardChildSkinnedNode(
            root,
            'BeastCardYuanbaoRateFrame',
            HomeConfig.BEAST_CARD_YUANBAO_RATE_WIDTH,
            HomeConfig.BEAST_CARD_YUANBAO_RATE_HEIGHT,
            0,
            0,
            HomeConfig.UI_BEAST_STRENGTHEN_YUANBAO_RATE_FRAME,
        ).setSiblingIndex(0);

        const icon = this.getOrCreateBeastCardChildNode(root, 'BeastCardYuanbaoRateIcon', 42, 44, -78, 0).node;
        icon.setSiblingIndex(1);
        (icon.getComponent(UITransform) || icon.addComponent(UITransform)).setContentSize(42, 44);
        this.applyUiSkin(icon, HomeConfig.UI_HOME_JIFEN_ICON, 42, 44);

        const title = this.getOrCreateBeastCardChildLabel(
            root,
            'BeastCardYuanbaoRateTitle',
            '\u5143\u5b9d\u83b7\u5f97\u500d\u7387',
            17,
            36,
            14,
            126,
            24,
            new Color(255, 229, 158, 255),
            HorizontalTextAlignment.CENTER,
        );
        title.enableWrapText = false;
        title.node.setSiblingIndex(2);

        this.beastCardYuanbaoRateValueLabel = this.getOrCreateBeastCardChildLabel(
            root,
            'BeastCardYuanbaoRateValue',
            this.getBeastCardYuanbaoRateText(),
            28,
            36,
            -16,
            108,
            36,
            new Color(60, 255, 50, 255),
            HorizontalTextAlignment.CENTER,
        );
        this.beastCardYuanbaoRateValueLabel.enableWrapText = false;
        this.beastCardYuanbaoRateValueLabel.node.setSiblingIndex(3);
    }

    protected getBeastCardYuanbaoRateText(): string {
        return HomeConfig.BEAST_CARD_YUANBAO_MULTIPLIER.toFixed(2);
    }
}
