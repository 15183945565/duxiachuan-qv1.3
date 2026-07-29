import { AuthService } from './AuthService';

export interface RepairResult {
    message: string;
}

export class RepairService {
    public static async repair(): Promise<RepairResult> {
        AuthService.clearSession();
        await RepairService.delay(80);

        return {
            message: '登录状态已清除，请重新登录',
        };
    }

    private static delay(ms: number): Promise<void> {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }
}
