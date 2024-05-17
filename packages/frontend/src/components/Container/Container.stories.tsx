import type { StoryFn } from '@storybook/react'
import type { ViewProps } from './Container.view'

import { View } from './Container.view'

export default { title: 'components/Container' }

export const Default: StoryFn<ViewProps> = (args) => {
  return <View {...args} />
}

Default.args = {}

Default.argTypes = {}
