/* eslint-disable no-underscore-dangle */
import { Signal } from './Signal'

export class Value<T = unknown> {
  onChanged: Signal<T>
  private _value: T

  constructor(initialValue: T) {
    this._value = initialValue
    this.onChanged = new Signal<T>()
  }

  get value(): T {
    return this._value
  }

  set value(newValue: T) {
    if (this._value !== newValue) {
      this._value = newValue
      this.onChanged.emit(newValue)
    }
  }

  // emits the current value again. only for rare cases
  emit() {
    this.onChanged.emit(this._value)
  }

  destroy() {
    this.onChanged.destroy()
  }
}
