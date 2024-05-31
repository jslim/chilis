import type { StoryFn } from '@storybook/react'
import type { ViewProps } from './PageGame.view'

import { View } from './PageGame.view'

export default { title: 'pages/PageGame' }

export const Default: StoryFn<ViewProps> = (args) => {
  return <View {...args} />
}

Default.args = {}

Default.argTypes = {}
