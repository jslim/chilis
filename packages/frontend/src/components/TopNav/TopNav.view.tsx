import type { FC } from 'react'
import type { ControllerProps } from './TopNav.controller'

import classNames from 'classnames'

import css from './TopNav.module.scss'

import { useRefs } from '@/hooks/use-refs'

import { BaseButton } from '@/components/BaseButton'

import ChilisSvg from '@/svgs/Chilis.svg'

export interface ViewProps extends ControllerProps {}

export type ViewRefs = {
  root: HTMLDivElement
}

// View (pure and testable component, receives props exclusively from the controller)
export const View: FC<ViewProps> = ({ className, text, onClick }) => {
  const refs = useRefs<ViewRefs>()

  return (
    <nav className={classNames('TopNav', css.root, className)} ref={refs.root}>
      <div className={css.wrapper}>
        <div className={css.logoContainer}>
          <ChilisSvg />
        </div>
        <BaseButton className={css.button} onClick={onClick}>
          {text}
        </BaseButton>
      </div>
    </nav>
  )
}

View.displayName = 'TopNav_View'
