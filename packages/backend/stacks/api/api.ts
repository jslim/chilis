import type { StackContext } from "sst/constructs";
import { ApiGatewayV1Api } from "sst/constructs";
import { detectStage } from "@/libs/detect-stage";
import { ENVS_TARGET } from "@/libs/stack-data";
import { setDefaultFunctionProps } from "@/utils/set-default-function-props";

export function ApiStack({ stack, app }: StackContext) {
  let usagePlan;
  const { isProd } = detectStage(app.stage);

  setDefaultFunctionProps({ stack, app });

  let customDomain = undefined;
  const domainStage = ENVS_TARGET[app.stage as keyof typeof ENVS_TARGET];
  if (domainStage !== undefined) {
    customDomain = (domainStage === "" ? `api` : `api.${domainStage}`) + `.${process.env.BASE_DOMAIN}`;
  }

  const api = new ApiGatewayV1Api(stack, "api", { customDomain });

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
    ApiEndpoint: customDomain || api.url,
  });

  return { api, usagePlan, validator };
}
