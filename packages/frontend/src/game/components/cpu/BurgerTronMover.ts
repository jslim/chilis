import { GAME_WIDTH } from '@/game/game.config'
import { pick } from '@/game/utils/random.utils'

import { Cpu } from './Cpu'
import { CpuAnimator } from './CpuAnimator'
import { CpuMover } from './CpuMover'

const LEFT_X = 55
const LEFT_OUTSIDE_X = -50
const RIGHT_X = GAME_WIDTH - 35
const RIGHT_OUTSIDE_X = GAME_WIDTH + 50

export default class BurgerTronMover extends CpuMover {
  private currentSide: 'left' | 'right' = 'left'

  private leftFloorPositions!: number[]
  private rightFloorPositions!: number[]
  private flyMode: 'in' | 'out' | 'none' = 'in'

  override onStart() {
    super.onStart()

    this.leftFloorPositions = this.getWalkGridYPositionsAt(LEFT_X)
    this.rightFloorPositions = this.getWalkGridYPositionsAt(RIGHT_X)

    this.subscribe(this.entity.getComponent(Cpu).state.onChanged, (state) => {
      switch (state) {
        case 'walk': {
          this.appear()
          break
        }
        case 'prepare_attack': {
          this.flyMode = 'none'
          break
        }
        case 'attack': {
          this.flyMode = 'none'
          break
        }
        case 'attack_complete': {
          this.flyMode = 'out'
          console.log('out')

          // very hackish, but hey deadlines
          const animator = this.entity.getComponent(CpuAnimator)
          this.subscribeOnce(animator.currentMovie.value!.onEnd, () => {
            animator.setMovie('burgertron_walk')
          })
          break
        }
      }
    })
  }

  appear() {
    this.currentSide = pick(['left', 'right'])
    this.position.x = this.currentSide === 'left' ? LEFT_OUTSIDE_X : RIGHT_OUTSIDE_X
    this.position.y = pick(this.currentSide === 'left' ? this.leftFloorPositions : this.rightFloorPositions)
    this.flyMode = 'in'
  }

  flyIn() {
    switch (this.currentSide) {
      case 'left': {
        this.position.x += this.speed.x
        if (this.position.x >= LEFT_X) {
          this.position.x = LEFT_X
          this.land()
        }
        break
      }
      case 'right': {
        this.position.x -= this.speed.x
        if (this.position.x <= RIGHT_X) {
          this.position.x = RIGHT_X
          this.land()
        }
        break
      }
    }
  }

  flyAway() {
    console.log('fly away', this.currentSide)
    switch (this.currentSide) {
      case 'left': {
        this.position.x -= this.speed.x * 3
        if (this.position.x <= LEFT_OUTSIDE_X) {
          this.position.x = LEFT_OUTSIDE_X
          this.outsideScreen()
        }
        break
      }
      case 'right': {
        this.position.x += this.speed.x * 3
        if (this.position.x >= RIGHT_OUTSIDE_X) {
          this.position.x = RIGHT_OUTSIDE_X
          this.outsideScreen()
        }
        break
      }
    }
  }

  outsideScreen() {
    this.entity.getComponent(Cpu).state.value = 'walk'
  }

  land() {
    this.entity.getComponent(Cpu).state.value = 'prepare_attack'
    this.flyMode = 'none'
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

  override walk() {
    this.currentDirection.value = this.currentSide === 'left' ? 'right' : 'left'
    if (this.flyMode === 'out') {
      this.flyAway()
    } else if (this.flyMode === 'in') {
      this.flyIn()
    }
  }
}
