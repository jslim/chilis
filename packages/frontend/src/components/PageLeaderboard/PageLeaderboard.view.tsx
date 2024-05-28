import type { FC } from 'react'
import type { PageHandle } from '@/data/types'
import type { ControllerProps } from './PageLeaderboard.controller'

import { useEffect, useImperativeHandle } from 'react'
import classNames from 'classnames'
import { gsap } from 'gsap'

import css from './PageLeaderboard.module.scss'

import { getImageUrl } from '@/utils/basic-functions'
import { copy } from '@/utils/copy'

import { useRefs } from '@/hooks/use-refs'

import { BackgroundVideo } from '@/components/BackgroundVideo'
import { BaseImage } from '@/components/BaseImage'
import { ScoreList } from '@/components/ScoreList'

export interface ViewProps extends ControllerProps {}

export type ViewRefs = {
  root: HTMLElement
  pageHandle: PageHandle
}

const arrayOfPlayers = [
  { rank: '1', name: 'Player1', score: 100 },
  { rank: '2', name: 'Player2', score: 200 },
  { rank: '3', name: 'Player3', score: 50000 },
  { rank: '4', name: 'Player4', score: 400 },
  { rank: '5', name: 'Player5', score: 500 },
  { rank: '6', name: 'Player6', score: 600 },
  { rank: '7', name: 'Player7', score: 70000 },
  { rank: '8', name: 'Player8', score: 800 },
  { rank: '9', name: 'Player9', score: 900 },
  { rank: '10', name: 'Player10', score: 1000 },
  { rank: '11', name: 'Player111111111', score: 25000 }
]

const currentPlayer = { rank: '500', name: 'Player', score: 542 }

// View (pure and testable component, receives props exclusively from the controller)
export const View: FC<ViewProps> = ({ content, onReady }) => {
  const refs = useRefs<ViewRefs>()

  useEffect(() => {
    gsap.set(refs.root.current, { opacity: 0 })
    onReady?.(refs.pageHandle)
  }, [refs, onReady])

  useImperativeHandle(refs.pageHandle, () => ({
    animateIn: () => gsap.timeline().to(refs.root.current, { opacity: 1 }),
    animateOut: () => gsap.timeline().to(refs.root.current, { opacity: 0 })
  }))

  return (
    <main className={classNames('PageLeaderboard', css.root)} ref={refs.root}>
      <BackgroundVideo
        className={css.backgroundVideo}
        videoData={{
          src: content.body.backgroundVideo.src,
          poster: content.body.backgroundVideo.poster
        }}
      />
      <div className={css.container}>
        <div className={css.imageContainer}>
          <BaseImage className={css.image} data={getImageUrl(content.body.hero.src)} alt={content.body.hero.alt} />
        </div>
        <ScoreList
          maxPlayers={10}
          players={arrayOfPlayers}
          currentRankText={content.body.currentRankText}
          fullLeaderboardText={content.body.fullLeaderboardText}
          currentPlayer={currentPlayer}
        />
        <h1 className={css.title} {...copy.html(content.body.title)} />
      </div>
    </main>
  )
}

View.displayName = 'PageLeaderboard_View'
