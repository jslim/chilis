import {
  CognitoIdentityProviderClient,
  AdminGetUserCommand,
  AdminCreateUserCommand,
  InitiateAuthCommand,
  RespondToAuthChallengeCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import type { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";

import { parseBody } from "@/utils/parse";
import { logger } from "@/libs/powertools";
import { brinkerLogin } from "@/utils/brinker";
import { Success, Forbidden } from "@/libs/http-response";
import defaultHttpHandler from "@/libs/middlewares/default-http-handler";
import { checkCountry } from "@/libs/check-country";

logger.appendKeys({
  namespace: "Lambda-POST-User-Login",
  service: "AWS::Lambda",
});

const cognitoClient = new CognitoIdentityProviderClient();

const COUNTRIES_ALLOW_LIST = (process.env.COUNTRIES_ALLOW_LIST || "")?.split(",").map((country) => country.trim());

/**
 * Lambda handler for processing user authentication and registration requests.
 *
 * @param {APIGatewayProxyEvent} event - The event object containing request details.
 * @param {Context} context - The context object providing information about the runtime environment.
 * @returns {Promise<APIGatewayProxyResult>} - The result object containing the HTTP response with user details and token.
 *
 * @throws {Error} - Throws an error if the authentication process fails or if there are issues with user registration or sign-in.
 */
export const handler = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> =>
  defaultHttpHandler(event, context, async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info("Handler POST request user");

    const { phone, password } = parseBody(event.body);

    try {
      const country = event.headers["CloudFront-Viewer-Country"]!;

      if (!checkCountry(country, COUNTRIES_ALLOW_LIST)) {
        return Forbidden();
      }

      const { loyaltyID } = await brinkerLogin(phone, password);
      await registerUserIfNotFound(loyaltyID);

      const signInResult = await signInUser(loyaltyID);
      if (!signInResult || !signInResult.AccessToken) {
        throw new Error("Failed to obtain access token");
      }

      return Success({
        IdToken: signInResult.IdToken,
        AccessToken: signInResult.AccessToken,
      });
    } catch (error) {
      logger.error("Error during authentication process:", { error });
      return Forbidden();
    }
  });

/**
 * Attempts to register a user if they are not found in the Cognito user pool.
 *
 * This function first tries to retrieve a user by their loyaltyID from the Cognito user pool.
 * If the user is not found (indicated by a "UserNotFoundException"), it attempts to create a new user with the given loyaltyID.
 * If any other error occurs during the retrieval or creation process, it logs the error and throws an exception.
 *
 * @param {string} loyaltyID - The unique identifier for the user, used as the username in Cognito.
 * @throws {Error} - Throws an error if there is a failure in retrieving or creating the user.
 */
async function registerUserIfNotFound(loyaltyID: string) {
  try {
    await cognitoClient.send(
      new AdminGetUserCommand({
        UserPoolId: process.env.USER_POOL_ID,
        Username: loyaltyID,
      }),
    );
  } catch (error: any) {
    if (error.name === "UserNotFoundException") {
      try {
        await cognitoClient.send(
          new AdminCreateUserCommand({
            // This command will trigger the pre signup handler
            UserPoolId: process.env.USER_POOL_ID,
            Username: loyaltyID,
            UserAttributes: [
              {
                Name: "custom:badActor",
                Value: "false",
              },
            ],
          }),
        );
      } catch (createError) {
        logger.error("Error creating new user:", { createError });
        throw new Error("Error creating new user");
      }
    } else {
      logger.error("Unexpected error in registerUserIfNotFound", { error });
      throw new Error("Unexpected error in registerUserIfNotFound");
    }
  }
}

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
