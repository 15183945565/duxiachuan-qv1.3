import { BlockInputEvents, Color, EventTouch, Graphics, Label, Node, Sprite, SpriteFrame, Tween, UIOpacity, UITransform, Vec3, sp, tween } from 'cc';
import * as HomeConfig from './HomeConfig';
import type { DuelLuanshiFaction, DuelLuanshiSkillConfig } from './HomeConfig';
import { HomeViewBase } from './HomeViewBase';

const skillEffectHideTokens = new WeakMap<Node, number>();
const skillEffectSpinePaths = new WeakMap<Node, string>();
const avatarRoamTokens = new WeakMap<Node, number>();
const autoFightCallbacks = new WeakMap<Node, () => void>();
const playerSkillBusyPages = new WeakSet<Node>();
const skillIconEffectCallbacks = new WeakMap<Node, () => void>();
const skillIconEffectFrameCache = new Map<string, SpriteFrame>();
const normalAttackCallbacks = new WeakMap<Node, () => void>();
const normalAttackHideTokens = new WeakMap<Node, number>();
const normalAttackSpinePaths = new WeakMap<Node, string>();
const roundTickCallbacks = new WeakMap<Node, () => void>();
const roundRestartCallbacks = new WeakMap<Node, () => void>();

type DuelLuanshiPhase = 'skill' | 'settle' | 'result';

type DuelLuanshiPageRuntime = Node & {
    duelLuanshiFaction?: DuelLuanshiFaction;
    duelLuanshiRoundIndex?: number;
    duelLuanshiRoundStartedAtMs?: number;
    duelLuanshiPhase?: DuelLuanshiPhase;
    duelLuanshiWudangPower?: number;
    duelLuanshiGaibangPower?: number;
    duelLuanshiRoundWinner?: DuelLuanshiFaction;
};

type DuelLuanshiSkillEffectLayout = {
    startX: number;
    targetX: number;
    y: number;
    targetY: number;
    scaleX: number;
    scaleY: number;
};

type DuelLuanshiNumberSpriteSpec = {
    path: string;
    width: number;
    height: number;
};

type DuelLuanshiCombatNumberKind = 'damage' | 'critical' | 'defense';
type DuelLuanshiCombatNumberScale = 'skill' | 'avatar';
type DuelLuanshiAvatarSide = 'left' | 'right';

abstract class HomeFeatureDuelLuanshiBattleHost extends HomeViewBase {
    protected abstract getOrCreateDuelLuanshiNode(name: string, parent: Node, width: number, height: number, x: number, y: number): Node;
    protected abstract getOrCreateDuelLuanshiSkin(name: string, parent: Node, width: number, height: number, x: number, y: number, skinPath: string): Node;
    protected abstract setDuelLuanshiBottomDockCollapsed(panel: Node, page: Node, collapsed: boolean, animated: boolean): void;
    protected abstract playDuelJianghuSkeletonAnimation(target: sp.Skeleton, candidates: string[], loop: boolean): number;
    protected abstract prepareSkeletonRenderer(target: sp.Skeleton | null): void;
}

export abstract class HomeFeatureDuelLuanshiBattle extends HomeFeatureDuelLuanshiBattleHost {
    protected setupDuelLuanshiPreJoinState(panel: Node, page: Node): void {
        const runtime = page as DuelLuanshiPageRuntime;
        runtime.duelLuanshiRoundIndex = 0;
        runtime.duelLuanshiFaction = undefined;
        this.ensureDuelLuanshiTimer(page);
        this.ensureDuelLuanshiRoundHud(page);
        this.ensureDuelLuanshiBattlefield(page);
        this.ensureDuelLuanshiJoinLayer(panel, page);
        this.ensureDuelLuanshiSkillSlots(panel, page).active = false;
        this.setDuelLuanshiBottomDockCollapsed(panel, page, true, false);
        this.startDuelLuanshiAutoFight(page);
        this.startDuelLuanshiNormalAttackLoop(page);
        this.startDuelLuanshiRound(panel, page);
    }

    protected stopDuelLuanshiBattleState(page: Node): void {
        this.stopDuelLuanshiRoundLoop(page);
        this.hideDuelLuanshiResultPopup(page);
        this.stopDuelLuanshiAutoFight(page);
        this.stopDuelLuanshiNormalAttackLoop(page);
        playerSkillBusyPages.delete(page);
        this.walkDuelLuanshiNodes(page, (node) => {
            Tween.stopAllByTarget(node);
            if (node.name.startsWith('LuanshiAvatarSlot_')) {
                avatarRoamTokens.set(node, (avatarRoamTokens.get(node) || 0) + 1);
            }
            if (node.name.startsWith('LuanshiSkillIconFrameEffect_')) {
                this.stopDuelLuanshiSkillIconFrameEffect(node);
            }
            if (node.name.startsWith('LuanshiSkillEffect_')) {
                this.hideDuelLuanshiSkillEffect(node);
            }
            if (node.name.startsWith('LuanshiNormalAttack_')) {
                this.hideDuelLuanshiNormalAttackEffect(node);
            }
        });
    }

    protected ensureDuelLuanshiTimer(page: Node): void {
        this.getOrCreateDuelLuanshiSkin(
            'LuanshiZhengxiongTimerBg',
            page,
            HomeConfig.DUEL_LUANSHI_TIMER_BG_WIDTH,
            HomeConfig.DUEL_LUANSHI_TIMER_BG_HEIGHT,
            0,
            HomeConfig.DUEL_LUANSHI_TIMER_Y,
            HomeConfig.UI_DUEL_LUANSHI_TIMER_BG,
        ).setSiblingIndex((page.children.length || 1) - 1);
        let label = page.getChildByName('LuanshiZhengxiongTimerLabel')?.getComponent(Label);
        if (!label) label = this.createLabel(page, 'LuanshiZhengxiongTimerLabel', '', 30, 0, HomeConfig.DUEL_LUANSHI_TIMER_Y, 430, 46, new Color(83, 255, 108, 255));
        label.string = `\u52a9\u529b\u5269\u4f59\u65f6\u95f4: ${this.formatDuelLuanshiCountdown(HomeConfig.DUEL_LUANSHI_SKILL_PHASE_SECONDS)}`;
        label.fontSize = 26;
        label.lineHeight = 34;
        label.enableOutline = true;
        label.outlineColor = new Color(64, 38, 18, 255);
        label.outlineWidth = 2;
        label.node.active = true;
        label.node.setSiblingIndex((page.children.length || 1) - 1);
    }

    protected ensureDuelLuanshiRoundHud(page: Node): void {
        const hud = page.getChildByName('LuanshiZhengxiongTopHud');
        if (!hud) return;

        this.ensureDuelLuanshiHealthPercentLabel(hud, 'Wudang', HomeConfig.DUEL_LUANSHI_HP_LEFT_X);
        this.ensureDuelLuanshiHealthPercentLabel(hud, 'Gaibang', HomeConfig.DUEL_LUANSHI_HP_RIGHT_X);
        this.ensureDuelLuanshiPeriodTag(hud);
        this.updateDuelLuanshiCampPowerUi(page, false);
    }

    protected ensureDuelLuanshiHealthPercentLabel(hud: Node, suffix: string, x: number): Label {
        const nodeName = `LuanshiZhengxiong${suffix}PercentLabel`;
        const existingNode = hud.getChildByName(nodeName);
        let label = existingNode?.getComponent(Label);
        if (!label) {
            label = this.createLabel(
                hud,
                nodeName,
                '50.00%',
                22,
                x,
                HomeConfig.DUEL_LUANSHI_HP_PERCENT_LABEL_Y,
                HomeConfig.DUEL_LUANSHI_HP_PERCENT_LABEL_WIDTH,
                HomeConfig.DUEL_LUANSHI_HP_PERCENT_LABEL_HEIGHT,
                new Color(255, 214, 78, 255),
            );
            label.fontSize = 22;
            label.lineHeight = 28;
            label.color = new Color(255, 214, 78, 255);
            label.enableOutline = true;
            label.outlineColor = new Color(88, 48, 18, 255);
            label.outlineWidth = 2;
        }
        label.node.active = true;
        label.node.setSiblingIndex((hud.children.length || 1) - 1);
        return label;
    }

    protected ensureDuelLuanshiPeriodTag(hud: Node): void {
        let bg = hud.getChildByName('LuanshiZhengxiongPeriodTagBg');
        if (!bg) {
            bg = this.createNode(
                'LuanshiZhengxiongPeriodTagBg',
                hud,
                HomeConfig.DUEL_LUANSHI_PERIOD_TAG_WIDTH,
                HomeConfig.DUEL_LUANSHI_PERIOD_TAG_HEIGHT,
                0,
                HomeConfig.DUEL_LUANSHI_PERIOD_TAG_Y,
            );
            this.drawRect(bg, HomeConfig.DUEL_LUANSHI_PERIOD_TAG_WIDTH, HomeConfig.DUEL_LUANSHI_PERIOD_TAG_HEIGHT, new Color(0, 0, 0, 130));
            const opacity = bg.addComponent(UIOpacity);
            opacity.opacity = 155;
        }
        bg.active = true;
        bg.setPosition(0, HomeConfig.DUEL_LUANSHI_PERIOD_TAG_Y, 0);
        bg.setSiblingIndex((hud.children.length || 1) - 1);

        let label = hud.getChildByName('LuanshiZhengxiongPeriodLabel')?.getComponent(Label);
        if (!label) {
            label = this.createLabel(
                hud,
                'LuanshiZhengxiongPeriodLabel',
                '\u7b2c1\u671f',
                HomeConfig.DUEL_LUANSHI_PERIOD_LABEL_FONT_SIZE,
                0,
                HomeConfig.DUEL_LUANSHI_PERIOD_TAG_Y,
                HomeConfig.DUEL_LUANSHI_PERIOD_TAG_WIDTH,
                HomeConfig.DUEL_LUANSHI_PERIOD_TAG_HEIGHT,
                new Color(255, 244, 206, 255),
            );
        }
        label.fontSize = HomeConfig.DUEL_LUANSHI_PERIOD_LABEL_FONT_SIZE;
        label.lineHeight = HomeConfig.DUEL_LUANSHI_PERIOD_LABEL_FONT_SIZE + 6;
        label.color = new Color(255, 244, 206, 255);
        label.enableOutline = true;
        label.outlineColor = new Color(44, 25, 10, 255);
        label.outlineWidth = 2;
        label.node.active = true;
        label.node.setPosition(0, HomeConfig.DUEL_LUANSHI_PERIOD_TAG_Y, 0);
        label.node.setSiblingIndex((hud.children.length || 1) - 1);
    }

