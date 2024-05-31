/* GENERAL */

// default game speed
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
export const POINTS_PER_GROUP_COMPLETE = [100, 200, 400, 800, 800, 800]
export const POINTS_PER_CPUS_HIT = [0, 500, 1000, 2000, 4000, 8000, 16_000]
export const POINTS_PER_BURGER_BOUNCE = [50, 100, 150, 200, 250, 300, 350]
