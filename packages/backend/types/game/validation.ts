export enum CPUName {
  TRAINEE01 = "trainee01",
  TRAINEE02 = "trainee02",
  TRAINEE03 = "trainee03",
  PIGGLES = "piggles",
  MRBAGGIE = "mrbaggie",
  DINO = "dino",
  MATEY = "matey",
  ZAPP = "zapp",
  BURGERTRON = "burgertron",
}

export const POINTS_PER_CPU: { [key in CPUName]: number } = {
  [CPUName.TRAINEE01]: 100,
  [CPUName.TRAINEE02]: 100,
  [CPUName.TRAINEE03]: 100,
  [CPUName.PIGGLES]: 500,
  [CPUName.MRBAGGIE]: 600,
  [CPUName.DINO]: 700,
  [CPUName.MATEY]: 800,
  [CPUName.ZAPP]: 900,
  [CPUName.BURGERTRON]: 1000,
};

export const POINTS_PER_GROUP_COMPLETE = 100;
export const POINTS_PER_BURGER_BOUNCE = [50, 100, 150, 200, 250, 300, 350, 400];
export const POINTS_PER_TOTAL_CPUS_HIT = [0, 1000, 2000, 3000, 4000, 5000, 6000];