    protected startDuelLuanshiRound(panel: Node, page: Node): void {
        this.stopDuelLuanshiRoundLoop(page);
        this.hideDuelLuanshiResultPopup(page);
        const runtime = page as DuelLuanshiPageRuntime;
        runtime.duelLuanshiRoundIndex = (runtime.duelLuanshiRoundIndex || 0) + 1;
        runtime.duelLuanshiRoundStartedAtMs = Date.now();
        runtime.duelLuanshiPhase = 'skill';
        runtime.duelLuanshiFaction = undefined;
        runtime.duelLuanshiRoundWinner = undefined;
        runtime.duelLuanshiWudangPower = HomeConfig.DUEL_LUANSHI_CAMP_POWER_START;
        runtime.duelLuanshiGaibangPower = HomeConfig.DUEL_LUANSHI_CAMP_POWER_START;
        playerSkillBusyPages.delete(page);

        const joinLayer = page.getChildByName('LuanshiZhengxiongJoinLayer');
        if (joinLayer) {
            joinLayer.active = true;
            joinLayer.setSiblingIndex((page.children.length || 1) - 1);
        }
        this.ensureDuelLuanshiSkillSlots(panel, page).active = false;
        this.setDuelLuanshiBottomDockCollapsed(panel, page, true, true);
        this.updateDuelLuanshiRoundHud(page, HomeConfig.DUEL_LUANSHI_SKILL_PHASE_SECONDS, 'skill');
        this.updateDuelLuanshiCampPowerUi(page, false);
        this.showDuelLuanshiRoundStartFx(page);

        const callback = (): void => this.updateDuelLuanshiRoundTick(panel, page);
        roundTickCallbacks.set(page, callback);
        this.schedule(callback, 0.25);
        callback();
    }

    protected stopDuelLuanshiRoundLoop(page: Node): void {
        const tick = roundTickCallbacks.get(page);
        if (tick) {
            this.unschedule(tick);
            roundTickCallbacks.delete(page);
        }

        const restart = roundRestartCallbacks.get(page);
        if (restart) {
            this.unschedule(restart);
            roundRestartCallbacks.delete(page);
        }
    }

    protected updateDuelLuanshiRoundTick(panel: Node, page: Node): void {
        if (!page.isValid || !page.active) return;
        const runtime = page as DuelLuanshiPageRuntime;
        const startedAt = runtime.duelLuanshiRoundStartedAtMs || Date.now();
        const elapsed = Math.max(0, (Date.now() - startedAt) / 1000);

        if (elapsed >= HomeConfig.DUEL_LUANSHI_ROUND_SECONDS) {
            this.finishDuelLuanshiRound(panel, page);
            return;
        }

        if (elapsed >= HomeConfig.DUEL_LUANSHI_SKILL_PHASE_SECONDS) {
            if (runtime.duelLuanshiPhase !== 'settle') {
                this.enterDuelLuanshiSettlePhase(page);
            }
            this.updateDuelLuanshiRoundHud(
                page,
                Math.ceil(HomeConfig.DUEL_LUANSHI_ROUND_SECONDS - elapsed),
                'settle',
            );
            return;
        }

        runtime.duelLuanshiPhase = 'skill';
        this.updateDuelLuanshiRoundHud(
            page,
            Math.ceil(HomeConfig.DUEL_LUANSHI_SKILL_PHASE_SECONDS - elapsed),
            'skill',
        );
    }

    protected enterDuelLuanshiSettlePhase(page: Node): void {
        const runtime = page as DuelLuanshiPageRuntime;
        runtime.duelLuanshiPhase = 'settle';
        playerSkillBusyPages.delete(page);
        const joinLayer = page.getChildByName('LuanshiZhengxiongJoinLayer');
        if (joinLayer) joinLayer.active = false;
        this.showToast('\u672c\u671f\u8fdb\u5165\u7ed3\u7b97\u65f6\u95f4\uff0c\u73a9\u5bb6\u6280\u80fd\u5df2\u9501\u5b9a');
    }

    protected finishDuelLuanshiRound(panel: Node, page: Node): void {
        this.stopDuelLuanshiRoundLoop(page);
        const runtime = page as DuelLuanshiPageRuntime;
        if (runtime.duelLuanshiPhase === 'result') return;
        runtime.duelLuanshiPhase = 'result';
        playerSkillBusyPages.delete(page);
        const joinLayer = page.getChildByName('LuanshiZhengxiongJoinLayer');
        if (joinLayer) joinLayer.active = false;

        const winner: DuelLuanshiFaction = Math.random() < 0.5 ? 'wudang' : 'gaibang';
        runtime.duelLuanshiRoundWinner = winner;
        this.applyDuelLuanshiFinalWinnerPower(page, winner);
        this.updateDuelLuanshiRoundHud(page, 0, 'result');
        if (runtime.duelLuanshiFaction) {
            this.showDuelLuanshiResultPopup(page, runtime.duelLuanshiFaction, winner);
        }

        const restart = (): void => {
            roundRestartCallbacks.delete(page);
            if (!page.isValid || !page.active) return;
            this.startDuelLuanshiRound(panel, page);
        };
        roundRestartCallbacks.set(page, restart);
        this.scheduleOnce(restart, HomeConfig.DUEL_LUANSHI_RESULT_POPUP_SECONDS);
    }

    protected updateDuelLuanshiRoundHud(page: Node, remainingSeconds: number, phase: DuelLuanshiPhase): void {
        const label = page.getChildByName('LuanshiZhengxiongTimerLabel')?.getComponent(Label);
        if (label) {
            const prefix = phase === 'settle'
                ? '\u7ed3\u7b97\u5269\u4f59\u65f6\u95f4'
                : phase === 'result'
                    ? '\u672c\u671f\u5df2\u7ed3\u7b97'
                    : '\u52a9\u529b\u5269\u4f59\u65f6\u95f4';
            label.string = phase === 'result'
                ? prefix
                : `${prefix}: ${this.formatDuelLuanshiCountdown(Math.max(0, remainingSeconds))}`;
        }

        const runtime = page as DuelLuanshiPageRuntime;
        const periodLabel = page.getChildByName('LuanshiZhengxiongTopHud')?.getChildByName('LuanshiZhengxiongPeriodLabel')?.getComponent(Label);
        if (periodLabel) {
            periodLabel.string = `\u7b2c${runtime.duelLuanshiRoundIndex || 1}\u671f`;
        }
    }

    protected formatDuelLuanshiCountdown(seconds: number): string {
        const safe = Math.max(0, Math.ceil(seconds));
        const minutesValue = Math.floor(safe / 60);
        const restValue = safe % 60;
        const minutes = minutesValue < 10 ? `0${minutesValue}` : `${minutesValue}`;
        const rest = restValue < 10 ? `0${restValue}` : `${restValue}`;
        return `00:${minutes}:${rest}`;
    }

    protected showDuelLuanshiRoundStartFx(page: Node): void {
        const legacyLayer = page.getChildByName('LuanshiZhengxiongRoundStartFxLayer');
        if (legacyLayer) {
            const legacyBlocker = legacyLayer.getComponent(BlockInputEvents);
            if (legacyBlocker) legacyBlocker.enabled = false;
            legacyLayer.active = false;
        }

        const layer = this.getOrCreateDuelLuanshiNode(
            'LuanshiZhengxiongRoundStartFxRoot',
            page,
            HomeConfig.DUEL_LUANSHI_ROUND_START_ICON_WIDTH,
            HomeConfig.DUEL_LUANSHI_ROUND_START_ICON_HEIGHT,
            0,
            HomeConfig.DUEL_LUANSHI_ROUND_START_ICON_Y,
        );
        const blocker = layer.getComponent(BlockInputEvents);
        if (blocker) blocker.enabled = false;
        layer.setSiblingIndex((page.children.length || 1) - 1);
        const icon = this.getOrCreateDuelLuanshiSkin(
            'LuanshiZhengxiongDuelIconFx',
            layer,
            HomeConfig.DUEL_LUANSHI_ROUND_START_ICON_WIDTH,
            HomeConfig.DUEL_LUANSHI_ROUND_START_ICON_HEIGHT,
            0,
            0,
            HomeConfig.UI_DUEL_LUANSHI_DUEL_ICON,
        );
        const opacity = icon.getComponent(UIOpacity) || icon.addComponent(UIOpacity);
        Tween.stopAllByTarget(icon);
        Tween.stopAllByTarget(opacity);
        icon.active = true;
        icon.setPosition(0, 0, 0);
        icon.setScale(3.1, 3.1, 1);
        opacity.opacity = 0;
        tween(icon)
            .to(0.22, { scale: new Vec3(1, 1, 1) }, { easing: 'backOut' })
            .delay(0.32)
            .to(0.22, { scale: new Vec3(2.85, 2.85, 1) }, { easing: 'quadIn' })
            .call(() => { if (icon.isValid) icon.active = false; })
            .start();
        tween(opacity)
            .to(0.08, { opacity: 255 })
            .delay(0.5)
            .to(0.18, { opacity: 0 })
            .start();
    }

    protected ensureDuelLuanshiCampPower(page: Node): { wudang: number; gaibang: number } {
        const runtime = page as DuelLuanshiPageRuntime;
        if (typeof runtime.duelLuanshiWudangPower !== 'number') {
            runtime.duelLuanshiWudangPower = HomeConfig.DUEL_LUANSHI_CAMP_POWER_START;
        }
        if (typeof runtime.duelLuanshiGaibangPower !== 'number') {
            runtime.duelLuanshiGaibangPower = HomeConfig.DUEL_LUANSHI_CAMP_POWER_START;
        }
        return {
            wudang: runtime.duelLuanshiWudangPower,
            gaibang: runtime.duelLuanshiGaibangPower,
        };
    }

