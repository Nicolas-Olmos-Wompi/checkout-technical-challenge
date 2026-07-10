import { DomainDataBaseRepository } from "./domain-database.controller";
import { UtilsDomainDatabase } from "./utils";
import { FeatureEntityMapper } from "src/model/mapper/feature-entity.mapper";
import { CustomException } from "src/model/exceptions/custom.model";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { ConfigService } from "@nestjs/config";
import { resultMock, entitiesMock } from "__mocks__/dynamodb/data/data.mock";

jest.mock("./utils");
jest.mock("../../../model/mapper/feature-entity.mapper");

describe("DomainDataBaseRepository", () => {
  let repository: DomainDataBaseRepository;
  let utilsDomainDatabaseMock: jest.Mocked<UtilsDomainDatabase>;

  beforeEach(() => {
    const dbClientMock = {} as DynamoDBDocumentClient;
    const configMock = {} as ConfigService;
    utilsDomainDatabaseMock = new UtilsDomainDatabase(
      dbClientMock,
      configMock,
    ) as jest.Mocked<UtilsDomainDatabase>;
    repository = new DomainDataBaseRepository(utilsDomainDatabaseMock);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return feature entities when getFeatureBy is called successfully", async () => {
    const PKDomain = "test-domain";

    utilsDomainDatabaseMock.getByPKAndBeginsSK.mockResolvedValue(resultMock);
    (FeatureEntityMapper.toModel as jest.Mock).mockReturnValue(entitiesMock);

    const result = await repository.getFeatureBy(PKDomain);

    expect(utilsDomainDatabaseMock.getByPKAndBeginsSK).toHaveBeenCalledWith(
      PKDomain,
      "USER#",
    );
    expect(FeatureEntityMapper.toModel).toHaveBeenCalledWith(resultMock);
    expect(result).toEqual(entitiesMock);
  });

  it("should throw a CustomException when getFeatureBy fails", async () => {
    const PKDomain = "test-domain";
    const mockError = new Error("Test error");

    utilsDomainDatabaseMock.getByPKAndBeginsSK.mockRejectedValue(mockError);

    await expect(repository.getFeatureBy(PKDomain)).rejects.toThrow(
      CustomException,
    );
    expect(utilsDomainDatabaseMock.getByPKAndBeginsSK).toHaveBeenCalledWith(
      PKDomain,
      "USER#",
    );
  });
});
