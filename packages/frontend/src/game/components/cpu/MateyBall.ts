import { Component } from '../../core/Entity'
import Tween from '../../core/Tween'
import { FRAME_RATE } from '../../game.config'
import { quintIn01 } from '@/game/utils/Ease01'
import { LevelComponent } from '@/game/components/level/LevelComponent'

export class MateyBall extends Component {
  //public floorPositions = [60, 80, 100, 120, 150, 180, 260];
  private readonly tween = new Tween<number>(0)

  constructor(
    private readonly floorPositions: number[]
    // private speed: number,
  ) {
    super()
  }

  override onStart() {
    super.onStart()

    this.tween.to(this.entity.y, 0)

    this.tweenToNextFloor()
  }

  override onUpdate(dt: number) {
    super.onUpdate(dt)
    this.tween.update(dt)
    //if (this.tween) console.log(this.tween.progress);
  }

  private tweenToFloor(toY: number) {
    // const distance = Math.abs(this.entity.y - toY);
    const duration = 1 //distance / this.speed;

    this.tween.to(
      toY,
      duration,
      (v) => {
        this.entity.y = v
      },
      () => {
        this.tweenToNextFloor()
      },
      quintIn01
    )
  }

  private tweenToNextFloor() {
    const nextFloor = this.floorPositions.shift()
    if (nextFloor !== undefined) {
      this.entity.getComponent(LevelComponent).level.screenShake(2, 3 / FRAME_RATE)
      this.tweenToFloor(nextFloor)
    } else {
      this.entity.destroy()
    }
  }
}
