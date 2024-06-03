import { JsonSchemaType, JsonSchemaVersion } from "aws-cdk-lib/aws-apigateway";

export default {
  contentType: "application/json",
  modelName: "PatchUserModel",
  schema: {
    schema: JsonSchemaVersion.DRAFT4,
    type: JsonSchemaType.OBJECT,
    additionalProperties: false,
    properties: {
      nickname: {
        type: JsonSchemaType.STRING,
        pattern: "^[a-zA-Z0-9._-]{3,10}$",
      },
    },
    required: ["nickname"],
  },
};
