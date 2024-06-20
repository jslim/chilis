import type { FC } from 'react'

import { memo } from 'react'

import { View } from './FallbackContainer.view'

export interface ControllerProps {
  className?: string
  title?: string
  image?: {
    src: string
    alt: string
  }
  site?: string
  isLarge?: boolean
}

// Controller (handles global state, router, data fetching, etc. Feeds props to the view component)
export const Controller: FC<ControllerProps> = memo((props) => {
  return <View {...props} />
})

Controller.displayName = 'FallbackContainer_Controller'
