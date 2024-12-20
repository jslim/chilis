import type { StackContext } from "sst/constructs";
import { ApiGatewayV1Api, Function, use } from "sst/constructs";
import { IdentitySource } from "aws-cdk-lib/aws-apigateway";
// import { Duration } from "aws-cdk-lib";

import { detectStage } from "@/libs/detect-stage";
import { setDefaultFunctionProps } from "@/utils/set-default-function-props";

import { AuthStack } from "@/stacks";

export function ApiStack({ stack, app }: StackContext) {
  let usagePlan;
  const { auth } = use(AuthStack);
  const { isProd, isDevelop } = detectStage(app.stage);

  setDefaultFunctionProps({ stack, app }, { environment: { COUNTRIES_ALLOW_LIST: process.env.COUNTRIES_ALLOW_LIST! } });

  // Create Authorizer function
  const authorizerFunction = new Function(stack, "api-authorizer-fn", {
    functionName: `${app.stage}-api-authorizer-fn`,
    handler: "packages/backend/handlers/custom-api-authorizer.handler",
    environment: {
      USER_POOL_ID: auth.userPoolId,
      USER_CLIENT_ID: auth.userPoolClientId,
    },
  });

  const api = new ApiGatewayV1Api(stack, "api", {
    authorizers: {
      Authorizer: {
        name: `${app.stage}-api-authorizer`,
        type: "lambda_token",
        function: authorizerFunction,
        identitySources: [IdentitySource.header("Authorization")],
        resultsCacheTtl: `${isDevelop ? 0 : 30} seconds`,
      },
    },
    cdk: {
      restApi: {
        deployOptions: {
          // cacheClusterEnabled: true,
          // methodOptions: {
          //   "/leaderboard/GET": {
          //     cachingEnabled: true,
          //     // eslint-disable-next-line
          //     // @ts-ignore
          //     cacheTtl: Duration.seconds(3),
          //     cacheDataEncrypted: true,
          //   },
          //   "/leaderboard/{records}/GET": {
          //     cachingEnabled: true,
          //     // eslint-disable-next-line
          //     // @ts-ignore
          //     cacheTtl: Duration.seconds(3),
          //     cacheDataEncrypted: true,
          //   },
          // },
        },
      },
    },
  });

  // Create generic request validator
  const validator = api.cdk.restApi.addRequestValidator("BodyParamsValidator", {
    requestValidatorName: "BodyParamsValidator",
    validateRequestBody: true,
    validateRequestParameters: true,
  });

  if (isProd) {
    usagePlan = api.cdk.restApi.addUsagePlan("UsagePlan", {
      name: "API",
      throttle: {
        rateLimit: 50,
        burstLimit: 25,
      },
    });
  }

  stack.addOutputs({
    ApiEndpoint: api.url,
  });

  return { api, usagePlan, validator };
}
