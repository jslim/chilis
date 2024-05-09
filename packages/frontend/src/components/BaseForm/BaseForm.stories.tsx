import type { StoryFn } from '@storybook/react'
import type { ViewProps } from './BaseForm.view'

import { action } from '@storybook/addon-actions'

import { View } from './BaseForm.view'

export default { title: 'components/BaseForm' }

export const Default: StoryFn<ViewProps> = (args) => {
  return <View {...args} />
}

Default.args = {
  className: 'BaseForm',
  children: 'children',
  onSubmit: () => {
    action('onSubmit')
  },
  submitMessage: 'Submit',
  hasReset: true,
  resetMessage: 'Reset',
  hasError: false,
  errorMessage: 'Error'
}

Default.argTypes = {}
