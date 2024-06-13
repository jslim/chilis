import type { FC } from 'react'
import type { PageProps } from '@/data/types'

import { memo } from 'react'

import { localStore } from '@/store'

import { View } from './PageGameOver.view'

export interface ControllerProps extends PageProps<'gameOver'> {}

// Controller (handles global state, router, data fetching, etc. Feeds props to the view component)
export const Controller: FC<ControllerProps> = memo((props) => {
  const listOfPlayers = localStore().user.playersList
  return <View {...props} arrayOfPlayers={listOfPlayers} />
})

Controller.displayName = 'PageGameOver_Controller'
