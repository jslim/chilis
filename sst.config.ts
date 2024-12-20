import { SSTConfig } from "sst";

import {
  CICD,
  AlarmStack,
  FirehoseStack,
  FrontendDistribution,
  S3Origin,
  WebACL,
  AuthStack,
  ApiStack,
  ApiDistributionStack,
  userApiStack,
  gameApiStack,
  leaderboardApiStack,
  countryCodeApiStack,
  Database,
  SecretsStack,
  WafStack,
  IoTStack,
} from "@app/backend/stacks";

import { SST_APP_NAME } from "@app/backend/libs/config";

export default {
  config() {
    return {
      name: SST_APP_NAME,
      region: process.env.AWS_REGION || "us-east-1",
    };
  },
  stacks(app) {
    if (process.env.DEPLOY_CICD === "true") {
      /* CICD */
      app.stack(CICD);
    }

    app
      .stack(AlarmStack)
      /* Backend */
      .stack(WafStack)
      .stack(Database)
      .stack(SecretsStack)
      .stack(AuthStack)
      .stack(ApiStack)
      .stack(ApiDistributionStack)
      .stack(userApiStack)
      .stack(gameApiStack)
      .stack(leaderboardApiStack)
      .stack(IoTStack)
      .stack(countryCodeApiStack)
      /* Frontend */
      .stack(WebACL)
      .stack(S3Origin)
      .stack(FrontendDistribution)
      .stack(FirehoseStack);
  },
} satisfies SSTConfig;
