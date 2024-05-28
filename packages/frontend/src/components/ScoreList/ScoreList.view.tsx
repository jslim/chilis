import type { ControllerProps } from './ScoreList.controller'

import { type FC, useMemo } from 'react'
import classNames from 'classnames'

import css from './ScoreList.module.scss'

import { truncateText } from '@/utils/basic-functions'

import { useRefs } from '@/hooks/use-refs'

import { BaseButton } from '@/components/BaseButton'

export interface ViewProps extends ControllerProps {}

export type ViewRefs = {
  root: HTMLDivElement
}

// View (pure and testable component, receives props exclusively from the controller)
export const View: FC<ViewProps> = ({
  className,
  title,
  players,
  maxPlayers,
  currentPlayer,
  currentRankText,
  fullLeaderboardText
}) => {
  const refs = useRefs<ViewRefs>()

  const displayedPlayers = useMemo(() => {
    const sortedPlayers = [...players].sort((a, b) => b.score - a.score)
    return maxPlayers !== null ? sortedPlayers.slice(0, maxPlayers) : sortedPlayers
  }, [players, maxPlayers])

  return (
    <div className={classNames('ScoreList', css.root, className)} ref={refs.root}>
      {title && <p>{title}</p>}
      <ul className={css.list}>
        {displayedPlayers.map((player, index) => (
          <li className={css.item} key={index}>
            <span className={css.player}>
              {index + 1} {truncateText(player.name, 9)}
            </span>
            <span className={css.score}>{player.score}</span>
          </li>
        ))}
      </ul>

      {currentPlayer && (
        <div className={css.currentPlayer}>
          <h3 className={css.rankTitle}>{currentRankText}</h3>
          <div className={classNames(css.item, css.current)}>
            <span className={css.player}>
              {currentPlayer.rank} {truncateText(currentPlayer.name, 9)}
            </span>
            <span className={css.score}>{currentPlayer.score}</span>
          </div>
        </div>
      )}

      <BaseButton className={css.leaderboardLink}>{fullLeaderboardText}</BaseButton>
    </div>
  )
}

View.displayName = 'ScoreList_View'
