import { Scene } from './Scene';
import { Assets, Graphics } from 'pixi.js';
import { assetsManifest } from '../assets.manifest';

export class PreloadScene extends Scene {
  private graphics = new Graphics();

  override onStart() {
    super.onStart();
    this.entity.addChild(this.graphics);
  }

  async preload() {
    // init assets manager

    // @ts-ignore (there are two ways to init, seems there are no typings for that)
    await Assets.init({ manifest: assetsManifest });

    // setup level bundles
    for (let level = 1; level <= 6; level++) {
      Assets.addBundle(`level${level}`, {
        [`level${level}/jsonMap`]: `game/level${level}.json`,
        [`level${level}/tileset`]: `game/tileset.png`,
        [`level${level}/tileset_large`]: `game/tileset-large.png`,
      });
    }

    // preload
    await Assets.loadBundle(['game', 'splash'], (p) => this.drawProgress(p));

    // wait a bit
    await new Promise((resolve) => setTimeout(resolve, 130));
  }

  drawProgress(progress: number) {
    const { width: sceneWidth } = this.sceneManager.app.renderer;
    this.graphics
      .clear()
      .moveTo(0, sceneWidth / 2)
      .lineTo(Math.floor(sceneWidth * progress), sceneWidth / 2)
      .stroke({
        color: 0xffc507,
        width: 1,
      });
  }
}
