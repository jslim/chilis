type GameAction = {
  // action
  a:
    | 'pause'
    | 'resume'
    | 'game-start'
    | 'game-end'
    | 'level-start'
    | 'level-end'
    | 'burger-complete'
    | 'burger-drop'
    | 'enemy-hit'
    | 'player-hit'

  // name
  n?: string

  // level
  l: number

  // count
  c?: number

  // points
  p?: number

  // points
  s?: number
}
