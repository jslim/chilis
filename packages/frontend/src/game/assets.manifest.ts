import { GAME_ASSETS_BASE_URL } from './game.config'

export const assetsManifest = {
  bundles: [
    {
      name: `game`,
      assets: {
        [`numbers`]: `${GAME_ASSETS_BASE_URL}numbers.png`,
        [`font`]: `${GAME_ASSETS_BASE_URL}font.png`,
        [`font2`]: `${GAME_ASSETS_BASE_URL}og-font.png`,
        [`8px_numbers`]: `${GAME_ASSETS_BASE_URL}8px-numbers.png`,
        [`gamer_numbers`]: `${GAME_ASSETS_BASE_URL}gamer-numbers.png`,
        [`pix_gamer_numbers`]: `${GAME_ASSETS_BASE_URL}pix-gamer-numbers.png`,
        [`background`]: `${GAME_ASSETS_BASE_URL}background.png`,
        [`player_pepper`]: `${GAME_ASSETS_BASE_URL}player-pepper.png`,
        [`flump/atlas`]: `${GAME_ASSETS_BASE_URL}game/atlas0.png`,
        [`flump/json`]: `${GAME_ASSETS_BASE_URL}game/library.json`
      }
    }
  ]
}
