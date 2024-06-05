import { HitBox } from '@/game/src/game/components/HitBox'
import { LevelComponent } from '@/game/src/game/components/level/LevelComponent'
import { Component } from '@/game/src/game/core/Entity'

export class Pickup extends Component {
  private isPickedUp = false

  override onStart() {
    super.onStart()
  }

  override onUpdate(dt: number) {
    super.onUpdate(dt)

    // @ts-expect-error - entity is private
    const level = this.entity.getComponent(LevelComponent).level
    // @ts-expect-error - entity is private
    const pickupHitBox = this.entity.getComponent(HitBox)
    // @ts-expect-error - entity is private
    const playerHitBox = level.player.getComponent(HitBox)

    if (!this.isPickedUp && pickupHitBox.intersects(playerHitBox)) {
      this.isPickedUp = true

      level.gameState.pickupsCollected.value++

      this.entity.destroy()
    }
  }
}
