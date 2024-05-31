import { Component } from '@/game/src/game/core/Entity'

export class PointerComponent extends Component {
  constructor(
    protected event: String,
    protected func: () => void
  ) {
    super()
  }

  public enable(): void {
    this.entity.interactive = true
    this.entity.cursor = 'pointer'
    this.entity.on(this.event as any, this.func)
  }

  /// Emits the function. Useful to fake interaction events.
  public emit(): void {
    if (!this.entity) return
    this.func()
  }

  public disable(): void {
    if (!this.entity) return
    this.entity.cursor = 'none'
    this.entity.off(this.event as any, this.func)
  }

  public override onStart(): void {
    super.onStart()
    this.enable()
  }

  public override destroy(): void {
    this.disable()
    super.destroy()
  }
}
