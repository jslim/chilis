import type { RefObject } from 'react'
import type { StoryFn } from '@storybook/react'
import type { PageHandle } from '@/data/types'
import type { ViewProps } from './PageLeaderboard.view'

import { useCallback } from 'react'

import { mockArrayOfPlayers, mockCurrentPlayer } from '@/data/mock/mock-players-data'

import { CmsService } from '@/services/cms'

import { View } from './PageLeaderboard.view'

export default { title: 'pages/PageLeaderboard' }

export const Default: StoryFn<ViewProps> = (args) => {
  const handleReady = useCallback((pageHandle?: RefObject<PageHandle>) => {
    pageHandle?.current?.animateIn()
  }, [])
  return <View {...args} onReady={handleReady} currentPlayer={mockCurrentPlayer} arrayOfPlayers={mockArrayOfPlayers} />
}

Default.args = {
  content: CmsService.getPageContent('leaderboard')
}

Default.argTypes = {}
