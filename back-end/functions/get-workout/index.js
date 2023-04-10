const { unmarshall, marshall } = require('@aws-sdk/util-dynamodb');
const { DynamoDBClient, GetItemCommand } = require('@aws-sdk/client-dynamodb');

const ddb = new DynamoDBClient();

exports.handler = async (event) => {
  let date = event.queryStringParameters?.date;
  if (!date) {
    date = new Date().toISOString().split('T')[0];
  } else {
    try {
      date = new Date(date).toISOString().split('T')[0];
    } catch (e) {
      date = new Date().toISOString().split('T')[0];
    }
  }

  const result = await ddb.send(new GetItemCommand({
    TableName: process.env.TABLE_NAME,
    Key: marshall({
      pk: date,
      sk: 'workout'
    })
  }));

  if(!result.Item){
    return {
      statusCode: 404,
      body: JSON.stringify({message: 'There is no workout for the requested date'}),
      headers: { 'Access-Control-Allow-Origin': '*' }
    }
  }

  const workout = unmarshall(result.Item);
  return {
    statusCode: 200,
    body: JSON.stringify({
      muscleGroup: workout.muscleGroup,
      warmup: workout.warmup,
      mainSet: workout.workout,
      cooldown: workout.cooldown
    }),
    headers: { 'Access-Control-Allow-Origin': '*' }
  };
};