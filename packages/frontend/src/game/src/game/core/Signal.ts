export type Listener<T> = (value: T) => void

export class Signal<T = void> {
  private listeners: Listener<T>[] = []

  // Subscribe to this signal
  subscribe(listener: Listener<T>): () => void {
    this.listeners.push(listener)
    return () => this.unsubscribe(listener) // Return an unsubscribe function
  }

  // Unsubscribe from this signal
  private unsubscribe(listener: Listener<T>): void {
    const index = this.listeners.indexOf(listener)
    if (index > -1) {
      this.listeners.splice(index, 1)
    }
  }

  // Emit this signal to all subscribed listeners
  emit(value: T): void {
    this.listeners.forEach((listener) => listener(value))
  }

  // Dispose of this signal
  destroy(): void {
    this.listeners = []
  }
}
