const { unmarshall } = require('@aws-sdk/util-dynamodb');

exports.handler = async (state) => {
  const item = unmarshall(state.item);

  return { item };
};