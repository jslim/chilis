import { getChannels } from '@/services/channels'

import { GameController } from '@/game/GameController'

let gameInstance: GameController | null = null

export const initializeGame = async () => {
  const channelsInstance = getChannels()

  if (!gameInstance || gameInstance.isDestroyed) {
    gameInstance = new GameController()

    if (channelsInstance) {
      gameInstance.setChannels(channelsInstance)
    }

    await gameInstance.init()

    gameInstance.onLevelComplete.subscribe((data) => console.log('Level complete!', data))
    gameInstance.onGameOver.subscribe((data) => console.log('Game over!', data))
    gameInstance.onGameAction.subscribe((action) => console.log('Game action!', action))
    gameInstance.onShowGameBorder.subscribe((showBorder) => console.log('Show game border:', showBorder))

    await gameInstance.preload()
  }

  return gameInstance
}

export const getGameInstance = () => gameInstance
