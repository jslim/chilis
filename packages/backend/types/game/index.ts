export enum GameStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  COMPLETED = "COMPLETED",
  INVALID = "INVALID",
}

export enum GameActions {
  KILL_ENEMY = "kill-enemy",
  DROP_ENEMY = "drop-enemy",
  BURGER_PART = "burger-part",
  COMPLETE = "complete",
  PAUSE = "pause",
  RESUME = "resume",
  START = "start",
  GAME_OVER = "game-over",
  BURGER_COMPLETE = "burger-complete",
  THREE_FOR_ME = "3-for-me",
}

export const GameActionsWithScore = [GameActions.COMPLETE, GameActions.GAME_OVER];

export const GameActionsWithPoints = [
  GameActions.KILL_ENEMY,
  GameActions.DROP_ENEMY,
  GameActions.BURGER_PART,
  GameActions.BURGER_COMPLETE,
  GameActions.THREE_FOR_ME,
];

export enum GSILeaderboard {
  ALL_TIME_LEADERBOARD = "ALL_TIME_LEADERBOARD",
}

export type Game = {
  subReference: string;
  gameId: string;
  status: GameStatus;
  timestamp: string;
  steps: GameSteps;
};

export type GameEvent = {
  userId: string;
  gameId: string;
  clientId: string;
  eventType: string;
  step: string;
};

export type GameEventStep = {
  a: GameActions;
  l: number;
  s?: number;
  t?: string;
  p?: number;
  n?: string;
  c?: string;
};

export type GameSteps = {
  action: GameActions;
  score: number;
  level: number;
  timestamp: string;
};

export type GameScore = {
  gameId: string;
  score: number;
  level: number;
  nickname?: string;
  loyaltyId?: string;
  timestamp: string;
  gsiPK?: GSILeaderboard;
};

export type leaderboardRecord = {
  nickname?: string;
  score?: number;
  rank?: number | string;
};
