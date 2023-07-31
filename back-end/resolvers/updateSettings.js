import { util } from "@aws-appsync/utils";

export function request(ctx) {
  const userId = ctx.identity.sub;

  return {
    operation: "PutItem",
    key: util.dynamodb.toMapValues({ pk: userId, sk: 'settings' }),
    attributeValues: util.dynamodb.toMapValues({
      ...ctx.args.input,
      lastUpdated: util.time.nowISO8601()
    })
  };
}

export function response(ctx) {
  return ctx.result ? true: false;
}