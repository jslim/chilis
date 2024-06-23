import {
  Distribution,
  ViewerProtocolPolicy,
  AllowedMethods,
  CachePolicy,
  CacheHeaderBehavior,
  OriginRequestPolicy,
  OriginRequestHeaderBehavior,
  ResponseHeadersPolicy,
  HeadersFrameOption,
  HeadersReferrerPolicy,
} from "aws-cdk-lib/aws-cloudfront";
import { Duration } from "aws-cdk-lib";
import { CloudFrontTarget } from "aws-cdk-lib/aws-route53-targets";
import { HttpOrigin } from "aws-cdk-lib/aws-cloudfront-origins";
import { HostedZone, ARecord, RecordTarget } from "aws-cdk-lib/aws-route53";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import type { StackContext } from "sst/constructs";
import { use } from "sst/constructs";

import { ApiStack, WafStack } from "@/stacks";
import { isValidDomain } from "@/utils/domain-validator";
import { detectStage } from "@/libs/detect-stage";

export function ApiDistributionStack({ stack, app }: StackContext) {
  const { api } = use(ApiStack);
  const { waf } = use(WafStack);
  const { isProd } = detectStage(app.stage);

  if (!isValidDomain(process.env.BASE_DOMAIN!)) {
    throw new Error("Please set BASE_DOMAIN environment variable");
  }

  let targetHostedzoneName = process.env.BASE_DOMAIN!;
  const domainName = isProd ? targetHostedzoneName : `${app.stage}.${targetHostedzoneName}`;
  const apiDomainName = `api.${domainName}`;

  // Assume you have a hosted zone for your domain in Route 53
  const hostedZone = HostedZone.fromLookup(stack, `${app.stage}-api-hostedzone`, {
    domainName: targetHostedzoneName,
  });

  const certificate = new acm.DnsValidatedCertificate(stack, `${app.stage}-api-domain-certificate`, {
    domainName: targetHostedzoneName,
    subjectAlternativeNames: [`*.${domainName}`],
    hostedZone,
    validation: acm.CertificateValidation.fromDns(hostedZone),
  });

  // DISTRIBUTION ORIGIN
  const apiOrigin = new HttpOrigin(`${api.restApiId}.execute-api.${app.region}.amazonaws.com`, {
    originId: `${app.stage}-api-http-origin`,
    originPath: `/${api.cdk.restApi.deploymentStage.stageName}`,
  });

  const securityHeadersPolicy = new ResponseHeadersPolicy(stack, `${app.stage}-security-headers-policy`, {
    responseHeadersPolicyName: `${app.stage}-security-headers-policy`,
    comment: "Policy for security headers",
    customHeadersBehavior: {
      customHeaders: [
        {
          header: "Content-Security-Policy-Report-Only",
          override: true,
          value: `default-src 'self'; manifest-src 'self'; base-uri 'self'; form-action 'self'; font-src 'self' data: 'unsafe-inline'; frame-ancestors 'self'; object-src 'none'; media-src 'self'; img-src 'self' blob: data:; connect-src ${api.url} https://${apiDomainName} 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' ; style-src-elem 'self' blob: data: 'unsafe-inline'; style-src 'self' blob: data: 'unsafe-inline';`,
        },
      ],
    },
    securityHeadersBehavior: {
      contentSecurityPolicy: {
        contentSecurityPolicy: `default-src 'self'; manifest-src 'self'; base-uri 'self'; form-action 'self'; font-src 'self' data: 'unsafe-inline'; frame-ancestors 'self'; object-src 'none'; media-src 'self'; img-src 'self' blob: data:; connect-src ${api.url} https://${apiDomainName} 'self'; script-src 'self'; style-src-elem 'self' blob: data: 'unsafe-inline'; style-src 'self' blob: data: 'unsafe-inline';`,
        override: true,
      },
      contentTypeOptions: {
        override: true,
      },
      xssProtection: {
        override: true,
        modeBlock: true,
        protection: true,
      },
      frameOptions: {
        frameOption: HeadersFrameOption.DENY,
        override: true,
      },
      referrerPolicy: {
        referrerPolicy: HeadersReferrerPolicy.NO_REFERRER,
        override: true,
      },
      strictTransportSecurity: {
        accessControlMaxAge: Duration.seconds(31536000), // One years
        includeSubdomains: true,
        preload: true,
        override: true,
      },
    },
  });

  // HEADERS POLICY
  const geoLocationHeadersPolicy = new OriginRequestPolicy(stack, `${app.stage}-geo-location-headers-policy`, {
    originRequestPolicyName: `${app.stage}-geo-location-headers-policy`,
    comment: "Policy to include geolocation headers",
    headerBehavior: OriginRequestHeaderBehavior.allowList(
      "CloudFront-Viewer-City",
      "CloudFront-Viewer-Country",
      "CloudFront-Viewer-Postal-Code",
    ),
  });

  const cachePolicy = new CachePolicy(stack, `${app.stage}-api-cache-policy`, {
    cachePolicyName: `${app.stage}-api-cache-policy`,
    defaultTtl: Duration.seconds(10),
    maxTtl: Duration.seconds(15),
    minTtl: Duration.seconds(1),
    headerBehavior: CacheHeaderBehavior.allowList(
      "Authorization",
      "CloudFront-Viewer-City",
      "CloudFront-Viewer-Country",
      "CloudFront-Viewer-Postal-Code",
    ),
  });

  // DISTRIBUTION
  const apiDistribution = new Distribution(stack, `${app.stage}-api-distribution`, {
    webAclId: waf.attrArn,
    domainNames: [apiDomainName],
    certificate,
    defaultBehavior: {
      origin: apiOrigin,
      originRequestPolicy: geoLocationHeadersPolicy,
      viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      responseHeadersPolicy: securityHeadersPolicy,
      allowedMethods: AllowedMethods.ALLOW_ALL,
      cachePolicy: cachePolicy,
    },
  });

  // A-RECORD
  new ARecord(stack, `${app.stage}-api-cloudfront-a-record`, {
    zone: hostedZone,
    recordName: apiDomainName,
    target: RecordTarget.fromAlias(new CloudFrontTarget(apiDistribution)),
  });

  stack.addOutputs({
    ApiCdn: `https://${apiDistribution.domainName}`,
  });

  return { apiDistribution };
}
