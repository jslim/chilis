import type { FlumpLibrary } from '../../flump/FlumpLibrary'
import type { Sprite } from 'pixi.js'

import { Component } from '../../core/Entity'
import { lerp } from '@/game/utils/math.utils'
import { getRandom } from '@/game/utils/random.utils'

export class Light extends Component {
  private readonly lampSprite: Sprite
  private readonly lightSprite: Sprite

  private readonly random = getRandom(Math.random() * 12_345)
  private readonly flickerTime: number
  private readonly doFlicker: boolean

  private time: number

  constructor(flumpLibrary: FlumpLibrary, lightAssetName: string) {
    super()

    this.flickerTime = this.random(10, 20)
    this.time = this.random(0, 100)
    this.doFlicker = this.random() > 0.5

    this.lampSprite = flumpLibrary.createSprite(lightAssetName)
    this.lampSprite.anchor.set(0.5, 0)

    this.lightSprite = flumpLibrary.createSprite(`${lightAssetName}_screen`)
    this.lightSprite.anchor.copyFrom(this.lampSprite.anchor)
    this.lightSprite.y += 7
    this.lightSprite.blendMode = 'screen'
  }

  override onStart() {
    super.onStart()

    this.entity.addChild(this.lampSprite)
    this.entity.addChild(this.lightSprite)
  }

  override onUpdate(dt: number) {
    super.onUpdate(dt)

    if (this.doFlicker) {
      this.time += dt / 2
      // use stacked sine wave to simulate flickering
      this.lightSprite.alpha = lerp(0.7, 1, 0.5 + Math.sin(this.time * this.flickerTime) * 0.5)
    }
  }
}
