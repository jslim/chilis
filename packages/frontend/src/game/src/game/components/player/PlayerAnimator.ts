import { FlumpAnimator } from '../../flump/FlumpAnimator'
import { Mover } from '../Mover'
import { Player } from './Player'

export class PlayerAnimator extends FlumpAnimator {
  override onStart() {
    super.onStart()

    const player = this.entity.getComponent(Player)
    this.root.pivot.x = 1 // visual correction of animation

    const mover = this.entity.getComponent(Mover)

    this.subscribe(mover.currentDirection.onChanged, (direction) => {
      switch (direction) {
        case 'up':
        case 'down': {
          this.flipNeutral()
          this.setMovie('player_climb').play()
          break
        }
        case 'left': {
          this.setMovie('player_walk').play()
          this.flipToLeft()
          break
        }
        case 'right': {
          this.setMovie('player_walk').play()
          this.flipToRight()
          break
        }
      }
    })

    this.subscribe(player.state.onChanged, (newState) => {
      switch (newState) {
        case 'idle': {
          this.setMovie('player_idle').play()
          break
        }

        case 'walk': {
          mover.currentDirection.emit()
          // this.setMovie("player_walk").play();
          break
        }

        case 'hit': {
          this.stop()
          break
        }

        case 'victory': {
          this.setMovie('player_victory').gotoAndPlay(0)
          break
        }

        case 'reset': {
          this.stop()
          break
        }

        case 'die': {
          this.setMovie('player_die').gotoAndPlay(0).once()
          this.subscribeOnce(this.currentMovie.value!.onEnd, () => {
            player.onDied.emit()
          })
          break
        }

        case 'shoot': {
          this.setMovie('player_shoot').gotoAndPlay(0).once()
          this.subscribeOnce(this.currentMovie.value!.onEnd, () => {
            player.idle()
          })
          break
        }
      }
    })
    this.setMovie('player_walk').gotoAndPlay(0)
  }
}
