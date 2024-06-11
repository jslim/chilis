import type { FC } from 'react'
import type { PageHandle, Player } from '@/data/types'
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

export interface ViewProps extends ControllerProps {
  currentPlayer?: Player
  arrayOfPlayers: Player[]
}

export type ViewRefs = {
  root: HTMLElement
  pageHandle: PageHandle
}

// View (pure and testable component, receives props exclusively from the controller)
export const View: FC<ViewProps> = ({ content, onReady, arrayOfPlayers, currentPlayer }) => {
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
      <BackgroundVideo className={css.backgroundVideo} videoData={content.body.backgroundVideo} />
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
