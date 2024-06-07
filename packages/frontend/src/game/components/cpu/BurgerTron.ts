import { BurgerTronBullet } from '@/game/components/cpu/BurgerTronBullet'
import { HitBox } from '@/game/components/HitBox'
import { Bullet } from '@/game/components/level/Bullet'
import { LevelComponent } from '@/game/components/level/LevelComponent'
import { createDelay } from '@/game/core/Delay'
import { Entity } from '@/game/core/Entity'
import { FLOOR_OFFSET } from '@/game/game.config'

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
          createDelay(this.entity, 0.1, () => this.shootBall(mover.currentDirection.value === 'left' ? -5 : 5))
          createDelay(this.entity, 2, () => (cpu.state.value = 'attack_complete'))
          break
        }
      }
    })
  }

  override onUpdate(_dt: number) {
    super.onUpdate(_dt)

    // const mover = this.entity.getComponent(CpuMover)
    switch (this.state.value) {
      case 'walk':
    }
  }

  public shootBall(speedX: number) {
    if (this.level) {
      // const mover = this.entity.getComponent(CpuMover)
      const bulletSize = { width: 15, height: 10 }

      this.level?.screenShake(2, 0.35)

      const bulletSprite = this.level.flumpLibrary!.createSprite('burgertron_bullet')
      bulletSprite.pivot.y = 10
      const bullet = new Entity(bulletSprite).addComponent(
        new LevelComponent(this.level),
        new Bullet('player'),
        new BurgerTronBullet(speedX),
        new HitBox(0, 0, bulletSize.width, bulletSize.height)
      )

      bullet.position.copyFrom(this.entity.position)
      bullet.position.y -= FLOOR_OFFSET

      this.level.containers.burgerParts.addEntity(bullet)
    }
  }
}
