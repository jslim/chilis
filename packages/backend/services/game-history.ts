import type GameHistoryRepository from "@/repositories/game-history";

export default class GameHistoryServices {
  constructor(private repository: GameHistoryRepository) {}
  /**
   * Records the game score for a user.
   * @param nickname - The nickname of the user.
   * @param data - An object containing userSub, gameId, score, and level.
   */
  public async recordGameScore(data: {
    userSub: string;
    loyaltyId: string;
    nickname: string;
    gameId: string;
    score: number;
    level: number;
  }) {
    const { userSub, gameId, score, level, loyaltyId, nickname } = data;
    const gameScore = {
      gameId: gameId,
      score: score,
      level: level,
      timestamp: new Date().toISOString(),
    };
    try {
      // Save game score in userGameHistory
      await this.repository.saveGameScoreToHistory(userSub, gameScore);

      // Update the leaderboard with the new game score
      await this.repository.updateLeaderboard(userSub, { ...gameScore, loyaltyId, nickname });
    } catch (err) {
      throw new Error(`An error occurred while trying to record the game score. ${err}`);
    }
  }
}
