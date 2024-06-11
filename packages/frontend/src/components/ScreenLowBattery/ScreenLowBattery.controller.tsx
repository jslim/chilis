import type { FC } from 'react'
import type { CommonContent } from '@/services/cms'

import { memo } from 'react'

import { useLowPowerMode } from '@/hooks/use-low-power-mode'

import { View } from './ScreenLowBattery.view'

export interface ControllerProps {
  className?: string
  content: CommonContent['screenLowBattery']
}

// Controller (handles global state, router, data fetching, etc. Feeds props to the view component)
export const Controller: FC<ControllerProps> = memo((props) => {
  const enable = useLowPowerMode()

  return <View {...props} enable={enable} />
})

Controller.displayName = 'ScreenLowBattery_Controller'
