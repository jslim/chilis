import { Scene } from './Scene'

export class EndScene extends Scene {
  override onStart() {
    const { width: sceneWidth } = this.sceneManager.app.renderer

    this.addButton('YOU DIED. RESTART?', [sceneWidth / 2, sceneWidth / 2], () => this.sceneManager.intro())
  }
}
