import type SceneManager from '@/game/scenes/SceneManager'

import { OnActionButtonPressed } from '@/game/components/input/OnActionButtonPressed'
import { Entity } from '@/game/core/Entity'
import { SimpleButton } from '@/game/display/SimpleButton'
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
      const buttonEntity = new Entity().addComponent(new SimpleButton('button_skip', () => this.gotoNext()))
      buttonEntity.position.set(GAME_WIDTH - 29, GAME_HEIGHT - 13)
      this.entity.addEntity(buttonEntity)
    })()
  }

  gotoNext() {
    this.sceneManager.showLevelVsScene(this.levelNo)
  }
}
