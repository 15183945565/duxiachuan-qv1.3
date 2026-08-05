import { _decorator, AudioClip, AudioSource, Color, Component, EventTouch, Graphics, Label, Node, Sprite, SpriteFrame, Tween, UIOpacity, UITransform, Vec3, director, screen, tween } from 'cc';
import { ConfigManager } from '../../Managers/ConfigManager';
import { ResourceManager } from '../../Managers/ResourceManager';
import { BackendRuntime } from '../../Services/BackendRuntime';
import { DisplayAdapter } from '../../Services/DisplayAdapter';
import { PhoneLoginPanel } from '../Login/PhoneLoginPanel';
import { AuthService } from '../../Services/AuthService';
import type { PhoneLoginResult } from '../../Services/AuthService';
import { GlobalButtonClickAudio } from '../Common/GlobalButtonClickAudio';
import { applySimKaiFontToTree } from '../Common/UIFont';

const { ccclass, property } = _decorator;

const BUTTON_PRESS_SCALE = 0.94;
const BUTTON_PRESS_DURATION = 0.07;
const BUTTON_RELEASE_DURATION = 0.12;
const ENTER_GAME_ICON_PATH = 'Texture/Login/login_enter_icon';
const ENTER_GAME_BUTTON_WIDTH = 314;
const ENTER_GAME_BUTTON_HEIGHT = 94;
const ENTER_GAME_BUTTON_FALLBACK_Y = -560;
const LOGIN_MUSIC_PATH = 'Audio/Loading/loading_page_music';
const MIN_LOADING_SECONDS = 1.6;
const PROGRESS_SMOOTH_SPEED = 3.2;
const SWALLOW_LAYER_NAME = 'SwallowFlightLayer';
const SWALLOW_COLOR = new Color(22, 20, 18, 245);

interface SwallowFlightConfig {
    start: Vec3;
    mid: Vec3;
    target: Vec3;
    startScale: number;
    endScale: number;
    delay: number;
    duration: number;
}

const SWALLOW_FLIGHTS: SwallowFlightConfig[] = [
    {
        start: new Vec3(-420, 380, 0),
        mid: new Vec3(-85, 365, 0),
        target: new Vec3(165, 315, 0),
        startScale: 1.05,
        endScale: 0.24,
        delay: 0,
        duration: 8.2,
    },
    {
        start: new Vec3(-455, 320, 0),
        mid: new Vec3(-120, 345, 0),
        target: new Vec3(185, 330, 0),
        startScale: 0.82,
        endScale: 0.18,
        delay: 2.1,
        duration: 9,
    },
    {
        start: new Vec3(-440, 435, 0),
        mid: new Vec3(-70, 410, 0),
        target: new Vec3(145, 345, 0),
        startScale: 0.68,
        endScale: 0.16,
        delay: 4.2,
        duration: 8.8,
    },
];

@ccclass('BootLoadingView')
export class BootLoadingView extends Component {
    @property(Sprite)
    public progressFill: Sprite | null = null;

    @property(Label)
    public progressLabel: Label | null = null;

    @property(Node)
    public repairButton: Node | null = null;

    @property(Label)
    public repairStatusLabel: Label | null = null;

    @property(Node)
    public loginPanel: Node | null = null;

    @property
    public nextSceneName = '';

    private progress = 0;
    private loadingBarBg: Node | null = null;
    private enterGameButton: Node | null = null;
    private phoneLoginPanel: PhoneLoginPanel | null = null;
    private displayedProgress = 0;
    private bootStartedAt = 0;
    private enterGameButtonBaseScale = new Vec3(1, 1, 1);
    private swallowLayer: Node | null = null;
    private swallowNodes: Node[] = [];
    private swallowOpacityList: UIOpacity[] = [];
    private healthNoticeNode: Node | null = null;
    private agreementNoticeNode: Node | null = null;
    private loginMusicSource: AudioSource | null = null;
    private loginMusicClip: AudioClip | null = null;
    private loginMusicPromise: Promise<AudioClip> | null = null;
    private shouldPlayLoginMusic = false;
    protected onLoad(): void {
        DisplayAdapter.apply();
        BackendRuntime.initialize();
        GlobalButtonClickAudio.install(this.node);
        applySimKaiFontToTree(this.node);
        this.resolveSceneNodes();
        this.setupSwallowLayer();
        this.setupLoginMusicSource();
        this.setupLoginPanel();
        this.setupEnterGameButton();
        screen.on('window-resize', this.onWindowResize, this);
        screen.on('orientation-change', this.onOrientationChange, this);
        if (this.repairStatusLabel) this.repairStatusLabel.string = '';
        this.setLoadingControlsVisible(true);
        this.setHealthNoticeVisible(false);
        this.setEnterGameButtonVisible(false);
        this.progress = 0;
        this.displayedProgress = 0;
        this.applyProgressVisual(0);
    }

