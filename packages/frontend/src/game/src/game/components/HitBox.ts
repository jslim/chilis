import { Component } from '../core/Entity';
import { Graphics, Rectangle } from 'pixi.js';
import { Mover } from './Mover';
import { DRAW_HIT_BOX_DEBUG, FLOOR_OFFSET } from '../game.config';
import { Value } from '../core/Value';

export class HitBox extends Component {
  public isActive = new Value<boolean>(true);

  // a and b are used to avoid creating new objects, they are only used for comparison
  private a: Rectangle = new Rectangle();
  private b: Rectangle = new Rectangle();

  public readonly current: Rectangle;

  private graphics = new Graphics();
  public hasIntersection: boolean = false;

  constructor(x: number, y: number, width: number, height: number) {
    super();
    this.current = new Rectangle(x, y, width, height);
  }

  override onStart() {
    super.onStart();
    if (DRAW_HIT_BOX_DEBUG) {
      this.entity.parent.addChild(this.graphics);
      this.graphics.alpha = 0.85;
      this.graphics.y -= FLOOR_OFFSET;
    }
  }

  override onUpdate(dt: number) {
    super.onUpdate(dt);

    if (DRAW_HIT_BOX_DEBUG) {
      const position = this.entity.getComponent(Mover)?.position ?? this.entity.position;

      this.graphics.alpha = this.hasIntersection ? 1 : 0.85;
      this.graphics
        .clear()
        .rect(
          position.x + this.current.x,
          position.y + this.current.y,
          this.current.width,
          this.current.height,
        )
        .fill({ color: this.hasIntersection ? 0xffffff : this.entity.color });
    }
  }

  public intersects(other: HitBox): boolean {
    if (!this.isActive.value || !other.isActive.value) return false;
    let a = this.getRect(this.a);
    let b = other.getRect(this.b);
    return (this.hasIntersection = a.intersects(b));
  }

  public getRect(temp = new Rectangle()): Rectangle {
    temp.copyFrom(this.current);
    let position = this.entity.getComponent(Mover)?.position ?? this.entity.position;
    temp.x += position.x;
    temp.y += position.y;
    return temp;
  }

  public contains(x: number, y: number): boolean {
    return this.getRect().contains(x, y);
  }

  override destroy() {
    super.destroy();
    this.graphics.destroy();
  }
}