    protected updateDuelLuanshiCampPowerUi(page: Node, animated: boolean): void {
        const hud = page.getChildByName('LuanshiZhengxiongTopHud');
        if (!hud) return;
        const power = this.ensureDuelLuanshiCampPower(page);
        const total = Math.max(1, power.wudang + power.gaibang);
        const wudangPercent = power.wudang / total * 100;
        const gaibangPercent = power.gaibang / total * 100;

        const wudangLabel = hud.getChildByName('LuanshiZhengxiongWudangPercentLabel')?.getComponent(Label);
        if (wudangLabel) wudangLabel.string = `${wudangPercent.toFixed(2)}%`;
        const gaibangLabel = hud.getChildByName('LuanshiZhengxiongGaibangPercentLabel')?.getComponent(Label);
        if (gaibangLabel) gaibangLabel.string = `${gaibangPercent.toFixed(2)}%`;

        this.applyDuelLuanshiHpBar(
            hud.getChildByName('LuanshiZhengxiongWudangHpBar'),
            this.getDuelLuanshiHpFillRatio(power.wudang),
            'left',
            animated,
        );
        this.applyDuelLuanshiHpBar(
            hud.getChildByName('LuanshiZhengxiongGaibangHpBar'),
            this.getDuelLuanshiHpFillRatio(power.gaibang),
            'right',
            animated,
        );
    }

    protected getDuelLuanshiHpFillRatio(power: number): number {
        return this.clamp(
            power / HomeConfig.DUEL_LUANSHI_CAMP_POWER_START,
            HomeConfig.DUEL_LUANSHI_CAMP_POWER_MIN / HomeConfig.DUEL_LUANSHI_CAMP_POWER_START,
            1,
        );
    }

    protected applyDuelLuanshiHpBar(bar: Node | null, ratio: number, side: DuelLuanshiAvatarSide, animated: boolean): void {
        if (!bar) return;
        const sprite = bar.getComponent(Sprite);
        if (sprite) {
            sprite.type = Sprite.Type.FILLED;
            sprite.fillType = Sprite.FillType.HORIZONTAL;
            sprite.fillStart = side === 'left' ? 0 : 1;
            sprite.fillRange = side === 'left' ? ratio : -ratio;
        }

        if (!animated) return;
        Tween.stopAllByTarget(bar);
        bar.setScale(1, 1, 1);
        tween(bar)
            .to(0.08, { scale: new Vec3(1.035, 1.45, 1) }, { easing: 'quadOut' })
            .to(0.14, { scale: new Vec3(1, 1, 1) }, { easing: 'sineOut' })
            .start();
    }

    protected applyDuelLuanshiSkillPowerEffect(
        page: Node,
        config: DuelLuanshiSkillConfig,
        faction: DuelLuanshiFaction,
        sourceKey: string,
    ): void {
        if ((page as DuelLuanshiPageRuntime).duelLuanshiPhase === 'result') return;
        const isPlayer = sourceKey === 'player';
        const isDefense = this.isDuelLuanshiDefenseSkill(config);
        if (isDefense) {
            const gain = this.randomDuelLuanshiRange(isPlayer ? 1.8 : 0.55, isPlayer ? 3.8 : 1.55);
            this.applyDuelLuanshiCampPowerDelta(page, faction, gain, 0, true);
            return;
        }

        const damage = this.randomDuelLuanshiRange(isPlayer ? 3.2 : 0.9, isPlayer ? 6.2 : 2.25);
        this.applyDuelLuanshiCampPowerDelta(page, faction, damage * 0.22, -damage, true);
    }

    protected applyDuelLuanshiNormalAttackPowerEffect(page: Node, attackerSide: DuelLuanshiAvatarSide, critical: boolean): void {
        if ((page as DuelLuanshiPageRuntime).duelLuanshiPhase === 'result') return;
        const faction: DuelLuanshiFaction = attackerSide === 'left' ? 'wudang' : 'gaibang';
        const damage = this.randomDuelLuanshiRange(critical ? 1.35 : 0.45, critical ? 2.55 : 1.15);
        this.applyDuelLuanshiCampPowerDelta(page, faction, damage * 0.16, -damage, true);
    }

    protected applyDuelLuanshiCampPowerDelta(
        page: Node,
        faction: DuelLuanshiFaction,
        ownDelta: number,
        enemyDelta: number,
        animated: boolean,
    ): void {
        const runtime = page as DuelLuanshiPageRuntime;
        const power = this.ensureDuelLuanshiCampPower(page);
        if (faction === 'wudang') {
            runtime.duelLuanshiWudangPower = this.clamp(power.wudang + ownDelta, HomeConfig.DUEL_LUANSHI_CAMP_POWER_MIN, HomeConfig.DUEL_LUANSHI_CAMP_POWER_MAX);
            runtime.duelLuanshiGaibangPower = this.clamp(power.gaibang + enemyDelta, HomeConfig.DUEL_LUANSHI_CAMP_POWER_MIN, HomeConfig.DUEL_LUANSHI_CAMP_POWER_MAX);
        } else {
            runtime.duelLuanshiGaibangPower = this.clamp(power.gaibang + ownDelta, HomeConfig.DUEL_LUANSHI_CAMP_POWER_MIN, HomeConfig.DUEL_LUANSHI_CAMP_POWER_MAX);
            runtime.duelLuanshiWudangPower = this.clamp(power.wudang + enemyDelta, HomeConfig.DUEL_LUANSHI_CAMP_POWER_MIN, HomeConfig.DUEL_LUANSHI_CAMP_POWER_MAX);
        }
        this.updateDuelLuanshiCampPowerUi(page, animated);
    }

    protected applyDuelLuanshiFinalWinnerPower(page: Node, winner: DuelLuanshiFaction): void {
        const runtime = page as DuelLuanshiPageRuntime;
        const winnerPower = this.randomDuelLuanshiRange(108, 120);
        const loserPower = this.randomDuelLuanshiRange(72, 88);
        runtime.duelLuanshiWudangPower = winner === 'wudang' ? winnerPower : loserPower;
        runtime.duelLuanshiGaibangPower = winner === 'gaibang' ? winnerPower : loserPower;
        this.updateDuelLuanshiCampPowerUi(page, true);
    }

    protected showDuelLuanshiResultPopup(page: Node, playerFaction: DuelLuanshiFaction, winner: DuelLuanshiFaction): void {
        const victory = playerFaction === winner;
        const layer = this.getOrCreateDuelLuanshiNode('LuanshiZhengxiongResultLayer', page, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT, 0, 0);
        layer.setSiblingIndex((page.children.length || 1) - 1);
        layer.active = true;

        let dim = layer.getChildByName('LuanshiZhengxiongResultDim');
        if (!dim) {
            dim = this.createNode('LuanshiZhengxiongResultDim', layer, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT, 0, 0);
        }
        if (!dim.getComponent(Graphics)) this.drawRect(dim, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT, new Color(0, 0, 0, 120));
        dim.active = true;
        dim.setSiblingIndex(0);

        const boardHeight = victory
            ? HomeConfig.DUEL_LUANSHI_RESULT_VICTORY_POPUP_HEIGHT
            : HomeConfig.DUEL_LUANSHI_RESULT_DEFEAT_POPUP_HEIGHT;
        const board = this.getOrCreateDuelLuanshiResultEditableSkin(
            'LuanshiZhengxiongResultBoard',
            layer,
            HomeConfig.DUEL_LUANSHI_RESULT_POPUP_WIDTH,
            boardHeight,
            0,
            30,
            victory ? HomeConfig.UI_DUEL_LUANSHI_RESULT_VICTORY_BG : HomeConfig.UI_DUEL_LUANSHI_RESULT_DEFEAT_BG,
        );
        board.setSiblingIndex(1);

        let title = board.getChildByName('LuanshiZhengxiongResultTitle')?.getComponent(Label);
        if (!title) {
            title = this.createLabel(board, 'LuanshiZhengxiongResultTitle', '', 32, 0, 62, 510, 64, new Color(255, 244, 206, 255));
        }
        title.string = `\u6211\u65b9${this.getDuelLuanshiFactionName(playerFaction)}\u9635\u8425${victory ? '\u80dc\u5229' : '\u5931\u8d25'}`;
        title.fontSize = 32;
        title.lineHeight = 42;
        title.color = victory ? new Color(255, 237, 155, 255) : new Color(235, 226, 206, 255);
        title.enableOutline = true;
        title.outlineColor = new Color(58, 32, 12, 255);
        title.outlineWidth = 3;

        let message = board.getChildByName('LuanshiZhengxiongResultMessage')?.getComponent(Label);
        if (!message) {
            message = this.createLabel(board, 'LuanshiZhengxiongResultMessage', '', 26, 0, -18, 470, 60, new Color(255, 244, 206, 255));
        }
        message.string = victory ? '\u606d\u559c\u83b7\u5f97' : '\u4e0b\u6b21\u7ee7\u7eed\u52aa\u529b';
        message.fontSize = 26;
        message.lineHeight = 34;
        message.color = new Color(255, 244, 206, 255);
        message.enableOutline = true;
        message.outlineColor = new Color(58, 32, 12, 255);
        message.outlineWidth = 2;

        const rewardIcon = this.getOrCreateDuelLuanshiResultEditableSkin(
            'LuanshiZhengxiongResultRewardYuanbao',
            board,
            38,
            38,
            55,
            -18,
            HomeConfig.UI_DUEL_YUANBAO_ICON,
        );
        let reward = board.getChildByName('LuanshiZhengxiongResultRewardLabel')?.getComponent(Label);
        if (!reward) {
            reward = this.createLabel(board, 'LuanshiZhengxiongResultRewardLabel', `${HomeConfig.DUEL_LUANSHI_RESULT_REWARD_YUANBAO}`, 28, 102, -18, 90, 42, new Color(255, 244, 206, 255));
        }
        reward.string = `${HomeConfig.DUEL_LUANSHI_RESULT_REWARD_YUANBAO}`;
        reward.fontSize = 28;
        reward.lineHeight = 36;
        reward.enableOutline = true;
        reward.outlineColor = new Color(58, 32, 12, 255);
        reward.outlineWidth = 2;
        rewardIcon.active = victory;
        reward.node.active = victory;

        const opacity = layer.getComponent(UIOpacity) || layer.addComponent(UIOpacity);
        Tween.stopAllByTarget(layer);
        Tween.stopAllByTarget(board);
        Tween.stopAllByTarget(opacity);
        opacity.opacity = 0;
        board.setScale(0.72, 0.72, 1);
        tween(opacity).to(0.16, { opacity: 255 }).start();
        tween(board)
            .to(0.18, { scale: new Vec3(1.06, 1.06, 1) }, { easing: 'backOut' })
            .to(0.1, { scale: new Vec3(1, 1, 1) }, { easing: 'sineOut' })
            .start();
    }

