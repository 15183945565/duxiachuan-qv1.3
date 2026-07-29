import type { IGameBackend } from './IGameBackend';
import { LocalPreviewBackend } from './LocalPreviewBackend';

export class GameBackend {
    private static currentBackend: IGameBackend = new LocalPreviewBackend();

    static get api(): IGameBackend {
        return this.currentBackend;
    }

    static configure(backend: IGameBackend): void {
        this.currentBackend = backend;
    }
}
