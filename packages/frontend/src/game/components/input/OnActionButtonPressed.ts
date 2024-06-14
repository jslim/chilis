import { GamepadInput } from '@/game/components/input/GamepadInput'
import { Input } from '@/game/components/input/Input'
import { KeyboardInput } from '@/game/components/input/KeyboardInput'
import { Component } from '@/game/core/Entity'

export class OnActionButtonPressed extends Component {
  private isPressed = false
  constructor(
    private readonly onActionButtonPressed: () => void,
    private readonly once: boolean = true
  ) {
    super()
  }
  override onStart() {
    super.onStart()
    this.entity.addComponent(new Input(), new GamepadInput(), new KeyboardInput())
  }

  override onUpdate(_dt: number) {
    super.onUpdate(_dt)

    if (!this.isPressed && this.entity.getComponent(Input).isDown('action')) {
      this.onActionButtonPressed()
      if (this.once && this.entity) this.entity.destroy()
      this.isPressed = true
    }
  }
}