    protected hideDuelLuanshiResultPopup(page: Node): void {
        const layer = page.getChildByName('LuanshiZhengxiongResultLayer');
        if (!layer) return;
        Tween.stopAllByTarget(layer);
        const opacity = layer.getComponent(UIOpacity);
        if (opacity) Tween.stopAllByTarget(opacity);
        layer.active = false;
    }

    protected getOrCreateDuelLuanshiResultEditableSkin(name: string, parent: Node, width: number, height: number, x: number, y: number, skinPath: string): Node {
        const existing = parent.getChildByName(name);
        if (existing) {
            existing.active = true;
            this.applyUiSkinKeepingEditorSize(existing, skinPath, width, height);
            return existing;
        }
        return this.getOrCreateDuelLuanshiSkin(name, parent, width, height, x, y, skinPath);
    }

    protected getDuelLuanshiFactionName(faction: DuelLuanshiFaction): string {
        return faction === 'wudang' ? '\u6b66\u5f53' : '\u4e10\u5e2e';
    }

    protected ensureDuelLuanshiBattlefield(page: Node): void {
        const layer = this.getOrCreateDuelLuanshiNode('LuanshiZhengxiongAvatarLayer', page, HomeConfig.VIEW_WIDTH, 820, 0, 70);
        const positions = [
            { x: -250, y: 315, side: 'left' }, { x: -126, y: 258, side: 'left' }, { x: -292, y: 178, side: 'left' },
            { x: -150, y: 110, side: 'left' }, { x: -258, y: 20, side: 'left' }, { x: -122, y: -66, side: 'left' },
            { x: 250, y: 315, side: 'right' }, { x: 126, y: 258, side: 'right' }, { x: 292, y: 178, side: 'right' },
            { x: 150, y: 110, side: 'right' }, { x: 258, y: 20, side: 'right' }, { x: 122, y: -66, side: 'right' },
        ] as const;
        positions.forEach((position, index) => this.ensureDuelLuanshiAvatar(layer, index, position.x, position.y, position.side));
        this.getOrCreateDuelLuanshiNode('LuanshiZhengxiongSkillEffectLayer', page, HomeConfig.VIEW_WIDTH, 860, 0, 120).setSiblingIndex((page.children.length || 1) - 1);
        this.getOrCreateDuelLuanshiNode('LuanshiZhengxiongDamageNumberLayer', page, HomeConfig.VIEW_WIDTH, 860, 0, 120).setSiblingIndex((page.children.length || 1) - 1);
        layer.setSiblingIndex(2);
    }

    protected ensureDuelLuanshiAvatar(parent: Node, index: number, x: number, y: number, side: 'left' | 'right'): void {
        const slot = this.getOrCreateDuelLuanshiNode(`LuanshiAvatarSlot_${index}`, parent, 140, 140, x, y);
        const avatarPath = HomeConfig.DUEL_LUANSHI_AVATAR_ICON_PATHS[Math.floor(Math.random() * HomeConfig.DUEL_LUANSHI_AVATAR_ICON_PATHS.length)];
        this.getOrCreateDuelLuanshiSkin(`LuanshiAvatarIcon_${index}`, slot, HomeConfig.DUEL_LUANSHI_AVATAR_SIZE, HomeConfig.DUEL_LUANSHI_AVATAR_SIZE, 0, 0, avatarPath).setSiblingIndex(0);
        const oldEffect = slot.getChildByName(`LuanshiAvatarFrameEffect_${index}`);
        if (oldEffect) oldEffect.active = false;
        this.getOrCreateDuelLuanshiSkin(`LuanshiAvatarHp_${index}`, slot, 86, 8, 0, -48, side === 'left' ? HomeConfig.UI_DUEL_LUANSHI_HP_WUDANG : HomeConfig.UI_DUEL_LUANSHI_HP_GAIBANG).setSiblingIndex(2);
        this.startDuelLuanshiAvatarRoamMotion(slot, x, y, side, index);
    }

    protected ensureDuelLuanshiJoinLayer(panel: Node, page: Node): void {
        const layer = this.getOrCreateDuelLuanshiNode('LuanshiZhengxiongJoinLayer', page, HomeConfig.VIEW_WIDTH, HomeConfig.DUEL_LUANSHI_JOIN_LAYER_HEIGHT, 0, 0);
        layer.active = true;
        const left = this.getOrCreateDuelLuanshiJoinButton(layer, 'Wudang', -160, HomeConfig.UI_DUEL_LUANSHI_JOIN_WUDANG, '\u52a0\u5165\u6b66\u5f53');
        const right = this.getOrCreateDuelLuanshiJoinButton(layer, 'Gaibang', 160, HomeConfig.UI_DUEL_LUANSHI_JOIN_GAIBANG, '\u52a0\u5165\u4e10\u5e2e');
        this.bindScaledClick(left, () => this.joinDuelLuanshiFaction(panel, page, 'wudang'));
        this.bindScaledClick(right, () => this.joinDuelLuanshiFaction(panel, page, 'gaibang'));
        this.bindDuelLuanshiJoinLayerFallback(layer, panel, page);
        layer.setSiblingIndex((page.children.length || 1) - 1);
    }

    protected bindDuelLuanshiJoinLayerFallback(layer: Node, panel: Node, page: Node): void {
        layer.off(Node.EventType.TOUCH_END);
        layer.on(Node.EventType.TOUCH_END, (event: EventTouch) => {
            const transform = layer.getComponent(UITransform);
            if (!transform) return;
            const location = event.getUILocation();
            const local = transform.convertToNodeSpaceAR(new Vec3(location.x, location.y, 0));
            const buttonHalfWidth = HomeConfig.DUEL_LUANSHI_JOIN_BUTTON_WIDTH / 2;
            const buttonHalfHeight = HomeConfig.DUEL_LUANSHI_JOIN_BUTTON_HEIGHT / 2;
            const insideY = local.y >= HomeConfig.DUEL_LUANSHI_JOIN_BUTTON_Y - buttonHalfHeight
                && local.y <= HomeConfig.DUEL_LUANSHI_JOIN_BUTTON_Y + buttonHalfHeight;
            if (!insideY) return;

            const hitWudang = local.x >= -160 - buttonHalfWidth && local.x <= -160 + buttonHalfWidth;
            const hitGaibang = local.x >= 160 - buttonHalfWidth && local.x <= 160 + buttonHalfWidth;
            if (!hitWudang && !hitGaibang) return;

            event.propagationStopped = true;
            this.joinDuelLuanshiFaction(panel, page, hitWudang ? 'wudang' : 'gaibang');
        }, this);
    }

    protected getOrCreateDuelLuanshiJoinButton(parent: Node, suffix: string, x: number, skinPath: string, text: string): Node {
        const button = this.getOrCreateDuelLuanshiSkin(`LuanshiJoin${suffix}Button`, parent, HomeConfig.DUEL_LUANSHI_JOIN_BUTTON_WIDTH, HomeConfig.DUEL_LUANSHI_JOIN_BUTTON_HEIGHT, x, HomeConfig.DUEL_LUANSHI_JOIN_BUTTON_Y, skinPath);
        let label = button.getChildByName(`LuanshiJoin${suffix}Label`)?.getComponent(Label);
        if (!label) label = this.createLabel(button, `LuanshiJoin${suffix}Label`, text, 24, 0, 0, 170, 38, new Color(255, 245, 214, 255));
        label.string = text;
        return button;
    }

    protected ensureDuelLuanshiSkillSlots(panel: Node, page: Node): Node {
        const dock = page.getChildByName('LuanshiZhengxiongBottomDock')!;
        const root = this.getOrCreateDuelLuanshiNode('LuanshiZhengxiongSkillSlots', dock, HomeConfig.VIEW_WIDTH, 300, 0, 0);
        const xs = [-270, -90, 90, 270, -270, -90, 90, 270];
        const ys = [-536, -536, -536, -536, -690, -690, -690, -690];
        HomeConfig.DUEL_LUANSHI_SKILL_CONFIGS.forEach((config, index) => {
            const cell = this.getOrCreateDuelLuanshiNode(`LuanshiSkillSlot_${config.id}`, root, HomeConfig.DUEL_LUANSHI_SKILL_SLOT_WIDTH, HomeConfig.DUEL_LUANSHI_SKILL_SLOT_HEIGHT, xs[index], ys[index]);
            const iconSize = this.getDuelLuanshiSkillIconSize(config);
            this.getOrCreateDuelLuanshiSkin(`LuanshiSkillSlotFrame_${config.id}`, cell, HomeConfig.DUEL_LUANSHI_SKILL_SLOT_WIDTH, HomeConfig.DUEL_LUANSHI_SKILL_SLOT_HEIGHT, 0, 0, HomeConfig.UI_DUEL_LUANSHI_SKILL_SLOT).setSiblingIndex(0);
            this.getOrCreateDuelLuanshiSkin(`LuanshiSkillIcon_${config.id}`, cell, iconSize, iconSize, 0, 12, config.iconPath).setSiblingIndex(1);
            this.ensureDuelLuanshiSkillIconFrameEffect(cell, config);
            this.ensureDuelLuanshiSkillCost(cell, config);
            this.bindScaledClick(cell, () => this.playDuelLuanshiSkill(page, config));
        });
        return root;
    }

