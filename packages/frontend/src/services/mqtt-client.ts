/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0.
 */
import type { CognitoIdentityCredentials } from '@aws-sdk/credential-provider-cognito-identity/dist-types/fromCognitoIdentity'

import { fromCognitoIdentityPool } from '@aws-sdk/credential-providers'
import { iot, mqtt5 } from 'aws-iot-device-sdk-v2'

interface AWSCognitoCredentialOptions {
  IdentityPoolId: string
}

/**
 * Generates a new instance of AWSCognitoCredentialsProvider with the provided options.
 * Automatically refreshes credentials at a specified interval.
 */
class AWSCognitoCredentialsProvider {
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
      aws_region: 'us-east-1'
    }
  }

  async refreshCredentials() {
    try {
      this.cachedCredentials = await fromCognitoIdentityPool({
        identityPoolId: this.options.IdentityPoolId,
        clientConfig: { region: 'us-east-1' }
      })()
    } catch {
      console.log('Error: Failed to obtain credentials')
    }
  }
}

function createClient(provider: AWSCognitoCredentialsProvider): mqtt5.Mqtt5Client {
  const wsConfig: iot.WebsocketSigv4Config = {
    credentialsProvider: provider,
    region: 'us-east-1'
  }

  const builder: iot.AwsIotMqtt5ClientConfigBuilder =
    iot.AwsIotMqtt5ClientConfigBuilder.newWebsocketMqttBuilderWithSigv4Auth(
      process.env.NEXT_PUBLIC_IOT_ENDPOINT ?? '',
      wsConfig
    )

  builder.withConnectProperties({
    clientId: `mqtt-client-chilis-${Math.floor(Math.random() * 100_000 + 1)}`,
    keepAliveIntervalSeconds: 60
  })

  const client: mqtt5.Mqtt5Client = new mqtt5.Mqtt5Client(builder.build())

  client.on('error', (error) => {
    console.log(`Error event: ${error.toString()}`)
  })

  client.on('connectionSuccess', () => {
    console.log('Connection Success event')
  })

  client.on('connectionFailure', (eventData: mqtt5.ConnectionFailureEvent) => {
    console.log(`Connection failure event: ${eventData.error.toString()}`)
  })

  client.on('disconnection', (eventData: mqtt5.DisconnectionEvent) => {
    console.log(`Disconnection event: ${eventData.error.toString()}`)
    if (eventData.disconnect !== undefined) {
      console.log(`Disconnect packet: ${JSON.stringify(eventData.disconnect)}`)
    }
  })

  client.on('stopped', () => {
    console.log(`Stopped event.`)
  })

  return client
}

export default async function clientMqtt5() {
  const provider = new AWSCognitoCredentialsProvider({
    IdentityPoolId: process.env.NEXT_PUBLIC_IDENTITY_POOL_ID ?? ''
  })
  await provider.refreshCredentials()

  return createClient(provider)
}
