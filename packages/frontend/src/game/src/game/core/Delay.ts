import { CoolDown } from './CoolDown';
import { Component, Entity } from './Entity';

export function createDelay(entity: Entity, time: number, callback: () => void) {
  let delay = new Entity().addComponent(new Delay(time, callback));
  entity.addEntity(delay);
  return delay;
}
export class Delay extends Component {
  private coolDown: CoolDown | undefined;

  constructor(
    time: number,
    private callback: () => void,
  ) {
    super();
    this.coolDown = new CoolDown(time);
  }

  override onUpdate(dt: number) {
    super.onUpdate(dt);
    if (this.coolDown && this.coolDown.update(dt)) {
      this.callback();
      this.entity?.destroy();
      this.coolDown = undefined;
    }
  }
}
