import type { StoryFn } from '@storybook/react'
import type { ViewProps } from './ScreenLowBattery.view'

import { CmsService } from '@/services/cms'

import { View } from './ScreenLowBattery.view'

export default { title: 'components/ScreenLowBattery' }

export const Default: StoryFn<ViewProps> = (args) => {
  return <View {...args} />
}

Default.args = {
  content: CmsService.getPageContent('home').common.screenLowBattery,
  enable: true
}

Default.argTypes = {}
