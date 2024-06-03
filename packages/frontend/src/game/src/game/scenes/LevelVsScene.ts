import { Scene } from './Scene'
import type SceneManager from '@/game/src/game/scenes/SceneManager'
import { getWrappedLevelNo } from '@/game/src/game/game.config'

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
      await this.playVideo(`vs_level_0${getWrappedLevelNo(this.levelNo)}`, () => gotoLevel())
    })()
  }
}
