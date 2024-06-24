import type { Player } from '@/data/types'

export const mockArrayOfPlayers: Player[] = [
  {
    nickname: 'QA_Jake',
    score: 217_888
  },
  {
    nickname: 'Kong',
    score: 75_000
  },
  {
    nickname: 'BobTables',
    score: 1000
  },
  {
    nickname: 'QA_Jake',
    score: 217_888
  },
  {
    nickname: 'Kong',
    score: 75_000
  },
  {
    nickname: 'BobTables',
    score: 1000
  },
  {
    nickname: 'QA_Jake',
    score: 217_888
  },
  {
    nickname: 'Kong',
    score: 75_000
  },
  {
    nickname: 'BobTables',
    score: 1000
  },
  {
    nickname: 'QA_Jake',
    score: 217_888
  },
  {
    nickname: 'Kong',
    score: 75_000
  },
  {
    nickname: 'BobTables',
    score: 1000
  },
  {
    nickname: 'QA_Jake',
    score: 217_888
  },
  {
    nickname: 'Kong',
    score: 75_000
  },
  {
    nickname: 'BobTables',
    score: 1000
  },
  {
    nickname: 'QA_Jake',
    score: 217_888
  },
  {
    nickname: 'Kong',
    score: 75_000
  },
  {
    nickname: 'BobTables',
    score: 1000
  },
  {
    nickname: 'QA_Jake',
    score: 217_888
  },
  {
    nickname: 'Kong',
    score: 75_000
  },
  {
    nickname: 'BobTables',
    score: 1000
  },
  {
    nickname: 'QA_Jake',
    score: 217_888
  },
  {
    nickname: 'Kong',
    score: 75_000
  },
  {
    nickname: 'BobTables',
    score: 1000
  },
  {
    nickname: 'QA_Jake',
    score: 217_888
  },
  {
    nickname: 'Kong',
    score: 75_000
  },
  {
    nickname: 'BobTables',
    score: 1000
  }
]

export const mockCurrentPlayer: Player = {
  nickname: 'Kong',
  score: 75_000,
  rank: 2
}

export const mockGeneratePlayers = (count: number): Player[] => {
  return Array.from({ length: count }, (_, index) => ({
    rank: index + 1,
    nickname: `Player ${index + 1}`,
    score: Math.floor(Math.random() * 100_000)
  })).sort((a, b) => b.score - a.score)
}
