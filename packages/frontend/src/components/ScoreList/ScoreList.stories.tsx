import type { StoryFn } from '@storybook/react'
import type { ViewProps } from './ScoreList.view'

import { View } from './ScoreList.view'

export default { title: 'components/ScoreList' }

export const Default: StoryFn<ViewProps> = (args) => {
  return <View {...args} />
}

Default.args = {
  title: 'Top 10 HI-SCORES',
  maxPlayers: 10,
  players: [
    {
      rank: '1',
      nickname: 'Player 1',
      score: '100'
    },
    {
      rank: '2',
      nickname: 'Player 2',
      score: '200'
    },
    {
      rank: '3',
      nickname: 'Player 3',
      score: '300'
    },
    {
      rank: '4',
      nickname: 'Player 4',
      score: '400'
    },
    {
      rank: '5',
      nickname: 'Player 5',
      score: '500'
    },
    {
      rank: '6',
      nickname: 'Player 6',
      score: '600'
    },
    {
      rank: '7',
      nickname: 'Player 7',
      score: '700'
    },
    {
      rank: '8',
      nickname: 'Player 8',
      score: '800'
    },
    {
      rank: '9',
      nickname: 'Player 9',
      score: '900'
    },
    {
      rank: '10',
      nickname: 'Player 10',
      score: '1000'
    },

    {
      rank: '13',
      nickname: 'Player 13',
      score: '1300'
    }
  ]
}

Default.argTypes = {}
