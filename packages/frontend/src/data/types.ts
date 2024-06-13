import type { RefObject } from 'react'
import type { PageContent, PageIdentifier } from '@/services/cms'

export type PageProps<T extends PageIdentifier = 'home'> = {
  content: PageContent<T>
  noLayout?: boolean
  onReady?: (handle: RefObject<PageHandle>) => void
  arrayOfPlayers?: Player[]
}

export type PageHandle = {
  animateIn: () => gsap.core.Timeline
  animateOut: () => gsap.core.Timeline
}

export type FormFields = {
  username: string
  password: string
}

export type Player = {
  nickname: string
  score: number
  rank?: number
}

export type ApiResponse = {
  message: string
  // eslint-disable-next-line @typescript-eslint/member-ordering
  [key: string]: unknown
  // array of players
  data: Player[]
  user: Player
}
