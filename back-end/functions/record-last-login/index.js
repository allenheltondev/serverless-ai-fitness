const { DynamoDBClient, UpdateItemCommand } = require('@aws-sdk/client-dynamodb');
const { marshall } = require('@aws-sdk/util-dynamodb');
const ddb = new DynamoDBClient();

exports.handler = async (event) => {
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