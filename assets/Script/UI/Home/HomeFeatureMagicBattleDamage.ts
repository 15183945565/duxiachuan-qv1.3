import {
    Color,
    HorizontalTextAlignment,
    Label,
    Node,
    Overflow,
    UITransform,
    Vec3,
} from 'cc';
import { applySimKaiFont } from '../Common/UIFont';
import * as HomeConfig from './HomeConfig';
import type { RoleGender } from './HomeTypes';
import { HomeViewBase } from './HomeViewBase';

type MagicBattleParticipantId = 'player' | 'npc-half' | 'npc-double';

interface MagicBattleDamageParticipant {
    id: MagicBattleParticipantId;
    name: string;
    isPlayer: boolean;
    skelPath?: string;
    duelScale?: number;
    duelGender?: RoleGender;
    attackAnimations?: readonly string[];
    damageMultiplier: number;
    damage: number;
    hp: number;
    maxHp: number;
    active: boolean;
    duelOutcome: 'win' | 'lose' | null;
}

function createMagicBattleDamageTextColor(): Color {
    return new Color(110, 90, 71, 255);
}

function createMagicBattleDamageRowTextColor(): Color {
    return new Color(255, 255, 255, 255);
}

function createMagicBattleDamageRowOutlineColor(): Color {
    return new Color(0, 0, 0, 255);
}

abstract class HomeFeatureMagicBattleDamageHost extends HomeViewBase {
    protected abstract magicBattleDamageHudRoot: Node | null;
    protected abstract magicBattleDamageListRoot: Node | null;
    protected abstract magicBattleDamageExpandedPosition: Vec3 | null;
    protected abstract magicBattleDamageCollapsed: boolean;
    protected abstract magicBattlePlayerDamage: number;
    protected abstract readonly magicBattleParticipants: MagicBattleDamageParticipant[];

    protected abstract setLabelOutline(label: Label, color: Color, width: number): void;
    protected abstract openMagicBattleDuelPopup(targetId: MagicBattleParticipantId): Promise<void>;
    protected abstract raiseMagicBattleOverlayLayers(): void;
}

/**
 * 魔界战斗伤害榜、参与者血量、进度条、折叠状态与单挑入口。
 */
