import { removeItem } from '@/game/utils/array.utils'

export type Listener<T> = (value: T) => void

export class Signal<T = void> {
  private listeners: Listener<T>[] = []

  // Subscribe to this signal
  subscribe(listener: Listener<T>): () => void {
    this.listeners.push(listener)
    return () => this.unsubscribe(listener) // Return an unsubscribe function
  }

  // Emit this signal to all subscribed listeners
  emit(value: T): void {
    ;[...this.listeners].forEach((listener) => listener(value))
  }

  // Dispose of this signal
  destroy(): void {
    this.listeners = []
  }

  // Unsubscribe from this signal
  private unsubscribe(listener: Listener<T>): void {
    removeItem(this.listeners, listener)
  }
}
