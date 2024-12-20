import { Channels } from '@mediamonks/channels'

import { CHANNEL_SOUND_PATH, GAME_LOGS } from '@/game/game.config'

let channelsInstance: Channels | null = null

export const initChannels = () => {
  if (!channelsInstance && typeof window !== 'undefined') {
    const soundsExtension = isOggSupported() ? 'ogg' : 'mp3'
    channelsInstance = new Channels({
      soundsPath: CHANNEL_SOUND_PATH,
      soundsExtension
    })

    if (GAME_LOGS) console.log('initChannels', channelsInstance)
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
    return channelsInstance.play(sound)
  }
}

function isOggSupported() {
  const audio = document.createElement('audio')
  return !!audio.canPlayType && audio.canPlayType('audio/ogg; codecs="vorbis"') !== ''
}
