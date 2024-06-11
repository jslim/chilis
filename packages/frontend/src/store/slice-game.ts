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
    accessToken?: string
    idToken?: string
    nickname?: string
    isTokenValid?: boolean
    // setters
    setAccessToken: (token: string) => void
    setIdToken: (token: string) => void
    setNickname: (nickname: string) => void
    setIsTokenValid: (isTokenValid: boolean) => void
  }
  screen: {
    // getters
    isFullscreen: boolean
    isModalOpen: boolean
    // setters
    setIsfullscreen: (isFullscreen: boolean) => void
    setIsModalOpen: (isModalOpen: boolean) => void
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
    setIdToken: (token) => {
      set((state) => {
        state.user.idToken = token
      })
    },
    setAccessToken: (token) => {
      set((state) => {
        state.user.accessToken = token
      })
    },
    setNickname: (nickname) => {
      set((state) => {
        state.user.nickname = nickname
      })
    },
    setIsTokenValid: (isTokenValid) => {
      set((state) => {
        state.user.isTokenValid = isTokenValid
      })
    }
  },

  screen: {
    isFullscreen: false,
    isModalOpen: false,

    setIsfullscreen: (flag) => {
      set((state) => {
        state.screen.isFullscreen = flag
      })
    },
    setIsModalOpen: (flag) => {
      set((state) => {
        state.screen.isModalOpen = flag
      })
    }
  }
})
