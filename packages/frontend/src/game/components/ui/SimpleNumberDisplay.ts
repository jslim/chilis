import { Assets } from 'pixi.js'

import { SimpleNumberText } from '@/game/display/SimpleNumberText'

import { Component } from '../../core/Entity'

export class SimpleNumberDisplay extends Component {
  public scoreText: SimpleNumberText

  constructor(score = 0) {
    super()
    this.scoreText = new SimpleNumberText(Assets.get('numbers'), score)
  }

  override onStart() {
    super.onStart()
    this.entity.addChild(this.scoreText)
  }
}
