import { util } from "@aws-appsync/utils";

export function request(ctx) {  
  return {
    operation: "Query",
    index: "facets",
    query: {
      expression: "#facet = :facet and #facetSortKey >= :facetSortKey",
      expressionNames: {
        "#facet": "facet",
        "#facetSortKey": "facetSortKey"
      },
      expressionValues: util.dynamodb.toMapValues({
        ":facet": ctx.identity.sub,
        ":facetSortKey": `workout#${ctx.args.date}`
      })
    }
  };
}

export function response(ctx) {
  const { items: workouts = [] } = ctx.result;
  return { workouts }
}