import { FunctionProps, StackContext } from "sst/constructs";
import { detectStage } from "@/libs/detect-stage";
import { Runtime } from "@aws-sdk/client-lambda";

export const setDefaultFunctionProps = ({ stack, app }: StackContext, overrideProps?: FunctionProps) => {
  const { isDevelopment, isProd } = detectStage(app.stage);

  stack.setDefaultFunctionProps(
    Object.assign(
      {
        timeout: isDevelopment ? 30 : 20, // set long timeout for local live debug if you need to use breakpoints in your IDE. Might need to be tweaked for every function.
        memorySize: 512,
        runtime: Runtime.nodejs18x,
        tracing: isProd ? "active" : "disabled",
      },
      overrideProps
    )
  );
};
