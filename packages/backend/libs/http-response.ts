import { type APIGatewayProxyResult } from "aws-lambda";
import { defaultResponseHeaders } from "@/utils/generate-api-method";
import { LambdaIntegrationType } from "@/types/api";

export const statusCodes = {
  Success: 200,
  BadRequest: 400,
  Unauthorized: 401,
  Forbidden: 403,
  NotFound: 404,
  DefaultError: 500,
};

function Success(body: string | { [key: string]: any } = { message: "Success" }, headers = {}): APIGatewayProxyResult {
  const responseBody = typeof body === "string" ? body : JSON.stringify(body);
  return {
    statusCode: statusCodes.Success,
    body: responseBody,
    headers: { ...defaultResponseHeaders, ...headers },
  };
}

function BadRequest(body: string | { [key: string]: any } = { message: "Bad request" }): APIGatewayProxyResult {
  return DefaultError(statusCodes.BadRequest, body);
}

function Unauthorized(body: string | { [key: string]: any } = { message: "Unauthorized" }): APIGatewayProxyResult {
  return DefaultError(statusCodes.Unauthorized, body);
}

function Forbidden(body: string | { [key: string]: any } = { message: "Access denied" }): APIGatewayProxyResult {
  return DefaultError(statusCodes.Forbidden, body);
}

function NotFound(body: string | { [key: string]: any } = { message: "Resource not found" }): APIGatewayProxyResult {
  return DefaultError(statusCodes.NotFound, body);
}

function DefaultError(
  statusCode = statusCodes.DefaultError,
  body: string | { [key: string]: any } = { message: "Internal server error" }
): APIGatewayProxyResult {
  const message = typeof body === "string" ? { message: body } : body;
  const response = {
    statusCode,
    body: JSON.stringify(message),
    headers: defaultResponseHeaders,
  };

  // Note: INTEGRATION_METHOD will be set for the function automatically by 'generate-api-method' util
  if (process.env.INTEGRATION_METHOD === LambdaIntegrationType.Proxy) {
    return response;
  } else {
    // For Lambda functions, API Gateway matches the regex to the "errorMessage" to return a status code
    throw Error(JSON.stringify(response));
  }
}

export default {
  Success,
  BadRequest,
  Unauthorized,
  Forbidden,
  NotFound,
  DefaultError,
};
