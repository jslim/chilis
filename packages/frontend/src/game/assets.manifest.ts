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
        [`button_next`]: `${GAME_ASSETS_BASE_URL}button-next.png`,
        [`button_skip`]: `${GAME_ASSETS_BASE_URL}button-skip.png`,
        [`button_start`]: `${GAME_ASSETS_BASE_URL}button-start.png`,
        [`flump/atlas`]: `${GAME_ASSETS_BASE_URL}game/atlas0.png`,
        [`flump/json`]: `${GAME_ASSETS_BASE_URL}game/library.json`
      }
    }
  ]
}

export const soundManifest = {
  [`vs_level_start`]: `Chilis_Burger Time_VS Screen_V01`,
  [`game_music`]: `Chilis_Burger Time_Gameplay_V02`,
  [`game_start`]: `Chilis_SFX_16_Level Intro Jingle`,
  [`walk_over_burger_loop`]: `Chilis_SFX_02_Walks Over Burger [loop]`,
  [`burger_fall_a`]: `Chilis_SFX_03_Burger Element Falling A`,
  [`burger_fall_b`]: `Chilis_SFX_03_Burger Element Falling B`,
  [`burger_fall_c`]: `Chilis_SFX_03_Burger Element Falling C`,
  [`player_hit_cpu`]: `Chilis_SFX_12_Touched by Enemy`,
  [`player_shoot_pepper`]: `Chilis_SFX_10_Throwing Pepper [loop]`,
  [`player_die`]: `Chilis_SFX_13_Death A`,
  [`cpu_die`]: `Chilis_SFX_04_Enemy Vanquished`,
  [`burger_hit_cpu`]: `Chilis_SFX_09_Burger Fall with Enemy`,
  [`pepper_hit_cpu`]: `Chilis_SFX_11_Throw Hits Enemy`,
  [`pickup_appears`]: `Chilis_SFX_05_Special Item Appears`,
  [`pickup_disappears`]: `Chilis_SFX_08_Special Item Disappears A`
}
// infer type of keys soundManifest
export type SoundName = keyof typeof soundManifest
