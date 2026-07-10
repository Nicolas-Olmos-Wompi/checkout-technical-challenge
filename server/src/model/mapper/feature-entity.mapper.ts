import {QueryCommandOutput} from '@aws-sdk/lib-dynamodb';
import {DatabaseGenericFields} from 'domain/src/model/database-generic-fields.type';
import {DomainEntity} from '../../../domain/src/model/domain.entity';

class FeatureEntityMapper {
  public static toModel(featureEntity: QueryCommandOutput): DomainEntity[] {
    const feature: DomainEntity[] = [];

    for (const featureObject of featureEntity.Items as DomainEntity[]) {
      const DBGenericFields: DatabaseGenericFields = {
        PK: featureObject.PK,
        SK: featureObject.SK,
        updatedAt: featureObject.updatedAt,
        createdAt: featureObject.createdAt,
      };
      feature.push(
        new DomainEntity(
          featureObject.email,
          featureObject.name,
          DBGenericFields
        )
      );
    }
    return feature;
  }
}

export {FeatureEntityMapper};
