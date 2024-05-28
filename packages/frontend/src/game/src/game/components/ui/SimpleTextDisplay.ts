import { Component } from '../../core/Entity';
import { getSimpleFont, SimpleText } from '../../display/SimpleText';
import { TextStyleAlign } from 'pixi.js';

export class SimpleTextDisplay extends Component {
  public label: SimpleText;

  constructor(label = '', align: TextStyleAlign = 'center', config = getSimpleFont()) {
    super();
    this.label = new SimpleText(label, align, config);
  }

  public setTint(color: number) {
    this.label.tint = color;
    return this;
  }

  override onStart() {
    super.onStart();
    this.entity.addChild(this.label);
  }
}
