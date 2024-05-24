import { Application } from 'pixi.js'
import SceneManager from './scenes/SceneManager'
import { DEBUG_KEYS, FRAME_RATE } from './game.config'
import { GameState } from './components/GameState'
import { TestScene } from './scenes/TestScene'
import LevelScene from './scenes/LevelScene'
import { Burger } from './components/level/Burger'
import { Player } from './components/player/Player'
import { Signal } from './core/Signal'

export class GameController {
  onLevelComplete: Signal = new Signal()
  onPlayerDied: Signal = new Signal()

  app: Application = new Application()
  sceneManager!: SceneManager

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
    document.getElementById('app')!.appendChild(this.app.canvas)
    this.app.canvas.style.imageRendering = 'pixelated'

    // setup scene manager
    this.sceneManager = new SceneManager(this.app, FRAME_RATE)
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
        sceneManager.splash()
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
            sceneManager.levelComplete()
          }
        } else if (key.toLowerCase() === 'o') {
          sceneManager.currentScene?.getComponent(LevelScene).burgers.forEach((burger) => {
            let b = burger.getComponent(Burger)
            if (!b.isCompleted) b.state.value = 'fall'
          })
        }
        // debug keys
        if (key.toLowerCase() === 'p') {
          sceneManager.root.timescale = sceneManager.root.timescale <= 0 ? 1 : 0
        } else if (key == '[') {
          sceneManager.root.timescale = Math.max(0.0, sceneManager.root.timescale * 0.75)
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
