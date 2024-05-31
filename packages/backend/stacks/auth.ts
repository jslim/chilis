import { SecretsStack } from "@/stacks";
import { RemovalPolicy } from "aws-cdk-lib";
import { Function, use } from "sst/constructs";
import { BRINKER_ACCESS } from "@/libs/config";
import { detectStage } from "@/libs/detect-stage";
import { Cognito, StackContext } from "sst/constructs";
import { PolicyStatement, Effect } from "aws-cdk-lib/aws-iam";
import { setDefaultFunctionProps } from "@/utils/set-default-function-props";

export function AuthStack({ stack, app }: StackContext) {
  const { isProd } = detectStage(app.stage);
  const { brinkerAccess } = use(SecretsStack);
  const brinkerAccessSecretName = `${app.stage}${BRINKER_ACCESS}`;

  setDefaultFunctionProps({ stack, app });

  const preSignUpFn = new Function(stack, "pre-signup-fn", {
    functionName: `${app.stage}-pre-signup-fn`,
    description: "Function that is activated before signup a user to validate that the user is valid in brinker",
    handler: "packages/backend/handlers/user/auth/pre-signup-fn.handler",
    permissions: [
      // eslint-disable-next-line
      // @ts-ignore
      new PolicyStatement({
        actions: ["secretsmanager:GetSecretValue"],
        effect: Effect.ALLOW,
        resources: [brinkerAccess.secretArn],
      }),
    ],
    environment: {
      BRINKER_ACCESS: brinkerAccessSecretName,
    },
    ...(isProd && {
      reservedConcurrentExecutions: 50,
    }),
  });

  const defineAuthChallengeFn = new Function(stack, "define-auth-challenge-fn", {
    functionName: `${app.stage}-define-auth-challenge-fn`,
    description: "Lambda function invoked from cognito to start the custom authentication flow. This Lambda function tracks the custom authentication flow.",
    handler: "packages/backend/handlers/user/auth/define-auth-challenge-fn.handler",
    ...(isProd && {
      reservedConcurrentExecutions: 50,
    }),
  });

  const createAuthChallengeFn = new Function(stack, "create-auth-challenge-fn", {
    functionName: `${app.stage}-create-auth-challenge-fn`,
    description: "Lambda function invoked after Define Auth Challenge. This Lambda function is invoked to create a challenge to present to the user",
    handler: "packages/backend/handlers/user/auth/create-auth-challenge-fn.handler",
    permissions: [
      // eslint-disable-next-line
      // @ts-ignore
      new PolicyStatement({
        actions: ["secretsmanager:GetSecretValue"],
        effect: Effect.ALLOW,
        resources: [brinkerAccess.secretArn],
      }),
    ],
    environment: {
      BRINKER_ACCESS: brinkerAccessSecretName,
    },
    ...(isProd && {
      reservedConcurrentExecutions: 50,
    }),
  });

  const verifyAuthChallengeResponseFn = new Function(stack, "verify-auth-challenge-fn", {
    functionName: `${app.stage}-verify-auth-challenge-fn`,
    description: "Amazon Cognito invokes this trigger to verify if the response from the user for a custom Auth Challenge is valid or not.",
    handler: "packages/backend/handlers/user/auth/verify-auth-challenge-fn.handler",
    ...(isProd && {
      reservedConcurrentExecutions: 50,
    }),
  });

  const auth = new Cognito(stack, "PooledUsers", {
    login: ["username"],
    triggers: {
      preSignUp: preSignUpFn,
      defineAuthChallenge: defineAuthChallengeFn,
      createAuthChallenge: createAuthChallengeFn,
      verifyAuthChallengeResponse: verifyAuthChallengeResponseFn,
    },
    cdk: {
      userPool: {
        selfSignUpEnabled: false,
        removalPolicy: !isProd ? RemovalPolicy.DESTROY : RemovalPolicy.RETAIN,
        signInAliases: { username: true },
        standardAttributes: {
          nickname: {},
        },
        accountRecovery: 5, // NONE
      },
      userPoolClient: {
        authFlows: {
          custom: true,
        },
        preventUserExistenceErrors: true,
      },
    },
  });

  // Exportar la información necesaria
  stack.addOutputs({
    UserPoolId: auth.userPoolId,
    UserPoolClientId: auth.userPoolClientId,
  });

  return { auth };
}
