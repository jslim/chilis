import type LeaderboardRepository from "@/repositories/leaderboard";

export default class GameService {
  constructor(private repository: LeaderboardRepository) {}

  public async getLeaderboard(pageSize: number) {
    try {
      return await this.repository.getLeaderboard(pageSize);
    } catch (err) {
      throw new Error(`An error occurred returning leaderboard. ${err}`);
    }
  }

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
}
