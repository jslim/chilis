import type { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { CognitoIdentityProviderClient } from "@aws-sdk/client-cognito-identity-provider";

import { parseBody } from "@/utils/parse";
import { logger } from "@/libs/powertools";
import { Success, BadRequest, Forbidden } from "@/libs/http-response";
import defaultHttpHandler from "@/libs/middlewares/default-http-handler";
import DynamoDBClient from "@/services/dynamodb";
import UserService from "@/services/user";
import UserRepository from "@/repositories/user";
import LeaderboardService from "@/services/leaderboard";
import LeaderboardRepository from "@/repositories/leaderboard";
import GameService from "@/services/game";
import GameRepository from "@/repositories/game";
import GameHistoryServices from "@/services/game-history";
import GameHistoryRepository from "@/repositories/game-history";
import { checkCountry } from "@/libs/check-country";

logger.appendKeys({
  namespace: "Lambda-PUT-Save-Score",
  service: "AWS::Lambda",
});

const userService = new UserService(new UserRepository(new CognitoIdentityProviderClient()));
const sessionService = new GameService(
  new GameRepository(new DynamoDBClient(process.env.GAMES_SESSION_TABLE_NAME as string)),
);
const gameHistoryService = new GameHistoryServices(
  new GameHistoryRepository(new DynamoDBClient(process.env.GAMES_HISTORY_TABLE_NAME as string)),
);
const leaderboardService = new LeaderboardService(
  new LeaderboardRepository(new DynamoDBClient(process.env.LEADERBOARD_TABLE_NAME as string)),
);

const COUNTRIES_ALLOW_LIST = (process.env.COUNTRIES_ALLOW_LIST || "")?.split(",").map((country) => country.trim());

/**
 * Lambda handler for PUT requests to save user score.
 *
 * @param {APIGatewayProxyEvent} event - The event object containing request details.
 * @param {Context} context - The context object providing information about the runtime environment.
 * @returns {Promise<APIGatewayProxyResult>} - The result object containing the HTTP response.
 */
export const handler = async (event: APIGatewayProxyEvent, context: Context) =>
  defaultHttpHandler(event, context, async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info("Handler for PUT requests to save user score", { event, ...context });

    const { gameId, score, level } = parseBody(event.body);
    const userSub = event.requestContext.authorizer?.principalId;

    try {
      const country = event.headers["CloudFront-Viewer-Country"]!;
      if (!checkCountry(country, COUNTRIES_ALLOW_LIST)) {
        throw new Error("Restricted by geolocation");
      }

      if (!(await sessionService.validateGame(userSub, { gameId, score }))) {
        logger.error("The game could not be validated successfully.");
        return BadRequest("Game could not be validated.");
      }
      logger.info("Validated game.");

      const userData = await userService.getUserData(String(event.headers.Authorization));
      const loyaltyId = String(userData?.Username);
      const nickname = userData?.UserAttributes?.find((attr) => attr.Name === "preferred_username")?.Value;

      // Record game score
      if (nickname) {
        await gameHistoryService.recordGameScore({ userSub, loyaltyId, nickname, gameId, score, level });
      } else {
        throw new Error("Nickname not found");
      }

      logger.info("The score has been successfully recorded.");
      // Return mini leaderboard
      return Success(await leaderboardService.getMiniBoard(nickname));
    } catch (error) {
      logger.error("Error recording score", { error });
      return Forbidden();
    }
  });
