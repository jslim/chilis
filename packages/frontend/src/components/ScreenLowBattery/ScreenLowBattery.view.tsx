import type { ControllerProps } from './ScreenLowBattery.controller'

import { type FC } from 'react'
import classNames from 'classnames'

import css from './ScreenLowBattery.module.scss'

import usePauseGameInstance from '@/hooks/use-pause-game-instance'
import { useRefs } from '@/hooks/use-refs'

import { FallbackContainer } from '@/components/FallbackContainer'

export interface ViewProps extends ControllerProps {
  enable: boolean
}

export type ViewRefs = {
  root: HTMLDivElement
}

export const View: FC<ViewProps> = ({ className, content, enable }) => {
  const refs = useRefs<ViewRefs>()
  usePauseGameInstance(enable)

  return enable ? (
    <div className={classNames('ScreenLowBattery', css.root, className)} ref={refs.root}>
      <FallbackContainer title={content.description} image={content.image} />
    </div>
  ) : null
}

View.displayName = 'ScreenLowBattery_View'
