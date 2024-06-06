export type GameAction = {
  /// action
  a:
    | 'pause'
    | 'resume'
    | 'start'
    | 'game-over'
    | 'complete'
    | 'burger-part'
    | 'kill-enemy'
    | 'drop-enemy'
    | 'burger-complete'
    | '3-for-me'

  /// name
  n?: string

  /// level
  l: number

  /// count
  c?: number

  /// points
  p?: number

  /// points
  s?: number
}
