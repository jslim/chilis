import { Container, DestroyOptions, Rectangle, Sprite, Texture } from 'pixi.js'
import { Value } from '../core/Value'

export class SimpleNumberText extends Container {
  public readonly score: Value<number>
  private readonly connection: () => void

  constructor(texture: Texture, score = 0) {
    super()

    let characterMap = new Map<string, Texture>()
    let charWidth = 4
    let charHeight = 9
    for (let i = 0; i < 10; i++) {
      let frame = new Rectangle(i * charWidth, 0, charWidth, charHeight)
      characterMap.set(i.toString(), new Texture({ source: texture.source, frame }))
    }

    let sprites: Sprite[] = []
    this.score = new Value(-999)
    this.connection = this.score.onChanged.subscribe((newScore) => {
      let scoreStr = newScore.toString()
      sprites.filter((sprite, i) => {
        if (i < scoreStr.length) {
          sprite.texture = characterMap.get(scoreStr.charAt(i))!
          return true
        } else {
          this.removeChild(sprite)
          return false
        }
      })
      for (let i = sprites.length; i < scoreStr.length; i++) {
        let sprite = new Sprite(characterMap.get(scoreStr.charAt(i)))
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
