import type { StoryFn } from '@storybook/react'
import type { ViewProps } from './PillButton.view'

import { View } from './PillButton.view'

export default { title: 'components/PillButton' }

export const Default: StoryFn<ViewProps> = (args) => {
  return <View {...args} />
}

Default.args = {
  children: 'PillButton',
  disabled: false,
  theme: 'red'
}

Default.argTypes = {
  theme: { options: ['red', 'blue'], control: { type: 'select' } }
}

export const Disabled: StoryFn<ViewProps> = (args) => {
  return <View {...args} />
}

Disabled.args = {
  children: 'PillButton',
  disabled: true
}

Disabled.argTypes = {}
