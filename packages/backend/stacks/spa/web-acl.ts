import { StackContext } from "sst/constructs";

import { CfnIPSet, CfnWebACL } from "aws-cdk-lib/aws-wafv2";

import { detectStage } from "@/libs/detect-stage";
import { getWAFManagedRule } from "@/utils/waf-utils";

const COUNTRIES_ALLOW_LIST = ["CA", "US", "UY"];

export function WebACL({ stack, app }: StackContext) {
  const { isDevelopment, isProd } = detectStage(app.stage);

  if (isDevelopment) {
    return { waf: undefined };
  }

  const allowedIpSet = new CfnIPSet(
    stack,
    `${app.stage}-cloudfront-allowed-ip-address`,
    {
      name: `${app.stage}-cloudfront-allowed-ip-address`,
      scope: "CLOUDFRONT",
      description: "Allowed IP CIDRS",
      addresses: [
        "192.0.2.0/24", // Example IP address range
      ],
      ipAddressVersion: "IPV4",
    }
  );

  const blockedIpset = new CfnIPSet(
    stack,
    `${app.stage}-cloudfront-blocked-ip-address`,
    {
      name: `${app.stage}-cloudfront-blocked-ip-address`,
      scope: "CLOUDFRONT",
      description: "Blocked IP CIDRS",
      addresses: [
        "192.0.2.0/24", // Example IP address range
      ],
      ipAddressVersion: "IPV4",
    }
  );

  const webACL = new CfnWebACL(stack, `${app.stage}-web-acl`, {
    scope: "CLOUDFRONT", // or CLOUDFRONT
    defaultAction: {
      allow: {}, // default action to allow requests
    },
    visibilityConfig: {
      cloudWatchMetricsEnabled: true,
      metricName: "web-acl-metric",
      sampledRequestsEnabled: true,
    },
    rules: [
      getWAFManagedRule("AWSManagedRulesAmazonIpReputationList", 10, app.stage),
      getWAFManagedRule("AWSManagedRulesCommonRuleSet", 20, app.stage),
      getWAFManagedRule("AWSManagedRulesKnownBadInputsRuleSet", 30, app.stage),
      getWAFManagedRule("AWSManagedRulesAnonymousIpList", 40, app.stage),
      {
        name: "allow-specific-countries-rule",
        priority: 0,
        action: { block: {} },
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
      {
        name: "block-distribution-url-access",
        priority: 1,
        action: { block: {} },
        statement: {
          byteMatchStatement: {
            fieldToMatch: {
              singleHeader: {
                name: 'host'
              }
            },
            positionalConstraint: 'CONTAINS',
            searchString: 'cloudfront.net',
            textTransformations: [{type: 'NONE', priority: 0}]
          }
        },
        visibilityConfig: {
          cloudWatchMetricsEnabled: true,
          metricName: "block-distribution-url-access-rule",
          sampledRequestsEnabled: true,
        },
      },
      {
        name: "rate-limit-rule",
        priority: 2,
        action: {
          block: {}, // Action to take when limit is exceeded
        },
        statement: {
          rateBasedStatement: {
            limit: 5000,
            aggregateKeyType: "IP",
            scopeDownStatement: {
              notStatement: {
                statement: {
                  ipSetReferenceStatement: {
                    arn: allowedIpSet.attrArn,
                  },
                },
              },
            },
          },
        },
        visibilityConfig: {
          cloudWatchMetricsEnabled: true,
          metricName: "rate-rule",
          sampledRequestsEnabled: true,
        },
      },
      {
        name: `${app.stage}-blocked-ips-rule`,
        priority: 3,
        action: {
          block: {},
        },
        statement: {
          ipSetReferenceStatement: {
            arn: blockedIpset.attrArn,
          },
        },
        visibilityConfig: {
          cloudWatchMetricsEnabled: true,
          metricName: `${app.stage}-blocked-ips-rule`,
          sampledRequestsEnabled: true,
        },
      },
      ...(isProd
        ? [
            {
              name: `${app.stage}-allowed-ips-rule`,
              priority: 4,
              action: {
                block: {},
              },
              statement: {
                notStatement: {
                  statement: {
                    ipSetReferenceStatement: {
                      arn: allowedIpSet.attrArn,
                    },
                  },
                },
              },
              visibilityConfig: {
                cloudWatchMetricsEnabled: true,
                metricName: `${app.stage}-allowed-ips-rule`,
                sampledRequestsEnabled: true,
              },
            },
          ]
        : []),
    ],
  });

  stack.addOutputs({});

  return { webACL };
}
