import type { Entity } from '../../core/Entity'
import { Component } from '../../core/Entity'
import type LevelScene from '@/game/scenes/LevelScene'
import type { InputKey } from './Input'
import { Input } from './Input'

export class MobileInput extends Component {
  private readonly joystickRadius: number = 200 // Configurable radius
  private currentDirection: InputKey | null = null
  private readonly target: Entity
  private joystickButton!: HTMLDivElement
  private actionButton!: HTMLDivElement
  private joystickContainer!: HTMLDivElement
  private startX: number = 0
  private startY: number = 0

  constructor(private readonly level: LevelScene) {
    super()
    this.target = level.player
  }

  override onStart() {
    super.onStart()

    // get size of app
    const appBounds = this.level.sceneManager.app.view.getBoundingClientRect()
    // compare how much this is scaled to the original size
    const scaleX = appBounds.width / 240

    const gameContainer = document.body
    const joystickContainer = document.createElement('div')
    this.joystickContainer = joystickContainer
    gameContainer.style.userSelect = 'none'
    Object.assign(joystickContainer.style, {
      position: 'absolute',
      zIndex: '7',
      bottom: '10rem',
      left: '3.5%',
      width: `${Math.trunc(scaleX * 78)}px`,
      height: `${Math.trunc(scaleX * 82)}px`,
      imageRendering: 'pixelated',
      backgroundImage: 'url("/game/mobile-joystick-back.png")',
      backgroundSize: 'cover'
    })
    gameContainer.append(joystickContainer)

    const joystickButton = document.createElement('div')
    this.joystickButton = joystickButton
    Object.assign(joystickButton.style, {
      position: 'absolute',
      width: `${Math.trunc((39 / 78) * 100)}%`,
      height: `${Math.trunc((39 / 82) * 100)}%`,
      imageRendering: 'pixelated',
      backgroundImage: 'url("/game/mobile-joystick-thumb.png")',
      backgroundSize: 'cover',
      left: '50%',
      top: '50%',
      transform: 'translate(-50%, -50%)'
    })
    joystickContainer.append(joystickButton)

    joystickButton.addEventListener('touchstart', this.onJoystickTouchStart)
    joystickButton.addEventListener('touchmove', this.onJoystickTouchMove)
    joystickButton.addEventListener('touchend', this.onJoystickTouchEnd)

    // Create the action button
    const actionButton = document.createElement('div')
    this.actionButton = actionButton
    Object.assign(actionButton.style, {
      position: 'absolute',
      width: `${Math.trunc(scaleX * 78)}px`,
      height: `${Math.trunc(scaleX * 82)}px`,
      imageRendering: 'pixelated',
      backgroundImage: 'url("/game/mobile-action-button-up.png")',
      backgroundSize: 'cover',
      bottom: '10rem',
      right: '3.5%',
      transform: 'translate(0, 0)',
      cursor: 'pointer'
    })
    gameContainer.append(actionButton)

    actionButton.addEventListener('touchstart', this.onActionButtonTouchStart)
    actionButton.addEventListener('touchend', this.onActionButtonTouchEnd)
    actionButton.addEventListener('touchcancel', this.onActionButtonTouchCancel)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  override onUpdate(_dt: number) {
    const appBounds = this.level.sceneManager.app.view.getBoundingClientRect()
    const scaleX = appBounds.width / 240

    this.joystickContainer.style.width = `${Math.trunc(scaleX * 78)}px`
    this.joystickContainer.style.height = `${Math.trunc(scaleX * 82)}px`
    this.actionButton.style.width = `${Math.trunc(scaleX * 78)}px`
    this.actionButton.style.height = `${Math.trunc(scaleX * 82)}px`
  }

  override destroy() {
    this.joystickButton.removeEventListener('touchstart', this.onJoystickTouchStart)
    this.joystickButton.removeEventListener('touchmove', this.onJoystickTouchMove)
    this.joystickButton.removeEventListener('touchend', this.onJoystickTouchEnd)
    this.actionButton.removeEventListener('touchstart', this.onActionButtonTouchStart)
    this.actionButton.removeEventListener('touchend', this.onActionButtonTouchEnd)
    this.actionButton.removeEventListener('touchcancel', this.onActionButtonTouchCancel)

    this.joystickContainer.remove()
    this.actionButton.remove()
  }

  private readonly onJoystickTouchStart = (event: TouchEvent) => {
    const touch = event.touches[0]
    this.startX = touch.clientX
    this.startY = touch.clientY
  }

  private readonly onJoystickTouchMove = (event: TouchEvent) => {
    const touch = event.touches[0]
    const dx = touch.clientX - this.startX
    const dy = touch.clientY - this.startY
    const distance = Math.hypot(dx, dy)

    let clampedDx = dx
    let clampedDy = dy

    if (distance > this.joystickRadius * 0.2) {
      let angle = Math.atan2(dy, dx)
      // Snap angle to nearest cardinal direction
      if (Math.abs(angle) < Math.PI / 4) {
        angle = 0
      } else if (Math.abs(angle) > (3 * Math.PI) / 4) {
        angle = Math.PI
      } else if (angle > 0) {
        angle = Math.PI / 2
      } else {
        angle = -Math.PI / 2
      }

      clampedDx = Math.cos(angle) * this.joystickRadius * 0.3
      clampedDy = Math.sin(angle) * this.joystickRadius * 0.3
    }

    const direction = this.getDirection(clampedDx, clampedDy)
    this.emitDirection(direction)

    this.joystickButton.style.left = `${50 + (clampedDx / this.joystickRadius) * 50}%`
    this.joystickButton.style.top = `${50 + (clampedDy / this.joystickRadius) * 50}%`
    this.joystickButton.style.transform = 'translate(-50%, -50%)'
  }

  private readonly onJoystickTouchEnd = () => {
    this.joystickButton.style.left = '50%'
    this.joystickButton.style.top = '50%'
    this.joystickButton.style.transform = 'translate(-50%, -50%)'
    this.emitDirection(null)
  }

  private readonly onActionButtonTouchStart = () => {
    this.actionButton.style.backgroundImage = 'url("/game/mobile-action-button-down.png")'
    const input = this.target.getComponent(Input)
    input.onDown.emit('action')
  }

  private readonly onActionButtonTouchEnd = () => {
    this.actionButton.style.backgroundImage = 'url("/game/mobile-action-button-up.png")'
    const input = this.target.getComponent(Input)
    input.onUp.emit('action')
  }

  private readonly onActionButtonTouchCancel = () => {
    this.actionButton.style.backgroundImage = 'url("/game/mobile-action-button-up.png")'
  }

  private getDirection(dx: number, dy: number): InputKey | null {
    const absDx = Math.abs(dx)
    const absDy = Math.abs(dy)

    if (absDx < this.joystickRadius * 0.2 && absDy < this.joystickRadius * 0.2) {
      return null
    }

    if (absDx > absDy) {
      return dx > 0 ? 'right' : 'left'
    }
    return dy > 0 ? 'down' : 'up'
  }

  private emitDirection(direction: InputKey | null) {
    if (direction !== this.currentDirection) {
      const input = this.target.getComponent(Input)

      if (this.currentDirection) {
        input.onUp.emit(this.currentDirection)
      }

      if (direction) {
        input.onDown.emit(direction)
      }

      this.currentDirection = direction
    }
  }
}
