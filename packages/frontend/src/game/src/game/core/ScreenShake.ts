import { Component } from './Entity'
import { CoolDown } from './CoolDown'

export class ScreenShake extends Component {
  shakeCoolDown: CoolDown

  constructor(
    private amount: number,
    duration: number
  ) {
    super()

    this.shakeCoolDown = new CoolDown(duration)
  }

  override onUpdate(dt: number) {
    super.onUpdate(dt)

    this.shakeCoolDown.update(dt)
    if (!this.shakeCoolDown.isExpired()) {
      const x = (-0.5 + Math.random()) * this.amount
      const y = (-0.5 + Math.random()) * this.amount
      this.entity.position.set(Math.round(x), Math.round(y))
    } else {
      this.entity.position.set(0, 0)
      this.destroy()
    }
  }
}
