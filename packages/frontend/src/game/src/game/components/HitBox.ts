import { Graphics, Rectangle } from 'pixi.js'

import { Component } from '../core/Entity'
import { Value } from '../core/Value'
import { DRAW_HIT_BOX_DEBUG, FLOOR_OFFSET } from '../game.config'
import { Mover } from './Mover'

export class HitBox extends Component {
  public isActive = new Value<boolean>(true)
  public readonly current: Rectangle
  public hasIntersection: boolean = false

  // a and b are used to avoid creating new objects, they are only used for comparison
  private readonly a: Rectangle = new Rectangle()
  private readonly b: Rectangle = new Rectangle()

  private readonly graphics = new Graphics()

  constructor(x: number, y: number, width: number, height: number) {
    super()
    this.current = new Rectangle(x, y, width, height)
  }

  override onStart() {
    super.onStart()
    if (DRAW_HIT_BOX_DEBUG) {
      this.entity.parent.addChild(this.graphics)
      this.graphics.y -= FLOOR_OFFSET
    }
  }

  override onUpdate(dt: number) {
    super.onUpdate(dt)
    if (DRAW_HIT_BOX_DEBUG) {
      // @ts-expect-error - entity is private
      const position = this.entity.getComponent(Mover)?.position ?? this.entity.position
      this.graphics.alpha = this.hasIntersection ? 1 : 0.85
      if (!this.isActive) this.graphics.alpha = 0.1
      this.graphics
        .clear()
        .rect(position.x + this.current.x, position.y + this.current.y, this.current.width, this.current.height)
        .fill({ color: this.hasIntersection ? 0xffffff : this.entity.color })
    }
  }

  public intersects(other: HitBox): boolean {
    if (!this.isActive.value || !other.isActive.value) return false
    const a = this.getRect(this.a)
    const b = other.getRect(this.b)
    return (this.hasIntersection = a.intersects(b))
  }

  public getRect(temp = new Rectangle()): Rectangle {
    temp.copyFrom(this.current)
    // @ts-expect-error - entity is private
    const position = this.entity.getComponent(Mover)?.position ?? this.entity.position
    temp.x += position.x
    temp.y += position.y
    return temp
  }

  public contains(x: number, y: number): boolean {
    return this.getRect().contains(x, y)
  }

  override destroy() {
    super.destroy()
    this.graphics.destroy()
  }
}
