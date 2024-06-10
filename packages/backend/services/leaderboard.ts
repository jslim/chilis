import type { QueryOutput } from "@aws-sdk/client-dynamodb";
import type LeaderboardRepository from "@/repositories/leaderboard";

export default class GameService {
  constructor(private repository: LeaderboardRepository) {}

  /**
   * Retrieves a portion of the leaderboard based on the specified page size.
   * Default oage size 100 records
   *
   * @param pageSize The number of items to retrieve in a single page.
   * @returns A Promise that resolves to the leaderboard data.
   * @throws Error if an error occurs while retrieving the leaderboard.
   */
  public async getLeaderboard(pageSize: number): Promise<QueryOutput> {
    try {
      return await this.repository.getLeaderboard(pageSize);
    } catch (err) {
      throw new Error(`An error occurred returning leaderboard. ${err}`);
    }
  }

  /**
   * Retrieves all-time leaderboard data.
   *
   * @returns An array of all items in the all-time leaderboard.
   * @throws Error if an error occurs while retrieving the all-time leaderboard.
   */
  public async getAllTimeLeaderboard() {
    let lastEvaluatedKey = undefined;

    const allItems = [];

    try {
      do {
        const response = await this.repository.getLeaderboard(1000, lastEvaluatedKey);

        if (response.Items) {
          allItems.push(...response.Items);
        }

        if (response.LastEvaluatedKey) {
          lastEvaluatedKey = response.LastEvaluatedKey;
        } else {
          lastEvaluatedKey = undefined;
        }
      } while (lastEvaluatedKey);
    } catch (err) {
      throw new Error(`An error occurred returning leaderboard. ${err}`);
    }

    return allItems;
  }

  public async deleteRecordByPrefix(prefix: string) {
    try {
      const { Items } = await this.repository.getRecordByPrefix(prefix);
      Items;
      if (Items && Items.length > 0) {
        const deleteRequests = Items.map((item) => ({
          DeleteRequest: {
            Key: {
              subReference: item.subReference,
            },
          },
        }));

        await this.repository.batchWrite(deleteRequests);
      }
    } catch (err) {
      throw new Error(`An error occurred returning leaderboard. ${err}`);
    }
  }
}
