import { GameEvent } from "@/types/game";
import { EvenType } from "@/types/iot";

export const isValidGameEvent = (event: GameEvent, evenType: EvenType = EvenType.GAME_ACTION): event is GameEvent => {
  if (typeof event !== "object" || event === null) {
    return false;
  }

  const { userId, gameId, eventType, step } = event;

  if (typeof userId !== "string" || userId.trim() === "") {
    return false;
  }

  if (typeof gameId !== "string" || gameId.trim() === "") {
    return false;
  }

  if (typeof eventType !== "string" || eventType !== evenType) {
    return false;
  }

  if (typeof step !== "object" || step === null || Object.keys(step).length === 0) {
    return false;
  }

  return true;
};
