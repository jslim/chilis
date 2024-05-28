import type { FlumpLibrary } from './FlumpLibrary'

import { Container } from 'pixi.js'

import { Component } from '../core/Entity'
import { Value } from '../core/Value'
import { FlumpMovieSprite } from './FlumpMovieSprite'

export class FlumpAnimator extends Component {
  protected root = new Container()

  protected cache = new Map<string, FlumpMovieSprite>()
  protected currentMovie = new Value<FlumpMovieSprite | undefined>(undefined)

  constructor(private readonly library: FlumpLibrary) {
    super()
    this.subscribe(this.currentMovie.onChanged, (sprite) => {
      this.root.removeChildren()
      if (sprite) this.root.addChild(sprite)
    })
  }

  override onStart() {
    super.onStart()
    this.entity.addChild(this.root)
  }

  public setMovie(movieName: string) {
    if (!this.library.hasMovie(movieName)) {
      console.warn(`Movie ${movieName} not found, skipped`)
      return this
    }
    if (!this.currentMovie.value || this.currentMovie.value.movieName !== movieName) {
      if (this.cache.has(movieName)) {
        //console.log("set movie [cache]", movieName);
        this.currentMovie.value = this.cache.get(movieName)!
      } else {
        this.cache.set(movieName, new FlumpMovieSprite(this.library, movieName))
        //console.log("set movie [new]", movieName, this.cache.get(movieName));
        this.currentMovie.value = this.cache.get(movieName)!
      }
    }
    return this
  }

  public gotoAndPlay(frame: number) {
    this.currentMovie.value?.gotoAndPlay(frame)
    return this
  }

  public once() {
    this.currentMovie.value?.noLoop()
    return this
  }

  public gotoAndStop(frame: number) {
    this.currentMovie.value?.gotoAndStop(frame)
    return this
  }

  public stop() {
    this.currentMovie.value?.stop()
    return this
  }

  public play() {
    this.currentMovie.value?.play()
    return this
  }

  override onUpdate(dt: number) {
    super.onUpdate(dt)

    const currentMovie = this.currentMovie.value
    if (currentMovie) {
      currentMovie.update()
    }
  }

  public flipToRight() {
    this.entity.scale.x = 1
  }

  public flipToLeft() {
    this.entity.scale.x = -1
  }

  public flipNeutral() {
    this.entity.scale.x = -1
  }

  override destroy() {
    super.destroy()
    this.root.destroy()
  }
}
