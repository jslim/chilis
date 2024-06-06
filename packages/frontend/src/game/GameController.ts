import type { GameStateValues } from './components/GameState'
import type { GameAction } from './GameAction'

import { Application } from 'pixi.js'

import { GameState } from './components/GameState'
import { Burger } from './components/level/Burger'
import { Player } from './components/player/Player'
import { Signal } from './core/Signal'
import { DEBUG_KEYS, DEBUG_SCENES_FROM_URL, FRAME_RATE, GAME_HEIGHT, GAME_WIDTH } from './game.config'
import LevelScene from './scenes/LevelScene'
import SceneManager from './scenes/SceneManager'
import { Channel, Channels } from '@mediamonks/channels'

export class GameController {
  public onLevelComplete = new Signal<GameStateValues>()
  public onGameOver = new Signal<GameStateValues>()
  public onGameAction = new Signal<GameAction>()
  public onShowGameBorder = new Signal<boolean>()

  public readonly app: Application = new Application()
  private sceneManager!: SceneManager

  public soundChannel!: Channel
  public channels!: Channels

  // get only after init()
  public get canvas(): HTMLCanvasElement {
    return this.app.canvas
  }

  public async init() {
    await this.app.init({
      width: GAME_WIDTH,
      height: GAME_HEIGHT
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
    if (DEBUG_SCENES_FROM_URL) {
      const urlParams = new URLSearchParams(window.location.search)

      const sceneFromUrl = urlParams.get('scene')
      switch (sceneFromUrl) {
        case 'game': {
          const levelNo = urlParams.get('level')
          await sceneManager.showLevel(levelNo ? parseInt(levelNo, 10) : 1)
          break
        }
        case 'intro': {
          const levelNo = urlParams.get('level')
          sceneManager.showLevelIntro(levelNo ? parseInt(levelNo, 10) : 1)
          break
        }
        default: {
          sceneManager.intro()
          break
        }
      }
    } else {
      sceneManager.showLevelIntro(1)
    }
    // debug key to go back to intro scene
    if (DEBUG_KEYS)
      window.addEventListener('keydown', ({ key }) => {
        if (key.toLowerCase() === 'e') {
          // eslint-disable-next-line no-alert
          if (confirm('Next level?')) {
            sceneManager.levelComplete(this.gameState.getValues())
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
        } // eslint-disable-next-line unicorn/prefer-switch
        else if (key === '[') {
          sceneManager.root.timescale = Math.max(0, sceneManager.root.timescale * 0.75)
        } else if (key === ']') {
          sceneManager.root.timescale *= 1.5
        } else if (key === '1') {
          this.gameState.lives.value += 1
        } else if (key === '2') {
          this.gameState.bullets.value += 1
        } else if (key === '3') {
          Player.GOD_MODE = !Player.GOD_MODE
        } else if (key === 'k') {
          //open canvas as image in new window
          // eslint-disable-next-line unicorn/consistent-destructuring
          this.app.canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob!)
            window.open(url, '_blank')
          })
        }
      })
  }

  public setHighScore(value: number) {
    this.gameState.highScore.value = value
  }

  public async showLevel(levelNo: number) {
    return this.sceneManager.showLevel(levelNo)
  }

  public pause() {
    this.sceneManager.pause()
    this.onGameAction.emit({ a: 'pause', l: this.gameState.level.value })
  }

  public resume() {
    this.sceneManager.pause()
    this.onGameAction.emit({ a: 'resume', l: this.gameState.level.value })
  }

  setChannels(channels: Channels) {
    this.channels = channels
    this.soundChannel = channels.createChannel('game')
  }

  get gameState(): GameState {
    return this.sceneManager.root.getComponent(GameState)
  }
}
