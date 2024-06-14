/* eslint-disable react/no-direct-mutation-state */

/* eslint-disable import/no-cycle */
import type { Bullet } from '@/game/components/level/Bullet'
import type { Burger } from '@/game/components/level/Burger'
import type LevelScene from '@/game/scenes/LevelScene'

import { LevelComponent } from '@/game/components/level/LevelComponent'
import { Player } from '@/game/components/player/Player'
import { sortByDistanceTo } from '@/game/utils/array.utils'
import { clamp01, lerp, lerpColor } from '@/game/utils/math.utils'

import { CoolDown } from '../../core/CoolDown'
import { Component, Entity } from '../../core/Entity'
import { Signal } from '../../core/Signal'
import { Value } from '../../core/Value'
import { DRAW_STATE_DEBUG } from '../../game.config'
import { AutoDisposer } from '../AutoDisposer'
import { HitBox } from '../HitBox'
import { Mover } from '../Mover'
import { StateDebugText } from '../StateDebugText'
import { CpuMover } from './CpuMover'

export type CpuName =
  | 'trainee01'
  | 'trainee02'
  | 'trainee03'
  | 'piggles'
  | 'mrbaggie'
  | 'zapp'
  | 'matey'
  | 'dino'
  | 'burgertron'

export class Cpu extends Component {
  public readonly state = new Value<
    | 'walk'
    | 'paralyzed'
    | 'die'
    | 'dead'
    | 'spawn'
    | 'defeat'
    | 'prepare_attack'
    | 'attack'
    | 'attack_complete'
    | 'jump'
  >('walk')

  public readonly onHitPlayer = new Signal<Entity>()
  public readonly onHitByPepper = new Signal<Bullet>()
  public readonly onHitByBurger = new Signal<Burger>()
  public autoCompleteAttack = true

  protected level: LevelScene | undefined = undefined
  protected walksWhenPrepareAttack = true
  protected respawnAfterDied = true

  protected attackCoolDown = new CoolDown(1.5)
  protected paralyzedCoolDown = new CoolDown(2)
  protected dieCoolDown = new CoolDown(6)

  private spawnProcess: number = 0

  constructor(public name: CpuName = 'trainee01') {
    super()
  }

  override onStart() {
    super.onStart()

    this.level = this.entity.getComponent(LevelComponent).level
    const mover = this.entity.getComponent(CpuMover)
    const hitBox = this.entity.getComponent(HitBox)

    if (DRAW_STATE_DEBUG) {
      this.entity.addComponent(new StateDebugText(mover.mode, [0, 0], this.entity.color))

      this.entity.addEntity(new Entity().addComponent(new StateDebugText(this.state, [-8, 6])))
    }

    this.subscribe(this.state.onChanged, (newState) => {
      hitBox.isActive.value =
        newState === 'walk' || newState === 'prepare_attack' || newState === 'attack' || newState === 'jump'

      switch (newState) {
        case 'spawn': {
          this.spawnProcess = 0
          break
        }

        case 'walk': {
          break
        }

        case 'paralyzed': {
          this.attackCoolDown.reset()
          break
        }

        case 'die': {
          if (!this.respawnAfterDied) {
            this.state.value = 'dead'
          }
          break
        }

        case 'defeat': {
          break
        }

        case 'prepare_attack': {
          this.attackCoolDown.reset()
          break
        }

        case 'attack': {
          this.attackCoolDown.reset()
          break
        }

        case 'attack_complete': {
          if (this.autoCompleteAttack) {
            this.attackCoolDown.reset()
            this.state.value = 'walk'
          }
          break
        }
      }
    })

    this.subscribe(this.onHitPlayer, (player) => {
      player.getComponent(Player).onHitCpu.emit(this.entity)
    })
    this.subscribe(this.onHitByBurger, () => {
      this.state.value = 'die'
    })
    this.subscribe(this.onHitByPepper, (bullet) => {
      this.state.value = 'paralyzed'
      bullet.entity.addComponent(new AutoDisposer())
    })
    this.state.value = 'spawn'
  }

  override onUpdate(dt: number) {
    super.onUpdate(dt)

    const mover = this.entity.getComponent(CpuMover)

    switch (this.state.value) {
      case 'prepare_attack': {
        if (this.walksWhenPrepareAttack) {
          mover.walk(dt)
          this.checkCollision()
          this.entity.scale.x = mover.directionX > 0 ? 1 : -1
        }
        break
      }
      case 'walk': {
        mover.walk(dt)
        this.checkCollision()
        this.entity.scale.x = mover.directionX > 0 ? 1 : -1
        break
      }

      case 'jump': {
        this.checkCollision()
        this.entity.scale.x = mover.directionX > 0 ? 1 : -1
        break
      }

      case 'attack_complete': {
        mover.walk(dt)
        break
      }

      case 'paralyzed': {
        this.entity.alpha = lerp(0.5, 1, this.paralyzedCoolDown.progress)
        if (this.paralyzedCoolDown.update(dt)) {
          this.paralyzedCoolDown.reset()
          this.state.value = 'walk'
        }
        break
      }

      case 'die': {
        if (this.dieCoolDown.update(dt) && this.respawnAfterDied) {
          this.state.value = 'spawn'
          this.respawn()
        }
        break
      }

      case 'spawn': {
        // lerp tint from black to original color using this.spawnProcess

        if (this.spawnProcess < 1) {
          this.spawnProcess += 0.03
        } else {
          this.spawnProcess = 1
          this.state.value = 'walk'
        }
        this.entity.tint = lerpColor(0x000000, 0xffffff, clamp01(this.spawnProcess))
        break
      }
    }
  }

  respawn() {
    const { player, cpus } = this.level!
    // find position the furthest from player
    const spawnPosition = cpus

      .map((cpu: Entity) => cpu.getComponent(Mover).startPosition)
      .sort(sortByDistanceTo(player))
      .pop()

    this.entity.getComponent(Mover).respawn(spawnPosition)
  }

  public reset() {
    if (this.state.value !== 'dead') {
      const mover = this.entity.getComponent(CpuMover)
      mover.reset()

      this.state.value = 'spawn'
      mover.respawn(mover.startPosition)
    }
  }

  private checkCollision() {
    const { player } = this.level!

    const hitBox = this.entity.getComponent(HitBox)
    // check if hits player

    if (hitBox.intersects(player.getComponent(HitBox))) {
      this.onHitPlayer.emit(player)
    }
  }
}
