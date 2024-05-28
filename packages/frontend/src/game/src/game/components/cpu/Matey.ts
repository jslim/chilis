import { CoolDown } from '../../core/CoolDown'
import { Entity } from '../../core/Entity'
import { FLOOR_OFFSET } from '../../game.config'
import { getFloorPositionsAtX } from '../../utils/grid.utils'
import { HitBox } from '../HitBox'
import { Bullet } from '../level/Bullet'
import { LevelComponent } from '../level/LevelComponent'
import { Cpu } from './Cpu'
import { CpuMover } from './CpuMover'
import { MateyBall } from './MateyBall'

export class Matey extends Cpu {
  override onStart() {
    super.onStart()

    this.attackCoolDown = new CoolDown(8)
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
          this.shootBall()
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
        if (!mover.isClimbing() && this.attackCoolDown.update(dt)) {
          this.state.value = 'prepare_attack'
          this.attackCoolDown.reset()
        }
      }
    }
  }

  private shootBall() {
    if (this.level) {
      const mover = this.entity.getComponent(CpuMover)
      const tileX = [4, 5, 6, 7, 8][Math.floor(mover.random() * 3)]
      const x = tileX * this.level.map.tilewidth
      const ballSize = { width: 14, height: 14 }

      let floorPositions = getFloorPositionsAtX(this.level.walkGrid, x)
      floorPositions.push(240 + ballSize.height)
      floorPositions = floorPositions.map((y) => y - FLOOR_OFFSET)

      const ball = new Entity(this.level.flumpLibrary!.createSprite('matey_ball')).addComponent(
        new LevelComponent(this.level),
        new Bullet('player'),
        new MateyBall(floorPositions),
        new HitBox(-ballSize.width / 2, 0, ballSize.width, ballSize.height)
      )

      ball.position.x = x
      ball.position.y = 0

      this.level.containers.mid.addEntity(ball)
    }
  }
}
