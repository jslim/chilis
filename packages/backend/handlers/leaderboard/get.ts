import type { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { logger } from "@/libs/powertools";
import httpResponse from "@/libs/http-response";
import defaultHttpHandler from "@/libs/middlewares/default-http-handler";

logger.appendKeys({
  namespace: "Lambda-GET-Leaderboard",
  service: "AWS::Lambda",
});

/**
 * Lambda handler for GET requests to retrieve the leaderboard.
 *
 * @param {APIGatewayProxyEvent} event - The event object containing request details.
 * @param {Context} context - The context object providing information about the runtime environment.
 * @returns {Promise<APIGatewayProxyResult>} - The result object containing the HTTP response with leaderboard data.
 */
export const handler = async (event: APIGatewayProxyEvent, context: Context) =>
  defaultHttpHandler(event, context, async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info("Handler to login user", { event, ...context });

    return httpResponse.Success([
      { score: 26000, level: 2, timestamp: "511567169", nickname: "austinP" },
      { score: 24000, level: 2, timestamp: "511567169", nickname: "FunSize" },
      { score: 22000, level: 2, timestamp: "511567169", nickname: "Goofball" },
      { score: 20000, level: 1, timestamp: "511567169", nickname: "Firecracker" },
      { score: 18000, level: 1, timestamp: "511567169", nickname: "Queen" },
    ]);
  });
