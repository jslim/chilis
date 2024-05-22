import type { FC } from 'react'
import type { ControllerProps } from './BackgroundVideo.controller'

import classNames from 'classnames'

import css from './BackgroundVideo.module.scss'

import { useRefs } from '@/hooks/use-refs'

export interface ViewProps extends ControllerProps {}

export type ViewRefs = {
  root: HTMLDivElement
}

// View (pure and testable component, receives props exclusively from the controller)
export const View: FC<ViewProps> = ({ className, videoData }) => {
  const refs = useRefs<ViewRefs>()
  const videoSrc = videoData.src
  const posterSrc = videoData.poster

  return (
    <div className={classNames('BackgroundVideo', css.root, className)} ref={refs.root}>
      <video className={css.video} poster={posterSrc} src={videoSrc} autoPlay loop muted />
    </div>
  )
}

View.displayName = 'BackgroundVideo_View'
