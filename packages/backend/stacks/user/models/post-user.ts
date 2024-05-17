import { JsonSchemaType, JsonSchemaVersion } from "aws-cdk-lib/aws-apigateway";

export default {
  contentType: "application/json",
  modelName: "PostUserModel",
  schema: {
    schema: JsonSchemaVersion.DRAFT4,
    type: JsonSchemaType.OBJECT,
    additionalProperties: false,
    properties: {
      phone: {
        type: JsonSchemaType.STRING,
        pattern: "^\\d{10}$",
      },
      password: {
        type: JsonSchemaType.STRING,
        minLength: 6,
      },
    },
    required: ["phone", "password"],
  },
};
