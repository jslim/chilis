import type { StoryFn } from '@storybook/react'
import type { ViewProps } from './TopNav.view'

import { action } from '@storybook/addon-actions'

import { CmsService } from '@/services/cms'

import { View } from './TopNav.view'

export default { title: 'components/TopNav' }

export const Default: StoryFn<ViewProps> = (args) => {
  return <View {...args} />
}

Default.args = {
  text: 'LOG IN',
  onClick: action('onClick'),
  content: CmsService.getPageContent('home').common.topNav
}

Default.argTypes = {}
