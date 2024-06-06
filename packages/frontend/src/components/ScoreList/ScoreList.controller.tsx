import type { FC } from 'react'
import type { Player } from '@/data/types'

import { memo } from 'react'

import { View } from './ScoreList.view'

export interface ControllerProps {
  className?: string
  maxPlayers?: number
  players: Player[] | undefined
  title?: string
  currentRankText: string
  fullLeaderboardText?: string
  currentPlayer?: Player
}

// Controller (handles global state, router, data fetching, etc. Feeds props to the view component)
export const Controller: FC<ControllerProps> = memo((props) => {
  return <View {...props} />
})

Controller.displayName = 'ScoreList_Controller'
