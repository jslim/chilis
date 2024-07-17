import type { GameStateValues } from '@/game/components/GameState'
import type { GameController } from '@/game/GameController'
import type { Scene } from './Scene'
import type { Application } from 'pixi.js'

import { GAME_WIDTH } from '@/game/game.config'
import { LevelIntroScene } from '@/game/scenes/LevelIntroScene'
import { LevelVsScene } from '@/game/scenes/LevelVsScene'
import { clamp01 } from '@/game/utils/math.utils'

import { CoolDown } from '../core/CoolDown'
import { Entity } from '../core/Entity'
import { EndScene } from './EndScene'
import { IntroScene } from './IntroScene'
import LevelScene from './LevelScene'
import { PreloadScene } from './PreloadScene'

export default class SceneManager {
  public app: Application
  public root: Entity = new Entity()
  public currentScene: Entity | null = null
  public isPlaying: boolean = true

  constructor(
    public gameController: GameController,
    public frameRate: number = 60
  ) {
    this.app = this.gameController.app
    this.app.stage.addChild(this.root)
    this.run()
  }

  async showLevel(levelNo: number) {
    this.gameController.setPixelated(true)
    const level = new LevelScene(this)
    this.goto(level)
    await level.init(levelNo, level.gameState.score.value)
  }

  async preload() {
    this.gameController.setPixelated(true)
    const preloader = new PreloadScene(this)
    this.goto(preloader)
    await preloader.preload()
  }

  showLevelIntro(levelNo: number) {
    if (levelNo <= 7) {
      this.gameController.setPixelated(false)
      this.goto(new LevelIntroScene(this, levelNo))
    } else {
      this.showLevelVsScene(levelNo)
    }
  }

  showLevelVsScene(levelNo: number) {
    this.gameController.setPixelated(true)
    this.goto(new LevelVsScene(this, levelNo))
  }

  intro() {
    this.goto(new IntroScene(this))
  }

  levelComplete(result: GameStateValues) {
    this.gameController.onLevelComplete.emit(result)
    const nextLevelNo = result.level + 1
    this.showLevelIntro(nextLevelNo)
  }

  gameOver(result: GameStateValues) {
    this.gameController.onGameOver.emit(result)
    this.goto(new EndScene(this))
  }

  goto<T extends Scene>(scene: T) {
    this.currentScene?.destroy()
    this.currentScene = new Entity().addComponent(scene)
    this.root.addEntity(this.currentScene)
    this.root.scale.set(this.app.renderer.width / GAME_WIDTH)
  }

  public run() {
    const updateCooldown: CoolDown = new CoolDown(1 / this.frameRate)
    this.app.ticker.add((ticker) => {
      updateCooldown.interval = 1 / this.frameRate
      if (this.isPlaying) {
        const dt = clamp01((ticker.deltaMS / 1000) * this.root.timescale)
        if (updateCooldown.update(dt)) {
          this.root.onUpdate(1 / this.frameRate)
          const remaining = updateCooldown.time - updateCooldown.interval
          updateCooldown.reset(remaining)
        }
      }
    })
  }

  public pause() {
    this.isPlaying = false
  }

  public resume() {
    this.isPlaying = true
  }

  public destroy() {
    this.pause()
    this.root.destroy()
  }
}
