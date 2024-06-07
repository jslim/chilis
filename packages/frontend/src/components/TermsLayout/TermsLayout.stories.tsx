import type { StoryFn } from '@storybook/react'
import type { ViewProps } from './TermsLayout.view'

import { View } from './TermsLayout.view'

export default { title: 'components/TermsLayout' }

export const Default: StoryFn<ViewProps> = (args) => {
  return <View {...args} />
}

Default.args = {}

Default.argTypes = {}
