import { HitBox } from '@/game/components/HitBox'
import { LevelComponent } from '@/game/components/level/LevelComponent'
import { Component } from '@/game/core/Entity'
import { getPixGamerNumberFont } from '@/game/display/SimpleText'
import { POINTS_PER_3_PICKUPS, POINTS_PER_PICKUP } from '@/game/game.config'

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

      if (level.gameState.pickupsCollected.value % 3 === 0) {
        level.addScore(this.entity.position, POINTS_PER_3_PICKUPS, 0xffffff, getPixGamerNumberFont())
        level.emitAction({ a: '3-for-me', p: POINTS_PER_3_PICKUPS, l: level.gameState.pickupsCollected.value })
      } else {
        level.addScore(this.entity.position, POINTS_PER_PICKUP)
        level.emitAction({ a: '3-for-me', p: POINTS_PER_PICKUP, l: level.gameState.pickupsCollected.value })
      }

      this.entity.destroy()
    }
  }
}
