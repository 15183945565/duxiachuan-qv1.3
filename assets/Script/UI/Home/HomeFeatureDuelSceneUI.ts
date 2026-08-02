import {
    Color,
    EventTouch,
    Graphics,
    HorizontalTextAlignment,
    Label,
    Node,
    Overflow,
    Tween,
    tween,
    UIOpacity,
    VerticalTextAlignment,
    Vec3,
} from 'cc';
import { applySimKaiFont } from '../Common/UIFont';
import * as HomeConfig from './HomeConfig';
import { HomeViewBase } from './HomeViewBase';

type DuelJianghuRoomConfig = typeof HomeConfig.DUEL_JIANGHU_ROOM_LABELS[number];
type DuelJianghuRoomId = DuelJianghuRoomConfig['id'];

abstract class HomeFeatureDuelSceneUIHost extends HomeViewBase {
    protected abstract duelJianghuCurrentInvestAmount: number;
    protected abstract duelJianghuPreviewActive: boolean;
    protected abstract duelJianghuRoundActive: boolean;
    protected abstract duelJianghuSelectedRoomId: DuelJianghuRoomId | '';
    protected abstract duelJianghuSelectedRoomName: string;
    protected abstract readonly duelJianghuRoomInvestAmounts: Map<DuelJianghuRoomId, number>;

    protected abstract closeDuelJianghuResultPopup(page: Node): void;
    protected abstract getOrCreateEditorLabel(parent: Node, name: string, text: string, fontSize: number, x: number, y: number, width: number, height: number, color: Color): Label;
    protected abstract getOrCreateEditorNode(name: string, parent: Node, width: number, height: number, x: number, y: number): Node;
    protected abstract getOrCreateEditorSkinnedNode(name: string, parent: Node, width: number, height: number, x: number, y: number, skinPath: string): Node;
    protected abstract setLabelOutline(label: Label, color: Color, width: number): void;
}

/**
 * 江湖逃杀编辑器节点、房间交互、侧边入口、运行时占位层与结果弹窗。
 *
 * 节点构造集中在独立的无状态功能类；运行时状态仍由 RoleBag 初始化器统一持有。
 */
