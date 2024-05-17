import type { FC } from 'react'
import type { ControllerProps } from './ModalBox.controller'

import classNames from 'classnames'

import css from './ModalBox.module.scss'

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

  return (
    <div className={classNames('ModalBox', css.root, className)} ref={refs.root}>
      <BaseButton className={css.close} onClick={onClose}>
        <CloseSvg />
      </BaseButton>
      <div className={css.title}>{title}</div>
    </div>
  )
}

View.displayName = 'ModalBox_View'
