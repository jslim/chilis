import { ENVS_TARGET } from "@/libs/stack-data";
import { DOMAIN_NAME } from "@/libs/config";

export const getWebDomain = (stage: string) => {
  // if (!ENVS_TARGET[stage as keyof typeof ENVS_TARGET]) {
  //   throw new Error("stage must be one of dev, stg, and prd");
  // }

  return `${stage}.${DOMAIN_NAME}`;
};
