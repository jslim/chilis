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
      name: 'Player 1',
      score: '100'
    },
    {
      rank: '2',
      name: 'Player 2',
      score: '200'
    },
    {
      rank: '3',
      name: 'Player 3',
      score: '300'
    },
    {
      rank: '4',
      name: 'Player 4',
      score: '400'
    },
    {
      rank: '5',
      name: 'Player 5',
      score: '500'
    },
    {
      rank: '6',
      name: 'Player 6',
      score: '600'
    },
    {
      rank: '7',
      name: 'Player 7',
      score: '700'
    },
    {
      rank: '8',
      name: 'Player 8',
      score: '800'
    },
    {
      rank: '9',
      name: 'Player 9',
      score: '900'
    },
    {
      rank: '10',
      name: 'Player 10',
      score: '1000'
    },

    {
      rank: '13',
      name: 'Player 13',
      score: '1300'
    }
  ]
}

Default.argTypes = {}
