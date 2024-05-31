import { Application } from 'pixi.js'

import { GameState, GameStateValues } from './components/GameState'
import { Burger } from './components/level/Burger'
import { Player } from './components/player/Player'
import { Signal } from './core/Signal'
import { DEBUG_KEYS, FRAME_RATE } from './game.config'
import LevelScene from './scenes/LevelScene'
import SceneManager from './scenes/SceneManager'
import { TestScene } from './scenes/TestScene'

export class GameController {
  public onLevelComplete = new Signal<GameStateValues>()
  public onGameOver = new Signal<GameStateValues>()

  public readonly app: Application = new Application()
  private sceneManager!: SceneManager

  constructor() {}

  // get only after init()
  public get canvas(): HTMLCanvasElement {
    return this.app.canvas
  }

  public async init() {
    await this.app.init({
      width: 240,
      height: 240
    })
    //
    document.querySelector('#app')!.append(this.app.canvas)
    this.app.canvas.style.imageRendering = 'pixelated'

    // setup scene manager
    this.sceneManager = new SceneManager(this, FRAME_RATE)
    this.sceneManager.root.addComponent(new GameState())
  }

  public async preload() {
    await this.sceneManager.preload()
  }

  public async start() {
    const { sceneManager } = this
    const urlParams = new URLSearchParams(window.location.search)

    const sceneFromUrl = urlParams.get('scene')
    switch (sceneFromUrl) {
      case 'test': {
        sceneManager.goto(new TestScene(sceneManager))
        break
      }
      case 'game': {
        const levelNo = urlParams.get('level')
        await sceneManager.showLevel(levelNo ? parseInt(levelNo, 10) : 1)
        break
      }
      default: {
        sceneManager.intro()
        break
      }
    }

    // debug key to go back to intro scene
    window.addEventListener('keydown', ({ key }) => {
      if (DEBUG_KEYS) {
        if (key === 'Escape') {
          if (confirm('Exit game?')) {
            sceneManager.intro()
          }
        } else if (key.toLowerCase() === 'e') {
          if (confirm('Next level?')) {
            sceneManager.levelComplete(sceneManager.root.getComponent(GameState).getValues())
          }
        } else if (key.toLowerCase() === 'o') {
          sceneManager.currentScene?.getComponent(LevelScene).burgers.forEach((burger) => {
            const b = burger.getComponent(Burger)
            if (!b.isCompleted) b.state.value = 'fall'
          })
        }
        // debug keys
        if (key.toLowerCase() === 'p') {
          sceneManager.root.timescale = sceneManager.root.timescale <= 0 ? 1 : 0
        } else if (key == '[') {
          sceneManager.root.timescale = Math.max(0, sceneManager.root.timescale * 0.75)
        } else if (key == ']') {
          sceneManager.root.timescale *= 1.5
        } else if (key == '1') {
          sceneManager.root.getComponent(GameState).lives.value += 1
        } else if (key == '2') {
          sceneManager.root.getComponent(GameState).bullets.value += 1
        } else if (key == '3') {
          Player.GOD_MODE = !Player.GOD_MODE
        } else if (key == 'k') {
          //open canvas as image in new window
          this.app.canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob!)
            window.open(url, '_blank')
          })
        }
      }
    })
  }

  public async showLevel(levelNo: number) {
    return this.sceneManager.showLevel(levelNo)
  }
}
