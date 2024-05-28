import { Mover } from '../Mover';

import { FlumpAnimator } from '../../flump/FlumpAnimator';
import { Cpu } from './Cpu';
import { FlumpLibrary } from '../../flump/FlumpLibrary';
import { DisposeFunction } from '../../core/Entity';

export class CpuAnimator extends FlumpAnimator {
  constructor(
    library: FlumpLibrary,
    private animationName: string,
    private offsetX: number = 0,
  ) {
    super(library);
  }
  override onStart() {
    super.onStart();

    const cpu = this.entity.getComponent(Cpu);
    this.root.pivot.x = this.offsetX; // visual correction of animation
    const mover = this.entity.getComponent(Mover);

    this.subscribe(mover.currentDirection.onChanged, (direction) => {
      switch (direction) {
        case 'up':
        case 'down':
          this.flipNeutral();
          this.setMovie(`${this.animationName}_climb`).gotoAndPlay(0);
          break;
        case 'left':
          this.setMovie(`${this.animationName}_walk`).play();
          this.flipToLeft();
          break;
        case 'right':
          this.setMovie(`${this.animationName}_walk`).play();
          this.flipToRight();
          break;
      }
    });

    let currentMoviePlayback: DisposeFunction | undefined = undefined;
    this.subscribe(cpu.state.onChanged, (newState) => {
      if (currentMoviePlayback) {
        currentMoviePlayback();
        currentMoviePlayback = undefined;
      }

      switch (newState) {
        case 'walk':
          mover.currentDirection.emit();
          // this.setMovie("player_walk").play();
          break;

        case 'paralyzed':
          this.setMovie(`${this.animationName}_paralyzed`).play();
          break;

        case 'die':
          this.setMovie(`${this.animationName}_die`).gotoAndPlay(0).once();
          break;

        case 'prepare_attack':
          this.setMovie(`${this.animationName}_prepare_attack`).gotoAndPlay(0).once();
          currentMoviePlayback = this.subscribeOnce(this.currentMovie.value!.onEnd, () => {
            cpu.state.value = 'attack';
          });
          break;

        case 'attack':
          this.setMovie(`${this.animationName}_attack`).gotoAndPlay(0).once();
          currentMoviePlayback = this.subscribeOnce(this.currentMovie.value!.onEnd, () => {
            cpu.state.value = 'attack_complete';
          });
          break;

        case 'defeat':
          this.stop();
          break;

        case 'spawn':
          this.setMovie(`${this.animationName}_spawn`).gotoAndStop(0);
      }
    });
    this.setMovie(`${this.animationName}_walk`).gotoAndPlay(0);
  }
}
