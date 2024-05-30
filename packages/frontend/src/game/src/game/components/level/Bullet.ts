import type { Entity } from '../../core/Entity'
import { Component } from '../../core/Entity'
import type LevelScene from '../../scenes/LevelScene'
import { Signal } from '../../core/Signal'
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
    this.level = this.entity.getComponent(LevelComponent).level
  }

  override onUpdate(_dt: number) {
    super.onUpdate(_dt)

    const hitBox = this.entity.getComponent(HitBox)

    const targets = this.objective === 'player' ? [this.level.player] : this.level.cpus

    for (const target of targets) {
      const targetHitBox = target.getComponent(HitBox)
      const isCollided = hitBox.intersects(targetHitBox)

      if (isCollided) {
        switch (this.objective) {
          case 'cpu': {
            target.getComponent(Cpu).onHitByPepper.emit(this)
            break
          }

          case 'player': {
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
