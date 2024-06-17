import type { StackContext } from "sst/constructs";
import { ApiGatewayV1Api, Function, use } from "sst/constructs";
import { IdentitySource } from "aws-cdk-lib/aws-apigateway";
import { detectStage } from "@/libs/detect-stage";
import { ENVS_TARGET } from "@/libs/stack-data";
import { setDefaultFunctionProps } from "@/utils/set-default-function-props";
import { isValidDomain } from "@/utils/domain-validator";
import { AuthStack } from "@/stacks";
import { Duration } from "aws-cdk-lib";

export function ApiStack({ stack, app }: StackContext) {
  let usagePlan;
  const { auth } = use(AuthStack);
  const { isDevelopment, isProd, isDevelop } = detectStage(app.stage);

  setDefaultFunctionProps({ stack, app });

  // Create Authorizer function
  const authorizerFunction = new Function(stack, "api-authorizer-fn", {
    functionName: `${app.stage}-api-authorizer-fn`,
    handler: "packages/backend/handlers/custom-api-authorizer.handler",
    environment: {
      USER_POOL_ID: auth.userPoolId,
      USER_CLIENT_ID: auth.userPoolClientId,
    },
  });

  let domainName = undefined;
  const domainStage = ENVS_TARGET[app.stage as keyof typeof ENVS_TARGET];
  const baseDomain = process.env.BASE_DOMAIN!;

  if (domainStage !== undefined && isValidDomain(baseDomain)) {
    domainName = (isProd ? `api` : `api.${app.stage}`) + `.${baseDomain}`;
  }

  const api = new ApiGatewayV1Api(stack, "api", {
    customDomain: {
      domainName,
      hostedZone: baseDomain!,
    },
    authorizers: {
      Authorizer: {
        name: "ApiAuthorizer",
        type: "lambda_token",
        function: authorizerFunction,
        identitySources: [IdentitySource.header("Authorization")],
        resultsCacheTtl: `${isDevelop ? 0 : 30} seconds`,
      },
    },
    cdk: {
      restApi: {
        deployOptions: {
          cacheClusterEnabled: true,
          methodOptions: {
            "/leaderboard/GET": {
              cachingEnabled: true,
              // eslint-disable-next-line
              // @ts-ignore
              cacheTtl: Duration.seconds(10),
              cacheDataEncrypted: true,
            },
            "/leaderboard/{records}/GET": {
              cachingEnabled: true,
              // eslint-disable-next-line
              // @ts-ignore
              cacheTtl: Duration.seconds(10),
              cacheDataEncrypted: true,
            },
          },
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
    ApiEndpoint: domainName || api.url,
  });

  return { api, usagePlan, validator };
}
