import { Label, Node } from 'cc';
import * as HomeConfig from './HomeConfig';
import { HomeViewBase } from './HomeViewBase';

type DuelJianghuActorRuntime = {
    node: Node;
    kind: string;
};

abstract class HomeFeatureDuelRoundClockHost extends HomeViewBase {
    protected abstract duelJianghuCountdown: number;
    protected abstract duelJianghuNpcSpawnInProgress: boolean;
    protected abstract duelJianghuPreviewActive: boolean;
    protected abstract duelJianghuRoundActive: boolean;
    protected abstract duelJianghuRoundSerial: number;

    protected abstract playDuelJianghuPreviewRound(page: Node): Promise<void>;
    protected abstract prepareDuelJianghuRoomActorsForRound(page: Node): Promise<void>;
    protected abstract removeDuelJianghuActors(page: Node, predicate?: (actor: DuelJianghuActorRuntime) => boolean): void;
    protected abstract resolveDuelJianghuRound(page: Node, serial: number): Promise<void>;
}

/**
 * 江湖逃杀的回合计时、暂停/重置与结果关闭流程。
 * 结算、预演和演员管理继续由宿主运行时提供。
 */
export abstract class HomeFeatureDuelRoundClock extends HomeFeatureDuelRoundClockHost {
    protected duelJianghuCountdownTick(): void {
        this.tickDuelJianghuCountdown();
    }
    protected startDuelJianghuCountdown(page: Node, reset: boolean): void {
        if (reset) this.duelJianghuCountdown = HomeConfig.DUEL_JIANGHU_ROUND_SECONDS;
        this.updateDuelJianghuCountdownLabel(page);
        this.unschedule(this.duelJianghuCountdownTick);
        this.schedule(this.duelJianghuCountdownTick, 1);
    }
    protected tickDuelJianghuCountdown(): void {
        const page = this.getActiveDuelJianghuPage();
        if (!page) {
            this.unschedule(this.duelJianghuCountdownTick);
            return;
        }
        if (page.getChildByName('JianghuResultPopup')?.active) return;

        this.duelJianghuCountdown = Math.max(0, this.duelJianghuCountdown - 1);
        this.updateDuelJianghuCountdownLabel(page);
        if (this.duelJianghuCountdown > 0) return;

        this.unschedule(this.duelJianghuCountdownTick);
        if (this.duelJianghuRoundActive) {
            const serial = this.duelJianghuRoundSerial;
            void this.resolveDuelJianghuRound(page, serial);
            return;
        }

        void this.playDuelJianghuPreviewRound(page);
    }
    protected updateDuelJianghuCountdownLabel(page: Node): void {
        const label = page
            .getChildByName('JianghuTopInfoRoot')
            ?.getChildByName('JianghuKillerSecondLabel')
            ?.getComponent(Label);
        if (label) label.string = `${this.duelJianghuCountdown}`;
    }
    protected getActiveDuelJianghuPage(): Node | null {
        const panel = this.findNode('DuelPanel');
        const page = panel ? this.findNode('DuelJianghuTaoshaPage', panel) : this.findNode('DuelJianghuTaoshaPage');
        return page?.active ? page : null;
    }
    protected stopDuelJianghuGameplay(page?: Node | null): void {
        this.unschedule(this.duelJianghuCountdownTick);
        this.duelJianghuRoundActive = false;
        this.duelJianghuPreviewActive = false;
        this.duelJianghuCountdown = HomeConfig.DUEL_JIANGHU_ROUND_SECONDS;
        this.duelJianghuNpcSpawnInProgress = false;
        if (page?.isValid) {
            const popup = page.getChildByName('JianghuResultPopup');
            if (popup) popup.active = false;
            this.updateDuelJianghuCountdownLabel(page);
            this.removeDuelJianghuActors(page);
        }
    }
    protected closeDuelJianghuResultPopup(page: Node): void {
        const popup = page.getChildByName('JianghuResultPopup');
        if (popup) popup.active = false;
        this.duelJianghuRoundActive = false;
        this.duelJianghuCountdown = HomeConfig.DUEL_JIANGHU_ROUND_SECONDS;
        this.removeDuelJianghuActors(page, (actor) => actor.kind !== 'common' && actor.kind !== 'lobbyCommon' && actor.kind !== 'player');
        this.updateDuelJianghuCountdownLabel(page);
        this.startDuelJianghuCountdown(page, true);
        void this.prepareDuelJianghuRoomActorsForRound(page);
    }
}
