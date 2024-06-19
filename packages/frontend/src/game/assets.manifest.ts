import { GAME_ASSETS_BASE_URL, GAME_SOUND_MANIFEST_BASE_URL } from './game.config'

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
        [`screen_end`]: `${GAME_ASSETS_BASE_URL}screen-end.png`,
        [`flump/atlas`]: `${GAME_ASSETS_BASE_URL}game/atlas0.png`,
        [`flump/json`]: `${GAME_ASSETS_BASE_URL}game/library.json`
      }
    }
  ]
}

export const soundManifest = {
  [`game_music`]: `${GAME_SOUND_MANIFEST_BASE_URL}Chilis_Burger Time_Gameplay_V02`,
  [`game_start`]: `${GAME_SOUND_MANIFEST_BASE_URL}Chilis_SFX_16_Level Intro Jingle`,
  [`walk_over_burger_loop`]: `${GAME_SOUND_MANIFEST_BASE_URL}Chilis_SFX_02_Walks Over Burger [loop]`,
  [`burger_fall_a`]: `${GAME_SOUND_MANIFEST_BASE_URL}Chilis_SFX_03_Burger Element Falling A`,
  [`burger_fall_b`]: `${GAME_SOUND_MANIFEST_BASE_URL}Chilis_SFX_03_Burger Element Falling B`,
  [`burger_fall_c`]: `${GAME_SOUND_MANIFEST_BASE_URL}Chilis_SFX_03_Burger Element Falling C`,
  [`player_hit_cpu`]: `${GAME_SOUND_MANIFEST_BASE_URL}Chilis_SFX_12_Touched by Enemy`,
  [`player_shoot_pepper`]: `${GAME_SOUND_MANIFEST_BASE_URL}Chilis_SFX_10_Throwing Pepper [loop]`,
  [`player_die`]: `${GAME_SOUND_MANIFEST_BASE_URL}Chilis_SFX_13_Death A`,
  [`cpu_die`]: `${GAME_SOUND_MANIFEST_BASE_URL}Chilis_SFX_04_Enemy Vanquished`,
  [`burger_hit_cpu`]: `${GAME_SOUND_MANIFEST_BASE_URL}Chilis_SFX_09_Burger Fall with Enemy`,
  [`pepper_hit_cpu`]: `${GAME_SOUND_MANIFEST_BASE_URL}Chilis_SFX_11_Throw Hits Enemy`,
  [`pickup_appears`]: `${GAME_SOUND_MANIFEST_BASE_URL}Chilis_SFX_05_Special Item Appears`,
  [`pickup_disappears`]: `${GAME_SOUND_MANIFEST_BASE_URL}Chilis_SFX_08_Special Item Disappears A`
}
// infer type of keys soundManifest
export type SoundName = keyof typeof soundManifest
