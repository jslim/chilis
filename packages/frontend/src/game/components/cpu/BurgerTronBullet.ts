import { Component } from '../../core/Entity'
import { GAME_WIDTH } from '../../game.config'

export class BurgerTronBullet extends Component {
  constructor(
    private readonly speedX: number,
    private readonly angle: number
  ) {
    super()
  }

  override onUpdate(dt: number) {
    super.onUpdate(dt)

    this.entity.rotation = -this.angle
    this.entity.scale.x = this.speedX > 0 ? 1 : -1

    this.entity.position.x += Math.sin(Math.PI / 2 + this.angle) * this.speedX
    this.entity.position.y += Math.cos(Math.PI / 2 + this.angle) * this.speedX

    //this.entity.position.x += this.speedX
    if (this.entity.position.x > GAME_WIDTH + 50 || this.entity.position.x < -50) {
      this.entity.destroy()
    }
  }
}
