import { Point } from 'pixi.js'

import { createDelay } from '../../core/Delay'
import { Entity } from '../../core/Entity'
import { AutoDisposer } from '../AutoDisposer'
import { HitBox } from '../HitBox'
import { Bullet } from '../level/Bullet'
import { LevelComponent } from '../level/LevelComponent'
import { getOppositeDirection, Mover } from '../Mover'
import { Cpu } from './Cpu'
import { CpuMover } from './CpuMover'

export class MrBaggie extends Cpu {
  override onStart() {
    super.onStart()

    this.paralyzedCoolDown.interval = 3
    this.walksWhenPrepareAttack = false

    // @ts-expect-error - entity is private
    const mover = this.entity.getComponent(CpuMover)
    mover.setSpeed(1.5)
    mover.modeCycle = ['random']

    mover.directionAccuracy = 1

    this.subscribe(this.state.onChanged, (state) => {
      switch (state) {
        case 'prepare_attack': {
          break
        }

        case 'attack': {
          if (this.level) {
            const playerHitBoxRect = this.entity

            const bulletPos = new Point(playerHitBoxRect.x, playerHitBoxRect.y)
            // @ts-expect-error - entity is private
            const moverInner = this.entity.getComponent(Mover)
            const bulletSize = { width: 28, height: 11 }
            const bulletOffset = -bulletSize.width / 3
            if (moverInner.currentDirection.value === 'left') bulletPos.x -= bulletSize.width + bulletOffset
            else if (moverInner.currentDirection.value === 'right') bulletPos.x += bulletOffset

            const bullet = new Entity(this.level.flumpLibrary!.createSprite('mrbaggie_ball')).addComponent(
              new LevelComponent(this.level!),
              new AutoDisposer(10),
              new Bullet('player'),
              new HitBox(0, bulletSize.height, bulletSize.width, bulletSize.height)
            )

            bullet.position.set(bulletPos.x, bulletPos.y - bulletSize.height - 4)

            createDelay(this.entity, 0.3, () => {
              this.level?.containers.floorFront.addEntity(bullet)
              mover.currentDirection.value = getOppositeDirection(mover.currentDirection.value)
            })

            this.state.value = 'attack_complete'
          }
          break
        }
      }
    })
  }

  override onUpdate(dt: number) {
    super.onUpdate(dt)

    switch (this.state.value) {
      case 'walk':
      /*if (!mover.isClimbing() && this.attackCoolDown.update(dt)) {
          this.state.value = 'prepare_attack'
          this.attackCoolDown.reset()
        }*/
    }
  }
}