    protected start(): void {
        void this.startBoot();
    }

    protected update(dt: number): void {
        const distance = this.progress - this.displayedProgress;
        if (Math.abs(distance) <= 0.001) return;

        this.displayedProgress += distance * Math.min(1, dt * PROGRESS_SMOOTH_SPEED);
        if (Math.abs(this.progress - this.displayedProgress) <= 0.002) {
            this.displayedProgress = this.progress;
        }
        this.applyProgressVisual(this.displayedProgress);
    }

    protected onDestroy(): void {
        GlobalButtonClickAudio.uninstall(this.node);
        this.safeOff(this.enterGameButton, Node.EventType.TOUCH_START, this.onEnterGameTouchStart);
        this.safeOff(this.enterGameButton, Node.EventType.TOUCH_CANCEL, this.onEnterGameTouchCancel);
        this.safeOff(this.enterGameButton, Node.EventType.TOUCH_END, this.onEnterGameClicked);
        screen.off('window-resize', this.onWindowResize, this);
        screen.off('orientation-change', this.onOrientationChange, this);
        this.swallowNodes.forEach((node) => Tween.stopAllByTarget(node));
        this.swallowOpacityList.forEach((opacity) => Tween.stopAllByTarget(opacity));
        this.stopLoginMusic();
    }

    private async startBoot(): Promise<void> {
        try {
            this.bootStartedAt = this.getTimeSeconds();
            this.setProgress(0.05);
            const resBundle = await ResourceManager.instance.acquireBundle('res');
            this.preloadLoginMusic();
            this.setProgress(0.25);

            const configs = await ResourceManager.instance.loadConfigDir(resBundle, (progress) => {
                this.setProgress(0.25 + progress * 0.7);
            });
            ConfigManager.instance.loadFromAssets(configs);
            this.setProgress(1);
            await this.waitLoadingPresentation();
            this.displayedProgress = 1;
            this.applyProgressVisual(1);

            if (AuthService.hasCachedLogin()) {
                this.showEnterGameGate();
            } else {
                this.showLoginPanel();
            }
        } catch (err) {
            console.error('[BootLoadingView] boot failed', err);
            if (this.progressLabel) this.progressLabel.string = '加载失败，请检查资源';
        }
    }

    private resolveSceneNodes(): void {
        this.loadingBarBg = this.loadingBarBg || this.node.getChildByName('LoadingBarBg') || null;
        this.progressFill = this.progressFill || this.node.getChildByName('LoadingBarFill')?.getComponent(Sprite) || null;
        this.progressLabel = this.progressLabel || this.node.getChildByName('LabelProgress')?.getComponent(Label) || null;
        this.repairButton = this.repairButton || this.node.getChildByName('BtnRepair') || null;
        this.repairStatusLabel = this.repairStatusLabel || this.node.getChildByName('LabelRepairStatus')?.getComponent(Label) || null;
        this.loginPanel = this.loginPanel || this.node.getChildByName('PhoneLoginPanel') || null;
        this.enterGameButton = this.enterGameButton || this.node.getChildByName('BtnEnterGame') || null;
        this.swallowLayer = this.swallowLayer || this.node.getChildByName(SWALLOW_LAYER_NAME) || null;
        this.healthNoticeNode = this.healthNoticeNode || this.node.getChildByName('LabelHealthNotice') || null;
        this.agreementNoticeNode = this.agreementNoticeNode || this.node.getChildByName('AgreementNotice') || null;
    }

    private setupSwallowLayer(): void {
        this.swallowNodes.forEach((node) => Tween.stopAllByTarget(node));
        this.swallowOpacityList.forEach((opacity) => Tween.stopAllByTarget(opacity));
        this.swallowNodes = [];
        this.swallowOpacityList = [];

        if (!this.swallowLayer) return;

        this.swallowLayer.active = true;
        this.swallowLayer.children
            .filter((child) => child.name.startsWith('Swallow'))
            .forEach((child) => child.destroy());

        SWALLOW_FLIGHTS.forEach((config, index) => {
            this.createSwallow(`Swallow${index + 1}`, config);
        });
    }

