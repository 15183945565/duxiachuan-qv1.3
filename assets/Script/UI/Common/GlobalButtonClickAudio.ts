import { AudioClip, AudioSource, Button, EventTouch, Node, assetManager, sys } from 'cc';

const RES_BUNDLE_NAME = 'res';
const DEFAULT_CLICK_AUDIO_PATH = 'Audio/UI/button_click';
const SPECIAL_CLICK_AUDIO_PATHS: Readonly<Record<string, string>> = {
    BtnAdGift: 'Audio/Gift/value_gift_button_click',
};
const AUDIO_NODE_NAME = 'GlobalButtonClickAudio';
const PROFILE_SETTINGS_STORAGE_KEY = 'duxiachuan.profile.settings.v3';
const BUTTON_NAME_PATTERN = /(^Btn|Button$|Button_|Tab|Toggle$|Back$|Close$|Confirm$|Cancel$|Claim$|Refresh$|Action$|Enter$|Prev$|Next$)/;

interface AudioSettingsPayload {
    effectVolume?: number;
    muted?: boolean;
}

interface GlobalButtonClickBinding {
    audioNode: Node;
    source: AudioSource;
    handler: (event: EventTouch) => void;
}

export class GlobalButtonClickAudio {
    private static readonly bindings = new WeakMap<Node, GlobalButtonClickBinding>();
    private static readonly clips = new Map<string, AudioClip>();
    private static readonly clipPromises = new Map<string, Promise<AudioClip>>();

    public static install(root: Node | null, audioParent?: Node | null): void {
        if (!root?.isValid || this.bindings.has(root)) return;

        const parent = audioParent?.isValid ? audioParent : root;
        const misplacedNode = root.getChildByName(AUDIO_NODE_NAME);
        if (misplacedNode?.isValid && misplacedNode.parent !== parent) {
            misplacedNode.setParent(parent);
        }

        const audioNode = parent.getChildByName(AUDIO_NODE_NAME) || new Node(AUDIO_NODE_NAME);
        if (audioNode.parent !== parent) {
            audioNode.setParent(parent);
        }
        const source = audioNode.getComponent(AudioSource) || audioNode.addComponent(AudioSource);
        source.playOnAwake = false;
        source.loop = false;

        const handler = (event: EventTouch): void => {
            const audioPath = this.resolveClickAudioPath(root, event);
            if (!audioPath) return;
            this.play(source, audioPath);
        };
        root.on(Node.EventType.TOUCH_END, handler, this, true);
        this.bindings.set(root, { audioNode, source, handler });
        void this.preload(DEFAULT_CLICK_AUDIO_PATH);
        Object.keys(SPECIAL_CLICK_AUDIO_PATHS).forEach((nodeName) => {
            void this.preload(SPECIAL_CLICK_AUDIO_PATHS[nodeName]);
        });
    }

    public static uninstall(root: Node | null): void {
        if (!root?.isValid) return;

        const binding = this.bindings.get(root);
        if (!binding) return;

        root.off(Node.EventType.TOUCH_END, binding.handler, this, true);
        if (binding.source.isValid) binding.source.stop();
        if (binding.audioNode.isValid) binding.audioNode.destroy();
        this.bindings.delete(root);
    }

    private static resolveClickAudioPath(root: Node, event: EventTouch): string | null {
        let current = event.target instanceof Node ? event.target : null;
        let isButtonTouch = false;
        let audioPath: string | undefined;
        while (current?.isValid) {
            audioPath = audioPath || SPECIAL_CLICK_AUDIO_PATHS[current.name];
            if (current.getComponent(Button) || BUTTON_NAME_PATTERN.test(current.name)) isButtonTouch = true;
            if (current === root) break;
            current = current.parent;
        }
        return isButtonTouch ? audioPath || DEFAULT_CLICK_AUDIO_PATH : null;
    }

    private static play(source: AudioSource, audioPath: string): void {
        const volume = this.getEffectVolume();
        if (volume <= 0 || !source.isValid) return;

        const clip = this.clips.get(audioPath);
        if (clip) {
            source.playOneShot(clip, volume);
            return;
        }

        void this.preload(audioPath)
            .then((clip) => {
                if (source.isValid) source.playOneShot(clip, volume);
            })
            .catch((err) => console.warn(`[GlobalButtonClickAudio] button click audio missing: ${audioPath}`, err));
    }

    private static preload(audioPath: string): Promise<AudioClip> {
        const clip = this.clips.get(audioPath);
        if (clip) return Promise.resolve(clip);

        const existing = this.clipPromises.get(audioPath);
        if (existing) return existing;

        const promise = new Promise<AudioClip>((resolve, reject) => {
            assetManager.loadBundle(RES_BUNDLE_NAME, (bundleErr, bundle) => {
                if (bundleErr || !bundle) {
                    reject(bundleErr || new Error(`Bundle not found: ${RES_BUNDLE_NAME}`));
                    return;
                }

                bundle.load(audioPath, AudioClip, (clipErr, clip) => {
                    if (clipErr || !clip) {
                        reject(clipErr || new Error(`AudioClip not found: ${audioPath}`));
                        return;
                    }
                    this.clips.set(audioPath, clip);
                    resolve(clip);
                });
            });
        });
        this.clipPromises.set(audioPath, promise);
        return promise;
    }

    private static getEffectVolume(): number {
        try {
            const raw = sys.localStorage.getItem(PROFILE_SETTINGS_STORAGE_KEY);
            if (!raw) return 1;
            const settings = JSON.parse(raw) as AudioSettingsPayload;
            if (settings.muted) return 0;
            return this.clamp01(Number(settings.effectVolume ?? 1));
        } catch {
            return 1;
        }
    }

    private static clamp01(value: number): number {
        if (!Number.isFinite(value)) return 1;
        return Math.max(0, Math.min(1, value));
    }
}
