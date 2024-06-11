import { Input } from '@/game/components/input/Input'
import { Mover } from '../Mover'
import { Player } from './Player'
import { CoolDown } from '@/game/core/CoolDown'
import { Point } from 'pixi.js'

export class PlayerMover extends Mover {
  public slowDownCoolDown: CoolDown | undefined = undefined

  private normalSpeed = new Point()
  private slowSpeed = new Point()

  override onStart() {
    super.onStart()

    this.normalSpeed.copyFrom(this.speed)
    this.slowSpeed = new Point(1, 0.8)
  }

  override onUpdate(dt: number) {
    if (this.slowDownCoolDown) {
      if (this.slowDownCoolDown.update(dt)) {
        this.speed.copyFrom(this.normalSpeed)
      } else {
        this.speed.copyFrom(this.slowSpeed)
      }
    } else {
      this.speed.copyFrom(this.normalSpeed)
    }

    super.onUpdate(dt)

    const player = this.entity.getComponent(Player)
    const input = this.entity.getComponent(Input)
    if (input && player.canWalk) {
      if (player.canShoot && this.canMoveSideways && input.isDown('action')) {
        player.state.value = 'shoot'
        input.onUp.emit('action')
      } else {
        let hasMoved = false
        if (input.isDown('left')) {
          if (this.left()) hasMoved = true
        } else if (input.isDown('right') && this.right()) hasMoved = true
        if (input.isDown('up')) {
          if (this.up()) hasMoved = true
        } else if (input.isDown('down') && this.down()) hasMoved = true
        if (hasMoved) {
          player.state.value = 'walk'
          player.idleCoolDown.reset()
        }
      }
    }
  }

  public slowDown(duration: number = 3) {
    this.slowDownCoolDown = new CoolDown(duration)
  }
}
