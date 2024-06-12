import type { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { parseBody } from "@/utils/parse";
import { logger } from "@/libs/powertools";
import { Success, Forbidden } from "@/libs/http-response";
import defaultHttpHandler from "@/libs/middlewares/default-http-handler";
import GameService from "@/services/game";
import GameRepository from "@/repositories/game";
import DynamoDBClient from "@/services/dynamodb";
import UserService from "@/services/user";
import UserRepository from "@/repositories/user";
import LeaderboardService from "@/services/leaderboard";
import LeaderboardRepository from "@/repositories/leaderboard";
import { CognitoIdentityProviderClient } from "@aws-sdk/client-cognito-identity-provider";

logger.appendKeys({
  namespace: "Lambda-PUT-Save-Score",
  service: "AWS::Lambda",
});

const userService = new UserService(new UserRepository(new CognitoIdentityProviderClient()));
const gameService = new GameService(new GameRepository(new DynamoDBClient(process.env.GAMES_HISTORY_TABLE_NAME as string)));
const leaderboardService = new LeaderboardService(new LeaderboardRepository(new DynamoDBClient(process.env.LEADERBOARD_TABLE_NAME as string)));

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
      const currentNickname = event.headers?.Authorization && (await userService.getUsername(event.headers.Authorization));

      // Record game score
      if (currentNickname) {
        await gameService.recordGameScore(currentNickname, { userSub, gameId, score, level });
      } else {
        throw new Error("Nickname not found");
      }

      logger.info("The score has been successfully recorded.");
      // Return mini leaderboard
      return Success(await leaderboardService.getMiniBoard(currentNickname));
    } catch (error) {
      logger.error("Error recording score", { error });
      return Forbidden();
    }
  });
