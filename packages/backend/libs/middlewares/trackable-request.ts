import type { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import type { Handler } from "@/types/api";

import { tracer } from "../powertools";

const trackableRequest = async (event: APIGatewayProxyEvent, context: Context, handler: Handler): Promise<APIGatewayProxyResult> => {
  const handlerSegment = tracer.getSegment()?.addNewSubsegment("handler");
  handlerSegment && tracer.setSegment(handlerSegment);

  const response = await handler(event, context);

  handlerSegment?.close();
  handlerSegment && tracer.setSegment(handlerSegment?.parent);

  return response;
};

export default trackableRequest;
