import type { FC } from 'react'
import type { PageHandle } from '@/data/types'
import type { ControllerProps } from './PageLeaderboard.controller'

import { useEffect, useImperativeHandle } from 'react'
import classNames from 'classnames'
import { gsap } from 'gsap'

import css from './PageLeaderboard.module.scss'

import { copy } from '@/utils/copy'

import { useRefs } from '@/hooks/use-refs'

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
    <main className={classNames('PageLeaderboard', css.root)} ref={refs.root}>
      <h1 className={css.title} {...copy.html(content.body.title)} />
    </main>
  )
}

View.displayName = 'PageLeaderboard_View'