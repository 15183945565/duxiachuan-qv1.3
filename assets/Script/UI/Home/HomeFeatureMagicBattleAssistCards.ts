import {
    Color,
    EventTouch,
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

type MagicMapAssistCardId = 'protect_card' | 'power_card';

interface MagicMapAssistCardConfig {
    id: MagicMapAssistCardId;
    name: string;
    slotName: string;
    iconPath: string;
    y: number;
}

const MAGIC_MAP_ASSIST_ROOT_NAME = 'MagicMapAssistCardRoot';
const MAGIC_MAP_ASSIST_POPUP_NAME = 'MagicMapAssistCardConfirmPopup';
const MAGIC_MAP_ASSIST_POWER_BONUS_PERCENT_PER_CARD = 10;
const MAGIC_MAP_ASSIST_POWER_BONUS_MAX_STACK = 5;

const MAGIC_MAP_ASSIST_CARDS: readonly MagicMapAssistCardConfig[] = [
    {
        id: 'protect_card',
        name: '\u4fdd\u62a4\u5361',
        slotName: 'MagicMapAssistProtectCardSlot',
        iconPath: HomeConfig.UI_SHOP_PROTECT_CARD,
        y: HomeConfig.MAGIC_BATTLE_ASSIST_CARD_SLOT_GAP * 0.5,
    },
    {
        id: 'power_card',
        name: '\u6218\u529b\u5361',
        slotName: 'MagicMapAssistPowerCardSlot',
        iconPath: HomeConfig.UI_SHOP_POWER_CARD,
        y: -HomeConfig.MAGIC_BATTLE_ASSIST_CARD_SLOT_GAP * 0.5,
    },
] as const;

export abstract class HomeFeatureMagicBattleAssistCards extends HomeViewBase {
    protected magicBattleAssistProtected = false;
    protected magicBattleAssistPowerBonusPercent = 0;
    protected magicBattleAssistPowerCardStacks = 0;
    protected magicMapAssistProtectStatusLabel: Label | null = null;
    protected magicMapAssistPowerStatusLabel: Label | null = null;
    protected magicBattleAssistProtectStatusLabel: Label | null = null;
    protected magicBattleAssistPowerStatusLabel: Label | null = null;

    protected setupMagicMapAssistCards(): void {
        const root = this.ensureMagicMapAssistCardRoot();
        if (!root?.isValid) return;

        root.active = true;
        root.setSiblingIndex((root.parent?.children.length || 1) - 1);
        MAGIC_MAP_ASSIST_CARDS.forEach((config) => this.setupMagicMapAssistCardSlot(root, config));
        this.ensureMagicMapAssistCardConfirmPopup();
        this.refreshMagicBattleAssistEffectLabels();
        this.hideLegacyMagicBattleAssistCards();
    }

    protected setupMagicBattleAssistCards(): void {
        this.hideLegacyMagicBattleAssistCards();
    }

    protected hideLegacyMagicBattleAssistCards(): void {
        const legacyRoot = this.findNode('MagicBattleAssistCardRoot', this.magicMonsterBattlePanel || undefined);
        if (legacyRoot?.isValid) legacyRoot.active = false;

        const legacyPopup = this.findNode('MagicBattleAssistCardConfirmPopup', this.magicMonsterBattlePanel || undefined);
        if (legacyPopup?.isValid) legacyPopup.active = false;
    }

    protected resetMagicBattleAssistEffects(): void {
        this.magicBattleAssistProtected = false;
        this.magicBattleAssistPowerBonusPercent = 0;
        this.magicBattleAssistPowerCardStacks = 0;
        this.refreshMagicBattleAssistEffectLabels();
    }

    protected getMagicBattlePowerMultiplier(): number {
        return 1 + Math.max(0, this.magicBattleAssistPowerBonusPercent) / 100;
    }

    protected ensureMagicMapAssistCardRoot(): Node | null {
        if (!this.magicMapPanel?.isValid) return null;
        const parent = this.findNode('MagicMapHud', this.magicMapPanel) || this.magicMapPanel;
        let root = this.findNode(MAGIC_MAP_ASSIST_ROOT_NAME, this.magicMapPanel);
        const rootHeight = HomeConfig.MAGIC_BATTLE_ASSIST_CARD_SLOT_HEIGHT
            + HomeConfig.MAGIC_BATTLE_ASSIST_CARD_SLOT_GAP;

        if (!root) {
            root = this.createNode(
                MAGIC_MAP_ASSIST_ROOT_NAME,
                parent,
                HomeConfig.MAGIC_BATTLE_ASSIST_CARD_SLOT_WIDTH,
                rootHeight,
                HomeConfig.MAGIC_BATTLE_ASSIST_CARD_ROOT_X,
                HomeConfig.MAGIC_BATTLE_ASSIST_CARD_ROOT_Y,
            );
        } else {
            root.active = true;
            const transform = root.getComponent(UITransform) || root.addComponent(UITransform);
            if (transform.contentSize.width <= 0 || transform.contentSize.height <= 0) {
                transform.setContentSize(HomeConfig.MAGIC_BATTLE_ASSIST_CARD_SLOT_WIDTH, rootHeight);
            }
        }

        return root;
    }

    protected setupMagicMapAssistCardSlot(root: Node, config: MagicMapAssistCardConfig): void {
        let slot = root.getChildByName(config.slotName);
        if (!slot) {
            slot = this.createNode(
                config.slotName,
                root,
                HomeConfig.MAGIC_BATTLE_ASSIST_CARD_SLOT_WIDTH,
                HomeConfig.MAGIC_BATTLE_ASSIST_CARD_SLOT_HEIGHT,
                0,
                config.y,
            );
        } else {
            slot.active = true;
            const transform = slot.getComponent(UITransform) || slot.addComponent(UITransform);
            if (transform.contentSize.width <= 0 || transform.contentSize.height <= 0) {
                transform.setContentSize(
                    HomeConfig.MAGIC_BATTLE_ASSIST_CARD_SLOT_WIDTH,
                    HomeConfig.MAGIC_BATTLE_ASSIST_CARD_SLOT_HEIGHT,
                );
            }
        }

        this.getOrCreateMagicMapAssistSkin(
            slot,
            `${config.slotName}Bg`,
            HomeConfig.MAGIC_BATTLE_ASSIST_CARD_SLOT_WIDTH,
            HomeConfig.MAGIC_BATTLE_ASSIST_CARD_SLOT_HEIGHT,
            0,
            0,
            HomeConfig.UI_MAGIC_BATTLE_ASSIST_CARD_SLOT_BG,
        ).setSiblingIndex(0);

        this.getOrCreateMagicMapAssistSkin(
            slot,
            `${config.slotName}Icon`,
            HomeConfig.MAGIC_BATTLE_ASSIST_CARD_ICON_SIZE,
            HomeConfig.MAGIC_BATTLE_ASSIST_CARD_ICON_SIZE,
            0,
            HomeConfig.MAGIC_BATTLE_ASSIST_CARD_ICON_Y,
            config.iconPath,
        ).setSiblingIndex(1);

        const useLabel = this.getOrCreateMagicMapAssistLabel(
            slot,
            `${config.slotName}UseLabel`,
            '\u7acb\u5373\u4f7f\u7528',
            20,
            0,
            HomeConfig.MAGIC_BATTLE_ASSIST_CARD_USE_LABEL_Y,
            100,
            28,
            new Color(255, 241, 184, 255),
        );
        this.applyMagicMapAssistLabelStyle(useLabel, new Color(54, 26, 10, 255), 0);
        this.cleanupMagicMapAssistSlotLabels(slot, useLabel);

        this.bindScaledClick(slot, () => this.handleMagicMapAssistCardClick(config.id));
    }

    protected handleMagicMapAssistCardClick(cardId: MagicMapAssistCardId): void {
        this.ensureShopStore();
        const config = MAGIC_MAP_ASSIST_CARDS.find((item) => item.id === cardId);
        if (!config || !this.shopStore) return;

        const count = this.shopStore.inventory[cardId] || 0;
        this.openMagicMapAssistCardConfirm(config, count);
    }

    protected openMagicMapAssistCardConfirm(config: MagicMapAssistCardConfig, count: number): void {
        const popup = this.ensureMagicMapAssistCardConfirmPopup();
        if (!popup?.isValid) return;

        popup.active = true;
        this.ensureInputBlocker(popup);
        popup.setSiblingIndex((popup.parent?.children.length || 1) - 1);

        const board = this.findNode('MagicMapAssistCardConfirmBoard', popup);
        popup.off(Node.EventType.TOUCH_END);
        popup.on(Node.EventType.TOUCH_END, (event: EventTouch) => {
            event.propagationStopped = true;
            this.closeMagicMapAssistCardConfirmPopup();
        }, this);
        if (board?.isValid) {
            board.off(Node.EventType.TOUCH_END);
            board.on(Node.EventType.TOUCH_END, (event: EventTouch) => {
                event.propagationStopped = true;
            }, this);
        }

        const currentLabel = this.findNode('MagicMapAssistCardConfirmCurrentLabel', popup)?.getComponent(Label);
        if (currentLabel) currentLabel.node.active = false;

        const icon = this.findNode('MagicMapAssistCardConfirmIcon', popup);
        if (icon) {
            this.applyUiSkinKeepingEditorSize(
                icon,
                config.iconPath,
                HomeConfig.MAGIC_BATTLE_ASSIST_CONFIRM_ICON_SIZE,
                HomeConfig.MAGIC_BATTLE_ASSIST_CONFIRM_ICON_SIZE,
            );
        }
        this.hideMagicMapAssistConfirmIcons(popup);
        this.hideMagicMapAssistConfirmIcons(this.magicMapPanel);
        this.hideMagicMapAssistConfirmIcons(this.magicMonsterBattlePanel);

        const questionLabel = this.findNode('MagicMapAssistCardConfirmQuestionLabel', popup)?.getComponent(Label);
        if (questionLabel) {
            questionLabel.string = `\u662f\u5426\u82b1\u8d391\u5f20${config.name}\uff08\u62e5\u6709${count}\u5f20\uff09`;
            questionLabel.node.setPosition(0, 8, 0);
            (questionLabel.node.getComponent(UITransform) || questionLabel.node.addComponent(UITransform)).setContentSize(540, 58);
            questionLabel.fontSize = 26;
            questionLabel.lineHeight = 34;
        }

        const cancel = this.findNode('MagicMapAssistCardConfirmCancelButton', popup);
        if (cancel) {
            this.bindScaledClick(cancel, () => this.closeMagicMapAssistCardConfirmPopup());
        }
        const ok = this.findNode('MagicMapAssistCardConfirmOkButton', popup);
        if (ok) {
            this.bindScaledClick(ok, () => this.confirmMagicMapAssistCardUse(config.id));
        }
    }

    protected ensureMagicMapAssistCardConfirmPopup(): Node | null {
        if (!this.magicMapPanel?.isValid) return null;
        let popup = this.magicMapPanel.getChildByName(MAGIC_MAP_ASSIST_POPUP_NAME);
        if (!popup) {
            popup = this.createNode(MAGIC_MAP_ASSIST_POPUP_NAME, this.magicMapPanel, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT, 0, 0);
            popup.active = false;
        } else {
            (popup.getComponent(UITransform) || popup.addComponent(UITransform)).setContentSize(HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT);
        }

        const board = this.getOrCreateMagicMapAssistSkin(
            popup,
            'MagicMapAssistCardConfirmBoard',
            HomeConfig.MAGIC_BATTLE_ASSIST_CONFIRM_POPUP_WIDTH,
            HomeConfig.MAGIC_BATTLE_ASSIST_CONFIRM_POPUP_HEIGHT,
            0,
            0,
            HomeConfig.UI_MAGIC_BATTLE_ASSIST_CONFIRM_BG,
        );
        this.ensureInputBlocker(board, HomeConfig.MAGIC_BATTLE_ASSIST_CONFIRM_POPUP_WIDTH, HomeConfig.MAGIC_BATTLE_ASSIST_CONFIRM_POPUP_HEIGHT);

        const titleSkin = this.getOrCreateMagicMapAssistSkin(
            board,
            'MagicMapAssistCardConfirmTitleSkin',
            HomeConfig.MAGIC_BATTLE_ASSIST_CONFIRM_TITLE_WIDTH,
            HomeConfig.MAGIC_BATTLE_ASSIST_CONFIRM_TITLE_HEIGHT,
            0,
            HomeConfig.MAGIC_BATTLE_ASSIST_CONFIRM_TITLE_Y,
            HomeConfig.UI_CONFIRM_TITLE_BG,
        );
        titleSkin.active = true;
        const title = this.getOrCreateMagicMapAssistLabel(
            board,
            'MagicMapAssistCardConfirmTitle',
            '\u7cfb\u7edf\u63d0\u793a',
            HomeConfig.SHARED_CONFIRM_TITLE_FONT_SIZE,
            0,
            HomeConfig.MAGIC_BATTLE_ASSIST_CONFIRM_TITLE_Y,
            HomeConfig.SHARED_CONFIRM_TITLE_LABEL_WIDTH,
            HomeConfig.SHARED_CONFIRM_TITLE_LABEL_HEIGHT,
            new Color(255, 239, 187, 255),
        );
        this.applyMagicMapAssistLabelStyle(title, new Color(70, 32, 12, 255), 3);

        const current = this.getOrCreateMagicMapAssistLabel(
            board,
            'MagicMapAssistCardConfirmCurrentLabel',
            '\u5f53\u524d\u62e5\u6709\uff1a0',
            26,
            -40,
            76,
            260,
            44,
            new Color(88, 50, 26, 255),
        );
        current.node.active = false;
        this.applyMagicMapAssistLabelStyle(current, new Color(255, 245, 220, 255), 1);

        const icon = this.getOrCreateMagicMapAssistSkin(
            board,
            'MagicMapAssistCardConfirmIcon',
            HomeConfig.MAGIC_BATTLE_ASSIST_CONFIRM_ICON_SIZE,
            HomeConfig.MAGIC_BATTLE_ASSIST_CONFIRM_ICON_SIZE,
            -238,
            8,
            HomeConfig.UI_SHOP_PROTECT_CARD,
        );
        icon.active = false;
        icon.setScale(0, 0, 1);
        (icon.getComponent(UITransform) || icon.addComponent(UITransform)).setContentSize(0, 0);

        const question = this.getOrCreateMagicMapAssistLabel(
            board,
            'MagicMapAssistCardConfirmQuestionLabel',
            '\u662f\u5426\u82b1\u8d391\u5f20\u4fdd\u62a4\u5361\uff08\u62e5\u67090\u5f20\uff09',
            26,
            0,
            8,
            540,
            58,
            new Color(82, 45, 24, 255),
        );
        this.applyMagicMapAssistLabelStyle(question, new Color(255, 247, 224, 255), 1);

        this.setupMagicMapAssistConfirmButton(board, 'MagicMapAssistCardConfirmCancelButton', HomeConfig.MAGIC_BATTLE_ASSIST_CONFIRM_CANCEL_BUTTON_X, '\u53d6\u6d88');
        this.setupMagicMapAssistConfirmButton(board, 'MagicMapAssistCardConfirmOkButton', HomeConfig.MAGIC_BATTLE_ASSIST_CONFIRM_OK_BUTTON_X, '\u786e\u5b9a');
        this.hideMagicMapAssistConfirmIcons(popup);

        return popup;
    }

    protected hideMagicMapAssistConfirmIcons(root: Node | null): void {
        if (!root?.isValid) return;

        const stack = [root];
        while (stack.length > 0) {
            const node = stack.pop();
            if (!node?.isValid) continue;

            if (node.name.includes('AssistCardConfirmIcon')) {
                node.active = false;
                node.setScale(0, 0, 1);
                (node.getComponent(UITransform) || node.addComponent(UITransform)).setContentSize(0, 0);
            }
            node.children.forEach((child) => stack.push(child));
        }
    }

    protected setupMagicMapAssistConfirmButton(parent: Node, name: string, x: number, text: string): void {
        const button = this.getOrCreateMagicMapAssistSkin(
            parent,
            name,
            HomeConfig.MAGIC_BATTLE_ASSIST_CONFIRM_BUTTON_WIDTH,
            HomeConfig.MAGIC_BATTLE_ASSIST_CONFIRM_BUTTON_HEIGHT,
            x,
            HomeConfig.MAGIC_BATTLE_ASSIST_CONFIRM_BUTTON_Y,
            HomeConfig.UI_MAGIC_BATTLE_ASSIST_CONFIRM_BUTTON_BG,
        );
        const label = this.getOrCreateMagicMapAssistLabel(
            button,
            `${name}Label`,
            text,
            HomeConfig.SHARED_CONFIRM_BUTTON_FONT_SIZE,
            0,
            HomeConfig.SHARED_CONFIRM_BUTTON_LABEL_Y,
            HomeConfig.SHARED_CONFIRM_BUTTON_LABEL_WIDTH,
            HomeConfig.SHARED_CONFIRM_BUTTON_LABEL_HEIGHT,
            new Color(97, 48, 20, 255),
        );
        this.applyMagicMapAssistLabelStyle(label, new Color(255, 246, 214, 255), 1);
    }

    protected refreshMagicBattleAssistEffectLabels(): void {
        this.ensureMagicMapAssistEffectLabels();
        this.ensureMagicBattleAssistEffectLabels();

        const protectText = this.magicBattleAssistProtected
            ? '\u5f53\u524d\u5df2\u53d7\u4fdd\u62a4\uff0c\u4e0d\u4f1a\u88ab\u5176\u4ed6\u73a9\u5bb6\u51b3\u6597'
            : '\u5f53\u524d\u672a\u53d7\u4fdd\u62a4\uff0c\u53c2\u4e0e\u51b3\u6597';
        const powerStacks = Math.max(0, Math.min(MAGIC_MAP_ASSIST_POWER_BONUS_MAX_STACK, this.magicBattleAssistPowerCardStacks));
        const remainingPowerStacks = Math.max(0, MAGIC_MAP_ASSIST_POWER_BONUS_MAX_STACK - powerStacks);
        const powerText = this.magicBattleAssistPowerBonusPercent > 0
            ? `\u5f53\u524d\u6218\u529b\u52a0\u6210\uff1a${this.magicBattleAssistPowerBonusPercent}%\uff08\u5269\u4f59\u53e0\u52a0\u6b21\u6570\uff1a${remainingPowerStacks}\u6b21\uff09`
            : '\u5f53\u524d\u6218\u529b\u52a0\u6210\uff1a0';
        const protectColor = this.magicBattleAssistProtected
            ? new Color(74, 255, 92, 255)
            : new Color(255, 226, 170, 255);
        const powerColor = this.magicBattleAssistPowerBonusPercent > 0
            ? new Color(74, 255, 92, 255)
            : new Color(255, 226, 170, 255);

        [this.magicMapAssistProtectStatusLabel, this.magicBattleAssistProtectStatusLabel].forEach((label) => {
            if (!label?.isValid) return;
            label.node.active = true;
            label.string = protectText;
            label.color = protectColor;
            this.applyMagicMapAssistLabelStyle(label, new Color(20, 18, 14, 255), 2);
        });
        [this.magicMapAssistPowerStatusLabel, this.magicBattleAssistPowerStatusLabel].forEach((label) => {
            if (!label?.isValid) return;
            label.node.active = true;
            label.string = powerText;
            label.color = powerColor;
            this.applyMagicMapAssistLabelStyle(label, new Color(20, 18, 14, 255), 2);
        });
    }

    protected ensureMagicMapAssistEffectLabels(): void {
        if (!this.magicMapPanel?.isValid) return;
        const parent = this.findNode('MagicMapHud', this.magicMapPanel) || this.magicMapPanel;
        this.magicMapAssistProtectStatusLabel = this.getOrCreateMagicMapAssistLabel(
            parent,
            'MagicMapAssistProtectStatus',
            '',
            22,
            0,
            606,
            620,
            34,
            new Color(255, 226, 170, 255),
        );
        this.magicMapAssistPowerStatusLabel = this.getOrCreateMagicMapAssistLabel(
            parent,
            'MagicMapAssistPowerStatus',
            '',
            22,
            0,
            574,
            720,
            40,
            new Color(255, 226, 170, 255),
        );
        this.magicMapAssistProtectStatusLabel.node.setSiblingIndex((parent.children.length || 1) - 1);
        this.magicMapAssistPowerStatusLabel.node.setSiblingIndex((parent.children.length || 1) - 1);
    }

    protected ensureMagicBattleAssistEffectLabels(): void {
        if (!this.magicMonsterBattlePanel?.isValid) return;
        this.magicBattleAssistProtectStatusLabel = this.getOrCreateMagicMapAssistLabel(
            this.magicMonsterBattlePanel,
            'MagicBattleAssistProtectStatus',
            '',
            22,
            0,
            650,
            620,
            34,
            new Color(255, 226, 170, 255),
        );
        this.magicBattleAssistPowerStatusLabel = this.getOrCreateMagicMapAssistLabel(
            this.magicMonsterBattlePanel,
            'MagicBattleAssistPowerStatus',
            '',
            22,
            0,
            618,
            720,
            40,
            new Color(255, 226, 170, 255),
        );
        this.magicBattleAssistProtectStatusLabel.node.setSiblingIndex((this.magicMonsterBattlePanel.children.length || 1) - 1);
        this.magicBattleAssistPowerStatusLabel.node.setSiblingIndex((this.magicMonsterBattlePanel.children.length || 1) - 1);
    }

    protected getOrCreateMagicMapAssistSkin(
        parent: Node,
        name: string,
        width: number,
        height: number,
        x: number,
        y: number,
        skinPath: string,
    ): Node {
        let node = parent.getChildByName(name);
        if (!node) {
            node = this.createNode(name, parent, width, height, x, y);
        } else {
            node.active = true;
            const transform = node.getComponent(UITransform) || node.addComponent(UITransform);
            if (transform.contentSize.width <= 0 || transform.contentSize.height <= 0) {
                transform.setContentSize(width, height);
            }
        }
        this.applyUiSkinKeepingEditorSize(node, skinPath, width, height);
        return node;
    }

    protected getOrCreateMagicMapAssistNode(
        parent: Node,
        name: string,
        width: number,
        height: number,
        x: number,
        y: number,
    ): Node {
        let node = parent.getChildByName(name);
        if (!node) {
            node = this.createNode(name, parent, width, height, x, y);
        } else {
            node.active = true;
            node.setPosition(x, y, 0);
            const transform = node.getComponent(UITransform) || node.addComponent(UITransform);
            transform.setContentSize(width, height);
        }
        return node;
    }

    protected getOrCreateMagicMapAssistLabel(
        parent: Node,
        name: string,
        text: string,
        fontSize: number,
        x: number,
        y: number,
        width: number,
        height: number,
        color: Color,
    ): Label {
        let node = parent.getChildByName(name);
        if (!node) {
            return this.createLabel(parent, name, text, fontSize, x, y, width, height, color);
        }

        node.active = true;
        const transform = node.getComponent(UITransform) || node.addComponent(UITransform);
        if (transform.contentSize.width <= 0 || transform.contentSize.height <= 0) {
            transform.setContentSize(width, height);
        }
        const label = node.getComponent(Label) || node.addComponent(Label);
        applySimKaiFont(label);
        label.string = text;
        label.fontSize = fontSize;
        label.lineHeight = fontSize + 8;
        label.color = color;
        label.horizontalAlign = HorizontalTextAlignment.CENTER;
        label.verticalAlign = VerticalTextAlignment.CENTER;
        label.overflow = Overflow.SHRINK;
        return label;
    }

    protected applyMagicMapAssistLabelStyle(label: Label, outlineColor: Color, outlineWidth: number): void {
        label.overflow = Overflow.SHRINK;
        label.enableOutline = outlineWidth > 0;
        label.outlineColor = outlineColor;
        label.outlineWidth = outlineWidth;
        const labelWithShadow = label as Label & { enableShadow?: boolean; shadowBlur?: number };
        labelWithShadow.enableShadow = false;
        labelWithShadow.shadowBlur = 0;
    }

    protected cleanupMagicMapAssistSlotLabels(slot: Node, activeLabel: Label): void {
        const labels = slot.getComponentsInChildren(Label);
        labels.forEach((label) => {
            if (label === activeLabel) return;

            const nodeName = label.node.name;
            const isAssistText = nodeName.includes('UseLabel')
                || nodeName.includes('CardName')
                || label.string === '\u7acb\u5373\u4f7f\u7528';
            if (isAssistText) label.node.active = false;
        });
    }

    protected confirmMagicMapAssistCardUse(cardId: MagicMapAssistCardId): void {
        this.ensureShopStore();
        const config = MAGIC_MAP_ASSIST_CARDS.find((item) => item.id === cardId);
        if (!config || !this.shopStore) return;

        const count = this.shopStore.inventory[cardId] || 0;
        if (count <= 0) {
            this.showToast(`${config.name}\u4e0d\u8db3`);
            this.closeMagicMapAssistCardConfirmPopup();
            return;
        }

        if (cardId === 'power_card' && this.magicBattleAssistPowerCardStacks >= MAGIC_MAP_ASSIST_POWER_BONUS_MAX_STACK) {
            this.showToast('\u6218\u529b\u5361\u53e0\u52a0\u6b21\u6570\u5df2\u6ee1');
            this.closeMagicMapAssistCardConfirmPopup();
            return;
        }

        this.shopStore.inventory[cardId] = count - 1;
        this.setRoleInventoryCount(
            cardId === 'protect_card'
                ? HomeConfig.MAGIC_BATTLE_ASSIST_PROTECT_BAG_ITEM_ID
                : HomeConfig.MAGIC_BATTLE_ASSIST_POWER_BAG_ITEM_ID,
            this.shopStore.inventory[cardId] || 0,
        );
        this.saveShopStore();
        this.refreshRoleInventoryViews(false);
        this.refreshShopPanel();
        if (cardId === 'protect_card') {
            this.magicBattleAssistProtected = true;
        } else {
            this.magicBattleAssistPowerCardStacks += 1;
            this.magicBattleAssistPowerBonusPercent = this.magicBattleAssistPowerCardStacks * MAGIC_MAP_ASSIST_POWER_BONUS_PERCENT_PER_CARD;
        }
        this.refreshMagicBattleAssistEffectLabels();
        this.closeMagicMapAssistCardConfirmPopup();
        this.showToast(`${config.name}\u5df2\u4f7f\u7528`);
    }

    protected closeMagicMapAssistCardConfirmPopup(): void {
        const popups = [
            this.findNode(MAGIC_MAP_ASSIST_POPUP_NAME, this.magicMapPanel || undefined),
            this.findNode('MagicBattleAssistCardConfirmPopup', this.magicMonsterBattlePanel || undefined),
        ];
        popups.forEach((popup) => {
            if (popup?.isValid) {
                this.hideMagicMapAssistConfirmIcons(popup);
                popup.active = false;
            }
        });
    }

    protected closeMagicBattleAssistCardConfirmPopup(): void {
        this.closeMagicMapAssistCardConfirmPopup();
    }
}
