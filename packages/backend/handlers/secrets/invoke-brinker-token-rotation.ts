import type { EventBridgeEvent, Context } from "aws-lambda";
import { logger } from "@/libs/powertools";
import { rotateToken } from "@/utils/secrets";

logger.appendKeys({
  namespace: "Lambda-Invoke-Brinker-Token-Rotation",
  service: "AWS::Lambda",
});

export const handler = async (event: EventBridgeEvent<string, {}>, context: Context) => {
  logger.info("Handler to trigger rotate the token", { event, ...context });

  try {
    const response = rotateToken(process.env.BRINKER_ACCESS as string);
    logger.info("Rotation initiated successfully:", { response });
  } catch (error: any) {
    logger.error(`Error initiating rotation: ${error.message}`);
    throw new Error(error.message);
  }
};
