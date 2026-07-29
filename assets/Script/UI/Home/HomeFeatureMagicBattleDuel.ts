import {
    Color,
    EventTouch,
    Graphics,
    Label,
    Mask,
    Node,
    Overflow,
    Rect,
    Sprite,
    Tween,
    UITransform,
    Vec3,
    sp,
    tween,
} from 'cc';
import * as HomeConfig from './HomeConfig';
import { HomeViewBase } from './HomeViewBase';

type MagicBattleParticipantId = 'player' | 'npc-half' | 'npc-double';

interface MagicBattleDamageParticipant {
    id: MagicBattleParticipantId;
    name: string;
    isPlayer: boolean;
    skelPath?: string;
    duelScale?: number;
    damageMultiplier: number;
    damage: number;
    hp: number;
    maxHp: number;
    active: boolean;
    duelOutcome: 'win' | 'lose' | null;
}

abstract class HomeFeatureMagicBattleDuelHost extends HomeViewBase {
    protected abstract magicBattleDuelPopup: Node | null;
    protected abstract magicBattleDuelPlayerSkeleton: sp.Skeleton | null;
    protected abstract magicBattleDuelTargetSkeleton: sp.Skeleton | null;
    protected abstract magicBattleDuelPlayerHp: number;
    protected abstract magicBattleDuelTargetHp: number;
    protected abstract magicBattleDuelVersion: number;
    protected abstract magicBattleDuelTargetId: MagicBattleParticipantId | '';
    protected abstract readonly magicBattleParticipants: MagicBattleDamageParticipant[];

    protected abstract setLabelOutline(label: Label, color: Color, width: number): void;
    protected abstract playMagicBattleOneShot(
        target: sp.Skeleton | null,
        oneShotCandidates: readonly string[],
        idleCandidates: readonly string[],
        timeScale: number,
    ): number;
}

/**
 * 魔界战斗单挑弹窗、双方卡片/血量、攻击时序与胜负回写。
 */
