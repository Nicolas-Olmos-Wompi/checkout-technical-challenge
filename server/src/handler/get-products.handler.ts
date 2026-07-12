import { Injectable, Inject, HttpStatus } from "@nestjs/common";
import { HTTPResponse } from "../model/dto/http-response.model";
import { SUCCESS_STATES_MESSAGES } from "../common/response-states/success-states.messages";
import { ProductFilterCriteria } from "domain/src/model/product.type";
import { ProductMapper } from "../model/mapper/product.mapper";
import { GetProductsUseCase } from "../../domain/src/usecase/get-products.usecase";
import { LoggerService } from "../common/logger/logger.service";
import {
  GetProductsRequest,
  PaginatedProductsResponse,
} from "../model/dto/product.type";

@Injectable()
export class HandlerGetProducts {
  private readonly logger = new LoggerService("HandlerGetProducts");

  constructor(
    @Inject("GetProductsUseCase")
    private readonly getProductsUC: GetProductsUseCase,
  ) {}

  async execute(request: GetProductsRequest): Promise<HTTPResponse> {
    this.logger.log("GET /products", {
      page: request.page,
      pageSize: request.pageSize,
      name: request.name,
    });

    const query: Partial<ProductFilterCriteria> =
      ProductMapper.toQuery(request);
    const products = await this.getProductsUC.apply(query);
    const response: PaginatedProductsResponse = ProductMapper.toDTO(products);

    this.logger.log("GET /products completed", {
      total: products.total,
      returned: products.items.length,
    });

    return new HTTPResponse(
      HttpStatus.OK,
      SUCCESS_STATES_MESSAGES.Success.code,
      SUCCESS_STATES_MESSAGES.Success.message,
      response,
    );
  }
}
