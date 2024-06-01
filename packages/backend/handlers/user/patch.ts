import type { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { parseBody } from "@/utils/parse";
import { logger } from "@/libs/powertools";
import { Success, Forbidden } from "@/libs/http-response";
import defaultHttpHandler from "@/libs/middlewares/default-http-handler";
import { CognitoIdentityProviderClient, GetUserCommand, UpdateUserAttributesCommand } from "@aws-sdk/client-cognito-identity-provider";

logger.appendKeys({
  namespace: "Lambda-PATCH-Save-User-Nickname",
  service: "AWS::Lambda",
});

const cognitoClient = new CognitoIdentityProviderClient();

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
      const { nickname } = parseBody(event.body);
      const token = event.headers?.Authorization?.split(" ");
      const accessToken = token && token[1];

      // Get current user information
      const userData = await cognitoClient.send(
        new GetUserCommand({
          AccessToken: accessToken,
        })
      );

      // Validate that the user does not currently have a nickname
      const currentNickname = userData?.UserAttributes?.find((attr) => attr.Name === "nickname");
      if (currentNickname?.Value) {
        logger.error("User already has a nickname");
        return Forbidden();
      }

      // Send the nickname to cognito
      await cognitoClient.send(
        new UpdateUserAttributesCommand({
          AccessToken: accessToken,
          UserAttributes: [
            {
              Name: "nickname",
              Value: nickname,
            },
          ],
        })
      );

      logger.info("nickname stored successfully.");
      return Success();
    } catch (error) {
      logger.error("Error when creating the user's nickname", { error });
      return Forbidden();
    }
  });
