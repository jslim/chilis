import type { StoryFn } from '@storybook/react'
import type { ViewProps } from './LogModal.view'

import { action } from '@storybook/addon-actions'

import { CmsService } from '@/services/cms'

import { View } from './LogModal.view'

export default { title: 'components/LogModal' }

export const Default: StoryFn<ViewProps> = (args) => {
  return <View {...args} />
}

const props = CmsService.getPageContent('home').common.logModal

Default.args = {
  ...props,
  onClose: () => {
    action('onClose')
  }
}

Default.argTypes = {}
