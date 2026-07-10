import {UserEmail} from 'domain/src/model/domain.type';
import {GetFeatureRequest, GetFeatureResponse} from '../dto/feature.type';
import {DomainEntity} from '../../../domain/src/model/domain.entity';
import {
  DOMAIN_PREFIX,
  USER_PREFIX,
} from '../../../domain/src/common/db-prefixes.vars';

class GetFeatureMapper {
  public static toModel(request: GetFeatureRequest): UserEmail {
    return {email: `${DOMAIN_PREFIX}${request.email}`};
  }

  public static toDTO(domainModel: DomainEntity[]): GetFeatureResponse[] {
    const featureResponse: GetFeatureResponse[] = [];

    for (const item of domainModel) {
      featureResponse.push({
        id: item.SK.replace(USER_PREFIX, ''),
        name: item.name,
        email: item.email,
      });
    }
    return featureResponse;
  }
}

export {GetFeatureMapper};
