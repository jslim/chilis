import { Component } from "../core/Entity.ts";
import { CoolDown } from "../utils/CoolDown.ts";

export class AutoDisposer extends Component {
  private coolDown: CoolDown;
  constructor(
    time: number = 0,
    private onBeforeDestroy?: () => void,
  ) {
    super();
    this.coolDown = new CoolDown(time);
  }

  override onUpdate(dt: number) {
    super.onUpdate(dt);

    if (this.coolDown.update(dt)) {
      if (this.onBeforeDestroy) this.onBeforeDestroy();
      this.entity.destroy();
    }
  }
}
