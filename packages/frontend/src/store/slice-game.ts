import type { AppState, Mutators } from '.'
import type { StateCreator } from 'zustand'

export type GameSliceState = {
  game: {
    // getters
    isGameOpen: boolean
    // setters
    setIsGameOpen: (isGameOpen: boolean) => void
  }
  user: {
    // getters
    token?: string
    nickname?: string
    // setters
    setToken: (token: string) => void
    setNickname: (nickname: string) => void
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
  },
  user: {
    setToken: (token) => {
      set((state) => {
        state.user.token = token
      })
    },
    setNickname: (nickname) => {
      set((state) => {
        state.user.nickname = nickname
      })
    }
  }
})
