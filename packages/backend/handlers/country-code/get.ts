import type { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { logger } from "@/libs/powertools";
import { Success, Forbidden } from "@/libs/http-response";
import defaultHttpHandler from "@/libs/middlewares/default-http-handler";
import { checkCountry } from "@/libs/check-country";

const COUNTRIES_ALLOW_LIST = (process.env.COUNTRIES_ALLOW_LIST || "")?.split(",").map((country) => country.trim());

logger.appendKeys({
  namespace: "Lambda-GET-CountryCode",
  service: "AWS::Lambda",
});

/**
 * Lambda handler for GET requests to retrieve the leaderboard.
 *
 * @param {APIGatewayProxyEvent} event - The event object containing request details.
 * @param {Context} context - The context object providing information about the runtime environment.
 * @returns {Promise<APIGatewayProxyResult>}- The result object containing the HTTP response with leaderboard data.
 */
export const handler = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> =>
  defaultHttpHandler(event, context, async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info("Handler to retrieve the country code", { event, ...context });

    try {
      const country = event.headers["CloudFront-Viewer-Country"]!;

      if (!checkCountry(country, COUNTRIES_ALLOW_LIST)) {
        return Forbidden();
      } else {
        return Success();
      }
    } catch (error) {
      logger.error("Error returning country code", { error });
      return Forbidden();
    }
  });
