import { logger } from "@/libs/powertools";
import { leaderboardRecord } from "@/types/game";
import { MAX_LEADERBOARD_RECORD } from "@/libs/config";
import type LeaderboardRepository from "@/repositories/leaderboard";

export default class LeaderboardService {
  constructor(private repository: LeaderboardRepository) {}

  /**
   * Retrieves all-time leaderboard data.
   *
   * @returns An array of all items in the all-time leaderboard.
   * @throws Error if an error occurs while retrieving the all-time leaderboard.
   */
  public async allTimeLeaderboard(pageSize: number) {
    let lastEvaluatedKey = undefined;

    const allItems = [];

    try {
      do {
        const response = await this.repository.getLeaderboard(pageSize, lastEvaluatedKey);

        if (response.Items) {
          allItems.push(...response.Items);
        }

        if (allItems.length < pageSize && response.LastEvaluatedKey) {
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

  /**
   * Deletes records from the leaderboard based on a specified prefix.
   *
   * @param prefix The prefix to match and delete records.
   * @throws Error if an error occurs while deleting records.
   */
  public async deleteRecordByPrefix(prefix: string) {
    try {
      const { Items } = await this.repository.getRecordBeginsWith(prefix);
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
      throw new Error(`An error occurred while deleting leaderboard records. ${err}`);
    }
  }

  /**
   * Retrieves the leaderboard data with a specific user's record.
   *
   * @param nickname The nickname of the user to retrieve the leaderboard for.
   * @param numRecords The number of records to retrieve.
   * @returns An object containing the leaderboard data and the user's record.
   */
  public async getLeaderboard(nickname: string | undefined, numRecords: number) {
    let userIndex = -1;
    let userRecord = {};
    const allTimeBoard = await this.allTimeLeaderboard(numRecords);

    if (nickname) {
      userIndex = allTimeBoard.findIndex((item) => String(item.nickname) === nickname);

      if (userIndex === -1) {
        userRecord = await this.getRecordByNickname(nickname);
      } else {
        userRecord = { ...allTimeBoard[userIndex], rank: userIndex + 1 };
      }
    }

    return {
      leaderboard: allTimeBoard,
      user: userRecord,
    };
  }

  /**
   * Retrieves a mini leaderboard for a specific user based on their nickname.
   *
   * @param nickname The nickname of the user to retrieve the mini leaderboard for.
   * @returns An array of leaderboard records representing the mini leaderboard.
   * @throws Error if an error occurs during the retrieval process.
   */
  public async getMiniBoard(nickname: string) {
    let userIndex = -1;
    let miniBoard: leaderboardRecord[] = [];
    const allTimeBoard = await this.allTimeLeaderboard(MAX_LEADERBOARD_RECORD);

    userIndex = allTimeBoard.findIndex((item) => String(item.nickname) === nickname);
    const targetPosition = userIndex === -1 ? 499 : userIndex; // Indicates if the user is not among the first 500

    try {
      const start = Math.max(0, targetPosition - 4);
      const end = Math.min(targetPosition <= 4 ? 4 : targetPosition, allTimeBoard.length - 1);

      for (let i = start; i <= end; i++) {
        miniBoard.push({
          nickname: String(allTimeBoard[i].nickname),
          score: Number(allTimeBoard[i].score),
          rank: i + 1,
        });
      }

      if (userIndex === -1) {
        miniBoard.shift();
        miniBoard.push(await this.getRecordByNickname(nickname));
      }
    } catch (err) {
      throw new Error(`An error occurred trying to return the miniboard. ${err}`);
    }

    return miniBoard;
  }

  /**
   * Retrieves a user record from the leaderboard based on the provided nickname.
   *
   * @param nickname The nickname of the user to retrieve the record for.
   * @returns An object representing the user record.
   * @throws Error if the user is not found on the leaderboard.
   */
  public async getRecordByNickname(nickname: string) {
    const { Items } = await this.repository.getRecordByNickname(nickname);
    if (Items && Items.length > 0) {
      return { nickname: String(Items[0].nickname), score: Number(Items[0].score), rank: "???" };
    } else {
      logger.error(`User not found on the leaderboard.`);
      return {};
    }
  }
}
