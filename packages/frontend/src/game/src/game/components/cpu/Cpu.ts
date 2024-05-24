import { Component, Entity } from "../../core/Entity.ts";
import { CpuMover } from "./CpuMover.ts";
import { Value } from "../../core/Value.ts";
import { CoolDown } from "../../utils/CoolDown.ts";
import { LevelComponent } from "../level/LevelComponent.ts";
import { HitBox } from "../HitBox.ts";
import { DRAW_STATE_DEBUG } from "../../game.config.ts";
import { StateDebugText } from "../StateDebugText.ts";
import { Player } from "../player/Player.ts";
import { Signal } from "../../core/Signal.ts";
import { Mover } from "../Mover.ts";
import { sortByDistanceTo } from "../../utils/array.utils.ts";
import { Bullet } from "../level/Bullet.ts";
import { AutoDisposer } from "../AutoDisposer.ts";
import { lerp } from "../../utils/math.utils.ts";

export class Cpu extends Component {
  public readonly state = new Value<
    "walk" | "paralyzed" | "die" | "spawn" | "defeat"
  >("walk");
  public readonly onHitPlayer = new Signal<Entity>();
  public readonly onHitByBullet = new Signal<Bullet>();

  private paralyzedCoolDown = new CoolDown(2.0);
  private dieCoolDown = new CoolDown(2.0);

  constructor() {
    super();
  }

  override onStart() {
    super.onStart();

    const mover = this.entity.getComponent(CpuMover);
    const hitBox = this.entity.getComponent(HitBox);

    if (DRAW_STATE_DEBUG) {
      this.entity.addComponent(
        new StateDebugText(mover.mode, [0, 0], this.entity.color),
      );
      this.entity.addEntity(
        new Entity().addComponent(new StateDebugText(this.state, [-8, 6])),
      );
    }

    this.entity.alpha = 0;
    this.state.value = "spawn";
    this.subscribe(this.state.onChanged, (newState) => {
      hitBox.isActive.value = newState === "walk";

      switch (newState) {
        case "spawn":
          this.entity.alpha = 0;
          break;

        case "walk":
          this.entity.alpha = 1;
          break;

        case "paralyzed":
          this.entity.alpha = 0.5;
          break;

        case "die":
          this.entity.alpha = 0.5;
          break;

        case "defeat":
          this.entity.alpha = 1;
          break;
      }
    });

    this.subscribe(this.onHitPlayer, (player) => {
      player.getComponent(Player).onHitCpu.emit(this.entity);
    });
    this.subscribe(this.onHitByBullet, (bullet) => {
      this.state.value = "paralyzed";
      bullet.entity.addComponent(new AutoDisposer());
    });
  }

  override onUpdate(dt: number) {
    super.onUpdate(dt);

    const mover = this.entity.getComponent(CpuMover);

    switch (this.state.value) {
      case "walk":
        mover.walk(dt);
        this.checkCollision();
        this.entity.scale.x = mover.directionX;
        break;

      case "paralyzed":
        this.entity.alpha = lerp(0.5, 1, this.paralyzedCoolDown.progress);
        if (this.paralyzedCoolDown.update(dt)) {
          this.paralyzedCoolDown.reset();
          this.state.value = "walk";
        }
        break;

      case "die":
        if (this.dieCoolDown.update(dt)) {
          this.state.value = "spawn";
          this.respawn();
        }
        break;

      case "spawn":
        if (this.entity.alpha < 1.0) {
          this.entity.alpha += 0.05;
        } else {
          this.state.value = "walk";
        }
        break;
    }
  }

  respawn() {
    let { player, cpus } = this.entity.getComponent(LevelComponent).level;
    // find position the furthest from player
    let spawnPosition = cpus
      .map((cpu: Entity) => cpu.getComponent(Mover).startPosition)
      .sort(sortByDistanceTo(player))
      .pop();
    this.entity.getComponent(Mover).respawn(spawnPosition);
  }

  private checkCollision() {
    const { player } = this.entity.getComponent(LevelComponent).level;
    const hitBox = this.entity.getComponent(HitBox);
    // check if hits player
    if (hitBox.intersects(player.getComponent(HitBox))) {
      this.onHitPlayer.emit(player);
    }
  }

  public reset() {
    const mover = this.entity.getComponent(CpuMover);
    mover.reset();

    this.state.value = "spawn";
    mover.respawn(mover.startPosition);
  }
}
