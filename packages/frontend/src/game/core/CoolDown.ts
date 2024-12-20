import { clamp01 } from '../utils/math.utils'

export class CoolDown {
  public time: number = 0

  // eslint-disable-next-line no-empty-function
  constructor(public interval: number) {}

  public get progress() {
    return clamp01(this.time / this.interval)
  }

  public update(dt: number) {
    this.time += dt
    return this.isExpired()
  }

  public reset(time = 0) {
    this.time = time
  }

  public isExpired() {
    return this.time >= this.interval
  }

  public setExpired() {
    this.time = this.interval
  }
}
