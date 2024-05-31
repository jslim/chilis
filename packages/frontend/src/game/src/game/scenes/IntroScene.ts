import { Scene } from './Scene'

export class IntroScene extends Scene {
  override onStart() {
    const { width: sceneWidth } = this.sceneManager.app.renderer

    let y = 20
    for (let level = 1; level <= 6; level++) {
      this.addButton(`LEVEL ${level}`, [sceneWidth / 2, (y += 20)], () => this.gotoLevel(level))
    }
  }

  private async gotoLevel(level: number) {
    this.sceneManager.showLevelIntro(level)

    try {
      //this.sceneManager.app.renderer.canvas.parentElement?.requestFullscreen();
    } catch {
      console.log("Please don't buy an iphone")
    }
  }
}
