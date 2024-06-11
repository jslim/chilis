import type { FC } from 'react'
import type { PageHandle } from '@/data/types'
import type { ControllerProps } from './PageHome.controller'

import { useEffect, useImperativeHandle } from 'react'
import classNames from 'classnames'
import { gsap } from 'gsap'

import css from './PageHome.module.scss'

import { useRefs } from '@/hooks/use-refs'

import { BackgroundVideo } from '@/components/BackgroundVideo'

export interface ViewProps extends ControllerProps {}

export type ViewRefs = {
  root: HTMLImageElement
  pageHandle: PageHandle
  list: HTMLUListElement
  title: HTMLHeadingElement
  description: HTMLHeadingElement
  video: {
    src: string
    poster: string
  }
  hero: {
    src: string
    alt: string
  }
}

// View (pure and testable component, receives props exclusively from the controller)
export const View: FC<ViewProps> = ({ onReady, content }) => {
  const refs = useRefs<ViewRefs>()
  // const imageSrc = content.body.hero.src

  useEffect(() => {
    gsap.set(refs.root.current, { opacity: 0 })
    onReady?.(refs.pageHandle)
  }, [refs, onReady])

  useImperativeHandle(refs.pageHandle, () => ({
    animateIn: () => gsap.timeline().to(refs.root.current, { opacity: 1 }),
    animateOut: () => gsap.timeline().to(refs.root.current, { opacity: 0 })
  }))

  return (
    <main className={classNames('PageHome', css.root)} ref={refs.root}>
      <BackgroundVideo className={css.media} videoData={content.body.backgroundVideo} />
    </main>
  )
}

View.displayName = 'PageHome_View'
