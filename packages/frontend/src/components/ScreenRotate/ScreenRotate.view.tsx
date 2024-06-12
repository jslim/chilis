import type { ControllerProps } from './ScreenRotate.controller'

import { type FC } from 'react'
import classNames from 'classnames'

import css from './ScreenRotate.module.scss'

import useGameInstance from '@/hooks/use-game-instance'
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
  useGameInstance(enable)

  return enable ? (
    <div className={classNames('ScreenRotate', css.root, className)} ref={refs.root}>
      <FallbackContainer title={content.description} image={content.image} isLarge />
    </div>
  ) : null
}

View.displayName = 'ScreenRotate_View'
