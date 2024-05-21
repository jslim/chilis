import type { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { parseBody } from "@/utils/parse";
import { logger } from "@/libs/powertools";
import { Success, Forbidden } from "@/libs/http-response";
import defaultHttpHandler from "@/libs/middlewares/default-http-handler";
import { getSecret } from "@/utils/secrets";

logger.appendKeys({
  namespace: "Lambda-POST-User-Login",
  service: "AWS::Lambda",
});

/**
 * Lambda handler for POST requests to create a new user session.
 *
 * @param {APIGatewayProxyEvent} event - The event object containing request details.
 * @param {Context} context - The context object providing information about the runtime environment.
 * @returns {Promise<APIGatewayProxyResult>} - The result object containing the HTTP response with user details and token.
 */
export const handler = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> =>
  defaultHttpHandler(event, context, async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info("Handler to POST request user", { event, ...context });

    try {
      const { phone, password } = parseBody(event.body);

      const loginResult = await attemptLogin(phone, password);
      return loginResult;
    } catch (error) {
      logger.error("Unexpected error in handler", { error });
      return Forbidden();
    }
  });

/**
 * Attempts to log in a user using provided phone number and password.
 *
 * This function sends a POST request to an external API endpoint to authenticate the user.
 * If the authentication is successful, it returns a success response with user details.
 * If the authentication fails due to invalid credentials or API errors, it throws an error.
 *
 * @param {string} phone - The phone number of the user attempting to log in.
 * @param {string} password - The password of the user.
 * @returns {Promise<APIGatewayProxyResult>} - A promise that resolves to the API Gateway Proxy Result.
 * @throws {Error} - Throws an error if the API call fails or if the credentials are invalid.
 */
async function attemptLogin(phone: string, password: string): Promise<APIGatewayProxyResult> {
  const { apiUrl, token } = await getSecret(process.env.BRINKER_ACCESS!);
  if (!apiUrl || !token) {
    logger.error("Secrets not properly configured");
    throw new Error("Configuration error");
  }

  const apiLogin = await fetch(`${apiUrl}/guest/loyalty/v1/weblogin`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ phone, password }),
  });

  if (!apiLogin.ok) {
    logger.error("API login failed", { status: apiLogin.status, statusText: apiLogin.statusText });
    throw new Error("API login failed");
  }

  const apiJSON = await apiLogin.json();
  if (apiJSON.errorCode === "00000001") {
    return Success({
      nickname: "austinP",
      token:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
    });
  } else {
    logger.error("Login error from API", { errorCode: apiJSON.errorCode, errorMessage: apiJSON.errorMessage });
    throw new Error("Login failed");
  }
}
