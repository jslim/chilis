/* eslint-disable react/no-direct-mutation-state */
/* eslint-disable @typescript-eslint/no-unused-vars */
import type LevelScene from '@/game/scenes/LevelScene'

import { Assets, Point, Sprite } from 'pixi.js'

import { CoolDown } from '../../core/CoolDown'
import { createDelay } from '../../core/Delay'
import { Component, Entity } from '../../core/Entity'
import { Signal } from '../../core/Signal'
import { Value } from '../../core/Value'
import { DRAW_STATE_DEBUG, FRAME_RATE } from '../../game.config'
import { AutoDisposer } from '../AutoDisposer'
import { HitBox } from '../HitBox'
// eslint-disable-next-line import/no-cycle
import { Bullet } from '@/game/components/level/Bullet'
import { LevelComponent } from '@/game/components/level/LevelComponent'
import { Mover } from '../Mover'
import { StateDebugText } from '../StateDebugText'

export class Player extends Component {
  public static GOD_MODE = false

  public readonly state = new Value<'idle' | 'walk' | 'shoot' | 'die' | 'hit' | 'victory' | 'reset'>('walk')

  public readonly onReset = new Signal()
  public readonly onHitCpu = new Signal<Entity>()
  public readonly onHitByBullet = new Signal<Bullet>()

  // after player die animation ended
  public readonly onDied = new Signal()

  public idleCoolDown = new CoolDown((1 / FRAME_RATE) * 3)
  private readonly invincibleCoolDown: CoolDown = new CoolDown(1)

  private level: LevelScene | undefined = undefined

  constructor(
    private readonly lives: Value<number>,
    private readonly bullets: Value<number>
  ) {
    super()
  }

  get isInvisible() {
    return !this.invincibleCoolDown.isExpired()
  }

  public get canWalk(): boolean {
    const state = this.state.value
    return state === 'walk' || state === 'idle'
  }

  public get canShoot(): boolean {
    return this.bullets.value > 0
  }

  override onStart() {
    super.onStart()

    this.level = this.entity.getComponent(LevelComponent).level

    if (DRAW_STATE_DEBUG) {
      this.entity.addComponent(new StateDebugText(this.state, [0, 0], this.entity.color))
    }
    this.subscribe(this.lives.onChanged, (newLives) => {
      this.state.value = newLives <= 0 ? 'die' : 'reset'
    })
    this.subscribe(this.state.onChanged, (newState) => {
      switch (newState) {
        case 'idle': {
          break
        }

        case 'walk': {
          break
        }

        case 'hit': {
          break
        }

        case 'victory': {
          break
        }

        case 'reset': {
          this.level?.playSound('player_hit_cpu')
          this.onReset.emit()
          this.entity.alpha = 1

          this.entity.getComponent(Mover).respawn()
          this.idle()
          break
        }

        case 'die': {
          this.level?.playSound('player_die')
          this.entity.alpha = 1
          break
        }

        case 'shoot': {
          this.level?.playSound('player_shoot_pepper')
          this.shootPepper()
          this.bullets.value--
          break
        }
      }
    })

    this.subscribe(this.onHitCpu, (_cpu) => {
      this.reduceLife()
      this.level!.screenShake(4, 0.3)
    })
    this.subscribe(this.onHitByBullet, (bullet) => {
      this.reduceLife()
      bullet.entity.destroy()
    })
  }

  reduceLife() {
    if (!Player.GOD_MODE && !this.isInvisible) {
      if (this.lives.value - 1 <= 0) {
        this.lives.value = 0
      } else {
        this.state.value = 'hit'
      }
    }
    this.invincibleCoolDown.reset()
  }

  override onUpdate(dt: number) {
    super.onUpdate(dt)

    this.invincibleCoolDown.update(dt)

    switch (this.state.value) {
      case 'idle': {
        break
      }

      case 'walk': {
        if (this.idleCoolDown.update(dt)) {
          this.idle()
        }
        break
      }

      case 'hit': {
        this.entity.tint = this.entity.tint !== 0xffffff ? 0xffffff : 0xff0000
        this.entity.alpha -= 0.02
        if (this.entity.alpha <= 0) {
          this.lives.value -= 1
        }
        break
      }

      case 'victory': {
        break
      }

      case 'reset': {
        break
      }
    }
  }

  public idle() {
    this.state.value = 'idle'
  }

  private shootPepper() {
    const pepperSprite = new Sprite(Assets.get('player_pepper'))
    const playerHitBoxRect = this.entity

    const bulletPos = new Point(playerHitBoxRect.x, playerHitBoxRect.y)

    const mover = this.entity.getComponent(Mover)
    const bulletSize = { width: 20, height: 10 }
    const bulletOffset = 13
    if (mover.currentDirection.value === 'left') bulletPos.x -= bulletSize.width + bulletOffset
    else if (mover.currentDirection.value === 'right') bulletPos.x += bulletOffset

    const bullet = new Entity(pepperSprite).addComponent(
      new LevelComponent(this.level!),
      new AutoDisposer(1),
      new Bullet('cpu'),
      new HitBox(0, bulletSize.height, bulletSize.width, bulletSize.height)
    )

    bullet.position.set(bulletPos.x, bulletPos.y - bulletSize.height - 13)

    this.level?.containers.mid.addEntity(bullet)
    bullet.visible = false
    createDelay(this.entity, 0.3, () => {
      bullet.visible = true
    })
  }
}
