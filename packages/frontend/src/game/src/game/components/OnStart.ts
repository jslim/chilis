import { Component } from '@/game/src/game/core/Entity'

// hack to add some things bit later. dont use to often
export class OnStart extends Component {
  constructor(private callback: () => void) {
    super()
  }
  override onStart() {
    super.onStart()
    this.callback()
  }
}
