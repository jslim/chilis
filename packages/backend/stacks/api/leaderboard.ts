import type { StackContext } from "sst/constructs";
import { Function, use } from "sst/constructs";
import { ApiStack } from "@/stacks/api/api";
import { HttpMethod } from "aws-cdk-lib/aws-events";
import { type ModelOptions } from "aws-cdk-lib/aws-apigateway";
import { detectStage } from "@/libs/detect-stage";
import generateApiMethod from "@/utils/generate-api-method";
import { setDefaultFunctionProps } from "@/utils/set-default-function-props";
import postUserModel from "@/stacks/user/models/post-user";

export function leaderboardApiStack({ stack, app }: StackContext) {
  const { isProd } = detectStage(app.stage);
  const { api, validator } = use(ApiStack);

  setDefaultFunctionProps({ stack, app });

  const getLeaderboard = new Function(stack, "get-leaderboard", {
    functionName: `${app.stage}-get-leaderboard`,
    description: "Retrieve the leaderboard",
    handler: "packages/backend/handlers/leaderboard/get.handler",
    ...(isProd && {
      reservedConcurrentExecutions: 50,
    }),
  });

  /**
   * leaderboard API endpoints
   */
  const leaderboardPath = api.cdk.restApi.root.addResource("leaderboard");

  generateApiMethod({
    resource: leaderboardPath,
    method: HttpMethod.GET,
    handlerFn: getLeaderboard,
  });
}
