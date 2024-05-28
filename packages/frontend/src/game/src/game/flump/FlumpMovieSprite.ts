import { Container, Sprite } from 'pixi.js'
import { Signal } from '../core/Signal'

import { FlumpLibrary } from './FlumpLibrary'
import { FlumpKeyFrame, FlumpLayer, FlumpMovieData } from './Flump.types'

export class FlumpMovieSprite extends Container {
  public readonly onEnd = new Signal()
  public readonly onLoop = new Signal()

  public readonly movieData: FlumpMovieData
  public readonly totalFrames: number
  private currentFrame = 0
  private currentKeyFrame: FlumpKeyFrame | undefined = undefined

  public isPlaying = true
  public isLooping = true

  constructor(
    private library: FlumpLibrary,
    public readonly movieName: string
  ) {
    super()

    this.movieData = this.library.data.movies.find((movie) => movie.id === movieName)!

    // amount of layers is fixed, create sprite for each
    this.movieData.layers.forEach(() => this.addChild(new Sprite()))

    const firstLayer = this.movieData.layers[0]
    this.totalFrames = sum(firstLayer.keyframes.map((frame) => frame.duration))
    this.setFrame(this.currentFrame)
  }

  public gotoAndPlay(frame: number) {
    this.setFrame(frame)
    this.play()
  }

  public gotoAndStop(frame: number) {
    this.setFrame(frame)
    this.stop()
  }

  getFrame(frameNo: number, layer: FlumpLayer): FlumpKeyFrame {
    let frame = layer.keyframes[0]
    for (let keyframe of layer.keyframes) {
      if (keyframe.index === frameNo) return keyframe
      else if (keyframe.index > frameNo) {
        return frame
      } else {
        frame = keyframe
      }
    }
    return frame
  }

  setFrame(frame: number) {
    this.currentFrame = frame

    this.movieData.layers.forEach((layer, idx) => {
      const layerSprite = this.children[idx]! as Sprite
      const keyframe = this.getFrame(this.currentFrame, layer)
      if (keyframe !== this.currentKeyFrame) {
        this.currentKeyFrame = keyframe
        if (keyframe.ref) {
          const textureData = this.library.getTexture(keyframe.ref)

          layerSprite.texture = textureData.texture

          if (!layer.flipbook) {
            layerSprite.anchor.set(
              textureData.origin[0] / textureData.texture.width,
              textureData.origin[1] / textureData.texture.height
            )
          }
          if (keyframe.pivot) {
            layerSprite.pivot.set(keyframe.pivot[0], keyframe.pivot[1])
          } else {
            layerSprite.pivot.set(0, 0)
          }

          if (keyframe.loc) {
            layerSprite.position.set(keyframe.loc[0], keyframe.loc[1])
          } else {
            layerSprite.position.set(0, 0)
          }

          layerSprite.alpha = keyframe.alpha ?? 1
          layerSprite.visible = true
        } else {
          layerSprite.visible = false
        }
      }
    })
  }

  public noLoop() {
    this.isLooping = false
    return this
  }

  public stop() {
    this.isPlaying = false
  }

  public play() {
    this.isPlaying = true
  }

  public update() {
    if (!this.isPlaying) return
    this.currentFrame++
    if (this.currentFrame >= this.totalFrames) {
      if (this.isLooping) {
        this.onLoop.emit()
        this.currentFrame = 0
      } else {
        this.currentFrame = this.totalFrames - 1
        this.onEnd.emit()
        this.stop()
      }
    }
    this.setFrame(this.currentFrame)
  }
}

function sum(numbers: number[]): number {
  return numbers.reduce((acc, curr) => acc + curr, 0)
}
