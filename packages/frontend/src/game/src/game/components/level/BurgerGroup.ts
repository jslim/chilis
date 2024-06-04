import type { Entity } from '../../core/Entity'
import { Component } from '../../core/Entity'
import type LevelScene from '../../scenes/LevelScene'
import { Signal } from '../../core/Signal'
import { Burger } from './Burger'

export class BurgerGroup extends Component {
  public isCompleted: boolean = false
  public onBurgerComplete = new Signal()

  constructor(
    public level: LevelScene,
    public burgers: Entity[],
    public plate: Entity
  ) {
    super()
    this.isCompleted = false
    for (const entity of burgers) {
      const burger = entity.getComponent(Burger)
      this.subscribe(burger.onComplete, () => {
        const completedBurgers = this.burgers.filter((b) => b.getComponent(Burger).isCompleted)
        if (completedBurgers.length === this.burgers.length) {
          this.onBurgerComplete.emit()
          this.isCompleted = true
        }
      })
    }
  }
}
