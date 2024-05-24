import { Component } from "../../core/Entity.ts";
import { LevelComponent } from "./LevelComponent.ts";

export class Plate extends Component {
  constructor() {
    super();
  }

  override onStart() {
    super.onStart();

    const level = this.entity.getComponent(LevelComponent).level;
    const { tilewidth, tileheight } = level.map;
    this.entity.pivot.set(Math.floor(tilewidth / 2), tileheight);
    this.entity.x += this.entity.pivot.x;
    this.entity.y += this.entity.pivot.y;
  }
}
