import type { FC } from 'react'
import type { PageHandle } from '@/data/types'
import type { ControllerProps } from './PageGameOver.controller'

import { useEffect, useImperativeHandle, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import classNames from 'classnames'
import { gsap } from 'gsap'

import css from './PageGameOver.module.scss'

import { routes } from '@/data/routes'

import { localStore } from '@/store'

import { getImageUrl } from '@/utils/basic-functions'
import { copy } from '@/utils/copy'

import { useRefs } from '@/hooks/use-refs'

import { BackgroundVideo } from '@/components/BackgroundVideo'
import { BaseButton } from '@/components/BaseButton'
import { BaseImage } from '@/components/BaseImage'
import { ScoreList } from '@/components/ScoreList'

export interface ViewProps extends ControllerProps {}

export type ViewRefs = {
  root: HTMLElement
  pageHandle: PageHandle
}

// View (pure and testable component, receives props exclusively from the controller)
export const View: FC<ViewProps> = ({ content, onReady, arrayOfPlayers }) => {
  const refs = useRefs<ViewRefs>()
  const router = useRouter()
  const [isWinner, setIsWinner] = useState<boolean | null>(null)
  const heroImageSrc = isWinner ? content.body.heroWin.src : content.body.heroLose.src
  const heroAltText = isWinner ? content.body.heroWin.alt : content.body.heroLose.alt
  const description = isWinner ? content.body.description : content.body.descriptionOver
  const nickname = localStore().user.nickname
  const currentPlayer = useMemo(
    () => arrayOfPlayers?.find((player) => player.nickname === nickname),
    [arrayOfPlayers, nickname]
  )

  useEffect(() => {
    gsap.set(refs.root.current, { opacity: 0 })
    onReady?.(refs.pageHandle)
  }, [refs, onReady])

  useImperativeHandle(refs.pageHandle, () => ({
    animateIn: () => gsap.timeline().to(refs.root.current, { opacity: 1 }),
    animateOut: () => gsap.timeline().to(refs.root.current, { opacity: 0 })
  }))

  useEffect(() => {
    if (router.query.isWinner !== undefined) {
      setIsWinner(router.query.isWinner === 'true')
    }
  }, [router.query.isWinner])

  return (
    <main className={classNames('PageGameOver', css.root)} ref={refs.root}>
      <BackgroundVideo
        className={css.backgroundVideo}
        videoData={{
          ...content.body.backgroundVideo
        }}
      />
      <div className={css.contentWrapper}>
        <div className={css.upperWrapper}>
          <div className={css.heroWrapper}>
            <BaseImage className={css.hero} data={getImageUrl(heroImageSrc)} alt={heroAltText} />
          </div>
          <h1 className={css.title} {...copy.html(content.body.title)} />
          <p className={css.description} {...copy.html(description)} />
          <ScoreList className={css.list} players={arrayOfPlayers} currentPlayer={currentPlayer} isGameOverScreen />
        </div>
        <div className={css.lowerWrapper}>
          {/* {content.body.ctasDescription && (
            <p className={css.ctasDescription} {...copy.html(content.body.ctasDescription)} />
          )} */}
          <BaseButton
            className={classNames(css.button, css.continue)}
            href={routes.GAME}
            data-text={isWinner ? content.body.ctas.continue : content.body.ctas.again}
          >
            {isWinner ? content.body.ctas.continue : content.body.ctas.again}
          </BaseButton>
          <BaseButton
            className={classNames(css.button, css.quit)}
            href={routes.HOME}
            data-text={content.body.ctas.quit}
          >
            {content.body.ctas.quit}
          </BaseButton>
        </div>
      </div>
    </main>
  )
}

View.displayName = 'PageGameOver_View'
