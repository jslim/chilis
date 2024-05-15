import type { FC } from 'react'

import { memo } from 'react'

import { View } from './ScoreList.view'

export interface ControllerProps {
  className?: string
  maxPlayers: number | null
  players: {
    id: string
    name: string
    score: number
  }[]
  title: string
}

// Controller (handles global state, router, data fetching, etc. Feeds props to the view component)
export const Controller: FC<ControllerProps> = memo((props) => {
  return <View {...props} />
})

Controller.displayName = 'ScoreList_Controller'
