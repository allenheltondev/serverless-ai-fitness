import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';

const ddb = new DynamoDBClient();

export const handler = async (state) => {
  let tableName = state.tableName ?? process.env.TABLE_NAME;
  await ddb.send(new PutItemCommand({
    TableName: tableName,
    Item: marshall(state.item)
  }));

  return { success: true };
};
