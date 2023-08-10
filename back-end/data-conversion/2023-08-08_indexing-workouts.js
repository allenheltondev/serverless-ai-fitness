const { DynamoDBClient, ScanCommand, DeleteItemCommand, UpdateItemCommand, QueryCommand } = require('@aws-sdk/client-dynamodb');
const { marshall, unmarshall } = require('@aws-sdk/util-dynamodb');
const { randomUUID } = require('crypto');
const fs = require('fs');

const ddb = new DynamoDBClient();

const run = async (commit = false) => {
  let data = [];
  let lastEvaluatedKey;
  do {
    const result = await ddb.send(new ScanCommand({
      TableName: 'ai-fitness',
      ...lastEvaluatedKey && { ExclusiveStartKey: lastEvaluatedKey }
    }));

    lastEvaluatedKey = result.LastEvaluatedKey;
    data = [...data, ...result.Items.map(i => unmarshall(i))];


  } while (lastEvaluatedKey);

  //await deleteOldScheduleRecords(data);
  const estimatedTimeMappings = await getEstimatedTimes(data);
  const difficulties = await getDifficulty(data);
  await updateGeneratedWorkouts(data, estimatedTimeMappings, difficulties);
  //await previewGeneratedWorkouts();
};

const deleteOldScheduleRecords = async (data) => {
  const scheduleRecords = data.filter(d => d.sk == 'schedule');
  fs.writeFileSync('data.json', JSON.stringify(scheduleRecords, null, 2));
  for (const record of scheduleRecords) {
    await ddb.send(new DeleteItemCommand({
      TableName: 'ai-fitness',
      Key: marshall({
        pk: record.pk,
        sk: record.sk
      })
    }))
  }
};

const updateGeneratedWorkouts = async (data, timeMappings, difficulties) => {
  const userWorkouts = data.filter(d => d.sk == 'workout' && d.facetSortKey && d.facetSortKey.startsWith('workout#'));
  fs.writeFileSync('data.json', JSON.stringify(userWorkouts, null, 2));
  console.log(userWorkouts.length);
  
  for(const record of userWorkouts){
    let target = timeMappings.find(tm => tm.userId == record.facet);
    let targetTime = target?.targetTime;
    if(!targetTime){
      targetTime = 30;
    }

    target = difficulties.find(d => d.userId == record.facet);
    let difficulty = target?.difficulty;
    if(!difficulty){
      difficulty = 'expert'
      console.log(record.facet);
    }


    const workoutId = randomUUID();
    await ddb.send(new UpdateItemCommand({
      TableName: 'ai-fitness',
      Key: marshall({
        pk: record.pk,
        sk: record.sk
      }),
      UpdateExpression: 'SET #listType = :listType, #listSort = :listSort, #id = :id, #estimatedTime = :estimatedTime, #difficulty = :difficulty',
      ExpressionAttributeNames: {
        "#listType": "listType",
        "#listSort": "listSort",
        "#id": "workoutId",
        "#estimatedTime": "estimatedTime",
        "#difficulty": "difficulty"
      },
      ExpressionAttributeValues: marshall({
        ":listType": "workout",
        ":listSort": `${record.muscleGroup}#${workoutId}`,
        ":id": workoutId,
        ":estimatedTime": targetTime,
        ":difficulty": difficulty
      })
    }));
  }
};

const previewGeneratedWorkouts = async () => {
  const data = await ddb.send(new QueryCommand({
    TableName: 'ai-fitness',
    IndexName: 'encyclopedia',
    KeyConditionExpression: '#listType = :listType and begins_with(#listSort, :listSort)',
    ExpressionAttributeNames: {
      "#listType": "listType",
      "#listSort": "listSort"
    },
    ExpressionAttributeValues: marshall({
      ":listType": "workout",
      ":listSort": "arm"
    })
  }));

  console.log(data.Items.map(d => unmarshall(d)));
};

const getEstimatedTimes = (data) => {
  const settings = data.filter(d => d.sk == 'settings');
  return settings.map(s => {
    return {userId: s.pk, targetTime: s.targetTime}
  });
};

const getDifficulty = (data) => {
  const users = data.filter(d => d.sk == 'user');
  return users.map(u => {
    return { userId: u.pk, difficulty: u.experienceLevel ?? 'beginner'}
  });
};

run();