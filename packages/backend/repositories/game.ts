import { GameStatus, GameEventStep } from "@/types/game";
import { PutItemOutput, QueryOutput, UpdateItemOutput } from "@aws-sdk/client-dynamodb";
import type DynamoDBClient from "@/services/dynamodb";

import { logger } from "@/libs/powertools";

logger.appendKeys({
  namespace: "Lambda-Game-Repositories",
  service: "AWS::Lambda",
});

const repository: GameRepository | null = null;

interface activeGame {
  subReference: string;
  gameId: string;
  timestamp: string;
}

class GameRepository {
  constructor(private client: DynamoDBClient) {}

  private getActiveGamesParams(userId: string): Object {
    return {
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
  }

  /**
   * Check if a game is active based on the provided userId.
   * @param id - The userId of the game to check.
   * @returns Promise<boolean> - A boolean indicating if the game is active.
   */
  public async isGameActive(userId: string): Promise<boolean> {
    const params = { ...this.getActiveGamesParams(userId), ProjectionExpression: "subReference" };
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
   * Manage active games for a specific user.
   * If the number of active games exceeds 3, mark the oldest game as invalid.
   * @param userId - The userId of the user.
   * @returns Promise<void>
   */
  public async manageActiveGames(userId: string): Promise<void> {
    let activeGames: activeGame[] = [];
    let lastEvaluatedKey = undefined;

    do {
      const queryResult = await this.client.query(
        {
          KeyConditionExpression: "#subReferenceName = :subReferenceValue",
          FilterExpression: "#statusName = :statusValue",
          ExpressionAttributeValues: {
            ":subReferenceValue": userId,
            ":statusValue": GameStatus.ACTIVE,
          },
          ExpressionAttributeNames: {
            "#subReferenceName": "subReference",
            "#statusName": "status",
            "#ts": "timestamp",
          },
          ProjectionExpression: "subReference, gameId, #ts",
          ExclusiveStartKey: lastEvaluatedKey,
        },
        true,
      );

      activeGames = activeGames.concat(queryResult.Items as unknown as activeGame[]);
      if (activeGames.length >= 3) {
        activeGames.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        this.updateGameStatus(String(activeGames[0].subReference), String(activeGames[0].gameId), GameStatus.INVALID);

        logger.error({
          eventType: "maximumActiveGameInfo",
          UserId: activeGames[0].subReference,
          gameId: activeGames[0].gameId,
          timestamp: new Date().toISOString(),
          message: "Maximum active games capacity reached; This game was marked invalid.",
        });
        break;
      }

      lastEvaluatedKey = queryResult.LastEvaluatedKey;
    } while (lastEvaluatedKey);
  }

  /**
   * Get the active game for a specific user.
   * @param userId - The userId of the user.
   * @returns Promise<QueryOutput> - The query output.
   */
  public getActiveGameByUser = async (userId: string): Promise<QueryOutput> => {
    const params = this.getActiveGamesParams(userId);

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
        ":complete": GameStatus.COMPLETED,
        ":invalid": GameStatus.INVALID,
      },
      ExpressionAttributeNames: {
        "#steps": "steps",
        "#status": "status",
      },
      ConditionExpression:
        "attribute_exists(subReference) AND attribute_exists(gameId) AND #status <> :complete AND #status <> :invalid",
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
