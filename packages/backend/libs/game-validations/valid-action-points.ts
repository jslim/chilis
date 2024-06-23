import DynamoDBClient from "@/services/dynamodb";
import TFMRepository from "@/repositories/three-for-me";
import TFMService from "@/services/three-for-me";
import GameService from "@/services/game";
import GameRepository from "@/repositories/game";
import {
  POINTS_PER_GROUP_COMPLETE,
  POINTS_PER_BURGER_BOUNCE,
  POINTS_PER_TOTAL_CPUS_HIT,
  POINTS_PER_CPU,
} from "@/types/game/validation";
import { GameEvent, GameActions, GameEventStep, GameActionsWithPoints } from "@/types/game";

const gameService = new GameService(
  new GameRepository(new DynamoDBClient(process.env.GAMES_SESSION_TABLE_NAME as string)),
);
const threeForMe = new TFMService(new TFMRepository(new DynamoDBClient(process.env.THREE_FOR_ME_TABLE_NAME as string)));

/**
 * Check if the action points are valid for the given event
 * @param event - The game event to validate
 * @returns A boolean indicating if the action points are valid
 */
export const isValidActionPoints = async (event: GameEvent): Promise<boolean> => {
  const step: GameEventStep = JSON.parse(event.step);

  if (!GameActionsWithPoints.includes(step.a as GameActions)) {
    return true;
  }

  switch (step.a) {
    case GameActions.BURGER_COMPLETE:
      return POINTS_PER_GROUP_COMPLETE * Number(step.c) === step.p;

    case GameActions.BURGER_PART:
      return POINTS_PER_BURGER_BOUNCE.includes(Number(step.p));

    case GameActions.DROP_ENEMY:
      return POINTS_PER_TOTAL_CPUS_HIT.includes(Number(step.p));

    case GameActions.KILL_ENEMY:
      return POINTS_PER_CPU.hasOwnProperty(String(step.n)) && POINTS_PER_CPU[step.n] === step.p;

    case GameActions.THREE_FOR_ME:
      return await handleThreeForMe(step, event);

    default:
      return false;
  }
};

async function handleThreeForMe(step: GameEventStep, event: GameEvent): Promise<boolean> {
  const amountThreeForMe = await getCountThreeForMe(event);

  if ((amountThreeForMe + 1) % 3 === 0 && step.p === 1099) {
    if (amountThreeForMe === 2) {
      threeForMe.setTFM(event.userId, event.gameId);
    }
    return true;
  } else if (step.p === 500 && amountThreeForMe !== 2) {
    return true;
  }

  return false;
}

async function getCountThreeForMe(event: GameEvent): Promise<number> {
  const queryResult = await gameService.getCurrentSteps(event.userId, event.gameId);

  if (!queryResult.Count || queryResult.Count === 0 || !queryResult.Items || queryResult.Items.length === 0) {
    return 0;
  }

  // @ts-ignore
  return queryResult.Items[0].steps.filter((obj: GameEventStep) => obj.a === GameActions.THREE_FOR_ME).length;
}
