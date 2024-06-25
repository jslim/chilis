import { RemovalPolicy } from "aws-cdk-lib";
import type { StackContext } from "sst/constructs";
import { Table as DynamoDbTable } from "sst/constructs";
import { ALLTIME_LEADERBOARD_INDEX } from "@/libs/config";
import { detectStage } from "@/libs/detect-stage";
import { BillingMode } from "aws-cdk-lib/aws-dynamodb";

export function Database({ stack, app }: StackContext) {
  const { isProd } = detectStage(app.stage);

  const gameHistoryTable = new DynamoDbTable(stack, "userGameHistory", {
    fields: {
      subReference: "string",
      gameScore: "string", // StringSet <{gameId: string; score: string; level: number; timestamp: string; valid: boolean;}>
    },
    primaryIndex: { partitionKey: "subReference" },
    cdk: {
      table: {
        ...(isProd
          ? {
              removalPolicy: RemovalPolicy.RETAIN,
              pointInTimeRecovery: true,
              billingMode: BillingMode.PROVISIONED,
              readCapacity: 4,
              writeCapacity: 4,
              contributorInsightsEnabled: true,
            }
          : { removalPolicy: RemovalPolicy.DESTROY }),
      },
    },
  });

  const gameSessionTable = new DynamoDbTable(stack, "gameSession", {
    fields: {
      subReference: "string", // Cognito user sub
      gameId: "string",
      status: "string", // active, inactive, completed
      timestamp: "string",
      steps: "string", // StringSet <{action: enum; name: string; level: number; point: number; timestamp: string;}>
      ttl: "number",
    },
    timeToLiveAttribute: "ttl",
    primaryIndex: { partitionKey: "subReference", sortKey: "gameId" },
    cdk: {
      table: {
        ...(isProd
          ? {
              removalPolicy: RemovalPolicy.RETAIN,
              pointInTimeRecovery: true,
              billingMode: BillingMode.PROVISIONED,
              readCapacity: 4,
              writeCapacity: 4,
              contributorInsightsEnabled: true,
            }
          : { removalPolicy: RemovalPolicy.DESTROY }),
      },
    },
  });

  const threeForMeTable = new DynamoDbTable(stack, "threeForMe", {
    fields: {
      subReference: "string", // Cognito user sub
      gameId: "string",
      timestamp: "string",
    },
    primaryIndex: { partitionKey: "subReference", sortKey: "timestamp" },
    cdk: {
      table: {
        ...(isProd
          ? {
              removalPolicy: RemovalPolicy.RETAIN,
              pointInTimeRecovery: true,
              billingMode: BillingMode.PROVISIONED,
              readCapacity: 4,
              writeCapacity: 4,
              contributorInsightsEnabled: true,
            }
          : { removalPolicy: RemovalPolicy.DESTROY }),
      },
    },
  });

  const leaderboardTable = new DynamoDbTable(stack, "leaderboardTable", {
    fields: {
      subReference: "string",
      score: "number",
      level: "number",
      timestamp: "string",
      nickname: "string",
      loyaltyId: "string",
      gsiPK: "string",
    },
    primaryIndex: { partitionKey: "subReference" },
    globalIndexes: {
      [ALLTIME_LEADERBOARD_INDEX]: {
        partitionKey: "gsiPK",
        sortKey: "score",
        projection: ["gsiPK", "nickname", "score", "timestamp"],
      },
    },
    cdk: {
      table: {
        ...(isProd
          ? {
              removalPolicy: RemovalPolicy.RETAIN,
              pointInTimeRecovery: true,
              billingMode: BillingMode.PROVISIONED,
              readCapacity: 4,
              writeCapacity: 4,
              contributorInsightsEnabled: true,
            }
          : { removalPolicy: RemovalPolicy.DESTROY }),
      },
    },
  });

  return { gameHistoryTable, gameSessionTable, leaderboardTable, threeForMeTable };
}
