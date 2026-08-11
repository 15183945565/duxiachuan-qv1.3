import { sys } from 'cc';
import { type BagIllustrationCatalogItem } from './BagIllustrationCatalog.generated';
import * as HomeConfig from './HomeConfig';
import { type BattleAutoHostState, type MailData } from './HomeTypes';
import { HomeViewBase } from './HomeViewBase';

abstract class HomeFeatureMailDataHost extends HomeViewBase {
    protected abstract refreshMailPanel(): void;
    protected abstract refreshMailTabs(): void;
    protected abstract updateMailBadge(): void;
}

/**
 * Owns local mail persistence and the Battle-host reward-to-mail adapter.
 */
export abstract class HomeFeatureMailData extends HomeFeatureMailDataHost {
    protected ensureMailData(): void {
        if (this.mailDataLoaded) {
            if (this.settleDueBattleAutoHostMailFromStorage()) {
                this.saveMails();
            }
            return;
        }

        const raw = sys.localStorage.getItem(HomeConfig.MAIL_STORE_KEY);
        if (raw) {
            try {
                const parsed = JSON.parse(raw) as MailData[];
                this.mailData = parsed.map((mail) => ({
                    ...mail,
                    category: mail.category === 'system' ? 'system' : 'normal',
                    state: mail.state === 2 ? 2 : mail.state === 1 ? 1 : 0,
                    source: mail.source || '',
                    rewards: Array.isArray(mail.rewards)
                        ? mail.rewards.map((reward) => ({
                            name: reward.name || '',
                            count: reward.count || '0',
                            itemId: reward.itemId || '',
                            iconPath: reward.iconPath || '',
                            framePath: reward.framePath || '',
                        }))
                        : [],
                }));
                const defaults = this.createDefaultMails();
                defaults.forEach((defaultMail) => {
                    if (!this.mailData.some((mail) => mail.id === defaultMail.id)) {
                        this.mailData.push(defaultMail);
                    }
                });
                this.mailDataLoaded = true;
                this.settleDueBattleAutoHostMailFromStorage();
                this.saveMails();
                return;
            } catch (err) {
                console.warn('[MainHomeView] invalid mail data', err);
            }
        }

        this.mailData = this.createDefaultMails();
        this.mailDataLoaded = true;
        this.settleDueBattleAutoHostMailFromStorage();
        this.saveMails();
    }

    protected createDefaultMails(): MailData[] {
        return [];
    }

    protected saveMails(): void {
        sys.localStorage.setItem(HomeConfig.MAIL_STORE_KEY, JSON.stringify(this.mailData));
    }

    protected queueBattleHostedMailRewards(rewards: MailData['rewards']): void {
        sys.localStorage.removeItem(HomeConfig.BATTLE_AUTO_HOST_MAIL_BACKUP_KEY);
        this.ensureMailData();
        const mail = this.createBattleHostedMail(rewards);
        this.mailData.unshift(mail);
        this.saveMails();
        if (this.mailPanel?.active) {
            this.mailActiveTab = 'normal';
            this.refreshMailPanel();
            this.refreshMailTabs();
        }
        this.updateMailBadge();
    }

    protected queueBattleHostedRewards(rewards: Array<{ item: BagIllustrationCatalogItem; amount: string }>): void {
        this.queueBattleHostedMailRewards(rewards.map((reward) => ({
            name: reward.item.name,
            count: reward.amount,
            itemId: reward.item.id,
            iconPath: reward.item.iconPath,
            framePath: reward.item.framePath,
        })));
    }

    protected settleDueBattleAutoHostMailFromStorage(): boolean {
        const raw = sys.localStorage.getItem(HomeConfig.BATTLE_AUTO_HOST_STATE_KEY)
            || sys.localStorage.getItem(HomeConfig.BATTLE_AUTO_HOST_MAIL_BACKUP_KEY);
        if (!raw) return false;

        let parsed: BattleAutoHostState;
        try {
            parsed = JSON.parse(raw) as BattleAutoHostState;
        } catch (error) {
            console.warn('[MainHomeView] invalid battle auto host state in mail settlement', error);
            sys.localStorage.removeItem(HomeConfig.BATTLE_AUTO_HOST_STATE_KEY);
            sys.localStorage.removeItem(HomeConfig.BATTLE_AUTO_HOST_MAIL_BACKUP_KEY);
            this.battleAutoHostState = null;
            return false;
        }

        if (!parsed || typeof parsed.finishTime !== 'number' || !Array.isArray(parsed.rewards)) {
            sys.localStorage.removeItem(HomeConfig.BATTLE_AUTO_HOST_STATE_KEY);
            sys.localStorage.removeItem(HomeConfig.BATTLE_AUTO_HOST_MAIL_BACKUP_KEY);
            this.battleAutoHostState = null;
            return false;
        }

        const now = Math.floor(Date.now() / 1000);
        if (now < parsed.finishTime) return false;

        const mailId = `battle_host_${parsed.id || parsed.finishTime}`;
        if (!this.mailData.some((mail) => mail.id === mailId)) {
            this.mailData.unshift(this.createBattleHostedMail(parsed.rewards, mailId, parsed.finishTime));
        }
        sys.localStorage.removeItem(HomeConfig.BATTLE_AUTO_HOST_STATE_KEY);
        sys.localStorage.removeItem(HomeConfig.BATTLE_AUTO_HOST_MAIL_BACKUP_KEY);
        this.battleAutoHostState = null;
        return true;
    }

    protected createBattleHostedMail(
        rewards: MailData['rewards'],
        id = `battle_host_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        createTime = Math.floor(Date.now() / 1000),
    ): MailData {
        return {
            id,
            category: 'normal',
            source: 'battle-host',
            title: '\u6218\u573a\u4ea7\u51fa\u6750\u6599',
            content: '\u6258\u7ba1\u6218\u573a\u4ea7\u51fa\u6750\u6599\u5df2\u9001\u8fbe\uff0c\u8bf7\u53ca\u65f6\u9886\u53d6\u3002',
            senderName: '\u7cfb\u7edf',
            createTime,
            state: 0,
            rewards: rewards.map((reward) => ({
                name: reward.name || '',
                count: reward.count || '0',
                itemId: reward.itemId || '',
                iconPath: reward.iconPath || '',
                framePath: reward.framePath || '',
            })),
        };
    }
}
