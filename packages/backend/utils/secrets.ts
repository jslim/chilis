import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

const clientSM = new SecretsManagerClient();

export async function getSecret(SecretId: string) {
  const { SecretString } = await clientSM.send(new GetSecretValueCommand({ SecretId, VersionStage: "AWSCURRENT" }));
  if (!SecretString) {
    throw new Error(`${SecretId} not found`);
  }
  return JSON.parse(SecretString);
}
