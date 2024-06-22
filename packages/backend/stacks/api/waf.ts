import { StackContext } from "sst/constructs";
import { getWAFManagedRule } from "@/utils/waf-utils";
import { CfnWebACL } from "aws-cdk-lib/aws-wafv2";

export function WafStack({ stack, app }: StackContext) {
  const stage = app.stage;

  const customResponseBody = {
    contentType: "APPLICATION_JSON",
    content: JSON.stringify({
      message: "Access restricted based on your country.",
      reason: "CountryRestriction",
    }),
  };

  const waf = new CfnWebACL(stack, `${stage}-API-ACL`, {
    name: `${stage}-API-ACL`,
    scope: "CLOUDFRONT",
    description: `WAF stage: ${stage}`,
    defaultAction: {
      allow: {},
    },
    visibilityConfig: {
      cloudWatchMetricsEnabled: true,
      metricName: `apiAclMetric-${stage}`,
      sampledRequestsEnabled: true,
    },
    customResponseBodies: {
      CountryRestrictionResponse: customResponseBody,
    },
    rules: [
      getWAFManagedRule("AWSManagedRulesCommonRuleSet", 1, stage),
      getWAFManagedRule("AWSManagedRulesAnonymousIpList", 2, stage),
      getWAFManagedRule("AWSManagedRulesAmazonIpReputationList", 3, stage),
    ],
  });

  return { waf };
}
