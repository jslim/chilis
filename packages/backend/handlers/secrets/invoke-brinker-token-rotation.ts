import type { EventBridgeEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { logger } from "@/libs/powertools";
import { SecretsManagerClient, RotateSecretCommand } from "@aws-sdk/client-secrets-manager";

logger.appendKeys({
  namespace: "Lambda-Invoke-Brinker-Token-Rotation",
  service: "AWS::Lambda",
});

const client = new SecretsManagerClient();

export const handler = async (event: EventBridgeEvent<string, {}>, context: Context) => {
  logger.info("Handler to trigger rotate the token", { event, ...context });

  try {
    const response = await client.send(new RotateSecretCommand({ SecretId: process.env.BRINKER_ACCESS }));
    logger.info("Rotation initiated successfully:", { response });
  } catch (error: any) {
    logger.error(`Error initiating rotation: ${error.message}`);
    throw new Error(error.message);
  }
};
