import type { ControllerProps } from './CloseButton.controller'

import { forwardRef } from 'react'
import classNames from 'classnames'

import css from './CloseButton.module.scss'

import { useRefs } from '@/hooks/use-refs'

import { BaseButton } from '@/components/BaseButton'

import SvgClose from '@/svgs/Close.svg'

export interface ViewProps extends ControllerProps {}

export type ViewRefs = {
  root: HTMLDivElement
}

// View (pure and testable component, receives props exclusively from the controller)
export const View = forwardRef<HTMLDivElement, ViewProps>(({ className, ...props }, ref) => {
  const refs = useRefs<ViewRefs>({ root: ref })

  return (
    <BaseButton className={classNames('CloseButton', css.root, className)} ref={refs.root} {...props}>
      <SvgClose className={css.svg} />
    </BaseButton>
  )
})

View.displayName = 'CloseButton_View'
