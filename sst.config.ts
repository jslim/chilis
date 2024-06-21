import { SSTConfig } from "sst";

import {
  CICD,
  FirehoseStack,
  FrontendDistribution,
  S3Origin,
  WebACL,
  AuthStack,
  ApiStack,
  userApiStack,
  gameApiStack,
  leaderboardApiStack,
  countryCodeApiStack,
  Database,
  SecretsStack,
  WafStack,
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
      /* Backend */
      .stack(Database)
      .stack(SecretsStack)
      .stack(AuthStack)
      .stack(ApiStack)
      .stack(userApiStack)
      .stack(gameApiStack)
      .stack(leaderboardApiStack)
      .stack(countryCodeApiStack)
      .stack(WafStack)
      /* Frontend */
      .stack(WebACL)
      .stack(S3Origin)
      .stack(FrontendDistribution)
      .stack(FirehoseStack);
  },
} satisfies SSTConfig;
