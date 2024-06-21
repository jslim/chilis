import { FC, useMemo } from 'react'
import type { PageHandle } from '@/data/types'
import type { ControllerProps } from './PageFullLeaderboard.controller'

import { useEffect, useImperativeHandle } from 'react'
import classNames from 'classnames'
import { gsap } from 'gsap'

import css from './PageFullLeaderboard.module.scss'

import { getImageUrl } from '@/utils/basic-functions'
import { copy } from '@/utils/copy'

import { useRefs } from '@/hooks/use-refs'

import { BaseImage } from '@/components/BaseImage'
import { ScoreList } from '@/components/ScoreList'

import SvgYellowSquares from '@/svgs/YellowSquares.svg'

export interface ViewProps extends ControllerProps {}

export type ViewRefs = {
  root: HTMLElement
  pageHandle: PageHandle
}

// View (pure and testable component, receives props exclusively from the controller)
export const View: FC<ViewProps> = ({ content, arrayOfPlayers, onReady }) => {
  const refs = useRefs<ViewRefs>()
  const otherPlayers = useMemo(() => {
    if (arrayOfPlayers && arrayOfPlayers.length <= 20) {
      return null
    }

    const otherPlayers = arrayOfPlayers?.slice(20)
    return otherPlayers
  }, [])

  useEffect(() => {
    gsap.set(refs.root.current, { opacity: 0 })
    onReady?.(refs.pageHandle)
  }, [refs, onReady])

  useImperativeHandle(refs.pageHandle, () => ({
    animateIn: () => gsap.timeline().to(refs.root.current, { opacity: 1 }),
    animateOut: () => gsap.timeline().to(refs.root.current, { opacity: 0 })
  }))

  return (
    <main className={classNames('PageFullLeaderboard', css.root)} ref={refs.root}>
      <section className={css.titleContainer}>
        <BaseImage className={css.background} data={getImageUrl(content.body.background.src)} alt="" />
        <div className={css.wrapper}>
          <h1 className={css.title} {...copy.html(content.body.title)} />
          <div className={css.heroWrapper}>
            <BaseImage className={css.hero} data={getImageUrl(content.body.hero.src)} alt={content.body.hero.alt} />
          </div>
          <p className={css.description} {...copy.html(content.body.description)} />
        </div>
      </section>
      <section className={css.content}>
        <div className={css.wrapper}>
          <div className={css.iconWrapper}>
            <SvgYellowSquares />
          </div>
          <div className={css.label} {...copy.html(content.body.topLabel)} />
          <div className={classNames(css.iconWrapper, css.right)}>
            <SvgYellowSquares />
          </div>
        </div>

        <ScoreList className={css.list} players={arrayOfPlayers} maxPlayers={20} />
        {Array.isArray(otherPlayers) && (
          <>
            <div className={css.dotsContainer}>
              {[...Array(6)].map((_, index) => (
                <div key={index} className={css.dot} />
              ))}
            </div>
            <div className={css.customList}>
              <ul className={css.list}>
                {otherPlayers.map((player, index) => (
                  <li key={index} className={css.player}>
                    <span className={css.position}>{player.rank}</span>
                    <span className={css.name}>{player.nickname}</span>
                    <span className={css.score}>{player.score}</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </section>
    </main>
  )
}

View.displayName = 'PageFullLeaderboard_View'
