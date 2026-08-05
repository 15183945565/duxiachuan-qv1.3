import { AudioClip, AudioSource, Button, EventTouch, Node, assetManager, sys } from 'cc';

const RES_BUNDLE_NAME = 'res';
const CLICK_AUDIO_PATH = 'Audio/UI/button_click';
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
    private static clip: AudioClip | null = null;
    private static clipPromise: Promise<AudioClip> | null = null;

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
            if (!this.isButtonTouch(root, event)) return;
            this.play(source);
        };
        root.on(Node.EventType.TOUCH_END, handler, this, true);
        this.bindings.set(root, { audioNode, source, handler });
        void this.preload();
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

    private static isButtonTouch(root: Node, event: EventTouch): boolean {
        let current = event.target instanceof Node ? event.target : null;
        while (current?.isValid) {
            if (current.getComponent(Button)) return true;
            if (BUTTON_NAME_PATTERN.test(current.name)) return true;
            if (current === root) return false;
            current = current.parent;
        }
        return false;
    }

    private static play(source: AudioSource): void {
        const volume = this.getEffectVolume();
        if (volume <= 0 || !source.isValid) return;

        if (this.clip) {
            source.playOneShot(this.clip, volume);
            return;
        }

        void this.preload()
            .then((clip) => {
                if (source.isValid) source.playOneShot(clip, volume);
            })
            .catch((err) => console.warn('[GlobalButtonClickAudio] button click audio missing', err));
    }

    private static preload(): Promise<AudioClip> {
        if (this.clip) return Promise.resolve(this.clip);
        this.clipPromise = this.clipPromise || new Promise((resolve, reject) => {
            assetManager.loadBundle(RES_BUNDLE_NAME, (bundleErr, bundle) => {
                if (bundleErr || !bundle) {
                    reject(bundleErr || new Error(`Bundle not found: ${RES_BUNDLE_NAME}`));
                    return;
                }

                bundle.load(CLICK_AUDIO_PATH, AudioClip, (clipErr, clip) => {
                    if (clipErr || !clip) {
                        reject(clipErr || new Error(`AudioClip not found: ${CLICK_AUDIO_PATH}`));
                        return;
                    }
                    this.clip = clip;
                    resolve(clip);
                });
            });
        });
        return this.clipPromise;
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
