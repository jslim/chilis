import type { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { logger } from "@/libs/powertools";
import httpResponse from "@/libs/http-response";
import defaultHttpHandler from "@/libs/middlewares/default-http-handler";

logger.appendKeys({
  namespace: "Lambda-POST-Login",
  service: "AWS::Lambda",
});

export const handler = async (event: APIGatewayProxyEvent, context: Context) =>
  defaultHttpHandler(event, context, async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info("Handler to POST request user", { event, ...context });

    return httpResponse.Success("successful!");
  });
