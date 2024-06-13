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
  const [gameInstance, setGameInstance] = useState<GameController>()
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
      const game = await initializeGame()
      setGameInstance(game)

      game.onGameAction.subscribe((data) => {
        if (data.a === 'start') {
          onGameStarted()
          game.setHighScore(localState().user.highScore ?? 0)
        }

        if (data.a === 'complete' && data.s) {
          game.setHighScore(data.s)
          localState().user.setHighScore(data.s)
        }
      })

      game.onShowGameBorder.subscribe(setShowGameBorder)
      game.onGameOver.subscribe((data) => {
        console.log(data, 'game over')
        onGameUpdate(data.highScore, data.level)
        push(routes.GAME_OVER)
      })
      game.onGameEnd.subscribe((data) => {
        onGameUpdate(data.highScore, data.level)
        push({ pathname: routes.GAME_OVER, query: { isWinner: true } })
      })
    }

    if (!gameInstance) {
      initGame()
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
