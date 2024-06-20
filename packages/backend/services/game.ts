import { v4 as uuidv4 } from "uuid";
import type GameRepository from "@/repositories/game";
import { GameSteps } from "@/types/game";

export default class GameService {
  constructor(private repository: GameRepository) {}

  /**
   * Creates a new game for a user.
   * @param subReference - The subReference of the user.
   * @returns The ID of the newly created game or null if creation fails.
   */
  public createNewGame = async (subReference: string): Promise<string | null> => {
    // Validate that there is no other active game
    const activeGame = await this.repository.isGameActive(subReference);
    if (activeGame) {
      throw new Error("There is currently an active game.");
    }

    try {
      const newGameID = uuidv4();
      const createdAt = new Date().toISOString();
      const ttl = Math.floor(new Date().getTime() / 1000) + 12 * 60 * 60;

      await this.repository.createNewGame({ subReference, newGameID, createdAt, ttl });

      return newGameID;
    } catch (err) {
      throw new Error(`An error occurred while trying to create the new game. ${err}`);
    }
  };

  /**
   * Records the game score for a user.
   * @param nickname - The nickname of the user.
   * @param data - An object containing userSub, gameId, score, and level.
   */
  public async recordGameScore(
    nickname: string,
    data: { userSub: string; gameId: string; score: number; level: number },
  ) {
    // TODO: Validate the score sent with the registered actions

    const { userSub, gameId, score, level } = data;
    const gameScore = {
      gameId: gameId,
      score: score,
      level: level,
      timestamp: new Date().toISOString(),
    };
    try {
      // Save game score in userGameHistory
      await this.repository.saveGameScoreToHistory(userSub, gameScore);

      // Change game status to COMPLETED in gameSessionTable
      await this.repository.updateGameStatus(userSub, gameId);

      // Update the leaderboard with the new game score
      await this.repository.updateLeaderboard(userSub, { ...gameScore, nickname });
    } catch (err) {
      throw new Error(`An error occurred while trying to record the game score. ${err}`);
    }
  }

  /** */
  public async recordStep(userSub: string, gameId: string, step: GameSteps) {
    step.timestamp = new Date().toISOString();

    console.log("AQ", userSub, gameId, step);
    try {
      await this.repository.updateGameSteps(userSub, gameId, step);
    } catch (err) {
      throw new Error(`An error occurred while trying to record the game score. ${err}`);
    }
  }
}