    protected getDuelLuanshiSkillIconSize(config: DuelLuanshiSkillConfig): number {
        return (config as DuelLuanshiSkillConfig & { iconSize?: number }).iconSize || HomeConfig.DUEL_LUANSHI_SKILL_ICON_SIZE;
    }

    protected getDuelLuanshiSkillIconEffectSize(config: DuelLuanshiSkillConfig): number {
        return (config as DuelLuanshiSkillConfig & { frameEffectSize?: number }).frameEffectSize || HomeConfig.DUEL_LUANSHI_SKILL_ICON_EFFECT_SIZE;
    }

    protected ensureDuelLuanshiSkillIconFrameEffect(cell: Node, config: DuelLuanshiSkillConfig): void {
        if (config.frameEffectPaths.length <= 0) return;
        const effectSize = this.getDuelLuanshiSkillIconEffectSize(config);
        const effect = this.getOrCreateDuelLuanshiSkin(
            `LuanshiSkillIconFrameEffect_${config.id}`,
            cell,
            effectSize,
            effectSize,
            0,
            12,
            config.frameEffectPaths[0],
        );
        effect.setSiblingIndex(2);
        this.startDuelLuanshiSkillIconFrameEffect(effect, config.frameEffectPaths, effectSize);
    }

    protected startDuelLuanshiSkillIconFrameEffect(node: Node, framePaths: readonly string[], effectSize: number): void {
        this.stopDuelLuanshiSkillIconFrameEffect(node);
        let frameIndex = 0;
        const sprite = node.getComponent(Sprite) || node.addComponent(Sprite);
        sprite.type = Sprite.Type.SIMPLE;
        sprite.sizeMode = Sprite.SizeMode.CUSTOM;
        (node.getComponent(UITransform) || node.addComponent(UITransform)).setContentSize(
            effectSize,
            effectSize,
        );

        const applyFrame = (path: string, callback: () => void): void => {
            this.loadDuelLuanshiSkillIconEffectFrame(path)
                .then((frame) => {
                    if (!node.isValid || skillIconEffectCallbacks.get(node) !== callback) return;
                    sprite.spriteFrame = frame;
                    sprite.enabled = true;
                })
                .catch((error) => console.warn('[MainHomeView] luanshi skill icon frame load failed', path, error));
        };

        const callback = (): void => {
            if (!node.isValid) {
                this.stopDuelLuanshiSkillIconFrameEffect(node);
                return;
            }
            frameIndex = (frameIndex + 1) % framePaths.length;
            applyFrame(framePaths[frameIndex], callback);
        };

        skillIconEffectCallbacks.set(node, callback);
        applyFrame(framePaths[0], callback);
        this.schedule(callback, 1 / HomeConfig.DUEL_LUANSHI_SKILL_ICON_EFFECT_FPS);
    }

    protected stopDuelLuanshiSkillIconFrameEffect(node: Node): void {
        const callback = skillIconEffectCallbacks.get(node);
        if (!callback) return;
        this.unschedule(callback);
        skillIconEffectCallbacks.delete(node);
    }

    protected async loadDuelLuanshiSkillIconEffectFrame(path: string): Promise<SpriteFrame> {
        const cached = skillIconEffectFrameCache.get(path);
        if (cached) return cached;
        const frame = await this.loadSpriteFrameAsset(path);
        skillIconEffectFrameCache.set(path, frame);
        return frame;
    }

    protected ensureDuelLuanshiSkillCost(cell: Node, config: DuelLuanshiSkillConfig): void {
        const icon = this.getOrCreateDuelLuanshiSkin(
            `LuanshiSkillCostYuanbao_${config.id}`,
            cell,
            HomeConfig.DUEL_LUANSHI_SKILL_COST_ICON_SIZE,
            HomeConfig.DUEL_LUANSHI_SKILL_COST_ICON_SIZE,
            -18,
            HomeConfig.DUEL_LUANSHI_SKILL_COST_Y,
            HomeConfig.UI_DUEL_YUANBAO_ICON,
        );
        icon.setSiblingIndex(3);

        let label = cell.getChildByName(`LuanshiSkillCostLabel_${config.id}`)?.getComponent(Label);
        if (!label) {
            label = this.createLabel(
                cell,
                `LuanshiSkillCostLabel_${config.id}`,
                `${config.yuanbaoCost}`,
                HomeConfig.DUEL_LUANSHI_SKILL_COST_FONT_SIZE,
                14,
                HomeConfig.DUEL_LUANSHI_SKILL_COST_Y,
                52,
                28,
                new Color(255, 246, 210, 255),
            );
        }
        label.string = `${config.yuanbaoCost}`;
        label.fontSize = HomeConfig.DUEL_LUANSHI_SKILL_COST_FONT_SIZE;
        label.lineHeight = HomeConfig.DUEL_LUANSHI_SKILL_COST_FONT_SIZE + 6;
        label.color = new Color(255, 246, 210, 255);
        label.enableOutline = true;
        label.outlineColor = new Color(44, 24, 12, 255);
        label.outlineWidth = 2;
        label.node.setSiblingIndex(4);
    }

    protected joinDuelLuanshiFaction(panel: Node, page: Node, faction: DuelLuanshiFaction): void {
        const runtime = page as DuelLuanshiPageRuntime;
        if (runtime.duelLuanshiPhase !== 'skill') {
            this.showToast('\u672c\u671f\u5df2\u8fdb\u5165\u7ed3\u7b97\uff0c\u4e0b\u671f\u518d\u9009\u62e9\u9635\u8425');
            return;
        }
        runtime.duelLuanshiFaction = faction;
        const joinLayer = page.getChildByName('LuanshiZhengxiongJoinLayer');
        if (joinLayer) joinLayer.active = false;
        this.ensureDuelLuanshiSkillSlots(panel, page).active = true;
        this.setDuelLuanshiBottomDockCollapsed(panel, page, false, true);
        this.showToast(faction === 'wudang' ? '\u5df2\u52a0\u5165\u6b66\u5f53' : '\u5df2\u52a0\u5165\u4e10\u5e2e');
    }

    protected async playDuelLuanshiSkill(page: Node, config: DuelLuanshiSkillConfig): Promise<void> {
        const runtime = page as DuelLuanshiPageRuntime;
        if (runtime.duelLuanshiPhase !== 'skill') {
            this.showToast('\u7ed3\u7b97\u65f6\u95f4\u4e0d\u80fd\u91ca\u653e\u6280\u80fd');
            return;
        }
        if (!runtime.duelLuanshiFaction) {
            this.showToast('\u8bf7\u5148\u9009\u62e9\u52a0\u5165\u9635\u8425');
            return;
        }
        if (playerSkillBusyPages.has(page)) return;
        playerSkillBusyPages.add(page);
        const faction = runtime.duelLuanshiFaction;
        const lockSeconds = await this.playDuelLuanshiSkillFromFaction(page, config, faction, 'player', this.getDuelLuanshiSkillEffectY(config));
        this.scheduleOnce(() => {
            if (page.isValid) playerSkillBusyPages.delete(page);
        }, lockSeconds);
    }

    protected async playDuelLuanshiSkillFromFaction(
        page: Node,
        config: DuelLuanshiSkillConfig,
        faction: DuelLuanshiFaction,
        sourceKey: string,
        effectY: number,
    ): Promise<number> {
        const isDefense = this.isDuelLuanshiDefenseSkill(config);
        const layer = page.getChildByName('LuanshiZhengxiongSkillEffectLayer') || this.getOrCreateDuelLuanshiNode('LuanshiZhengxiongSkillEffectLayer', page, HomeConfig.VIEW_WIDTH, 860, 0, 120);
        const impactY = isDefense ? effectY : this.pickDuelLuanshiAttackTargetY(page, this.getOppositeDuelLuanshiFaction(faction), effectY);
        const layout = isDefense
            ? this.getDuelLuanshiDefenseSkillEffectLayout(effectY)
            : this.getDuelLuanshiSkillEffectLayout(faction, effectY, impactY, config);
        const effect = this.getOrCreateDuelLuanshiSkillEffectNode(layer, faction, sourceKey, layout);
        effect.setPosition(layout.startX, layout.y, 0);
        effect.setScale(layout.scaleX, layout.scaleY, 1);
        const playToken = (skillEffectHideTokens.get(effect) || 0) + 1;
        skillEffectHideTokens.set(effect, playToken);
        try {
            const skeletonData = await this.loadSkeletonAsset(config.spinePath);
            if (!effect.isValid) return 0.2;
            const skeleton = effect.getComponent(sp.Skeleton) || effect.addComponent(sp.Skeleton);
            if (skillEffectSpinePaths.get(effect) !== config.spinePath) {
                skeleton.skeletonData = skeletonData;
                skillEffectSpinePaths.set(effect, config.spinePath);
            }
            this.prepareSkeletonRenderer(skeleton);
            const spineAssetName = config.spinePath.split('/').pop() || '';
            const duration = this.playDuelJianghuSkeletonAnimation(skeleton, [
                'animation',
                'SkillNormal',
                'SkillOnstage',
                'SkillUltra',
                'SkillProud',
                `${spineAssetName}_SkillNormal`,
                `${spineAssetName}_SkillOnstage`,
                `${spineAssetName}_SkillOnstage_Down`,
                `${spineAssetName}_SkillOnstage_Up`,
                `${spineAssetName}_SkillUltra`,
                `${spineAssetName}_SkillUltra_sj`,
                `${spineAssetName}_SkillUltra_sj_Down`,
                `${spineAssetName}_SkillUltra_sj_Up`,
                `${spineAssetName}_SkillProud`,
                'idle',
                'idle2',
                'idle3',
                'idle4',
                'idle5',
            ], false);
            if (!isDefense) {
                this.moveDuelLuanshiSkillEffectToEnemy(effect, layout, duration);
            }
            this.showDuelLuanshiSkillNumbers(page, config, faction, sourceKey, layout.targetY);
            this.applyDuelLuanshiSkillPowerEffect(page, config, faction, sourceKey);
            const lifeSeconds = Math.max(duration, 0.8) + 0.2;
            this.scheduleOnce(() => {
                if (!effect.isValid || skillEffectHideTokens.get(effect) !== playToken) return;
                this.hideDuelLuanshiSkillEffect(effect);
            }, lifeSeconds);
            return lifeSeconds;
        } catch (error) {
            console.warn('[MainHomeView] luanshi skill spine load failed', config.id, error);
            if (effect.isValid) this.hideDuelLuanshiSkillEffect(effect);
            return 0.2;
        }
    }

