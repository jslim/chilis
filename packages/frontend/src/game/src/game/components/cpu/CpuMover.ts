/* eslint-disable unicorn/consistent-destructuring */

import type { Entity } from '../../core/Entity'
import type { RandomFunction } from '../../utils/random.utils'

import { Graphics } from 'pixi.js'

import { CoolDown } from '../../core/CoolDown'
import { Value } from '../../core/Value'
import { DRAW_CPU_DEBUG } from '../../game.config'
import { sortByDistanceTo } from '../../utils/array.utils'
import { getMoveDirections } from '../../utils/grid.utils'
import { getRandom, pick } from '../../utils/random.utils'
import { HitBox } from '../HitBox'
// eslint-disable-next-line import/no-cycle
import { Burger } from '../level/Burger'
import { Mover } from '../Mover'

const modes = ['random', 'hunt-player', 'hunt-player-slow', 'hunt-burger', 'hunt-cpu', 'stairs'] as const

export class CpuMover extends Mover {
  public readonly mode = new Value<(typeof modes)[number]>('random')
  public targetX = 0
  public targetY = 0
  public directionAccuracy = 1 // 0=accurate, 1=sometimes takes second best direction
  public random!: RandomFunction
  public modeCycle: (typeof modes)[number][] = [
    'hunt-player',
    'hunt-player-slow',
    'stairs',
    'hunt-player',
    'hunt-player-slow',
    'hunt-burger',
    'hunt-player-slow',
    'hunt-player',
    'random'
  ]

  private modeId = 0
  private readonly debugGraphics = new Graphics()

  private targetEntity: Entity | undefined = undefined
  private nextModeCooldown: CoolDown | undefined = undefined

  constructor(
    public cpuId: number,
    speed: number = 1
  ) {
    super(speed)
    this.reset()
  }

  override onStart() {
    super.onStart()

    if (DRAW_CPU_DEBUG) {
      this.entity.addChild(this.debugGraphics)
      this.debugGraphics.x = this.entity.pivot.x
      this.debugGraphics.y = this.entity.pivot.y
    }

    this.subscribe(this.mode.onChanged, (newMode) => {
      this.targetEntity = undefined
      this.nextModeCooldown = undefined
      switch (newMode) {
        case 'hunt-burger': {
          // find closest to player burger (in idle state)
          const burgerToHunt = this.level.burgers
            // @ts-expect-error - entity is private
            .filter((burger) => burger.getComponent(Burger).isIdle)
            .sort(sortByDistanceTo(this.level.player))
            .shift()
          if (burgerToHunt) {
            this.targetX = burgerToHunt.x
            this.targetY = burgerToHunt.y
          } else {
            this.nextMode()
          }
          break
        }
        case 'hunt-player-slow': {
          this.targetX = this.level.player.x + this.random(-20, 20)
          this.targetY = this.level.player.y + this.random(-20, 20)
          this.nextModeCooldown = new CoolDown(20)
          break
        }

        case 'hunt-cpu': {
          this.targetEntity = pick(
            // @ts-expect-error - entity is private
            this.level.cpus.filter((cpu) => cpu.getComponent(HitBox).isActive),
            this.random
          )
          this.nextModeCooldown = new CoolDown(4.5)
          break
        }

        case 'hunt-player': {
          this.targetEntity = this.level.player
          this.nextModeCooldown = new CoolDown(7.5)
          break
        }

        case 'random': {
          this.nextModeCooldown = new CoolDown(5)
          break
        }

        case 'stairs': {
          break
        }
      }
    })
    this.nextMode()
  }

