import type { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import type { Handler } from "@/types/api";

import { logger } from "../powertools";

const loggableRequest = async (event: APIGatewayProxyEvent, context: Context, handler: Handler): Promise<APIGatewayProxyResult> => {
  logger.info("Request", { event, ...context });

  const response = await handler(event, context);

  logger.info("Response", { response });

  return response;
};

export default loggableRequest;
