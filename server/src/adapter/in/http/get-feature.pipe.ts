import {ArgumentMetadata, Injectable, PipeTransform} from '@nestjs/common';
import {plainToInstance} from 'class-transformer';
import {GetFeatureRequest} from 'src/model/dto/feature.type';

@Injectable()
class GetFeaturePipe implements PipeTransform<
  GetFeatureRequest,
  GetFeatureRequest
> {
  transform(
    dto: GetFeatureRequest,
    {metatype}: ArgumentMetadata
  ): GetFeatureRequest {
    if (!metatype) {
      return dto;
    }
    // field validation
    return plainToInstance(metatype, dto) as GetFeatureRequest;
  }
}

export {GetFeaturePipe};
