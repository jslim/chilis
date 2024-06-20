import { Context } from "aws-lambda";
import { EvenType } from "@/types/iot";
import { logger } from "@/libs/powertools";
import GameService from "@/services/game";
import GameRepository from "@/repositories/game";
import DynamoDBClient from "@/services/dynamodb";

logger.appendKeys({
  namespace: "Lambda-IoT-Send",
  service: "AWS::Lambda",
});

const gameService = new GameService(
  new GameRepository(new DynamoDBClient(process.env.GAMES_SESSION_TABLE_NAME as string)),
);

export const handler = async (event: any, context: Context) => {
  logger.info("Game Action from IoT Core", { event, ...context });

  console.log(event);
  console.log(context);
  // TODO: Add others validations
  if (event.eventType !== EvenType.GAME_ACTION) {
    logger.error(`Wrong action: ${event.eventType}`);
  }

  try {
    const { userId, gameId, step } = event;
    await gameService.recordStep(userId, gameId, step);
  } catch (err) {
    logger.error("Error updating table.", err as Error);
    //       logger.info({
    //         eventType: 'UserDisconnectionCountError',
    //         sessionId: sessionId,
    //         clientId: clientId,
    //         timestamp: event.timestamp,
    //         message: 'Error updating table'
  }
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
