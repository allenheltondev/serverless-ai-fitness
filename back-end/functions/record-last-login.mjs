import { DynamoDBClient, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
const ddb = new DynamoDBClient();

export const handler = async (event) => {
  try {
    await ddb.send(new UpdateItemCommand({
      TableName: process.env.TABLE_NAME,
      Key: marshall({
        pk: event.request.userAttributes.sub,
        sk: 'user'
      }),
      UpdateExpression: 'SET lastLogin = :lastLogin',
      ExpressionAttributeValues: marshall({
        ':lastLogin': new Date().toISOString()
      })
    }));
  } catch (err) {
    console.error(err);
  }

  return event;
};
