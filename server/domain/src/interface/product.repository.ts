import { Product } from "../model/product.entity";
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

  /**
   * Finds a single product by its unique id.
   * @param {string} id - the product id to search for.
   * @returns the matching `Product`, or `null` if none exists.
   */
  findById(id: string): Promise<Product | null>;
}
