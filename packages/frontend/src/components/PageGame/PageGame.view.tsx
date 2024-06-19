import type { ControllerProps } from '@/components/PageGame/PageGame.controller'
import type { PageHandle } from '@/data/types'

import { type FC, useEffect, useImperativeHandle, useState } from 'react'
import classNames from 'classnames'
import { gsap } from 'gsap'

import css from './PageGame.module.scss'

import { localStore } from '@/store'

import { getGameInstance } from '@/services/game'

import { useRefs } from '@/hooks/use-refs'

import { BackgroundVideo } from '@/components/BackgroundVideo'
import { BaseButton } from '@/components/BaseButton'
import { Container } from '@/components/Container'

export interface ViewProps extends ControllerProps {}

export type ViewRefs = {
  root: HTMLElement
  pageHandle: PageHandle
  videoRef: HTMLVideoElement
}

// View (pure and testable component, receives props exclusively from the controller)
export const View: FC<ViewProps> = ({ onReady, content }) => {
  const refs = useRefs<ViewRefs>()
  const [isVideoFinished, setIsVideoFinished] = useState(false)
  const gameInstance = getGameInstance()

  const hasContextInit = localStore().navigation.isContextInitialized

  useEffect(() => {
    if (!gameInstance) return

    if (isVideoFinished) {
      gameInstance?.start()
    }
  }, [gameInstance, isVideoFinished])

  useEffect(() => {
    gsap.set(refs.root.current, { opacity: 0 })
    onReady?.(refs.pageHandle)

    const videoElement = refs.videoRef.current
    if (videoElement) {
      const handleVideoEnded = () => {
        setIsVideoFinished(true)
      }
      videoElement.addEventListener('ended', handleVideoEnded)

      return () => {
        videoElement.removeEventListener('ended', handleVideoEnded)
      }
    }
  }, [refs, onReady])

  useImperativeHandle(refs.pageHandle, () => ({
    animateIn: () => gsap.timeline().to(refs.root.current, { opacity: 1 }),
    animateOut: () => gsap.timeline().to(refs.root.current, { opacity: 0 })
  }))

  return (
    <main className={classNames('PageGame', css.root)} ref={refs.root}>
      {!isVideoFinished && (
        <div className={css.videoWrapper}>
          <BackgroundVideo
            className={css.media}
            videoData={content.body.backgroundVideo}
            ref={refs.videoRef}
            loop={false}
            muted={hasContextInit !== true}
          />
          <BaseButton className={css.skip} onClick={() => setIsVideoFinished(true)}>
            {content.common.skip}
          </BaseButton>
        </div>
      )}
      <Container background={content.body.background.src} />
    </main>
  )
}

View.displayName = 'PageGame_View'
