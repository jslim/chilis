import type { RefObject } from 'react'
import type { PageContent, PageIdentifier } from '@/services/cms'

export type PageProps<T extends PageIdentifier = 'home'> = {
  content: PageContent<T>
  noLayout?: boolean
  onReady?: (handle: RefObject<PageHandle>) => void
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
  rank: string
  name: string
  score: number
}
