import type { FC } from 'react'
import type { ControllerProps } from './SoundSwitch.controller'

import { useCallback, useEffect, useState } from 'react'
import classNames from 'classnames'
import gsap from 'gsap'

import css from './SoundSwitch.module.scss'

import { getGameInstance } from '@/services/game'

import { detect } from '@/utils/detect'

import { useRefs } from '@/hooks/use-refs'

import { BaseButton } from '@/components/BaseButton'

import SvgCd from '@/svgs/Cd.svg'
import SvgNote from '@/svgs/Note.svg'

export interface ViewProps extends ControllerProps {}

export type ViewRefs = {
  root: HTMLDivElement
  note: HTMLDivElement
  cd: HTMLDivElement
  cdAnimation: gsap.core.Tween
  noteAnimation: gsap.core.Tween
}

export const View: FC<ViewProps> = ({ className }) => {
  const refs = useRefs<ViewRefs>()

  const isDesktop = detect.device.desktop
  const channelsInstance = getGameInstance()?.channels
  const [switchOn, setSwitchOn] = useState(channelsInstance?.isDisposed())

  const handleClick = useCallback(() => {
    setSwitchOn((prev) => !prev)
  }, [])

  useEffect(() => {
    const cd = refs.cd.current
    const note = refs.note.current

    refs.cdAnimation.current = gsap.to(cd, { duration: 0.5, rotate: 360, repeat: -1, ease: 'linear', paused: true })
    refs.noteAnimation.current = gsap.fromTo(
      note,
      { y: isDesktop ? 55 : 25 },
      { y: 0, duration: 0.5, ease: 'linear', paused: true }
    )

    return () => {
      refs.cdAnimation.current?.kill()
      refs.noteAnimation.current?.kill()
    }
  }, [isDesktop, refs.cd, refs.cdAnimation, refs.note, refs.noteAnimation])

  useEffect(() => {
    console.log('channelsInstance:', channelsInstance?.getPlayingSounds())

    if (channelsInstance) {
      if (switchOn) {
        try {
          channelsInstance.unmute()
        } catch (error) {
          console.error('Failed to play sound:', error)
        }

        refs.cdAnimation.current?.play()
        refs.noteAnimation.current?.play()
      } else {
        refs.cdAnimation.current?.pause()
        refs.noteAnimation.current?.reverse()

        channelsInstance.mute()
      }
    }

    console.log(channelsInstance)
  }, [switchOn, refs.cdAnimation, refs.noteAnimation, channelsInstance])

  return (
    <div>
      <BaseButton className={classNames('SoundSwitch', css.root, className)} ref={refs.root} onClick={handleClick}>
        <div className={css.note} ref={refs.note}>
          <SvgNote />
        </div>
        <div className={css.cd} ref={refs.cd}>
          <SvgCd />
        </div>
      </BaseButton>
    </div>
  )
}

View.displayName = 'SoundSwitch_View'
