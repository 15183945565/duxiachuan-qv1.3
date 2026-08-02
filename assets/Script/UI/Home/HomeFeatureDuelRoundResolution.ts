import { Color, Label, Node } from 'cc';
import * as HomeConfig from './HomeConfig';
import { HomeViewBase } from './HomeViewBase';

type DuelJianghuRoomConfig = typeof HomeConfig.DUEL_JIANGHU_ROOM_LABELS[number];
type DuelJianghuRoomId = DuelJianghuRoomConfig['id'];
type DuelJianghuActorKind = 'common' | 'lobbyCommon' | 'player' | 'assassin' | 'doubleMale' | 'doubleFemale' | 'rebel' | 'guardSoldier' | 'general';
type DuelJianghuSpecialRoomKind = 'guardSoldier' | 'general';
type DuelJianghuActorRuntime = {
    node: Node;
    kind: DuelJianghuActorKind;
    roomId?: DuelJianghuRoomId;
};
type DuelJianghuRoundOutcome = {
    success: boolean;
    modeName: string;
    targetRoomNames: string[];
    investAmount: number;
    rewardAmount: number;
    description: string;
};
type DuelJianghuRoundPlan = DuelJianghuRoundOutcome & {
    targetRoomIds: DuelJianghuRoomId[];
    killerKinds: DuelJianghuActorKind[];
    specialKind?: DuelJianghuSpecialRoomKind;
    specialKindsByRoom?: Partial<Record<DuelJianghuRoomId, DuelJianghuSpecialRoomKind>>;
};
type DuelJianghuResultPopupNode = Node & {
    __jianghuResultAutoCloseToken?: number;
};

abstract class HomeFeatureDuelRoundResolutionHost extends HomeViewBase {
    protected abstract duelJianghuCurrentInvestAmount: number;
    protected abstract duelJianghuPreviewActive: boolean;
    protected abstract duelJianghuRoundActive: boolean;
    protected abstract duelJianghuRoundSerial: number;
    protected abstract duelJianghuSelectedRoomId: DuelJianghuRoomId | '';

    protected abstract closeDuelJianghuResultPopup(page: Node): void;
    protected abstract duelJianghuCountdownTick(): void;
    protected abstract ensureDuelJianghuNpcCrowd(page: Node, force?: boolean): Promise<void>;
    protected abstract ensureDuelJianghuResultPopup(page: Node): Node;
    protected abstract moveDuelJianghuCommonActorsOut(page: Node, killedRoomIds?: DuelJianghuRoomId[]): Promise<void>;
    protected abstract playDuelJianghuKillerAppearBanner(page: Node): Promise<void>;
    protected abstract playDuelJianghuKillerSequence(page: Node, plan: DuelJianghuRoundPlan): Promise<void>;
    protected abstract playDuelJianghuResultSound(success: boolean): void;
    protected abstract prepareDuelJianghuRoomActorsForRound(page: Node): Promise<void>;
    protected abstract removeDuelJianghuActors(page: Node, predicate?: (actor: DuelJianghuActorRuntime) => boolean): void;
    protected abstract startDuelJianghuCountdown(page: Node, reset: boolean): void;
}

/**
 * 江湖逃杀的回合方案、预演/结算编排与结果数据展示。
 * 演员创建、移动和攻击动画继续由宿主运行时实现。
 */
