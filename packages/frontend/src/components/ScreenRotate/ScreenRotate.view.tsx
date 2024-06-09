import type { ControllerProps } from './ScreenRotate.controller'

import { type FC, useEffect, useState } from 'react'
import classNames from 'classnames'

import css from './ScreenRotate.module.scss'

import { getGameInstance } from '@/services/game'
import { ResizeService } from '@/services/resize'

import { copy } from '@/utils/copy'
import { device } from '@/utils/detect'

import { useRefs } from '@/hooks/use-refs'

import SvgChilis from '@/svgs/Chilis.svg'
import SvgRotate from '@/svgs/Rotate.svg'

export interface ViewProps extends ControllerProps {}

export type ViewRefs = {
  root: HTMLDivElement
}

export const View: FC<ViewProps> = ({ className, content }) => {
  const refs = useRefs<ViewRefs>()
  const [enable, setEnable] = useState(process.env.STORYBOOK || (!device.desktop && device.phone && device.portrait))
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setEnable(device.phone && device.portrait)
    }

    ResizeService.listen(handleResize)

    return () => {
      ResizeService.dismiss(handleResize)
    }
  }, [])

  useEffect(() => {
    const gameInstance = getGameInstance()

    if (gameInstance) {
      if (enable && !paused) {
        gameInstance.pause()
        setPaused(true)
      } else if (!enable && paused) {
        gameInstance.resume()
        setPaused(false)
      }
    }
  }, [enable, paused])

  return enable ? (
    <div className={classNames('ScreenRotate', css.root, className)} ref={refs.root}>
      <div className={css.logoContainer}>
        <SvgChilis />
      </div>
      <div className={css.iconContainer}>
        <SvgRotate />
      </div>
      <p className={css.description} {...copy.html(content.description, {}, 10)} />
    </div>
  ) : null
}

View.displayName = 'ScreenRotate_View'
