import type { StoryFn } from '@storybook/react'
import type { ViewProps } from './BackgroundVideo.view'

import { View } from './BackgroundVideo.view'

export default { title: 'components/BackgroundVideo' }

export const Default: StoryFn<ViewProps> = (args) => {
  return <View {...args} />
}

Default.args = {
  videoData: {
    poster: 'home-background.jpg',
    src: '/videos/homepage.mp4'
  },
  loop: true,
  muted: true,
  controls: false,
  autoPlay: true,
  playsInline: true,
  fillContainer: true
}

Default.argTypes = {}
