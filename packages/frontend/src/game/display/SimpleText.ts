/* eslint-disable no-param-reassign */
import type { DestroyOptions, TextStyleAlign } from 'pixi.js'

import { Assets, Container, Rectangle, Sprite, Texture } from 'pixi.js'

import { Value } from '../core/Value'

export function get8pxNumberFont(): SimpleTextConfig {
  return {
    texture: Assets.get('8px_numbers'),
    charWidth: [5, 3, 5, 5, 5, 5, 5, 5, 5, 5, 2, 5],
    characters: '0123456789!?'
  }
}

export function getGamerNumberFont(): SimpleTextConfig {
  return {
    texture: Assets.get('gamer_numbers'),
    charWidth: 9,
    characters: '0123456789',
    letterSpacing: 1
  }
}

export function getPixGamerNumberFont(): SimpleTextConfig {
  return {
    texture: Assets.get('pix_gamer_numbers'),
    charWidth: 6,
    characters: '1234567890!',
    letterSpacing: 0
  }
}

export function getSimpleFont(): SimpleTextConfig {
  return {
    texture: Assets.get('font'),
    charWidth: 4,
    characters: 'abcdefghijklmnopqrstuvwxyz 0123456789.?!'
  }
}

export function getOgFont(): SimpleTextConfig {
  return {
    texture: Assets.get('font2'),
    charWidth: 8,
    characters: '?©abcdefghijklmnopqrstuvwxyz[`]`/0123456789:;<=>  !"#$%&\'()*+,-./'
  }
}

export type SimpleTextConfig = {
  texture: Texture
  charWidth: number | number[]
  characters: string
  letterSpacing?: number
}

export class SimpleText extends Container {
  public readonly text: Value<string>
  private readonly connection: () => void

  constructor(
    label: string = '',
    align: TextStyleAlign,
    { texture, charWidth, characters, letterSpacing }: SimpleTextConfig
  ) {
    super()

    if (!letterSpacing) letterSpacing = 0

    const characterMap = new Map<string, Texture>()
    const charHeight = texture.height
    let x = 0
    for (const [i, character] of [...characters].entries()) {
      const cw = Array.isArray(charWidth) ? charWidth[i] : charWidth
      const frame = new Rectangle(x, 0, cw, charHeight)
      characterMap.set(character, new Texture({ source: texture.source, frame }))
      x += cw
    }

    let sprites: Sprite[] = []
    this.text = new Value('')
    this.connection = this.text.onChanged.subscribe((newLabel) => {
      // newLabel replace everything thats not in `characters` with a space
      newLabel = [...newLabel.toLowerCase()].map((c) => (characters.includes(c) ? c : ' ')).join('')

      sprites = sprites.filter((sprite: Sprite, i) => {
        if (i < newLabel.length) {
          sprite.texture = characterMap.get(newLabel[i])!
          return true
        }
        // eslint-disable-next-line unicorn/prefer-dom-node-remove
        sprite.parent?.removeChild(sprite)
        return false
      })

      // eslint-disable-next-line @typescript-eslint/no-shadow
      let x = this.width + letterSpacing
      for (let i = sprites.length; i < newLabel.length; i++) {
        const char = newLabel[i]
        const sprite = new Sprite(characterMap.get(char))
        sprite.x = x
        this.addChild(sprite)
        sprites.push(sprite)
        x += sprite.width + letterSpacing
      }

      const width = this.width
      if (align === 'center') {
        this.pivot.set(Math.floor(width / 2), Math.floor(this.height / 2))
      } else if (align === 'right') {
        this.pivot.set(width, Math.floor(this.height / 2))
      } else {
        this.pivot.set(0, Math.floor(this.height / 2))
      }
    })
    this.text.value = label
  }

  override destroy(options?: DestroyOptions) {
    this.connection()
    super.destroy(options)
  }
}
