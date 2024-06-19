import type { FC } from 'react'
import type { Channels } from '@mediamonks/channels'
import type { ControllerProps } from './SoundSwitch.controller'

import { useCallback, useEffect, useMemo, useState } from 'react'
import classNames from 'classnames'

import css from './SoundSwitch.module.scss'

import { routes } from '@/data/routes'

import { localState, localStore } from '@/store'

import { getChannels, loadSounds, playSound } from '@/services/channels'

import { print } from '@/utils/print'

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
  const [isSampleAdded, setIsSampleAdded] = useState(false)

  const path = localStore().navigation.pathname
  const isMainPages = useMemo(() => {
    return path === routes.HOME || path === routes.LEADERBOARD || path === routes.HOW_TO_PLAY || path === routes.CONTEST
  }, [path])

  const handleClick = useCallback(() => {
    setSwitchOn((prev) => !prev)

    if (!hasContextInit) {
      localState().navigation.setContextInitialized(true)
    }
  }, [hasContextInit])

  useEffect(() => {
    const initializeChannels = async () => {
      const instance = getChannels()
      setChannelsInstance(instance)
      console.log(instance?.audioContext.state)
      setSwitchOn(instance?.audioContext.state === 'running')
    }
    initializeChannels()
  }, [])

  useEffect(() => {
    print('sound', `channelsInstance: ${channelsInstance?.getSounds().join(',')}`)

    if (channelsInstance) {
      if (switchOn) {
        channelsInstance.unmute()
        console.log('Unmuting channelsInstance', channelsInstance.getChannels())
      } else {
        channelsInstance.mute()
        console.log('Muting channelsInstance')
      }
    }
  }, [switchOn, channelsInstance])

  useEffect(() => {
    const addMainSound = async () => {
      if (isMainPages && switchOn && channelsInstance && !isSampleAdded) {
        try {
          channelsInstance.sampleManager.addSample({ name: MAIN_SOUND, extension: 'mp3' })
          setIsSampleAdded(true)

          await loadSounds()
          playSound(MAIN_SOUND)
        } catch (error) {
          console.error('Error adding or playing sound:', error)
        }
      }
    }

    addMainSound()

    return () => {
      if (channelsInstance) {
        channelsInstance.stopAll()
        channelsInstance.destruct()
      }
    }
  }, [channelsInstance, isMainPages, switchOn, isSampleAdded])

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
