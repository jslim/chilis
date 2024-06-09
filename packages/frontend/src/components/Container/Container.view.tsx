import type { ControllerProps } from './Container.controller'

import { type FC, useEffect, useState } from 'react'
import classNames from 'classnames'

import css from './Container.module.scss'

import { initializeGame } from '@/services/game'

import { useRefs } from '@/hooks/use-refs'

export interface ViewProps extends ControllerProps {}

export type ViewRefs = {
  root: HTMLDivElement
}

// View (pure and testable component, receives props exclusively from the controller)
export const View: FC<ViewProps> = ({ className }) => {
  const refs = useRefs<ViewRefs>()
  const [showGameBorder, setShowGameBorder] = useState<boolean>(false)

  useEffect(() => {
    const gameInstance = initializeGame()

    if (gameInstance) {
      const handleShowGameBorder = (showBorder: boolean) => {
        setShowGameBorder(showBorder)
      }

      gameInstance.then((game) => {
        game.onShowGameBorder.subscribe(handleShowGameBorder)
      })
    }
  }, [])

  return (
    <div className={classNames('Container', css.root, className)} ref={refs.root}>
      {/* Game Container */}
      <div id="app" className={classNames(css.game, { [css.hasBorder]: showGameBorder })} />
    </div>
  )
}

View.displayName = 'Container_View'
