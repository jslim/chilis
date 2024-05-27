import { logger } from "@/libs/powertools";
import { VerifyAuthChallengeResponseTriggerHandler, VerifyAuthChallengeResponseTriggerEvent, Context } from "aws-lambda";

logger.appendKeys({
  namespace: "Lambda-Verify-Auth-Challenge",
  service: "AWS::Lambda",
});

export const handler: VerifyAuthChallengeResponseTriggerHandler = async (
  event: VerifyAuthChallengeResponseTriggerEvent,
  context: Context
): Promise<VerifyAuthChallengeResponseTriggerEvent> => {
  logger.info("Handler verify auth challenge", { event, ...context });

  if (event.request.privateChallengeParameters.answer === event.request.challengeAnswer) {
    event.response.answerCorrect = true;
  } else {
    event.response.answerCorrect = false;
  }

  return event;
};
