import type { StoryFn } from '@storybook/react'
import type { ViewProps } from './ConfirmationModal.view'

import { CmsService } from '@/services/cms'

import { View } from './ConfirmationModal.view'

export default { title: 'components/ConfirmationModal' }

export const Default: StoryFn<ViewProps> = (args) => {
  return <View {...args} />
}

Default.args = {
  show: true,
  content: CmsService.getPageContent('home').common.topNav.backModal
}

Default.argTypes = {}
