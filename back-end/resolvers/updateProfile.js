import { util } from "@aws-appsync/utils";

export function request(ctx) {
  const userId = ctx.identity.sub;

  return {
    operation: "UpdateItem",
    key: util.dynamodb.toMapValues({ pk: userId, sk: 'user' }),
    update: {
      expression: "SET #contact = :contact, #demographics = :demographics, #experienceLevel = :experienceLevel, #objective = :objective, #facet = :facet, #sortKey = :sortKey",
      expressionNames: {
        "#contact": "contact",
        "#demographics": "demographics",
        "#experienceLevel": "experienceLevel",
        "#objective": "objective",
        "#facet": "facet",
        "#sortKey": "facetSortKey"
      },
      expressionValues: util.dynamodb.toMapValues({
        ":contact": ctx.args.input.contact,
        ":demographics": ctx.args.input.demographics,
        ":experienceLevel": ctx.args.input.experienceLevel,
        ":objective": ctx.args.input.objective,
        ":facet": "user",
        ":sortKey": userId
      })
    }    
  };
}

export function response(ctx) {
  return ctx.result ? true : false;
}