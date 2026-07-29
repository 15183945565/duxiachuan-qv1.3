import { sys } from 'cc';

export interface PhoneLoginResult {
    phone: string;
    userId: string;
    token: string;
    isNewUser: boolean;
}

const USER_KEY_PREFIX = 'duxiachuan_phone_user_';
const TOKEN_KEY = 'duxiachuan_auth_token';
const CURRENT_PHONE_KEY = 'duxiachuan_current_phone';
const DEV_ACCOUNT_PHONE = '15183945565';
const DEV_ACCOUNT_USER_ID = 'dev_account_15183945565';

export class AuthService {
    static async loginOrRegisterByPhone(phone: string, code = ''): Promise<PhoneLoginResult> {
        const normalizedPhone = phone.trim();
        const normalizedCode = code.trim();
        this.assertPhone(normalizedPhone);
        this.assertCode(normalizedCode);
        if (normalizedPhone !== DEV_ACCOUNT_PHONE) {
            throw new Error('当前测试版本只允许账号 15183945565 登录');
        }

        // 本地预览逻辑。接入后端后在这里调用真实登录接口并保存服务端 token。
        await this.delay(200);
        const userKey = `${USER_KEY_PREFIX}${normalizedPhone}`;
        let userId = sys.localStorage.getItem(userKey);
        const isNewUser = !userId;
        if (!userId) {
            userId = DEV_ACCOUNT_USER_ID;
            sys.localStorage.setItem(userKey, userId);
        }

        const token = `local_token_${DEV_ACCOUNT_USER_ID}_${Date.now()}`;
        sys.localStorage.setItem(TOKEN_KEY, token);
        sys.localStorage.setItem(CURRENT_PHONE_KEY, normalizedPhone);
        return { phone: normalizedPhone, userId, token, isNewUser };
    }

    static getToken(): string {
        return sys.localStorage.getItem(TOKEN_KEY) || '';
    }

    static getLastPhone(): string {
        return sys.localStorage.getItem(CURRENT_PHONE_KEY) || '';
    }

    static hasCachedLogin(): boolean {
        return this.getLastPhone() === DEV_ACCOUNT_PHONE && this.getToken().trim().length > 0;
    }

    static clearSession(): void {
        sys.localStorage.removeItem(TOKEN_KEY);
        sys.localStorage.removeItem(CURRENT_PHONE_KEY);
    }

    private static assertPhone(phone: string): void {
        if (!/^1\d{10}$/.test(phone)) throw new Error('请输入正确的 11 位手机号');
    }

    private static assertCode(code: string): void {
        if (code.length > 0 && !/^\d{4,6}$/.test(code)) throw new Error('请输入正确的验证码');
    }

    private static delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
