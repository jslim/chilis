import type { StoryFn } from '@storybook/react'
import type { ViewProps } from './ScoreList.view'

import { mockGeneratePlayers } from '@/data/mock/mock-players-data'

import { View } from './ScoreList.view'

export default { title: 'components/ScoreList' }

export const Default: StoryFn<ViewProps> = (args) => {
  return <View {...args} />
}

Default.args = {
  title: 'Top 10 HI-SCORES',
  maxPlayers: 10,
  players: mockGeneratePlayers(10)
}

Default.argTypes = {}
