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
  nicknameTitle: string
  nicknameDescription: string
  nickname: string
  nicknameCta: string
  errorMessage: string
  errorMessageNickname: string
  decoration: string
  forgotPassword: string
  skipLabel: string
  skip: string
  logo: {
    src: string
    alt: string
  }
  forgotPasswordLink: string
  createAccountLink: string
  createAccount: string
  onClose: () => void
}

// Controller (handles global state, router, data fetching, etc. Feeds props to the view component)
export const Controller: FC<ControllerProps> = memo((props) => {
  return <View {...props} />
})

Controller.displayName = 'LogModal_Controller'
