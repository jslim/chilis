import { GameController } from './game/GameController.ts'

export const initGame = async () => {
  const game = new GameController()

  // Initialize the game once
  await game.init()

  // React now can use `game.canvas` to render

  // Subscribe to game events. This may change in the future
  game.onLevelComplete.subscribe(() => console.log('Level complete!'))
  game.onPlayerDied.subscribe(() => console.log('Player died!'))

  // Start preloader, also need to be run once
  await game.preload()

  // Start the game engine
  await game.start()

  // Show level 1
  await game.showLevel(1)
}
