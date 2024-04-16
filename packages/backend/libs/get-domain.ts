import { ENVS_TARGET } from "@/libs/stack-data";
import { FRONTEND_NAME } from "@/libs/config";

const cloudDomain = "cloud.jam3.net";

export const getWebDomain = (stage: string) => {
  // if (!ENVS_TARGET[stage as keyof typeof ENVS_TARGET]) {
  //   throw new Error("stage must be one of dev, stg, and prd");
  // }

  return `${stage}.${FRONTEND_NAME}.${cloudDomain}`;
};
