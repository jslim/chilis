import { ApiStack } from "@/stacks/api/api";
import { Database } from "@/stacks/database";
import { Function, use } from "sst/constructs";
import { detectStage } from "@/libs/detect-stage";
import type { StackContext } from "sst/constructs";
import { HttpMethod } from "aws-cdk-lib/aws-events";
import putGameModal from "@/stacks/game/models/put";
import { ALLTIME_LEADERBOARD_INDEX } from "@/libs/config";
import generateApiMethod from "@/utils/generate-api-method";
import { PolicyStatement, Effect } from "aws-cdk-lib/aws-iam";
import { type ModelOptions } from "aws-cdk-lib/aws-apigateway";
import { setDefaultFunctionProps } from "@/utils/set-default-function-props";

export function gameApiStack({ stack, app }: StackContext) {
  const { isProd } = detectStage(app.stage);
  const { api, validator } = use(ApiStack);
  const { leaderboardTable, gameSessionTable, gameHistoryTable } = use(Database);

  setDefaultFunctionProps({ stack, app }, { environment: { COUNTRIES_ALLOW_LIST: process.env.COUNTRIES_ALLOW_LIST! } });

  const getGame = new Function(stack, "get-game", {
    functionName: `${app.stage}-get-game`,
    description: "Create a new game",
    handler: "packages/backend/handlers/game/get.handler",
    permissions: [
      // eslint-disable-next-line
      // @ts-ignore
      new PolicyStatement({
        actions: ["dynamodb:Query", "dynamodb:PutItem"],
        effect: Effect.ALLOW,
        resources: [gameSessionTable.tableArn],
      }),
    ],
    environment: {
      GAMES_SESSION_TABLE_NAME: gameSessionTable.tableName,
    },
    ...(isProd && {
      reservedConcurrentExecutions: 50,
    }),
  });

  const putGame = new Function(stack, "put-game", {
    functionName: `${app.stage}-put-game`,
    description: "Endpoint to save game score",
    handler: "packages/backend/handlers/game/put.handler",
    permissions: [
      // eslint-disable-next-line
      // @ts-ignore
      new PolicyStatement({
        actions: ["dynamodb:PutItem", "dynamodb:UpdateItem"],
        effect: Effect.ALLOW,
        resources: [gameHistoryTable.tableArn, leaderboardTable.tableArn],
      }),
      // eslint-disable-next-line
      // @ts-ignore
      // new PolicyStatement({
      //   actions: ["dynamodb:Query"],
      //   effect: Effect.ALLOW,
      //   resources: [gameHistoryTable.tableArn],
      // }),
      // eslint-disable-next-line
      // @ts-ignore
      new PolicyStatement({
        actions: ["dynamodb:UpdateItem", "dynamodb:Query"],
        effect: Effect.ALLOW,
        resources: [gameSessionTable.tableArn],
      }),
      // eslint-disable-next-line
      // @ts-ignore
      new PolicyStatement({
        actions: ["dynamodb:Query", "dynamodb:Scan"],
        effect: Effect.ALLOW,
        resources: [`${leaderboardTable.tableArn}/index/${ALLTIME_LEADERBOARD_INDEX}`],
      }),
    ],
    environment: {
      LEADERBOARD_TABLE_NAME: leaderboardTable.tableName,
      GAMES_SESSION_TABLE_NAME: gameSessionTable.tableName,
      GAMES_HISTORY_TABLE_NAME: gameHistoryTable.tableName,
    },
    ...(isProd && {
      reservedConcurrentExecutions: 50,
    }),
  });

  /**
   * Game API endpoints
   */
  const gamePath = api.cdk.restApi.root.addResource("game");

  generateApiMethod({
    resource: gamePath,
    method: HttpMethod.GET,
    handlerFn: getGame,
    // eslint-disable-next-line
    // @ts-ignore
    authorizer: api.authorizersData.Authorizer,
    validator,
  });

  generateApiMethod({
    resource: gamePath,
    method: HttpMethod.PUT,
    handlerFn: putGame,
    // eslint-disable-next-line
    // @ts-ignore
    authorizer: api.authorizersData.Authorizer,
    model: api.cdk.restApi.addModel(putGameModal.modelName, putGameModal as ModelOptions),
    validator,
  });
}
