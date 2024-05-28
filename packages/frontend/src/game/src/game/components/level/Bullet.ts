import { Component, Entity } from '../../core/Entity';
import { HitBox } from '../HitBox';
import { LevelComponent } from './LevelComponent';
import LevelScene from '../../scenes/LevelScene';
import { Signal } from '../../core/Signal';
import { Cpu } from '../cpu/Cpu';
import { Player } from '../player/Player';

export class Bullet extends Component {
  private onHit = new Signal<Entity>();
  private level!: LevelScene;

  constructor(private objective: 'player' | 'cpu') {
    super();
  }

  override onStart() {
    super.onStart();
    this.level = this.entity.getComponent(LevelComponent).level;
  }

  override onUpdate(_dt: number) {
    super.onUpdate(_dt);

    const hitBox = this.entity.getComponent(HitBox);

    const targets = this.objective === 'player' ? [this.level.player] : this.level.cpus;

    for (const target of targets) {
      const targetHitBox = target.getComponent(HitBox);
      const isCollided = hitBox.intersects(targetHitBox);

      if (isCollided) {
        switch (this.objective) {
          case 'cpu':
            target.getComponent(Cpu).onHitByBullet.emit(this);
            break;

          case 'player':
            target.getComponent(Player).onHitByBullet.emit(this);
            break;
        }

        this.onHit.emit(target);
        // disable bullet hitBox
        hitBox.isActive.value = false;
      }
    }
  }
}
