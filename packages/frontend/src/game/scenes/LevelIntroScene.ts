import type SceneManager from '@/game/scenes/SceneManager'

import { Assets, Sprite } from 'pixi.js'

import { PointerComponent } from '@/game/button/PointerComponent'
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
      const buttonEntity = new Entity(new Sprite(Assets.get('button_skip'))).addComponent(
        new PointerComponent('pointerdown', () => this.gotoNext())
      )
      buttonEntity.position.set(Math.floor(GAME_WIDTH / 2) - 14, GAME_HEIGHT - 13)
      this.entity.addEntity(buttonEntity)
    })()
  }

  gotoNext() {
    this.sceneManager.showLevelVsScene(this.levelNo)
  }
}
