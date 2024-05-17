import { SecretValue } from "aws-cdk-lib";
import { Secret } from "aws-cdk-lib/aws-secretsmanager";
import type { StackContext } from "sst/constructs";
import { Function, Cron } from "sst/constructs";
import { setDefaultFunctionProps } from "@/utils/set-default-function-props";
import { detectStage } from "@/libs/detect-stage";
import { BRINKER_ACCESS, BRINKER_TOKEN } from "@/libs/config";
import { PolicyStatement, Effect } from "aws-cdk-lib/aws-iam";

export function SecretsStack({ stack, app }: StackContext) {
  const { isProd } = detectStage(app.stage);
  const brinkerTokenSecretName = `${app.stage}${BRINKER_TOKEN}`;
  const brinkerAccessSecretName = `${app.stage}${BRINKER_ACCESS}`;

  setDefaultFunctionProps({ stack, app });

  // Access secret
  const brinkerAccess = new Secret(stack, "brinker-access", {
    secretName: brinkerAccessSecretName,
    description: "Secret with access information for the brinker API",
    secretObjectValue: {
      apiUrl: SecretValue.unsafePlainText("UPDATE_ME"),
      clientId: SecretValue.unsafePlainText("UPDATE_ME"),
      clientSecret: SecretValue.unsafePlainText("UPDATE_ME"),
    },
  });

  // Token secret
  const brinkerToken = new Secret(stack, "brinker-token", {
    secretName: brinkerTokenSecretName,
    description: "Secret where the token necessary to access the API is stored",
    secretStringValue: SecretValue.unsafePlainText("UPDATE_ME"),
  });

  /**
   * Lambda function responsible for rotating the Brinker API token.
   * This function is triggered to fetch a new token and update the corresponding secret in AWS Secrets Manager.
   */
  const rotationLambdaFn = new Function(stack, "brinker-token-rotation", {
    functionName: `${app.stage}-brinker-token-rotation`,
    description: "Gets the token needed to authenticate to the brinker API",
    handler: "packages/backend/handlers/secrets/brinker-token-rotation.handler",
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
      BRINKER_TOKEN: brinkerTokenSecretName,
      BRINKER_ACCESS: brinkerAccessSecretName,
    },
    ...(isProd && {
      reservedConcurrentExecutions: 50,
    }),
  });

  /**
   * Lambda function intended to be triggered by a cron job to initiate the rotation of the Brinker API access token.
   */
  const invokeRotation = new Function(stack, "invoke-brinker-token-rotation", {
    functionName: `${app.stage}-invoke-brinker-token-rotation`,
    description: "Function that will be executed by a cron job to rotate the access token to brinker at a specific time",
    handler: "packages/backend/handlers/secrets/invoke-brinker-token-rotation.handler",
    permissions: [
      // eslint-disable-next-line
      // @ts-ignore
      new PolicyStatement({
        actions: ["secretsmanager:RotateSecret"],
        effect: Effect.ALLOW,
        resources: [brinkerToken.secretArn],
      }),
    ],
    environment: {
      BRINKER_TOKEN: brinkerTokenSecretName,
    },
    ...(isProd && {
      reservedConcurrentExecutions: 50,
    }),
  });

  /**
   * Rotation configuration
   *
   * @default Duration.days(30)
   */
  brinkerToken.addRotationSchedule("rotate-token", {
    // eslint-disable-next-line
    // @ts-ignore
    rotationLambda: rotationLambdaFn,
  });

  /**
   * Cron job configuration
   *
   * Every 55 minutes
   */
  new Cron(stack, "Cron", {
    schedule: "rate(55 minutes)",
    job: invokeRotation,
  });

  // eslint-disable-next-line
  // @ts-ignore
  brinkerToken.grantWrite(rotationLambdaFn);

  return { brinkerAccess, brinkerToken };
}
