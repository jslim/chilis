import { Effect } from 'aws-cdk-lib/aws-iam';
import { HttpMethod } from 'aws-cdk-lib/aws-events';

export default function (principalId: string, awsAccountId: string, methodArn: string) {
  const version = '2012-10-17';
  const pathRegex = '^[/.a-zA-Z0-9-*]+$';
  const actions: string[] = [];
  const allowMethods: { [key: string]: any }[] = [];
  const denyMethods: { [key: string]: any }[] = [];
  const { apiId, region, stage } = extractApiArnParts(methodArn);

  function getEmptyStatement(effect: string) {
    return {
      Action: ['execute-api:Invoke'],
      Effect: effect,
      Resource: [] as { [key: string]: any }[],
      Condition: {} as { [key: string]: any }
    };
  }

  function addMethod(
    effect: Effect,
    verb: HttpMethod | '*',
    resource: string,
    conditions?: { [key: string]: any } | undefined
  ) {
    if (verb !== '*' && !Object.values(HttpMethod).includes(verb)) {
      throw Error(`Invalid HTTP verb ${verb}. Allowed verbs in ${Object.values(HttpMethod)} or '*' class`);
    }

    const resourcePattern = new RegExp(pathRegex);
    if (!resource.match(resourcePattern)) {
      throw Error(`Invalid resource path: ${resource}. Path should match ${pathRegex}`);
    }

    const resourceArn = assembleApiArn({ region, awsAccountId, apiId, stage, verb, resource });

    if (effect === Effect.ALLOW) {
      allowMethods.push({ resourceArn, conditions: conditions ?? {} });
    } else if (effect === Effect.DENY) {
      denyMethods.push({ resourceArn, conditions: conditions ?? {} });
    }
  }

  function getStatementForEffect(actions: string[], effect: Effect, methods: { [key: string]: any }[] = []) {
    const statements = [];

    if (methods?.length > 0) {
      const statement = getEmptyStatement(effect);
      methods?.forEach((curMethod) => {
        if (!curMethod?.['conditions'] || !Object.keys(curMethod?.['conditions'] ?? {})?.length) {
          statement.Action.push(...actions);
          statement.Resource.push(curMethod['resourceArn']);
        } else {
          const conditionalStatement = getEmptyStatement(effect);
          conditionalStatement.Action.push(...actions);
          conditionalStatement.Resource.push(curMethod['resourceArn']);
          conditionalStatement.Condition = curMethod['conditions'];
          statements.push(conditionalStatement);
        }
      });
      statements.push(statement);
    }
    return statements;
  }

  function allowAllMethods() {
    addMethod(Effect.ALLOW, '*', '*', []);
  }

  function denyAllMethods() {
    addMethod(Effect.DENY, '*', '*', []);
  }

  function allowMethod(verb: HttpMethod | '*', resource: string, conditions?: { [key: string]: any } | undefined) {
    addMethod(Effect.ALLOW, verb, resource, conditions);
  }

  function denyMethod(verb: HttpMethod | '*', resource: string, conditions?: { [key: string]: any } | undefined) {
    addMethod(Effect.DENY, verb, resource, conditions);
  }

  function build() {
    if (!allowMethods?.length && !denyMethods?.length) {
      throw Error('No statements defined for the policy');
    }

    return {
      principalId,
      policyDocument: {
        Version: version,
        Statement: [
          ...getStatementForEffect(actions, Effect.ALLOW, allowMethods),
          ...getStatementForEffect(actions, Effect.DENY, denyMethods)
        ].flat()
      }
    };
  }

  return {
    denyAllMethods,
    allowAllMethods,
    allowMethod,
    denyMethod,
    build
  };
}

export function extractApiArnParts(methodArn: string) {
  let temp = methodArn.split('arn:aws:execute-api:')[1].split(':');
  const region = temp[0];
  const awsAccountId = temp[1];

  temp = temp[2].split('/');
  const apiId = temp[0];
  const stage = temp[1];
  const verb = temp[2];

  const resource = methodArn.split(`${verb}`)[1];
  return {
    awsAccountId,
    region,
    apiId,
    stage,
    verb,
    resource
  };
}

function assembleApiArn({
  region,
  awsAccountId,
  apiId,
  stage,
  verb,
  resource
}: {
  region: string;
  awsAccountId: string;
  apiId: string;
  stage: string;
  verb: HttpMethod | '*';
  resource: string;
}) {
  return `arn:aws:execute-api:${region}:${awsAccountId}:${apiId}/${stage}/${verb}/${resource.replace(/^\/+/g, '')}`;
}
