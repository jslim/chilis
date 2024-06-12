import { BurgerTronBullet } from '@/game/components/cpu/BurgerTronBullet'
import { HitBox } from '@/game/components/HitBox'
import { Bullet } from '@/game/components/level/Bullet'
import { LevelComponent } from '@/game/components/level/LevelComponent'
import { createDelay } from '@/game/core/Delay'
import { Entity } from '@/game/core/Entity'
import { FLOOR_OFFSET } from '@/game/game.config'
import { lerp } from '@/game/utils/math.utils'

import { Cpu } from './Cpu'
import { CpuMover } from './CpuMover'

export class BurgerTron extends Cpu {
  override onStart() {
    super.onStart()

    this.paralyzedCoolDown.interval = 3
    this.autoCompleteAttack = false
    this.respawnAfterDied = false

    const cpu = this.entity.getComponent(Cpu)
    const mover = this.entity.getComponent(CpuMover)
    mover.setSpeed(1)

    this.subscribe(this.state.onChanged, (state) => {
      switch (state) {
        case 'prepare_attack': {
          break
        }

        case 'attack': {
          createDelay(this.entity, 0.1, () => this.shootBall(mover.currentDirection.value === 'left' ? -3 : 3))
          createDelay(this.entity, 2, () => {
            if (cpu.state.value === 'attack') cpu.state.value = 'attack_complete'
          })
          break
        }

        case 'dead': {
          break
        }
      }
    })
  }

  public shootBall(speedX: number) {
    if (this.level) {
      // const mover = this.entity.getComponent(CpuMover)
      const bulletSize = { width: 15, height: 10 }

      this.level?.screenShake(2, 0.35)

      for (let i = 0; i < 3; i++) {
        const angle = lerp(-0.4, 0.4, i / 2)

        const bulletSprite = this.level.flumpLibrary!.createSprite('burgertron_bullet')
        bulletSprite.pivot.y = 10

        const bullet = new Entity(bulletSprite).addComponent(
          new LevelComponent(this.level),
          new Bullet('player'),
          new BurgerTronBullet(speedX, angle),
          new HitBox(0, 0, bulletSize.width, bulletSize.height)
        )

        bullet.position.copyFrom(this.entity.position)
        bullet.position.y -= FLOOR_OFFSET

        this.level.containers.burgerParts.addEntity(bullet)
      }
    }
  }
}
