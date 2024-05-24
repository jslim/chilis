import type { StoryFn } from '@storybook/react'
import type { ViewProps } from './PlayNow.view'

import { View } from './PlayNow.view'

export default { title: 'components/PlayNow' }

export const Default: StoryFn<ViewProps> = (args) => {
  return <View {...args} />
}

Default.args = {
  text: 'PLAY NOW'
}

Default.argTypes = {}
