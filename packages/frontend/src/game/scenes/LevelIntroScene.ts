import type SceneManager from '@/game/scenes/SceneManager'

import { GAME_HEIGHT, GAME_WIDTH } from '@/game/game.config'

import { Scene } from './Scene'

export class LevelIntroScene extends Scene {
  constructor(
    sceneManager: SceneManager,
    private readonly levelNo: number
  ) {
    super(sceneManager)
  }
  override onStart() {
    super.onStart()

    this.sceneManager.gameController.onShowGameBorder.emit(false)

    const gotoLevel = () => this.sceneManager.showLevelVsScene(this.levelNo)

    ;(async () => {
      const levelNo = 1 //this.levelNo
      await this.playVideo(`cutscene_level_0${levelNo}`, () => gotoLevel())
      this.addButton('SKIP', [GAME_WIDTH - 40, GAME_HEIGHT - 20], () => gotoLevel())
    })()
  }
}
