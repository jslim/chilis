import type { FC } from 'react'
import type { PageHandle } from '@/data/types'
import type { ControllerProps } from './PageContest.controller'

import { useEffect, useImperativeHandle } from 'react'
import classNames from 'classnames'
import { gsap } from 'gsap'

import css from './PageContest.module.scss'

import { getImageUrl } from '@/utils/basic-functions'
import { copy } from '@/utils/copy'

import { useRefs } from '@/hooks/use-refs'

import { BackgroundVideo } from '@/components/BackgroundVideo'
import { BaseImage } from '@/components/BaseImage'

export interface ViewProps extends ControllerProps {}

export type ViewRefs = {
  root: HTMLElement
  pageHandle: PageHandle
}

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
    <main className={classNames('PageContest', css.root)} ref={refs.root}>
      <BackgroundVideo
        videoData={{
          src: content.body.backgroundVideo.src,
          poster: content.body.backgroundVideo.poster
        }}
      />
      <div className={css.container}>
        <h1 className={css.title} {...copy.html(content.body.title)} />
        <div className={css.imageContainer}>
          <BaseImage className={css.image} data={getImageUrl(content.body.hero.src)} alt={content.body.hero.alt} />
        </div>
        <p className={css.description} {...copy.html(content.body.description)} />
      </div>
    </main>
  )
}

View.displayName = 'PageContest_View'
