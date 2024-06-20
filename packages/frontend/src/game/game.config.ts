/* GENERAL */

// default game speed
import type { CpuName } from '@/game/components/cpu/Cpu'

export const FRAME_RATE = 22
// game speed for level 7-12
export const FRAME_RATE_HARD = 28
// game speed for level 13-18
export const FRAME_RATE_HARDEST = 34

export const GAME_WIDTH = 240
export const GAME_HEIGHT = 240

export const IS_PRODUCTION_BUILD = process.env.NODE_ENV === 'production'
export const IS_ARCADE_BUILD = process.env.NEXT_PUBLIC_EXECUTABLE_BUILD === 'true'

export const GAME_ASSETS_BASE_URL = IS_ARCADE_BUILD ? './game/' : '/game/'
export const GAME_SOUNDS_BASE_URL = IS_ARCADE_BUILD ? './sounds/' : '/sounds/'
export const GAME_SOUND_MANIFEST_BASE_URL = IS_ARCADE_BUILD ? './sounds/' : ''
export const CHANNEL_SOUND_PATH = IS_ARCADE_BUILD ? '/' : GAME_SOUNDS_BASE_URL

/* DEBUG */

export const GAME_LOGS = !IS_PRODUCTION_BUILD
export const DEBUG_KEYS = !IS_PRODUCTION_BUILD
export const DEBUG_SCENES_FROM_URL = !IS_PRODUCTION_BUILD

export const DRAW_DEBUG_GRID = false
export const DRAW_CPU_DEBUG = false
export const DRAW_HIT_BOX_DEBUG = false
export const DRAW_STATE_DEBUG = false

/* VISUAL */

export const FLOOR_OFFSET = 13

/* SCORING */

// resets when player gets hit
export const POINTS_PER_GROUP_COMPLETE = 100
export const POINTS_PER_CPU: { [key in CpuName]: number } = {
  trainee01: 100,
  trainee02: 100,
  trainee03: 100,
  piggles: 500,
  mrbaggie: 600,
  dino: 700,
  matey: 800,
  zapp: 900,
  burgertron: 1000
}

export const POINTS_PER_PICKUP = 500
export const POINTS_PER_3_PICKUPS = 1099
export const POINTS_PER_TOTAL_CPUS_HIT = [0, 1000, 2000, 3000, 4000, 5000, 6000]
export const POINTS_PER_BURGER_BOUNCE = [50, 100, 150, 200, 250, 300, 350, 400]

// converts level number to 1-6 range
export const getWrappedLevelNo = (levelNo: number) => ((levelNo - 1) % 6) + 1
