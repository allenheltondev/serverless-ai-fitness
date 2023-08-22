import { util } from "@aws-appsync/utils";

export function request(ctx) {
  return {
    operation: "GetItem",
    key: util.dynamodb.toMapValues({ pk: `${ctx.identity.sub}#${ctx.args.date}`, sk: 'workout' }),
  };
}

export function response(ctx) {
  return { id: ctx.result?.workoutId };
}