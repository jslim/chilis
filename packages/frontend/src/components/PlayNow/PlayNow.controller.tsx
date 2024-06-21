import type { FC } from 'react'

import { memo } from 'react'

import { View } from './PlayNow.view'

export interface ControllerProps {
  className?: string
  text: string
  onClick: () => void
}

// Controller (handles global state, router, data fetching, etc. Feeds props to the view component)
export const Controller: FC<ControllerProps> = memo((props) => {
  return <View {...props} />
})

Controller.displayName = 'PlayNow_Controller'
