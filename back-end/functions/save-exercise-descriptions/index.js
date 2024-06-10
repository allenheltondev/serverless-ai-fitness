const { DynamoDBClient, BatchWriteItemCommand } = require('@aws-sdk/client-dynamodb');
const { marshall } = require('@aws-sdk/util-dynamodb');

const ddb = new DynamoDBClient();

exports.handler = async (state) => {
  const batchWritePromises = [];
  let batch = [];

  for (const set of state.mainSet.sets) {
    for (const exercise of set.exercises) {
      if (exercise.description) {
        batch.push({
          PutRequest: {
            Item: marshall({
              pk: exercise.name.toLowerCase(),
              sk: 'exercise',
              muscleGroup: state.muscleGroup,
              description: exercise.description,
              listType: 'exercise',
              listSort: `${state.muscleGroup}#${exercise.name.toLowerCase()}`
            })
          }
        });

        if (batch.length === 25) {
          batchWritePromises.push(batchWrite(batch));
          batch = [];
        }
      }
    }
  }

  if (batch.length > 0) {
    batchWritePromises.push(batchWrite(batch));
  }

  await Promise.all(batchWritePromises);
};

const batchWrite = async (batch) => {
  const params = {
    RequestItems: {
      [process.env.TABLE_NAME]: batch
    }
  };

  try {
    const response = await ddb.send(new BatchWriteItemCommand(params));
    if (response.UnprocessedItems[process.env.TABLE_NAME].length) {
      console.error(`Could not save descriptions for ${response.UnprocessedItems[process.env.TABLE_NAME].length} items`);
    }
  } catch (error) {
    console.error(error);
  }
};
