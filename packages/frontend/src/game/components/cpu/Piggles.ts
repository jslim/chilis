import { Point } from 'pixi.js'

import { Bullet } from '@/game/components/level/Bullet'
import { LevelComponent } from '@/game/components/level/LevelComponent'
import { getOppositeDirection } from '@/game/components/Mover'

import { createDelay } from '../../core/Delay'
import { Entity } from '../../core/Entity'
import { AutoDisposer } from '../AutoDisposer'
import { HitBox } from '../HitBox'
import { Cpu } from './Cpu'
import { CpuMover } from './CpuMover'

const ATTACK_RANGE = 50

export class Piggles extends Cpu {
  private isAttackDemonstration: boolean = true
  override onStart() {
    super.onStart()

    this.attackCoolDown.interval = 3
    this.paralyzedCoolDown.interval = 3

    const mover = this.entity.getComponent(CpuMover)
    mover.setSpeed(1.5)
    mover.modeCycle = ['hunt-player-slow']

    mover.directionAccuracy = 0.5

    this.subscribe(this.state.onChanged, (state) => {
      switch (state) {
        case 'attack': {
          this.level!.screenShake(4, 0.3)
          const playerHitBoxRect = this.entity

          const bulletPos = new Point(playerHitBoxRect.x, playerHitBoxRect.y)
          const bulletSize = { width: 20, height: 10 }
          const bulletOffset = 10
          if (mover.currentDirection.value === 'left') bulletPos.x -= bulletSize.width + bulletOffset
          else if (mover.currentDirection.value === 'right') bulletPos.x += bulletOffset

          const bullet = new Entity().addComponent(
            new LevelComponent(this.level!),
            new AutoDisposer(0.4),
            new Bullet('player'),
            new HitBox(0, bulletSize.height, bulletSize.width, bulletSize.height)
          )

          bullet.position.set(bulletPos.x, bulletPos.y - bulletSize.height - 13)

          createDelay(this.entity, 0.3, () => {
            this.level?.containers.mid.addEntity(bullet)
            createDelay(this.entity, 0.3, () => {
              if (!this.isAttackDemonstration) {
                mover.currentDirection.value = getOppositeDirection(mover.currentDirection.value)
              }
              this.isAttackDemonstration = false
            })
          })

          break
        }
      }
    })

    this.isAttackDemonstration = true
    this.entity.x -= 5
    mover.currentDirection.value = 'left'
    this.state.value = 'prepare_attack'
  }

  override onUpdate(dt: number) {
    super.onUpdate(dt)

    const mover = this.entity.getComponent(CpuMover)
    switch (this.state.value) {
      case 'walk': {
        if (
          this.attackCoolDown.update(dt) &&
          !mover.isClimbing() &&
          Math.abs(this.entity.y - this.level!.player.y) < 2 &&
          Math.abs(this.entity.x - this.level!.player.x) < ATTACK_RANGE
        ) {
          this.attackCoolDown.reset()
          this.state.value = 'prepare_attack'
        }
        break
      }
      case 'prepare_attack': {
        if (Math.abs(this.entity.x - this.level!.player.x) > ATTACK_RANGE * 1.25 && !this.isAttackDemonstration) {
          this.state.value = 'walk'
        }
      }
    }
  }
}
