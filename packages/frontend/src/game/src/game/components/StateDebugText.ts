import type { Value } from '../core/Value'

import { SimpleTextDisplay } from './ui/SimpleTextDisplay'

export class StateDebugText<T> extends SimpleTextDisplay {
  constructor(state: Value<T>, position = [0, 0], tint = 0xffffff) {
    super()
    state.onChanged.subscribe((newState) => (this.label.text.value = newState as string))
    this.label.text.value = state.value as string
    this.label.tint = tint
    this.label.position.set(position[0], position[1])
  }

  override onUpdate(_dt: number) {
    super.onUpdate(_dt)

    this.label.scale.x = this.entity.scale.x < 0 ? -1 : 1
  }
}
