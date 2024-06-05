import type { DestroyOptions } from 'pixi.js'

import { Container, Rectangle, Sprite, Texture } from 'pixi.js'

import { Value } from '../core/Value'

export class SimpleNumberText extends Container {
  public readonly score: Value<number>
  private readonly connection: () => void

  constructor(texture: Texture, score = 0) {
    super()

    const characterMap = new Map<string, Texture>()
    const charWidth = 4
    const charHeight = 9
    for (let i = 0; i < 10; i++) {
      const frame = new Rectangle(i * charWidth, 0, charWidth, charHeight)
      characterMap.set(i.toString(), new Texture({ source: texture.source, frame }))
    }

    const sprites: Sprite[] = []
    this.score = new Value(-999)
    this.connection = this.score.onChanged.subscribe((newScore) => {
      const scoreStr = newScore.toString()
      sprites.filter((sprite, i) => {
        if (i < scoreStr.length) {
          sprite.texture = characterMap.get(scoreStr.charAt(i))!
          return true
        }
        // eslint-disable-next-line unicorn/prefer-dom-node-remove
        sprite.parent?.removeChild(sprite)
        return false
      })
      for (let i = sprites.length; i < scoreStr.length; i++) {
        const sprite = new Sprite(characterMap.get(scoreStr.charAt(i)))
        sprite.x = i * charWidth
        this.addChild(sprite)
        sprites.push(sprite)
      }
      this.pivot.set(this.width / 2, this.height / 2)
    })
    this.score.value = score
  }

  override destroy(options?: DestroyOptions) {
    this.connection()
    super.destroy(options)
  }
}
