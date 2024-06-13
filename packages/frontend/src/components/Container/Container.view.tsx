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
import { Endpoints, fetchApi } from '@/utils/fetchApi'

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
  const [isPaused, setIsPaused] = useState<boolean>(false)
  const [gameInstance, setGameInstance] = useState<GameController>()
  const { push } = useRouter()
  const accessToken = localStore().user.accessToken

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

      console.log('Game started:', apiResponse)

      if (!apiResponse.gameId) {
        console.error('Submission failed:', apiResponse)
      } else {
        localState().user.setGameId(String(apiResponse.gameId))
      }
    } catch (error) {
      console.error(error)
    }
  }, [accessToken])

  useEffect(() => {
    const initGame = async () => {
      const game = await initializeGame()
      setGameInstance(game)

      game.onGameAction.subscribe((data) => {
        if (data.a === 'start') {
          onGameStarted()
        }
      })

      game.onShowGameBorder.subscribe(setShowGameBorder)
      game.onGameOver.subscribe(() => push(routes.GAME_OVER))
      game.onLevelComplete.subscribe((data) => {
        if (data.level === 18) {
          push({ pathname: routes.GAME_OVER, query: { isWinner: true } })
        }
      })
    }

    if (!gameInstance) {
      initGame()
    }
  }, [gameInstance, onGameStarted, push])

  useEffect(() => {
    if (!gameInstance) return

    if (isModalOpen && !isPaused) {
      gameInstance.pause()
      setIsPaused(true)
    } else if (!isModalOpen && isPaused) {
      gameInstance.resume()
      setIsPaused(false)
    }
  }, [isModalOpen, isPaused, gameInstance])

  return (
    <div className={classNames('Container', css.root, className, { [css.hasBorder]: showGameBorder })} ref={refs.root}>
      {showGameBorder && <BaseImage className={css.background} data={getImageUrl(background)} alt="" />}
      {/* Game Container */}
      <div id="app" />
    </div>
  )
}

View.displayName = 'Container_View'
