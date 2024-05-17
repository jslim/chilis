import type { FC } from 'react'

import { memo } from 'react'

import { View } from './BaseModal.view'

export interface ControllerProps {
  className?: string
  children: React.ReactNode
  onClose: () => void
}

// Controller (handles global state, router, data fetching, etc. Feeds props to the view component)
export const Controller: FC<ControllerProps> = memo((props) => {
  return <View {...props} />
})

Controller.displayName = 'BaseModal_Controller'
