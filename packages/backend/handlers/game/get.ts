import type { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { logger } from "@/libs/powertools";
import { Success, Forbidden } from "@/libs/http-response";
import defaultHttpHandler from "@/libs/middlewares/default-http-handler";
import GameService from "@/services/game";
import GameRepository from "@/repositories/game";
import DynamoDBClient from "@/services/dynamodb";
import { checkCountry } from "@/libs/check-country";

logger.appendKeys({
  namespace: "Lambda-GET-New-Game",
  service: "AWS::Lambda",
});

const gameService = new GameService(
  new GameRepository(new DynamoDBClient(process.env.GAMES_SESSION_TABLE_NAME as string)),
);

const COUNTRIES_ALLOW_LIST = (process.env.COUNTRIES_ALLOW_LIST || "")?.split(",").map((country) => country.trim());

/**
 * Lambda handler for GET requests to retrieve the leaderboard.
 *
 * @param {APIGatewayProxyEvent} event - The event object containing request details.
 * @param {Context} context - The context object providing information about the runtime environment.
 * @returns {Promise<APIGatewayProxyResult>} - The result object containing the HTTP response with leaderboard data.
 */
export const handler = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> =>
  defaultHttpHandler(event, context, async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info("Handler to create a new game.", { event, ...context });

    try {
      const country = event.headers["CloudFront-Viewer-Country"]!;

      if (!checkCountry(country, COUNTRIES_ALLOW_LIST)) {
        return Forbidden();
      }

      const userSub = event.requestContext.authorizer?.principalId;
      const newGame = await gameService.createNewGame(userSub);

      logger.info(`New game has been created, ID: ${newGame}`);
      return Success({ gameId: newGame });
    } catch (error) {
      logger.error("Error when creating a new game", { error });
      return Forbidden();
    }
  });
