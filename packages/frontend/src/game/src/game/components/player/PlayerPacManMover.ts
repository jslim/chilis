import type { Direction, MoveDirection } from '../Mover'
import { Mover } from '../Mover'

import { CoolDown } from '../../core/CoolDown'
import { Input } from '../input/Input'
import { Player } from './Player'

export class PlayerPacManMover extends Mover {
  private queuedDirection: MoveDirection = ''
  private readonly queuedDirectionCooldown = new CoolDown(0.5)

  override onStart() {
    super.onStart()

    this.subscribe(this.entity.getComponent(Player).onReset, () => {
      this.queuedDirection = ''
      this.currentDirection.value = ''
    })
  }

  override onUpdate(dt: number) {
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
}
