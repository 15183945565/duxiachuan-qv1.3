import {
    Color,
    HorizontalTextAlignment,
    Label,
    Node,
    Overflow,
    Tween,
    Vec3,
} from 'cc';
import * as HomeConfig from './HomeConfig';
import { HomeViewBase } from './HomeViewBase';

type DuelJianghuRoomConfig = typeof HomeConfig.DUEL_JIANGHU_ROOM_LABELS[number];
type DuelJianghuRoomId = DuelJianghuRoomConfig['id'];
type DuelJianghuActorKind = 'common' | 'lobbyCommon' | 'player' | 'assassin' | 'doubleMale' | 'doubleFemale' | 'rebel' | 'guardSoldier' | 'general';
type DuelJianghuActorAnimation = 'walk' | 'stand' | 'attack' | 'hurt' | 'dead';
type DuelJianghuActorRuntime = {
    node: Node;
    kind: DuelJianghuActorKind;
    roomId?: DuelJianghuRoomId;
};

abstract class HomeFeatureDuelInvestHost extends HomeViewBase {
    protected abstract duelJianghuSelectedRoomId: DuelJianghuRoomId | '';
    protected abstract duelJianghuCountdown: number;
    protected abstract duelJianghuCurrentInvestAmount: number;
    protected abstract duelJianghuPlayerActor: DuelJianghuActorRuntime | null;
    protected abstract duelJianghuPreviewActive: boolean;
    protected abstract duelJianghuRoundActive: boolean;
    protected abstract duelJianghuRoundSerial: number;
    protected abstract readonly duelJianghuRoomInvestAmounts: Map<DuelJianghuRoomId, number>;

    protected abstract getOrCreateEditorNode(name: string, parent: Node, width: number, height: number, x: number, y: number): Node;
    protected abstract getOrCreateEditorSkinnedNode(name: string, parent: Node, width: number, height: number, x: number, y: number, skinPath: string): Node;
    protected abstract getOrCreateDuelRoomLabel(parent: Node, name: string, text: string, fontSize: number, x: number, y: number, width: number, height: number, color: Color): Label;
    protected abstract setLabelOutline(label: Label, color: Color, width: number): void;
    protected abstract ensureDuelJianghuLobbyPlayer(page: Node, reuseCurrent?: boolean, actorLayer?: Node): Promise<DuelJianghuActorRuntime | null>;
    protected abstract ensureDuelJianghuNpcCrowd(page: Node, force?: boolean): Promise<void>;
    protected abstract getDuelJianghuRoomById(roomId: DuelJianghuRoomId | ''): DuelJianghuRoomConfig | null;
    protected abstract getDuelJianghuRoomRandomPoint(page: Node, roomId: DuelJianghuRoomId, insetRatio?: number): Vec3;
    protected abstract moveDuelJianghuActorIntoRoom(
        page: Node,
        actor: DuelJianghuActorRuntime,
        roomId: DuelJianghuRoomId,
        target: Vec3,
        stepTime: number,
        faceTarget?: Vec3,
        canContinue?: () => boolean,
    ): Promise<void>;
    protected abstract playDuelJianghuActorAnimation(actor: DuelJianghuActorRuntime, animation: DuelJianghuActorAnimation, loop: boolean): number;
    protected abstract refreshDuelJianghuRoomInvestAmountDisplays(page: Node): void;
    protected abstract removeDuelJianghuActors(page: Node, predicate?: (actor: DuelJianghuActorRuntime) => boolean): void;
}

/**
 * Jianghu Duel investment input, validation, and round entry orchestration.
 * Combat actors, room geometry, and outcome resolution remain runtime host responsibilities.
 */
