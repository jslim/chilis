import type { ControllerProps } from './BackgroundVideo.controller'

import { type FC, useEffect } from 'react'
import classNames from 'classnames'

import css from './BackgroundVideo.module.scss'

import { getImageUrl } from '@/utils/basic-functions'

import { useLowPowerMode } from '@/hooks/use-low-power-mode'
import { useRefs } from '@/hooks/use-refs'

import { BaseImage } from '@/components/BaseImage'

export interface ViewProps extends ControllerProps {}

export type ViewRefs = {
  root: HTMLDivElement
  video: HTMLVideoElement
}

// View (pure and testable component, receives props exclusively from the controller)
export const View: FC<ViewProps> = ({
  className,
  videoData: { src, poster },
  loop = true,
  muted = true,
  controls = false,
  autoPlay = true,
  playsInline = true,
  fillContainer = true
}) => {
  const refs = useRefs<ViewRefs>()
  const isLowPowerMode = useLowPowerMode()

  useEffect(() => {
    // alert(isLowPowerMode)

    const video = refs.video.current
    if (video && autoPlay && !isLowPowerMode && !video.paused) {
      video.play()
    }
  }, [refs.video, autoPlay, isLowPowerMode])

  return (
    <div
      className={classNames('BackgroundVideo', css.root, className, {
        [css.fillContainer]: fillContainer
      })}
      ref={refs.root}
    >
      {src && !isLowPowerMode ? (
        // eslint-disable-next-line jsx-a11y/media-has-caption
        <video
          className={css.video}
          poster={getImageUrl(poster)}
          src={src}
          loop={loop}
          muted={muted}
          preload="auto"
          crossOrigin="anonymous"
          controls={controls}
          autoPlay={isLowPowerMode ? false : autoPlay}
          playsInline={playsInline}
          ref={refs.video}
        >
          <source src={src} />
        </video>
      ) : (
        <BaseImage className={css.image} data={getImageUrl(poster)} draggable={false} />
      )}
    </div>
  )
}

View.displayName = 'BackgroundVideo_View'
