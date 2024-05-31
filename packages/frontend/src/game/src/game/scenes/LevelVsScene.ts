import { Scene } from './Scene'
import { GAME_HEIGHT, GAME_WIDTH } from '@/game/src/game/game.config'
import type SceneManager from '@/game/src/game/scenes/SceneManager'

export class LevelVsScene extends Scene {
  constructor(
    sceneManager: SceneManager,
    private levelNo: number
  ) {
    super(sceneManager)
  }
  override onStart() {
    const gotoLevel = () => this.sceneManager.showLevel(this.levelNo)

    ;(async () => {
      let levelNo = 1 //this.levelNo
      await this.playVideo(`vs_level_0${levelNo}`, () => gotoLevel())
      this.addButton('SKIP', [GAME_WIDTH - 40, GAME_HEIGHT - 20], () => gotoLevel())
    })()
  }
}
