import { Cpu } from './Cpu'
import { CpuMover } from './CpuMover'

const ATTACK_RANGE = 30

export class DinoCool extends Cpu {
  override onStart() {
    super.onStart()

    this.paralyzedCoolDown.interval = 3

    // @ts-expect-error - entity is private
    const mover = this.entity.getComponent(CpuMover)
    mover.setSpeed(1)
    mover.speed.y = 2

    mover.modeCycle = ['hunt-player-slow']
    mover.directionAccuracy = 0.75

    this.subscribe(this.state.onChanged, (state) => {
      switch (state) {
        case 'prepare_attack': {
          break
        }

        case 'attack': {
          break
        }
      }
    })
  }

  override onUpdate(dt: number) {
    super.onUpdate(dt)

    // @ts-expect-error - entity is private
    const mover = this.entity.getComponent(CpuMover)
    switch (this.state.value) {
      case 'walk': {
        if (
          this.attackCoolDown.update(dt) &&
          !mover.isClimbing &&
          this.entity.y === this.level!.player.y &&
          Math.abs(this.entity.x - this.level!.player.x) < ATTACK_RANGE
        ) {
          this.attackCoolDown.reset()
          //this.state.value = 'prepare_attack';
        }
      }
    }
  }
}
