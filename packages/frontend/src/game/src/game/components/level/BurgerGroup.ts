import { Component, Entity } from '../../core/Entity';
import { Burger } from './Burger';
import { Signal } from '../../core/Signal';
import LevelScene from '../../scenes/LevelScene';

export class BurgerGroup extends Component {
  public onBurgerComplete = new Signal();

  constructor(
    public level: LevelScene,
    public burgers: Entity[],
    public plate: Entity,
  ) {
    super();

    for (const entity of burgers) {
      const burger = entity.getComponent(Burger);
      this.subscribe(burger.onComplete, () => {
        let completedBurgers = this.burgers.filter((b) => b.getComponent(Burger).isCompleted);
        if (completedBurgers.length === this.burgers.length) {
          this.onBurgerComplete.emit();
        }
      });
    }
  }
}
