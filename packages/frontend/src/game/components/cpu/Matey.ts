import { Bullet } from '@/game/components/level/Bullet'
import { LevelComponent } from '@/game/components/level/LevelComponent'
import { createDelay } from '@/game/core/Delay'
import { removeItem } from '@/game/utils/array.utils'
import { getFloorPositionsAtX } from '@/game/utils/grid.utils'
import { getRandom, pick } from '@/game/utils/random.utils'

import { CoolDown } from '../../core/CoolDown'
import { Entity } from '../../core/Entity'
import { FLOOR_OFFSET } from '../../game.config'
import { HitBox } from '../HitBox'
import { Cpu } from './Cpu'
import { CpuMover } from './CpuMover'
import { MateyBall } from './MateyBall'

export class Matey extends Cpu {
  override onStart() {
    super.onStart()

    this.walksWhenPrepareAttack = false
    this.attackCoolDown = new CoolDown(17)
    this.attackCoolDown.time = 8
    this.paralyzedCoolDown.interval = 3

    const mover = this.entity.getComponent(CpuMover)
    mover.setSpeed(1.5)
    mover.modeCycle = ['hunt-player-slow']

    mover.directionAccuracy = 0 // accurate

    this.subscribe(this.state.onChanged, (state) => {
      switch (state) {
        case 'prepare_attack': {
          break
        }

        case 'attack': {
          this.level!.screenShake(4, 0.3)

          const shootPositions = [2, 3, 4, 5, 6, 7, 8]
          const random = getRandom(Math.trunc(Math.random() * 777))
          const totalBalls = Math.trunc(random(4, 5))
          for (let i = 0; i < totalBalls; i++) {
            const shootPos = pick(shootPositions, random)
            removeItem(shootPositions, shootPos)
            createDelay(this.entity, i, () => this.shootBall(shootPos))
          }

          this.state.value = 'walk'
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
        if (this.attackCoolDown.update(dt) && !mover.isClimbing()) {
          this.state.value = 'prepare_attack'
          this.attackCoolDown.reset()
        }
      }
    }
  }

  private shootBall(tileX: number) {
    if (this.level) {
      // const mover = this.entity.getComponent(CpuMover)
      const x = tileX * this.level.map.tilewidth
      const ballSize = { width: 16, height: 16 }

      let floorPositions = getFloorPositionsAtX(this.level.walkGrid, x)
      floorPositions.unshift(-ballSize.height)
      floorPositions.push(220)
      floorPositions = floorPositions.map((y) => y - FLOOR_OFFSET - ballSize.height)

      const ball = new Entity(this.level.flumpLibrary!.createSprite('matey_ball')).addComponent(
        new LevelComponent(this.level),
        new Bullet('player'),
        new MateyBall(floorPositions),
        new HitBox(0, ballSize.height - 3, ballSize.width, ballSize.height)
      )

      ball.position.x = x
      ball.position.y = floorPositions[0]

      this.level.containers.mid.addEntity(ball)
    }
  }
}
