import type { ControllerProps } from '@/components/PageGame/PageGame.controller'
import type { PageHandle } from '@/data/types'

import { type FC, useEffect, useImperativeHandle } from 'react'
import classNames from 'classnames'
import { gsap } from 'gsap'

import css from './PageGame.module.scss'

import { useRefs } from '@/hooks/use-refs'

import { Container } from '@/components/Container'

export interface ViewProps extends ControllerProps {}

export type ViewRefs = {
  root: HTMLElement
  pageHandle: PageHandle
}

// View (pure and testable component, receives props exclusively from the controller)
export const View: FC<ViewProps> = ({ onReady, content }) => {
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
    <main className={classNames('PageGame', css.root)} ref={refs.root}>
      <Container background={content.body.background.src} />
    </main>
  )
}

View.displayName = 'PageGame_View'
