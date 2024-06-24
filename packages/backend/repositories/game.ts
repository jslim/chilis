import { GameStatus, GameEventStep } from "@/types/game";
import { PutItemOutput, QueryOutput, UpdateItemOutput } from "@aws-sdk/client-dynamodb";
import type DynamoDBClient from "@/services/dynamodb";

const repository: GameRepository | null = null;

class GameRepository {
  constructor(private client: DynamoDBClient) {}

  /**
   * Check if a game is active based on the provided userId.
   * @param id - The userId of the game to check.
   * @returns Promise<boolean> - A boolean indicating if the game is active.
   */
  public async isGameActive(userId: string): Promise<boolean> {
    const params = {
      KeyConditionExpression: "#subReferenceName = :subReferenceValue",
      FilterExpression: "#statusName = :statusValue",
      ExpressionAttributeValues: {
        ":subReferenceValue": userId,
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

  public getActiveGameByUser = async (userId: string): Promise<QueryOutput> => {
    const params = {
      KeyConditionExpression: "#subReferenceName = :subReferenceValue",
      FilterExpression: "#statusName = :statusValue",
      ExpressionAttributeValues: {
        ":subReferenceValue": userId,
        ":statusValue": GameStatus.ACTIVE,
      },
      ExpressionAttributeNames: {
        "#subReferenceName": "subReference",
        "#statusName": "status",
      },
    };

    try {
      return await this.client.query(
        {
          ...params,
        },
        true,
      );
    } catch (err) {
      throw new Error(`Error: ${err}`);
    }
  };

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
      return await this.client.update(keys, params);
    } catch (err) {
      throw new Error(`updateGameStatus Error: ${err}`);
    }
  }

  public async updateGameSteps(userSub: string, gameId: string, newStep: GameEventStep): Promise<UpdateItemOutput> {
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
      return await this.client.update(keys, params);
    } catch (err) {
      throw new Error(`updateGameSteps Error: ${err}`);
    }
  }

  public async getCurrentSteps(userId: string, gameId: string) {
    const params = {
      KeyConditionExpression: "#sub = :sub AND #sk = :sk",
      ExpressionAttributeValues: {
        ":sub": userId,
        ":sk": gameId,
      },
      ExpressionAttributeNames: {
        "#sub": "subReference",
        "#sk": "gameId",
      },
      ProjectionExpression: "steps",
      ScanIndexForward: false,
    };

    return await this.client.query(params);
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
