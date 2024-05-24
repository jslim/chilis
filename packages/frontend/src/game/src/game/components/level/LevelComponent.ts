import { Component } from "../../core/Entity.ts";
import LevelScene from "../../scenes/LevelScene.ts";

// just reference to LevelScene
export class LevelComponent extends Component {
  constructor(public level: LevelScene) {
    super();
  }

  public clone() {
    return new LevelComponent(this.level);
  }
}
