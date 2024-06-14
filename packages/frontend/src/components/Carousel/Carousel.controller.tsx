import type { FC } from 'react'

import { memo } from 'react'

import { View } from './Carousel.view'

export interface ControllerProps {
  className?: string
  slides: {
    image?: { src: string; alt: string }
    title: string
    text: string
  }[]
}

// Controller (handles global state, router, data fetching, etc. Feeds props to the view component)
export const Controller: FC<ControllerProps> = memo((props) => {
  return <View {...props} />
})

Controller.displayName = 'Carousel_Controller'
