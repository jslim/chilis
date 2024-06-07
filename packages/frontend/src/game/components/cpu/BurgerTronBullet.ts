import { Component } from '../../core/Entity'
import { GAME_WIDTH } from '../../game.config'

export class BurgerTronBullet extends Component {
  constructor(private readonly speedX: number) {
    super()
  }

  override onUpdate(dt: number) {
    super.onUpdate(dt)

    this.entity.scale.x = this.speedX > 0 ? 1 : -1

    this.entity.position.x += this.speedX
    if (this.entity.position.x > GAME_WIDTH + 50 || this.entity.position.x < -50) {
      this.entity.destroy()
    }
  }
}