    private createSwallow(name: string, config: SwallowFlightConfig): void {
        if (!this.swallowLayer) return;

        const swallow = new Node(name);
        swallow.layer = this.swallowLayer.layer;
        swallow.setParent(this.swallowLayer);

        const transform = swallow.addComponent(UITransform);
        transform.setAnchorPoint(0.5, 0.5);
        transform.setContentSize(70, 36);

        const opacity = swallow.addComponent(UIOpacity);
        const graphics = swallow.addComponent(Graphics);
        this.drawSwallow(graphics);

        this.swallowNodes.push(swallow);
        this.swallowOpacityList.push(opacity);
        this.playSwallowFlight(swallow, opacity, config);
        this.playSwallowWingPulse(swallow, config);
    }

    private drawSwallow(graphics: Graphics): void {
        graphics.clear();
        graphics.lineWidth = 4;
        graphics.strokeColor = SWALLOW_COLOR;
        graphics.fillColor = SWALLOW_COLOR;

        graphics.moveTo(0, 0);
        graphics.bezierCurveTo(-10, 13, -28, 13, -39, 2);
        graphics.stroke();

        graphics.moveTo(0, 0);
        graphics.bezierCurveTo(10, 12, 28, 10, 39, 0);
        graphics.stroke();

        graphics.circle(0, 0, 2.8);
        graphics.fill();
    }

    private playSwallowFlight(swallow: Node, opacity: UIOpacity, config: SwallowFlightConfig): void {
        swallow.setPosition(config.start);
        swallow.setScale(new Vec3(config.startScale, config.startScale, 1));
        opacity.opacity = 0;

        const firstLegDistance = Vec3.distance(config.start, config.mid);
        const secondLegDistance = Vec3.distance(config.mid, config.target);
        const totalDistance = firstLegDistance + secondLegDistance;
        const firstLegDuration = totalDistance > 0
            ? config.duration * firstLegDistance / totalDistance
            : config.duration * 0.5;
        const secondLegDuration = config.duration - firstLegDuration;

        tween(swallow)
            .delay(config.delay)
            .repeatForever(
                tween()
                    .call(() => {
                        swallow.setPosition(config.start);
                        swallow.setScale(new Vec3(config.startScale, config.startScale, 1));
                    })
                    .to(firstLegDuration, {
                        position: config.mid,
                        scale: new Vec3(config.startScale * 0.72, config.startScale * 0.72, 1),
                    }, { easing: 'linear' })
                    .to(secondLegDuration, {
                        position: config.target,
                        scale: new Vec3(config.endScale, config.endScale, 1),
                    }, { easing: 'linear' }),
            )
            .start();

        tween(opacity)
            .delay(config.delay)
            .repeatForever(
                tween<UIOpacity>()
                    .call(() => {
                        opacity.opacity = 0;
                    })
                    .to(0.45, { opacity: 245 }, { easing: 'sineOut' })
                    .delay(Math.max(0, config.duration * 0.62 - 0.45))
                    .to(config.duration * 0.38, { opacity: 0 }, { easing: 'sineIn' }),
            )
            .start();
    }

    private playSwallowWingPulse(swallow: Node, config: SwallowFlightConfig): void {
        tween(swallow)
            .delay(config.delay)
            .repeatForever(
                tween()
                    .to(0.28, { eulerAngles: new Vec3(0, 0, -3) }, { easing: 'sineOut' })
                    .to(0.28, { eulerAngles: new Vec3(0, 0, 4) }, { easing: 'sineInOut' })
                    .to(0.28, { eulerAngles: new Vec3(0, 0, 0) }, { easing: 'sineIn' }),
            )
            .start();
    }

    private setupLoginPanel(): void {
        if (!this.loginPanel) return;

        this.phoneLoginPanel = this.loginPanel.getComponent(PhoneLoginPanel) || this.loginPanel.addComponent(PhoneLoginPanel);
        this.phoneLoginPanel.setup({
            onLoginSuccess: (result) => {
                this.onLoginSuccess(result);
            },
        });
        this.loginPanel.active = false;
    }

    private setupLoginMusicSource(): void {
        this.loginMusicSource = this.node.getComponent(AudioSource) || this.node.addComponent(AudioSource);
        this.loginMusicSource.playOnAwake = false;
        this.loginMusicSource.loop = true;
        this.loginMusicSource.volume = 1;
    }

