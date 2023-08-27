const { DynamoDBClient, PutItemCommand } = require('@aws-sdk/client-dynamodb');
const { marshall } = require('@aws-sdk/util-dynamodb');
const Stripe = require('stripe');

const shared = require('/opt/nodejs/index');

const ddb = new DynamoDBClient();

exports.handler = async (event) => {
  try {
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
  } catch (err) {
    console.error(err);
  }

  return event;
};

const saveProfileRecord = async (userId) => {
  const customerId = await getPaymentId(userId);
  await ddb.send(new PutItemCommand({
    TableName: process.env.TABLE_NAME,
    Item: marshall({
      pk: userId,
      sk: 'user',
      facet: 'user',
      facetSortKey: userId,
      signUpDate: new Date().toISOString(),
      objective: 'weight loss',
      experienceLevel: 'beginner',
      customerId,
      subscription: {
        level: 'free'
      }
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
      targetTime: 30,
      isConfigured: false
    })
  }));
};

const getPaymentId = async (userId) => {
  const stripeApiKey = await shared.getSecret('stripe');
  const stripe = new Stripe(stripeApiKey);
  const customer = await stripe.customers.create({
    description: 'Fitness App customer',
    metadata: {
      userId
    }
  });

  return customer.id;
};