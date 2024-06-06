import { Cpu } from './Cpu'
import { CpuMover } from './CpuMover'

export class BurgerTron extends Cpu {
  override onStart() {
    super.onStart()

    this.paralyzedCoolDown.interval = 3

    const mover = this.entity.getComponent(CpuMover)
    mover.setSpeed(1)

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

    const mover = this.entity.getComponent(CpuMover)
    switch (this.state.value) {
      case 'walk': {
      }
    }
  }
}
