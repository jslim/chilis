import type { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { logger } from "@/libs/powertools";
import httpResponse from "@/libs/http-response";
import defaultHttpHandler from "@/libs/middlewares/default-http-handler";

logger.appendKeys({
  namespace: "Lambda-PUT-Save-Score",
  service: "AWS::Lambda",
});

/**
 * Lambda handler for PUT requests to save user history score.
 *
 * @param {APIGatewayProxyEvent} event - The event object containing request details.
 * @param {Context} context - The context object providing information about the runtime environment.
 * @returns {Promise<APIGatewayProxyResult>} - The result object containing the HTTP response.
 */
export const handler = async (event: APIGatewayProxyEvent, context: Context) =>
  defaultHttpHandler(event, context, async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info("Handler to PUT request user", { event, ...context });

    return httpResponse.Success();
  });
