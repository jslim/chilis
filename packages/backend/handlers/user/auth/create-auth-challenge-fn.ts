import { logger } from "@/libs/powertools";
import { CreateAuthChallengeTriggerHandler, CreateAuthChallengeTriggerEvent, Context } from "aws-lambda";

logger.appendKeys({
  namespace: "Lambda-Create-Auth-Challenge",
  service: "AWS::Lambda",
});

export const handler: CreateAuthChallengeTriggerHandler = async (
  event: CreateAuthChallengeTriggerEvent,
  context: Context,
): Promise<CreateAuthChallengeTriggerEvent> => {
  logger.info("Handler create auth challenge", { event, ...context });

  if (event.request.challengeName !== "CUSTOM_CHALLENGE") {
    return event;
  }

  event.response.publicChallengeParameters = {};
  event.response.privateChallengeParameters = {};
  event.response.privateChallengeParameters.answer = event.userName.split("").reverse().join("");

  return event;
};
