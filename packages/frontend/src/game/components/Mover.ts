import type LevelScene from '@/game/scenes/LevelScene'

import { Point } from 'pixi.js'

import { LevelComponent } from '@/game/components/level/LevelComponent'
// eslint-disable-next-line import/no-cycle
import { canMove, canMoveTo } from '@/game/utils/grid.utils'

import { Component } from '../core/Entity'
import { Value } from '../core/Value'
import { FLOOR_OFFSET } from '../game.config'

export type Direction = 'up' | 'down' | 'left' | 'right'
export type MoveDirection = Direction | ''

export function getOppositeDirection(direction: MoveDirection): MoveDirection {
  switch (direction) {
    case 'up': {
      return 'down'
    }
    case 'down': {
      return 'up'
    }
    case 'left': {
      return 'right'
    }
    case 'right': {
      return 'left'
    }
    default: {
      return ''
    }
  }
}

export class Mover extends Component {
  public readonly currentDirection = new Value<MoveDirection>('')
  // float position, actual owner position is rounded in onUpdate
  public startPosition = new Point(0, 0)
  public prevPosition = new Point(0, 0)
  public position = new Point(0, 0)
  public speed = new Point(0, 0)

  public directionX = 0
  public directionY = 0

  protected level!: LevelScene

  constructor(speed: number = 1) {
    super()
    this.setSpeed(speed)
  }

  public get hasMoved(): boolean {
    return !this.isEqual(this.prevPosition.x, this.position.x) || !this.isEqual(this.prevPosition.y, this.position.y)
  }

  get canMoveSideways(): boolean {
    const canMoveLeft = canMove(this.position.x, this.position.y, -1, 0, this.level)
    const canMoveRight = canMove(this.position.x, this.position.y, 1, 0, this.level)
    return canMoveLeft || canMoveRight
  }

  public setSpeed(speed: number) {
    this.speed.x = speed
    this.speed.y = this.speed.x / 1.72
  }

  override onStart() {
    super.onStart()

    this.level = this.entity.getComponent(LevelComponent).level

    this.position.copyFrom(this.entity.position)
    this.prevPosition.copyFrom(this.entity.position)

    const { tilewidth, tileheight } = this.level.map
    //this.entity.pivot.set(Math.floor(tilewidth / 2), tileheight);
    this.position.x += Math.floor(tilewidth / 2)
    this.position.y += tileheight
    this.entity.pivot.y += FLOOR_OFFSET //  to stand on floor

    // snap owner position to closest on walk grid
    this.position.x = Math.floor(this.position.x)
    this.position.y = Math.floor(this.position.y)

    this.startPosition.copyFrom(this.position)

    this.subscribe(this.currentDirection.onChanged, (direction) => {
      if (direction === 'up') this.directionY = -1
      else if (direction === 'down') this.directionY = 1
      else this.directionY = 0

      if (direction === 'left') this.directionX = -1
      else if (direction === 'right') this.directionX = 1
      // else this.directionX = 0; // dont use this
    })
  }

  public respawn(spawnPosition: Point | null = null) {
    this.position.copyFrom(spawnPosition ?? this.startPosition)
  }

  public isEqual(posA: number, posB: number) {
    return Math.floor(posA * 10) === Math.floor(posB * 10)
  }

  public left() {
    const oldX = this.position.x
    if (canMoveTo(this.position.x - this.speed.x, this.position.y, this.level)) {
      this.position.x -= this.speed.x
    }
    const hasMoved = !this.isEqual(oldX, this.position.x)
    if (hasMoved) {
      this.currentDirection.value = 'left'
    }
    return hasMoved
  }

  public right() {
    const oldX = this.position.x
    if (canMoveTo(this.position.x + this.speed.x, this.position.y, this.level)) {
      this.position.x += this.speed.x
    }
    const hasMoved = !this.isEqual(oldX, this.position.x)
    if (hasMoved) {
      this.currentDirection.value = 'right'
    }
    return hasMoved
  }

  public up() {
    const oldY = this.position.y
    if (canMove(this.position.x, this.position.y, 0, -this.speed.y, this.level)) {
      this.position.y -= this.speed.y
    }

    const hasMoved = !this.isEqual(oldY, this.position.y)
    if (hasMoved) {
      this.currentDirection.value = 'up'
    }

    return hasMoved
  }

  public down() {
    const oldY = this.position.y
    if (canMove(this.position.x, this.position.y, 0, this.speed.y, this.level)) {
      this.position.y += this.speed.y
    }

    const hasMoved = !this.isEqual(oldY, this.position.y)
    if (hasMoved) {
      this.currentDirection.value = 'down'
    }
    return hasMoved
  }

  override onUpdate(dt: number) {
    super.onUpdate(dt)

    this.prevPosition.copyFrom(this.entity.position)
    this.prevPosition.copyFrom(this.entity.position)

    this.entity.x = Math.floor(this.position.x)
    this.entity.y = Math.floor(this.position.y)
  }
}
