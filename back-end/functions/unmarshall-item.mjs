import { unmarshall } from '@aws-sdk/util-dynamodb';

export const handler = async (state) => {
  const item = unmarshall(state.item);

  return { item };
};
