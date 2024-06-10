import type { StackContext } from "sst/constructs";
import { Function, use } from "sst/constructs";
import { AuthStack, ApiStack, Database } from "@/stacks";
import { detectStage } from "@/libs/detect-stage";
import { HttpMethod } from "aws-cdk-lib/aws-events";
import generateApiMethod from "@/utils/generate-api-method";
import { PolicyStatement, Effect } from "aws-cdk-lib/aws-iam";
import { ALLTIME_LEADERBOARD_INDEX } from "@/libs/config";
import { setDefaultFunctionProps } from "@/utils/set-default-function-props";

export function leaderboardApiStack({ stack, app }: StackContext) {
  const { isProd, isStage, isDevelop, isDevelopment } = detectStage(app.stage);
  const { auth } = use(AuthStack);
  const { api, validator } = use(ApiStack);
  const { leaderboardTable } = use(Database);

  setDefaultFunctionProps({ stack, app });

  const getLeaderboard = new Function(stack, "get-leaderboard", {
    functionName: `${app.stage}-get-leaderboard`,
    description: "Retrieve the leaderboard",
    handler: "packages/backend/handlers/leaderboard/get.handler",
    permissions: [
      // eslint-disable-next-line
      // @ts-ignore
      new PolicyStatement({
        actions: ["dynamodb:Query"],
        effect: Effect.ALLOW,
        resources: [`${leaderboardTable.tableArn}/index/${ALLTIME_LEADERBOARD_INDEX}`],
      }),
    ],
    environment: {
      USER_POOL_ID: auth.userPoolId,
      USER_CLIENT_ID: auth.userPoolClientId,
      LEADERBOARD_TABLE_NAME: leaderboardTable.tableName,
    },
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
    validator,
  });

  generateApiMethod({
    resource: leaderboardPath.addResource("{records}"),
    method: HttpMethod.GET,
    handlerFn: getLeaderboard,
    validator,
  });

  if (isDevelop || isStage || isDevelopment) {
    const deleteLeaderboard = new Function(stack, "delete-leaderboard", {
      functionName: `${app.stage}-delete-leaderboard`,
      description: "Delete the score of some users from the board",
      handler: "packages/backend/handlers/leaderboard/delete.handler",
      permissions: [
        // eslint-disable-next-line
        // @ts-ignore
        new PolicyStatement({
          actions: ["dynamodb:Scan", "dynamodb:BatchWriteItem"],
          effect: Effect.ALLOW,
          resources: [leaderboardTable.tableArn],
        }),
      ],
      environment: {
        LEADERBOARD_TABLE_NAME: leaderboardTable.tableName,
      },
      ...(isProd && {
        reservedConcurrentExecutions: 50,
      }),
    });

    generateApiMethod({
      resource: leaderboardPath,
      method: HttpMethod.DELETE,
      handlerFn: deleteLeaderboard,
      validator,
    });
  }
}
