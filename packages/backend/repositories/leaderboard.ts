import { GSILeaderboard } from "@/types/game";
import type DynamoDBClient from "@/services/dynamodb";
import type { QueryOutput, WriteRequest } from "@aws-sdk/client-dynamodb";
import { ALLTIME_LEADERBOARD_INDEX } from "@/libs/config";

const repository: LeaderboardRepository | null = null;

class LeaderboardRepository {
  constructor(private client: DynamoDBClient) {}

  /**
   * Retrieves leaderboard data based on the provided page size and optional LastEvaluatedKey.
   * @param pageSize - The number of items to retrieve in a page.
   * @param LastEvaluatedKey - The key to start the query from (optional).
   * @returns A promise that resolves to the leaderboard data.
   */
  public getLeaderboard = async (pageSize: number, LastEvaluatedKey: any = undefined): Promise<QueryOutput> => {
    const params = {
      IndexName: ALLTIME_LEADERBOARD_INDEX,
      KeyConditionExpression: "#gsiPK = :gsiPK",
      ExpressionAttributeValues: {
        ":gsiPK": GSILeaderboard.ALL_TIME_LEADERBOARD,
      },
      ExpressionAttributeNames: {
        "#gsiPK": "gsiPK",
      },
      ProjectionExpression: "nickname, score",
      ScanIndexForward: false,
      Limit: pageSize,
      ExclusiveStartKey: LastEvaluatedKey,
    };

    return await this.client.query(params);
  };

  public getRecordByPrefix = async (prefix: string) => {
    const params = {
      FilterExpression: "begins_with(#nickname, :prefix)",
      ExpressionAttributeNames: {
        "#nickname": "nickname",
      },
      ExpressionAttributeValues: {
        ":prefix": prefix,
      },
      ProjectionExpression: "subReference, nickname",
    };

    return await this.client.scan(params);
  };

  public batchWrite = async (deleteRequest: WriteRequest[]) => {
    await this.client.batchWrite(deleteRequest);
  };
}

/**
 * Retrieves the leaderboard repository based on the provided client.
 * If the repository is not initialized, it creates a new instance.
 * @param client - The DynamoDBClient used to interact with the repository.
 * @returns An instance of LeaderboardRepository.
 */
export const getLeaderboarRepository = (client: DynamoDBClient): LeaderboardRepository => {
  if (!repository) {
    return new LeaderboardRepository(client);
  }

  return repository;
};

export default LeaderboardRepository;
