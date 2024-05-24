import type { ConsentSliceState } from './slice-consent'
import type { GameSliceState } from './slice-game'
import type { NavigationSliceState } from './slice-navigation'

import { create } from 'zustand'
import { devtools, subscribeWithSelector } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

import { ConsentSlice } from './slice-consent'
import { GameSlice } from './slice-game'
import { NavigationSlice } from './slice-navigation'

export type Mutators = [['zustand/devtools', never], ['zustand/subscribeWithSelector', never], ['zustand/immer', never]]

export type AppState = ConsentSliceState & NavigationSliceState & GameSliceState

export const localStore = create<AppState>()(
  devtools(
    subscribeWithSelector(
      immer((...props) => ({
        ...ConsentSlice(...props),
        ...NavigationSlice(...props),
        ...GameSlice(...props)
      }))
    )
  )
)

export const localState = () => localStore.getState()