export abstract class HomeFeatureDuelRoundResolution extends HomeFeatureDuelRoundResolutionHost {
    protected async resolveDuelJianghuRound(page: Node, serial: number): Promise<void> {
        const selected = this.getDuelJianghuRoomById(this.duelJianghuSelectedRoomId);
        if (!selected) {
            this.duelJianghuRoundActive = false;
            this.startDuelJianghuCountdown(page, true);
            return;
        }

        const plan = this.createDuelJianghuRoundPlan(selected, this.duelJianghuCurrentInvestAmount);
        await this.playDuelJianghuKillerAppearBanner(page);
        if (!page.active || serial !== this.duelJianghuRoundSerial) return;

        await this.playDuelJianghuKillerSequence(page, plan);
        if (!page.active || serial !== this.duelJianghuRoundSerial) return;

        const killedRoomIds = this.getDuelJianghuKilledRoomIds(plan);
        await this.moveDuelJianghuCommonActorsOut(page, killedRoomIds);
        if (!page.active || serial !== this.duelJianghuRoundSerial) return;

        this.duelJianghuRoundActive = false;
        this.removeDuelJianghuActors(page, (actor) => actor.kind !== 'common' && actor.kind !== 'lobbyCommon' && actor.kind !== 'player');
        if (plan.investAmount > 0) this.playDuelJianghuResultSound(plan.success);
        this.showDuelJianghuResultPopup(page, plan);
    }
    protected async playDuelJianghuPreviewRound(page: Node): Promise<void> {
        if (this.duelJianghuPreviewActive || this.duelJianghuRoundActive || !page.active) return;

        this.duelJianghuPreviewActive = true;
        const serial = ++this.duelJianghuRoundSerial;
        let shouldStartNextRound = false;
        try {
            this.removeDuelJianghuActors(page, (actor) => actor.kind !== 'common' && actor.kind !== 'lobbyCommon' && actor.kind !== 'player');
            await this.ensureDuelJianghuNpcCrowd(page);
            if (!page.active || this.duelJianghuRoundActive || serial !== this.duelJianghuRoundSerial) return;

            const selected = this.pickDuelJianghuRooms(1)[0] || HomeConfig.DUEL_JIANGHU_ROOM_LABELS[0];
            if (!selected) return;
            const plan = this.createDuelJianghuRoundPlan(selected, Number(HomeConfig.DUEL_JIANGHU_INVEST_DEFAULT_AMOUNT));
            await this.playDuelJianghuKillerAppearBanner(page);
            if (!page.active || this.duelJianghuRoundActive || serial !== this.duelJianghuRoundSerial) return;

            await this.playDuelJianghuKillerSequence(page, plan);
            if (!page.active || this.duelJianghuRoundActive || serial !== this.duelJianghuRoundSerial) return;

            const killedRoomIds = this.getDuelJianghuKilledRoomIds(plan);
            await this.moveDuelJianghuCommonActorsOut(page, killedRoomIds);
            if (!page.active || this.duelJianghuRoundActive || serial !== this.duelJianghuRoundSerial) return;

            this.removeDuelJianghuActors(page, (actor) => actor.kind !== 'common' && actor.kind !== 'lobbyCommon' && actor.kind !== 'player');
            shouldStartNextRound = true;
        } finally {
            if (serial === this.duelJianghuRoundSerial) {
                this.duelJianghuPreviewActive = false;
                if (shouldStartNextRound && page.active && page.isValid) {
                    this.startDuelJianghuCountdown(page, true);
                    void this.prepareDuelJianghuRoomActorsForRound(page);
                }
            }
        }
    }
    protected createDuelJianghuRoundPlan(selected: DuelJianghuRoomConfig, investAmount: number): DuelJianghuRoundPlan {
        const modeIndex = Math.max(0, this.duelJianghuRoundSerial - 1) % 4;
        const selectedName = selected.name;
        if (modeIndex === 1) {
            const targets = this.pickDuelJianghuRooms(2);
            const targetRoomIds = targets.map((room) => room.id);
            const targetNames = targets.map((room) => room.name);
            const success = targetRoomIds.indexOf(selected.id) < 0;
            return {
                success,
                modeName: '\u6c5f\u6e56\u53cc\u715e',
                targetRoomIds,
                targetRoomNames: targetNames,
                killerKinds: ['doubleMale', 'doubleFemale'],
                investAmount,
                rewardAmount: success ? Number((investAmount * 1.8).toFixed(4)) : 0,
                description: success
                    ? `\u6c5f\u6e56\u53cc\u715e\u53bb\u4e86\u3010${targetNames.join('\u3001')}\u3011\uff0c\u4f60\u5728\u3010${selectedName}\u3011\u6210\u529f\u8eb2\u8fc7\u3002`
                    : `\u6c5f\u6e56\u53cc\u715e\u51b2\u5165\u3010${selectedName}\u3011\uff0c\u672c\u671f\u8eb2\u907f\u5931\u8d25\u3002`,
            };
        }
        if (modeIndex === 2) {
            const target = this.pickDuelJianghuRooms(1)[0] || selected;
            const specialKindsByRoom = this.createDuelJianghuSpecialRoomKinds();
            const targetSpecialKind = specialKindsByRoom[target.id] || 'guardSoldier';
            const targetHasGeneral = targetSpecialKind === 'general';
            const selectedTargetRoom = target.id === selected.id;
            const success = targetHasGeneral ? selectedTargetRoom : !selectedTargetRoom;
            const rewardMultiplier = targetHasGeneral ? 2.35 : 1.55;
            return {
                success,
                modeName: '\u53db\u95e8\u9006\u5f92',
                targetRoomIds: [target.id],
                targetRoomNames: [target.name],
                killerKinds: ['rebel'],
                specialKind: targetSpecialKind,
                specialKindsByRoom,
                investAmount,
                rewardAmount: success ? Number((investAmount * rewardMultiplier).toFixed(4)) : 0,
                description: this.getDuelJianghuRebelSpecialDescription(selectedName, selected.id, target.name, target.id, targetSpecialKind, success),
            };
        }
        if (modeIndex === 3) {
            const target = this.pickDuelJianghuRooms(1)[0] || selected;
            const specialKindsByRoom = this.createDuelJianghuSpecialRoomKinds();
            const targetSpecialKind = specialKindsByRoom[target.id] || 'general';
            const targetHasGeneral = targetSpecialKind === 'general';
            const selectedTargetRoom = target.id === selected.id;
            const success = targetHasGeneral ? selectedTargetRoom : !selectedTargetRoom;
            const rewardMultiplier = targetHasGeneral ? 2.35 : 1.55;
            return {
                success,
                modeName: '\u53db\u95e8\u9006\u5f92',
                targetRoomIds: [target.id],
                targetRoomNames: [target.name],
                killerKinds: ['rebel'],
                specialKind: targetSpecialKind,
                specialKindsByRoom,
                investAmount,
                rewardAmount: success ? Number((investAmount * rewardMultiplier).toFixed(4)) : 0,
                description: this.getDuelJianghuRebelSpecialDescription(selectedName, selected.id, target.name, target.id, targetSpecialKind, success),
            };
        }

        const target = this.pickDuelJianghuRooms(1)[0] || selected;
        const success = target.id !== selected.id;
        return {
            success,
            modeName: '\u523a\u5ba2',
            targetRoomIds: [target.id],
            targetRoomNames: [target.name],
            killerKinds: ['assassin'],
            investAmount,
            rewardAmount: success ? Number((investAmount * 1.5163).toFixed(4)) : 0,
            description: success
                ? `\u523a\u5ba2\u53bb\u4e86\u3010${target.name}\u3011\uff0c\u4f60\u5728\u3010${selectedName}\u3011\u8eb2\u907f\u6210\u529f\u3002`
                : `\u523a\u5ba2\u8fdb\u5165\u3010${selectedName}\u3011\uff0c\u4f60\u672c\u671f\u88ab\u627e\u5230\u4e86\u3002`,
        };
    }
    protected pickDuelJianghuRooms(count: number, excluded: DuelJianghuRoomId[] = []): DuelJianghuRoomConfig[] {
        const pool = HomeConfig.DUEL_JIANGHU_ROOM_LABELS.filter((room) => excluded.indexOf(room.id) < 0);
        const output: DuelJianghuRoomConfig[] = [];
        while (output.length < count && pool.length > 0) {
            const index = Math.floor(Math.random() * pool.length);
            const [room] = pool.splice(index, 1);
            output.push(room);
        }
        return output;
    }
    protected createDuelJianghuSpecialRoomKinds(): Partial<Record<DuelJianghuRoomId, DuelJianghuSpecialRoomKind>> {
        const output: Partial<Record<DuelJianghuRoomId, DuelJianghuSpecialRoomKind>> = {};
        let generalCount = 0;
        let guardCount = 0;
        HomeConfig.DUEL_JIANGHU_ROOM_LABELS.forEach((room) => {
            const kind: DuelJianghuSpecialRoomKind = Math.random() < 0.5 ? 'general' : 'guardSoldier';
            output[room.id] = kind;
            if (kind === 'general') generalCount += 1;
            if (kind === 'guardSoldier') guardCount += 1;
        });

        if (HomeConfig.DUEL_JIANGHU_ROOM_LABELS.length > 1 && (generalCount === 0 || guardCount === 0)) {
            const room = this.pickDuelJianghuRooms(1)[0];
            if (room) output[room.id] = generalCount === 0 ? 'general' : 'guardSoldier';
        }
        return output;
    }
    protected getDuelJianghuRebelSpecialDescription(
        selectedName: string,
        selectedId: DuelJianghuRoomId,
        targetName: string,
        targetId: DuelJianghuRoomId,
        targetSpecialKind: DuelJianghuSpecialRoomKind,
        success: boolean,
    ): string {
        if (targetSpecialKind === 'general') {
            return targetId === selectedId
                ? `\u53db\u95e8\u9006\u5f92\u95ef\u5165\u3010${selectedName}\u3011\uff0c\u88ab\u767e\u6218\u5c06\u519b\u53cd\u6740\u3002`
                : `\u53db\u95e8\u9006\u5f92\u95ef\u5165\u3010${targetName}\u3011\uff0c\u88ab\u767e\u6218\u5c06\u519b\u53cd\u6740\uff0c\u4f60\u5728\u3010${selectedName}\u3011\u672a\u5f97\u5e87\u62a4\uff0c\u672c\u671f\u8eb2\u907f\u5931\u8d25\u3002`;
        }

        return success
            ? `\u53db\u95e8\u9006\u5f92\u95ef\u5165\u3010${targetName}\u3011\uff0c\u51fb\u7834\u5217\u9635\u5175\u5352\uff0c\u4f60\u5728\u3010${selectedName}\u3011\u6210\u529f\u8eb2\u8fc7\u3002`
            : `\u53db\u95e8\u9006\u5f92\u95ef\u5165\u3010${selectedName}\u3011\uff0c\u5217\u9635\u5175\u5352\u53cd\u6740\u5931\u8d25\u3002`;
    }
    protected getDuelJianghuKilledRoomIds(plan: DuelJianghuRoundPlan): DuelJianghuRoomId[] {
        const targetRoomIds = new Set(plan.targetRoomIds);
        if (plan.specialKindsByRoom) {
            const targetRoomId = plan.targetRoomIds[0];
            const targetSpecialKind = targetRoomId ? plan.specialKindsByRoom[targetRoomId] : undefined;
            return targetSpecialKind === 'guardSoldier' ? Array.from(targetRoomIds) : [];
        }
        return Array.from(targetRoomIds);
    }
    protected getDuelJianghuRoomById(roomId: DuelJianghuRoomId | ''): DuelJianghuRoomConfig | null {
        return HomeConfig.DUEL_JIANGHU_ROOM_LABELS.find((room) => room.id === roomId) || null;
    }
    protected showDuelJianghuResultPopup(page: Node, outcome: DuelJianghuRoundOutcome): void {
        this.unschedule(this.duelJianghuCountdownTick);
        const popup = this.ensureDuelJianghuResultPopup(page);
        popup.active = true;
        popup.setSiblingIndex((page.children.length || 1) - 1);
        const title = popup.getChildByName('JianghuResultTitleLabel')?.getComponent(Label);
        if (title) {
            title.node.active = true;
            title.string = outcome.success ? '\u8eb2\u907f\u6210\u529f' : '\u8eb2\u907f\u5931\u8d25';
            title.color = outcome.success ? new Color(255, 229, 110, 255) : new Color(215, 218, 230, 255);
        }
        const mode = popup.getChildByName('JianghuResultModeLabel')?.getComponent(Label);
        if (mode) mode.string = `\u672c\u671f\uff1a${outcome.modeName}  \u76ee\u6807\uff1a${outcome.targetRoomNames.join('\u3001')}`;
        const desc = popup.getChildByName('JianghuResultDescLabel')?.getComponent(Label);
        if (desc) desc.string = outcome.description;
        const invest = popup.getChildByName('JianghuResultInvestLabel')?.getComponent(Label);
        if (invest) invest.string = `\u6295\u5165 ${this.formatDuelJianghuYuanbaoAmount(outcome.investAmount)}`;
        const reward = popup.getChildByName('JianghuResultRewardLabel')?.getComponent(Label);
        if (reward) reward.string = `\u83b7\u5f97 ${this.formatDuelJianghuYuanbaoAmount(outcome.rewardAmount)}`;
        this.scheduleDuelJianghuResultPopupAutoClose(page, popup);
    }
    private scheduleDuelJianghuResultPopupAutoClose(page: Node, popup: Node): void {
        const resultPopup = popup as DuelJianghuResultPopupNode;
        const token = Date.now() + Math.random();
        resultPopup.__jianghuResultAutoCloseToken = token;
        this.scheduleOnce(() => {
            if (!page.isValid || !resultPopup.isValid || !page.active || !resultPopup.active) return;
            if (resultPopup.__jianghuResultAutoCloseToken !== token) return;
            resultPopup.__jianghuResultAutoCloseToken = undefined;
            this.closeDuelJianghuResultPopup(page);
        }, HomeConfig.DUEL_JIANGHU_RESULT_POPUP_AUTO_CLOSE_SECONDS);
    }
    protected formatDuelJianghuYuanbaoAmount(value: number): string {
        return value.toFixed(4).replace(/\.?0+$/, '');
    }
}
