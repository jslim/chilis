import type { StoryFn } from '@storybook/react'
import type { ViewProps } from './Carousel.view'

import { View } from './Carousel.view'

export default { title: 'components/Carousel' }

export const Default: StoryFn<ViewProps> = (args) => {
  return <View {...args} />
}

Default.args = {
  slides: [
    {
      image: {
        src: 'https://via.placeholder.com/150',
        alt: 'Placeholder image'
      },
      text: 'Slide 1'
    },
    {
      image: {
        src: 'https://via.placeholder.com/150',
        alt: 'Placeholder image'
      },
      text: 'Slide 2'
    },
    {
      image: {
        src: 'https://via.placeholder.com/150',
        alt: 'Placeholder image'
      },
      text: 'Slide 3'
    }
  ]
}

Default.argTypes = {}
