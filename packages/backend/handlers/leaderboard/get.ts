import type { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { logger } from "@/libs/powertools";
import { Success, Forbidden, BadRequest } from "@/libs/http-response";
import defaultHttpHandler from "@/libs/middlewares/default-http-handler";
import LeaderboardService from "@/services/leaderboard";
import LeaderboardRepository from "@/repositories/leaderboard";
import DynamoDBClient from "@/services/dynamodb";
import UserService from "@/services/user";
import UserRepository from "@/repositories/user";
import { MAX_LEADERBOARD_RECORD } from "@/libs/config";
import { CognitoIdentityProviderClient } from "@aws-sdk/client-cognito-identity-provider";

logger.appendKeys({
  namespace: "Lambda-GET-Leaderboard",
  service: "AWS::Lambda",
});

const userService = new UserService(new UserRepository(new CognitoIdentityProviderClient()));
const leaderboardService = new LeaderboardService(new LeaderboardRepository(new DynamoDBClient(process.env.LEADERBOARD_TABLE_NAME as string)));

/**
 * Lambda handler for GET requests to retrieve the leaderboard.
 *
 * @param {APIGatewayProxyEvent} event - The event object containing request details.
 * @param {Context} context - The context object providing information about the runtime environment.
 * @returns {Promise<APIGatewayProxyResult>}- The result object containing the HTTP response with leaderboard data.
 */
export const handler = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> =>
  defaultHttpHandler(event, context, async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info("Handler to retrieve the leaderboard", { event, ...context });

    let nickname;

    const records = event.pathParameters?.records || `${MAX_LEADERBOARD_RECORD}`;
    const numRecords = parseInt(records);

    if (isNaN(numRecords) || numRecords <= 0) {
      logger.error("Incorrect character in the URL");
      return BadRequest("Incorrect character in the URL");
    }

    try {
      nickname = event.headers.Authorization && (await userService.getUsername(event.headers.Authorization));
    } catch (error: any) {
      logger.error(error);
    }

    try {
      return Success(await leaderboardService.getLeaderboard(nickname, numRecords));
    } catch (error) {
      logger.error("Error returning leaderboard", { error });
      return Forbidden();
    }
  });
