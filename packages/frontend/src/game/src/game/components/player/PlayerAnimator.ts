import { Player } from './Player'
import { Animator, configToLibrary } from '../Animator'
import { Mover } from '../Mover'

export class PlayerAnimator extends Animator {
  constructor() {
    super(
      configToLibrary({
        'player/idle': 19,
        'player/walk': 19,
        'player/climb': 19,
        'player/victory': 19,
        'player/shoot': 40,
        'player/die': 24
      })
    )
  }
  override onStart() {
    super.onStart()

    const player = this.entity.getComponent(Player)
    this.root.pivot.x = -2
    this.root.pivot.y = 3
    const mover = this.entity.getComponent(Mover)

    const shootAnimationSprite = this.animationSprites
      .get('player/shoot')!
      .noLoop()
      .setPivot(40 - 19, 0)
    this.subscribe(shootAnimationSprite.onEnd, () => player.idle())

    const dieAnimationSprite = this.animationSprites
      .get('player/die')!
      .noLoop()
      .setPivot(0, 28 - 19)
    this.subscribe(dieAnimationSprite.onEnd, () => player.onDied.emit())

    this.subscribe(mover.currentDirection.onChanged, (direction) => {
      switch (direction) {
        case 'up':
        case 'down':
          this.flipNeutral()
          this.setMovie('player/climb').play()
          break
        case 'left':
          this.setMovie('player/walk').play()
          this.flipToLeft()
          break
        case 'right':
          this.setMovie('player/walk').play()
          this.flipToRight()
          break
      }
    })

    this.subscribe(player.state.onChanged, (newState) => {
      switch (newState) {
        case 'idle':
          this.setMovie('player/idle').play()
          break

        case 'walk':
          mover.currentDirection.emit()
          // this.setMovie("player/walk").play();
          break

        case 'hit':
          this.stop()
          break

        case 'victory':
          this.setMovie('player/victory').gotoAndPlay(0)
          break

        case 'reset':
          this.stop()
          break

        case 'die':
          this.setMovie('player/die').gotoAndPlay(0)
          break

        case 'shoot':
          this.setMovie('player/shoot').gotoAndPlay(0)
          break
      }
    })
    this.setMovie('player/walk').gotoAndPlay(0)
  }
}
