import { Channels } from '@mediamonks/channels'
import { GameController } from './GameController'
import { GAME_SOUNDS_BASE_URL } from '@/game/game.config'

export const initGame = async () => {
  const game = new GameController()

  // needs to be set from frontend
  const channelsInstance = new Channels({
    soundsPath: GAME_SOUNDS_BASE_URL,
    soundsExtension: isOggSupported() ? 'ogg' : 'mp3'
  })
  game.setChannels(channelsInstance)

  // Initialize the game once
  await game.init()

  // React now can use `game.canvas` to render

  // Subscribe to game events. This may change in the future
  game.onLevelComplete.subscribe((data) => console.log('Level complete!', data))
  game.onGameOver.subscribe((data) => console.log('Game over!', data))
  game.onGameAction.subscribe((action) => console.log('Game action!', action))
  game.onShowGameBorder.subscribe((showBorder) => console.log('Show game border:', showBorder))

  // needs to be set from frontend
  // game.setHighScore(123)

  // Start preloader, also need to be run once
  await game.preload()

  // Start the game engine
  await game.start()

  // Show level 1
  //await game.showLevel(1)
}

function isOggSupported() {
  const audio = document.createElement('audio')
  return !!audio.canPlayType && audio.canPlayType('audio/ogg; codecs="vorbis"') !== ''
}
