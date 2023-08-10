import { util } from "@aws-appsync/utils";

export function request(ctx) {
  return {
    operation: "Query",
    index: "encyclopedia",
    query: {
      expression: "#listType = :listType and begins_with(#listSort, :listSort)",
      expressionNames: {
        "#listType": "listType",
        "#listSort": "listSort"
      },
      expressionValues: util.dynamodb.toMapValues({
        ":listType": "workout",
        ":listSort": ctx.args.muscleGroup
      })
    },
    limit: 20,
    ...ctx.args.nextToken && { nextToken: ctx.args.nextToken }
  };
}

export function response(ctx) {
  const { items: workouts = [], nextToken } = ctx.result;
  return { workouts, nextToken }
}