import { Component } from '../core/Entity'
import { Value } from '../core/Value'

export class GameState extends Component {
  public readonly level = new Value<number>(1)
  public readonly score = new Value<number>(0)
  public readonly highScore = new Value<number>(0)
  public readonly pickupsCollected = new Value<number>(0)
  public readonly bullets = new Value<number>(3)
  public readonly lives = new Value<number>(3)
  public readonly burgerCompleteCombo = new Value<number>(0)

  constructor() {
    super()

    // if score > 100_000, add a life
    let previousScore = 0
    this.subscribe(this.score.onChanged, (newScore) => {
      if (newScore > 100_000 && previousScore <= 100_000) {
        this.lives.value++
      }
      previousScore = newScore
    })
  }

  setLevel(levelNo: number, score = 0) {
    this.level.value = levelNo
    // reset the game state
    this.bullets.value = 3
    this.score.value = score
    if (levelNo === 1) {
      this.lives.value = 3
      this.burgerCompleteCombo.value = 0
      this.pickupsCollected.value = 0
    }
  }

  public getValues() {
    return {
      lives: this.lives.value,
      bullets: this.bullets.value,
      level: this.level.value, // level number (1 based)
      score: this.score.value,
      highScore: this.highScore.value
    }
  }
}

export type GameStateValues = ReturnType<GameState['getValues']>
