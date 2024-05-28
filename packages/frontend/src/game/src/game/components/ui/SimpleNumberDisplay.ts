import { Component } from '../../core/Entity';
import { Assets } from 'pixi.js';
import { SimpleNumberText } from '../../display/SimpleNumberText';

export class SimpleNumberDisplay extends Component {
  public scoreText: SimpleNumberText;

  constructor(score = 0) {
    super();
    this.scoreText = new SimpleNumberText(Assets.get('numbers'), score);
  }

  override onStart() {
    super.onStart();
    this.entity.addChild(this.scoreText);
  }
}
