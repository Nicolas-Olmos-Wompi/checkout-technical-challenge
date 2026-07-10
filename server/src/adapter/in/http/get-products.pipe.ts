import { ArgumentMetadata, Injectable, PipeTransform } from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { GetProductsRequest } from "src/model/dto/product.type";

@Injectable()
class GetProductsPipe implements PipeTransform<
  GetProductsRequest,
  GetProductsRequest
> {
  transform(
    dto: GetProductsRequest,
    { metatype }: ArgumentMetadata,
  ): GetProductsRequest {
    if (!metatype) {
      return dto;
    }
    // field validation
    return plainToInstance(metatype, dto) as GetProductsRequest;
  }
}

export { GetProductsPipe };
