import { ConnectionStatus } from "@/types/iot";
import { logger } from "@/libs/powertools";
import GameService from "@/services/game";
import GameRepository from "@/repositories/game";
import DynamoDBClient from "@/services/dynamodb";
import { GameStatus } from "@/types/game";

logger.appendKeys({
  namespace: "Lambda-IoT-Disconnected",
  service: "AWS::Lambda",
});

const gameService = new GameService(
  new GameRepository(new DynamoDBClient(process.env.GAMES_SESSION_TABLE_NAME as string)),
);

export const handler = async (event: any) => {
  if (
    event.eventType === ConnectionStatus.DISCONNECTED &&
    event.clientId.includes("mqtt-client-chilis") &&
    event.principalIdentifier.includes("CognitoIdentityCredentials")
  ) {
    logger.info("device disconnected from IoT Core", { event });

    const clientExp =
      /^mqtt-client-chilis-[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    if (!clientExp.test(event.clientId)) {
      logger.error("clientId was not sent correctly.");
      return;
    }

    const parts = event.clientId.split("mqtt-client-chilis-");
    if (parts.length !== 2) {
      logger.error("clientId was not sent correctly.");
      return;
    }

    const userId = parts[1];

    try {
      await gameService.checkForActiveGame(userId);
      logger.info({
        eventType: "GameDisconnection",
        sessionId: userId,
        clientId: event.clientId,
        timestamp: event.timestamp,
        message: `The status of the game has been changed to ${GameStatus.INACTIVE}`,
      });
    } catch (error) {
      logger.error({
        eventType: "GameDisconnectionError",
        sessionId: userId,
        clientId: event.clientId,
        timestamp: event.timestamp,
        message: "Error updating table",
      });
    }
  }
};
