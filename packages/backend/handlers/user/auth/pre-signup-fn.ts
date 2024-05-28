import { logger } from "@/libs/powertools";
import { brinkerCheckStatus } from "@/utils/brinker";
import type { Context, PreSignUpTriggerEvent, PreSignUpTriggerHandler } from "aws-lambda";

logger.appendKeys({
  namespace: "Lambda-Pre-SignUp",
  service: "AWS::Lambda",
});

/**
 * AWS Lambda function to handle pre-signup events for Cognito user pools.
 * This function is triggered before a new user is confirmed in the user pool.
 * It performs additional validation by checking if the user exists in the Brinker system.
 *
 * @param {PreSignUpTriggerEvent} event - Contains the information about the signup request and user attributes.
 * @param {Context} context - Provides runtime information about the Lambda execution environment.
 * @returns {Promise<PreSignUpTriggerEvent>} - Returns the modified event object after processing.
 * @throws {Error} - Throws an error if the user validation fails or any other error occurs during the process.
 */
export const handler: PreSignUpTriggerHandler = async (event: PreSignUpTriggerEvent, context: Context): Promise<PreSignUpTriggerEvent> => {
  logger.info("Handler PRE-SIGNUP user", { event, ...context });

  try {
    // Validate that the user exists in Brinker
    const apiJSON = await brinkerCheckStatus(event.userName);
    if (apiJSON.code !== "00000001") {
      logger.error("Error from API", { errorCode: apiJSON.code });
      throw new Error("Check failed");
    }
    event.response.autoConfirmUser = true;

    return event;
  } catch (error) {
    logger.error("Error during PreSignUp:", { error });
    throw error;
  }
};
