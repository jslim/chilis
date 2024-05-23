import { ENV_KEYS, ENVS_TARGET } from "@/libs/stack-data";

export const detectStage = (
  stage: string,
  forceDeploy = false
): {
  isDeploy: boolean;
  isDevelop: boolean;
  isStage: boolean;
  isUat: boolean;
  isSDLC: boolean;
  isProd: boolean;
  isDevelopment: boolean;
} => {
  return {
    isDeploy: [...Object.keys(ENVS_TARGET)].includes(stage) || forceDeploy,
    isDevelop: stage === ENV_KEYS.dev,
    isStage: stage === ENV_KEYS.stg,
    isUat: stage === ENV_KEYS.uat,
    isSDLC: stage === ENV_KEYS.sdlc,
    isProd: stage === ENV_KEYS.prd,
    isDevelopment:
      stage !== ENV_KEYS.dev &&
      stage !== ENV_KEYS.stg &&
      stage !== ENV_KEYS.sdlc &&
      stage !== ENV_KEYS.prd,
  };
};
