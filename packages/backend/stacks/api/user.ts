import type { StackContext } from "sst/constructs";
import { Function, use } from "sst/constructs";
import { HttpMethod } from "aws-cdk-lib/aws-events";
import { PolicyStatement, Effect } from "aws-cdk-lib/aws-iam";
import { type ModelOptions } from "aws-cdk-lib/aws-apigateway";
import { detectStage } from "@/libs/detect-stage";
import generateApiMethod from "@/utils/generate-api-method";
import { setDefaultFunctionProps } from "@/utils/set-default-function-props";
import postUserModel from "@/stacks/user/models/post-user";
import { BRINKER_ACCESS } from "@/libs/config";
import { SecretsStack } from "@/stacks/secrets";
import { AuthStack, ApiStack } from "@/stacks";
import patchUserModel from "@/stacks/user/models/patch-user";

export function userApiStack({ stack, app }: StackContext) {
  const { isProd } = detectStage(app.stage);
  const { auth } = use(AuthStack);
  const { api, validator } = use(ApiStack);
  const { brinkerAccess } = use(SecretsStack);
  const brinkerAccessSecretName = `${app.stage}${BRINKER_ACCESS}`;

  setDefaultFunctionProps({ stack, app }, { environment: { COUNTRIES_ALLOW_LIST: process.env.COUNTRIES_ALLOW_LIST! } });

  const postUserLogin = new Function(stack, "post-user-login", {
    functionName: `${app.stage}-post-user-login`,
    description: "login access for user",
    handler: "packages/backend/handlers/user/post.handler",
    environment: {
      USER_POOL_ID: auth.userPoolId,
      USER_CLIENT_ID: auth.userPoolClientId,
      BRINKER_ACCESS: brinkerAccessSecretName,
    },
    permissions: [
      // eslint-disable-next-line
      // @ts-ignore
      new PolicyStatement({
        actions: ["cognito-idp:AdminGetUser", "cognito-idp:AdminCreateUser"],
        effect: Effect.ALLOW,
        resources: [auth.userPoolArn],
      }),
      // eslint-disable-next-line
      // @ts-ignore
      new PolicyStatement({
        actions: ["secretsmanager:GetSecretValue", "secretsmanager:RotateSecret"],
        effect: Effect.ALLOW,
        resources: [brinkerAccess.secretArn],
      }),
    ],
    ...(isProd && {
      reservedConcurrentExecutions: 50,
    }),
  });

  const patchUser = new Function(stack, "patch-user", {
    functionName: `${app.stage}-patch-user`,
    description: "Endpoint to create user nickname",
    handler: "packages/backend/handlers/user/patch.handler",
    environment: {
      USER_POOL_ID: auth.userPoolId,
      USER_CLIENT_ID: auth.userPoolClientId,
    },
    permissions: [
      // eslint-disable-next-line
      // @ts-ignore
      new PolicyStatement({
        actions: ["cognito-idp:ListUsers"],
        effect: Effect.ALLOW,
        resources: [auth.userPoolArn],
      }),
    ],
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
    // eslint-disable-next-line
    // @ts-ignore
    authorizer: api.authorizersData.Authorizer,
    model: api.cdk.restApi.addModel(patchUserModel.modelName, patchUserModel as ModelOptions),
    validator,
  });
}
