import type { FC } from 'react'

import { memo } from 'react'

import { View } from './BackgroundVideo.view'

export interface ControllerProps {
  className?: string
  videoData: {
    src: string
    poster: string
  }
}

// Controller (handles global state, router, data fetching, etc. Feeds props to the view component)
export const Controller: FC<ControllerProps> = memo((props) => {
  return <View {...props} />
})

Controller.displayName = 'BackgroundVideo_Controller'
