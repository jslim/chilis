import type { CognitoIdentityCredentials } from '@aws-sdk/credential-provider-cognito-identity/dist-types/fromCognitoIdentity'

import { fromCognitoIdentityPool } from '@aws-sdk/credential-providers'

interface AWSCognitoCredentialOptions {
  IdentityPoolId: string
}

const AWS_REGION = process.env.NEXT_PUBLIC_FE_REGION ?? 'us-east-1'

/**
 * Generates a new instance of AWSCognitoCredentialsProvider with the provided options.
 * Automatically refreshes credentials at a specified interval.
 */
export default class AWSCognitoCredentialsProvider {
  private cachedCredentials?: CognitoIdentityCredentials

  constructor(
    private readonly options: AWSCognitoCredentialOptions,
    expire_interval_in_ms?: number
  ) {
    this.options = options

    setInterval(
      async () => {
        await this.refreshCredentials()
      },
      expire_interval_in_ms ?? 3600 * 1000
    )
  }

  getCredentials() {
    return {
      aws_access_id: this.cachedCredentials?.accessKeyId ?? '',
      aws_secret_key: this.cachedCredentials?.secretAccessKey ?? '',
      aws_sts_token: this.cachedCredentials?.sessionToken,
      aws_region: AWS_REGION
    }
  }

  async refreshCredentials() {
    try {
      this.cachedCredentials = await fromCognitoIdentityPool({
        identityPoolId: this.options.IdentityPoolId,
        clientConfig: { region: AWS_REGION }
      })()
    } catch {
      console.log('Error: Failed to obtain credentials')
    }
  }
}
