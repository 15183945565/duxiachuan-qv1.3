import {
    Color,
    EditBox,
    HorizontalTextAlignment,
    Label,
    Node,
    Overflow,
    SpriteFrame,
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
    protected abstract removeDuelJianghuActors(page: Node, predicate?: (actor: DuelJianghuActorRuntime) => boolean): void;
}

/**
 * Jianghu Duel investment input, validation, and round entry orchestration.
 * Combat actors, room geometry, and outcome resolution remain runtime host responsibilities.
 */
export abstract class HomeFeatureDuelInvest extends HomeFeatureDuelInvestHost {
    protected buildDuelJianghuInvestControls(page: Node): void {
        const root = this.getOrCreateEditorNode('JianghuInvestRoot', page, 320, 180, 0, HomeConfig.DUEL_JIANGHU_INVEST_ROOT_Y);
        root.active = true;
        root.setSiblingIndex(4);

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

        const amountLabel = this.getOrCreateDuelRoomLabel(
            root,
            'JianghuInvestAmountLabel',
            HomeConfig.DUEL_JIANGHU_INVEST_DEFAULT_AMOUNT,
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

        const inputNode = this.getOrCreateEditorNode(
            'JianghuInvestAmountInput',
            root,
            120,
            46,
            25,
            HomeConfig.DUEL_JIANGHU_INVEST_INPUT_Y,
        );
        inputNode.setSiblingIndex(3);
        const editBox = inputNode.getComponent(EditBox) || inputNode.addComponent(EditBox);
        this.setupDuelJianghuInvestEditBox(editBox, amountLabel, inputNode);

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
            const amount = this.getNormalizedJianghuInvestAmount(editBox);
            amountLabel.string = amount;
            void this.startDuelJianghuInvestRound(page, amount);
        });
    }
    protected setupDuelJianghuInvestEditBox(editBox: EditBox, amountLabel: Label, inputNode: Node): void {
        const currentValue = editBox.string.trim();
        editBox.string = /^\d+$/.test(currentValue) ? currentValue : HomeConfig.DUEL_JIANGHU_INVEST_DEFAULT_AMOUNT;
        editBox.placeholder = HomeConfig.DUEL_JIANGHU_INVEST_DEFAULT_AMOUNT;
        editBox.maxLength = 8;
        const textLabel = this.createHiddenEditBoxLabel(inputNode, 'TEXT_LABEL');
        const placeholderLabel = this.createHiddenEditBoxLabel(inputNode, 'PLACEHOLDER_LABEL');
        const editBoxCompat = editBox as unknown as {
            inputMode?: number;
            returnType?: number;
            textLabel?: Label;
            placeholderLabel?: Label;
            fontSize?: number;
            placeholderFontSize?: number;
            fontColor?: Color;
            placeholderFontColor?: Color;
            cursorColor?: Color;
            backgroundImage?: SpriteFrame | null;
        };
        editBoxCompat.textLabel = textLabel;
        editBoxCompat.placeholderLabel = placeholderLabel;
        editBoxCompat.inputMode = (EditBox as unknown as { InputMode?: { NUMERIC?: number } }).InputMode?.NUMERIC ?? 2;
        editBoxCompat.returnType = (EditBox as unknown as { KeyboardReturnType?: { DONE?: number } }).KeyboardReturnType?.DONE ?? 0;
        editBoxCompat.fontSize = 1;
        editBoxCompat.placeholderFontSize = 1;
        editBoxCompat.fontColor = new Color(0, 0, 0, 0);
        editBoxCompat.placeholderFontColor = new Color(0, 0, 0, 0);
        editBoxCompat.cursorColor = new Color(0, 0, 0, 0);
        editBoxCompat.backgroundImage = null;
        amountLabel.string = this.getNormalizedJianghuInvestAmount(editBox);

        inputNode.off(Node.EventType.TOUCH_END, this.stopTouchThrough, this);
        inputNode.on(Node.EventType.TOUCH_END, this.stopTouchThrough, this);

        const eventType = EditBox as unknown as {
            EventType?: {
                TEXT_CHANGED?: string;
                EDITING_DID_ENDED?: string;
            };
        };
        inputNode.off(eventType.EventType?.TEXT_CHANGED || 'text-changed');
        inputNode.on(eventType.EventType?.TEXT_CHANGED || 'text-changed', () => {
            amountLabel.string = this.getNormalizedJianghuInvestAmount(editBox);
        }, this);
        inputNode.off(eventType.EventType?.EDITING_DID_ENDED || 'editing-did-ended');
        inputNode.on(eventType.EventType?.EDITING_DID_ENDED || 'editing-did-ended', () => {
            const amount = this.getNormalizedJianghuInvestAmount(editBox);
            editBox.string = amount;
            amountLabel.string = amount;
        }, this);
    }
    protected getNormalizedJianghuInvestAmount(editBox: EditBox): string {
        const numeric = editBox.string.replace(/[^\d]/g, '');
        const normalized = String(Math.max(1, Number(numeric || HomeConfig.DUEL_JIANGHU_INVEST_DEFAULT_AMOUNT)));
        return normalized;
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
        const serial = ++this.duelJianghuRoundSerial;
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

