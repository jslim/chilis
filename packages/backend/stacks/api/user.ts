import type { StackContext } from "sst/constructs";
import { type ModelOptions } from "aws-cdk-lib/aws-apigateway";
import { Function, use } from "sst/constructs";
import { ApiStack } from "@/stacks/api/api";
import { HttpMethod } from "aws-cdk-lib/aws-events";
import { detectStage } from "@/libs/detect-stage";
import generateApiMethod from "@/utils/generate-api-method";
import { setDefaultFunctionProps } from "@/utils/set-default-function-props";
import postUserModel from "@/stacks/user/models/post-user";

export function userApiStack({ stack, app }: StackContext) {
  const { isProd } = detectStage(app.stage);
  const { api, validator } = use(ApiStack);

  setDefaultFunctionProps({ stack, app });

  const postUserLogin = new Function(stack, "post-user-login", {
    functionName: `${app.stage}-post-user-login`,
    description: "login access for user",
    handler: "packages/backend/handlers/user/post.handler",
    ...(isProd && {
      reservedConcurrentExecutions: 50,
    }),
  });

  const getUser = new Function(stack, "get-user", {
    functionName: `${app.stage}-get-user`,
    description: "Get user information",
    handler: "packages/backend/handlers/user/get.handler",
    ...(isProd && {
      reservedConcurrentExecutions: 50,
    }),
  });

  /**
   * user API endpoints
   */
  const userPath = api.cdk.restApi.root.addResource("user");

  generateApiMethod({
    resource: userPath,
    method: HttpMethod.POST,
    handlerFn: postUserLogin,
    model: api.cdk.restApi.addModel(postUserModel.modelName, postUserModel as ModelOptions),
    validator,
  });

  generateApiMethod({
    resource: userPath,
    method: HttpMethod.GET,
    handlerFn: getUser,
    //  authorizer: // TODO: Validate that an authenticated user is called to this endpoint
    validator,
  });
}
