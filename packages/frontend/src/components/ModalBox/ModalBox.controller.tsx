import type { FC } from 'react'

import { memo } from 'react'

import { View } from './ModalBox.view'

export interface ControllerProps {
  className?: string
  title: string
  onClose: () => void
}

// Controller (handles global state, router, data fetching, etc. Feeds props to the view component)
export const Controller: FC<ControllerProps> = memo((props) => {
  return <View {...props} />
})

Controller.displayName = 'ModalBox_Controller'
