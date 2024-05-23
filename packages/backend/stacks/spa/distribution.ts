import { StackContext, StaticSite, use } from "sst/constructs";
import { Duration, SecretValue } from "aws-cdk-lib/core";
import * as distribution from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as route53 from "aws-cdk-lib/aws-route53";

import {
  FRONTEND_NAME,
  S3_REFERER_KEY,
  S3_ORIGIN_BUCKET_NAME,
} from "@/libs/config";
import { getWebDomain } from "@/libs/get-domain";

import { WebACL, S3Origin, ApiStack } from "@/stacks";
import { detectStage } from "@/libs/detect-stage";
import { isValidDomain } from "@/utils/domain-validator";

export function FrontendDistribution({ stack, app }: StackContext) {
  const { isDeploy } = detectStage(app.stage);

  let domainName;
  let apiDomainName;
  let certificate;

  const enableCustomDomain =
    isDeploy && isValidDomain(String(process.env.BASE_DOMAIN));

  if (enableCustomDomain) {
    domainName = getWebDomain(app.stage);
    apiDomainName = `api.${domainName}`;

    // Assume you have a hosted zone for your domain in Route 53
    const hostedZone = route53.HostedZone.fromLookup(
      stack,
      `${app.stage}-frontend-hostedzone`,
      {
        domainName: domainName,
      }
    );

    certificate = new acm.DnsValidatedCertificate(
      stack,
      `${app.stage}-frontend-domain-certificate`,
      {
        domainName: domainName,
        hostedZone,
        validation: acm.CertificateValidation.fromDns(hostedZone),
      }
    );
  }

  const { webACL } = use(WebACL);
  const { originBucket } = use(S3Origin);

  const secretReferer = SecretValue.secretsManager(
    `${app.stage}-${S3_REFERER_KEY}`
  );

  const s3StaticOrigin = new origins.HttpOrigin(
    originBucket?.cdk.bucket.bucketWebsiteDomainName?.toString() ?? "",
    {
      protocolPolicy: distribution.OriginProtocolPolicy.HTTP_ONLY,
      customHeaders: {
        Referer: secretReferer.toString(),
      },
    }
  );

  const basicAuthFn = new distribution.Function(
    stack,
    `${app.stage}-cf-viewer-request-function`,
    {
      code: distribution.FunctionCode.fromFile({
        filePath: "packages/backend/stacks/spa/behaviors/viewer-request.js",
      }),
    }
  );

  const { api } = use(ApiStack);

  const web = new StaticSite(stack, `${app.stage}-${FRONTEND_NAME}-site`, {
    path: "packages/frontend",
    buildOutput: "out",
    buildCommand: "npm run build:next",
    environment: {
      NEXT_PUBLIC_FE_REGION: app.region ?? "",
      NEXT_PUBLIC_API_HOST: api.customDomainUrl ?? api.url,
    },
    ...(enableCustomDomain ? { customDomain: domainName, certificate } : {}),
    cdk: {
      // eslint-disable-next-line
      // @ts-ignore
      bucket: s3.Bucket.fromBucketName(
        stack,
        `${app.stage}-${S3_ORIGIN_BUCKET_NAME}`,
        `${app.stage}-${S3_ORIGIN_BUCKET_NAME}`
      ),
      distribution: {
        enabled: true,
        enableIpv6: true,
        priceClass: distribution.PriceClass.PRICE_CLASS_ALL,
        webAclId: webACL?.attrArn,
        defaultRootObject: "index.html",
        errorResponses: [
          {
            httpStatus: 403,
            responseHttpStatus: 403,
            responsePagePath: "/403.html",
          },
          {
            httpStatus: 404,
            responseHttpStatus: 200,
            responsePagePath: "/index.html",
          },
        ],
        defaultBehavior: {
          origin: s3StaticOrigin,
          functionAssociations: [
            {
              // eslint-disable-next-line
              // @ts-ignore
              function: basicAuthFn,
              eventType: distribution.FunctionEventType.VIEWER_REQUEST,
            },
          ],
          allowedMethods: distribution.AllowedMethods.ALLOW_GET_HEAD,
          cachedMethods: distribution.CachedMethods.CACHE_GET_HEAD,
          cachePolicy: new distribution.CachePolicy(
            stack,
            `${app.stage}-basic-cache-policy`,
            {
              cachePolicyName: `${app.stage}-basic-cache-policy`,
              comment: "custom cache for files without hash",
              defaultTtl: Duration.seconds(180),
              maxTtl: Duration.seconds(300),
              minTtl: Duration.seconds(1),
              cookieBehavior: distribution.CacheCookieBehavior.none(),
              headerBehavior: distribution.CacheHeaderBehavior.none(),
              queryStringBehavior: distribution.CacheQueryStringBehavior.none(),
              enableAcceptEncodingGzip: true,
              enableAcceptEncodingBrotli: true,
            }
          ),
          responseHeadersPolicy: new distribution.ResponseHeadersPolicy(
            stack,
            `${app.stage}-page-policy`,
            {
              responseHeadersPolicyName: `${app.stage}-page-policy`,
              comment: "custom response headers for HTML files",
              customHeadersBehavior: {
                customHeaders: [
                  {
                    header: "permissions-policy",
                    override: true,
                    value:
                      "accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=(), fullscreen=(), sync-xhr=(), midi=(), picture-in-picture=(), autoplay=(), encrypted-media=()",
                  },
                  {
                    header: "Content-Security-Policy-Report-Only",
                    override: true,
                    value: `default-src 'self'; manifest-src 'self'; base-uri 'self'; form-action 'self'; font-src 'self' data: 'unsafe-inline'; frame-ancestors 'self'; object-src 'none'; media-src 'self'; img-src 'self' blob: data:; connect-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' ; style-src-elem 'self' blob: data: 'unsafe-inline'; style-src 'self' blob: data: 'unsafe-inline';`,
                  },
                ],
              },
              securityHeadersBehavior: {
                strictTransportSecurity: {
                  override: true,
                  accessControlMaxAge: Duration.seconds(31536000),
                  includeSubdomains: true,
                  preload: true,
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
                  override: true,
                  frameOption: distribution.HeadersFrameOption.DENY,
                },
                contentSecurityPolicy: {
                  override: true,
                  contentSecurityPolicy: `default-src 'self'; manifest-src 'self'; base-uri 'self'; form-action 'self'; font-src 'self' data: 'unsafe-inline'; frame-ancestors 'self'; object-src 'none'; media-src 'self'; img-src 'self' blob: data:; connect-src ${apiDomainName} 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src-elem 'self' blob: data: 'unsafe-inline'; style-src 'self' blob: data: 'unsafe-inline';`,
                },
              },
            }
          ),
          viewerProtocolPolicy:
            distribution.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          compress: true,
          smoothStreaming: false,
        },
        additionalBehaviors: {},
      },
    },
  });

  stack.addOutputs({
    Web: web.url,
  });
}
