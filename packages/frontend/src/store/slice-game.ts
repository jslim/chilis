import type { AppState, Mutators } from '.'
import type { StateCreator } from 'zustand'

export type GameSliceState = {
  game: {
    // getters
    isGameOpen: boolean
    // setters
    setIsGameOpen: (isGameOpen: boolean) => void
  }
}

export const GameSlice: StateCreator<AppState, Mutators, [], GameSliceState> = (set) => ({
  game: {
    isGameOpen: false,

    setIsGameOpen: (flag) => {
      set((state) => {
        state.game.isGameOpen = flag
      })
    }
  }
})
