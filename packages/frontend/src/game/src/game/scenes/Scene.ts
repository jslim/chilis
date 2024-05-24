import { Component } from "../core/Entity.ts";
import SceneManager from "./SceneManager.ts";
import { getOgFont, SimpleText } from "../display/SimpleText.ts";
import { GameState } from "../components/GameState.ts";

export class Scene extends Component {
  constructor(public sceneManager: SceneManager) {
    super();
  }

  protected addButton(
    label: string,
    position: [x: number, y: number],
    onclick: () => void,
  ) {
    const textField = new SimpleText(label, "center", getOgFont());

    textField.interactive = true;
    textField.cursor = "pointer";

    textField.position.set(Math.floor(position[0]), Math.floor(position[1]));
    // click
    textField.on("pointerdown", onclick);
    // hover
    textField.on("pointerover", () => (textField.alpha = 0.75));
    textField.on("pointerout", () => (textField.alpha = 1.0));
    this.entity.addChild(textField);

    /*
    let textBounds = textField.getBounds();
    let graphics = new Graphics()
      .rect(textBounds.x, textBounds.y, textBounds.width, textBounds.height)
      .fill(0xff0000);
    this.entity.addChild(graphics);
     */
  }

  public get gameState(): GameState {
    return this.sceneManager.root.getComponent(GameState);
  }
}
