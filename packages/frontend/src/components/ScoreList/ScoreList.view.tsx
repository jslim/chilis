import type { ControllerProps } from './ScoreList.controller'

import { type FC, useMemo } from 'react'
import classNames from 'classnames'

import css from './ScoreList.module.scss'

import { routes } from '@/data/routes'

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
  players = [],
  maxPlayers,
  currentPlayer,
  currentRankText,
  fullLeaderboardText
}) => {
  const refs = useRefs<ViewRefs>()

  const displayedPlayers = useMemo(() => {
    if (players.length === 0) return []

    //  const sortedPlayers = [...players].sort((a, b) => Number(b.score) - Number(a.score))
    return maxPlayers !== null ? players.slice(0, maxPlayers) : players
  }, [players, maxPlayers])

  return (
    <div className={classNames('ScoreList', css.root, className)} ref={refs.root}>
      {title && <p>{title}</p>}
      <ul className={css.list}>
        {displayedPlayers.map((player, index) => (
          <li className={css.item} key={index}>
            <span
              className={classNames(css.player, { [css.isCurrentPlayer]: index + 1 === Number(currentPlayer?.rank) })}
            >
              {index + 1} {truncateText(player.nickname, 9)}
            </span>
            <span className={css.score}>{player.score}</span>
          </li>
        ))}
      </ul>

      {currentPlayer?.nickname && (
        <div className={css.currentPlayer}>
          <h3 className={css.rankTitle}>{currentRankText}</h3>
          <div className={classNames(css.item, css.current)}>
            <span className={css.player}>
              {Number(currentPlayer.rank) > 500 ? '???' : currentPlayer.rank} {truncateText(currentPlayer.nickname, 9)}
            </span>
            <span className={css.score}>{currentPlayer.score}</span>
          </div>
        </div>
      )}

      {fullLeaderboardText && (
        <BaseButton className={css.leaderboardLink} href={routes.FULL_LEADERBOARD}>
          {fullLeaderboardText}
        </BaseButton>
      )}
    </div>
  )
}

View.displayName = 'ScoreList_View'
