import { Component } from '@/game/src/game/core/Entity'
import { HitBox } from '@/game/src/game/components/HitBox'
import { LevelComponent } from '@/game/src/game/components/level/LevelComponent'

export class Pickup extends Component {
  private isPickedUp = false
  constructor() {
    super()
  }

  override onStart() {
    super.onStart()
  }

  override onUpdate(dt: number) {
    super.onUpdate(dt)

    const level = this.entity.getComponent(LevelComponent).level
    const pickupHitBox = this.entity.getComponent(HitBox)
    const playerHitBox = level.player.getComponent(HitBox)

    if (!this.isPickedUp && pickupHitBox.intersects(playerHitBox)) {
      this.isPickedUp = true

      level.gameState.pickupsCollected.value++

      this.entity.destroy()
    }
  }
}
