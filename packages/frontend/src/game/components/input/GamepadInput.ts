import { Component } from '../../core/Entity'
import { Input } from './Input'

export class GamepadInput extends Component {
  override onStart() {
    super.onStart()
    window.addEventListener('gamepadconnected', this.onGamepadConnected)
    window.addEventListener('gamepaddisconnected', this.onGamepadDisconnected)
  }

  onGamepadConnected(event: GamepadEvent) {
    console.log(
      `Gamepad connected at index ${event.gamepad.index}: ${event.gamepad.id}. ${event.gamepad.buttons.length} buttons, ${event.gamepad.axes.length} axes.`
    )
  }

  onGamepadDisconnected(event: GamepadEvent) {
    console.log(`Gamepad disconnected from index ${event.gamepad.index}: ${event.gamepad.id}`)
  }

  override onUpdate(dt: number) {
    super.onUpdate(dt)
    this.pollGamepad()
  }

  pollGamepad() {
    // Only use the first gamepad
    const gamepad = navigator.getGamepads()[0]
    if (!gamepad) return

    const input = this.entity.getComponent(Input)
    if (!input) return

    // D-Pad buttons are usually mapped to buttons[12] (up), buttons[13] (down), buttons[14] (left), buttons[15] (right)
    let upPressed = gamepad.buttons[12]?.pressed ?? false
    let downPressed = gamepad.buttons[13]?.pressed ?? false
    let leftPressed = gamepad.buttons[14]?.pressed ?? false
    let rightPressed = gamepad.buttons[15]?.pressed ?? false
    const leftStickX = gamepad.axes[0]
    const leftStickY = gamepad.axes[1]
    // map angle to upPressed/downPressed/leftPressed/rightPressed
    const angle = Math.atan2(leftStickY, leftStickX)
    // get direction from angle
    if (Math.abs(angle) < Math.PI / 4) {
      if (Math.abs(gamepad.axes[0]) > 0.1) rightPressed = true
    } else if (Math.abs(angle) > (3 * Math.PI) / 4) {
      if (Math.abs(gamepad.axes[0]) > 0.1) leftPressed = true
    } else if (angle > 0) {
      if (Math.abs(gamepad.axes[1]) > 0.1) downPressed = true
    } else if (Math.abs(gamepad.axes[1]) > 0.1) upPressed = true

    // action button
    const actionPressed =
      gamepad.buttons[4]?.pressed ||
      gamepad.buttons[5]?.pressed ||
      gamepad.buttons[6]?.pressed ||
      gamepad.buttons[7]?.pressed ||
      false

    // directly write in map
    input.map.set('up', upPressed)
    input.map.set('down', downPressed)
    input.map.set('left', leftPressed)
    input.map.set('right', rightPressed)
    input.map.set('action', actionPressed)
  }

  override destroy() {
    super.destroy()
    window.removeEventListener('gamepadconnected', this.onGamepadConnected)
    window.removeEventListener('gamepaddisconnected', this.onGamepadDisconnected)
  }
}
