import { IProductRepository } from "../interface/product.repository";
import { ProductFilterCriteria, ProductsResult } from "../model/product.type";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;

class GetProductsUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  public async apply(
    query: Partial<ProductFilterCriteria>,
  ): Promise<ProductsResult> {
    const page = this.normalizePage(query.page);
    const pageSize = this.normalizePageSize(query.pageSize);

    const { items, total } = await this.productRepository.findProducts({
      page,
      pageSize,
      name: query.name,
      minPrice: query.minPrice,
      maxPrice: query.maxPrice,
    });

    return {
      items,
      page,
      pageSize,
      total,
      totalPages: this.calculateTotalPages(total, pageSize),
    };
  }

  private normalizePage(page?: number): number {
    return page && page > 0 ? page : DEFAULT_PAGE;
  }

  private normalizePageSize(pageSize?: number): number {
    return pageSize && pageSize > 0 ? pageSize : DEFAULT_PAGE_SIZE;
  }

  private calculateTotalPages(total: number, pageSize: number): number {
    return total === 0 ? 0 : Math.ceil(total / pageSize);
  }
}

export { GetProductsUseCase };
