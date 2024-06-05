import type LevelScene from '@/game/scenes/LevelScene'

import { Component } from '../../core/Entity'

// just reference to LevelScene
export class LevelComponent extends Component {
  constructor(public level: LevelScene) {
    super()
  }

  public clone() {
    return new LevelComponent(this.level)
  }
}
