import {
  DynamoDBDocumentClient,
  QueryCommand,
  QueryCommandInput,
  QueryCommandOutput,
} from "@aws-sdk/lib-dynamodb";
import { Inject } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

class UtilsDomainDatabase {
  constructor(
    @Inject("dbClient")
    private readonly dbClient: DynamoDBDocumentClient,
    @Inject()
    private readonly configService: ConfigService,
  ) {}

  public async getByPKAndBeginsSK(
    PK: string,
    SK: string,
  ): Promise<QueryCommandOutput> {
    const params: QueryCommandInput = {
      TableName: this.configService.get("AWS_DYNAMODB_TABLE_DOMAIN"),
      KeyConditionExpression: "#PK = :PK AND begins_with(#SK, :SK)",
      ExpressionAttributeNames: {
        "#PK": "PK",
        "#SK": "SK",
      },
      ExpressionAttributeValues: {
        ":PK": PK,
        ":SK": SK,
      },
    };

    return this.dbClient.send(new QueryCommand(params));
  }

  public async getByPKAndSK(
    PK: string,
    SK: string,
  ): Promise<QueryCommandOutput> {
    const params: QueryCommandInput = {
      TableName: this.configService.get("AWS_DYNAMODB_TABLE_DOMAIN"),
      KeyConditionExpression: "#PK = :PK AND #SK = :SK",
      ExpressionAttributeNames: {
        "#PK": "PK",
        "#SK": "SK",
      },
      ExpressionAttributeValues: {
        ":PK": PK,
        ":SK": SK,
      },
    };

    return this.dbClient.send(new QueryCommand(params));
  }
}

export { UtilsDomainDatabase };
