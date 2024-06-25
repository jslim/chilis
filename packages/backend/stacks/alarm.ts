import { StackContext } from "sst/constructs";

import * as cloudwatch from "aws-cdk-lib/aws-cloudwatch";
import * as actions from "aws-cdk-lib/aws-cloudwatch-actions";
import * as logs from "aws-cdk-lib/aws-logs";
import * as sns from "aws-cdk-lib/aws-sns";
import * as subscriptions from "aws-cdk-lib/aws-sns-subscriptions";
import { Duration } from "aws-cdk-lib/core";

export function AlarmStack({ stack, app }: StackContext) {
  const stage = app.stage;

  const metricName4xx = `4xxErrors-${stage}`;
  const metricName5xx = `5xxErrors-${stage}`;
  const metricNamespace4xx = `4xxMonitoring-${stage}`;
  const metricNamespace5xx = `5xxMonitoring-${stage}`;

  // Metric Filter for 4xx Errors
  new logs.MetricFilter(stack, `metricFilter4xx-${stage}`, {
    logGroup: new logs.LogGroup(stack, `CloudWatchLogGroup-4xx-${stage}`, {
      logGroupName: `/aws/lambda/4xxFilter-${stage}`,
      retention: logs.RetentionDays.ONE_YEAR, // Set log retention policy (optional)
    }),
    metricNamespace: metricNamespace4xx,
    metricName: metricName4xx,
    filterPattern: logs.FilterPattern.stringValue("$.statusCode", "=", "4*"),
    metricValue: "1",
  });

  // Metric Filter for 5xx Errors
  new logs.MetricFilter(stack, `metricFilter5xx-${stage}`, {
    logGroup: new logs.LogGroup(stack, `CloudWatchLogGroup-5xx-${stage}`, {
      logGroupName: `/aws/lambda/5xxFilter-${stage}`,
      retention: logs.RetentionDays.ONE_YEAR, // Set log retention policy (optional)
    }),
    metricNamespace: metricNamespace5xx,
    metricName: metricName5xx,
    filterPattern: logs.FilterPattern.stringValue("$.statusCode", "=", "5*"),
    metricValue: "1",
  });

  // Alarm for 4xx Errors
  const alarm4xx = new cloudwatch.Alarm(stack, `Alarm4xx-${stage}`, {
    metric: new cloudwatch.Metric({
      namespace: `Alarm4xx-${stage}`,
      metricName: metricName4xx,
      statistic: "Sum",
      period: Duration.minutes(5), // Aggregate over 5 minutes
    }),
    threshold: 10, // Trigger the alarm if there are more than 10 errors in 5 minutes
    evaluationPeriods: 1,
    comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
    alarmDescription: "High number of 4xx errors detected",
  });

  // Alarm for 5xx Errors
  const alarm5xx = new cloudwatch.Alarm(stack, `Alarm5xx-${stage}`, {
    metric: new cloudwatch.Metric({
      namespace: `Alarm5xx-${stage}`,
      metricName: metricName5xx,
      statistic: "Sum",
      period: Duration.minutes(5),
    }),
    threshold: 5, // Trigger the alarm if there are more than 5 errors in 5 minutes
    evaluationPeriods: 1,
    comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
    alarmDescription: "High number of 5xx errors detected",
  });

  // Add an SNS topic for alarm notifications
  const alarm4xxTopic = new sns.Topic(stack, `alerts-4xx-topic-${stage}`, {
    displayName: `4xx Failure Alerts - ${stage}`,
  });

  // Subscribe an email address to the SNS topic
  const emailAddress = "jacob.jang@mediamonks.com";
  alarm4xxTopic.addSubscription(new subscriptions.EmailSubscription(emailAddress));

  // Add the SNS topic as an alarm action
  alarm4xx.addAlarmAction(new actions.SnsAction(alarm4xxTopic));

  // Add an SNS topic for alarm notifications
  const alarm5xxTopic = new sns.Topic(stack, `alerts-5xx-topic-${stage}`, {
    displayName: `5xx Failure Alerts - ${stage}`,
  });

  // Subscribe an email address to the SNS topic
  alarm5xxTopic.addSubscription(new subscriptions.EmailSubscription(emailAddress));

  // Add the SNS topic as an alarm action
  alarm5xx.addAlarmAction(new actions.SnsAction(alarm5xxTopic));

  stack.addOutputs({});

  return {};
}
