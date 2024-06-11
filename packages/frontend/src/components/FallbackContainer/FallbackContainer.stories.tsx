import type { StoryFn } from '@storybook/react'
import type { ViewProps } from './FallbackContainer.view'

import { View } from './FallbackContainer.view'

export default { title: 'components/FallbackContainer' }

export const Default: StoryFn<ViewProps> = (args) => {
  return <View {...args} />
}

Default.args = {
  title: 'Fallback Container',
  image: {
    src: 'test.png',
    alt: 'Test'
  }
}

Default.argTypes = {}
