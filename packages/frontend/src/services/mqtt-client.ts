import type { GameAction } from '@/game/GameAction'

import { iot, mqtt5 } from 'aws-iot-device-sdk-v2'

import AWSCognitoCredentialsProvider from '@/services/cognito-provider'

enum EvenType {
  GAME_ACTION = 'gameAction'
}

type GameEvent = {
  userId: string
  gameId: string
  clientId: string
  eventType: string
  step: string
}

/**
 * Manages the MQTT client connection and message handling.
 */
export default class MqttClientManager {
  private static instance: MqttClientManager | null = null

  public mqtt5Client: mqtt5.Mqtt5Client
  public isConnected: boolean
  public gameId: string = ''

  private readonly userId: string
  private readonly clientId: string
  private readonly provider: AWSCognitoCredentialsProvider

  private constructor(userId: string) {
    this.provider = new AWSCognitoCredentialsProvider({
      IdentityPoolId: process.env.NEXT_PUBLIC_IDENTITY_POOL_ID ?? ''
    })

    this.userId = userId

    this.isConnected = false
    this.clientId = `mqtt-client-chilis-${this.userId}`

    this.mqtt5Client = this.init()
  }

  public static getInstance(userId: string): MqttClientManager {
    if (!MqttClientManager.instance) {
      MqttClientManager.instance = new MqttClientManager(userId)
    }

    return MqttClientManager.instance
  }

  public connect(gameId: string) {
    this.gameId = gameId

    if (this.isConnected) {
      console.log('Connection already exists.')
      return
    }

    this.mqtt5Client.start()

    this.mqtt5Client.on('connectionSuccess', async () => {
      this.publicAction({ a: 'start', l: 1 })
    })
  }

  public publishMessage(topic: string, msg: GameEvent) {
    const message = {
      qos: mqtt5.QoS.AtMostOnce,
      topicName: topic,
      payload: { ...msg }
    }
    this.mqtt5Client.publish(message)
  }

  public publicAction(step: GameAction) {
    const msg = {
      userId: this.userId,
      gameId: this.gameId,
      clientId: this.clientId,
      eventType: EvenType.GAME_ACTION,
      step: JSON.stringify(step)
    }

    this.publishMessage(`chili/game/action/${this.userId}`, msg)
  }

  public disconnect() {
    if (this.isConnected) {
      this.isConnected = false
      this.mqtt5Client.stop()
      this.mqtt5Client.close()
    }
  }

  private init() {
    const wsConfig: iot.WebsocketSigv4Config = {
      credentialsProvider: this.provider,
      region: 'us-east-1'
    }

    const builder: iot.AwsIotMqtt5ClientConfigBuilder =
      iot.AwsIotMqtt5ClientConfigBuilder.newWebsocketMqttBuilderWithSigv4Auth(
        process.env.NEXT_PUBLIC_IOT_ENDPOINT ?? '',
        wsConfig
      )

    builder.withConnectProperties({
      clientId: this.clientId,
      keepAliveIntervalSeconds: 60
    })

    const client: mqtt5.Mqtt5Client = new mqtt5.Mqtt5Client(builder.build())

    client.on('connectionSuccess', () => {
      this.isConnected = true
      console.log('Connection Success event')
    })

    client.on('error', (error) => {
      this.isConnected = false
      if (MqttClientManager.instance) MqttClientManager.instance = null
      console.log(`Error event: ${error.toString()}`)
    })

    client.on('connectionFailure', (eventData: mqtt5.ConnectionFailureEvent) => {
      this.isConnected = false
      if (MqttClientManager.instance) MqttClientManager.instance = null
      console.log(`Connection failure event: ${eventData.error.toString()}`)
    })

    client.on('disconnection', () => {
      this.isConnected = false
      if (MqttClientManager.instance) MqttClientManager.instance = null
      console.log('Event disconnected.')
    })

    client.on('stopped', () => {
      this.isConnected = false
      if (MqttClientManager.instance) MqttClientManager.instance = null
      console.log('Stopped event.')
    })

    return client
  }
}