    protected getOrCreateDuelLuanshiSkillEffectNode(layer: Node, faction: DuelLuanshiFaction, sourceKey: string, layout: DuelLuanshiSkillEffectLayout): Node {
        const effect = this.getOrCreateDuelLuanshiNode(`LuanshiSkillEffect_${sourceKey}_${faction}`, layer, 720, 620, layout.startX, layout.y);
        effect.active = true;
        effect.setSiblingIndex((layer.children.length || 1) - 1);
        Tween.stopAllByTarget(effect);
        return effect;
    }

    protected getDuelLuanshiDefenseSkillEffectLayout(effectY: number = HomeConfig.DUEL_LUANSHI_DEFENSE_SKILL_EFFECT_Y): DuelLuanshiSkillEffectLayout {
        return {
            startX: 0,
            targetX: 0,
            y: effectY,
            targetY: effectY,
            scaleX: HomeConfig.DUEL_LUANSHI_DEFENSE_SKILL_EFFECT_SCALE,
            scaleY: HomeConfig.DUEL_LUANSHI_DEFENSE_SKILL_EFFECT_SCALE,
        };
    }

    protected getDuelLuanshiSkillEffectLayout(
        faction: DuelLuanshiFaction,
        effectY: number = HomeConfig.DUEL_LUANSHI_SKILL_EFFECT_Y,
        targetY: number = effectY,
        config?: DuelLuanshiSkillConfig,
    ): DuelLuanshiSkillEffectLayout {
        const direction = faction === 'wudang' ? 1 : -1;
        const isBlueMagic = config?.id === 'lanse_mofa';
        const targetX = isBlueMagic
            ? this.randomDuelLuanshiRange(HomeConfig.DUEL_LUANSHI_BLUE_MAGIC_SKILL_EFFECT_TARGET_X - 28, HomeConfig.DUEL_LUANSHI_BLUE_MAGIC_SKILL_EFFECT_TARGET_X + 26)
            : this.randomDuelLuanshiRange(HomeConfig.DUEL_LUANSHI_SKILL_EFFECT_TARGET_X - 38, HomeConfig.DUEL_LUANSHI_SKILL_EFFECT_TARGET_X + 54);
        const scale = isBlueMagic
            ? HomeConfig.DUEL_LUANSHI_BLUE_MAGIC_SKILL_EFFECT_SCALE
            : HomeConfig.DUEL_LUANSHI_SKILL_EFFECT_SCALE;
        return {
            startX: -direction * HomeConfig.DUEL_LUANSHI_SKILL_EFFECT_START_X,
            targetX: direction * targetX,
            y: effectY,
            targetY,
            scaleX: direction * scale,
            scaleY: scale,
        };
    }

    protected moveDuelLuanshiSkillEffectToEnemy(effect: Node, layout: DuelLuanshiSkillEffectLayout, duration: number): void {
        Tween.stopAllByTarget(effect);
        const travelSeconds = Math.min(
            Math.max(duration > 0 ? duration * 0.38 : HomeConfig.DUEL_LUANSHI_SKILL_EFFECT_TRAVEL_SECONDS, 0.18),
            HomeConfig.DUEL_LUANSHI_SKILL_EFFECT_TRAVEL_SECONDS,
        );
        tween(effect)
            .to(travelSeconds, { position: new Vec3(layout.targetX, layout.targetY, 0) }, { easing: 'quadOut' })
            .start();
    }

    protected showDuelLuanshiSkillNumbers(page: Node, config: DuelLuanshiSkillConfig, faction: DuelLuanshiFaction, sourceKey: string, impactY?: number): void {
        const isDefense = this.isDuelLuanshiDefenseSkill(config);
        const targetFaction = isDefense ? faction : this.getOppositeDuelLuanshiFaction(faction);
        const centerX = isDefense ? 0 : targetFaction === 'wudang' ? -190 : 190;
        const burstCount = sourceKey === 'player'
            ? isDefense ? 2 : 11
            : isDefense ? 1 : 6;

        for (let index = 0; index < burstCount; index += 1) {
            const delay = this.randomDuelLuanshiRange(0.02, 0.18) + index * this.randomDuelLuanshiRange(0.025, 0.07);
            this.scheduleOnce(() => {
                if (!page.isValid || !page.active) return;
                const x = centerX + this.randomDuelLuanshiRange(isDefense ? -82 : -135, isDefense ? 82 : 135);
                const y = isDefense
                    ? this.randomDuelLuanshiRange(72, 248)
                    : Math.max(-60, Math.min(330, (impactY ?? this.randomDuelLuanshiRange(-25, 330)) + this.randomDuelLuanshiRange(-78, 92)));
                if (isDefense) {
                    this.showDuelLuanshiCombatNumber(page, 'defense', this.randomDuelLuanshiDefenseText(), x, y);
                    return;
                }
                const critical = Math.random() < (sourceKey === 'player' ? 0.52 : 0.42);
                this.showDuelLuanshiCombatNumber(page, critical ? 'critical' : 'damage', this.randomDuelLuanshiDamageText(critical), x, y);
            }, delay);
        }
    }

    protected showDuelLuanshiCombatNumber(page: Node, kind: DuelLuanshiCombatNumberKind, text: string, x: number, y: number, scaleMode: DuelLuanshiCombatNumberScale = 'skill'): void {
        const layer = this.getOrCreateDuelLuanshiNode('LuanshiZhengxiongDamageNumberLayer', page, HomeConfig.VIEW_WIDTH, 860, 0, 120);
        layer.setSiblingIndex((page.children.length || 1) - 1);
        const parts = this.getDuelLuanshiNumberSpriteSpecs(kind, text);
        if (parts.length <= 0) return;

        const totalWidth = parts.reduce((sum, part) => sum + part.width, 0);
        const isAvatarNumber = scaleMode === 'avatar';
        const root = this.createNode(`LuanshiCombatNumber_${Date.now()}_${Math.floor(Math.random() * 10000)}`, layer, totalWidth, isAvatarNumber ? 52 : 74, x, y);
        const opacity = root.addComponent(UIOpacity);
        opacity.opacity = 255;
        let cursor = -totalWidth / 2;
        parts.forEach((part, index) => {
            const node = this.createSkinnedNode(`Part_${index}`, root, part.width, part.height, cursor + part.width / 2, 0, part.path);
            node.setSiblingIndex(index);
            cursor += part.width;
        });

        const numberScale = isAvatarNumber ? kind === 'critical' ? 0.68 : 0.58 : 1;
        const startScale = (kind === 'critical' ? 0.95 : kind === 'defense' ? 1.12 : 0.86) * numberScale;
        const peakScale = (kind === 'critical' ? 1.52 : kind === 'defense' ? 1.78 : 1.34) * numberScale;
        const endScale = (kind === 'critical' ? 1.16 : kind === 'defense' ? 1.38 : 1.02) * numberScale;
        const riseScale = isAvatarNumber ? 0.58 : 1;
        const driftScale = isAvatarNumber ? 0.62 : 1;
        const rise = (kind === 'critical' ? this.randomDuelLuanshiRange(95, 155) : this.randomDuelLuanshiRange(70, 125)) * riseScale;
        const drift = this.randomDuelLuanshiRange(-56, 56) * driftScale;
        root.setScale(startScale, startScale, 1);
        if (kind === 'defense') {
            tween(root)
                .to(0.1, { scale: new Vec3(peakScale, peakScale, 1) }, { easing: 'backOut' })
                .to(0.5, { scale: new Vec3(endScale, endScale, 1) }, { easing: 'quadOut' })
                .call(() => { if (root.isValid) root.destroy(); })
                .start();
        } else {
            tween(root)
                .to(0.08, { scale: new Vec3(peakScale, peakScale, 1) }, { easing: 'backOut' })
                .to(0.48, {
                    position: new Vec3(x + drift, y + rise, 0),
                    scale: new Vec3(endScale, endScale, 1),
                }, { easing: 'quadOut' })
                .call(() => { if (root.isValid) root.destroy(); })
                .start();
        }
        tween(opacity)
            .delay(isAvatarNumber ? 0.16 : 0.22)
            .to(isAvatarNumber ? 0.28 : 0.34, { opacity: 0 })
            .start();
    }

    protected getDuelLuanshiNumberSpriteSpecs(kind: DuelLuanshiCombatNumberKind, text: string): DuelLuanshiNumberSpriteSpec[] {
        if (kind === 'defense') {
            return [
                { path: HomeConfig.UI_DUEL_LUANSHI_DEFENSE_PLUS, width: 34, height: 44 },
                ...text.split('').map((char) => this.getDuelLuanshiDefenseDigitSpec(char)).filter((part): part is DuelLuanshiNumberSpriteSpec => !!part),
            ];
        }

        const specs: DuelLuanshiNumberSpriteSpec[] = [];
        if (kind === 'critical') {
            specs.push(
                { path: HomeConfig.UI_DUEL_LUANSHI_CRITICAL_BAO, width: 48, height: 42 },
                { path: HomeConfig.UI_DUEL_LUANSHI_CRITICAL_JI, width: 38, height: 42 },
            );
        }
        text.split('').forEach((char) => {
            const part = kind === 'critical'
                ? this.getDuelLuanshiCriticalCharSpec(char)
                : this.getDuelLuanshiDamageCharSpec(char);
            if (part) specs.push(part);
        });
        return specs;
    }

