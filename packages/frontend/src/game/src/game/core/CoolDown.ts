import { clamp01 } from '../utils/math.utils'

export class CoolDown {
  public time: number = 0

  constructor(public interval: number) {}

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

  public get progress() {
    return clamp01(this.time / this.interval)
  }
}
