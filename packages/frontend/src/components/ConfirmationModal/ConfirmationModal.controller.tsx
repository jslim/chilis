import type { FC } from 'react'
import type { CommonContent } from '@/services/cms'

import { memo } from 'react'

import { View } from './ConfirmationModal.view'

export interface ControllerProps {
  className?: string
  show: boolean
  handleClose: () => void
  handleNavigateBack?: () => void
  content: CommonContent['topNav']['backModal']
}

// Controller (handles global state, router, data fetching, etc. Feeds props to the view component)
export const Controller: FC<ControllerProps> = memo((props) => {
  return <View {...props} />
})

Controller.displayName = 'ConfirmationModal_Controller'
