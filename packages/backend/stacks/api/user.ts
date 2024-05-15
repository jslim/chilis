import type { StackContext } from "sst/constructs";
import { Function, use } from "sst/constructs";
import { ApiStack } from "@/stacks/api/api";
import { HttpMethod } from "aws-cdk-lib/aws-events";
import { type ModelOptions } from "aws-cdk-lib/aws-apigateway";
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

  const patchUser = new Function(stack, "patch-user", {
    functionName: `${app.stage}-patch-user`,
    description: "Endpoint to create user nickname",
    handler: "packages/backend/handlers/user/patch.handler",
    ...(isProd && {
      reservedConcurrentExecutions: 50,
    }),
  });

  const putUser = new Function(stack, "put-user", {
    functionName: `${app.stage}-put-user`,
    description: "Endpoint to save user history score",
    handler: "packages/backend/handlers/user/put.handler",
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
    method: HttpMethod.PATCH,
    handlerFn: patchUser,
    //  authorizer: // TODO: Validate that an authenticated user is called to this endpoint
    validator,
  });

  generateApiMethod({
    resource: userPath,
    method: HttpMethod.PUT,
    handlerFn: putUser,
    //  authorizer: // TODO: Validate that an authenticated user is called to this endpoint
    validator,
  });
}
