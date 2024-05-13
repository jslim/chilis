import type { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import type { Handler } from "@/types/api";

import loggableRequest from "./loggable-request";
import trackableRequest from "./trackable-request";

const defaultHttpHandler = async (event: APIGatewayProxyEvent, context: Context, handler: Handler): Promise<APIGatewayProxyResult> => {
  return loggableRequest(event, context, trackableRequest.bind(null, event, context, handler));
};

export default defaultHttpHandler;
