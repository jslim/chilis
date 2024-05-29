import type { FC } from 'react'

import { memo } from 'react'

import { View } from './LogModal.view'

export interface ControllerProps {
  className?: string
  title: string
  description: string
  cta: string
  phone: string
  password: string
  errorMessage: string
  decoration: string
  forgotPassword: string
  skipLabel: string
  skip: string
  onClose: () => void
}

// Controller (handles global state, router, data fetching, etc. Feeds props to the view component)
export const Controller: FC<ControllerProps> = memo((props) => {
  return <View {...props} />
})

Controller.displayName = 'LogModal_Controller'
