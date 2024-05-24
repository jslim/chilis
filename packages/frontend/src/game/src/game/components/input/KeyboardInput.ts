import { Component } from '../../core/Entity'
import { Input, InputKey } from './Input'

const keyMapping = new Map<string, InputKey>([
  ['ArrowLeft', 'left'],
  ['ArrowRight', 'right'],
  ['ArrowUp', 'up'],
  ['ArrowDown', 'down'],
  ['a', 'left'],
  ['d', 'right'],
  ['w', 'up'],
  ['s', 'down'],
  ['Space', 'action'],
  ['x', 'action']
])

export class KeyboardInput extends Component {
  override onStart() {
    super.onStart()
    window.addEventListener('keydown', this.onKeyDownHandler.bind(this))
    window.addEventListener('keyup', this.onKeyUpHandler.bind(this))
  }

  onKeyUpHandler({ key }: KeyboardEvent) {
    const input = this.entity?.getComponent(Input)
    let inputKey = keyMapping.get(key)
    if (input && inputKey) {
      input.onUp.emit(inputKey)
    }
  }

  onKeyDownHandler({ key }: KeyboardEvent) {
    const input = this.entity?.getComponent(Input)
    let inputKey = keyMapping.get(key)
    if (input && inputKey) {
      input.onDown.emit(inputKey)
    }
  }

  override destroy() {
    super.destroy()
    window.removeEventListener('keydown', this.onKeyDownHandler)
    window.removeEventListener('keyup', this.onKeyUpHandler)
  }
}
