import type { FC } from 'react'
import type { Channels, PlayingSound } from '@mediamonks/channels'
import type { ControllerProps } from './SoundSwitch.controller'

import { useCallback, useEffect, useMemo, useState } from 'react'
import classNames from 'classnames'

import css from './SoundSwitch.module.scss'

import { routes } from '@/data/routes'

import { localState, localStore } from '@/store'

import { getChannels, loadSounds } from '@/services/channels'
import { getGameInstance } from '@/services/game'

import { useRefs } from '@/hooks/use-refs'

import { BaseButton } from '@/components/BaseButton'

import SvgCd from '@/svgs/Cd.svg'
import SvgNote from '@/svgs/Note.svg'

export interface ViewProps extends ControllerProps {}

export type ViewRefs = {
  root: HTMLDivElement
}

const MAIN_SOUND = 'start-screen'

export const View: FC<ViewProps> = ({ className }) => {
  const refs = useRefs<ViewRefs>()
  const [channelsInstance, setChannelsInstance] = useState<Channels | null>(null)
  const hasContextInit = localStore().navigation.isContextInitialized

  const [switchOn, setSwitchOn] = useState(false)

  const [mainSound, setMainSound] = useState<PlayingSound | null>(null)

  const gameInstance = getGameInstance()

  const path = localStore().navigation.pathname
  const isMainPages = useMemo(() => {
    return path === routes.HOME || path === routes.LEADERBOARD || path === routes.HOW_TO_PLAY || path === routes.CONTEST
  }, [path])

  // Toggle sound on or off
  const handleClick = useCallback(() => {
    setSwitchOn((prev) => !prev)

    if (!hasContextInit) {
      localState().navigation.setContextInitialized(true)
    }
  }, [hasContextInit])

  // Initialize channels instance
  useEffect(() => {
    let instance: Channels | null = null

    const initializeChannels = async () => {
      instance = getChannels()
      setChannelsInstance(instance)
      setSwitchOn(instance?.audioContext.state === 'running')
    }
    initializeChannels()

    return () => {
      if (instance) {
        instance.stopAll()
      }
    }
  }, [])

  // Mute or unmute all sounds
  useEffect(() => {
    if (channelsInstance) {
      if (switchOn) {
        channelsInstance.setVolume(1)
        gameInstance?.setMuted(false)
      } else {
        channelsInstance.setVolume(0)
        gameInstance?.setMuted(true)
        console.log('Muting channelsInstance', channelsInstance.getChannels())
      }
    }
  }, [switchOn, channelsInstance, gameInstance])

  // Add main sound when on main pages
  useEffect(() => {
    const addMainSound = async () => {
      if (isMainPages && channelsInstance && mainSound) {
        try {
          channelsInstance.sampleManager.addSample({ name: MAIN_SOUND, extension: 'mp3' })
          await loadSounds()
          setMainSound(channelsInstance.play(MAIN_SOUND, { loop: true }))
        } catch (error) {
          console.error('Error adding or playing sound:', error)
        }
      }
    }

    addMainSound()
  }, [channelsInstance, isMainPages, switchOn, mainSound])

  // Mute main sound when not on main pages
  useEffect(() => {
    if (!isMainPages && mainSound) {
      mainSound.mute()
    } else {
      mainSound?.unmute()
    }
  }, [mainSound, isMainPages])

  return (
    <div>
      <BaseButton
        className={classNames('SoundSwitch', css.root, className, { [css.isSoundOn]: switchOn })}
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