export abstract class HomeFeatureMagicBattleDuel extends HomeFeatureMagicBattleDuelHost {
    protected ensureMagicBattleDuelPopup(): Node {
        const parent = this.popupRoot || this.uiHudLayer || this.node;
        let popup = parent.getChildByName('MagicBattleDuelPopup') || this.findNode('MagicBattleDuelPopup');
        if (!popup?.isValid) {
            popup = this.createNode('MagicBattleDuelPopup', parent, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT, 0, 0);
        } else if (popup.parent !== parent) {
            popup.setParent(parent);
        }
        popup.active = false;
        (popup.getComponent(UITransform) || popup.addComponent(UITransform)).setContentSize(HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT);
        popup.off(Node.EventType.TOUCH_END);
        popup.on(Node.EventType.TOUCH_END, (event: EventTouch) => {
            event.propagationStopped = true;
        }, this);

        const mask = this.getOrCreateBattleNode(popup, 'MagicBattleDuelMask', HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT, 0, 0).node;
        const graphics = mask.getComponent(Graphics) || mask.addComponent(Graphics);
        graphics.clear();
        graphics.fillColor = new Color(0, 0, 0, 150);
        graphics.rect(-HomeConfig.VIEW_WIDTH / 2, -HomeConfig.VIEW_HEIGHT / 2, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT);
        graphics.fill();
        mask.setSiblingIndex(0);
        mask.off(Node.EventType.TOUCH_END);
        mask.on(Node.EventType.TOUCH_END, (event: EventTouch) => {
            event.propagationStopped = true;
        }, this);

        const board = this.getOrCreateBattleSkinnedNode(
            popup,
            'MagicBattleDuelBoard',
            HomeConfig.MAGIC_BATTLE_DUEL_POPUP_WIDTH,
            HomeConfig.MAGIC_BATTLE_DUEL_POPUP_HEIGHT,
            0,
            64,
            HomeConfig.UI_MAGIC_DUEL_POPUP_BG,
        ).node;
        board.setPosition(0, 64, 0);
        (board.getComponent(UITransform) || board.addComponent(UITransform)).setContentSize(
            HomeConfig.MAGIC_BATTLE_DUEL_POPUP_WIDTH,
            HomeConfig.MAGIC_BATTLE_DUEL_POPUP_HEIGHT,
        );
        this.applyUiSkin(board, HomeConfig.UI_MAGIC_DUEL_POPUP_BG, HomeConfig.MAGIC_BATTLE_DUEL_POPUP_WIDTH, HomeConfig.MAGIC_BATTLE_DUEL_POPUP_HEIGHT);
        board.setSiblingIndex(1);
        board.off(Node.EventType.TOUCH_END);
        board.on(Node.EventType.TOUCH_END, (event: EventTouch) => {
            event.propagationStopped = true;
        }, this);

        const title = this.getOrCreateBattleLabel(
            board,
            'MagicBattleDuelTitle',
            '\u9b54\u754c\u51b3\u6597',
            34,
            0,
            202,
            280,
            50,
            new Color(255, 230, 166, 255),
        ).label;
        title.lineHeight = 42;
        this.setLabelOutline(title, new Color(74, 28, 10, 255), 3);

        this.magicBattleDuelPlayerSkeleton = this.createMagicBattleDuelCard(
            board,
            'Player',
            HomeConfig.MAGIC_BATTLE_DUEL_PLAYER_CARD_X,
            '\u6211',
        );
        this.magicBattleDuelTargetSkeleton = this.createMagicBattleDuelCard(
            board,
            'Target',
            HomeConfig.MAGIC_BATTLE_DUEL_TARGET_CARD_X,
            '\u5bf9\u624b',
        );

        const status = this.getOrCreateBattleLabel(
            board,
            'MagicBattleDuelStatus',
            '',
            24,
            0,
            -208,
            560,
            42,
            new Color(255, 235, 190, 255),
        ).label;
        status.lineHeight = 32;
        this.setLabelOutline(status, new Color(45, 20, 10, 255), 2);

        const hint = this.getOrCreateBattleLabel(
            board,
            'MagicBattleDuelHint',
            '\u51b3\u6597\u5931\u8d25\u4f1a\u88ab\u8e22\u51fa\u623f\u95f4\uff0c\u79bb\u5f00\u540e\u672c\u623f\u95f4\u4f24\u5bb3\u6e05\u96f6',
            18,
            0,
            -234,
            610,
            28,
            new Color(244, 210, 142, 255),
        ).label;
        hint.lineHeight = 24;
        hint.overflow = Overflow.SHRINK;
        this.setLabelOutline(hint, new Color(45, 20, 10, 255), 1);

        const close = this.getOrCreateBattleSkinnedNode(board, 'MagicBattleDuelClose', 62, 62, 318, 210, HomeConfig.UI_BTN_CLOSE).node;
        close.setSiblingIndex(20);
        this.bindScaledClick(close, () => this.closeMagicBattleDuelPopup(true));

        this.magicBattleDuelPopup = popup;
        return popup;
    }
    protected createMagicBattleDuelCard(parent: Node, suffix: string, x: number, titleText: string): sp.Skeleton {
        const card = this.getOrCreateBattleNode(
            parent,
            `MagicBattleDuel${suffix}Card`,
            HomeConfig.MAGIC_BATTLE_DUEL_CARD_WIDTH,
            HomeConfig.MAGIC_BATTLE_DUEL_CARD_HEIGHT,
            x,
            HomeConfig.MAGIC_BATTLE_DUEL_CARD_Y,
        ).node;
        card.setPosition(x, HomeConfig.MAGIC_BATTLE_DUEL_CARD_Y, 0);
        (card.getComponent(UITransform) || card.addComponent(UITransform)).setContentSize(
            HomeConfig.MAGIC_BATTLE_DUEL_CARD_WIDTH,
            HomeConfig.MAGIC_BATTLE_DUEL_CARD_HEIGHT,
        );
        const oldCardSprite = card.getComponent(Sprite);
        if (oldCardSprite) oldCardSprite.enabled = false;
        card.setSiblingIndex(4);

        const title = this.getOrCreateBattleLabel(
            card,
            `MagicBattleDuel${suffix}Title`,
            titleText,
            24,
            0,
            118,
            184,
            36,
            new Color(255, 237, 186, 255),
        ).label;
        title.node.setPosition(0, 118, 0);
        (title.node.getComponent(UITransform) || title.node.addComponent(UITransform)).setContentSize(184, 36);
        title.fontSize = 24;
        title.lineHeight = 30;
        this.setLabelOutline(title, new Color(59, 25, 12, 255), 2);

        const hpText = this.getOrCreateBattleLabel(
            card,
            `MagicBattleDuel${suffix}HpText`,
            '',
            20,
            0,
            88,
            180,
            28,
            Color.WHITE,
        ).label;
        hpText.node.setPosition(0, 88, 0);
        (hpText.node.getComponent(UITransform) || hpText.node.addComponent(UITransform)).setContentSize(180, 28);
        hpText.fontSize = 20;
        hpText.lineHeight = 26;
        this.setLabelOutline(hpText, new Color(20, 18, 18, 255), 2);

        const hpFrame = this.getOrCreateBattleSkinnedNode(
            card,
            `MagicBattleDuel${suffix}HpFrame`,
            HomeConfig.MAGIC_BATTLE_DUEL_HP_BAR_WIDTH,
            HomeConfig.MAGIC_BATTLE_DUEL_HP_BAR_HEIGHT,
            0,
            64,
            HomeConfig.UI_MAGIC_DAMAGE_BAR_FRAME,
        ).node;
        hpFrame.setPosition(0, 64, 0);
        (hpFrame.getComponent(UITransform) || hpFrame.addComponent(UITransform)).setContentSize(
            HomeConfig.MAGIC_BATTLE_DUEL_HP_BAR_WIDTH,
            HomeConfig.MAGIC_BATTLE_DUEL_HP_BAR_HEIGHT,
        );
        this.applyUiSkin(hpFrame, HomeConfig.UI_MAGIC_DAMAGE_BAR_FRAME, HomeConfig.MAGIC_BATTLE_DUEL_HP_BAR_WIDTH, HomeConfig.MAGIC_BATTLE_DUEL_HP_BAR_HEIGHT);
        hpFrame.setSiblingIndex(5);
        const hpFill = this.getOrCreateBattleSkinnedNode(
            card,
            `MagicBattleDuel${suffix}HpFill`,
            HomeConfig.MAGIC_BATTLE_DUEL_HP_BAR_WIDTH,
            HomeConfig.MAGIC_BATTLE_DUEL_HP_BAR_HEIGHT,
            0,
            64,
            HomeConfig.UI_MAGIC_DAMAGE_HP_BAR,
        ).node;
        hpFill.setPosition(0, 64, 0);
        (hpFill.getComponent(UITransform) || hpFill.addComponent(UITransform)).setContentSize(
            HomeConfig.MAGIC_BATTLE_DUEL_HP_BAR_WIDTH,
            HomeConfig.MAGIC_BATTLE_DUEL_HP_BAR_HEIGHT,
        );
        this.applyUiSkin(hpFill, HomeConfig.UI_MAGIC_DAMAGE_HP_BAR, HomeConfig.MAGIC_BATTLE_DUEL_HP_BAR_WIDTH, HomeConfig.MAGIC_BATTLE_DUEL_HP_BAR_HEIGHT);
        hpFill.setSiblingIndex(6);

        const visual = this.getOrCreateBattleNode(
            card,
            `MagicBattleDuel${suffix}Visual`,
            300,
            250,
            0,
            HomeConfig.MAGIC_BATTLE_DUEL_VISUAL_Y,
        ).node;
        visual.setPosition(0, HomeConfig.MAGIC_BATTLE_DUEL_VISUAL_Y, 0);
        (visual.getComponent(UITransform) || visual.addComponent(UITransform)).setContentSize(300, 250);
        visual.setSiblingIndex(3);
        const skeleton = visual.getComponent(sp.Skeleton) || visual.addComponent(sp.Skeleton);
        this.prepareSkeletonRenderer(skeleton);
        this.setSkeletonVisible(skeleton, false);
        return skeleton;
    }
    protected async openMagicBattleDuelPopup(targetId: MagicBattleParticipantId): Promise<void> {
        const target = this.magicBattleParticipants.find((participant) => participant.id === targetId && participant.active);
        if (!target || target.isPlayer) return;

        const popup = this.ensureMagicBattleDuelPopup();
        this.magicBattleDuelTargetId = targetId;
        const version = ++this.magicBattleDuelVersion;
        this.magicBattleDuelPlayerHp = HomeConfig.MAGIC_MAP_PLAYER_MAX_HP;
        this.magicBattleDuelTargetHp = target.maxHp;
        this.magicBattleActive = false;
        popup.active = true;
        this.ensureInputBlocker(popup);
        popup.setSiblingIndex((popup.parent?.children.length || 1) - 1);
        this.refreshRootLayerOrder();
        this.refreshMagicBattleDuelPopup(target, '\u51b3\u6597\u51c6\u5907\u4e2d');

        try {
            if (!this.roleSkeletonData.has(this.profile.gender)) {
                await this.loadSkeletonData(HomeConfig.ROLE_ASSETS[this.profile.gender]);
            }
            const roleData = this.roleSkeletonData.get(this.profile.gender);
            const targetData = await this.loadSkeletonAsset(target.skelPath || HomeConfig.ROLE_ASSETS.male.skelPath);
            if (version !== this.magicBattleDuelVersion || this.magicBattleDuelTargetId !== targetId) return;
            if (!roleData || !this.magicBattleDuelPlayerSkeleton?.isValid || !this.magicBattleDuelTargetSkeleton?.isValid) {
                throw new Error('Magic battle duel skeleton node is missing');
            }

            this.prepareSkeletonRenderer(this.magicBattleDuelPlayerSkeleton);
            this.magicBattleDuelPlayerSkeleton.skeletonData = roleData;
            this.magicBattleDuelPlayerSkeleton.node.setPosition(0, HomeConfig.MAGIC_BATTLE_DUEL_VISUAL_Y, 0);
            this.magicBattleDuelPlayerSkeleton.node.setScale(
                HomeConfig.MAGIC_BATTLE_DUEL_PLAYER_SCALE,
                HomeConfig.MAGIC_BATTLE_DUEL_PLAYER_SCALE,
                1,
            );
            this.setSkeletonVisible(this.magicBattleDuelPlayerSkeleton, true);
            this.playSkeletonAnimation(this.magicBattleDuelPlayerSkeleton, HomeConfig.IDLE_ANIMATIONS, true);

            this.prepareSkeletonRenderer(this.magicBattleDuelTargetSkeleton);
            this.magicBattleDuelTargetSkeleton.skeletonData = targetData;
            this.magicBattleDuelTargetSkeleton.node.setPosition(0, HomeConfig.MAGIC_BATTLE_DUEL_VISUAL_Y, 0);
            const targetScale = target.duelScale || HomeConfig.MAGIC_BATTLE_DUEL_NPC_SCALE;
            this.magicBattleDuelTargetSkeleton.node.setScale(-targetScale, targetScale, 1);
            this.setSkeletonVisible(this.magicBattleDuelTargetSkeleton, true);
            this.playSkeletonAnimation(this.magicBattleDuelTargetSkeleton, HomeConfig.IDLE_ANIMATIONS, true);

            this.startMagicBattleDuelSequence(target, version);
        } catch (err) {
            console.warn('[MainHomeView] magic battle duel assets not ready', err);
            this.showToast('\u51b3\u6597\u8d44\u6e90\u52a0\u8f7d\u5931\u8d25');
            this.closeMagicBattleDuelPopup(true);
        }
    }
    protected refreshMagicBattleDuelPopup(target: MagicBattleDamageParticipant, statusText: string): void {
        const popup = this.magicBattleDuelPopup;
        if (!popup?.isValid) return;

        this.setMagicBattleDuelCardState(
            'Player',
            this.profile.name || '\u6211',
            this.magicBattleDuelTargetId ? this.magicBattleDuelPlayerHp : HomeConfig.MAGIC_MAP_PLAYER_MAX_HP,
            HomeConfig.MAGIC_MAP_PLAYER_MAX_HP,
        );
        this.setMagicBattleDuelCardState(
            'Target',
            target.name,
            this.magicBattleDuelTargetId ? this.magicBattleDuelTargetHp : target.maxHp,
            target.maxHp,
        );

        const status = this.findNode('MagicBattleDuelStatus', popup)?.getComponent(Label);
        if (status) {
            status.string = statusText;
        }
    }
    protected setMagicBattleDuelCardState(suffix: string, name: string, hp: number, maxHp: number): void {
        const popup = this.magicBattleDuelPopup;
        if (!popup?.isValid) return;

        const title = this.findNode(`MagicBattleDuel${suffix}Title`, popup)?.getComponent(Label);
        if (title) title.string = name;
        const hpText = this.findNode(`MagicBattleDuel${suffix}HpText`, popup)?.getComponent(Label);
        if (hpText) hpText.string = `${Math.max(0, hp)}/${Math.max(1, maxHp)}`;
        const fill = this.findNode(`MagicBattleDuel${suffix}HpFill`, popup);
        if (fill?.isValid) {
            const ratio = this.clamp(hp / Math.max(1, maxHp), 0, 1);
            const barWidth = HomeConfig.MAGIC_BATTLE_DUEL_HP_BAR_WIDTH;
            const barHeight = HomeConfig.MAGIC_BATTLE_DUEL_HP_BAR_HEIGHT;
            const width = Math.max(2, Math.floor(barWidth * ratio));
            fill.setPosition(-(barWidth - width) / 2, 64, 0);
            (fill.getComponent(UITransform) || fill.addComponent(UITransform)).setContentSize(width, barHeight);
            this.applyUiSkin(fill, HomeConfig.UI_MAGIC_DAMAGE_HP_BAR, width, barHeight);
        }
    }
    protected startMagicBattleDuelSequence(target: MagicBattleDamageParticipant, version: number): void {
        const targetId = target.id;
        const playerWins = target.duelOutcome !== 'lose';
        const playerDamage = Math.max(1, Math.ceil(target.maxHp / HomeConfig.MAGIC_BATTLE_DUEL_DURATION));
        const targetDamage = Math.max(1, Math.ceil(HomeConfig.MAGIC_MAP_PLAYER_MAX_HP / HomeConfig.MAGIC_BATTLE_DUEL_DURATION));
        let round = 0;

        const runPlayerAttack = (): void => {
            if (version !== this.magicBattleDuelVersion || this.magicBattleDuelTargetId !== targetId) return;
            round += 1;
            this.refreshMagicBattleDuelPopup(target, `${this.profile.name || '\u6211'}\u53d1\u8d77\u653b\u51fb`);
            this.playMagicBattleDuelStrike(this.magicBattleDuelPlayerSkeleton, this.magicBattleDuelTargetSkeleton, true);
            const damage = playerWins && round >= HomeConfig.MAGIC_BATTLE_DUEL_DURATION
                ? this.magicBattleDuelTargetHp
                : Math.min(this.magicBattleDuelTargetHp, playerDamage);
            this.magicBattleDuelTargetHp = Math.max(0, this.magicBattleDuelTargetHp - damage);
            this.scheduleOnce(() => {
                if (version !== this.magicBattleDuelVersion || this.magicBattleDuelTargetId !== targetId) return;
                this.refreshMagicBattleDuelPopup(target, `${target.name}\u53d7\u5230\u4f24\u5bb3`);
                if (this.magicBattleDuelTargetHp <= 0 || (playerWins && round >= HomeConfig.MAGIC_BATTLE_DUEL_DURATION)) {
                    this.finishMagicBattleDuel(targetId, version);
                    return;
                }
                runTargetAttack();
            }, HomeConfig.MAGIC_BATTLE_DUEL_TURN_DELAY);
        };

        const runTargetAttack = (): void => {
            if (version !== this.magicBattleDuelVersion || this.magicBattleDuelTargetId !== targetId) return;
            this.refreshMagicBattleDuelPopup(target, `${target.name}\u53d1\u8d77\u653b\u51fb`);
            this.playMagicBattleDuelStrike(this.magicBattleDuelTargetSkeleton, this.magicBattleDuelPlayerSkeleton, false);
            const damage = !playerWins && round >= HomeConfig.MAGIC_BATTLE_DUEL_DURATION
                ? this.magicBattleDuelPlayerHp
                : Math.min(this.magicBattleDuelPlayerHp, Math.ceil(targetDamage * (playerWins ? 0.45 : 1)));
            this.magicBattleDuelPlayerHp = Math.max(0, this.magicBattleDuelPlayerHp - damage);
            this.scheduleOnce(() => {
                if (version !== this.magicBattleDuelVersion || this.magicBattleDuelTargetId !== targetId) return;
                this.refreshMagicBattleDuelPopup(target, `${this.profile.name || '\u6211'}\u53d7\u5230\u4f24\u5bb3`);
                if (this.magicBattleDuelPlayerHp <= 0 || (!playerWins && round >= HomeConfig.MAGIC_BATTLE_DUEL_DURATION)) {
                    this.finishMagicBattleDuel(targetId, version);
                    return;
                }
                this.scheduleOnce(runPlayerAttack, 0.18);
            }, HomeConfig.MAGIC_BATTLE_DUEL_TURN_DELAY);
        };

        this.scheduleOnce(runPlayerAttack, 0.25);
    }
    protected playMagicBattleDuelStrike(
        attacker: sp.Skeleton | null,
        defender: sp.Skeleton | null,
        attackerTowardRight: boolean,
    ): void {
        if (attacker?.isValid && attacker.skeletonData) {
            const node = attacker.node;
            const start = node.position.clone();
            const offsetX = attackerTowardRight ? 26 : -26;
            Tween.stopAllByTarget(node);
            tween(node)
                .to(0.12, { position: new Vec3(start.x + offsetX, start.y, start.z) }, { easing: 'sineOut' })
                .to(0.16, { position: start }, { easing: 'sineIn' })
                .start();
            this.playMagicBattleOneShot(
                attacker,
                HomeConfig.BATTLE_ROLE_NORMAL_ATTACK_ANIMATIONS,
                HomeConfig.IDLE_ANIMATIONS,
                HomeConfig.BATTLE_ROLE_ATTACK_TIME_SCALE,
            );
        }

        this.scheduleOnce(() => {
            if (!defender?.isValid || !defender.skeletonData) return;
            this.playMagicBattleOneShot(
                defender,
                HomeConfig.MAGIC_MAP_HURT_ANIMATIONS,
                HomeConfig.IDLE_ANIMATIONS,
                1,
            );
        }, 0.12);
    }
    protected finishMagicBattleDuel(targetId: MagicBattleParticipantId, version: number): void {
        if (version !== this.magicBattleDuelVersion || this.magicBattleDuelTargetId !== targetId) return;

        const target = this.magicBattleParticipants.find((participant) => participant.id === targetId);
        if (!target) {
            this.closeMagicBattleDuelPopup(true);
            return;
        }

        const status = this.findNode('MagicBattleDuelStatus', this.magicBattleDuelPopup || undefined)?.getComponent(Label);
        if (target.duelOutcome === 'lose') {
            this.magicBattleDuelPlayerHp = 0;
            this.refreshMagicBattleDuelPopup(target, '\u51b3\u6597\u5931\u8d25\uff0c\u5df2\u88ab\u8e22\u51fa\u623f\u95f4');
            if (status) status.string = '\u51b3\u6597\u5931\u8d25\uff0c\u5df2\u88ab\u8e22\u51fa\u623f\u95f4';
            this.scheduleOnce(() => {
                if (version !== this.magicBattleDuelVersion) return;
                this.showToast('\u51b3\u6597\u5931\u8d25\uff0c\u79bb\u5f00\u623f\u95f4\u540e\u4f24\u5bb3\u5df2\u6e05\u96f6');
                this.returnToMagicScenePanel();
            }, 0.8);
            return;
        }

        target.active = false;
        target.damage = 0;
        target.hp = 0;
        this.magicBattleDuelTargetHp = 0;
        this.refreshMagicBattleDuelPopup(target, `\u51b3\u6597\u80dc\u5229\uff0c${target.name}\u5df2\u79bb\u5f00\u623f\u95f4`);
        if (status) status.string = `\u51b3\u6597\u80dc\u5229\uff0c${target.name}\u5df2\u79bb\u5f00\u623f\u95f4`;
        this.refreshMagicBattleDamageHud();
        this.scheduleOnce(() => {
            if (version !== this.magicBattleDuelVersion) return;
            this.closeMagicBattleDuelPopup(true);
            this.showToast('\u51b3\u6597\u80dc\u5229\uff0c\u7ee7\u7eed\u6311\u6218\u5996\u602a');
        }, 0.8);
    }
    protected closeMagicBattleDuelPopup(resumeBattle: boolean): void {
        this.magicBattleDuelVersion += 1;
        this.magicBattleDuelTargetId = '';
        if (this.magicBattleDuelPopup?.isValid) this.magicBattleDuelPopup.active = false;
        if (this.magicBattleDuelPlayerSkeleton?.isValid) {
            Tween.stopAllByTarget(this.magicBattleDuelPlayerSkeleton.node);
            this.setSkeletonVisible(this.magicBattleDuelPlayerSkeleton, false);
        }
        if (this.magicBattleDuelTargetSkeleton?.isValid) {
            Tween.stopAllByTarget(this.magicBattleDuelTargetSkeleton.node);
            this.setSkeletonVisible(this.magicBattleDuelTargetSkeleton, false);
        }
        this.magicBattleDuelPlayerHp = 0;
        this.magicBattleDuelTargetHp = 0;
        if (resumeBattle && this.magicMonsterBattlePanel?.active && this.magicBattleEnemyHp > 0) {
            this.magicBattleActive = true;
        }
    }
}
