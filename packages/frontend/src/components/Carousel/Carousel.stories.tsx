import type { StoryFn } from '@storybook/react'
import type { ViewProps } from './Carousel.view'

import { View } from './Carousel.view'
import { CmsService } from '@/services/cms'

export default { title: 'components/Carousel' }

export const Default: StoryFn<ViewProps> = (args) => {
  return <View {...args} />
}

Default.args = {
  slides: CmsService.getPageContent('howToPlay').body.slides
}

Default.argTypes = {}
