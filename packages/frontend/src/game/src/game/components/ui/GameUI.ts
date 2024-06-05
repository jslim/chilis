/* eslint-disable unicorn/filename-case */
/* eslint-disable @typescript-eslint/no-shadow */
import type { Value } from '../../core/Value'
import type { FlumpLibrary } from '../../flump/FlumpLibrary'
import type LevelScene from '../../scenes/LevelScene'

import { Component, Entity } from '../../core/Entity'
import { getGamerNumberFont } from '../../display/SimpleText'
import { SimpleTextDisplay } from './SimpleTextDisplay'

export class GameUI extends Component {
  constructor(private readonly levelScene: LevelScene) {
    super()
  }

  override onStart() {
    super.onStart()

    const { gameState, flumpLibrary } = this.levelScene

    this.disposables.push(
      addPanel(flumpLibrary, this.entity, [9, 0], 'label_score', gameState.score),
      addPanel(flumpLibrary, this.entity, [82, 0], 'label_highscore', gameState.highScore),
      addSmallPanel(flumpLibrary, this.entity, [189, 0], 'life', gameState.lives),
      addSmallPanel(flumpLibrary, this.entity, [209, 0], 'pepper', gameState.bullets)
    )
  }
}

function addPanel(
  flumpLibrary: FlumpLibrary,
  entity: Entity,
  position: [x: number, y: number],
  labelSpritePath: string,
  value: Value<number>
) {
  const panel = new Entity(flumpLibrary.createSprite('score_panel'))
  panel.x = position[0]
  panel.y = position[1]
  entity.addEntity(panel)

  const label = new Entity(flumpLibrary.createSprite(labelSpritePath))
  label.position.set(4, 6)
  panel.addEntity(label)

  const formatter = (value: number) => `${value}`.padStart(6, '0')
  const text = new Entity().addComponent(
    new SimpleTextDisplay(formatter(value.value), 'left', getGamerNumberFont()).setTint(0xffc507)
  )
  text.position.set(3, 19)
  panel.addEntity(text)

  return value.onChanged.subscribe((value) => {
    // @ts-expect-error - entity is private
    text.getComponent(SimpleTextDisplay).label.text.value = formatter(value)
  })
}

function addSmallPanel(
  flumpLibrary: FlumpLibrary,
  entity: Entity,
  position: [x: number, y: number],
  iconSpritePath: string,
  value: Value<number>
) {
  const panel = new Entity(flumpLibrary.createSprite('small_panel'))
  panel.x = position[0]
  panel.y = position[1]
  entity.addEntity(panel)

  const label = new Entity(flumpLibrary.createSprite(iconSpritePath))
  label.position.set(4, 8)
  panel.addEntity(label)

  const formatter = (value: number) => `${value}`
  const text = new Entity().addComponent(new SimpleTextDisplay(formatter(value.value), 'left', getGamerNumberFont()))
  text.position.set(3, 19 + 5)
  panel.addEntity(text)

  const textOverlay = new Entity(flumpLibrary.createSprite('small_panel_overlay'))
  textOverlay.position.set(2, 19)
  panel.addEntity(textOverlay)

  return value.onChanged.subscribe((value) => {
    // @ts-expect-error - entity is private
    text.getComponent(SimpleTextDisplay).label.text.value = formatter(value)
  })
}
