import type { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';

export type Handler = (event: APIGatewayProxyEvent, context?: Context) => Promise<APIGatewayProxyResult>;

export enum LambdaIntegrationType {
  Proxy = 'LAMBDA_PROXY',
  Lambda = 'LAMBDA'
}
