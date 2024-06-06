import type { DisposeFunction } from '../../core/Entity'
import type { FlumpLibrary } from '../../flump/FlumpLibrary'

import { FlumpAnimator } from '../../flump/FlumpAnimator'
import { Mover } from '../Mover'
import { Cpu } from './Cpu'

export class CpuAnimator extends FlumpAnimator {
  constructor(
    library: FlumpLibrary,
    private readonly animationName: string,
    private readonly offsetX: number = 0
  ) {
    super(library)
  }

  override onStart() {
    super.onStart()

    const cpu = this.entity.getComponent(Cpu)
    this.root.pivot.x = this.offsetX // visual correction of animation

    const mover = this.entity.getComponent(Mover)

    this.subscribe(mover.currentDirection.onChanged, (direction) => {
      switch (direction) {
        case 'up':
        case 'down': {
          this.flipNeutral()
          if (cpu.state.value === 'walk') {
            this.setMovie(`${this.animationName}_climb`).gotoAndPlay(0)
          }
          break
        }
        case 'left': {
          if (cpu.state.value === 'walk') {
            this.setMovie(`${this.animationName}_walk`).play()
          }
          this.flipToLeft()
          break
        }
        case 'right': {
          if (cpu.state.value === 'walk') {
            this.setMovie(`${this.animationName}_walk`).play()
          }
          this.flipToRight()
          break
        }
      }
    })

    let currentMoviePlayback: DisposeFunction | undefined
    this.subscribe(cpu.state.onChanged, (newState) => {
      if (currentMoviePlayback) {
        currentMoviePlayback()
        currentMoviePlayback = undefined
      }

      switch (newState) {
        case 'walk': {
          mover.currentDirection.emit()
          // this.setMovie("player_walk").play();
          break
        }

        case 'paralyzed': {
          this.setMovie(`${this.animationName}_paralyzed`).gotoAndPlay(0)
          break
        }

        case 'die': {
          this.setMovie(`${this.animationName}_die`).gotoAndPlay(0).once()
          break
        }

        case 'prepare_attack': {
          this.setMovie(`${this.animationName}_prepare_attack`).gotoAndPlay(1).once()
          currentMoviePlayback = this.subscribeOnce(this.currentMovie.value!.onEnd, () => {
            cpu.state.value = 'attack'
          })
          break
        }

        case 'attack': {
          this.setMovie(`${this.animationName}_attack`).gotoAndPlay(0).once()
          currentMoviePlayback = this.subscribeOnce(this.currentMovie.value!.onEnd, () => {
            cpu.state.value = 'attack_complete'
          })
          break
        }

        case 'jump': {
          this.setMovie(`${this.animationName}_jump`).gotoAndPlay(0).once()
          currentMoviePlayback = this.subscribeOnce(this.currentMovie.value!.onEnd, () => {
            cpu.state.value = 'walk'
          })
          break
        }

        case 'defeat': {
          this.stop()
          break
        }

        case 'spawn': {
          this.setMovie(`${this.animationName}_walk`).gotoAndStop(0)
          this.setMovie(`${this.animationName}_spawn`).gotoAndStop(0)
          break
        }
      }
    })
    this.setMovie(`${this.animationName}_walk`).gotoAndPlay(0)
  }
}
