/**
 * Mirrors server DTOs in server/src/model/dto/product.type.ts
 */
export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PaginatedProducts = {
  items: Product[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type GetProductsParams = {
  page?: number;
  pageSize?: number;
  name?: string;
  minPrice?: number;
  maxPrice?: number;
};
