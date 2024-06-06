import type SceneManager from './SceneManager'
import type { VideoSource } from 'pixi.js'
import { Assets, Sprite } from 'pixi.js'

import { FRAME_RATE, GAME_HEIGHT, GAME_WIDTH } from '@/game/game.config'

import { GameState } from '../components/GameState'
import { Component, Entity } from '../core/Entity'
import { getOgFont, SimpleText } from '@/game/display/SimpleText'

export class Scene extends Component {
  constructor(public sceneManager: SceneManager) {
    super()

    // set the frame rate for each scene to default. LevelScene will override this (in onStart)
    this.sceneManager.frameRate = FRAME_RATE
  }

  public get gameState(): GameState {
    return this.sceneManager.root.getComponent(GameState)
  }

  protected async playVideo(videoId: string, onEnd: () => void) {
    const videoUrl = `/videos/${videoId}.mp4`
    await Assets.load(videoUrl)
    const videoSprite = Sprite.from(videoUrl)
    videoSprite.width = GAME_WIDTH
    videoSprite.height = GAME_HEIGHT
    const videoSource = videoSprite.texture.source as VideoSource
    videoSource.resource.style.imageRendering = 'pixelated'
    videoSource.resource.loop = false
    videoSource.resource.playsInline = true

    videoSource.resource.addEventListener('ended', () => onEnd())
    await videoSource.resource.play()

    this.disposables.push(() =>
      videoSprite.destroy({
        texture: true,
        textureSource: true
      })
    )
    this.entity.addEntity(new Entity(videoSprite))
  }

  protected addButton(label: string, position: [x: number, y: number], onclick: () => void) {
    const textField = new SimpleText(label, 'center', getOgFont())

    textField.interactive = true
    textField.cursor = 'pointer'

    textField.position.set(Math.floor(position[0]), Math.floor(position[1]))
    // click
    textField.on('pointerdown', onclick)
    // hover
    textField.on('pointerover', () => (textField.alpha = 0.75))
    textField.on('pointerout', () => (textField.alpha = 1))
    this.entity.addChild(textField)

    /*
    let textBounds = textField.getBounds();
    let graphics = new Graphics()
      .rect(textBounds.x, textBounds.y, textBounds.width, textBounds.height)
      .fill(0xff0000);
    this.entity.addChild(graphics);
     */
  }
}
