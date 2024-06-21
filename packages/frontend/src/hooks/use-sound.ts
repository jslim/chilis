import type { Channels, PlayingSound } from '@mediamonks/channels'

import { useEffect, useMemo, useState } from 'react'

import { routes } from '@/data/routes'

import { localStore } from '@/store'

import { getChannels, loadSounds } from '@/services/channels'
import { getGameInstance } from '@/services/game'

const MAIN_SOUND = 'start-screen'

export function useSound(): [boolean, React.Dispatch<React.SetStateAction<boolean>>] {
  const [channelsInstance, setChannelsInstance] = useState<Channels | null>(null)

  const isMutedStore = localStore().screen.isMuted

  const [switchOn, setSwitchOn] = useState(false)
  const [mainSound, setMainSound] = useState<PlayingSound | null>(null)

  const gameInstance = getGameInstance()

  const path = localStore().navigation.pathname
  const hasContextInit = localStore().navigation.isContextInitialized

  const setIsMuted = localStore().screen.setIsMuted

  const isMainPages = useMemo(() => {
    return path === routes.HOME || path === routes.LEADERBOARD || path === routes.HOW_TO_PLAY || path === routes.CONTEST
  }, [path])

  // Mute main sound when not on main pages
  useEffect(() => {
    if (!mainSound) return

    if (!isMainPages) {
      mainSound.mute()
    } else {
      mainSound.unmute()
    }
  }, [mainSound, isMainPages])

  // Initialize channels instance
  useEffect(() => {
    let instance: Channels | null = null

    const initializeChannels = async () => {
      instance = getChannels()
      setChannelsInstance(instance)
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
        channelsInstance.fadeIn(1)
        gameInstance?.setMuted(false)
        setIsMuted(false)
      } else if (isMutedStore !== null) {
        channelsInstance.fadeOut(1)
        gameInstance?.setMuted(true)
        setIsMuted(true)
      }
    }
  }, [switchOn, channelsInstance, gameInstance, setIsMuted, isMutedStore])

  // Add main sound when on main pages
  useEffect(() => {
    const addMainSound = async () => {
      if (isMainPages && channelsInstance && hasContextInit) {
        try {
          channelsInstance.sampleManager.addSample({ name: MAIN_SOUND, extension: 'mp3' })
          await loadSounds()
          const sound = channelsInstance.play(MAIN_SOUND, { loop: true, fadeInTime: 3 })
          setMainSound(sound)
        } catch (error) {
          console.error('Error adding or playing sound:', error)
        }
      }
    }
    addMainSound()
  }, [channelsInstance, hasContextInit, isMainPages])

  return [switchOn, setSwitchOn]
}
