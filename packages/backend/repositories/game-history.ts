import type DynamoDBClient from "@/services/dynamodb";
import { GameScore, GSILeaderboard } from "@/types/game";
import { PutItemOutput, UpdateItemOutput } from "@aws-sdk/client-dynamodb";
import { generateExpression } from "@/services/dynamodb";

const repository: GameHistoryRepository | null = null;

class GameHistoryRepository {
  constructor(private client: DynamoDBClient) {}

  /**
   * Save the game score to the game history table.
   * If the subReference already exists, the game score will be appended to the existing game scores.
   * If the subReference does not exist, a new record will be created with the game score.
   * @param userSub - The subReference of the user.
   * @param gameScore - An object containing the gameId, score, level, and timestamp of the game.
   * @returns Promise - The result of saving the game score to the history table.
   */
  public async saveGameScoreToHistory(
    userSub: string,
    gameScore: GameScore,
  ): Promise<PutItemOutput | UpdateItemOutput> {
    const record = {
      subReference: userSub,
      gameScore: [gameScore],
    };

    try {
      return await this.client.save(record, { ConditionExpression: "attribute_not_exists(subReference)" });
    } catch (error: any) {
      if (error.name === "ConditionalCheckFailedException") {
        const params = {
          UpdateExpression: "SET gameScore = list_append(gameScore, :newGameScore)",
          ExpressionAttributeValues: {
            ":newGameScore": [gameScore],
          },
        };

        try {
          return await this.client.update({ subReference: userSub }, params);
        } catch (updateError) {
          throw new Error(`Error trying to update: ${updateError}`);
        }
      } else {
        throw new Error(`saveGameScoreToHistory Error: ${error}`);
      }
    }
  }

  /**
   * Update the leaderboard with a new game score.
   * If the user's subReference does not exist in the leaderboard, a new record will be created.
   * If the user's subReference already exists, the game score will be updated if it is higher than the existing score.
   * @param nickname - The nickname of the user.
   * @param userSub - The subReference of the user.
   * @param gameScore - An object containing the gameId, score, level, and timestamp of the game.
   * @returns Promise - The result of updating the leaderboard with the new game score.
   */
  public async updateLeaderboard(
    userSub: string,
    gameScore: GameScore,
  ): Promise<PutItemOutput | UpdateItemOutput | undefined> {
    try {
      return await this.client.save(
        { ...gameScore, subReference: userSub, gsiPK: GSILeaderboard.ALL_TIME_LEADERBOARD },
        { ConditionExpression: "attribute_not_exists(subReference)" },
        process.env.LEADERBOARD_TABLE_NAME,
      );
    } catch (error: any) {
      if (error.name === "ConditionalCheckFailedException") {
        const allowedKeys = ["gameId", "score", "level", "timestamp", "nickname", "loyaltyId"];
        const params = { ...generateExpression(gameScore, allowedKeys), ConditionExpression: `score < :score` };

        try {
          return await this.client.update({ subReference: userSub }, params, process.env.LEADERBOARD_TABLE_NAME);
        } catch (updateError) {
          if (error.name !== "ConditionalCheckFailedException")
            throw new Error(`Error trying to update leaderboard: ${updateError}`);
        }
      } else {
        throw new Error(`updateLeaderboard Error: ${error}`);
      }
    }
  }
}

/**
 * Get the game repository based on the DynamoDB client.
 * If the repository does not exist, a new GameHistory instance will be created.
 * @param client - The DynamoDB client.
 * @returns GameHistory - The game repository instance.
 */
export const getGameHistory = (client: DynamoDBClient): GameHistoryRepository => {
  if (!repository) {
    return new GameHistoryRepository(client);
  }

  return repository;
};

export default GameHistoryRepository;