    protected getDuelLuanshiDamageCharSpec(char: string): DuelLuanshiNumberSpriteSpec | null {
        if (char >= '0' && char <= '9') return { path: HomeConfig.DUEL_LUANSHI_DAMAGE_DIGIT_PATHS[Number(char)], width: 30, height: 40 };
        if (char === '-') return { path: HomeConfig.UI_DUEL_LUANSHI_RECEIVED_DAMAGE_MINUS, width: 28, height: 10 };
        if (char === '.') return { path: HomeConfig.UI_DUEL_LUANSHI_CRITICAL_DOT, width: 12, height: 12 };
        if (char === '\u4e07') return { path: HomeConfig.UI_DUEL_LUANSHI_CRITICAL_WAN, width: 42, height: 41 };
        return null;
    }

    protected getDuelLuanshiCriticalCharSpec(char: string): DuelLuanshiNumberSpriteSpec | null {
        if (char >= '0' && char <= '9') return { path: HomeConfig.DUEL_LUANSHI_CRITICAL_DIGIT_PATHS[Number(char)], width: 30, height: 42 };
        if (char === '-') return { path: HomeConfig.UI_DUEL_LUANSHI_CRITICAL_MINUS, width: 28, height: 14 };
        if (char === '.') return { path: HomeConfig.UI_DUEL_LUANSHI_CRITICAL_DOT, width: 12, height: 12 };
        if (char === '\u4e07') return { path: HomeConfig.UI_DUEL_LUANSHI_CRITICAL_WAN, width: 42, height: 41 };
        return null;
    }

    protected getDuelLuanshiDefenseDigitSpec(char: string): DuelLuanshiNumberSpriteSpec | null {
        if (char < '0' || char > '9') return null;
        return { path: HomeConfig.DUEL_LUANSHI_DEFENSE_DIGIT_PATHS[Number(char)], width: 34, height: 52 };
    }

    protected randomDuelLuanshiDamageText(critical: boolean): string {
        if (!critical) {
            return `-${Math.floor(this.randomDuelLuanshiRange(1800, 96000))}`;
        }
        const min = critical ? 4.6 : 1.35;
        const max = critical ? 8.8 : 4.95;
        return `-${this.randomDuelLuanshiRange(min, max).toFixed(2)}\u4e07`;
    }

    protected randomDuelLuanshiDefenseText(): string {
        return `${Math.floor(this.randomDuelLuanshiRange(260, 1880))}`;
    }

    protected isDuelLuanshiDefenseSkill(config: DuelLuanshiSkillConfig): boolean {
        return config.id === 'diaozhong' || config.id === 'taiji';
    }

    protected getDuelLuanshiSkillEffectY(config: DuelLuanshiSkillConfig): number {
        return this.isDuelLuanshiDefenseSkill(config)
            ? HomeConfig.DUEL_LUANSHI_DEFENSE_SKILL_EFFECT_Y
            : this.randomDuelLuanshiRange(HomeConfig.DUEL_LUANSHI_AUTO_SKILL_Y_MIN, HomeConfig.DUEL_LUANSHI_AUTO_SKILL_Y_MAX);
    }

    protected pickDuelLuanshiAttackTargetY(page: Node, targetFaction: DuelLuanshiFaction, fallbackY: number): number {
        const avatarLayer = page.getChildByName('LuanshiZhengxiongAvatarLayer');
        const effectLayer = page.getChildByName('LuanshiZhengxiongSkillEffectLayer');
        if (!avatarLayer || !effectLayer) return fallbackY + this.randomDuelLuanshiRange(-95, 95);

        const targetIsLeft = targetFaction === 'wudang';
        const candidates = avatarLayer.children.filter((child) => {
            if (!child.active || !child.name.startsWith('LuanshiAvatarSlot_')) return false;
            const index = Number(child.name.replace('LuanshiAvatarSlot_', ''));
            return Number.isFinite(index) && (targetIsLeft ? index < 6 : index >= 6);
        });
        if (candidates.length <= 0) return fallbackY + this.randomDuelLuanshiRange(-95, 95);

        const target = candidates[Math.floor(this.randomDuelLuanshiRange(0, candidates.length))];
        const layerOffsetY = avatarLayer.position.y - effectLayer.position.y;
        const y = target.position.y + layerOffsetY + this.randomDuelLuanshiRange(-38, 38);
        return Math.max(HomeConfig.DUEL_LUANSHI_AUTO_SKILL_Y_MIN - 72, Math.min(HomeConfig.DUEL_LUANSHI_AUTO_SKILL_Y_MAX + 48, y));
    }

    protected getOppositeDuelLuanshiFaction(faction: DuelLuanshiFaction): DuelLuanshiFaction {
        return faction === 'wudang' ? 'gaibang' : 'wudang';
    }

    protected startDuelLuanshiNormalAttackLoop(page: Node): void {
        this.stopDuelLuanshiNormalAttackLoop(page);
        const scheduleNext = (): void => {
            if (!page.isValid || !page.active) return;
            const callback = (): void => {
                normalAttackCallbacks.delete(page);
                if (!page.isValid || !page.active) return;
                this.playRandomDuelLuanshiAvatarNormalAttack(page);
                scheduleNext();
            };
            normalAttackCallbacks.set(page, callback);
            this.scheduleOnce(callback, this.randomDuelLuanshiRange(HomeConfig.DUEL_LUANSHI_NORMAL_ATTACK_DELAY_MIN, HomeConfig.DUEL_LUANSHI_NORMAL_ATTACK_DELAY_MAX));
        };
        scheduleNext();
    }

    protected stopDuelLuanshiNormalAttackLoop(page: Node): void {
        const callback = normalAttackCallbacks.get(page);
        if (callback) {
            this.unschedule(callback);
            normalAttackCallbacks.delete(page);
        }
    }

    protected playRandomDuelLuanshiAvatarNormalAttack(page: Node): void {
        if ((page as DuelLuanshiPageRuntime).duelLuanshiPhase === 'result') return;
        const avatarLayer = page.getChildByName('LuanshiZhengxiongAvatarLayer');
        if (!avatarLayer) return;
        const effectLayer = page.getChildByName('LuanshiZhengxiongSkillEffectLayer') || this.getOrCreateDuelLuanshiNode('LuanshiZhengxiongSkillEffectLayer', page, HomeConfig.VIEW_WIDTH, 860, 0, 120);
        const attackerSide: DuelLuanshiAvatarSide = Math.random() < 0.5 ? 'left' : 'right';
        const attackers = this.getDuelLuanshiAvatarNodes(avatarLayer, attackerSide);
        const targets = this.getDuelLuanshiAvatarNodes(avatarLayer, attackerSide === 'left' ? 'right' : 'left');
        if (attackers.length <= 0 || targets.length <= 0) return;

        const attacker = attackers[Math.floor(this.randomDuelLuanshiRange(0, attackers.length))];
        const target = targets[Math.floor(this.randomDuelLuanshiRange(0, targets.length))];
        const sourcePosition = this.getDuelLuanshiAvatarEffectPosition(avatarLayer, effectLayer, attacker);
        const targetPosition = this.getDuelLuanshiAvatarEffectPosition(avatarLayer, effectLayer, target);
        const poolIndex = Math.floor(this.randomDuelLuanshiRange(0, HomeConfig.DUEL_LUANSHI_NORMAL_ATTACK_EFFECT_POOL_SIZE));
        void this.playDuelLuanshiAvatarNormalAttack(page, avatarLayer, effectLayer, target, attackerSide, poolIndex, sourcePosition, targetPosition);
    }

    protected getDuelLuanshiAvatarNodes(avatarLayer: Node, side: DuelLuanshiAvatarSide): Node[] {
        return avatarLayer.children.filter((child) => {
            if (!child.active || !child.name.startsWith('LuanshiAvatarSlot_')) return false;
            const index = Number(child.name.replace('LuanshiAvatarSlot_', ''));
            return Number.isFinite(index) && (side === 'left' ? index < 6 : index >= 6);
        });
    }

    protected getDuelLuanshiAvatarEffectPosition(avatarLayer: Node, effectLayer: Node, avatar: Node): Vec3 {
        return new Vec3(
            avatar.position.x,
            avatar.position.y + avatarLayer.position.y - effectLayer.position.y,
            0,
        );
    }

    protected async playDuelLuanshiAvatarNormalAttack(
        page: Node,
        avatarLayer: Node,
        effectLayer: Node,
        targetAvatar: Node,
        attackerSide: DuelLuanshiAvatarSide,
        poolIndex: number,
        sourcePosition: Vec3,
        targetPosition: Vec3,
    ): Promise<void> {
        const effect = this.getOrCreateDuelLuanshiNode(
            `LuanshiNormalAttack_${attackerSide}_${poolIndex}`,
            effectLayer,
            HomeConfig.DUEL_LUANSHI_NORMAL_ATTACK_EFFECT_WIDTH,
            HomeConfig.DUEL_LUANSHI_NORMAL_ATTACK_EFFECT_HEIGHT,
            sourcePosition.x,
            sourcePosition.y,
        );
        const spinePath = attackerSide === 'left'
            ? HomeConfig.DUEL_LUANSHI_NORMAL_ATTACK_LEFT_SPINE
            : HomeConfig.DUEL_LUANSHI_NORMAL_ATTACK_RIGHT_SPINE;
        const scale = attackerSide === 'left'
            ? HomeConfig.DUEL_LUANSHI_NORMAL_ATTACK_LEFT_SCALE
            : HomeConfig.DUEL_LUANSHI_NORMAL_ATTACK_RIGHT_SCALE;
        const playToken = (normalAttackHideTokens.get(effect) || 0) + 1;
        normalAttackHideTokens.set(effect, playToken);
        effect.active = true;
        effect.setSiblingIndex((effectLayer.children.length || 1) - 1);
        effect.setPosition(sourcePosition);
        effect.setScale(scale, scale, 1);
        Tween.stopAllByTarget(effect);

        try {
            const skeletonData = await this.loadSkeletonAsset(spinePath);
            if (!effect.isValid || normalAttackHideTokens.get(effect) !== playToken) return;
            const skeleton = effect.getComponent(sp.Skeleton) || effect.addComponent(sp.Skeleton);
            if (normalAttackSpinePaths.get(effect) !== spinePath) {
                skeleton.skeletonData = skeletonData;
                normalAttackSpinePaths.set(effect, spinePath);
            }
            this.prepareSkeletonRenderer(skeleton);
            const duration = this.playDuelJianghuSkeletonAnimation(skeleton, ['animation', 'attack', 'Attack', 'SkillNormal', 'idle'], false);
            const travelSeconds = this.randomDuelLuanshiRange(HomeConfig.DUEL_LUANSHI_NORMAL_ATTACK_TRAVEL_SECONDS_MIN, HomeConfig.DUEL_LUANSHI_NORMAL_ATTACK_TRAVEL_SECONDS_MAX);
            tween(effect)
                .to(travelSeconds, { position: targetPosition }, { easing: 'quadOut' })
                .call(() => {
                    if (!page.isValid || !effect.isValid || normalAttackHideTokens.get(effect) !== playToken) return;
                    const impactPosition = targetAvatar.isValid
                        ? this.getDuelLuanshiAvatarEffectPosition(avatarLayer, effectLayer, targetAvatar)
                        : targetPosition;
                    if (targetAvatar.isValid) this.shakeDuelLuanshiHitAvatar(targetAvatar);
                    const critical = Math.random() < HomeConfig.DUEL_LUANSHI_NORMAL_ATTACK_CRITICAL_RATE;
                    this.applyDuelLuanshiNormalAttackPowerEffect(page, attackerSide, critical);
                    this.showDuelLuanshiCombatNumber(
                        page,
                        critical ? 'critical' : 'damage',
                        this.randomDuelLuanshiDamageText(critical),
                        impactPosition.x + this.randomDuelLuanshiRange(-34, 34),
                        impactPosition.y + this.randomDuelLuanshiRange(-8, 42),
                        'avatar',
                    );
                })
                .start();
            const lifeSeconds = Math.max(duration, travelSeconds, 0.55) + 0.15;
            this.scheduleOnce(() => {
                if (!effect.isValid || normalAttackHideTokens.get(effect) !== playToken) return;
                this.hideDuelLuanshiNormalAttackEffect(effect);
            }, lifeSeconds);
        } catch (error) {
            console.warn('[MainHomeView] luanshi normal attack spine load failed', spinePath, error);
            if (effect.isValid) this.hideDuelLuanshiNormalAttackEffect(effect);
        }
    }

