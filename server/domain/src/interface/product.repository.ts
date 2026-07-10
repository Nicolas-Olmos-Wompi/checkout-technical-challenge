import {
  PaginatedProducts,
  ProductFilterCriteria,
} from "../model/product.type";

export interface IProductRepository {
  /**
   * Returns products matching the given pagination and filter criteria.
   * @param {ProductFilterCriteria} criteria - pagination and optional filters.
   * @returns a `PaginatedProducts` object containing the matched items and total count.
   */
  findProducts(criteria: ProductFilterCriteria): Promise<PaginatedProducts>;
}
