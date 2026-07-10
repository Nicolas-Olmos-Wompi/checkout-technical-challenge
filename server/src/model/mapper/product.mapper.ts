import {
  ProductFilterCriteria,
  ProductsResult,
} from "domain/src/model/product.type";
import {
  GetProductsRequest,
  PaginatedProductsResponse,
  ProductResponse,
} from "../dto/product.type";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;

class ProductMapper {
  public static toQuery(
    request: GetProductsRequest,
  ): Partial<ProductFilterCriteria> {
    return {
      page: request.page ?? DEFAULT_PAGE,
      pageSize: request.pageSize ?? DEFAULT_PAGE_SIZE,
      name: request.name,
      minPrice: request.minPrice,
      maxPrice: request.maxPrice,
    };
  }

  public static toDTO(result: ProductsResult): PaginatedProductsResponse {
    return {
      items: result.items.map(
        (product): ProductResponse => ({
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          stock: product.stock,
          image: product.image,
          createdAt: product.createdAt.toISOString(),
          updatedAt: product.updatedAt.toISOString(),
        }),
      ),
      page: result.page,
      pageSize: result.pageSize,
      total: result.total,
      totalPages: result.totalPages,
    };
  }
}

export { ProductMapper };
