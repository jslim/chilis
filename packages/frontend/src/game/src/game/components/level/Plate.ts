import { Component } from '../../core/Entity'
import { LevelComponent } from './LevelComponent'

export class Plate extends Component {
  override onStart() {
    super.onStart()

    const { tilewidth, tileheight } = this.entity.getComponent(LevelComponent).level.map
    this.entity.pivot.set(Math.floor(tilewidth / 2), tileheight)
    this.entity.x += this.entity.pivot.x
    this.entity.y += this.entity.pivot.y
  }
}
