import {
  type BatchWriteItemCommandOutput,
  type DeleteItemOutput,
  DynamoDBClient as AWSDynamoDBClient,
  type GetItemOutput,
  type PutItemOutput,
  type QueryOutput,
  type ScanOutput,
  type UpdateItemOutput,
  type AttributeValue,
  type BatchGetItemOutput,
  type TransactWriteItemsInput,
  type TransactWriteItem,
  type TransactWriteItemsCommandOutput,
  type WriteRequest,
  type BatchWriteItemInput,
  type BatchGetItemInput,
} from "@aws-sdk/client-dynamodb";
import type { DeleteCommandInput, UpdateCommandInput } from "@aws-sdk/lib-dynamodb";
import type { AwsCredentialIdentity } from "@aws-sdk/types";
import { DeleteCommand, DynamoDBDocument, GetCommand, PutCommand, QueryCommand, ScanCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { tracer } from "@/libs/powertools";

let client: DynamoDBClient | null = null;

class DynamoDBClient {
  tableName: string;
  dynamoDBClient: DynamoDBDocument;

  constructor(table: string, credentials?: AwsCredentialIdentity) {
    if (!table) {
      throw Error("Invalid DynamoDB Table Name");
    }

    const client = new AWSDynamoDBClient({ credentials });
    this.dynamoDBClient = DynamoDBDocument.from(tracer.captureAWSv3Client(client));
    this.tableName = table;
  }

  /**
   * Save an Item on DynamoDB
   */
  save(item: any, extraParams = {}, table = this.tableName): Promise<PutItemOutput> {
    const params = Object.assign(
      {
        TableName: table,
        Item: item,
      },
      extraParams
    );

    return this.dynamoDBClient.send(new PutCommand(params));
  }

  /**
   * Find by Key comparison
   */
  find(where: any, strongConsistentRead = false, table = this.tableName): Promise<GetItemOutput> {
    const params = {
      TableName: table,
      Key: where,
      ConsistentRead: strongConsistentRead,
    };

    return this.dynamoDBClient.send(new GetCommand(params));
  }

  /**
   * Execute a Raw Select Query on DynamoTable.
   * You must inform the KeyConditionExpression
   * and ExpressionAttributeNames
   */
  query(where: any, strongConsistentRead = false, table = this.tableName): Promise<QueryOutput> {
    where.TableName = table;
    where.ConsistentRead = strongConsistentRead;

    return this.dynamoDBClient.send(new QueryCommand(where));
  }

  /**
   * Execute a DynamoDB Scan
   * Eventually Consistent
   */
  scan(params: any, table = this.tableName): Promise<ScanOutput> {
    params.TableName = table;
    return this.dynamoDBClient.send(new ScanCommand(params));
  }

  /**
   * Update item identified by Key
   */
  update(key: any, extraParams = {}, table = this.tableName): Promise<UpdateItemOutput> {
    const params = Object.assign(
      {
        TableName: table,
        Key: key,
        ReturnValues: "ALL_NEW",
      },
      extraParams
    ) as UpdateCommandInput;

    return this.dynamoDBClient.send(new UpdateCommand(params));
  }

  /**
   * Remove a row from DynamoDB based on Key comparison
   */
  removeRow(key: any, extraParams = {}, table = this.tableName): Promise<DeleteItemOutput> {
    const params = Object.assign(
      {
        TableName: table,
        Key: key,
        ReturnValues: "ALL_OLD",
      },
      extraParams
    ) as DeleteCommandInput;

    return this.dynamoDBClient.send(new DeleteCommand(params));
  }

  /**
   * Batch writes items to the DynamoDB table.
   *
   * @param {AWS.DynamoDB.WriteRequest[]} items - The items to be written.
   * @param {string} [table=this.tableName] - The name of the table to write the items to.
   * @return {Promise<BatchWriteItemCommandOutput>} - A promise that resolves to the result of the batch write operation.
   */
  batchWrite(items: WriteRequest[], table = this.tableName): Promise<BatchWriteItemCommandOutput> {
    const params: BatchWriteItemInput = {
      RequestItems: {
        [table]: items,
      },
    };

    return this.dynamoDBClient.batchWrite(params);
  }

  batchGet(keysToGet: Record<string, AttributeValue>[], attToGet: string[], table = this.tableName): Promise<BatchGetItemOutput> {
    const params: BatchGetItemInput = {
      RequestItems: {
        [table]: {
          AttributesToGet: attToGet,
          Keys: keysToGet,
        },
      },
    };

    return this.dynamoDBClient.batchGet(params);
  }

  transactUpdates(items: TransactWriteItem[]): Promise<TransactWriteItemsCommandOutput> {
    const params: TransactWriteItemsInput = {
      TransactItems: items,
    };

    return this.dynamoDBClient.transactWrite(params);
  }
}

/**
 * Dynamic DynamoDb expression generation based on key/value format input
 *
 * @param {object} data
 * @param {array} allowedKeys - optional list of properties to which the expression is limited to
 * @returns {UpdateExpression: string, ExpressionAttributeNames: object, ExpressionAttributeValues: object}
 */
export function generateExpression(data: { [key: string]: any } = {}, allowedKeys: string[] = []) {
  let UpdateExpression = "SET";
  const ExpressionAttributeNames: { [key: string]: string } = {};
  const ExpressionAttributeValues: { [key: string]: any } = {};

  Object.entries(data)
    .filter(([, value]) => !!value)
    .forEach(([key, value]) => {
      if (!allowedKeys.length || allowedKeys.includes(key)) {
        UpdateExpression += ` #${key} = :${key},`;
        ExpressionAttributeNames[`#${key}`] = key;
        ExpressionAttributeValues[`:${key}`] = value;
      } else {
        throw new Error(`"${key}" key is not allowed`);
      }
    });

  return {
    UpdateExpression: UpdateExpression.slice(0, -1),
    ExpressionAttributeNames,
    ExpressionAttributeValues,
  };
}

export function getDynamoDBClient(table: string, credentials?: AwsCredentialIdentity): DynamoDBClient {
  if (!client) {
    client = new DynamoDBClient(table, credentials);
  }

  return client;
}

export default DynamoDBClient;
