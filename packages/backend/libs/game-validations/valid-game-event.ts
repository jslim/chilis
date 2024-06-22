import { GameEvent } from "@/types/game";
import { EvenType } from "@/types/iot";

export const isValidGameEvent = (event: GameEvent, evenType: EvenType = EvenType.GAME_ACTION): event is GameEvent => {
  if (typeof event !== "object" || event === null) {
    return false;
  }

  const { userId, gameId, clientId, eventType, step } = event;
  const stepJSON = JSON.parse(step);
  const idsExp: RegExp = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
  const clientExp: RegExp =
    /^mqtt-client-chilis-[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

  if (typeof userId !== "string" || !idsExp.test(userId) || userId.trim() === "") {
    return false;
  }

  if (typeof gameId !== "string" || !idsExp.test(userId) || gameId.trim() === "") {
    return false;
  }

  if (typeof clientId !== "string" || !clientExp.test(clientId) || clientId.trim() === "") {
    return false;
  }

  if (typeof eventType !== "string" || eventType !== evenType) {
    return false;
  }

  if (typeof stepJSON !== "object" || stepJSON === null || Object.keys(stepJSON).length === 0) {
    return false;
  }

  return true;
};
