import { logger } from "@/libs/powertools";

logger.appendKeys({
  namespace: "Check-Country-Code",
  service: "AWS::Lambda",
});

export const checkCountry = (country: string, countryAllowList: string[]) => {
  logger.info("Country Code", { country, countryAllowList });

  if (countryAllowList.includes("*")) return true;

  return countryAllowList.includes(country);
};
