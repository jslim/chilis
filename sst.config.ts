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
  Database,
  SecretsStack,
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
      /* Frontend */
      .stack(WebACL)
      .stack(S3Origin)
      .stack(FrontendDistribution)
      .stack(FirehoseStack);
  },
} satisfies SSTConfig;
