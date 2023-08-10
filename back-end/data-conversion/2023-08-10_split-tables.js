// {
//   "pk": "94a8e4d8-0071-70ba-c4fa-ad8575e3f3d2#2023-08-07",
//   "sk": "workout",
//   "date": "2023-08-07",
//   "equipment": "bodyweight exercises",
//   "estimatedTime": 30,
//   "facet": "94a8e4d8-0071-70ba-c4fa-ad8575e3f3d2",
//   "facetSortKey": "workout#2023-08-07",
//   "listSort": "total body#4727eb23-8a0f-46f6-87e3-5d77e1fe6ce5",
//   "listType": "workout",
//   "muscleGroup": "total body",
//   "scheduleName": "WORKOUT-94a8e4d8-0071-70ba-c4fa-ad8575e3f3d2-2023-08-07",
//   "workout": '',
//   "workoutId": "4727eb23-8a0f-46f6-87e3-5d77e1fe6ce5",
//   "workoutType": "circuit"
//  }

const { DynamoDBClient, PutItemCommand, QueryCommand } = require('@aws-sdk/client-dynamodb');
const { marshall, unmarshall } = require('@aws-sdk/util-dynamodb');
const fs = require('fs');

const ddb = new DynamoDBClient();

const run = async (commit = false) => {
  let data = [];
  let lastEvaluatedKey;
  do {
    const result = await ddb.send(new QueryCommand({
      TableName: 'ai-fitness',
      IndexName: 'encyclopedia',
      KeyConditionExpression: 'listType = :listType',
      ExpressionAttributeValues: marshall({
        ":listType": 'workout'
      }),
      ...lastEvaluatedKey && { ExclusiveStartKey: lastEvaluatedKey }
    }));

    lastEvaluatedKey = result.LastEvaluatedKey;
    data = [...data, ...result.Items.map(i => unmarshall(i))];

  } while (lastEvaluatedKey);

  fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
  console.log(data.length);

  for(const workout of data){
    const record = {
      pk: workout.workoutId,
      sk: 'workout',
      listType: 'workout',
      listSort: `${workout.muscleGroup}#${workout.difficulty}`,
      muscleGroup: workout.muscleGroup,
      equipment: workout.equipment,
      type: workout.workoutType,
      estimatedTime: workout.estimatedTime,
      difficulty: workout.difficulty,
      rating: 0,
      workout: workout.workout
    }

    await ddb.send(new PutItemCommand({
      TableName: '',
      Item: marshall(record)
    }));
  }
};

run();