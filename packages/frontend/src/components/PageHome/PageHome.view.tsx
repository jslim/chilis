import type { FC } from 'react'
import type { PageHandle } from '@/data/types'
import type { ControllerProps } from './PageHome.controller'

import { useEffect, useImperativeHandle } from 'react'
import classNames from 'classnames'
import { gsap } from 'gsap'

import css from './PageHome.module.scss'

import { copy } from '@/utils/copy'

import { useRefs } from '@/hooks/use-refs'

export interface ViewProps extends ControllerProps {}

export type ViewRefs = {
  root: HTMLImageElement
  pageHandle: PageHandle
  list: HTMLUListElement
  title: HTMLHeadingElement
  description: HTMLHeadingElement
}

// View (pure and testable component, receives props exclusively from the controller)
export const View: FC<ViewProps> = ({ content, onReady }) => {
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
        <h1 className={css.title} {...copy.html(content.body.title)} ref={refs.title} />
        <h2 className={css.description} {...copy.html(content.body.description)} ref={refs.description} />
        <h3>Chilis Burger Time</h3>
      </section>
    </main>
  )
}

View.displayName = 'PageHome_View'