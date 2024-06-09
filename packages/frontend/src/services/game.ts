import { Channels } from '@mediamonks/channels'

import { GAME_SOUNDS_BASE_URL } from '@/game/game.config'
import { GameController } from '@/game/GameController'

let gameInstance: GameController | null = null

const isOggSupported = () => {
  const audio = document.createElement('audio')
  return !!audio.canPlayType && audio.canPlayType('audio/ogg; codecs="vorbis"') !== ''
}

export const initializeGame = async () => {
  if (!gameInstance) {
    gameInstance = new GameController()

    const channelsInstance = new Channels({
      soundsPath: GAME_SOUNDS_BASE_URL,
      soundsExtension: isOggSupported() ? 'ogg' : 'mp3'
    })
    gameInstance.setChannels(channelsInstance)

    await gameInstance.init()

    gameInstance.onLevelComplete.subscribe((data) => console.log('Level complete!', data))
    gameInstance.onGameOver.subscribe((data) => console.log('Game over!', data))
    gameInstance.onGameAction.subscribe((action) => console.log('Game action!', action))
    gameInstance.onShowGameBorder.subscribe((showBorder) => console.log('Show game border:', showBorder))

    await gameInstance.preload()
    await gameInstance.start()
  }

  return gameInstance
}

export const getGameInstance = () => gameInstance
