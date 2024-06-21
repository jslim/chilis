import { GameActions, GameEventStep, GameActionsWithScore, GameActionsWithPoints } from "@/types/game";

export const isValidGameStep = (step: GameEventStep): boolean => {
  let action;

  const stepKeys = Object.keys(step);
  const requiredKeys: string[] = ["a", "l"];

  if (!step || !step.a) {
    return false;
  } else {
    action = step.a;
  }

  if (!Object.values(GameActions).includes(action as GameActions)) {
    return false;
  }

  // const requiredKeys = ['a', 'l'];
  // this.emitAction({ a: 'start', l: this.gameState.level.value })
  // this.onGameAction.emit({ a: 'pause', l: this.gameState.level.value })
  // this.onGameAction.emit({ a: 'resume', l: this.gameState.level.value })
  if (GameActionsWithScore.includes(action)) {
    requiredKeys.push("s");
    // this.emitAction({ a: 'complete', l: this.gameState.level.value, s: this.gameState.score.value })
    // this.emitAction({ a: 'game-over', l: this.gameState.level.value, s: this.gameState.score.value })
  } else if (GameActionsWithPoints.includes(action)) {
    requiredKeys.push("p");
    // level.emitAction({ a: '3-for-me', l: level.gameState.pickupsCollected.value, p: POINTS_PER_3_PICKUPS  })
    // this.level.emitAction({ a: 'drop-enemy', l: this.level.gameState.level.value, p: pointForCpuHit })
    // this.level.emitAction({ a: 'burger-part', l: this.level.gameState.level.value, p: pointsForBurgerHit })

    if (action === GameActions.KILL_ENEMY) {
      requiredKeys.push("n");
      // this.level.emitAction({ a: 'kill-enemy', l: this.level.gameState.level.value, p: points, n: cpuName })
    }

    if (action === GameActions.BURGER_COMPLETE) {
      requiredKeys.push("c");
      // this.emitAction({a: 'burger-complete', l: this.gameState.level.value, p: points, c: this.gameState.burgerCompleteCombo.value})
    }
  }

  if (requiredKeys.length !== stepKeys.length) {
    return false;
  }

  return stepKeys.every((key) => requiredKeys.includes(key));
};
