import type { ControllerProps as BaseButtonControllerProps } from '@/components/BaseButton/BaseButton.controller'

import { forwardRef, memo } from 'react'

import { View } from './PillButton.view'

export interface ControllerProps extends BaseButtonControllerProps {
  className?: string
  theme?: 'red' | 'blue'
}

// Controller (handles global state, router, data fetching, etc. Feeds props to the view component)
export const Controller = memo(
  forwardRef<HTMLDivElement, ControllerProps>((props, ref) => {
    return <View {...props} ref={ref} />
  })
)

Controller.displayName = 'PillButton_Controller'
