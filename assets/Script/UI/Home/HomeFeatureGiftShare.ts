import {
    Color,
    Node,
    Sprite,
} from 'cc';
import { bindShareTaskPanel, claimShareTaskReward, handleShareTaskAction, refreshShareTaskPanel } from './HomeShareTaskPanel';
import { HomeViewBase } from './HomeViewBase';

/**
 * 礼包与分享入口。
 *
 * 该功能不持有独立状态：领取记录与分享进度由 HomeViewBase 统一拥有，
 * 因此只通过原型组合安装行为，不增加 Cocos 组件或运行时继承层。
 */
export abstract class HomeFeatureGiftShare extends HomeViewBase {
    protected bindGiftPage(panel: Node): void {
        for (let index = 1; index <= 4; index += 1) {
            const button = this.findNode(`GiftClaim_${index}`, panel);
            if (button) this.bindScaledClick(button, () => this.claimGift(panel, index));
        }
        const claimAll = this.findNode('GiftClaimAll', panel);
        if (claimAll) this.bindScaledClick(claimAll, () => this.claimAllGifts(panel));
        this.refreshGiftPage(panel);
    }

    protected claimGift(panel: Node, index: number): void {
        if (this.claimedGiftIndexes.has(index)) {
            this.showToast('\u8be5\u793c\u5305\u5df2\u9886\u53d6');
            return;
        }
        this.claimedGiftIndexes.add(index);
        this.refreshGiftPage(panel);
        this.openSharedFlowPopup('RewardPopup', {
            title: '\u83b7\u5f97\u793c\u5305',
            message: `\u7b2c ${index} \u4efd\u793c\u5305\u5df2\u9886\u53d6\uff0c\u5956\u52b1\u5185\u5bb9\u7b49\u5f85\u540e\u7aef\u8fd4\u56de\u3002`,
        });
    }

    protected claimAllGifts(panel: Node): void {
        if (this.claimedGiftIndexes.size >= 4) {
            this.showToast('\u6240\u6709\u793c\u5305\u5df2\u9886\u53d6');
            return;
        }
        for (let index = 1; index <= 4; index += 1) this.claimedGiftIndexes.add(index);
        this.refreshGiftPage(panel);
        this.openSharedFlowPopup('RewardPopup', {
            title: '\u4e00\u952e\u9886\u53d6',
            message: '\u6240\u6709\u53ef\u9886\u53d6\u793c\u5305\u5df2\u9886\u53d6\uff0c\u5956\u52b1\u5185\u5bb9\u7b49\u5f85\u540e\u7aef\u8fd4\u56de\u3002',
        });
    }

    protected refreshGiftPage(panel: Node): void {
        const claimedCount = this.claimedGiftIndexes.size;
        this.setFeatureLabel(panel, 'GiftSummary', `\u53ef\u9886\u53d6\u793c\u5305 ${4 - claimedCount}    \u5df2\u9886\u53d6 ${claimedCount}`);
        for (let index = 1; index <= 4; index += 1) {
            const button = this.findNode(`GiftClaim_${index}`, panel);
            if (!button) continue;
            const claimed = this.claimedGiftIndexes.has(index);
            this.setFeatureLabel(button, `GiftClaim_${index}Label`, claimed ? '\u5df2\u9886\u53d6' : '\u9886\u53d6');
            const sprite = button.getComponent(Sprite);
            if (sprite) sprite.color = claimed ? new Color(155, 155, 155, 255) : Color.WHITE;
        }
        const claimAll = this.findNode('GiftClaimAll', panel);
        if (claimAll) {
            const allClaimed = claimedCount >= 4;
            this.setFeatureLabel(claimAll, 'GiftClaimAllLabel', allClaimed ? '\u5df2\u5168\u90e8\u9886\u53d6' : '\u4e00\u952e\u9886\u53d6');
            const sprite = claimAll.getComponent(Sprite);
            if (sprite) sprite.color = allClaimed ? new Color(155, 155, 155, 255) : Color.WHITE;
        }
    }

    protected bindSharePage(panel: Node): void {
        bindShareTaskPanel(this, panel);
    }

    protected handleShareAction(panel: Node, taskId?: string): void {
        handleShareTaskAction(this, panel, taskId);
    }

    protected claimShareReward(panel: Node, taskId?: string): void {
        claimShareTaskReward(this, panel, taskId);
    }

    protected refreshSharePage(panel: Node): void {
        refreshShareTaskPanel(this, panel);
    }
}
