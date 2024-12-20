import type { RefObject } from 'react'
import type { StoryFn } from '@storybook/react'
import type { PageHandle } from '@/data/types'
import type { ViewProps } from './PageTerms.view'

import { useCallback } from 'react'

import { CmsService } from '@/services/cms'

import { View } from './PageTerms.view'

export default { title: 'pages/PageTerms' }

export const Default: StoryFn<ViewProps> = (args) => {
  const handleReady = useCallback((pageHandle?: RefObject<PageHandle>) => {
    pageHandle?.current?.animateIn()
  }, [])
  return <View {...args} onReady={handleReady} />
}

Default.args = {
  content: CmsService.getPageContent('terms')
}

Default.argTypes = {}
