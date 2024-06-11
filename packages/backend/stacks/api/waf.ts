import { use, StackContext } from "sst/constructs";
import { getWAFManagedRule } from "@/utils/waf-utils";
import { CfnWebACL, CfnWebACLAssociation } from "aws-cdk-lib/aws-wafv2";

import { detectStage } from "@/libs/detect-stage";
import { ApiStack, AuthStack } from "@/stacks";

export function WafStack({ stack, app }: StackContext) {
  const stage = app.stage;
  const { isDevelopment } = detectStage(stage);
  const { api } = use(ApiStack);
  const { auth } = use(AuthStack);

  if (isDevelopment) {
    return { waf: undefined };
  }

  const COUNTRIES_ALLOW_LIST = (process.env.COUNTRIES_ALLOW_LIST || "US")?.split(",").map((country) => country.trim());

  const customResponseBody = {
    contentType: "APPLICATION_JSON",
    content: JSON.stringify({
      message: "Access restricted based on your country.",
      reason: "CountryRestriction",
    }),
  };

  const WAF = new CfnWebACL(stack, `${stage}-API-Cognito-ACL`, {
    name: `${stage}-API-Cognito-ACL`,
    scope: "REGIONAL",
    description: `WAF allow specific countries rule for API + Cognito. stage: ${stage}`,
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
      {
        name: "allowSpecificCountriesRule",
        priority: 0,
        action: {
          block: {
            customResponse: {
              responseCode: 403,
              customResponseBodyKey: "CountryRestrictionResponse",
              responseHeaders: [
                {
                  name: "X-Custom-Header",
                  value: "CountryRestriction",
                },
              ],
            },
          },
        },
        statement: {
          notStatement: {
            statement: {
              geoMatchStatement: {
                countryCodes: COUNTRIES_ALLOW_LIST,
              },
            },
          },
        },
        visibilityConfig: {
          cloudWatchMetricsEnabled: true,
          metricName: "allow-specific-countries-rule",
          sampledRequestsEnabled: true,
        },
      },
    ],
  });

  new CfnWebACLAssociation(stack, "WebACLAssociationAPI", {
    webAclArn: WAF.attrArn,
    resourceArn: `${api.restApiArn}/stages/${stage}`,
  });

  new CfnWebACLAssociation(stack, "WebACLAssociationCognito", {
    webAclArn: WAF.attrArn,
    resourceArn: auth.userPoolArn,
  });

  return { WAF };
}