export abstract class HomeFeatureMagicBattleDamage extends HomeFeatureMagicBattleDamageHost {
    protected ensureMagicBattleDamageHud(): void {
        if (!this.magicMonsterBattlePanel?.isValid) return;

        const rootInfo = this.getOrCreateBattleNode(
            this.magicMonsterBattlePanel,
            'MagicBattleDamageHudRoot',
            HomeConfig.MAGIC_BATTLE_DAMAGE_PANEL_WIDTH,
            HomeConfig.MAGIC_BATTLE_DAMAGE_PANEL_HEIGHT,
            HomeConfig.MAGIC_BATTLE_DAMAGE_PANEL_X,
            HomeConfig.MAGIC_BATTLE_DAMAGE_PANEL_Y,
        );
        const root = rootInfo.node;
        root.active = false;
        if (!rootInfo.existed) {
            root.setPosition(HomeConfig.MAGIC_BATTLE_DAMAGE_PANEL_X, HomeConfig.MAGIC_BATTLE_DAMAGE_PANEL_Y, 0);
        }
        this.magicBattleDamageExpandedPosition = root.position.clone();
        this.magicBattleDamageHudRoot = root;

        const toggle = this.getOrCreateBattleSkinnedNode(
            root,
            'MagicBattleDamageToggle',
            42,
            42,
            -202,
            226,
            HomeConfig.UI_MAGIC_DAMAGE_TOGGLE,
        ).node;
        toggle.setSiblingIndex(20);
        this.bindScaledClick(toggle, () => this.toggleMagicBattleDamagePanel());

        const content = this.getOrCreateBattleNode(
            root,
            'MagicBattleDamageContent',
            HomeConfig.MAGIC_BATTLE_DAMAGE_PANEL_WIDTH,
            HomeConfig.MAGIC_BATTLE_DAMAGE_PANEL_HEIGHT,
            0,
            0,
        ).node;
        content.setSiblingIndex(1);

        const infoBg = this.getOrCreateBattleSkinnedNode(
            content,
            'MagicBattleDamageInfoBg',
            HomeConfig.MAGIC_BATTLE_DAMAGE_INFO_BG_WIDTH,
            HomeConfig.MAGIC_BATTLE_DAMAGE_INFO_BG_HEIGHT,
            0,
            HomeConfig.MAGIC_BATTLE_DAMAGE_INFO_BG_Y,
            HomeConfig.UI_MAGIC_DAMAGE_INFO_BG,
        ).node;
        infoBg.setSiblingIndex(0);

        const titleFrame = this.getOrCreateBattleSkinnedNode(
            content,
            'MagicBattleDamageTitleFrame',
            368,
            59,
            0,
            226,
            HomeConfig.UI_MAGIC_DAMAGE_TITLE_FRAME,
        ).node;
        titleFrame.setSiblingIndex(1);
        const title = this.getOrCreateBattleLabel(
            titleFrame,
            'MagicBattleDamageTitle',
            '\u4f24\u5bb3\u7edf\u8ba1',
            26,
            0,
            1,
            220,
            42,
            createMagicBattleDamageTextColor(),
        ).label;
        title.lineHeight = 34;
        this.setMagicFloorTextEdge(title, false);
        title.node.setSiblingIndex(2);

        this.magicBattleDamageListRoot = this.getOrCreateBattleNode(
            content,
            'MagicBattleDamageList',
            378,
            260,
            0,
            0,
        ).node;
        this.magicBattleDamageListRoot.setSiblingIndex(2);

        const rankFrame = this.getOrCreateBattleSkinnedNode(
            content,
            'MagicBattleMyRankFrame',
            368,
            76,
            0,
            -150,
            HomeConfig.UI_MAGIC_DAMAGE_RANK_FRAME,
        ).node;
        rankFrame.setSiblingIndex(3);
        const rankLabel = this.getOrCreateBattleLabel(
            rankFrame,
            'MagicBattleMyRankLabel',
            '',
            22,
            0,
            12,
            330,
            30,
            createMagicBattleDamageTextColor(),
        ).label;
        rankLabel.lineHeight = 28;
        this.setMagicFloorTextEdge(rankLabel, false);
        const ruleLabel = this.getOrCreateBattleLabel(
            rankFrame,
            'MagicBattleRewardRuleLabel',
            '\u7b2c\u4e00\u540d\u624d\u53ef\u83b7\u5f97\u5956\u52b1\uff0c\u79bb\u5f00\u623f\u95f4\u4f24\u5bb3\u6e05\u96f6',
            18,
            0,
            -16,
            338,
            28,
            createMagicBattleDamageTextColor(),
        ).label;
        ruleLabel.lineHeight = 24;
        ruleLabel.overflow = Overflow.SHRINK;
        this.setMagicFloorTextEdge(ruleLabel, false);

        this.applyMagicBattleDamagePanelVisibility();
        this.raiseMagicBattleOverlayLayers();
    }
    protected resetMagicBattleDamageState(): void {
        const playerName = this.profile.name || '\u6211';
        this.magicBattlePlayerDamage = 0;
        this.magicBattleParticipants.length = 0;
        this.magicBattleParticipants.push(
            {
                id: 'player',
                name: playerName,
                isPlayer: true,
                damageMultiplier: 1,
                damage: 0,
                hp: HomeConfig.MAGIC_MAP_PLAYER_MAX_HP,
                maxHp: HomeConfig.MAGIC_MAP_PLAYER_MAX_HP,
                active: true,
                duelOutcome: null,
            },
            {
                id: 'npc-half',
                name: '\u7537\u89d2\u8272',
                isPlayer: false,
                skelPath: HomeConfig.ROLE_ASSETS.male.skelPath,
                duelScale: HomeConfig.ROLE_ASSETS.male.mapScale,
                duelGender: 'male',
                attackAnimations: HomeConfig.BATTLE_ROLE_NORMAL_ATTACK_ANIMATIONS.male,
                damageMultiplier: 0.5,
                damage: 0,
                hp: HomeConfig.MAGIC_MAP_PLAYER_MAX_HP,
                maxHp: HomeConfig.MAGIC_MAP_PLAYER_MAX_HP,
                active: true,
                duelOutcome: 'lose',
            },
            {
                id: 'npc-double',
                name: '\u5973\u89d2\u8272',
                isPlayer: false,
                skelPath: HomeConfig.ROLE_ASSETS.female.skelPath,
                duelScale: HomeConfig.ROLE_ASSETS.female.mapScale,
                duelGender: 'female',
                attackAnimations: HomeConfig.BATTLE_ROLE_NORMAL_ATTACK_ANIMATIONS.female,
                damageMultiplier: 2,
                damage: 0,
                hp: HomeConfig.MAGIC_MAP_PLAYER_MAX_HP,
                maxHp: HomeConfig.MAGIC_MAP_PLAYER_MAX_HP,
                active: true,
                duelOutcome: 'win',
            },
        );
        this.refreshMagicBattleDamageHud();
    }
    protected applyMagicBattlePlayerDamage(damage: number): void {
        this.magicBattlePlayerDamage += Math.max(0, damage);
        this.magicBattleParticipants.forEach((participant) => {
            if (!participant.active) return;
            participant.damage = Math.floor(this.magicBattlePlayerDamage * participant.damageMultiplier);
        });
        this.refreshMagicBattleDamageHud();
    }
    protected refreshMagicBattleDamageHud(): void {
        if (!this.magicBattleDamageHudRoot?.isValid || !this.magicBattleDamageListRoot?.isValid) return;
        if (!this.magicBattleParticipants.length) return;

        this.magicBattleDamageHudRoot.active = !!this.magicMonsterBattlePanel?.active;
        this.applyMagicBattleDamagePanelVisibility();
        this.raiseMagicBattleOverlayLayers();

        const ranked = this.getMagicBattleDamageRanking();
        ranked.forEach((participant, index) => {
            this.refreshMagicBattleDamageRow(participant, index);
        });
        for (let index = ranked.length; index < 5; index += 1) {
            const row = this.magicBattleDamageListRoot.getChildByName(`MagicBattleDamageRow_${index + 1}`);
            if (row?.isValid) row.active = false;
        }

        const playerRank = this.getMagicBattlePlayerRank();
        const totalDamage = ranked.reduce((sum, item) => sum + item.damage, 0);
        const percent = totalDamage > 0 ? Math.floor((this.magicBattlePlayerDamage / totalDamage) * 100) : 0;
        const rankLabel = this.findNode('MagicBattleMyRankLabel', this.magicBattleDamageHudRoot)?.getComponent(Label);
        if (rankLabel) {
            rankLabel.string = `\u6211\u7684\u6392\u540d:${playerRank || '-'}  \u4f24\u5bb3:${this.formatMagicBattleDamageValue(this.magicBattlePlayerDamage)}(${percent}%)`;
        }
    }
    protected refreshMagicBattleDamageRow(participant: MagicBattleDamageParticipant, index: number): void {
        if (!this.magicBattleDamageListRoot?.isValid) return;

        const rowInfo = this.getOrCreateBattleNode(
            this.magicBattleDamageListRoot,
            `MagicBattleDamageRow_${index + 1}`,
            HomeConfig.MAGIC_BATTLE_DAMAGE_ROW_WIDTH,
            HomeConfig.MAGIC_BATTLE_DAMAGE_ROW_HEIGHT,
            0,
            HomeConfig.MAGIC_BATTLE_DAMAGE_ROW_START_Y - index * HomeConfig.MAGIC_BATTLE_DAMAGE_ROW_GAP,
        );
        const row = rowInfo.node;
        row.active = true;
        if (!rowInfo.existed) {
            row.setPosition(0, HomeConfig.MAGIC_BATTLE_DAMAGE_ROW_START_Y - index * HomeConfig.MAGIC_BATTLE_DAMAGE_ROW_GAP, 0);
        }
        this.applyMagicBattleDamageRowEditorTemplate(row, index);
        row.setSiblingIndex(index + 1);

        this.getOrCreateBattleSkinnedNode(
            row,
            'MagicBattleDamageRowBg',
            300,
            66,
            -34,
            0,
            HomeConfig.UI_MAGIC_DAMAGE_TRANSLUCENT_FRAME,
        ).node.setSiblingIndex(0);

        const damageTextColor = createMagicBattleDamageRowTextColor();
        const rank = this.getOrCreateBattleLabel(row, 'MagicBattleDamageRank', `${index + 1}`, 22, -172, 17, 34, 28, damageTextColor).label;
        rank.lineHeight = 28;
        this.applyMagicBattleDamageTextStyle(rank);
        const name = this.getOrCreateBattleLabel(row, 'MagicBattleDamageName', participant.name, 18, -98, 18, 150, 28, damageTextColor).label;
        name.horizontalAlign = HorizontalTextAlignment.LEFT;
        name.lineHeight = 24;
        name.overflow = Overflow.SHRINK;
        this.applyMagicBattleDamageTextStyle(name);

        const hpTitle = this.getOrCreateBattleLabel(row, 'MagicBattleDamageHpTitle', '\u73a9\u5bb6\u8840\u91cf', 17, -125, -8, 96, 24, damageTextColor).label;
        hpTitle.horizontalAlign = HorizontalTextAlignment.LEFT;
        this.applyMagicBattleDamageTextStyle(hpTitle);
        this.refreshMagicBattleDamageBar(
            row,
            'MagicBattleDamageHp',
            participant.hp / Math.max(1, participant.maxHp),
            -24,
            -8,
            HomeConfig.UI_MAGIC_DAMAGE_HP_BAR,
        );

        const outputTitle = this.getOrCreateBattleLabel(row, 'MagicBattleDamageOutputTitle', '\u8f93\u51fa\u4f24\u5bb3', 17, -125, -29, 96, 24, damageTextColor).label;
        outputTitle.horizontalAlign = HorizontalTextAlignment.LEFT;
        this.applyMagicBattleDamageTextStyle(outputTitle);
        const topDamage = Math.max(1, ...this.magicBattleParticipants.filter((item) => item.active).map((item) => item.damage));
        this.refreshMagicBattleDamageBar(
            row,
            'MagicBattleDamageOutput',
            participant.damage / topDamage,
            -24,
            -29,
            HomeConfig.UI_MAGIC_DAMAGE_OUTPUT_BAR,
        );

        const damage = this.getOrCreateBattleLabel(
            row,
            'MagicBattleDamageValue',
            this.formatMagicBattleDamageValue(participant.damage),
            16,
            28,
            -29,
            128,
            24,
            damageTextColor,
        ).label;
        damage.horizontalAlign = HorizontalTextAlignment.RIGHT;
        this.applyMagicBattleDamageTextStyle(damage);

        const duelButton = this.getOrCreateBattleSkinnedNode(
            row,
            'MagicBattleDamageDuelButton',
            HomeConfig.MAGIC_BATTLE_DAMAGE_DUEL_BUTTON_WIDTH,
            HomeConfig.MAGIC_BATTLE_DAMAGE_DUEL_BUTTON_HEIGHT,
            138,
            -6,
            HomeConfig.UI_MAGIC_DUEL_BUTTON,
        ).node;
        duelButton.active = true;
        duelButton.setSiblingIndex(8);
        duelButton.off(Node.EventType.TOUCH_START);
        duelButton.off(Node.EventType.TOUCH_END);
        duelButton.off(Node.EventType.TOUCH_CANCEL);

        const duelLabel = this.getOrCreateBattleLabel(
            duelButton,
            'MagicBattleDamageDuelButtonLabel',
            participant.isPlayer ? '\u81ea\u5df1' : participant.active ? '\u51b3\u6597' : '\u5df2\u79bb\u5f00',
            participant.active && !participant.isPlayer ? 22 : 19,
            0,
            0,
            84,
            34,
            createMagicBattleDamageTextColor(),
        ).label;
        duelLabel.string = participant.isPlayer ? '\u81ea\u5df1' : participant.active ? '\u51b3\u6597' : '\u5df2\u79bb\u5f00';
        duelLabel.fontSize = participant.active && !participant.isPlayer ? 22 : 19;
        duelLabel.lineHeight = 28;
        duelLabel.color = createMagicBattleDamageTextColor();
        this.setMagicFloorTextEdge(duelLabel, false);
        duelLabel.node.active = true;
        duelLabel.node.setSiblingIndex(1);

        if (!participant.isPlayer && participant.active) {
            this.bindScaledClick(duelButton, () => {
                void this.openMagicBattleDuelPopup(participant.id);
            });
        }
        this.applyMagicBattleDamageRowLayerOrder(row);
    }
    protected applyMagicBattleDamageTextStyle(label: Label): void {
        applySimKaiFont(label);
        label.color = createMagicBattleDamageRowTextColor();
        label.overflow = Overflow.SHRINK;
        label.enableWrapText = false;
        this.setMagicFloorTextEdge(label, true, createMagicBattleDamageRowOutlineColor(), 2);
    }
    protected applyMagicBattleDamageRowEditorTemplate(row: Node, index: number): void {
        if (index <= 0 || !this.magicBattleDamageListRoot?.isValid) return;
        const template = this.magicBattleDamageListRoot.getChildByName('MagicBattleDamageRow_1');
        if (!template?.isValid || template === row) return;

        const rowY = row.position.y;
        row.setPosition(template.position.x, rowY, template.position.z);
        row.setScale(template.scale);
        const templateTransform = template.getComponent(UITransform);
        const rowTransform = row.getComponent(UITransform) || row.addComponent(UITransform);
        if (templateTransform) {
            rowTransform.setContentSize(templateTransform.contentSize);
            rowTransform.setAnchorPoint(templateTransform.anchorPoint.x, templateTransform.anchorPoint.y);
        }

        template.children.forEach((sourceChild) => {
            const targetChild = row.getChildByName(sourceChild.name);
            if (!targetChild?.isValid) return;
            this.copyMagicBattleDamageNodeLayout(sourceChild, targetChild);
            sourceChild.children.forEach((sourceGrandChild) => {
                const targetGrandChild = targetChild.getChildByName(sourceGrandChild.name);
                if (targetGrandChild?.isValid) {
                    this.copyMagicBattleDamageNodeLayout(sourceGrandChild, targetGrandChild);
                }
            });
        });
    }
    protected copyMagicBattleDamageNodeLayout(source: Node, target: Node): void {
        target.setPosition(source.position);
        target.setScale(source.scale);
        target.setRotation(source.rotation);
        const dynamicActiveNode = source.name === 'MagicBattleDamageDuelButton' || source.name === 'MagicBattleDamageDuelButtonLabel';
        if (!dynamicActiveNode) {
            target.active = source.active;
        }

        const sourceTransform = source.getComponent(UITransform);
        if (sourceTransform) {
            const targetTransform = target.getComponent(UITransform) || target.addComponent(UITransform);
            targetTransform.setContentSize(sourceTransform.contentSize);
            targetTransform.setAnchorPoint(sourceTransform.anchorPoint.x, sourceTransform.anchorPoint.y);
        }

        const sourceLabel = source.getComponent(Label);
        const targetLabel = target.getComponent(Label);
        if (sourceLabel && targetLabel) {
            targetLabel.font = sourceLabel.font;
            targetLabel.fontFamily = sourceLabel.fontFamily;
            targetLabel.fontSize = sourceLabel.fontSize;
            targetLabel.lineHeight = sourceLabel.lineHeight;
            targetLabel.color = new Color(sourceLabel.color.r, sourceLabel.color.g, sourceLabel.color.b, sourceLabel.color.a);
            targetLabel.horizontalAlign = sourceLabel.horizontalAlign;
            targetLabel.verticalAlign = sourceLabel.verticalAlign;
            targetLabel.overflow = sourceLabel.overflow;
            targetLabel.enableWrapText = sourceLabel.enableWrapText;
            targetLabel.enableOutline = sourceLabel.enableOutline;
            targetLabel.outlineColor = new Color(
                sourceLabel.outlineColor.r,
                sourceLabel.outlineColor.g,
                sourceLabel.outlineColor.b,
                sourceLabel.outlineColor.a,
            );
            targetLabel.outlineWidth = sourceLabel.outlineWidth;
        }
    }
    protected applyMagicBattleDamageRowLayerOrder(row: Node): void {
        const orderedNames = [
            'MagicBattleDamageRowBg',
            'MagicBattleDamageHpFrame',
            'MagicBattleDamageHpFill',
            'MagicBattleDamageOutputFrame',
            'MagicBattleDamageOutputFill',
            'MagicBattleDamageRank',
            'MagicBattleDamageName',
            'MagicBattleDamageHpTitle',
            'MagicBattleDamageOutputTitle',
            'MagicBattleDamageValue',
            'MagicBattleDamageDuelButton',
        ];
        orderedNames.forEach((name, index) => {
            const child = row.getChildByName(name);
            if (child?.isValid) child.setSiblingIndex(index);
        });
        const duelButton = row.getChildByName('MagicBattleDamageDuelButton');
        const duelLabel = duelButton?.getChildByName('MagicBattleDamageDuelButtonLabel');
        if (duelLabel?.isValid) duelLabel.setSiblingIndex((duelLabel.parent?.children.length || 1) - 1);
    }
    protected refreshMagicBattleDamageBar(parent: Node, prefix: string, ratio: number, x: number, y: number, fillPath: string): void {
        const frame = this.getOrCreateBattleSkinnedNode(parent, `${prefix}Frame`, HomeConfig.MAGIC_BATTLE_DAMAGE_BAR_WIDTH, HomeConfig.MAGIC_BATTLE_DAMAGE_BAR_HEIGHT, x, y, HomeConfig.UI_MAGIC_DAMAGE_BAR_FRAME).node;
        const frameTransform = frame.getComponent(UITransform) || frame.addComponent(UITransform);
        const width = frameTransform.contentSize.width > 0 ? frameTransform.contentSize.width : HomeConfig.MAGIC_BATTLE_DAMAGE_BAR_WIDTH;
        const height = frameTransform.contentSize.height > 0 ? frameTransform.contentSize.height : HomeConfig.MAGIC_BATTLE_DAMAGE_BAR_HEIGHT;
        const frameX = frame.position.x;
        const frameY = frame.position.y;
        const fillWidth = Math.max(2, Math.floor(width * this.clamp(ratio, 0, 1)));
        const fill = this.getOrCreateBattleNode(parent, `${prefix}Fill`, fillWidth, height, frameX, frameY).node;
        const frameScaleX = frame.scale.x || 1;
        const frameAnchorX = frameTransform.anchorPoint.x;
        const fillTransform = fill.getComponent(UITransform) || fill.addComponent(UITransform);
        const fillAnchorX = fillTransform.anchorPoint.x;
        const frameLeft = frameX - width * frameScaleX * frameAnchorX;
        fill.setScale(frame.scale);
        fill.setPosition(frameLeft + fillWidth * frameScaleX * fillAnchorX, frameY, 0);
        fillTransform.setContentSize(fillWidth, height);
        this.applyUiSkin(fill, fillPath, fillWidth, height);
    }
    protected getMagicBattleDamageRanking(): MagicBattleDamageParticipant[] {
        return this.magicBattleParticipants
            .slice()
            .sort((a, b) => (
                (a.active === b.active ? 0 : a.active ? -1 : 1)
                || b.damage - a.damage
                || (a.isPlayer ? -1 : b.isPlayer ? 1 : 0)
            ));
    }
    protected getMagicBattlePlayerRank(): number {
        const ranking = this.getMagicBattleDamageRanking();
        const index = ranking.findIndex((participant) => participant.isPlayer);
        return index >= 0 ? index + 1 : 0;
    }
    protected formatMagicBattleDamageValue(value: number): string {
        return `${Math.max(0, Math.floor(value))}`;
    }
    protected toggleMagicBattleDamagePanel(): void {
        this.magicBattleDamageCollapsed = !this.magicBattleDamageCollapsed;
        this.applyMagicBattleDamagePanelVisibility();
    }
    protected applyMagicBattleDamagePanelVisibility(): void {
        const root = this.magicBattleDamageHudRoot;
        if (!root?.isValid) return;

        const expanded = this.magicBattleDamageExpandedPosition || new Vec3(HomeConfig.MAGIC_BATTLE_DAMAGE_PANEL_X, HomeConfig.MAGIC_BATTLE_DAMAGE_PANEL_Y, 0);
        const collapsedX = expanded.x + (HomeConfig.MAGIC_BATTLE_DAMAGE_COLLAPSED_X - HomeConfig.MAGIC_BATTLE_DAMAGE_PANEL_X);
        root.setPosition(
            this.magicBattleDamageCollapsed ? collapsedX : expanded.x,
            expanded.y,
            expanded.z,
        );
        const content = root.getChildByName('MagicBattleDamageContent');
        if (content?.isValid) content.active = !this.magicBattleDamageCollapsed;
        const toggle = root.getChildByName('MagicBattleDamageToggle');
        if (toggle?.isValid) {
            const face = this.magicBattleDamageCollapsed ? -1 : 1;
            toggle.setScale(face, 1, 1);
        }
    }
}
