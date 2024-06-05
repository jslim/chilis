import type { ControllerProps } from './Container.controller'

import { type FC, useEffect } from 'react'
import classNames from 'classnames'

import css from './Container.module.scss'

import { useRefs } from '@/hooks/use-refs'

import { initGame } from '@/game/game'

export interface ViewProps extends ControllerProps {}

export type ViewRefs = {
  root: HTMLDivElement
}

// View (pure and testable component, receives props exclusively from the controller)
export const View: FC<ViewProps> = ({ className }) => {
  const refs = useRefs<ViewRefs>()

  useEffect(() => {
    // Initialize the game
    initGame()
  }, [])

  return (
    <div className={classNames('Container', css.root, className)} ref={refs.root}>
      {/* Game Container */}
      <div id="app" />
    </div>
  )
}

View.displayName = 'Container_View'
