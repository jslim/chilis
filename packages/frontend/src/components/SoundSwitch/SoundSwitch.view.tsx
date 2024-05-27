/* eslint-disable jsx-a11y/media-has-caption */
import type { ControllerProps } from './SoundSwitch.controller'

import { type FC, useCallback, useEffect, useState } from 'react'
import classNames from 'classnames'
import gsap from 'gsap'

import css from './SoundSwitch.module.scss'

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
  audio: HTMLAudioElement
}

export const View: FC<ViewProps> = ({ className, audioSrc }) => {
  const refs = useRefs<ViewRefs>()
  const [switchOn, setSwitchOn] = useState(false)

  const handleClick = useCallback(() => {
    setSwitchOn((prev) => !prev)
  }, [])

  useEffect(() => {
    const cd = refs.cd.current
    const note = refs.note.current

    refs.cdAnimation.current = gsap.to(cd, { duration: 0.5, rotate: 360, repeat: -1, ease: 'linear', paused: true })
    refs.noteAnimation.current = gsap.fromTo(note, { y: 55 }, { y: 0, duration: 0.5, ease: 'linear', paused: true })

    // Initialize audio element
    if (!refs.audio.current && audioSrc) {
      refs.audio.current = new Audio(audioSrc)
    }

    return () => {
      refs.cdAnimation.current?.kill()
      refs.noteAnimation.current?.kill()
    }
  }, [audioSrc, refs.audio, refs.cd, refs.cdAnimation, refs.note, refs.noteAnimation])

  useEffect(() => {
    const audio = refs.audio.current

    if (switchOn) {
      if (audio) {
        audio.play().catch((error) => console.log('Failed to play audio:', error))
        audio.muted = false

        refs.cdAnimation.current?.play()
        refs.noteAnimation.current?.play()
      }
    } else {
      refs.cdAnimation.current?.pause()
      refs.noteAnimation.current?.reverse()

      if (audio) {
        audio.pause()
      }
    }
  }, [audioSrc, refs.audio, refs.cdAnimation, refs.noteAnimation, switchOn])

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

      <audio>
        <source src="" type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
    </div>
  )
}

View.displayName = 'SoundSwitch_View'
