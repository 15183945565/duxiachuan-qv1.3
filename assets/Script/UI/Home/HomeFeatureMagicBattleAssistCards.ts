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
    protected setupMagicMapAssistCards(): void {
        const root = this.ensureMagicMapAssistCardRoot();
        if (!root?.isValid) return;

        root.active = true;
        root.setSiblingIndex((root.parent?.children.length || 1) - 1);
        MAGIC_MAP_ASSIST_CARDS.forEach((config) => this.setupMagicMapAssistCardSlot(root, config));
        this.ensureMagicMapAssistCardConfirmPopup();
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
            root.setPosition(
                HomeConfig.MAGIC_BATTLE_ASSIST_CARD_ROOT_X,
                HomeConfig.MAGIC_BATTLE_ASSIST_CARD_ROOT_Y,
                0,
            );
            (root.getComponent(UITransform) || root.addComponent(UITransform)).setContentSize(
                HomeConfig.MAGIC_BATTLE_ASSIST_CARD_SLOT_WIDTH,
                rootHeight,
            );
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
            slot.setPosition(0, config.y, 0);
            (slot.getComponent(UITransform) || slot.addComponent(UITransform)).setContentSize(
                HomeConfig.MAGIC_BATTLE_ASSIST_CARD_SLOT_WIDTH,
                HomeConfig.MAGIC_BATTLE_ASSIST_CARD_SLOT_HEIGHT,
            );
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
        this.applyMagicMapAssistLabelStyle(useLabel, new Color(54, 26, 10, 255), 2);

        this.bindScaledClick(slot, () => this.handleMagicMapAssistCardClick(config.id));
    }

    protected handleMagicMapAssistCardClick(cardId: MagicMapAssistCardId): void {
        this.ensureShopStore();
        const config = MAGIC_MAP_ASSIST_CARDS.find((item) => item.id === cardId);
        if (!config || !this.shopStore) return;

        const count = this.shopStore.inventory[cardId] || 0;
        if (count <= 0) {
            this.showToast(`${config.name}\u4e0d\u8db3`);
            return;
        }
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
        if (currentLabel) currentLabel.string = `\u5f53\u524d\u62e5\u6709\uff1a${count}`;

        const icon = this.findNode('MagicMapAssistCardConfirmIcon', popup);
        if (icon) {
            this.applyUiSkinKeepingEditorSize(
                icon,
                config.iconPath,
                HomeConfig.MAGIC_BATTLE_ASSIST_CONFIRM_ICON_SIZE,
                HomeConfig.MAGIC_BATTLE_ASSIST_CONFIRM_ICON_SIZE,
            );
        }

        const questionLabel = this.findNode('MagicMapAssistCardConfirmQuestionLabel', popup)?.getComponent(Label);
        if (questionLabel) questionLabel.string = `\u662f\u5426\u6d88\u8017\u4e00\u5f20${config.name}`;

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

        this.getOrCreateMagicMapAssistSkin(
            board,
            'MagicMapAssistCardConfirmTitleSkin',
            HomeConfig.MAGIC_BATTLE_ASSIST_CONFIRM_TITLE_WIDTH,
            HomeConfig.MAGIC_BATTLE_ASSIST_CONFIRM_TITLE_HEIGHT,
            0,
            HomeConfig.MAGIC_BATTLE_ASSIST_CONFIRM_TITLE_Y,
            HomeConfig.UI_MAGIC_BATTLE_ASSIST_CONFIRM_TITLE_BG,
        );
        const title = this.getOrCreateMagicMapAssistLabel(
            board,
            'MagicMapAssistCardConfirmTitle',
            '\u4f7f\u7528\u9053\u5177',
            30,
            0,
            HomeConfig.MAGIC_BATTLE_ASSIST_CONFIRM_TITLE_Y + 4,
            220,
            44,
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
        this.applyMagicMapAssistLabelStyle(current, new Color(255, 245, 220, 255), 1);

        this.getOrCreateMagicMapAssistSkin(
            board,
            'MagicMapAssistCardConfirmIcon',
            HomeConfig.MAGIC_BATTLE_ASSIST_CONFIRM_ICON_SIZE,
            HomeConfig.MAGIC_BATTLE_ASSIST_CONFIRM_ICON_SIZE,
            126,
            76,
            HomeConfig.UI_SHOP_PROTECT_CARD,
        );

        const question = this.getOrCreateMagicMapAssistLabel(
            board,
            'MagicMapAssistCardConfirmQuestionLabel',
            '\u662f\u5426\u6d88\u8017\u4e00\u5f20\u4fdd\u62a4\u5361',
            28,
            0,
            6,
            420,
            48,
            new Color(82, 45, 24, 255),
        );
        this.applyMagicMapAssistLabelStyle(question, new Color(255, 247, 224, 255), 1);

        this.setupMagicMapAssistConfirmButton(board, 'MagicMapAssistCardConfirmCancelButton', -HomeConfig.MAGIC_BATTLE_ASSIST_CONFIRM_BUTTON_X, '\u53d6\u6d88');
        this.setupMagicMapAssistConfirmButton(board, 'MagicMapAssistCardConfirmOkButton', HomeConfig.MAGIC_BATTLE_ASSIST_CONFIRM_BUTTON_X, '\u786e\u5b9a');

        return popup;
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
            27,
            0,
            2,
            HomeConfig.MAGIC_BATTLE_ASSIST_CONFIRM_BUTTON_WIDTH - 18,
            HomeConfig.MAGIC_BATTLE_ASSIST_CONFIRM_BUTTON_HEIGHT - 12,
            new Color(97, 48, 20, 255),
        );
        this.applyMagicMapAssistLabelStyle(label, new Color(255, 246, 214, 255), 1);
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
            node.setPosition(x, y, 0);
            (node.getComponent(UITransform) || node.addComponent(UITransform)).setContentSize(width, height);
        }
        this.applyUiSkinKeepingEditorSize(node, skinPath, width, height);
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
        node.setPosition(x, y, 0);
        (node.getComponent(UITransform) || node.addComponent(UITransform)).setContentSize(width, height);
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

        this.shopStore.inventory[cardId] = count - 1;
        this.saveShopStore();
        this.closeMagicMapAssistCardConfirmPopup();
        this.showToast(`${config.name}\u5df2\u4f7f\u7528`);
    }

    protected closeMagicMapAssistCardConfirmPopup(): void {
        const popup = this.findNode(MAGIC_MAP_ASSIST_POPUP_NAME, this.magicMapPanel || undefined);
        if (popup?.isValid) {
            popup.active = false;
        }
    }

    protected closeMagicBattleAssistCardConfirmPopup(): void {
        this.closeMagicMapAssistCardConfirmPopup();
    }
}
