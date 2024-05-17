import fetch from "node-fetch";
import { logger } from "@/libs/powertools";
import type { Context, SecretsManagerRotationEvent } from "aws-lambda";
import {
  SecretsManagerClient,
  DescribeSecretCommand,
  PutSecretValueCommand,
  GetSecretValueCommand,
  UpdateSecretVersionStageCommand,
} from "@aws-sdk/client-secrets-manager";

logger.appendKeys({
  namespace: "Lambda-To-Rotate-Token",
  service: "AWS::Lambda",
});

const clientSM = new SecretsManagerClient();

export const handler = async (event: SecretsManagerRotationEvent, context: Context) => {
  logger.info("Handler to rotate the token", { event, ...context });
  const { SecretId, ClientRequestToken, Step } = event;

  const { RotationEnabled, VersionIdsToStages = {} } = await clientSM.send(new DescribeSecretCommand({ SecretId }));
  logger.info("Secret details", { RotationEnabled, VersionIdsToStages });

  if (!RotationEnabled) {
    logger.error(`Rotation not enabled for ${SecretId}`);
    throw new Error();
  }
  if (!Object.keys(VersionIdsToStages).includes(ClientRequestToken)) {
    logger.error(`Version ${ClientRequestToken} has no stage for rotation of ${SecretId}`);
    throw new Error();
  }
  if (VersionIdsToStages[ClientRequestToken].includes("AWSCURRENT")) {
    logger.info(`Version ${ClientRequestToken} already set as AWSCURRENT for ${SecretId}`);
    return;
  }
  if (!VersionIdsToStages[ClientRequestToken].includes("AWSPENDING")) {
    logger.error(`Version ${ClientRequestToken} not set as AWSPENDING for rotation of ${SecretId}`);
    throw new Error();
  }

  switch (Step) {
    case "createSecret":
      await createSecret(SecretId, ClientRequestToken);
      break;
    case "setSecret":
      logger.info("setSecret not implemented");
      break;
    case "finishSecret":
      await finishSecret(SecretId, ClientRequestToken);
      break;
    case "testSecret":
      logger.info("testSecret not implemented");
      break;
    default:
      logger.error(`Invalid Secret Rotation Step: ${Step}`);
      throw new Error();
  }
};

async function createSecret(SecretId: string, VersionId: string) {
  const { SecretString } = await clientSM.send(new GetSecretValueCommand({ SecretId: process.env.BRINKER_ACCESS!, VersionStage: "AWSCURRENT" }));
  if (!SecretString) {
    logger.error(`${process.env.BRINKER_ACCESS} not found`);
    throw new Error();
  }

  try {
    await clientSM.send(new GetSecretValueCommand({ SecretId, VersionId, VersionStage: "AWSPENDING" }));
    logger.info(`createSecret: Successfully retrieved ${SecretId}`);
  } catch (err) {
    const accessData = JSON.parse(SecretString);
    const response = await fetch(`${accessData.apiUrl}/enterprise/oauth/generateToken/v1`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: accessData.clientId,
        client_secret: accessData.clientSecret,
        grant_type: "client_credentials",
      }),
    });

    if (!response.ok) {
      logger.error("brinker API Error");
      throw new Error();
    }

    // Get the new token and save it in the secret
    response.json().then(async ({ access_token }) => {
      logger.info("Fetch a brinker successfully");

      await clientSM.send(
        new PutSecretValueCommand({
          SecretId,
          ClientRequestToken: VersionId,
          VersionStages: ["AWSPENDING"],
          SecretString: JSON.stringify(access_token),
        })
      );

      logger.info(`createSecret: Successfully created ${SecretId}`);
    });
  }
}

async function finishSecret(SecretId: string, VersionId: string) {
  let currentVersion;
  const { VersionIdsToStages = {} } = await clientSM.send(new DescribeSecretCommand({ SecretId }));

  Object.keys(VersionIdsToStages).forEach((version) => {
    if (VersionIdsToStages[version].includes("AWSCURRENT")) {
      if (version == VersionId) {
        logger.info(`finishSecret: Version ${VersionId} is already marked as AWSCURRENT for ${SecretId}`);
        return;
      }
      currentVersion = version;
    }
  });

  await clientSM.send(
    new UpdateSecretVersionStageCommand({
      SecretId,
      VersionStage: "AWSCURRENT",
      MoveToVersionId: VersionId,
      RemoveFromVersionId: currentVersion,
    })
  );

  logger.info(`finishSecret: Successfully set AWSCURRENT stage to version ${VersionId} for ${SecretId}`);
}
