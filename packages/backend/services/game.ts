import { v4 as uuidv4 } from "uuid";
import type GameRepository from "@/repositories/game";
import { GameEventStep, GameStatus } from "@/types/game";

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
   * Checks for an active game for a user and updates the game status to INACTIVE if found.
   * @param userId - The ID of the user.
   */
  public checkForActiveGame = async (userId: string) => {
    try {
      const queryResult = await this.repository.getActiveGameByUser(userId);
      if (
        queryResult &&
        queryResult.Count &&
        queryResult.Count > 0 &&
        queryResult.Items &&
        queryResult.Items.length > 0
      ) {
        const { subReference, gameId } = queryResult.Items[0];
        this.repository.updateGameStatus(String(subReference), String(gameId), GameStatus.INACTIVE);
      }
    } catch (err) {
      throw new Error(`An error occurred while trying to get the active game for the user. ${err}`);
    }
  };

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

  /**
   * Records a step in the game event.
   * @param userSub - The user's sub.
   * @param gameId - The ID of the game.
   * @param step - The game event step to record.
   */
  public async recordStep(userSub: string, gameId: string, step: GameEventStep) {
    step.t = new Date().toISOString();

    try {
      await this.repository.updateGameSteps(userSub, gameId, step);
    } catch (err) {
      throw new Error(`An error occurred while trying to record step. ${err}`);
    }
  }

  /**
   * Retrieves the current steps for a user in a specific game.
   * @param userId - The ID of the user.
   * @param gameId - The ID of the game.
   * @returns {Promise<any>} The current steps for the user in the game.
   * @throws {Error} If an error occurs while trying to get game steps.
   */
  public async getCurrentSteps(userId: string, gameId: string): Promise<any> {
    try {
      return await this.repository.getCurrentSteps(userId, gameId);
    } catch (err) {
      throw new Error(`An error occurred while trying to get game steps. ${err}`);
    }
  }

  /**
   * Validates the game completion based on the steps and score provided.
   * If the game is successfully validated, updates the game status to COMPLETED.
   * If the game is not valid, updates the game status to INVALID.
   * @param userSub - The user's sub.
   * @param eventData - An object containing the gameId and score to validate.
   * @returns A boolean indicating if the game is successfully completed.
   */
  public async validateGame(userSub: string, eventData: { gameId: string; score: number }): Promise<boolean> {
    const { gameId, score } = eventData;

    const queryResult = await this.getCurrentSteps(userSub, gameId);

    const getStepsScore = queryResult.Items[0].steps.reduce((score: number, step: GameEventStep) => {
      return step.hasOwnProperty("p") ? score + Number(step.p) : score;
    }, 0);

    const lastStepComplete = queryResult.Items[0].steps
      .filter((step: GameEventStep) => step.a === "complete")
      .map((step: GameEventStep) => step.s)
      .pop();

    if (lastStepComplete === getStepsScore && getStepsScore === score) {
      await this.repository.updateGameStatus(userSub, gameId);
      return true;
    }

    await this.repository.updateGameStatus(userSub, gameId, GameStatus.INVALID);
    return false;
  }
}
