import type { ControllerProps } from './ScoreList.controller'

import { type FC, useMemo } from 'react'
import classNames from 'classnames'

import css from './ScoreList.module.scss'

import { useRefs } from '@/hooks/use-refs'

export interface ViewProps extends ControllerProps {}

export type ViewRefs = {
  root: HTMLDivElement
}

// View (pure and testable component, receives props exclusively from the controller)
export const View: FC<ViewProps> = ({ className, title, players, maxPlayers }) => {
  const refs = useRefs<ViewRefs>()

  const displayedPlayers = useMemo(() => {
    const sortedPlayers = [...players].sort((a, b) => b.score - a.score)
    return maxPlayers !== null ? sortedPlayers.slice(0, maxPlayers) : sortedPlayers
  }, [players, maxPlayers])

  return (
    <div className={classNames('ScoreList', css.root, className)} ref={refs.root}>
      <h1>{title}</h1>
      <ul className={css.list}>
        {displayedPlayers.map((player) => (
          <li key={player.id}>
            {player.name}: {player.score}
          </li>
        ))}
      </ul>
    </div>
  )
}

View.displayName = 'ScoreList_View'
