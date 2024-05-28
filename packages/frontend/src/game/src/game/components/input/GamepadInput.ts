import { Component } from '../../core/Entity';
import { Input } from './Input';

export class GamepadInput extends Component {
  override onStart() {
    super.onStart();
    window.addEventListener('gamepadconnected', this.onGamepadConnected.bind(this));
    window.addEventListener('gamepaddisconnected', this.onGamepadDisconnected.bind(this));
  }

  onGamepadConnected(event: GamepadEvent) {
    console.log(
      `Gamepad connected at index ${event.gamepad.index}: ${event.gamepad.id}. ${event.gamepad.buttons.length} buttons, ${event.gamepad.axes.length} axes.`,
    );
  }

  onGamepadDisconnected(event: GamepadEvent) {
    console.log(`Gamepad disconnected from index ${event.gamepad.index}: ${event.gamepad.id}`);
  }

  override onUpdate(dt: number) {
    super.onUpdate(dt);
    this.pollGamepad();
  }

  pollGamepad() {
    // Only use the first gamepad
    const gamepad = navigator.getGamepads()[0];
    if (!gamepad) return;

    const input = this.entity.getComponent(Input);
    if (!input) return;

    // D-Pad buttons are usually mapped to buttons[12] (up), buttons[13] (down), buttons[14] (left), buttons[15] (right)
    const upPressed = gamepad.buttons[12]?.pressed ?? false;
    const downPressed = gamepad.buttons[13]?.pressed ?? false;
    const leftPressed = gamepad.buttons[14]?.pressed ?? false;
    const rightPressed = gamepad.buttons[15]?.pressed ?? false;

    // directly write in map
    input.map.set('up', upPressed);
    input.map.set('down', downPressed);
    input.map.set('left', leftPressed);
    input.map.set('right', rightPressed);
  }

  override destroy() {
    super.destroy();
    window.removeEventListener('gamepadconnected', this.onGamepadConnected);
    window.removeEventListener('gamepaddisconnected', this.onGamepadDisconnected);
  }
}
