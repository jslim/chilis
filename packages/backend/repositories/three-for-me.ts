import type DynamoDBClient from "@/services/dynamodb";

const repository: TFMRepository | null = null;

class TFMRepository {
  constructor(private client: DynamoDBClient) {}

  public setTFM = async (data: { userSub: string; gameId: string; timestamp: string }) => {
    const { userSub, gameId, timestamp } = data;
    const record = {
      subReference: userSub,
      gameId: gameId,
      timestamp,
    };

    try {
      const queryResult = await this.getTFMByUserSub(userSub);
      const count = queryResult.Count;
      if (count === 0)
        return await this.client.save(record, { ConditionExpression: "attribute_not_exists(subReference)" });
    } catch (error: any) {
      if (error.name === "ConditionalCheckFailedException") {
        throw new Error(`The user with ID: ${userSub} had previously completed three for me.`);
      }

      throw new Error(`An error occurred while trying to record three for me. gameId: ${gameId}`);
    }
  };

  private getTFMByUserSub = async (userSub: string) => {
    const params = {
      FilterExpression: "#userSub = :userSub",
      ExpressionAttributeNames: {
        "#userSub": "subReference",
      },
      ExpressionAttributeValues: {
        ":userSub": userSub,
      },
      ProjectionExpression: "subReference",
    };

    return await this.client.scan(params);
  };
}

/**
 * Retrieves the user repository based on the provided client.
 * If the repository is not initialized, it creates a new instance.
 * @param client - The CognitoIdentityProviderClient used to interact with the repository.
 * @returns An instance of TFMRepository.
 */
export const getTFMRepository = (client: DynamoDBClient): TFMRepository => {
  if (!repository) {
    return new TFMRepository(client);
  }

  return repository;
};

export default TFMRepository;
