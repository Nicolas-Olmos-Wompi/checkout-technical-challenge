import { QueryCommandOutput } from "@aws-sdk/lib-dynamodb";
import { Inject } from "@nestjs/common";
import { CustomException } from "../../../model/exceptions/custom.model";
import { ERROR_STATES_MESSAGES } from "../../../common/response-states/error-states.messages";
import { IDomainDataBaseRepository } from "domain/src/interface/domain-database.repository";
import { DomainEntity } from "../../../../domain/src/model/domain.entity";
import { FeatureEntityMapper } from "../../../model/mapper/feature-entity.mapper";
import { USER_PREFIX } from "../../../../domain/src/common/db-prefixes.vars";
import { UtilsDomainDatabase } from "./utils";

class DomainDataBaseRepository implements IDomainDataBaseRepository {
  constructor(
    @Inject("utilsDomainDatabase")
    private readonly utils: UtilsDomainDatabase,
  ) {}

  public async getFeatureBy(PKDomain: string): Promise<DomainEntity[]> {
    try {
      const result: QueryCommandOutput = await this.utils.getByPKAndBeginsSK(
        PKDomain,
        USER_PREFIX,
      );
      return FeatureEntityMapper.toModel(result);
    } catch (error) {
      throw new CustomException(
        error as Error,
        "Technical",
        ERROR_STATES_MESSAGES.BusinessException,
      );
    }
  }
}

export { DomainDataBaseRepository };
