const { unmarshall } = require('@aws-sdk/util-dynamodb');
const { EventBridgeClient, PutEventsCommand } = require('@aws-sdk/client-eventbridge');
const eventBridge = new EventBridgeClient();

exports.handler = async (event) => {
  try {
    await Promise.allSettled(event.Records.map(async (r) => await handleRecord(r)));
  } catch (err) {
    console.error(err);
  }
};

const handleRecord = async (record) => {
  switch (record.eventName) {
    case 'INSERT':
      await processUpdate(unmarshall(record.dynamodb.NewImage))
    case 'MODIFY':
      const newVersion = unmarshall(record.dynamodb.NewImage);
      const oldVersion = unmarshall(record.dynamodb.OldImage);
      const newDate = new Date(newVersion.lastUpdated);
      const oldDate = new Date(oldVersion.lastUpdated);
      if (!oldVersion.lastUpdated || Math.abs(newDate - oldDate) / (1000 * 60 * 60) > 24) {
        await processUpdate(newVersion);
      }
      break;
  }
};

const processUpdate = async (record) => {
  await eventBridge.send(new PutEventsCommand({
    Entries:[
      {
        Source: 'aifitness',
        DetailType: 'Generate User Workout',
        Detail: JSON.stringify({
          userId: record.pk
        })
      }
    ]
  }));
};