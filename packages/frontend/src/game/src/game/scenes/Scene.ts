import type SceneManager from './SceneManager'

import { GameState } from '../components/GameState'
import { Component, Entity } from '../core/Entity'
import { getOgFont, SimpleText } from '../display/SimpleText'
import { Assets, Sprite, VideoSource } from 'pixi.js'
import { GAME_HEIGHT, GAME_WIDTH } from '@/game/src/game/game.config'

export class Scene extends Component {
  constructor(public sceneManager: SceneManager) {
    super()
  }

  protected async playVideo(videoId: string, onEnd: () => void) {
    let videoUrl = `/videos/${videoId}.mp4`
    await Assets.load(videoUrl)
    let videoSprite = Sprite.from(videoUrl)
    videoSprite.width = GAME_WIDTH
    videoSprite.height = GAME_HEIGHT
    let videoSource = videoSprite.texture.source as VideoSource
    videoSource.resource.loop = false
    videoSource.resource.playsInline = true

    videoSource.resource.onended = () => onEnd()
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

  public get gameState(): GameState {
    return this.sceneManager.root.getComponent(GameState)
  }
}
