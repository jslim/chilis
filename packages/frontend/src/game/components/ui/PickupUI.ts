/* eslint-disable unicorn/filename-case */
import type LevelScene from '@/game/scenes/LevelScene'
import type { Sprite } from 'pixi.js'

import { createDelay } from '@/game/core/Delay'
import { Component, Entity } from '@/game/core/Entity'
import { FlumpAnimator } from '@/game/flump/FlumpAnimator'
import { FRAME_RATE, GAME_HEIGHT, GAME_WIDTH } from '@/game/game.config'

export class PickupUI extends Component {
  constructor(private readonly level: LevelScene) {
    super()
  }

  override onStart() {
    super.onStart()

    this.entity.position.set(GAME_WIDTH - 12, GAME_HEIGHT - 8)

    const { flumpLibrary, gameState } = this.level
    const { pickupsCollected } = gameState

    const normalSprites: Sprite[] = []

    for (let i = 0; i < 3; i++) {
      const isVisible = i < pickupsCollected.value
      const normalSprite = flumpLibrary.createSprite(`pickup_${i + 1}`)
      const tintedSprite = flumpLibrary.createSprite(`pickup_${i + 1}`)
      tintedSprite.tint = 0x000000

      const pickup = new Entity()
      pickup.y = -i * 16
      pickup.addChild(tintedSprite, normalSprite)
      this.entity.addEntity(pickup)

      normalSprites.push(normalSprite)
      normalSprite.visible = isVisible
    }

    this.subscribe(pickupsCollected.onChanged, (totalCollected) => {
      const normalSprite = normalSprites[(totalCollected - 1) % 3]
      this.blink(normalSprite, 3, 6 / FRAME_RATE)

      if ((totalCollected - 1) % 3 === 2) {
        // show pickup animation
        const pickupAnimation = new FlumpAnimator(flumpLibrary)
        pickupAnimation.setMovie('pickup_complete').gotoAndPlay(0).once()
        const pickupAnimationEntity = new Entity().addComponent(pickupAnimation)
        pickupAnimationEntity.y = -16
        this.entity.addEntity(pickupAnimationEntity)
      }
    })
  }

  blink(b: Sprite, times: number = 1, interval: number = 0.1) {
    for (let i = 0; i < times; i++) {
      createDelay(this.entity, (i + 0.1) * interval, () => (b.visible = false))
      createDelay(this.entity, (i + 0.5) * interval, () => (b.visible = true))
    }
  }
}
