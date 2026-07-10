import { Controller, Get, Query } from "@nestjs/common";
import { ApiOkResponse, ApiQuery, ApiTags } from "@nestjs/swagger";
import { HTTPResponse } from "../../../model/dto/http-response.model";
import { HandlerGetProducts } from "../../../handler/get-products.handler";
import { GetProductsRequest } from "../../../model/dto/product.type";
import { GetProductsPipe } from "./get-products.pipe";

@ApiTags("Products")
@Controller("products")
export class ProductController {
  constructor(private readonly handlerGetProducts: HandlerGetProducts) {}

  @Get()
  @ApiQuery({
    name: "page",
    required: false,
    type: Number,
    description: "Page number (default 1)",
  })
  @ApiQuery({
    name: "pageSize",
    required: false,
    type: Number,
    description: "Items per page (default 10, max 100)",
  })
  @ApiQuery({
    name: "name",
    required: false,
    type: String,
    description: "Filter by product name (partial match)",
  })
  @ApiQuery({
    name: "minPrice",
    required: false,
    type: Number,
    description: "Minimum price in cents",
  })
  @ApiQuery({
    name: "maxPrice",
    required: false,
    type: Number,
    description: "Maximum price in cents",
  })
  @ApiOkResponse({ description: "Paginated list of products" })
  async getProducts(
    @Query(new GetProductsPipe()) query: GetProductsRequest,
  ): Promise<HTTPResponse> {
    return this.handlerGetProducts.execute(query);
  }
}
