import type SceneManager from '@/game/src/game/scenes/SceneManager'

import { getWrappedLevelNo } from '@/game/src/game/game.config'

import { Scene } from './Scene'

export class LevelVsScene extends Scene {
  constructor(
    sceneManager: SceneManager,
    private readonly levelNo: number
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
