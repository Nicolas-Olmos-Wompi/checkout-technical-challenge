import {ArgumentMetadata} from '@nestjs/common';
import {plainToInstance} from 'class-transformer';
import * as classTransformer from 'class-transformer';
import {GetFeaturePipe} from './get-feature.pipe';
import {GetFeatureRequest} from 'src/model/dto/feature.type';

describe('GetFeaturePipe', () => {
  let getFeaturePipe: GetFeaturePipe;

  beforeEach(() => {
    getFeaturePipe = new GetFeaturePipe();
  });

  it('should return the dto if metatype is not provided', () => {
    const dto: GetFeatureRequest = {
      email: 'test@test.com',
    };
    const metadata: ArgumentMetadata = {
      metatype: undefined,
      type: 'body',
    };

    const result = getFeaturePipe.transform(dto, metadata);

    expect(result).toBe(dto);
  });

  it('should transform the dto if metatype is provided', () => {
    const dto: GetFeatureRequest = {
      email: 'test@test.com',
    };
    const metadata: ArgumentMetadata = {
      metatype: GetFeatureRequest,
      type: 'body',
    };
    jest.spyOn(classTransformer, 'plainToInstance').mockReturnValue(dto);

    const result = getFeaturePipe.transform(dto, metadata);

    expect(result).toEqual(dto);
    expect(plainToInstance).toHaveBeenCalledWith(GetFeatureRequest, dto);
  });
});