export abstract class HomeFeatureDuelInvest extends HomeFeatureDuelInvestHost {
    protected buildDuelJianghuInvestControls(page: Node): void {
        const root = this.getOrCreateEditorNode('JianghuInvestRoot', page, 320, 360, 0, HomeConfig.DUEL_JIANGHU_INVEST_ROOT_Y);
        root.active = true;
        root.setSiblingIndex(4);

        const legacyInput = root.getChildByName('JianghuInvestAmountInput');
        if (legacyInput) {
            legacyInput.active = false;
            legacyInput.off(Node.EventType.TOUCH_END, this.stopTouchThrough, this);
        }

        const inputBg = this.getOrCreateEditorSkinnedNode(
            'JianghuInvestAmountBg',
            root,
            HomeConfig.DUEL_JIANGHU_INVEST_INPUT_WIDTH,
            HomeConfig.DUEL_JIANGHU_INVEST_INPUT_HEIGHT,
            0,
            HomeConfig.DUEL_JIANGHU_INVEST_INPUT_Y,
            HomeConfig.UI_DUEL_AMOUNT_INPUT_BG,
        );
        inputBg.setSiblingIndex(0);

        const yuanbaoIcon = this.getOrCreateEditorSkinnedNode(
            'JianghuInvestYuanbaoIcon',
            root,
            32,
            30,
            -74,
            HomeConfig.DUEL_JIANGHU_INVEST_INPUT_Y,
            HomeConfig.UI_DUEL_YUANBAO_ICON,
        );
        yuanbaoIcon.setSiblingIndex(1);

        const selectedAmount = this.getDuelJianghuInvestAmountText();
        const amountLabel = this.getOrCreateDuelRoomLabel(
            root,
            'JianghuInvestAmountLabel',
            selectedAmount,
            28,
            24,
            HomeConfig.DUEL_JIANGHU_INVEST_INPUT_Y,
            96,
            38,
            new Color(255, 246, 198, 255),
        );
        amountLabel.horizontalAlign = HorizontalTextAlignment.LEFT;
        amountLabel.overflow = Overflow.SHRINK;
        this.setLabelOutline(amountLabel, new Color(62, 33, 18, 255), 2);
        amountLabel.node.setSiblingIndex(2);

        const selectButton = this.getOrCreateEditorSkinnedNode(
            'JianghuInvestAmountSelectButton',
            root,
            HomeConfig.DUEL_JIANGHU_INVEST_SELECT_ARROW_SIZE,
            HomeConfig.DUEL_JIANGHU_INVEST_SELECT_ARROW_SIZE,
            HomeConfig.DUEL_JIANGHU_INVEST_SELECT_ARROW_X,
            HomeConfig.DUEL_JIANGHU_INVEST_INPUT_Y,
            HomeConfig.UI_DUEL_JIANGHU_AMOUNT_SELECT_BUTTON,
        );
        selectButton.setSiblingIndex(3);

        const optionsRoot = this.getOrCreateEditorNode(
            'JianghuInvestAmountOptions',
            root,
            HomeConfig.DUEL_JIANGHU_INVEST_OPTION_WIDTH,
            HomeConfig.DUEL_JIANGHU_INVEST_OPTION_HEIGHT * HomeConfig.DUEL_JIANGHU_INVEST_AMOUNTS.length,
            0,
            0,
        );
        optionsRoot.active = false;
        optionsRoot.setSiblingIndex(5);
        const validOptionNames = new Set(
            HomeConfig.DUEL_JIANGHU_INVEST_AMOUNTS.map((amount) => `JianghuInvestAmountOption_${amount}`),
        );
        optionsRoot.children
            .filter((child) => child.name.startsWith('JianghuInvestAmountOption_') && !validOptionNames.has(child.name))
            .forEach((child) => {
                child.active = false;
            });
        HomeConfig.DUEL_JIANGHU_INVEST_AMOUNTS.forEach((amount, index) => {
            const isSelected = amount === selectedAmount;
            const option = this.getOrCreateEditorSkinnedNode(
                `JianghuInvestAmountOption_${amount}`,
                optionsRoot,
                HomeConfig.DUEL_JIANGHU_INVEST_OPTION_WIDTH,
                HomeConfig.DUEL_JIANGHU_INVEST_OPTION_HEIGHT,
                0,
                HomeConfig.DUEL_JIANGHU_INVEST_OPTION_START_Y + index * HomeConfig.DUEL_JIANGHU_INVEST_OPTION_GAP,
                isSelected ? HomeConfig.UI_DUEL_JIANGHU_AMOUNT_OPTION_SELECTED : HomeConfig.UI_DUEL_JIANGHU_AMOUNT_OPTION_NORMAL,
            );
            option.active = true;
            option.setSiblingIndex(index);
            const optionLabel = this.getOrCreateDuelRoomLabel(
                option,
                'JianghuInvestAmountOptionLabel',
                `${amount} \u5143\u5b9d`,
                20,
                0,
                0,
                190,
                34,
                isSelected ? new Color(255, 245, 180, 255) : new Color(236, 226, 196, 255),
            );
            optionLabel.string = `${amount} \u5143\u5b9d`;
            optionLabel.horizontalAlign = HorizontalTextAlignment.CENTER;
            optionLabel.overflow = Overflow.SHRINK;
            this.setLabelOutline(optionLabel, new Color(64, 31, 16, 255), 2);
            optionLabel.node.setSiblingIndex(1);
            this.bindScaledClick(option, () => {
                this.updateDuelJianghuInvestAmountSelection(root, amount);
                this.toggleDuelJianghuInvestAmountOptions(root, false);
            });
        });

        const toggleOptions = (): void => this.toggleDuelJianghuInvestAmountOptions(root);
        this.bindScaledClick(inputBg, toggleOptions);
        this.bindScaledClick(yuanbaoIcon, toggleOptions);
        this.bindScaledClick(amountLabel.node, toggleOptions);
        this.bindScaledClick(selectButton, toggleOptions);
        this.updateDuelJianghuInvestSelectButtonState(root, optionsRoot.active);

        const button = this.getOrCreateEditorSkinnedNode(
            'BtnJianghuInvestYuanbao',
            root,
            HomeConfig.DUEL_JIANGHU_INVEST_BUTTON_WIDTH,
            HomeConfig.DUEL_JIANGHU_INVEST_BUTTON_HEIGHT,
            0,
            HomeConfig.DUEL_JIANGHU_INVEST_BUTTON_Y,
            HomeConfig.UI_DUEL_INVEST_BUTTON_BG,
        );
        button.setSiblingIndex(4);
        const buttonLabel = this.getOrCreateDuelRoomLabel(
            button,
            'BtnJianghuInvestYuanbaoLabel',
            '\u6295\u5165\u5143\u5b9d',
            32,
            0,
            2,
            176,
            50,
            new Color(255, 244, 195, 255),
        );
        buttonLabel.horizontalAlign = HorizontalTextAlignment.CENTER;
        buttonLabel.overflow = Overflow.SHRINK;
        this.setLabelOutline(buttonLabel, new Color(103, 45, 18, 255), 3);
        buttonLabel.node.setSiblingIndex(1);
        this.bindScaledClick(button, () => {
            const amount = this.getSelectedDuelJianghuInvestAmount(root);
            this.toggleDuelJianghuInvestAmountOptions(root, false);
            this.updateDuelJianghuInvestAmountSelection(root, amount);
            void this.startDuelJianghuInvestRound(page, amount);
        });
    }
    protected getDuelJianghuInvestAmountText(): string {
        const amount = String(this.duelJianghuCurrentInvestAmount || HomeConfig.DUEL_JIANGHU_INVEST_DEFAULT_AMOUNT);
        const amounts: readonly string[] = HomeConfig.DUEL_JIANGHU_INVEST_AMOUNTS;
        return amounts.indexOf(amount) >= 0 ? amount : HomeConfig.DUEL_JIANGHU_INVEST_DEFAULT_AMOUNT;
    }
    protected getSelectedDuelJianghuInvestAmount(root: Node): string {
        const labelText = root.getChildByName('JianghuInvestAmountLabel')?.getComponent(Label)?.string.trim() || '';
        const amounts: readonly string[] = HomeConfig.DUEL_JIANGHU_INVEST_AMOUNTS;
        return amounts.indexOf(labelText) >= 0 ? labelText : HomeConfig.DUEL_JIANGHU_INVEST_DEFAULT_AMOUNT;
    }
    protected updateDuelJianghuInvestAmountSelection(root: Node, amount: string): void {
        const amounts: readonly string[] = HomeConfig.DUEL_JIANGHU_INVEST_AMOUNTS;
        const selected = amounts.indexOf(amount) >= 0 ? amount : HomeConfig.DUEL_JIANGHU_INVEST_DEFAULT_AMOUNT;
        const amountLabel = root.getChildByName('JianghuInvestAmountLabel')?.getComponent(Label);
        if (amountLabel) amountLabel.string = selected;

        const optionsRoot = root.getChildByName('JianghuInvestAmountOptions');
        HomeConfig.DUEL_JIANGHU_INVEST_AMOUNTS.forEach((optionAmount) => {
            const option = optionsRoot?.getChildByName(`JianghuInvestAmountOption_${optionAmount}`);
            if (!option) return;
            const isSelected = optionAmount === selected;
            this.applyUiSkinKeepingEditorSize(
                option,
                isSelected ? HomeConfig.UI_DUEL_JIANGHU_AMOUNT_OPTION_SELECTED : HomeConfig.UI_DUEL_JIANGHU_AMOUNT_OPTION_NORMAL,
                HomeConfig.DUEL_JIANGHU_INVEST_OPTION_WIDTH,
                HomeConfig.DUEL_JIANGHU_INVEST_OPTION_HEIGHT,
            );
            const label = option.getChildByName('JianghuInvestAmountOptionLabel')?.getComponent(Label);
            if (label) {
                label.color = isSelected ? new Color(255, 245, 180, 255) : new Color(236, 226, 196, 255);
            }
        });
    }
    protected toggleDuelJianghuInvestAmountOptions(root: Node, forceActive?: boolean): void {
        const optionsRoot = root.getChildByName('JianghuInvestAmountOptions');
        if (!optionsRoot) return;
        optionsRoot.active = forceActive ?? !optionsRoot.active;
        if (optionsRoot.active) optionsRoot.setSiblingIndex((root.children.length || 1) - 1);
        this.updateDuelJianghuInvestSelectButtonState(root, optionsRoot.active);
    }
    protected updateDuelJianghuInvestSelectButtonState(root: Node, expanded: boolean): void {
        const selectButton = root.getChildByName('JianghuInvestAmountSelectButton');
        if (!selectButton) return;

        const scale = new Vec3(
            Math.abs(selectButton.scale.x) || 1,
            expanded ? -(Math.abs(selectButton.scale.y) || 1) : (Math.abs(selectButton.scale.y) || 1),
            selectButton.scale.z || 1,
        );
        Tween.stopAllByTarget(selectButton);
        selectButton.setScale(scale);
        this.buttonBaseScales.set(selectButton, scale.clone());
    }
    protected async startDuelJianghuInvestRound(page: Node, amountText: string): Promise<void> {
        if (!this.duelJianghuSelectedRoomId) {
            this.showToast('\u8bf7\u5148\u9009\u62e9\u623f\u95f4');
            return;
        }
        const selected = this.getDuelJianghuRoomById(this.duelJianghuSelectedRoomId);
        if (!selected) return;

        const isSwitchingInvest = this.duelJianghuRoundActive;
        const currentInvestRoomId = this.duelJianghuPlayerActor?.roomId || '';
        const isChangingInvestRoom = isSwitchingInvest && (!currentInvestRoomId || currentInvestRoomId !== selected.id);
        if (isChangingInvestRoom && this.isDuelJianghuInvestSwitchLocked()) {
            this.showToast(`\u6700\u540e${HomeConfig.DUEL_JIANGHU_INVEST_SWITCH_LOCK_SECONDS}\u79d2\u65e0\u6cd5\u5207\u6362\u6295\u5165\u623f\u95f4`);
            return;
        }
        if (this.duelJianghuPreviewActive) {
            this.showToast('\u6740\u624b\u5df2\u51fa\u73b0\uff0c\u8bf7\u7b49\u5f85\u4e0b\u4e00\u671f');
            return;
        }
        if (this.duelJianghuCountdown <= 0) {
            this.showToast('\u672c\u671f\u5df2\u7ed3\u675f\uff0c\u8bf7\u7b49\u5f85\u4e0b\u4e00\u671f');
            return;
        }

        this.duelJianghuRoundActive = true;
        this.duelJianghuCurrentInvestAmount = Number(amountText || HomeConfig.DUEL_JIANGHU_INVEST_DEFAULT_AMOUNT);
        this.duelJianghuRoomInvestAmounts.clear();
        this.duelJianghuRoomInvestAmounts.set(selected.id, this.duelJianghuCurrentInvestAmount);
        this.refreshDuelJianghuRoomInvestAmountDisplays(page);
        const serial = ++this.duelJianghuRoundSerial;
        const shouldRefreshPlayerDirectly = isSwitchingInvest && !!currentInvestRoomId;
        const popup = page.getChildByName('JianghuResultPopup');
        if (popup) popup.active = false;
        this.removeDuelJianghuActors(page, (actor) => actor.kind !== 'common' && actor.kind !== 'lobbyCommon' && actor.kind !== 'player');
        await this.ensureDuelJianghuNpcCrowd(page);
        if (!page.active || serial !== this.duelJianghuRoundSerial) return;

        const player = await this.ensureDuelJianghuLobbyPlayer(page, true);
        if (!player || serial !== this.duelJianghuRoundSerial || !page.active) {
            this.duelJianghuRoundActive = false;
            this.showToast('\u6c5f\u6e56\u9003\u6740\u4eba\u7269\u52a8\u753b\u5c1a\u672a\u52a0\u8f7d\u5b8c\u6210');
            return;
        }

        player.roomId = selected.id;
        const target = this.getDuelJianghuRoomRandomPoint(page, selected.id, 0.62);
        this.duelJianghuPlayerActor = player;
        this.showToast(isSwitchingInvest
            ? (isChangingInvestRoom ? `\u5df2\u5207\u6362\u6295\u5165\u5230${selected.name}` : `\u5df2\u66f4\u65b0\u6295\u5165 ${amountText} \u5143\u5b9d`)
            : `\u5df2\u6295\u5165 ${amountText} \u5143\u5b9d`);
        if (shouldRefreshPlayerDirectly) {
            Tween.stopAllByTarget(player.node);
            if (isChangingInvestRoom) player.node.setPosition(target);
            if (player.node.isValid) this.playDuelJianghuActorAnimation(player, 'stand', true);
            return;
        }

        await this.moveDuelJianghuActorIntoRoom(
            page,
            player,
            selected.id,
            target,
            HomeConfig.DUEL_JIANGHU_ACTOR_WALK_STEP_TIME,
            undefined,
            () => page.active && serial === this.duelJianghuRoundSerial,
        );
        if (!page.active || serial !== this.duelJianghuRoundSerial) return;
        if (player.node.isValid) this.playDuelJianghuActorAnimation(player, 'stand', true);
    }
    protected isDuelJianghuInvestSwitchLocked(): boolean {
        return this.duelJianghuCountdown > 0
            && this.duelJianghuCountdown <= HomeConfig.DUEL_JIANGHU_INVEST_SWITCH_LOCK_SECONDS;
    }
}
