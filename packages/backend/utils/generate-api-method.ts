import { LambdaIntegration, PassthroughBehavior, AuthorizationType } from "aws-cdk-lib/aws-apigateway";
import type { LambdaIntegrationOptions, MethodOptions } from "aws-cdk-lib/aws-apigateway";
import { HttpMethod } from "aws-cdk-lib/aws-events";
import { type Authorizer } from "aws-cdk-lib/aws-apigateway/lib/authorizer";
import { type RequestValidator } from "aws-cdk-lib/aws-apigateway/lib/requestvalidator";
import { type Resource } from "aws-cdk-lib/aws-apigateway/lib/resource";
import { type Model } from "aws-cdk-lib/aws-apigateway/lib/model";
import { statusCodes } from "@/libs/http-response";
import { LambdaIntegrationType } from "@/types/api/index";

export const defaultResponseHeaders = {
  "Content-Type": "application/json",
  "Strict-Transport-Security": "max-age=63072000; includeSubdomains; preload",
  "X-Content-Type-Options": "nosniff",
  "Access-Control-Allow-Origin": process.env.CORS_ALLOW_ORIGIN || "*",
};

const nonProxyMethods = [HttpMethod.POST, HttpMethod.PATCH, HttpMethod.PUT];

/**
 * Generate API Method with integration of choice
 *
 * @param {object} config:
 *  - authorizer - custom authorizer function
 *  - resource - API Gateway resource (path)
 *  - method - HTTP method
 *  - handlerFn - lambda function
 *  - proxy {boolean} - 'LAMBDA' if false, 'LAMBDA_PROXY' if true (override automatic detection based on nonProxyMethods list)
 *  - model - API Gateway request model
 *  - validator - API Gateway request validator
 *
 * @returns API Method
 */
export default function ({
  authorizer,
  resource,
  method,
  handlerFn,
  proxy = !nonProxyMethods.includes(method),
  model,
  validator,
  overrideIntegrationOptions = {},
  overrideMethodOptions = {},
}: {
  authorizer?: Authorizer;
  resource: Resource | any;
  method: HttpMethod;
  handlerFn: any;
  proxy?: boolean;
  model?: Model | any;
  validator?: RequestValidator | any;
  overrideIntegrationOptions?: LambdaIntegrationOptions | any;
  overrideMethodOptions?: MethodOptions | any;
}) {
  const methodOptions = {
    requestParameters: {
      "method.request.header.Content-Type": true,
    },
    methodResponses: Object.values(statusCodes).map((statusCode) => {
      return {
        statusCode: String(statusCode),
        responseParameters: Object.fromEntries(new Map(Object.keys(defaultResponseHeaders).map((key) => [`method.response.header.${key}`, true]))),
      };
    }),
  };

  const integrationOptions = {
    passthroughBehavior: PassthroughBehavior.NEVER,
    requestTemplates: {
      "application/json": `#set( $body = $input.json("$") ) #define( $loop ) { #foreach($key in $map.keySet()) #set( $k = $util.escapeJavaScript($key) ) #set( $v = $util.escapeJavaScript($map.get($key)).replaceAll("\\\\'", "'") ) "$k": "$v" #if( $foreach.hasNext ) , #end #end } #end { "resource": "$context.resourcePath", "httpMethod": "$context.httpMethod", #set( $map = $input.params().header ) "headers": $loop, #set( $map = $input.params().querystring ) "queryStringParameters": $loop, #set( $map = $input.params().path ) "pathParameters": $loop, #set( $map = $stageVariables ) "stageVariables": $loop, "requestContext" : { "resourceId": "$context.resourceId", "resourcePath": "$context.resourcePath", "httpMethod": "$context.httpMethod", "httpMethod": "$context.httpMethod", "extendedRequestId": "$context.extendedRequestId", "requestTime": "$context.requestTime", "path": "$context.path", "accountId": "$context.accountId", "protocol": "$context.protocol", "stage": "$context.stage", "domainPrefix": "$context.domainPrefix", "requestTimeEpoch": "$context.requestTimeEpoch", "requestId": "$context.requestId", #set( $map = $context.identity ) "identity": $loop, "domainName": "$context.domainName", "apiId": "$context.apiId", #set( $map = $context.authorizer ) "authorizer": $loop }, "body": $body }`,
    },
    integrationResponses: [
      {
        statusCode: "200",
        responseTemplates: {
          "application/json": `$input.path('$.body')`,
        },
        responseParameters: Object.fromEntries(
          new Map(Object.entries(defaultResponseHeaders).map(([key, value]) => [`method.response.header.${key}`, `'${value}'`]))
        ),
      },
      ...Object.values(statusCodes)
        .filter((statusCode) => statusCode !== statusCodes.Success)
        .map((statusCode) => {
          return {
            statusCode: String(statusCode),
            selectionPattern: `[\\s\\S]*statusCode.*${statusCode}.[\\s\\S]*`,
            responseTemplates: {
              "application/json": `#set ($errorMessage = $util.parseJson($input.path('$.errorMessage')))$errorMessage.body`,
            },
            responseParameters: Object.fromEntries(
              new Map(Object.entries(defaultResponseHeaders).map(([key, value]) => [`method.response.header.${key}`, `'${value}'`]))
            ),
          };
        }),
    ],
  };

  handlerFn.addEnvironment("INTEGRATION_METHOD", proxy ? LambdaIntegrationType.Proxy : LambdaIntegrationType.Lambda);

  return resource.addMethod(
    method,
    new LambdaIntegration(handlerFn, {
      proxy,
      ...(!proxy && integrationOptions),
      ...overrideIntegrationOptions,
    }),
    {
      ...(model ? { requestModels: { "application/json": model } } : null),
      ...(validator ? { requestValidator: validator } : null),
      ...(proxy ? null : methodOptions),
      ...(authorizer ? { authorizer, authorizationType: AuthorizationType.CUSTOM } : null),
      ...overrideMethodOptions,
    }
  );
}
