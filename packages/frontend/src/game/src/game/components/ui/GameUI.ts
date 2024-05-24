import { Component, Entity } from "../../core/Entity.ts";
import { SimpleTextDisplay } from "./SimpleTextDisplay.ts";
import { getGamerNumberFont } from "../../display/SimpleText.ts";
import LevelScene from "../../scenes/LevelScene.ts";
import { Assets, Sprite } from "pixi.js";
import { Value } from "../../core/Value.ts";

export class GameUI extends Component {
  constructor(private levelScene: LevelScene) {
    super();
  }

  override onStart() {
    super.onStart();

    const { gameState } = this.levelScene;

    this.disposables.push(
      addPanel(this.entity, [9, 0], "label_score", gameState.score),
    );
    this.disposables.push(
      addPanel(this.entity, [82, 0], "label_highscore", gameState.highScore),
    );
    this.disposables.push(
      addSmallPanel(this.entity, [189, 0], "life", gameState.lives),
    );
    this.disposables.push(
      addSmallPanel(this.entity, [209, 0], "pepper", gameState.bullets),
    );
  }
}

function addPanel(
  entity: Entity,
  position: [x: number, y: number],
  labelSpritePath: string,
  value: Value<number>,
) {
  const panel = new Entity(new Sprite(Assets.get("score_panel")));
  panel.x = position[0];
  panel.y = position[1];
  entity.addEntity(panel);

  const label = new Entity(new Sprite(Assets.get(labelSpritePath)));
  label.position.set(4, 6);
  panel.addEntity(label);

  const formatter = (value: number) => `${value}`.padStart(6, "0");
  const text = new Entity().addComponent(
    new SimpleTextDisplay(
      formatter(value.value),
      "left",
      getGamerNumberFont(),
    ).setTint(0xffc507),
  );
  text.position.set(3, 19);
  panel.addEntity(text);

  return value.onChanged.subscribe((value) => {
    text.getComponent(SimpleTextDisplay).label.text.value = formatter(value);
  });
}

function addSmallPanel(
  entity: Entity,
  position: [x: number, y: number],
  iconSpritePath: string,
  value: Value<number>,
) {
  const panel = new Entity(new Sprite(Assets.get("small_panel")));
  panel.x = position[0];
  panel.y = position[1];
  entity.addEntity(panel);

  const label = new Entity(new Sprite(Assets.get(iconSpritePath)));
  label.position.set(4, 8);
  panel.addEntity(label);

  const formatter = (value: number) => `${value}`;
  const text = new Entity().addComponent(
    new SimpleTextDisplay(formatter(value.value), "left", getGamerNumberFont()),
  );
  text.position.set(3, 19 + 5);
  panel.addEntity(text);

  const textOverlay = new Entity(new Sprite(Assets.get("small_panel_overlay")));
  textOverlay.position.set(2, 19);
  panel.addEntity(textOverlay);

  return value.onChanged.subscribe((value) => {
    text.getComponent(SimpleTextDisplay).label.text.value = formatter(value);
  });
}
