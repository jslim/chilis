import { logger } from "@/libs/powertools";
import { DefineAuthChallengeTriggerHandler, DefineAuthChallengeTriggerEvent, Context } from "aws-lambda";

logger.appendKeys({
  namespace: "Lambda-Define-Auth-Challenge",
  service: "AWS::Lambda",
});

export const handler: DefineAuthChallengeTriggerHandler = async (
  event: DefineAuthChallengeTriggerEvent,
  context: Context
): Promise<DefineAuthChallengeTriggerEvent> => {
  logger.info("Handler define auth challenge", { event, ...context });

  if (event.request.session && event.request.session.find((attempt) => attempt.challengeName !== "CUSTOM_CHALLENGE")) {
    // We only accept custom challenges; fail auth
    event.response.issueTokens = false;
    event.response.failAuthentication = true;
  } else if (event.request.session && event.request.session.length >= 3 && event.request.session.slice(-1)[0].challengeResult === false) {
    // The user provided a wrong answer 3 times; fail auth
    event.response.issueTokens = false;
    event.response.failAuthentication = true;
  } else if (
    event.request.session &&
    event.request.session.length &&
    event.request.session.slice(-1)[0].challengeName === "CUSTOM_CHALLENGE" &&
    event.request.session.slice(-1)[0].challengeResult === true
  ) {
    // The user provided the right answer; succeed auth
    event.response.issueTokens = true;
    event.response.failAuthentication = false;
  } else {
    // The user did not provide a correct answer yet; present challenge
    event.response.issueTokens = false;
    event.response.failAuthentication = false;
    event.response.challengeName = "CUSTOM_CHALLENGE";
  }

  return event;
};
