import { Point } from 'pixi.js'

import { CpuAnimator } from '@/game/src/game/components/cpu/CpuAnimator'
import { FlumpAnimator } from '@/game/src/game/flump/FlumpAnimator'

import { createDelay } from '../../core/Delay'
import { Entity } from '../../core/Entity'
import { AutoDisposer } from '../AutoDisposer'
import { HitBox } from '../HitBox'
import { Bullet } from '../level/Bullet'
import { LevelComponent } from '../level/LevelComponent'
import { Mover } from '../Mover'
import { Cpu } from './Cpu'
import { CpuMover } from './CpuMover'

export class Zapp extends Cpu {
  override onStart() {
    super.onStart()

    this.walksWhenPrepareAttack = false
    this.attackCoolDown.interval = 10
    this.paralyzedCoolDown.interval = 3

    // @ts-expect-error - entity is private
    const animator = this.entity.getComponent(CpuAnimator)
    // @ts-expect-error - entity is private
    const mover = this.entity.getComponent(CpuMover)
    mover.setSpeed(1.5)
    mover.modeCycle = ['hunt-burger']

    mover.directionAccuracy = 1

    this.subscribe(this.state.onChanged, (state) => {
      switch (state) {
        case 'prepare_attack': {
          // should longest distance
          if (this.entity.x < 120) {
            mover.currentDirection.value = 'right'
            animator.flipToRight()
          } else {
            mover.currentDirection.value = 'left'
            animator.flipToLeft()
          }
          break
        }

        case 'attack': {
          this.level!.screenShake(3, 0.3)
          const playerHitBoxRect = this.entity

          const bulletPos = new Point(playerHitBoxRect.x, playerHitBoxRect.y)
          // @ts-expect-error - entity is private
          const moverInner = this.entity.getComponent(Mover)
          const bulletSize = { width: 240, height: 8 }
          const bulletOffset = 0

          if (moverInner.currentDirection.value === 'left') bulletPos.x -= bulletSize.width + bulletOffset
          else if (moverInner.currentDirection.value === 'right') bulletPos.x += bulletOffset

          const bullet = new Entity().addComponent(
            new LevelComponent(this.level!),
            new AutoDisposer(0.6),
            new Bullet('player'),
            new HitBox(0, -5, bulletSize.width, bulletSize.height)
          )

          bullet.position.set(bulletPos.x, bulletPos.y - bulletSize.height)

          createDelay(this.entity, 0.3, () => {
            this.level?.containers.mid.addEntity(bullet)
          })

          break
        }
        case 'attack_complete': {
          const dissolveAnimation = new FlumpAnimator(this.level!.flumpLibrary)
          dissolveAnimation.setMovie('zapp_dissolve_attack').gotoAndPlay(0).once()
          this.subscribeOnce(dissolveAnimation.currentMovie.value!.onEnd, () => animationEntity.destroy())
          const animationEntity = new Entity().addComponent(dissolveAnimation)
          animationEntity.position.copyFrom(this.entity.position)
          animationEntity.scale.x = this.entity.scale.x
          animationEntity.pivot.x = this.entity.pivot.x
          animationEntity.pivot.y = this.entity.pivot.y
          this.level!.containers.mid.addEntity(animationEntity)
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
        if (this.attackCoolDown.update(dt) && !mover.isClimbing()) {
          this.attackCoolDown.reset()
          this.state.value = 'prepare_attack'
        }
        break
      }
      case 'prepare_attack':
    }
  }
}
