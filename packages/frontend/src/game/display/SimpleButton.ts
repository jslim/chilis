import { Assets, Rectangle, Sprite, Texture } from 'pixi.js'

import { Component } from '@/game/core/Entity'

export class SimpleButton extends Component {
  constructor(
    private readonly assetName: string,
    private readonly onPressed: () => void
  ) {
    super()
  }

  override onStart() {
    super.onStart()

    const texture: Texture = Assets.get(this.assetName)
    texture.source.scaleMode = 'nearest'

    const upTexture = new Texture({
      source: texture.source,
      frame: new Rectangle(0, 0, texture.width, 24)
    })
    const overTexture = new Texture({
      source: texture.source,
      frame: new Rectangle(0, 24, texture.width, 25)
    })
    const downTexture = new Texture({
      source: texture.source,
      frame: new Rectangle(0, 47, texture.width, 20)
    })
    const sprite = new Sprite(upTexture)
    sprite.x -= Math.trunc(texture.width / 2)
    sprite.y -= 10
    sprite.cursor = 'pointer'
    sprite.hitArea = new Rectangle(0, 0, texture.width, 21)
    sprite.interactive = true
    sprite.on('pointerdown', () => (sprite.texture = downTexture))
    sprite.on('pointerup', () => {
      sprite.texture = upTexture
      this.onPressed()
    })
    sprite.on('pointerleave', () => (sprite.texture = upTexture))
    sprite.on('pointerover', () => (sprite.texture = overTexture))
    sprite.on('pointerout', () => (sprite.texture = upTexture))

    this.entity.addChild(sprite)
  }
}
