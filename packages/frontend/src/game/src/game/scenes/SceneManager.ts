import { Application } from "pixi.js";
import LevelScene from "./LevelScene.ts";
import { Scene } from "./Scene.ts";
import { Entity } from "../core/Entity.ts";
import { CoolDown } from "../utils/CoolDown.ts";
import { IntroScene } from "./IntroScene.ts";
import { EndScene } from "./EndScene.ts";
import { LevelCompleteScene } from "./LevelCompleteScene.ts";
import { PreloadScene } from "./PreloadScene.ts";
import { SplashScene } from "./SplashScene.ts";

export default class SceneManager {
  public root: Entity = new Entity();
  public currentScene: Entity | null = null;
  public isPlaying: boolean = true;

  constructor(
    public app: Application,
    public frameRate: number = 60,
  ) {
    this.app.stage.addChild(this.root);
    this.run();
  }

  async showLevel(levelNo: number) {
    let level = new LevelScene(this);
    this.goto(level);
    await level.init(levelNo);
  }

  async preload() {
    const preloader = new PreloadScene(this);
    this.goto(preloader);
    await preloader.preload();
  }

  intro() {
    this.goto(new IntroScene(this));
  }

  levelComplete() {
    this.goto(new LevelCompleteScene(this));
  }

  end() {
    this.goto(new EndScene(this));
  }

  splash() {
    this.goto(new SplashScene(this));
  }

  goto<T extends Scene>(scene: T) {
    this.currentScene?.destroy();
    this.currentScene = new Entity().addComponent(scene);
    this.root.addEntity(this.currentScene);
  }

  public run() {
    const updateCooldown: CoolDown = new CoolDown(1 / this.frameRate);
    this.app.ticker.add((ticker) => {
      if (this.isPlaying) {
        const dt = (ticker.deltaMS / 1000) * this.root.timescale;
        if (updateCooldown.update(dt)) {
          this.root.onUpdate(1 / this.frameRate);
          const remaining = updateCooldown.time - updateCooldown.interval;
          updateCooldown.reset(remaining);
        }
      }
    });
  }

  public pause() {
    this.isPlaying = false;
  }

  public resume() {
    this.isPlaying = true;
  }
}
