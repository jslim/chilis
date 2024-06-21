import type { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  RespondToAuthChallengeCommand,
} from "@aws-sdk/client-cognito-identity-provider";

import { parseBody } from "@/utils/parse";
import { logger } from "@/libs/powertools";
import { Success, Forbidden } from "@/libs/http-response";
import defaultHttpHandler from "@/libs/middlewares/default-http-handler";
import UserService from "@/services/user";
import UserRepository from "@/repositories/user";
import { checkCountry } from "@/libs/check-country";

logger.appendKeys({
  namespace: "Lambda-PATCH-Save-User-Nickname",
  service: "AWS::Lambda",
});

const cognitoClient = new CognitoIdentityProviderClient();
const userService = new UserService(new UserRepository(cognitoClient));

const COUNTRIES_ALLOW_LIST = (process.env.COUNTRIES_ALLOW_LIST || "")?.split(",").map((country) => country.trim());

/**
 * Lambda handler for PATCH requests to update user nickname.
 *
 * @param {APIGatewayProxyEvent} event - The event object containing request details.
 * @param {Context} context - The context object providing information about the runtime environment.
 * @returns {Promise<APIGatewayProxyResult>} - The result object containing the HTTP response.
 */
export const handler = async (event: APIGatewayProxyEvent, context: Context) =>
  defaultHttpHandler(event, context, async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info("Handler to PATCH request user", { event, ...context });

    try {
      const country = event.headers["CloudFront-Viewer-Country"]!;

      if (!checkCountry(country, COUNTRIES_ALLOW_LIST)) {
        return Forbidden();
      }

      const { nickname } = parseBody(event.body);
      const token = event.headers?.Authorization?.split(" ");
      const accessToken =
        token?.[1] ??
        (() => {
          throw new Error("Authorization header should have a format Bearer JWT Token");
        })();

      await userService.updateUserPreferredUsername(accessToken, nickname);
      const loyaltyID = event.requestContext.authorizer?.username;
      const signInResult = await signInUser(loyaltyID);

      logger.info("nickname stored successfully.");

      return Success({
        IdToken: signInResult?.IdToken,
        AccessToken: signInResult?.AccessToken,
      });
    } catch (error) {
      logger.error("Error when creating the user's nickname", { error });
      return Forbidden();
    }
  });

/**
 * Authenticates a user using a custom authentication flow in AWS Cognito.
 *
 * This function initiates an authentication request with the user's loyaltyID. If the initial request is successful,
 * it proceeds to respond to a custom authentication challenge using the user's loyaltyID and a provided answer (points).
 * If the authentication is successful, it returns the authentication result which includes tokens.
 *
 * @param {string} loyaltyID - The unique identifier for the user, used as the username in Cognito.
 * @returns {Promise<AuthenticationResult>} - The result of the authentication process, including tokens.
 * @throws {Error} - Throws an error if there is a failure in initiating the auth request or responding to the challenge.
 */
async function signInUser(loyaltyID: string) {
  try {
    const respInitCommand = await cognitoClient.send(
      new InitiateAuthCommand({
        AuthFlow: "CUSTOM_AUTH",
        ClientId: process.env.USER_CLIENT_ID,
        AuthParameters: {
          USERNAME: loyaltyID,
        },
      }),
    );

    const { AuthenticationResult } = await cognitoClient.send(
      new RespondToAuthChallengeCommand({
        ClientId: process.env.USER_CLIENT_ID,
        ChallengeName: "CUSTOM_CHALLENGE",
        ChallengeResponses: { USERNAME: loyaltyID, ANSWER: loyaltyID },
        Session: respInitCommand.Session,
      }),
    );

    logger.info("Authentication completed");
    return AuthenticationResult;
  } catch (error) {
    logger.error("Error responding to authentication challenge:", { error });
    throw new Error("Error responding to authentication challenge");
  }
}
