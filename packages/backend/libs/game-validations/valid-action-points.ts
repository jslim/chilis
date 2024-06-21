import DynamoDBClient from "@/services/dynamodb";
import TFMRepository from "@/repositories/three-for-me";
import TFMService from "@/services/three-for-me";
import GameService from "@/services/game";
import GameRepository from "@/repositories/game";
import { GameEvent, GameActions, GameEventStep, GameActionsWithPoints } from "@/types/game";

const gameService = new GameService(
  new GameRepository(new DynamoDBClient(process.env.GAMES_SESSION_TABLE_NAME as string)),
);

const threeForMe = new TFMService(new TFMRepository(new DynamoDBClient(process.env.THREE_FOR_ME_TABLE_NAME as string)));

export const isValidActionPoints = async (event: GameEvent): Promise<boolean> => {
  const { step } = event;

  if (!GameActionsWithPoints.includes(step.a as GameActions)) {
    return true;
  }

  if (GameActions.THREE_FOR_ME === step.a) {
    const amountThreeForMe = await getCountThreeForMe(event);
    if ((amountThreeForMe === 0 || amountThreeForMe === 1) && step.p === 500) return true;
    else if (amountThreeForMe === 2 && step.p === 1099) {
      threeForMe.setTFM(event.userId, event.gameId);

      return true;
    }
  }

  return false;
};

async function getCountThreeForMe(event: GameEvent): Promise<number> {
  const queryResult = await gameService.getCurrentSteps(event.userId, event.gameId);

  if (!queryResult.Count || queryResult.Count === 0 || !queryResult.Items || queryResult.Items.length === 0) {
    return 0;
  }

  // @ts-ignore
  return queryResult.Items[0].steps.filter((obj: GameEventStep) => obj.a === GameActions.THREE_FOR_ME).length;
}
