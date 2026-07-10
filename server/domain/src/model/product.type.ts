import { Product } from "./product.entity";

type ProductFilterCriteria = {
  page: number;
  pageSize: number;
  name?: string;
  minPrice?: number;
  maxPrice?: number;
};

type PaginatedProducts = {
  items: Product[];
  total: number;
};

type ProductsResult = {
  items: Product[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type { ProductFilterCriteria, PaginatedProducts, ProductsResult };
