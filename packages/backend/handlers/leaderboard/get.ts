import type { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { logger } from "@/libs/powertools";
import { Success, Forbidden, BadRequest } from "@/libs/http-response";
import defaultHttpHandler from "@/libs/middlewares/default-http-handler";
import LeaderboardService from "@/services/leaderboard";
import LeaderboardRepository from "@/repositories/leaderboard";
import DynamoDBClient from "@/services/dynamodb";
import UserService from "@/services/user";
import UserRepository from "@/repositories/user";
import type { AttributeValue } from "@aws-sdk/client-dynamodb";
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

    let username;
    let userRecord = {};
    let targetPosition = -1;
    let leaderboard: Record<string, AttributeValue>[] | undefined = [];

    const records = event.pathParameters?.records || "100";
    const numRecords = parseInt(records, 10);

    if (isNaN(numRecords) || numRecords <= 0) {
      logger.error("Incorrect character in the URL");
      return BadRequest("Incorrect character in the URL");
    }

    try {
      username = event.headers.Authorization && (await userService.getUsername(event.headers.Authorization));
    } catch (error: any) {
      logger.error(error);
    }

    try {
      if (username) {
        const Items = await leaderboardService.getAllTimeLeaderboard();
        targetPosition = Items.findIndex((item) => String(item.nickname) === username);

        userRecord = { ...Items[targetPosition], rank: targetPosition + 1 };
        leaderboard = Items.slice(0, numRecords);
      } else {
        const { Items } = await leaderboardService.getLeaderboard(numRecords);
        leaderboard = Items;
      }

      return Success({
        leaderboard,
        user: userRecord,
      });
    } catch (error) {
      logger.error("Error returning leaderboard", { error });
      return Forbidden();
    }
  });
