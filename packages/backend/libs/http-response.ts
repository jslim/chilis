import { type APIGatewayProxyResult } from "aws-lambda";
import { defaultResponseHeaders } from "@/utils/response-headers";

/**
 * Return 200 HTTP response
 *
 * @param {(string | { [key: string]: any })} [body='Success']
 * @param headers
 * @returns {APIGatewayProxyResult}
 */
export function Success(body: string | { [key: string]: any } = { message: "Success" }, headers = {}): APIGatewayProxyResult {
  const responseBody = typeof body === "string" ? body : JSON.stringify(body);
  return {
    statusCode: 200,
    body: responseBody,
    headers: { ...defaultResponseHeaders, ...headers },
  };
}

/**
 * Return 400 HTTP response
 *
 * @param {(string | { [key: string]: any })} [body]
 * @returns {APIGatewayProxyResult}
 */
export function BadRequest(body: string | { [key: string]: any } = { message: "Bad Request" }): APIGatewayProxyResult {
  return DefaultError(body, 400);
}

/**
 * Return 401 HTTP response
 *
 * @param {(string | { [key: string]: any })} [body]
 * @returns {APIGatewayProxyResult}
 */
export function Unauthorized(body: string | { [key: string]: any } = { message: "Unauthorized" }): APIGatewayProxyResult {
  return DefaultError(body, 401);
}

/**
 * Return 403 HTTP response
 *
 * @param {(string | { [key: string]: any })} [body]
 * @returns {APIGatewayProxyResult}
 */
export function Forbidden(body: string | { [key: string]: any } = { message: "Forbidden" }): APIGatewayProxyResult {
  return DefaultError(body, 403);
}

/**
 * Return 404 HTTP response
 *
 * @param {(string | { [key: string]: any })} [body]
 * @returns {APIGatewayProxyResult}
 */
export function NotFound(body: string | { [key: string]: any } = { message: "Not Found" }): APIGatewayProxyResult {
  return DefaultError(body, 404);
}

/**
 * Return 502 HTTP response
 *
 * @param {(string | { [key: string]: any })} [body]
 * @returns {APIGatewayProxyResult}
 */
export function ThirdPartyException(body: string | { [key: string]: any } = { message: "Upstream Dependency Failed" }): APIGatewayProxyResult {
  return DefaultError(body, 502);
}

/**
 * Return Generic HTTP error
 *
 * @param {(string | { [key: string]: any })} [body]
 * @param {number} [statusCode=500]
 * @returns {APIGatewayProxyResult}
 */
export function DefaultError(body: string | { [key: string]: any } = { message: "Internal Server Error" }, statusCode = 500): APIGatewayProxyResult {
  const message = typeof body === "string" ? { message: body } : body;
  return {
    statusCode,
    body: JSON.stringify(message),
    headers: defaultResponseHeaders,
  };
}

export default { Success, BadRequest, Unauthorized, Forbidden, NotFound, ThirdPartyException, DefaultError };
