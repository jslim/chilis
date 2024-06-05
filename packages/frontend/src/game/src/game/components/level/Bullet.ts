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

  constructor(private readonly objective: 'player' | 'cpu') {
    super()
  }

  override onStart() {
    super.onStart()
    // @ts-expect-error - entity is private
    this.level = this.entity.getComponent(LevelComponent).level
  }

  override onUpdate(_dt: number) {
    super.onUpdate(_dt)

    // @ts-expect-error - entity is private
    const hitBox = this.entity.getComponent(HitBox)

    const targets = this.objective === 'player' ? [this.level.player] : this.level.cpus

    for (const target of targets) {
      // @ts-expect-error - entity is private
      const targetHitBox = target.getComponent(HitBox)
      const isCollided = hitBox.intersects(targetHitBox)

      if (isCollided) {
        switch (this.objective) {
          case 'cpu': {
            // @ts-expect-error - entity is private
            target.getComponent(Cpu).onHitByPepper.emit(this)
            break
          }

          case 'player': {
            // @ts-expect-error - entity is private
            target.getComponent(Player).onHitByBullet.emit(this)
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
