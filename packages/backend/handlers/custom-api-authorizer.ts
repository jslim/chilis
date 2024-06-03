import { logger } from "@/libs/powertools";
import { APIGatewayTokenAuthorizerEvent, APIGatewayAuthorizerResult, Context } from "aws-lambda";
import { CognitoJwtVerifier } from "aws-jwt-verify";
import generateApiAuthPolicy, { extractApiArnParts } from "@/utils/generate-api-auth-policy";

const cognitoJwtVerifier = CognitoJwtVerifier.create({
  userPoolId: process.env.USER_POOL_ID ?? "",
  clientId: process.env.USER_CLIENT_ID ?? "",
  tokenUse: "access",
});

logger.appendKeys({
  namespace: "Lambda-Api-Authorizer",
  service: "AWS::Lambda",
});

/**
 * AWS Lambda function to handle API Gateway custom authorizations using JWT tokens.
 *
 * This function acts as a custom authorizer that verifies JWT tokens provided in the
 * `Authorization` header of incoming requests. It uses AWS Cognito for token verification.
 * If the token is valid, it generates an IAM policy allowing access to the API; otherwise,
 * it denies access by throwing an "Unauthorized" error.
 *
 * @param {APIGatewayTokenAuthorizerEvent} event - The event object containing the authorization token and method ARN.
 * @param {Context} context - The Lambda execution context.
 * @returns {Promise<APIGatewayAuthorizerResult>} Returns an IAM policy document that either allows or denies access.
 * @throws {Error} Throws an "Unauthorized" error if the token is invalid or improperly formatted.
 */
export const handler = async (event: APIGatewayTokenAuthorizerEvent, context: Context) => {
  logger.info("Custom api authorizer Request", { event, ...context });

  const token = event.authorizationToken.split(" ");

  if (token?.[0] !== "Bearer") {
    logger.error(`Authorization header should have a format Bearer JWT Token: ${token[0]}`);
    throw new Error("Unauthorized");
  }

  try {
    const payload = await cognitoJwtVerifier.verify(token[1]);
    const { awsAccountId } = extractApiArnParts(event.methodArn);
    const authPolicy = generateApiAuthPolicy(payload.sub, awsAccountId, event.methodArn);
    authPolicy.allowAllMethods();
    const apiPolicy = authPolicy.build();

    logger.error("The request has been authorized.");
    return {
      ...apiPolicy,
      context: payload,
    };
  } catch (err) {
    logger.error("Invalid auth token.", err as Error);
    throw new Error("Unauthorized");
  }
};
