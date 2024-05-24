import { Component } from "../../core/Entity.ts";
import { Value } from "../../core/Value.ts";

export class Piggles extends Component {
  public readonly state = new Value<"walking" | "prepare_attack" | "attack">(
    "walking",
  );
  constructor() {
    super();
  }

  override onStart() {
    super.onStart();
  }

  override onUpdate(dt: number) {
    super.onUpdate(dt);
  }

  override destroy() {
    super.destroy();
  }
}
