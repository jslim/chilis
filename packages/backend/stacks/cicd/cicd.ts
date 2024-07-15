import { Bucket, StackContext } from "sst/constructs";
import * as codebuild from "aws-cdk-lib/aws-codebuild";
import * as codepipeline from "aws-cdk-lib/aws-codepipeline";
import * as codepipeline_actions from "aws-cdk-lib/aws-codepipeline-actions";
import { DetailType, NotificationRule } from "aws-cdk-lib/aws-codestarnotifications";
import { Effect, ManagedPolicy, PolicyStatement, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import * as sns from "aws-cdk-lib/aws-sns";
import * as subscriptions from "aws-cdk-lib/aws-sns-subscriptions";
import { RemovalPolicy, SecretValue } from "aws-cdk-lib/core";
import { BuildEnvironmentVariableType } from "aws-cdk-lib/aws-codebuild";
import { StringParameter } from "aws-cdk-lib/aws-ssm";

import { FRONTEND_NAME, REPO_NAME } from "@/libs/config";
import { detectStage } from "@/libs/detect-stage";
import { ENVS_TARGET } from "@/libs/stack-data";

const adminEmails = [
  // Project email account
  "prj-240137971-chilis-burger-time@mediamonks.com",
  // Add individual emails
  // 'name@jam3.com'
  // 'name@mediamonks.com'
];

const REPO_OWNER = "Experience-Monks";
const BRANCH = "main";

export function CICD({ stack, app }: StackContext) {
  const { isStage, isProd, isUat, isDevelopment, isDevelop } = detectStage(app.stage);

  if (isDevelopment || !ENVS_TARGET[app.stage as keyof typeof ENVS_TARGET]) {
    return;
  }

  const artifactBucket = new Bucket(stack, `${app.stage}-ArtifactBucket`, {
    name: `${app.stage}-${FRONTEND_NAME}-artifact-origin`,
    cdk: {
      bucket: {
        removalPolicy: RemovalPolicy.DESTROY,
      },
    },
  });

  const cacheBucket = new Bucket(stack, `${app.stage}-CacheBucket`, {
    name: `${app.stage}-${FRONTEND_NAME}-codebuild-cache-origin`,
    cdk: {
      bucket: {
        removalPolicy: RemovalPolicy.DESTROY,
      },
    },
  });

  const ssmParam = StringParameter.fromStringParameterName(
    stack,
    `${app.stage}-parameter-store-base-domain`,
    `/prj-240137971-chilis-burger-time/base-domain-${app.stage}`,
  );

  // Add a custom role (with broader permissions) that can be assumed through STS inside Authorizer Lambda (further narrowing permissions)
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const accessRole = new Role(stack, `${app.stage}-codbuild-role`, {
    roleName: `${app.stage}-codbuild-role`,
    assumedBy: new ServicePrincipal("codebuild.amazonaws.com"),
    managedPolicies: [ManagedPolicy.fromAwsManagedPolicyName("AdministratorAccess")],
  });
  accessRole.addToPolicy(
    new PolicyStatement({
      actions: ["*"],
      effect: Effect.ALLOW,
      resources: [`*`],
    }),
  );

  // Add source stage to pipeline
  const sourceOutput = new codepipeline.Artifact();
  const sourceAction = new codepipeline_actions.GitHubSourceAction({
    actionName: "GitHub_Source",
    owner: REPO_OWNER,
    repo: REPO_NAME,
    branch: BRANCH,
    oauthToken: SecretValue.secretsManager(`GitHubToken`),
    output: sourceOutput,
  });

  // Add manual approval action
  const approvalAction = new codepipeline_actions.ManualApprovalAction({
    actionName: "ManualApproval",
    additionalInformation: "Please approve to continue the pipeline.",
    notifyEmails: adminEmails,
  });

  // Create a new CodeBuild project
  const buildProject = new codebuild.PipelineProject(stack, `${app.stage}-BuildProject`, {
    projectName: `${app.stage}-BuildProject`,
    environment: {
      buildImage: codebuild.LinuxBuildImage.STANDARD_7_0,
      computeType: codebuild.ComputeType.LARGE,
    },
    role: accessRole,
    checkSecretsInPlainTextEnvVariables: false,
    // eslint-disable-next-line
    // @ts-ignore
    cache: codebuild.Cache.bucket(cacheBucket.cdk.bucket),
    environmentVariables: {
      BASE_DOMAIN: {
        type: BuildEnvironmentVariableType.PARAMETER_STORE,
        value: ssmParam.parameterName,
      },
      GITHUB_TOKEN: {
        value: SecretValue.secretsManager(`GitHubToken`),
      },
      NODE_ENV: {
        value: "production",
      },
      SST_STAGE: {
        value: app.stage,
      },
      COUNTRIES_ALLOW_LIST: {
        value: isDevelop || isStage ? "CA, US, UY, NL, BR" : "*",
      },
    },
    buildSpec: codebuild.BuildSpec.fromObject({
      version: "0.2",
      phases: {
        install: {
          commands: [
            'echo "Cloning repository"',
            "git clone https://$GITHUB_TOKEN@github.com/Experience-Monks/prj-240137971-chilis-burger-time.git",
            "cd prj-240137971-chilis-burger-time",
            'echo "Using Node.js version $(node -v)"',
            "echo Installing dependencies",
            // Add your dependency installation commands here
            "npm install --prefer-offline --no-audit --force",
          ],
        },
        pre_build: {
          commands: [
            'echo "Using Node.js version $(node -v)"',
            "echo Pre-build steps",
            // Add any pre-build commands here
          ],
        },
        build: {
          commands: [
            'echo "Using Node.js version $(node -v)"',
            "echo Build started",
            'NEXT_PUBLIC_VERSION_NUMBER=$(echo "$CODEBUILD_BUILD_NUMBER")',
            "NEXT_PUBLIC_COMMIT_ID=$(echo $CODEBUILD_RESOLVED_SOURCE_VERSION | cut -c1-6)",
            'NEXT_PUBLIC_COMMIT_DATE=$(git log --date=format:"%Y-%m-%d %H:%M" --pretty="%cd" --no-merges -1)',
            "npm run deploy",
            // Add your build commands here
            "echo Build completed",
          ],
        },
        post_build: {
          commands: [
            'echo "Using Node.js version $(node -v)"',
            "echo Post-build steps",
            // Add any post-build commands or actions here
          ],
        },
      },
      artifacts: {
        files: [
          // Specify the output files and directories to be uploaded as build artifacts
          "**/*",
        ],
      },
      cache: {
        paths: ["node_modules/**/*", ".sst/**/*"],
      },
    }),
  });

  // Add build stage to pipeline
  const buildAction = new codepipeline_actions.CodeBuildAction({
    actionName: "CodeBuild",
    project: buildProject,
    input: sourceOutput,
    outputs: [new codepipeline.Artifact()], // Optional: if you have build artifacts
  });

  const sourceStage = {
    stageName: "Source",
    actions: [sourceAction],
  };

  const approvalStage = {
    stageName: "Approval",
    actions: [approvalAction],
  };

  const buildStage = {
    stageName: "Build",
    actions: [buildAction],
  };

  // Create a new pipeline
  const pipeline = new codepipeline.Pipeline(stack, `${app.stage}-Pipeline`, {
    pipelineName: `${app.stage}-Pipeline`,
    // eslint-disable-next-line
    // @ts-ignore
    artifactBucket: artifactBucket.cdk.bucket,
    stages: isStage || isUat || isProd ? [sourceStage, approvalStage, buildStage] : [sourceStage, buildStage],
  });

  // Notify on fail
  // const notifyOnFailTopic = new sns.Topic(stack, `${app.stage}-NotifyOnFail`, {
  //   topicName: `${app.stage}-NotifyOnFail`,
  // });

  // adminEmails.forEach((email) => {
  //   notifyOnFailTopic.addSubscription(
  //     new subscriptions.EmailSubscription(email)
  //   );
  // });

  // notifyOnFailTopic.grantPublish(
  //   new ServicePrincipal("codepipeline.amazonaws.com")
  // );

  // new NotificationRule(stack, `${app.stage}-PipelineFailureNotificationRule`, {
  //   detailType: DetailType.BASIC,
  //   events: [
  //     "codepipeline-pipeline-pipeline-execution-failed",
  //     "codepipeline-pipeline-pipeline-execution-canceled",
  //   ],
  //   source: pipeline,
  //   targets: [notifyOnFailTopic],
  // });

  return { pipeline };
}
