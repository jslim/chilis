import { SecretsManagerClient, GetSecretValueCommand, RotateSecretCommand } from "@aws-sdk/client-secrets-manager";

const clientSM = new SecretsManagerClient();

/**
 * Retrieves a secret from AWS Secrets Manager.
 * @param SecretId - The ID of the secret to retrieve.
 * @returns The parsed JSON object representing the secret.
 */
export async function getSecret(SecretId: string) {
  const { SecretString } = await clientSM.send(new GetSecretValueCommand({ SecretId, VersionStage: "AWSCURRENT" }));
  if (!SecretString) {
    throw new Error(`${SecretId} not found`);
  }
  return JSON.parse(SecretString);
}

/**
 * Rotates a secret in AWS Secrets Manager.
 * @param SecretId - The ID of the secret to rotate.
 * @returns A promise that resolves when the instruction to rotate has been received.
 */
export async function rotateToken(SecretId: string) {
  let smCommant;
  try {
    smCommant = await clientSM.send(new RotateSecretCommand({ SecretId: SecretId }));
  } catch (error) {
    throw new Error(`Error: ${error}`);
  }
  return smCommant;
}
