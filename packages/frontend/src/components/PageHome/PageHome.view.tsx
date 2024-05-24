import type { FC } from 'react'
import type { PageHandle } from '@/data/types'
import type { ControllerProps } from './PageHome.controller'

import { useEffect, useImperativeHandle } from 'react'
import classNames from 'classnames'
import { gsap } from 'gsap'

import css from './PageHome.module.scss'

import { useRefs } from '@/hooks/use-refs'

import HomeLogo from '@/svgs/HomeLogo.svg'

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
}

// View (pure and testable component, receives props exclusively from the controller)
export const View: FC<ViewProps> = ({ onReady }) => {
  const refs = useRefs<ViewRefs>()

  useEffect(() => {
    gsap.set(refs.root.current, { opacity: 0 })
    onReady?.(refs.pageHandle)
  }, [refs, onReady])

  useImperativeHandle(refs.pageHandle, () => ({
    animateIn: () => {
      return gsap
        .timeline()
        .to(refs.root.current, { opacity: 1 }, 0)
        .fadeIn(refs.title.current, {}, 0)
        .fadeIn(refs.description.current, {}, 0.2)
    },
    animateOut: () => gsap.timeline().to(refs.root.current, { opacity: 0 })
  }))

  return (
    <main className={classNames('PageHome', css.root)} ref={refs.root}>
      <section className={css.hero}>
        <div className={css.logoContainer}>
          <HomeLogo />
        </div>
      </section>
    </main>
  )
}

View.displayName = 'PageHome_View'
