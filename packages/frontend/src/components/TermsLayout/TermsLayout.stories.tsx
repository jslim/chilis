import type { StoryFn } from '@storybook/react'
import type { ViewProps } from './TermsLayout.view'

import { CmsService } from '@/services/cms'

import { View } from './TermsLayout.view'

export default { title: 'components/TermsLayout' }

export const Terms: StoryFn<ViewProps> = (args) => {
  return <View {...args} />
}

Terms.args = {
  content: CmsService.getPageContent('terms')
}

Terms.argTypes = {}

export const FAQ: StoryFn<ViewProps> = (args) => {
  return <View {...args} />
}

FAQ.args = {
  content: CmsService.getPageContent('faq')
}

FAQ.argTypes = {}
