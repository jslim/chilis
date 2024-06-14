import type { FC } from 'react'
import type { CommonContent } from '@/services/cms'

import { memo } from 'react'

import { View } from './TopNav.view'

export interface ControllerProps {
  className?: string
  text?: string
  isDisabled?: boolean
  onClick?: () => void
  content: CommonContent['topNav']
}

// Controller (handles global state, router, data fetching, etc. Feeds props to the view component)
export const Controller: FC<ControllerProps> = memo((props) => {
  return <View {...props} />
})

Controller.displayName = 'TopNav_Controller'
