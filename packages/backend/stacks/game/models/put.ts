import { JsonSchemaType, JsonSchemaVersion } from "aws-cdk-lib/aws-apigateway";
import { format } from "path";

export default {
  contentType: "application/json",
  modelName: "PutGameModel",
  schema: {
    schema: JsonSchemaVersion.DRAFT4,
    type: JsonSchemaType.OBJECT,
    additionalProperties: false,
    properties: {
      gameId: {
        type: JsonSchemaType.STRING,
        format: "uuid",
        pattern: "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$",
      },
      score: {
        type: JsonSchemaType.NUMBER,
        minLength: 2,
      },
      level: {
        type: JsonSchemaType.NUMBER,
        maxLength: 2,
      },
    },
    required: ["gameId", "score", "level"],
  },
};
