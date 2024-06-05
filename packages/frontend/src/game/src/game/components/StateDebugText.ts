import type { Value } from '../core/Value'

import { SimpleTextDisplay } from './ui/SimpleTextDisplay'

export class StateDebugText extends SimpleTextDisplay {
  constructor(state: Value, position = [0, 0], tint = 0xffffff) {
    super()
    // @ts-expect-error - Type 'unknown' is not assignable to type 'string'.
    state.onChanged.subscribe((newState) => (this.label.text.value = newState))
    // @ts-expect-error - Type 'unknown' is not assignable to type 'string'.
    this.label.text.value = state.value
    this.label.tint = tint
    this.label.position.set(position[0], position[1])
  }

  override onUpdate(_dt: number) {
    super.onUpdate(_dt)

    this.label.scale.x = this.entity.scale.x < 0 ? -1 : 1
  }
}
