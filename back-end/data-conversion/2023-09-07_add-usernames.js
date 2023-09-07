const { CognitoIdentityProviderClient, ListUsersCommand, AdminAddUserToGroupCommand } = require("@aws-sdk/client-cognito-identity-provider");
const { DynamoDBClient, UpdateItemCommand } = require('@aws-sdk/client-dynamodb');
const { marshall } = require('@aws-sdk/util-dynamodb');

const cognito = new CognitoIdentityProviderClient();
const ddb = new DynamoDBClient();

const userPoolId = '';

async function run() {
  let users = [];
  let paginationToken;
  do {
    const response = await cognito.send(new ListUsersCommand({
      UserPoolId: userPoolId,
      AttributesToGet: ['sub'],
      ...paginationToken && { PaginationToken: paginationToken }
    }));
    paginationToken = response.PaginationToken;

    response.Users.map(u => {
      const id = u.Attributes.find(a => a.Name == 'sub');
      if (!users.find(user => user.username == u.Username)) {
        users.push({
          id: id.Value,
          username: u.Username
        });
      } else {
        console.log(u.Username)
      }

    })
  } while (paginationToken);

  for (const user of users) {
    await ddb.send(new UpdateItemCommand({
      TableName: 'ai-fitness',
      Key: marshall({
        pk: user.id,
        sk: 'user'
      }),
      UpdateExpression: 'SET username = :username, subscription = :subscription',
      ExpressionAttributeValues: marshall({
        ':username': user.username,
        ':subscription': {
          level: 'free',
          startDate: new Date().getTime()
        }
      })
    }));

    await cognito.send(new AdminAddUserToGroupCommand({
      GroupName: 'Fitness-Free',
      UserPoolId: userPoolId,
      Username: user.username
    }));
  }
  console.log(`Processed ${users.length} users`);
}

run();