export abstract class HomeFeatureDuelSceneUI extends HomeFeatureDuelSceneUIHost {
    protected buildDuelJianghuTopInfo(page: Node): void {
        const root = this.getOrCreateEditorNode(
            'JianghuTopInfoRoot',
            page,
            HomeConfig.DUEL_JIANGHU_TOP_ROOT_WIDTH,
            HomeConfig.DUEL_JIANGHU_TOP_ROOT_HEIGHT,
            HomeConfig.DUEL_JIANGHU_TOP_ROOT_X,
            HomeConfig.DUEL_JIANGHU_TOP_ROOT_Y,
        );
        root.active = true;
        root.setSiblingIndex(1);

        const killerBg = this.getOrCreateEditorSkinnedNode(
            'JianghuKillerTimerBg',
            root,
            HomeConfig.DUEL_JIANGHU_KILLER_TIMER_WIDTH,
            HomeConfig.DUEL_JIANGHU_KILLER_TIMER_HEIGHT,
            HomeConfig.DUEL_JIANGHU_KILLER_TIMER_X,
            HomeConfig.DUEL_JIANGHU_KILLER_TIMER_Y,
            HomeConfig.UI_DUEL_JIANGHU_KILLER_TIMER_BG,
        );
        killerBg.setSiblingIndex(0);

        const killerPrefix = this.getOrCreateEditorLabel(
            root,
            'JianghuKillerPrefixLabel',
            '\u6740\u624b',
            38,
            -214,
            58,
            86,
            58,
            new Color(255, 239, 224, 255),
        );
        killerPrefix.horizontalAlign = HorizontalTextAlignment.CENTER;
        killerPrefix.overflow = Overflow.SHRINK;
        this.setLabelOutline(killerPrefix, new Color(65, 23, 18, 255), 3);
        killerPrefix.node.setSiblingIndex(1);

        const killerSeconds = this.getOrCreateEditorLabel(
            root,
            'JianghuKillerSecondLabel',
            HomeConfig.DUEL_JIANGHU_KILLER_SECONDS,
            42,
            -136,
            58,
            70,
            64,
            new Color(246, 45, 24, 255),
        );
        killerSeconds.horizontalAlign = HorizontalTextAlignment.CENTER;
        killerSeconds.overflow = Overflow.SHRINK;
        this.setLabelOutline(killerSeconds, new Color(72, 15, 12, 255), 3);
        killerSeconds.node.setSiblingIndex(2);

        const killerSuffix = this.getOrCreateEditorLabel(
            root,
            'JianghuKillerSuffixLabel',
            '\u79d2\u540e\u51fa\u73b0',
            38,
            -24,
            58,
            190,
            58,
            new Color(255, 239, 224, 255),
        );
        killerSuffix.horizontalAlign = HorizontalTextAlignment.CENTER;
        killerSuffix.overflow = Overflow.SHRINK;
        this.setLabelOutline(killerSuffix, new Color(65, 23, 18, 255), 3);
        killerSuffix.node.setSiblingIndex(3);

        const periodBg = this.getOrCreateEditorSkinnedNode(
            'JianghuCurrentPeriodBg',
            root,
            HomeConfig.DUEL_JIANGHU_PERIOD_WIDTH,
            HomeConfig.DUEL_JIANGHU_PERIOD_HEIGHT,
            HomeConfig.DUEL_JIANGHU_PERIOD_X,
            HomeConfig.DUEL_JIANGHU_PERIOD_Y,
            HomeConfig.UI_DUEL_JIANGHU_PERIOD_BG,
        );
        periodBg.setSiblingIndex(4);

        const periodPrefix = this.getOrCreateEditorLabel(
            root,
            'JianghuCurrentPeriodPrefixLabel',
            '\u5f53\u524d\u7b2c',
            22,
            -261,
            -36,
            78,
            36,
            new Color(230, 245, 255, 255),
        );
        periodPrefix.horizontalAlign = HorizontalTextAlignment.CENTER;
        periodPrefix.overflow = Overflow.SHRINK;
        this.setLabelOutline(periodPrefix, new Color(23, 48, 58, 255), 2);
        periodPrefix.node.setSiblingIndex(5);

        const periodNumber = this.getOrCreateEditorLabel(
            root,
            'JianghuCurrentPeriodNumberLabel',
            HomeConfig.DUEL_JIANGHU_CURRENT_PERIOD,
            22,
            -196,
            -36,
            76,
            36,
            new Color(43, 224, 120, 255),
        );
        periodNumber.horizontalAlign = HorizontalTextAlignment.CENTER;
        periodNumber.overflow = Overflow.SHRINK;
        this.setLabelOutline(periodNumber, new Color(9, 62, 36, 255), 2);
        periodNumber.node.setSiblingIndex(6);

        const periodSuffix = this.getOrCreateEditorLabel(
            root,
            'JianghuCurrentPeriodSuffixLabel',
            '\u671f',
            22,
            -143,
            -36,
            34,
            36,
            new Color(230, 245, 255, 255),
        );
        periodSuffix.horizontalAlign = HorizontalTextAlignment.CENTER;
        periodSuffix.overflow = Overflow.SHRINK;
        this.setLabelOutline(periodSuffix, new Color(23, 48, 58, 255), 2);
        periodSuffix.node.setSiblingIndex(7);

        const yuanbaoBg = this.getOrCreateEditorSkinnedNode(
            'JianghuTopYuanbaoAmountBg',
            root,
            HomeConfig.DUEL_JIANGHU_YUANBAO_AMOUNT_WIDTH,
            HomeConfig.DUEL_JIANGHU_YUANBAO_AMOUNT_HEIGHT,
            HomeConfig.DUEL_JIANGHU_YUANBAO_AMOUNT_X,
            HomeConfig.DUEL_JIANGHU_YUANBAO_AMOUNT_Y,
            HomeConfig.UI_DUEL_AMOUNT_INPUT_BG,
        );
        yuanbaoBg.setSiblingIndex(8);

        const yuanbaoIcon = this.getOrCreateEditorSkinnedNode(
            'JianghuTopYuanbaoIcon',
            root,
            32,
            30,
            45,
            HomeConfig.DUEL_JIANGHU_YUANBAO_AMOUNT_Y,
            HomeConfig.UI_DUEL_YUANBAO_ICON,
        );
        yuanbaoIcon.setSiblingIndex(9);

        const yuanbaoAmount = this.getOrCreateEditorLabel(
            root,
            'JianghuTopYuanbaoAmountLabel',
            this.getJianghuYuanbaoAmountText(),
            28,
            138,
            HomeConfig.DUEL_JIANGHU_YUANBAO_AMOUNT_Y,
            108,
            40,
            new Color(255, 246, 198, 255),
        );
        yuanbaoAmount.string = this.getJianghuYuanbaoAmountText();
        yuanbaoAmount.horizontalAlign = HorizontalTextAlignment.LEFT;
        yuanbaoAmount.overflow = Overflow.SHRINK;
        this.setLabelOutline(yuanbaoAmount, new Color(62, 33, 18, 255), 2);
        yuanbaoAmount.node.setSiblingIndex(10);
    }
    protected getJianghuYuanbaoAmountText(): string {
        const normalize = (value?: string | null): string => {
            const text = (value || '').trim();
            return text && !/^\?+$/.test(text) ? text : '';
        };
        const persistentText = normalize(this.persistentPointLabel?.string);
        if (persistentText) return persistentText;

        const topHud = this.persistentCurrencyHud || this.findNode('TopHud', this.uiMainLayer || this.node) || this.findNode('TopHud');
        const sceneText = normalize(topHud?.getChildByName('LabelGold')?.getComponent(Label)?.string);
        if (sceneText) return sceneText;

        return this.getPointCurrencyText();
    }
    protected isDuelJianghuReservedPageActive(page: Node): boolean {
        return ['JianghuRecordPage', 'JianghuRankPage']
            .some((pageName) => !!page.getChildByName(pageName)?.active);
    }
    protected hideDuelJianghuKillerAppearBanner(page: Node): void {
        const banner = page.getChildByName('JianghuKillerAppearBanner');
        if (!banner) return;

        Tween.stopAllByTarget(banner);
        const opacity = banner.getComponent(UIOpacity);
        if (opacity) Tween.stopAllByTarget(opacity);
        banner.active = false;
    }
    protected waitDuelJianghuKillerAppearDuration(): Promise<void> {
        return new Promise((resolve) => {
            this.scheduleOnce(() => resolve(), HomeConfig.DUEL_JIANGHU_KILLER_APPEAR_SECONDS);
        });
    }
    protected playDuelJianghuKillerAppearBanner(page: Node): Promise<void> {
        if (this.isDuelJianghuReservedPageActive(page)) {
            this.hideDuelJianghuKillerAppearBanner(page);
            return this.waitDuelJianghuKillerAppearDuration();
        }

        const banner = this.getOrCreateEditorNode(
            'JianghuKillerAppearBanner',
            page,
            HomeConfig.VIEW_WIDTH,
            HomeConfig.VIEW_HEIGHT,
            0,
            0,
        );
        banner.active = true;
        banner.setSiblingIndex((page.children.length || 1) - 1);

        const opacity = banner.getComponent(UIOpacity) || banner.addComponent(UIOpacity);
        opacity.opacity = 255;
        banner.setScale(1.56, 1.56, 1);
        Tween.stopAllByTarget(banner);
        Tween.stopAllByTarget(opacity);

        const board = this.getOrCreateEditorSkinnedNode(
            'JianghuKillerAppearBoard',
            banner,
            HomeConfig.DUEL_JIANGHU_KILLER_APPEAR_WIDTH,
            HomeConfig.DUEL_JIANGHU_KILLER_APPEAR_HEIGHT,
            HomeConfig.DUEL_JIANGHU_KILLER_APPEAR_X,
            HomeConfig.DUEL_JIANGHU_KILLER_APPEAR_Y,
            HomeConfig.UI_DUEL_JIANGHU_KILLER_APPEAR_BG,
        );
        board.active = true;
        board.setSiblingIndex(0);

        const title = this.getOrCreateDuelRoomLabel(
            banner,
            'JianghuKillerAppearLabel',
            '\u6740\u624b\u51fa\u73b0',
            58,
            HomeConfig.DUEL_JIANGHU_KILLER_APPEAR_X,
            HomeConfig.DUEL_JIANGHU_KILLER_APPEAR_Y + 2,
            420,
            80,
            new Color(255, 232, 175, 255),
        );
        title.node.active = true;
        title.string = '\u6740\u624b\u51fa\u73b0';
        title.fontSize = 58;
        title.lineHeight = 66;
        title.horizontalAlign = HorizontalTextAlignment.CENTER;
        title.overflow = Overflow.SHRINK;
        this.setLabelOutline(title, new Color(98, 28, 14, 255), 4);
        title.node.setSiblingIndex(1);

        tween(banner)
            .to(0.78, { scale: new Vec3(0.88, 0.88, 1) }, { easing: 'sineOut' })
            .delay(0.48)
            .to(0.74, { scale: new Vec3(1.72, 1.72, 1) }, { easing: 'backIn' })
            .call(() => {
                if (banner.isValid) banner.active = false;
            })
            .start();
        tween(opacity)
            .delay(1.26)
            .to(0.74, { opacity: 0 })
            .start();

        return this.waitDuelJianghuKillerAppearDuration();
    }
    protected buildDuelJianghuRoomLabels(page: Node): void {
        const roomsRoot = this.getOrCreateEditorNode('JianghuTaoshaRooms', page, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT, 0, 0);
        roomsRoot.active = true;
        roomsRoot.setSiblingIndex(3);

        HomeConfig.DUEL_JIANGHU_ROOM_LABELS.forEach((config, index) => {
            const room = this.getOrCreateEditorNode(
                config.nodeName,
                roomsRoot,
                HomeConfig.DUEL_JIANGHU_ROOM_LABEL_WIDTH,
                HomeConfig.DUEL_JIANGHU_ROOM_LABEL_HEIGHT,
                config.x,
                config.y,
            );
            room.active = true;
            room.setSiblingIndex(index);

            const highlightFrame = this.getOrCreateEditorSkinnedNode(
                'JianghuRoomHighlightFrame',
                room,
                config.highlightWidth,
                config.highlightHeight,
                config.highlightX,
                config.highlightY,
                HomeConfig.UI_DUEL_JIANGHU_ROOM_HIGHLIGHT_FRAME,
            );
            highlightFrame.active = true;
            highlightFrame.setSiblingIndex(0);
            const highlightOpacity = highlightFrame.getComponent(UIOpacity) || highlightFrame.addComponent(UIOpacity);
            highlightOpacity.opacity = this.duelJianghuSelectedRoomName === config.nodeName
                ? HomeConfig.DUEL_JIANGHU_ROOM_HIGHLIGHT_SELECTED_OPACITY
                : 0;

            const actorArea = this.getOrCreateEditorNode(
                'JianghuRoomActorArea',
                room,
                config.actorAreaWidth,
                config.actorAreaHeight,
                highlightFrame.position.x,
                highlightFrame.position.y - 18,
            );
            actorArea.active = true;
            actorArea.setSiblingIndex(1);

            const bg = this.getOrCreateEditorSkinnedNode(
                'JianghuRoomNameBg',
                room,
                HomeConfig.DUEL_JIANGHU_ROOM_LABEL_WIDTH,
                HomeConfig.DUEL_JIANGHU_ROOM_LABEL_HEIGHT,
                0,
                0,
                HomeConfig.UI_DUEL_ROOM_NAME_CURRENCY_BG,
            );
            bg.setSiblingIndex(1);

            const nameLabelExisted = !!room.getChildByName('JianghuRoomNameLabel');
            const nameLabel = this.getOrCreateDuelRoomLabel(
                room,
                'JianghuRoomNameLabel',
                config.name,
                22,
                0,
                10,
                158,
                28,
                new Color(255, 238, 204, 255),
            );
            if (!nameLabelExisted) {
                nameLabel.horizontalAlign = HorizontalTextAlignment.CENTER;
                nameLabel.overflow = Overflow.SHRINK;
            }
            this.setLabelOutline(nameLabel, new Color(75, 34, 16, 255), 2);
            nameLabel.node.setSiblingIndex(2);

            const yuanbaoIcon = this.getOrCreateEditorSkinnedNode(
                'JianghuRoomYuanbaoIcon',
                room,
                24,
                22,
                -36,
                -15,
                HomeConfig.UI_DUEL_YUANBAO_ICON,
            );
            yuanbaoIcon.setSiblingIndex(3);

            const amountLabelExisted = !!room.getChildByName('JianghuRoomYuanbaoAmountLabel');
            const amountLabel = this.getOrCreateDuelRoomLabel(
                room,
                'JianghuRoomYuanbaoAmountLabel',
                config.amount,
                18,
                16,
                -15,
                86,
                26,
                new Color(255, 246, 198, 255),
            );
            if (!amountLabelExisted) {
                amountLabel.horizontalAlign = HorizontalTextAlignment.CENTER;
                amountLabel.overflow = Overflow.SHRINK;
            }
            this.setLabelOutline(amountLabel, new Color(64, 31, 16, 255), 2);
            amountLabel.node.setSiblingIndex(4);

            const investBg = this.getOrCreateEditorSkinnedNode(
                'JianghuRoomInvestAmountBg',
                room,
                HomeConfig.DUEL_JIANGHU_ROOM_INVEST_AMOUNT_WIDTH,
                HomeConfig.DUEL_JIANGHU_ROOM_INVEST_AMOUNT_HEIGHT,
                HomeConfig.DUEL_JIANGHU_ROOM_INVEST_AMOUNT_X,
                HomeConfig.DUEL_JIANGHU_ROOM_INVEST_AMOUNT_Y,
                HomeConfig.UI_DUEL_JIANGHU_ROOM_INVEST_AMOUNT_BG,
            );
            investBg.active = true;
            investBg.setSiblingIndex(5);

            const investIcon = this.getOrCreateEditorSkinnedNode(
                'JianghuRoomInvestYuanbaoIcon',
                room,
                HomeConfig.DUEL_JIANGHU_ROOM_INVEST_ICON_WIDTH,
                HomeConfig.DUEL_JIANGHU_ROOM_INVEST_ICON_HEIGHT,
                HomeConfig.DUEL_JIANGHU_ROOM_INVEST_ICON_X,
                HomeConfig.DUEL_JIANGHU_ROOM_INVEST_AMOUNT_Y,
                HomeConfig.UI_DUEL_YUANBAO_ICON,
            );
            investIcon.active = true;
            investIcon.setSiblingIndex(6);

            const investAmountLabelExisted = !!room.getChildByName('JianghuRoomInvestAmountLabel');
            const investAmountLabel = this.getOrCreateDuelRoomLabel(
                room,
                'JianghuRoomInvestAmountLabel',
                '0',
                18,
                HomeConfig.DUEL_JIANGHU_ROOM_INVEST_LABEL_X,
                HomeConfig.DUEL_JIANGHU_ROOM_INVEST_AMOUNT_Y,
                62,
                26,
                new Color(255, 246, 198, 255),
            );
            if (!investAmountLabelExisted) {
                investAmountLabel.horizontalAlign = HorizontalTextAlignment.LEFT;
                investAmountLabel.overflow = Overflow.SHRINK;
            }
            this.setLabelOutline(investAmountLabel, new Color(64, 31, 16, 255), 2);
            investAmountLabel.node.setSiblingIndex(7);

            const selectRoom = (): void => {
                if (this.duelJianghuPreviewActive) {
                    this.showToast('\u6740\u624b\u5df2\u51fa\u73b0\uff0c\u8bf7\u7b49\u5f85\u4e0b\u4e00\u671f');
                    return;
                }
                const isSwitchingInvest = this.duelJianghuRoundActive
                    && !!this.duelJianghuSelectedRoomId
                    && this.duelJianghuSelectedRoomId !== config.id;
                if (isSwitchingInvest && this.isDuelJianghuInvestSwitchLocked()) {
                    this.showToast(`\u6700\u540e${HomeConfig.DUEL_JIANGHU_INVEST_SWITCH_LOCK_SECONDS}\u79d2\u65e0\u6cd5\u5207\u6362\u6295\u5165\u623f\u95f4`);
                    return;
                }
                this.duelJianghuSelectedRoomName = config.nodeName;
                this.duelJianghuSelectedRoomId = config.id;
                this.refreshDuelJianghuRoomHighlights(roomsRoot);
                if (isSwitchingInvest) {
                    const amount = String(this.duelJianghuCurrentInvestAmount || Number(HomeConfig.DUEL_JIANGHU_INVEST_DEFAULT_AMOUNT));
                    void this.startDuelJianghuInvestRound(page, amount);
                    return;
                }
                this.showToast(`\u5df2\u9009\u62e9${config.name}`);
            };
            this.bindScaledClick(room, selectRoom);
            this.bindScaledClick(highlightFrame, selectRoom);
        });

        this.refreshDuelJianghuRoomHighlights(roomsRoot);
        this.refreshDuelJianghuRoomInvestAmountDisplays(page);
    }
    protected refreshDuelJianghuRoomInvestAmountDisplays(page: Node): void {
        const roomsRoot = page.getChildByName('JianghuTaoshaRooms');
        if (!roomsRoot) return;

        HomeConfig.DUEL_JIANGHU_ROOM_LABELS.forEach((config) => {
            const room = roomsRoot.getChildByName(config.nodeName);
            if (!room) return;

            const amount = this.duelJianghuRoomInvestAmounts.get(config.id) || 0;
            const label = room.getChildByName('JianghuRoomInvestAmountLabel')?.getComponent(Label);
            if (label) label.string = this.formatDuelJianghuRoomInvestAmount(amount);

            const bg = room.getChildByName('JianghuRoomInvestAmountBg');
            const icon = room.getChildByName('JianghuRoomInvestYuanbaoIcon');
            if (bg) bg.active = true;
            if (icon) icon.active = true;
        });
    }
    protected formatDuelJianghuRoomInvestAmount(value: number): string {
        return value.toFixed(4).replace(/\.?0+$/, '') || '0';
    }
    protected refreshDuelJianghuRoomHighlights(roomsRoot: Node): void {
        HomeConfig.DUEL_JIANGHU_ROOM_LABELS.forEach((config) => {
            const room = roomsRoot.getChildByName(config.nodeName);
            const highlightFrame = room?.getChildByName('JianghuRoomHighlightFrame');
            if (!highlightFrame) return;

            highlightFrame.active = true;
            const opacity = highlightFrame.getComponent(UIOpacity) || highlightFrame.addComponent(UIOpacity);
            opacity.opacity = this.duelJianghuSelectedRoomName === config.nodeName
                ? HomeConfig.DUEL_JIANGHU_ROOM_HIGHLIGHT_SELECTED_OPACITY
                : 0;
        });
    }
    protected buildDuelJianghuSideButtons(page: Node): void {
        const root = this.getOrCreateEditorNode(
            'JianghuSideButtons',
            page,
            HomeConfig.DUEL_JIANGHU_SIDE_BUTTON_ROOT_WIDTH,
            HomeConfig.DUEL_JIANGHU_SIDE_BUTTON_ROOT_HEIGHT,
            HomeConfig.DUEL_JIANGHU_SIDE_BUTTON_ROOT_X,
            HomeConfig.DUEL_JIANGHU_SIDE_BUTTON_ROOT_Y,
        );
        root.active = true;
        root.setSiblingIndex(5);

        [
            {
                nodeName: 'BtnJianghuRecord',
                iconPath: HomeConfig.UI_DUEL_JIANGHU_RECORD_ICON,
                pageName: 'JianghuRecordPage',
                title: '\u6c5f\u6e56\u9003\u6740\u8bb0\u5f55',
                y: HomeConfig.DUEL_JIANGHU_SIDE_BUTTON_GAP / 2,
            },
            {
                nodeName: 'BtnJianghuRank',
                iconPath: HomeConfig.UI_DUEL_JIANGHU_RANK_ICON,
                pageName: 'JianghuRankPage',
                title: '\u6c5f\u6e56\u9003\u6740\u6392\u884c',
                y: -HomeConfig.DUEL_JIANGHU_SIDE_BUTTON_GAP / 2,
            },
        ].forEach((config, index) => {
            const button = this.getOrCreateEditorSkinnedNode(
                config.nodeName,
                root,
                HomeConfig.DUEL_JIANGHU_SIDE_BUTTON_SIZE,
                HomeConfig.DUEL_JIANGHU_SIDE_BUTTON_SIZE,
                0,
                config.y,
                config.iconPath,
            );
            button.active = true;
            button.setSiblingIndex(index);
            this.bindScaledClick(button, () => this.openDuelJianghuReservedPage(page, config.pageName, config.title));
        });
    }
    protected openDuelJianghuReservedPage(page: Node, pageName: string, title: string): void {
        const reservedPage = this.ensureDuelJianghuReservedPage(page, pageName, title);
        this.closeDuelJianghuReservedPages(page);
        this.hideDuelJianghuKillerAppearBanner(page);
        reservedPage.active = true;
        if (pageName === 'JianghuRecordPage') this.refreshDuelJianghuRecordPage(reservedPage);
        if (pageName === 'JianghuRankPage') this.refreshDuelJianghuRankPage(reservedPage);
        this.ensureInputBlocker(reservedPage);
        reservedPage.setSiblingIndex((page.children.length || 1) - 1);
    }
    protected ensureDuelJianghuReservedPage(page: Node, pageName: string, title: string): Node {
        if (pageName === 'JianghuRecordPage') return this.ensureDuelJianghuRecordPage(page);
        if (pageName === 'JianghuRankPage') return this.ensureDuelJianghuRankPage(page);

        const reservedPage = this.getOrCreateEditorNode(pageName, page, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT, 0, 0);
        this.ensureInputBlocker(reservedPage);

        const bg = this.getOrCreateEditorNode(`${pageName}Background`, reservedPage, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT, 0, 0);
        let graphics = bg.getComponent(Graphics);
        if (!graphics) graphics = bg.addComponent(Graphics);
        graphics.clear();
        graphics.fillColor = new Color(10, 7, 4, 225);
        graphics.rect(-HomeConfig.VIEW_WIDTH / 2, -HomeConfig.VIEW_HEIGHT / 2, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT);
        graphics.fill();
        bg.setSiblingIndex(0);

        const titleLabel = this.getOrCreateDuelRoomLabel(
            reservedPage,
            `${pageName}Title`,
            title,
            36,
            0,
            620,
            420,
            64,
            new Color(255, 238, 196, 255),
        );
        titleLabel.horizontalAlign = HorizontalTextAlignment.CENTER;
        this.setLabelOutline(titleLabel, new Color(65, 33, 15, 255), 3);
        titleLabel.node.setSiblingIndex(1);

        const placeholder = this.getOrCreateDuelRoomLabel(
            reservedPage,
            `${pageName}Placeholder`,
            '\u9875\u9762\u5df2\u9884\u7559',
            26,
            0,
            0,
            420,
            48,
            new Color(255, 232, 185, 255),
        );
        placeholder.horizontalAlign = HorizontalTextAlignment.CENTER;
        this.setLabelOutline(placeholder, new Color(65, 33, 15, 255), 2);
        placeholder.node.setSiblingIndex(2);

        return reservedPage;
    }
    protected closeDuelJianghuReservedPages(page: Node): void {
        ['JianghuRecordPage', 'JianghuRankPage'].forEach((pageName) => {
            const reservedPage = page.getChildByName(pageName);
            if (reservedPage) reservedPage.active = false;
        });
    }
    protected closeActiveDuelJianghuReservedPage(page: Node): boolean {
        const activePage = ['JianghuRecordPage', 'JianghuRankPage']
            .map((pageName) => page.getChildByName(pageName))
            .find((reservedPage) => reservedPage?.active);
        if (!activePage) return false;

        activePage.active = false;
        return true;
    }
    protected buildDuelJianghuRuntimeLayers(page: Node): void {
        const actorLayer = this.getOrCreateEditorNode(
            'JianghuActorLayer',
            page,
            HomeConfig.DUEL_JIANGHU_ACTOR_ROOT_WIDTH,
            HomeConfig.DUEL_JIANGHU_ACTOR_ROOT_HEIGHT,
            0,
            0,
        );
        actorLayer.active = true;
        actorLayer.setSiblingIndex(2);

        const playerEntry = this.getOrCreateEditorNode(
            'JianghuPlayerEntryPoint',
            actorLayer,
            40,
            40,
            HomeConfig.DUEL_JIANGHU_ENTRY_X,
            HomeConfig.DUEL_JIANGHU_ENTRY_Y,
        );
        playerEntry.setSiblingIndex(0);

        const exit = this.getOrCreateEditorNode(
            'JianghuExitPoint',
            actorLayer,
            40,
            40,
            HomeConfig.DUEL_JIANGHU_EXIT_X,
            HomeConfig.DUEL_JIANGHU_EXIT_Y,
        );
        exit.setSiblingIndex(1);

        const killerEntry = this.getOrCreateEditorNode(
            'JianghuKillerEntryPoint',
            actorLayer,
            40,
            40,
            HomeConfig.DUEL_JIANGHU_KILLER_ENTRY_X,
            HomeConfig.DUEL_JIANGHU_KILLER_ENTRY_Y,
        );
        killerEntry.setSiblingIndex(2);

        const lobbyArea = this.getOrCreateEditorNode(
            'JianghuLobbyCrowdArea',
            actorLayer,
            HomeConfig.DUEL_JIANGHU_LOBBY_AREA_WIDTH,
            HomeConfig.DUEL_JIANGHU_LOBBY_AREA_HEIGHT,
            HomeConfig.DUEL_JIANGHU_LOBBY_AREA_X,
            HomeConfig.DUEL_JIANGHU_LOBBY_AREA_Y,
        );
        lobbyArea.setSiblingIndex(3);

        [
            { nodeName: 'JianghuRoute_StartPoint', x: HomeConfig.DUEL_JIANGHU_ROUTE_START_X, y: HomeConfig.DUEL_JIANGHU_ROUTE_START_Y },
            { nodeName: 'JianghuRoute_Turn1', x: HomeConfig.DUEL_JIANGHU_ROUTE_TURN1_X, y: HomeConfig.DUEL_JIANGHU_ROUTE_TURN1_Y },
            { nodeName: 'JianghuRoute_Turn2', x: HomeConfig.DUEL_JIANGHU_ROUTE_TURN2_X, y: HomeConfig.DUEL_JIANGHU_ROUTE_TURN2_Y },
            { nodeName: 'JianghuRoute_Turn3', x: HomeConfig.DUEL_JIANGHU_ROUTE_TURN3_X, y: HomeConfig.DUEL_JIANGHU_ROUTE_TURN3_Y },
            { nodeName: 'JianghuRoute_Turn4', x: HomeConfig.DUEL_JIANGHU_ROUTE_TURN4_X, y: HomeConfig.DUEL_JIANGHU_ROUTE_TURN4_Y },
            { nodeName: 'JianghuRoute_Turn5', x: HomeConfig.DUEL_JIANGHU_ROUTE_TURN5_X, y: HomeConfig.DUEL_JIANGHU_ROUTE_TURN5_Y },
            { nodeName: 'JianghuRoute_Turn6', x: HomeConfig.DUEL_JIANGHU_ROUTE_TURN6_X, y: HomeConfig.DUEL_JIANGHU_ROUTE_TURN6_Y },
            { nodeName: 'JianghuRoute_Turn7', x: HomeConfig.DUEL_JIANGHU_ROUTE_TURN7_X, y: HomeConfig.DUEL_JIANGHU_ROUTE_TURN7_Y },
        ].forEach((routeConfig, index) => {
            const routePoint = this.getOrCreateEditorNode(
                routeConfig.nodeName,
                actorLayer,
                HomeConfig.DUEL_JIANGHU_ROUTE_POINT_SIZE,
                HomeConfig.DUEL_JIANGHU_ROUTE_POINT_SIZE,
                routeConfig.x,
                routeConfig.y,
            );
            routePoint.setSiblingIndex(4 + index);
        });

        HomeConfig.DUEL_JIANGHU_ROOM_LABELS.forEach((room, index) => {
            const door = this.getOrCreateEditorNode(
                room.routeDoorNodeName,
                actorLayer,
                HomeConfig.DUEL_JIANGHU_ROUTE_POINT_SIZE,
                HomeConfig.DUEL_JIANGHU_ROUTE_POINT_SIZE,
                room.routeDoorX,
                room.routeDoorY,
            );
            door.setSiblingIndex(12 + index);
        });

        const popup = this.ensureDuelJianghuResultPopup(page);
        popup.active = false;
        const banner = page.getChildByName('JianghuKillerAppearBanner');
        if (banner) banner.active = false;
    }
    protected ensureDuelJianghuResultPopup(page: Node): Node {
        const existed = !!page.getChildByName('JianghuResultPopup');
        const popup = this.getOrCreateEditorNode('JianghuResultPopup', page, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT, 0, 0);
        this.ensureInputBlocker(popup);
        popup.setSiblingIndex((page.children.length || 1) - 1);

        const mask = this.getOrCreateEditorNode('JianghuResultMask', popup, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT, 0, 0);
        let graphics = mask.getComponent(Graphics);
        if (!graphics) graphics = mask.addComponent(Graphics);
        graphics.clear();
        graphics.fillColor = new Color(0, 0, 0, 155);
        graphics.rect(-HomeConfig.VIEW_WIDTH / 2, -HomeConfig.VIEW_HEIGHT / 2, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT);
        graphics.fill();
        mask.setSiblingIndex(0);
        mask.off(Node.EventType.TOUCH_START);
        mask.off(Node.EventType.TOUCH_END);
        mask.off(Node.EventType.TOUCH_CANCEL);
        mask.on(Node.EventType.TOUCH_START, (event: EventTouch) => {
            event.propagationStopped = true;
        }, this);
        mask.on(Node.EventType.TOUCH_END, (event: EventTouch) => {
            event.propagationStopped = true;
            this.closeDuelJianghuResultPopup(page);
        }, this);
        mask.on(Node.EventType.TOUCH_CANCEL, (event: EventTouch) => {
            event.propagationStopped = true;
        }, this);

        const board = this.getOrCreateEditorSkinnedNode(
            'JianghuResultBoard',
            popup,
            HomeConfig.DUEL_JIANGHU_RESULT_POPUP_WIDTH,
            HomeConfig.DUEL_JIANGHU_RESULT_POPUP_HEIGHT,
            0,
            40,
            HomeConfig.UI_DUEL_JIANGHU_RESULT_POPUP_BG,
        );
        board.setSiblingIndex(1);
        board.off(Node.EventType.TOUCH_START);
        board.off(Node.EventType.TOUCH_END);
        board.on(Node.EventType.TOUCH_START, (event: EventTouch) => {
            event.propagationStopped = true;
        }, this);
        board.on(Node.EventType.TOUCH_END, (event: EventTouch) => {
            event.propagationStopped = true;
        }, this);

        const titleBg = this.getOrCreateEditorSkinnedNode(
            'JianghuResultTitleBg',
            popup,
            HomeConfig.DUEL_JIANGHU_RESULT_TITLE_BG_WIDTH,
            HomeConfig.DUEL_JIANGHU_RESULT_TITLE_BG_HEIGHT,
            0,
            260,
            HomeConfig.UI_DUEL_JIANGHU_RESULT_TITLE_BG,
        );
        titleBg.setSiblingIndex(2);

        const title = this.getOrCreateDuelRoomLabel(
            popup,
            'JianghuResultTitleLabel',
            '\u8eb2\u907f\u6210\u529f',
            48,
            0,
            260,
            460,
            72,
            new Color(255, 234, 170, 255),
        );
        title.node.active = true;
        title.horizontalAlign = HorizontalTextAlignment.CENTER;
        title.overflow = Overflow.SHRINK;
        this.setLabelOutline(title, new Color(98, 35, 12, 255), 4);
        title.node.setSiblingIndex(3);

        const mode = this.getOrCreateDuelRoomLabel(
            popup,
            'JianghuResultModeLabel',
            '\u672c\u671f\uff1a\u523a\u5ba2',
            25,
            0,
            190,
            560,
            42,
            new Color(255, 212, 126, 255),
        );
        mode.horizontalAlign = HorizontalTextAlignment.CENTER;
        mode.overflow = Overflow.SHRINK;
        this.setLabelOutline(mode, new Color(70, 34, 18, 255), 2);
        mode.node.setSiblingIndex(4);

        const desc = this.getOrCreateDuelRoomLabel(
            popup,
            'JianghuResultDescLabel',
            '\u6740\u624b\u5df2\u7ecf\u79bb\u5f00\uff0c\u672c\u671f\u7ed3\u7b97\u5b8c\u6210\u3002',
            24,
            0,
            108,
            560,
            112,
            new Color(245, 232, 204, 255),
        );
        desc.horizontalAlign = HorizontalTextAlignment.CENTER;
        desc.overflow = Overflow.RESIZE_HEIGHT;
        desc.enableWrapText = true;
        this.setLabelOutline(desc, new Color(55, 30, 16, 255), 2);
        desc.node.setSiblingIndex(5);

        const investIcon = this.getOrCreateEditorSkinnedNode(
            'JianghuResultInvestYuanbaoIcon',
            popup,
            34,
            32,
            -148,
            5,
            HomeConfig.UI_DUEL_YUANBAO_ICON,
        );
        investIcon.setSiblingIndex(6);
        const investLabel = this.getOrCreateDuelRoomLabel(
            popup,
            'JianghuResultInvestLabel',
            '\u6295\u5165 1',
            25,
            -60,
            5,
            160,
            42,
            new Color(255, 238, 198, 255),
        );
        investLabel.horizontalAlign = HorizontalTextAlignment.LEFT;
        investLabel.overflow = Overflow.SHRINK;
        this.setLabelOutline(investLabel, new Color(70, 34, 18, 255), 2);
        investLabel.node.setSiblingIndex(7);

        const rewardIcon = this.getOrCreateEditorSkinnedNode(
            'JianghuResultRewardYuanbaoIcon',
            popup,
            34,
            32,
            44,
            5,
            HomeConfig.UI_DUEL_YUANBAO_ICON,
        );
        rewardIcon.setSiblingIndex(8);
        const rewardLabel = this.getOrCreateDuelRoomLabel(
            popup,
            'JianghuResultRewardLabel',
            '\u83b7\u5f97 0',
            25,
            132,
            5,
            190,
            42,
            new Color(255, 238, 198, 255),
        );
        rewardLabel.horizontalAlign = HorizontalTextAlignment.LEFT;
        rewardLabel.overflow = Overflow.SHRINK;
        this.setLabelOutline(rewardLabel, new Color(70, 34, 18, 255), 2);
        rewardLabel.node.setSiblingIndex(9);

        const confirm = popup.getChildByName('BtnJianghuResultConfirm');
        if (confirm) {
            confirm.active = false;
            confirm.off(Node.EventType.TOUCH_START);
            confirm.off(Node.EventType.TOUCH_END);
            confirm.off(Node.EventType.TOUCH_CANCEL);
        }

        if (!existed) popup.active = false;
        return popup;
    }
    protected getOrCreateDuelRoomLabel(parent: Node, name: string, text: string, fontSize: number, x: number, y: number, width: number, height: number, color: Color): Label {
        const existing = parent.getChildByName(name);
        const node = this.getOrCreateEditorNode(name, parent, width, height, x, y);
        const label = node.getComponent(Label) || node.addComponent(Label);
        applySimKaiFont(label);
        const shouldInitialize = !existing || !label.string || label.string.includes('?');
        if (shouldInitialize) {
            label.string = text;
            label.fontSize = fontSize;
            label.lineHeight = fontSize + 6;
            label.color = color;
            label.verticalAlign = VerticalTextAlignment.CENTER;
        }
        return label;
    }
    protected resetDuelGameplayTagScales(tagsRoot: Node): void {
        HomeConfig.DUEL_GAMEPLAY_TAGS.forEach((config) => {
            const tag = tagsRoot.getChildByName(config.nodeName);
            if (!tag) return;

            Tween.stopAllByTarget(tag);
            tag.setScale(1, 1, 1);
            this.buttonBaseScales.set(tag, tag.scale.clone());
        });
    }
}
