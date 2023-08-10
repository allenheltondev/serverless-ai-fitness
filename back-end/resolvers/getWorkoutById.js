import { util } from "@aws-appsync/utils";

export function request(ctx) {  
  return {
    operation: "GetItem",
    key: util.dynamodb.toMapValues({ pk: ctx.args.id, sk: 'workout' }),
  };
}

export function response(ctx) {
  return ctx.result;
}