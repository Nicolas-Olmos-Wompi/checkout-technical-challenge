import { MockProxy, mock } from "jest-mock-extended";
import { DataSource, QueryRunner } from "typeorm";
import { TypeOrmHealthRepository } from "./typeorm-health.repository";

describe("TypeOrmHealthRepository", () => {
  let typeOrmHealthRepository: TypeOrmHealthRepository;
  let dataSource: MockProxy<DataSource>;
  let queryRunnerMock: MockProxy<QueryRunner>;

  beforeEach(() => {
    dataSource = mock<DataSource>();
    queryRunnerMock = mock<QueryRunner>();
    dataSource.createQueryRunner.mockReturnValue(queryRunnerMock);
    typeOrmHealthRepository = new TypeOrmHealthRepository(dataSource);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("checkHealth", () => {
    it("should return true if the query executes successfully", async () => {
      queryRunnerMock.connect.mockResolvedValue("");
      queryRunnerMock.query.mockResolvedValue([{ "1": 1 }]);
      queryRunnerMock.release.mockResolvedValue();

      const result = await typeOrmHealthRepository.checkHealth();

      expect(result).toBe(true);
      expect(queryRunnerMock.connect).toHaveBeenCalled();
      expect(queryRunnerMock.query).toHaveBeenCalledWith("SELECT 1");
      expect(queryRunnerMock.release).toHaveBeenCalled();
    });

    it("should return false if the query throws an error", async () => {
      queryRunnerMock.connect.mockResolvedValue("");
      queryRunnerMock.query.mockRejectedValue(new Error("Query error"));

      const result = await typeOrmHealthRepository.checkHealth();

      expect(result).toBe(false);
      expect(queryRunnerMock.connect).toHaveBeenCalled();
      expect(queryRunnerMock.query).toHaveBeenCalledWith("SELECT 1");
    });

    it("should return false if connecting to query runner throws an error", async () => {
      queryRunnerMock.connect.mockRejectedValue(new Error("Connection error"));

      const result = await typeOrmHealthRepository.checkHealth();

      expect(result).toBe(false);
      expect(queryRunnerMock.connect).toHaveBeenCalled();
      expect(queryRunnerMock.query).not.toHaveBeenCalled();
      expect(queryRunnerMock.release).not.toHaveBeenCalled();
    });

    it("should return false if releasing query runner throws an error", async () => {
      queryRunnerMock.connect.mockResolvedValue("");
      queryRunnerMock.query.mockResolvedValue([{ "1": 1 }]);
      queryRunnerMock.release.mockRejectedValue(new Error("Release error"));

      const result = await typeOrmHealthRepository.checkHealth();

      expect(result).toBe(false);
      expect(queryRunnerMock.connect).toHaveBeenCalled();
      expect(queryRunnerMock.query).toHaveBeenCalledWith("SELECT 1");
      expect(queryRunnerMock.release).toHaveBeenCalled();
    });
  });
});
