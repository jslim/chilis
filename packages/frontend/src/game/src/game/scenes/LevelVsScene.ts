import { Scene } from './Scene'
import type SceneManager from '@/game/src/game/scenes/SceneManager'

export class LevelVsScene extends Scene {
  constructor(
    sceneManager: SceneManager,
    private levelNo: number
  ) {
    super(sceneManager)
  }
  override onStart() {
    super.onStart()

    this.sceneManager.gameController.onShowGameBorder.emit(false)

    const gotoLevel = () => this.sceneManager.showLevel(this.levelNo)

    ;(async () => {
      let levelNo = 1 //this.levelNo
      await this.playVideo(`vs_level_0${levelNo}`, () => gotoLevel())
    })()
  }
}
