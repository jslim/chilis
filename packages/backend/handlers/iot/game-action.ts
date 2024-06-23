import { Context } from "aws-lambda";
import { logger } from "@/libs/powertools";
import GameService from "@/services/game";
import GameRepository from "@/repositories/game";
import DynamoDBClient from "@/services/dynamodb";
import { isValidGameEvent } from "@/libs/game-validations/valid-game-event";
import { isValidGameStep } from "@/libs/game-validations/valid-game-step";
import { isValidActionPoints } from "@/libs/game-validations/valid-action-points";

logger.appendKeys({
  namespace: "Lambda-IoT-Send",
  service: "AWS::Lambda",
});

const gameService = new GameService(
  new GameRepository(new DynamoDBClient(process.env.GAMES_SESSION_TABLE_NAME as string)),
);

export const handler = async (event: any, context: Context) => {
  logger.info("Game Action from IoT Core", { event, ...context });
  const now = new Date().toISOString();

  // Validate that the structure of the event is correct
  if (!isValidGameEvent(event)) {
    logger.error({
      eventType: "validGameEventError",
      userId: event.userId,
      gameId: event.gameId,
      timestamp: now,
      message: "Wrong event format",
    });
    return;
  }

  const step = JSON.parse(event.step);
  // Validate that the step is correct
  if (!isValidGameStep(step)) {
    logger.error({
      eventType: "validGameStepError",
      userId: event.userId,
      gameId: event.gameId,
      timestamp: now,
      message: "Wrong step format",
    });
    return;
  }

  // Validate that the points are correct
  if (!(await isValidActionPoints(event))) {
    logger.error({
      eventType: "validActionPointsError",
      userId: event.userId,
      gameId: event.gameId,
      timestamp: now,
      message: "Wrong step points",
    });
    return;
  }

  try {
    const { userId, gameId } = event;
    await gameService.recordStep(userId, gameId, step);
  } catch (err: any) {
    logger.error({
      eventType: "updateGameStepsError",
      userId: event.userId,
      gameId: event.gameId,
      timestamp: now,
      message: err.message,
    });
  }
};
