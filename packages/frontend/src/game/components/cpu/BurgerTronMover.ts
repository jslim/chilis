import { CpuMover } from './CpuMover'
import { GAME_WIDTH } from '@/game/game.config'
import { pick } from '@/game/utils/random.utils'

const LEFT_X = 40
const RIGHT_X = GAME_WIDTH - 40

export default class BurgerTronMover extends CpuMover {
  private currentSide: 'left' | 'right' = 'left'

  private currentPlatform: number = -1

  private leftFloorPositions!: number[]
  private rightFloorPositions!: number[]

  override onStart() {
    super.onStart()
    const walkGrid = this.level.walkGrid
    this.leftFloorPositions = this.getWalkGridYPositionsAt(LEFT_X)
    this.rightFloorPositions = this.getWalkGridYPositionsAt(RIGHT_X)
  }

  getWalkGridYPositionsAt(x: number): number[] {
    const walkGrid = this.level.walkGrid
    const yPositions = []
    for (let y = 0; y < walkGrid.size; y++) {
      if (walkGrid.grid[y * walkGrid.size + x]) {
        yPositions.push(y)
      }
    }
    return yPositions
  }

  override walk(dt: number) {
    return
    let stepY = 1 //this.speed.y;
    if (this.targetY < this.position.y) {
      stepY = -stepY
    }
    // move to the target y position
    this.position.y += stepY

    // if near target
    if (Math.abs(this.targetY - this.position.y) < 1) {
    }
  }

  pickNewTargetY() {
    if (this.currentSide === 'left') {
      this.currentSide = 'right'
      this.targetX = RIGHT_X
      this.targetY = pick(this.rightFloorPositions)
    } else {
      this.currentSide = 'left'
      this.targetX = LEFT_X
      this.targetY = pick(this.leftFloorPositions)
    }
  }
}
