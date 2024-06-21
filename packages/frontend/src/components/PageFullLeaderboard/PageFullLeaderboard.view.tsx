import type { FC } from 'react'
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
      </section>
    </main>
  )
}

View.displayName = 'PageFullLeaderboard_View'
