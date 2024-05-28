import { Scene } from './Scene';

export class LevelCompleteScene extends Scene {
  override onStart() {
    const { width: sceneWidth } = this.sceneManager.app.renderer;

    let nextLevelNo = this.gameState.level.value + 1;
    if (nextLevelNo > 6) {
      nextLevelNo = 1;
    }

    this.addButton('WOOP! NEXT LEVEL', [sceneWidth / 2, sceneWidth / 2], () =>
      this.sceneManager.showLevel(nextLevelNo),
    );
  }
}
