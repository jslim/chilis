import type { ControllerProps } from './BaseModal.controller'

import { type FC, useEffect } from 'react'
import classNames from 'classnames'

import css from './BaseModal.module.scss'

import { useRefs } from '@/hooks/use-refs'

export interface ViewProps extends ControllerProps {}

export type ViewRefs = {
  root: HTMLDivElement
}

// View (pure and testable component, receives props exclusively from the controller)
export const View: FC<ViewProps> = ({ className, children, onClose }) => {
  const refs = useRefs<ViewRefs>()

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyPress)

    return () => {
      document.removeEventListener('keydown', handleKeyPress)
    }
  }, [onClose])

  return (
    <div className={classNames('BaseModal', css.root, className)} ref={refs.root}>
      {children}
    </div>
  )
}

View.displayName = 'BaseModal_View'
