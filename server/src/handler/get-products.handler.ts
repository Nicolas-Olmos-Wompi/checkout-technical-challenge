import { Injectable, Inject, HttpStatus } from "@nestjs/common";
import { Span } from "@opentelemetry/api";
import { HTTPResponse } from "../model/dto/http-response.model";
import { SUCCESS_STATES_MESSAGES } from "../common/response-states/success-states.messages";
import { ProductFilterCriteria } from "domain/src/model/product.type";
import { ProductMapper } from "../model/mapper/product.mapper";
import { GetProductsUseCase } from "../../domain/src/usecase/get-products.usecase";
import {
  GetProductsRequest,
  PaginatedProductsResponse,
} from "../model/dto/product.type";
import { getTracer } from "../common/utils/general.util";

@Injectable()
export class HandlerGetProducts {
  constructor(
    @Inject("GetProductsUseCase")
    private readonly getProductsUC: GetProductsUseCase,
  ) {}

  async execute(request: GetProductsRequest): Promise<HTTPResponse> {
    return getTracer().startActiveSpan(
      "GetProductsUseCase.apply",
      { attributes: { "products.name": request.name ?? "" } },
      async (span: Span): Promise<HTTPResponse> => {
        try {
          const query: Partial<ProductFilterCriteria> =
            ProductMapper.toQuery(request);
          const products = await this.getProductsUC.apply(query);
          const response: PaginatedProductsResponse =
            ProductMapper.toDTO(products);
          return new HTTPResponse(
            HttpStatus.OK,
            SUCCESS_STATES_MESSAGES.Success.code,
            SUCCESS_STATES_MESSAGES.Success.message,
            response,
          );
        } finally {
          span.end();
        }
      },
    );
  }
}
