import { Component } from '../../core/Entity'
import LevelScene from '../../scenes/LevelScene'

// just reference to LevelScene
export class LevelComponent extends Component {
  constructor(public level: LevelScene) {
    super()
  }

  public clone() {
    return new LevelComponent(this.level)
  }
}
