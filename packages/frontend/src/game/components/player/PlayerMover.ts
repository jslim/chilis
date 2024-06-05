import { Input } from '@/game/components/input/Input'
import { Mover } from '../Mover'
import { Player } from './Player'

export class PlayerMover extends Mover {
  override onUpdate(dt: number) {
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
}
