import { GameScore, GameStatus, GSILeaderboard, GameSteps } from "@/types/game";
import { PutItemOutput, UpdateItemOutput } from "@aws-sdk/client-dynamodb";
import type DynamoDBClient from "@/services/dynamodb";
import { generateExpression } from "@/services/dynamodb";

const repository: GameRepository | null = null;

class GameRepository {
  constructor(private client: DynamoDBClient) {}

  /**
   * Check if a game is active based on the provided ID.
   * @param id - The ID of the game to check.
   * @returns Promise<boolean> - A boolean indicating if the game is active.
   */
  public async isGameActive(id: string): Promise<boolean> {
    const params = {
      KeyConditionExpression: "#subReferenceName = :subReferenceValue",
      FilterExpression: "#statusName = :statusValue",
      ExpressionAttributeValues: {
        ":subReferenceValue": id,
        ":statusValue": GameStatus.ACTIVE,
      },
      ExpressionAttributeNames: {
        "#subReferenceName": "subReference",
        "#statusName": "status",
      },
      ProjectionExpression: "subReference",
    };
    let activeGames = 0;
    let lastEvaluatedKey = undefined;

    do {
      const queryResult = await this.client.query(
        {
          ...params,
          ExclusiveStartKey: lastEvaluatedKey,
        },
        true,
      );

      if (queryResult.Count && queryResult.Count >= 1) {
        activeGames = queryResult.Count;
        break;
      }

      lastEvaluatedKey = queryResult.LastEvaluatedKey;
    } while (lastEvaluatedKey);

    return activeGames > 0;
  }

  /**
   * Save a new game record in the database.
   * @param data - An object containing the subReference, newGameID, createdAt, and steps of the game.
   * @returns Promise - The result of creating a new game record.
   */
  public async createNewGame(data: {
    subReference: string;
    newGameID: string;
    createdAt: string;
    ttl: number;
  }): Promise<PutItemOutput> {
    const record = {
      subReference: data.subReference,
      gameId: data.newGameID,
      status: GameStatus.ACTIVE,
      timestamp: data.createdAt,
      ttl: data.ttl,
      steps: [],
    };

    try {
      return this.client.save(record);
    } catch (err) {
      throw new Error(`Error: ${err}`);
    }
  }

  /**
   * Update the status of a game in the database.
   * @param userSub - The subReference of the user.
   * @param gameId - The ID of the game.
   * @param newStatus - The new status to update the game to (default: COMPLETED).
   * @returns Promise - The result of updating the game status.
   */
  public async updateGameStatus(
    userSub: string,
    gameId: string,
    newStatus: GameStatus = GameStatus.COMPLETED,
  ): Promise<UpdateItemOutput> {
    const keys = {
      subReference: userSub,
      gameId: gameId,
    };

    const params = {
      UpdateExpression: "SET #status = :status",
      ExpressionAttributeValues: {
        ":status": newStatus,
      },
      ExpressionAttributeNames: {
        "#status": "status",
      },
      ConditionExpression: "attribute_exists(subReference) AND attribute_exists(gameId)",
    };

    try {
      return await this.client.update(keys, params, process.env.GAMES_SESSION_TABLE_NAME);
    } catch (err) {
      throw new Error(`updateGameStatus Error: ${err}`);
    }
  }

  public async updateGameSteps(userSub: string, gameId: string, newStep: GameSteps): Promise<UpdateItemOutput> {
    const keys = {
      subReference: userSub,
      gameId: gameId,
    };

    const params = {
      UpdateExpression: "SET #steps = list_append(#steps, :newStep)",
      ExpressionAttributeValues: {
        ":newStep": [newStep],
      },
      ExpressionAttributeNames: {
        "#steps": "steps",
      },
      ConditionExpression: "attribute_exists(subReference) AND attribute_exists(gameId)",
    };

    try {
      return await this.client.update(keys, params, process.env.GAMES_SESSION_TABLE_NAME);
    } catch (err) {
      throw new Error(`updateGameSteps Error: ${err}`);
    }
  }

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
        const allowedKeys = ["gameId", "score", "level", "timestamp", "nickname"];
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
 * If the repository does not exist, a new GameRepository instance will be created.
 * @param client - The DynamoDB client.
 * @returns GameRepository - The game repository instance.
 */
export const getGameRepository = (client: DynamoDBClient): GameRepository => {
  if (!repository) {
    return new GameRepository(client);
  }

  return repository;
};

export default GameRepository;
