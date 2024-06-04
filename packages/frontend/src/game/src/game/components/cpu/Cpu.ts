import type LevelScene from '../../scenes/LevelScene'
import type { Bullet } from '../level/Bullet'

import { CoolDown } from '../../core/CoolDown'
import { Component, Entity } from '../../core/Entity'
import { Signal } from '../../core/Signal'
import { Value } from '../../core/Value'
import { DRAW_STATE_DEBUG } from '../../game.config'
import { sortByDistanceTo } from '../../utils/array.utils'
import { lerp } from '../../utils/math.utils'
import { AutoDisposer } from '../AutoDisposer'
import { HitBox } from '../HitBox'
import { LevelComponent } from '../level/LevelComponent'
import { Mover } from '../Mover'
import { Player } from '../player/Player'
import { StateDebugText } from '../StateDebugText'
import { CpuMover } from './CpuMover'
import { Burger } from '@/game/src/game/components/level/Burger'
import { createDelay } from '@/game/src/game/core/Delay'

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
    'walk' | 'paralyzed' | 'die' | 'spawn' | 'defeat' | 'prepare_attack' | 'attack' | 'attack_complete'
  >('walk')

  public readonly onHitPlayer = new Signal<Entity>()
  public readonly onHitByPepper = new Signal<Bullet>()
  public readonly onHitByBurger = new Signal<Burger>()

  protected level: LevelScene | undefined = undefined
  protected walksWhenPrepareAttack = true

  protected attackCoolDown = new CoolDown(1.5)
  protected paralyzedCoolDown = new CoolDown(2)
  protected dieCoolDown = new CoolDown(6)

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
      hitBox.isActive.value = newState === 'walk' || newState === 'prepare_attack' || newState === 'attack'

      switch (newState) {
        case 'spawn': {
          this.entity.alpha = 0
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
          this.attackCoolDown.reset()
          createDelay(this.entity, 0.1, () => (this.state.value = 'walk'))
          break
        }
      }
    })

    this.subscribe(this.onHitPlayer, (player) => {
      player.getComponent(Player).onHitCpu.emit(this.entity)
    })
    this.subscribe(this.onHitByBurger, (burger) => {
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

      case 'paralyzed': {
        this.entity.alpha = lerp(0.5, 1, this.paralyzedCoolDown.progress)
        if (this.paralyzedCoolDown.update(dt)) {
          this.paralyzedCoolDown.reset()
          this.state.value = 'walk'
        }
        break
      }

      case 'die': {
        if (this.dieCoolDown.update(dt)) {
          this.state.value = 'spawn'
          this.respawn()
        }
        break
      }

      case 'spawn': {
        if (this.entity.alpha < 1) {
          this.entity.alpha += 0.03
        } else {
          this.state.value = 'walk'
        }
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

  private checkCollision() {
    const { player } = this.level!
    const hitBox = this.entity.getComponent(HitBox)
    // check if hits player
    if (hitBox.intersects(player.getComponent(HitBox))) {
      this.onHitPlayer.emit(player)
    }
  }

  public reset() {
    const mover = this.entity.getComponent(CpuMover)
    mover.reset()

    this.state.value = 'spawn'
    mover.respawn(mover.startPosition)
  }
}
