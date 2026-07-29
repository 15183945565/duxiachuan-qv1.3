import {
    Color,
    EventTouch,
    HorizontalTextAlignment,
    Label,
    Node,
    Overflow,
    VerticalTextAlignment,
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
    
        if (mail.state === 0) {
            mail.state = 1;
            this.saveMails();
            this.refreshMailPanel();
            this.updateMailBadge();
        }
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
        const canDelete = mail.state > 0 || mail.rewards.length <= 0;
        const deleteButton = this.createMailButton(board, 'MailDetailDelete', '删除', -116, -232, 200, 60, new Color(204, 238, 232, 0), () => this.deleteMail(mail.id), HomeConfig.UI_BTN_DELETE);
        const claimButton = this.createMailButton(board, 'MailDetailClaim', '领取', 116, -232, 200, 60, new Color(204, 238, 232, 0), () => this.claimMailReward(mail.id), HomeConfig.UI_BTN_CLAIM);
        claimButton.active = canClaim;
        deleteButton.active = canDelete;
    }
    protected openBattleHostMailDetail(mail: MailData): void {
        if (!this.mailPanel) return;
    
        this.closeMailDetail();
        this.mailDetailPanel = this.createNode('MailDetailPanel', this.mailPanel, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT, 0, 0);
        this.mailDetailPanel.setSiblingIndex((this.mailDetailPanel.parent?.children.length || 1) - 1);
        this.mailDetailPanel.on(Node.EventType.TOUCH_END, (event: EventTouch) => {
            event.propagationStopped = true;
        }, this);
        this.drawRect(this.mailDetailPanel, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT, new Color(0, 0, 0, 110));
    
        const board = this.createNode(
            'BattleHostMailDetailBoard',
            this.mailDetailPanel,
            HomeConfig.BATTLE_TARGET_CHALLENGE_POPUP_WIDTH,
            HomeConfig.BATTLE_TARGET_CHALLENGE_POPUP_HEIGHT,
            0,
            0,
        );
        board.on(Node.EventType.TOUCH_END, (event: EventTouch) => {
            event.propagationStopped = true;
        }, this);
        this.createSkinnedNode(
            'BattleHostMailDetailBoardSkin',
            board,
            HomeConfig.BATTLE_TARGET_CHALLENGE_POPUP_WIDTH,
            HomeConfig.BATTLE_TARGET_CHALLENGE_POPUP_HEIGHT,
            0,
            0,
            HomeConfig.UI_CONFIRM_POPUP_BG,
        ).setSiblingIndex(0);
        this.createSkinnedNode(
            'BattleHostMailDetailTitleSkin',
            board,
            HomeConfig.BATTLE_TARGET_CHALLENGE_TITLE_WIDTH,
            HomeConfig.BATTLE_TARGET_CHALLENGE_TITLE_HEIGHT,
            0,
            HomeConfig.BATTLE_TARGET_CHALLENGE_TITLE_Y,
            HomeConfig.UI_CONFIRM_TITLE_BG,
        ).setSiblingIndex(1);
    
        const title = this.createLabel(
            board,
            'BattleHostMailDetailTitle',
            '\u6218\u573a\u4ea7\u51fa\u6750\u6599',
            30,
            0,
            HomeConfig.BATTLE_TARGET_CHALLENGE_TITLE_Y + 3,
            360,
            52,
            new Color(126, 74, 36, 255),
        );
        title.overflow = Overflow.SHRINK;
        this.setLabelOutline(title, new Color(255, 245, 215, 255), 2);
        title.node.setSiblingIndex(2);
    
        this.createMailRewardGrid(board, mail);
        this.createMailDetailActionButton(board, 'BattleHostMailCancelButton', '\u53d6\u6d88', -HomeConfig.BATTLE_TARGET_CHALLENGE_BUTTON_X, () => this.closeMailDetail());
        this.createMailDetailActionButton(board, 'BattleHostMailClaimButton', '\u786e\u8ba4\u9886\u53d6', HomeConfig.BATTLE_TARGET_CHALLENGE_BUTTON_X, () => {
            this.closeMailDetail();
            this.claimMailReward(mail.id, false);
        });
    }
    protected createMailRewardGrid(parent: Node, mail: MailData): void {
        const root = this.createNode('BattleHostMailRewardItemsRoot', parent, 610, 210, 0, 12);
        root.setSiblingIndex(3);
        const rewards = mail.rewards
            .map((reward) => ({ reward, item: this.resolveMailRewardItem(reward) }))
            .filter((entry): entry is { reward: MailReward; item: BagIllustrationCatalogItem } => !!entry.item);
        if (rewards.length <= 0) {
            const empty = this.createLabel(root, 'BattleHostMailRewardEmpty', '\u6682\u65e0\u9644\u4ef6', 28, 0, 0, 320, 60, new Color(107, 75, 46, 255));
            this.setLabelOutline(empty, new Color(255, 246, 220, 255), 1);
            return;
        }
    
        const columns = HomeConfig.BATTLE_REWARD_GRID_COLUMNS;
        const firstRowCount = Math.min(columns, rewards.length);
        rewards.forEach((entry, index) => {
            const row = index < firstRowCount ? 0 : 1;
            const rowStart = row === 0 ? 0 : firstRowCount;
            const rowItemCount = row === 0 ? firstRowCount : rewards.length - firstRowCount;
            const column = index - rowStart;
            const x = (column - (rowItemCount - 1) / 2) * HomeConfig.BATTLE_REWARD_GRID_COLUMN_GAP;
            const y = (row === 0 ? 0.5 : -0.5) * HomeConfig.BATTLE_REWARD_GRID_ROW_GAP;
            this.createBattleRewardItem(root, index, entry.item, entry.reward.count, x, y);
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
        const button = this.createSkinnedNode(
            name,
            parent,
            HomeConfig.BATTLE_TARGET_CHALLENGE_BUTTON_WIDTH,
            HomeConfig.BATTLE_TARGET_CHALLENGE_BUTTON_HEIGHT,
            x,
            HomeConfig.BATTLE_TARGET_CHALLENGE_BUTTON_Y,
            HomeConfig.UI_BATTLE_ACTION_BUTTON_BG,
        );
        const label = this.createLabel(
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
        this.setLabelOutline(label, new Color(94, 36, 35, 255), 2);
        label.node.setSiblingIndex(1);
        this.bindScaledClick(button, () => onClick());
        button.setSiblingIndex(parent.children.length - 1);
        return button;
    }
    protected closeMailDetail(): void {
        if (!this.mailDetailPanel) return;
    
        this.mailDetailPanel.active = false;
        this.mailDetailPanel.destroy();
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
        this.mailData = this.mailData.filter((mail) => mail.state === 0);
        this.saveMails();
        this.closeMailDetail();
        this.refreshMailPanel();
        this.updateMailBadge();
        this.showToast('\u5df2\u5220\u9664\u5df2\u8bfb\u90ae\u4ef6');
    }
    protected updateMailBadge(): void {
        this.ensureMailData();
        const mailButton = this.findNode('BtnMail');
        if (!mailButton) return;
    
        let badge = mailButton.getChildByName('MailBadge');
        if (!badge) {
            badge = this.createNode('MailBadge', mailButton, 22, 22, 38, 38);
            this.drawCircle(badge, 8, new Color(228, 28, 48, 255));
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
        if (mail.state === 1) return '\u5df2\u8bfb';
        return '\u672a\u8bfb';
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
