import type { FC } from 'react'
import type { ControllerProps } from './SoundSwitch.controller'

import { useCallback } from 'react'
import classNames from 'classnames'

import css from './SoundSwitch.module.scss'

import { localState, localStore } from '@/store'

import { useRefs } from '@/hooks/use-refs'

import { BaseButton } from '@/components/BaseButton'

import SvgCd from '@/svgs/Cd.svg'
import SvgNote from '@/svgs/Note.svg'

export interface ViewProps extends ControllerProps {}

export type ViewRefs = {
  root: HTMLDivElement
}

export const View: FC<ViewProps> = ({ className, soundState, onClick }) => {
  const refs = useRefs<ViewRefs>()

  const hasContextInit = localStore().navigation.isContextInitialized

  // Toggle sound on or off
  const handleClick = useCallback(() => {
    if (!hasContextInit) {
      localState().navigation.setContextInitialized(true)
    }

    onClick(!soundState)
  }, [hasContextInit, onClick, soundState])

  return (
    <div>
      <BaseButton
        className={classNames('SoundSwitch', css.root, className, { [css.isSoundOn]: soundState })}
        ref={refs.root}
        onClick={handleClick}
      >
        <div className={css.note}>
          <SvgNote />
        </div>
        <div className={css.cd}>
          <SvgCd />
        </div>
      </BaseButton>
    </div>
  )
}

View.displayName = 'SoundSwitch_View'
