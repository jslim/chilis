import type { StoryFn } from '@storybook/react'
import type { ViewProps } from './LogModal.view'

import { action } from '@storybook/addon-actions'

import { View } from './LogModal.view'

export default { title: 'components/LogModal' }

export const Default: StoryFn<ViewProps> = (args) => {
  return <View {...args} />
}

Default.args = {
  title: 'Log in',
  description: 'Log in to your account to access your saved games and settings.',
  cta: 'Log in',
  phone: 'Phone number',
  password: 'Password',
  errorMessage: 'Invalid phone number or password',
  decoration: '',
  forgotPassword: 'Forgot your password?',
  skipLabel: 'Skip',
  skip: 'Skip',
  onClose: () => {
    action('onClose')
  }
}

Default.argTypes = {}