    private setupEnterGameButton(): void {
        let createdAtRuntime = false;
        if (!this.enterGameButton) {
            this.enterGameButton = new Node('BtnEnterGame');
            this.enterGameButton.setParent(this.node);
            this.enterGameButton.setPosition(new Vec3(0, ENTER_GAME_BUTTON_FALLBACK_Y, 0));
            createdAtRuntime = true;
        }

        const sprite = this.enterGameButton.getComponent(Sprite) || this.enterGameButton.addComponent(Sprite);
        sprite.enabled = false;
        sprite.type = Sprite.Type.SIMPLE;
        sprite.sizeMode = Sprite.SizeMode.CUSTOM;
        void this.loadEnterGameSpriteFrame()
            .then((spriteFrame) => {
                if (sprite.isValid) {
                    sprite.spriteFrame = spriteFrame;
                    sprite.enabled = true;
                }
            })
            .catch((err) => {
                console.warn('[BootLoadingView] enter game button texture missing', err);
            });

        if (createdAtRuntime) {
            this.enterGameButton.layer = this.node.layer;
            const transform = this.enterGameButton.addComponent(UITransform);
            transform.setAnchorPoint(0.5, 0.5);
            transform.setContentSize(ENTER_GAME_BUTTON_WIDTH, ENTER_GAME_BUTTON_HEIGHT);
        }

        this.enterGameButtonBaseScale = this.enterGameButton.scale.clone();
        this.enterGameButton.off(Node.EventType.TOUCH_START, this.onEnterGameTouchStart, this);
        this.enterGameButton.off(Node.EventType.TOUCH_CANCEL, this.onEnterGameTouchCancel, this);
        this.enterGameButton.off(Node.EventType.TOUCH_END, this.onEnterGameClicked, this);
        this.enterGameButton.on(Node.EventType.TOUCH_START, this.onEnterGameTouchStart, this);
        this.enterGameButton.on(Node.EventType.TOUCH_CANCEL, this.onEnterGameTouchCancel, this);
        this.enterGameButton.on(Node.EventType.TOUCH_END, this.onEnterGameClicked, this);
        this.setEnterGameButtonVisible(false);
    }

    private onWindowResize(): void {
        DisplayAdapter.apply();
    }

    private onOrientationChange(): void {
        DisplayAdapter.apply();
    }

    private async loadEnterGameSpriteFrame(): Promise<SpriteFrame> {
        const bundle = await ResourceManager.instance.acquireBundle('res', false);
        return new Promise((resolve, reject) => {
            bundle.load(`${ENTER_GAME_ICON_PATH}/spriteFrame`, SpriteFrame, (err, spriteFrame) => {
                if (err || !spriteFrame) {
                    reject(err || new Error(`SpriteFrame not found: ${ENTER_GAME_ICON_PATH}`));
                    return;
                }
                resolve(spriteFrame);
            });
        });
    }

    private safeOff(node: Node | null, eventType: string, callback: (...args: any[]) => any): void {
        if (!node || !node.isValid) return;

        try {
            node.off(eventType, callback, this);
        } catch (err) {
            console.warn('[BootLoadingView] skip event cleanup on destroyed node', err);
        }
    }

    private showLoginPanel(): void {
        this.setLoadingControlsVisible(false);
        this.setHealthNoticeVisible(true);
        this.setEnterGameButtonVisible(false);
        this.phoneLoginPanel?.show();
        this.playLoginMusic();
    }

    private onLoginSuccess(_result: PhoneLoginResult): void {
        this.showEnterGameGate();
    }

    private showEnterGameGate(): void {
        this.setLoadingControlsVisible(false);
        this.phoneLoginPanel?.hide();
        this.setHealthNoticeVisible(true);
        this.setEnterGameButtonVisible(true);
        this.playLoginMusic();
    }

    private onEnterGameTouchStart(event: EventTouch): void {
        event.propagationStopped = true;
        this.playEnterGameButtonScale(true);
    }

    private onEnterGameTouchCancel(event: EventTouch): void {
        event.propagationStopped = true;
        this.playEnterGameButtonScale(false);
    }

    private onEnterGameClicked(event?: EventTouch): void {
        if (event) {
            event.propagationStopped = true;
        }
        this.playEnterGameButtonScale(false);
        this.stopLoginMusic();

        if (this.nextSceneName.trim().length > 0) {
            const sceneName = this.nextSceneName.trim();
            this.scheduleOnce(() => {
                director.loadScene(sceneName);
            }, 0);
            return;
        }

        if (this.progressLabel) {
            this.progressLabel.node.active = true;
            this.progressLabel.string = '登录成功，等待主场景';
        }
    }

