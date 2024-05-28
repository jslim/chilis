import { Component } from '../../core/Entity'
import { Signal } from '../../core/Signal'

export class Input extends Component {
  public map = new Map<InputKey, boolean>()

  public readonly onDown = new Signal<InputKey>()
  public readonly onUp = new Signal<InputKey>()

  public isDown(key: InputKey) {
    return this.map.get(key) ?? false
  }

  override onStart() {
    super.onStart()

    this.subscribe(this.onDown, (key) => this.map.set(key, true))
    this.subscribe(this.onUp, (key) => this.map.set(key, false))
  }
}

export type InputKey = 'left' | 'right' | 'up' | 'down' | 'action'
// export type InputType = "keyboard" | "gamepad" | "mobile";
