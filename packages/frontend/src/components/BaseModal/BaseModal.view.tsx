import type { ControllerProps } from './BaseModal.controller'

import { type FC, useEffect } from 'react'
import classNames from 'classnames'

import css from './BaseModal.module.scss'

import { useRefs } from '@/hooks/use-refs'

import { BaseButton } from '@/components/BaseButton'

import CloseSvg from '@/svgs/Close.svg'

export interface ViewProps extends ControllerProps {}

export type ViewRefs = {
  root: HTMLDivElement
}

// View (pure and testable component, receives props exclusively from the controller)
export const View: FC<ViewProps> = ({ className, title, onClose }) => {
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
      <div className={css.box}>
        <BaseButton className={css.close} onClick={onClose}>
          <CloseSvg />
        </BaseButton>
        <div className={css.title}> {title}</div>
      </div>
    </div>
  )
}

View.displayName = 'BaseModal_View'
