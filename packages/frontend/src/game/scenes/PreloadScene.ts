import { Assets, Graphics } from 'pixi.js'

import { GAME_ASSETS_BASE_URL } from '@/game/game.config'

import { assetsManifest, soundManifest } from '../assets.manifest'
import { Scene } from './Scene'

export class PreloadScene extends Scene {
  private readonly graphics = new Graphics()

  override onStart() {
    super.onStart()
    this.entity.addChild(this.graphics)
  }

  async preload() {
    // init assets manager

    await Assets.init({ manifest: assetsManifest })

    // setup level bundles
    for (let level = 1; level <= 6; level++) {
      Assets.addBundle(`level${level}`, {
        [`level${level}/jsonMap`]: `${GAME_ASSETS_BASE_URL}level${level}.json`,
        [`level${level}/tileset`]: `${GAME_ASSETS_BASE_URL}tileset.png`,
        [`level${level}/tileset_large`]: `${GAME_ASSETS_BASE_URL}tileset-large.png`
      })
    }

    this.sceneManager.gameController.channels.sampleManager.addSamples(
      Object.entries(soundManifest).map(([name, url]) => ({ name, fileName: url }))
    )

    // preload assets = 0-50%
    await Assets.loadBundle(['game'], (p) => this.drawProgress(p * 0.5))

    // preload sounds = 50-100%
    await this.sceneManager.gameController.channels.loadSounds((p) => this.drawProgress(0.5 + p * 0.5))

    this.drawProgress(1)

    // wait a bit
    await new Promise((resolve) => {
      setTimeout(resolve, 130)
    })
  }

  drawProgress(progress: number) {
    const { width: sceneWidth } = this.sceneManager.app.renderer
    this.graphics
      .clear()
      .moveTo(0, sceneWidth / 2)
      .lineTo(Math.floor(sceneWidth * progress), sceneWidth / 2)
      .stroke({
        color: 0xffc507,
        width: 1
      })
  }
}
