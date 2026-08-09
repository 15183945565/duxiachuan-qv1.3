import {
    Color,
    EventTouch,
    Graphics,
    HorizontalTextAlignment,
    Label,
    Mask,
    Node,
    Overflow,
    UITransform,
    UIOpacity,
    VerticalTextAlignment,
    instantiate,
} from 'cc';
import {
    BAG_ILLUSTRATION_CATALOG,
    type BagIllustrationCatalogItem,
    type BagIllustrationCategory,
} from './BagIllustrationCatalog.generated';
import * as HomeConfig from './HomeConfig';
import type { MailData, MailReward } from './HomeTypes';
import { HomeViewBase } from './HomeViewBase';

abstract class HomeFeatureMailDetailHost extends HomeViewBase {
    protected abstract setLabelOutline(label: Label, color: Color, width: number): void;
}

/**
 * Owns mail detail presentation, reward claiming, deletion, and unread state.
 */
export abstract class HomeFeatureMailDetail extends HomeFeatureMailDetailHost {
    protected openMailDetail(mailId: string): void {
        const mail = this.mailData.find((item) => item.id === mailId);
        if (!mail || !this.mailPanel) return;
    
        this.markMailViewed(mail);
        if (mail.source === 'battle-host') {
            this.openBattleHostMailDetail(mail);
            return;
        }
    
        this.closeMailDetail();
        this.mailDetailPanel = this.createNode('MailDetailPanel', this.mailPanel, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT, 0, 0);
        this.mailDetailPanel.setSiblingIndex((this.mailDetailPanel.parent?.children.length || 1) - 1);
        this.mailDetailPanel.on(Node.EventType.TOUCH_END, (event: EventTouch) => {
            event.propagationStopped = true;
        }, this);
        this.drawRect(this.mailDetailPanel, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT, new Color(0, 0, 0, 96));
    
        const board = this.createNode('MailDetailBoard', this.mailDetailPanel, 486, 540, 0, 16);
        this.createSkinnedNode('MailDetailBoardSkin', board, 486, 540, 0, 0, HomeConfig.UI_FRAME_MAIL_DETAIL).setSiblingIndex(0);
        this.createLabel(board, 'MailDetailTitle', mail.title, 30, 0, 212, 380, 52, new Color(75, 50, 33, 255));
        this.createMailButton(board, 'MailDetailClose', '', 220, 228, 60, 60, new Color(110, 72, 52, 0), () => this.closeMailDetail(), HomeConfig.UI_MAIL_BTN_CLOSE);
    
        const sender = this.createLabel(board, 'MailDetailSender', `发件人：${mail.senderName}`, 21, -8, 158, 388, 34, new Color(95, 70, 50, 255));
        sender.horizontalAlign = HorizontalTextAlignment.LEFT;
        const time = this.createLabel(board, 'MailDetailTime', `时间：${this.formatMailTime(mail.createTime)}`, 21, -8, 124, 388, 34, new Color(95, 70, 50, 255));
        time.horizontalAlign = HorizontalTextAlignment.LEFT;
    
        const content = this.createLabel(board, 'MailDetailContent', mail.content, 22, -8, 12, 388, 176, new Color(72, 54, 38, 255));
        content.horizontalAlign = HorizontalTextAlignment.LEFT;
        content.verticalAlign = VerticalTextAlignment.TOP;
        content.enableWrapText = true;
    
        const slot = this.createSkinnedNode('MailDetailAttachSlot', board, 120, 120, -150, -144, HomeConfig.UI_MAIL_ATTACH_SLOT);
        this.createSkinnedNode('MailDetailAttachIcon', slot, 90, 69, 0, 8, HomeConfig.UI_MAIL_ATTACH_ICON).setSiblingIndex(1);
        const rewardLine = this.createLabel(board, 'MailDetailRewards', `奖励：${this.formatRewardList(mail)}`, 21, 58, -144, 260, 72, new Color(96, 67, 42, 255));
        rewardLine.horizontalAlign = HorizontalTextAlignment.LEFT;
        rewardLine.enableWrapText = true;
    
        const canClaim = mail.rewards.length > 0 && mail.state !== 2;
        const canDelete = mail.state === 2 || mail.rewards.length <= 0;
        const deleteButton = this.createMailButton(board, 'MailDetailDelete', '删除', -116, -232, HomeConfig.MAIL_BUTTON_WIDTH, HomeConfig.MAIL_BUTTON_HEIGHT, new Color(204, 238, 232, 0), () => this.deleteMail(mail.id), HomeConfig.UI_MAIL_BUTTON_BG);
        const claimButton = this.createMailButton(board, 'MailDetailClaim', '领取', 116, -232, HomeConfig.MAIL_BUTTON_WIDTH, HomeConfig.MAIL_BUTTON_HEIGHT, new Color(204, 238, 232, 0), () => this.claimMailReward(mail.id), HomeConfig.UI_MAIL_BUTTON_BG);
        claimButton.active = canClaim;
        deleteButton.active = canDelete;
    }
    protected markMailViewed(mail: MailData): void {
        if (mail.state !== 0) return;

        mail.state = 1;
        this.saveMails();
        this.refreshMailPanel();
        this.updateMailBadge();
    }
    protected openBattleHostMailDetail(mail: MailData): void {
        if (!this.mailPanel) return;
    
        this.closeMailDetail();
        const editorTemplate = this.mailPanel.getChildByName('BattleHostMailDetailTemplate');
        const preserveEditorLayout = !!editorTemplate?.isValid;
        this.mailDetailPanel = editorTemplate || this.createNode('MailDetailPanel', this.mailPanel, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT, 0, 0);
        this.mailDetailPanel.active = true;
        const panelTransform = this.mailDetailPanel.getComponent(UITransform) || this.mailDetailPanel.addComponent(UITransform);
        if (!preserveEditorLayout || panelTransform.contentSize.width <= 0 || panelTransform.contentSize.height <= 0) {
            this.mailDetailPanel.setPosition(0, 0, 0);
            panelTransform.setContentSize(HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT);
        }
        this.mailDetailPanel.setSiblingIndex((this.mailDetailPanel.parent?.children.length || 1) - 1);
        this.ensureInputBlocker(this.mailDetailPanel, panelTransform.contentSize.width, panelTransform.contentSize.height);
        this.mailDetailPanel.off(Node.EventType.TOUCH_END);
        this.mailDetailPanel.on(Node.EventType.TOUCH_END, (event: EventTouch) => {
            event.propagationStopped = true;
        }, this);

        const dim = this.getOrCreateMailDetailChild(
            this.mailDetailPanel,
            'BattleHostMailDetailDim',
            HomeConfig.VIEW_WIDTH,
            HomeConfig.VIEW_HEIGHT,
            0,
            0,
            preserveEditorLayout,
        );
        this.paintMailDetailDim(dim.node, new Color(0, 0, 0, 110));
        dim.node.setSiblingIndex(0);
    
        const boardResult = this.getOrCreateMailDetailChild(
            this.mailDetailPanel,
            'BattleHostMailDetailBoard',
            HomeConfig.BATTLE_TARGET_CHALLENGE_POPUP_WIDTH,
            HomeConfig.BATTLE_TARGET_CHALLENGE_POPUP_HEIGHT,
            0,
            0,
            preserveEditorLayout,
        );
        const board = boardResult.node;
        board.active = true;
        board.off(Node.EventType.TOUCH_START);
        board.off(Node.EventType.TOUCH_END);
        board.on(Node.EventType.TOUCH_START, (event: EventTouch) => {
            event.propagationStopped = true;
        }, this);
        board.on(Node.EventType.TOUCH_END, (event: EventTouch) => {
            event.propagationStopped = true;
        }, this);
        board.setSiblingIndex(1);
        const boardSkin = this.getOrCreateMailDetailChild(
            board,
            'BattleHostMailDetailBoardSkin',
            HomeConfig.BATTLE_TARGET_CHALLENGE_POPUP_WIDTH,
            HomeConfig.BATTLE_TARGET_CHALLENGE_POPUP_HEIGHT,
            0,
            0,
            preserveEditorLayout && boardResult.existed,
        ).node;
        this.applyUiSkinKeepingEditorSize(boardSkin, HomeConfig.UI_CONFIRM_POPUP_BG, HomeConfig.BATTLE_TARGET_CHALLENGE_POPUP_WIDTH, HomeConfig.BATTLE_TARGET_CHALLENGE_POPUP_HEIGHT);
        boardSkin.setSiblingIndex(0);
        const titleSkin = this.getOrCreateMailDetailChild(
            board,
            'BattleHostMailDetailTitleSkin',
            HomeConfig.BATTLE_TARGET_CHALLENGE_TITLE_WIDTH,
            HomeConfig.BATTLE_TARGET_CHALLENGE_TITLE_HEIGHT,
            0,
            HomeConfig.BATTLE_TARGET_CHALLENGE_TITLE_Y,
            preserveEditorLayout && boardResult.existed,
        ).node;
        this.applyUiSkinKeepingEditorSize(titleSkin, HomeConfig.UI_CONFIRM_TITLE_BG, HomeConfig.BATTLE_TARGET_CHALLENGE_TITLE_WIDTH, HomeConfig.BATTLE_TARGET_CHALLENGE_TITLE_HEIGHT);
        titleSkin.setSiblingIndex(1);
    
        const titleResult = this.getOrCreateMailDetailChild(
            board,
            'BattleHostMailDetailTitle',
            360,
            52,
            0,
            HomeConfig.BATTLE_TARGET_CHALLENGE_TITLE_Y + 3,
            preserveEditorLayout && boardResult.existed,
        );
        const titleNode = titleResult.node;
        const title = titleNode.getComponent(Label) || titleNode.addComponent(Label);
        const titleSize = titleNode.getComponent(UITransform)?.contentSize;
        title.string = mail.title || '\u6218\u573a\u4ea7\u51fa\u6750\u6599';
        if (!preserveEditorLayout || !titleResult.existed) {
            title.fontSize = 30;
            title.lineHeight = 38;
            title.color = new Color(126, 74, 36, 255);
            title.horizontalAlign = HorizontalTextAlignment.CENTER;
            title.verticalAlign = VerticalTextAlignment.CENTER;
            title.overflow = Overflow.SHRINK;
            this.setLabelOutline(title, new Color(255, 245, 215, 255), 2);
        }
        if (preserveEditorLayout && titleSize && titleSize.width > 0 && titleSize.height > 0) {
            titleNode.getComponent(UITransform)?.setContentSize(titleSize.width, titleSize.height);
        }
        title.node.setSiblingIndex(2);
    
        this.createMailRewardGrid(board, mail);
        const claimed = mail.state === 2;
        this.createMailDetailActionButton(board, 'BattleHostMailCancelButton', '\u53d6\u6d88', -HomeConfig.BATTLE_TARGET_CHALLENGE_BUTTON_X, () => this.closeMailDetail());
        const claimButton = this.createMailDetailActionButton(board, 'BattleHostMailClaimButton', claimed ? '\u5df2\u9886\u53d6' : '\u786e\u8ba4\u9886\u53d6', HomeConfig.BATTLE_TARGET_CHALLENGE_BUTTON_X, () => {
            if (claimed) {
                this.showToast('\u5956\u52b1\u5df2\u9886\u53d6');
                return;
            }
            this.closeMailDetail();
            this.claimMailReward(mail.id, false);
        });
        this.setMailDetailButtonDimmed(claimButton, claimed);
    }
    protected getOrCreateMailDetailChild(
        parent: Node,
        name: string,
        width: number,
        height: number,
        x: number,
        y: number,
        preserveEditorLayout = true,
    ): { node: Node; existed: boolean } {
        const existing = parent.getChildByName(name);
        const node = existing || this.createNode(name, parent, width, height, x, y);
        const transform = node.getComponent(UITransform) || node.addComponent(UITransform);
        if (!existing || !preserveEditorLayout) {
            node.setPosition(x, y, 0);
            transform.setContentSize(width, height);
        } else if (transform.contentSize.width <= 0 || transform.contentSize.height <= 0) {
            transform.setContentSize(width, height);
        }
        node.active = true;
        return { node, existed: !!existing };
    }
    protected paintMailDetailDim(node: Node, color: Color): void {
        const transform = node.getComponent(UITransform) || node.addComponent(UITransform);
        const width = transform.contentSize.width || HomeConfig.VIEW_WIDTH;
        const height = transform.contentSize.height || HomeConfig.VIEW_HEIGHT;
        const graphics = node.getComponent(Graphics) || node.addComponent(Graphics);
        graphics.clear();
        graphics.fillColor = color;
        graphics.rect(-width / 2, -height / 2, width, height);
        graphics.fill();
        node.off(Node.EventType.TOUCH_END);
        node.on(Node.EventType.TOUCH_END, (event: EventTouch) => {
            event.propagationStopped = true;
        }, this);
    }
    protected createMailRewardGrid(parent: Node, mail: MailData): void {
        const viewport = this.getOrCreateMailDetailChild(parent, 'BattleHostMailRewardViewport', 610, 210, 0, 12, true).node;
        viewport.setSiblingIndex(3);
        const viewportTransform = viewport.getComponent(UITransform) || viewport.addComponent(UITransform);
        const viewportWidth = viewportTransform.contentSize.width || 610;
        const viewportHeight = viewportTransform.contentSize.height || 210;
        const mask = viewport.getComponent(Mask) || viewport.addComponent(Mask);
        mask.type = Mask.Type.GRAPHICS_RECT;

        const contentResult = this.getOrCreateMailDetailChild(viewport, 'BattleHostMailRewardContent', viewportWidth, viewportHeight, 0, 0, true);
        const content = contentResult.node;
        if (!contentResult.existed) {
            content.setPosition(0, 0, 0);
        }
        content.setSiblingIndex(0);
        const generatedPrefix = 'BattleHostMailRewardGenerated_';
        content.children
            .filter((child) => child.name.startsWith(generatedPrefix) || child.name === 'BattleHostMailRewardEmpty')
            .forEach((child) => {
                child.active = false;
                child.destroy();
            });
        content.children
            .filter((child) => /^BattleHostMailRewardSlot_\d+$/.test(child.name))
            .forEach((child) => {
                child.active = false;
            });

        const rewards = mail.rewards
            .map((reward) => ({ reward, item: this.resolveMailRewardItem(reward) }))
            .filter((entry): entry is { reward: MailReward; item: BagIllustrationCatalogItem } => !!entry.item);
        if (rewards.length <= 0) {
            const empty = this.createLabel(content, 'BattleHostMailRewardEmpty', '\u6682\u65e0\u9644\u4ef6', 28, 0, 0, 320, 60, new Color(107, 75, 46, 255));
            this.setLabelOutline(empty, new Color(255, 246, 220, 255), 1);
            return;
        }
    
        const columns = HomeConfig.BATTLE_REWARD_GRID_COLUMNS;
        const rowCount = Math.max(1, Math.ceil(rewards.length / columns));
        const contentHeight = rowCount <= 2
            ? viewportHeight
            : Math.max(viewportHeight, rowCount * HomeConfig.BATTLE_REWARD_GRID_ROW_GAP + 86);
        (content.getComponent(UITransform) || content.addComponent(UITransform)).setContentSize(viewportWidth, contentHeight);
        const templateSlot = content.getChildByName('BattleHostMailRewardSlot_1');
        const startY = rowCount <= 2
            ? HomeConfig.BATTLE_REWARD_GRID_ROW_GAP / 2
            : contentHeight / 2 - HomeConfig.BATTLE_REWARD_SLOT_SIZE / 2;
        rewards.forEach((entry, index) => {
            const row = Math.floor(index / columns);
            const rowStart = row * columns;
            const rowItemCount = Math.min(columns, rewards.length - rowStart);
            const column = index - rowStart;
            const x = (column - (rowItemCount - 1) / 2) * HomeConfig.BATTLE_REWARD_GRID_COLUMN_GAP;
            const y = startY - row * HomeConfig.BATTLE_REWARD_GRID_ROW_GAP;
            const editorSlot = content.getChildByName(`BattleHostMailRewardSlot_${index + 1}`);
            if (editorSlot) {
                this.syncMailRewardSlot(editorSlot, entry.item, entry.reward.count, index);
                return;
            }
            if (templateSlot) {
                const clone = instantiate(templateSlot);
                clone.name = `${generatedPrefix}${index + 1}`;
                clone.setParent(content);
                clone.setPosition(x, y, 0);
                this.syncMailRewardSlot(clone, entry.item, entry.reward.count, index);
                return;
            }
            this.createBattleRewardItem(content, index, entry.item, entry.reward.count, x, y);
        });
        const maxScrollY = Math.max(0, contentHeight - viewportHeight);
        this.bindBagGridScroll(viewport, content, maxScrollY);
        this.bindBagGridScroll(content, content, maxScrollY);
    }
    protected syncMailRewardSlot(slot: Node, item: BagIllustrationCatalogItem, amount: string, index: number): void {
        slot.active = true;
        slot.setSiblingIndex(index + 1);
        const frame = slot.getChildByName('BattleHostMailRewardItemFrame')
            || this.createSkinnedNode('BattleHostMailRewardItemFrame', slot, HomeConfig.BATTLE_REWARD_FRAME_SIZE, HomeConfig.BATTLE_REWARD_FRAME_SIZE, 0, 0, item.framePath);
        frame.active = true;
        this.applyUiSkinKeepingEditorSize(frame, item.framePath, HomeConfig.BATTLE_REWARD_FRAME_SIZE, HomeConfig.BATTLE_REWARD_FRAME_SIZE);
        frame.setSiblingIndex(0);

        const icon = slot.getChildByName('BattleHostMailRewardItemIcon')
            || this.createSkinnedNode('BattleHostMailRewardItemIcon', slot, HomeConfig.BATTLE_REWARD_ICON_SIZE, HomeConfig.BATTLE_REWARD_ICON_SIZE, 0, 3, item.iconPath);
        icon.active = true;
        this.applyUiSkinKeepingEditorSize(icon, item.iconPath, HomeConfig.BATTLE_REWARD_ICON_SIZE, HomeConfig.BATTLE_REWARD_ICON_SIZE);
        icon.setSiblingIndex(1);

        let count = slot.getChildByName('BattleHostMailRewardItemCount')?.getComponent(Label) || null;
        const countExisted = !!count;
        if (!count) {
            count = this.createLabel(slot, 'BattleHostMailRewardItemCount', amount, 20, 25, -30, 56, 28, Color.WHITE);
        }
        const countSize = count.node.getComponent(UITransform)?.contentSize;
        count.string = amount;
        if (!countExisted) {
            count.fontSize = 20;
            count.lineHeight = 28;
            count.color = Color.WHITE;
            count.horizontalAlign = HorizontalTextAlignment.RIGHT;
            this.setLabelOutline(count, new Color(25, 20, 14, 255), 2);
        }
        if (countSize && countSize.width > 0 && countSize.height > 0) {
            count.node.getComponent(UITransform)?.setContentSize(countSize.width, countSize.height);
        }
        count.node.active = true;
        count.node.setSiblingIndex(2);
        this.bindGridItemTap(slot, () => {
            this.openBagIllustrationItemDetailPopup(item, HomeConfig.MARKET_CATEGORY_TITLES[item.category] || '\u6750\u6599');
        });
    }
    protected resolveMailRewardItem(reward: MailReward): BagIllustrationCatalogItem | null {
        const catalogItem = BAG_ILLUSTRATION_CATALOG.find((item) => item.id === reward.itemId)
            || BAG_ILLUSTRATION_CATALOG.find((item) => item.name === reward.name);
        if (catalogItem) return catalogItem;
        if (!reward.iconPath) return null;
    
        return {
            id: reward.itemId || `mail_reward_${reward.name}`,
            category: 'material' as BagIllustrationCategory,
            name: reward.name,
            iconPath: reward.iconPath,
            framePath: reward.framePath || HomeConfig.UI_BAG_ITEM_FRAME_LV1,
        };
    }
    protected createMailDetailActionButton(parent: Node, name: string, text: string, x: number, onClick: () => void): Node {
        const existing = parent.getChildByName(name);
        const button = existing || this.createSkinnedNode(
            name,
            parent,
            HomeConfig.BATTLE_TARGET_CHALLENGE_BUTTON_WIDTH,
            HomeConfig.BATTLE_TARGET_CHALLENGE_BUTTON_HEIGHT,
            x,
            HomeConfig.BATTLE_TARGET_CHALLENGE_BUTTON_Y,
            HomeConfig.UI_MAIL_BUTTON_BG,
        );
        button.active = true;
        if (!existing) {
            button.setPosition(x, HomeConfig.BATTLE_TARGET_CHALLENGE_BUTTON_Y, 0);
        }
        this.applyUiSkinKeepingEditorSize(button, HomeConfig.UI_MAIL_BUTTON_BG, HomeConfig.BATTLE_TARGET_CHALLENGE_BUTTON_WIDTH, HomeConfig.BATTLE_TARGET_CHALLENGE_BUTTON_HEIGHT);
        let label = button.getChildByName(`${name}Label`)?.getComponent(Label) || null;
        const labelExisted = !!label;
        if (!label) {
            label = this.createLabel(
                button,
                `${name}Label`,
                text,
                text.length > 2 ? 26 : 31,
                0,
                1,
                HomeConfig.BATTLE_TARGET_CHALLENGE_BUTTON_WIDTH - 24,
                42,
                new Color(255, 238, 218, 255),
            );
        }
        const labelSize = label.node.getComponent(UITransform)?.contentSize;
        label.string = text;
        label.fontSize = text.length > 2 ? 26 : 31;
        label.lineHeight = label.fontSize + 8;
        if (!labelExisted) {
            label.color = new Color(255, 238, 218, 255);
            label.horizontalAlign = HorizontalTextAlignment.CENTER;
            label.verticalAlign = VerticalTextAlignment.CENTER;
            this.setLabelOutline(label, new Color(94, 36, 35, 255), 2);
        }
        if (labelSize && labelSize.width > 0 && labelSize.height > 0) {
            label.node.getComponent(UITransform)?.setContentSize(labelSize.width, labelSize.height);
        }
        label.node.setSiblingIndex(1);
        this.bindScaledClick(button, () => onClick());
        button.setSiblingIndex(parent.children.length - 1);
        return button;
    }
    protected setMailDetailButtonDimmed(button: Node, dimmed: boolean): void {
        const opacity = button.getComponent(UIOpacity) || button.addComponent(UIOpacity);
        opacity.opacity = dimmed ? 150 : 255;
    }
    protected closeMailDetail(): void {
        if (!this.mailDetailPanel) return;
    
        const panel = this.mailDetailPanel;
        panel.active = false;
        if (panel.name !== 'BattleHostMailDetailTemplate') {
            panel.destroy();
        }
        this.mailDetailPanel = null;
    }
    protected getMailRewardPopupItems(mail: MailData): Array<{ item: BagIllustrationCatalogItem; amount: string }> {
        return mail.rewards
            .map((reward) => {
                const item = this.resolveMailRewardItem(reward);
                return item ? { item, amount: reward.count } : null;
            })
            .filter((entry): entry is { item: BagIllustrationCatalogItem; amount: string } => !!entry);
    }
    protected claimMailReward(mailId: string, reopenDetail = true): void {
        const mail = this.mailData.find((item) => item.id === mailId);
        if (!mail || mail.rewards.length <= 0 || mail.state === 2) {
            this.showToast('\u6682\u65e0\u53ef\u9886\u53d6\u9644\u4ef6');
            return;
        }
    
        const rewardPopupItems = this.getMailRewardPopupItems(mail);
        this.applyMailRewardsToInventory(mail);
        mail.state = 2;
        this.saveMails();
        this.refreshMailPanel();
        this.updateMailBadge();
        if (reopenDetail) {
            this.openMailDetail(mail.id);
        }
        if (rewardPopupItems.length > 0) {
            this.openBattleRewardPopup(rewardPopupItems, 'popupOnly');
        } else {
            this.showToast('\u90ae\u4ef6\u5956\u52b1\u5df2\u9886\u53d6');
        }
    }
    protected applyMailRewardsToInventory(mail: MailData): void {
        mail.rewards.forEach((reward) => {
            if (!reward.itemId) return;
            this.addRoleInventory(reward.itemId, this.parseMailRewardCount(reward.count));
        });
        this.refreshRoleInventoryViews(false);
    }
    protected parseMailRewardCount(count: string): number {
        const value = Number.parseInt(`${count}`.replace(/[^\d-]/g, ''), 10);
        return Number.isFinite(value) ? Math.max(0, value) : 0;
    }
    protected claimAllMailRewards(): void {
        let count = 0;
        this.mailData.forEach((mail) => {
            if (mail.rewards.length > 0 && mail.state !== 2) {
                this.applyMailRewardsToInventory(mail);
                mail.state = 2;
                count++;
            }
        });
    
        if (count <= 0) {
            this.showToast('\u6682\u65e0\u53ef\u9886\u53d6\u9644\u4ef6');
            return;
        }
    
        this.saveMails();
        this.refreshMailPanel();
        this.updateMailBadge();
        this.showToast('\u5df2\u9886\u53d6\u5168\u90e8\u53ef\u9886\u53d6\u9644\u4ef6');
    }
    protected deleteMail(mailId: string): void {
        const before = this.mailData.length;
        this.mailData = this.mailData.filter((mail) => mail.id !== mailId);
        if (this.mailData.length === before) return;
    
        this.saveMails();
        this.closeMailDetail();
        this.refreshMailPanel();
        this.updateMailBadge();
        this.showToast('\u90ae\u4ef6\u5df2\u5220\u9664');
    }
    protected deleteReadMails(): void {
        const before = this.mailData.length;
        this.mailData = this.mailData.filter((mail) => mail.state !== 2);
        if (this.mailData.length === before) {
            this.showToast('\u6682\u65e0\u5df2\u9886\u53d6\u90ae\u4ef6\u53ef\u5220\u9664');
            return;
        }
        this.saveMails();
        this.closeMailDetail();
        this.refreshMailPanel();
        this.updateMailBadge();
        this.showToast('\u5df2\u5220\u9664\u5df2\u9886\u53d6\u90ae\u4ef6');
    }
    protected updateMailBadge(): void {
        this.ensureMailData();
        const mailButton = this.findNode('BtnMail');
        if (!mailButton) return;
    
        let badge = mailButton.getChildByName('MailBadge');
        if (!badge) {
            badge = this.createSkinnedNode(
                'MailBadge',
                mailButton,
                HomeConfig.GLOBAL_UNREAD_DOT_WIDTH,
                HomeConfig.GLOBAL_UNREAD_DOT_HEIGHT,
                38,
                38,
                HomeConfig.UI_GLOBAL_UNREAD_DOT,
            );
        } else {
            badge.setPosition(38, 38, 0);
            (badge.getComponent(UITransform) || badge.addComponent(UITransform)).setContentSize(
                HomeConfig.GLOBAL_UNREAD_DOT_WIDTH,
                HomeConfig.GLOBAL_UNREAD_DOT_HEIGHT,
            );
            const graphics = badge.getComponent(Graphics);
            if (graphics) graphics.clear();
            this.applyUiSkin(badge, HomeConfig.UI_GLOBAL_UNREAD_DOT, HomeConfig.GLOBAL_UNREAD_DOT_WIDTH, HomeConfig.GLOBAL_UNREAD_DOT_HEIGHT);
        }

        badge.active = this.mailData.some((mail) => mail.state === 0);
    }
    protected createMailButton(parent: Node, name: string, text: string, x: number, y: number, width: number, height: number, color: Color, onClick: () => void, skinPath?: string): Node {
        const button = this.createNode(name, parent, width, height, x, y);
        this.drawRect(button, width, height, color);
        if (skinPath) {
            const skin = this.createNode(`${name}Skin`, button, width, height, 0, 0);
            this.applyUiSkin(skin, skinPath, width, height);
            skin.setSiblingIndex(0);
        }
        if (text.length > 0) {
            const labelColor = skinPath && skinPath.startsWith(HomeConfig.MAIL_UI_ROOT) ? new Color(255, 242, 202, 255) : Color.WHITE;
            const label = this.createLabel(button, `${name}Label`, text, 24, 0, 0, width - 18, height - 8, labelColor);
            if (skinPath && skinPath.startsWith(HomeConfig.MAIL_UI_ROOT)) {
                label.enableOutline = true;
                label.outlineColor = new Color(95, 48, 30, 255);
                label.outlineWidth = 2;
            }
        }
        this.bindScaledClick(button, () => {
            onClick();
        });
        return button;
    }
    protected clearChildren(node: Node): void {
        [...node.children].forEach((child) => {
            child.active = false;
            child.destroy();
        });
    }
    protected getMailStateText(mail: MailData): string {
        if (mail.state === 2) return '\u5df2\u9886';
        return '\u672a\u9886\u53d6';
    }
    protected formatMailTime(seconds: number): string {
        const date = new Date(seconds * 1000);
        const pad = (value: number): string => value < 10 ? `0${value}` : `${value}`;
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
    }
    protected formatMailShortTime(seconds: number): string {
        const diff = Math.max(0, Math.floor(Date.now() / 1000) - seconds);
        const hours = Math.floor(diff / 3600);
        if (hours < 1) return '刚刚';
        if (hours < 24) return `${hours}小时前`;
        return `${Math.floor(hours / 24)}天前`;
    }
    protected getMailPreview(content: string): string {
        const normalized = content.replace(/\s+/g, ' ').trim();
        return normalized.length > 18 ? `${normalized.slice(0, 18)}...` : normalized;
    }
    protected formatMailRemainTime(createTime: number): string {
        const expireTime = createTime + 30 * 24 * 3600;
        const remainSeconds = Math.max(0, expireTime - Math.floor(Date.now() / 1000));
        const days = Math.ceil(remainSeconds / (24 * 3600));
        return `${days}\u5929`;
    }
    protected formatRewardList(mail: MailData): string {
        if (mail.rewards.length <= 0) return '\u65e0\u9644\u4ef6';
    
        return mail.rewards.map((reward) => `${reward.name} ${reward.count}`).join('  ');
    }
}
