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
      score: 100
    },
    {
      rank: '2',
      name: 'Player 2',
      score: 200
    },
    {
      rank: '3',
      name: 'Player 3',
      score: 300
    },
    {
      rank: '4',
      name: 'Player 4',
      score: 400
    },
    {
      rank: '5',
      name: 'Player 5',
      score: 500
    },
    {
      rank: '6',
      name: 'Player 6',
      score: 600
    },
    {
      rank: '7',
      name: 'Player 7',
      score: 700
    },
    {
      rank: '8',
      name: 'Player 8',
      score: 800
    },
    {
      rank: '9',
      name: 'Player 9',
      score: 900
    },
    {
      rank: '10',
      name: 'Player 10',
      score: 1000
    },
    {
      rank: '11',
      name: 'Player 11',
      score: 1100
    },
    {
      rank: '12',
      name: 'Player 12',
      score: 1200
    },
    {
      rank: '13',
      name: 'Player 13',
      score: 1300
    },
    {
      rank: '14',
      name: 'Player 14',
      score: 1400
    },
    {
      rank: '15',
      name: 'Player 15',
      score: 1500
    },
    {
      rank: '16',
      name: 'Player 16',
      score: 1600
    },
    {
      rank: '17',
      name: 'Player 17',
      score: 1700
    },
    {
      rank: '18',
      name: 'Player 18',
      score: 1800
    },
    {
      rank: '19',
      name: 'Player 19',
      score: 1900
    },
    {
      rank: '20',
      name: 'Player 20',
      score: 2000
    }
  ]
}

Default.argTypes = {}
