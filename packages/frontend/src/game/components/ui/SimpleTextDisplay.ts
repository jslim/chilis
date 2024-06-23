import type { TextStyleAlign } from 'pixi.js'

import { getSimpleFont, SimpleText } from '@/game/display/SimpleText'

import { Component } from '../../core/Entity'

export class SimpleTextDisplay extends Component {
  public label: SimpleText

  constructor(label = '', align: TextStyleAlign = 'center', config = getSimpleFont()) {
    super()
    this.label = new SimpleText(label, align, config)
  }

  public setTint(color: number) {
    this.label.tint = color
    return this
  }

  override onStart() {
    super.onStart()
    this.entity.addChild(this.label)
  }
}
