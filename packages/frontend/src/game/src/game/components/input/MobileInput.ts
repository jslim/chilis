import { Component, Entity } from '../../core/Entity';
import { Input, InputKey } from './Input';

export class MobileInput extends Component {
  constructor(private target: Entity) {
    super();
  }

  override onStart() {
    super.onStart();

    let gameContainer = document.body;
    let buttonContainer = document.createElement('div');
    gameContainer.style.userSelect = 'none';
    gameContainer.appendChild(buttonContainer);
    buttonContainer.style.position = 'absolute';
    buttonContainer.style.bottom = '150px';
    buttonContainer.style.left = '30px';
    buttonContainer.style.right = '30px';

    const upButton = this.createButton(buttonContainer, 'up', 0);
    const rightButton = this.createButton(buttonContainer, 'right', Math.PI / 2);
    const downButton = this.createButton(buttonContainer, 'down', Math.PI);
    const leftButton = this.createButton(buttonContainer, 'left', (3 * Math.PI) / 2);

    const actionButton = this.createButton(buttonContainer, 'action', 0, '🧂');

    upButton.x = upButton.size;
    upButton.y = -upButton.size / 2;
    downButton.x = downButton.size;
    downButton.y = 1 + downButton.size / 2;
    rightButton.x = rightButton.size * 2;
    leftButton.x = 0;

    actionButton.div.style.left = 'auto';
    actionButton.div.style.right = '0';
    actionButton.y = 0;

    this.disposables.push(() => {
      upButton.div.remove();
      rightButton.div.remove();
      downButton.div.remove();
      leftButton.div.remove();
      actionButton.div.remove();
    });

    this.entity.position.set(upButton.size * 2, 220);
  }

  createButton(containerDiv: HTMLDivElement, key: InputKey, angle: number, content = '⬆️') {
    const input = this.target.getComponent(Input);
    let div = document.createElement('div');
    containerDiv.append(div);

    div.innerText = content;
    div.style.position = 'absolute';
    div.style.userSelect = 'none';
    // @ts-ignore
    div.style.webkitTapHighlightColor = 'transparent';
    div.style.left = '0';
    div.style.top = '0';
    div.style.padding = '23px';
    div.style.cursor = 'pointer';
    div.style.transform = `rotate(${angle}rad)`;
    div.style.backgroundColor = '#000';
    div.style.border = '1px solid #fff';
    // rotate from center
    div.style.transformOrigin = '50% 50%';
    div.onpointerdown = () => {
      input.onDown.emit(key);
      div.style.opacity = '0.8';
    };
    div.onpointerup = div.onpointerout = () => {
      input.onUp.emit(key);
      div.style.opacity = '1';
    };

    /*
    let buttonTexture = Assets.get("mobile_button");
    let button = new Sprite(buttonTexture);
    button.rotation = angle;
    button.pivot.set(button.width / 2, button.height / 2);
    button.interactive = true;
    button.cursor = "pointer";
    button.on("pointerdown", () => {
      input.onDown.emit(key);
      button.alpha = 0.8;
    });
    button.on("pointerup", () => {
      input.onUp.emit(key);
      button.alpha = 1;
    });
    this.entity.addChild(button);
    */
    return {
      div,

      set x(value: number) {
        div.style.left = value + 'px';
      },
      set y(value: number) {
        div.style.top = value + 'px';
      },
      get size() {
        return 75;
      },
    };
  }
}
