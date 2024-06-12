export enum GameStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  COMPLETED = "COMPLETED",
  INVALID = "INVALID",
}

export enum GameActions {
  KILL_ENEMY = "kill-enemy",
  DROP_ENEMY = "drop-enemy",
}

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
  timestamp: string;
  gsiPK?: GSILeaderboard;
};

export type leaderboardRecord = {
  nickname: string;
  score: number;
  rank: number | string;
};
