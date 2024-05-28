import { logger } from "@/libs/powertools";
import { brinkerCheckStatus } from "@/utils/brinker";
import { CreateAuthChallengeTriggerHandler, CreateAuthChallengeTriggerEvent, Context } from "aws-lambda";

logger.appendKeys({
  namespace: "Lambda-Create-Auth-Challenge",
  service: "AWS::Lambda",
});

export const handler: CreateAuthChallengeTriggerHandler = async (
  event: CreateAuthChallengeTriggerEvent,
  context: Context
): Promise<CreateAuthChallengeTriggerEvent> => {
  logger.info("Handler create auth challenge", { event, ...context });
  const apiJSON = await brinkerCheckStatus(event.userName);

  if (event.request.challengeName !== "CUSTOM_CHALLENGE" || apiJSON.code !== "00000001") {
    return event;
  }

  event.response.publicChallengeParameters = {};
  event.response.privateChallengeParameters = {};
  event.response.privateChallengeParameters.answer = apiJSON.points;

  return event;
};
