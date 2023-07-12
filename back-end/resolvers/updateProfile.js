import { util } from "@aws-appsync/utils";

export function request(ctx) {
  const userId = ctx.identity.sub;

  return {
    operation: "PutItem",
    key: util.dynamodb.toMapValues({ pk: userId, sk: 'user' }),
    attributeValues: util.dynamodb.toMapValues({
      ...ctx.input,
      facet: 'user',
      facetSortKey: 'userId'
    })
  };
}

export function response(ctx) {
  return ctx.result;
}