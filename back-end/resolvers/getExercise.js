import { util } from "@aws-appsync/utils";

export function request(ctx) {
  return {
    operation: "GetItem",
    key: util.dynamodb.toMapValues({ pk: ctx.args.exercise.toLowerCase(), sk: 'exercise' }),
  };
}

export function response(ctx) {
  return { name: ctx.result?.pk, description: ctx.result?.description, muscleGroup: ctx.result?.muscleGroup };
}
