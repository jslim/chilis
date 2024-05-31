import type { Scene } from './Scene'
import type { Application } from 'pixi.js'

import { CoolDown } from '../core/CoolDown'
import { Entity } from '../core/Entity'
import { clamp01 } from '../utils/math.utils'
import { EndScene } from './EndScene'
import { IntroScene } from './IntroScene'
import { LevelCompleteScene } from './LevelCompleteScene'
import LevelScene from './LevelScene'
import { PreloadScene } from './PreloadScene'
import { SplashScene } from './SplashScene'
import { GameController } from '@/game/src/game/GameController'
import { GameStateValues } from '@/game/src/game/components/GameState'

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
    const level = new LevelScene(this)
    this.goto(level)
    await level.init(levelNo)
  }

  async preload() {
    const preloader = new PreloadScene(this)
    this.goto(preloader)
    await preloader.preload()
  }

  intro() {
    this.goto(new IntroScene(this))
  }

  levelComplete(result: GameStateValues) {
    this.gameController.onLevelComplete.emit(result)
    this.goto(new LevelCompleteScene(this))
  }

  end(result: GameStateValues) {
    this.gameController.onGameOver.emit(result)
    this.goto(new EndScene(this))
  }

  splash() {
    this.goto(new SplashScene(this))
  }

  goto<T extends Scene>(scene: T) {
    this.currentScene?.destroy()
    this.currentScene = new Entity().addComponent(scene)
    this.root.addEntity(this.currentScene)
  }

  public run() {
    const updateCooldown: CoolDown = new CoolDown(1 / this.frameRate)
    this.app.ticker.add((ticker) => {
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
}
