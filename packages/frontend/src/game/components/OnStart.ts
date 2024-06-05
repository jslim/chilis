import { Component } from '@/game/core/Entity'

// hack to add some things bit later. dont use to often
export class OnStart extends Component {
  constructor(private readonly callback: () => void) {
    super()
  }

  override onStart() {
    super.onStart()
    this.callback()
  }
}
