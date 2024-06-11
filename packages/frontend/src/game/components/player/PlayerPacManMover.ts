import type { Direction, MoveDirection } from '../Mover'

import { Point } from 'pixi.js'

import { Input } from '@/game/components/input/Input'

import { CoolDown } from '../../core/CoolDown'
import { Mover } from '../Mover'
import { Player } from './Player'

export class PlayerPacManMover extends Mover {
  public slowDownCoolDown: CoolDown | undefined = undefined

  private queuedDirection: MoveDirection = ''
  private readonly queuedDirectionCooldown = new CoolDown(0.5)

  private readonly normalSpeed = new Point()
  private slowSpeed = new Point()

  override onStart() {
    super.onStart()

    this.normalSpeed.copyFrom(this.speed)
    this.slowSpeed = new Point(0.5, 0.5)

    this.subscribe(this.entity.getComponent(Player).onReset, () => {
      this.queuedDirection = ''
      this.currentDirection.value = ''
    })
  }

  override onUpdate(dt: number) {
    if (this.slowDownCoolDown) {
      if (this.slowDownCoolDown.update(dt)) {
        this.speed.copyFrom(this.normalSpeed)
        this.slowDownCoolDown = undefined
      } else {
        this.speed.copyFrom(this.slowSpeed)
      }
    } else {
      this.speed.copyFrom(this.normalSpeed)
    }

    super.onUpdate(dt)

    this.queuedDirectionCooldown.update(dt)
    if (this.queuedDirectionCooldown.isExpired()) {
      this.queuedDirection = ''
    }

    const player = this.entity.getComponent(Player)
    const input = this.entity.getComponent(Input)

    if (input && player.canWalk) {
      if (player.canShoot && this.canMoveSideways && input.isDown('action')) {
        player.state.value = 'shoot'
        input.onUp.emit('action')
      } else {
        const currentDirection = this.currentDirection.value
        let hasMoved = false
        let queuedDirection: MoveDirection = ''

        const move = (direction: Direction) => {
          if (!hasMoved && this[direction]()) {
            return (hasMoved = true)
          }
          return false
        }

        if (input.isDown('left')) {
          if (!move('left')) queuedDirection = 'left'
        } else if (input.isDown('right') && !move('right')) queuedDirection = 'right'

        if (input.isDown('up')) {
          if (!move('up')) queuedDirection = 'up'
        } else if (input.isDown('down') && !move('down')) queuedDirection = 'down'

        if (queuedDirection) {
          this.queuedDirection = queuedDirection
          this.queuedDirectionCooldown.reset()
        }

        if (!hasMoved && this.queuedDirection && move(this.queuedDirection)) {
          this.queuedDirection = ''
        }

        if (!hasMoved && currentDirection) {
          move(currentDirection)
        }

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
