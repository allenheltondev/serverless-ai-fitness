import { util } from "@aws-appsync/utils";

export function request(ctx) {  
  const workoutId = ctx.prev.result.id ?? ctx.args.id;
  return {
    operation: "GetItem",
    key: util.dynamodb.toMapValues({ pk: workoutId, sk: 'workout' }),
  };
}

export function response(ctx) {
  return ctx.result;
}