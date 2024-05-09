import type { FC } from 'react'
import type { FormFields } from '@/data/types'

import { memo, useState } from 'react'

import { View } from './BaseForm.view'

export interface ControllerProps {
  className?: string
  children?: React.ReactNode
  onSubmit: (data: FormFields) => void
  submitMessage: string
  isSubmitting: boolean
  hasReset?: boolean
  resetMessage?: string
  hasError?: boolean
  errorMessage?: string
}

// Controller (handles global state, router, data fetching, etc. Feeds props to the view component)
export const Controller: FC<ControllerProps> = memo((props, onSubmit) => {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleFormSubmit = (data: FormFields) => {
    setIsSubmitting(true)
    onSubmit(data)
  }

  return <View {...props} onSubmit={handleFormSubmit} isSubmitting={isSubmitting} />
})

Controller.displayName = 'BaseForm_Controller'
