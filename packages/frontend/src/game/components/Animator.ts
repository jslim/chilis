import type { Texture } from 'pixi.js'
import { Assets, Container } from 'pixi.js'

import { Component } from '../core/Entity'
import { Value } from '../core/Value'
import { AnimationSprite } from '@/game/display/AnimationSprite'

export type AnimatorLibrary = Map<string, { texture: Texture; frameWidth: number }>

export class Animator extends Component {
  public root = new Container()
  protected animationSprites = new Map<string, AnimationSprite>()
  protected currentMovie = new Value<AnimationSprite | undefined>(undefined)

  constructor(library: AnimatorLibrary) {
    super()
    for (const [movieName, { texture, frameWidth }] of library) {
      this.animationSprites.set(movieName, new AnimationSprite(texture, frameWidth))
    }
  }

  override onStart() {
    super.onStart()

    this.entity.addChild(this.root)

    let prevSprite = this.currentMovie.value
    if (prevSprite) this.root.addChild(prevSprite)

    this.subscribe(this.currentMovie.onChanged, (sprite) => {
      if (prevSprite) prevSprite.destroy()
      if (sprite) this.root.addChild(sprite)
      prevSprite = sprite
    })
  }

  public setMovie(movieName: string) {
    this.currentMovie.value = this.animationSprites.get(movieName)
    return this
  }

  public gotoAndPlay(frame: number) {
    this.currentMovie.value?.gotoAndPlay(frame)
  }

  public gotoAndStop(frame: number) {
    this.currentMovie.value?.gotoAndStop(frame)
  }

  public stop() {
    this.currentMovie.value?.stop()
  }

  public play() {
    this.currentMovie.value?.play()
  }

  override onUpdate(_dt: number) {
    super.onUpdate(_dt)
    this.currentMovie.value?.update()
  }

  public flipToRight() {
    this.entity.scale.x = -1
  }

  public flipToLeft() {
    this.entity.scale.x = 1
  }

  public flipNeutral() {
    this.entity.scale.x = 1
  }

  override destroy() {
    super.destroy()
    this.root.destroy()
  }
}

export function configToLibrary(libraryConfig: { [key: string]: number }): AnimatorLibrary {
  const library: AnimatorLibrary = new Map<string, { texture: Texture; frameWidth: number }>()
  for (const [name, frameWidth] of Object.entries(libraryConfig)) {
    library.set(name, {
      texture: Assets.get(name),
      frameWidth
    })
  }
  return library
}
