import type LevelScene from '@/game/scenes/LevelScene'

import { FlumpAnimator } from '@/game/flump/FlumpAnimator'

import { Component, Entity } from '../../core/Entity'
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
    for (const entity of burgers) {
      const burger = entity.getComponent(Burger)
      this.subscribeOnce(burger.onComplete, () => {
        const completedBurgers = this.burgers.filter((b) => b.getComponent(Burger).isCompleted)
        if (completedBurgers.length === this.burgers.length) {
          this.onBurgerComplete.emit()
          this.isCompleted = true
        }
      })
    }

    this.subscribeOnce(this.onBurgerComplete, () => {
      for (const entity of burgers) {
        // hide all burger parts
        entity.visible = false

        // show the completed burger animation
        const burgerCompleteAnimator = new FlumpAnimator(this.level.flumpLibrary)
        burgerCompleteAnimator.setMovie('burger_complete').gotoAndPlay(0).once()

        const burgerCompleteEntity = new Entity().addComponent(burgerCompleteAnimator)
        burgerCompleteEntity.position.copyFrom(plate.position)
        burgerCompleteEntity.y -= 19
        burgerCompleteEntity.x += 3

        this.level.containers.front.addEntity(burgerCompleteEntity)
      }
    })
  }
}
