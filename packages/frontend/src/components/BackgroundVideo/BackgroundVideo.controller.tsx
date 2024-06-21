import { forwardRef, memo } from 'react'

import { View } from './BackgroundVideo.view'

export interface ControllerProps {
  className?: string
  videoData: {
    src: string
    poster: string
  }
  loop?: boolean
  muted?: boolean | null
  poster?: string
  controls?: boolean
  autoPlay?: boolean
  playsInline?: boolean
  fillContainer?: boolean
}

// Controller (handles global state, router, data fetching, etc. Feeds props to the view component)
export const Controller = memo(
  forwardRef<HTMLVideoElement, ControllerProps>((props, ref) => {
    return <View {...props} ref={ref} />
  })
)

Controller.displayName = 'BackgroundVideo_Controller'
