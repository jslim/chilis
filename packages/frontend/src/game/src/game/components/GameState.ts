import { Component } from '../core/Entity'
import { Value } from '../core/Value'

export class GameState extends Component {
  public readonly level = new Value<number>(1)
  public readonly score = new Value<number>(0)
  public readonly highScore = new Value<number>(0)
  public readonly bullets = new Value<number>(3)
  public readonly lives = new Value<number>(3)

  constructor() {
    super()

    this.highScore.value = parseInt(localStorage.getItem('highScore') || '0')

    this.subscribe(this.score.onChanged, (newScore) => {
      if (newScore > this.highScore.value) {
        this.highScore.value = newScore
      }
    })

    this.subscribe(this.highScore.onChanged, (highScore) => {
      try {
        localStorage.setItem('highScore', highScore.toString())
      } catch (_) {}
    })
  }

  setLevel(levelNo: number) {
    this.level.value = levelNo
    // reset the game state
    this.lives.value = 3
    this.bullets.value = 3
    this.score.value = 0
  }
}
