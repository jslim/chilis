import type { FC } from 'react'
import type { CommonContent } from '@/services/cms'

import { memo, useEffect, useState } from 'react'

import { ResizeService } from '@/services/resize'

import { device } from '@/utils/detect'

import { View } from './ScreenRotate.view'

export interface ControllerProps {
  className?: string
  content: CommonContent['screenRotate']
}

// Controller (handles global state, router, data fetching, etc. Feeds props to the view component)
export const Controller: FC<ControllerProps> = memo((props) => {
  const [enable, setEnable] = useState(
    Boolean(process.env.STORYBOOK) || (!device.desktop && device.phone && device.portrait)
  )

  useEffect(() => {
    const handleResize = () => {
      setEnable(device.phone && device.portrait)
    }

    ResizeService.listen(handleResize)

    return () => {
      ResizeService.dismiss(handleResize)
    }
  }, [])

  return <View {...props} enable={enable} />
})

Controller.displayName = 'ScreenRotate_Controller'
