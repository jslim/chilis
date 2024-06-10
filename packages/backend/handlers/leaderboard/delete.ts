import type { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { logger } from "@/libs/powertools";
import { Success, Forbidden, BadRequest } from "@/libs/http-response";
import defaultHttpHandler from "@/libs/middlewares/default-http-handler";
import LeaderboardService from "@/services/leaderboard";
import LeaderboardRepository from "@/repositories/leaderboard";
import DynamoDBClient from "@/services/dynamodb";

logger.appendKeys({
  namespace: "Lambda-DELETE-Leaderboard",
  service: "AWS::Lambda",
});

const leaderboardService = new LeaderboardService(new LeaderboardRepository(new DynamoDBClient(process.env.LEADERBOARD_TABLE_NAME as string)));

/**
 * Lambda handler for DELETE requests.
 *
 * @param {APIGatewayProxyEvent} event - The event object containing request details.
 * @param {Context} context - The context object providing information about the runtime environment.
 * @returns {Promise<APIGatewayProxyResult>}- The result object containing the HTTP response with leaderboard data.
 */
export const handler = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> =>
  defaultHttpHandler(event, context, async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info("Handler to delete score of some users from the board", { event, ...context });

    try {
      await leaderboardService.deleteRecordByPrefix("QA");
      return Success();
    } catch (error) {
      logger.error("An error occurred while trying to delete some users", { error });
      return Forbidden();
    }
  });
