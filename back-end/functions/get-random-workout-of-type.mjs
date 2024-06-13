import { CacheGet } from '@gomomento/sdk';
import { DynamoDBClient, QueryCommand } from '@aws-sdk/client-dynamodb';
import { unmarshall, marshall } from '@aws-sdk/util-dynamodb';
import { getCacheClient } from './utils/helpers.mjs';

const ddb = new DynamoDBClient();

export const handler = async (state) => {
  const cacheClient = await getCacheClient();
  const cacheKey = `${state.muscleGroup}#${state.difficulty}`;
  let workouts;
  const response = await cacheClient.get(process.env.CACHE_NAME, cacheKey);
  if (response instanceof CacheGet.Error || response instanceof CacheGet.Miss) {
    workouts = await loadFromDatabase(cacheKey);
    await cacheClient.set(process.env.CACHE_NAME, cacheKey, JSON.stringify(workouts));
  } else if (response instanceof CacheGet.Hit) {
    workouts = JSON.parse(response.valueString());
  }

  let workout;
  if (workouts?.length) {
    const excludedWorkouts = new Set(state.excludedWorkouts?.map(ew => ew.workoutId));
    const potentialWorkouts = workouts.filter(w => !excludedWorkouts.has(w.pk));
    if (potentialWorkouts.length) {
      const index = Math.floor(Math.random() * potentialWorkouts.length);
      workout = potentialWorkouts[index];
    }
  }

  return workout;
};

const loadFromDatabase = async (key) => {
  let workouts = [];
  let lastEvaluatedKey;
  do {
    const results = await ddb.send(new QueryCommand({
      TableName: process.env.TABLE_NAME,
      IndexName: 'list',
      KeyConditionExpression: 'listType = :listType and listSort = :listSort',
      ExpressionAttributeValues: marshall({
        ':listType': 'workout',
        ':listSort': key
      }),
      ...lastEvaluatedKey && { ExclusiveStartKey: lastEvaluatedKey }
    }));
    results.Items.map(i => workouts.push(unmarshall(i)));
    lastEvaluatedKey = results.LastEvaluatedKey;
  } while (lastEvaluatedKey);

  return workouts;
};
