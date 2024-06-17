import { StackContext, Bucket } from "sst/constructs";
import { RemovalPolicy, SecretValue } from "aws-cdk-lib/core";
import { Effect, PolicyStatement, StarPrincipal } from "aws-cdk-lib/aws-iam";
import * as s3 from "aws-cdk-lib/aws-s3";

import { detectStage } from "@/libs/detect-stage";
import { S3_ORIGIN_BUCKET_NAME, S3_REFERER_KEY } from "@/libs/config";

export function S3Origin({ stack, app }: StackContext) {
  const { isDeploy } = detectStage(app.stage);

  if (!isDeploy) {
    return { originBucket: undefined };
  }

  const originBucket = new Bucket(stack, `${app.stage}-${S3_ORIGIN_BUCKET_NAME}`, {
    name: `${app.stage}-${S3_ORIGIN_BUCKET_NAME}`,
    cdk: {
      bucket: {
        removalPolicy: RemovalPolicy.DESTROY,
        autoDeleteObjects: true,
        websiteIndexDocument: "index.html",
        websiteErrorDocument: "/404/index.html",
        blockPublicAccess: {
          blockPublicPolicy: false,
          ignorePublicAcls: false,
          restrictPublicBuckets: false,
          blockPublicAcls: false,
        },
        cors: [],
      },
    },
  });

  const secretReferer = SecretValue.secretsManager(`${app.stage}-${S3_REFERER_KEY}`);

  const bucketPolicy = new s3.BucketPolicy(stack, `${app.stage}-bucket-policy`, {
    // eslint-disable-next-line
    // @ts-ignore
    bucket: originBucket.cdk.bucket,
  });

  bucketPolicy.applyRemovalPolicy(RemovalPolicy.DESTROY);

  bucketPolicy.document.addStatements(
    new PolicyStatement({
      actions: ["s3:GetObject"],
      effect: Effect.ALLOW,
      principals: [new StarPrincipal()],
      resources: [originBucket.bucketArn, `${originBucket.bucketArn}/*`],
      conditions: {
        StringLike: {
          "aws:Referer": secretReferer,
        },
      },
    }),
  );

  stack.addOutputs({});

  return { originBucket };
}
