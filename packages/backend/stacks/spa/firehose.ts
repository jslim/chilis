import { Bucket, KinesisStream, StackContext } from "sst/constructs";

import * as iam from "aws-cdk-lib/aws-iam";
import * as firehose from "aws-cdk-lib/aws-kinesisfirehose";
import { RemovalPolicy } from "aws-cdk-lib/core";

import { FRONTEND_NAME } from "@/libs/config";
import { detectStage } from "@/libs/detect-stage";

export function FirehoseStack({ stack, app }: StackContext) {
  const { isProd, isDevelopment } = detectStage(app.stage);

  if (isDevelopment) {
    return;
  }

  const logBucket = new Bucket(stack, `${app.stage}-${FRONTEND_NAME}-log`, {
    name: `${app.stage}-${FRONTEND_NAME}-log`,
    cdk: {
      bucket: {
        removalPolicy: isProd ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
      },
    },
  });

  const kinesisStream = new KinesisStream(
    stack,
    `${app.stage}-kinesisStream`,
    {}
  );

  // Create an IAM role for Firehose
  const firehoseRole = new iam.Role(stack, `${app.stage}-firehoseRole`, {
    roleName: `${app.stage}-firehoseRole`,
    assumedBy: new iam.ServicePrincipal("firehose.amazonaws.com"),
    managedPolicies: [
      iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonS3FullAccess"),
    ],
  });

  const kinesisRole = new iam.Role(stack, `${app.stage}-kinesisRole`, {
    roleName: `${app.stage}-kinesisRole`,
    assumedBy: new iam.ServicePrincipal("firehose.amazonaws.com"),
    managedPolicies: [
      iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonKinesisFullAccess"),
    ],
  });

  new firehose.CfnDeliveryStream(stack, `${app.stage}-aws-waf-logs`, {
    deliveryStreamName: `${app.stage}-aws-waf-logs`,
    deliveryStreamType: "KinesisStreamAsSource",
    kinesisStreamSourceConfiguration: {
      kinesisStreamArn: kinesisStream.streamArn,
      roleArn: kinesisRole.roleArn,
    },
    extendedS3DestinationConfiguration: {
      roleArn: firehoseRole.roleArn,
      //@ts-ignore
      bucketArn: logBucket.bucketArn,
      bufferingHints: {
        intervalInSeconds: 60,
        sizeInMBs: 5,
      },
      compressionFormat: "GZIP",
    },
  });

  stack.addOutputs({});

  return {};
}
