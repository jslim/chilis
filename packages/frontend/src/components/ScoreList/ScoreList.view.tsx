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
  maxPlayers = 10,
  currentPlayer,
  currentRankText,
  fullLeaderboardText,
  isGameOverScreen
}) => {
  const refs = useRefs<ViewRefs>()
  const playersToRender = useMemo(() => players.slice(0, maxPlayers), [players, maxPlayers])
  const midIndex = useMemo(() => {
    return Math.ceil(maxPlayers / 2)
  }, [maxPlayers])

  const firstColumnPlayers = playersToRender.slice(0, maxPlayers / 2)
  const secondColumnPlayers = playersToRender.slice(maxPlayers / 2)

  return (
    <div
      className={classNames('ScoreList', css.root, className, { [css.isGameOver]: isGameOverScreen })}
      ref={refs.root}
    >
      {title && <p>{title}</p>}
      <div className={css.columns}>
        <ul className={css.list}>
          {firstColumnPlayers.map((player, index) => (
            <li className={css.item} key={index}>
              <span
                className={classNames(css.player, { [css.isCurrentPlayer]: index + 1 === Number(currentPlayer?.rank) })}
              >
                {player.rank ?? index + 1} {truncateText(player.nickname, 9)}
              </span>
              <span
                className={classNames(css.score, { [css.isCurrentPlayer]: index + 1 === Number(currentPlayer?.rank) })}
              >
                {player.score}
              </span>
            </li>
          ))}
        </ul>
        <ul className={css.list}>
          {secondColumnPlayers.map((player, index) => (
            <li className={css.item} key={index}>
              <span
                className={classNames(css.player, { [css.isCurrentPlayer]: index + 6 === Number(currentPlayer?.rank) })}
              >
                {midIndex + (index + 1)} {truncateText(player.nickname, 9)}
              </span>
              <span
                className={classNames(css.score, { [css.isCurrentPlayer]: index + 6 === Number(currentPlayer?.rank) })}
              >
                {player.score}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {currentPlayer?.nickname && !isGameOverScreen && (
        <div className={css.currentPlayer}>
          <h3 className={css.rankTitle}>{currentRankText}</h3>
          <div className={classNames(css.item, css.current)}>
            <span className={css.player}>
              {Number(currentPlayer.rank) > 500 ? '>500' : currentPlayer.rank} {truncateText(currentPlayer.nickname, 9)}
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
