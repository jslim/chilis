/**
 * Parse body for different types of integration
 * @param body - payload
 */
export function parseBody(body: string | object | null) {
  // note that LAMBDA_PROXY integration receives body as string while LAMBDA integration receives it as object
  if (typeof body === "string") {
    return JSON.parse(body);
  } else {
    return body;
  }
}
