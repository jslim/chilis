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

export enum Enemy {
  trainee01 = "trainee01",
  trainee02 = "trainee02",
  trainee03 = "trainee03",
  piggles = "piggles",
  mrbaggie = "mrbaggie",
  dino = "dino",
  matey = "matey",
  zapp = "zapp",
  burgertron = "burgertron",
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

export const burgersAtLevel = {
  one: 4,
  two: 4,
  three: 6,
  four: 4,
  five: 2,
  six: 4,
};

export const burgerPartBasePoint = 50;

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
  [ActionName.burgerPart]: {
    levelCap,
    baseScore: burgerPartBasePoint,
    level: {
      1: {
        // to complete level one,
        //   min 16 burger-part actions must appear in the payload
        //   max 40 burger-part actions can appear in the payload
        //   min 50 points must appear in the payload
        //   max 200 points must appear in the payload
        burgersAtLevel: burgersAtLevel.one,
        minActions: burgerPartsAtLevel.one * burgersAtLevel.one,
        maxActions: triangularNumber(burgerPartsAtLevel.one) * burgersAtLevel.one,
        minPoint: burgerPartBasePoint,
        maxScore: burgerPartBasePoint * burgerPartsAtLevel.one,
      },
      2: {
        burgersAtLevel: burgersAtLevel.two,
        minActions: burgerPartsAtLevel.two * burgersAtLevel.two,
        maxActions: triangularNumber(burgerPartsAtLevel.two) * burgersAtLevel.two,
        minPoint: burgerPartBasePoint,
        maxPoint: burgerPartBasePoint * burgerPartsAtLevel.two,
      },
      3: {
        burgersAtLevel: burgersAtLevel.three,
        minActions: burgerPartsAtLevel.three * burgersAtLevel.three,
        maxActions: triangularNumber(burgerPartsAtLevel.three) * burgersAtLevel.three,
        minPoint: burgerPartBasePoint,
        maxPoint: burgerPartBasePoint * burgerPartsAtLevel.three,
      },
      4: {
        burgersAtLevel: burgersAtLevel.four,
        minActions: burgerPartsAtLevel.four * burgersAtLevel.four,
        maxActions: triangularNumber(burgerPartsAtLevel.four) * burgersAtLevel.four,
        minPoint: burgerPartBasePoint,
        maxPoint: burgerPartBasePoint * burgerPartsAtLevel.four,
      },
      5: {
        burgersAtLevel: burgersAtLevel.five,
        minActions: burgerPartsAtLevel.five * burgersAtLevel.five,
        maxActions: triangularNumber(burgerPartsAtLevel.five) * burgersAtLevel.five,
        minPoint: burgerPartBasePoint,
        maxPoint: burgerPartBasePoint * burgerPartsAtLevel.five,
      },
      6: {
        burgersAtLevel: burgersAtLevel.six,
        minActions: burgerPartsAtLevel.six * burgersAtLevel.six,
        maxActions: triangularNumber(burgerPartsAtLevel.six) * burgersAtLevel.six,
        minPoint: burgerPartBasePoint,
        maxPoint: burgerPartBasePoint * burgerPartsAtLevel.six,
      },
    },
  },
  [ActionName.burgerComplete]: {
    levelCap,
    minActionsAtLevel: 0,
    maxActionsAtLevel: 4,
    minActionsPerSession: 0,
    maxActionsPerSession: 72,
    baseScoe: 100,
  },
  [ActionName.killEnemy]: {
    [Enemy.trainee01]: { score: 100 },
    [Enemy.trainee02]: { score: 100 },
    [Enemy.trainee03]: { score: 100 },
    [Enemy.piggles]: { score: 500 },
    [Enemy.mrbaggie]: { score: 600 },
    [Enemy.dino]: { score: 700 },
    [Enemy.matey]: { score: 800 },
    [Enemy.zapp]: { score: 900 },
    [Enemy.burgertron]: { score: 1000 },
  },
  [ActionName.dropEnemy]: {
    1: { score: 1000 },
    2: { score: 2000 },
    3: { score: 3000 },
    4: { score: 4000 },
  },
  [ActionName.threeForMe]: {
    1: { score: 500 },
    2: { score: 500 },
    3: { score: 1099 },
  },
};

// game validation
/**
 * * one action per level
 *   ActionName.levelStart
 *   ActionName.levelComplete
 * * one action per session
 *   ActionName.gameOver
 * * maximum four actions per level
 *   ActionName.burgerComplete
 * * three actions per session
 *   ActionName.threeForMe
 */

/**
 * 3 for me
 * first two colletions will give 500 points
 * third will give 1099 points
 */
