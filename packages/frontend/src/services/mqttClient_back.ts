import AWSMqttClient from 'aws-mqtt'
import AWS from 'aws-sdk'

AWS.config.region = 'us-east-1'
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
  IdentityPoolId: 'us-east-1:7dbebec1-e247-4458-99c6-e11b099e4823'
})

const mqttClient = new AWSMqttClient({
  region: AWS.config.region,
  credentials: AWS.config.credentials,
  endpoint: 'avadv0c6pzlz4-ats.iot.us-east-1.amazonaws.com',
  clientId: 'AlgoAui' // `mqtt-client-${tenantId}-${Math.floor(Math.random() * 100_000 + 1)}`
})

mqttClient.on('connect', () => {
  console.log('Conectado al broker MQTT')
})

mqttClient.on('error', (err) => {
  console.error('Error en el cliente MQTT:', err)
})

export default mqttClient
