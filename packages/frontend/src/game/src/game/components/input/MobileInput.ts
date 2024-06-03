import type { Entity } from '../../core/Entity'
import { Component } from '../../core/Entity'
import LevelScene from '../../scenes/LevelScene'
import type { InputKey } from './Input'
import { Input } from './Input'

export class MobileInput extends Component {
  private joystickRadius: number = 200 // Configurable radius
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
    let appBounds = this.level.sceneManager.app.view.getBoundingClientRect()
    // compare how much this is scaled to the original size
    let scaleX = appBounds.width / 240

    const gameContainer = document.body
    const joystickContainer = document.createElement('div')
    this.joystickContainer = joystickContainer
    gameContainer.style.userSelect = 'none'
    Object.assign(joystickContainer.style, {
      position: 'absolute',
      zIndex: '10',
      bottom: '10rem',
      left: '3.5%',
      width: `${(scaleX * 78) | 0}px`,
      height: `${(scaleX * 82) | 0}px`,
      imageRendering: 'pixelated',
      backgroundImage: 'url("/game/mobile-joystick-back.png")',
      backgroundSize: 'cover'
    })
    gameContainer.append(joystickContainer)

    const joystickButton = document.createElement('div')
    this.joystickButton = joystickButton
    Object.assign(joystickButton.style, {
      position: 'absolute',
      width: `${((39 / 78) * 100) | 0}%`,
      height: `${((39 / 82) * 100) | 0}%`,
      imageRendering: 'pixelated',
      backgroundImage: 'url("/game/mobile-joystick-thumb.png")',
      backgroundSize: 'cover',
      left: '50%',
      top: '50%',
      transform: 'translate(-50%, -50%)'
    })
    joystickContainer.append(joystickButton)

    joystickButton.addEventListener('pointerdown', this.onJoystickPointerDown)
    joystickButton.addEventListener('pointermove', this.onJoystickPointerMove)
    joystickButton.addEventListener('pointerup', this.onJoystickPointerUp)

    // Create the action button
    const actionButton = document.createElement('div')
    this.actionButton = actionButton
    Object.assign(actionButton.style, {
      position: 'absolute',
      width: `${(scaleX * 78) | 0}px`,
      height: `${(scaleX * 82) | 0}px`,
      imageRendering: 'pixelated',
      backgroundImage: 'url("/game/mobile-action-button-up.png")',
      backgroundSize: 'cover',
      bottom: '10rem',
      right: '3.5%',
      transform: 'translate(0, 0)',
      cursor: 'pointer'
    })
    gameContainer.append(actionButton)

    actionButton.addEventListener('pointerdown', this.onActionButtonPointerDown)
    actionButton.addEventListener('pointerup', this.onActionButtonPointerUp)
    actionButton.addEventListener('pointerout', this.onActionButtonPointerOut)
  }

  private onJoystickPointerDown = (event: PointerEvent) => {
    this.startX = event.clientX
    this.startY = event.clientY
    this.joystickButton.setPointerCapture(event.pointerId)
  }

  private onJoystickPointerMove = (event: PointerEvent) => {
    if (event.pressure === 0) return

    const dx = event.clientX - this.startX
    const dy = event.clientY - this.startY
    const distance = Math.sqrt(dx * dx + dy * dy)

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

  private onJoystickPointerUp = () => {
    this.joystickButton.style.left = '50%'
    this.joystickButton.style.top = '50%'
    this.joystickButton.style.transform = 'translate(-50%, -50%)'
    this.emitDirection(null)
  }

  private onActionButtonPointerDown = () => {
    this.actionButton.style.backgroundImage = 'url("/game/mobile-action-button-down.png")'
    const input = this.target.getComponent(Input)
    input.onDown.emit('action')
  }

  private onActionButtonPointerUp = () => {
    this.actionButton.style.backgroundImage = 'url("/game/mobile-action-button-up.png")'
    const input = this.target.getComponent(Input)
    input.onUp.emit('action')
  }

  private onActionButtonPointerOut = () => {
    this.actionButton.style.backgroundImage = 'url("/game/mobile-action-button-up.png")'
  }

  override onUpdate(dt: number) {
    let appBounds = this.level.sceneManager.app.view.getBoundingClientRect()
    let scaleX = appBounds.width / 240

    this.joystickContainer.style.width = `${(scaleX * 78) | 0}px`
    this.joystickContainer.style.height = `${(scaleX * 82) | 0}px`
    this.actionButton.style.width = `${(scaleX * 78) | 0}px`
    this.actionButton.style.height = `${(scaleX * 82) | 0}px`
  }

  override destroy() {
    this.joystickButton.removeEventListener('pointerdown', this.onJoystickPointerDown)
    this.joystickButton.removeEventListener('pointermove', this.onJoystickPointerMove)
    this.joystickButton.removeEventListener('pointerup', this.onJoystickPointerUp)
    this.actionButton.removeEventListener('pointerdown', this.onActionButtonPointerDown)
    this.actionButton.removeEventListener('pointerup', this.onActionButtonPointerUp)
    this.actionButton.removeEventListener('pointerout', this.onActionButtonPointerOut)

    this.joystickContainer.remove()
    this.actionButton.remove()
  }

  private getDirection(dx: number, dy: number): InputKey | null {
    const absDx = Math.abs(dx)
    const absDy = Math.abs(dy)

    if (absDx < this.joystickRadius * 0.2 && absDy < this.joystickRadius * 0.2) {
      return null
    }

    if (absDx > absDy) {
      return dx > 0 ? 'right' : 'left'
    } else {
      return dy > 0 ? 'down' : 'up'
    }
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
