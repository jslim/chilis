import { Mover } from '@/game/components/Mover'

import { Cpu } from './Cpu'
import { CpuMover } from './CpuMover'

// const ATTACK_RANGE = 30

export class DinoCool extends Cpu {
  override onStart() {
    super.onStart()

    this.paralyzedCoolDown.interval = 3

    const mover = this.entity.getComponent(CpuMover)
    mover.setSpeed(2.25)
  }

  override onUpdate(dt: number) {
    super.onUpdate(dt)

    if (this.state.value === 'jump') {
      const mover = this.entity.getComponent(Mover)
      if (mover.currentDirection.value === 'left') {
        mover.position.x -= mover.speed.x
      } else {
        mover.position.x += mover.speed.x
      }
    }
  }
}
