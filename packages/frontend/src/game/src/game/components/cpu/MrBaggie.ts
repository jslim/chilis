import { Cpu } from './Cpu';
import { CpuMover } from './CpuMover';
import { Entity } from '../../core/Entity';
import { AutoDisposer } from '../AutoDisposer';
import { Bullet } from '../level/Bullet';
import { HitBox } from '../HitBox';
import { LevelComponent } from '../level/LevelComponent';
import { Point } from 'pixi.js';
import { getOppositeDirection, Mover } from '../Mover';
import { createDelay } from '../../core/Delay';

export class MrBaggie extends Cpu {
  override onStart() {
    super.onStart();

    this.paralyzedCoolDown.interval = 3.0;

    let mover = this.entity.getComponent(CpuMover);
    mover.setSpeed(1.5);
    mover.modeCycle = ['random'];

    mover.directionAccuracy = 1;

    this.subscribe(this.state.onChanged, (state) => {
      switch (state) {
        case 'prepare_attack':
          break;

        case 'attack':
          if (this.level) {
            this.level!.screenShake(4, 0.3);
            const playerHitBoxRect = this.entity;

            const bulletPos = new Point(playerHitBoxRect.x, playerHitBoxRect.y);
            const mover = this.entity.getComponent(Mover);
            const bulletSize = { width: 20, height: 10 };
            const bulletOffset = 0;
            if (mover.currentDirection.value === 'left')
              bulletPos.x -= bulletSize.width + bulletOffset;
            else if (mover.currentDirection.value === 'right') bulletPos.x += bulletOffset;

            const bullet = new Entity(
              this.level.flumpLibrary!.createSprite('matey_ball'),
            ).addComponent(
              new LevelComponent(this.level!),
              new AutoDisposer(0.4),
              new Bullet('player'),
              new HitBox(0, bulletSize.height, bulletSize.width, bulletSize.height),
            );

            bullet.position.set(bulletPos.x, bulletPos.y - bulletSize.height - 13);

            createDelay(this.entity, 0.3, () => {
              this.level?.containers.mid.addEntity(bullet);
            });

            mover.currentDirection.value = getOppositeDirection(mover.currentDirection.value);
          }
          break;
      }
    });
  }

  override onUpdate(dt: number) {
    super.onUpdate(dt);

    const mover = this.entity.getComponent(CpuMover);
    switch (this.state.value) {
      case 'walk':
        if (!mover.isClimbing() && this.attackCoolDown.update(dt)) {
          this.state.value = 'prepare_attack';
          this.attackCoolDown.reset();
        }
    }
  }
}
