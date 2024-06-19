import { Channels } from '@mediamonks/channels'

import { GAME_SOUNDS_BASE_URL } from '@/game/game.config'

let channelsInstance: Channels | null = null

export const initChannels = () => {
  if (!channelsInstance && typeof window !== 'undefined') {
    const soundsExtension = isOggSupported() ? 'ogg' : 'mp3'
    channelsInstance = new Channels({
      soundsPath: GAME_SOUNDS_BASE_URL,
      soundsExtension
    })

    console.log('initChannels', channelsInstance)
  }
  return channelsInstance
}

export const getChannels = () => {
  if (!channelsInstance) initChannels()

  return channelsInstance
}

export async function loadSounds() {
  if (channelsInstance) {
    await channelsInstance.loadSounds()
  }
}

export function playSound(sound: string) {
  if (channelsInstance) {
    console.log(channelsInstance.getChannels(), 'playSound', sound)
    channelsInstance.play(sound)
  }
}

function isOggSupported() {
  const audio = document.createElement('audio')
  return !!audio.canPlayType && audio.canPlayType('audio/ogg; codecs="vorbis"') !== ''
}