    private playEnterGameButtonScale(pressed: boolean): void {
        if (!this.enterGameButton) return;

        const targetScale = pressed
            ? new Vec3(
                this.enterGameButtonBaseScale.x * BUTTON_PRESS_SCALE,
                this.enterGameButtonBaseScale.y * BUTTON_PRESS_SCALE,
                this.enterGameButtonBaseScale.z,
            )
            : this.enterGameButtonBaseScale.clone();

        Tween.stopAllByTarget(this.enterGameButton);
        tween(this.enterGameButton)
            .to(pressed ? BUTTON_PRESS_DURATION : BUTTON_RELEASE_DURATION, { scale: targetScale }, { easing: 'sineOut' })
            .start();
    }

    private setLoadingControlsVisible(visible: boolean): void {
        if (this.loadingBarBg) this.loadingBarBg.active = visible;
        if (this.progressFill?.node) this.progressFill.node.active = visible;
        if (this.progressLabel?.node) this.progressLabel.node.active = visible;
    }

    private setHealthNoticeVisible(visible: boolean): void {
        if (this.healthNoticeNode) this.healthNoticeNode.active = visible;
        if (this.agreementNoticeNode) this.agreementNoticeNode.active = visible;
    }

    private setEnterGameButtonVisible(visible: boolean): void {
        if (!this.enterGameButton) return;
        this.enterGameButton.active = visible;
    }

    private setProgress(value: number): void {
        this.progress = Math.max(this.progress, Math.min(1, value));
    }

    private applyProgressVisual(value: number): void {
        const progress = Math.max(0, Math.min(1, value));
        if (this.progressFill) {
            this.progressFill.fillRange = progress;
        }
        if (this.progressLabel) {
            this.progressLabel.string = `加载中... ${Math.floor(progress * 100)}%`;
        }
    }

    private playLoginMusic(): void {
        this.shouldPlayLoginMusic = true;
        if (!this.loginMusicSource) this.setupLoginMusicSource();
        if (!this.loginMusicSource) return;

        if (this.loginMusicClip) {
            this.startLoginMusicClip(this.loginMusicClip);
            return;
        }

        this.loginMusicPromise = this.loginMusicPromise || this.loadLoginMusicClip();
        void this.loginMusicPromise
            .then((clip) => {
                this.loginMusicClip = clip;
                if (!this.shouldPlayLoginMusic || !this.loginMusicSource?.isValid) return;
                this.startLoginMusicClip(clip);
            })
            .catch((err) => {
                console.warn('[BootLoadingView] login music missing', err);
            });
    }

    private startLoginMusicClip(clip: AudioClip): void {
        if (!this.loginMusicSource?.isValid) return;

        const source = this.loginMusicSource;
        const playingState = source as AudioSource & { playing?: boolean };
        if (source.clip === clip && playingState.playing === true) {
            return;
        }

        source.clip = clip;
        source.loop = true;
        source.play();
    }

    private preloadLoginMusic(): void {
        this.loginMusicPromise = this.loginMusicPromise || this.loadLoginMusicClip();
        void this.loginMusicPromise
            .then((clip) => {
                this.loginMusicClip = clip;
            })
            .catch((err) => {
                console.warn('[BootLoadingView] login music preload failed', err);
            });
    }

    private stopLoginMusic(): void {
        this.shouldPlayLoginMusic = false;
        if (!this.loginMusicSource) return;
        this.loginMusicSource.stop();
    }

    private async loadLoginMusicClip(): Promise<AudioClip> {
        const bundle = await ResourceManager.instance.acquireBundle('res', false);
        return new Promise((resolve, reject) => {
            bundle.load(LOGIN_MUSIC_PATH, AudioClip, (err, clip) => {
                if (err || !clip) {
                    reject(err || new Error(`AudioClip not found: ${LOGIN_MUSIC_PATH}`));
                    return;
                }
                resolve(clip);
            });
        });
    }

    private waitLoadingPresentation(): Promise<void> {
        const elapsed = this.getTimeSeconds() - this.bootStartedAt;
        const delay = Math.max(0, MIN_LOADING_SECONDS - elapsed);
        return new Promise((resolve) => {
            this.scheduleOnce(resolve, delay);
        });
    }

    private getTimeSeconds(): number {
        return Date.now() / 1000;
    }
}
