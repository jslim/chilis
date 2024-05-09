/*
  See documentation https://docs.powertools.aws.dev/lambda/typescript/latest/
 */

import { Logger } from "@aws-lambda-powertools/logger";
import { Tracer } from "@aws-lambda-powertools/tracer";

const defaultValues = {
  region: process.env.AWS_REGION || "N/A",
  executionEnv: process.env.AWS_EXECUTION_ENV || "N/A",
};

const logger = new Logger({
  persistentLogAttributes: {
    ...defaultValues,
    logger: {
      name: "@aws-lambda-powertools/logger",
      version: "1.0.0",
    },
  },
});
logger.injectLambdaContext({
  logEvent: true,
});

const tracer = new Tracer();

export { logger, tracer };
