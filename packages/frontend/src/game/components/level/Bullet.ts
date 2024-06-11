import type { Entity } from '../../core/Entity'
import type LevelScene from '../../scenes/LevelScene'

import { Component } from '../../core/Entity'
import { Signal } from '../../core/Signal'
// eslint-disable-next-line import/no-cycle
import { Cpu } from '../cpu/Cpu'
import { HitBox } from '../HitBox'
import { Player } from '../player/Player'
import { LevelComponent } from './LevelComponent'

export class Bullet extends Component {
  private readonly onHit = new Signal<Entity>()
  private level!: LevelScene

  constructor(private readonly objective: 'player' | 'cpu' | 'player_speed') {
    super()
  }

  override onStart() {
    super.onStart()
    this.level = this.entity.getComponent(LevelComponent).level
  }

  override onUpdate(_dt: number) {
    super.onUpdate(_dt)

    const hitBox = this.entity.getComponent(HitBox)

    const targets = this.objective.includes('player') ? [this.level.player] : this.level.cpus

    for (const target of targets) {
      const targetHitBox = target.getComponent(HitBox)
      const isCollided = hitBox.intersects(targetHitBox)

      if (isCollided) {
        switch (this.objective) {
          case 'cpu': {
            this.level.playSound('pepper_hit_cpu')
            target.getComponent(Cpu).onHitByPepper.emit(this)
            break
          }

          case 'player': {
            this.level.playSound('cpu_die')
            target.getComponent(Player).onHitByBullet.emit(this)
            break
          }

          case 'player_speed': {
            target.getComponent(Player).onHitByGrease.emit(this)
            break
          }
        }

        this.onHit.emit(target)
        // disable bullet hitBox
        hitBox.isActive.value = false
      }
    }
  }
}
