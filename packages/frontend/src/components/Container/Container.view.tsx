import type { FC } from 'react'
import type { ControllerProps } from './Container.controller'

import classNames from 'classnames'

import css from './Container.module.scss'

import { useRefs } from '@/hooks/use-refs'

export interface ViewProps extends ControllerProps {}

export type ViewRefs = {
  root: HTMLDivElement
}

// View (pure and testable component, receives props exclusively from the controller)
export const View: FC<ViewProps> = ({ className }) => {
  const refs = useRefs<ViewRefs>()

  return (
    <div className={classNames('Container', css.root, className)} ref={refs.root}>
      <p>&lt;Container /&gt;</p>
    </div>
  )
}

View.displayName = 'Container_View'
