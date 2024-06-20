import type { ControllerProps } from './PlayNow.controller'

import { type FC, useCallback } from 'react'
import classNames from 'classnames'

import css from './PlayNow.module.scss'

import { localState, localStore } from '@/store'

import { useRefs } from '@/hooks/use-refs'

import { BaseButton } from '@/components/BaseButton'

import SvgPlay from '@/svgs/Playnow.svg'

export interface ViewProps extends ControllerProps {}

export type ViewRefs = {
  root: HTMLDivElement
}

// View (pure and testable component, receives props exclusively from the controller)
export const View: FC<ViewProps> = ({ className, text = 'PLAY NOW', url, onClick }) => {
  const refs = useRefs<ViewRefs>()

  const hasContextInit = localStore().navigation.isContextInitialized

  // Toggle sound on or off
  const handleClick = useCallback(() => {
    if (!hasContextInit) {
      localState().navigation.setContextInitialized(true)
    }
    if (onClick) {
      onClick()
    }
  }, [hasContextInit, onClick])

  return (
    <BaseButton
      className={classNames('PlayNow', css.root, className)}
      ref={refs.root}
      href={url}
      onClick={handleClick}
      title={text}
    >
      <SvgPlay className={css.svg} />
    </BaseButton>
  )
}

View.displayName = 'PlayNow_View'
