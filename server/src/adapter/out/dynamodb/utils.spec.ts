import { Test, TestingModule } from "@nestjs/testing";
import {
  DynamoDBDocumentClient,
  QueryCommandOutput,
} from "@aws-sdk/lib-dynamodb";
import { UtilsDomainDatabase } from "./utils";
import { ConfigModule } from "@nestjs/config";

describe("UtilsDomainDatabase", () => {
  let utilsDomainDatabase: UtilsDomainDatabase;
  let dbClient: DynamoDBDocumentClient;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forFeature(() => ({
          AWS_DYNAMODB_TABLE_DOMAIN: "Any_Value",
        })),
      ],
      providers: [
        UtilsDomainDatabase,
        {
          provide: "dbClient",
          useValue: {
            send: jest.fn(),
          },
        },
      ],
    }).compile();

    utilsDomainDatabase = module.get<UtilsDomainDatabase>(UtilsDomainDatabase);
    dbClient = module.get<DynamoDBDocumentClient>("dbClient");
  });

  it("should be defined", () => {
    expect(utilsDomainDatabase).toBeDefined();
  });

  describe("getByPKAndBeginsSK", () => {
    it("should query DynamoDB with correct parameters", async () => {
      const PK = "testPK";
      const SK = "testSK";
      const mockOutput: QueryCommandOutput = {
        Items: [],
        $metadata: {
          httpStatusCode: 200,
        },
      };
      (dbClient.send as jest.Mock).mockResolvedValue(mockOutput);

      const result = await utilsDomainDatabase.getByPKAndBeginsSK(PK, SK);
      expect(result).toEqual(mockOutput);
    });
  });

  describe("getByPKAndSK", () => {
    it("should query DynamoDB with correct parameters", async () => {
      const PK = "testPK";
      const SK = "testSK";
      const mockOutput: QueryCommandOutput = {
        Items: [],
        $metadata: {
          httpStatusCode: 200,
        },
      };
      (dbClient.send as jest.Mock).mockResolvedValue(mockOutput);

      const result = await utilsDomainDatabase.getByPKAndSK(PK, SK);
      expect(result).toEqual(mockOutput);
    });
  });
});
