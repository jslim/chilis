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

// Componente para el separador de cuadrados
const SquareSeparator: FC = () => (
  <div className={css.separator}>
    {Array.from({ length: 6 }).map((_, index) => (
      <span key={index} className={css.square}></span>
    ))}
  </div>
)

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

  const { topPlayers, remainingPlayers } = useMemo(() => {
    if (players.length === 0) return { topPlayers: [], remainingPlayers: [] }

    return { topPlayers: players.slice(0, maxPlayers), remainingPlayers: players.slice(maxPlayers) }
  }, [players, maxPlayers])

  return (
    <div
      className={classNames('ScoreList', css.root, className, { [css.isGameOver]: isGameOverScreen })}
      ref={refs.root}
    >
      {title && <p>{title}</p>}
      <ul className={css.list}>
        {topPlayers.map((player, index) => (
          <li className={css.item} key={index}>
            <span
              className={classNames(css.player, { [css.isCurrentPlayer]: index + 1 === Number(currentPlayer?.rank) })}
            >
              {index + 1} {truncateText(player.nickname, 9)}
            </span>
            <span
              className={classNames(css.score, { [css.isCurrentPlayer]: index + 1 === Number(currentPlayer?.rank) })}
            >
              {player.score}
            </span>
          </li>
        ))}
      </ul>

      {remainingPlayers.length > 0 && <SquareSeparator />}

      {remainingPlayers.length > 0 && (
        <ul className={classNames(css.list, css.remaining)}>
          {remainingPlayers.map((player, index) => (
            <li className={css.item} key={index + maxPlayers}>
              <span
                className={classNames(css.player, {
                  [css.isCurrentPlayer]: index + 1 + maxPlayers === Number(currentPlayer?.rank)
                })}
              >
                {index + 1 + maxPlayers} {truncateText(player.nickname, 9)}
              </span>
              <span
                className={classNames(css.score, {
                  [css.isCurrentPlayer]: index + 1 + maxPlayers === Number(currentPlayer?.rank)
                })}
              >
                {player.score}
              </span>
            </li>
          ))}
        </ul>
      )}

      {currentPlayer?.nickname && !isGameOverScreen && (
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
