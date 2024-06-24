import { CoolDown } from '../core/CoolDown'
import { Component } from '../core/Entity'

export class AutoDisposer extends Component {
  private readonly coolDown: CoolDown

  constructor(
    time: number = 0,
    private readonly onBeforeDestroy?: () => void
  ) {
    super()
    this.coolDown = new CoolDown(time)
  }

  override onUpdate(dt: number) {
    super.onUpdate(dt)

    if (this.coolDown.update(dt)) {
      if (this.onBeforeDestroy) this.onBeforeDestroy()
      this.entity?.destroy()
    }
  }
}
