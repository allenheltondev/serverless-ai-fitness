const Stripe = require('stripe');
const shared = require('/opt/nodejs/index');
const { DynamoDBClient, GetItemCommand } = require('@aws-sdk/client-dynamodb');
const { marshall, unmarshall } = require('@aws-sdk/util-dynamodb');
const ddb = new DynamoDBClient();

const subscriptionPlans = [{
  id: 'prod_OTTIJ2Y7QROAjT',
  name: 'Ready, Set, Cloud Fitness Pro',
  priceId: 'price_1NgWLULPebBCni4ssM38fAa4'
}]

exports.handler = async (event) => {
  try {
    console.log(event);
    return;
    const userId = '';
    const response = await ddb.send(new GetItemCommand({
      TableName: process.env.TABLE_NAME,
      KeyConditionExpression: '#pk = :userId',
      ExpressionAttributeNames: {
        '#pk': 'pk'
      },
      ExpressionAttributeValues: marshall({
        ':userId': userId
      })
    }));

    let customerId;
    if (response.Item) {
      const user = unmarshall(response.Item);
      customerId = user.customerId;
    }

    const stripeApiKey = await shared.getSecret('stripe');
    const stripe = new Stripe(stripeApiKey);
    const session = await stripe.checkout.sessions.create({
      line_items: [
        subscriptionPlans.map(plan => {
          return {
            price: plan.priceId,
            quantity: 1
          }
        })
      ],
      mode: 'subscription',
      client_reference_id: userId,
      success_url: `${process.env.BASE_URL}/subscriptions?success=true&sessionId={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.BASE_URL}/subscriptions?cancel=true`,
      ...customerId && { customer: customerId }
    });

    return {
      statusCode: 303,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Location': session.url
      }
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Something went wrong' }),
      headers: { 'Access-Control-Allow-Origin': '*' }
    }
  }
};
