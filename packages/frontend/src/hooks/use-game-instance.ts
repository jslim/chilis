import { useEffect, useState } from 'react'

import { getGameInstance } from '@/services/game'

const useGameInstance = (enable: boolean) => {
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    const gameInstance = getGameInstance()

    if (gameInstance) {
      if (enable && !paused) {
        gameInstance.pause()
        setPaused(true)
      } else if (!enable && paused) {
        gameInstance.resume()
        setPaused(false)
      }
    }
  }, [enable, paused])

  return { paused }
}

export default useGameInstance
