const { DynamoDBClient, UpdateItemCommand, QueryCommand } = require('@aws-sdk/client-dynamodb');
const { CognitoIdentityProviderClient, AdminAddUserToGroupCommand, AdminRemoveUserFromGroupCommand } = require('@aws-sdk/client-cognito-identity-provider');
const { marshall, unmarshall } = require('@aws-sdk/util-dynamodb');
const ddb = new DynamoDBClient();
const cognito = new CognitoIdentityProviderClient();

const memberships = [{ stripeId: 'prod_OTTIJ2Y7QROAjT', groupName: process.env.PRO_MEMBERSHIP_GROUP, level: 'pro' }, { groupName: process.env.FREE_MEMBERSHIP_GROUP, level: 'free' }];

exports.handler = async (event) => {
  const { detail } = event;

  const user = await getUser(event.detail.data.object.customer);
  if (!user) {
    return;
  }
  const membership = memberships.find(m => m.stripeId == event.detail.data.object.plan.product);
  if (!membership) {
    console.error({ error: 'Could not find matching Stripe product', membershipId: event.detail.data.object.plan.product });
    return;
  }

  switch (detail.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.resumed':
    case 'customer.subscription.updated':
      await updateUserMembership(user, membership, event.detail.data.object.start_date, event.detail.data.object.id);
      break;
    case 'customer.subscription.deleted':
    case 'customer.subscription.paused':
      const freeMembership = memberships.find(m => m.level == 'free');
      await updateUserMembership(user, freeMembership, new Date().getTime())
      break;
  }
};

const updateUserMembership = async (user, membership, startDate, subscriptionId) => {
  try {
    const response = await ddb.send(new UpdateItemCommand({
      TableName: process.env.TABLE_NAME,
      Key: marshall({
        pk: user.pk,
        sk: user.sk
      }),
      UpdateExpression: 'SET subscription = :subscription',
      ExpressionAttributeValues: marshall({
        ':subscription': {
          level: membership.level,
          startDate: startDate,
          ...subscriptionId && { subscriptionId }
        }
      }),
      ReturnValues: 'UPDATED_OLD'
    }));

    if (response.Attributes?.subscription?.M?.level?.S && response.Attributes?.subscription?.M?.level?.S != membership.level) {
      const groupName = memberships.find(m => m.level == response.Attributes?.subscription?.M?.level?.S)?.groupName;
      if (groupName) {
        await cognito.send(new AdminRemoveUserFromGroupCommand({
          GroupName: groupName,
          UserPoolId: process.env.USER_POOL_ID,
          Username: user.username
        }));
      }
    }

    await cognito.send(new AdminAddUserToGroupCommand({
      GroupName: membership.groupName,
      UserPoolId: process.env.USER_POOL_ID,
      Username: user.username
    }));
  } catch (err) {
    console.error({ error: err, message: 'Error adding membership to user', userId: user.pk });
    throw err;
  }
};

const getUser = async (customerId) => {
  try {
    const response = await ddb.send(new QueryCommand({
      TableName: process.env.TABLE_NAME,
      IndexName: 'payment',
      KeyConditionExpression: 'customerId = :customerId',
      ExpressionAttributeValues: marshall({
        ':customerId': customerId
      }),
      Limit: 1
    }));

    if (!response.Items.length) {
      console.error({ error: 'Could not find customer', id: customerId });
      return;
    }

    const user = unmarshall(response.Items[0]);
    return user;
  }
  catch (err) {
    console.error({ error: err, userId: customerId });
    throw err;
  }
};