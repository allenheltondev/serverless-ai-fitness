const { DynamoDBClient, PutItemCommand } = require('@aws-sdk/client-dynamodb');
const { marshall } = require('@aws-sdk/util-dynamodb');

const ddb = new DynamoDBClient();

exports.handler = async (state) => {
  let tableName = state.tableName ?? process.env.TABLE_NAME;
  await ddb.send(new PutItemCommand({
    TableName: tableName,
    Item: marshall(state.item)
  }));

  return { success: true };
};