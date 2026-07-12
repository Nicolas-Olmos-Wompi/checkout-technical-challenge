import { apiRequest } from "./client";
import { GetProductsParams, PaginatedProducts } from "./product.types";

export function getProducts(
  params: GetProductsParams = {},
): Promise<PaginatedProducts> {
  return apiRequest<PaginatedProducts>("/products", {
    method: "GET",
    query: params,
    auth: true,
  });
}
