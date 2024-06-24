import { Database } from "@/stacks/database";
import { Function, use } from "sst/constructs";
import type { StackContext } from "sst/constructs";
import { CfnTopicRule } from "aws-cdk-lib/aws-iot";
import { custom_resources } from "aws-cdk-lib";
import { TOPIC_GAME_ACTION_PATTERN } from "@/libs/config";
import { setDefaultFunctionProps } from "@/utils/set-default-function-props";
import { Effect, PolicyStatement, ServicePrincipal } from "aws-cdk-lib/aws-iam";

export function IoTStack({ stack, app }: StackContext) {
  const { gameSessionTable, threeForMeTable } = use(Database);

  setDefaultFunctionProps(
    { stack, app },
    {
      permissions: [
        // eslint-disable-next-line
        // @ts-ignore
        new PolicyStatement({
          actions: ["dynamodb:UpdateItem", "dynamodb:Query"],
          effect: Effect.ALLOW,
          resources: [gameSessionTable.tableArn],
        }),
      ],
      environment: { GAMES_SESSION_TABLE_NAME: gameSessionTable.tableName },
    },
  );

  const gameActionFunction = new Function(stack, "game-action-handler", {
    functionName: `${app.stage}-game-action`,
    handler: "packages/backend/handlers/iot/game-action.handler",
    permissions: [
      // eslint-disable-next-line
      // @ts-ignore
      new PolicyStatement({
        actions: ["dynamodb:PutItem", "dynamodb:Scan"],
        effect: Effect.ALLOW,
        resources: [threeForMeTable.tableArn],
      }),
    ],
    environment: {
      THREE_FOR_ME_TABLE_NAME: threeForMeTable.tableName,
    },
  });

  const disconnectedFunction = new Function(stack, "disconnection-handler", {
    functionName: `${app.stage}-disconnected`,
    handler: "packages/backend/handlers/iot/disconnected.handler",
  });

  const gameActionTopicRule = new CfnTopicRule(stack, "game-action-topic-rule", {
    topicRulePayload: {
      sql: `SELECT * FROM '${app.stage}/${TOPIC_GAME_ACTION_PATTERN}/+'`,
      ruleDisabled: false,
      awsIotSqlVersion: "2016-03-23",
      actions: [
        {
          lambda: {
            functionArn: gameActionFunction.functionArn,
          },
        },
      ],
    },
  });

  gameActionFunction.addPermission("IotInvokePermission", {
    action: "lambda:InvokeFunction",
    // eslint-disable-next-line
    // @ts-ignore
    principal: new ServicePrincipal("iot.amazonaws.com"),
    sourceArn: gameActionTopicRule.attrArn,
  });

  // eslint-disable-next-line
  // @ts-ignore
  const disconnectTopicRule = new CfnTopicRule(stack, "disconnected-topic-rule", {
    topicRulePayload: {
      sql: `SELECT *
      FROM '$aws/events/presence/disconnected/+'`,
      ruleDisabled: false,
      awsIotSqlVersion: "2016-03-23",
      actions: [
        {
          lambda: {
            functionArn: disconnectedFunction.functionArn,
          },
        },
      ],
    },
  });

  disconnectedFunction.addPermission("allowDisconnectInvoke", {
    // eslint-disable-next-line
    // @ts-ignore
    principal: new ServicePrincipal("iot.amazonaws.com"),
    sourceArn: disconnectTopicRule.attrArn,
  });

  // Get IoT endpoint through "describe"
  const getIotEndpoint = new custom_resources.AwsCustomResource(stack, "IotEndpoint", {
    onCreate: {
      service: "Iot",
      action: "describeEndpoint",
      physicalResourceId: custom_resources.PhysicalResourceId.fromResponse("endpointAddress"),
      parameters: {
        endpointType: "iot:Data-ATS",
      },
    },
    policy: custom_resources.AwsCustomResourcePolicy.fromSdkCalls({
      resources: custom_resources.AwsCustomResourcePolicy.ANY_RESOURCE,
    }),
  });

  stack.addOutputs({
    iotEndpoint: getIotEndpoint.getResponseField("endpointAddress"),
  });

  return {
    disconnectTopicRule,
    gameActionTopicRule,
    iotEndpoint: getIotEndpoint.getResponseField("endpointAddress"),
  };
}