  public walk(dt: number) {
    const cpuX = Math.floor(this.position.x)
    const cpuY = Math.floor(this.position.y)

    const directions = getMoveDirections(this.entity.position, this.level, this.currentDirection.value)

    if (directions.length > 0) {
      let newDirection

      // pick direction that is towards player
      //let player = this.level.player;
      //let playerX = Math.floor(player.x);
      //let playerY = Math.floor(player.y);
      //let dx = cpuX - playerX;
      //let dy = cpuY - playerY;
      //let distance = Math.hypot(dx, dy);

      let { targetX, targetY } = this

      // let playerMover = player.getComponent(Mover)!;

      switch (this.mode.value) {
        case 'random': {
          newDirection = pick(directions, this.random)
          targetX = newDirection === 'left' ? cpuX - 10 : newDirection === 'right' ? cpuX + 10 : cpuX
          targetY = newDirection === 'up' ? cpuY - 10 : newDirection === 'down' ? cpuY + 10 : cpuY
          break
        }

        case 'stairs': {
          // prefer up/down
          if (directions.includes('up')) {
            newDirection = 'up'
          } else if (directions.includes('down')) {
            newDirection = 'down'
          } else {
            this.nextMode()
          }
          targetX = newDirection === 'left' ? cpuX - 10 : newDirection === 'right' ? cpuX + 10 : cpuX
          targetY = newDirection === 'up' ? cpuY - 10 : newDirection === 'down' ? cpuY + 10 : cpuY
          break
        }

        case 'hunt-player':
        case 'hunt-cpu': {
          targetX = this.targetEntity!.x
          targetY = this.targetEntity!.y
        }

        // fall through
        case 'hunt-player-slow':
        case 'hunt-burger': {
          // find direction that is closest to target
          const directionsSorted = this.findClosestToTarget(directions, cpuX, cpuY, targetX, targetY)

          newDirection =
            directionsSorted[Math.round(this.random(0, this.directionAccuracy)) % directionsSorted.length]!.dir

          // if in range, pick another mode
          if (Math.hypot(cpuX - targetX, cpuY - targetY) < 16) {
            this.nextMode()
          }
          break
        }
      }
      /*
      if (this.cpuId === 1) {
        targetX += playerMover.directionX * 8;
        targetY += playerMover.directionY * 8;
      }
      if (this.cpuId === 2) {
        targetX += playerMover.directionX * 32 * (distance < 64 ? -1 : 1);
        //targetY += playerMover.directionY * 32 * (distance < 64 ? -1 : 1);
      }
*/
      //if (this.targetX !== 0) {
      this.debugGraphics
        .clear()
        .moveTo(cpuX - this.position.x, cpuY - this.position.y)
        .lineTo(targetX - this.position.x, targetY - this.position.y)
        .stroke({ width: 1, color: this.entity.color })
      // }

      // move in new direction
      // @ts-expect-error - entity is private
      const mover = this.entity.getComponent(Mover)!
      switch (newDirection) {
        case 'left': {
          mover.left()

          break
        }
        case 'right': {
          mover.right()

          break
        }
        case 'up': {
          mover.up()

          break
        }
        case 'down': {
          mover.down()

          break
        }
        // No default
      }
    } else {
      // move in opposite direction if no other way to go
      const currentDirection = this.currentDirection.value
      switch (currentDirection) {
        case 'left': {
          this.right()

          break
        }
        case 'right': {
          this.left()

          break
        }
        case 'up': {
          this.down()

          break
        }
        case 'down': {
          this.up()

          break
        }
        // No default
      }
    }

    if (this.nextModeCooldown && this.nextModeCooldown.update(dt)) {
      this.nextMode()
    }
  }

  public isClimbing(): boolean {
    return this.currentDirection.value === 'up' || this.currentDirection.value === 'down'
  }

  public reset() {
    this.random = getRandom(this.cpuId)
    this.modeId = this.cpuId
  }

  private nextMode() {
    const oldMode = this.mode.value
    this.mode.value = this.modeCycle[this.modeId++ % this.modeCycle.length]
    if (oldMode === this.mode.value) {
      this.mode.emit()
    }
  }

  private findClosestToTarget(directions: string[], cpuX: number, cpuY: number, targetX: number, targetY: number) {
    return (
      directions
        // eslint-disable-next-line array-callback-return
        .map((dir) => {
          switch (dir) {
            case 'left': {
              return {
                distance: Math.hypot(cpuX - targetX - 24, cpuY - targetY),
                dir
              }
            }
            case 'right': {
              return {
                distance: Math.hypot(cpuX - targetX + 24, cpuY - targetY),
                dir
              }
            }
            case 'up': {
              return {
                distance: Math.hypot(cpuX - targetX, cpuY - targetY - 16),
                dir
              }
            }
            case 'down': {
              return {
                distance: Math.hypot(cpuX - targetX, cpuY - targetY + 16),
                dir
              }
            }
          }
        })
        .sort((a, b) => a!.distance - b!.distance)
    )
  }
}
