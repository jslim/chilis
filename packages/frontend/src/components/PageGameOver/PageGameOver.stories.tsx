import type { RefObject } from 'react'
import type { StoryFn } from '@storybook/react'
import type { PageHandle } from '@/data/types'
import type { ViewProps } from './PageGameOver.view'

import { useCallback } from 'react'

import { CmsService } from '@/services/cms'

import { View } from './PageGameOver.view'

export default { title: 'pages/PageGameOver' }

export const Default: StoryFn<ViewProps> = (args) => {
  const handleReady = useCallback((pageHandle?: RefObject<PageHandle>) => {
    pageHandle?.current?.animateIn()
  }, [])
  return <View {...args} onReady={handleReady} />
}

Default.args = {
  content: CmsService.getPageContent('gameOver')
}

Default.argTypes = {}
