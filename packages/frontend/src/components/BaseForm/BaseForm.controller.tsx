import type { FC } from 'react'

import { memo } from 'react'

import { View } from './BaseForm.view'

export interface ControllerProps {
  className?: string
  children?: React.ReactNode
  onSubmit: () => void
  submitMessage: string
  hasError?: boolean
  errorMessage?: string
  disabled?: boolean
}

// Controller (handles global state, router, data fetching, etc. Feeds props to the view component)
export const Controller: FC<ControllerProps> = memo((props) => {
  return <View {...props} />
})

Controller.displayName = 'BaseForm_Controller'
