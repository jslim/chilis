import type { FC } from 'react'
import type { GameController } from '@/game/GameController'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import classNames from 'classnames'

import css from './Container.module.scss'

import { routes } from '@/data/routes'

import { localState, localStore } from '@/store'

import { initializeGame } from '@/services/game'

// import MqttClientManager from '@/services/mqtt-client'
import { getImageUrl } from '@/utils/basic-functions'
import { Endpoints, fetchApi } from '@/utils/fetch-api'

import { useLocalStorage } from '@/hooks/use-local-storage'
import usePauseGameInstance from '@/hooks/use-pause-game-instance'
import { useRefs } from '@/hooks/use-refs'

import { BaseImage } from '@/components/BaseImage'

export interface ViewProps {
  className?: string
  background?: string
}

export type ViewRefs = {
  root: HTMLDivElement
}

export const View: FC<ViewProps> = ({ className, background }) => {
  const refs = useRefs<ViewRefs>()
  const [showGameBorder, setShowGameBorder] = useState<boolean>(false)
  const isModalOpen = localStore().screen.isModalOpen
  const accessToken = localStore().user.accessToken
  const highScore = localStore().user.highScore ?? 0

  const gameInstance = useRef<GameController | null>(null)
  const { push } = useRouter()
  const [, setGameId] = useLocalStorage('gameId')
  const [, setHighScore] = useLocalStorage('highScore')

  usePauseGameInstance(isModalOpen)

  const onGameStarted = useCallback(async () => {
    if (!accessToken) return
    try {
      const response = await fetchApi(`${process.env.NEXT_PUBLIC_API_URL + Endpoints.GAME}`, undefined, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        }
      })

      const apiResponse = response as { gameId: number }

      if (!apiResponse.gameId) {
        console.error('Submission failed:', apiResponse)
      } else if (apiResponse.gameId) {
        console.log('Game started:', apiResponse.gameId)
        localState().user.setGameId(String(apiResponse.gameId))
        setGameId(String(apiResponse.gameId))
      } else {
        console.error('Submission failed:', apiResponse)
      }
    } catch (error) {
      console.error(error)
    }
  }, [accessToken, setGameId])

  const onGameUpdate = useCallback(
    async (score: number, level: number) => {
      const localGameId = localState().user.gameId

      if (!localGameId) return

      try {
        const response = await fetchApi(`${process.env.NEXT_PUBLIC_API_URL + Endpoints.GAME}`, undefined, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`
          },
          body: JSON.stringify({
            gameId: localGameId,
            score,
            level
          })
        })

        const apiResponse = (await response) as []

        if (Array.isArray(apiResponse)) {
          localState().user.setPlayersList(apiResponse)
          console.log('Game updated', apiResponse)
        } else {
          console.error('Error updating:', apiResponse)
        }
      } catch (error) {
        console.error(error)
      }
    },
    [accessToken]
  )

  useEffect(() => {
    const initGame = async () => {
      // let mqttClient: MqttClientManager
      const newGameInstance = await initializeGame()
      onGameStarted()

      // if (localState().user.userId) {
      //   mqttClient = MqttClientManager.getInstance(String(localState().user.userId))
      // }

      newGameInstance.setMuted(localState().screen.isMuted)
      newGameInstance.onGameAction.subscribe((data) => {
        if (data.a === 'start' && localState().user.isTokenValid) {
          // mqttClient.connect(String(localState().user.gameId))
          newGameInstance.setHighScore(localState().user.highScore ?? 0)
        }

        if (data.a === 'complete' && data.s) {
          newGameInstance.setHighScore(data.s)
          localState().user.setHighScore(data.s)
        }

        // if (localState().user.isTokenValid && mqttClient.isConnected) mqttClient.publicAction(data)
      })

      newGameInstance.onShowGameBorder.subscribe(setShowGameBorder)
      newGameInstance.onGameOver.subscribe((data) => {
        localState().user.setHighScore(data.highScore)
        setHighScore(data.highScore > highScore ? data.highScore.toString() : highScore.toString())
        onGameUpdate(data.highScore, data.level)
        push(routes.GAME_OVER)
        // if (localState().user.isTokenValid && mqttClient.isConnected) mqttClient.disconnect()
      })
      newGameInstance.onGameEnd.subscribe((data) => {
        localState().user.setHighScore(data.highScore)
        setHighScore(data.highScore > highScore ? data.highScore.toString() : highScore.toString())
        onGameUpdate(data.highScore, data.level)
        push({ pathname: routes.GAME_OVER, query: { isWinner: true } })
        // if (localState().user.isTokenValid && mqttClient.isConnected) mqttClient.disconnect()
      })

      gameInstance.current = newGameInstance
    }

    if (!gameInstance.current) {
      initGame()
    }

    return () => {
      if (gameInstance.current) {
        gameInstance.current.destroy()
        gameInstance.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onGameStarted, highScore])

  return (
    <div className={classNames('Container', css.root, className, { [css.hasBorder]: showGameBorder })} ref={refs.root}>
      {showGameBorder && background ? (
        <BaseImage className={css.background} data={getImageUrl(background)} alt="" />
      ) : null}
      {/* Game Container */}
      <div id="app" />
    </div>
  )
}

View.displayName = 'Container_View'
