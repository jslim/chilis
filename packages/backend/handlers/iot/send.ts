import { ConnectionStatus } from "@/types/iot";
import { logger } from "@/libs/powertools";

logger.appendKeys({
  namespace: "Lambda-IoT-Send",
  service: "AWS::Lambda",
});

export const handler = async (event: any) => {
  logger.info("send from IoT Core", { event });
  //   if (
  //     event.eventType === ConnectionStatus.DISCONNECTED &&
  //     event.clientId.includes('mqtt-publish-client') &&
  //     event.principalIdentifier.includes('CognitoIdentityCredentials')
  //   ) {
  //     const regexPattern = /mqtt-publish-client-(\d+)-(.+)$/;

  //     logger.info('device disconnected from IoT Core', { event });

  //     if (!event.clientId || !regexPattern.test(event.clientId)) {
  //       logger.error('clientId was not sent');
  //       return 'clientId was not sent';
  //     }

  //     const [, clientId, sessionId] = event.clientId.match(regexPattern);

  //     if (!clientId || !sessionId) {
  //       const recibedClientId = event.clientId;
  //       logger.error('clientId does not match expected format:', { recibedClientId });
  //       return 'clientId does not match expected format.';
  //     }

  //     try {
  //       logger.info('disconnecting users and remove connected user rows');
  //       await connectionTable.removeRow({
  //         sessionId: sessionId,
  //         clientId: clientId
  //       });

  //       const connectionParams = {
  //         FilterExpression: 'sessionId = :sessionId AND connectionStatus = :connectionStatus',
  //         ExpressionAttributeValues: { ':sessionId': sessionId, ':connectionStatus': ConnectionStatus.CONNECTED },
  //         Select: 'COUNT'
  //       };
  //       const count = await connectionTable.scan(connectionParams);
  //       gameService.updateTotalUser(sessionId, count?.Count || 0);

  //       logger.info({
  //         eventType: 'UserDisconnection',
  //         sessionId: sessionId,
  //         clientId: clientId,
  //         timestamp: event.timestamp,
  //         message: 'User Disconnected'
  //       });

  //       return 'User Disconnected';
  //     } catch (error) {
  //       logger.error('Error updating table.', error as Error);
  //       logger.info({
  //         eventType: 'UserDisconnectionCountError',
  //         sessionId: sessionId,
  //         clientId: clientId,
  //         timestamp: event.timestamp,
  //         message: 'Error updating table'
  //       });
  //       return 'Error updating table';
  //     }
  //   }
};
