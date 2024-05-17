import type { StoryFn } from '@storybook/react'
import type { ViewProps } from './ModalBox.view'

import { View } from './ModalBox.view'

export default { title: 'components/ModalBox' }

export const Default: StoryFn<ViewProps> = (args) => {
  return <View {...args} />
}

Default.args = {}

Default.argTypes = {}
