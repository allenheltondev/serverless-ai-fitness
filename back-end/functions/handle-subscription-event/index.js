const { DynamoDBClient, UpdateItemCommand } = require('@aws-sdk/client-dynamodb');
const { marshall } = require('@aws-sdk/util-dynamodb');
const ddb = new DynamoDBClient();

exports.handler = async (event) => {
  console.log(event);
  const { detail} = event;

  switch(detail.type){
    case 'customer.subscription.created':
      break;
    case 'customer.subscription.deleted':
      break;
  }
};