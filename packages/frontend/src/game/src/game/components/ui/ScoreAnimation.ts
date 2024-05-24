import { Component } from "../../core/Entity.ts";

export class ScoreAnimation extends Component {
  private frame = 0;

  constructor(private moveAfterFrame = 3) {
    super();
  }

  override onStart() {
    super.onStart();
  }

  override onUpdate(dt: number) {
    super.onUpdate(dt);

    if (this.frame++ % this.moveAfterFrame === this.moveAfterFrame - 1)
      this.entity.y -= 1;
  }
}
