import type { StoryFn } from '@storybook/react'
import type { ViewProps } from './CloseButton.view'

import { View } from './CloseButton.view'

export default { title: 'components/CloseButton' }

export const Default: StoryFn<ViewProps> = (args) => {
  return <View {...args} />
}

Default.args = {}

Default.argTypes = {}
