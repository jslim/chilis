import type { StackContext } from "sst/constructs";
import { Function, use } from "sst/constructs";
import { ApiStack } from "@/stacks";
import { detectStage } from "@/libs/detect-stage";
import { HttpMethod } from "aws-cdk-lib/aws-events";
import generateApiMethod from "@/utils/generate-api-method";
import { setDefaultFunctionProps } from "@/utils/set-default-function-props";

export function countryCodeApiStack({ stack, app }: StackContext) {
  const { isProd } = detectStage(app.stage);
  const { api, validator } = use(ApiStack);

  setDefaultFunctionProps({ stack, app }, { environment: { COUNTRIES_ALLOW_LIST: process.env.COUNTRIES_ALLOW_LIST! } });

  const getCountryCode = new Function(stack, "get-country-code", {
    functionName: `${app.stage}-get-country-code`,
    description: "Retrieve the country code",
    handler: "packages/backend/handlers/country-code/get.handler",
    permissions: [],
    ...(isProd && {
      reservedConcurrentExecutions: 50,
    }),
  });

  /**
   * country code API endpoints
   */
  const countryCodePath = api.cdk.restApi.root.addResource("country-code");

  generateApiMethod({
    resource: countryCodePath,
    method: HttpMethod.GET,
    handlerFn: getCountryCode,
    validator,
  });
}
