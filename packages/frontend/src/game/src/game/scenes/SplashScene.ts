import { Scene } from './Scene';
import { Assets, Sprite, TilingSprite } from 'pixi.js';
import { CoolDown } from '../core/CoolDown';
import { Entity } from '../core/Entity';

export class SplashScene extends Scene {
  private blinkCoolDown = new CoolDown(0.2);
  private startButton!: Entity;
  private background!: TilingSprite;
  override onStart() {
    super.onStart();

    const { width: sceneWidth } = this.sceneManager.app.renderer;

    this.entity.addChild(
      (this.background = new TilingSprite({
        texture: Assets.get('splash/background'),
        width: sceneWidth,
        height: sceneWidth,
      })),
    );
    this.entity.addChild(new Sprite(Assets.get('splash/logo')));

    let startButtonSprite = new Sprite(Assets.get('splash/start'));
    this.startButton = new Entity(startButtonSprite);
    startButtonSprite.pivot.set(
      (startButtonSprite.width / 2) | 0,
      (startButtonSprite.height / 2) | 0,
    );
    this.entity.addEntity(this.startButton);
    this.startButton.x = sceneWidth / 2;
    this.startButton.y = sceneWidth - 13;

    this.background.cursor = 'pointer';
    this.background.interactive = true;
    this.background.onpointerdown = () => this.sceneManager.intro();
  }

  override onUpdate(dt: number) {
    if (this.blinkCoolDown.update(dt)) {
      this.startButton.visible = !this.startButton.visible;
      this.blinkCoolDown.reset();
    }

    // move background texture uv to create a scrolling background in pixi
    this.background.tilePosition.x += 1;
  }
}
