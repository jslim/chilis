import { Component, Entity } from "../../core/Entity.ts";
import { Value } from "../../core/Value.ts";
import { CoolDown } from "../../utils/CoolDown.ts";
import { Signal } from "../../core/Signal.ts";
import { Mover } from "../Mover.ts";
import { DRAW_STATE_DEBUG, FRAME_RATE } from "../../game.config.ts";
import { StateDebugText } from "../StateDebugText.ts";
import { HitBox } from "../HitBox.ts";
import { Bullet } from "../level/Bullet.ts";
import { Assets, Point, Sprite } from "pixi.js";
import { LevelComponent } from "../level/LevelComponent.ts";
import { AutoDisposer } from "../AutoDisposer.ts";

export class Player extends Component {
  public static GOD_MODE = false;

  public readonly state = new Value<
    "idle" | "walk" | "shoot" | "die" | "hit" | "victory" | "reset"
  >("walk");

  public readonly onReset = new Signal();
  public readonly onHitCpu = new Signal<Entity>();
  public readonly onHitByBullet = new Signal<Bullet>();

  // after player die animation ended
  public readonly onDied = new Signal();

  public idleCoolDown = new CoolDown((1 / FRAME_RATE) * 3);
  private invincibleCoolDown: CoolDown = new CoolDown(1.0);

  constructor(
    private lives: Value<number>,
    private bullets: Value<number>,
  ) {
    super();
  }
  override onStart() {
    super.onStart();

    if (DRAW_STATE_DEBUG) {
      this.entity.addComponent(
        new StateDebugText(this.state, [0, 0], this.entity.color),
      );
    }
    this.subscribe(this.lives.onChanged, (newLives) => {
      if (newLives <= 0) {
        this.state.value = "die";
      } else {
        this.state.value = "reset";
      }
    });
    this.subscribe(this.state.onChanged, (newState) => {
      switch (newState) {
        case "idle":
          break;

        case "walk":
          break;

        case "hit":
          break;

        case "victory":
          break;

        case "reset":
          this.onReset.emit();
          this.entity.alpha = 1;
          this.entity.getComponent(Mover).respawn();
          this.idle();
          break;

        case "die":
          this.entity.alpha = 1;
          break;

        case "shoot":
          this.shootPepper();
          this.bullets.value--;
          break;
      }
    });

    this.subscribe(this.onHitCpu, (_cpu) => this.reduceLife());
    this.subscribe(this.onHitByBullet, (bullet) => {
      this.reduceLife();
      bullet.entity.addComponent(new AutoDisposer());
    });
  }

  reduceLife() {
    if (!Player.GOD_MODE) {
      if (!this.isInvisible) {
        if (this.lives.value - 1 <= 0) {
          this.lives.value = 0;
        } else {
          this.state.value = "hit";
        }
      }
    }
    this.invincibleCoolDown.reset();
  }
  get isInvisible() {
    return !this.invincibleCoolDown.isExpired();
  }

  override onUpdate(dt: number) {
    super.onUpdate(dt);

    this.invincibleCoolDown.update(dt);

    switch (this.state.value) {
      case "idle":
        break;

      case "walk":
        if (this.idleCoolDown.update(dt)) {
          this.idle();
        }
        break;

      case "hit":
        this.entity.tint = this.entity.tint !== 0xffffff ? 0xffffff : 0xff0000;
        this.entity.alpha -= 0.02;
        if (this.entity.alpha <= 0) {
          this.lives.value -= 1;
        }
        break;

      case "victory":
        break;

      case "reset":
        break;
    }
  }

  public get canWalk(): boolean {
    const state = this.state.value;
    return state === "walk" || state === "idle";
  }

  public get canShoot(): boolean {
    return this.bullets.value > 0;
  }

  public idle() {
    this.state.value = "idle";
  }

  private shootPepper() {
    const pepperSprite = new Sprite(Assets.get("player_pepper"));
    const levelComponent = this.entity.getComponent(LevelComponent);
    const playerHitBoxRect = this.entity;

    const bulletPos = new Point(playerHitBoxRect.x, playerHitBoxRect.y);
    const mover = this.entity.getComponent(Mover);
    const bulletSize = { width: 20, height: 10 };
    const bulletOffset = 5;
    if (mover.currentDirection.value === "left")
      bulletPos.x -= bulletSize.width + bulletOffset;
    else if (mover.currentDirection.value === "right")
      bulletPos.x += bulletOffset;

    const bullet = new Entity(pepperSprite).addComponent(
      levelComponent.clone(),
      new AutoDisposer(1),
      new Bullet("cpu"),
      new HitBox(0, 0, bulletSize.width, bulletSize.height),
    );

    bullet.position.set(bulletPos.x, bulletPos.y - bulletSize.height - 13);

    levelComponent.level.containers.mid.addEntity(bullet);
  }
}
