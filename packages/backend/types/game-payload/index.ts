export enum ActionName {
  levelStart = "start",
  gameOver = "game-over",
  pause = "pause",
  resume = "resume",
  levelComplete = "complete",
  burgerPart = "burger-part",
  burgerComplete = "burger-complete",
  killEnemy = "kill-enemy",
  dropEnemy = "drop-enemy",
  threeForMe = "3-for-me",
}

export const levelCap = {
  minLevel: 1,
  maxLevel: 18,
};

export const burgerPartsAtLevel = {
  one: 4,
  two: 4,
  three: 3,
  four: 8,
  five: 8,
  six: 4,
};

export const burgersAtLevel = 4;

export const burgerPartBaseScore = 50;

export const triangularNumber = (n: number) => (n * (n + 1)) / 2;

// payload manifast
export const gamePayload = {
  [ActionName.levelStart]: {
    levelCap,
  },
  [ActionName.levelComplete]: {
    levelCap,
  },
  [ActionName.gameOver]: {
    levelCap,
  },
  [ActionName.pause]: {
    levelCap,
  },
  [ActionName.resume]: {
    levelCap,
  },
  [ActionName.burgerPart]: {
    levelCap,
    baseScoe: burgerPartBaseScore,
    level: {
      1: {
        minActions: burgerPartsAtLevel.one * 4,
        maxActions: triangularNumber(burgerPartsAtLevel.one) * burgersAtLevel,
        minScore: burgerPartBaseScore,
        maxScore: burgerPartBaseScore * burgerPartsAtLevel.one,
      },
      2: {
        minActions: burgerPartsAtLevel.two * 4,
        maxActions: triangularNumber(burgerPartsAtLevel.two) * burgersAtLevel,
        minScore: burgerPartBaseScore,
        maxScore: burgerPartBaseScore * burgerPartsAtLevel.two,
      },
      3: {
        minActions: burgerPartsAtLevel.three * 4,
        maxActions: triangularNumber(burgerPartsAtLevel.three) * burgersAtLevel,
        minScore: burgerPartBaseScore,
        maxScore: burgerPartBaseScore * burgerPartsAtLevel.three,
      },
      4: {
        minActions: burgerPartsAtLevel.four * 4,
        maxActions: triangularNumber(burgerPartsAtLevel.four) * burgersAtLevel,
        minScore: burgerPartBaseScore,
        maxScore: burgerPartBaseScore * burgerPartsAtLevel.four,
      },
      5: {
        minActions: burgerPartsAtLevel.five * 4,
        maxActions: triangularNumber(burgerPartsAtLevel.five) * burgersAtLevel,
        minScore: burgerPartBaseScore,
        maxScore: burgerPartBaseScore * burgerPartsAtLevel.five,
      },
      6: {
        minActions: burgerPartsAtLevel.six * 4,
        maxActions: triangularNumber(burgerPartsAtLevel.six) * burgersAtLevel,
        minScore: burgerPartBaseScore,
        maxScore: burgerPartBaseScore * burgerPartsAtLevel.six,
      },
    },
  },
  [ActionName.burgerComplete]: {
    levelCap,
    minActionsAtLevel: 0,
    maxActionsAtLevel: burgersAtLevel,
    minActionsPerSession: 0,
    maxActionsPerSession: levelCap.maxLevel * burgersAtLevel,
    baseScoe: 100,
  },
};

// game validation
/**
 * * one action per level
 *   ActionName.levelStart
 *   ActionName.levelComplete
 * * one action per session
 *   ActionName.gameOver
 * * four actions per level
 *   ActionName.burgerComplete
 * * three actions per session
 *   ActionName.threeForMe
 */