const { DynamoDBClient, PutItemCommand } = require('@aws-sdk/client-dynamodb');
const { marshall } = require('@aws-sdk/util-dynamodb');

const ddb = new DynamoDBClient();

exports.handler = async (event) => {
  await ddb.send(new PutItemCommand({
    TableName: process.env.TABLE_NAME,
    Item: marshall({
      pk: event.request.userAttributes.sub,
      sk: 'user',
      facet: 'user',
      facetSortKey: event.request.userAttributes.sub,
      signUpDate: new Date().toISOString()
    })
  }));

  return event;
};