import { HitBox } from '@/game/components/HitBox'
import { LevelComponent } from '@/game/components/level/LevelComponent'
import { Component } from '@/game/core/Entity'
import { POINTS_PER_3_PICKUPS, POINTS_PER_PICKUP } from '@/game/game.config'
import { getPixGamerNumberFont } from '@/game/display/SimpleText'

export class Pickup extends Component {
  private isPickedUp = false

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

      if (level.gameState.pickupsCollected.value % 3 == 0) {
        level.addScore(this.entity.position, POINTS_PER_3_PICKUPS, 0xffffff, getPixGamerNumberFont())
      } else {
        level.addScore(this.entity.position, POINTS_PER_PICKUP)
      }

      this.entity.destroy()
    }
  }
}