    protected shakeDuelLuanshiHitAvatar(avatar: Node): void {
        const direction = avatar.position.x < 0 ? -1 : 1;
        avatar.children.forEach((child) => {
            if (!child.active) return;
            const base = this.getDuelLuanshiAvatarChildBasePosition(child);
            Tween.stopAllByTarget(child);
            child.setPosition(base);
            tween(child)
                .to(0.035, { position: new Vec3(base.x + direction * HomeConfig.DUEL_LUANSHI_AVATAR_HIT_SHAKE_X, base.y + HomeConfig.DUEL_LUANSHI_AVATAR_HIT_SHAKE_Y, 0) })
                .to(0.045, { position: new Vec3(base.x - direction * HomeConfig.DUEL_LUANSHI_AVATAR_HIT_SHAKE_X * 0.7, base.y - HomeConfig.DUEL_LUANSHI_AVATAR_HIT_SHAKE_Y, 0) })
                .to(0.045, { position: new Vec3(base.x + direction * HomeConfig.DUEL_LUANSHI_AVATAR_HIT_SHAKE_X * 0.35, base.y + HomeConfig.DUEL_LUANSHI_AVATAR_HIT_SHAKE_Y * 0.5, 0) })
                .to(0.04, { position: base })
                .call(() => {
                    if (child.isValid) child.setPosition(base);
                })
                .start();
        });
    }

    protected getDuelLuanshiAvatarChildBasePosition(child: Node): Vec3 {
        if (child.name.includes('AvatarHp')) return new Vec3(0, -48, 0);
        if (child.name.includes('AvatarIcon') || child.name.includes('AvatarFrameEffect')) return new Vec3(0, 0, 0);
        return child.position.clone();
    }

    protected hideDuelLuanshiNormalAttackEffect(effect: Node): void {
        Tween.stopAllByTarget(effect);
        normalAttackHideTokens.set(effect, (normalAttackHideTokens.get(effect) || 0) + 1);
        const skeleton = effect.getComponent(sp.Skeleton);
        if (skeleton) {
            try {
                skeleton.clearTracks();
                skeleton.setToSetupPose();
                skeleton.updateAnimation(0);
                skeleton.markForUpdateRenderData(true);
            } catch {
                // Imported normal attack Spine packages can fail during teardown; keep the node pooled and hidden.
            }
            skeleton.paused = true;
            skeleton.enabled = false;
        }
        effect.active = false;
    }

    protected hideDuelLuanshiSkillEffect(effect: Node): void {
        Tween.stopAllByTarget(effect);
        skillEffectHideTokens.set(effect, (skillEffectHideTokens.get(effect) || 0) + 1);
        const skeleton = effect.getComponent(sp.Skeleton);
        if (skeleton) {
            try {
                skeleton.clearTracks();
                skeleton.setToSetupPose();
                skeleton.updateAnimation(0);
                skeleton.markForUpdateRenderData(true);
            } catch {
                // Some imported Spine packages can fail during teardown; keep the node pooled and hidden.
            }
            skeleton.paused = true;
            skeleton.enabled = false;
        }
        effect.active = false;
    }

    protected startDuelLuanshiAutoFight(page: Node): void {
        this.stopDuelLuanshiAutoFight(page);
        const scheduleNext = (): void => {
            if (!page.isValid || !page.active) return;
            const callback = (): void => {
                autoFightCallbacks.delete(page);
                if (!page.isValid || !page.active) return;
                this.playRandomDuelLuanshiNpcSkill(page);
                scheduleNext();
            };
            autoFightCallbacks.set(page, callback);
            this.scheduleOnce(callback, this.randomDuelLuanshiRange(HomeConfig.DUEL_LUANSHI_AUTO_SKILL_DELAY_MIN, HomeConfig.DUEL_LUANSHI_AUTO_SKILL_DELAY_MAX));
        };
        scheduleNext();
    }

    protected stopDuelLuanshiAutoFight(page: Node): void {
        const callback = autoFightCallbacks.get(page);
        if (callback) {
            this.unschedule(callback);
            autoFightCallbacks.delete(page);
        }
    }

    protected playRandomDuelLuanshiNpcSkill(page: Node): void {
        if ((page as DuelLuanshiPageRuntime).duelLuanshiPhase === 'result') return;
        const config = this.pickDuelLuanshiAutoSkillConfig();
        const faction: DuelLuanshiFaction = Math.random() < 0.5 ? 'wudang' : 'gaibang';
        const poolIndex = Math.floor(this.randomDuelLuanshiRange(0, HomeConfig.DUEL_LUANSHI_AUTO_EFFECT_POOL_SIZE));
        const effectY = this.isDuelLuanshiDefenseSkill(config)
            ? HomeConfig.DUEL_LUANSHI_DEFENSE_SKILL_EFFECT_Y
            : this.randomDuelLuanshiRange(HomeConfig.DUEL_LUANSHI_AUTO_SKILL_Y_MIN, HomeConfig.DUEL_LUANSHI_AUTO_SKILL_Y_MAX);
        void this.playDuelLuanshiSkillFromFaction(page, config, faction, `npc${poolIndex}`, effectY);
    }

    protected pickDuelLuanshiAutoSkillConfig(): DuelLuanshiSkillConfig {
        const configs = HomeConfig.DUEL_LUANSHI_SKILL_CONFIGS;
        const totalWeight = configs.reduce((sum, config) => (
            sum + (this.isDuelLuanshiDefenseSkill(config)
                ? HomeConfig.DUEL_LUANSHI_AUTO_DEFENSE_SKILL_WEIGHT
                : HomeConfig.DUEL_LUANSHI_AUTO_ATTACK_SKILL_WEIGHT)
        ), 0);
        let cursor = Math.random() * totalWeight;
        for (const config of configs) {
            cursor -= this.isDuelLuanshiDefenseSkill(config)
                ? HomeConfig.DUEL_LUANSHI_AUTO_DEFENSE_SKILL_WEIGHT
                : HomeConfig.DUEL_LUANSHI_AUTO_ATTACK_SKILL_WEIGHT;
            if (cursor <= 0) return config;
        }
        return configs[0];
    }

    protected startDuelLuanshiAvatarRoamMotion(node: Node, x: number, y: number, side: 'left' | 'right', index: number): void {
        Tween.stopAllByTarget(node);
        const token = (avatarRoamTokens.get(node) || 0) + 1;
        avatarRoamTokens.set(node, token);
        node.setPosition(
            x + this.randomDuelLuanshiRange(-12, 12),
            y + this.randomDuelLuanshiRange(-10, 10),
            0,
        );

        const roam = (): void => {
            if (!node.isValid || avatarRoamTokens.get(node) !== token) return;
            const enemyBiasX = side === 'left' ? 10 : -10;
            const nextX = x + enemyBiasX + this.randomDuelLuanshiRange(-HomeConfig.DUEL_LUANSHI_AVATAR_ROAM_RADIUS_X, HomeConfig.DUEL_LUANSHI_AVATAR_ROAM_RADIUS_X);
            const nextY = y + this.randomDuelLuanshiRange(-HomeConfig.DUEL_LUANSHI_AVATAR_ROAM_RADIUS_Y, HomeConfig.DUEL_LUANSHI_AVATAR_ROAM_RADIUS_Y);
            const seconds = this.randomDuelLuanshiRange(HomeConfig.DUEL_LUANSHI_AVATAR_ROAM_SECONDS_MIN, HomeConfig.DUEL_LUANSHI_AVATAR_ROAM_SECONDS_MAX) + (index % 3) * 0.18;
            tween(node)
                .to(seconds, { position: new Vec3(nextX, nextY, 0) }, { easing: 'sineInOut' })
                .call(() => roam())
                .start();
        };

        roam();
    }

    protected randomDuelLuanshiRange(min: number, max: number): number {
        return min + Math.random() * (max - min);
    }

    protected walkDuelLuanshiNodes(root: Node, visit: (node: Node) => void): void {
        visit(root);
        root.children.forEach((child) => this.walkDuelLuanshiNodes(child, visit));
    }
}
