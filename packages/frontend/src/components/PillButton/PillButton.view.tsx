import type { ControllerProps } from './PillButton.controller'

import { forwardRef } from 'react'
import classNames from 'classnames'

import css from './PillButton.module.scss'

import { useRefs } from '@/hooks/use-refs'

import { BaseButton } from '@/components/BaseButton'

export interface ViewProps extends ControllerProps {}

export type ViewRefs = {
  root: HTMLDivElement
}

const PILL_THEMES = {
  RED: 'red',
  BLUE: 'blue'
}

// View (pure and testable component, receives props exclusively from the controller)
export const View = forwardRef<HTMLDivElement, ViewProps>(({ className, theme = PILL_THEMES.RED, ...props }, ref) => {
  const { disabled, children } = props
  const refs = useRefs<ViewRefs>({ root: ref })

  return (
    <BaseButton
      className={classNames('PillButton', css.root, className, {
        [css.themeRed]: theme === PILL_THEMES.RED,
        [css.themeBlue]: theme === PILL_THEMES.BLUE,
        [css.isDisabled]: disabled
      })}
      ref={refs.root}
      {...props}
    >
      {children}
    </BaseButton>
  )
})

View.displayName = 'PillButton_View'
