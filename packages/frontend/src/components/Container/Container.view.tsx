import type { GameController } from '@/game/GameController'
import type { ControllerProps } from './Container.controller'

import { type FC, useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import classNames from 'classnames'

import css from './Container.module.scss'

import { routes } from '@/data/routes'

import { localState, localStore } from '@/store'

import { initializeGame } from '@/services/game'

import { getImageUrl } from '@/utils/basic-functions'
import { Endpoints, fetchApi } from '@/utils/fetch-api'

import { useLocalStorage } from '@/hooks/use-local-storage'
import usePauseGameInstance from '@/hooks/use-pause-game-instance'
import { useRefs } from '@/hooks/use-refs'
import clientMqtt5 from '@/services/mqtt-client'
import { mqtt5 } from 'aws-iot-device-sdk-v2'

import { BaseImage } from '@/components/BaseImage'

export interface ViewProps extends ControllerProps {}

export type ViewRefs = {
  root: HTMLDivElement
}

// View (pure and testable component, receives props exclusively from the controller)
export const View: FC<ViewProps> = ({ className, background }) => {
  const refs = useRefs<ViewRefs>()
  const [showGameBorder, setShowGameBorder] = useState<boolean>(false)
  const isModalOpen = localStore().screen.isModalOpen
  const accessToken = localStore().user.accessToken
  const [gameInstance, setGameInstance] = useState<GameController | null>(null)
  const { push } = useRouter()
  const [gameId, setGameId] = useLocalStorage('gameId')

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
      } else {
        console.log('Game started:', apiResponse.gameId)
        localState().user.setGameId(String(apiResponse.gameId))
        setGameId(String(apiResponse.gameId))
      }
    } catch (error) {
      console.error(error)
    }
  }, [accessToken, setGameId])

  const onGameUpdate = useCallback(
    async (score: number, level: number) => {
      if (!gameId) return

      try {
        const response = await fetchApi(`${process.env.NEXT_PUBLIC_API_URL + Endpoints.GAME}`, undefined, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`
          },
          body: JSON.stringify({
            gameId,
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
    [accessToken, gameId]
  )

  useEffect(() => {
    const initGame = async () => {
      const mqttClient = await clientMqtt5()
      mqttClient.on('connectionSuccess', async (event: mqtt5.ConnectionSuccessEvent) => {
        mqttClient.publish({
          qos: mqtt5.QoS.AtMostOnce,
          topicName: 'chili/game/action/4606ce0d-0d57-45ea-9646-61d84a3dcd8e',
          payload: {
            userId: '54c844d8-e001-70e3-ecd1-0d486dc47029',
            gameId: '4606ce0d-0d57-45ea-9646-61d84a3dcd8e',
            eventType: 'gameAction',
            step: { a: 'start', l: 1 }
          }
        })
      })

      const game = await initializeGame()
      setGameInstance(game)

      game.onGameAction.subscribe((data) => {
        if (data.a === 'start') {
          onGameStarted()
          mqttClient.start()
          // Publish to clean up de action de el juego
          game.setHighScore(localState().user.highScore ?? 0)
        }

        if (data.a === 'complete' && data.s) {
          game.setHighScore(data.s)
          localState().user.setHighScore(data.s)
        }

        if (data.a !== 'start') {
          mqttClient.publish({
            qos: mqtt5.QoS.AtMostOnce,
            //topicName: `chili/game/action/${gameId}`,
            topicName: 'chili/game/action/12345',
            payload: JSON.stringify({
              userId: '54c844d8-e001-70e3-ecd1-0d486dc47029',
              gameId: '4606ce0d-0d57-45ea-9646-61d84a3dcd8e',
              eventType: 'gameAction',
              step: data
            })
          })
        }
      })

      game.onShowGameBorder.subscribe(setShowGameBorder)
      game.onGameOver.subscribe((data) => {
        console.log(data, 'game over')
        if (mqttClient) {
          mqttClient.stop()
          mqttClient.close()
        }
        onGameUpdate(data.highScore, data.level)
        push(routes.GAME_OVER)
      })
      game.onGameEnd.subscribe((data) => {
        if (mqttClient) {
          mqttClient.stop()
          mqttClient.close()
        }
        onGameUpdate(data.highScore, data.level)
        push({ pathname: routes.GAME_OVER, query: { isWinner: true } })
      })
    }

    if (!gameInstance) {
      initGame()
    }

    return () => {
      //  gameInstance?.destroy()
    }
  }, [gameInstance, onGameStarted, onGameUpdate, push])

  return (
    <div className={classNames('Container', css.root, className, { [css.hasBorder]: showGameBorder })} ref={refs.root}>
      {showGameBorder ? <BaseImage className={css.background} data={getImageUrl(background)} alt="" /> : null}
      {/* Game Container */}
      <div id="app" />
    </div>
  )
}

View.displayName = 'Container_View'
