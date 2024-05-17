import type { StoryFn } from '@storybook/react'
import type { ViewProps } from './BaseModal.view'

import { action } from '@storybook/addon-actions'

import { View } from './BaseModal.view'

export default { title: 'components/BaseModal' }

export const Default: StoryFn<ViewProps> = (args) => {
  return <View {...args} />
}

Default.args = {
  title: 'Title',
  onClose: action('onClose')
}

Default.argTypes = {}
