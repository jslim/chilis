import { ENVS_TARGET } from "@/libs/stack-data";

export const getWebDomain = (stage: string) => {
  if (!ENVS_TARGET[stage as keyof typeof ENVS_TARGET]) {
    throw new Error("Stage must be one of dev, stg, and prd");
  }

  if (!process.env.BASE_DOMAIN) {
    throw new Error("Please set BASE_DOMAIN environment variable");
  }

  return `${stage}.${process.env.BASE_DOMAIN}`;
};
