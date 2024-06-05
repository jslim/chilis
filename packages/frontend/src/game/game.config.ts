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

export const GAME_ASSETS_BASE_URL = '/game/'

/* DEBUG */

export const DEBUG_KEYS = true
export const DEBUG_SCENES_FROM_URL = true

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
  burgertron: 200
}

export const POINTS_PER_TOTAL_CPUS_HIT = [0, 1000, 2000, 3000, 4000, 5000, 6000]

export const POINTS_PER_BURGER_BOUNCE = [50, 100, 150, 200, 250, 300, 350]

// converts level number to 1-6 range
export const getWrappedLevelNo = (levelNo: number) => ((levelNo - 1) % 6) + 1
