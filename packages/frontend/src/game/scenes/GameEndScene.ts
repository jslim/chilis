import { Assets, Sprite } from 'pixi.js'

import { createDelay } from '@/game/core/Delay'
import { Entity } from '@/game/core/Entity'

import { OnActionButtonPressed } from '../components/input/OnActionButtonPressed'
import { Scene } from './Scene'

export class GameEndScene extends Scene {
  override onStart() {
    const sprite = new Sprite(Assets.get('screen_end'))
    this.entity.addChild(sprite)
    sprite.interactive = true
    sprite.cursor = 'pointer'

    let hasEmitted = false
    const emitGameEnd = () => {
      if (!hasEmitted) {
        this.sceneManager.gameController.onGameEnd.emit(this.gameState.getValues())
        hasEmitted = true
      }
    }

    this.entity.addEntity(new Entity().addComponent(new OnActionButtonPressed(() => emitGameEnd())))
    sprite.on('pointerup', () => emitGameEnd())
    createDelay(this.entity, 7, () => emitGameEnd())
  }
}
