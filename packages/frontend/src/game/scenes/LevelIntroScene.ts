import type SceneManager from '@/game/scenes/SceneManager'

import { OnActionButtonPressed } from '@/game/components/input/OnActionButtonPressed'
import { Entity } from '@/game/core/Entity'
import { GAME_HEIGHT, GAME_WIDTH } from '@/game/game.config'

import { Scene } from './Scene'

export class LevelIntroScene extends Scene {
  constructor(
    sceneManager: SceneManager,
    private readonly levelNo: number
  ) {
    super(sceneManager)
  }

  override onStart() {
    super.onStart()

    this.entity.addEntity(new Entity().addComponent(new OnActionButtonPressed(() => this.gotoNext())))

    this.sceneManager.gameController.onShowGameBorder.emit(false)
    ;(async () => {
      await this.playVideo(`cutscene_level_0${this.levelNo}`, () => this.gotoNext())
      if (this.levelNo !== 7) {
        this.addButton('SKIP', [GAME_WIDTH - 23, GAME_HEIGHT - 10], () => this.gotoNext())
      }
    })()
  }

  gotoNext() {
    this.sceneManager.showLevelVsScene(this.levelNo)
  }
}
