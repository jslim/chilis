import { Cpu } from './Cpu'
import { CpuMover } from './CpuMover'
import { Entity } from '../../core/Entity'
import { AutoDisposer } from '../AutoDisposer'
import { Bullet } from '../level/Bullet'
import { HitBox } from '../HitBox'
import { LevelComponent } from '../level/LevelComponent'
import { Point } from 'pixi.js'
import { getOppositeDirection, Mover } from '../Mover'
import { createDelay } from '../../core/Delay'

const ATTACK_RANGE = 30

export class Piggles extends Cpu {
  override onStart() {
    super.onStart()

    this.paralyzedCoolDown.interval = 3.0

    let mover = this.entity.getComponent(CpuMover)
    mover.setSpeed(1.5)
    mover.modeCycle = ['hunt-player-slow']

    mover.directionAccuracy = 0.5

    this.subscribe(this.state.onChanged, (state) => {
      switch (state) {
        case 'prepare_attack':
          break

        case 'attack':
          this.level!.screenShake(4, 0.3)
          const playerHitBoxRect = this.entity

          const bulletPos = new Point(playerHitBoxRect.x, playerHitBoxRect.y)
          const mover = this.entity.getComponent(Mover)
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
          })

          mover.currentDirection.value = getOppositeDirection(mover.currentDirection.value)
          break
      }
    })
  }

  override onUpdate(dt: number) {
    super.onUpdate(dt)

    const mover = this.entity.getComponent(CpuMover)
    switch (this.state.value) {
      case 'walk':
        if (
          this.attackCoolDown.update(dt) &&
          !mover.isClimbing &&
          this.entity.y === this.level!.player.y &&
          Math.abs(this.entity.x - this.level!.player.x) < ATTACK_RANGE
        ) {
          this.attackCoolDown.reset()
          this.state.value = 'prepare_attack'
        }
    }
  }
}
