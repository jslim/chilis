import { Function, use } from "sst/constructs";
import type { StackContext } from "sst/constructs";
import { CfnTopicRule } from "aws-cdk-lib/aws-iot";
import { SEND_TOPIC_PATTERN } from "@/libs/config";
import { Effect, PolicyStatement, ServicePrincipal } from "aws-cdk-lib/aws-iam";

export function IoTStack({ stack, app }: StackContext) {
  const sendActionFunction = new Function(stack, "send-action-handler", {
    functionName: `${app.stage}-send-action`,
    handler: "packages/backend/handlers/iot/send.handler",
    permissions: [
      // eslint-disable-next-line
      // @ts-ignore
      // new PolicyStatement({
      //   actions: ['dynamodb:Query', 'dynamodb:GetItem', 'dynamodb:UpdateItem', 'dynamodb:PutItem'],
      //   effect: Effect.ALLOW,
      //   resources: [gameTable.tableArn]
      // })
    ],
    environment: {
      // CONNECTION_TABLE_NAME: connection.tableName,
      // GAMES_TABLE_NAME: gameTable.tableName
    },
  });

  const disconnectedFunction = new Function(stack, "disconnection-handler", {
    functionName: `${app.stage}-disconnected`,
    handler: "packages/backend/handlers/iot/disconnected.handler",
    // permissions: [
    //   // eslint-disable-next-line
    //   // @ts-ignore
    //   new PolicyStatement({
    //     actions: [
    //       'dynamodb:DeleteItem',
    //       'dynamodb:Query',
    //       'dynamodb:GetItem',
    //       'dynamodb:UpdateItem',
    //       'dynamodb:PutItem',
    //       'dynamodb:Scan'
    //     ],
    //     effect: Effect.ALLOW,
    //     resources: [connection.tableArn]
    //   }),
    //   // eslint-disable-next-line
    //   // @ts-ignore
    //   new PolicyStatement({
    //     actions: ['dynamodb:Query', 'dynamodb:GetItem', 'dynamodb:UpdateItem', 'dynamodb:PutItem'],
    //     effect: Effect.ALLOW,
    //     resources: [gameTable.tableArn]
    //   })
    // ],
    environment: {
      // CONNECTION_TABLE_NAME: connection.tableName,
      // GAMES_TABLE_NAME: gameTable.tableName
    },
  });

  const sendActionTopicRule = new CfnTopicRule(stack, "send-action-topic-rule", {
    topicRulePayload: {
      sql: `SELECT * FROM '${SEND_TOPIC_PATTERN}/+'`,
      ruleDisabled: false,
      awsIotSqlVersion: "2016-03-23",
      actions: [
        {
          lambda: {
            functionArn: sendActionFunction.functionArn,
          },
        },
      ],
    },
  });

  sendActionFunction.addPermission("IotInvokePermission", {
    action: "lambda:InvokeFunction",
    // eslint-disable-next-line
    // @ts-ignore
    principal: new ServicePrincipal("iot.amazonaws.com"),
    sourceArn: sendActionTopicRule.attrArn,
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

  return {
    disconnectTopicRule,
    sendActionTopicRule,
  };
}
