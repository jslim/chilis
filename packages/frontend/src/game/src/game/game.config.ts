/* GENERAL */

export const FRAME_RATE = 22

export const GAME_ASSETS_BASE_URL = '/game/'

/* DEBUG */

export const DEBUG_KEYS = true

export const DRAW_DEBUG_GRID = false
export const DRAW_CPU_DEBUG = false
export const DRAW_HIT_BOX_DEBUG = true
export const DRAW_STATE_DEBUG = false

/* VISUAL */

export const FLOOR_OFFSET = 13

/* SCORING */

// resets when player gets hit
export const SCORE_PER_GROUP_COMPLETE = [100, 200, 400, 800, 800, 800]
export const SCORE_PER_CPUS_HIT = [0, 500, 1000, 2000, 4000, 8000, 16_000]
export const SCORE_PER_BURGER_BOUNCE = [50, 100, 150, 200, 250, 300, 350]
