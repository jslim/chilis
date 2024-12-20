import type { AppState, Mutators } from '.'
import type { StateCreator } from 'zustand'

import { noop } from '@/utils/basic-functions'

export type NavigationSliceState = {
  navigation: {
    // getters
    pathname: string
    hasNavigated: boolean
    scrollHistory: { pathname: string; value: number }[]
    isNavigatingBack: boolean
    isContextInitialized: boolean
    navigateTo: (href: string) => void
    navigateBack: () => void
    // setters
    setPathname: (activePath: string) => void
    setHasNavigated: (hasNavigated: boolean) => void
    setScrollHistory: (scrollHistory: { pathname: string; value: number }[]) => void
    setIsNavigatingBack: (isNavigatingBack: boolean) => void
    setContextInitialized: (isContextInitialized: boolean) => void
    setNavigateTo: (navigateTo: (href: string) => void) => void
    setNavigateBack: (navigateBack: () => void) => void
  }
}

export const NavigationSlice: StateCreator<AppState, Mutators, [], NavigationSliceState> = (set) => ({
  navigation: {
    pathname: '/',
    hasNavigated: false,
    scrollHistory: [],
    isNavigatingBack: false,
    isContextInitialized: false,
    navigateTo: noop,
    navigateBack: noop,

    setPathname: (pathname) => {
      set((state) => {
        state.navigation.pathname = pathname
      })
    },

    setHasNavigated: (hasNavigated) => {
      set((state) => {
        state.navigation.hasNavigated = hasNavigated
      })
      set((state) => {
        state.navigation.isContextInitialized = hasNavigated
      })
    },

    setScrollHistory: (scrollHistory) => {
      set((state) => {
        state.navigation.scrollHistory = scrollHistory
      })
    },

    setIsNavigatingBack: (isNavigatingBack) => {
      set((state) => {
        state.navigation.isNavigatingBack = isNavigatingBack
      })
    },

    setContextInitialized: (isContextInitialized) => {
      set((state) => {
        state.navigation.isContextInitialized = isContextInitialized
      })
    },

    setNavigateTo: (navigateTo) => {
      set((state) => {
        state.navigation.navigateTo = navigateTo
      })
    },

    setNavigateBack: (navigateBack) => {
      set((state) => {
        state.navigation.navigateBack = navigateBack
      })
    }
  }
})
