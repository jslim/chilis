import type { ControllerProps as BaseButtonControllerProps } from '@/components/BaseButton/BaseButton.controller'

import { forwardRef, memo } from 'react'

import { View } from './CloseButton.view'

export interface ControllerProps extends Omit<BaseButtonControllerProps, 'children'> {
  className?: string
}

// Controller (handles global state, router, data fetching, etc. Feeds props to the view component)
export const Controller = memo(
  forwardRef<HTMLDivElement, ControllerProps>((props, ref) => {
    return <View {...props} ref={ref} />
  })
)

Controller.displayName = 'CloseButton_Controller'
