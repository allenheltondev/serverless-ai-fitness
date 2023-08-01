const { DynamoDBClient, PutItemCommand } = require('@aws-sdk/client-dynamodb');
const { marshall } = require('@aws-sdk/util-dynamodb');

const ddb = new DynamoDBClient();

exports.handler = async (event) => {
  const results = await Promise.allSettled([
    await saveProfileRecord(event.request.userAttributes.sub),
    await saveSettingsRecord(event.request.userAttributes.sub)
  ]);

  const errors = results.filter(r => r.status == 'rejected');
  if (errors.length) {
    console.error(errors.map(e => { return { error: e.value, reason: e.reason }; }));
  }

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

const saveProfileRecord = async (userId) => {
  await ddb.send(new PutItemCommand({
    TableName: process.env.TABLE_NAME,
    Item: marshall({
      pk: userId,
      sk: 'user',
      facet: 'user',
      facetSortKey: userId,
      signUpDate: new Date().toISOString(),
      objective: 'weight loss',
      experienceLevel: 'beginner'
    })
  }));
};

const saveSettingsRecord = async (userId) => {
  await ddb.send(new PutItemCommand({
    TableName: process.env.TABLE_NAME,
    Item: marshall({
      pk: userId,
      sk: 'settings',
      equipment: [{
        type: 'bodyweight exercises',
        threshold: 1
      }],
      frequency: ['M', 'W', 'F'],
      muscleGroups: ['total body'],
      targetTime: 30
    })
  }));
};