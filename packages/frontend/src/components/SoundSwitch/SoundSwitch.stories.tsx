import type { StoryFn } from '@storybook/react'
import type { ViewProps } from './SoundSwitch.view'

import { action } from '@storybook/addon-actions'

import { View } from './SoundSwitch.view'

export default { title: 'components/SoundSwitch' }

export const Default: StoryFn<ViewProps> = (args) => {
  return <View {...args} />
}

Default.args = {
  onClick: action('onClick'),
  audioSrc: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
}

Default.argTypes = {}