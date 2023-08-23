import { util } from "@aws-appsync/utils";

export function request(ctx) {
  return {
    operation: "Query",
    index: "list",
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
  let { items: workouts = [], nextToken } = ctx.result;

  workouts = workouts.map(w => {
    return {
      id: w.pk,
      muscleGroup: w.muscleGroup,
      equipment: w.equipment,
      estimatedTime: w.estimatedTime,
      type: w.type,
      rating: w.rating ?? 0,
      difficulty: w.difficulty
    }
  });
  
  return { workouts, nextToken };
}