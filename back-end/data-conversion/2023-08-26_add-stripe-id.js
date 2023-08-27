const stripe = require('stripe')('');
const { DynamoDBClient, QueryCommand, UpdateItemCommand } = require('@aws-sdk/client-dynamodb');
const { unmarshall, marshall } = require('@aws-sdk/util-dynamodb');
const ddb = new DynamoDBClient();
const run = async () => {
  try {
    
    let users = [];
    let lastEvaluatedKey;
    do {
      const result = await ddb.send(new QueryCommand({
        TableName: 'ai-fitness',
        IndexName: 'facets',
        KeyConditionExpression: 'facet = :user',
        ExpressionAttributeValues: marshall({
          ':user': 'user'
        }),
        ...lastEvaluatedKey && { ExclusiveStartKey: lastEvaluatedKey }
      }));

      users = users.concat(result.Items.map(item => unmarshall(item)));
      lastEvaluatedKey = result.LastEvaluatedKey;
    } while (lastEvaluatedKey);

    for (const profile of users) {
      console.log(`Adding customer ${profile.pk}`)
      const customer = await stripe.customers.create({
        description: 'Fitness App customer',
        metadata: {
          userId: profile.pk
        },
        ...profile.contact?.email && { email: profile.contact.email },
        ...(profile.demographics?.firstName || profile.demographics?.lastName) && { name: `${profile.demographics.firstName ?? ''}${profile.demographics.lastName ? ' ' + profile.demographics.lastName : ''}` }
      });

      await ddb.send(new UpdateItemCommand({
        TableName: 'ai-fitness',
        Key: marshall({
          pk: profile.pk,
          sk: profile.sk
        }),
        UpdateExpression: 'SET customerId = :customerId, subscription = :subscription',
        ExpressionAttributeValues: marshall({
          ':customerId': customer.id,
          ':subscription': {
            level: 'free'
          }
        })
      }));
    }
  } catch (err) {
    console.error(err);
  }

}

run();