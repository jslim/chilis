import type { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { parseBody } from "@/utils/parse";
import { logger } from "@/libs/powertools";
import { Success, Forbidden } from "@/libs/http-response";
import defaultHttpHandler from "@/libs/middlewares/default-http-handler";
import UserService from "@/services/user";
import UserRepository from "@/repositories/user";
import { CognitoIdentityProviderClient } from "@aws-sdk/client-cognito-identity-provider";

logger.appendKeys({
  namespace: "Lambda-PATCH-Save-User-Nickname",
  service: "AWS::Lambda",
});

const userService = new UserService(new UserRepository(new CognitoIdentityProviderClient()));

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
      const accessToken =
        token?.[1] ??
        (() => {
          throw new Error("Authorization header should have a format Bearer JWT Token");
        })();

      await userService.updateUserPreferredUsername(accessToken, nickname);

      logger.info("nickname stored successfully.");
      return Success();
    } catch (error) {
      logger.error("Error when creating the user's nickname", { error });
      return Forbidden();
    }
  });
