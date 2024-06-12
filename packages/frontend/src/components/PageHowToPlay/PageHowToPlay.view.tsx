import type { FC } from 'react'
import type { PageHandle } from '@/data/types'
import type { ControllerProps } from './PageHowToPlay.controller'

import { useEffect, useImperativeHandle } from 'react'
import classNames from 'classnames'
import { gsap } from 'gsap'

import css from './PageHowToPlay.module.scss'

import { getImageUrl } from '@/utils/basic-functions'

import { useRefs } from '@/hooks/use-refs'

import { BackgroundVideo } from '@/components/BackgroundVideo'
import { BaseImage } from '@/components/BaseImage'
import { Carousel } from '@/components/Carousel'

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
    <main className={classNames('PageHowToPlay', css.root)} ref={refs.root}>
      <BackgroundVideo className={css.backgroundVideo} videoData={content.body.backgroundVideo} />
      <div className={css.container}>
        <div className={css.imageContainer}>
          <BaseImage className={css.image} data={getImageUrl(content.body.hero.src)} alt={content.body.hero.alt} />
        </div>

        <Carousel className={css.carousel} slides={content.body.slides} />
      </div>
    </main>
  )
}

View.displayName = 'PageHowToPlay_View'
