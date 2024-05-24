import type { FC } from 'react'
import type { ControllerProps } from './PlayNow.controller'

import classNames from 'classnames'

import css from './PlayNow.module.scss'

import { useRefs } from '@/hooks/use-refs'

import { BaseButton } from '@/components/BaseButton'

export interface ViewProps extends ControllerProps {}

export type ViewRefs = {
  root: HTMLDivElement
}

// View (pure and testable component, receives props exclusively from the controller)
export const View: FC<ViewProps> = ({ className, text = 'PLAY NOW', onClick }) => {
  const refs = useRefs<ViewRefs>()

  return (
    <BaseButton className={classNames('PlayNow', css.root, className)} ref={refs.root} onClick={onClick}>
      {text}
    </BaseButton>
  )
}

View.displayName = 'PlayNow_View'
