import type { StoryFn } from '@storybook/react'
import type { ViewProps } from './BackgroundVideo.view'

import { View } from './BackgroundVideo.view'

export default { title: 'components/BackgroundVideo' }

export const Default: StoryFn<ViewProps> = (args) => {
  return <View {...args} />
}

Default.args = {
  posterSrc: 'https://via.placeholder.com/1920x1080',
  videoSrc: 'https://www.w3schools.com/html/mov_bbb.mp4'
}

Default.argTypes = {}
