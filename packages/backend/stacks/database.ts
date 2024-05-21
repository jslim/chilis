import { RemovalPolicy } from "aws-cdk-lib";
import type { StackContext } from "sst/constructs";
import { Table as DynamoDbTable } from "sst/constructs";

export function Database({ stack, app }: StackContext) {
  const gameHistoryTable = new DynamoDbTable(stack, "userGameHistory", {
    fields: {
      subReference: "string",
      gameScore: "string", // StringSet <{score: string; level: number; timestamp: string;}>
    },
    primaryIndex: { partitionKey: "subReference" },
    cdk: {
      table: {
        removalPolicy: app.stage !== "prod" ? RemovalPolicy.DESTROY : RemovalPolicy.RETAIN,
      },
    },
  });

  const leaderbaordTable = new DynamoDbTable(stack, "leaderbaordTable", {
    fields: {
      subReference: "string",
      score: "number",
      level: "number",
      timestamp: "string",
      nickname: "string",
    },
    primaryIndex: { partitionKey: "subReference", sortKey: "score" },
    cdk: {
      table: {
        removalPolicy: app.stage !== "prod" ? RemovalPolicy.DESTROY : RemovalPolicy.RETAIN,
      },
    },
  });

  return { gameHistoryTable, leaderbaordTable };
}
